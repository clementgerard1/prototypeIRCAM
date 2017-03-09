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
              console.log(_this4.tabPath);
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
        var _transform2 = this.listRectPath1[i].getAttribute('transform');
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
        transform = this.listRectPath2[i].getAttribute('transform');
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
        transform = this.listRectPath3[i].getAttribute('transform');
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
        setTimeout(this._startSegmenter(i), 2000);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlBsYXllckV4cGVyaWVuY2UuanMiXSwibmFtZXMiOlsic291bmR3b3JrcyIsIndhdmVzIiwiYXVkaW9Db250ZXh0Iiwic2NoZWR1bGVyIiwiZ2V0U2NoZWR1bGVyIiwiUGxheWVyVmlldyIsInRlbXBsYXRlIiwiY29udGVudCIsImV2ZW50cyIsIm9wdGlvbnMiLCJWaWV3IiwidmlldyIsIlBsYXllckV4cGVyaWVuY2UiLCJhc3NldHNEb21haW4iLCJwbGF0Zm9ybSIsInJlcXVpcmUiLCJmZWF0dXJlcyIsIm1vdGlvbklucHV0IiwiZGVzY3JpcHRvcnMiLCJsb2FkZXIiLCJmaWxlcyIsImdhaW5PdXRwdXREaXJlY3QiLCJnYWluT3V0cHV0R3JhaW4iLCJncmFpbiIsInN0YXJ0T0siLCJtb2RlbE9LIiwibmJQYXRoIiwibmJTaGFwZSIsInF0UmFuZG9tIiwib2xkIiwibmJTZWdtZW50IiwibGFzdFNlZ21lbnQiLCJsYXN0UG9zaXRpb24iLCJjb3VudDQiLCJtYXhMYWciLCJlbmRTdGFydFNlZ21lbnRlciIsImNvdW50VGltZW91dCIsImRpcmVjdGlvbiIsIm9sZFRhYlBhdGgiLCJjb3VudDEiLCJjb3VudDIiLCJzZWdtZW50ZXIiLCJzZWdtZW50ZXJHYWluIiwic2VnbWVudGVyR2FpbkdyYWluIiwic291cmNlcyIsImdhaW5zIiwiZ2FpbnNEaXJlY3Rpb25zIiwiZ2FpbnNTaGFwZSIsIm9sZFNoYXBlIiwiZ2FpbnNHcmFpblNoYXBlIiwic291bmRTaGFwZSIsInJhbXBTaGFwZSIsImNvdW50TWF4IiwiZGVjb2RlciIsImkiLCJ2aWV3VGVtcGxhdGUiLCJ2aWV3Q29udGVudCIsInZpZXdDdG9yIiwidmlld09wdGlvbnMiLCJwcmVzZXJ2ZVBpeGVsUmF0aW8iLCJjcmVhdGVWaWV3IiwiX3RvTW92ZSIsImJpbmQiLCJfaXNJbkVsbGlwc2UiLCJfaXNJblJlY3QiLCJfaXNJbkxheWVyIiwiX2lzSW5QYXRoIiwiX2lzSW5TaGFwZSIsIl9jcmVhdGVTb25vcldvcmxkIiwiX3VwZGF0ZUdhaW4iLCJfcm90YXRlUG9pbnQiLCJfbXlMaXN0ZW5lciIsIl9hZGRCYWxsIiwiX2FkZEJhY2tncm91bmQiLCJfc2V0TW9kZWwiLCJfcHJvY2Vzc1Byb2JhIiwiX3JlcGxhY2VTaGFwZSIsIl9hZGRTaGFwZSIsIl9zdGFydFNlZ21lbnRlciIsIl91cGRhdGVBdWRpb1BhdGgiLCJfdXBkYXRlQXVkaW9TaGFwZSIsInJlY2VpdmUiLCJkYXRhIiwibW9kZWwiLCJzaGFwZSIsIngiLCJ5IiwiaGFzU3RhcnRlZCIsImluaXQiLCJzaG93IiwiZG9jdW1lbnQiLCJib2R5Iiwic3R5bGUiLCJvdmVyZmxvdyIsIm1pZGRsZVgiLCJ3aW5kb3ciLCJpbm5lcldpZHRoIiwic2NyZWVuU2l6ZVgiLCJzY3JlZW5TaXplWSIsImlubmVySGVpZ2h0IiwibWlkZGxlRWNyYW5YIiwibWlkZGxlRWNyYW5ZIiwic2V0VGltZW91dCIsIm1pZGRsZVkiLCJlbGxpcHNlTGlzdExheWVyIiwiZ2V0RWxlbWVudHNCeVRhZ05hbWUiLCJyZWN0TGlzdExheWVyIiwidG90YWxFbGVtZW50cyIsImxlbmd0aCIsInRleHRMaXN0Iiwic2hhcGVMaXN0IiwibGlzdFJlY3RQYXRoMSIsImdldEVsZW1lbnRzQnlDbGFzc05hbWUiLCJsaXN0UmVjdFBhdGgyIiwibGlzdFJlY3RQYXRoMyIsIlJlY3RMaXN0U2hhcGUxIiwiUmVjdExpc3RTaGFwZTIiLCJSZWN0TGlzdFNoYXBlMyIsIlJlY3RMaXN0U2hhcGU0IiwibWF4Q291bnRVcGRhdGUiLCJjb3VudFVwZGF0ZSIsInZpc3VhbGlzYXRpb25TaGFwZVBhdGgiLCJ2aXN1YWxpc2F0aW9uQmFsbCIsIiRlbCIsInF1ZXJ5U2VsZWN0b3IiLCJkaXNwbGF5IiwidmlzdWFsaXNhdGlvblNoYXBlIiwibWlycm9yQmFsbFgiLCJtaXJyb3JCYWxsWSIsIm9mZnNldFgiLCJvZmZzZXRZIiwic3ZnTWF4WCIsImdldEF0dHJpYnV0ZSIsInN2Z01heFkiLCJ0YWJJbkxheWVyIiwiaXNBdmFpbGFibGUiLCJhZGRMaXN0ZW5lciIsIm5ld1ZhbHVlcyIsInRhYlBhdGgiLCJjb25zb2xlIiwibG9nIiwidGFiU2hhcGUiLCJfbW92ZVNjcmVlblRvIiwicHJvY2VzcyIsImVsZW0iLCJjcmVhdGVFbGVtZW50TlMiLCJzZXRBdHRyaWJ1dGVOUyIsImFwcGVuZENoaWxkIiwiYmFja2dyb3VuZCIsInBhcnNlciIsIkRPTVBhcnNlciIsImJhY2tncm91bmRYbWwiLCJwYXJzZUZyb21TdHJpbmciLCJnZXRFbGVtZW50QnlJZCIsInNldEF0dHJpYnV0ZSIsIl9kZWxldGVSZWN0UGF0aCIsInN0YXJ0IiwidGFiIiwic2hhcGVYbWwiLCJiYWxsIiwic2hhcGVYbWxUYWIiLCJjaGlsZE5vZGVzIiwibm9kZU5hbWUiLCJuZXdOb2RlIiwicGFyZW50Tm9kZSIsImluc2VydEJlZm9yZSIsInZhbHVlWCIsInZhbHVlWSIsIm9iaiIsIm5ld1giLCJuZXdZIiwiYWN0dSIsImZvcmNlIiwiZGlzdGFuY2VYIiwibmVnWCIsImluZGljZVBvd1giLCJpbmRpY2VQb3dZIiwiTWF0aCIsInBvdyIsImFicyIsImRpc3RhbmNlWSIsIm5lZ1kiLCJzY3JvbGwiLCJ0aW1lIiwibmV3TGlzdCIsImVsZW1lbnROYW1lIiwiaW5uZXJIVE1MIiwic2xpY2UiLCJzaGFwZU5hbWUiLCJzZW5kIiwicGFyZW50IiwicmVtb3ZlQ2hpbGQiLCJlbGVtcyIsInJvdGF0ZUFuZ2xlIiwibWlkZGxlUm90YXRlWCIsIm1pZGRsZVJvdGF0ZVkiLCJyYWRpdXNYIiwicmFkaXVzWSIsInRyYW5zZm9ybSIsInRlc3QiLCJwYXJzZUZsb2F0Iiwic3BsaXQiLCJyZXBsYWNlIiwiaGVpZ2h0Iiwid2lkdGgiLCJsZWZ0IiwidG9wIiwicGF0aDEiLCJwYXRoMiIsInBhdGgzIiwic2hhcGUxIiwic2hhcGUyIiwic2hhcGUzIiwic2hhcGU0IiwicG9pbnRYIiwicG9pbnRZIiwibmV3UG9pbnQiLCJwYXJzZUludCIsImEiLCJiIiwiY2FsYyIsImFuZ2xlIiwibmV3QW5nbGUiLCJjb3MiLCJzaW4iLCJhZGQiLCJjb25uZWN0IiwiZGVzdGluYXRpb24iLCJidWZmZXJBc3NvY2llcyIsIm1hcmtlckFzc29jaWVzIiwiaWRCdWZmZXIiLCJpZE1hcmtlciIsIlNlZ21lbnRFbmdpbmUiLCJidWZmZXIiLCJidWZmZXJzIiwicG9zaXRpb25BcnJheSIsImR1cmF0aW9uQXJyYXkiLCJkdXJhdGlvbiIsInBlcmlvZEFicyIsInBlcmlvZFJlbCIsImNyZWF0ZUdhaW4iLCJnYWluIiwic2V0VmFsdWVBdFRpbWUiLCJjdXJyZW50VGltZSIsImlucHV0IiwidmFsdWUiLCJjcmVhdGVCdWZmZXJTb3VyY2UiLCJsb29wIiwidHJpZ2dlciIsIm5ld1BlcmlvZCIsInNlZ21lbnRJbmRleCIsImFjdHVhbCIsImNhbmNlbFNjaGVkdWxlZFZhbHVlcyIsImxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lIiwiYWN0dWFsMSIsImFjdHVhbDIiLCJpZCIsImdhaW5HcmFpbiIsImdhaW5EaXJlY3QiLCJyZXNldCIsIm1vZGVsMSIsIm1vZGVsMiIsInNldE1vZGVsIiwicHJvYmFNYXgiLCJnZXRQcm9iYSIsInJhbmRvbSIsImRpcmVjdCIsIkV4cGVyaWVuY2UiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7SUFBWUEsVTs7QUFDWjs7OztBQUNBOztJQUFZQyxLOztBQUNaOzs7Ozs7OztBQUVBLElBQU1DLGVBQWVGLFdBQVdFLFlBQWhDO0FBQ0EsSUFBTUMsWUFBWUYsTUFBTUcsWUFBTixFQUFsQjs7SUFFTUMsVTs7O0FBQ0osc0JBQVlDLFFBQVosRUFBc0JDLE9BQXRCLEVBQStCQyxNQUEvQixFQUF1Q0MsT0FBdkMsRUFBZ0Q7QUFBQTtBQUFBLHlJQUN4Q0gsUUFEd0MsRUFDOUJDLE9BRDhCLEVBQ3JCQyxNQURxQixFQUNiQyxPQURhO0FBRS9DOzs7RUFIc0JULFdBQVdVLEk7O0FBTXBDLElBQU1DLFNBQU47O0FBRUE7QUFDQTs7SUFDcUJDLGdCOzs7QUFDbkIsNEJB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LGVBQUtBLFNBQUwsQ0FBZW9OLFFBQWY7O0FBRUEsY0FBRyxLQUFLcE4sU0FBTCxDQUFlLFFBQWYsSUFBMkIsQ0FBOUIsRUFBaUMsS0FBS0EsU0FBTCxDQUFlLFFBQWYsSUFBMkIsQ0FBM0I7QUFDakMsY0FBRyxLQUFLQSxTQUFMLENBQWUsUUFBZixJQUEyQixDQUE5QixFQUFpQyxLQUFLQSxTQUFMLENBQWUsUUFBZixJQUEyQixDQUEzQjtBQUNqQyxjQUFHLEtBQUtBLFNBQUwsQ0FBZSxRQUFmLElBQTJCLENBQTlCLEVBQWlDLEtBQUtBLFNBQUwsQ0FBZSxRQUFmLElBQTJCLENBQTNCO0FBQ2pDLGNBQUcsS0FBS0EsU0FBTCxDQUFlLFFBQWYsSUFBMkIsQ0FBOUIsRUFBaUMsS0FBS0EsU0FBTCxDQUFlLFFBQWYsSUFBMkIsQ0FBM0I7QUFDbEM7QUFFRjs7QUFFRCxXQUFJLElBQUlHLE9BQUksQ0FBWixFQUFnQkEsT0FBSSxLQUFLM0IsT0FBekIsRUFBbUMyQixNQUFuQyxFQUF1QztBQUNyQyxhQUFLMEIsaUJBQUwsQ0FBdUIxQixJQUF2QjtBQUNEO0FBRUY7OztFQWg3QjJDdEQsV0FBVzJRLFU7O2tCQUFwQy9QLGdCIiwiZmlsZSI6IlBsYXllckV4cGVyaWVuY2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBzb3VuZHdvcmtzIGZyb20gJ3NvdW5kd29ya3MvY2xpZW50JztcbmltcG9ydCBNeUdyYWluIGZyb20gJy4vTXlHcmFpbi5qcyc7XG5pbXBvcnQgKiBhcyB3YXZlcyBmcm9tICd3YXZlcy1hdWRpbyc7XG5pbXBvcnQgRGVjb2RlciBmcm9tICcuL0RlY29kZXIuanMnO1xuXG5jb25zdCBhdWRpb0NvbnRleHQgPSBzb3VuZHdvcmtzLmF1ZGlvQ29udGV4dDtcbmNvbnN0IHNjaGVkdWxlciA9IHdhdmVzLmdldFNjaGVkdWxlcigpO1xuXG5jbGFzcyBQbGF5ZXJWaWV3IGV4dGVuZHMgc291bmR3b3Jrcy5WaWV3e1xuICBjb25zdHJ1Y3Rvcih0ZW1wbGF0ZSwgY29udGVudCwgZXZlbnRzLCBvcHRpb25zKSB7XG4gICAgc3VwZXIodGVtcGxhdGUsIGNvbnRlbnQsIGV2ZW50cywgb3B0aW9ucyk7XG4gIH1cbn1cblxuY29uc3Qgdmlldz0gYGA7XG5cbi8vIHRoaXMgZXhwZXJpZW5jZSBwbGF5cyBhIHNvdW5kIHdoZW4gaXQgc3RhcnRzLCBhbmQgcGxheXMgYW5vdGhlciBzb3VuZCB3aGVuXG4vLyBvdGhlciBjbGllbnRzIGpvaW4gdGhlIGV4cGVyaWVuY2VcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBsYXllckV4cGVyaWVuY2UgZXh0ZW5kcyBzb3VuZHdvcmtzLkV4cGVyaWVuY2Uge1xuICBjb25zdHJ1Y3Rvcihhc3NldHNEb21haW4pIHtcbiAgICBzdXBlcigpO1xuICAgIFxuICAgIC8vU2VydmljZXNcbiAgICB0aGlzLnBsYXRmb3JtID0gdGhpcy5yZXF1aXJlKCdwbGF0Zm9ybScsIHsgZmVhdHVyZXM6IFsnd2ViLWF1ZGlvJywgJ3dha2UtbG9jayddIH0pO1xuICAgIHRoaXMubW90aW9uSW5wdXQgPSB0aGlzLnJlcXVpcmUoJ21vdGlvbi1pbnB1dCcsIHsgZGVzY3JpcHRvcnM6IFsnb3JpZW50YXRpb24nXSB9KTtcbiAgICB0aGlzLmxvYWRlciA9IHRoaXMucmVxdWlyZSgnbG9hZGVyJywgeyBcbiAgICAgIGZpbGVzOiBbJ3NvdW5kcy9sYXllcnMvZ2Fkb3VlLm1wMycsICAgIC8vIDBcbiAgICAgICAgICAgICAgJ3NvdW5kcy9sYXllcnMvZ2Fkb3VlLm1wMycsICAgIC8vIDFcbiAgICAgICAgICAgICAgXCJzb3VuZHMvbGF5ZXJzL25hZ2UubXAzXCIsICAgICAgLy8gLi4uXG4gICAgICAgICAgICAgIFwic291bmRzL2xheWVycy90ZW1wZXRlLm1wM1wiLFxuICAgICAgICAgICAgICBcInNvdW5kcy9sYXllcnMvdmVudC5tcDNcIixcbiAgICAgICAgICAgICAgXCJzb3VuZHMvcGF0aC9jYW11c0MubXAzXCIsICAgICAvLyA1ICBcbiAgICAgICAgICAgICAgXCJtYXJrZXJzL2NhbXVzLmpzb25cIiwgXG4gICAgICAgICAgICAgIFwic291bmRzL3BhdGgvY2h1cmNoaWxsQy5tcDNcIiwgICAgXG4gICAgICAgICAgICAgIFwibWFya2Vycy9jaHVyY2hpbGwuanNvblwiLFxuICAgICAgICAgICAgICBcInNvdW5kcy9wYXRoL2lyYWtDLm1wM1wiLCAgIFxuICAgICAgICAgICAgICBcIm1hcmtlcnMvaXJhay5qc29uXCIsICAgICAgICAgIC8vIDEwICBcbiAgICAgICAgICAgICAgXCJzb3VuZHMvc2hhcGUvZW1pbmVtLm1wM1wiLFxuICAgICAgICAgICAgICBcInNvdW5kcy9zaGFwZS90cnVtcC5tcDNcIixcbiAgICAgICAgICAgICAgXCJzb3VuZHMvc2hhcGUvZnIubXAzXCIsXG4gICAgICAgICAgICAgIFwic291bmRzL3NoYXBlL2JyZXhpdC5tcDNcIl1cbiAgICB9KTtcblxuICAgIC8vcGFyYW1zXG4gICAgdGhpcy5nYWluT3V0cHV0RGlyZWN0O1xuICAgIHRoaXMuZ2Fpbk91dHB1dEdyYWluO1xuICAgIHRoaXMuZ3JhaW47XG4gICAgdGhpcy5zdGFydE9LID0gZmFsc2U7XG4gICAgdGhpcy5tb2RlbE9LID0gZmFsc2U7XG4gICAgdGhpcy5uYlBhdGggPSAzO1xuICAgIHRoaXMubmJTaGFwZSA9IDQ7XG4gICAgdGhpcy5xdFJhbmRvbSA9IDE0MDtcbiAgICB0aGlzLm9sZCA9IGZhbHNlO1xuICAgIHRoaXMubmJTZWdtZW50ID0gWzIzMiwgMTQ0LCAxMDZdO1xuICAgIHRoaXMubGFzdFNlZ21lbnQgPSBbMCwgMCwgMF07XG4gICAgdGhpcy5sYXN0UG9zaXRpb24gPSBbMCwgMCwgMF07XG4gICAgdGhpcy5jb3VudDQgPSAxMDtcbiAgICB0aGlzLm1heExhZyA9IDEwO1xuICAgIHRoaXMuZW5kU3RhcnRTZWdtZW50ZXIgPSBbXTtcbiAgICB0aGlzLmNvdW50VGltZW91dCA9IFtdO1xuICAgIHRoaXMuZGlyZWN0aW9uID0gW107XG4gICAgdGhpcy5vbGRUYWJQYXRoID0gW107XG4gICAgdGhpcy5jb3VudDEgPSBbXTtcbiAgICB0aGlzLmNvdW50MiA9IFtdO1xuICAgIHRoaXMuc2VnbWVudGVyID0gW107XG4gICAgdGhpcy5zZWdtZW50ZXJHYWluID0gW107XG4gICAgdGhpcy5zZWdtZW50ZXJHYWluR3JhaW4gPSBbXTtcbiAgICB0aGlzLnNvdXJjZXMgPSBbXTtcbiAgICB0aGlzLmdhaW5zID0gW107XG4gICAgdGhpcy5nYWluc0RpcmVjdGlvbnMgPSBbXTtcbiAgICB0aGlzLmdhaW5zU2hhcGUgPSBbXTtcbiAgICB0aGlzLm9sZFNoYXBlID0gW2ZhbHNlLCBmYWxzZSwgZmFsc2UsIGZhbHNlXTtcbiAgICB0aGlzLmdhaW5zR3JhaW5TaGFwZSA9IFtdO1xuICAgIHRoaXMuc291bmRTaGFwZSA9IFtdO1xuICAgIHRoaXMucmFtcFNoYXBlID0geydzaGFwZTEnOiAwLCAnc2hhcGUyJzogMCwgJ3NoYXBlMyc6IDAsICdzaGFwZTQnOiAwfTtcbiAgICB0aGlzLmNvdW50TWF4ID0gMTAwO1xuXG4gICAgdGhpcy5kZWNvZGVyID0gbmV3IERlY29kZXIoKTtcblxuICAgIGZvcihsZXQgaSA9IDA7IGkgPCB0aGlzLm5iUGF0aDsgaSsrKXtcbiAgICAgIHRoaXMuY291bnQxW2ldID0gMjA7XG4gICAgICB0aGlzLmNvdW50MltpXSA9IDIwO1xuICAgICAgdGhpcy5jb3VudFRpbWVvdXRbaV0gPSAwO1xuICAgICAgdGhpcy5kaXJlY3Rpb25baV0gPSB0cnVlO1xuICAgICAgdGhpcy5vbGRUYWJQYXRoW2ldID0gdHJ1ZTtcbiAgICAgIHRoaXMuZW5kU3RhcnRTZWdtZW50ZXJbaV0gPSBmYWxzZTtcbiAgICB9XG5cbiAgfVxuXG4gIGluaXQoKSB7XG4gICAgLy8gaW5pdGlhbGl6ZSB0aGUgdmlld1xuICAgIHRoaXMudmlld1RlbXBsYXRlID0gdmlldztcbiAgICB0aGlzLnZpZXdDb250ZW50ID0ge307XG4gICAgdGhpcy52aWV3Q3RvciA9IFBsYXllclZpZXc7XG4gICAgdGhpcy52aWV3T3B0aW9ucyA9IHsgcHJlc2VydmVQaXhlbFJhdGlvOiB0cnVlIH07XG4gICAgdGhpcy52aWV3ID0gdGhpcy5jcmVhdGVWaWV3KCk7XG5cbiAgICAvL2JpbmRcbiAgICB0aGlzLl90b01vdmUgPSB0aGlzLl90b01vdmUuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9pc0luRWxsaXBzZSA9IHRoaXMuX2lzSW5FbGxpcHNlLmJpbmQodGhpcyk7XG4gICAgdGhpcy5faXNJblJlY3QgPSB0aGlzLl9pc0luUmVjdC5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX2lzSW5MYXllciA9IHRoaXMuX2lzSW5MYXllci5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX2lzSW5QYXRoID0gdGhpcy5faXNJblBhdGguYmluZCh0aGlzKTtcbiAgICB0aGlzLl9pc0luU2hhcGUgPSB0aGlzLl9pc0luU2hhcGUuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9jcmVhdGVTb25vcldvcmxkID0gdGhpcy5fY3JlYXRlU29ub3JXb3JsZC5iaW5kKHRoaXMpOyAgICBcbiAgICB0aGlzLl91cGRhdGVHYWluID0gdGhpcy5fdXBkYXRlR2Fpbi5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX3JvdGF0ZVBvaW50ID0gdGhpcy5fcm90YXRlUG9pbnQuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9teUxpc3RlbmVyPSB0aGlzLl9teUxpc3RlbmVyLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fYWRkQmFsbCA9IHRoaXMuX2FkZEJhbGwuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9hZGRCYWNrZ3JvdW5kID0gdGhpcy5fYWRkQmFja2dyb3VuZC5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX3NldE1vZGVsID0gdGhpcy5fc2V0TW9kZWwuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9wcm9jZXNzUHJvYmEgPSB0aGlzLl9wcm9jZXNzUHJvYmEuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9yZXBsYWNlU2hhcGUgPSB0aGlzLl9yZXBsYWNlU2hhcGUuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9hZGRTaGFwZSA9IHRoaXMuX2FkZFNoYXBlLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fc3RhcnRTZWdtZW50ZXIgPSB0aGlzLl9zdGFydFNlZ21lbnRlci5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX3VwZGF0ZUF1ZGlvUGF0aCA9IHRoaXMuX3VwZGF0ZUF1ZGlvUGF0aC5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX3VwZGF0ZUF1ZGlvU2hhcGUgPSB0aGlzLl91cGRhdGVBdWRpb1NoYXBlLmJpbmQodGhpcyk7XG5cbiAgICAvL3JlY2VpdmVzXG4gICAgdGhpcy5yZWNlaXZlKCdiYWNrZ3JvdW5kJywgKGRhdGEpID0+IHRoaXMuX2FkZEJhY2tncm91bmQoZGF0YSkpO1xuICAgIHRoaXMucmVjZWl2ZSggJ21vZGVsJywgKG1vZGVsKSA9PiB0aGlzLl9zZXRNb2RlbChtb2RlbCkgKTtcbiAgICB0aGlzLnJlY2VpdmUoJ3NoYXBlQW5zd2VyJywgKHNoYXBlLCB4LCB5KSA9PiB0aGlzLl9hZGRTaGFwZShzaGFwZSwgeCwgeSkpO1xuXG4gfVxuXG4gIHN0YXJ0KCkge1xuICAgIGlmKCF0aGlzLnN0YXJ0T0spe1xuICAgICAgc3VwZXIuc3RhcnQoKTsgLy8gZG9uJ3QgZm9yZ2V0IHRoaXNcbiAgICAgIGlmICghdGhpcy5oYXNTdGFydGVkKVxuICAgICAgICB0aGlzLmluaXQoKTtcbiAgICAgIHRoaXMuc2hvdygpO1xuICAgIH1lbHNle1xuXG4gICAgICAvL3BhcmFtc1xuICAgICAgZG9jdW1lbnQuYm9keS5zdHlsZS5vdmVyZmxvdyA9IFwiaGlkZGVuXCI7ICBcbiAgICAgIHRoaXMubWlkZGxlWCA9IHdpbmRvdy5pbm5lcldpZHRoIC8gMjtcbiAgICAgIHRoaXMuc2NyZWVuU2l6ZVggPSB3aW5kb3cuaW5uZXJXaWR0aDtcbiAgICAgIHRoaXMuc2NyZWVuU2l6ZVkgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG4gICAgICB0aGlzLm1pZGRsZUVjcmFuWCA9IHRoaXMuc2NyZWVuU2l6ZVggLyAyO1xuICAgICAgdGhpcy5taWRkbGVFY3JhblkgPSB0aGlzLnNjcmVlblNpemVZIC8gMjtcbiAgICAgIHNldFRpbWVvdXQoICgpID0+e3RoaXMuX215TGlzdGVuZXIoMTAwKTt9ICwgMTAwKTtcbiAgICAgIHRoaXMubWlkZGxlWSA9IHdpbmRvdy5pbm5lckhlaWdodCAvIDI7XG4gICAgICB0aGlzLmVsbGlwc2VMaXN0TGF5ZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnZWxsaXBzZScpO1xuICAgICAgdGhpcy5yZWN0TGlzdExheWVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3JlY3QnKTtcbiAgICAgIHRoaXMudG90YWxFbGVtZW50cyA9IHRoaXMuZWxsaXBzZUxpc3RMYXllci5sZW5ndGggKyB0aGlzLnJlY3RMaXN0TGF5ZXIubGVuZ3RoO1xuICAgICAgdGhpcy50ZXh0TGlzdCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCd0ZXh0Jyk7XG4gICAgICB0aGlzLnNoYXBlTGlzdCA9IFtdO1xuICAgICAgdGhpcy5saXN0UmVjdFBhdGgxID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgncGF0aDAnKTtcbiAgICAgIHRoaXMubGlzdFJlY3RQYXRoMiA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ3BhdGgxJyk7XG4gICAgICB0aGlzLmxpc3RSZWN0UGF0aDMgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdwYXRoMicpO1xuICAgICAgdGhpcy5SZWN0TGlzdFNoYXBlMSA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ3NoYXBlMScpO1xuICAgICAgdGhpcy5SZWN0TGlzdFNoYXBlMiA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ3NoYXBlMicpO1xuICAgICAgdGhpcy5SZWN0TGlzdFNoYXBlMyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ3NoYXBlMycpO1xuICAgICAgdGhpcy5SZWN0TGlzdFNoYXBlNCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ3NoYXBlNCcpO1xuXG4gICAgICB0aGlzLl9hZGRCYWxsKDEwLCAxMCk7XG4gICAgICB0aGlzLl9yZXBsYWNlU2hhcGUoKTsgXG4gICAgICB0aGlzLl9jcmVhdGVTb25vcldvcmxkKCk7XG5cbiAgICAgIHRoaXMubWF4Q291bnRVcGRhdGUgPSAyO1xuICAgICAgdGhpcy5jb3VudFVwZGF0ZSA9IHRoaXMubWF4Q291bnRVcGRhdGUgKyAxOyBcbiAgICAgIHRoaXMudmlzdWFsaXNhdGlvblNoYXBlUGF0aCA9IGZhbHNlO1xuICAgICAgdGhpcy52aXN1YWxpc2F0aW9uQmFsbCA9IHRydWU7IFxuICAgICAgaWYoIXRoaXMudmlzdWFsaXNhdGlvbkJhbGwpe1xuICAgICAgICB0aGlzLnZpZXcuJGVsLnF1ZXJ5U2VsZWN0b3IoJyNiYWxsJykuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgIH1cbiAgICAgIHRoaXMudmlzdWFsaXNhdGlvblNoYXBlID0gZmFsc2U7XG4gICAgICBpZighdGhpcy52aXN1YWxpc2F0aW9uU2hhcGUpe1xuICAgICAgICBmb3IobGV0IGkgPSAwOyBpIDwgdGhpcy5lbGxpcHNlTGlzdExheWVyLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgICB0aGlzLmVsbGlwc2VMaXN0TGF5ZXJbaV0uc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgfVxuICAgICAgICBmb3IobGV0IGkgPSAwOyBpIDwgdGhpcy5yZWN0TGlzdExheWVyLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgICB0aGlzLnJlY3RMaXN0TGF5ZXJbaV0uc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgfVxuICAgICAgfSBcblxuICAgICAgdGhpcy5taXJyb3JCYWxsWCA9IDEwO1xuICAgICAgdGhpcy5taXJyb3JCYWxsWSA9IDEwO1xuICAgICAgdGhpcy5vZmZzZXRYID0gMDsgXG4gICAgICB0aGlzLm9mZnNldFkgPSAwO1xuICAgICAgdGhpcy5zdmdNYXhYID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3N2ZycpWzBdLmdldEF0dHJpYnV0ZSgnd2lkdGgnKTtcbiAgICAgIHRoaXMuc3ZnTWF4WSA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzdmcnKVswXS5nZXRBdHRyaWJ1dGUoJ2hlaWdodCcpO1xuXG4gICAgICB0aGlzLnRhYkluTGF5ZXI7XG4gICAgICBpZiAodGhpcy5tb3Rpb25JbnB1dC5pc0F2YWlsYWJsZSgnb3JpZW50YXRpb24nKSkge1xuICAgICAgICB0aGlzLm1vdGlvbklucHV0LmFkZExpc3RlbmVyKCdvcmllbnRhdGlvbicsIChkYXRhKSA9PiB7XG4gICAgICAgICAgY29uc3QgbmV3VmFsdWVzID0gdGhpcy5fdG9Nb3ZlKGRhdGFbMl0sZGF0YVsxXSAtIDI1KTtcbiAgICAgICAgICBpZih0aGlzLmNvdW50NCA+IHRoaXMubWF4TGFnKXtcbiAgICAgICAgICAgIHRoaXMudGFiSW5MYXllciA9IHRoaXMuX2lzSW5MYXllcihuZXdWYWx1ZXNbMF0sIG5ld1ZhbHVlc1sxXSk7XG4gICAgICAgICAgICB0aGlzLnRhYlBhdGggPSB0aGlzLl9pc0luUGF0aChuZXdWYWx1ZXNbMF0sIG5ld1ZhbHVlc1sxXSk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyh0aGlzLnRhYlBhdGgpO1xuICAgICAgICAgICAgdGhpcy50YWJTaGFwZSA9IHRoaXMuX2lzSW5TaGFwZShuZXdWYWx1ZXNbMF0sIG5ld1ZhbHVlc1sxXSk7XG4gICAgICAgICAgICB0aGlzLmNvdW50NCA9IC0xO1xuICAgICAgICAgICAgaWYodGhpcy5jb3VudFVwZGF0ZSA+IHRoaXMubWF4Q291bnRVcGRhdGUpe1xuICAgICAgICAgICAgICB0aGlzLl91cGRhdGVHYWluKHRoaXMudGFiSW5MYXllcik7XG4gICAgICAgICAgICAgIHRoaXMuY291bnRVcGRhdGUgPSAwO1xuICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgIHRoaXMuY291bnRVcGRhdGUrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICB0aGlzLmNvdW50NCsrO1xuICAgICAgICAgIFxuICAgICAgICAgIHRoaXMuX21vdmVTY3JlZW5UbyhuZXdWYWx1ZXNbMF0sIG5ld1ZhbHVlc1sxXSwgMC4wOCk7XG5cbiAgICAgICAgICBpZih0aGlzLm1vZGVsT0spe1xuICAgICAgICAgICAgdGhpcy5kZWNvZGVyLnByb2Nlc3MobmV3VmFsdWVzWzBdLCBuZXdWYWx1ZXNbMV0pO1xuICAgICAgICAgICAgdGhpcy5fcHJvY2Vzc1Byb2JhKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiT3JpZW50YXRpb24gbm9uIGRpc3BvbmlibGVcIik7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgX2FkZEJhbGwoeCx5KXtcbiAgICBjb25zdCBlbGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKCdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycsJ2NpcmNsZScpO1xuICAgIGVsZW0uc2V0QXR0cmlidXRlTlMobnVsbCxcImN4XCIseCk7XG4gICAgZWxlbS5zZXRBdHRyaWJ1dGVOUyhudWxsLFwiY3lcIix5KTtcbiAgICBlbGVtLnNldEF0dHJpYnV0ZU5TKG51bGwsXCJyXCIsMTApO1xuICAgIGVsZW0uc2V0QXR0cmlidXRlTlMobnVsbCxcInN0cm9rZVwiLCd3aGl0ZScpO1xuICAgIGVsZW0uc2V0QXR0cmlidXRlTlMobnVsbCxcInN0cm9rZS13aWR0aFwiLDMpO1xuICAgIGVsZW0uc2V0QXR0cmlidXRlTlMobnVsbCxcImZpbGxcIiwnYmxhY2snKTtcbiAgICBlbGVtLnNldEF0dHJpYnV0ZU5TKG51bGwsXCJpZFwiLCdiYWxsJyk7XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3N2ZycpWzBdLmFwcGVuZENoaWxkKGVsZW0pO1xuICB9XG5cbiAgX2FkZEJhY2tncm91bmQoYmFja2dyb3VuZCl7XG4gICAgY29uc3QgcGFyc2VyID0gbmV3IERPTVBhcnNlcigpO1xuICAgIGxldCBiYWNrZ3JvdW5kWG1sID0gcGFyc2VyLnBhcnNlRnJvbVN0cmluZyhiYWNrZ3JvdW5kLCAnYXBwbGljYXRpb24veG1sJyk7XG4gICAgYmFja2dyb3VuZFhtbCA9IGJhY2tncm91bmRYbWwuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3N2ZycpWzBdO1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdleHBlcmllbmNlJykuYXBwZW5kQ2hpbGQoYmFja2dyb3VuZFhtbCk7XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3N2ZycpWzBdLnNldEF0dHJpYnV0ZSgnaWQnLCAnc3ZnRWxlbWVudCcpXG4gICAgdGhpcy5fZGVsZXRlUmVjdFBhdGgoKTtcbiAgICB0aGlzLnN0YXJ0T0sgPSB0cnVlO1xuICAgIHRoaXMuc3RhcnQoKTtcbiAgfVxuXG4gIF9kZWxldGVSZWN0UGF0aCgpe1xuICAgIGxldCB0YWIgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdwYXRoMCcpO1xuICAgIGlmKCF0aGlzLnZpc3VhbGlzYXRpb25TaGFwZVBhdGgpe1xuICAgICAgZm9yKGxldCBpID0gMCA7IGkgPCB0YWIubGVuZ3RoOyBpKyspe1xuICAgICAgICB0YWJbaV0uc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgIH1cblxuICAgICAgdGFiID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgncGF0aDEnKTtcbiAgICAgIGZvcihsZXQgaSA9IDAgOyBpIDwgdGFiLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgdGFiW2ldLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICB9XG5cbiAgICAgIHRhYiA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ3BhdGgyJyk7XG4gICAgICBmb3IobGV0IGkgPSAwIDsgaSA8IHRhYi5sZW5ndGg7IGkrKyl7XG4gICAgICAgIHRhYltpXS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIF9hZGRTaGFwZShzaGFwZSwgeCwgeSl7XG4gICAgY29uc3QgcGFyc2VyID0gbmV3IERPTVBhcnNlcigpO1xuICAgIGxldCBzaGFwZVhtbCA9IHBhcnNlci5wYXJzZUZyb21TdHJpbmcoc2hhcGUsJ2FwcGxpY2F0aW9uL3htbCcpO1xuICAgIHNoYXBlWG1sID0gc2hhcGVYbWwuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2cnKVswXTtcbiAgICBsZXQgYmFsbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdiYWxsJyk7XG4gICAgY29uc3Qgc2hhcGVYbWxUYWIgPSBzaGFwZVhtbC5jaGlsZE5vZGVzO1xuICAgIGZvcihsZXQgaSA9IDA7IGkgPCBzaGFwZVhtbFRhYi5sZW5ndGg7IGkrKyl7XG4gICAgICBpZihzaGFwZVhtbFRhYltpXS5ub2RlTmFtZSA9PSAncGF0aCcpe1xuICAgICAgICBjb25zdCBuZXdOb2RlID0gYmFsbC5wYXJlbnROb2RlLmluc2VydEJlZm9yZShzaGFwZVhtbFRhYltpXSwgYmFsbCk7XG4gICAgICAgIHRoaXMuc2hhcGVMaXN0W3RoaXMuc2hhcGVMaXN0Lmxlbmd0aF0gPSBuZXdOb2RlLnNldEF0dHJpYnV0ZSgndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgnICsgeCArICcgJyArIHkgKyAnKScpO1xuICAgICAgfVxuICAgIH0gXG4gIH1cblxuICBfdG9Nb3ZlKHZhbHVlWCwgdmFsdWVZKXtcbiAgICBjb25zdCBvYmogPSB0aGlzLnZpZXcuJGVsLnF1ZXJ5U2VsZWN0b3IoJyNiYWxsJyk7XG4gICAgbGV0IG5ld1g7XG4gICAgbGV0IG5ld1k7XG4gICAgbGV0IGFjdHUgPSB0aGlzLm1pcnJvckJhbGxYICsgdmFsdWVYICogMC4zO1xuICAgIGlmKGFjdHUgPCB0aGlzLm9mZnNldFgpe1xuICAgICAgYWN0dSA9IHRoaXMub2Zmc2V0WCA7XG4gICAgfWVsc2UgaWYoYWN0dSA+ICh0aGlzLnNjcmVlblNpemVYICsgdGhpcy5vZmZzZXRYKSl7XG4gICAgICBhY3R1ID0gdGhpcy5zY3JlZW5TaXplWCArIHRoaXMub2Zmc2V0WFxuICAgIH1cbiAgICBpZih0aGlzLnZpc3VhbGlzYXRpb25CYWxsKXtcbiAgICAgIG9iai5zZXRBdHRyaWJ1dGUoJ2N4JywgYWN0dSk7XG4gICAgfVxuICAgIHRoaXMubWlycm9yQmFsbFggPSBhY3R1O1xuICAgIG5ld1ggPSBhY3R1O1xuICAgIGFjdHUgPSB0aGlzLm1pcnJvckJhbGxZICsgdmFsdWVZICogMC4zO1xuICAgIGlmKGFjdHUgPCAodGhpcy5vZmZzZXRZKSl7XG4gICAgICBhY3R1ID0gdGhpcy5vZmZzZXRZO1xuICAgIH1cbiAgICBpZihhY3R1ID4gKHRoaXMuc2NyZWVuU2l6ZVkgKyB0aGlzLm9mZnNldFkpKXtcbiAgICAgIGFjdHUgPSB0aGlzLnNjcmVlblNpemVZICsgdGhpcy5vZmZzZXRZO1xuICAgIH1cbiAgICBpZih0aGlzLnZpc3VhbGlzYXRpb25CYWxsKXtcbiAgICAgIG9iai5zZXRBdHRyaWJ1dGUoJ2N5JywgYWN0dSk7XG4gICAgfVxuICAgIHRoaXMubWlycm9yQmFsbFkgPSBhY3R1O1xuICAgIG5ld1kgPSBhY3R1O1xuICAgIHJldHVybiBbbmV3WCwgbmV3WV07XG4gIH1cblxuICBfbW92ZVNjcmVlblRvKHgsIHksIGZvcmNlPTEpe1xuICAgIGxldCBkaXN0YW5jZVggPSAoeCAtIHRoaXMub2Zmc2V0WCkgLSB0aGlzLm1pZGRsZUVjcmFuWDtcbiAgICBsZXQgbmVnWCA9IGZhbHNlO1xuICAgIGxldCBpbmRpY2VQb3dYID0gMztcbiAgICBsZXQgaW5kaWNlUG93WSA9IDM7XG4gICAgaWYoZGlzdGFuY2VYIDwgMCl7XG4gICAgICBuZWdYID0gdHJ1ZTtcbiAgICB9XG4gICAgZGlzdGFuY2VYID0gTWF0aC5wb3coKE1hdGguYWJzKGRpc3RhbmNlWCAvIHRoaXMubWlkZGxlRWNyYW5YKSksIGluZGljZVBvd1gpICogdGhpcy5taWRkbGVFY3Jhblg7IFxuICAgIGlmKG5lZ1gpe1xuICAgICAgZGlzdGFuY2VYICo9IC0xO1xuICAgIH1cbiAgICBpZih0aGlzLm9mZnNldFggKyAoZGlzdGFuY2VYICogZm9yY2UpID49IDAgJiYgKHRoaXMub2Zmc2V0WCArIChkaXN0YW5jZVggKiBmb3JjZSkgPD0gdGhpcy5zdmdNYXhYIC0gdGhpcy5zY3JlZW5TaXplWCkpe1xuICAgICAgdGhpcy5vZmZzZXRYICs9IChkaXN0YW5jZVggKiBmb3JjZSk7XG4gICAgfVxuXG4gICAgbGV0IGRpc3RhbmNlWSA9ICh5IC0gdGhpcy5vZmZzZXRZKSAtIHRoaXMubWlkZGxlRWNyYW5ZO1xuICAgIGxldCBuZWdZID0gZmFsc2U7XG4gICAgaWYoZGlzdGFuY2VZIDwgMCl7XG4gICAgICBuZWdZID0gdHJ1ZTtcbiAgICB9XG4gICAgZGlzdGFuY2VZID0gTWF0aC5wb3coKE1hdGguYWJzKGRpc3RhbmNlWSAvIHRoaXMubWlkZGxlRWNyYW5ZKSksIGluZGljZVBvd1kpICogdGhpcy5taWRkbGVFY3Jhblk7XG4gICAgaWYobmVnWSl7XG4gICAgICBkaXN0YW5jZVkgKj0gLTE7XG4gICAgfVxuICAgIGlmKCh0aGlzLm9mZnNldFkgKyAoZGlzdGFuY2VZICogZm9yY2UpID49IDApICYmICh0aGlzLm9mZnNldFkgKyAoZGlzdGFuY2VZICogZm9yY2UpIDw9IHRoaXMuc3ZnTWF4WSAtIHRoaXMuc2NyZWVuU2l6ZVkpKXtcbiAgICAgIHRoaXMub2Zmc2V0WSArPSAoZGlzdGFuY2VZICogZm9yY2UpO1xuICAgIH1cbiAgICB3aW5kb3cuc2Nyb2xsKHRoaXMub2Zmc2V0WCwgdGhpcy5vZmZzZXRZKVxuICB9XG5cbiAgX215TGlzdGVuZXIodGltZSl7XG4gICAgdGhpcy5zY3JlZW5TaXplWCA9IHdpbmRvdy5pbm5lcldpZHRoO1xuICAgIHRoaXMuc2NyZWVuU2l6ZVkgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG4gICAgc2V0VGltZW91dCh0aGlzLl9teUxpc3RlbmVyLCB0aW1lKTtcbiAgfVxuXG4gIF9yZXBsYWNlU2hhcGUoKXtcbiAgICBsZXQgbmV3TGlzdCA9IFtdO1xuICAgIGZvcihsZXQgaSA9IDA7IGkgPCB0aGlzLnRleHRMaXN0Lmxlbmd0aDsgaSsrKXtcbiAgICAgIG5ld0xpc3RbaV0gPSB0aGlzLnRleHRMaXN0W2ldO1xuICAgIH1cbiAgICBmb3IobGV0IGkgPSAwOyBpIDwgbmV3TGlzdC5sZW5ndGg7IGkrKyl7XG4gICAgICBjb25zdCBlbGVtZW50TmFtZSA9IG5ld0xpc3RbaV0uaW5uZXJIVE1MO1xuICAgICAgIGlmKGVsZW1lbnROYW1lLnNsaWNlKDAsIDEpID09ICdfJyl7XG4gICAgICAgICBjb25zdCBzaGFwZU5hbWUgPSBlbGVtZW50TmFtZS5zbGljZSgxLCBlbGVtZW50TmFtZS5sZW5ndGgpO1xuICAgICAgICAgY29uc3QgeCA9IG5ld0xpc3RbaV0uZ2V0QXR0cmlidXRlKCd4Jyk7XG4gICAgICAgICBjb25zdCB5ID0gbmV3TGlzdFtpXS5nZXRBdHRyaWJ1dGUoJ3knKTtcbiAgICAgICAgIHRoaXMuc2VuZCgnYXNrU2hhcGUnLCBzaGFwZU5hbWUsIHgsIHkpO1xuICAgICAgICAgY29uc3QgcGFyZW50ID0gbmV3TGlzdFtpXS5wYXJlbnROb2RlO1xuICAgICAgICAgcGFyZW50LnJlbW92ZUNoaWxkKG5ld0xpc3RbaV0pO1xuICAgICAgICAgY29uc3QgZWxlbXMgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKHNoYXBlTmFtZSk7XG4gICAgICAgICBmb3IobGV0IGkgPSAwOyBpIDwgZWxlbXMubGVuZ3RoOyBpKyspe1xuICAgICAgICAgICAgZWxlbXNbaV0uc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgIH1cbiAgICAgICB9XG4gICAgfVxuICB9XG5cbiAgX2lzSW5MYXllcih4LCB5KXtcbiAgICBsZXQgdGFiID0gW107XG4gICAgbGV0IHJvdGF0ZUFuZ2xlO1xuICAgIGxldCBtaWRkbGVSb3RhdGVYO1xuICAgIGxldCBtaWRkbGVSb3RhdGVZO1xuICAgIGZvcihsZXQgaSA9IDA7IGkgPCB0aGlzLmVsbGlwc2VMaXN0TGF5ZXIubGVuZ3RoOyBpKyspe1xuICAgICAgcm90YXRlQW5nbGUgPSAwO1xuICAgICAgY29uc3QgbWlkZGxlWCA9IHRoaXMuZWxsaXBzZUxpc3RMYXllcltpXS5nZXRBdHRyaWJ1dGUoJ2N4Jyk7XG4gICAgICBjb25zdCBtaWRkbGVZID0gdGhpcy5lbGxpcHNlTGlzdExheWVyW2ldLmdldEF0dHJpYnV0ZSgnY3knKTtcbiAgICAgIGNvbnN0IHJhZGl1c1ggPSB0aGlzLmVsbGlwc2VMaXN0TGF5ZXJbaV0uZ2V0QXR0cmlidXRlKCdyeCcpO1xuICAgICAgY29uc3QgcmFkaXVzWSA9IHRoaXMuZWxsaXBzZUxpc3RMYXllcltpXS5nZXRBdHRyaWJ1dGUoJ3J5Jyk7XG4gICAgICBsZXQgdHJhbnNmb3JtID0gdGhpcy5lbGxpcHNlTGlzdExheWVyW2ldLmdldEF0dHJpYnV0ZSgndHJhbnNmb3JtJyk7XG4gICAgICBpZigvcm90YXRlLy50ZXN0KHRyYW5zZm9ybSkpe1xuICAgICAgICB0cmFuc2Zvcm0gPSB0cmFuc2Zvcm0uc2xpY2UoNyx0cmFuc2Zvcm0ubGVuZ3RoKTtcbiAgICAgICAgbWlkZGxlUm90YXRlWCA9IHBhcnNlRmxvYXQodHJhbnNmb3JtLnNwbGl0KFwiIFwiKVsxXSk7XG4gICAgICAgIG1pZGRsZVJvdGF0ZVkgPSBwYXJzZUZsb2F0KHRyYW5zZm9ybS5zcGxpdChcIixcIilbMV0ucmVwbGFjZShcIilcIiwgXCJcIikpO1xuICAgICAgICByb3RhdGVBbmdsZSA9IHBhcnNlRmxvYXQodHJhbnNmb3JtLnNwbGl0KFwiIFwiKVswXSk7XG4gICAgICB9XG4gICAgICB0YWJbdGFiLmxlbmd0aF09dGhpcy5faXNJbkVsbGlwc2UocGFyc2VGbG9hdChtaWRkbGVYKSwgcGFyc2VGbG9hdChtaWRkbGVZKSwgcGFyc2VGbG9hdChyYWRpdXNYKSwgcGFyc2VGbG9hdChyYWRpdXNZKSwgeCwgeSwgcm90YXRlQW5nbGUsIG1pZGRsZVJvdGF0ZVgsIG1pZGRsZVJvdGF0ZVkpOyAgICAgXG4gICAgfVxuICAgIGZvcihsZXQgaSA9IDA7IGkgPCB0aGlzLnJlY3RMaXN0TGF5ZXIubGVuZ3RoOyBpKyspe1xuICAgICAgcm90YXRlQW5nbGUgPSAwO1xuICAgICAgbWlkZGxlUm90YXRlWCA9IG51bGw7XG4gICAgICBtaWRkbGVSb3RhdGVZID0gbnVsbDtcbiAgICAgIGNvbnN0IGhlaWdodCA9IHRoaXMucmVjdExpc3RMYXllcltpXS5nZXRBdHRyaWJ1dGUoJ3dpZHRoJyk7XG4gICAgICBjb25zdCB3aWR0aCA9IHRoaXMucmVjdExpc3RMYXllcltpXS5nZXRBdHRyaWJ1dGUoJ2hlaWdodCcpO1xuICAgICAgY29uc3QgbGVmdCA9IHRoaXMucmVjdExpc3RMYXllcltpXS5nZXRBdHRyaWJ1dGUoJ3gnKTtcbiAgICAgIGNvbnN0IHRvcCA9IHRoaXMucmVjdExpc3RMYXllcltpXS5nZXRBdHRyaWJ1dGUoJ3knKTtcbiAgICAgIGxldCB0cmFuc2Zvcm0gPSB0aGlzLnJlY3RMaXN0TGF5ZXJbaV0uZ2V0QXR0cmlidXRlKCd0cmFuc2Zvcm0nKTtcbiAgICAgIGlmKC9yb3RhdGUvLnRlc3QodHJhbnNmb3JtKSl7XG4gICAgICAgIHRyYW5zZm9ybSA9IHRyYW5zZm9ybS5zbGljZSg3LHRyYW5zZm9ybS5sZW5ndGgpO1xuICAgICAgICBtaWRkbGVSb3RhdGVYID0gcGFyc2VGbG9hdCh0cmFuc2Zvcm0uc3BsaXQoXCIgXCIpWzFdKTtcbiAgICAgICAgbWlkZGxlUm90YXRlWSA9IHBhcnNlRmxvYXQodHJhbnNmb3JtLnNwbGl0KFwiLFwiKVsxXS5yZXBsYWNlKFwiKVwiLCBcIlwiKSk7XG4gICAgICAgIHJvdGF0ZUFuZ2xlID0gcGFyc2VGbG9hdCh0cmFuc2Zvcm0uc3BsaXQoXCIgXCIpWzBdKTtcbiAgICAgIH1cbiAgICAgIHRhYlt0YWIubGVuZ3RoXT10aGlzLl9pc0luUmVjdChwYXJzZUZsb2F0KGhlaWdodCksIHBhcnNlRmxvYXQod2lkdGgpLCBwYXJzZUZsb2F0KGxlZnQpLCBwYXJzZUZsb2F0KHRvcCksIHgsIHksIHJvdGF0ZUFuZ2xlLCBtaWRkbGVSb3RhdGVYLCBtaWRkbGVSb3RhdGVZKTtcbiAgICB9ICBcbiAgICByZXR1cm4gdGFiO1xuICB9XG5cbiAgX2lzSW5QYXRoKHgsIHkpe1xuXG4gICAgbGV0IHJvdGF0ZUFuZ2xlO1xuICAgIGxldCBtaWRkbGVSb3RhdGVYO1xuICAgIGxldCBtaWRkbGVSb3RhdGVZO1xuICAgIGxldCBoZWlnaHQ7XG4gICAgbGV0IHdpZHRoO1xuICAgIGxldCBsZWZ0O1xuICAgIGxldCB0b3A7XG4gICAgbGV0IHRyYW5zZm9ybTtcbiAgICBsZXQgaSA9MDtcblxuICAgIC8vUGF0aCAxXG4gICAgbGV0IHBhdGgxID0gZmFsc2U7XG4gICAgd2hpbGUoIXBhdGgxICYmIGkgPCB0aGlzLmxpc3RSZWN0UGF0aDEubGVuZ3RoKXtcbiAgICAgIHJvdGF0ZUFuZ2xlID0gMDtcbiAgICAgIG1pZGRsZVJvdGF0ZVggPSBudWxsO1xuICAgICAgbWlkZGxlUm90YXRlWSA9IG51bGw7XG4gICAgICBoZWlnaHQgPSB0aGlzLmxpc3RSZWN0UGF0aDFbaV0uZ2V0QXR0cmlidXRlKCd3aWR0aCcpO1xuICAgICAgd2lkdGggPSB0aGlzLmxpc3RSZWN0UGF0aDFbaV0uZ2V0QXR0cmlidXRlKCdoZWlnaHQnKTtcbiAgICAgIGxlZnQgPSB0aGlzLmxpc3RSZWN0UGF0aDFbaV0uZ2V0QXR0cmlidXRlKCd4Jyk7XG4gICAgICB0b3AgPSB0aGlzLmxpc3RSZWN0UGF0aDFbaV0uZ2V0QXR0cmlidXRlKCd5Jyk7XG4gICAgICBsZXQgdHJhbnNmb3JtID0gdGhpcy5saXN0UmVjdFBhdGgxW2ldLmdldEF0dHJpYnV0ZSgndHJhbnNmb3JtJyk7XG4gICAgICBpZigvcm90YXRlLy50ZXN0KHRyYW5zZm9ybSkpe1xuICAgICAgICB0cmFuc2Zvcm0gPSB0cmFuc2Zvcm0uc2xpY2UoNyx0cmFuc2Zvcm0ubGVuZ3RoKTtcbiAgICAgICAgbWlkZGxlUm90YXRlWCA9IHBhcnNlRmxvYXQodHJhbnNmb3JtLnNwbGl0KFwiIFwiKVsxXSk7XG4gICAgICAgIG1pZGRsZVJvdGF0ZVkgPSBwYXJzZUZsb2F0KHRyYW5zZm9ybS5zcGxpdChcIixcIilbMV0ucmVwbGFjZShcIilcIiwgXCJcIikpO1xuICAgICAgICByb3RhdGVBbmdsZSA9IHBhcnNlRmxvYXQodHJhbnNmb3JtLnNwbGl0KFwiIFwiKVswXSk7XG4gICAgICB9XG4gICAgICBwYXRoMSA9IHRoaXMuX2lzSW5SZWN0KHBhcnNlRmxvYXQoaGVpZ2h0KSwgcGFyc2VGbG9hdCh3aWR0aCksIHBhcnNlRmxvYXQobGVmdCksIHBhcnNlRmxvYXQodG9wKSwgeCwgeSwgcm90YXRlQW5nbGUsIG1pZGRsZVJvdGF0ZVgsIG1pZGRsZVJvdGF0ZVkpO1xuICAgICAgaSsrO1xuICAgIH1cblxuICAgIC8vUGF0aCAyXG4gICAgbGV0IHBhdGgyID0gZmFsc2U7XG4gICAgaSA9MDtcbiAgICB3aGlsZSghcGF0aDIgJiYgaSA8IHRoaXMubGlzdFJlY3RQYXRoMi5sZW5ndGgpe1xuICAgICAgcm90YXRlQW5nbGUgPSAwO1xuICAgICAgbWlkZGxlUm90YXRlWCA9IG51bGw7XG4gICAgICBtaWRkbGVSb3RhdGVZID0gbnVsbDtcbiAgICAgIGhlaWdodCA9IHRoaXMubGlzdFJlY3RQYXRoMltpXS5nZXRBdHRyaWJ1dGUoJ3dpZHRoJyk7XG4gICAgICB3aWR0aCA9IHRoaXMubGlzdFJlY3RQYXRoMltpXS5nZXRBdHRyaWJ1dGUoJ2hlaWdodCcpO1xuICAgICAgbGVmdCA9IHRoaXMubGlzdFJlY3RQYXRoMltpXS5nZXRBdHRyaWJ1dGUoJ3gnKTtcbiAgICAgIHRvcCA9IHRoaXMubGlzdFJlY3RQYXRoMltpXS5nZXRBdHRyaWJ1dGUoJ3knKTtcbiAgICAgIHRyYW5zZm9ybSA9IHRoaXMubGlzdFJlY3RQYXRoMltpXS5nZXRBdHRyaWJ1dGUoJ3RyYW5zZm9ybScpO1xuICAgICAgaWYoL3JvdGF0ZS8udGVzdCh0cmFuc2Zvcm0pKXtcbiAgICAgICAgdHJhbnNmb3JtID0gdHJhbnNmb3JtLnNsaWNlKDcsdHJhbnNmb3JtLmxlbmd0aCk7XG4gICAgICAgIG1pZGRsZVJvdGF0ZVggPSBwYXJzZUZsb2F0KHRyYW5zZm9ybS5zcGxpdChcIiBcIilbMV0pO1xuICAgICAgICBtaWRkbGVSb3RhdGVZID0gcGFyc2VGbG9hdCh0cmFuc2Zvcm0uc3BsaXQoXCIsXCIpWzFdLnJlcGxhY2UoXCIpXCIsIFwiXCIpKTtcbiAgICAgICAgcm90YXRlQW5nbGUgPSBwYXJzZUZsb2F0KHRyYW5zZm9ybS5zcGxpdChcIiBcIilbMF0pO1xuICAgICAgfVxuICAgICAgcGF0aDIgPSB0aGlzLl9pc0luUmVjdChwYXJzZUZsb2F0KGhlaWdodCksIHBhcnNlRmxvYXQod2lkdGgpLCBwYXJzZUZsb2F0KGxlZnQpLCBwYXJzZUZsb2F0KHRvcCksIHgsIHksIHJvdGF0ZUFuZ2xlLCBtaWRkbGVSb3RhdGVYLCBtaWRkbGVSb3RhdGVZKTtcbiAgICAgIGkrKztcbiAgICB9XG5cbiAgICAvL1BhdGggM1xuICAgIGxldCBwYXRoMyA9IGZhbHNlO1xuICAgIGkgPTA7XG4gICAgd2hpbGUoIXBhdGgzICYmIGk8dGhpcy5saXN0UmVjdFBhdGgzLmxlbmd0aCl7XG4gICAgICByb3RhdGVBbmdsZT0wO1xuICAgICAgbWlkZGxlUm90YXRlWD1udWxsO1xuICAgICAgbWlkZGxlUm90YXRlWT1udWxsO1xuICAgICAgaGVpZ2h0ID0gdGhpcy5saXN0UmVjdFBhdGgzW2ldLmdldEF0dHJpYnV0ZSgnd2lkdGgnKTtcbiAgICAgIHdpZHRoID0gdGhpcy5saXN0UmVjdFBhdGgzW2ldLmdldEF0dHJpYnV0ZSgnaGVpZ2h0Jyk7XG4gICAgICBsZWZ0ID0gdGhpcy5saXN0UmVjdFBhdGgzW2ldLmdldEF0dHJpYnV0ZSgneCcpO1xuICAgICAgdG9wID0gdGhpcy5saXN0UmVjdFBhdGgzW2ldLmdldEF0dHJpYnV0ZSgneScpO1xuICAgICAgdHJhbnNmb3JtID0gdGhpcy5saXN0UmVjdFBhdGgzW2ldLmdldEF0dHJpYnV0ZSgndHJhbnNmb3JtJyk7XG4gICAgICBpZigvcm90YXRlLy50ZXN0KHRyYW5zZm9ybSkpe1xuICAgICAgICB0cmFuc2Zvcm0gPSB0cmFuc2Zvcm0uc2xpY2UoNyx0cmFuc2Zvcm0ubGVuZ3RoKTtcbiAgICAgICAgbWlkZGxlUm90YXRlWCA9IHBhcnNlRmxvYXQodHJhbnNmb3JtLnNwbGl0KFwiIFwiKVsxXSk7XG4gICAgICAgIG1pZGRsZVJvdGF0ZVkgPSBwYXJzZUZsb2F0KHRyYW5zZm9ybS5zcGxpdChcIixcIilbMV0ucmVwbGFjZShcIilcIiwgXCJcIikpO1xuICAgICAgICByb3RhdGVBbmdsZSA9IHBhcnNlRmxvYXQodHJhbnNmb3JtLnNwbGl0KFwiIFwiKVswXSk7XG4gICAgICB9XG4gICAgICBwYXRoMyA9IHRoaXMuX2lzSW5SZWN0KHBhcnNlRmxvYXQoaGVpZ2h0KSwgcGFyc2VGbG9hdCh3aWR0aCksIHBhcnNlRmxvYXQobGVmdCksIHBhcnNlRmxvYXQodG9wKSwgeCwgeSwgcm90YXRlQW5nbGUsIG1pZGRsZVJvdGF0ZVgsIG1pZGRsZVJvdGF0ZVkpO1xuICAgICAgaSsrO1xuICAgIH0gICAgICAgIFxuICAgIHJldHVybiBbcGF0aDEsIHBhdGgyLCBwYXRoM107XG4gIH1cblxuICBfaXNJblNoYXBlKHgsIHkpe1xuICAgIC8vVmFyaWFibGVzXG4gICAgbGV0IHJvdGF0ZUFuZ2xlO1xuICAgIGxldCBtaWRkbGVSb3RhdGVYO1xuICAgIGxldCBtaWRkbGVSb3RhdGVZO1xuICAgIGxldCBoZWlnaHQ7XG4gICAgbGV0IHdpZHRoO1xuICAgIGxldCBsZWZ0O1xuICAgIGxldCB0b3A7XG4gICAgbGV0IHRyYW5zZm9ybTtcbiAgICBsZXQgaSA9IDA7XG5cbiAgICAvL3NoYXBlIDFcbiAgICBsZXQgc2hhcGUxID0gZmFsc2U7XG4gICAgd2hpbGUoIXNoYXBlMSAmJiBpIDwgdGhpcy5SZWN0TGlzdFNoYXBlMS5sZW5ndGgpe1xuICAgICAgcm90YXRlQW5nbGUgPSAwO1xuICAgICAgbWlkZGxlUm90YXRlWCA9IG51bGw7XG4gICAgICBtaWRkbGVSb3RhdGVZID0gbnVsbDtcbiAgICAgIGhlaWdodCA9IHRoaXMuUmVjdExpc3RTaGFwZTFbaV0uZ2V0QXR0cmlidXRlKCd3aWR0aCcpO1xuICAgICAgd2lkdGggPSB0aGlzLlJlY3RMaXN0U2hhcGUxW2ldLmdldEF0dHJpYnV0ZSgnaGVpZ2h0Jyk7XG4gICAgICBsZWZ0ID0gdGhpcy5SZWN0TGlzdFNoYXBlMVtpXS5nZXRBdHRyaWJ1dGUoJ3gnKTtcbiAgICAgIHRvcCA9IHRoaXMuUmVjdExpc3RTaGFwZTFbaV0uZ2V0QXR0cmlidXRlKCd5Jyk7XG4gICAgICBsZXQgdHJhbnNmb3JtID0gdGhpcy5SZWN0TGlzdFNoYXBlMVtpXS5nZXRBdHRyaWJ1dGUoJ3RyYW5zZm9ybScpO1xuICAgICAgaWYoL3JvdGF0ZS8udGVzdCh0cmFuc2Zvcm0pKXtcbiAgICAgICAgdHJhbnNmb3JtID0gdHJhbnNmb3JtLnNsaWNlKDcsdHJhbnNmb3JtLmxlbmd0aCk7XG4gICAgICAgIG1pZGRsZVJvdGF0ZVggPSBwYXJzZUZsb2F0KHRyYW5zZm9ybS5zcGxpdChcIiBcIilbMV0pO1xuICAgICAgICBtaWRkbGVSb3RhdGVZID0gcGFyc2VGbG9hdCh0cmFuc2Zvcm0uc3BsaXQoXCIsXCIpWzFdLnJlcGxhY2UoXCIpXCIsIFwiXCIpKTtcbiAgICAgICAgcm90YXRlQW5nbGUgPSBwYXJzZUZsb2F0KHRyYW5zZm9ybS5zcGxpdChcIiBcIilbMF0pO1xuICAgICAgfVxuICAgICAgc2hhcGUxID0gdGhpcy5faXNJblJlY3QocGFyc2VGbG9hdChoZWlnaHQpLCBwYXJzZUZsb2F0KHdpZHRoKSwgcGFyc2VGbG9hdChsZWZ0KSwgcGFyc2VGbG9hdCh0b3ApLCB4LCB5LCByb3RhdGVBbmdsZSwgbWlkZGxlUm90YXRlWCwgbWlkZGxlUm90YXRlWSk7XG4gICAgICBpKys7XG4gICAgfVxuXG4gICAgLy9zaGFwZSAyXG4gICAgaSA9IDA7XG4gICAgbGV0IHNoYXBlMiA9IGZhbHNlO1xuICAgIHdoaWxlKCFzaGFwZTIgJiYgaSA8IHRoaXMuUmVjdExpc3RTaGFwZTIubGVuZ3RoKXtcbiAgICAgIHJvdGF0ZUFuZ2xlID0gMDtcbiAgICAgIG1pZGRsZVJvdGF0ZVggPSBudWxsO1xuICAgICAgbWlkZGxlUm90YXRlWSA9IG51bGw7XG4gICAgICBoZWlnaHQgPSB0aGlzLlJlY3RMaXN0U2hhcGUyW2ldLmdldEF0dHJpYnV0ZSgnd2lkdGgnKTtcbiAgICAgIHdpZHRoID0gdGhpcy5SZWN0TGlzdFNoYXBlMltpXS5nZXRBdHRyaWJ1dGUoJ2hlaWdodCcpO1xuICAgICAgbGVmdCA9IHRoaXMuUmVjdExpc3RTaGFwZTJbaV0uZ2V0QXR0cmlidXRlKCd4Jyk7XG4gICAgICB0b3AgPSB0aGlzLlJlY3RMaXN0U2hhcGUyW2ldLmdldEF0dHJpYnV0ZSgneScpO1xuICAgICAgbGV0IHRyYW5zZm9ybSA9IHRoaXMuUmVjdExpc3RTaGFwZTJbaV0uZ2V0QXR0cmlidXRlKCd0cmFuc2Zvcm0nKTtcbiAgICAgIGlmKC9yb3RhdGUvLnRlc3QodHJhbnNmb3JtKSl7XG4gICAgICAgIHRyYW5zZm9ybSA9IHRyYW5zZm9ybS5zbGljZSg3LHRyYW5zZm9ybS5sZW5ndGgpO1xuICAgICAgICBtaWRkbGVSb3RhdGVYID0gcGFyc2VGbG9hdCh0cmFuc2Zvcm0uc3BsaXQoXCIgXCIpWzFdKTtcbiAgICAgICAgbWlkZGxlUm90YXRlWSA9IHBhcnNlRmxvYXQodHJhbnNmb3JtLnNwbGl0KFwiLFwiKVsxXS5yZXBsYWNlKFwiKVwiLCBcIlwiKSk7XG4gICAgICAgIHJvdGF0ZUFuZ2xlID0gcGFyc2VGbG9hdCh0cmFuc2Zvcm0uc3BsaXQoXCIgXCIpWzBdKTtcbiAgICAgIH1cbiAgICAgIHNoYXBlMiA9IHRoaXMuX2lzSW5SZWN0KHBhcnNlRmxvYXQoaGVpZ2h0KSwgcGFyc2VGbG9hdCh3aWR0aCksIHBhcnNlRmxvYXQobGVmdCksIHBhcnNlRmxvYXQodG9wKSwgeCwgeSwgcm90YXRlQW5nbGUsIG1pZGRsZVJvdGF0ZVgsIG1pZGRsZVJvdGF0ZVkpO1xuICAgICAgaSsrO1xuICAgIH1cblxuICAgIC8vc2hhcGUgM1xuICAgIGkgPSAwO1xuICAgIGxldCBzaGFwZTMgPSBmYWxzZTtcbiAgICB3aGlsZSghc2hhcGUzICYmIGkgPCB0aGlzLlJlY3RMaXN0U2hhcGUzLmxlbmd0aCl7XG4gICAgICByb3RhdGVBbmdsZSA9IDA7XG4gICAgICBtaWRkbGVSb3RhdGVYID0gbnVsbDtcbiAgICAgIG1pZGRsZVJvdGF0ZVkgPSBudWxsO1xuICAgICAgaGVpZ2h0ID0gdGhpcy5SZWN0TGlzdFNoYXBlM1tpXS5nZXRBdHRyaWJ1dGUoJ3dpZHRoJyk7XG4gICAgICB3aWR0aCA9IHRoaXMuUmVjdExpc3RTaGFwZTNbaV0uZ2V0QXR0cmlidXRlKCdoZWlnaHQnKTtcbiAgICAgIGxlZnQgPSB0aGlzLlJlY3RMaXN0U2hhcGUzW2ldLmdldEF0dHJpYnV0ZSgneCcpO1xuICAgICAgdG9wID0gdGhpcy5SZWN0TGlzdFNoYXBlM1tpXS5nZXRBdHRyaWJ1dGUoJ3knKTtcbiAgICAgIGxldCB0cmFuc2Zvcm0gPSB0aGlzLlJlY3RMaXN0U2hhcGUzW2ldLmdldEF0dHJpYnV0ZSgndHJhbnNmb3JtJyk7XG4gICAgICBpZigvcm90YXRlLy50ZXN0KHRyYW5zZm9ybSkpe1xuICAgICAgICB0cmFuc2Zvcm0gPSB0cmFuc2Zvcm0uc2xpY2UoNyx0cmFuc2Zvcm0ubGVuZ3RoKTtcbiAgICAgICAgbWlkZGxlUm90YXRlWCA9IHBhcnNlRmxvYXQodHJhbnNmb3JtLnNwbGl0KFwiIFwiKVsxXSk7XG4gICAgICAgIG1pZGRsZVJvdGF0ZVkgPSBwYXJzZUZsb2F0KHRyYW5zZm9ybS5zcGxpdChcIixcIilbMV0ucmVwbGFjZShcIilcIiwgXCJcIikpO1xuICAgICAgICByb3RhdGVBbmdsZSA9IHBhcnNlRmxvYXQodHJhbnNmb3JtLnNwbGl0KFwiIFwiKVswXSk7XG4gICAgICB9XG4gICAgICBzaGFwZTMgPSB0aGlzLl9pc0luUmVjdChwYXJzZUZsb2F0KGhlaWdodCksIHBhcnNlRmxvYXQod2lkdGgpLCBwYXJzZUZsb2F0KGxlZnQpLCBwYXJzZUZsb2F0KHRvcCksIHgsIHksIHJvdGF0ZUFuZ2xlLCBtaWRkbGVSb3RhdGVYLCBtaWRkbGVSb3RhdGVZKTtcbiAgICAgIGkrKztcbiAgICB9XG5cbiAgICAvL3NoYXBlIDRcbiAgICBpID0gMDtcbiAgICBsZXQgc2hhcGU0ID0gZmFsc2U7XG4gICAgd2hpbGUoIXNoYXBlNCAmJiBpIDwgdGhpcy5SZWN0TGlzdFNoYXBlNC5sZW5ndGgpe1xuICAgICAgcm90YXRlQW5nbGUgPSAwO1xuICAgICAgbWlkZGxlUm90YXRlWCA9IG51bGw7XG4gICAgICBtaWRkbGVSb3RhdGVZID0gbnVsbDtcbiAgICAgIGhlaWdodCA9IHRoaXMuUmVjdExpc3RTaGFwZTRbaV0uZ2V0QXR0cmlidXRlKCd3aWR0aCcpO1xuICAgICAgd2lkdGggPSB0aGlzLlJlY3RMaXN0U2hhcGU0W2ldLmdldEF0dHJpYnV0ZSgnaGVpZ2h0Jyk7XG4gICAgICBsZWZ0ID0gdGhpcy5SZWN0TGlzdFNoYXBlNFtpXS5nZXRBdHRyaWJ1dGUoJ3gnKTtcbiAgICAgIHRvcCA9IHRoaXMuUmVjdExpc3RTaGFwZTRbaV0uZ2V0QXR0cmlidXRlKCd5Jyk7XG4gICAgICBsZXQgdHJhbnNmb3JtID0gdGhpcy5SZWN0TGlzdFNoYXBlNFtpXS5nZXRBdHRyaWJ1dGUoJ3RyYW5zZm9ybScpO1xuICAgICAgaWYoL3JvdGF0ZS8udGVzdCh0cmFuc2Zvcm0pKXtcbiAgICAgICAgdHJhbnNmb3JtID0gdHJhbnNmb3JtLnNsaWNlKDcsIHRyYW5zZm9ybS5sZW5ndGgpO1xuICAgICAgICBtaWRkbGVSb3RhdGVYID0gcGFyc2VGbG9hdCh0cmFuc2Zvcm0uc3BsaXQoXCIgXCIpWzFdKTtcbiAgICAgICAgbWlkZGxlUm90YXRlWSA9IHBhcnNlRmxvYXQodHJhbnNmb3JtLnNwbGl0KFwiLFwiKVsxXS5yZXBsYWNlKFwiKVwiLCBcIlwiKSk7XG4gICAgICAgIHJvdGF0ZUFuZ2xlID0gcGFyc2VGbG9hdCh0cmFuc2Zvcm0uc3BsaXQoXCIgXCIpWzBdKTtcbiAgICAgIH1cbiAgICAgIHNoYXBlNCA9IHRoaXMuX2lzSW5SZWN0KHBhcnNlRmxvYXQoaGVpZ2h0KSwgcGFyc2VGbG9hdCh3aWR0aCksIHBhcnNlRmxvYXQobGVmdCksIHBhcnNlRmxvYXQodG9wKSwgeCwgeSwgcm90YXRlQW5nbGUsIG1pZGRsZVJvdGF0ZVgsIG1pZGRsZVJvdGF0ZVkpO1xuICAgICAgaSsrO1xuICAgIH1cblxuXG4gICAgcmV0dXJuIFtzaGFwZTEsIHNoYXBlMiwgc2hhcGUzLCBzaGFwZTRdO1xuXG4gIH1cblxuICAgX2lzSW5SZWN0KGhlaWdodCwgd2lkdGgsIGxlZnQsIHRvcCwgcG9pbnRYLCBwb2ludFksIHJvdGF0ZUFuZ2xlLCBtaWRkbGVSb3RhdGVYLCBtaWRkbGVSb3RhdGVZKXtcbiAgICAgIFxuICAgICAgY29uc3QgbmV3UG9pbnQgPSB0aGlzLl9yb3RhdGVQb2ludChwb2ludFgsIHBvaW50WSwgbWlkZGxlUm90YXRlWCwgbWlkZGxlUm90YXRlWSwgcm90YXRlQW5nbGUpO1xuXG4gICAgICBpZihuZXdQb2ludFswXSA+IHBhcnNlSW50KGxlZnQpICYmIG5ld1BvaW50WzBdIDwocGFyc2VJbnQobGVmdCkrcGFyc2VJbnQoaGVpZ2h0KSkgJiYgbmV3UG9pbnRbMV0gPiB0b3AgJiYgbmV3UG9pbnRbMV0gPCAocGFyc2VJbnQodG9wKSArIHBhcnNlSW50KHdpZHRoKSkpe1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1lbHNle1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICB9XG5cbiAgX2lzSW5FbGxpcHNlKG1pZGRsZVgsIG1pZGRsZVksIHJhZGl1c1gsIHJhZGl1c1ksIHBvaW50WCwgcG9pbnRZLCByb3RhdGVBbmdsZSwgbWlkZGxlUm90YXRlWCwgbWlkZGxlUm90YXRlWSl7XG5cbiAgICBjb25zdCBuZXdQb2ludCA9IHRoaXMuX3JvdGF0ZVBvaW50KHBvaW50WCwgcG9pbnRZLCBtaWRkbGVSb3RhdGVYLCBtaWRkbGVSb3RhdGVZLCByb3RhdGVBbmdsZSk7XG5cbiAgICBsZXQgYSA9IHJhZGl1c1g7OyBcbiAgICBsZXQgYiA9IHJhZGl1c1k7IFxuICAgIGNvbnN0IGNhbGMgPSAoKE1hdGgucG93KCAobmV3UG9pbnRbMF0gLSBtaWRkbGVYKSwgMikgKSAvIChNYXRoLnBvdyhhLCAyKSkpICsgKChNYXRoLnBvdygobmV3UG9pbnRbMV0gLSBtaWRkbGVZKSwgMikpIC8gKE1hdGgucG93KGIsIDIpKSk7XG4gICAgaWYoY2FsYyA8PSAxKXtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1lbHNle1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIF9yb3RhdGVQb2ludCh4LCB5LCBtaWRkbGVYLCBtaWRkbGVZLCBhbmdsZSl7XG4gICAgbGV0IG5ld0FuZ2xlID0gYW5nbGUgKiAoMy4xNDE1OTI2NSAvIDE4MCk7XG4gICAgbGV0IG5ld1ggPSAoeCAtIG1pZGRsZVgpICogTWF0aC5jb3MobmV3QW5nbGUpICsgKHkgLSBtaWRkbGVZKSAqIE1hdGguc2luKG5ld0FuZ2xlKTtcbiAgICBsZXQgbmV3WSA9IC0xICogKHggLSBtaWRkbGVYKSAqIE1hdGguc2luKG5ld0FuZ2xlKSArICh5IC0gbWlkZGxlWSkgKiBNYXRoLmNvcyhuZXdBbmdsZSk7XG4gICAgbmV3WCArPSBtaWRkbGVYO1xuICAgIG5ld1kgKz0gbWlkZGxlWTtcbiAgICByZXR1cm4gW25ld1gsIG5ld1ldO1xuICB9XG5cbi8qIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVNPTi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAqL1xuXG4gIFxuICBfY3JlYXRlU29ub3JXb3JsZCgpe1xuXG4gICAgLy9HcmFpblxuICAgIHRoaXMuZ3JhaW4gPSBuZXcgTXlHcmFpbigpO1xuICAgIHNjaGVkdWxlci5hZGQodGhpcy5ncmFpbik7XG4gICAgdGhpcy5ncmFpbi5jb25uZWN0KGF1ZGlvQ29udGV4dC5kZXN0aW5hdGlvbik7XG4gICAgY29uc3QgYnVmZmVyQXNzb2NpZXMgPSBbNSwgNywgOV07XG4gICAgY29uc3QgbWFya2VyQXNzb2NpZXMgPSBbNiwgOCwgMTBdO1xuXG4gICAgLy9TZWdtZW50ZXJcbiAgICBmb3IobGV0IGkgPSAwOyBpIDwgdGhpcy5uYlBhdGg7IGkrKyl7XG4gICAgICBsZXQgaWRCdWZmZXIgPSBidWZmZXJBc3NvY2llc1tpXTtcbiAgICAgIGxldCBpZE1hcmtlciA9IG1hcmtlckFzc29jaWVzW2ldO1xuICAgICAgdGhpcy5zZWdtZW50ZXJbaV0gPSBuZXcgd2F2ZXMuU2VnbWVudEVuZ2luZSh7XG4gICAgICAgIGJ1ZmZlcjogdGhpcy5sb2FkZXIuYnVmZmVyc1tpZEJ1ZmZlcl0sXG4gICAgICAgIHBvc2l0aW9uQXJyYXk6IHRoaXMubG9hZGVyLmJ1ZmZlcnNbaWRNYXJrZXJdLnRpbWUsXG4gICAgICAgIGR1cmF0aW9uQXJyYXk6IHRoaXMubG9hZGVyLmJ1ZmZlcnNbaWRNYXJrZXJdLmR1cmF0aW9uLFxuICAgICAgICBwZXJpb2RBYnM6IDEwLFxuICAgICAgICBwZXJpb2RSZWw6IDEwLFxuICAgICAgfSk7XG4gICAgICB0aGlzLnNlZ21lbnRlckdhaW5baV0gPSBhdWRpb0NvbnRleHQuY3JlYXRlR2FpbigpO1xuICAgICAgdGhpcy5zZWdtZW50ZXJHYWluR3JhaW5baV0gPSBhdWRpb0NvbnRleHQuY3JlYXRlR2FpbigpO1xuICAgICAgdGhpcy5zZWdtZW50ZXJHYWluR3JhaW5baV0uZ2Fpbi5zZXRWYWx1ZUF0VGltZSgwLCBhdWRpb0NvbnRleHQuY3VycmVudFRpbWUpO1xuICAgICAgdGhpcy5zZWdtZW50ZXJHYWluW2ldLmdhaW4uc2V0VmFsdWVBdFRpbWUoMCwgYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lKTtcbiAgICAgIHRoaXMuc2VnbWVudGVyR2FpbkdyYWluW2ldLmNvbm5lY3QodGhpcy5ncmFpbi5pbnB1dCk7XG4gICAgICB0aGlzLnNlZ21lbnRlckdhaW5baV0uY29ubmVjdChhdWRpb0NvbnRleHQuZGVzdGluYXRpb24pO1xuICAgICAgdGhpcy5zZWdtZW50ZXJbaV0uY29ubmVjdCh0aGlzLnNlZ21lbnRlckdhaW5baV0pO1xuICAgICAgdGhpcy5zZWdtZW50ZXJbaV0uY29ubmVjdCh0aGlzLnNlZ21lbnRlckdhaW5HcmFpbltpXSk7XG4gICAgICBzZXRUaW1lb3V0KHRoaXMuX3N0YXJ0U2VnbWVudGVyKGkpLCAyMDAwKTtcblxuICAgIH1cblxuICAgIGZvcihsZXQgaSA9IDA7IGkgPCB0aGlzLnRvdGFsRWxlbWVudHM7IGkrKyl7XG5cbiAgICAgIC8vY3JlYXRlIGRpcmVjdCBnYWluXG4gICAgICB0aGlzLmdhaW5zRGlyZWN0aW9uc1tpXSA9ICdkb3duJztcbiAgICAgIHRoaXMuZ2FpbnNbaV0gPSBhdWRpb0NvbnRleHQuY3JlYXRlR2FpbigpO1xuICAgICAgdGhpcy5nYWluc1tpXS5nYWluLnZhbHVlID0gMDtcbiAgICAgIHRoaXMuZ2FpbnNbaV0uY29ubmVjdCh0aGlzLmdyYWluLmlucHV0KTtcblxuICAgICAgLy9jcmVhdGUgZ3JhaW4gZ2FpblxuICAgICAgdGhpcy5zb3VyY2VzW2ldID0gYXVkaW9Db250ZXh0LmNyZWF0ZUJ1ZmZlclNvdXJjZSgpO1xuICAgICAgdGhpcy5zb3VyY2VzW2ldLmJ1ZmZlciA9IHRoaXMubG9hZGVyLmJ1ZmZlcnNbaSAlIDVdO1xuICAgICAgdGhpcy5zb3VyY2VzW2ldLmNvbm5lY3QodGhpcy5nYWluc1tpXSk7XG4gICAgICB0aGlzLnNvdXJjZXNbaV0ubG9vcCA9IHRydWU7XG4gICAgICB0aGlzLnNvdXJjZXNbaV0uc3RhcnQoKTtcblxuICAgIH1cblxuICAgIHRoaXMuZ2Fpbk91dHB1dERpcmVjdCA9IGF1ZGlvQ29udGV4dC5jcmVhdGVHYWluKCk7XG4gICAgdGhpcy5nYWluT3V0cHV0RGlyZWN0LmdhaW4udmFsdWUgPSAwO1xuICAgIHRoaXMuZ2Fpbk91dHB1dERpcmVjdC5jb25uZWN0KGF1ZGlvQ29udGV4dC5kZXN0aW5hdGlvbik7XG4gICAgdGhpcy5nYWluT3V0cHV0R3JhaW4gPSBhdWRpb0NvbnRleHQuY3JlYXRlR2FpbigpO1xuICAgIHRoaXMuZ2Fpbk91dHB1dEdyYWluLmdhaW4udmFsdWUgPSAwO1xuICAgIHRoaXMuZ2Fpbk91dHB1dEdyYWluLmNvbm5lY3QodGhpcy5ncmFpbi5pbnB1dCk7XG5cblxuICAgIGZvcihsZXQgaSA9IDAgOyBpIDwgdGhpcy5uYlNoYXBlIDsgaSsrKXtcblxuICAgICAgLy9jcmVhdGUgZGlyZWN0IGdhaW5cbiAgICAgIHRoaXMuZ2FpbnNTaGFwZVtpXSA9IGF1ZGlvQ29udGV4dC5jcmVhdGVHYWluKCk7XG4gICAgICB0aGlzLmdhaW5zU2hhcGVbaV0uZ2Fpbi52YWx1ZSA9IDA7XG4gICAgICB0aGlzLmdhaW5zU2hhcGVbaV0uY29ubmVjdCh0aGlzLmdhaW5PdXRwdXREaXJlY3QpO1xuXG4gICAgICAvL2NyZWF0ZSBncmFpbiBnYWluXG4gICAgICB0aGlzLmdhaW5zR3JhaW5TaGFwZVtpXSA9IGF1ZGlvQ29udGV4dC5jcmVhdGVHYWluKCk7XG4gICAgICB0aGlzLmdhaW5zR3JhaW5TaGFwZVtpXS5nYWluLnZhbHVlID0gMDtcbiAgICAgIHRoaXMuZ2FpbnNHcmFpblNoYXBlW2ldLmNvbm5lY3QodGhpcy5nYWluT3V0cHV0R3JhaW4pO1xuXG4gICAgICAvL3Nvbm9yIHNyY1xuICAgICAgdGhpcy5zb3VuZFNoYXBlW2ldID0gYXVkaW9Db250ZXh0LmNyZWF0ZUJ1ZmZlclNvdXJjZSgpO1xuICAgICAgdGhpcy5zb3VuZFNoYXBlW2ldLmJ1ZmZlciA9IHRoaXMubG9hZGVyLmJ1ZmZlcnNbMTAgKyAoaSArIDEpXTtcbiAgICAgIHRoaXMuc291bmRTaGFwZVtpXS5jb25uZWN0KHRoaXMuZ2FpbnNTaGFwZVtpXSk7XG4gICAgICB0aGlzLnNvdW5kU2hhcGVbaV0uY29ubmVjdCh0aGlzLmdhaW5zR3JhaW5TaGFwZVtpXSk7XG4gICAgICB0aGlzLnNvdW5kU2hhcGVbaV0ubG9vcCA9IHRydWU7XG4gICAgICB0aGlzLnNvdW5kU2hhcGVbaV0uc3RhcnQoKTtcblxuICAgIH1cbiAgICAgXG4gIH1cblxuXG4gIF9zdGFydFNlZ21lbnRlcihpKXtcbiAgICB0aGlzLnNlZ21lbnRlcltpXS50cmlnZ2VyKCk7XG4gICAgbGV0IG5ld1BlcmlvZCA9IHBhcnNlRmxvYXQodGhpcy5sb2FkZXIuYnVmZmVyc1s2ICsgKGkgKiAyKV1bJ2R1cmF0aW9uJ11bdGhpcy5zZWdtZW50ZXJbaV0uc2VnbWVudEluZGV4XSkgKiAxMDAwO1xuICAgIHNldFRpbWVvdXQoICgpID0+IHt0aGlzLl9zdGFydFNlZ21lbnRlcihpKTt9ICwgXG4gICAgbmV3UGVyaW9kKTtcbiAgfVxuXG4gIF91cGRhdGVHYWluKHRhYkluTGF5ZXIpe1xuICAgIGZvcihsZXQgaSA9IDA7IGkgPCB0YWJJbkxheWVyLmxlbmd0aDsgaSsrKXtcbiAgICAgIGlmKHRoaXMuZ2FpbnNbaV0uZ2Fpbi52YWx1ZSA9PSAwICYmIHRhYkluTGF5ZXJbaV0gJiYgdGhpcy5nYWluc0RpcmVjdGlvbnNbaV0gPT0gJ2Rvd24nKXtcbiAgICAgICAgbGV0IGFjdHVhbCA9IHRoaXMuZ2FpbnNbaV0uZ2Fpbi52YWx1ZTtcbiAgICAgICAgdGhpcy5nYWluc1tpXS5nYWluLmNhbmNlbFNjaGVkdWxlZFZhbHVlcyhhdWRpb0NvbnRleHQuY3VycmVudFRpbWUpO1xuICAgICAgICB0aGlzLmdhaW5zW2ldLmdhaW4uc2V0VmFsdWVBdFRpbWUoYWN0dWFsLCBhdWRpb0NvbnRleHQuY3VycmVudFRpbWUpO1xuICAgICAgICB0aGlzLmdhaW5zW2ldLmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoMC4yNCwgYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lICsgMi4zKTtcbiAgICAgICAgdGhpcy5nYWluc0RpcmVjdGlvbnNbaV0gPSAndXAnO1xuICAgICAgfWVsc2UgaWYodGhpcy5nYWluc1tpXS5nYWluLnZhbHVlICE9IDAgJiYgIXRhYkluTGF5ZXJbaV0gJiYgdGhpcy5nYWluc0RpcmVjdGlvbnNbaV0gPT0gJ3VwJyl7XG4gICAgICAgIGxldCBhY3R1YWwgPSB0aGlzLmdhaW5zW2ldLmdhaW4udmFsdWU7XG4gICAgICAgIHRoaXMuZ2FpbnNbaV0uZ2Fpbi5jYW5jZWxTY2hlZHVsZWRWYWx1ZXMoYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lKTtcbiAgICAgICAgdGhpcy5nYWluc1tpXS5nYWluLnNldFZhbHVlQXRUaW1lKGFjdHVhbCwgYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lKTtcbiAgICAgICAgdGhpcy5nYWluc1tpXS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKDAsIGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSArIDMuNSk7XG4gICAgICAgIHRoaXMuZ2FpbnNEaXJlY3Rpb25zW2ldID0gJ2Rvd24nO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIF91cGRhdGVBdWRpb1BhdGgoaSl7XG4gICAgaWYodGhpcy50YWJQYXRoW2ldKXtcbiAgICAgIGxldCBhY3R1YWwxID0gdGhpcy5zZWdtZW50ZXJHYWluW2ldLmdhaW4udmFsdWU7XG4gICAgICBsZXQgYWN0dWFsMiA9IHRoaXMuc2VnbWVudGVyR2FpbkdyYWluW2ldLmdhaW4udmFsdWU7XG4gICAgICB0aGlzLnNlZ21lbnRlckdhaW5baV0uZ2Fpbi5jYW5jZWxTY2hlZHVsZWRWYWx1ZXMoYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lKTtcbiAgICAgIHRoaXMuc2VnbWVudGVyR2FpbkdyYWluW2ldLmdhaW4uY2FuY2VsU2NoZWR1bGVkVmFsdWVzKGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSk7XG4gICAgICB0aGlzLnNlZ21lbnRlckdhaW5baV0uZ2Fpbi5zZXRWYWx1ZUF0VGltZShhY3R1YWwxLGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSk7XG4gICAgICB0aGlzLnNlZ21lbnRlckdhaW5HcmFpbltpXS5nYWluLnNldFZhbHVlQXRUaW1lKGFjdHVhbDIsYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lKTtcbiAgICAgIHRoaXMuc2VnbWVudGVyR2FpbkdyYWluW2ldLmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoMCwgYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lICsgMSk7XG4gICAgICB0aGlzLnNlZ21lbnRlckdhaW5baV0uZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgwLjI1LCBhdWRpb0NvbnRleHQuY3VycmVudFRpbWUgKyAwLjYpO1xuICAgIH1lbHNle1xuICAgICAgbGV0IGFjdHVhbDEgPSB0aGlzLnNlZ21lbnRlckdhaW5baV0uZ2Fpbi52YWx1ZTtcbiAgICAgIGxldCBhY3R1YWwyID0gdGhpcy5zZWdtZW50ZXJHYWluR3JhaW5baV0uZ2Fpbi52YWx1ZTtcbiAgICAgIHRoaXMuc2VnbWVudGVyR2FpbltpXS5nYWluLmNhbmNlbFNjaGVkdWxlZFZhbHVlcyhhdWRpb0NvbnRleHQuY3VycmVudFRpbWUpO1xuICAgICAgdGhpcy5zZWdtZW50ZXJHYWluR3JhaW5baV0uZ2Fpbi5jYW5jZWxTY2hlZHVsZWRWYWx1ZXMoYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lKTtcbiAgICAgIHRoaXMuc2VnbWVudGVyR2FpbltpXS5nYWluLnNldFZhbHVlQXRUaW1lKGFjdHVhbDEsIGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSk7XG4gICAgICB0aGlzLnNlZ21lbnRlckdhaW5HcmFpbltpXS5nYWluLnNldFZhbHVlQXRUaW1lKGFjdHVhbDIsIGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSk7XG4gICAgICBpZih0aGlzLmVuZFN0YXJ0U2VnbWVudGVyW2ldKXtcbiAgICAgICAgdGhpcy5zZWdtZW50ZXJHYWluR3JhaW5baV0uZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZShhY3R1YWwxICsgMC4xNSwgYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lICsgMC4xKTtcbiAgICAgICAgc2V0VGltZW91dCggKCk9PntcbiAgICAgICAgICB0aGlzLnNlZ21lbnRlckdhaW5HcmFpbltpXS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKDAsIGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSArIDAuMyk7ICAgICAgICAgXG4gICAgICAgIH1cbiAgICAgICAgLCAyMDAwKTtcbiAgICAgICAgdGhpcy5zZWdtZW50ZXJHYWluW2ldLmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoMCwgYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lICsgMC40KTtcbiAgICAgIH1lbHNle1xuICAgICAgICB0aGlzLmVuZFN0YXJ0U2VnbWVudGVyW2ldID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBfdXBkYXRlQXVkaW9TaGFwZShpZCl7XG4gICAgXG4gICAgLy9zaGFwZTFcbiAgICBpZihpZCA9PSAwICYmIHRoaXMudGFiU2hhcGVbaWRdKXtcbiAgICAgIGxldCBnYWluR3JhaW4gPSAxIC0gKHRoaXMucmFtcFNoYXBlW1wic2hhcGUxXCJdIC8gMTAwMCk7XG4gICAgICBsZXQgZ2FpbkRpcmVjdCA9IHRoaXMucmFtcFNoYXBlW1wic2hhcGUxXCJdIC8gMTAwMDtcbiAgICAgIGlmKGdhaW5EaXJlY3QgPCAwKXtcbiAgICAgICAgZ2FpbkRpcmVjdCA9IDA7XG4gICAgICB9ZWxzZSBpZihnYWluRGlyZWN0ID4gMSl7XG4gICAgICAgIGdhaW5EaXJlY3QgPSAxO1xuICAgICAgfVxuICAgICAgaWYoZ2FpbkdyYWluIDwgMCl7XG4gICAgICAgIGdhaW5HcmFpbiA9IDA7XG4gICAgICB9ZWxzZSBpZihnYWluR3JhaW4gPiAxKXtcbiAgICAgICAgZ2FpbkdyYWluID0gMTtcbiAgICAgIH1cbiAgICAgIGlmKHRoaXMudGFiU2hhcGVbaWRdKXtcbiAgICAgICAgdGhpcy5nYWluc1NoYXBlW2lkXS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKGdhaW5EaXJlY3QsIGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSArIDAuMDEpO1xuICAgICAgICB0aGlzLmdhaW5zR3JhaW5TaGFwZVtpZF0uZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZShnYWluR3JhaW4sIGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSArIDAuMDEpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vc2hhcGUyXG4gICAgaWYoaWQgPT0gMSAmJiB0aGlzLnRhYlNoYXBlW2lkXSl7XG4gICAgICBsZXQgZ2FpbkdyYWluID0gMSAtICh0aGlzLnJhbXBTaGFwZVtcInNoYXBlMlwiXSAvIDEwMDApO1xuICAgICAgbGV0IGdhaW5EaXJlY3QgPSB0aGlzLnJhbXBTaGFwZVtcInNoYXBlMlwiXSAvIDEwMDA7XG4gICAgICBpZihnYWluRGlyZWN0IDwgMCl7XG4gICAgICAgIGdhaW5EaXJlY3QgPSAwO1xuICAgICAgfWVsc2UgaWYoZ2FpbkRpcmVjdCA+IDEpe1xuICAgICAgICBnYWluRGlyZWN0ID0gMTtcbiAgICAgIH1cbiAgICAgIGlmKGdhaW5HcmFpbiA8IDApe1xuICAgICAgICBnYWluR3JhaW4gPSAwO1xuICAgICAgfWVsc2UgaWYoZ2FpbkdyYWluID4gMSl7XG4gICAgICAgIGdhaW5HcmFpbiA9IDE7XG4gICAgICB9XG4gICAgICBpZih0aGlzLnRhYlNoYXBlW2lkXSl7XG4gICAgICAgIHRoaXMuZ2FpbnNTaGFwZVtpZF0uZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZShnYWluRGlyZWN0LCBhdWRpb0NvbnRleHQuY3VycmVudFRpbWUgKyAwLjAxKTtcbiAgICAgICAgdGhpcy5nYWluc0dyYWluU2hhcGVbaWRdLmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoZ2FpbkdyYWluLCBhdWRpb0NvbnRleHQuY3VycmVudFRpbWUgKyAwLjAxKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvL3NoYXBlM1xuICAgIGlmKGlkID09IDIgJiYgdGhpcy50YWJTaGFwZVtpZF0pe1xuICAgICAgbGV0IGdhaW5HcmFpbiA9IDEgLSAodGhpcy5yYW1wU2hhcGVbXCJzaGFwZTNcIl0gLyAxMDAwKTtcbiAgICAgIGxldCBnYWluRGlyZWN0ID0gdGhpcy5yYW1wU2hhcGVbXCJzaGFwZTNcIl0gLyAxMDAwO1xuICAgICAgaWYoZ2FpbkRpcmVjdCA8IDApe1xuICAgICAgICBnYWluRGlyZWN0ID0gMDtcbiAgICAgIH1lbHNlIGlmKGdhaW5EaXJlY3QgPiAxKXtcbiAgICAgICAgZ2FpbkRpcmVjdCA9IDE7XG4gICAgICB9XG4gICAgICBpZihnYWluR3JhaW4gPCAwKXtcbiAgICAgICAgZ2FpbkdyYWluID0gMDtcbiAgICAgIH1lbHNlIGlmKGdhaW5HcmFpbiA+IDEpe1xuICAgICAgICBnYWluR3JhaW4gPSAxO1xuICAgICAgfVxuICAgICAgaWYodGhpcy50YWJTaGFwZVtpZF0pe1xuICAgICAgICB0aGlzLmdhaW5zU2hhcGVbaWRdLmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoZ2FpbkRpcmVjdCwgYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lICsgMC4wMSk7XG4gICAgICAgIHRoaXMuZ2FpbnNHcmFpblNoYXBlW2lkXS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKGdhaW5HcmFpbiwgYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lICsgMC4wMSk7XG4gICAgICB9XG4gICAgfVxuICAgIFxuICAgIC8vc2hhcGU0XG4gICAgaWYoaWQgPT0gMyAmJiB0aGlzLnRhYlNoYXBlW2lkXSl7XG4gICAgICBsZXQgZ2FpbkdyYWluID0gMSAtICh0aGlzLnJhbXBTaGFwZVtcInNoYXBlNFwiXSAvIDEwMDApO1xuICAgICAgbGV0IGdhaW5EaXJlY3QgPSB0aGlzLnJhbXBTaGFwZVtcInNoYXBlNFwiXSAvIDEwMDA7XG4gICAgICBpZihnYWluRGlyZWN0IDwgMCl7XG4gICAgICAgIGdhaW5EaXJlY3QgPSAwO1xuICAgICAgfWVsc2UgaWYoZ2FpbkRpcmVjdCA+IDEpe1xuICAgICAgICBnYWluRGlyZWN0ID0gMTtcbiAgICAgIH1cbiAgICAgIGlmKGdhaW5HcmFpbiA8IDApe1xuICAgICAgICBnYWluR3JhaW4gPSAwO1xuICAgICAgfWVsc2UgaWYoZ2FpbkdyYWluID4gMSl7XG4gICAgICAgIGdhaW5HcmFpbiA9IDE7XG4gICAgICB9XG4gICAgICBpZih0aGlzLnRhYlNoYXBlW2lkXSl7XG4gICAgICAgIHRoaXMuZ2FpbnNTaGFwZVtpZF0uZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZShnYWluRGlyZWN0LCBhdWRpb0NvbnRleHQuY3VycmVudFRpbWUgKyAwLjAxKTtcbiAgICAgICAgdGhpcy5nYWluc0dyYWluU2hhcGVbaWRdLmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoZ2FpbkdyYWluLCBhdWRpb0NvbnRleHQuY3VycmVudFRpbWUgKyAwLjAxKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZighdGhpcy50YWJTaGFwZVswXSAmJiAodGhpcy50YWJTaGFwZVswXSAhPSB0aGlzLm9sZFNoYXBlWzBdKSl7XG4gICAgICB0aGlzLmdhaW5zU2hhcGVbMF0uZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgwLCBhdWRpb0NvbnRleHQuY3VycmVudFRpbWUgKyAxLjUpO1xuICAgICAgdGhpcy5nYWluc0dyYWluU2hhcGVbMF0uZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgwLCBhdWRpb0NvbnRleHQuY3VycmVudFRpbWUgKyAxLjUpO1xuICAgIH1cbiAgICBpZighdGhpcy50YWJTaGFwZVsxXSAmJiAodGhpcy50YWJTaGFwZVsxXSAhPSB0aGlzLm9sZFNoYXBlWzFdKSl7XG4gICAgICB0aGlzLmdhaW5zU2hhcGVbMV0uZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgwLCBhdWRpb0NvbnRleHQuY3VycmVudFRpbWUgKyAxLjUpO1xuICAgICAgdGhpcy5nYWluc0dyYWluU2hhcGVbMV0uZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgwLCBhdWRpb0NvbnRleHQuY3VycmVudFRpbWUgKyAxLjUpO1xuICAgIH1cbiAgICBpZighdGhpcy50YWJTaGFwZVsyXSAmJiAodGhpcy50YWJTaGFwZVsyXSAhPSB0aGlzLm9sZFNoYXBlWzJdKSl7XG4gICAgICB0aGlzLmdhaW5zU2hhcGVbMl0uZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgwLCBhdWRpb0NvbnRleHQuY3VycmVudFRpbWUgKyAxLjUpO1xuICAgICAgdGhpcy5nYWluc0dyYWluU2hhcGVbMl0uZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgwLCBhdWRpb0NvbnRleHQuY3VycmVudFRpbWUgKyAxLjUpO1xuICAgIH1cbiAgICBpZighdGhpcy50YWJTaGFwZVszXSAmJiAodGhpcy50YWJTaGFwZVszXSAhPSB0aGlzLm9sZFNoYXBlWzNdKSl7XG4gICAgICB0aGlzLmdhaW5zU2hhcGVbM10uZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgwLCBhdWRpb0NvbnRleHQuY3VycmVudFRpbWUgKyAxLjUpO1xuICAgICAgdGhpcy5nYWluc0dyYWluU2hhcGVbM10uZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgwLCBhdWRpb0NvbnRleHQuY3VycmVudFRpbWUgKyAxLjUpO1xuICAgIH1cblxuICAgIHRoaXMub2xkU2hhcGUgPSBbdGhpcy50YWJTaGFwZVswXSx0aGlzLnRhYlNoYXBlWzFdLHRoaXMudGFiU2hhcGVbMl0sdGhpcy50YWJTaGFwZVszXV07XG5cbiAgICBpZih0aGlzLnRhYlNoYXBlWzBdIHx8IHRoaXMudGFiU2hhcGVbMV0gfHwgdGhpcy50YWJTaGFwZVsyXSB8fCB0aGlzLnRhYlNoYXBlWzNdKXtcbiAgICAgIHRoaXMuZGVjb2Rlci5yZXNldCgpO1xuICAgIH1cblxuICB9XG5cblxuICAvKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVhNTS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tICovXG5cbiAgX3NldE1vZGVsKG1vZGVsLG1vZGVsMSxtb2RlbDIpe1xuICAgIHRoaXMuZGVjb2Rlci5zZXRNb2RlbChtb2RlbCk7XG4gICAgdGhpcy5tb2RlbE9LID0gdHJ1ZTtcbiAgfVxuXG4gIF9wcm9jZXNzUHJvYmEoKXsgICAgXG4gICAgbGV0IHByb2JhTWF4ID0gdGhpcy5kZWNvZGVyLmdldFByb2JhKCk7XG4gICAgLy9QYXRoXG4gICAgZm9yKGxldCBpID0gMCA7IGkgPCB0aGlzLm5iUGF0aCA7IGkgKyspe1xuICAgICAgdGhpcy5zZWdtZW50ZXJbaV0uc2VnbWVudEluZGV4ID0gTWF0aC50cnVuYyhNYXRoLnJhbmRvbSgpICogdGhpcy5xdFJhbmRvbSk7XG4gICAgICBpZih0aGlzLnRhYlBhdGhbaV0gIT0gdGhpcy5vbGRUYWJQYXRoW2ldKXtcbiAgICAgICAgIHRoaXMuX3VwZGF0ZUF1ZGlvUGF0aChpKTtcbiAgICAgIH1cbiAgICAgIHRoaXMub2xkVGFiUGF0aFtpXSA9IHRoaXMudGFiUGF0aFtpXTtcbiAgICB9XG5cbiAgICAvL1NoYXBlXG4gICAgbGV0IGRpcmVjdCA9IGZhbHNlO1xuICAgIGxldCBpID0gMDtcbiAgICB3aGlsZSggIWRpcmVjdCAmJiAoaSA8IHRoaXMubmJTaGFwZSkgKXtcbiAgICAgIGlmKHRoaXMudGFiU2hhcGVbaV0pe1xuICAgICAgICBkaXJlY3QgPSB0cnVlO1xuICAgICAgfVxuICAgICAgaSsrXG4gICAgfVxuXG4gICBsZXQgYWN0dWFsMSA9IHRoaXMuZ2Fpbk91dHB1dERpcmVjdC5nYWluLnZhbHVlO1xuICAgbGV0IGFjdHVhbDIgPSB0aGlzLmdhaW5PdXRwdXRHcmFpbi5nYWluLnZhbHVlO1xuXG4gICAgaWYoZGlyZWN0ICE9IHRoaXMub2xkKXtcbiAgICAgIGlmKGRpcmVjdCl7XG4gICAgICAgIHRoaXMuZ2Fpbk91dHB1dERpcmVjdC5nYWluLmNhbmNlbFNjaGVkdWxlZFZhbHVlcyhhdWRpb0NvbnRleHQuY3VycmVudFRpbWUpO1xuICAgICAgICB0aGlzLmdhaW5PdXRwdXREaXJlY3QuZ2Fpbi5zZXRWYWx1ZUF0VGltZShhY3R1YWwxLCBhdWRpb0NvbnRleHQuY3VycmVudFRpbWUpO1xuICAgICAgICB0aGlzLmdhaW5PdXRwdXREaXJlY3QuZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgwLjUsIGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSArIDIpO1xuICAgICAgICB0aGlzLmdhaW5PdXRwdXRHcmFpbi5nYWluLmNhbmNlbFNjaGVkdWxlZFZhbHVlcyhhdWRpb0NvbnRleHQuY3VycmVudFRpbWUpO1xuICAgICAgICB0aGlzLmdhaW5PdXRwdXRHcmFpbi5nYWluLnNldFZhbHVlQXRUaW1lKGFjdHVhbDEsIGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSk7XG4gICAgICAgIHRoaXMuZ2Fpbk91dHB1dEdyYWluLmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoMC41LCBhdWRpb0NvbnRleHQuY3VycmVudFRpbWUgKyAyKTtcbiAgICAgICAgdGhpcy5yYW1wU2hhcGVbJ3NoYXBlMSddID0gMDtcbiAgICAgICAgdGhpcy5yYW1wU2hhcGVbJ3NoYXBlMiddID0gMDtcbiAgICAgICAgdGhpcy5yYW1wU2hhcGVbJ3NoYXBlMyddID0gMDtcbiAgICAgICAgdGhpcy5yYW1wU2hhcGVbJ3NoYXBlNCddID0gMDtcbiAgICAgIH1lbHNle1xuICAgICAgICB0aGlzLmdhaW5PdXRwdXREaXJlY3QuZ2Fpbi5jYW5jZWxTY2hlZHVsZWRWYWx1ZXMoYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lKTtcbiAgICAgICAgdGhpcy5nYWluT3V0cHV0RGlyZWN0LmdhaW4uc2V0VmFsdWVBdFRpbWUoYWN0dWFsMSwgYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lKTtcbiAgICAgICAgdGhpcy5nYWluT3V0cHV0RGlyZWN0LmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoMCwgYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lICsgMik7XG4gICAgICAgIHRoaXMuZ2Fpbk91dHB1dEdyYWluLmdhaW4uY2FuY2VsU2NoZWR1bGVkVmFsdWVzKGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSk7XG4gICAgICAgIHRoaXMuZ2Fpbk91dHB1dEdyYWluLmdhaW4uc2V0VmFsdWVBdFRpbWUoYWN0dWFsMSwgYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lKTtcbiAgICAgICAgdGhpcy5nYWluT3V0cHV0R3JhaW4uZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgwLCBhdWRpb0NvbnRleHQuY3VycmVudFRpbWUgKyAyKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLm9sZCA9IGRpcmVjdDtcblxuICAgIGlmKGRpcmVjdCl7XG5cbiAgICAgIGZvcihsZXQgaSA9IDA7IGk8dGhpcy5uYlNoYXBlIDsgaSsrKXtcbiAgICAgICAgaWYocHJvYmFNYXg9PSdzaGFwZTEnKXtcbiAgICAgICAgICB0aGlzLnJhbXBTaGFwZVsnc2hhcGUyJ10tLTtcbiAgICAgICAgICB0aGlzLnJhbXBTaGFwZVsnc2hhcGUzJ10tLTtcbiAgICAgICAgICB0aGlzLnJhbXBTaGFwZVsnc2hhcGU0J10tLTtcbiAgICAgICAgfWVsc2UgaWYocHJvYmFNYXggPT0gJ3NoYXBlMicpe1xuICAgICAgICAgIHRoaXMucmFtcFNoYXBlWydzaGFwZTEnXS0tO1xuICAgICAgICAgIHRoaXMucmFtcFNoYXBlWydzaGFwZTMnXS0tO1xuICAgICAgICAgIHRoaXMucmFtcFNoYXBlWydzaGFwZTQnXS0tO1xuICAgICAgICB9ZWxzZSBpZihwcm9iYU1heCA9PSAnc2hhcGUzJyl7XG4gICAgICAgICAgdGhpcy5yYW1wU2hhcGVbJ3NoYXBlMSddLS07XG4gICAgICAgICAgdGhpcy5yYW1wU2hhcGVbJ3NoYXBlMiddLS07XG4gICAgICAgICAgdGhpcy5yYW1wU2hhcGVbJ3NoYXBlNCddLS07XG4gICAgICAgIH1lbHNlIGlmKHByb2JhTWF4ID09ICdzaGFwZTQnKXtcbiAgICAgICAgICB0aGlzLnJhbXBTaGFwZVsnc2hhcGUxJ10tLTtcbiAgICAgICAgICB0aGlzLnJhbXBTaGFwZVsnc2hhcGUyJ10tLTtcbiAgICAgICAgICB0aGlzLnJhbXBTaGFwZVsnc2hhcGUzJ10tLTtcbiAgICAgICAgfWVsc2UgaWYocHJvYmFNYXggPT0gbnVsbCl7XG4gICAgICAgICAgdGhpcy5yYW1wU2hhcGVbJ3NoYXBlMSddLS07XG4gICAgICAgICAgdGhpcy5yYW1wU2hhcGVbJ3NoYXBlMiddLS07XG4gICAgICAgICAgdGhpcy5yYW1wU2hhcGVbJ3NoYXBlMyddLS07XG4gICAgICAgICAgdGhpcy5yYW1wU2hhcGVbJ3NoYXBlNCddLS07XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnJhbXBTaGFwZVtwcm9iYU1heF0rKztcblxuICAgICAgICBpZih0aGlzLnJhbXBTaGFwZVsnc2hhcGUxJ10gPCAwKSB0aGlzLnJhbXBTaGFwZVsnc2hhcGUxJ10gPSAwO1xuICAgICAgICBpZih0aGlzLnJhbXBTaGFwZVsnc2hhcGUyJ10gPCAwKSB0aGlzLnJhbXBTaGFwZVsnc2hhcGUyJ10gPSAwO1xuICAgICAgICBpZih0aGlzLnJhbXBTaGFwZVsnc2hhcGUzJ10gPCAwKSB0aGlzLnJhbXBTaGFwZVsnc2hhcGUzJ10gPSAwO1xuICAgICAgICBpZih0aGlzLnJhbXBTaGFwZVsnc2hhcGU0J10gPCAwKSB0aGlzLnJhbXBTaGFwZVsnc2hhcGU0J10gPSAwO1xuICAgICAgfVxuXG4gICAgfVxuXG4gICAgZm9yKGxldCBpID0gMCA7IGkgPCB0aGlzLm5iU2hhcGUgOyBpKyspe1xuICAgICAgdGhpcy5fdXBkYXRlQXVkaW9TaGFwZShpKTtcbiAgICB9XG5cbiAgfVxuXG59XG4iXX0=