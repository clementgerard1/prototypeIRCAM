'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _trunc = require('babel-runtime/core-js/math/trunc');

var _trunc2 = _interopRequireDefault(_trunc);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _get2 = require('babel-runtime/helpers/get');

var _get3 = _interopRequireDefault(_get2);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _client = require('soundworks/client');

var soundworks = _interopRequireWildcard(_client);

var _MyGrain = require('./MyGrain.js');

var _MyGrain2 = _interopRequireDefault(_MyGrain);

var _wavesAudio = require('waves-audio');

var waves = _interopRequireWildcard(_wavesAudio);

var _Decoder = require('./Decoder.js');

var _Decoder2 = _interopRequireDefault(_Decoder);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var audioContext = soundworks.audioContext;
var scheduler = waves.getScheduler();

var PlayerView = function (_soundworks$View) {
  (0, _inherits3.default)(PlayerView, _soundworks$View);

  function PlayerView(template, content, events, options) {
    (0, _classCallCheck3.default)(this, PlayerView);
    return (0, _possibleConstructorReturn3.default)(this, (PlayerView.__proto__ || (0, _getPrototypeOf2.default)(PlayerView)).call(this, template, content, events, options));
  }

  return PlayerView;
}(soundworks.View);

var view = '';

// this experience plays a sound when it starts, and plays another sound when
// other clients join the experience

