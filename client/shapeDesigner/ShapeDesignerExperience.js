'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _get2 = require('babel-runtime/helpers/get');

var _get3 = _interopRequireDefault(_get2);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _client = require('soundworks/client');

var soundworks = _interopRequireWildcard(_client);

var _Record = require('./Record.js');

var _Record2 = _interopRequireDefault(_Record);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var audioContext = soundworks.audioContext;

var ShapeDesignerView = function (_soundworks$View) {
  (0, _inherits3.default)(ShapeDesignerView, _soundworks$View);

  function ShapeDesignerView(template, content, events, options) {
    (0, _classCallCheck3.default)(this, ShapeDesignerView);
    return (0, _possibleConstructorReturn3.default)(this, (ShapeDesignerView.__proto__ || (0, _getPrototypeOf2.default)(ShapeDesignerView)).call(this, template, content, events, options));
  }

  (0, _createClass3.default)(ShapeDesignerView, [{
    key: 'onClick',
    value: function onClick(callback) {
      this.installEvents({
        'click svg': callback
      });
    }
  }]);
  return ShapeDesignerView;
}(soundworks.View);

var view = '';

// this experience plays a sound when it starts, and plays another sound when
// other clients join the experience

var ShapeDesignerExperience = function (_soundworks$Experienc) {
  (0, _inherits3.default)(ShapeDesignerExperience, _soundworks$Experienc);

  function ShapeDesignerExperience(assetsDomain) {
    (0, _classCallCheck3.default)(this, ShapeDesignerExperience);

    //Services
    var _this2 = (0, _possibleConstructorReturn3.default)(this, (ShapeDesignerExperience.__proto__ || (0, _getPrototypeOf2.default)(ShapeDesignerExperience)).call(this));

    _this2.platform = _this2.require('platform', { features: ['web-audio', 'wake-lock'] });
    _this2.motionInput = _this2.require('motion-input', { descriptors: ['orientation'] });
    _this2.label = '';
    _this2.startOK = false;

    return _this2;
  }

  (0, _createClass3.default)(ShapeDesignerExperience, [{
    key: 'init',
    value: function init() {
      var _this3 = this;

      // initialize the view
      this.viewTemplate = view;
      this.viewContent = {};
      this.viewCtor = ShapeDesignerView;
      this.viewOptions = { preservePixelRatio: true };
      this.view = this.createView();

      // params 
      this.mirrorBallX = 250;
      this.mirrorBallY = 250;
      this.offsetX = 0;
      this.offsetY = 0;

      // bind
      this._toMove = this._toMove.bind(this);
      this._myListener = this._myListener.bind(this);
      this._onClick = this._onClick.bind(this);
      this._addBall = this._addBall.bind(this);
      this._addRect = this._addRect.bind(this);
      this._addShape = this._addShape.bind(this);

      // events
      this.view.onClick(this._onClick);

      // receives
      this.receive('shape', function (shape, label) {
        return _this3._addShape(shape, label);
      });
    }
  }, {
    key: 'start',
    value: function start() {
      var _this4 = this;

      if (!this.startOK) {
        (0, _get3.default)(ShapeDesignerExperience.prototype.__proto__ || (0, _getPrototypeOf2.default)(ShapeDesignerExperience.prototype), 'start', this).call(this); // don't forget this

        if (!this.hasStarted) this.init();
        this.show();
        document.body.style.overflow = "hidden";
      } else {

        //params      
        this.middleX = window.innerWidth / 2;
        this.middleY = window.innerHeight / 2;
        this.windowSizeX = window.innerWidth;
        this.windowSizeY = window.innerHeight;
        this.windowMiddleX = this.windowSizeX / 2;
        this.windowMiddleY = this.windowSizeY / 2;
        this.svgMaxX = document.getElementsByTagName('svg')[0].getAttribute('width');
        this.svgMaxY = document.getElementsByTagName('svg')[0].getAttribute('height');

        setTimeout(function () {
          _this4._myListener(100);
        }, 100);

        this._addBall(100, 100);
        this._addRect();

        if (this.motionInput.isAvailable('orientation')) {
          this.motionInput.addListener('orientation', function (data) {

            // New values
            var newValues = _this4._toMove(data[2], data[1] - 25);
            _this4._moveScreenTo(newValues[0], newValues[1], 0.08);

            // XMM
            _this4.record.process(newValues[0], newValues[1]);
          });
        } else {
          console.log("Orientation non disponible");
        }
      }
    }

    /* click Callback */

  }, {
    key: '_onClick',
    value: function _onClick() {
      if (!this.onRecord) {

        document.getElementById("shape").setAttribute("fill", "red");
        this.onRecord = true;
        this.record.startRecord();
      } else {

        document.getElementById("shape").setAttribute("fill", "black");
        this.onRecord = false;
        this.record.stopRecord(this);
      }
    }

    /* add shape */

  }, {
    key: '_addShape',
    value: function _addShape(shape, label) {

      var parser = new DOMParser();

      var shapeXml = parser.parseFromString(shape, 'application/xml');
      shapeXml = shapeXml.getElementsByTagName('svg')[0];

      document.getElementById('experience').appendChild(shapeXml);
      document.getElementsByTagName('svg')[0].setAttribute('id', 'svgElement');

      this.startOK = true;
      this.label = label;

      //XMM-lfo
      this.record = new _Record2.default(this.label);
      this.onRecord = false;

      this.start();
    }

    /* add Ball */

  }, {
    key: '_addBall',
    value: function _addBall(x, y) {

      var elem = document.createElementNS('http://www.w3.org/2000/svg', 'circle');

      elem.setAttributeNS(null, "cx", x);
      elem.setAttributeNS(null, "cy", y);
      elem.setAttributeNS(null, "r", 10);
      elem.setAttributeNS(null, "stroke", 'white');
      elem.setAttributeNS(null, "stroke-width", 3);
      elem.setAttributeNS(null, "fill", 'black');
      elem.setAttributeNS(null, "id", 'ball');

      document.getElementsByTagName('g')[0].appendChild(elem);
    }

    /* Add background */

  }, {
    key: '_addRect',
    value: function _addRect() {

      var svgElement = document.getElementsByTagName('svg')[0];
      var newRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      var x = svgElement.getAttribute('width');
      var y = svgElement.getAttribute('height');

      newRect.setAttributeNS(null, 'width', x);
      newRect.setAttributeNS(null, 'height', y);
      newRect.setAttributeNS(null, 'x', 0);
      newRect.setAttributeNS(null, 'y', 0);
      newRect.setAttributeNS(null, 'id', 'shape');

      svgElement.insertBefore(newRect, svgElement.firstChild);
    }

    /* Calculate new position of the ball */

  }, {
    key: '_toMove',
    value: function _toMove(valueX, valueY) {

      var obj = this.view.$el.querySelector('#ball');

      // position X
      var actu = this.mirrorBallX + valueX * 0.3;
      if (actu < this.offsetX) {
        actu = this.offsetX;
      } else if (actu > this.windowSizeX + this.offsetX) {
        actu = this.windowSizeX + this.offsetX;
      }
      obj.setAttribute('cx', actu);
      this.mirrorBallX = actu;
      var newX = actu;

      // position Y
      actu = this.mirrorBallY + valueY * 0.3;
      if (actu < this.offsetY) {
        actu = this.offsetY;
      }
      if (actu > this.windowSizeY + this.offsetY) {
        actu = this.windowSizeY + this.offsetY;
      }
      obj.setAttribute('cy', actu);
      this.mirrorBallY = actu;
      var newY = actu;

      return [newX, newY];
    }

    // Move the screen

  }, {
    key: '_moveScreenTo',
    value: function _moveScreenTo(x, y) {
      var force = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;


      var indicePowX = 3;
      var indicePowY = 3;

      // X
      var distanceX = x - this.offsetX - this.windowMiddleX;
      var negX = false;
      if (distanceX < 0) {
        negX = true;
      }
      distanceX = Math.pow(Math.abs(distanceX / this.windowMiddleX), indicePowX) * this.windowMiddleX;

      if (negX) {
        distanceX *= -1;
      }

      if (this.offsetX + distanceX * force >= 0 && this.offsetX + distanceX * force <= this.svgMaxX - this.windowSizeX) {
        this.offsetX += distanceX * force;
      }

      // Y
      var distanceY = y - this.offsetY - this.windowMiddleY;
      var negY = false;
      if (distanceY < 0) {
        negY = true;
      }
      distanceY = Math.pow(Math.abs(distanceY / this.windowMiddleY), indicePowY) * this.windowMiddleY;

      if (negY) {
        distanceY *= -1;
      }

      if (this.offsetY + distanceY * force >= 0 && this.offsetY + distanceY * force <= this.svgMaxY - this.windowSizeY) {
        this.offsetY += distanceY * force;
      }

      //actualisation
      window.scroll(this.offsetX, this.offsetY);
    }
  }, {
    key: '_myListener',
    value: function _myListener(time) {
      this.windowSizeX = window.innerWidth;
      this.windowSizeY = window.innerHeight;
      setTimeout(this._myListener, time);
    }
  }]);
  return ShapeDesignerExperience;
}(soundworks.Experience);

