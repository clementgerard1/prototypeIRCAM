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
      files: ['sounds/layers/gadoue.mp3', // 0
      'sounds/layers/gadoue.mp3', // 1
      "sounds/layers/nage.mp3", // ...
      "sounds/layers/tempete.mp3", "sounds/layers/vent.mp3", "sounds/path/camusC.mp3", // 5  
      "markers/camus.json", "sounds/path/churchillC.mp3", "markers/churchill.json", "sounds/path/irakC.mp3", "markers/irak.json", // 10  
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
      this._updateAudioPath = this._updateAudioPath.bind(this);
      this._updateAudioShape = this._updateAudioShape.bind(this);

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
      elem.setAttributeNS(null, "id", 'ball');
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
          var newNode = ball.parentNode.insertBefore(shapeXmlTab[i], ball);
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
          this.send('askShape', shapeName, x, y);
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
      var newPeriod = parseFloat(this.loader.buffers[6 + i * 2]['duration'][this.segmenter[i].segmentIndex]) * 1000;
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
    key: '_updateAudioShape',
    value: function _updateAudioShape(id) {

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
        } else if (_gainDirect > 1) {
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
      //Path
      for (var _i9 = 0; _i9 < this.nbPath; _i9++) {
        this.segmenter[_i9].segmentIndex = (0, _trunc2.default)(Math.random() * this.qtRandom);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlBsYXllckV4cGVyaWVuY2UuanMiXSwibmFtZXMiOlsic291bmR3b3JrcyIsIndhdmVzIiwiYXVkaW9Db250ZXh0Iiwic2NoZWR1bGVyIiwiZ2V0U2NoZWR1bGVyIiwiUGxheWVyVmlldyIsInRlbXBsYXRlIiwiY29udGVudCIsImV2ZW50cyIsIm9wdGlvbnMiLCJWaWV3IiwidmlldyIsIlBsYXllckV4cGVyaWVuY2UiLCJhc3NldHNEb21haW4iLCJwbGF0Zm9ybSIsInJlcXVpcmUiLCJmZWF0dXJlcyIsIm1vdGlvbklucHV0IiwiZGVzY3JpcHRvcnMiLCJsb2FkZXIiLCJmaWxlcyIsImdhaW5PdXRwdXREaXJlY3QiLCJnYWluT3V0cHV0R3JhaW4iLCJncmFpbiIsInN0YXJ0T0siLCJtb2RlbE9LIiwibmJQYXRoIiwibmJTaGFwZSIsInF0UmFuZG9tIiwib2xkIiwibmJTZWdtZW50IiwibGFzdFNlZ21lbnQiLCJsYXN0UG9zaXRpb24iLCJjb3VudDQiLCJtYXhMYWciLCJlbmRTdGFydFNlZ21lbnRlciIsImNvdW50VGltZW91dCIsImRpcmVjdGlvbiIsIm9sZFRhYlBhdGgiLCJjb3VudDEiLCJjb3VudDIiLCJzZWdtZW50ZXIiLCJzZWdtZW50ZXJHYWluIiwic2VnbWVudGVyR2FpbkdyYWluIiwic291cmNlcyIsImdhaW5zIiwiZ2FpbnNEaXJlY3Rpb25zIiwiZ2FpbnNTaGFwZSIsIm9sZFNoYXBlIiwiZ2FpbnNHcmFpblNoYXBlIiwic291bmRTaGFwZSIsInJhbXBTaGFwZSIsImNvdW50TWF4IiwiZGVjb2RlciIsImkiLCJ2aWV3VGVtcGxhdGUiLCJ2aWV3Q29udGVudCIsInZpZXdDdG9yIiwidmlld09wdGlvbnMiLCJwcmVzZXJ2ZVBpeGVsUmF0aW8iLCJjcmVhdGVWaWV3IiwiX3RvTW92ZSIsImJpbmQiLCJfaXNJbkVsbGlwc2UiLCJfaXNJblJlY3QiLCJfaXNJbkxheWVyIiwiX2lzSW5QYXRoIiwiX2lzSW5TaGFwZSIsIl9jcmVhdGVTb25vcldvcmxkIiwiX3VwZGF0ZUdhaW4iLCJfcm90YXRlUG9pbnQiLCJfbXlMaXN0ZW5lciIsIl9hZGRCYWxsIiwiX2FkZEJhY2tncm91bmQiLCJfc2V0TW9kZWwiLCJfcHJvY2Vzc1Byb2JhIiwiX3JlcGxhY2VTaGFwZSIsIl9hZGRTaGFwZSIsIl9zdGFydFNlZ21lbnRlciIsIl91cGRhdGVBdWRpb1BhdGgiLCJfdXBkYXRlQXVkaW9TaGFwZSIsInJlY2VpdmUiLCJkYXRhIiwibW9kZWwiLCJzaGFwZSIsIngiLCJ5IiwiaGFzU3RhcnRlZCIsImluaXQiLCJzaG93IiwiZG9jdW1lbnQiLCJib2R5Iiwic3R5bGUiLCJvdmVyZmxvdyIsIm1pZGRsZVgiLCJ3aW5kb3ciLCJpbm5lcldpZHRoIiwic2NyZWVuU2l6ZVgiLCJzY3JlZW5TaXplWSIsImlubmVySGVpZ2h0IiwibWlkZGxlRWNyYW5YIiwibWlkZGxlRWNyYW5ZIiwic2V0VGltZW91dCIsIm1pZGRsZVkiLCJlbGxpcHNlTGlzdExheWVyIiwiZ2V0RWxlbWVudHNCeVRhZ05hbWUiLCJyZWN0TGlzdExheWVyIiwidG90YWxFbGVtZW50cyIsImxlbmd0aCIsInRleHRMaXN0Iiwic2hhcGVMaXN0IiwibGlzdFJlY3RQYXRoMSIsImdldEVsZW1lbnRzQnlDbGFzc05hbWUiLCJsaXN0UmVjdFBhdGgyIiwibGlzdFJlY3RQYXRoMyIsIlJlY3RMaXN0U2hhcGUxIiwiUmVjdExpc3RTaGFwZTIiLCJSZWN0TGlzdFNoYXBlMyIsIlJlY3RMaXN0U2hhcGU0IiwibWF4Q291bnRVcGRhdGUiLCJjb3VudFVwZGF0ZSIsInZpc3VhbGlzYXRpb25TaGFwZVBhdGgiLCJ2aXN1YWxpc2F0aW9uQmFsbCIsIiRlbCIsInF1ZXJ5U2VsZWN0b3IiLCJkaXNwbGF5IiwidmlzdWFsaXNhdGlvblNoYXBlIiwibWlycm9yQmFsbFgiLCJtaXJyb3JCYWxsWSIsIm9mZnNldFgiLCJvZmZzZXRZIiwic3ZnTWF4WCIsImdldEF0dHJpYnV0ZSIsInN2Z01heFkiLCJ0YWJJbkxheWVyIiwiaXNBdmFpbGFibGUiLCJhZGRMaXN0ZW5lciIsIm5ld1ZhbHVlcyIsInRhYlBhdGgiLCJ0YWJTaGFwZSIsIl9tb3ZlU2NyZWVuVG8iLCJwcm9jZXNzIiwiY29uc29sZSIsImxvZyIsImVsZW0iLCJjcmVhdGVFbGVtZW50TlMiLCJzZXRBdHRyaWJ1dGVOUyIsImFwcGVuZENoaWxkIiwiYmFja2dyb3VuZCIsInBhcnNlciIsIkRPTVBhcnNlciIsImJhY2tncm91bmRYbWwiLCJwYXJzZUZyb21TdHJpbmciLCJnZXRFbGVtZW50QnlJZCIsInNldEF0dHJpYnV0ZSIsIl9kZWxldGVSZWN0UGF0aCIsInN0YXJ0IiwidGFiIiwic2hhcGVYbWwiLCJiYWxsIiwic2hhcGVYbWxUYWIiLCJjaGlsZE5vZGVzIiwibm9kZU5hbWUiLCJuZXdOb2RlIiwicGFyZW50Tm9kZSIsImluc2VydEJlZm9yZSIsInZhbHVlWCIsInZhbHVlWSIsIm9iaiIsIm5ld1giLCJuZXdZIiwiYWN0dSIsImZvcmNlIiwiZGlzdGFuY2VYIiwibmVnWCIsImluZGljZVBvd1giLCJpbmRpY2VQb3dZIiwiTWF0aCIsInBvdyIsImFicyIsImRpc3RhbmNlWSIsIm5lZ1kiLCJzY3JvbGwiLCJ0aW1lIiwibmV3TGlzdCIsImVsZW1lbnROYW1lIiwiaW5uZXJIVE1MIiwic2xpY2UiLCJzaGFwZU5hbWUiLCJzZW5kIiwicGFyZW50IiwicmVtb3ZlQ2hpbGQiLCJlbGVtcyIsInJvdGF0ZUFuZ2xlIiwibWlkZGxlUm90YXRlWCIsIm1pZGRsZVJvdGF0ZVkiLCJyYWRpdXNYIiwicmFkaXVzWSIsInRyYW5zZm9ybSIsInRlc3QiLCJwYXJzZUZsb2F0Iiwic3BsaXQiLCJyZXBsYWNlIiwiaGVpZ2h0Iiwid2lkdGgiLCJsZWZ0IiwidG9wIiwicGF0aDEiLCJwYXRoMiIsInBhdGgzIiwic2hhcGUxIiwic2hhcGUyIiwic2hhcGUzIiwic2hhcGU0IiwicG9pbnRYIiwicG9pbnRZIiwibmV3UG9pbnQiLCJwYXJzZUludCIsImEiLCJiIiwiY2FsYyIsImFuZ2xlIiwibmV3QW5nbGUiLCJjb3MiLCJzaW4iLCJhZGQiLCJjb25uZWN0IiwiZGVzdGluYXRpb24iLCJidWZmZXJBc3NvY2llcyIsIm1hcmtlckFzc29jaWVzIiwiaWRCdWZmZXIiLCJpZE1hcmtlciIsIlNlZ21lbnRFbmdpbmUiLCJidWZmZXIiLCJidWZmZXJzIiwicG9zaXRpb25BcnJheSIsImR1cmF0aW9uQXJyYXkiLCJkdXJhdGlvbiIsInBlcmlvZEFicyIsInBlcmlvZFJlbCIsImNyZWF0ZUdhaW4iLCJnYWluIiwic2V0VmFsdWVBdFRpbWUiLCJjdXJyZW50VGltZSIsImlucHV0IiwidmFsdWUiLCJjcmVhdGVCdWZmZXJTb3VyY2UiLCJsb29wIiwidHJpZ2dlciIsIm5ld1BlcmlvZCIsInNlZ21lbnRJbmRleCIsImFjdHVhbCIsImNhbmNlbFNjaGVkdWxlZFZhbHVlcyIsImxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lIiwiYWN0dWFsMSIsImFjdHVhbDIiLCJpZCIsImdhaW5HcmFpbiIsImdhaW5EaXJlY3QiLCJyZXNldCIsIm1vZGVsMSIsIm1vZGVsMiIsInNldE1vZGVsIiwicHJvYmFNYXgiLCJnZXRQcm9iYSIsInJhbmRvbSIsImRpcmVjdCIsIkV4cGVyaWVuY2UiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7SUFBWUEsVTs7QUFDWjs7OztBQUNBOztJQUFZQyxLOztBQUNaOzs7Ozs7OztBQUVBLElBQU1DLGVBQWVGLFdBQVdFLFlBQWhDO0FBQ0EsSUFBTUMsWUFBWUYsTUFBTUcsWUFBTixFQUFsQjs7SUFFTUMsVTs7O0FBQ0osc0JBQVlDLFFBQVosRUFBc0JDLE9BQXRCLEVBQStCQyxNQUEvQixFQUF1Q0MsT0FBdkMsRUFBZ0Q7QUFBQTtBQUFBLHlJQUN4Q0gsUUFEd0MsRUFDOUJDLE9BRDhCLEVBQ3JCQyxNQURxQixFQUNiQyxPQURhO0FBRS9DOzs7RUFIc0JULFdBQVdVLEk7O0FBTXBDLElBQU1DLFNBQU47O0FBRUE7QUFDQTs7SUFDcUJDLGdCOzs7QUFDbkIsNEJB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MkIsQ0FBOUIsRUFBaUMsS0FBS0EsU0FBTCxDQUFlLFFBQWYsSUFBMkIsQ0FBM0I7QUFDakMsY0FBRyxLQUFLQSxTQUFMLENBQWUsUUFBZixJQUEyQixDQUE5QixFQUFpQyxLQUFLQSxTQUFMLENBQWUsUUFBZixJQUEyQixDQUEzQjtBQUNqQyxjQUFHLEtBQUtBLFNBQUwsQ0FBZSxRQUFmLElBQTJCLENBQTlCLEVBQWlDLEtBQUtBLFNBQUwsQ0FBZSxRQUFmLElBQTJCLENBQTNCO0FBQ2pDLGNBQUcsS0FBS0EsU0FBTCxDQUFlLFFBQWYsSUFBMkIsQ0FBOUIsRUFBaUMsS0FBS0EsU0FBTCxDQUFlLFFBQWYsSUFBMkIsQ0FBM0I7QUFDbEM7QUFFRjs7QUFFRCxXQUFJLElBQUlHLE9BQUksQ0FBWixFQUFnQkEsT0FBSSxLQUFLM0IsT0FBekIsRUFBbUMyQixNQUFuQyxFQUF1QztBQUNyQyxhQUFLMEIsaUJBQUwsQ0FBdUIxQixJQUF2QjtBQUNEO0FBRUY7OztFQS82QjJDdEQsV0FBVzJRLFU7O2tCQUFwQy9QLGdCIiwiZmlsZSI6IlBsYXllckV4cGVyaWVuY2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBzb3VuZHdvcmtzIGZyb20gJ3NvdW5kd29ya3MvY2xpZW50JztcbmltcG9ydCBNeUdyYWluIGZyb20gJy4vTXlHcmFpbi5qcyc7XG5pbXBvcnQgKiBhcyB3YXZlcyBmcm9tICd3YXZlcy1hdWRpbyc7XG5pbXBvcnQgRGVjb2RlciBmcm9tICcuL0RlY29kZXIuanMnO1xuXG5jb25zdCBhdWRpb0NvbnRleHQgPSBzb3VuZHdvcmtzLmF1ZGlvQ29udGV4dDtcbmNvbnN0IHNjaGVkdWxlciA9IHdhdmVzLmdldFNjaGVkdWxlcigpO1xuXG5jbGFzcyBQbGF5ZXJWaWV3IGV4dGVuZHMgc291bmR3b3Jrcy5WaWV3e1xuICBjb25zdHJ1Y3Rvcih0ZW1wbGF0ZSwgY29udGVudCwgZXZlbnRzLCBvcHRpb25zKSB7XG4gICAgc3VwZXIodGVtcGxhdGUsIGNvbnRlbnQsIGV2ZW50cywgb3B0aW9ucyk7XG4gIH1cbn1cblxuY29uc3Qgdmlldz0gYGA7XG5cbi8vIHRoaXMgZXhwZXJpZW5jZSBwbGF5cyBhIHNvdW5kIHdoZW4gaXQgc3RhcnRzLCBhbmQgcGxheXMgYW5vdGhlciBzb3VuZCB3aGVuXG4vLyBvdGhlciBjbGllbnRzIGpvaW4gdGhlIGV4cGVyaWVuY2VcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBsYXllckV4cGVyaWVuY2UgZXh0ZW5kcyBzb3VuZHdvcmtzLkV4cGVyaWVuY2Uge1xuICBjb25zdHJ1Y3Rvcihhc3NldHNEb21haW4pIHtcbiAgICBzdXBlcigpO1xuICAgIFxuICAgIC8vU2VydmljZXNcbiAgICB0aGlzLnBsYXRmb3JtID0gdGhpcy5yZXF1aXJlKCdwbGF0Zm9ybScsIHsgZmVhdHVyZXM6IFsnd2ViLWF1ZGlvJywgJ3dha2UtbG9jayddIH0pO1xuICAgIHRoaXMubW90aW9uSW5wdXQgPSB0aGlzLnJlcXVpcmUoJ21vdGlvbi1pbnB1dCcsIHsgZGVzY3JpcHRvcnM6IFsnb3JpZW50YXRpb24nXSB9KTtcbiAgICB0aGlzLmxvYWRlciA9IHRoaXMucmVxdWlyZSgnbG9hZGVyJywgeyBcbiAgICAgIGZpbGVzOiBbJ3NvdW5kcy9sYXllcnMvZ2Fkb3VlLm1wMycsICAgIC8vIDBcbiAgICAgICAgICAgICAgJ3NvdW5kcy9sYXllcnMvZ2Fkb3VlLm1wMycsICAgIC8vIDFcbiAgICAgICAgICAgICAgXCJzb3VuZHMvbGF5ZXJzL25hZ2UubXAzXCIsICAgICAgLy8gLi4uXG4gICAgICAgICAgICAgIFwic291bmRzL2xheWVycy90ZW1wZXRlLm1wM1wiLFxuICAgICAgICAgICAgICBcInNvdW5kcy9sYXllcnMvdmVudC5tcDNcIixcbiAgICAgICAgICAgICAgXCJzb3VuZHMvcGF0aC9jYW11c0MubXAzXCIsICAgICAvLyA1ICBcbiAgICAgICAgICAgICAgXCJtYXJrZXJzL2NhbXVzLmpzb25cIiwgXG4gICAgICAgICAgICAgIFwic291bmRzL3BhdGgvY2h1cmNoaWxsQy5tcDNcIiwgICAgXG4gICAgICAgICAgICAgIFwibWFya2Vycy9jaHVyY2hpbGwuanNvblwiLFxuICAgICAgICAgICAgICBcInNvdW5kcy9wYXRoL2lyYWtDLm1wM1wiLCAgIFxuICAgICAgICAgICAgICBcIm1hcmtlcnMvaXJhay5qc29uXCIsICAgICAgICAgIC8vIDEwICBcbiAgICAgICAgICAgICAgXCJzb3VuZHMvc2hhcGUvZW1pbmVtLm1wM1wiLFxuICAgICAgICAgICAgICBcInNvdW5kcy9zaGFwZS90cnVtcC5tcDNcIixcbiAgICAgICAgICAgICAgXCJzb3VuZHMvc2hhcGUvZnIubXAzXCIsXG4gICAgICAgICAgICAgIFwic291bmRzL3NoYXBlL2JyZXhpdC5tcDNcIl1cbiAgICB9KTtcblxuICAgIC8vcGFyYW1zXG4gICAgdGhpcy5nYWluT3V0cHV0RGlyZWN0O1xuICAgIHRoaXMuZ2Fpbk91dHB1dEdyYWluO1xuICAgIHRoaXMuZ3JhaW47XG4gICAgdGhpcy5zdGFydE9LID0gZmFsc2U7XG4gICAgdGhpcy5tb2RlbE9LID0gZmFsc2U7XG4gICAgdGhpcy5uYlBhdGggPSAzO1xuICAgIHRoaXMubmJTaGFwZSA9IDQ7XG4gICAgdGhpcy5xdFJhbmRvbSA9IDE0MDtcbiAgICB0aGlzLm9sZCA9IGZhbHNlO1xuICAgIHRoaXMubmJTZWdtZW50ID0gWzIzMiwgMTQ0LCAxMDZdO1xuICAgIHRoaXMubGFzdFNlZ21lbnQgPSBbMCwgMCwgMF07XG4gICAgdGhpcy5sYXN0UG9zaXRpb24gPSBbMCwgMCwgMF07XG4gICAgdGhpcy5jb3VudDQgPSAxMDtcbiAgICB0aGlzLm1heExhZyA9IDEwO1xuICAgIHRoaXMuZW5kU3RhcnRTZWdtZW50ZXIgPSBbXTtcbiAgICB0aGlzLmNvdW50VGltZW91dCA9IFtdO1xuICAgIHRoaXMuZGlyZWN0aW9uID0gW107XG4gICAgdGhpcy5vbGRUYWJQYXRoID0gW107XG4gICAgdGhpcy5jb3VudDEgPSBbXTtcbiAgICB0aGlzLmNvdW50MiA9IFtdO1xuICAgIHRoaXMuc2VnbWVudGVyID0gW107XG4gICAgdGhpcy5zZWdtZW50ZXJHYWluID0gW107XG4gICAgdGhpcy5zZWdtZW50ZXJHYWluR3JhaW4gPSBbXTtcbiAgICB0aGlzLnNvdXJjZXMgPSBbXTtcbiAgICB0aGlzLmdhaW5zID0gW107XG4gICAgdGhpcy5nYWluc0RpcmVjdGlvbnMgPSBbXTtcbiAgICB0aGlzLmdhaW5zU2hhcGUgPSBbXTtcbiAgICB0aGlzLm9sZFNoYXBlID0gW2ZhbHNlLCBmYWxzZSwgZmFsc2UsIGZhbHNlXTtcbiAgICB0aGlzLmdhaW5zR3JhaW5TaGFwZSA9IFtdO1xuICAgIHRoaXMuc291bmRTaGFwZSA9IFtdO1xuICAgIHRoaXMucmFtcFNoYXBlID0geydzaGFwZTEnOiAwLCAnc2hhcGUyJzogMCwgJ3NoYXBlMyc6IDAsICdzaGFwZTQnOiAwfTtcbiAgICB0aGlzLmNvdW50TWF4ID0gMTAwO1xuXG4gICAgdGhpcy5kZWNvZGVyID0gbmV3IERlY29kZXIoKTtcblxuICAgIGZvcihsZXQgaSA9IDA7IGkgPCB0aGlzLm5iUGF0aDsgaSsrKXtcbiAgICAgIHRoaXMuY291bnQxW2ldID0gMjA7XG4gICAgICB0aGlzLmNvdW50MltpXSA9IDIwO1xuICAgICAgdGhpcy5jb3VudFRpbWVvdXRbaV0gPSAwO1xuICAgICAgdGhpcy5kaXJlY3Rpb25baV0gPSB0cnVlO1xuICAgICAgdGhpcy5vbGRUYWJQYXRoW2ldID0gdHJ1ZTtcbiAgICAgIHRoaXMuZW5kU3RhcnRTZWdtZW50ZXJbaV0gPSBmYWxzZTtcbiAgICB9XG5cbiAgfVxuXG4gIGluaXQoKSB7XG4gICAgLy8gaW5pdGlhbGl6ZSB0aGUgdmlld1xuICAgIHRoaXMudmlld1RlbXBsYXRlID0gdmlldztcbiAgICB0aGlzLnZpZXdDb250ZW50ID0ge307XG4gICAgdGhpcy52aWV3Q3RvciA9IFBsYXllclZpZXc7XG4gICAgdGhpcy52aWV3T3B0aW9ucyA9IHsgcHJlc2VydmVQaXhlbFJhdGlvOiB0cnVlIH07XG4gICAgdGhpcy52aWV3ID0gdGhpcy5jcmVhdGVWaWV3KCk7XG5cbiAgICAvL2JpbmRcbiAgICB0aGlzLl90b01vdmUgPSB0aGlzLl90b01vdmUuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9pc0luRWxsaXBzZSA9IHRoaXMuX2lzSW5FbGxpcHNlLmJpbmQodGhpcyk7XG4gICAgdGhpcy5faXNJblJlY3QgPSB0aGlzLl9pc0luUmVjdC5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX2lzSW5MYXllciA9IHRoaXMuX2lzSW5MYXllci5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX2lzSW5QYXRoID0gdGhpcy5faXNJblBhdGguYmluZCh0aGlzKTtcbiAgICB0aGlzLl9pc0luU2hhcGUgPSB0aGlzLl9pc0luU2hhcGUuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9jcmVhdGVTb25vcldvcmxkID0gdGhpcy5fY3JlYXRlU29ub3JXb3JsZC5iaW5kKHRoaXMpOyAgICBcbiAgICB0aGlzLl91cGRhdGVHYWluID0gdGhpcy5fdXBkYXRlR2Fpbi5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX3JvdGF0ZVBvaW50ID0gdGhpcy5fcm90YXRlUG9pbnQuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9teUxpc3RlbmVyPSB0aGlzLl9teUxpc3RlbmVyLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fYWRkQmFsbCA9IHRoaXMuX2FkZEJhbGwuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9hZGRCYWNrZ3JvdW5kID0gdGhpcy5fYWRkQmFja2dyb3VuZC5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX3NldE1vZGVsID0gdGhpcy5fc2V0TW9kZWwuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9wcm9jZXNzUHJvYmEgPSB0aGlzLl9wcm9jZXNzUHJvYmEuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9yZXBsYWNlU2hhcGUgPSB0aGlzLl9yZXBsYWNlU2hhcGUuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9hZGRTaGFwZSA9IHRoaXMuX2FkZFNoYXBlLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fc3RhcnRTZWdtZW50ZXIgPSB0aGlzLl9zdGFydFNlZ21lbnRlci5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX3VwZGF0ZUF1ZGlvUGF0aCA9IHRoaXMuX3VwZGF0ZUF1ZGlvUGF0aC5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX3VwZGF0ZUF1ZGlvU2hhcGUgPSB0aGlzLl91cGRhdGVBdWRpb1NoYXBlLmJpbmQodGhpcyk7XG5cbiAgICAvL3JlY2VpdmVzXG4gICAgdGhpcy5yZWNlaXZlKCdiYWNrZ3JvdW5kJywgKGRhdGEpID0+IHRoaXMuX2FkZEJhY2tncm91bmQoZGF0YSkpO1xuICAgIHRoaXMucmVjZWl2ZSggJ21vZGVsJywgKG1vZGVsKSA9PiB0aGlzLl9zZXRNb2RlbChtb2RlbCkgKTtcbiAgICB0aGlzLnJlY2VpdmUoJ3NoYXBlQW5zd2VyJywgKHNoYXBlLCB4LCB5KSA9PiB0aGlzLl9hZGRTaGFwZShzaGFwZSwgeCwgeSkpO1xuXG4gfVxuXG4gIHN0YXJ0KCkge1xuICAgIGlmKCF0aGlzLnN0YXJ0T0spe1xuICAgICAgc3VwZXIuc3RhcnQoKTsgLy8gZG9uJ3QgZm9yZ2V0IHRoaXNcbiAgICAgIGlmICghdGhpcy5oYXNTdGFydGVkKVxuICAgICAgICB0aGlzLmluaXQoKTtcbiAgICAgIHRoaXMuc2hvdygpO1xuICAgIH1lbHNle1xuXG4gICAgICAvL3BhcmFtc1xuICAgICAgZG9jdW1lbnQuYm9keS5zdHlsZS5vdmVyZmxvdyA9IFwiaGlkZGVuXCI7ICBcbiAgICAgIHRoaXMubWlkZGxlWCA9IHdpbmRvdy5pbm5lcldpZHRoIC8gMjtcbiAgICAgIHRoaXMuc2NyZWVuU2l6ZVggPSB3aW5kb3cuaW5uZXJXaWR0aDtcbiAgICAgIHRoaXMuc2NyZWVuU2l6ZVkgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG4gICAgICB0aGlzLm1pZGRsZUVjcmFuWCA9IHRoaXMuc2NyZWVuU2l6ZVggLyAyO1xuICAgICAgdGhpcy5taWRkbGVFY3JhblkgPSB0aGlzLnNjcmVlblNpemVZIC8gMjtcbiAgICAgIHNldFRpbWVvdXQoICgpID0+e3RoaXMuX215TGlzdGVuZXIoMTAwKTt9ICwgMTAwKTtcbiAgICAgIHRoaXMubWlkZGxlWSA9IHdpbmRvdy5pbm5lckhlaWdodCAvIDI7XG4gICAgICB0aGlzLmVsbGlwc2VMaXN0TGF5ZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnZWxsaXBzZScpO1xuICAgICAgdGhpcy5yZWN0TGlzdExheWVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3JlY3QnKTtcbiAgICAgIHRoaXMudG90YWxFbGVtZW50cyA9IHRoaXMuZWxsaXBzZUxpc3RMYXllci5sZW5ndGggKyB0aGlzLnJlY3RMaXN0TGF5ZXIubGVuZ3RoO1xuICAgICAgdGhpcy50ZXh0TGlzdCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCd0ZXh0Jyk7XG4gICAgICB0aGlzLnNoYXBlTGlzdCA9IFtdO1xuICAgICAgdGhpcy5saXN0UmVjdFBhdGgxID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgncGF0aDAnKTtcbiAgICAgIHRoaXMubGlzdFJlY3RQYXRoMiA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ3BhdGgxJyk7XG4gICAgICB0aGlzLmxpc3RSZWN0UGF0aDMgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdwYXRoMicpO1xuICAgICAgdGhpcy5SZWN0TGlzdFNoYXBlMSA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ3NoYXBlMScpO1xuICAgICAgdGhpcy5SZWN0TGlzdFNoYXBlMiA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ3NoYXBlMicpO1xuICAgICAgdGhpcy5SZWN0TGlzdFNoYXBlMyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ3NoYXBlMycpO1xuICAgICAgdGhpcy5SZWN0TGlzdFNoYXBlNCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ3NoYXBlNCcpO1xuXG4gICAgICB0aGlzLl9hZGRCYWxsKDEwLCAxMCk7XG4gICAgICB0aGlzLl9yZXBsYWNlU2hhcGUoKTsgXG4gICAgICB0aGlzLl9jcmVhdGVTb25vcldvcmxkKCk7XG5cbiAgICAgIHRoaXMubWF4Q291bnRVcGRhdGUgPSAyO1xuICAgICAgdGhpcy5jb3VudFVwZGF0ZSA9IHRoaXMubWF4Q291bnRVcGRhdGUgKyAxOyBcbiAgICAgIHRoaXMudmlzdWFsaXNhdGlvblNoYXBlUGF0aCA9IGZhbHNlO1xuICAgICAgdGhpcy52aXN1YWxpc2F0aW9uQmFsbCA9IHRydWU7IFxuICAgICAgaWYoIXRoaXMudmlzdWFsaXNhdGlvbkJhbGwpe1xuICAgICAgICB0aGlzLnZpZXcuJGVsLnF1ZXJ5U2VsZWN0b3IoJyNiYWxsJykuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgIH1cbiAgICAgIHRoaXMudmlzdWFsaXNhdGlvblNoYXBlID0gZmFsc2U7XG4gICAgICBpZighdGhpcy52aXN1YWxpc2F0aW9uU2hhcGUpe1xuICAgICAgICBmb3IobGV0IGkgPSAwOyBpIDwgdGhpcy5lbGxpcHNlTGlzdExheWVyLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgICB0aGlzLmVsbGlwc2VMaXN0TGF5ZXJbaV0uc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgfVxuICAgICAgICBmb3IobGV0IGkgPSAwOyBpIDwgdGhpcy5yZWN0TGlzdExheWVyLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgICB0aGlzLnJlY3RMaXN0TGF5ZXJbaV0uc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgfVxuICAgICAgfSBcblxuICAgICAgdGhpcy5taXJyb3JCYWxsWCA9IDEwO1xuICAgICAgdGhpcy5taXJyb3JCYWxsWSA9IDEwO1xuICAgICAgdGhpcy5vZmZzZXRYID0gMDsgXG4gICAgICB0aGlzLm9mZnNldFkgPSAwO1xuICAgICAgdGhpcy5zdmdNYXhYID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3N2ZycpWzBdLmdldEF0dHJpYnV0ZSgnd2lkdGgnKTtcbiAgICAgIHRoaXMuc3ZnTWF4WSA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzdmcnKVswXS5nZXRBdHRyaWJ1dGUoJ2hlaWdodCcpO1xuXG4gICAgICB0aGlzLnRhYkluTGF5ZXI7XG4gICAgICBpZiAodGhpcy5tb3Rpb25JbnB1dC5pc0F2YWlsYWJsZSgnb3JpZW50YXRpb24nKSkge1xuICAgICAgICB0aGlzLm1vdGlvbklucHV0LmFkZExpc3RlbmVyKCdvcmllbnRhdGlvbicsIChkYXRhKSA9PiB7XG4gICAgICAgICAgY29uc3QgbmV3VmFsdWVzID0gdGhpcy5fdG9Nb3ZlKGRhdGFbMl0sZGF0YVsxXSAtIDI1KTtcbiAgICAgICAgICBpZih0aGlzLmNvdW50NCA+IHRoaXMubWF4TGFnKXtcbiAgICAgICAgICAgIHRoaXMudGFiSW5MYXllciA9IHRoaXMuX2lzSW5MYXllcihuZXdWYWx1ZXNbMF0sIG5ld1ZhbHVlc1sxXSk7XG4gICAgICAgICAgICB0aGlzLnRhYlBhdGggPSB0aGlzLl9pc0luUGF0aChuZXdWYWx1ZXNbMF0sIG5ld1ZhbHVlc1sxXSk7XG4gICAgICAgICAgICB0aGlzLnRhYlNoYXBlID0gdGhpcy5faXNJblNoYXBlKG5ld1ZhbHVlc1swXSwgbmV3VmFsdWVzWzFdKTtcbiAgICAgICAgICAgIHRoaXMuY291bnQ0ID0gLTE7XG4gICAgICAgICAgICBpZih0aGlzLmNvdW50VXBkYXRlID4gdGhpcy5tYXhDb3VudFVwZGF0ZSl7XG4gICAgICAgICAgICAgIHRoaXMuX3VwZGF0ZUdhaW4odGhpcy50YWJJbkxheWVyKTtcbiAgICAgICAgICAgICAgdGhpcy5jb3VudFVwZGF0ZSA9IDA7XG4gICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgdGhpcy5jb3VudFVwZGF0ZSsrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIHRoaXMuY291bnQ0Kys7XG4gICAgICAgICAgXG4gICAgICAgICAgdGhpcy5fbW92ZVNjcmVlblRvKG5ld1ZhbHVlc1swXSwgbmV3VmFsdWVzWzFdLCAwLjA4KTtcblxuICAgICAgICAgIGlmKHRoaXMubW9kZWxPSyl7XG4gICAgICAgICAgICB0aGlzLmRlY29kZXIucHJvY2VzcyhuZXdWYWx1ZXNbMF0sIG5ld1ZhbHVlc1sxXSk7XG4gICAgICAgICAgICB0aGlzLl9wcm9jZXNzUHJvYmEoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJPcmllbnRhdGlvbiBub24gZGlzcG9uaWJsZVwiKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBfYWRkQmFsbCh4LHkpe1xuICAgIGNvbnN0IGVsZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoJ2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJywnY2lyY2xlJyk7XG4gICAgZWxlbS5zZXRBdHRyaWJ1dGVOUyhudWxsLFwiY3hcIix4KTtcbiAgICBlbGVtLnNldEF0dHJpYnV0ZU5TKG51bGwsXCJjeVwiLHkpO1xuICAgIGVsZW0uc2V0QXR0cmlidXRlTlMobnVsbCxcInJcIiwxMCk7XG4gICAgZWxlbS5zZXRBdHRyaWJ1dGVOUyhudWxsLFwic3Ryb2tlXCIsJ3doaXRlJyk7XG4gICAgZWxlbS5zZXRBdHRyaWJ1dGVOUyhudWxsLFwic3Ryb2tlLXdpZHRoXCIsMyk7XG4gICAgZWxlbS5zZXRBdHRyaWJ1dGVOUyhudWxsLFwiZmlsbFwiLCdibGFjaycpO1xuICAgIGVsZW0uc2V0QXR0cmlidXRlTlMobnVsbCxcImlkXCIsJ2JhbGwnKTtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnc3ZnJylbMF0uYXBwZW5kQ2hpbGQoZWxlbSk7XG4gIH1cblxuICBfYWRkQmFja2dyb3VuZChiYWNrZ3JvdW5kKXtcbiAgICBjb25zdCBwYXJzZXIgPSBuZXcgRE9NUGFyc2VyKCk7XG4gICAgbGV0IGJhY2tncm91bmRYbWwgPSBwYXJzZXIucGFyc2VGcm9tU3RyaW5nKGJhY2tncm91bmQsICdhcHBsaWNhdGlvbi94bWwnKTtcbiAgICBiYWNrZ3JvdW5kWG1sID0gYmFja2dyb3VuZFhtbC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnc3ZnJylbMF07XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2V4cGVyaWVuY2UnKS5hcHBlbmRDaGlsZChiYWNrZ3JvdW5kWG1sKTtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnc3ZnJylbMF0uc2V0QXR0cmlidXRlKCdpZCcsICdzdmdFbGVtZW50JylcbiAgICB0aGlzLl9kZWxldGVSZWN0UGF0aCgpO1xuICAgIHRoaXMuc3RhcnRPSyA9IHRydWU7XG4gICAgdGhpcy5zdGFydCgpO1xuICB9XG5cbiAgX2RlbGV0ZVJlY3RQYXRoKCl7XG4gICAgbGV0IHRhYiA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ3BhdGgwJyk7XG4gICAgaWYoIXRoaXMudmlzdWFsaXNhdGlvblNoYXBlUGF0aCl7XG4gICAgICBmb3IobGV0IGkgPSAwIDsgaSA8IHRhYi5sZW5ndGg7IGkrKyl7XG4gICAgICAgIHRhYltpXS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgfVxuXG4gICAgICB0YWIgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdwYXRoMScpO1xuICAgICAgZm9yKGxldCBpID0gMCA7IGkgPCB0YWIubGVuZ3RoOyBpKyspe1xuICAgICAgICB0YWJbaV0uc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgIH1cblxuICAgICAgdGFiID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgncGF0aDInKTtcbiAgICAgIGZvcihsZXQgaSA9IDAgOyBpIDwgdGFiLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgdGFiW2ldLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgX2FkZFNoYXBlKHNoYXBlLCB4LCB5KXtcbiAgICBjb25zdCBwYXJzZXIgPSBuZXcgRE9NUGFyc2VyKCk7XG4gICAgbGV0IHNoYXBlWG1sID0gcGFyc2VyLnBhcnNlRnJvbVN0cmluZyhzaGFwZSwnYXBwbGljYXRpb24veG1sJyk7XG4gICAgc2hhcGVYbWwgPSBzaGFwZVhtbC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnZycpWzBdO1xuICAgIGxldCBiYWxsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2JhbGwnKTtcbiAgICBjb25zdCBzaGFwZVhtbFRhYiA9IHNoYXBlWG1sLmNoaWxkTm9kZXM7XG4gICAgZm9yKGxldCBpID0gMDsgaSA8IHNoYXBlWG1sVGFiLmxlbmd0aDsgaSsrKXtcbiAgICAgIGlmKHNoYXBlWG1sVGFiW2ldLm5vZGVOYW1lID09ICdwYXRoJyl7XG4gICAgICAgIGNvbnN0IG5ld05vZGUgPSBiYWxsLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKHNoYXBlWG1sVGFiW2ldLCBiYWxsKTtcbiAgICAgICAgdGhpcy5zaGFwZUxpc3RbdGhpcy5zaGFwZUxpc3QubGVuZ3RoXSA9IG5ld05vZGUuc2V0QXR0cmlidXRlKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKCcgKyB4ICsgJyAnICsgeSArICcpJyk7XG4gICAgICB9XG4gICAgfSBcbiAgfVxuXG4gIF90b01vdmUodmFsdWVYLCB2YWx1ZVkpe1xuICAgIGNvbnN0IG9iaiA9IHRoaXMudmlldy4kZWwucXVlcnlTZWxlY3RvcignI2JhbGwnKTtcbiAgICBsZXQgbmV3WDtcbiAgICBsZXQgbmV3WTtcbiAgICBsZXQgYWN0dSA9IHRoaXMubWlycm9yQmFsbFggKyB2YWx1ZVggKiAwLjM7XG4gICAgaWYoYWN0dSA8IHRoaXMub2Zmc2V0WCl7XG4gICAgICBhY3R1ID0gdGhpcy5vZmZzZXRYIDtcbiAgICB9ZWxzZSBpZihhY3R1ID4gKHRoaXMuc2NyZWVuU2l6ZVggKyB0aGlzLm9mZnNldFgpKXtcbiAgICAgIGFjdHUgPSB0aGlzLnNjcmVlblNpemVYICsgdGhpcy5vZmZzZXRYXG4gICAgfVxuICAgIGlmKHRoaXMudmlzdWFsaXNhdGlvbkJhbGwpe1xuICAgICAgb2JqLnNldEF0dHJpYnV0ZSgnY3gnLCBhY3R1KTtcbiAgICB9XG4gICAgdGhpcy5taXJyb3JCYWxsWCA9IGFjdHU7XG4gICAgbmV3WCA9IGFjdHU7XG4gICAgYWN0dSA9IHRoaXMubWlycm9yQmFsbFkgKyB2YWx1ZVkgKiAwLjM7XG4gICAgaWYoYWN0dSA8ICh0aGlzLm9mZnNldFkpKXtcbiAgICAgIGFjdHUgPSB0aGlzLm9mZnNldFk7XG4gICAgfVxuICAgIGlmKGFjdHUgPiAodGhpcy5zY3JlZW5TaXplWSArIHRoaXMub2Zmc2V0WSkpe1xuICAgICAgYWN0dSA9IHRoaXMuc2NyZWVuU2l6ZVkgKyB0aGlzLm9mZnNldFk7XG4gICAgfVxuICAgIGlmKHRoaXMudmlzdWFsaXNhdGlvbkJhbGwpe1xuICAgICAgb2JqLnNldEF0dHJpYnV0ZSgnY3knLCBhY3R1KTtcbiAgICB9XG4gICAgdGhpcy5taXJyb3JCYWxsWSA9IGFjdHU7XG4gICAgbmV3WSA9IGFjdHU7XG4gICAgcmV0dXJuIFtuZXdYLCBuZXdZXTtcbiAgfVxuXG4gIF9tb3ZlU2NyZWVuVG8oeCwgeSwgZm9yY2U9MSl7XG4gICAgbGV0IGRpc3RhbmNlWCA9ICh4IC0gdGhpcy5vZmZzZXRYKSAtIHRoaXMubWlkZGxlRWNyYW5YO1xuICAgIGxldCBuZWdYID0gZmFsc2U7XG4gICAgbGV0IGluZGljZVBvd1ggPSAzO1xuICAgIGxldCBpbmRpY2VQb3dZID0gMztcbiAgICBpZihkaXN0YW5jZVggPCAwKXtcbiAgICAgIG5lZ1ggPSB0cnVlO1xuICAgIH1cbiAgICBkaXN0YW5jZVggPSBNYXRoLnBvdygoTWF0aC5hYnMoZGlzdGFuY2VYIC8gdGhpcy5taWRkbGVFY3JhblgpKSwgaW5kaWNlUG93WCkgKiB0aGlzLm1pZGRsZUVjcmFuWDsgXG4gICAgaWYobmVnWCl7XG4gICAgICBkaXN0YW5jZVggKj0gLTE7XG4gICAgfVxuICAgIGlmKHRoaXMub2Zmc2V0WCArIChkaXN0YW5jZVggKiBmb3JjZSkgPj0gMCAmJiAodGhpcy5vZmZzZXRYICsgKGRpc3RhbmNlWCAqIGZvcmNlKSA8PSB0aGlzLnN2Z01heFggLSB0aGlzLnNjcmVlblNpemVYKSl7XG4gICAgICB0aGlzLm9mZnNldFggKz0gKGRpc3RhbmNlWCAqIGZvcmNlKTtcbiAgICB9XG5cbiAgICBsZXQgZGlzdGFuY2VZID0gKHkgLSB0aGlzLm9mZnNldFkpIC0gdGhpcy5taWRkbGVFY3Jhblk7XG4gICAgbGV0IG5lZ1kgPSBmYWxzZTtcbiAgICBpZihkaXN0YW5jZVkgPCAwKXtcbiAgICAgIG5lZ1kgPSB0cnVlO1xuICAgIH1cbiAgICBkaXN0YW5jZVkgPSBNYXRoLnBvdygoTWF0aC5hYnMoZGlzdGFuY2VZIC8gdGhpcy5taWRkbGVFY3JhblkpKSwgaW5kaWNlUG93WSkgKiB0aGlzLm1pZGRsZUVjcmFuWTtcbiAgICBpZihuZWdZKXtcbiAgICAgIGRpc3RhbmNlWSAqPSAtMTtcbiAgICB9XG4gICAgaWYoKHRoaXMub2Zmc2V0WSArIChkaXN0YW5jZVkgKiBmb3JjZSkgPj0gMCkgJiYgKHRoaXMub2Zmc2V0WSArIChkaXN0YW5jZVkgKiBmb3JjZSkgPD0gdGhpcy5zdmdNYXhZIC0gdGhpcy5zY3JlZW5TaXplWSkpe1xuICAgICAgdGhpcy5vZmZzZXRZICs9IChkaXN0YW5jZVkgKiBmb3JjZSk7XG4gICAgfVxuICAgIHdpbmRvdy5zY3JvbGwodGhpcy5vZmZzZXRYLCB0aGlzLm9mZnNldFkpXG4gIH1cblxuICBfbXlMaXN0ZW5lcih0aW1lKXtcbiAgICB0aGlzLnNjcmVlblNpemVYID0gd2luZG93LmlubmVyV2lkdGg7XG4gICAgdGhpcy5zY3JlZW5TaXplWSA9IHdpbmRvdy5pbm5lckhlaWdodDtcbiAgICBzZXRUaW1lb3V0KHRoaXMuX215TGlzdGVuZXIsIHRpbWUpO1xuICB9XG5cbiAgX3JlcGxhY2VTaGFwZSgpe1xuICAgIGxldCBuZXdMaXN0ID0gW107XG4gICAgZm9yKGxldCBpID0gMDsgaSA8IHRoaXMudGV4dExpc3QubGVuZ3RoOyBpKyspe1xuICAgICAgbmV3TGlzdFtpXSA9IHRoaXMudGV4dExpc3RbaV07XG4gICAgfVxuICAgIGZvcihsZXQgaSA9IDA7IGkgPCBuZXdMaXN0Lmxlbmd0aDsgaSsrKXtcbiAgICAgIGNvbnN0IGVsZW1lbnROYW1lID0gbmV3TGlzdFtpXS5pbm5lckhUTUw7XG4gICAgICAgaWYoZWxlbWVudE5hbWUuc2xpY2UoMCwgMSkgPT0gJ18nKXtcbiAgICAgICAgIGNvbnN0IHNoYXBlTmFtZSA9IGVsZW1lbnROYW1lLnNsaWNlKDEsIGVsZW1lbnROYW1lLmxlbmd0aCk7XG4gICAgICAgICBjb25zdCB4ID0gbmV3TGlzdFtpXS5nZXRBdHRyaWJ1dGUoJ3gnKTtcbiAgICAgICAgIGNvbnN0IHkgPSBuZXdMaXN0W2ldLmdldEF0dHJpYnV0ZSgneScpO1xuICAgICAgICAgdGhpcy5zZW5kKCdhc2tTaGFwZScsIHNoYXBlTmFtZSwgeCwgeSk7XG4gICAgICAgICBjb25zdCBwYXJlbnQgPSBuZXdMaXN0W2ldLnBhcmVudE5vZGU7XG4gICAgICAgICBwYXJlbnQucmVtb3ZlQ2hpbGQobmV3TGlzdFtpXSk7XG4gICAgICAgICBjb25zdCBlbGVtcyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoc2hhcGVOYW1lKTtcbiAgICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCBlbGVtcy5sZW5ndGg7IGkrKyl7XG4gICAgICAgICAgICBlbGVtc1tpXS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICAgfVxuICAgICAgIH1cbiAgICB9XG4gIH1cblxuICBfaXNJbkxheWVyKHgsIHkpe1xuICAgIGxldCB0YWIgPSBbXTtcbiAgICBsZXQgcm90YXRlQW5nbGU7XG4gICAgbGV0IG1pZGRsZVJvdGF0ZVg7XG4gICAgbGV0IG1pZGRsZVJvdGF0ZVk7XG4gICAgZm9yKGxldCBpID0gMDsgaSA8IHRoaXMuZWxsaXBzZUxpc3RMYXllci5sZW5ndGg7IGkrKyl7XG4gICAgICByb3RhdGVBbmdsZSA9IDA7XG4gICAgICBjb25zdCBtaWRkbGVYID0gdGhpcy5lbGxpcHNlTGlzdExheWVyW2ldLmdldEF0dHJpYnV0ZSgnY3gnKTtcbiAgICAgIGNvbnN0IG1pZGRsZVkgPSB0aGlzLmVsbGlwc2VMaXN0TGF5ZXJbaV0uZ2V0QXR0cmlidXRlKCdjeScpO1xuICAgICAgY29uc3QgcmFkaXVzWCA9IHRoaXMuZWxsaXBzZUxpc3RMYXllcltpXS5nZXRBdHRyaWJ1dGUoJ3J4Jyk7XG4gICAgICBjb25zdCByYWRpdXNZID0gdGhpcy5lbGxpcHNlTGlzdExheWVyW2ldLmdldEF0dHJpYnV0ZSgncnknKTtcbiAgICAgIGxldCB0cmFuc2Zvcm0gPSB0aGlzLmVsbGlwc2VMaXN0TGF5ZXJbaV0uZ2V0QXR0cmlidXRlKCd0cmFuc2Zvcm0nKTtcbiAgICAgIGlmKC9yb3RhdGUvLnRlc3QodHJhbnNmb3JtKSl7XG4gICAgICAgIHRyYW5zZm9ybSA9IHRyYW5zZm9ybS5zbGljZSg3LHRyYW5zZm9ybS5sZW5ndGgpO1xuICAgICAgICBtaWRkbGVSb3RhdGVYID0gcGFyc2VGbG9hdCh0cmFuc2Zvcm0uc3BsaXQoXCIgXCIpWzFdKTtcbiAgICAgICAgbWlkZGxlUm90YXRlWSA9IHBhcnNlRmxvYXQodHJhbnNmb3JtLnNwbGl0KFwiLFwiKVsxXS5yZXBsYWNlKFwiKVwiLCBcIlwiKSk7XG4gICAgICAgIHJvdGF0ZUFuZ2xlID0gcGFyc2VGbG9hdCh0cmFuc2Zvcm0uc3BsaXQoXCIgXCIpWzBdKTtcbiAgICAgIH1cbiAgICAgIHRhYlt0YWIubGVuZ3RoXT10aGlzLl9pc0luRWxsaXBzZShwYXJzZUZsb2F0KG1pZGRsZVgpLCBwYXJzZUZsb2F0KG1pZGRsZVkpLCBwYXJzZUZsb2F0KHJhZGl1c1gpLCBwYXJzZUZsb2F0KHJhZGl1c1kpLCB4LCB5LCByb3RhdGVBbmdsZSwgbWlkZGxlUm90YXRlWCwgbWlkZGxlUm90YXRlWSk7ICAgICBcbiAgICB9XG4gICAgZm9yKGxldCBpID0gMDsgaSA8IHRoaXMucmVjdExpc3RMYXllci5sZW5ndGg7IGkrKyl7XG4gICAgICByb3RhdGVBbmdsZSA9IDA7XG4gICAgICBtaWRkbGVSb3RhdGVYID0gbnVsbDtcbiAgICAgIG1pZGRsZVJvdGF0ZVkgPSBudWxsO1xuICAgICAgY29uc3QgaGVpZ2h0ID0gdGhpcy5yZWN0TGlzdExheWVyW2ldLmdldEF0dHJpYnV0ZSgnd2lkdGgnKTtcbiAgICAgIGNvbnN0IHdpZHRoID0gdGhpcy5yZWN0TGlzdExheWVyW2ldLmdldEF0dHJpYnV0ZSgnaGVpZ2h0Jyk7XG4gICAgICBjb25zdCBsZWZ0ID0gdGhpcy5yZWN0TGlzdExheWVyW2ldLmdldEF0dHJpYnV0ZSgneCcpO1xuICAgICAgY29uc3QgdG9wID0gdGhpcy5yZWN0TGlzdExheWVyW2ldLmdldEF0dHJpYnV0ZSgneScpO1xuICAgICAgbGV0IHRyYW5zZm9ybSA9IHRoaXMucmVjdExpc3RMYXllcltpXS5nZXRBdHRyaWJ1dGUoJ3RyYW5zZm9ybScpO1xuICAgICAgaWYoL3JvdGF0ZS8udGVzdCh0cmFuc2Zvcm0pKXtcbiAgICAgICAgdHJhbnNmb3JtID0gdHJhbnNmb3JtLnNsaWNlKDcsdHJhbnNmb3JtLmxlbmd0aCk7XG4gICAgICAgIG1pZGRsZVJvdGF0ZVggPSBwYXJzZUZsb2F0KHRyYW5zZm9ybS5zcGxpdChcIiBcIilbMV0pO1xuICAgICAgICBtaWRkbGVSb3RhdGVZID0gcGFyc2VGbG9hdCh0cmFuc2Zvcm0uc3BsaXQoXCIsXCIpWzFdLnJlcGxhY2UoXCIpXCIsIFwiXCIpKTtcbiAgICAgICAgcm90YXRlQW5nbGUgPSBwYXJzZUZsb2F0KHRyYW5zZm9ybS5zcGxpdChcIiBcIilbMF0pO1xuICAgICAgfVxuICAgICAgdGFiW3RhYi5sZW5ndGhdPXRoaXMuX2lzSW5SZWN0KHBhcnNlRmxvYXQoaGVpZ2h0KSwgcGFyc2VGbG9hdCh3aWR0aCksIHBhcnNlRmxvYXQobGVmdCksIHBhcnNlRmxvYXQodG9wKSwgeCwgeSwgcm90YXRlQW5nbGUsIG1pZGRsZVJvdGF0ZVgsIG1pZGRsZVJvdGF0ZVkpO1xuICAgIH0gIFxuICAgIHJldHVybiB0YWI7XG4gIH1cblxuICBfaXNJblBhdGgoeCwgeSl7XG5cbiAgICBsZXQgcm90YXRlQW5nbGU7XG4gICAgbGV0IG1pZGRsZVJvdGF0ZVg7XG4gICAgbGV0IG1pZGRsZVJvdGF0ZVk7XG4gICAgbGV0IGhlaWdodDtcbiAgICBsZXQgd2lkdGg7XG4gICAgbGV0IGxlZnQ7XG4gICAgbGV0IHRvcDtcbiAgICBsZXQgdHJhbnNmb3JtO1xuICAgIGxldCBpID0wO1xuXG4gICAgLy9QYXRoIDFcbiAgICBsZXQgcGF0aDEgPSBmYWxzZTtcbiAgICB3aGlsZSghcGF0aDEgJiYgaSA8IHRoaXMubGlzdFJlY3RQYXRoMS5sZW5ndGgpe1xuICAgICAgcm90YXRlQW5nbGUgPSAwO1xuICAgICAgbWlkZGxlUm90YXRlWCA9IG51bGw7XG4gICAgICBtaWRkbGVSb3RhdGVZID0gbnVsbDtcbiAgICAgIGhlaWdodCA9IHRoaXMubGlzdFJlY3RQYXRoMVtpXS5nZXRBdHRyaWJ1dGUoJ3dpZHRoJyk7XG4gICAgICB3aWR0aCA9IHRoaXMubGlzdFJlY3RQYXRoMVtpXS5nZXRBdHRyaWJ1dGUoJ2hlaWdodCcpO1xuICAgICAgbGVmdCA9IHRoaXMubGlzdFJlY3RQYXRoMVtpXS5nZXRBdHRyaWJ1dGUoJ3gnKTtcbiAgICAgIHRvcCA9IHRoaXMubGlzdFJlY3RQYXRoMVtpXS5nZXRBdHRyaWJ1dGUoJ3knKTtcbiAgICAgIGxldCB0cmFuc2Zvcm0gPSB0aGlzLmxpc3RSZWN0UGF0aDFbaV0uZ2V0QXR0cmlidXRlKCd0cmFuc2Zvcm1mb3JtJyk7XG4gICAgICBpZigvcm90YXRlLy50ZXN0KHRyYW5zZm9ybSkpe1xuICAgICAgICB0cmFuc2Zvcm0gPSB0cmFuc2Zvcm0uc2xpY2UoNyx0cmFuc2Zvcm0ubGVuZ3RoKTtcbiAgICAgICAgbWlkZGxlUm90YXRlWCA9IHBhcnNlRmxvYXQodHJhbnNmb3JtLnNwbGl0KFwiIFwiKVsxXSk7XG4gICAgICAgIG1pZGRsZVJvdGF0ZVkgPSBwYXJzZUZsb2F0KHRyYW5zZm9ybS5zcGxpdChcIixcIilbMV0ucmVwbGFjZShcIilcIiwgXCJcIikpO1xuICAgICAgICByb3RhdGVBbmdsZSA9IHBhcnNlRmxvYXQodHJhbnNmb3JtLnNwbGl0KFwiIFwiKVswXSk7XG4gICAgICB9XG4gICAgICBwYXRoMSA9IHRoaXMuX2lzSW5SZWN0KHBhcnNlRmxvYXQoaGVpZ2h0KSwgcGFyc2VGbG9hdCh3aWR0aCksIHBhcnNlRmxvYXQobGVmdCksIHBhcnNlRmxvYXQodG9wKSwgeCwgeSwgcm90YXRlQW5nbGUsIG1pZGRsZVJvdGF0ZVgsIG1pZGRsZVJvdGF0ZVkpO1xuICAgICAgaSsrO1xuICAgIH1cblxuICAgIC8vUGF0aCAyXG4gICAgbGV0IHBhdGgyID0gZmFsc2U7XG4gICAgaSA9MDtcbiAgICB3aGlsZSghcGF0aDIgJiYgaSA8IHRoaXMubGlzdFJlY3RQYXRoMi5sZW5ndGgpe1xuICAgICAgcm90YXRlQW5nbGUgPSAwO1xuICAgICAgbWlkZGxlUm90YXRlWCA9IG51bGw7XG4gICAgICBtaWRkbGVSb3RhdGVZID0gbnVsbDtcbiAgICAgIGhlaWdodCA9IHRoaXMubGlzdFJlY3RQYXRoMltpXS5nZXRBdHRyaWJ1dGUoJ3dpZHRoJyk7XG4gICAgICB3aWR0aCA9IHRoaXMubGlzdFJlY3RQYXRoMltpXS5nZXRBdHRyaWJ1dGUoJ2hlaWdodCcpO1xuICAgICAgbGVmdCA9IHRoaXMubGlzdFJlY3RQYXRoMltpXS5nZXRBdHRyaWJ1dGUoJ3gnKTtcbiAgICAgIHRvcCA9IHRoaXMubGlzdFJlY3RQYXRoMltpXS5nZXRBdHRyaWJ1dGUoJ3knKTtcbiAgICAgIHRyYW5zZm9ybSA9IHRoaXMubGlzdFJlY3RQYXRoMltpXS5nZXRBdHRyaWJ1dGUoJ3RyYW5zZm9ybWZvcm0nKTtcbiAgICAgIGlmKC9yb3RhdGUvLnRlc3QodHJhbnNmb3JtKSl7XG4gICAgICAgIHRyYW5zZm9ybSA9IHRyYW5zZm9ybS5zbGljZSg3LHRyYW5zZm9ybS5sZW5ndGgpO1xuICAgICAgICBtaWRkbGVSb3RhdGVYID0gcGFyc2VGbG9hdCh0cmFuc2Zvcm0uc3BsaXQoXCIgXCIpWzFdKTtcbiAgICAgICAgbWlkZGxlUm90YXRlWSA9IHBhcnNlRmxvYXQodHJhbnNmb3JtLnNwbGl0KFwiLFwiKVsxXS5yZXBsYWNlKFwiKVwiLCBcIlwiKSk7XG4gICAgICAgIHJvdGF0ZUFuZ2xlID0gcGFyc2VGbG9hdCh0cmFuc2Zvcm0uc3BsaXQoXCIgXCIpWzBdKTtcbiAgICAgIH1cbiAgICAgIHBhdGgyID0gdGhpcy5faXNJblJlY3QocGFyc2VGbG9hdChoZWlnaHQpLCBwYXJzZUZsb2F0KHdpZHRoKSwgcGFyc2VGbG9hdChsZWZ0KSwgcGFyc2VGbG9hdCh0b3ApLCB4LCB5LCByb3RhdGVBbmdsZSwgbWlkZGxlUm90YXRlWCwgbWlkZGxlUm90YXRlWSk7XG4gICAgICBpKys7XG4gICAgfVxuXG4gICAgLy9QYXRoIDNcbiAgICBsZXQgcGF0aDMgPSBmYWxzZTtcbiAgICBpID0wO1xuICAgIHdoaWxlKCFwYXRoMyAmJiBpPHRoaXMubGlzdFJlY3RQYXRoMy5sZW5ndGgpe1xuICAgICAgcm90YXRlQW5nbGU9MDtcbiAgICAgIG1pZGRsZVJvdGF0ZVg9bnVsbDtcbiAgICAgIG1pZGRsZVJvdGF0ZVk9bnVsbDtcbiAgICAgIGhlaWdodCA9IHRoaXMubGlzdFJlY3RQYXRoM1tpXS5nZXRBdHRyaWJ1dGUoJ3dpZHRoJyk7XG4gICAgICB3aWR0aCA9IHRoaXMubGlzdFJlY3RQYXRoM1tpXS5nZXRBdHRyaWJ1dGUoJ2hlaWdodCcpO1xuICAgICAgbGVmdCA9IHRoaXMubGlzdFJlY3RQYXRoM1tpXS5nZXRBdHRyaWJ1dGUoJ3gnKTtcbiAgICAgIHRvcCA9IHRoaXMubGlzdFJlY3RQYXRoM1tpXS5nZXRBdHRyaWJ1dGUoJ3knKTtcbiAgICAgIHRyYW5zZm9ybSA9IHRoaXMubGlzdFJlY3RQYXRoM1tpXS5nZXRBdHRyaWJ1dGUoJ3RyYW5zZm9ybWZvcm0nKTtcbiAgICAgIGlmKC9yb3RhdGUvLnRlc3QodHJhbnNmb3JtKSl7XG4gICAgICAgIHRyYW5zZm9ybSA9IHRyYW5zZm9ybS5zbGljZSg3LHRyYW5zZm9ybS5sZW5ndGgpO1xuICAgICAgICBtaWRkbGVSb3RhdGVYID0gcGFyc2VGbG9hdCh0cmFuc2Zvcm0uc3BsaXQoXCIgXCIpWzFdKTtcbiAgICAgICAgbWlkZGxlUm90YXRlWSA9IHBhcnNlRmxvYXQodHJhbnNmb3JtLnNwbGl0KFwiLFwiKVsxXS5yZXBsYWNlKFwiKVwiLCBcIlwiKSk7XG4gICAgICAgIHJvdGF0ZUFuZ2xlID0gcGFyc2VGbG9hdCh0cmFuc2Zvcm0uc3BsaXQoXCIgXCIpWzBdKTtcbiAgICAgIH1cbiAgICAgIHBhdGgzID0gdGhpcy5faXNJblJlY3QocGFyc2VGbG9hdChoZWlnaHQpLCBwYXJzZUZsb2F0KHdpZHRoKSwgcGFyc2VGbG9hdChsZWZ0KSwgcGFyc2VGbG9hdCh0b3ApLCB4LCB5LCByb3RhdGVBbmdsZSwgbWlkZGxlUm90YXRlWCwgbWlkZGxlUm90YXRlWSk7XG4gICAgICBpKys7XG4gICAgfSAgICAgICAgXG4gICAgcmV0dXJuIFtwYXRoMSwgcGF0aDIsIHBhdGgzXTtcbiAgfVxuXG4gIF9pc0luU2hhcGUoeCwgeSl7XG4gICAgLy9WYXJpYWJsZXNcbiAgICBsZXQgcm90YXRlQW5nbGU7XG4gICAgbGV0IG1pZGRsZVJvdGF0ZVg7XG4gICAgbGV0IG1pZGRsZVJvdGF0ZVk7XG4gICAgbGV0IGhlaWdodDtcbiAgICBsZXQgd2lkdGg7XG4gICAgbGV0IGxlZnQ7XG4gICAgbGV0IHRvcDtcbiAgICBsZXQgdHJhbnNmb3JtO1xuICAgIGxldCBpID0gMDtcblxuICAgIC8vc2hhcGUgMVxuICAgIGxldCBzaGFwZTEgPSBmYWxzZTtcbiAgICB3aGlsZSghc2hhcGUxICYmIGkgPCB0aGlzLlJlY3RMaXN0U2hhcGUxLmxlbmd0aCl7XG4gICAgICByb3RhdGVBbmdsZSA9IDA7XG4gICAgICBtaWRkbGVSb3RhdGVYID0gbnVsbDtcbiAgICAgIG1pZGRsZVJvdGF0ZVkgPSBudWxsO1xuICAgICAgaGVpZ2h0ID0gdGhpcy5SZWN0TGlzdFNoYXBlMVtpXS5nZXRBdHRyaWJ1dGUoJ3dpZHRoJyk7XG4gICAgICB3aWR0aCA9IHRoaXMuUmVjdExpc3RTaGFwZTFbaV0uZ2V0QXR0cmlidXRlKCdoZWlnaHQnKTtcbiAgICAgIGxlZnQgPSB0aGlzLlJlY3RMaXN0U2hhcGUxW2ldLmdldEF0dHJpYnV0ZSgneCcpO1xuICAgICAgdG9wID0gdGhpcy5SZWN0TGlzdFNoYXBlMVtpXS5nZXRBdHRyaWJ1dGUoJ3knKTtcbiAgICAgIGxldCB0cmFuc2Zvcm0gPSB0aGlzLlJlY3RMaXN0U2hhcGUxW2ldLmdldEF0dHJpYnV0ZSgndHJhbnNmb3JtJyk7XG4gICAgICBpZigvcm90YXRlLy50ZXN0KHRyYW5zZm9ybSkpe1xuICAgICAgICB0cmFuc2Zvcm0gPSB0cmFuc2Zvcm0uc2xpY2UoNyx0cmFuc2Zvcm0ubGVuZ3RoKTtcbiAgICAgICAgbWlkZGxlUm90YXRlWCA9IHBhcnNlRmxvYXQodHJhbnNmb3JtLnNwbGl0KFwiIFwiKVsxXSk7XG4gICAgICAgIG1pZGRsZVJvdGF0ZVkgPSBwYXJzZUZsb2F0KHRyYW5zZm9ybS5zcGxpdChcIixcIilbMV0ucmVwbGFjZShcIilcIiwgXCJcIikpO1xuICAgICAgICByb3RhdGVBbmdsZSA9IHBhcnNlRmxvYXQodHJhbnNmb3JtLnNwbGl0KFwiIFwiKVswXSk7XG4gICAgICB9XG4gICAgICBzaGFwZTEgPSB0aGlzLl9pc0luUmVjdChwYXJzZUZsb2F0KGhlaWdodCksIHBhcnNlRmxvYXQod2lkdGgpLCBwYXJzZUZsb2F0KGxlZnQpLCBwYXJzZUZsb2F0KHRvcCksIHgsIHksIHJvdGF0ZUFuZ2xlLCBtaWRkbGVSb3RhdGVYLCBtaWRkbGVSb3RhdGVZKTtcbiAgICAgIGkrKztcbiAgICB9XG5cbiAgICAvL3NoYXBlIDJcbiAgICBpID0gMDtcbiAgICBsZXQgc2hhcGUyID0gZmFsc2U7XG4gICAgd2hpbGUoIXNoYXBlMiAmJiBpIDwgdGhpcy5SZWN0TGlzdFNoYXBlMi5sZW5ndGgpe1xuICAgICAgcm90YXRlQW5nbGUgPSAwO1xuICAgICAgbWlkZGxlUm90YXRlWCA9IG51bGw7XG4gICAgICBtaWRkbGVSb3RhdGVZID0gbnVsbDtcbiAgICAgIGhlaWdodCA9IHRoaXMuUmVjdExpc3RTaGFwZTJbaV0uZ2V0QXR0cmlidXRlKCd3aWR0aCcpO1xuICAgICAgd2lkdGggPSB0aGlzLlJlY3RMaXN0U2hhcGUyW2ldLmdldEF0dHJpYnV0ZSgnaGVpZ2h0Jyk7XG4gICAgICBsZWZ0ID0gdGhpcy5SZWN0TGlzdFNoYXBlMltpXS5nZXRBdHRyaWJ1dGUoJ3gnKTtcbiAgICAgIHRvcCA9IHRoaXMuUmVjdExpc3RTaGFwZTJbaV0uZ2V0QXR0cmlidXRlKCd5Jyk7XG4gICAgICBsZXQgdHJhbnNmb3JtID0gdGhpcy5SZWN0TGlzdFNoYXBlMltpXS5nZXRBdHRyaWJ1dGUoJ3RyYW5zZm9ybScpO1xuICAgICAgaWYoL3JvdGF0ZS8udGVzdCh0cmFuc2Zvcm0pKXtcbiAgICAgICAgdHJhbnNmb3JtID0gdHJhbnNmb3JtLnNsaWNlKDcsdHJhbnNmb3JtLmxlbmd0aCk7XG4gICAgICAgIG1pZGRsZVJvdGF0ZVggPSBwYXJzZUZsb2F0KHRyYW5zZm9ybS5zcGxpdChcIiBcIilbMV0pO1xuICAgICAgICBtaWRkbGVSb3RhdGVZID0gcGFyc2VGbG9hdCh0cmFuc2Zvcm0uc3BsaXQoXCIsXCIpWzFdLnJlcGxhY2UoXCIpXCIsIFwiXCIpKTtcbiAgICAgICAgcm90YXRlQW5nbGUgPSBwYXJzZUZsb2F0KHRyYW5zZm9ybS5zcGxpdChcIiBcIilbMF0pO1xuICAgICAgfVxuICAgICAgc2hhcGUyID0gdGhpcy5faXNJblJlY3QocGFyc2VGbG9hdChoZWlnaHQpLCBwYXJzZUZsb2F0KHdpZHRoKSwgcGFyc2VGbG9hdChsZWZ0KSwgcGFyc2VGbG9hdCh0b3ApLCB4LCB5LCByb3RhdGVBbmdsZSwgbWlkZGxlUm90YXRlWCwgbWlkZGxlUm90YXRlWSk7XG4gICAgICBpKys7XG4gICAgfVxuXG4gICAgLy9zaGFwZSAzXG4gICAgaSA9IDA7XG4gICAgbGV0IHNoYXBlMyA9IGZhbHNlO1xuICAgIHdoaWxlKCFzaGFwZTMgJiYgaSA8IHRoaXMuUmVjdExpc3RTaGFwZTMubGVuZ3RoKXtcbiAgICAgIHJvdGF0ZUFuZ2xlID0gMDtcbiAgICAgIG1pZGRsZVJvdGF0ZVggPSBudWxsO1xuICAgICAgbWlkZGxlUm90YXRlWSA9IG51bGw7XG4gICAgICBoZWlnaHQgPSB0aGlzLlJlY3RMaXN0U2hhcGUzW2ldLmdldEF0dHJpYnV0ZSgnd2lkdGgnKTtcbiAgICAgIHdpZHRoID0gdGhpcy5SZWN0TGlzdFNoYXBlM1tpXS5nZXRBdHRyaWJ1dGUoJ2hlaWdodCcpO1xuICAgICAgbGVmdCA9IHRoaXMuUmVjdExpc3RTaGFwZTNbaV0uZ2V0QXR0cmlidXRlKCd4Jyk7XG4gICAgICB0b3AgPSB0aGlzLlJlY3RMaXN0U2hhcGUzW2ldLmdldEF0dHJpYnV0ZSgneScpO1xuICAgICAgbGV0IHRyYW5zZm9ybSA9IHRoaXMuUmVjdExpc3RTaGFwZTNbaV0uZ2V0QXR0cmlidXRlKCd0cmFuc2Zvcm0nKTtcbiAgICAgIGlmKC9yb3RhdGUvLnRlc3QodHJhbnNmb3JtKSl7XG4gICAgICAgIHRyYW5zZm9ybSA9IHRyYW5zZm9ybS5zbGljZSg3LHRyYW5zZm9ybS5sZW5ndGgpO1xuICAgICAgICBtaWRkbGVSb3RhdGVYID0gcGFyc2VGbG9hdCh0cmFuc2Zvcm0uc3BsaXQoXCIgXCIpWzFdKTtcbiAgICAgICAgbWlkZGxlUm90YXRlWSA9IHBhcnNlRmxvYXQodHJhbnNmb3JtLnNwbGl0KFwiLFwiKVsxXS5yZXBsYWNlKFwiKVwiLCBcIlwiKSk7XG4gICAgICAgIHJvdGF0ZUFuZ2xlID0gcGFyc2VGbG9hdCh0cmFuc2Zvcm0uc3BsaXQoXCIgXCIpWzBdKTtcbiAgICAgIH1cbiAgICAgIHNoYXBlMyA9IHRoaXMuX2lzSW5SZWN0KHBhcnNlRmxvYXQoaGVpZ2h0KSwgcGFyc2VGbG9hdCh3aWR0aCksIHBhcnNlRmxvYXQobGVmdCksIHBhcnNlRmxvYXQodG9wKSwgeCwgeSwgcm90YXRlQW5nbGUsIG1pZGRsZVJvdGF0ZVgsIG1pZGRsZVJvdGF0ZVkpO1xuICAgICAgaSsrO1xuICAgIH1cblxuICAgIC8vc2hhcGUgNFxuICAgIGkgPSAwO1xuICAgIGxldCBzaGFwZTQgPSBmYWxzZTtcbiAgICB3aGlsZSghc2hhcGU0ICYmIGkgPCB0aGlzLlJlY3RMaXN0U2hhcGU0Lmxlbmd0aCl7XG4gICAgICByb3RhdGVBbmdsZSA9IDA7XG4gICAgICBtaWRkbGVSb3RhdGVYID0gbnVsbDtcbiAgICAgIG1pZGRsZVJvdGF0ZVkgPSBudWxsO1xuICAgICAgaGVpZ2h0ID0gdGhpcy5SZWN0TGlzdFNoYXBlNFtpXS5nZXRBdHRyaWJ1dGUoJ3dpZHRoJyk7XG4gICAgICB3aWR0aCA9IHRoaXMuUmVjdExpc3RTaGFwZTRbaV0uZ2V0QXR0cmlidXRlKCdoZWlnaHQnKTtcbiAgICAgIGxlZnQgPSB0aGlzLlJlY3RMaXN0U2hhcGU0W2ldLmdldEF0dHJpYnV0ZSgneCcpO1xuICAgICAgdG9wID0gdGhpcy5SZWN0TGlzdFNoYXBlNFtpXS5nZXRBdHRyaWJ1dGUoJ3knKTtcbiAgICAgIGxldCB0cmFuc2Zvcm0gPSB0aGlzLlJlY3RMaXN0U2hhcGU0W2ldLmdldEF0dHJpYnV0ZSgndHJhbnNmb3JtJyk7XG4gICAgICBpZigvcm90YXRlLy50ZXN0KHRyYW5zZm9ybSkpe1xuICAgICAgICB0cmFuc2Zvcm0gPSB0cmFuc2Zvcm0uc2xpY2UoNywgdHJhbnNmb3JtLmxlbmd0aCk7XG4gICAgICAgIG1pZGRsZVJvdGF0ZVggPSBwYXJzZUZsb2F0KHRyYW5zZm9ybS5zcGxpdChcIiBcIilbMV0pO1xuICAgICAgICBtaWRkbGVSb3RhdGVZID0gcGFyc2VGbG9hdCh0cmFuc2Zvcm0uc3BsaXQoXCIsXCIpWzFdLnJlcGxhY2UoXCIpXCIsIFwiXCIpKTtcbiAgICAgICAgcm90YXRlQW5nbGUgPSBwYXJzZUZsb2F0KHRyYW5zZm9ybS5zcGxpdChcIiBcIilbMF0pO1xuICAgICAgfVxuICAgICAgc2hhcGU0ID0gdGhpcy5faXNJblJlY3QocGFyc2VGbG9hdChoZWlnaHQpLCBwYXJzZUZsb2F0KHdpZHRoKSwgcGFyc2VGbG9hdChsZWZ0KSwgcGFyc2VGbG9hdCh0b3ApLCB4LCB5LCByb3RhdGVBbmdsZSwgbWlkZGxlUm90YXRlWCwgbWlkZGxlUm90YXRlWSk7XG4gICAgICBpKys7XG4gICAgfVxuXG5cbiAgICByZXR1cm4gW3NoYXBlMSwgc2hhcGUyLCBzaGFwZTMsIHNoYXBlNF07XG5cbiAgfVxuXG4gICBfaXNJblJlY3QoaGVpZ2h0LCB3aWR0aCwgbGVmdCwgdG9wLCBwb2ludFgsIHBvaW50WSwgcm90YXRlQW5nbGUsIG1pZGRsZVJvdGF0ZVgsIG1pZGRsZVJvdGF0ZVkpe1xuICAgICAgXG4gICAgICBjb25zdCBuZXdQb2ludCA9IHRoaXMuX3JvdGF0ZVBvaW50KHBvaW50WCwgcG9pbnRZLCBtaWRkbGVSb3RhdGVYLCBtaWRkbGVSb3RhdGVZLCByb3RhdGVBbmdsZSk7XG5cbiAgICAgIGlmKG5ld1BvaW50WzBdID4gcGFyc2VJbnQobGVmdCkgJiYgbmV3UG9pbnRbMF0gPChwYXJzZUludChsZWZ0KStwYXJzZUludChoZWlnaHQpKSAmJiBuZXdQb2ludFsxXSA+IHRvcCAmJiBuZXdQb2ludFsxXSA8IChwYXJzZUludCh0b3ApICsgcGFyc2VJbnQod2lkdGgpKSl7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfWVsc2V7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgIH1cblxuICBfaXNJbkVsbGlwc2UobWlkZGxlWCwgbWlkZGxlWSwgcmFkaXVzWCwgcmFkaXVzWSwgcG9pbnRYLCBwb2ludFksIHJvdGF0ZUFuZ2xlLCBtaWRkbGVSb3RhdGVYLCBtaWRkbGVSb3RhdGVZKXtcblxuICAgIGNvbnN0IG5ld1BvaW50ID0gdGhpcy5fcm90YXRlUG9pbnQocG9pbnRYLCBwb2ludFksIG1pZGRsZVJvdGF0ZVgsIG1pZGRsZVJvdGF0ZVksIHJvdGF0ZUFuZ2xlKTtcblxuICAgIGxldCBhID0gcmFkaXVzWDs7IFxuICAgIGxldCBiID0gcmFkaXVzWTsgXG4gICAgY29uc3QgY2FsYyA9ICgoTWF0aC5wb3coIChuZXdQb2ludFswXSAtIG1pZGRsZVgpLCAyKSApIC8gKE1hdGgucG93KGEsIDIpKSkgKyAoKE1hdGgucG93KChuZXdQb2ludFsxXSAtIG1pZGRsZVkpLCAyKSkgLyAoTWF0aC5wb3coYiwgMikpKTtcbiAgICBpZihjYWxjIDw9IDEpe1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfWVsc2V7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgX3JvdGF0ZVBvaW50KHgsIHksIG1pZGRsZVgsIG1pZGRsZVksIGFuZ2xlKXtcbiAgICBsZXQgbmV3QW5nbGUgPSBhbmdsZSAqICgzLjE0MTU5MjY1IC8gMTgwKTtcbiAgICBsZXQgbmV3WCA9ICh4IC0gbWlkZGxlWCkgKiBNYXRoLmNvcyhuZXdBbmdsZSkgKyAoeSAtIG1pZGRsZVkpICogTWF0aC5zaW4obmV3QW5nbGUpO1xuICAgIGxldCBuZXdZID0gLTEgKiAoeCAtIG1pZGRsZVgpICogTWF0aC5zaW4obmV3QW5nbGUpICsgKHkgLSBtaWRkbGVZKSAqIE1hdGguY29zKG5ld0FuZ2xlKTtcbiAgICBuZXdYICs9IG1pZGRsZVg7XG4gICAgbmV3WSArPSBtaWRkbGVZO1xuICAgIHJldHVybiBbbmV3WCwgbmV3WV07XG4gIH1cblxuLyogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tU09OLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tICovXG5cbiAgXG4gIF9jcmVhdGVTb25vcldvcmxkKCl7XG5cbiAgICAvL0dyYWluXG4gICAgdGhpcy5ncmFpbiA9IG5ldyBNeUdyYWluKCk7XG4gICAgc2NoZWR1bGVyLmFkZCh0aGlzLmdyYWluKTtcbiAgICB0aGlzLmdyYWluLmNvbm5lY3QoYXVkaW9Db250ZXh0LmRlc3RpbmF0aW9uKTtcbiAgICBjb25zdCBidWZmZXJBc3NvY2llcyA9IFs1LCA3LCA5XTtcbiAgICBjb25zdCBtYXJrZXJBc3NvY2llcyA9IFs2LCA4LCAxMF07XG5cbiAgICAvL1NlZ21lbnRlclxuICAgIGZvcihsZXQgaSA9IDA7IGkgPCB0aGlzLm5iUGF0aDsgaSsrKXtcbiAgICAgIGxldCBpZEJ1ZmZlciA9IGJ1ZmZlckFzc29jaWVzW2ldO1xuICAgICAgbGV0IGlkTWFya2VyID0gbWFya2VyQXNzb2NpZXNbaV07XG4gICAgICB0aGlzLnNlZ21lbnRlcltpXSA9IG5ldyB3YXZlcy5TZWdtZW50RW5naW5lKHtcbiAgICAgICAgYnVmZmVyOiB0aGlzLmxvYWRlci5idWZmZXJzW2lkQnVmZmVyXSxcbiAgICAgICAgcG9zaXRpb25BcnJheTogdGhpcy5sb2FkZXIuYnVmZmVyc1tpZE1hcmtlcl0udGltZSxcbiAgICAgICAgZHVyYXRpb25BcnJheTogdGhpcy5sb2FkZXIuYnVmZmVyc1tpZE1hcmtlcl0uZHVyYXRpb24sXG4gICAgICAgIHBlcmlvZEFiczogMTAsXG4gICAgICAgIHBlcmlvZFJlbDogMTAsXG4gICAgICB9KTtcbiAgICAgIHRoaXMuc2VnbWVudGVyR2FpbltpXSA9IGF1ZGlvQ29udGV4dC5jcmVhdGVHYWluKCk7XG4gICAgICB0aGlzLnNlZ21lbnRlckdhaW5HcmFpbltpXSA9IGF1ZGlvQ29udGV4dC5jcmVhdGVHYWluKCk7XG4gICAgICB0aGlzLnNlZ21lbnRlckdhaW5HcmFpbltpXS5nYWluLnNldFZhbHVlQXRUaW1lKDAsIGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSk7XG4gICAgICB0aGlzLnNlZ21lbnRlckdhaW5baV0uZ2Fpbi5zZXRWYWx1ZUF0VGltZSgwLCBhdWRpb0NvbnRleHQuY3VycmVudFRpbWUpO1xuICAgICAgdGhpcy5zZWdtZW50ZXJHYWluR3JhaW5baV0uY29ubmVjdCh0aGlzLmdyYWluLmlucHV0KTtcbiAgICAgIHRoaXMuc2VnbWVudGVyR2FpbltpXS5jb25uZWN0KGF1ZGlvQ29udGV4dC5kZXN0aW5hdGlvbik7XG4gICAgICB0aGlzLnNlZ21lbnRlcltpXS5jb25uZWN0KHRoaXMuc2VnbWVudGVyR2FpbltpXSk7XG4gICAgICB0aGlzLnNlZ21lbnRlcltpXS5jb25uZWN0KHRoaXMuc2VnbWVudGVyR2FpbkdyYWluW2ldKTtcbiAgICAgIHRoaXMuX3N0YXJ0U2VnbWVudGVyKGkpO1xuXG4gICAgfVxuXG4gICAgZm9yKGxldCBpID0gMDsgaSA8IHRoaXMudG90YWxFbGVtZW50czsgaSsrKXtcblxuICAgICAgLy9jcmVhdGUgZGlyZWN0IGdhaW5cbiAgICAgIHRoaXMuZ2FpbnNEaXJlY3Rpb25zW2ldID0gJ2Rvd24nO1xuICAgICAgdGhpcy5nYWluc1tpXSA9IGF1ZGlvQ29udGV4dC5jcmVhdGVHYWluKCk7XG4gICAgICB0aGlzLmdhaW5zW2ldLmdhaW4udmFsdWUgPSAwO1xuICAgICAgdGhpcy5nYWluc1tpXS5jb25uZWN0KHRoaXMuZ3JhaW4uaW5wdXQpO1xuXG4gICAgICAvL2NyZWF0ZSBncmFpbiBnYWluXG4gICAgICB0aGlzLnNvdXJjZXNbaV0gPSBhdWRpb0NvbnRleHQuY3JlYXRlQnVmZmVyU291cmNlKCk7XG4gICAgICB0aGlzLnNvdXJjZXNbaV0uYnVmZmVyID0gdGhpcy5sb2FkZXIuYnVmZmVyc1tpICUgNV07XG4gICAgICB0aGlzLnNvdXJjZXNbaV0uY29ubmVjdCh0aGlzLmdhaW5zW2ldKTtcbiAgICAgIHRoaXMuc291cmNlc1tpXS5sb29wID0gdHJ1ZTtcbiAgICAgIHRoaXMuc291cmNlc1tpXS5zdGFydCgpO1xuXG4gICAgfVxuXG4gICAgdGhpcy5nYWluT3V0cHV0RGlyZWN0ID0gYXVkaW9Db250ZXh0LmNyZWF0ZUdhaW4oKTtcbiAgICB0aGlzLmdhaW5PdXRwdXREaXJlY3QuZ2Fpbi52YWx1ZSA9IDA7XG4gICAgdGhpcy5nYWluT3V0cHV0RGlyZWN0LmNvbm5lY3QoYXVkaW9Db250ZXh0LmRlc3RpbmF0aW9uKTtcbiAgICB0aGlzLmdhaW5PdXRwdXRHcmFpbiA9IGF1ZGlvQ29udGV4dC5jcmVhdGVHYWluKCk7XG4gICAgdGhpcy5nYWluT3V0cHV0R3JhaW4uZ2Fpbi52YWx1ZSA9IDA7XG4gICAgdGhpcy5nYWluT3V0cHV0R3JhaW4uY29ubmVjdCh0aGlzLmdyYWluLmlucHV0KTtcblxuXG4gICAgZm9yKGxldCBpID0gMCA7IGkgPCB0aGlzLm5iU2hhcGUgOyBpKyspe1xuXG4gICAgICAvL2NyZWF0ZSBkaXJlY3QgZ2FpblxuICAgICAgdGhpcy5nYWluc1NoYXBlW2ldID0gYXVkaW9Db250ZXh0LmNyZWF0ZUdhaW4oKTtcbiAgICAgIHRoaXMuZ2FpbnNTaGFwZVtpXS5nYWluLnZhbHVlID0gMDtcbiAgICAgIHRoaXMuZ2FpbnNTaGFwZVtpXS5jb25uZWN0KHRoaXMuZ2Fpbk91dHB1dERpcmVjdCk7XG5cbiAgICAgIC8vY3JlYXRlIGdyYWluIGdhaW5cbiAgICAgIHRoaXMuZ2FpbnNHcmFpblNoYXBlW2ldID0gYXVkaW9Db250ZXh0LmNyZWF0ZUdhaW4oKTtcbiAgICAgIHRoaXMuZ2FpbnNHcmFpblNoYXBlW2ldLmdhaW4udmFsdWUgPSAwO1xuICAgICAgdGhpcy5nYWluc0dyYWluU2hhcGVbaV0uY29ubmVjdCh0aGlzLmdhaW5PdXRwdXRHcmFpbik7XG5cbiAgICAgIC8vc29ub3Igc3JjXG4gICAgICB0aGlzLnNvdW5kU2hhcGVbaV0gPSBhdWRpb0NvbnRleHQuY3JlYXRlQnVmZmVyU291cmNlKCk7XG4gICAgICB0aGlzLnNvdW5kU2hhcGVbaV0uYnVmZmVyID0gdGhpcy5sb2FkZXIuYnVmZmVyc1sxMCArIChpICsgMSldO1xuICAgICAgdGhpcy5zb3VuZFNoYXBlW2ldLmNvbm5lY3QodGhpcy5nYWluc1NoYXBlW2ldKTtcbiAgICAgIHRoaXMuc291bmRTaGFwZVtpXS5jb25uZWN0KHRoaXMuZ2FpbnNHcmFpblNoYXBlW2ldKTtcbiAgICAgIHRoaXMuc291bmRTaGFwZVtpXS5sb29wID0gdHJ1ZTtcbiAgICAgIHRoaXMuc291bmRTaGFwZVtpXS5zdGFydCgpO1xuXG4gICAgfVxuICAgICBcbiAgfVxuXG5cbiAgX3N0YXJ0U2VnbWVudGVyKGkpe1xuICAgIHRoaXMuc2VnbWVudGVyW2ldLnRyaWdnZXIoKTtcbiAgICBsZXQgbmV3UGVyaW9kID0gcGFyc2VGbG9hdCh0aGlzLmxvYWRlci5idWZmZXJzWzYgKyAoaSAqIDIpXVsnZHVyYXRpb24nXVt0aGlzLnNlZ21lbnRlcltpXS5zZWdtZW50SW5kZXhdKSAqIDEwMDA7XG4gICAgc2V0VGltZW91dCggKCkgPT4ge3RoaXMuX3N0YXJ0U2VnbWVudGVyKGkpO30gLCBcbiAgICBuZXdQZXJpb2QpO1xuICB9XG5cbiAgX3VwZGF0ZUdhaW4odGFiSW5MYXllcil7XG4gICAgZm9yKGxldCBpID0gMDsgaSA8IHRhYkluTGF5ZXIubGVuZ3RoOyBpKyspe1xuICAgICAgaWYodGhpcy5nYWluc1tpXS5nYWluLnZhbHVlID09IDAgJiYgdGFiSW5MYXllcltpXSAmJiB0aGlzLmdhaW5zRGlyZWN0aW9uc1tpXSA9PSAnZG93bicpe1xuICAgICAgICBsZXQgYWN0dWFsID0gdGhpcy5nYWluc1tpXS5nYWluLnZhbHVlO1xuICAgICAgICB0aGlzLmdhaW5zW2ldLmdhaW4uY2FuY2VsU2NoZWR1bGVkVmFsdWVzKGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSk7XG4gICAgICAgIHRoaXMuZ2FpbnNbaV0uZ2Fpbi5zZXRWYWx1ZUF0VGltZShhY3R1YWwsIGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSk7XG4gICAgICAgIHRoaXMuZ2FpbnNbaV0uZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgwLjI0LCBhdWRpb0NvbnRleHQuY3VycmVudFRpbWUgKyAyLjMpO1xuICAgICAgICB0aGlzLmdhaW5zRGlyZWN0aW9uc1tpXSA9ICd1cCc7XG4gICAgICB9ZWxzZSBpZih0aGlzLmdhaW5zW2ldLmdhaW4udmFsdWUgIT0gMCAmJiAhdGFiSW5MYXllcltpXSAmJiB0aGlzLmdhaW5zRGlyZWN0aW9uc1tpXSA9PSAndXAnKXtcbiAgICAgICAgbGV0IGFjdHVhbCA9IHRoaXMuZ2FpbnNbaV0uZ2Fpbi52YWx1ZTtcbiAgICAgICAgdGhpcy5nYWluc1tpXS5nYWluLmNhbmNlbFNjaGVkdWxlZFZhbHVlcyhhdWRpb0NvbnRleHQuY3VycmVudFRpbWUpO1xuICAgICAgICB0aGlzLmdhaW5zW2ldLmdhaW4uc2V0VmFsdWVBdFRpbWUoYWN0dWFsLCBhdWRpb0NvbnRleHQuY3VycmVudFRpbWUpO1xuICAgICAgICB0aGlzLmdhaW5zW2ldLmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoMCwgYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lICsgMy41KTtcbiAgICAgICAgdGhpcy5nYWluc0RpcmVjdGlvbnNbaV0gPSAnZG93bic7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgX3VwZGF0ZUF1ZGlvUGF0aChpKXtcbiAgICBpZih0aGlzLnRhYlBhdGhbaV0pe1xuICAgICAgbGV0IGFjdHVhbDEgPSB0aGlzLnNlZ21lbnRlckdhaW5baV0uZ2Fpbi52YWx1ZTtcbiAgICAgIGxldCBhY3R1YWwyID0gdGhpcy5zZWdtZW50ZXJHYWluR3JhaW5baV0uZ2Fpbi52YWx1ZTtcbiAgICAgIHRoaXMuc2VnbWVudGVyR2FpbltpXS5nYWluLmNhbmNlbFNjaGVkdWxlZFZhbHVlcyhhdWRpb0NvbnRleHQuY3VycmVudFRpbWUpO1xuICAgICAgdGhpcy5zZWdtZW50ZXJHYWluR3JhaW5baV0uZ2Fpbi5jYW5jZWxTY2hlZHVsZWRWYWx1ZXMoYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lKTtcbiAgICAgIHRoaXMuc2VnbWVudGVyR2FpbltpXS5nYWluLnNldFZhbHVlQXRUaW1lKGFjdHVhbDEsYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lKTtcbiAgICAgIHRoaXMuc2VnbWVudGVyR2FpbkdyYWluW2ldLmdhaW4uc2V0VmFsdWVBdFRpbWUoYWN0dWFsMixhdWRpb0NvbnRleHQuY3VycmVudFRpbWUpO1xuICAgICAgdGhpcy5zZWdtZW50ZXJHYWluR3JhaW5baV0uZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgwLCBhdWRpb0NvbnRleHQuY3VycmVudFRpbWUgKyAxKTtcbiAgICAgIHRoaXMuc2VnbWVudGVyR2FpbltpXS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKDAuMjUsIGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSArIDAuNik7XG4gICAgfWVsc2V7XG4gICAgICBsZXQgYWN0dWFsMSA9IHRoaXMuc2VnbWVudGVyR2FpbltpXS5nYWluLnZhbHVlO1xuICAgICAgbGV0IGFjdHVhbDIgPSB0aGlzLnNlZ21lbnRlckdhaW5HcmFpbltpXS5nYWluLnZhbHVlO1xuICAgICAgdGhpcy5zZWdtZW50ZXJHYWluW2ldLmdhaW4uY2FuY2VsU2NoZWR1bGVkVmFsdWVzKGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSk7XG4gICAgICB0aGlzLnNlZ21lbnRlckdhaW5HcmFpbltpXS5nYWluLmNhbmNlbFNjaGVkdWxlZFZhbHVlcyhhdWRpb0NvbnRleHQuY3VycmVudFRpbWUpO1xuICAgICAgdGhpcy5zZWdtZW50ZXJHYWluW2ldLmdhaW4uc2V0VmFsdWVBdFRpbWUoYWN0dWFsMSwgYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lKTtcbiAgICAgIHRoaXMuc2VnbWVudGVyR2FpbkdyYWluW2ldLmdhaW4uc2V0VmFsdWVBdFRpbWUoYWN0dWFsMiwgYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lKTtcbiAgICAgIGlmKHRoaXMuZW5kU3RhcnRTZWdtZW50ZXJbaV0pe1xuICAgICAgICB0aGlzLnNlZ21lbnRlckdhaW5HcmFpbltpXS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKGFjdHVhbDEgKyAwLjE1LCBhdWRpb0NvbnRleHQuY3VycmVudFRpbWUgKyAwLjEpO1xuICAgICAgICBzZXRUaW1lb3V0KCAoKT0+e1xuICAgICAgICAgIHRoaXMuc2VnbWVudGVyR2FpbkdyYWluW2ldLmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoMCwgYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lICsgMC4zKTsgICAgICAgICBcbiAgICAgICAgfVxuICAgICAgICAsIDIwMDApO1xuICAgICAgICB0aGlzLnNlZ21lbnRlckdhaW5baV0uZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgwLCBhdWRpb0NvbnRleHQuY3VycmVudFRpbWUgKyAwLjQpO1xuICAgICAgfWVsc2V7XG4gICAgICAgIHRoaXMuZW5kU3RhcnRTZWdtZW50ZXJbaV0gPSB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIF91cGRhdGVBdWRpb1NoYXBlKGlkKXtcbiAgICBcbiAgICAvL3NoYXBlMVxuICAgIGlmKGlkID09IDAgJiYgdGhpcy50YWJTaGFwZVtpZF0pe1xuICAgICAgbGV0IGdhaW5HcmFpbiA9IDEgLSAodGhpcy5yYW1wU2hhcGVbXCJzaGFwZTFcIl0gLyAxMDAwKTtcbiAgICAgIGxldCBnYWluRGlyZWN0ID0gdGhpcy5yYW1wU2hhcGVbXCJzaGFwZTFcIl0gLyAxMDAwO1xuICAgICAgaWYoZ2FpbkRpcmVjdCA8IDApe1xuICAgICAgICBnYWluRGlyZWN0ID0gMDtcbiAgICAgIH1lbHNlIGlmKGdhaW5EaXJlY3QgPiAxKXtcbiAgICAgICAgZ2FpbkRpcmVjdCA9IDE7XG4gICAgICB9XG4gICAgICBpZihnYWluR3JhaW4gPCAwKXtcbiAgICAgICAgZ2FpbkdyYWluID0gMDtcbiAgICAgIH1lbHNlIGlmKGdhaW5HcmFpbiA+IDEpe1xuICAgICAgICBnYWluR3JhaW4gPSAxO1xuICAgICAgfVxuICAgICAgaWYodGhpcy50YWJTaGFwZVtpZF0pe1xuICAgICAgICB0aGlzLmdhaW5zU2hhcGVbaWRdLmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoZ2FpbkRpcmVjdCwgYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lICsgMC4wMSk7XG4gICAgICAgIHRoaXMuZ2FpbnNHcmFpblNoYXBlW2lkXS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKGdhaW5HcmFpbiwgYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lICsgMC4wMSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy9zaGFwZTJcbiAgICBpZihpZCA9PSAxICYmIHRoaXMudGFiU2hhcGVbaWRdKXtcbiAgICAgIGxldCBnYWluR3JhaW4gPSAxIC0gKHRoaXMucmFtcFNoYXBlW1wic2hhcGUyXCJdIC8gMTAwMCk7XG4gICAgICBsZXQgZ2FpbkRpcmVjdCA9IHRoaXMucmFtcFNoYXBlW1wic2hhcGUyXCJdIC8gMTAwMDtcbiAgICAgIGlmKGdhaW5EaXJlY3QgPCAwKXtcbiAgICAgICAgZ2FpbkRpcmVjdCA9IDA7XG4gICAgICB9ZWxzZSBpZihnYWluRGlyZWN0ID4gMSl7XG4gICAgICAgIGdhaW5EaXJlY3QgPSAxO1xuICAgICAgfVxuICAgICAgaWYoZ2FpbkdyYWluIDwgMCl7XG4gICAgICAgIGdhaW5HcmFpbiA9IDA7XG4gICAgICB9ZWxzZSBpZihnYWluR3JhaW4gPiAxKXtcbiAgICAgICAgZ2FpbkdyYWluID0gMTtcbiAgICAgIH1cbiAgICAgIGlmKHRoaXMudGFiU2hhcGVbaWRdKXtcbiAgICAgICAgdGhpcy5nYWluc1NoYXBlW2lkXS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKGdhaW5EaXJlY3QsIGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSArIDAuMDEpO1xuICAgICAgICB0aGlzLmdhaW5zR3JhaW5TaGFwZVtpZF0uZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZShnYWluR3JhaW4sIGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSArIDAuMDEpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vc2hhcGUzXG4gICAgaWYoaWQgPT0gMiAmJiB0aGlzLnRhYlNoYXBlW2lkXSl7XG4gICAgICBsZXQgZ2FpbkdyYWluID0gMSAtICh0aGlzLnJhbXBTaGFwZVtcInNoYXBlM1wiXSAvIDEwMDApO1xuICAgICAgbGV0IGdhaW5EaXJlY3QgPSB0aGlzLnJhbXBTaGFwZVtcInNoYXBlM1wiXSAvIDEwMDA7XG4gICAgICBpZihnYWluRGlyZWN0IDwgMCl7XG4gICAgICAgIGdhaW5EaXJlY3QgPSAwO1xuICAgICAgfWVsc2UgaWYoZ2FpbkRpcmVjdCA+IDEpe1xuICAgICAgICBnYWluRGlyZWN0ID0gMTtcbiAgICAgIH1cbiAgICAgIGlmKGdhaW5HcmFpbiA8IDApe1xuICAgICAgICBnYWluR3JhaW4gPSAwO1xuICAgICAgfWVsc2UgaWYoZ2FpbkdyYWluID4gMSl7XG4gICAgICAgIGdhaW5HcmFpbiA9IDE7XG4gICAgICB9XG4gICAgICBpZih0aGlzLnRhYlNoYXBlW2lkXSl7XG4gICAgICAgIHRoaXMuZ2FpbnNTaGFwZVtpZF0uZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZShnYWluRGlyZWN0LCBhdWRpb0NvbnRleHQuY3VycmVudFRpbWUgKyAwLjAxKTtcbiAgICAgICAgdGhpcy5nYWluc0dyYWluU2hhcGVbaWRdLmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoZ2FpbkdyYWluLCBhdWRpb0NvbnRleHQuY3VycmVudFRpbWUgKyAwLjAxKTtcbiAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgLy9zaGFwZTRcbiAgICBpZihpZCA9PSAzICYmIHRoaXMudGFiU2hhcGVbaWRdKXtcbiAgICAgIGxldCBnYWluR3JhaW4gPSAxIC0gKHRoaXMucmFtcFNoYXBlW1wic2hhcGU0XCJdIC8gMTAwMCk7XG4gICAgICBsZXQgZ2FpbkRpcmVjdCA9IHRoaXMucmFtcFNoYXBlW1wic2hhcGU0XCJdIC8gMTAwMDtcbiAgICAgIGlmKGdhaW5EaXJlY3QgPCAwKXtcbiAgICAgICAgZ2FpbkRpcmVjdCA9IDA7XG4gICAgICB9ZWxzZSBpZihnYWluRGlyZWN0ID4gMSl7XG4gICAgICAgIGdhaW5EaXJlY3QgPSAxO1xuICAgICAgfVxuICAgICAgaWYoZ2FpbkdyYWluIDwgMCl7XG4gICAgICAgIGdhaW5HcmFpbiA9IDA7XG4gICAgICB9ZWxzZSBpZihnYWluR3JhaW4gPiAxKXtcbiAgICAgICAgZ2FpbkdyYWluID0gMTtcbiAgICAgIH1cbiAgICAgIGlmKHRoaXMudGFiU2hhcGVbaWRdKXtcbiAgICAgICAgdGhpcy5nYWluc1NoYXBlW2lkXS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKGdhaW5EaXJlY3QsIGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSArIDAuMDEpO1xuICAgICAgICB0aGlzLmdhaW5zR3JhaW5TaGFwZVtpZF0uZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZShnYWluR3JhaW4sIGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSArIDAuMDEpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmKCF0aGlzLnRhYlNoYXBlWzBdICYmICh0aGlzLnRhYlNoYXBlWzBdICE9IHRoaXMub2xkU2hhcGVbMF0pKXtcbiAgICAgIHRoaXMuZ2FpbnNTaGFwZVswXS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKDAsIGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSArIDEuNSk7XG4gICAgICB0aGlzLmdhaW5zR3JhaW5TaGFwZVswXS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKDAsIGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSArIDEuNSk7XG4gICAgfVxuICAgIGlmKCF0aGlzLnRhYlNoYXBlWzFdICYmICh0aGlzLnRhYlNoYXBlWzFdICE9IHRoaXMub2xkU2hhcGVbMV0pKXtcbiAgICAgIHRoaXMuZ2FpbnNTaGFwZVsxXS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKDAsIGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSArIDEuNSk7XG4gICAgICB0aGlzLmdhaW5zR3JhaW5TaGFwZVsxXS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKDAsIGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSArIDEuNSk7XG4gICAgfVxuICAgIGlmKCF0aGlzLnRhYlNoYXBlWzJdICYmICh0aGlzLnRhYlNoYXBlWzJdICE9IHRoaXMub2xkU2hhcGVbMl0pKXtcbiAgICAgIHRoaXMuZ2FpbnNTaGFwZVsyXS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKDAsIGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSArIDEuNSk7XG4gICAgICB0aGlzLmdhaW5zR3JhaW5TaGFwZVsyXS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKDAsIGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSArIDEuNSk7XG4gICAgfVxuICAgIGlmKCF0aGlzLnRhYlNoYXBlWzNdICYmICh0aGlzLnRhYlNoYXBlWzNdICE9IHRoaXMub2xkU2hhcGVbM10pKXtcbiAgICAgIHRoaXMuZ2FpbnNTaGFwZVszXS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKDAsIGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSArIDEuNSk7XG4gICAgICB0aGlzLmdhaW5zR3JhaW5TaGFwZVszXS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKDAsIGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSArIDEuNSk7XG4gICAgfVxuXG4gICAgdGhpcy5vbGRTaGFwZSA9IFt0aGlzLnRhYlNoYXBlWzBdLHRoaXMudGFiU2hhcGVbMV0sdGhpcy50YWJTaGFwZVsyXSx0aGlzLnRhYlNoYXBlWzNdXTtcblxuICAgIGlmKHRoaXMudGFiU2hhcGVbMF0gfHwgdGhpcy50YWJTaGFwZVsxXSB8fCB0aGlzLnRhYlNoYXBlWzJdIHx8IHRoaXMudGFiU2hhcGVbM10pe1xuICAgICAgdGhpcy5kZWNvZGVyLnJlc2V0KCk7XG4gICAgfVxuXG4gIH1cblxuXG4gIC8qIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tWE1NLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gKi9cblxuICBfc2V0TW9kZWwobW9kZWwsbW9kZWwxLG1vZGVsMil7XG4gICAgdGhpcy5kZWNvZGVyLnNldE1vZGVsKG1vZGVsKTtcbiAgICB0aGlzLm1vZGVsT0sgPSB0cnVlO1xuICB9XG5cbiAgX3Byb2Nlc3NQcm9iYSgpeyAgICBcbiAgICBsZXQgcHJvYmFNYXggPSB0aGlzLmRlY29kZXIuZ2V0UHJvYmEoKTtcbiAgICAvL1BhdGhcbiAgICBmb3IobGV0IGkgPSAwIDsgaSA8IHRoaXMubmJQYXRoIDsgaSArKyl7XG4gICAgICB0aGlzLnNlZ21lbnRlcltpXS5zZWdtZW50SW5kZXggPSBNYXRoLnRydW5jKE1hdGgucmFuZG9tKCkgKiB0aGlzLnF0UmFuZG9tKTtcbiAgICAgIGlmKHRoaXMudGFiUGF0aFtpXSAhPSB0aGlzLm9sZFRhYlBhdGhbaV0pe1xuICAgICAgICAgdGhpcy5fdXBkYXRlQXVkaW9QYXRoKGkpO1xuICAgICAgfVxuICAgICAgdGhpcy5vbGRUYWJQYXRoW2ldID0gdGhpcy50YWJQYXRoW2ldO1xuICAgIH1cblxuICAgIC8vU2hhcGVcbiAgICBsZXQgZGlyZWN0ID0gZmFsc2U7XG4gICAgbGV0IGkgPSAwO1xuICAgIHdoaWxlKCAhZGlyZWN0ICYmIChpIDwgdGhpcy5uYlNoYXBlKSApe1xuICAgICAgaWYodGhpcy50YWJTaGFwZVtpXSl7XG4gICAgICAgIGRpcmVjdCA9IHRydWU7XG4gICAgICB9XG4gICAgICBpKytcbiAgICB9XG5cbiAgIGxldCBhY3R1YWwxID0gdGhpcy5nYWluT3V0cHV0RGlyZWN0LmdhaW4udmFsdWU7XG4gICBsZXQgYWN0dWFsMiA9IHRoaXMuZ2Fpbk91dHB1dEdyYWluLmdhaW4udmFsdWU7XG5cbiAgICBpZihkaXJlY3QgIT0gdGhpcy5vbGQpe1xuICAgICAgaWYoZGlyZWN0KXtcbiAgICAgICAgdGhpcy5nYWluT3V0cHV0RGlyZWN0LmdhaW4uY2FuY2VsU2NoZWR1bGVkVmFsdWVzKGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSk7XG4gICAgICAgIHRoaXMuZ2Fpbk91dHB1dERpcmVjdC5nYWluLnNldFZhbHVlQXRUaW1lKGFjdHVhbDEsIGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSk7XG4gICAgICAgIHRoaXMuZ2Fpbk91dHB1dERpcmVjdC5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKDAuNSwgYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lICsgMik7XG4gICAgICAgIHRoaXMuZ2Fpbk91dHB1dEdyYWluLmdhaW4uY2FuY2VsU2NoZWR1bGVkVmFsdWVzKGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSk7XG4gICAgICAgIHRoaXMuZ2Fpbk91dHB1dEdyYWluLmdhaW4uc2V0VmFsdWVBdFRpbWUoYWN0dWFsMSwgYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lKTtcbiAgICAgICAgdGhpcy5nYWluT3V0cHV0R3JhaW4uZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgwLjUsIGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSArIDIpO1xuICAgICAgICB0aGlzLnJhbXBTaGFwZVsnc2hhcGUxJ10gPSAwO1xuICAgICAgICB0aGlzLnJhbXBTaGFwZVsnc2hhcGUyJ10gPSAwO1xuICAgICAgICB0aGlzLnJhbXBTaGFwZVsnc2hhcGUzJ10gPSAwO1xuICAgICAgICB0aGlzLnJhbXBTaGFwZVsnc2hhcGU0J10gPSAwO1xuICAgICAgfWVsc2V7XG4gICAgICAgIHRoaXMuZ2Fpbk91dHB1dERpcmVjdC5nYWluLmNhbmNlbFNjaGVkdWxlZFZhbHVlcyhhdWRpb0NvbnRleHQuY3VycmVudFRpbWUpO1xuICAgICAgICB0aGlzLmdhaW5PdXRwdXREaXJlY3QuZ2Fpbi5zZXRWYWx1ZUF0VGltZShhY3R1YWwxLCBhdWRpb0NvbnRleHQuY3VycmVudFRpbWUpO1xuICAgICAgICB0aGlzLmdhaW5PdXRwdXREaXJlY3QuZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgwLCBhdWRpb0NvbnRleHQuY3VycmVudFRpbWUgKyAyKTtcbiAgICAgICAgdGhpcy5nYWluT3V0cHV0R3JhaW4uZ2Fpbi5jYW5jZWxTY2hlZHVsZWRWYWx1ZXMoYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lKTtcbiAgICAgICAgdGhpcy5nYWluT3V0cHV0R3JhaW4uZ2Fpbi5zZXRWYWx1ZUF0VGltZShhY3R1YWwxLCBhdWRpb0NvbnRleHQuY3VycmVudFRpbWUpO1xuICAgICAgICB0aGlzLmdhaW5PdXRwdXRHcmFpbi5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKDAsIGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSArIDIpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMub2xkID0gZGlyZWN0O1xuXG4gICAgaWYoZGlyZWN0KXtcblxuICAgICAgZm9yKGxldCBpID0gMDsgaTx0aGlzLm5iU2hhcGUgOyBpKyspe1xuICAgICAgICBpZihwcm9iYU1heD09J3NoYXBlMScpe1xuICAgICAgICAgIHRoaXMucmFtcFNoYXBlWydzaGFwZTInXS0tO1xuICAgICAgICAgIHRoaXMucmFtcFNoYXBlWydzaGFwZTMnXS0tO1xuICAgICAgICAgIHRoaXMucmFtcFNoYXBlWydzaGFwZTQnXS0tO1xuICAgICAgICB9ZWxzZSBpZihwcm9iYU1heCA9PSAnc2hhcGUyJyl7XG4gICAgICAgICAgdGhpcy5yYW1wU2hhcGVbJ3NoYXBlMSddLS07XG4gICAgICAgICAgdGhpcy5yYW1wU2hhcGVbJ3NoYXBlMyddLS07XG4gICAgICAgICAgdGhpcy5yYW1wU2hhcGVbJ3NoYXBlNCddLS07XG4gICAgICAgIH1lbHNlIGlmKHByb2JhTWF4ID09ICdzaGFwZTMnKXtcbiAgICAgICAgICB0aGlzLnJhbXBTaGFwZVsnc2hhcGUxJ10tLTtcbiAgICAgICAgICB0aGlzLnJhbXBTaGFwZVsnc2hhcGUyJ10tLTtcbiAgICAgICAgICB0aGlzLnJhbXBTaGFwZVsnc2hhcGU0J10tLTtcbiAgICAgICAgfWVsc2UgaWYocHJvYmFNYXggPT0gJ3NoYXBlNCcpe1xuICAgICAgICAgIHRoaXMucmFtcFNoYXBlWydzaGFwZTEnXS0tO1xuICAgICAgICAgIHRoaXMucmFtcFNoYXBlWydzaGFwZTInXS0tO1xuICAgICAgICAgIHRoaXMucmFtcFNoYXBlWydzaGFwZTMnXS0tO1xuICAgICAgICB9ZWxzZSBpZihwcm9iYU1heCA9PSBudWxsKXtcbiAgICAgICAgICB0aGlzLnJhbXBTaGFwZVsnc2hhcGUxJ10tLTtcbiAgICAgICAgICB0aGlzLnJhbXBTaGFwZVsnc2hhcGUyJ10tLTtcbiAgICAgICAgICB0aGlzLnJhbXBTaGFwZVsnc2hhcGUzJ10tLTtcbiAgICAgICAgICB0aGlzLnJhbXBTaGFwZVsnc2hhcGU0J10tLTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMucmFtcFNoYXBlW3Byb2JhTWF4XSsrO1xuXG4gICAgICAgIGlmKHRoaXMucmFtcFNoYXBlWydzaGFwZTEnXSA8IDApIHRoaXMucmFtcFNoYXBlWydzaGFwZTEnXSA9IDA7XG4gICAgICAgIGlmKHRoaXMucmFtcFNoYXBlWydzaGFwZTInXSA8IDApIHRoaXMucmFtcFNoYXBlWydzaGFwZTInXSA9IDA7XG4gICAgICAgIGlmKHRoaXMucmFtcFNoYXBlWydzaGFwZTMnXSA8IDApIHRoaXMucmFtcFNoYXBlWydzaGFwZTMnXSA9IDA7XG4gICAgICAgIGlmKHRoaXMucmFtcFNoYXBlWydzaGFwZTQnXSA8IDApIHRoaXMucmFtcFNoYXBlWydzaGFwZTQnXSA9IDA7XG4gICAgICB9XG5cbiAgICB9XG5cbiAgICBmb3IobGV0IGkgPSAwIDsgaSA8IHRoaXMubmJTaGFwZSA7IGkrKyl7XG4gICAgICB0aGlzLl91cGRhdGVBdWRpb1NoYXBlKGkpO1xuICAgIH1cblxuICB9XG5cbn1cbiJdfQ==