var PlayerExperience = function (_soundworks$Experienc) {
  (0, _inherits3.default)(PlayerExperience, _soundworks$Experienc);

  function PlayerExperience(assetsDomain) {
    (0, _classCallCheck3.default)(this, PlayerExperience);

    //Services
    var _this2 = (0, _possibleConstructorReturn3.default)(this, (PlayerExperience.__proto__ || (0, _getPrototypeOf2.default)(PlayerExperience)).call(this));

    _this2.platform = _this2.require('platform', { features: ['web-audio', 'wake-lock'] });
    _this2.motionInput = _this2.require('motion-input', { descriptors: ['orientation'] });
    _this2.loader = _this2.require('loader', {
      files: ['sounds/nappe/gadoue.mp3', //0
      'sounds/nappe/gadoue.mp3', //1
      "sounds/nappe/nage.mp3", // ...
      "sounds/nappe/tempete.mp3", "sounds/nappe/vent.mp3", "sounds/path/camusC.mp3", // 5  
      "markers/camus.json", "sounds/path/churchillC.mp3", "markers/churchill.json", "sounds/path/irakC.mp3", "markers/irak.json", //10  
      "sounds/shape/eminem.mp3", "sounds/shape/trump.mp3", "sounds/shape/fr.mp3", "sounds/shape/brexit.mp3"]
    });

    //params
    _this2.gainOutputDirect;
    _this2.gainOutputGrain;
    _this2.grain;
    _this2.startOK = false;
    _this2.modelOK = false;
    _this2.nbPath = 3;
    _this2.nbShape = 4;
    _this2.qtRandom = 140;
    _this2.old = false;
    _this2.nbSegment = [232, 144, 106];
    _this2.lastSegment = [0, 0, 0];
    _this2.lastPosition = [0, 0, 0];
    _this2.count4 = 10;
    _this2.maxLag = 10;
    _this2.endStartSegmenter = [];
    _this2.countTimeout = [];
    _this2.direction = [];
    _this2.oldTabPath = [];
    _this2.count1 = [];
    _this2.count2 = [];
    _this2.segmenter = [];
    _this2.segmenterGain = [];
    _this2.segmenterGainGrain = [];
    _this2.sources = [];
    _this2.gains = [];
    _this2.gainsDirections = [];
    _this2.gainsShape = [];
    _this2.oldShape = [false, false, false, false];
    _this2.gainsGrainShape = [];
    _this2.soundShape = [];
    _this2.rampShape = { 'shape1': 0, 'shape2': 0, 'shape3': 0, 'shape4': 0 };
    _this2.countMax = 100;

    //XMM
    _this2.decoder = new _Decoder2.default();

    for (var i = 0; i < _this2.nbPath; i++) {
      _this2.count1[i] = 20;
      _this2.count2[i] = 20;
      _this2.countTimeout[i] = 0;
      _this2.direction[i] = true;
      _this2.oldTabPath[i] = true;
      _this2.endStartSegmenter[i] = false;
    }

    return _this2;
  }

  (0, _createClass3.default)(PlayerExperience, [{
    key: 'init',
    value: function init() {
      var _this3 = this;

      // initialize the view
      this.viewTemplate = view;
      this.viewContent = {};
      this.viewCtor = PlayerView;
      this.viewOptions = { preservePixelRatio: true };
      this.view = this.createView();

      //bind
      this._toMove = this._toMove.bind(this);
      this._isInEllipse = this._isInEllipse.bind(this);
      this._isInRect = this._isInRect.bind(this);
      this._isInLayer = this._isInLayer.bind(this);
      this._isInPath = this._isInPath.bind(this);
      this._isInShape = this._isInShape.bind(this);
      this._getDistanceNode = this._getDistanceNode.bind(this);
      this._createSonorWorld = this._createSonorWorld.bind(this);
      this._updateGain = this._updateGain.bind(this);
      this._rotatePoint = this._rotatePoint.bind(this);
      this._myListener = this._myListener.bind(this);
      this._addBall = this._addBall.bind(this);
      this._addBackground = this._addBackground.bind(this);
      this._setModel = this._setModel.bind(this);
      this._processProba = this._processProba.bind(this);
      this._replaceShape = this._replaceShape.bind(this);
      this._addShape = this._addShape.bind(this);
      this._startSegmenter = this._startSegmenter.bind(this);
      this._findNewSegment = this._findNewSegment.bind(this);
      this._updateSegmentIfNotIn = this._updateSegmentIfNotIn.bind(this);
      this._updateAudioPath = this._updateAudioPath.bind(this);
      this._updateAudioshape = this._updateAudioshape.bind(this);

      //receives
      this.receive('background', function (data) {
        return _this3._addBackground(data);
      });
      this.receive('model', function (model) {
        return _this3._setModel(model);
      });
      this.receive('shapeAnswer', function (shape, x, y) {
        return _this3._addShape(shape, x, y);
      });
    }
  }, {
    key: 'start',
    value: function start() {
      var _this4 = this;

      if (!this.startOK) {
        (0, _get3.default)(PlayerExperience.prototype.__proto__ || (0, _getPrototypeOf2.default)(PlayerExperience.prototype), 'start', this).call(this); // don't forget this
        if (!this.hasStarted) this.init();
        this.show();
      } else {

        //params
        document.body.style.overflow = "hidden";
        this.middleX = window.innerWidth / 2;
        this.screenSizeX = window.innerWidth;
        this.screenSizeY = window.innerHeight;
        this.middleEcranX = this.screenSizeX / 2;
        this.middleEcranY = this.screenSizeY / 2;
        setTimeout(function () {
          _this4._myListener(100);
        }, 100);
        this.middleY = window.innerHeight / 2;
        this.ellipseListLayer = document.getElementsByTagName('ellipse');
        this.rectListLayer = document.getElementsByTagName('rect');
        this.totalElements = this.ellipseListLayer.length + this.rectListLayer.length;
        this.textList = document.getElementsByTagName('text');
        this.shapeList = [];
        this.listRectPath1 = document.getElementsByClassName('path0');
        this.listRectPath2 = document.getElementsByClassName('path1');
        this.listRectPath3 = document.getElementsByClassName('path2');
        this.RectListShape1 = document.getElementsByClassName('shape1');
        this.RectListShape2 = document.getElementsByClassName('shape2');
        this.RectListShape3 = document.getElementsByClassName('shape3');
        this.RectListShape4 = document.getElementsByClassName('shape4');

        this._addBall(10, 10);
        this._replaceShape();
        this._createSonorWorld();

        this.maxCountUpdate = 2;
        this.countUpdate = this.maxCountUpdate + 1;
        this.visualisationShapePath = false;
        this.visualisationBall = true;
        if (!this.visualisationBall) {
          this.view.$el.querySelector('#ball').style.display = 'none';
        }
        this.visualisationShape = false;
        if (!this.visualisationShape) {
          for (var i = 0; i < this.ellipseListLayer.length; i++) {
            this.ellipseListLayer[i].style.display = 'none';
          }
          for (var _i = 0; _i < this.rectListLayer.length; _i++) {
            this.rectListLayer[_i].style.display = 'none';
          }
        }

        this.mirrorBallX = 10;
        this.mirrorBallY = 10;
        this.offsetX = 0;
        this.offsetY = 0;
        this.svgMaxX = document.getElementsByTagName('svg')[0].getAttribute('width');
        this.svgMaxY = document.getElementsByTagName('svg')[0].getAttribute('height');

        this.tabInLayer;
        if (this.motionInput.isAvailable('orientation')) {
          this.motionInput.addListener('orientation', function (data) {
            var newValues = _this4._toMove(data[2], data[1] - 25);
            if (_this4.count4 > _this4.maxLag) {
              _this4.tabInLayer = _this4._isInLayer(newValues[0], newValues[1]);
              _this4.tabPath = _this4._isInPath(newValues[0], newValues[1]);
              _this4.tabShape = _this4._isInShape(newValues[0], newValues[1]);
              _this4.count4 = -1;
              if (_this4.countUpdate > _this4.maxCountUpdate) {
                _this4._updateGain(_this4.tabInLayer);
                _this4.countUpdate = 0;
              } else {
                _this4.countUpdate++;
              }
            }

            _this4.count4++;

            _this4._moveScreenTo(newValues[0], newValues[1], 0.08);

            // XMM
            if (_this4.modelOK) {
              _this4.decoder.process(newValues[0], newValues[1]);
              _this4._processProba();
            }
          });
        } else {
          console.log("Orientation non disponible");
        }
      }
    }
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
      elem.setAttributeNS(null, "id", 'Ball');
      document.getElementsByTagName('svg')[0].appendChild(elem);
    }
  }, {
    key: '_addBackground',
    value: function _addBackground(background) {
      var parser = new DOMParser();
      var backgroundXml = parser.parseFromString(background, 'application/xml');
      backgroundXml = backgroundXml.getElementsByTagName('svg')[0];
      document.getElementById('experience').appendChild(backgroundXml);
      document.getElementsByTagName('svg')[0].setAttribute('id', 'svgElement');
      this._deleteRectPath();
      this.startOK = true;
      this.start();
    }
  }, {
    key: '_deleteRectPath',
    value: function _deleteRectPath() {
      var tab = document.getElementsByClassName('path0');
      if (!this.visualisationShapePath) {
        for (var i = 0; i < tab.length; i++) {
          tab[i].style.display = 'none';
        }

        tab = document.getElementsByClassName('path1');
        for (var _i2 = 0; _i2 < tab.length; _i2++) {
          tab[_i2].style.display = 'none';
        }

        tab = document.getElementsByClassName('path2');
        for (var _i3 = 0; _i3 < tab.length; _i3++) {
          tab[_i3].style.display = 'none';
        }
      }
    }
  }, {
    key: '_addShape',
    value: function _addShape(shape, x, y) {
      var parser = new DOMParser();
      var shapeXml = parser.parseFromString(shape, 'application/xml');
      shapeXml = shapeXml.getElementsByTagName('g')[0];
      var ball = document.getElementById('ball');
      var shapeXmlTab = shapeXml.childNodes;
      for (var i = 0; i < shapeXmlTab.length; i++) {
        if (shapeXmlTab[i].nodeName == 'path') {
          var newNode = Ball.parentNode.insertBefore(shapeXmlTab[i], ball);
          this.shapeList[this.shapeList.length] = newNode.setAttribute('transform', 'translate(' + x + ' ' + y + ')');
        }
      }
    }
  }, {
    key: '_toMove',
    value: function _toMove(valueX, valueY) {
      var obj = this.view.$el.querySelector('#ball');
      var newX = void 0;
      var newY = void 0;
      var actu = this.mirrorBallX + valueX * 0.3;
      if (actu < this.offsetX) {
        actu = this.offsetX;
      } else if (actu > this.screenSizeX + this.offsetX) {
        actu = this.screenSizeX + this.offsetX;
      }
      if (this.visualisationBall) {
        obj.setAttribute('cx', actu);
      }
      this.mirrorBallX = actu;
      newX = actu;
      actu = this.mirrorBallY + valueY * 0.3;
      if (actu < this.offsetY) {
        actu = this.offsetY;
      }
      if (actu > this.screenSizeY + this.offsetY) {
        actu = this.screenSizeY + this.offsetY;
      }
      if (this.visualisationBall) {
        obj.setAttribute('cy', actu);
      }
      this.mirrorBallY = actu;
      newY = actu;
      return [newX, newY];
    }
  }, {
    key: '_moveScreenTo',
    value: function _moveScreenTo(x, y) {
      var force = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;

      var distanceX = x - this.offsetX - this.middleEcranX;
      var negX = false;
      var indicePowX = 3;
      var indicePowY = 3;
      if (distanceX < 0) {
        negX = true;
      }
      distanceX = Math.pow(Math.abs(distanceX / this.middleEcranX), indicePowX) * this.middleEcranX;
      if (negX) {
        distanceX *= -1;
      }
      if (this.offsetX + distanceX * force >= 0 && this.offsetX + distanceX * force <= this.svgMaxX - this.screenSizeX) {
        this.offsetX += distanceX * force;
      }

      var distanceY = y - this.offsetY - this.middleEcranY;
      var negY = false;
      if (distanceY < 0) {
        negY = true;
      }
      distanceY = Math.pow(Math.abs(distanceY / this.middleEcranY), indicePowY) * this.middleEcranY;
      if (negY) {
        distanceY *= -1;
      }
      if (this.offsetY + distanceY * force >= 0 && this.offsetY + distanceY * force <= this.svgMaxY - this.screenSizeY) {
        this.offsetY += distanceY * force;
      }
      window.scroll(this.offsetX, this.offsetY);
    }
  }, {
    key: '_myListener',
    value: function _myListener(time) {
      this.screenSizeX = window.innerWidth;
      this.screenSizeY = window.innerHeight;
      setTimeout(this._myListener, time);
    }
  }, {
    key: '_replaceShape',
    value: function _replaceShape() {
      var newList = [];
      for (var i = 0; i < this.textList.length; i++) {
        newList[i] = this.textList[i];
      }
      for (var _i4 = 0; _i4 < newList.length; _i4++) {
        var elementName = newList[_i4].innerHTML;
        if (elementName.slice(0, 1) == '_') {

          var shapeName = elementName.slice(1, elementName.length);
          var x = newList[_i4].getAttribute('x');
          var y = newList[_i4].getAttribute('y');
          this.send('askShapes', shapeName, x, y);
          var parent = newList[_i4].parentNode;
          parent.removeChild(newList[_i4]);
          var elems = document.getElementsByClassName(shapeName);
          for (var _i5 = 0; _i5 < elems.length; _i5++) {
            elems[_i5].style.display = 'none';
          }
        }
      }
    }
  }, {
    key: '_isInLayer',
    value: function _isInLayer(x, y) {
      var tab = [];
      var rotateAngle = void 0;
      var middleRotateX = void 0;
      var middleRotateY = void 0;
      for (var i = 0; i < this.ellipseListLayer.length; i++) {
        rotateAngle = 0;
        var middleX = this.ellipseListLayer[i].getAttribute('cx');
        var middleY = this.ellipseListLayer[i].getAttribute('cy');
        var radiusX = this.ellipseListLayer[i].getAttribute('rx');
        var radiusY = this.ellipseListLayer[i].getAttribute('ry');
        var transform = this.ellipseListLayer[i].getAttribute('transform');
        if (/rotate/.test(transform)) {
          transform = transform.slice(7, transform.length);
          middleRotateX = parseFloat(transform.split(" ")[1]);
          middleRotateY = parseFloat(transform.split(",")[1].replace(")", ""));
          rotateAngle = parseFloat(transform.split(" ")[0]);
        }
        tab[tab.length] = this._isInEllipse(parseFloat(middleX), parseFloat(middleY), parseFloat(radiusX), parseFloat(radiusY), x, y, rotateAngle, middleRotateX, middleRotateY);
      }
      for (var _i6 = 0; _i6 < this.rectListLayer.length; _i6++) {
        rotateAngle = 0;
        middleRotateX = null;
        middleRotateY = null;
        var height = this.rectListLayer[_i6].getAttribute('width');
        var width = this.rectListLayer[_i6].getAttribute('height');
        var left = this.rectListLayer[_i6].getAttribute('x');
        var top = this.rectListLayer[_i6].getAttribute('y');
        var _transform = this.rectListLayer[_i6].getAttribute('transform');
        if (/rotate/.test(_transform)) {
          _transform = _transform.slice(7, _transform.length);
          middleRotateX = parseFloat(_transform.split(" ")[1]);
          middleRotateY = parseFloat(_transform.split(",")[1].replace(")", ""));
          rotateAngle = parseFloat(_transform.split(" ")[0]);
        }
        tab[tab.length] = this._isInRect(parseFloat(height), parseFloat(width), parseFloat(left), parseFloat(top), x, y, rotateAngle, middleRotateX, middleRotateY);
      }
      return tab;
    }
  }, {
    key: '_isInPath',
    value: function _isInPath(x, y) {

      var rotateAngle = void 0;
      var middleRotateX = void 0;
      var middleRotateY = void 0;
      var height = void 0;
      var width = void 0;
      var left = void 0;
      var top = void 0;
      var transform = void 0;
      var i = 0;

      //Path 1
      var path1 = false;
      while (!path1 && i < this.listRectPath1.length) {
        rotateAngle = 0;
        middleRotateX = null;
        middleRotateY = null;
        height = this.listRectPath1[i].getAttribute('width');
        width = this.listRectPath1[i].getAttribute('height');
        left = this.listRectPath1[i].getAttribute('x');
        top = this.listRectPath1[i].getAttribute('y');
        var _transform2 = this.listRectPath1[i].getAttribute('transformform');
        if (/rotate/.test(_transform2)) {
          _transform2 = _transform2.slice(7, _transform2.length);
          middleRotateX = parseFloat(_transform2.split(" ")[1]);
          middleRotateY = parseFloat(_transform2.split(",")[1].replace(")", ""));
          rotateAngle = parseFloat(_transform2.split(" ")[0]);
        }
        path1 = this._isInRect(parseFloat(height), parseFloat(width), parseFloat(left), parseFloat(top), x, y, rotateAngle, middleRotateX, middleRotateY);
        i++;
      }

      //Path 2
      var path2 = false;
      i = 0;
      while (!path2 && i < this.listRectPath2.length) {
        rotateAngle = 0;
        middleRotateX = null;
        middleRotateY = null;
        height = this.listRectPath2[i].getAttribute('width');
        width = this.listRectPath2[i].getAttribute('height');
        left = this.listRectPath2[i].getAttribute('x');
        top = this.listRectPath2[i].getAttribute('y');
        transform = this.listRectPath2[i].getAttribute('transformform');
        if (/rotate/.test(transform)) {
          transform = transform.slice(7, transform.length);
          middleRotateX = parseFloat(transform.split(" ")[1]);
          middleRotateY = parseFloat(transform.split(",")[1].replace(")", ""));
          rotateAngle = parseFloat(transform.split(" ")[0]);
        }
        path2 = this._isInRect(parseFloat(height), parseFloat(width), parseFloat(left), parseFloat(top), x, y, rotateAngle, middleRotateX, middleRotateY);
        i++;
      }

      //Path 3
      var path3 = false;
      i = 0;
      while (!path3 && i < this.listRectPath3.length) {
        rotateAngle = 0;
        middleRotateX = null;
        middleRotateY = null;
        height = this.listRectPath3[i].getAttribute('width');
        width = this.listRectPath3[i].getAttribute('height');
        left = this.listRectPath3[i].getAttribute('x');
        top = this.listRectPath3[i].getAttribute('y');
        transform = this.listRectPath3[i].getAttribute('transformform');
        if (/rotate/.test(transform)) {
          transform = transform.slice(7, transform.length);
          middleRotateX = parseFloat(transform.split(" ")[1]);
          middleRotateY = parseFloat(transform.split(",")[1].replace(")", ""));
          rotateAngle = parseFloat(transform.split(" ")[0]);
        }
        path3 = this._isInRect(parseFloat(height), parseFloat(width), parseFloat(left), parseFloat(top), x, y, rotateAngle, middleRotateX, middleRotateY);
        i++;
      }
      return [path1, path2, path3];
    }
  }, {
    key: '_isInShape',
    value: function _isInShape(x, y) {
      //Variables
      var rotateAngle = void 0;
      var middleRotateX = void 0;
      var middleRotateY = void 0;
      var height = void 0;
      var width = void 0;
      var left = void 0;
      var top = void 0;
      var transform = void 0;
      var i = 0;

      //shape 1
      var shape1 = false;
      while (!shape1 && i < this.RectListShape1.length) {
        rotateAngle = 0;
        middleRotateX = null;
        middleRotateY = null;
        height = this.RectListShape1[i].getAttribute('width');
        width = this.RectListShape1[i].getAttribute('height');
        left = this.RectListShape1[i].getAttribute('x');
        top = this.RectListShape1[i].getAttribute('y');
        var _transform3 = this.RectListShape1[i].getAttribute('transform');
        if (/rotate/.test(_transform3)) {
          _transform3 = _transform3.slice(7, _transform3.length);
          middleRotateX = parseFloat(_transform3.split(" ")[1]);
          middleRotateY = parseFloat(_transform3.split(",")[1].replace(")", ""));
          rotateAngle = parseFloat(_transform3.split(" ")[0]);
        }
        shape1 = this._isInRect(parseFloat(height), parseFloat(width), parseFloat(left), parseFloat(top), x, y, rotateAngle, middleRotateX, middleRotateY);
        i++;
      }

      //shape 2
      i = 0;
      var shape2 = false;
      while (!shape2 && i < this.RectListShape2.length) {
        rotateAngle = 0;
        middleRotateX = null;
        middleRotateY = null;
        height = this.RectListShape2[i].getAttribute('width');
        width = this.RectListShape2[i].getAttribute('height');
        left = this.RectListShape2[i].getAttribute('x');
        top = this.RectListShape2[i].getAttribute('y');
        var _transform4 = this.RectListShape2[i].getAttribute('transform');
        if (/rotate/.test(_transform4)) {
          _transform4 = _transform4.slice(7, _transform4.length);
          middleRotateX = parseFloat(_transform4.split(" ")[1]);
          middleRotateY = parseFloat(_transform4.split(",")[1].replace(")", ""));
          rotateAngle = parseFloat(_transform4.split(" ")[0]);
        }
        shape2 = this._isInRect(parseFloat(height), parseFloat(width), parseFloat(left), parseFloat(top), x, y, rotateAngle, middleRotateX, middleRotateY);
        i++;
      }

      //shape 3
      i = 0;
      var shape3 = false;
      while (!shape3 && i < this.RectListShape3.length) {
        rotateAngle = 0;
        middleRotateX = null;
        middleRotateY = null;
        height = this.RectListShape3[i].getAttribute('width');
        width = this.RectListShape3[i].getAttribute('height');
        left = this.RectListShape3[i].getAttribute('x');
        top = this.RectListShape3[i].getAttribute('y');
        var _transform5 = this.RectListShape3[i].getAttribute('transform');
        if (/rotate/.test(_transform5)) {
          _transform5 = _transform5.slice(7, _transform5.length);
          middleRotateX = parseFloat(_transform5.split(" ")[1]);
          middleRotateY = parseFloat(_transform5.split(",")[1].replace(")", ""));
          rotateAngle = parseFloat(_transform5.split(" ")[0]);
        }
        shape3 = this._isInRect(parseFloat(height), parseFloat(width), parseFloat(left), parseFloat(top), x, y, rotateAngle, middleRotateX, middleRotateY);
        i++;
      }

      //shape 4
      i = 0;
      var shape4 = false;
      while (!shape4 && i < this.RectListShape4.length) {
        rotateAngle = 0;
        middleRotateX = null;
        middleRotateY = null;
        height = this.RectListShape4[i].getAttribute('width');
        width = this.RectListShape4[i].getAttribute('height');
        left = this.RectListShape4[i].getAttribute('x');
        top = this.RectListShape4[i].getAttribute('y');
        var _transform6 = this.RectListShape4[i].getAttribute('transform');
        if (/rotate/.test(_transform6)) {
          _transform6 = _transform6.slice(7, _transform6.length);
          middleRotateX = parseFloat(_transform6.split(" ")[1]);
          middleRotateY = parseFloat(_transform6.split(",")[1].replace(")", ""));
          rotateAngle = parseFloat(_transform6.split(" ")[0]);
        }
        shape4 = this._isInRect(parseFloat(height), parseFloat(width), parseFloat(left), parseFloat(top), x, y, rotateAngle, middleRotateX, middleRotateY);
        i++;
      }

      return [shape1, shape2, shape3, shape4];
    }
  }, {
    key: '_isInRect',
    value: function _isInRect(height, width, left, top, pointX, pointY, rotateAngle, middleRotateX, middleRotateY) {

      var newPoint = this._rotatePoint(pointX, pointY, middleRotateX, middleRotateY, rotateAngle);

      if (newPoint[0] > parseInt(left) && newPoint[0] < parseInt(left) + parseInt(height) && newPoint[1] > top && newPoint[1] < parseInt(top) + parseInt(width)) {
        return true;
      } else {
        return false;
      }
    }
  }, {
    key: '_isInEllipse',
    value: function _isInEllipse(middleX, middleY, radiusX, radiusY, pointX, pointY, rotateAngle, middleRotateX, middleRotateY) {

      var newPoint = this._rotatePoint(pointX, pointY, middleRotateX, middleRotateY, rotateAngle);

      var a = radiusX;;
      var b = radiusY;
      var calc = Math.pow(newPoint[0] - middleX, 2) / Math.pow(a, 2) + Math.pow(newPoint[1] - middleY, 2) / Math.pow(b, 2);
      if (calc <= 1) {
        return true;
      } else {
        return false;
      }
    }
  }, {
    key: '_rotatePoint',
    value: function _rotatePoint(x, y, middleX, middleY, angle) {
      var newAngle = angle * (3.14159265 / 180);
      var newX = (x - middleX) * Math.cos(newAngle) + (y - middleY) * Math.sin(newAngle);
      var newY = -1 * (x - middleX) * Math.sin(newAngle) + (y - middleY) * Math.cos(newAngle);
      newX += middleX;
      newY += middleY;
      return [newX, newY];
    }

    /* ------------------------------------------SON--------------------------------------------- */

  }, {
    key: '_createSonorWorld',
    value: function _createSonorWorld() {

      //Grain
      this.grain = new _MyGrain2.default();
      scheduler.add(this.grain);
      this.grain.connect(audioContext.destination);
      var bufferAssocies = [5, 7, 9];
      var markerAssocies = [6, 8, 10];

      //Segmenter
      for (var i = 0; i < this.nbPath; i++) {
        var idBuffer = bufferAssocies[i];
        var idMarker = markerAssocies[i];
        this.segmenter[i] = new waves.SegmentEngine({
          buffer: this.loader.buffers[idBuffer],
          positionArray: this.loader.buffers[idMarker].time,
          durationArray: this.loader.buffers[idMarker].duration,
          periodAbs: 10,
          periodRel: 10
        });
        this.segmenterGain[i] = audioContext.createGain();
        this.segmenterGainGrain[i] = audioContext.createGain();
        this.segmenterGainGrain[i].gain.setValueAtTime(0, audioContext.currentTime);
        this.segmenterGain[i].gain.setValueAtTime(0, audioContext.currentTime);
        this.segmenterGainGrain[i].connect(this.grain.input);
        this.segmenterGain[i].connect(audioContext.destination);
        this.segmenter[i].connect(this.segmenterGain[i]);
        this.segmenter[i].connect(this.segmenterGainGrain[i]);
        this._startSegmenter(i);
      }

      for (var _i7 = 0; _i7 < this.totalElements; _i7++) {

        //create direct gain
        this.gainsDirections[_i7] = 'down';
        this.gains[_i7] = audioContext.createGain();
        this.gains[_i7].gain.value = 0;
        this.gains[_i7].connect(this.grain.input);

        //create grain gain
        this.sources[_i7] = audioContext.createBufferSource();
        this.sources[_i7].buffer = this.loader.buffers[_i7 % 5];
        this.sources[_i7].connect(this.gains[_i7]);
        this.sources[_i7].loop = true;
        this.sources[_i7].start();
      }

      this.gainOutputDirect = audioContext.createGain();
      this.gainOutputDirect.gain.value = 0;
      this.gainOutputDirect.connect(audioContext.destination);
      this.gainOutputGrain = audioContext.createGain();
      this.gainOutputGrain.gain.value = 0;
      this.gainOutputGrain.connect(this.grain.input);

      for (var _i8 = 0; _i8 < this.nbShape; _i8++) {

        //create direct gain
        this.gainsShape[_i8] = audioContext.createGain();
        this.gainsShape[_i8].gain.value = 0;
        this.gainsShape[_i8].connect(this.gainOutputDirect);

        //create grain gain
        this.gainsGrainShape[_i8] = audioContext.createGain();
        this.gainsGrainShape[_i8].gain.value = 0;
        this.gainsGrainShape[_i8].connect(this.gainOutputGrain);

        //sonor src
        this.soundShape[_i8] = audioContext.createBufferSource();
        this.soundShape[_i8].buffer = this.loader.buffers[10 + (_i8 + 1)];
        this.soundShape[_i8].connect(this.gainsShape[_i8]);
        this.soundShape[_i8].connect(this.gainsGrainShape[_i8]);
        this.soundShape[_i8].loop = true;
        this.soundShape[_i8].start();
      }
    }
  }, {
    key: '_startSegmenter',
    value: function _startSegmenter(i) {
      var _this5 = this;

      this.segmenter[i].trigger();
      var newPeriod = parseFloat(this.loader.buffers[6 + i * 2]['duration'][this.segmenter[i].segmentId]) * 1000;
      setTimeout(function () {
        _this5._startSegmenter(i);
      }, newPeriod);
    }
  }, {
    key: '_updateGain',
    value: function _updateGain(tabInLayer) {
      for (var i = 0; i < tabInLayer.length; i++) {
        if (this.gains[i].gain.value == 0 && tabInLayer[i] && this.gainsDirections[i] == 'down') {
          var actual = this.gains[i].gain.value;
          this.gains[i].gain.cancelScheduledValues(audioContext.currentTime);
          this.gains[i].gain.setValueAtTime(actual, audioContext.currentTime);
          this.gains[i].gain.linearRampToValueAtTime(0.24, audioContext.currentTime + 2.3);
          this.gainsDirections[i] = 'up';
        } else if (this.gains[i].gain.value != 0 && !tabInLayer[i] && this.gainsDirections[i] == 'up') {
          var _actual = this.gains[i].gain.value;
          this.gains[i].gain.cancelScheduledValues(audioContext.currentTime);
          this.gains[i].gain.setValueAtTime(_actual, audioContext.currentTime);
          this.gains[i].gain.linearRampToValueAtTime(0, audioContext.currentTime + 3.5);
          this.gainsDirections[i] = 'down';
        }
      }
    }
  }, {
    key: '_updateAudioPath',
    value: function _updateAudioPath(i) {
      var _this6 = this;

      if (this.tabPath[i]) {
        var actual1 = this.segmenterGain[i].gain.value;
        var actual2 = this.segmenterGainGrain[i].gain.value;
        this.segmenterGain[i].gain.cancelScheduledValues(audioContext.currentTime);
        this.segmenterGainGrain[i].gain.cancelScheduledValues(audioContext.currentTime);
        this.segmenterGain[i].gain.setValueAtTime(actual1, audioContext.currentTime);
        this.segmenterGainGrain[i].gain.setValueAtTime(actual2, audioContext.currentTime);
        this.segmenterGainGrain[i].gain.linearRampToValueAtTime(0, audioContext.currentTime + 1);
        this.segmenterGain[i].gain.linearRampToValueAtTime(0.25, audioContext.currentTime + 0.6);
      } else {
        var _actual2 = this.segmenterGain[i].gain.value;
        var _actual3 = this.segmenterGainGrain[i].gain.value;
        this.segmenterGain[i].gain.cancelScheduledValues(audioContext.currentTime);
        this.segmenterGainGrain[i].gain.cancelScheduledValues(audioContext.currentTime);
        this.segmenterGain[i].gain.setValueAtTime(_actual2, audioContext.currentTime);
        this.segmenterGainGrain[i].gain.setValueAtTime(_actual3, audioContext.currentTime);
        if (this.endStartSegmenter[i]) {
          this.segmenterGainGrain[i].gain.linearRampToValueAtTime(_actual2 + 0.15, audioContext.currentTime + 0.1);
          setTimeout(function () {
            _this6.segmenterGainGrain[i].gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.3);
          }, 2000);
          this.segmenterGain[i].gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.4);
        } else {
          this.endStartSegmenter[i] = true;
        }
      }
    }
  }, {
    key: '_updateAudioshape',
    value: function _updateAudioshape(id) {

      //shape1
      if (id == 0 && this.tabShape[id]) {
        var gainGrain = 1 - this.rampShape["shape1"] / 1000;
        var gainDirect = this.rampShape["shape1"] / 1000;
        if (gainDirect < 0) {
          gainDirect = 0;
        } else if (gainDirect > 1) {
          gainDirect = 1;
        }
        if (gainGrain < 0) {
          gainGrain = 0;
        } else if (gainGrain > 1) {
          gainGrain = 1;
        }
        if (this.tabShape[id]) {
          this.gainsShape[id].gain.linearRampToValueAtTime(gainDirect, audioContext.currentTime + 0.01);
          this.gainsGrainShape[id].gain.linearRampToValueAtTime(gainGrain, audioContext.currentTime + 0.01);
        }
      }

      //shape2
      if (id == 1 && this.tabShape[id]) {
        var _gainGrain = 1 - this.rampShape["shape2"] / 1000;
        var _gainDirect = this.rampShape["shape2"] / 1000;
        if (_gainDirect < 0) {
          _gainDirect = 0;
        } else if (gainDirec > 1) {
          _gainDirect = 1;
        }
        if (_gainGrain < 0) {
          _gainGrain = 0;
        } else if (_gainGrain > 1) {
          _gainGrain = 1;
        }
        if (this.tabShape[id]) {
          this.gainsShape[id].gain.linearRampToValueAtTime(_gainDirect, audioContext.currentTime + 0.01);
          this.gainsGrainShape[id].gain.linearRampToValueAtTime(_gainGrain, audioContext.currentTime + 0.01);
        }
      }

      //shape3
      if (id == 2 && this.tabShape[id]) {
        var _gainGrain2 = 1 - this.rampShape["shape3"] / 1000;
        var _gainDirect2 = this.rampShape["shape3"] / 1000;
        if (_gainDirect2 < 0) {
          _gainDirect2 = 0;
        } else if (_gainDirect2 > 1) {
          _gainDirect2 = 1;
        }
        if (_gainGrain2 < 0) {
          _gainGrain2 = 0;
        } else if (_gainGrain2 > 1) {
          _gainGrain2 = 1;
        }
        if (this.tabShape[id]) {
          this.gainsShape[id].gain.linearRampToValueAtTime(_gainDirect2, audioContext.currentTime + 0.01);
          this.gainsGrainShape[id].gain.linearRampToValueAtTime(_gainGrain2, audioContext.currentTime + 0.01);
        }
      }

      //shape4
      if (id == 3 && this.tabShape[id]) {
        var _gainGrain3 = 1 - this.rampShape["shape4"] / 1000;
        var _gainDirect3 = this.rampShape["shape4"] / 1000;
        if (_gainDirect3 < 0) {
          _gainDirect3 = 0;
        } else if (_gainDirect3 > 1) {
          _gainDirect3 = 1;
        }
        if (_gainGrain3 < 0) {
          _gainGrain3 = 0;
        } else if (_gainGrain3 > 1) {
          _gainGrain3 = 1;
        }
        if (this.tabShape[id]) {
          this.gainsShape[id].gain.linearRampToValueAtTime(_gainDirect3, audioContext.currentTime + 0.01);
          this.gainsGrainShape[id].gain.linearRampToValueAtTime(_gainGrain3, audioContext.currentTime + 0.01);
        }
      }

      if (!this.tabShape[0] && this.tabShape[0] != this.oldShape[0]) {
        this.gainsShape[0].gain.linearRampToValueAtTime(0, audioContext.currentTime + 1.5);
        this.gainsGrainShape[0].gain.linearRampToValueAtTime(0, audioContext.currentTime + 1.5);
      }
      if (!this.tabShape[1] && this.tabShape[1] != this.oldShape[1]) {
        this.gainsShape[1].gain.linearRampToValueAtTime(0, audioContext.currentTime + 1.5);
        this.gainsGrainShape[1].gain.linearRampToValueAtTime(0, audioContext.currentTime + 1.5);
      }
      if (!this.tabShape[2] && this.tabShape[2] != this.oldShape[2]) {
        this.gainsShape[2].gain.linearRampToValueAtTime(0, audioContext.currentTime + 1.5);
        this.gainsGrainShape[2].gain.linearRampToValueAtTime(0, audioContext.currentTime + 1.5);
      }
      if (!this.tabShape[3] && this.tabShape[3] != this.oldShape[3]) {
        this.gainsShape[3].gain.linearRampToValueAtTime(0, audioContext.currentTime + 1.5);
        this.gainsGrainShape[3].gain.linearRampToValueAtTime(0, audioContext.currentTime + 1.5);
      }

      this.oldShape = [this.tabShape[0], this.tabShape[1], this.tabShape[2], this.tabShape[3]];

      if (this.tabShape[0] || this.tabShape[1] || this.tabShape[2] || this.tabShape[3]) {
        this.decoder.reset();
      }
    }

    /* -----------------------------------------XMM----------------------------------------------- */

  }, {
    key: '_setModel',
    value: function _setModel(model, model1, model2) {
      this.decoder.setModel(model);
      this.modelOK = true;
    }
  }, {
    key: '_processProba',
    value: function _processProba() {
      var probaMax = this.decoder.getProba();
      // //Path
      for (var _i9 = 0; _i9 < this.nbPath; _i9++) {
        this.segmenter[_i9].segmentId = (0, _trunc2.default)(Math.random() * this.qtRandom);
        if (this.tabPath[_i9] != this.oldTabPath[_i9]) {
          this._updateAudioPath(_i9);
        }
        this.oldTabPath[_i9] = this.tabPath[_i9];
      }

      //Shape
      var direct = false;
      var i = 0;
      while (!direct && i < this.nbShape) {
        if (this.tabShape[i]) {
          direct = true;
        }
        i++;
      }

      var actual1 = this.gainOutputDirect.gain.value;
      var actual2 = this.gainOutputGrain.gain.value;

      if (direct != this.old) {
        if (direct) {
          this.gainOutputDirect.gain.cancelScheduledValues(audioContext.currentTime);
          this.gainOutputDirect.gain.setValueAtTime(actual1, audioContext.currentTime);
          this.gainOutputDirect.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + 2);
          this.gainOutputGrain.gain.cancelScheduledValues(audioContext.currentTime);
          this.gainOutputGrain.gain.setValueAtTime(actual1, audioContext.currentTime);
          this.gainOutputGrain.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + 2);
          this.rampShape['shape1'] = 0;
          this.rampShape['shape2'] = 0;
          this.rampShape['shape3'] = 0;
          this.rampShape['shape4'] = 0;
        } else {
          this.gainOutputDirect.gain.cancelScheduledValues(audioContext.currentTime);
          this.gainOutputDirect.gain.setValueAtTime(actual1, audioContext.currentTime);
          this.gainOutputDirect.gain.linearRampToValueAtTime(0, audioContext.currentTime + 2);
          this.gainOutputGrain.gain.cancelScheduledValues(audioContext.currentTime);
          this.gainOutputGrain.gain.setValueAtTime(actual1, audioContext.currentTime);
          this.gainOutputGrain.gain.linearRampToValueAtTime(0, audioContext.currentTime + 2);
        }
      }

      this.old = direct;

      if (direct) {

        for (var _i10 = 0; _i10 < this.nbShape; _i10++) {
          if (probaMax == 'shape1') {
            this.rampShape['shape2']--;
            this.rampShape['shape3']--;
            this.rampShape['shape4']--;
          } else if (probaMax == 'shape2') {
            this.rampShape['shape1']--;
            this.rampShape['shape3']--;
            this.rampShape['shape4']--;
          } else if (probaMax == 'shape3') {
            this.rampShape['shape1']--;
            this.rampShape['shape2']--;
            this.rampShape['shape4']--;
          } else if (probaMax == 'shape4') {
            this.rampShape['shape1']--;
            this.rampShape['shape2']--;
            this.rampShape['shape3']--;
          } else if (probaMax == null) {
            this.rampShape['shape1']--;
            this.rampShape['shape2']--;
            this.rampShape['shape3']--;
            this.rampShape['shape4']--;
          }

          this.rampShape[probaMax]++;

          if (this.rampShape['shape1'] < 0) this.rampShape['shape1'] = 0;
          if (this.rampShape['shape2'] < 0) this.rampShape['shape2'] = 0;
          if (this.rampShape['shape3'] < 0) this.rampShape['shape3'] = 0;
          if (this.rampShape['shape4'] < 0) this.rampShape['shape4'] = 0;
        }
      }

      for (var _i11 = 0; _i11 < this.nbShape; _i11++) {
        this._updateAudioShape(_i11);
      }
    }
  }]);
  return PlayerExperience;
}(soundworks.Experience);