exports.default = ShapeDesignerExperience;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlNoYXBlRGVzaWduZXJFeHBlcmllbmNlLmpzIl0sIm5hbWVzIjpbInNvdW5kd29ya3MiLCJhdWRpb0NvbnRleHQiLCJTaGFwZURlc2lnbmVyVmlldyIsInRlbXBsYXRlIiwiY29udGVudCIsImV2ZW50cyIsIm9wdGlvbnMiLCJjYWxsYmFjayIsImluc3RhbGxFdmVudHMiLCJWaWV3IiwidmlldyIsIlNoYXBlRGVzaWduZXJFeHBlcmllbmNlIiwiYXNzZXRzRG9tYWluIiwicGxhdGZvcm0iLCJyZXF1aXJlIiwiZmVhdHVyZXMiLCJtb3Rpb25JbnB1dCIsImRlc2NyaXB0b3JzIiwibGFiZWwiLCJzdGFydE9LIiwidmlld1RlbXBsYXRlIiwidmlld0NvbnRlbnQiLCJ2aWV3Q3RvciIsInZpZXdPcHRpb25zIiwicHJlc2VydmVQaXhlbFJhdGlvIiwiY3JlYXRlVmlldyIsIm1pcnJvckJhbGxYIiwibWlycm9yQmFsbFkiLCJvZmZzZXRYIiwib2Zmc2V0WSIsIl90b01vdmUiLCJiaW5kIiwiX215TGlzdGVuZXIiLCJfb25DbGljayIsIl9hZGRCYWxsIiwiX2FkZFJlY3QiLCJfYWRkU2hhcGUiLCJvbkNsaWNrIiwicmVjZWl2ZSIsInNoYXBlIiwiaGFzU3RhcnRlZCIsImluaXQiLCJzaG93IiwiZG9jdW1lbnQiLCJib2R5Iiwic3R5bGUiLCJvdmVyZmxvdyIsIm1pZGRsZVgiLCJ3aW5kb3ciLCJpbm5lcldpZHRoIiwibWlkZGxlWSIsImlubmVySGVpZ2h0Iiwid2luZG93U2l6ZVgiLCJ3aW5kb3dTaXplWSIsIndpbmRvd01pZGRsZVgiLCJ3aW5kb3dNaWRkbGVZIiwic3ZnTWF4WCIsImdldEVsZW1lbnRzQnlUYWdOYW1lIiwiZ2V0QXR0cmlidXRlIiwic3ZnTWF4WSIsInNldFRpbWVvdXQiLCJpc0F2YWlsYWJsZSIsImFkZExpc3RlbmVyIiwiZGF0YSIsIm5ld1ZhbHVlcyIsIl9tb3ZlU2NyZWVuVG8iLCJyZWNvcmQiLCJwcm9jZXNzIiwiY29uc29sZSIsImxvZyIsIm9uUmVjb3JkIiwiZ2V0RWxlbWVudEJ5SWQiLCJzZXRBdHRyaWJ1dGUiLCJzdGFydFJlY29yZCIsInN0b3BSZWNvcmQiLCJwYXJzZXIiLCJET01QYXJzZXIiLCJzaGFwZVhtbCIsInBhcnNlRnJvbVN0cmluZyIsImFwcGVuZENoaWxkIiwic3RhcnQiLCJ4IiwieSIsImVsZW0iLCJjcmVhdGVFbGVtZW50TlMiLCJzZXRBdHRyaWJ1dGVOUyIsInN2Z0VsZW1lbnQiLCJuZXdSZWN0IiwiaW5zZXJ0QmVmb3JlIiwiZmlyc3RDaGlsZCIsInZhbHVlWCIsInZhbHVlWSIsIm9iaiIsIiRlbCIsInF1ZXJ5U2VsZWN0b3IiLCJhY3R1IiwibmV3WCIsIm5ld1kiLCJmb3JjZSIsImluZGljZVBvd1giLCJpbmRpY2VQb3dZIiwiZGlzdGFuY2VYIiwibmVnWCIsIk1hdGgiLCJwb3ciLCJhYnMiLCJkaXN0YW5jZVkiLCJuZWdZIiwic2Nyb2xsIiwidGltZSIsIkV4cGVyaWVuY2UiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBOztJQUFZQSxVOztBQUNaOzs7Ozs7OztBQUVBLElBQU1DLGVBQWVELFdBQVdDLFlBQWhDOztJQUVNQyxpQjs7O0FBRUosNkJBQVlDLFFBQVosRUFBc0JDLE9BQXRCLEVBQStCQyxNQUEvQixFQUF1Q0MsT0FBdkMsRUFBZ0Q7QUFBQTtBQUFBLHVKQUN4Q0gsUUFEd0MsRUFDOUJDLE9BRDhCLEVBQ3JCQyxNQURxQixFQUNiQyxPQURhO0FBRS9DOzs7OzRCQUVPQyxRLEVBQVM7QUFDZixXQUFLQyxhQUFMLENBQW1CO0FBQ2pCLHFCQUFhRDtBQURJLE9BQW5CO0FBR0Q7OztFQVY2QlAsV0FBV1MsSTs7QUFjM0MsSUFBTUMsU0FBTjs7QUFHQTtBQUNBOztJQUNxQkMsdUI7OztBQUNuQixtQ0FBWUMsWUFBWixFQUEwQjtBQUFBOztBQUd4QjtBQUh3Qjs7QUFJeEIsV0FBS0MsUUFBTCxHQUFnQixPQUFLQyxPQUFMLENBQWEsVUFBYixFQUF5QixFQUFFQyxVQUFV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S3RFLE9BQUwsR0FBZ0J5RSxZQUFZSCxLQUE1QixJQUFzQyxLQUFLMUMsT0FBTCxHQUFlLEtBQUtKLFdBQTFHLEVBQXlIO0FBQ3ZILGFBQUt4QixPQUFMLElBQWlCeUUsWUFBWUgsS0FBN0I7QUFDRDs7QUFFRDtBQUNBLFVBQUlRLFlBQWF4QixJQUFJLEtBQUtyRCxPQUFWLEdBQXFCLEtBQUswQixhQUExQztBQUNBLFVBQUlvRCxPQUFPLEtBQVg7QUFDQSxVQUFHRCxZQUFZLENBQWYsRUFBaUI7QUFDZkMsZUFBTyxJQUFQO0FBQ0Q7QUFDREQsa0JBQVlILEtBQUtDLEdBQUwsQ0FBV0QsS0FBS0UsR0FBTCxDQUFTQyxZQUFZLEtBQUtuRCxhQUExQixDQUFYLEVBQXVENkMsVUFBdkQsSUFBc0UsS0FBSzdDLGFBQXZGOztBQUVBLFVBQUdvRCxJQUFILEVBQVE7QUFDTkQscUJBQWEsQ0FBQyxDQUFkO0FBQ0Q7O0FBRUQsVUFBSyxLQUFLN0UsT0FBTCxHQUFnQjZFLFlBQVlSLEtBQTVCLElBQXNDLENBQXZDLElBQThDLEtBQUtyRSxPQUFMLEdBQWdCNkUsWUFBWVIsS0FBNUIsSUFBc0MsS0FBS3ZDLE9BQUwsR0FBZSxLQUFLTixXQUE1RyxFQUEwSDtBQUN4SCxhQUFLeEIsT0FBTCxJQUFpQjZFLFlBQVlSLEtBQTdCO0FBQ0Q7O0FBRUQ7QUFDQWxELGFBQU80RCxNQUFQLENBQWMsS0FBS2hGLE9BQW5CLEVBQTRCLEtBQUtDLE9BQWpDO0FBRUQ7OztnQ0FFV2dGLEksRUFBSztBQUNmLFdBQUt6RCxXQUFMLEdBQW1CSixPQUFPQyxVQUExQjtBQUNBLFdBQUtJLFdBQUwsR0FBbUJMLE9BQU9HLFdBQTFCO0FBQ0FTLGlCQUFXLEtBQUs1QixXQUFoQixFQUE2QjZFLElBQTdCO0FBQ0Q7OztFQWhQa0Q3RyxXQUFXOEcsVTs7a0JBQTNDbkcsdUIiLCJmaWxlIjoiU2hhcGVEZXNpZ25lckV4cGVyaWVuY2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBzb3VuZHdvcmtzIGZyb20gJ3NvdW5kd29ya3MvY2xpZW50JztcbmltcG9ydCBSZWNvcmQgZnJvbSAnLi9SZWNvcmQuanMnO1xuXG5jb25zdCBhdWRpb0NvbnRleHQgPSBzb3VuZHdvcmtzLmF1ZGlvQ29udGV4dDtcblxuY2xhc3MgU2hhcGVEZXNpZ25lclZpZXcgZXh0ZW5kcyBzb3VuZHdvcmtzLlZpZXd7XG5cbiAgY29uc3RydWN0b3IodGVtcGxhdGUsIGNvbnRlbnQsIGV2ZW50cywgb3B0aW9ucykge1xuICAgIHN1cGVyKHRlbXBsYXRlLCBjb250ZW50LCBldmVudHMsIG9wdGlvbnMpO1xuICB9XG5cbiAgb25DbGljayhjYWxsYmFjayl7XG4gICAgdGhpcy5pbnN0YWxsRXZlbnRzKHtcbiAgICAgICdjbGljayBzdmcnOiBjYWxsYmFja1xuICAgIH0pO1xuICB9XG5cbn1cblxuY29uc3QgdmlldyA9IGBgXG5cblxuLy8gdGhpcyBleHBlcmllbmNlIHBsYXlzIGEgc291bmQgd2hlbiBpdCBzdGFydHMsIGFuZCBwbGF5cyBhbm90aGVyIHNvdW5kIHdoZW5cbi8vIG90aGVyIGNsaWVudHMgam9pbiB0aGUgZXhwZXJpZW5jZVxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2hhcGVEZXNpZ25lckV4cGVyaWVuY2UgZXh0ZW5kcyBzb3VuZHdvcmtzLkV4cGVyaWVuY2Uge1xuICBjb25zdHJ1Y3Rvcihhc3NldHNEb21haW4pIHtcbiAgICBzdXBlcigpO1xuXG4gICAgLy9TZXJ2aWNlc1xuICAgIHRoaXMucGxhdGZvcm0gPSB0aGlzLnJlcXVpcmUoJ3BsYXRmb3JtJywgeyBmZWF0dXJlczogWyd3ZWItYXVkaW8nLCAnd2FrZS1sb2NrJ10gfSk7XG4gICAgdGhpcy5tb3Rpb25JbnB1dCA9IHRoaXMucmVxdWlyZSgnbW90aW9uLWlucHV0JywgeyBkZXNjcmlwdG9yczogWydvcmllbnRhdGlvbiddIH0pO1xuICAgIHRoaXMubGFiZWwgPSAnJztcbiAgICB0aGlzLnN0YXJ0T0sgPSBmYWxzZTtcblxuICB9XG5cbiAgaW5pdCgpIHtcbiAgICAvLyBpbml0aWFsaXplIHRoZSB2aWV3XG4gICAgdGhpcy52aWV3VGVtcGxhdGUgPSB2aWV3O1xuICAgIHRoaXMudmlld0NvbnRlbnQgPSB7fTtcbiAgICB0aGlzLnZpZXdDdG9yID0gU2hhcGVEZXNpZ25lclZpZXc7XG4gICAgdGhpcy52aWV3T3B0aW9ucyA9IHsgcHJlc2VydmVQaXhlbFJhdGlvOiB0cnVlIH07XG4gICAgdGhpcy52aWV3ID0gdGhpcy5jcmVhdGVWaWV3KCk7XG5cbiAgICAvLyBwYXJhbXMgXG4gICAgdGhpcy5taXJyb3JCYWxsWCA9IDI1MDtcbiAgICB0aGlzLm1pcnJvckJhbGxZID0gMjUwO1xuICAgIHRoaXMub2Zmc2V0WCA9IDA7XG4gICAgdGhpcy5vZmZzZXRZID0gMDtcblxuICAgIC8vIGJpbmRcbiAgICB0aGlzLl90b01vdmUgPSB0aGlzLl90b01vdmUuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9teUxpc3RlbmVyPSB0aGlzLl9teUxpc3RlbmVyLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fb25DbGljayA9IHRoaXMuX29uQ2xpY2suYmluZCh0aGlzKTtcbiAgICB0aGlzLl9hZGRCYWxsID0gdGhpcy5fYWRkQmFsbC5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX2FkZFJlY3QgPSB0aGlzLl9hZGRSZWN0LmJpbmQodGhpcyk7XG4gICAgdGhpcy5fYWRkU2hhcGUgPSB0aGlzLl9hZGRTaGFwZS5iaW5kKHRoaXMpO1xuXG4gICAgLy8gZXZlbnRzXG4gICAgdGhpcy52aWV3Lm9uQ2xpY2sodGhpcy5fb25DbGljayk7XG5cbiAgICAvLyByZWNlaXZlc1xuICAgIHRoaXMucmVjZWl2ZSggJ3NoYXBlJywgKHNoYXBlLCBsYWJlbCkgPT4gdGhpcy5fYWRkU2hhcGUoc2hhcGUsIGxhYmVsKSApO1xuXG4gfVxuXG4gIHN0YXJ0KCkge1xuXG4gICAgaWYoIXRoaXMuc3RhcnRPSyl7XG4gICAgICBzdXBlci5zdGFydCgpOyAvLyBkb24ndCBmb3JnZXQgdGhpc1xuXG4gICAgICBpZiAoIXRoaXMuaGFzU3RhcnRlZClcbiAgICAgICAgdGhpcy5pbml0KCk7XG4gICAgICB0aGlzLnNob3coKTtcbiAgICAgIGRvY3VtZW50LmJvZHkuc3R5bGUub3ZlcmZsb3cgPSBcImhpZGRlblwiO1xuICAgIH1lbHNle1xuXG4gICAgICAvL3BhcmFtcyAgICAgIFxuICAgICAgdGhpcy5taWRkbGVYID0gd2luZG93LmlubmVyV2lkdGgvMjtcbiAgICAgIHRoaXMubWlkZGxlWSA9IHdpbmRvdy5pbm5lckhlaWdodC8yO1xuICAgICAgdGhpcy53aW5kb3dTaXplWCA9IHdpbmRvdy5pbm5lcldpZHRoO1xuICAgICAgdGhpcy53aW5kb3dTaXplWSA9IHdpbmRvdy5pbm5lckhlaWdodDtcbiAgICAgIHRoaXMud2luZG93TWlkZGxlWCA9IHRoaXMud2luZG93U2l6ZVgvMjtcbiAgICAgIHRoaXMud2luZG93TWlkZGxlWSA9IHRoaXMud2luZG93U2l6ZVkvMjtcbiAgICAgIHRoaXMuc3ZnTWF4WCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzdmcnKVswXS5nZXRBdHRyaWJ1dGUoJ3dpZHRoJyk7XG4gICAgICB0aGlzLnN2Z01heFkgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnc3ZnJylbMF0uZ2V0QXR0cmlidXRlKCdoZWlnaHQnKTtcblxuICAgICAgc2V0VGltZW91dCggKCkgPT4geyB0aGlzLl9teUxpc3RlbmVyKDEwMCkgfSwgMTAwKTtcblxuXG4gICAgICB0aGlzLl9hZGRCYWxsKDEwMCwxMDApO1xuICAgICAgdGhpcy5fYWRkUmVjdCgpOyBcblxuICAgICAgaWYgKHRoaXMubW90aW9uSW5wdXQuaXNBdmFpbGFibGUoJ29yaWVudGF0aW9uJykpIHtcbiAgICAgICAgdGhpcy5tb3Rpb25JbnB1dC5hZGRMaXN0ZW5lcignb3JpZW50YXRpb24nLCAoZGF0YSkgPT4ge1xuXG4gICAgICAgICAgLy8gTmV3IHZhbHVlc1xuICAgICAgICAgIGNvbnN0IG5ld1ZhbHVlcyA9IHRoaXMuX3RvTW92ZShkYXRhWzJdLCBkYXRhWzFdIC0gMjUpO1xuICAgICAgICAgIHRoaXMuX21vdmVTY3JlZW5UbyhuZXdWYWx1ZXNbMF0sIG5ld1ZhbHVlc1sxXSwgMC4wOCk7XG5cbiAgICAgICAgICAvLyBYTU1cbiAgICAgICAgICB0aGlzLnJlY29yZC5wcm9jZXNzKG5ld1ZhbHVlc1swXSwgbmV3VmFsdWVzWzFdKTtcblxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiT3JpZW50YXRpb24gbm9uIGRpc3BvbmlibGVcIik7XG4gICAgICB9XG4gICAgfVxuXG4gIH1cblxuICAvKiBjbGljayBDYWxsYmFjayAqL1xuICBfb25DbGljaygpe1xuICAgIGlmKCF0aGlzLm9uUmVjb3JkKXtcblxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzaGFwZVwiKS5zZXRBdHRyaWJ1dGUoXCJmaWxsXCIsIFwicmVkXCIpO1xuICAgICAgdGhpcy5vblJlY29yZCA9IHRydWU7XG4gICAgICB0aGlzLnJlY29yZC5zdGFydFJlY29yZCgpO1xuXG4gICAgfWVsc2V7XG5cbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic2hhcGVcIikuc2V0QXR0cmlidXRlKFwiZmlsbFwiLCBcImJsYWNrXCIpO1xuICAgICAgdGhpcy5vblJlY29yZCA9IGZhbHNlO1xuICAgICAgdGhpcy5yZWNvcmQuc3RvcFJlY29yZCh0aGlzKTtcblxuICAgIH1cbiAgfVxuXG4gIC8qIGFkZCBzaGFwZSAqL1xuICBfYWRkU2hhcGUoc2hhcGUsIGxhYmVsKXtcblxuICAgIGNvbnN0IHBhcnNlciA9IG5ldyBET01QYXJzZXIoKTtcblxuICAgIGxldCBzaGFwZVhtbCA9IHBhcnNlci5wYXJzZUZyb21TdHJpbmcoc2hhcGUsICdhcHBsaWNhdGlvbi94bWwnKTtcbiAgICBzaGFwZVhtbCA9IHNoYXBlWG1sLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzdmcnKVswXTtcblxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdleHBlcmllbmNlJykuYXBwZW5kQ2hpbGQoc2hhcGVYbWwpO1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzdmcnKVswXS5zZXRBdHRyaWJ1dGUoJ2lkJywgJ3N2Z0VsZW1lbnQnKTtcblxuICAgIHRoaXMuc3RhcnRPSyA9IHRydWU7XG4gICAgdGhpcy5sYWJlbCA9IGxhYmVsO1xuXG4gICAgLy9YTU0tbGZvXG4gICAgdGhpcy5yZWNvcmQgPSBuZXcgUmVjb3JkKHRoaXMubGFiZWwpO1xuICAgIHRoaXMub25SZWNvcmQgPSBmYWxzZTtcblxuICAgIHRoaXMuc3RhcnQoKTtcblxuICB9XG5cblxuICAvKiBhZGQgQmFsbCAqL1xuICBfYWRkQmFsbCh4LHkpe1xuXG4gICAgY29uc3QgZWxlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUygnaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnLCdjaXJjbGUnKTtcblxuICAgIGVsZW0uc2V0QXR0cmlidXRlTlMobnVsbCwgXCJjeFwiLCB4KTtcbiAgICBlbGVtLnNldEF0dHJpYnV0ZU5TKG51bGwsIFwiY3lcIiwgeSk7XG4gICAgZWxlbS5zZXRBdHRyaWJ1dGVOUyhudWxsLCBcInJcIiwgMTApO1xuICAgIGVsZW0uc2V0QXR0cmlidXRlTlMobnVsbCwgXCJzdHJva2VcIiwgJ3doaXRlJyk7XG4gICAgZWxlbS5zZXRBdHRyaWJ1dGVOUyhudWxsLCBcInN0cm9rZS13aWR0aFwiLCAzKTtcbiAgICBlbGVtLnNldEF0dHJpYnV0ZU5TKG51bGwsIFwiZmlsbFwiLCAnYmxhY2snKTtcbiAgICBlbGVtLnNldEF0dHJpYnV0ZU5TKG51bGwsIFwiaWRcIiwgJ2JhbGwnKTtcblxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdnJylbMF0uYXBwZW5kQ2hpbGQoZWxlbSk7XG5cbiAgfVxuXG4gIC8qIEFkZCBiYWNrZ3JvdW5kICovXG4gIF9hZGRSZWN0KCl7XG5cbiAgICBjb25zdCBzdmdFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3N2ZycpWzBdO1xuICAgIGNvbnN0IG5ld1JlY3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoJ2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJywgJ3JlY3QnKTtcbiAgICBsZXQgeCA9IHN2Z0VsZW1lbnQuZ2V0QXR0cmlidXRlKCd3aWR0aCcpO1xuICAgIGxldCB5ID0gc3ZnRWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2hlaWdodCcpO1xuXG4gICAgbmV3UmVjdC5zZXRBdHRyaWJ1dGVOUyhudWxsLCAnd2lkdGgnLCB4KTtcbiAgICBuZXdSZWN0LnNldEF0dHJpYnV0ZU5TKG51bGwsICdoZWlnaHQnLCB5KTtcbiAgICBuZXdSZWN0LnNldEF0dHJpYnV0ZU5TKG51bGwsICd4JywgMCk7XG4gICAgbmV3UmVjdC5zZXRBdHRyaWJ1dGVOUyhudWxsLCAneScsIDApO1xuICAgIG5ld1JlY3Quc2V0QXR0cmlidXRlTlMobnVsbCwgJ2lkJywgJ3NoYXBlJyk7XG5cbiAgICBzdmdFbGVtZW50Lmluc2VydEJlZm9yZShuZXdSZWN0LCBzdmdFbGVtZW50LmZpcnN0Q2hpbGQpO1xuXG4gIH1cblxuICAvKiBDYWxjdWxhdGUgbmV3IHBvc2l0aW9uIG9mIHRoZSBiYWxsICovXG4gIF90b01vdmUodmFsdWVYLCB2YWx1ZVkpe1xuXG4gICAgY29uc3Qgb2JqID0gdGhpcy52aWV3LiRlbC5xdWVyeVNlbGVjdG9yKCcjYmFsbCcpO1xuXG4gICAgLy8gcG9zaXRpb24gWFxuICAgIGxldCBhY3R1ID0gdGhpcy5taXJyb3JCYWxsWCArIHZhbHVlWCAqIDAuMztcbiAgICBpZihhY3R1IDwgdGhpcy5vZmZzZXRYKXtcbiAgICAgIGFjdHUgPSB0aGlzLm9mZnNldFggO1xuICAgIH1lbHNlIGlmKCBhY3R1ID4gKHRoaXMud2luZG93U2l6ZVggKyB0aGlzLm9mZnNldFgpICl7XG4gICAgICBhY3R1ID0gdGhpcy53aW5kb3dTaXplWCArIHRoaXMub2Zmc2V0WDtcbiAgICB9XG4gICAgb2JqLnNldEF0dHJpYnV0ZSgnY3gnLCBhY3R1KTtcbiAgICB0aGlzLm1pcnJvckJhbGxYID0gYWN0dTtcbiAgICBjb25zdCBuZXdYID0gYWN0dTtcblxuICAgIC8vIHBvc2l0aW9uIFlcbiAgICBhY3R1ID0gdGhpcy5taXJyb3JCYWxsWSArIHZhbHVlWSAqIDAuMztcbiAgICBpZihhY3R1IDwgKHRoaXMub2Zmc2V0WSkpe1xuICAgICAgYWN0dSA9IHRoaXMub2Zmc2V0WTtcbiAgICB9XG4gICAgaWYoYWN0dSA+ICh0aGlzLndpbmRvd1NpemVZICsgdGhpcy5vZmZzZXRZKSl7XG4gICAgICBhY3R1ID0gdGhpcy53aW5kb3dTaXplWSArIHRoaXMub2Zmc2V0WTtcbiAgICB9XG4gICAgb2JqLnNldEF0dHJpYnV0ZSgnY3knLCBhY3R1KTtcbiAgICB0aGlzLm1pcnJvckJhbGxZID0gYWN0dTtcbiAgICBjb25zdCBuZXdZID0gYWN0dTtcblxuICAgIHJldHVybiBbbmV3WCwgbmV3WV07XG4gIH1cblxuICAvLyBNb3ZlIHRoZSBzY3JlZW5cbiAgX21vdmVTY3JlZW5Ubyh4LCB5LCBmb3JjZT0xKXtcblxuICAgIGxldCBpbmRpY2VQb3dYID0gMztcbiAgICBsZXQgaW5kaWNlUG93WSA9IDM7XG5cbiAgICAvLyBYXG4gICAgbGV0IGRpc3RhbmNlWCA9ICh4IC0gdGhpcy5vZmZzZXRYKSAtIHRoaXMud2luZG93TWlkZGxlWDtcbiAgICBsZXQgbmVnWCA9IGZhbHNlO1xuICAgIGlmKGRpc3RhbmNlWCA8IDApe1xuICAgICAgbmVnWCA9IHRydWU7XG4gICAgfVxuICAgIGRpc3RhbmNlWCA9IE1hdGgucG93KCAoIE1hdGguYWJzKGRpc3RhbmNlWCAvIHRoaXMud2luZG93TWlkZGxlWCkgKSwgaW5kaWNlUG93WCApICogdGhpcy53aW5kb3dNaWRkbGVYOyBcblxuICAgIGlmKG5lZ1gpe1xuICAgICAgZGlzdGFuY2VYICo9IC0xO1xuICAgIH1cblxuICAgIGlmKHRoaXMub2Zmc2V0WCArIChkaXN0YW5jZVggKiBmb3JjZSkgPj0gMCAmJiAoIHRoaXMub2Zmc2V0WCArIChkaXN0YW5jZVggKiBmb3JjZSkgPD0gdGhpcy5zdmdNYXhYIC0gdGhpcy53aW5kb3dTaXplWCApICl7XG4gICAgICB0aGlzLm9mZnNldFggKz0gKGRpc3RhbmNlWCAqIGZvcmNlKTtcbiAgICB9XG5cbiAgICAvLyBZXG4gICAgbGV0IGRpc3RhbmNlWSA9ICh5IC0gdGhpcy5vZmZzZXRZKSAtIHRoaXMud2luZG93TWlkZGxlWTtcbiAgICBsZXQgbmVnWSA9IGZhbHNlO1xuICAgIGlmKGRpc3RhbmNlWSA8IDApe1xuICAgICAgbmVnWSA9IHRydWU7XG4gICAgfVxuICAgIGRpc3RhbmNlWSA9IE1hdGgucG93KCAoTWF0aC5hYnMoZGlzdGFuY2VZIC8gdGhpcy53aW5kb3dNaWRkbGVZKSApLCBpbmRpY2VQb3dZICkgKiB0aGlzLndpbmRvd01pZGRsZVk7XG5cbiAgICBpZihuZWdZKXtcbiAgICAgIGRpc3RhbmNlWSAqPSAtMTtcbiAgICB9XG5cbiAgICBpZiggKHRoaXMub2Zmc2V0WSArIChkaXN0YW5jZVkgKiBmb3JjZSkgPj0gMCkgJiYgKHRoaXMub2Zmc2V0WSArIChkaXN0YW5jZVkgKiBmb3JjZSkgPD0gdGhpcy5zdmdNYXhZIC0gdGhpcy53aW5kb3dTaXplWSkgKXtcbiAgICAgIHRoaXMub2Zmc2V0WSArPSAoZGlzdGFuY2VZICogZm9yY2UpO1xuICAgIH1cblxuICAgIC8vYWN0dWFsaXNhdGlvblxuICAgIHdpbmRvdy5zY3JvbGwodGhpcy5vZmZzZXRYLCB0aGlzLm9mZnNldFkpO1xuXG4gIH1cblxuICBfbXlMaXN0ZW5lcih0aW1lKXtcbiAgICB0aGlzLndpbmRvd1NpemVYID0gd2luZG93LmlubmVyV2lkdGg7XG4gICAgdGhpcy53aW5kb3dTaXplWSA9IHdpbmRvdy5pbm5lckhlaWdodDtcbiAgICBzZXRUaW1lb3V0KHRoaXMuX215TGlzdGVuZXIsIHRpbWUpO1xuICB9XG5cbn1cbiJdfQ==