exports.default = PlayerExperience;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlBsYXllckV4cGVyaWVuY2UuanMiXSwibmFtZXMiOlsic291bmR3b3JrcyIsIndhdmVzIiwiYXVkaW9Db250ZXh0Iiwic2NoZWR1bGVyIiwiZ2V0U2NoZWR1bGVyIiwiUGxheWVyVmlldyIsInRlbXBsYXRlIiwiY29udGVudCIsImV2ZW50cyIsIm9wdGlvbnMiLCJWaWV3IiwidmlldyIsIlBsYXllckV4cGVyaWVuY2UiLCJhc3NldHNEb21haW4iLCJwbGF0Zm9ybSIsInJlcXVpcmUiLCJmZWF0dXJlcyIsIm1vdGlvbklucHV0IiwiZGVzY3JpcHRvcnMiLCJsb2FkZXIiLCJmaWxlcyIsImdhaW5PdXRwdXREaXJlY3QiLCJnYWluT3V0cHV0R3JhaW4iLCJncmFpbiIsInN0YXJ0T0siLCJtb2RlbE9LIiwibmJQYXRoIiwibmJTaGFwZSIsInF0UmFuZG9tIiwib2xkIiwibmJTZWdtZW50IiwibGFzdFNlZ21lbnQiLCJsYXN0UG9zaXRpb24iLCJjb3VudDQiLCJtYXhMYWciLCJlbmRTdGFydFNlZ21lbnRlciIsImNvdW50VGltZW91dCIsImRpcmVjdGlvbiIsIm9sZFRhYlBhdGgiLCJjb3VudDEiLCJjb3VudDIiLCJzZWdtZW50ZXIiLCJzZWdtZW50ZXJHYWluIiwic2VnbWVudGVyR2FpbkdyYWluIiwic291cmNlcyIsImdhaW5zIiwiZ2FpbnNEaXJlY3Rpb25zIiwiZ2FpbnNTaGFwZSIsIm9sZFNoYXBlIiwiZ2FpbnNHcmFpblNoYXBlIiwic291bmRTaGFwZSIsInJhbXBTaGFwZSIsImNvdW50TWF4IiwiZGVjb2RlciIsImkiLCJ2aWV3VGVtcGxhdGUiLCJ2aWV3Q29udGVudCIsInZpZXdDdG9yIiwidmlld09wdGlvbnMiLCJwcmVzZXJ2ZVBpeGVsUmF0aW8iLCJjcmVhdGVWaWV3IiwiX3RvTW92ZSIsImJpbmQiLCJfaXNJbkVsbGlwc2UiLCJfaXNJblJlY3QiLCJfaXNJbkxheWVyIiwiX2lzSW5QYXRoIiwiX2lzSW5TaGFwZSIsIl9nZXREaXN0YW5jZU5vZGUiLCJfY3JlYXRlU29ub3JXb3JsZCIsIl91cGRhdGVHYWluIiwiX3JvdGF0ZVBvaW50IiwiX215TGlzdGVuZXIiLCJfYWRkQmFsbCIsIl9hZGRCYWNrZ3JvdW5kIiwiX3NldE1vZGVsIiwiX3Byb2Nlc3NQcm9iYSIsIl9yZXBsYWNlU2hhcGUiLCJfYWRkU2hhcGUiLCJfc3RhcnRTZWdtZW50ZXIiLCJfZmluZE5ld1NlZ21lbnQiLCJfdXBkYXRlU2VnbWVudElmTm90SW4iLCJfdXBkYXRlQXVkaW9QYXRoIiwiX3VwZGF0ZUF1ZGlvc2hhcGUiLCJyZWNlaXZlIiwiZGF0YSIsIm1vZGVsIiwic2hhcGUiLCJ4IiwieSIsImhhc1N0YXJ0ZWQiLCJpbml0Iiwic2hvdyIsImRvY3VtZW50IiwiYm9keSIsInN0eWxlIiwib3ZlcmZsb3ciLCJtaWRkbGVYIiwid2luZG93IiwiaW5uZXJXaWR0aCIsInNjcmVlblNpemVYIiwic2NyZWVuU2l6ZVkiLCJpbm5lckhlaWdodCIsIm1pZGRsZUVjcmFuWCIsIm1pZGRsZUVjcmFuWSIsInNldFRpbWVvdXQiLCJtaWRkbGVZIiwiZWxsaXBzZUxpc3RMYXllciIsImdldEVsZW1lbnRzQnlUYWdOYW1lIiwicmVjdExpc3RMYXllciIsInRvdGFsRWxlbWVudHMiLCJsZW5ndGgiLCJ0ZXh0TGlzdCIsInNoYXBlTGlzdCIsImxpc3RSZWN0UGF0aDEiLCJnZXRFbGVtZW50c0J5Q2xhc3NOYW1lIiwibGlzdFJlY3RQYXRoMiIsImxpc3RSZWN0UGF0aDMiLCJSZWN0TGlzdFNoYXBlMSIsIlJlY3RMaXN0U2hhcGUyIiwiUmVjdExpc3RTaGFwZTMiLCJSZWN0TGlzdFNoYXBlNCIsIm1heENvdW50VXBkYXRlIiwiY291bnRVcGRhdGUiLCJ2aXN1YWxpc2F0aW9uU2hhcGVQYXRoIiwidmlzdWFsaXNhdGlvbkJhbGwiLCIkZWwiLCJxdWVyeVNlbGVjdG9yIiwiZGlzcGxheSIsInZpc3VhbGlzYXRpb25TaGFwZSIsIm1pcnJvckJhbGxYIiwibWlycm9yQmFsbFkiLCJvZmZzZXRYIiwib2Zmc2V0WSIsInN2Z01heFgiLCJnZXRBdHRyaWJ1dGUiLCJzdmdNYXhZIiwidGFiSW5MYXllciIsImlzQXZhaWxhYmxlIiwiYWRkTGlzdGVuZXIiLCJuZXdWYWx1ZXMiLCJ0YWJQYXRoIiwidGFiU2hhcGUiLCJfbW92ZVNjcmVlblRvIiwicHJvY2VzcyIsImNvbnNvbGUiLCJsb2ciLCJlbGVtIiwiY3JlYXRlRWxlbWVudE5TIiwic2V0QXR0cmlidXRlTlMiLCJhcHBlbmRDaGlsZCIsImJhY2tncm91bmQiLCJwYXJzZXIiLCJET01QYXJzZXIiLCJiYWNrZ3JvdW5kWG1sIiwicGFyc2VGcm9tU3RyaW5nIiwiZ2V0RWxlbWVudEJ5SWQiLCJzZXRBdHRyaWJ1dGUiLCJfZGVsZXRlUmVjdFBhdGgiLCJzdGFydCIsInRhYiIsInNoYXBlWG1sIiwiYmFsbCIsInNoYXBlWG1sVGFiIiwiY2hpbGROb2RlcyIsIm5vZGVOYW1lIiwibmV3Tm9kZSIsIkJhbGwiLCJwYXJlbnROb2RlIiwiaW5zZXJ0QmVmb3JlIiwidmFsdWVYIiwidmFsdWVZIiwib2JqIiwibmV3WCIsIm5ld1kiLCJhY3R1IiwiZm9yY2UiLCJkaXN0YW5jZVgiLCJuZWdYIiwiaW5kaWNlUG93WCIsImluZGljZVBvd1kiLCJNYXRoIiwicG93IiwiYWJzIiwiZGlzdGFuY2VZIiwibmVnWSIsInNjcm9sbCIsInRpbWUiLCJuZXdMaXN0IiwiZWxlbWVudE5hbWUiLCJpbm5lckhUTUwiLCJzbGljZSIsInNoYXBlTmFtZSIsInNlbmQiLCJwYXJlbnQiLCJyZW1vdmVDaGlsZCIsImVsZW1zIiwicm90YXRlQW5nbGUiLCJtaWRkbGVSb3RhdGVYIiwibWlkZGxlUm90YXRlWSIsInJhZGl1c1giLCJyYWRpdXNZIiwidHJhbnNmb3JtIiwidGVzdCIsInBhcnNlRmxvYXQiLCJzcGxpdCIsInJlcGxhY2UiLCJoZWlnaHQiLCJ3aWR0aCIsImxlZnQiLCJ0b3AiLCJwYXRoMSIsInBhdGgyIiwicGF0aDMiLCJzaGFwZTEiLCJzaGFwZTIiLCJzaGFwZTMiLCJzaGFwZTQiLCJwb2ludFgiLCJwb2ludFkiLCJuZXdQb2ludCIsInBhcnNlSW50IiwiYSIsImIiLCJjYWxjIiwiYW5nbGUiLCJuZXdBbmdsZSIsImNvcyIsInNpbiIsImFkZCIsImNvbm5lY3QiLCJkZXN0aW5hdGlvbiIsImJ1ZmZlckFzc29jaWVzIiwibWFya2VyQXNzb2NpZXMiLCJpZEJ1ZmZlciIsImlkTWFya2VyIiwiU2VnbWVudEVuZ2luZSIsImJ1ZmZlciIsImJ1ZmZlcnMiLCJwb3NpdGlvbkFycmF5IiwiZHVyYXRpb25BcnJheSIsImR1cmF0aW9uIiwicGVyaW9kQWJzIiwicGVyaW9kUmVsIiwiY3JlYXRlR2FpbiIsImdhaW4iLCJzZXRWYWx1ZUF0VGltZSIsImN1cnJlbnRUaW1lIiwiaW5wdXQiLCJ2YWx1ZSIsImNyZWF0ZUJ1ZmZlclNvdXJjZSIsImxvb3AiLCJ0cmlnZ2VyIiwibmV3UGVyaW9kIiwic2VnbWVudElkIiwiYWN0dWFsIiwiY2FuY2VsU2NoZWR1bGVkVmFsdWVzIiwibGluZWFyUmFtcFRvVmFsdWVBdFRpbWUiLCJhY3R1YWwxIiwiYWN0dWFsMiIsImlkIiwiZ2FpbkdyYWluIiwiZ2FpbkRpcmVjdCIsImdhaW5EaXJlYyIsInJlc2V0IiwibW9kZWwxIiwibW9kZWwyIiwic2V0TW9kZWwiLCJwcm9iYU1heCIsImdldFByb2JhIiwicmFuZG9tIiwiZGlyZWN0IiwiX3VwZGF0ZUF1ZGlvU2hhcGUiLCJFeHBlcmllbmNlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7O0lBQVlBLFU7O0FBQ1o7Ozs7QUFDQTs7SUFBWUMsSzs7QUFDWjs7Ozs7Ozs7QUFFQSxJQUFNQyxlQUFlRixXQUFXRSxZQUFoQztBQUNBLElBQU1DLFlBQVlGLE1BQU1HLFlBQU4sRUFBbEI7O0lBRU1DLFU7OztBQUNKLHNCQUFZQyxRQUFaLEVBQXNCQyxPQUF0QixFQUErQkMsTUFBL0IsRUFBdUNDLE9BQXZDLEVBQWdEO0FBQUE7QUFBQSx5SUFDeENILFFBRHdDLEVBQzlCQyxPQUQ4QixF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QUF3QjtBQUM1QixpQkFBS3pOLFNBQUwsQ0FBZSxRQUFmO0FBQ0EsaUJBQUtBLFNBQUwsQ0FBZSxRQUFmO0FBQ0EsaUJBQUtBLFNBQUwsQ0FBZSxRQUFmO0FBQ0QsV0FKSyxNQUlBLElBQUd5TixZQUFZLElBQWYsRUFBb0I7QUFDeEIsaUJBQUt6TixTQUFMLENBQWUsUUFBZjtBQUNBLGlCQUFLQSxTQUFMLENBQWUsUUFBZjtBQUNBLGlCQUFLQSxTQUFMLENBQWUsUUFBZjtBQUNBLGlCQUFLQSxTQUFMLENBQWUsUUFBZjtBQUNEOztBQUVELGVBQUtBLFNBQUwsQ0FBZXlOLFFBQWY7O0FBRUEsY0FBRyxLQUFLek4sU0FBTCxDQUFlLFFBQWYsSUFBMkIsQ0FBOUIsRUFBaUMsS0FBS0EsU0FBTCxDQUFlLFFBQWYsSUFBMkIsQ0FBM0I7QUFDakMsY0FBRyxLQUFLQSxTQUFMLENBQWUsUUFBZixJQUEyQixDQUE5QixFQUFpQyxLQUFLQSxTQUFMLENBQWUsUUFBZixJQUEyQixDQUEzQjtBQUNqQyxjQUFHLEtBQUtBLFNBQUwsQ0FBZSxRQUFmLElBQTJCLENBQTlCLEVBQWlDLEtBQUtBLFNBQUwsQ0FBZSxRQUFmLElBQTJCLENBQTNCO0FBQ2pDLGNBQUcsS0FBS0EsU0FBTCxDQUFlLFFBQWYsSUFBMkIsQ0FBOUIsRUFBaUMsS0FBS0EsU0FBTCxDQUFlLFFBQWYsSUFBMkIsQ0FBM0I7QUFDbEM7QUFFRjs7QUFFRCxXQUFJLElBQUlHLE9BQUksQ0FBWixFQUFnQkEsT0FBSSxLQUFLM0IsT0FBekIsRUFBbUMyQixNQUFuQyxFQUF1QztBQUNyQyxhQUFLME4saUJBQUwsQ0FBdUIxTixJQUF2QjtBQUNEO0FBRUY7OztFQXA3QjJDdEQsV0FBV2lSLFU7O2tCQUFwQ3JRLGdCIiwiZmlsZSI6IlBsYXllckV4cGVyaWVuY2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBzb3VuZHdvcmtzIGZyb20gJ3NvdW5kd29ya3MvY2xpZW50JztcbmltcG9ydCBNeUdyYWluIGZyb20gJy4vTXlHcmFpbi5qcyc7XG5pbXBvcnQgKiBhcyB3YXZlcyBmcm9tICd3YXZlcy1hdWRpbyc7XG5pbXBvcnQgRGVjb2RlciBmcm9tICcuL0RlY29kZXIuanMnO1xuXG5jb25zdCBhdWRpb0NvbnRleHQgPSBzb3VuZHdvcmtzLmF1ZGlvQ29udGV4dDtcbmNvbnN0IHNjaGVkdWxlciA9IHdhdmVzLmdldFNjaGVkdWxlcigpO1xuXG5jbGFzcyBQbGF5ZXJWaWV3IGV4dGVuZHMgc291bmR3b3Jrcy5WaWV3e1xuICBjb25zdHJ1Y3Rvcih0ZW1wbGF0ZSwgY29udGVudCwgZXZlbnRzLCBvcHRpb25zKSB7XG4gICAgc3VwZXIodGVtcGxhdGUsIGNvbnRlbnQsIGV2ZW50cywgb3B0aW9ucyk7XG4gIH1cbn1cblxuY29uc3Qgdmlldz0gYGA7XG5cbi8vIHRoaXMgZXhwZXJpZW5jZSBwbGF5cyBhIHNvdW5kIHdoZW4gaXQgc3RhcnRzLCBhbmQgcGxheXMgYW5vdGhlciBzb3VuZCB3aGVuXG4vLyBvdGhlciBjbGllbnRzIGpvaW4gdGhlIGV4cGVyaWVuY2VcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBsYXllckV4cGVyaWVuY2UgZXh0ZW5kcyBzb3VuZHdvcmtzLkV4cGVyaWVuY2Uge1xuICBjb25zdHJ1Y3Rvcihhc3NldHNEb21haW4pIHtcbiAgICBzdXBlcigpO1xuICAgIC8vU2VydmljZXNcbiAgICB0aGlzLnBsYXRmb3JtID0gdGhpcy5yZXF1aXJlKCdwbGF0Zm9ybScsIHsgZmVhdHVyZXM6IFsnd2ViLWF1ZGlvJywgJ3dha2UtbG9jayddIH0pO1xuICAgIHRoaXMubW90aW9uSW5wdXQgPSB0aGlzLnJlcXVpcmUoJ21vdGlvbi1pbnB1dCcsIHsgZGVzY3JpcHRvcnM6IFsnb3JpZW50YXRpb24nXSB9KTtcbiAgICB0aGlzLmxvYWRlciA9IHRoaXMucmVxdWlyZSgnbG9hZGVyJywgeyBcbiAgICAgIGZpbGVzOiBbJ3NvdW5kcy9uYXBwZS9nYWRvdWUubXAzJywgICAgLy8wXG4gICAgICAgICAgICAgICdzb3VuZHMvbmFwcGUvZ2Fkb3VlLm1wMycsICAgIC8vMVxuICAgICAgICAgICAgICBcInNvdW5kcy9uYXBwZS9uYWdlLm1wM1wiLCAgICAgIC8vIC4uLlxuICAgICAgICAgICAgICBcInNvdW5kcy9uYXBwZS90ZW1wZXRlLm1wM1wiLFxuICAgICAgICAgICAgICBcInNvdW5kcy9uYXBwZS92ZW50Lm1wM1wiLFxuICAgICAgICAgICAgICBcInNvdW5kcy9wYXRoL2NhbXVzQy5tcDNcIiwgICAvLyA1ICBcbiAgICAgICAgICAgICAgXCJtYXJrZXJzL2NhbXVzLmpzb25cIiwgXG4gICAgICAgICAgICAgIFwic291bmRzL3BhdGgvY2h1cmNoaWxsQy5tcDNcIiwgICAgXG4gICAgICAgICAgICAgIFwibWFya2Vycy9jaHVyY2hpbGwuanNvblwiLFxuICAgICAgICAgICAgICBcInNvdW5kcy9wYXRoL2lyYWtDLm1wM1wiLCAgIFxuICAgICAgICAgICAgICBcIm1hcmtlcnMvaXJhay5qc29uXCIsICAgICAgICAgIC8vMTAgIFxuICAgICAgICAgICAgICBcInNvdW5kcy9zaGFwZS9lbWluZW0ubXAzXCIsXG4gICAgICAgICAgICAgIFwic291bmRzL3NoYXBlL3RydW1wLm1wM1wiLFxuICAgICAgICAgICAgICBcInNvdW5kcy9zaGFwZS9mci5tcDNcIixcbiAgICAgICAgICAgICAgXCJzb3VuZHMvc2hhcGUvYnJleGl0Lm1wM1wiXVxuICAgIH0pO1xuXG4gICAgLy9wYXJhbXNcbiAgICB0aGlzLmdhaW5PdXRwdXREaXJlY3Q7XG4gICAgdGhpcy5nYWluT3V0cHV0R3JhaW47XG4gICAgdGhpcy5ncmFpbjtcbiAgICB0aGlzLnN0YXJ0T0sgPSBmYWxzZTtcbiAgICB0aGlzLm1vZGVsT0sgPSBmYWxzZTtcbiAgICB0aGlzLm5iUGF0aCA9IDM7XG4gICAgdGhpcy5uYlNoYXBlID0gNDtcbiAgICB0aGlzLnF0UmFuZG9tID0gMTQwO1xuICAgIHRoaXMub2xkID0gZmFsc2U7XG4gICAgdGhpcy5uYlNlZ21lbnQgPSBbMjMyLCAxNDQsIDEwNl07XG4gICAgdGhpcy5sYXN0U2VnbWVudCA9IFswLCAwLCAwXTtcbiAgICB0aGlzLmxhc3RQb3NpdGlvbiA9IFswLCAwLCAwXTtcbiAgICB0aGlzLmNvdW50NCA9IDEwO1xuICAgIHRoaXMubWF4TGFnID0gMTA7XG4gICAgdGhpcy5lbmRTdGFydFNlZ21lbnRlciA9IFtdO1xuICAgIHRoaXMuY291bnRUaW1lb3V0ID0gW107XG4gICAgdGhpcy5kaXJlY3Rpb24gPSBbXTtcbiAgICB0aGlzLm9sZFRhYlBhdGggPSBbXTtcbiAgICB0aGlzLmNvdW50MSA9IFtdO1xuICAgIHRoaXMuY291bnQyID0gW107XG4gICAgdGhpcy5zZWdtZW50ZXIgPSBbXTtcbiAgICB0aGlzLnNlZ21lbnRlckdhaW4gPSBbXTtcbiAgICB0aGlzLnNlZ21lbnRlckdhaW5HcmFpbiA9IFtdO1xuICAgIHRoaXMuc291cmNlcyA9IFtdO1xuICAgIHRoaXMuZ2FpbnMgPSBbXTtcbiAgICB0aGlzLmdhaW5zRGlyZWN0aW9ucyA9IFtdO1xuICAgIHRoaXMuZ2FpbnNTaGFwZSA9IFtdO1xuICAgIHRoaXMub2xkU2hhcGUgPSBbZmFsc2UsIGZhbHNlLCBmYWxzZSwgZmFsc2VdO1xuICAgIHRoaXMuZ2FpbnNHcmFpblNoYXBlID0gW107XG4gICAgdGhpcy5zb3VuZFNoYXBlID0gW107XG4gICAgdGhpcy5yYW1wU2hhcGUgPSB7J3NoYXBlMSc6IDAsICdzaGFwZTInOiAwLCAnc2hhcGUzJzogMCwgJ3NoYXBlNCc6IDB9O1xuICAgIHRoaXMuY291bnRNYXggPSAxMDA7XG5cbiAgICAvL1hNTVxuICAgICAgdGhpcy5kZWNvZGVyID0gbmV3IERlY29kZXIoKTtcblxuICAgIGZvcihsZXQgaSA9IDA7IGkgPCB0aGlzLm5iUGF0aDsgaSsrKXtcbiAgICAgIHRoaXMuY291bnQxW2ldID0gMjA7XG4gICAgICB0aGlzLmNvdW50MltpXSA9IDIwO1xuICAgICAgdGhpcy5jb3VudFRpbWVvdXRbaV0gPSAwO1xuICAgICAgdGhpcy5kaXJlY3Rpb25baV0gPSB0cnVlO1xuICAgICAgdGhpcy5vbGRUYWJQYXRoW2ldID0gdHJ1ZTtcbiAgICAgIHRoaXMuZW5kU3RhcnRTZWdtZW50ZXJbaV0gPSBmYWxzZTtcbiAgICB9XG5cbiAgfVxuXG4gIGluaXQoKSB7XG4gICAgLy8gaW5pdGlhbGl6ZSB0aGUgdmlld1xuICAgIHRoaXMudmlld1RlbXBsYXRlID0gdmlldztcbiAgICB0aGlzLnZpZXdDb250ZW50ID0ge307XG4gICAgdGhpcy52aWV3Q3RvciA9IFBsYXllclZpZXc7XG4gICAgdGhpcy52aWV3T3B0aW9ucyA9IHsgcHJlc2VydmVQaXhlbFJhdGlvOiB0cnVlIH07XG4gICAgdGhpcy52aWV3ID0gdGhpcy5jcmVhdGVWaWV3KCk7XG5cbiAgICAvL2JpbmRcbiAgICB0aGlzLl90b01vdmUgPSB0aGlzLl90b01vdmUuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9pc0luRWxsaXBzZSA9IHRoaXMuX2lzSW5FbGxpcHNlLmJpbmQodGhpcyk7XG4gICAgdGhpcy5faXNJblJlY3QgPSB0aGlzLl9pc0luUmVjdC5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX2lzSW5MYXllciA9IHRoaXMuX2lzSW5MYXllci5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX2lzSW5QYXRoID0gdGhpcy5faXNJblBhdGguYmluZCh0aGlzKTtcbiAgICB0aGlzLl9pc0luU2hhcGUgPSB0aGlzLl9pc0luU2hhcGUuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9nZXREaXN0YW5jZU5vZGUgPSB0aGlzLl9nZXREaXN0YW5jZU5vZGUuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9jcmVhdGVTb25vcldvcmxkID0gdGhpcy5fY3JlYXRlU29ub3JXb3JsZC5iaW5kKHRoaXMpOyAgICBcbiAgICB0aGlzLl91cGRhdGVHYWluID0gdGhpcy5fdXBkYXRlR2Fpbi5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX3JvdGF0ZVBvaW50ID0gdGhpcy5fcm90YXRlUG9pbnQuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9teUxpc3RlbmVyPSB0aGlzLl9teUxpc3RlbmVyLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fYWRkQmFsbCA9IHRoaXMuX2FkZEJhbGwuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9hZGRCYWNrZ3JvdW5kID0gdGhpcy5fYWRkQmFja2dyb3VuZC5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX3NldE1vZGVsID0gdGhpcy5fc2V0TW9kZWwuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9wcm9jZXNzUHJvYmEgPSB0aGlzLl9wcm9jZXNzUHJvYmEuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9yZXBsYWNlU2hhcGUgPSB0aGlzLl9yZXBsYWNlU2hhcGUuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9hZGRTaGFwZSA9IHRoaXMuX2FkZFNoYXBlLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fc3RhcnRTZWdtZW50ZXIgPSB0aGlzLl9zdGFydFNlZ21lbnRlci5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX2ZpbmROZXdTZWdtZW50ID0gdGhpcy5fZmluZE5ld1NlZ21lbnQuYmluZCh0aGlzKTtcbiAgICB0aGlzLl91cGRhdGVTZWdtZW50SWZOb3RJbiA9IHRoaXMuX3VwZGF0ZVNlZ21lbnRJZk5vdEluLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fdXBkYXRlQXVkaW9QYXRoID0gdGhpcy5fdXBkYXRlQXVkaW9QYXRoLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fdXBkYXRlQXVkaW9zaGFwZSA9IHRoaXMuX3VwZGF0ZUF1ZGlvc2hhcGUuYmluZCh0aGlzKTtcblxuICAgIC8vcmVjZWl2ZXNcbiAgICB0aGlzLnJlY2VpdmUoJ2JhY2tncm91bmQnLChkYXRhKT0+dGhpcy5fYWRkQmFja2dyb3VuZChkYXRhKSk7XG4gICAgdGhpcy5yZWNlaXZlKCAnbW9kZWwnLChtb2RlbCk9PnRoaXMuX3NldE1vZGVsKG1vZGVsKSApO1xuICAgIHRoaXMucmVjZWl2ZSgnc2hhcGVBbnN3ZXInLChzaGFwZSwgeCwgeSk9PnRoaXMuX2FkZFNoYXBlKHNoYXBlLCB4LCB5KSk7XG5cbiB9XG5cbiAgc3RhcnQoKSB7XG4gICAgaWYoIXRoaXMuc3RhcnRPSyl7XG4gICAgICBzdXBlci5zdGFydCgpOyAvLyBkb24ndCBmb3JnZXQgdGhpc1xuICAgICAgaWYgKCF0aGlzLmhhc1N0YXJ0ZWQpXG4gICAgICAgIHRoaXMuaW5pdCgpO1xuICAgICAgdGhpcy5zaG93KCk7XG4gICAgfWVsc2V7XG5cbiAgICAgIC8vcGFyYW1zXG4gICAgICBkb2N1bWVudC5ib2R5LnN0eWxlLm92ZXJmbG93ID0gXCJoaWRkZW5cIjsgIFxuICAgICAgdGhpcy5taWRkbGVYID0gd2luZG93LmlubmVyV2lkdGggLyAyO1xuICAgICAgdGhpcy5zY3JlZW5TaXplWCA9IHdpbmRvdy5pbm5lcldpZHRoO1xuICAgICAgdGhpcy5zY3JlZW5TaXplWSA9IHdpbmRvdy5pbm5lckhlaWdodDtcbiAgICAgIHRoaXMubWlkZGxlRWNyYW5YID0gdGhpcy5zY3JlZW5TaXplWCAvIDI7XG4gICAgICB0aGlzLm1pZGRsZUVjcmFuWSA9IHRoaXMuc2NyZWVuU2l6ZVkgLyAyO1xuICAgICAgc2V0VGltZW91dCggKCkgPT57dGhpcy5fbXlMaXN0ZW5lcigxMDApO30gLCAxMDApO1xuICAgICAgdGhpcy5taWRkbGVZID0gd2luZG93LmlubmVySGVpZ2h0IC8gMjtcbiAgICAgIHRoaXMuZWxsaXBzZUxpc3RMYXllciA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdlbGxpcHNlJyk7XG4gICAgICB0aGlzLnJlY3RMaXN0TGF5ZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgncmVjdCcpO1xuICAgICAgdGhpcy50b3RhbEVsZW1lbnRzID0gdGhpcy5lbGxpcHNlTGlzdExheWVyLmxlbmd0aCArIHRoaXMucmVjdExpc3RMYXllci5sZW5ndGg7XG4gICAgICB0aGlzLnRleHRMaXN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3RleHQnKTtcbiAgICAgIHRoaXMuc2hhcGVMaXN0ID0gW107XG4gICAgICB0aGlzLmxpc3RSZWN0UGF0aDEgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdwYXRoMCcpO1xuICAgICAgdGhpcy5saXN0UmVjdFBhdGgyID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgncGF0aDEnKTtcbiAgICAgIHRoaXMubGlzdFJlY3RQYXRoMyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ3BhdGgyJyk7XG4gICAgICB0aGlzLlJlY3RMaXN0U2hhcGUxID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnc2hhcGUxJyk7XG4gICAgICB0aGlzLlJlY3RMaXN0U2hhcGUyID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnc2hhcGUyJyk7XG4gICAgICB0aGlzLlJlY3RMaXN0U2hhcGUzID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnc2hhcGUzJyk7XG4gICAgICB0aGlzLlJlY3RMaXN0U2hhcGU0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnc2hhcGU0Jyk7XG5cbiAgICAgIHRoaXMuX2FkZEJhbGwoMTAsIDEwKTtcbiAgICAgIHRoaXMuX3JlcGxhY2VTaGFwZSgpOyBcbiAgICAgIHRoaXMuX2NyZWF0ZVNvbm9yV29ybGQoKTtcblxuICAgICAgdGhpcy5tYXhDb3VudFVwZGF0ZSA9IDI7XG4gICAgICB0aGlzLmNvdW50VXBkYXRlID0gdGhpcy5tYXhDb3VudFVwZGF0ZSArIDE7IFxuICAgICAgdGhpcy52aXN1YWxpc2F0aW9uU2hhcGVQYXRoID0gZmFsc2U7XG4gICAgICB0aGlzLnZpc3VhbGlzYXRpb25CYWxsID0gdHJ1ZTsgXG4gICAgICBpZighdGhpcy52aXN1YWxpc2F0aW9uQmFsbCl7XG4gICAgICAgIHRoaXMudmlldy4kZWwucXVlcnlTZWxlY3RvcignI2JhbGwnKS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgfVxuICAgICAgdGhpcy52aXN1YWxpc2F0aW9uU2hhcGUgPSBmYWxzZTtcbiAgICAgIGlmKCF0aGlzLnZpc3VhbGlzYXRpb25TaGFwZSl7XG4gICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCB0aGlzLmVsbGlwc2VMaXN0TGF5ZXIubGVuZ3RoOyBpKyspe1xuICAgICAgICAgIHRoaXMuZWxsaXBzZUxpc3RMYXllcltpXS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICB9XG4gICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCB0aGlzLnJlY3RMaXN0TGF5ZXIubGVuZ3RoOyBpKyspe1xuICAgICAgICAgIHRoaXMucmVjdExpc3RMYXllcltpXS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICB9XG4gICAgICB9IFxuXG4gICAgICB0aGlzLm1pcnJvckJhbGxYID0gMTA7XG4gICAgICB0aGlzLm1pcnJvckJhbGxZID0gMTA7XG4gICAgICB0aGlzLm9mZnNldFggPSAwOyBcbiAgICAgIHRoaXMub2Zmc2V0WSA9IDA7XG4gICAgICB0aGlzLnN2Z01heFggPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnc3ZnJylbMF0uZ2V0QXR0cmlidXRlKCd3aWR0aCcpO1xuICAgICAgdGhpcy5zdmdNYXhZID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3N2ZycpWzBdLmdldEF0dHJpYnV0ZSgnaGVpZ2h0Jyk7XG5cbiAgICAgIHRoaXMudGFiSW5MYXllcjtcbiAgICAgIGlmICh0aGlzLm1vdGlvbklucHV0LmlzQXZhaWxhYmxlKCdvcmllbnRhdGlvbicpKSB7XG4gICAgICAgIHRoaXMubW90aW9uSW5wdXQuYWRkTGlzdGVuZXIoJ29yaWVudGF0aW9uJywgKGRhdGEpID0+IHtcbiAgICAgICAgICBjb25zdCBuZXdWYWx1ZXMgPSB0aGlzLl90b01vdmUoZGF0YVsyXSxkYXRhWzFdIC0gMjUpO1xuICAgICAgICAgIGlmKHRoaXMuY291bnQ0ID4gdGhpcy5tYXhMYWcpe1xuICAgICAgICAgICAgdGhpcy50YWJJbkxheWVyID0gdGhpcy5faXNJbkxheWVyKG5ld1ZhbHVlc1swXSwgbmV3VmFsdWVzWzFdKTtcbiAgICAgICAgICAgIHRoaXMudGFiUGF0aCA9IHRoaXMuX2lzSW5QYXRoKG5ld1ZhbHVlc1swXSwgbmV3VmFsdWVzWzFdKTtcbiAgICAgICAgICAgIHRoaXMudGFiU2hhcGUgPSB0aGlzLl9pc0luU2hhcGUobmV3VmFsdWVzWzBdLCBuZXdWYWx1ZXNbMV0pO1xuICAgICAgICAgICAgdGhpcy5jb3VudDQgPSAtMTtcbiAgICAgICAgICAgIGlmKHRoaXMuY291bnRVcGRhdGUgPiB0aGlzLm1heENvdW50VXBkYXRlKXtcbiAgICAgICAgICAgICAgdGhpcy5fdXBkYXRlR2Fpbih0aGlzLnRhYkluTGF5ZXIpO1xuICAgICAgICAgICAgICB0aGlzLmNvdW50VXBkYXRlID0gMDtcbiAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICB0aGlzLmNvdW50VXBkYXRlKys7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdGhpcy5jb3VudDQrKztcbiAgICAgICAgICBcbiAgICAgICAgICB0aGlzLl9tb3ZlU2NyZWVuVG8obmV3VmFsdWVzWzBdLCBuZXdWYWx1ZXNbMV0sIDAuMDgpO1xuXG4gICAgICAgICAgLy8gWE1NXG4gICAgICAgICAgaWYodGhpcy5tb2RlbE9LKXtcbiAgICAgICAgICAgIHRoaXMuZGVjb2Rlci5wcm9jZXNzKG5ld1ZhbHVlc1swXSwgbmV3VmFsdWVzWzFdKTtcbiAgICAgICAgICAgIHRoaXMuX3Byb2Nlc3NQcm9iYSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZyhcIk9yaWVudGF0aW9uIG5vbiBkaXNwb25pYmxlXCIpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIF9hZGRCYWxsKHgseSl7XG4gICAgY29uc3QgZWxlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUygnaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnLCdjaXJjbGUnKTtcbiAgICBlbGVtLnNldEF0dHJpYnV0ZU5TKG51bGwsXCJjeFwiLHgpO1xuICAgIGVsZW0uc2V0QXR0cmlidXRlTlMobnVsbCxcImN5XCIseSk7XG4gICAgZWxlbS5zZXRBdHRyaWJ1dGVOUyhudWxsLFwiclwiLDEwKTtcbiAgICBlbGVtLnNldEF0dHJpYnV0ZU5TKG51bGwsXCJzdHJva2VcIiwnd2hpdGUnKTtcbiAgICBlbGVtLnNldEF0dHJpYnV0ZU5TKG51bGwsXCJzdHJva2Utd2lkdGhcIiwzKTtcbiAgICBlbGVtLnNldEF0dHJpYnV0ZU5TKG51bGwsXCJmaWxsXCIsJ2JsYWNrJyk7XG4gICAgZWxlbS5zZXRBdHRyaWJ1dGVOUyhudWxsLFwiaWRcIiwnQmFsbCcpO1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzdmcnKVswXS5hcHBlbmRDaGlsZChlbGVtKTtcbiAgfVxuXG4gIF9hZGRCYWNrZ3JvdW5kKGJhY2tncm91bmQpe1xuICAgIGNvbnN0IHBhcnNlciA9IG5ldyBET01QYXJzZXIoKTtcbiAgICBsZXQgYmFja2dyb3VuZFhtbCA9IHBhcnNlci5wYXJzZUZyb21TdHJpbmcoYmFja2dyb3VuZCwgJ2FwcGxpY2F0aW9uL3htbCcpO1xuICAgIGJhY2tncm91bmRYbWwgPSBiYWNrZ3JvdW5kWG1sLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzdmcnKVswXTtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZXhwZXJpZW5jZScpLmFwcGVuZENoaWxkKGJhY2tncm91bmRYbWwpO1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzdmcnKVswXS5zZXRBdHRyaWJ1dGUoJ2lkJywgJ3N2Z0VsZW1lbnQnKVxuICAgIHRoaXMuX2RlbGV0ZVJlY3RQYXRoKCk7XG4gICAgdGhpcy5zdGFydE9LID0gdHJ1ZTtcbiAgICB0aGlzLnN0YXJ0KCk7XG4gIH1cblxuICBfZGVsZXRlUmVjdFBhdGgoKXtcbiAgICBsZXQgdGFiID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgncGF0aDAnKTtcbiAgICBpZighdGhpcy52aXN1YWxpc2F0aW9uU2hhcGVQYXRoKXtcbiAgICAgIGZvcihsZXQgaSA9IDAgOyBpIDwgdGFiLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgdGFiW2ldLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICB9XG5cbiAgICAgIHRhYiA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ3BhdGgxJyk7XG4gICAgICBmb3IobGV0IGkgPSAwIDsgaSA8IHRhYi5sZW5ndGg7IGkrKyl7XG4gICAgICAgIHRhYltpXS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgfVxuXG4gICAgICB0YWIgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdwYXRoMicpO1xuICAgICAgZm9yKGxldCBpID0gMCA7aSA8IHRhYi5sZW5ndGg7IGkrKyl7XG4gICAgICAgIHRhYltpXS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIF9hZGRTaGFwZShzaGFwZSwgeCwgeSl7XG4gICAgY29uc3QgcGFyc2VyID0gbmV3IERPTVBhcnNlcigpO1xuICAgIGxldCBzaGFwZVhtbCA9IHBhcnNlci5wYXJzZUZyb21TdHJpbmcoc2hhcGUsJ2FwcGxpY2F0aW9uL3htbCcpO1xuICAgIHNoYXBlWG1sID0gc2hhcGVYbWwuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2cnKVswXTtcbiAgICBsZXQgYmFsbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdiYWxsJyk7XG4gICAgY29uc3Qgc2hhcGVYbWxUYWIgPSBzaGFwZVhtbC5jaGlsZE5vZGVzO1xuICAgIGZvcihsZXQgaSA9IDA7IGkgPCBzaGFwZVhtbFRhYi5sZW5ndGg7IGkrKyl7XG4gICAgICBpZihzaGFwZVhtbFRhYltpXS5ub2RlTmFtZSA9PSAncGF0aCcpe1xuICAgICAgICBjb25zdCBuZXdOb2RlID0gQmFsbC5wYXJlbnROb2RlLmluc2VydEJlZm9yZShzaGFwZVhtbFRhYltpXSwgYmFsbCk7XG4gICAgICAgIHRoaXMuc2hhcGVMaXN0W3RoaXMuc2hhcGVMaXN0Lmxlbmd0aF0gPSBuZXdOb2RlLnNldEF0dHJpYnV0ZSgndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgnICsgeCArICcgJyArIHkgKyAnKScpO1xuICAgICAgfVxuICAgIH0gXG4gIH1cblxuICBfdG9Nb3ZlKHZhbHVlWCwgdmFsdWVZKXtcbiAgICBjb25zdCBvYmogPSB0aGlzLnZpZXcuJGVsLnF1ZXJ5U2VsZWN0b3IoJyNiYWxsJyk7XG4gICAgbGV0IG5ld1g7XG4gICAgbGV0IG5ld1k7XG4gICAgbGV0IGFjdHUgPSB0aGlzLm1pcnJvckJhbGxYICsgdmFsdWVYICogMC4zO1xuICAgIGlmKGFjdHUgPCB0aGlzLm9mZnNldFgpe1xuICAgICAgYWN0dSA9IHRoaXMub2Zmc2V0WCA7XG4gICAgfWVsc2UgaWYoYWN0dSA+ICh0aGlzLnNjcmVlblNpemVYICsgdGhpcy5vZmZzZXRYKSl7XG4gICAgICBhY3R1ID0gdGhpcy5zY3JlZW5TaXplWCArIHRoaXMub2Zmc2V0WFxuICAgIH1cbiAgICBpZih0aGlzLnZpc3VhbGlzYXRpb25CYWxsKXtcbiAgICAgIG9iai5zZXRBdHRyaWJ1dGUoJ2N4JywgYWN0dSk7XG4gICAgfVxuICAgIHRoaXMubWlycm9yQmFsbFggPSBhY3R1O1xuICAgIG5ld1ggPSBhY3R1O1xuICAgIGFjdHUgPSB0aGlzLm1pcnJvckJhbGxZICsgdmFsdWVZICogMC4zO1xuICAgIGlmKGFjdHUgPCAodGhpcy5vZmZzZXRZKSl7XG4gICAgICBhY3R1ID0gdGhpcy5vZmZzZXRZO1xuICAgIH1cbiAgICBpZihhY3R1ID4gKHRoaXMuc2NyZWVuU2l6ZVkgKyB0aGlzLm9mZnNldFkpKXtcbiAgICAgIGFjdHUgPSB0aGlzLnNjcmVlblNpemVZICsgdGhpcy5vZmZzZXRZO1xuICAgIH1cbiAgICBpZih0aGlzLnZpc3VhbGlzYXRpb25CYWxsKXtcbiAgICAgIG9iai5zZXRBdHRyaWJ1dGUoJ2N5JywgYWN0dSk7XG4gICAgfVxuICAgIHRoaXMubWlycm9yQmFsbFkgPSBhY3R1O1xuICAgIG5ld1kgPSBhY3R1O1xuICAgIHJldHVybiBbbmV3WCwgbmV3WV07XG4gIH1cblxuICBfbW92ZVNjcmVlblRvKHgsIHksIGZvcmNlPTEpe1xuICAgIGxldCBkaXN0YW5jZVggPSAoeCAtIHRoaXMub2Zmc2V0WCkgLSB0aGlzLm1pZGRsZUVjcmFuWDtcbiAgICBsZXQgbmVnWCA9IGZhbHNlO1xuICAgIGxldCBpbmRpY2VQb3dYID0gMztcbiAgICBsZXQgaW5kaWNlUG93WSA9IDM7XG4gICAgaWYoZGlzdGFuY2VYIDwgMCl7XG4gICAgICBuZWdYID0gdHJ1ZTtcbiAgICB9XG4gICAgZGlzdGFuY2VYID0gTWF0aC5wb3coKE1hdGguYWJzKGRpc3RhbmNlWCAvIHRoaXMubWlkZGxlRWNyYW5YKSksIGluZGljZVBvd1gpICogdGhpcy5taWRkbGVFY3Jhblg7IFxuICAgIGlmKG5lZ1gpe1xuICAgICAgZGlzdGFuY2VYICo9IC0xO1xuICAgIH1cbiAgICBpZih0aGlzLm9mZnNldFggKyAoZGlzdGFuY2VYICogZm9yY2UpID49IDAgJiYgKHRoaXMub2Zmc2V0WCArIChkaXN0YW5jZVggKiBmb3JjZSkgPD0gdGhpcy5zdmdNYXhYIC0gdGhpcy5zY3JlZW5TaXplWCkpe1xuICAgICAgdGhpcy5vZmZzZXRYICs9IChkaXN0YW5jZVggKiBmb3JjZSk7XG4gICAgfVxuXG4gICAgbGV0IGRpc3RhbmNlWSA9ICh5IC0gdGhpcy5vZmZzZXRZKSAtIHRoaXMubWlkZGxlRWNyYW5ZO1xuICAgIGxldCBuZWdZID0gZmFsc2U7XG4gICAgaWYoZGlzdGFuY2VZIDwgMCl7XG4gICAgICBuZWdZID0gdHJ1ZTtcbiAgICB9XG4gICAgZGlzdGFuY2VZID0gTWF0aC5wb3coKE1hdGguYWJzKGRpc3RhbmNlWSAvIHRoaXMubWlkZGxlRWNyYW5ZKSksIGluZGljZVBvd1kpICogdGhpcy5taWRkbGVFY3Jhblk7XG4gICAgaWYobmVnWSl7XG4gICAgICBkaXN0YW5jZVkgKj0gLTE7XG4gICAgfVxuICAgIGlmKCh0aGlzLm9mZnNldFkgKyAoZGlzdGFuY2VZICogZm9yY2UpID49IDApICYmICh0aGlzLm9mZnNldFkgKyAoZGlzdGFuY2VZICogZm9yY2UpIDw9IHRoaXMuc3ZnTWF4WSAtIHRoaXMuc2NyZWVuU2l6ZVkpKXtcbiAgICAgIHRoaXMub2Zmc2V0WSArPSAoZGlzdGFuY2VZICogZm9yY2UpO1xuICAgIH1cbiAgICB3aW5kb3cuc2Nyb2xsKHRoaXMub2Zmc2V0WCwgdGhpcy5vZmZzZXRZKVxuICB9XG5cbiAgX215TGlzdGVuZXIodGltZSl7XG4gICAgdGhpcy5zY3JlZW5TaXplWCA9IHdpbmRvdy5pbm5lcldpZHRoO1xuICAgIHRoaXMuc2NyZWVuU2l6ZVkgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG4gICAgc2V0VGltZW91dCh0aGlzLl9teUxpc3RlbmVyLCB0aW1lKTtcbiAgfVxuXG4gIF9yZXBsYWNlU2hhcGUoKXtcbiAgICBsZXQgbmV3TGlzdCA9IFtdO1xuICAgIGZvcihsZXQgaSA9IDA7IGkgPCB0aGlzLnRleHRMaXN0Lmxlbmd0aDsgaSsrKXtcbiAgICAgIG5ld0xpc3RbaV0gPSB0aGlzLnRleHRMaXN0W2ldO1xuICAgIH1cbiAgICBmb3IobGV0IGkgPSAwOyBpIDwgbmV3TGlzdC5sZW5ndGg7IGkrKyl7XG4gICAgICBjb25zdCBlbGVtZW50TmFtZSA9IG5ld0xpc3RbaV0uaW5uZXJIVE1MO1xuICAgICAgIGlmKGVsZW1lbnROYW1lLnNsaWNlKDAsIDEpID09ICdfJyl7XG5cbiAgICAgICAgIGNvbnN0IHNoYXBlTmFtZSA9IGVsZW1lbnROYW1lLnNsaWNlKDEsIGVsZW1lbnROYW1lLmxlbmd0aCk7XG4gICAgICAgICBjb25zdCB4ID0gbmV3TGlzdFtpXS5nZXRBdHRyaWJ1dGUoJ3gnKTtcbiAgICAgICAgIGNvbnN0IHkgPSBuZXdMaXN0W2ldLmdldEF0dHJpYnV0ZSgneScpO1xuICAgICAgICAgdGhpcy5zZW5kKCdhc2tTaGFwZXMnLCBzaGFwZU5hbWUsIHgsIHkpO1xuICAgICAgICAgY29uc3QgcGFyZW50ID0gbmV3TGlzdFtpXS5wYXJlbnROb2RlO1xuICAgICAgICAgcGFyZW50LnJlbW92ZUNoaWxkKG5ld0xpc3RbaV0pO1xuICAgICAgICAgY29uc3QgZWxlbXMgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKHNoYXBlTmFtZSk7XG4gICAgICAgICBmb3IobGV0IGkgPSAwOyBpIDwgZWxlbXMubGVuZ3RoOyBpKyspe1xuICAgICAgICAgICAgZWxlbXNbaV0uc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgIH1cbiAgICAgICB9XG4gICAgfVxuICB9XG5cbiAgX2lzSW5MYXllcih4LCB5KXtcbiAgICBsZXQgdGFiID0gW107XG4gICAgbGV0IHJvdGF0ZUFuZ2xlO1xuICAgIGxldCBtaWRkbGVSb3RhdGVYO1xuICAgIGxldCBtaWRkbGVSb3RhdGVZO1xuICAgIGZvcihsZXQgaSA9IDA7IGkgPCB0aGlzLmVsbGlwc2VMaXN0TGF5ZXIubGVuZ3RoOyBpKyspe1xuICAgICAgcm90YXRlQW5nbGUgPSAwO1xuICAgICAgY29uc3QgbWlkZGxlWCA9IHRoaXMuZWxsaXBzZUxpc3RMYXllcltpXS5nZXRBdHRyaWJ1dGUoJ2N4Jyk7XG4gICAgICBjb25zdCBtaWRkbGVZID0gdGhpcy5lbGxpcHNlTGlzdExheWVyW2ldLmdldEF0dHJpYnV0ZSgnY3knKTtcbiAgICAgIGNvbnN0IHJhZGl1c1ggPSB0aGlzLmVsbGlwc2VMaXN0TGF5ZXJbaV0uZ2V0QXR0cmlidXRlKCdyeCcpO1xuICAgICAgY29uc3QgcmFkaXVzWSA9IHRoaXMuZWxsaXBzZUxpc3RMYXllcltpXS5nZXRBdHRyaWJ1dGUoJ3J5Jyk7XG4gICAgICBsZXQgdHJhbnNmb3JtID0gdGhpcy5lbGxpcHNlTGlzdExheWVyW2ldLmdldEF0dHJpYnV0ZSgndHJhbnNmb3JtJyk7XG4gICAgICBpZigvcm90YXRlLy50ZXN0KHRyYW5zZm9ybSkpe1xuICAgICAgICB0cmFuc2Zvcm0gPSB0cmFuc2Zvcm0uc2xpY2UoNyx0cmFuc2Zvcm0ubGVuZ3RoKTtcbiAgICAgICAgbWlkZGxlUm90YXRlWCA9IHBhcnNlRmxvYXQodHJhbnNmb3JtLnNwbGl0KFwiIFwiKVsxXSk7XG4gICAgICAgIG1pZGRsZVJvdGF0ZVkgPSBwYXJzZUZsb2F0KHRyYW5zZm9ybS5zcGxpdChcIixcIilbMV0ucmVwbGFjZShcIilcIiwgXCJcIikpO1xuICAgICAgICByb3RhdGVBbmdsZSA9IHBhcnNlRmxvYXQodHJhbnNmb3JtLnNwbGl0KFwiIFwiKVswXSk7XG4gICAgICB9XG4gICAgICB0YWJbdGFiLmxlbmd0aF09dGhpcy5faXNJbkVsbGlwc2UocGFyc2VGbG9hdChtaWRkbGVYKSwgcGFyc2VGbG9hdChtaWRkbGVZKSwgcGFyc2VGbG9hdChyYWRpdXNYKSwgcGFyc2VGbG9hdChyYWRpdXNZKSwgeCwgeSwgcm90YXRlQW5nbGUsIG1pZGRsZVJvdGF0ZVgsIG1pZGRsZVJvdGF0ZVkpOyAgICAgXG4gICAgfVxuICAgIGZvcihsZXQgaSA9IDA7IGkgPCB0aGlzLnJlY3RMaXN0TGF5ZXIubGVuZ3RoOyBpKyspe1xuICAgICAgcm90YXRlQW5nbGUgPSAwO1xuICAgICAgbWlkZGxlUm90YXRlWCA9IG51bGw7XG4gICAgICBtaWRkbGVSb3RhdGVZID0gbnVsbDtcbiAgICAgIGNvbnN0IGhlaWdodCA9IHRoaXMucmVjdExpc3RMYXllcltpXS5nZXRBdHRyaWJ1dGUoJ3dpZHRoJyk7XG4gICAgICBjb25zdCB3aWR0aCA9IHRoaXMucmVjdExpc3RMYXllcltpXS5nZXRBdHRyaWJ1dGUoJ2hlaWdodCcpO1xuICAgICAgY29uc3QgbGVmdCA9IHRoaXMucmVjdExpc3RMYXllcltpXS5nZXRBdHRyaWJ1dGUoJ3gnKTtcbiAgICAgIGNvbnN0IHRvcCA9IHRoaXMucmVjdExpc3RMYXllcltpXS5nZXRBdHRyaWJ1dGUoJ3knKTtcbiAgICAgIGxldCB0cmFuc2Zvcm0gPSB0aGlzLnJlY3RMaXN0TGF5ZXJbaV0uZ2V0QXR0cmlidXRlKCd0cmFuc2Zvcm0nKTtcbiAgICAgIGlmKC9yb3RhdGUvLnRlc3QodHJhbnNmb3JtKSl7XG4gICAgICAgIHRyYW5zZm9ybSA9IHRyYW5zZm9ybS5zbGljZSg3LHRyYW5zZm9ybS5sZW5ndGgpO1xuICAgICAgICBtaWRkbGVSb3RhdGVYID0gcGFyc2VGbG9hdCh0cmFuc2Zvcm0uc3BsaXQoXCIgXCIpWzFdKTtcbiAgICAgICAgbWlkZGxlUm90YXRlWSA9IHBhcnNlRmxvYXQodHJhbnNmb3JtLnNwbGl0KFwiLFwiKVsxXS5yZXBsYWNlKFwiKVwiLCBcIlwiKSk7XG4gICAgICAgIHJvdGF0ZUFuZ2xlID0gcGFyc2VGbG9hdCh0cmFuc2Zvcm0uc3BsaXQoXCIgXCIpWzBdKTtcbiAgICAgIH1cbiAgICAgIHRhYlt0YWIubGVuZ3RoXT10aGlzLl9pc0luUmVjdChwYXJzZUZsb2F0KGhlaWdodCksIHBhcnNlRmxvYXQod2lkdGgpLCBwYXJzZUZsb2F0KGxlZnQpLCBwYXJzZUZsb2F0KHRvcCksIHgsIHksIHJvdGF0ZUFuZ2xlLCBtaWRkbGVSb3RhdGVYLCBtaWRkbGVSb3RhdGVZKTtcbiAgICB9ICBcbiAgICByZXR1cm4gdGFiO1xuICB9XG5cbiAgX2lzSW5QYXRoKHgsIHkpe1xuXG4gICAgbGV0IHJvdGF0ZUFuZ2xlO1xuICAgIGxldCBtaWRkbGVSb3RhdGVYO1xuICAgIGxldCBtaWRkbGVSb3RhdGVZO1xuICAgIGxldCBoZWlnaHQ7XG4gICAgbGV0IHdpZHRoO1xuICAgIGxldCBsZWZ0O1xuICAgIGxldCB0b3A7XG4gICAgbGV0IHRyYW5zZm9ybTtcbiAgICBsZXQgaSA9MDtcblxuICAgIC8vUGF0aCAxXG4gICAgbGV0IHBhdGgxID0gZmFsc2U7XG4gICAgd2hpbGUoIXBhdGgxICYmIGkgPCB0aGlzLmxpc3RSZWN0UGF0aDEubGVuZ3RoKXtcbiAgICAgIHJvdGF0ZUFuZ2xlID0gMDtcbiAgICAgIG1pZGRsZVJvdGF0ZVggPSBudWxsO1xuICAgICAgbWlkZGxlUm90YXRlWSA9IG51bGw7XG4gICAgICBoZWlnaHQgPSB0aGlzLmxpc3RSZWN0UGF0aDFbaV0uZ2V0QXR0cmlidXRlKCd3aWR0aCcpO1xuICAgICAgd2lkdGggPSB0aGlzLmxpc3RSZWN0UGF0aDFbaV0uZ2V0QXR0cmlidXRlKCdoZWlnaHQnKTtcbiAgICAgIGxlZnQgPSB0aGlzLmxpc3RSZWN0UGF0aDFbaV0uZ2V0QXR0cmlidXRlKCd4Jyk7XG4gICAgICB0b3AgPSB0aGlzLmxpc3RSZWN0UGF0aDFbaV0uZ2V0QXR0cmlidXRlKCd5Jyk7XG4gICAgICBsZXQgdHJhbnNmb3JtID0gdGhpcy5saXN0UmVjdFBhdGgxW2ldLmdldEF0dHJpYnV0ZSgndHJhbnNmb3JtZm9ybScpO1xuICAgICAgaWYoL3JvdGF0ZS8udGVzdCh0cmFuc2Zvcm0pKXtcbiAgICAgICAgdHJhbnNmb3JtID0gdHJhbnNmb3JtLnNsaWNlKDcsdHJhbnNmb3JtLmxlbmd0aCk7XG4gICAgICAgIG1pZGRsZVJvdGF0ZVggPSBwYXJzZUZsb2F0KHRyYW5zZm9ybS5zcGxpdChcIiBcIilbMV0pO1xuICAgICAgICBtaWRkbGVSb3RhdGVZID0gcGFyc2VGbG9hdCh0cmFuc2Zvcm0uc3BsaXQoXCIsXCIpWzFdLnJlcGxhY2UoXCIpXCIsIFwiXCIpKTtcbiAgICAgICAgcm90YXRlQW5nbGUgPSBwYXJzZUZsb2F0KHRyYW5zZm9ybS5zcGxpdChcIiBcIilbMF0pO1xuICAgICAgfVxuICAgICAgcGF0aDEgPSB0aGlzLl9pc0luUmVjdChwYXJzZUZsb2F0KGhlaWdodCksIHBhcnNlRmxvYXQod2lkdGgpLCBwYXJzZUZsb2F0KGxlZnQpLCBwYXJzZUZsb2F0KHRvcCksIHgsIHksIHJvdGF0ZUFuZ2xlLCBtaWRkbGVSb3RhdGVYLCBtaWRkbGVSb3RhdGVZKTtcbiAgICAgIGkrKztcbiAgICB9XG5cbiAgICAvL1BhdGggMlxuICAgIGxldCBwYXRoMiA9IGZhbHNlO1xuICAgIGkgPTA7XG4gICAgd2hpbGUoIXBhdGgyICYmIGkgPCB0aGlzLmxpc3RSZWN0UGF0aDIubGVuZ3RoKXtcbiAgICAgIHJvdGF0ZUFuZ2xlID0gMDtcbiAgICAgIG1pZGRsZVJvdGF0ZVggPSBudWxsO1xuICAgICAgbWlkZGxlUm90YXRlWSA9IG51bGw7XG4gICAgICBoZWlnaHQgPSB0aGlzLmxpc3RSZWN0UGF0aDJbaV0uZ2V0QXR0cmlidXRlKCd3aWR0aCcpO1xuICAgICAgd2lkdGggPSB0aGlzLmxpc3RSZWN0UGF0aDJbaV0uZ2V0QXR0cmlidXRlKCdoZWlnaHQnKTtcbiAgICAgIGxlZnQgPSB0aGlzLmxpc3RSZWN0UGF0aDJbaV0uZ2V0QXR0cmlidXRlKCd4Jyk7XG4gICAgICB0b3AgPSB0aGlzLmxpc3RSZWN0UGF0aDJbaV0uZ2V0QXR0cmlidXRlKCd5Jyk7XG4gICAgICB0cmFuc2Zvcm0gPSB0aGlzLmxpc3RSZWN0UGF0aDJbaV0uZ2V0QXR0cmlidXRlKCd0cmFuc2Zvcm1mb3JtJyk7XG4gICAgICBpZigvcm90YXRlLy50ZXN0KHRyYW5zZm9ybSkpe1xuICAgICAgICB0cmFuc2Zvcm0gPSB0cmFuc2Zvcm0uc2xpY2UoNyx0cmFuc2Zvcm0ubGVuZ3RoKTtcbiAgICAgICAgbWlkZGxlUm90YXRlWCA9IHBhcnNlRmxvYXQodHJhbnNmb3JtLnNwbGl0KFwiIFwiKVsxXSk7XG4gICAgICAgIG1pZGRsZVJvdGF0ZVkgPSBwYXJzZUZsb2F0KHRyYW5zZm9ybS5zcGxpdChcIixcIilbMV0ucmVwbGFjZShcIilcIiwgXCJcIikpO1xuICAgICAgICByb3RhdGVBbmdsZSA9IHBhcnNlRmxvYXQodHJhbnNmb3JtLnNwbGl0KFwiIFwiKVswXSk7XG4gICAgICB9XG4gICAgICBwYXRoMiA9IHRoaXMuX2lzSW5SZWN0KHBhcnNlRmxvYXQoaGVpZ2h0KSwgcGFyc2VGbG9hdCh3aWR0aCksIHBhcnNlRmxvYXQobGVmdCksIHBhcnNlRmxvYXQodG9wKSwgeCwgeSwgcm90YXRlQW5nbGUsIG1pZGRsZVJvdGF0ZVgsIG1pZGRsZVJvdGF0ZVkpO1xuICAgICAgaSsrO1xuICAgIH1cblxuICAgIC8vUGF0aCAzXG4gICAgbGV0IHBhdGgzID0gZmFsc2U7XG4gICAgaSA9MDtcbiAgICB3aGlsZSghcGF0aDMgJiYgaTx0aGlzLmxpc3RSZWN0UGF0aDMubGVuZ3RoKXtcbiAgICAgIHJvdGF0ZUFuZ2xlPTA7XG4gICAgICBtaWRkbGVSb3RhdGVYPW51bGw7XG4gICAgICBtaWRkbGVSb3RhdGVZPW51bGw7XG4gICAgICBoZWlnaHQgPSB0aGlzLmxpc3RSZWN0UGF0aDNbaV0uZ2V0QXR0cmlidXRlKCd3aWR0aCcpO1xuICAgICAgd2lkdGggPSB0aGlzLmxpc3RSZWN0UGF0aDNbaV0uZ2V0QXR0cmlidXRlKCdoZWlnaHQnKTtcbiAgICAgIGxlZnQgPSB0aGlzLmxpc3RSZWN0UGF0aDNbaV0uZ2V0QXR0cmlidXRlKCd4Jyk7XG4gICAgICB0b3AgPSB0aGlzLmxpc3RSZWN0UGF0aDNbaV0uZ2V0QXR0cmlidXRlKCd5Jyk7XG4gICAgICB0cmFuc2Zvcm0gPSB0aGlzLmxpc3RSZWN0UGF0aDNbaV0uZ2V0QXR0cmlidXRlKCd0cmFuc2Zvcm1mb3JtJyk7XG4gICAgICBpZigvcm90YXRlLy50ZXN0KHRyYW5zZm9ybSkpe1xuICAgICAgICB0cmFuc2Zvcm0gPSB0cmFuc2Zvcm0uc2xpY2UoNyx0cmFuc2Zvcm0ubGVuZ3RoKTtcbiAgICAgICAgbWlkZGxlUm90YXRlWCA9IHBhcnNlRmxvYXQodHJhbnNmb3JtLnNwbGl0KFwiIFwiKVsxXSk7XG4gICAgICAgIG1pZGRsZVJvdGF0ZVkgPSBwYXJzZUZsb2F0KHRyYW5zZm9ybS5zcGxpdChcIixcIilbMV0ucmVwbGFjZShcIilcIiwgXCJcIikpO1xuICAgICAgICByb3RhdGVBbmdsZSA9IHBhcnNlRmxvYXQodHJhbnNmb3JtLnNwbGl0KFwiIFwiKVswXSk7XG4gICAgICB9XG4gICAgICBwYXRoMyA9IHRoaXMuX2lzSW5SZWN0KHBhcnNlRmxvYXQoaGVpZ2h0KSwgcGFyc2VGbG9hdCh3aWR0aCksIHBhcnNlRmxvYXQobGVmdCksIHBhcnNlRmxvYXQodG9wKSwgeCwgeSwgcm90YXRlQW5nbGUsIG1pZGRsZVJvdGF0ZVgsIG1pZGRsZVJvdGF0ZVkpO1xuICAgICAgaSsrO1xuICAgIH0gICAgICAgIFxuICAgIHJldHVybiBbcGF0aDEsIHBhdGgyLCBwYXRoM107XG4gIH1cblxuICBfaXNJblNoYXBlKHgsIHkpe1xuICAgIC8vVmFyaWFibGVzXG4gICAgbGV0IHJvdGF0ZUFuZ2xlO1xuICAgIGxldCBtaWRkbGVSb3RhdGVYO1xuICAgIGxldCBtaWRkbGVSb3RhdGVZO1xuICAgIGxldCBoZWlnaHQ7XG4gICAgbGV0IHdpZHRoO1xuICAgIGxldCBsZWZ0O1xuICAgIGxldCB0b3A7XG4gICAgbGV0IHRyYW5zZm9ybTtcbiAgICBsZXQgaSA9IDA7XG5cbiAgICAvL3NoYXBlIDFcbiAgICBsZXQgc2hhcGUxID0gZmFsc2U7XG4gICAgd2hpbGUoIXNoYXBlMSAmJiBpIDwgdGhpcy5SZWN0TGlzdFNoYXBlMS5sZW5ndGgpe1xuICAgICAgcm90YXRlQW5nbGUgPSAwO1xuICAgICAgbWlkZGxlUm90YXRlWCA9IG51bGw7XG4gICAgICBtaWRkbGVSb3RhdGVZID0gbnVsbDtcbiAgICAgIGhlaWdodCA9IHRoaXMuUmVjdExpc3RTaGFwZTFbaV0uZ2V0QXR0cmlidXRlKCd3aWR0aCcpO1xuICAgICAgd2lkdGggPSB0aGlzLlJlY3RMaXN0U2hhcGUxW2ldLmdldEF0dHJpYnV0ZSgnaGVpZ2h0Jyk7XG4gICAgICBsZWZ0ID0gdGhpcy5SZWN0TGlzdFNoYXBlMVtpXS5nZXRBdHRyaWJ1dGUoJ3gnKTtcbiAgICAgIHRvcCA9IHRoaXMuUmVjdExpc3RTaGFwZTFbaV0uZ2V0QXR0cmlidXRlKCd5Jyk7XG4gICAgICBsZXQgdHJhbnNmb3JtID0gdGhpcy5SZWN0TGlzdFNoYXBlMVtpXS5nZXRBdHRyaWJ1dGUoJ3RyYW5zZm9ybScpO1xuICAgICAgaWYoL3JvdGF0ZS8udGVzdCh0cmFuc2Zvcm0pKXtcbiAgICAgICAgdHJhbnNmb3JtID0gdHJhbnNmb3JtLnNsaWNlKDcsdHJhbnNmb3JtLmxlbmd0aCk7XG4gICAgICAgIG1pZGRsZVJvdGF0ZVggPSBwYXJzZUZsb2F0KHRyYW5zZm9ybS5zcGxpdChcIiBcIilbMV0pO1xuICAgICAgICBtaWRkbGVSb3RhdGVZID0gcGFyc2VGbG9hdCh0cmFuc2Zvcm0uc3BsaXQoXCIsXCIpWzFdLnJlcGxhY2UoXCIpXCIsIFwiXCIpKTtcbiAgICAgICAgcm90YXRlQW5nbGUgPSBwYXJzZUZsb2F0KHRyYW5zZm9ybS5zcGxpdChcIiBcIilbMF0pO1xuICAgICAgfVxuICAgICAgc2hhcGUxID0gdGhpcy5faXNJblJlY3QocGFyc2VGbG9hdChoZWlnaHQpLCBwYXJzZUZsb2F0KHdpZHRoKSwgcGFyc2VGbG9hdChsZWZ0KSwgcGFyc2VGbG9hdCh0b3ApLCB4LCB5LCByb3RhdGVBbmdsZSwgbWlkZGxlUm90YXRlWCwgbWlkZGxlUm90YXRlWSk7XG4gICAgICBpKys7XG4gICAgfVxuXG4gICAgLy9zaGFwZSAyXG4gICAgaSA9IDA7XG4gICAgbGV0IHNoYXBlMiA9IGZhbHNlO1xuICAgIHdoaWxlKCFzaGFwZTIgJiYgaSA8IHRoaXMuUmVjdExpc3RTaGFwZTIubGVuZ3RoKXtcbiAgICAgIHJvdGF0ZUFuZ2xlID0gMDtcbiAgICAgIG1pZGRsZVJvdGF0ZVggPSBudWxsO1xuICAgICAgbWlkZGxlUm90YXRlWSA9IG51bGw7XG4gICAgICBoZWlnaHQgPSB0aGlzLlJlY3RMaXN0U2hhcGUyW2ldLmdldEF0dHJpYnV0ZSgnd2lkdGgnKTtcbiAgICAgIHdpZHRoID0gdGhpcy5SZWN0TGlzdFNoYXBlMltpXS5nZXRBdHRyaWJ1dGUoJ2hlaWdodCcpO1xuICAgICAgbGVmdCA9IHRoaXMuUmVjdExpc3RTaGFwZTJbaV0uZ2V0QXR0cmlidXRlKCd4Jyk7XG4gICAgICB0b3AgPSB0aGlzLlJlY3RMaXN0U2hhcGUyW2ldLmdldEF0dHJpYnV0ZSgneScpO1xuICAgICAgbGV0IHRyYW5zZm9ybSA9IHRoaXMuUmVjdExpc3RTaGFwZTJbaV0uZ2V0QXR0cmlidXRlKCd0cmFuc2Zvcm0nKTtcbiAgICAgIGlmKC9yb3RhdGUvLnRlc3QodHJhbnNmb3JtKSl7XG4gICAgICAgIHRyYW5zZm9ybSA9IHRyYW5zZm9ybS5zbGljZSg3LHRyYW5zZm9ybS5sZW5ndGgpO1xuICAgICAgICBtaWRkbGVSb3RhdGVYID0gcGFyc2VGbG9hdCh0cmFuc2Zvcm0uc3BsaXQoXCIgXCIpWzFdKTtcbiAgICAgICAgbWlkZGxlUm90YXRlWSA9IHBhcnNlRmxvYXQodHJhbnNmb3JtLnNwbGl0KFwiLFwiKVsxXS5yZXBsYWNlKFwiKVwiLCBcIlwiKSk7XG4gICAgICAgIHJvdGF0ZUFuZ2xlID0gcGFyc2VGbG9hdCh0cmFuc2Zvcm0uc3BsaXQoXCIgXCIpWzBdKTtcbiAgICAgIH1cbiAgICAgIHNoYXBlMiA9IHRoaXMuX2lzSW5SZWN0KHBhcnNlRmxvYXQoaGVpZ2h0KSwgcGFyc2VGbG9hdCh3aWR0aCksIHBhcnNlRmxvYXQobGVmdCksIHBhcnNlRmxvYXQodG9wKSwgeCwgeSwgcm90YXRlQW5nbGUsIG1pZGRsZVJvdGF0ZVgsIG1pZGRsZVJvdGF0ZVkpO1xuICAgICAgaSsrO1xuICAgIH1cblxuICAgIC8vc2hhcGUgM1xuICAgIGkgPSAwO1xuICAgIGxldCBzaGFwZTMgPSBmYWxzZTtcbiAgICB3aGlsZSghc2hhcGUzICYmIGkgPCB0aGlzLlJlY3RMaXN0U2hhcGUzLmxlbmd0aCl7XG4gICAgICByb3RhdGVBbmdsZSA9IDA7XG4gICAgICBtaWRkbGVSb3RhdGVYID0gbnVsbDtcbiAgICAgIG1pZGRsZVJvdGF0ZVkgPSBudWxsO1xuICAgICAgaGVpZ2h0ID0gdGhpcy5SZWN0TGlzdFNoYXBlM1tpXS5nZXRBdHRyaWJ1dGUoJ3dpZHRoJyk7XG4gICAgICB3aWR0aCA9IHRoaXMuUmVjdExpc3RTaGFwZTNbaV0uZ2V0QXR0cmlidXRlKCdoZWlnaHQnKTtcbiAgICAgIGxlZnQgPSB0aGlzLlJlY3RMaXN0U2hhcGUzW2ldLmdldEF0dHJpYnV0ZSgneCcpO1xuICAgICAgdG9wID0gdGhpcy5SZWN0TGlzdFNoYXBlM1tpXS5nZXRBdHRyaWJ1dGUoJ3knKTtcbiAgICAgIGxldCB0cmFuc2Zvcm0gPSB0aGlzLlJlY3RMaXN0U2hhcGUzW2ldLmdldEF0dHJpYnV0ZSgndHJhbnNmb3JtJyk7XG4gICAgICBpZigvcm90YXRlLy50ZXN0KHRyYW5zZm9ybSkpe1xuICAgICAgICB0cmFuc2Zvcm0gPSB0cmFuc2Zvcm0uc2xpY2UoNyx0cmFuc2Zvcm0ubGVuZ3RoKTtcbiAgICAgICAgbWlkZGxlUm90YXRlWCA9IHBhcnNlRmxvYXQodHJhbnNmb3JtLnNwbGl0KFwiIFwiKVsxXSk7XG4gICAgICAgIG1pZGRsZVJvdGF0ZVkgPSBwYXJzZUZsb2F0KHRyYW5zZm9ybS5zcGxpdChcIixcIilbMV0ucmVwbGFjZShcIilcIiwgXCJcIikpO1xuICAgICAgICByb3RhdGVBbmdsZSA9IHBhcnNlRmxvYXQodHJhbnNmb3JtLnNwbGl0KFwiIFwiKVswXSk7XG4gICAgICB9XG4gICAgICBzaGFwZTMgPSB0aGlzLl9pc0luUmVjdChwYXJzZUZsb2F0KGhlaWdodCksIHBhcnNlRmxvYXQod2lkdGgpLCBwYXJzZUZsb2F0KGxlZnQpLCBwYXJzZUZsb2F0KHRvcCksIHgsIHksIHJvdGF0ZUFuZ2xlLCBtaWRkbGVSb3RhdGVYLCBtaWRkbGVSb3RhdGVZKTtcbiAgICAgIGkrKztcbiAgICB9XG5cbiAgICAvL3NoYXBlIDRcbiAgICBpID0gMDtcbiAgICBsZXQgc2hhcGU0ID0gZmFsc2U7XG4gICAgd2hpbGUoIXNoYXBlNCAmJiBpIDwgdGhpcy5SZWN0TGlzdFNoYXBlNC5sZW5ndGgpe1xuICAgICAgcm90YXRlQW5nbGUgPSAwO1xuICAgICAgbWlkZGxlUm90YXRlWCA9IG51bGw7XG4gICAgICBtaWRkbGVSb3RhdGVZID0gbnVsbDtcbiAgICAgIGhlaWdodCA9IHRoaXMuUmVjdExpc3RTaGFwZTRbaV0uZ2V0QXR0cmlidXRlKCd3aWR0aCcpO1xuICAgICAgd2lkdGggPSB0aGlzLlJlY3RMaXN0U2hhcGU0W2ldLmdldEF0dHJpYnV0ZSgnaGVpZ2h0Jyk7XG4gICAgICBsZWZ0ID0gdGhpcy5SZWN0TGlzdFNoYXBlNFtpXS5nZXRBdHRyaWJ1dGUoJ3gnKTtcbiAgICAgIHRvcCA9IHRoaXMuUmVjdExpc3RTaGFwZTRbaV0uZ2V0QXR0cmlidXRlKCd5Jyk7XG4gICAgICBsZXQgdHJhbnNmb3JtID0gdGhpcy5SZWN0TGlzdFNoYXBlNFtpXS5nZXRBdHRyaWJ1dGUoJ3RyYW5zZm9ybScpO1xuICAgICAgaWYoL3JvdGF0ZS8udGVzdCh0cmFuc2Zvcm0pKXtcbiAgICAgICAgdHJhbnNmb3JtID0gdHJhbnNmb3JtLnNsaWNlKDcsIHRyYW5zZm9ybS5sZW5ndGgpO1xuICAgICAgICBtaWRkbGVSb3RhdGVYID0gcGFyc2VGbG9hdCh0cmFuc2Zvcm0uc3BsaXQoXCIgXCIpWzFdKTtcbiAgICAgICAgbWlkZGxlUm90YXRlWSA9IHBhcnNlRmxvYXQodHJhbnNmb3JtLnNwbGl0KFwiLFwiKVsxXS5yZXBsYWNlKFwiKVwiLCBcIlwiKSk7XG4gICAgICAgIHJvdGF0ZUFuZ2xlID0gcGFyc2VGbG9hdCh0cmFuc2Zvcm0uc3BsaXQoXCIgXCIpWzBdKTtcbiAgICAgIH1cbiAgICAgIHNoYXBlNCA9IHRoaXMuX2lzSW5SZWN0KHBhcnNlRmxvYXQoaGVpZ2h0KSwgcGFyc2VGbG9hdCh3aWR0aCksIHBhcnNlRmxvYXQobGVmdCksIHBhcnNlRmxvYXQodG9wKSwgeCwgeSwgcm90YXRlQW5nbGUsIG1pZGRsZVJvdGF0ZVgsIG1pZGRsZVJvdGF0ZVkpO1xuICAgICAgaSsrO1xuICAgIH1cblxuXG4gICAgcmV0dXJuIFtzaGFwZTEsIHNoYXBlMiwgc2hhcGUzLCBzaGFwZTRdO1xuXG4gIH1cblxuICAgX2lzSW5SZWN0KGhlaWdodCwgd2lkdGgsIGxlZnQsIHRvcCwgcG9pbnRYLCBwb2ludFksIHJvdGF0ZUFuZ2xlLCBtaWRkbGVSb3RhdGVYLCBtaWRkbGVSb3RhdGVZKXtcbiAgICAgIFxuICAgICAgY29uc3QgbmV3UG9pbnQgPSB0aGlzLl9yb3RhdGVQb2ludChwb2ludFgsIHBvaW50WSwgbWlkZGxlUm90YXRlWCwgbWlkZGxlUm90YXRlWSwgcm90YXRlQW5nbGUpO1xuXG4gICAgICBpZihuZXdQb2ludFswXSA+IHBhcnNlSW50KGxlZnQpICYmIG5ld1BvaW50WzBdIDwocGFyc2VJbnQobGVmdCkrcGFyc2VJbnQoaGVpZ2h0KSkgJiYgbmV3UG9pbnRbMV0gPiB0b3AgJiYgbmV3UG9pbnRbMV0gPCAocGFyc2VJbnQodG9wKSArIHBhcnNlSW50KHdpZHRoKSkpe1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1lbHNle1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICB9XG5cbiAgX2lzSW5FbGxpcHNlKG1pZGRsZVgsIG1pZGRsZVksIHJhZGl1c1gsIHJhZGl1c1ksIHBvaW50WCwgcG9pbnRZLCByb3RhdGVBbmdsZSwgbWlkZGxlUm90YXRlWCwgbWlkZGxlUm90YXRlWSl7XG5cbiAgICBjb25zdCBuZXdQb2ludCA9IHRoaXMuX3JvdGF0ZVBvaW50KHBvaW50WCwgcG9pbnRZLCBtaWRkbGVSb3RhdGVYLCBtaWRkbGVSb3RhdGVZLCByb3RhdGVBbmdsZSk7XG5cbiAgICBsZXQgYSA9IHJhZGl1c1g7OyBcbiAgICBsZXQgYiA9IHJhZGl1c1k7IFxuICAgIGNvbnN0IGNhbGMgPSAoKE1hdGgucG93KCAobmV3UG9pbnRbMF0gLSBtaWRkbGVYKSwgMikgKSAvIChNYXRoLnBvdyhhLCAyKSkpICsgKChNYXRoLnBvdygobmV3UG9pbnRbMV0gLSBtaWRkbGVZKSwgMikpIC8gKE1hdGgucG93KGIsIDIpKSk7XG4gICAgaWYoY2FsYyA8PSAxKXtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1lbHNle1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIF9yb3RhdGVQb2ludCh4LCB5LCBtaWRkbGVYLCBtaWRkbGVZLCBhbmdsZSl7XG4gICAgbGV0IG5ld0FuZ2xlID0gYW5nbGUgKiAoMy4xNDE1OTI2NSAvIDE4MCk7XG4gICAgbGV0IG5ld1ggPSAoeCAtIG1pZGRsZVgpICogTWF0aC5jb3MobmV3QW5nbGUpICsgKHkgLSBtaWRkbGVZKSAqIE1hdGguc2luKG5ld0FuZ2xlKTtcbiAgICBsZXQgbmV3WSA9IC0xICogKHggLSBtaWRkbGVYKSAqIE1hdGguc2luKG5ld0FuZ2xlKSArICh5IC0gbWlkZGxlWSkgKiBNYXRoLmNvcyhuZXdBbmdsZSk7XG4gICAgbmV3WCArPSBtaWRkbGVYO1xuICAgIG5ld1kgKz0gbWlkZGxlWTtcbiAgICByZXR1cm4gW25ld1gsIG5ld1ldO1xuICB9XG5cbi8qIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVNPTi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAqL1xuXG4gIFxuICBfY3JlYXRlU29ub3JXb3JsZCgpe1xuXG4gICAgLy9HcmFpblxuICAgIHRoaXMuZ3JhaW4gPSBuZXcgTXlHcmFpbigpO1xuICAgIHNjaGVkdWxlci5hZGQodGhpcy5ncmFpbik7XG4gICAgdGhpcy5ncmFpbi5jb25uZWN0KGF1ZGlvQ29udGV4dC5kZXN0aW5hdGlvbik7XG4gICAgY29uc3QgYnVmZmVyQXNzb2NpZXMgPSBbNSwgNywgOV07XG4gICAgY29uc3QgbWFya2VyQXNzb2NpZXMgPSBbNiwgOCwgMTBdO1xuXG4gICAgLy9TZWdtZW50ZXJcbiAgICBmb3IobGV0IGkgPSAwOyBpIDwgdGhpcy5uYlBhdGg7IGkrKyl7XG4gICAgICBsZXQgaWRCdWZmZXIgPSBidWZmZXJBc3NvY2llc1tpXTtcbiAgICAgIGxldCBpZE1hcmtlciA9IG1hcmtlckFzc29jaWVzW2ldO1xuICAgICAgdGhpcy5zZWdtZW50ZXJbaV0gPSBuZXcgd2F2ZXMuU2VnbWVudEVuZ2luZSh7XG4gICAgICAgIGJ1ZmZlcjogdGhpcy5sb2FkZXIuYnVmZmVyc1tpZEJ1ZmZlcl0sXG4gICAgICAgIHBvc2l0aW9uQXJyYXk6IHRoaXMubG9hZGVyLmJ1ZmZlcnNbaWRNYXJrZXJdLnRpbWUsXG4gICAgICAgIGR1cmF0aW9uQXJyYXk6IHRoaXMubG9hZGVyLmJ1ZmZlcnNbaWRNYXJrZXJdLmR1cmF0aW9uLFxuICAgICAgICBwZXJpb2RBYnM6IDEwLFxuICAgICAgICBwZXJpb2RSZWw6IDEwLFxuICAgICAgfSk7XG4gICAgICB0aGlzLnNlZ21lbnRlckdhaW5baV0gPSBhdWRpb0NvbnRleHQuY3JlYXRlR2FpbigpO1xuICAgICAgdGhpcy5zZWdtZW50ZXJHYWluR3JhaW5baV0gPSBhdWRpb0NvbnRleHQuY3JlYXRlR2FpbigpO1xuICAgICAgdGhpcy5zZWdtZW50ZXJHYWluR3JhaW5baV0uZ2Fpbi5zZXRWYWx1ZUF0VGltZSgwLCBhdWRpb0NvbnRleHQuY3VycmVudFRpbWUpO1xuICAgICAgdGhpcy5zZWdtZW50ZXJHYWluW2ldLmdhaW4uc2V0VmFsdWVBdFRpbWUoMCwgYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lKTtcbiAgICAgIHRoaXMuc2VnbWVudGVyR2FpbkdyYWluW2ldLmNvbm5lY3QodGhpcy5ncmFpbi5pbnB1dCk7XG4gICAgICB0aGlzLnNlZ21lbnRlckdhaW5baV0uY29ubmVjdChhdWRpb0NvbnRleHQuZGVzdGluYXRpb24pO1xuICAgICAgdGhpcy5zZWdtZW50ZXJbaV0uY29ubmVjdCh0aGlzLnNlZ21lbnRlckdhaW5baV0pO1xuICAgICAgdGhpcy5zZWdtZW50ZXJbaV0uY29ubmVjdCh0aGlzLnNlZ21lbnRlckdhaW5HcmFpbltpXSk7XG4gICAgICB0aGlzLl9zdGFydFNlZ21lbnRlcihpKTtcblxuICAgIH1cblxuICAgIGZvcihsZXQgaSA9IDA7IGkgPCB0aGlzLnRvdGFsRWxlbWVudHM7IGkrKyl7XG5cbiAgICAgIC8vY3JlYXRlIGRpcmVjdCBnYWluXG4gICAgICB0aGlzLmdhaW5zRGlyZWN0aW9uc1tpXSA9ICdkb3duJztcbiAgICAgIHRoaXMuZ2FpbnNbaV0gPSBhdWRpb0NvbnRleHQuY3JlYXRlR2FpbigpO1xuICAgICAgdGhpcy5nYWluc1tpXS5nYWluLnZhbHVlID0gMDtcbiAgICAgIHRoaXMuZ2FpbnNbaV0uY29ubmVjdCh0aGlzLmdyYWluLmlucHV0KTtcblxuICAgICAgLy9jcmVhdGUgZ3JhaW4gZ2FpblxuICAgICAgdGhpcy5zb3VyY2VzW2ldID0gYXVkaW9Db250ZXh0LmNyZWF0ZUJ1ZmZlclNvdXJjZSgpO1xuICAgICAgdGhpcy5zb3VyY2VzW2ldLmJ1ZmZlciA9IHRoaXMubG9hZGVyLmJ1ZmZlcnNbaSAlIDVdO1xuICAgICAgdGhpcy5zb3VyY2VzW2ldLmNvbm5lY3QodGhpcy5nYWluc1tpXSk7XG4gICAgICB0aGlzLnNvdXJjZXNbaV0ubG9vcCA9IHRydWU7XG4gICAgICB0aGlzLnNvdXJjZXNbaV0uc3RhcnQoKTtcblxuICAgIH1cblxuICAgIHRoaXMuZ2Fpbk91dHB1dERpcmVjdCA9IGF1ZGlvQ29udGV4dC5jcmVhdGVHYWluKCk7XG4gICAgdGhpcy5nYWluT3V0cHV0RGlyZWN0LmdhaW4udmFsdWUgPSAwO1xuICAgIHRoaXMuZ2Fpbk91dHB1dERpcmVjdC5jb25uZWN0KGF1ZGlvQ29udGV4dC5kZXN0aW5hdGlvbik7XG4gICAgdGhpcy5nYWluT3V0cHV0R3JhaW4gPSBhdWRpb0NvbnRleHQuY3JlYXRlR2FpbigpO1xuICAgIHRoaXMuZ2Fpbk91dHB1dEdyYWluLmdhaW4udmFsdWUgPSAwO1xuICAgIHRoaXMuZ2Fpbk91dHB1dEdyYWluLmNvbm5lY3QodGhpcy5ncmFpbi5pbnB1dCk7XG5cblxuICAgIGZvcihsZXQgaSA9IDAgOyBpIDwgdGhpcy5uYlNoYXBlIDsgaSsrKXtcblxuICAgICAgLy9jcmVhdGUgZGlyZWN0IGdhaW5cbiAgICAgIHRoaXMuZ2FpbnNTaGFwZVtpXSA9IGF1ZGlvQ29udGV4dC5jcmVhdGVHYWluKCk7XG4gICAgICB0aGlzLmdhaW5zU2hhcGVbaV0uZ2Fpbi52YWx1ZSA9IDA7XG4gICAgICB0aGlzLmdhaW5zU2hhcGVbaV0uY29ubmVjdCh0aGlzLmdhaW5PdXRwdXREaXJlY3QpO1xuXG4gICAgICAvL2NyZWF0ZSBncmFpbiBnYWluXG4gICAgICB0aGlzLmdhaW5zR3JhaW5TaGFwZVtpXSA9IGF1ZGlvQ29udGV4dC5jcmVhdGVHYWluKCk7XG4gICAgICB0aGlzLmdhaW5zR3JhaW5TaGFwZVtpXS5nYWluLnZhbHVlID0gMDtcbiAgICAgIHRoaXMuZ2FpbnNHcmFpblNoYXBlW2ldLmNvbm5lY3QodGhpcy5nYWluT3V0cHV0R3JhaW4pO1xuXG4gICAgICAvL3Nvbm9yIHNyY1xuICAgICAgdGhpcy5zb3VuZFNoYXBlW2ldID0gYXVkaW9Db250ZXh0LmNyZWF0ZUJ1ZmZlclNvdXJjZSgpO1xuICAgICAgdGhpcy5zb3VuZFNoYXBlW2ldLmJ1ZmZlciA9IHRoaXMubG9hZGVyLmJ1ZmZlcnNbMTAgKyAoaSArIDEpXTtcbiAgICAgIHRoaXMuc291bmRTaGFwZVtpXS5jb25uZWN0KHRoaXMuZ2FpbnNTaGFwZVtpXSk7XG4gICAgICB0aGlzLnNvdW5kU2hhcGVbaV0uY29ubmVjdCh0aGlzLmdhaW5zR3JhaW5TaGFwZVtpXSk7XG4gICAgICB0aGlzLnNvdW5kU2hhcGVbaV0ubG9vcCA9IHRydWU7XG4gICAgICB0aGlzLnNvdW5kU2hhcGVbaV0uc3RhcnQoKTtcblxuICAgIH1cbiAgICAgXG4gIH1cblxuXG4gIF9zdGFydFNlZ21lbnRlcihpKXtcbiAgICB0aGlzLnNlZ21lbnRlcltpXS50cmlnZ2VyKCk7XG4gICAgbGV0IG5ld1BlcmlvZCA9IHBhcnNlRmxvYXQodGhpcy5sb2FkZXIuYnVmZmVyc1s2ICsgKGkgKiAyKV1bJ2R1cmF0aW9uJ11bdGhpcy5zZWdtZW50ZXJbaV0uc2VnbWVudElkXSkgKiAxMDAwO1xuICAgIHNldFRpbWVvdXQoICgpID0+IHt0aGlzLl9zdGFydFNlZ21lbnRlcihpKTt9ICwgXG4gICAgbmV3UGVyaW9kKTtcbiAgfVxuXG4gIF91cGRhdGVHYWluKHRhYkluTGF5ZXIpe1xuICAgIGZvcihsZXQgaSA9IDA7IGkgPCB0YWJJbkxheWVyLmxlbmd0aDsgaSsrKXtcbiAgICAgIGlmKHRoaXMuZ2FpbnNbaV0uZ2Fpbi52YWx1ZSA9PSAwICYmIHRhYkluTGF5ZXJbaV0gJiYgdGhpcy5nYWluc0RpcmVjdGlvbnNbaV0gPT0gJ2Rvd24nKXtcbiAgICAgICAgbGV0IGFjdHVhbCA9IHRoaXMuZ2FpbnNbaV0uZ2Fpbi52YWx1ZTtcbiAgICAgICAgdGhpcy5nYWluc1tpXS5nYWluLmNhbmNlbFNjaGVkdWxlZFZhbHVlcyhhdWRpb0NvbnRleHQuY3VycmVudFRpbWUpO1xuICAgICAgICB0aGlzLmdhaW5zW2ldLmdhaW4uc2V0VmFsdWVBdFRpbWUoYWN0dWFsLCBhdWRpb0NvbnRleHQuY3VycmVudFRpbWUpO1xuICAgICAgICB0aGlzLmdhaW5zW2ldLmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoMC4yNCwgYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lICsgMi4zKTtcbiAgICAgICAgdGhpcy5nYWluc0RpcmVjdGlvbnNbaV0gPSAndXAnO1xuICAgICAgfWVsc2UgaWYodGhpcy5nYWluc1tpXS5nYWluLnZhbHVlICE9IDAgJiYgIXRhYkluTGF5ZXJbaV0gJiYgdGhpcy5nYWluc0RpcmVjdGlvbnNbaV0gPT0gJ3VwJyl7XG4gICAgICAgIGxldCBhY3R1YWwgPSB0aGlzLmdhaW5zW2ldLmdhaW4udmFsdWU7XG4gICAgICAgIHRoaXMuZ2FpbnNbaV0uZ2Fpbi5jYW5jZWxTY2hlZHVsZWRWYWx1ZXMoYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lKTtcbiAgICAgICAgdGhpcy5nYWluc1tpXS5nYWluLnNldFZhbHVlQXRUaW1lKGFjdHVhbCwgYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lKTtcbiAgICAgICAgdGhpcy5nYWluc1tpXS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKDAsIGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSArIDMuNSk7XG4gICAgICAgIHRoaXMuZ2FpbnNEaXJlY3Rpb25zW2ldID0gJ2Rvd24nO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIF91cGRhdGVBdWRpb1BhdGgoaSl7XG4gICAgaWYodGhpcy50YWJQYXRoW2ldKXtcbiAgICAgIGxldCBhY3R1YWwxID0gdGhpcy5zZWdtZW50ZXJHYWluW2ldLmdhaW4udmFsdWU7XG4gICAgICBsZXQgYWN0dWFsMiA9IHRoaXMuc2VnbWVudGVyR2FpbkdyYWluW2ldLmdhaW4udmFsdWU7XG4gICAgICB0aGlzLnNlZ21lbnRlckdhaW5baV0uZ2Fpbi5jYW5jZWxTY2hlZHVsZWRWYWx1ZXMoYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lKTtcbiAgICAgIHRoaXMuc2VnbWVudGVyR2FpbkdyYWluW2ldLmdhaW4uY2FuY2VsU2NoZWR1bGVkVmFsdWVzKGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSk7XG4gICAgICB0aGlzLnNlZ21lbnRlckdhaW5baV0uZ2Fpbi5zZXRWYWx1ZUF0VGltZShhY3R1YWwxLGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSk7XG4gICAgICB0aGlzLnNlZ21lbnRlckdhaW5HcmFpbltpXS5nYWluLnNldFZhbHVlQXRUaW1lKGFjdHVhbDIsYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lKTtcbiAgICAgIHRoaXMuc2VnbWVudGVyR2FpbkdyYWluW2ldLmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoMCwgYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lICsgMSk7XG4gICAgICB0aGlzLnNlZ21lbnRlckdhaW5baV0uZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgwLjI1LCBhdWRpb0NvbnRleHQuY3VycmVudFRpbWUgKyAwLjYpO1xuICAgIH1lbHNle1xuICAgICAgbGV0IGFjdHVhbDEgPSB0aGlzLnNlZ21lbnRlckdhaW5baV0uZ2Fpbi52YWx1ZTtcbiAgICAgIGxldCBhY3R1YWwyID0gdGhpcy5zZWdtZW50ZXJHYWluR3JhaW5baV0uZ2Fpbi52YWx1ZTtcbiAgICAgIHRoaXMuc2VnbWVudGVyR2FpbltpXS5nYWluLmNhbmNlbFNjaGVkdWxlZFZhbHVlcyhhdWRpb0NvbnRleHQuY3VycmVudFRpbWUpO1xuICAgICAgdGhpcy5zZWdtZW50ZXJHYWluR3JhaW5baV0uZ2Fpbi5jYW5jZWxTY2hlZHVsZWRWYWx1ZXMoYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lKTtcbiAgICAgIHRoaXMuc2VnbWVudGVyR2FpbltpXS5nYWluLnNldFZhbHVlQXRUaW1lKGFjdHVhbDEsIGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSk7XG4gICAgICB0aGlzLnNlZ21lbnRlckdhaW5HcmFpbltpXS5nYWluLnNldFZhbHVlQXRUaW1lKGFjdHVhbDIsIGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSk7XG4gICAgICBpZih0aGlzLmVuZFN0YXJ0U2VnbWVudGVyW2ldKXtcbiAgICAgICAgdGhpcy5zZWdtZW50ZXJHYWluR3JhaW5baV0uZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZShhY3R1YWwxICsgMC4xNSwgYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lICsgMC4xKTtcbiAgICAgICAgc2V0VGltZW91dCggKCk9PntcbiAgICAgICAgICB0aGlzLnNlZ21lbnRlckdhaW5HcmFpbltpXS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKDAsIGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSArIDAuMyk7ICAgICAgICAgXG4gICAgICAgIH1cbiAgICAgICAgLCAyMDAwKTtcbiAgICAgICAgdGhpcy5zZWdtZW50ZXJHYWluW2ldLmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoMCwgYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lICsgMC40KTtcbiAgICAgIH1lbHNle1xuICAgICAgICB0aGlzLmVuZFN0YXJ0U2VnbWVudGVyW2ldID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBfdXBkYXRlQXVkaW9zaGFwZShpZCl7XG4gICAgXG4gICAgLy9zaGFwZTFcbiAgICBpZihpZCA9PSAwICYmIHRoaXMudGFiU2hhcGVbaWRdKXtcbiAgICAgIGxldCBnYWluR3JhaW4gPSAxIC0gKHRoaXMucmFtcFNoYXBlW1wic2hhcGUxXCJdIC8gMTAwMCk7XG4gICAgICBsZXQgZ2FpbkRpcmVjdCA9IHRoaXMucmFtcFNoYXBlW1wic2hhcGUxXCJdIC8gMTAwMDtcbiAgICAgIGlmKGdhaW5EaXJlY3QgPCAwKXtcbiAgICAgICAgZ2FpbkRpcmVjdCA9IDA7XG4gICAgICB9ZWxzZSBpZihnYWluRGlyZWN0ID4gMSl7XG4gICAgICAgIGdhaW5EaXJlY3QgPSAxO1xuICAgICAgfVxuICAgICAgaWYoZ2FpbkdyYWluIDwgMCl7XG4gICAgICAgIGdhaW5HcmFpbiA9IDA7XG4gICAgICB9ZWxzZSBpZihnYWluR3JhaW4gPiAxKXtcbiAgICAgICAgZ2FpbkdyYWluID0gMTtcbiAgICAgIH1cbiAgICAgIGlmKHRoaXMudGFiU2hhcGVbaWRdKXtcbiAgICAgICAgdGhpcy5nYWluc1NoYXBlW2lkXS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKGdhaW5EaXJlY3QsIGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSArIDAuMDEpO1xuICAgICAgICB0aGlzLmdhaW5zR3JhaW5TaGFwZVtpZF0uZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZShnYWluR3JhaW4sIGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSArIDAuMDEpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vc2hhcGUyXG4gICAgaWYoaWQgPT0gMSAmJiB0aGlzLnRhYlNoYXBlW2lkXSl7XG4gICAgICBsZXQgZ2FpbkdyYWluID0gMSAtICh0aGlzLnJhbXBTaGFwZVtcInNoYXBlMlwiXSAvIDEwMDApO1xuICAgICAgbGV0IGdhaW5EaXJlY3QgPSB0aGlzLnJhbXBTaGFwZVtcInNoYXBlMlwiXSAvIDEwMDA7XG4gICAgICBpZihnYWluRGlyZWN0IDwgMCl7XG4gICAgICAgIGdhaW5EaXJlY3QgPSAwO1xuICAgICAgfWVsc2UgaWYoZ2FpbkRpcmVjID4gMSl7XG4gICAgICAgIGdhaW5EaXJlY3QgPSAxO1xuICAgICAgfVxuICAgICAgaWYoZ2FpbkdyYWluIDwgMCl7XG4gICAgICAgIGdhaW5HcmFpbiA9IDA7XG4gICAgICB9ZWxzZSBpZihnYWluR3JhaW4gPiAxKXtcbiAgICAgICAgZ2FpbkdyYWluID0gMTtcbiAgICAgIH1cbiAgICAgIGlmKHRoaXMudGFiU2hhcGVbaWRdKXtcbiAgICAgICAgdGhpcy5nYWluc1NoYXBlW2lkXS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKGdhaW5EaXJlY3QsIGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSArIDAuMDEpO1xuICAgICAgICB0aGlzLmdhaW5zR3JhaW5TaGFwZVtpZF0uZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZShnYWluR3JhaW4sIGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSArIDAuMDEpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vc2hhcGUzXG4gICAgaWYoaWQgPT0gMiAmJiB0aGlzLnRhYlNoYXBlW2lkXSl7XG4gICAgICBsZXQgZ2FpbkdyYWluID0gMSAtICh0aGlzLnJhbXBTaGFwZVtcInNoYXBlM1wiXSAvIDEwMDApO1xuICAgICAgbGV0IGdhaW5EaXJlY3QgPSB0aGlzLnJhbXBTaGFwZVtcInNoYXBlM1wiXSAvIDEwMDA7XG4gICAgICBpZihnYWluRGlyZWN0IDwgMCl7XG4gICAgICAgIGdhaW5EaXJlY3QgPSAwO1xuICAgICAgfWVsc2UgaWYoZ2FpbkRpcmVjdCA+IDEpe1xuICAgICAgICBnYWluRGlyZWN0ID0gMTtcbiAgICAgIH1cbiAgICAgIGlmKGdhaW5HcmFpbiA8IDApe1xuICAgICAgICBnYWluR3JhaW4gPSAwO1xuICAgICAgfWVsc2UgaWYoZ2FpbkdyYWluID4gMSl7XG4gICAgICAgIGdhaW5HcmFpbiA9IDE7XG4gICAgICB9XG4gICAgICBpZih0aGlzLnRhYlNoYXBlW2lkXSl7XG4gICAgICAgIHRoaXMuZ2FpbnNTaGFwZVtpZF0uZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZShnYWluRGlyZWN0LCBhdWRpb0NvbnRleHQuY3VycmVudFRpbWUgKyAwLjAxKTtcbiAgICAgICAgdGhpcy5nYWluc0dyYWluU2hhcGVbaWRdLmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoZ2FpbkdyYWluLCBhdWRpb0NvbnRleHQuY3VycmVudFRpbWUgKyAwLjAxKTtcbiAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgLy9zaGFwZTRcbiAgICBpZihpZCA9PSAzICYmIHRoaXMudGFiU2hhcGVbaWRdKXtcbiAgICAgIGxldCBnYWluR3JhaW4gPSAxIC0gKHRoaXMucmFtcFNoYXBlW1wic2hhcGU0XCJdIC8gMTAwMCk7XG4gICAgICBsZXQgZ2FpbkRpcmVjdCA9IHRoaXMucmFtcFNoYXBlW1wic2hhcGU0XCJdIC8gMTAwMDtcbiAgICAgIGlmKGdhaW5EaXJlY3QgPCAwKXtcbiAgICAgICAgZ2FpbkRpcmVjdCA9IDA7XG4gICAgICB9ZWxzZSBpZihnYWluRGlyZWN0ID4gMSl7XG4gICAgICAgIGdhaW5EaXJlY3QgPSAxO1xuICAgICAgfVxuICAgICAgaWYoZ2FpbkdyYWluIDwgMCl7XG4gICAgICAgIGdhaW5HcmFpbiA9IDA7XG4gICAgICB9ZWxzZSBpZihnYWluR3JhaW4gPiAxKXtcbiAgICAgICAgZ2FpbkdyYWluID0gMTtcbiAgICAgIH1cbiAgICAgIGlmKHRoaXMudGFiU2hhcGVbaWRdKXtcbiAgICAgICAgdGhpcy5nYWluc1NoYXBlW2lkXS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKGdhaW5EaXJlY3QsIGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSArIDAuMDEpO1xuICAgICAgICB0aGlzLmdhaW5zR3JhaW5TaGFwZVtpZF0uZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZShnYWluR3JhaW4sIGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSArIDAuMDEpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmKCF0aGlzLnRhYlNoYXBlWzBdICYmICh0aGlzLnRhYlNoYXBlWzBdICE9IHRoaXMub2xkU2hhcGVbMF0pKXtcbiAgICAgIHRoaXMuZ2FpbnNTaGFwZVswXS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKDAsIGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSArIDEuNSk7XG4gICAgICB0aGlzLmdhaW5zR3JhaW5TaGFwZVswXS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKDAsIGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSArIDEuNSk7XG4gICAgfVxuICAgIGlmKCF0aGlzLnRhYlNoYXBlWzFdICYmICh0aGlzLnRhYlNoYXBlWzFdICE9IHRoaXMub2xkU2hhcGVbMV0pKXtcbiAgICAgIHRoaXMuZ2FpbnNTaGFwZVsxXS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKDAsIGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSArIDEuNSk7XG4gICAgICB0aGlzLmdhaW5zR3JhaW5TaGFwZVsxXS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKDAsIGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSArIDEuNSk7XG4gICAgfVxuICAgIGlmKCF0aGlzLnRhYlNoYXBlWzJdICYmICh0aGlzLnRhYlNoYXBlWzJdICE9IHRoaXMub2xkU2hhcGVbMl0pKXtcbiAgICAgIHRoaXMuZ2FpbnNTaGFwZVsyXS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKDAsIGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSArIDEuNSk7XG4gICAgICB0aGlzLmdhaW5zR3JhaW5TaGFwZVsyXS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKDAsIGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSArIDEuNSk7XG4gICAgfVxuICAgIGlmKCF0aGlzLnRhYlNoYXBlWzNdICYmICh0aGlzLnRhYlNoYXBlWzNdICE9IHRoaXMub2xkU2hhcGVbM10pKXtcbiAgICAgIHRoaXMuZ2FpbnNTaGFwZVszXS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKDAsIGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSArIDEuNSk7XG4gICAgICB0aGlzLmdhaW5zR3JhaW5TaGFwZVszXS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKDAsIGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSArIDEuNSk7XG4gICAgfVxuXG4gICAgdGhpcy5vbGRTaGFwZSA9IFt0aGlzLnRhYlNoYXBlWzBdLHRoaXMudGFiU2hhcGVbMV0sdGhpcy50YWJTaGFwZVsyXSx0aGlzLnRhYlNoYXBlWzNdXTtcblxuICAgIGlmKHRoaXMudGFiU2hhcGVbMF0gfHwgdGhpcy50YWJTaGFwZVsxXSB8fCB0aGlzLnRhYlNoYXBlWzJdIHx8IHRoaXMudGFiU2hhcGVbM10pe1xuICAgICAgdGhpcy5kZWNvZGVyLnJlc2V0KCk7XG4gICAgfVxuXG4gIH1cblxuXG4gIC8qIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tWE1NLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gKi9cblxuICBfc2V0TW9kZWwobW9kZWwsbW9kZWwxLG1vZGVsMil7XG4gICAgdGhpcy5kZWNvZGVyLnNldE1vZGVsKG1vZGVsKTtcbiAgICB0aGlzLm1vZGVsT0sgPSB0cnVlO1xuICB9XG5cbiAgX3Byb2Nlc3NQcm9iYSgpeyAgICBcbiAgICBsZXQgcHJvYmFNYXggPSB0aGlzLmRlY29kZXIuZ2V0UHJvYmEoKTtcbiAgICAvLyAvL1BhdGhcbiAgICBmb3IobGV0IGkgPSAwIDsgaSA8IHRoaXMubmJQYXRoIDsgaSArKyl7XG4gICAgICB0aGlzLnNlZ21lbnRlcltpXS5zZWdtZW50SWQgPSBNYXRoLnRydW5jKE1hdGgucmFuZG9tKCkgKiB0aGlzLnF0UmFuZG9tKTtcbiAgICAgIGlmKHRoaXMudGFiUGF0aFtpXSAhPSB0aGlzLm9sZFRhYlBhdGhbaV0pe1xuICAgICAgICAgdGhpcy5fdXBkYXRlQXVkaW9QYXRoKGkpO1xuICAgICAgfVxuICAgICAgdGhpcy5vbGRUYWJQYXRoW2ldID0gdGhpcy50YWJQYXRoW2ldO1xuICAgIH1cblxuICAgIC8vU2hhcGVcbiAgICBsZXQgZGlyZWN0ID0gZmFsc2U7XG4gICAgbGV0IGkgPSAwO1xuICAgIHdoaWxlKCAhZGlyZWN0ICYmIChpIDwgdGhpcy5uYlNoYXBlKSApe1xuICAgICAgaWYodGhpcy50YWJTaGFwZVtpXSl7XG4gICAgICAgIGRpcmVjdCA9IHRydWU7XG4gICAgICB9XG4gICAgICBpKytcbiAgICB9XG5cbiAgIGxldCBhY3R1YWwxID0gdGhpcy5nYWluT3V0cHV0RGlyZWN0LmdhaW4udmFsdWU7XG4gICBsZXQgYWN0dWFsMiA9IHRoaXMuZ2Fpbk91dHB1dEdyYWluLmdhaW4udmFsdWU7XG5cbiAgICBpZihkaXJlY3QgIT0gdGhpcy5vbGQpe1xuICAgICAgaWYoZGlyZWN0KXtcbiAgICAgICAgdGhpcy5nYWluT3V0cHV0RGlyZWN0LmdhaW4uY2FuY2VsU2NoZWR1bGVkVmFsdWVzKGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSk7XG4gICAgICAgIHRoaXMuZ2Fpbk91dHB1dERpcmVjdC5nYWluLnNldFZhbHVlQXRUaW1lKGFjdHVhbDEsIGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSk7XG4gICAgICAgIHRoaXMuZ2Fpbk91dHB1dERpcmVjdC5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKDAuNSwgYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lICsgMik7XG4gICAgICAgIHRoaXMuZ2Fpbk91dHB1dEdyYWluLmdhaW4uY2FuY2VsU2NoZWR1bGVkVmFsdWVzKGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSk7XG4gICAgICAgIHRoaXMuZ2Fpbk91dHB1dEdyYWluLmdhaW4uc2V0VmFsdWVBdFRpbWUoYWN0dWFsMSwgYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lKTtcbiAgICAgICAgdGhpcy5nYWluT3V0cHV0R3JhaW4uZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgwLjUsIGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSArIDIpO1xuICAgICAgICB0aGlzLnJhbXBTaGFwZVsnc2hhcGUxJ10gPSAwO1xuICAgICAgICB0aGlzLnJhbXBTaGFwZVsnc2hhcGUyJ10gPSAwO1xuICAgICAgICB0aGlzLnJhbXBTaGFwZVsnc2hhcGUzJ10gPSAwO1xuICAgICAgICB0aGlzLnJhbXBTaGFwZVsnc2hhcGU0J10gPSAwO1xuICAgICAgfWVsc2V7XG4gICAgICAgIHRoaXMuZ2Fpbk91dHB1dERpcmVjdC5nYWluLmNhbmNlbFNjaGVkdWxlZFZhbHVlcyhhdWRpb0NvbnRleHQuY3VycmVudFRpbWUpO1xuICAgICAgICB0aGlzLmdhaW5PdXRwdXREaXJlY3QuZ2Fpbi5zZXRWYWx1ZUF0VGltZShhY3R1YWwxLCBhdWRpb0NvbnRleHQuY3VycmVudFRpbWUpO1xuICAgICAgICB0aGlzLmdhaW5PdXRwdXREaXJlY3QuZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgwLCBhdWRpb0NvbnRleHQuY3VycmVudFRpbWUgKyAyKTtcbiAgICAgICAgdGhpcy5nYWluT3V0cHV0R3JhaW4uZ2Fpbi5jYW5jZWxTY2hlZHVsZWRWYWx1ZXMoYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lKTtcbiAgICAgICAgdGhpcy5nYWluT3V0cHV0R3JhaW4uZ2Fpbi5zZXRWYWx1ZUF0VGltZShhY3R1YWwxLCBhdWRpb0NvbnRleHQuY3VycmVudFRpbWUpO1xuICAgICAgICB0aGlzLmdhaW5PdXRwdXRHcmFpbi5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKDAsIGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSArIDIpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMub2xkID0gZGlyZWN0O1xuXG4gICAgaWYoZGlyZWN0KXtcblxuICAgICAgZm9yKGxldCBpID0gMDsgaTx0aGlzLm5iU2hhcGUgOyBpKyspe1xuICAgICAgICBpZihwcm9iYU1heD09J3NoYXBlMScpe1xuICAgICAgICAgIHRoaXMucmFtcFNoYXBlWydzaGFwZTInXS0tO1xuICAgICAgICAgIHRoaXMucmFtcFNoYXBlWydzaGFwZTMnXS0tO1xuICAgICAgICAgIHRoaXMucmFtcFNoYXBlWydzaGFwZTQnXS0tO1xuICAgICAgICB9ZWxzZSBpZihwcm9iYU1heCA9PSAnc2hhcGUyJyl7XG4gICAgICAgICAgdGhpcy5yYW1wU2hhcGVbJ3NoYXBlMSddLS07XG4gICAgICAgICAgdGhpcy5yYW1wU2hhcGVbJ3NoYXBlMyddLS07XG4gICAgICAgICAgdGhpcy5yYW1wU2hhcGVbJ3NoYXBlNCddLS07XG4gICAgICAgIH1lbHNlIGlmKHByb2JhTWF4ID09ICdzaGFwZTMnKXtcbiAgICAgICAgICB0aGlzLnJhbXBTaGFwZVsnc2hhcGUxJ10tLTtcbiAgICAgICAgICB0aGlzLnJhbXBTaGFwZVsnc2hhcGUyJ10tLTtcbiAgICAgICAgICB0aGlzLnJhbXBTaGFwZVsnc2hhcGU0J10tLTtcbiAgICAgICAgfWVsc2UgaWYocHJvYmFNYXggPT0gJ3NoYXBlNCcpe1xuICAgICAgICAgIHRoaXMucmFtcFNoYXBlWydzaGFwZTEnXS0tO1xuICAgICAgICAgIHRoaXMucmFtcFNoYXBlWydzaGFwZTInXS0tO1xuICAgICAgICAgIHRoaXMucmFtcFNoYXBlWydzaGFwZTMnXS0tO1xuICAgICAgICB9ZWxzZSBpZihwcm9iYU1heCA9PSBudWxsKXtcbiAgICAgICAgICB0aGlzLnJhbXBTaGFwZVsnc2hhcGUxJ10tLTtcbiAgICAgICAgICB0aGlzLnJhbXBTaGFwZVsnc2hhcGUyJ10tLTtcbiAgICAgICAgICB0aGlzLnJhbXBTaGFwZVsnc2hhcGUzJ10tLTtcbiAgICAgICAgICB0aGlzLnJhbXBTaGFwZVsnc2hhcGU0J10tLTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMucmFtcFNoYXBlW3Byb2JhTWF4XSsrO1xuXG4gICAgICAgIGlmKHRoaXMucmFtcFNoYXBlWydzaGFwZTEnXSA8IDApIHRoaXMucmFtcFNoYXBlWydzaGFwZTEnXSA9IDA7XG4gICAgICAgIGlmKHRoaXMucmFtcFNoYXBlWydzaGFwZTInXSA8IDApIHRoaXMucmFtcFNoYXBlWydzaGFwZTInXSA9IDA7XG4gICAgICAgIGlmKHRoaXMucmFtcFNoYXBlWydzaGFwZTMnXSA8IDApIHRoaXMucmFtcFNoYXBlWydzaGFwZTMnXSA9IDA7XG4gICAgICAgIGlmKHRoaXMucmFtcFNoYXBlWydzaGFwZTQnXSA8IDApIHRoaXMucmFtcFNoYXBlWydzaGFwZTQnXSA9IDA7XG4gICAgICB9XG5cbiAgICB9XG5cbiAgICBmb3IobGV0IGkgPSAwIDsgaSA8IHRoaXMubmJTaGFwZSA7IGkrKyl7XG4gICAgICB0aGlzLl91cGRhdGVBdWRpb1NoYXBlKGkpO1xuICAgIH1cblxuICB9XG5cbn1cbiJdfQ==