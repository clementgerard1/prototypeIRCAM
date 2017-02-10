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

var _xmmLfo = require('xmm-lfo');

var _Decodage = require('./Decodage.js');

var _Decodage2 = _interopRequireDefault(_Decodage);

var _Decodage3 = require('./Decodage2.js');

var _Decodage4 = _interopRequireDefault(_Decodage3);

var _Decodage5 = require('./Decodage3.js');

var _Decodage6 = _interopRequireDefault(_Decodage5);

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
      "sounds/nappe/tempete.mp3", "sounds/nappe/vent.mp3", "sounds/camus.mp3", // 5  
      "markers/markers.json", "sounds/obama.mp3", "markers/markers.json", "sounds/last.mp3", "markers/markers.json"] //10  
    });
    _this2.startOK = false;
    _this2.startSegmentFini = [];
    _this2.modelOK = false;

    // PARAMETRE
    _this2.nbChemin = 3;
    _this2.nbSegment = [59, 59, 59];

    //
    _this2.ancien1 = [];
    _this2.ancien2 = [];
    _this2.countTimeout = [];
    _this2.direction = [];
    _this2.oldTabChemin = [];
    _this2.count1 = [];
    _this2.count2 = [];
    _this2.segmenter = [];
    _this2.segmenterGain = [];
    _this2.segmenterGainGrain = [];
    _this2.sources = [];
    _this2.gains = [];
    _this2.gainsDirections = [];
    _this2.grain;
    _this2.countMax = 20;

    for (var i = 0; i < _this2.nbChemin; i++) {
      _this2.count1[i] = 20;
      _this2.count2[i] = 20;
      _this2.ancien1[i] = 0;
      _this2.ancien2[i] = 0;
      _this2.countTimeout[i] = 0;
      _this2.direction[i] = true;
      _this2.oldTabChemin[i] = true;
      _this2.startSegmentFini[i] = false;
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
      this._isIn = this._isIn.bind(this);
      this._isInChemin = this._isInChemin.bind(this);
      this._getDistanceNode = this._getDistanceNode.bind(this);
      this._creationUniversSonore = this._creationUniversSonore.bind(this);
      this._updateGain = this._updateGain.bind(this);
      this._rotatePoint = this._rotatePoint.bind(this);
      this._myListener = this._myListener.bind(this);
      this._addBoule = this._addBoule.bind(this);
      this._addFond = this._addFond.bind(this);
      this._setModel = this._setModel.bind(this);
      this._processProba = this._processProba.bind(this);
      this._remplaceForme = this._remplaceForme.bind(this);
      this._addForme = this._addForme.bind(this);
      this._startSegmenter = this._startSegmenter.bind(this);
      this._findNewSegment = this._findNewSegment.bind(this);
      this._actualiserSegmentIfNotIn = this._actualiserSegmentIfNotIn.bind(this);
      this._actualiserAudioChemin = this._actualiserAudioChemin.bind(this);
      this.receive('fond', function (data) {
        return _this3._addFond(data);
      });
      this.receive('model', function (model, model1, model2) {
        return _this3._setModel(model, model1, model2);
      });
      this.receive('reponseForme', function (forme, x, y) {
        return _this3._addForme(forme, x, y);
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
        //XMM
        this.decoder = new _Decodage2.default();
        this.decoder2 = new _Decodage4.default();
        this.decoder3 = new _Decodage6.default();
      } else {
        //Paramètre initiaux
        this._addBoule(200, 200);
        document.body.style.overflow = "hidden";
        this.centreX = window.innerWidth / 2;
        this.tailleEcranX = window.innerWidth;
        this.tailleEcranY = window.innerHeight;
        this.centreEcranX = this.tailleEcranX / 2;
        this.centreEcranY = this.tailleEcranY / 2;
        setTimeout(function () {
          _this4._myListener(100);
        }, 100);
        this.centreY = window.innerHeight / 2;

        //Detecte les elements SVG
        this.listeEllipse = document.getElementsByTagName('ellipse');
        this.listeRect = document.getElementsByTagName('rect');
        this.totalElements = this.listeEllipse.length + this.listeRect.length;
        this.listeText = document.getElementsByTagName('text');
        this.listeForme = [];
        this.listeRectChemin1 = document.getElementsByClassName('chemin1');
        this.listeRectChemin2 = document.getElementsByClassName('chemin0');
        this.listeRectChemin3 = document.getElementsByClassName('chemin2');

        //Remplace les _textes par leur forme.
        this._remplaceForme();

        //Crée l'univers sonore
        this._creationUniversSonore();

        //Initisalisation
        this.maxCountUpdate = 4;
        this.countUpdate = this.maxCountUpdate + 1; // Initialisation
        this.visualisationBoule = true; // Visualisation de la boule
        if (!this.visualisationBoule) {
          this.view.$el.querySelector('#boule').style.display = 'none';
        }
        this.visualisationForme = false; // Visualisation des formes SVG
        if (!this.visualisationForme) {
          for (var i = 0; i < this.listeEllipse.length; i++) {
            this.listeEllipse[i].style.display = 'none';
          }
          for (var _i = 0; _i < this.listeRect.length; _i++) {
            this.listeRect[_i].style.display = 'none';
          }
        }

        //Pour enelever les bordures :
        if (this.visualisationForme) {
          for (var _i2 = 0; _i2 < this.listeEllipse.length; _i2++) {
            this.listeEllipse[_i2].setAttribute('stroke-width', 0);
          }
          for (var _i3 = 0; _i3 < this.listeRect.length; _i3++) {
            this.listeRect[_i3].setAttribute('stroke-width', 0);
          }
        }

        //Variables 
        this.mirrorBouleX = 250;
        this.mirrorBouleY = 250;
        this.offsetX = 0; // Initisalisation du offset
        this.offsetY = 0;
        this.SVG_MAX_X = document.getElementsByTagName('svg')[0].getAttribute('width');
        this.SVG_MAX_Y = document.getElementsByTagName('svg')[0].getAttribute('height');

        // Gestion de l'orientation
        this.tabIn;
        if (this.motionInput.isAvailable('orientation')) {
          this.motionInput.addListener('orientation', function (data) {
            var newValues = _this4._toMove(data[2], data[1] - 25);
            _this4.tabIn = _this4._isIn(newValues[0], newValues[1]);
            _this4.tabChemin = _this4._isInChemin(newValues[0], newValues[1]);
            if (_this4.countUpdate > _this4.maxCountUpdate) {
              _this4._updateGain(_this4.tabIn);
              _this4.countUpdate = 0;
            } else {
              _this4.countUpdate++;
            }
            _this4._moveScreenTo(newValues[0], newValues[1], 0.08);
            // XMM
            if (_this4.modelOK) {
              _this4.decoder.process(newValues[0], newValues[1]);
              _this4.decoder2.process(newValues[0], newValues[1]);
              _this4.decoder3.process(newValues[0], newValues[1]);
              _this4._processProba();
            }
          });
        } else {
          console.log("Orientation non disponible");
        }
      }
    }

    /* ------------------------------------------MOUVEMENT DE L ECRAN / IMAGES--------------------------------------------- */

    /* Ajoute la boule au fond */

  }, {
    key: '_addBoule',
    value: function _addBoule(x, y) {
      var elem = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      elem.setAttributeNS(null, "cx", x);
      elem.setAttributeNS(null, "cy", y);
      elem.setAttributeNS(null, "r", 10);
      elem.setAttributeNS(null, "stroke", 'white');
      elem.setAttributeNS(null, "stroke-width", 3);
      elem.setAttributeNS(null, "fill", 'black');
      elem.setAttributeNS(null, "id", 'boule');
      document.getElementsByTagName('svg')[0].appendChild(elem);
    }

    /* Ajoute le fond */

  }, {
    key: '_addFond',
    value: function _addFond(fond) {
      // On parse le fichier SVG en DOM
      var parser = new DOMParser();
      var fondXml = parser.parseFromString(fond, 'application/xml');
      fondXml = fondXml.getElementsByTagName('svg')[0];
      document.getElementById('experience').appendChild(fondXml);
      document.getElementsByTagName('svg')[0].setAttribute('id', 'svgElement');
      this._supprimerRectChemin();
      this.startOK = true;
      this.start();
    }

    /* Supprime les rectangles qui suivent les chemins */

  }, {
    key: '_supprimerRectChemin',
    value: function _supprimerRectChemin() {
      var tab = document.getElementsByClassName('chemin1');
      for (var i = 0; i < tab.length; i++) {
        tab[i].style.display = 'none';
      }

      tab = document.getElementsByClassName('chemin2');
      for (var _i4 = 0; _i4 < tab.length; _i4++) {
        tab[_i4].style.display = 'none';
      }

      tab = document.getElementsByClassName('chemin3');
      for (var _i5 = 0; _i5 < tab.length; _i5++) {
        tab[_i5].style.display = 'none';
      }
    }
  }, {
    key: '_addForme',
    value: function _addForme(forme, x, y) {
      // On parse le fichier SVG en DOM
      var parser = new DOMParser();
      var formeXml = parser.parseFromString(forme, 'application/xml');
      formeXml = formeXml.getElementsByTagName('g')[0];
      var boule = document.getElementById('boule');
      var formeXmlTab = formeXml.childNodes;
      for (var i = 0; i < formeXmlTab.length; i++) {
        if (formeXmlTab[i].nodeName == 'path') {
          var newNode = boule.parentNode.insertBefore(formeXmlTab[i], boule);
          this.listeForme[this.listeForme.length] = newNode.setAttribute('transform', 'translate(' + x + ' ' + y + ')');
        }
      }
    }

    /* Callback orientationMotion / Mouvement de la boule*/

  }, {
    key: '_toMove',
    value: function _toMove(valueX, valueY) {
      var obj = this.view.$el.querySelector('#boule');
      var newX = void 0;
      var newY = void 0;
      var actu = this.mirrorBouleX + valueX * 0.3;
      if (actu < this.offsetX) {
        actu = this.offsetX;
      } else if (actu > this.tailleEcranX + this.offsetX) {
        actu = this.tailleEcranX + this.offsetX;
      }
      if (this.visualisationBoule) {
        obj.setAttribute('cx', actu);
      }
      this.mirrorBouleX = actu;
      newX = actu;
      actu = this.mirrorBouleY + valueY * 0.3;
      if (actu < this.offsetY) {
        actu = this.offsetY;
      }
      if (actu > this.tailleEcranY + this.offsetY) {
        actu = this.tailleEcranY + this.offsetY;
      }
      if (this.visualisationBoule) {
        obj.setAttribute('cy', actu);
      }
      this.mirrorBouleY = actu;
      newY = actu;
      return [newX, newY];
    }

    // Déplace l'écran dans la map

  }, {
    key: '_moveScreenTo',
    value: function _moveScreenTo(x, y) {
      var force = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;

      var distanceX = x - this.offsetX - this.centreEcranX;
      var negX = false;
      var indicePowX = 3;
      var indicePowY = 3;
      if (distanceX < 0) {
        negX = true;
      }
      distanceX = Math.pow(Math.abs(distanceX / this.centreEcranX), indicePowX) * this.centreEcranX;
      if (negX) {
        distanceX *= -1;
      }
      if (this.offsetX + distanceX * force >= 0 && this.offsetX + distanceX * force <= this.SVG_MAX_X - this.tailleEcranX) {
        this.offsetX += distanceX * force;
      }

      var distanceY = y - this.offsetY - this.centreEcranY;
      var negY = false;
      if (distanceY < 0) {
        negY = true;
      }
      distanceY = Math.pow(Math.abs(distanceY / this.centreEcranY), indicePowY) * this.centreEcranY;
      if (negY) {
        distanceY *= -1;
      }
      if (this.offsetY + distanceY * force >= 0 && this.offsetY + distanceY * force <= this.SVG_MAX_Y - this.tailleEcranY) {
        this.offsetY += distanceY * force;
      }
      window.scroll(this.offsetX, this.offsetY);
    }
  }, {
    key: '_myListener',
    value: function _myListener(time) {
      this.tailleEcranX = window.innerWidth;
      this.tailleEcranY = window.innerHeight;
      setTimeout(this._myListener, time);
    }
  }, {
    key: '_remplaceForme',
    value: function _remplaceForme() {
      var newList = [];
      for (var i = 0; i < this.listeText.length; i++) {
        newList[i] = this.listeText[i];
      }
      for (var _i6 = 0; _i6 < newList.length; _i6++) {
        var nomElement = newList[_i6].innerHTML;
        if (nomElement.slice(0, 1) == '_') {
          var nomForme = nomElement.slice(1, nomElement.length);
          var x = newList[_i6].getAttribute('x');
          var y = newList[_i6].getAttribute('y');
          this.send('demandeForme', nomForme, x, y);
          var parent = newList[_i6].parentNode;
          parent.removeChild(newList[_i6]);
        }
      }
    }

    /* ------------------------------------------DETERMINATION DES IN/OUT DES FORMES--------------------------------------------- */

    // Fonction qui permet de connaître l'ensemble des figures où le point se situe

  }, {
    key: '_isIn',
    value: function _isIn(x, y) {
      var tab = [];
      var rotateAngle = void 0;
      var centreRotateX = void 0;
      var centreRotateY = void 0;
      for (var i = 0; i < this.listeEllipse.length; i++) {
        rotateAngle = 0;
        var centreX = this.listeEllipse[i].getAttribute('cx');
        var centreY = this.listeEllipse[i].getAttribute('cy');
        var rayonX = this.listeEllipse[i].getAttribute('rx');
        var rayonY = this.listeEllipse[i].getAttribute('ry');
        var trans = this.listeEllipse[i].getAttribute('transform');
        if (/rotate/.test(trans)) {
          trans = trans.slice(7, trans.length);
          centreRotateX = parseFloat(trans.split(" ")[1]);
          centreRotateY = parseFloat(trans.split(",")[1].replace(")", ""));
          rotateAngle = parseFloat(trans.split(" ")[0]);
        }
        tab[tab.length] = this._isInEllipse(parseFloat(centreX), parseFloat(centreY), parseFloat(rayonX), parseFloat(rayonY), x, y, rotateAngle, centreRotateX, centreRotateY);
      }
      for (var _i7 = 0; _i7 < this.listeRect.length; _i7++) {
        rotateAngle = 0;
        centreRotateX = null;
        centreRotateY = null;
        var hauteur = this.listeRect[_i7].getAttribute('width');
        var largeur = this.listeRect[_i7].getAttribute('height');
        var left = this.listeRect[_i7].getAttribute('x');
        var top = this.listeRect[_i7].getAttribute('y');
        var _trans = this.listeRect[_i7].getAttribute('transform');
        if (/rotate/.test(_trans)) {
          _trans = _trans.slice(7, _trans.length);
          centreRotateX = parseFloat(_trans.split(" ")[1]);
          centreRotateY = parseFloat(_trans.split(",")[1].replace(")", ""));
          rotateAngle = parseFloat(_trans.split(" ")[0]);
        }
        tab[tab.length] = this._isInRect(parseFloat(hauteur), parseFloat(largeur), parseFloat(left), parseFloat(top), x, y, rotateAngle, centreRotateX, centreRotateY);
      }
      return tab;
    }

    // Fonctin qui dit dans quel chemin on se trouve

  }, {
    key: '_isInChemin',
    value: function _isInChemin(x, y) {

      //Variables
      var rotateAngle = void 0;
      var centreRotateX = void 0;
      var centreRotateY = void 0;
      var hauteur = void 0;
      var largeur = void 0;
      var left = void 0;
      var top = void 0;
      var trans = void 0;
      var i = 0;

      //CHEMIN 1
      var chemin1 = false;
      while (!chemin1 && i < this.listeRectChemin1.length) {
        rotateAngle = 0;
        centreRotateX = null;
        centreRotateY = null;
        hauteur = this.listeRectChemin1[i].getAttribute('width');
        largeur = this.listeRectChemin1[i].getAttribute('height');
        left = this.listeRectChemin1[i].getAttribute('x');
        top = this.listeRectChemin1[i].getAttribute('y');
        var _trans2 = this.listeRectChemin1[i].getAttribute('transform');
        if (/rotate/.test(_trans2)) {
          _trans2 = _trans2.slice(7, _trans2.length);
          centreRotateX = parseFloat(_trans2.split(" ")[1]);
          centreRotateY = parseFloat(_trans2.split(",")[1].replace(")", ""));
          rotateAngle = parseFloat(_trans2.split(" ")[0]);
        }
        chemin1 = this._isInRect(parseFloat(hauteur), parseFloat(largeur), parseFloat(left), parseFloat(top), x, y, rotateAngle, centreRotateX, centreRotateY);
        i++;
      }

      //CHEMIN 2
      var chemin2 = false;
      i = 0;
      while (!chemin2 && i < this.listeRectChemin2.length) {
        rotateAngle = 0;
        centreRotateX = null;
        centreRotateY = null;
        hauteur = this.listeRectChemin2[i].getAttribute('width');
        largeur = this.listeRectChemin2[i].getAttribute('height');
        left = this.listeRectChemin2[i].getAttribute('x');
        top = this.listeRectChemin2[i].getAttribute('y');
        trans = this.listeRectChemin2[i].getAttribute('transform');
        if (/rotate/.test(trans)) {
          trans = trans.slice(7, trans.length);
          centreRotateX = parseFloat(trans.split(" ")[1]);
          centreRotateY = parseFloat(trans.split(",")[1].replace(")", ""));
          rotateAngle = parseFloat(trans.split(" ")[0]);
        }
        chemin2 = this._isInRect(parseFloat(hauteur), parseFloat(largeur), parseFloat(left), parseFloat(top), x, y, rotateAngle, centreRotateX, centreRotateY);
        i++;
      }

      //CHEMIN 3
      var chemin3 = false;
      i = 0;
      while (!chemin3 && i < this.listeRectChemin3.length) {
        rotateAngle = 0;
        centreRotateX = null;
        centreRotateY = null;
        hauteur = this.listeRectChemin3[i].getAttribute('width');
        largeur = this.listeRectChemin3[i].getAttribute('height');
        left = this.listeRectChemin3[i].getAttribute('x');
        top = this.listeRectChemin3[i].getAttribute('y');
        trans = this.listeRectChemin3[i].getAttribute('transform');
        if (/rotate/.test(trans)) {
          trans = trans.slice(7, trans.length);
          centreRotateX = parseFloat(trans.split(" ")[1]);
          centreRotateY = parseFloat(trans.split(",")[1].replace(")", ""));
          rotateAngle = parseFloat(trans.split(" ")[0]);
        }
        chemin3 = this._isInRect(parseFloat(hauteur), parseFloat(largeur), parseFloat(left), parseFloat(top), x, y, rotateAngle, centreRotateX, centreRotateY);
        i++;
      }
      return [chemin2, chemin1, chemin3];
    }

    // Fonction qui dit si un point est dans un rect

  }, {
    key: '_isInRect',
    value: function _isInRect(hauteur, largeur, left, top, pointX, pointY, rotateAngle, centreRotateX, centreRotateY) {
      //rotation
      var newPoint = this._rotatePoint(pointX, pointY, centreRotateX, centreRotateY, rotateAngle);
      //Appartenance
      if (newPoint[0] > parseInt(left) && newPoint[0] < parseInt(left) + parseInt(hauteur) && newPoint[1] > top && newPoint[1] < parseInt(top) + parseInt(largeur)) {
        return true;
      } else {
        return false;
      }
    }

    // Fonction qui dit si un point est dans une ellipse

  }, {
    key: '_isInEllipse',
    value: function _isInEllipse(centreX, centreY, rayonX, rayonY, pointX, pointY, rotateAngle, centreRotateX, centreRotateY) {
      //rotation
      var newPoint = this._rotatePoint(pointX, pointY, centreRotateX, centreRotateY, rotateAngle);
      //Appartenance 
      var a = rayonX;; // Grand rayon
      var b = rayonY; // Petit rayon
      //const c = Math.sqrt((a*a)-(b*b)); // Distance Foyer
      var calc = Math.pow(newPoint[0] - centreX, 2) / Math.pow(a, 2) + Math.pow(newPoint[1] - centreY, 2) / Math.pow(b, 2);
      if (calc <= 1) {
        return true;
      } else {
        return false;
      }
    }

    // Fonction permettant de réaxer le point

  }, {
    key: '_rotatePoint',
    value: function _rotatePoint(x, y, centreX, centreY, angle) {
      var newAngle = angle * (3.14159265 / 180); // Passage en radian
      var tab = [];
      var newX = (x - centreX) * Math.cos(newAngle) + (y - centreY) * Math.sin(newAngle);
      var newY = -1 * (x - centreX) * Math.sin(newAngle) + (y - centreY) * Math.cos(newAngle);
      newX += centreX;
      newY += centreY;
      //Affichage du symétrique
      // const obj = this.view.$el.querySelector('#bouleR');
      // obj.setAttribute("cx",newX);
      // obj.setAttribute("cy",newY);
      //Fin de l'affichage du symétrique
      tab[0] = newX;
      tab[1] = newY;
      return tab;
    }

    /* ------------------------------------------Calcul des distances--------------------------------------------- */

    // Donne la distance du point avec les formes présentes

  }, {
    key: '_getDistance',
    value: function _getDistance(xValue, yValue) {
      var tab = [];
      for (var i = 0; i < this.listeEllipse.length; i++) {
        tab[tab.length] = this._getDistanceNode(this.listeEllipse[i], xValue, yValue);
      }
      for (var _i8 = 0; _i8 < this.listeRect.length; _i8++) {
        tab[tab.length] = this._getDistanceNode(this.listeRect[_i8], xValue, yValue);
      }
      return tab;
    }

    // Donne la distance d'un point avec une forme

  }, {
    key: '_getDistanceNode',
    value: function _getDistanceNode(node, x, y) {
      if (node.tagName == "ellipse") {
        var centreX = parseInt(node.getAttribute('cx'));
        var centreY = parseInt(node.getAttribute('cy'));
        return Math.sqrt(Math.pow(centreX - x, 2) + Math.pow(centreY - y, 2));
      } else if (node.tagName == 'rect') {
        var left = parseInt(node.getAttribute('x'));
        var top = parseInt(node.getAttribute('y'));
        var haut = parseInt(node.getAttribute('height'));
        var larg = parseInt(node.getAttribute('width'));
        var _centreX = (left + larg) / 2;
        var _centreY = (top + haut) / 2;
        return Math.sqrt(Math.pow(_centreX - x, 2) + Math.pow(_centreY - y, 2));
      }
    }

    /* ------------------------------------------SON--------------------------------------------- */

    // Créé le moteur sonore

  }, {
    key: '_creationUniversSonore',
    value: function _creationUniversSonore() {
      //Granulateur
      this.grain = new _MyGrain2.default();
      scheduler.add(this.grain);
      this.grain.connect(audioContext.destination);
      var bufferAssocies = [5, 7, 9];
      var markerAssocies = [6, 8, 10];
      //Segmenter
      for (var i = 0; i < this.nbChemin; i++) {
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
        this.segmenterGain[i].connect(audioContext.destination);
        this.segmenterGainGrain[i].gain.setValueAtTime(0, audioContext.currentTime);
        this.segmenterGain[i].gain.setValueAtTime(0, audioContext.currentTime);
        this.segmenterGainGrain[i].connect(this.grain.input);
        this.segmenter[i].connect(this.segmenterGain[i]);
        this.segmenter[i].connect(this.segmenterGainGrain[i]);
        this._startSegmenter(i);
      }

      // Nappe de fond
      for (var _i9 = 0; _i9 < this.totalElements; _i9++) {

        //Création des gains d'entrée/sorties des nappes
        this.gainsDirections[_i9] = 'down';
        this.gains[_i9] = audioContext.createGain();
        this.gains[_i9].gain.value = 0;
        this.gains[_i9].connect(this.grain.input);

        //Création des sources pour le granulateur
        this.sources[_i9] = audioContext.createBufferSource();
        this.sources[_i9].buffer = this.loader.buffers[_i9 % 5];
        this.sources[_i9].connect(this.gains[_i9]);
        this.sources[_i9].loop = true;
        this.sources[_i9].start();
      }

      // Figure
    }
  }, {
    key: '_startSegmenter',
    value: function _startSegmenter(i) {
      var _this5 = this;

      this.segmenter[i].trigger();
      var newPeriod = parseFloat(this.loader.buffers[6]['duration'][this.segmenter[i].segmentIndex]) * 1000;
      setTimeout(function () {
        _this5._startSegmenter(i);
      }, newPeriod);
    }
    //Création des sources pour les formes
    //this.sources;

    // Fait monter le son quand la boule est dans la forme et baisser si la boule n'y est pas

  }, {
    key: '_updateGain',
    value: function _updateGain(tabIn) {
      for (var i = 0; i < tabIn.length; i++) {
        if (this.gains[i].gain.value == 0 && tabIn[i] && this.gainsDirections[i] == 'down') {
          var actual = this.gains[i].gain.value;
          this.gains[i].gain.cancelScheduledValues(audioContext.currentTime);
          this.gains[i].gain.setValueAtTime(actual, audioContext.currentTime);
          this.gains[i].gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 1);
          this.gainsDirections[i] = 'up';
        } else if (this.gains[i].gain.value != 0 && !tabIn[i] && this.gainsDirections[i] == 'up') {
          var _actual = this.gains[i].gain.value;
          this.gains[i].gain.cancelScheduledValues(audioContext.currentTime);
          this.gains[i].gain.setValueAtTime(_actual, audioContext.currentTime);
          this.gains[i].gain.linearRampToValueAtTime(0, audioContext.currentTime + 1);
          this.gainsDirections[i] = 'down';
        }
      }
    }
  }, {
    key: '_actualiserAudioChemin',
    value: function _actualiserAudioChemin(i) {
      var _this6 = this;

      if (this.tabChemin[i]) {
        var actual1 = this.segmenterGain[i].gain.value;
        var actual2 = this.segmenterGainGrain[i].gain.value;
        this.segmenterGain[i].gain.cancelScheduledValues(audioContext.currentTime);
        this.segmenterGainGrain[i].gain.cancelScheduledValues(audioContext.currentTime);
        this.segmenterGain[i].gain.setValueAtTime(actual1, audioContext.currentTime);
        this.segmenterGainGrain[i].gain.setValueAtTime(actual2, audioContext.currentTime);
        this.segmenterGainGrain[i].gain.linearRampToValueAtTime(0, audioContext.currentTime + 2);
        this.segmenterGain[i].gain.linearRampToValueAtTime(0.4, audioContext.currentTime + 3);
      } else {
        var _actual2 = this.segmenterGain[i].gain.value;
        var _actual3 = this.segmenterGainGrain[i].gain.value;
        this.segmenterGain[i].gain.cancelScheduledValues(audioContext.currentTime);
        this.segmenterGainGrain[i].gain.cancelScheduledValues(audioContext.currentTime);
        this.segmenterGain[i].gain.setValueAtTime(_actual2, audioContext.currentTime);
        this.segmenterGainGrain[i].gain.setValueAtTime(_actual3, audioContext.currentTime);
        if (this.startSegmentFini[i]) {
          this.segmenterGainGrain[i].gain.linearRampToValueAtTime(0.9, audioContext.currentTime + 2);
          setTimeout(function () {
            _this6.segmenterGainGrain[i].gain.linearRampToValueAtTime(0, audioContext.currentTime + 1.5);
          }, 2000);
          this.segmenterGain[i].gain.linearRampToValueAtTime(0, audioContext.currentTime + 2.5);
        } else {
          this.startSegmentFini[i] = true;
        }
      }
    }

    /* -----------------------------------------XMM----------------------------------------------- */

  }, {
    key: '_setModel',
    value: function _setModel(model, model1, model2) {
      this.decoder.setModel(model);
      this.decoder2.setModel(model1);
      this.decoder3.setModel(model2);
      this.modelOK = true;
    }
  }, {
    key: '_processProba',
    value: function _processProba() {
      var probaMax = this.decoder.getProba();
      var probaMax1 = this.decoder2.getProba();
      var probaMax2 = this.decoder3.getProba();
      var newSegment = [];
      for (var i = 0; i < this.nbChemin; i++) {
        newSegment[i] = this._findNewSegment(probaMax1, probaMax2, i);
        this._actualiserSegmentIfNotIn(newSegment[i], i);
        var nom1 = 'fond-' + i + '-1';
        var nom2 = 'fond-' + i + '-2';
        if (this.tabChemin[i] && (probaMax1[0] == nom1 || probaMax2[0] == nom2)) {
          if (probaMax1[1][i] != NaN) {
            this.segmenter[i].segmentIndex = newSegment[i];
          }
        }
        if (this.tabChemin[i] != this.oldTabChemin[i]) {
          this._actualiserAudioChemin(i);
        }
        this.oldTabChemin[i] = this.tabChemin[i];
      }
    }

    // Trouve en fonction de xmm le segment le plus proche de la position de l'utilisateur

  }, {
    key: '_findNewSegment',
    value: function _findNewSegment(probaMax1, probaMax2, id) {
      var newSegment = -1;
      var actuel = null;
      if (this.ancien1[id] - probaMax1[1][id] < -0.001) {
        newSegment = (0, _trunc2.default)(probaMax1[1][id] * this.nbSegment[id]);
        actuel = "1";
        if (this.count2[id] > this.countMax) {
          this.decoder3.reset();
          this.count2[id] = 0;
        }
        this.count1[id] = 0;
        this.count2[id]++;
      } else if (this.ancien2[id] - probaMax2[1][id] < -0.001) {
        newSegment = (0, _trunc2.default)((1 - probaMax2[1][id]) * this.nbSegment[id]);
        actuel = "0";
        if (this.count1[id] > this.countMax) {
          this.decoder2.reset();
          this.count1[id] = 0;
        }
        this.count2[id] = 0;
        this.count1[id]++;
      } else {
        newSegment = this.segmenter[id].segmentIndex;
      }
      this.ancien1[id] = probaMax1[1][id];
      this.ancien2[id] = probaMax2[1][id];
      return newSegment;
    }

    // Fais avancer la tête de lecture des segmenter si l'utilisateur n'est pas dans une forme

  }, {
    key: '_actualiserSegmentIfNotIn',
    value: function _actualiserSegmentIfNotIn(newSegment, id) {
      if (!this.tabChemin[id]) {
        if (this.countTimeout[id] > 40) {
          if (newSegment > 59) {
            this.direction[id] = false;
          } else if (newSegment < 1) {
            this.direction[id] = true;
          }
          this.countTimeout[id] = 0;
          if (this.direction[id]) {
            newSegment++;
          } else {
            newSegment--;
          }
        }
        this.countTimeout[id]++;
        this.segmenter[id].segmentIndex = newSegment;
      }
    }
  }]);
  return PlayerExperience;
}(soundworks.Experience);

exports.default = PlayerExperience;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlBsYXllckV4cGVyaWVuY2UuanMiXSwibmFtZXMiOlsic291bmR3b3JrcyIsIndhdmVzIiwiYXVkaW9Db250ZXh0Iiwic2NoZWR1bGVyIiwiZ2V0U2NoZWR1bGVyIiwiUGxheWVyVmlldyIsInRlbXBsYXRlIiwiY29udGVudCIsImV2ZW50cyIsIm9wdGlvbnMiLCJWaWV3IiwidmlldyIsIlBsYXllckV4cGVyaWVuY2UiLCJhc3NldHNEb21haW4iLCJwbGF0Zm9ybSIsInJlcXVpcmUiLCJmZWF0dXJlcyIsIm1vdGlvbklucHV0IiwiZGVzY3JpcHRvcnMiLCJsb2FkZXIiLCJmaWxlcyIsInN0YXJ0T0siLCJzdGFydFNlZ21lbnRGaW5pIiwibW9kZWxPSyIsIm5iQ2hlbWluIiwibmJTZWdtZW50IiwiYW5jaWVuMSIsImFuY2llbjIiLCJjb3VudFRpbWVvdXQiLCJkaXJlY3Rpb24iLCJvbGRUYWJDaGVtaW4iLCJjb3VudDEiLCJjb3VudDIiLCJzZWdtZW50ZXIiLCJzZWdtZW50ZXJHYWluIiwic2VnbWVudGVyR2FpbkdyYWluIiwic291cmNlcyIsImdhaW5zIiwiZ2FpbnNEaXJlY3Rpb25zIiwiZ3JhaW4iLCJjb3VudE1heCIsImkiLCJ2aWV3VGVtcGxhdGUiLCJ2aWV3Q29udGVudCIsInZpZXdDdG9yIiwidmlld09wdGlvbnMiLCJwcmVzZXJ2ZVBpeGVsUmF0aW8iLCJjcmVhdGVWaWV3IiwiX3RvTW92ZSIsImJpbmQiLCJfaXNJbkVsbGlwc2UiLCJfaXNJblJlY3QiLCJfaXNJbiIsIl9pc0luQ2hlbWluIiwiX2dldERpc3RhbmNlTm9kZSIsIl9jcmVhdGlvblVuaXZlcnNTb25vcmUiLCJfdXBkYXRlR2FpbiIsIl9yb3RhdGVQb2ludCIsIl9teUxpc3RlbmVyIiwiX2FkZEJvdWxlIiwiX2FkZEZvbmQiLCJfc2V0TW9kZWwiLCJfcHJvY2Vzc1Byb2JhIiwiX3JlbXBsYWNlRm9ybWUiLCJfYWRkRm9ybWUiLCJfc3RhcnRTZWdtZW50ZXIiLCJfZmluZE5ld1NlZ21lbnQiLCJfYWN0dWFsaXNlclNlZ21lbnRJZk5vdEluIiwiX2FjdHVhbGlzZXJBdWRpb0NoZW1pbiIsInJlY2VpdmUiLCJkYXRhIiwibW9kZWwiLCJtb2RlbDEiLCJtb2RlbDIiLCJmb3JtZSIsIngiLCJ5IiwiaGFzU3RhcnRlZCIsImluaXQiLCJzaG93IiwiZGVjb2RlciIsImRlY29kZXIyIiwiZGVjb2RlcjMiLCJkb2N1bWVudCIsImJvZHkiLCJzdHlsZSIsIm92ZXJmbG93IiwiY2VudHJlWCIsIndpbmRvdyIsImlubmVyV2lkdGgiLCJ0YWlsbGVFY3JhblgiLCJ0YWlsbGVFY3JhblkiLCJpbm5lckhlaWdodCIsImNlbnRyZUVjcmFuWCIsImNlbnRyZUVjcmFuWSIsInNldFRpbWVvdXQiLCJjZW50cmVZIiwibGlzdGVFbGxpcHNlIiwiZ2V0RWxlbWVudHNCeVRhZ05hbWUiLCJsaXN0ZVJlY3QiLCJ0b3RhbEVsZW1lbnRzIiwibGVuZ3RoIiwibGlzdGVUZXh0IiwibGlzdGVGb3JtZSIsImxpc3RlUmVjdENoZW1pbjEiLCJnZXRFbGVtZW50c0J5Q2xhc3NOYW1lIiwibGlzdGVSZWN0Q2hlbWluMiIsImxpc3RlUmVjdENoZW1pbjMiLCJtYXhDb3VudFVwZGF0ZSIsImNvdW50VXBkYXRlIiwidmlzdWFsaXNhdGlvbkJvdWxlIiwiJGVsIiwicXVlcnlTZWxlY3RvciIsImRpc3BsYXkiLCJ2aXN1YWxpc2F0aW9uRm9ybWUiLCJzZXRBdHRyaWJ1dGUiLCJtaXJyb3JCb3VsZVgiLCJtaXJyb3JCb3VsZVkiLCJvZmZzZXRYIiwib2Zmc2V0WSIsIlNWR19NQVhfWCIsImdldEF0dHJpYnV0ZSIsIlNWR19NQVhfWSIsInRhYkluIiwiaXNBdmFpbGFibGUiLCJhZGRMaXN0ZW5lciIsIm5ld1ZhbHVlcyIsInRhYkNoZW1pbiIsIl9tb3ZlU2NyZWVuVG8iLCJwcm9jZXNzIiwiY29uc29sZSIsImxvZyIsImVsZW0iLCJjcmVhdGVFbGVtZW50TlMiLCJzZXRBdHRyaWJ1dGVOUyIsImFwcGVuZENoaWxkIiwiZm9uZCIsInBhcnNlciIsIkRPTVBhcnNlciIsImZvbmRYbWwiLCJwYXJzZUZyb21TdHJpbmciLCJnZXRFbGVtZW50QnlJZCIsIl9zdXBwcmltZXJSZWN0Q2hlbWluIiwic3RhcnQiLCJ0YWIiLCJmb3JtZVhtbCIsImJvdWxlIiwiZm9ybWVYbWxUYWIiLCJjaGlsZE5vZGVzIiwibm9kZU5hbWUiLCJuZXdOb2RlIiwicGFyZW50Tm9kZSIsImluc2VydEJlZm9yZSIsInZhbHVlWCIsInZhbHVlWSIsIm9iaiIsIm5ld1giLCJuZXdZIiwiYWN0dSIsImZvcmNlIiwiZGlzdGFuY2VYIiwibmVnWCIsImluZGljZVBvd1giLCJpbmRpY2VQb3dZIiwiTWF0aCIsInBvdyIsImFicyIsImRpc3RhbmNlWSIsIm5lZ1kiLCJzY3JvbGwiLCJ0aW1lIiwibmV3TGlzdCIsIm5vbUVsZW1lbnQiLCJpbm5lckhUTUwiLCJzbGljZSIsIm5vbUZvcm1lIiwic2VuZCIsInBhcmVudCIsInJlbW92ZUNoaWxkIiwicm90YXRlQW5nbGUiLCJjZW50cmVSb3RhdGVYIiwiY2VudHJlUm90YXRlWSIsInJheW9uWCIsInJheW9uWSIsInRyYW5zIiwidGVzdCIsInBhcnNlRmxvYXQiLCJzcGxpdCIsInJlcGxhY2UiLCJoYXV0ZXVyIiwibGFyZ2V1ciIsImxlZnQiLCJ0b3AiLCJjaGVtaW4xIiwiY2hlbWluMiIsImNoZW1pbjMiLCJwb2ludFgiLCJwb2ludFkiLCJuZXdQb2ludCIsInBhcnNlSW50IiwiYSIsImIiLCJjYWxjIiwiYW5nbGUiLCJuZXdBbmdsZSIsImNvcyIsInNpbiIsInhWYWx1ZSIsInlWYWx1ZSIsIm5vZGUiLCJ0YWdOYW1lIiwic3FydCIsImhhdXQiLCJsYXJnIiwiYWRkIiwiY29ubmVjdCIsImRlc3RpbmF0aW9uIiwiYnVmZmVyQXNzb2NpZXMiLCJtYXJrZXJBc3NvY2llcyIsImlkQnVmZmVyIiwiaWRNYXJrZXIiLCJTZWdtZW50RW5naW5lIiwiYnVmZmVyIiwiYnVmZmVycyIsInBvc2l0aW9uQXJyYXkiLCJkdXJhdGlvbkFycmF5IiwiZHVyYXRpb24iLCJwZXJpb2RBYnMiLCJwZXJpb2RSZWwiLCJjcmVhdGVHYWluIiwiZ2FpbiIsInNldFZhbHVlQXRUaW1lIiwiY3VycmVudFRpbWUiLCJpbnB1dCIsInZhbHVlIiwiY3JlYXRlQnVmZmVyU291cmNlIiwibG9vcCIsInRyaWdnZXIiLCJuZXdQZXJpb2QiLCJzZWdtZW50SW5kZXgiLCJhY3R1YWwiLCJjYW5jZWxTY2hlZHVsZWRWYWx1ZXMiLCJsaW5lYXJSYW1wVG9WYWx1ZUF0VGltZSIsImFjdHVhbDEiLCJhY3R1YWwyIiwic2V0TW9kZWwiLCJwcm9iYU1heCIsImdldFByb2JhIiwicHJvYmFNYXgxIiwicHJvYmFNYXgyIiwibmV3U2VnbWVudCIsIm5vbTEiLCJub20yIiwiTmFOIiwiaWQiLCJhY3R1ZWwiLCJyZXNldCIsIkV4cGVyaWVuY2UiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7SUFBWUEsVTs7QUFDWjs7OztBQUNBOztJQUFZQyxLOztBQUNaOztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7Ozs7QUFFQSxJQUFNQyxlQUFlRixXQUFXRSxZQUFoQztBQUNBLElBQU1DLFlBQVlGLE1BQU1HLFlBQU4sRUFBbEI7O0lBRU1DLFU7OztBQUNKLHNCQUFZQyxRQUFaLEVBQXNCQyxPQUF0QixFQUErQkMsTUFBL0IsRUFBdUNDLE9BQXZDLEVBQWdEO0FBQUE7QUFBQSx5SUFDeENILFFBRHdDLEVBQzlCQyxPQUQ4QixFQUNyQkMsTUFEcUIsRUFDYkMsT0FEYTtBQUUvQzs7O0VBSHNCVCxXQUFXVSxJOztBQU1wQyxJQUFNQyxTQUFOOztBQUVBO0FBQ0E7O0lBQ3FCQyxnQjs7O0FBQ25CLDRCQUFZQyxZQUFaLEVBQTBCO0FBQUE7O0FBRXhCO0FBRndCOztBQUd4QixXQUFLQyxRQUFMLEdBQWdCLE9BQUtDLE9BQUwsQ0FBYSxVQUFiLEVBQXlCLEVBQUVDLFVBQVUsQ0FBQyxXQUFELEVBQWMsV0FBZCxDQUFaLEVBQXpCLENBQWhCO0FBQ0EsV0FB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VUFBbEM7QUFDRDtBQUNGOzs7RUExdEIyQzFQLFdBQVdpUSxVOztrQkFBcENyUCxnQiIsImZpbGUiOiJQbGF5ZXJFeHBlcmllbmNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgc291bmR3b3JrcyBmcm9tICdzb3VuZHdvcmtzL2NsaWVudCc7XG5pbXBvcnQgTXlHcmFpbiBmcm9tICcuL015R3JhaW4uanMnO1xuaW1wb3J0ICogYXMgd2F2ZXMgZnJvbSAnd2F2ZXMtYXVkaW8nO1xuaW1wb3J0IHtIaG1tRGVjb2Rlckxmb30gZnJvbSAneG1tLWxmbydcbmltcG9ydCBEZWNvZGFnZSBmcm9tICcuL0RlY29kYWdlLmpzJztcbmltcG9ydCBEZWNvZGFnZTIgZnJvbSAnLi9EZWNvZGFnZTIuanMnO1xuaW1wb3J0IERlY29kYWdlMyBmcm9tIFwiLi9EZWNvZGFnZTMuanNcIjtcblxuY29uc3QgYXVkaW9Db250ZXh0ID0gc291bmR3b3Jrcy5hdWRpb0NvbnRleHQ7XG5jb25zdCBzY2hlZHVsZXIgPSB3YXZlcy5nZXRTY2hlZHVsZXIoKTtcblxuY2xhc3MgUGxheWVyVmlldyBleHRlbmRzIHNvdW5kd29ya3MuVmlld3tcbiAgY29uc3RydWN0b3IodGVtcGxhdGUsIGNvbnRlbnQsIGV2ZW50cywgb3B0aW9ucykge1xuICAgIHN1cGVyKHRlbXBsYXRlLCBjb250ZW50LCBldmVudHMsIG9wdGlvbnMpO1xuICB9XG59XG5cbmNvbnN0IHZpZXc9IGBgO1xuXG4vLyB0aGlzIGV4cGVyaWVuY2UgcGxheXMgYSBzb3VuZCB3aGVuIGl0IHN0YXJ0cywgYW5kIHBsYXlzIGFub3RoZXIgc291bmQgd2hlblxuLy8gb3RoZXIgY2xpZW50cyBqb2luIHRoZSBleHBlcmllbmNlXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQbGF5ZXJFeHBlcmllbmNlIGV4dGVuZHMgc291bmR3b3Jrcy5FeHBlcmllbmNlIHtcbiAgY29uc3RydWN0b3IoYXNzZXRzRG9tYWluKSB7XG4gICAgc3VwZXIoKTtcbiAgICAvL1NlcnZpY2VzXG4gICAgdGhpcy5wbGF0Zm9ybSA9IHRoaXMucmVxdWlyZSgncGxhdGZvcm0nLCB7IGZlYXR1cmVzOiBbJ3dlYi1hdWRpbycsICd3YWtlLWxvY2snXSB9KTtcbiAgICB0aGlzLm1vdGlvbklucHV0ID0gdGhpcy5yZXF1aXJlKCdtb3Rpb24taW5wdXQnLCB7IGRlc2NyaXB0b3JzOiBbJ29yaWVudGF0aW9uJ10gfSk7XG4gICAgdGhpcy5sb2FkZXIgPSB0aGlzLnJlcXVpcmUoJ2xvYWRlcicsIHsgXG4gICAgICBmaWxlczogWydzb3VuZHMvbmFwcGUvZ2Fkb3VlLm1wMycsIC8vMFxuICAgICAgICAgICAgICAnc291bmRzL25hcHBlL2dhZG91ZS5tcDMnLCAvLzFcbiAgICAgICAgICAgICAgXCJzb3VuZHMvbmFwcGUvbmFnZS5tcDNcIiwgIC8vIC4uLlxuICAgICAgICAgICAgICBcInNvdW5kcy9uYXBwZS90ZW1wZXRlLm1wM1wiLFxuICAgICAgICAgICAgICBcInNvdW5kcy9uYXBwZS92ZW50Lm1wM1wiLFxuICAgICAgICAgICAgICBcInNvdW5kcy9jYW11cy5tcDNcIiwgLy8gNSAgXG4gICAgICAgICAgICAgIFwibWFya2Vycy9tYXJrZXJzLmpzb25cIiwgXG4gICAgICAgICAgICAgIFwic291bmRzL29iYW1hLm1wM1wiLCAgICBcbiAgICAgICAgICAgICAgXCJtYXJrZXJzL21hcmtlcnMuanNvblwiLFxuICAgICAgICAgICAgICBcInNvdW5kcy9sYXN0Lm1wM1wiLCAgIFxuICAgICAgICAgICAgICBcIm1hcmtlcnMvbWFya2Vycy5qc29uXCJdIC8vMTAgIFxuICAgIH0pO1xuICAgIHRoaXMuc3RhcnRPSyA9IGZhbHNlO1xuICAgIHRoaXMuc3RhcnRTZWdtZW50RmluaSA9IFtdO1xuICAgIHRoaXMubW9kZWxPSyA9IGZhbHNlO1xuXG4gICAgLy8gUEFSQU1FVFJFXG4gICAgdGhpcy5uYkNoZW1pbiA9IDM7XG4gICAgdGhpcy5uYlNlZ21lbnQgPSBbNTksNTksNTldO1xuXG4gICAgLy9cbiAgICB0aGlzLmFuY2llbjEgPSBbXTtcbiAgICB0aGlzLmFuY2llbjIgPSBbXTtcbiAgICB0aGlzLmNvdW50VGltZW91dCA9IFtdO1xuICAgIHRoaXMuZGlyZWN0aW9uID0gW107XG4gICAgdGhpcy5vbGRUYWJDaGVtaW4gPSBbXTtcbiAgICB0aGlzLmNvdW50MSA9IFtdO1xuICAgIHRoaXMuY291bnQyID0gW107XG4gICAgdGhpcy5zZWdtZW50ZXIgPSBbXTtcbiAgICB0aGlzLnNlZ21lbnRlckdhaW4gPSBbXTtcbiAgICB0aGlzLnNlZ21lbnRlckdhaW5HcmFpbiA9IFtdO1xuICAgIHRoaXMuc291cmNlcyA9IFtdO1xuICAgIHRoaXMuZ2FpbnMgPSBbXTtcbiAgICB0aGlzLmdhaW5zRGlyZWN0aW9ucyA9IFtdO1xuICAgIHRoaXMuZ3JhaW47XG4gICAgdGhpcy5jb3VudE1heCA9IDIwO1xuXG4gICAgZm9yKGxldCBpID0wOyBpPHRoaXMubmJDaGVtaW47aSsrKXtcbiAgICAgIHRoaXMuY291bnQxW2ldID0gMjA7XG4gICAgICB0aGlzLmNvdW50MltpXSA9IDIwO1xuICAgICAgdGhpcy5hbmNpZW4xW2ldID0gMDtcbiAgICAgIHRoaXMuYW5jaWVuMltpXSA9IDA7XG4gICAgICB0aGlzLmNvdW50VGltZW91dFtpXSA9IDA7XG4gICAgICB0aGlzLmRpcmVjdGlvbltpXSA9IHRydWU7XG4gICAgICB0aGlzLm9sZFRhYkNoZW1pbltpXSA9IHRydWU7XG4gICAgICB0aGlzLnN0YXJ0U2VnbWVudEZpbmlbaV0gPSBmYWxzZTtcbiAgICB9IFxuICB9XG5cbiAgaW5pdCgpIHtcbiAgICAvLyBpbml0aWFsaXplIHRoZSB2aWV3XG4gICAgdGhpcy52aWV3VGVtcGxhdGUgPSB2aWV3O1xuICAgIHRoaXMudmlld0NvbnRlbnQgPSB7fTtcbiAgICB0aGlzLnZpZXdDdG9yID0gUGxheWVyVmlldztcbiAgICB0aGlzLnZpZXdPcHRpb25zID0geyBwcmVzZXJ2ZVBpeGVsUmF0aW86IHRydWUgfTtcbiAgICB0aGlzLnZpZXcgPSB0aGlzLmNyZWF0ZVZpZXcoKTtcblxuICAgIC8vYmluZFxuICAgIHRoaXMuX3RvTW92ZSA9IHRoaXMuX3RvTW92ZS5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX2lzSW5FbGxpcHNlID0gdGhpcy5faXNJbkVsbGlwc2UuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9pc0luUmVjdCA9IHRoaXMuX2lzSW5SZWN0LmJpbmQodGhpcyk7XG4gICAgdGhpcy5faXNJbiA9IHRoaXMuX2lzSW4uYmluZCh0aGlzKTtcbiAgICB0aGlzLl9pc0luQ2hlbWluID0gdGhpcy5faXNJbkNoZW1pbi5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX2dldERpc3RhbmNlTm9kZSA9IHRoaXMuX2dldERpc3RhbmNlTm9kZS5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX2NyZWF0aW9uVW5pdmVyc1Nvbm9yZT10aGlzLl9jcmVhdGlvblVuaXZlcnNTb25vcmUuYmluZCh0aGlzKTtcbiAgICB0aGlzLl91cGRhdGVHYWluID0gdGhpcy5fdXBkYXRlR2Fpbi5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX3JvdGF0ZVBvaW50ID0gdGhpcy5fcm90YXRlUG9pbnQuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9teUxpc3RlbmVyPSB0aGlzLl9teUxpc3RlbmVyLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fYWRkQm91bGUgPSB0aGlzLl9hZGRCb3VsZS5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX2FkZEZvbmQgPSB0aGlzLl9hZGRGb25kLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fc2V0TW9kZWwgPSB0aGlzLl9zZXRNb2RlbC5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX3Byb2Nlc3NQcm9iYSA9IHRoaXMuX3Byb2Nlc3NQcm9iYS5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX3JlbXBsYWNlRm9ybWUgPSB0aGlzLl9yZW1wbGFjZUZvcm1lLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fYWRkRm9ybWUgPSB0aGlzLl9hZGRGb3JtZS5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX3N0YXJ0U2VnbWVudGVyID0gdGhpcy5fc3RhcnRTZWdtZW50ZXIuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9maW5kTmV3U2VnbWVudCA9IHRoaXMuX2ZpbmROZXdTZWdtZW50LmJpbmQodGhpcyk7XG4gICAgdGhpcy5fYWN0dWFsaXNlclNlZ21lbnRJZk5vdEluID0gdGhpcy5fYWN0dWFsaXNlclNlZ21lbnRJZk5vdEluLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fYWN0dWFsaXNlckF1ZGlvQ2hlbWluID0gdGhpcy5fYWN0dWFsaXNlckF1ZGlvQ2hlbWluLmJpbmQodGhpcyk7XG4gICAgdGhpcy5yZWNlaXZlKCdmb25kJywoZGF0YSk9PnRoaXMuX2FkZEZvbmQoZGF0YSkpO1xuICAgIHRoaXMucmVjZWl2ZSgnbW9kZWwnLChtb2RlbCxtb2RlbDEsbW9kZWwyKT0+dGhpcy5fc2V0TW9kZWwobW9kZWwsbW9kZWwxLG1vZGVsMikpO1xuICAgIHRoaXMucmVjZWl2ZSgncmVwb25zZUZvcm1lJywoZm9ybWUseCx5KT0+dGhpcy5fYWRkRm9ybWUoZm9ybWUseCx5KSk7XG4gfVxuXG4gIHN0YXJ0KCkge1xuICAgIGlmKCF0aGlzLnN0YXJ0T0spe1xuICAgICAgc3VwZXIuc3RhcnQoKTsgLy8gZG9uJ3QgZm9yZ2V0IHRoaXNcbiAgICAgIGlmICghdGhpcy5oYXNTdGFydGVkKVxuICAgICAgICB0aGlzLmluaXQoKTtcbiAgICAgIHRoaXMuc2hvdygpO1xuICAgICAgLy9YTU1cbiAgICAgIHRoaXMuZGVjb2RlciA9IG5ldyBEZWNvZGFnZSgpO1xuICAgICAgdGhpcy5kZWNvZGVyMiA9IG5ldyBEZWNvZGFnZTIoKTtcbiAgICAgIHRoaXMuZGVjb2RlcjMgPSBuZXcgRGVjb2RhZ2UzKCk7XG4gICAgfWVsc2V7XG4gICAgICAvL1BhcmFtw6h0cmUgaW5pdGlhdXhcbiAgICAgIHRoaXMuX2FkZEJvdWxlKDIwMCwyMDApO1xuICAgICAgZG9jdW1lbnQuYm9keS5zdHlsZS5vdmVyZmxvdyA9IFwiaGlkZGVuXCI7ICBcbiAgICAgIHRoaXMuY2VudHJlWCA9IHdpbmRvdy5pbm5lcldpZHRoLzI7XG4gICAgICB0aGlzLnRhaWxsZUVjcmFuWCA9IHdpbmRvdy5pbm5lcldpZHRoO1xuICAgICAgdGhpcy50YWlsbGVFY3JhblkgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG4gICAgICB0aGlzLmNlbnRyZUVjcmFuWCA9IHRoaXMudGFpbGxlRWNyYW5YLzI7XG4gICAgICB0aGlzLmNlbnRyZUVjcmFuWSA9IHRoaXMudGFpbGxlRWNyYW5ZLzI7XG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHt0aGlzLl9teUxpc3RlbmVyKDEwMCl9LDEwMCk7XG4gICAgICB0aGlzLmNlbnRyZVkgPSB3aW5kb3cuaW5uZXJIZWlnaHQvMjtcblxuICAgICAgLy9EZXRlY3RlIGxlcyBlbGVtZW50cyBTVkdcbiAgICAgIHRoaXMubGlzdGVFbGxpcHNlID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2VsbGlwc2UnKTtcbiAgICAgIHRoaXMubGlzdGVSZWN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3JlY3QnKTtcbiAgICAgIHRoaXMudG90YWxFbGVtZW50cyA9IHRoaXMubGlzdGVFbGxpcHNlLmxlbmd0aCArIHRoaXMubGlzdGVSZWN0Lmxlbmd0aDtcbiAgICAgIHRoaXMubGlzdGVUZXh0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3RleHQnKTtcbiAgICAgIHRoaXMubGlzdGVGb3JtZSA9IFtdO1xuICAgICAgdGhpcy5saXN0ZVJlY3RDaGVtaW4xID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnY2hlbWluMScpO1xuICAgICAgdGhpcy5saXN0ZVJlY3RDaGVtaW4yID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnY2hlbWluMCcpO1xuICAgICAgdGhpcy5saXN0ZVJlY3RDaGVtaW4zID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnY2hlbWluMicpO1xuXG4gICAgICAvL1JlbXBsYWNlIGxlcyBfdGV4dGVzIHBhciBsZXVyIGZvcm1lLlxuICAgICAgdGhpcy5fcmVtcGxhY2VGb3JtZSgpOyBcblxuICAgICAgLy9DcsOpZSBsJ3VuaXZlcnMgc29ub3JlXG4gICAgICB0aGlzLl9jcmVhdGlvblVuaXZlcnNTb25vcmUoKTtcblxuICAgICAgLy9Jbml0aXNhbGlzYXRpb25cbiAgICAgIHRoaXMubWF4Q291bnRVcGRhdGUgPSA0O1xuICAgICAgdGhpcy5jb3VudFVwZGF0ZSA9IHRoaXMubWF4Q291bnRVcGRhdGUgKyAxOyAvLyBJbml0aWFsaXNhdGlvblxuICAgICAgdGhpcy52aXN1YWxpc2F0aW9uQm91bGU9dHJ1ZTsgLy8gVmlzdWFsaXNhdGlvbiBkZSBsYSBib3VsZVxuICAgICAgaWYoIXRoaXMudmlzdWFsaXNhdGlvbkJvdWxlKXtcbiAgICAgICAgdGhpcy52aWV3LiRlbC5xdWVyeVNlbGVjdG9yKCcjYm91bGUnKS5zdHlsZS5kaXNwbGF5PSdub25lJztcbiAgICAgIH1cbiAgICAgIHRoaXMudmlzdWFsaXNhdGlvbkZvcm1lPWZhbHNlOyAvLyBWaXN1YWxpc2F0aW9uIGRlcyBmb3JtZXMgU1ZHXG4gICAgICBpZighdGhpcy52aXN1YWxpc2F0aW9uRm9ybWUpe1xuICAgICAgICBmb3IobGV0IGkgPSAwO2k8dGhpcy5saXN0ZUVsbGlwc2UubGVuZ3RoO2krKyl7XG4gICAgICAgICAgdGhpcy5saXN0ZUVsbGlwc2VbaV0uc3R5bGUuZGlzcGxheT0nbm9uZSc7XG4gICAgICAgIH1cbiAgICAgICAgZm9yKGxldCBpID0gMDtpPHRoaXMubGlzdGVSZWN0Lmxlbmd0aDtpKyspe1xuICAgICAgICAgIHRoaXMubGlzdGVSZWN0W2ldLnN0eWxlLmRpc3BsYXk9J25vbmUnO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vUG91ciBlbmVsZXZlciBsZXMgYm9yZHVyZXMgOlxuICAgICAgaWYodGhpcy52aXN1YWxpc2F0aW9uRm9ybWUpe1xuICAgICAgICBmb3IobGV0IGkgPSAwO2k8dGhpcy5saXN0ZUVsbGlwc2UubGVuZ3RoO2krKyl7XG4gICAgICAgICAgdGhpcy5saXN0ZUVsbGlwc2VbaV0uc2V0QXR0cmlidXRlKCdzdHJva2Utd2lkdGgnLDApO1xuICAgICAgICB9XG4gICAgICAgIGZvcihsZXQgaSA9IDA7aTx0aGlzLmxpc3RlUmVjdC5sZW5ndGg7aSsrKXtcbiAgICAgICAgICB0aGlzLmxpc3RlUmVjdFtpXS5zZXRBdHRyaWJ1dGUoJ3N0cm9rZS13aWR0aCcsMCk7XG4gICAgICAgIH1cbiAgICAgIH0gICBcblxuICAgICAgLy9WYXJpYWJsZXMgXG4gICAgICB0aGlzLm1pcnJvckJvdWxlWCA9IDI1MDtcbiAgICAgIHRoaXMubWlycm9yQm91bGVZID0gMjUwO1xuICAgICAgdGhpcy5vZmZzZXRYID0gMDsgLy8gSW5pdGlzYWxpc2F0aW9uIGR1IG9mZnNldFxuICAgICAgdGhpcy5vZmZzZXRZID0gMFxuICAgICAgdGhpcy5TVkdfTUFYX1ggPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnc3ZnJylbMF0uZ2V0QXR0cmlidXRlKCd3aWR0aCcpO1xuICAgICAgdGhpcy5TVkdfTUFYX1kgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnc3ZnJylbMF0uZ2V0QXR0cmlidXRlKCdoZWlnaHQnKTtcblxuICAgICAgLy8gR2VzdGlvbiBkZSBsJ29yaWVudGF0aW9uXG4gICAgICB0aGlzLnRhYkluO1xuICAgICAgaWYgKHRoaXMubW90aW9uSW5wdXQuaXNBdmFpbGFibGUoJ29yaWVudGF0aW9uJykpIHtcbiAgICAgICAgdGhpcy5tb3Rpb25JbnB1dC5hZGRMaXN0ZW5lcignb3JpZW50YXRpb24nLCAoZGF0YSkgPT4ge1xuICAgICAgICAgIGNvbnN0IG5ld1ZhbHVlcyA9IHRoaXMuX3RvTW92ZShkYXRhWzJdLGRhdGFbMV0tMjUpO1xuICAgICAgICAgIHRoaXMudGFiSW4gPSB0aGlzLl9pc0luKG5ld1ZhbHVlc1swXSxuZXdWYWx1ZXNbMV0pO1xuICAgICAgICAgIHRoaXMudGFiQ2hlbWluID0gdGhpcy5faXNJbkNoZW1pbihuZXdWYWx1ZXNbMF0sbmV3VmFsdWVzWzFdKTtcbiAgICAgICAgICBpZih0aGlzLmNvdW50VXBkYXRlPnRoaXMubWF4Q291bnRVcGRhdGUpe1xuICAgICAgICAgICAgdGhpcy5fdXBkYXRlR2Fpbih0aGlzLnRhYkluKTtcbiAgICAgICAgICAgIHRoaXMuY291bnRVcGRhdGUgPSAwO1xuICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgdGhpcy5jb3VudFVwZGF0ZSsrO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLl9tb3ZlU2NyZWVuVG8obmV3VmFsdWVzWzBdLG5ld1ZhbHVlc1sxXSwwLjA4KTtcbiAgICAgICAgICAvLyBYTU1cbiAgICAgICAgICBpZih0aGlzLm1vZGVsT0spe1xuICAgICAgICAgICAgdGhpcy5kZWNvZGVyLnByb2Nlc3MobmV3VmFsdWVzWzBdLG5ld1ZhbHVlc1sxXSk7XG4gICAgICAgICAgICB0aGlzLmRlY29kZXIyLnByb2Nlc3MobmV3VmFsdWVzWzBdLG5ld1ZhbHVlc1sxXSk7XG4gICAgICAgICAgICB0aGlzLmRlY29kZXIzLnByb2Nlc3MobmV3VmFsdWVzWzBdLG5ld1ZhbHVlc1sxXSk7XG4gICAgICAgICAgICB0aGlzLl9wcm9jZXNzUHJvYmEoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJPcmllbnRhdGlvbiBub24gZGlzcG9uaWJsZVwiKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuLyogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tTU9VVkVNRU5UIERFIEwgRUNSQU4gLyBJTUFHRVMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gKi9cblxuICAvKiBBam91dGUgbGEgYm91bGUgYXUgZm9uZCAqL1xuICBfYWRkQm91bGUoeCx5KXtcbiAgICBjb25zdCBlbGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKCdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycsJ2NpcmNsZScpO1xuICAgIGVsZW0uc2V0QXR0cmlidXRlTlMobnVsbCxcImN4XCIseCk7XG4gICAgZWxlbS5zZXRBdHRyaWJ1dGVOUyhudWxsLFwiY3lcIix5KTtcbiAgICBlbGVtLnNldEF0dHJpYnV0ZU5TKG51bGwsXCJyXCIsMTApO1xuICAgIGVsZW0uc2V0QXR0cmlidXRlTlMobnVsbCxcInN0cm9rZVwiLCd3aGl0ZScpO1xuICAgIGVsZW0uc2V0QXR0cmlidXRlTlMobnVsbCxcInN0cm9rZS13aWR0aFwiLDMpO1xuICAgIGVsZW0uc2V0QXR0cmlidXRlTlMobnVsbCxcImZpbGxcIiwnYmxhY2snKTtcbiAgICBlbGVtLnNldEF0dHJpYnV0ZU5TKG51bGwsXCJpZFwiLCdib3VsZScpO1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzdmcnKVswXS5hcHBlbmRDaGlsZChlbGVtKTtcbiAgfVxuXG4gIC8qIEFqb3V0ZSBsZSBmb25kICovXG4gIF9hZGRGb25kKGZvbmQpe1xuICAgIC8vIE9uIHBhcnNlIGxlIGZpY2hpZXIgU1ZHIGVuIERPTVxuICAgIGNvbnN0IHBhcnNlciA9IG5ldyBET01QYXJzZXIoKTtcbiAgICBsZXQgZm9uZFhtbCA9IHBhcnNlci5wYXJzZUZyb21TdHJpbmcoZm9uZCwnYXBwbGljYXRpb24veG1sJyk7XG4gICAgZm9uZFhtbCA9IGZvbmRYbWwuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3N2ZycpWzBdO1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdleHBlcmllbmNlJykuYXBwZW5kQ2hpbGQoZm9uZFhtbCk7XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3N2ZycpWzBdLnNldEF0dHJpYnV0ZSgnaWQnLCdzdmdFbGVtZW50JylcbiAgICB0aGlzLl9zdXBwcmltZXJSZWN0Q2hlbWluKCk7XG4gICAgdGhpcy5zdGFydE9LID0gdHJ1ZTtcbiAgICB0aGlzLnN0YXJ0KCk7XG4gIH1cblxuICAvKiBTdXBwcmltZSBsZXMgcmVjdGFuZ2xlcyBxdWkgc3VpdmVudCBsZXMgY2hlbWlucyAqL1xuICBfc3VwcHJpbWVyUmVjdENoZW1pbigpe1xuICAgIGxldCB0YWIgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdjaGVtaW4xJyk7XG4gICAgZm9yKGxldCBpID0wIDtpPHRhYi5sZW5ndGg7aSsrKXtcbiAgICAgIHRhYltpXS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgIH1cblxuICAgIHRhYiA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2NoZW1pbjInKTtcbiAgICBmb3IobGV0IGkgPTAgO2k8dGFiLmxlbmd0aDtpKyspe1xuICAgICAgdGFiW2ldLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgfVxuXG4gICAgdGFiID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnY2hlbWluMycpO1xuICAgIGZvcihsZXQgaSA9MCA7aTx0YWIubGVuZ3RoO2krKyl7XG4gICAgICB0YWJbaV0uc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICB9XG4gIH1cblxuICBfYWRkRm9ybWUoZm9ybWUseCx5KXtcbiAgICAvLyBPbiBwYXJzZSBsZSBmaWNoaWVyIFNWRyBlbiBET01cbiAgICBjb25zdCBwYXJzZXIgPSBuZXcgRE9NUGFyc2VyKCk7XG4gICAgbGV0IGZvcm1lWG1sID0gcGFyc2VyLnBhcnNlRnJvbVN0cmluZyhmb3JtZSwnYXBwbGljYXRpb24veG1sJyk7XG4gICAgZm9ybWVYbWwgPSBmb3JtZVhtbC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnZycpWzBdO1xuICAgIGxldCBib3VsZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdib3VsZScpO1xuICAgIGNvbnN0IGZvcm1lWG1sVGFiID0gZm9ybWVYbWwuY2hpbGROb2RlcztcbiAgICBmb3IobGV0IGkgPSAwOyBpPGZvcm1lWG1sVGFiLmxlbmd0aDtpKyspe1xuICAgICAgaWYoZm9ybWVYbWxUYWJbaV0ubm9kZU5hbWUgPT0gJ3BhdGgnKXtcbiAgICAgICAgY29uc3QgbmV3Tm9kZSA9IGJvdWxlLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKGZvcm1lWG1sVGFiW2ldLGJvdWxlKTtcbiAgICAgICAgdGhpcy5saXN0ZUZvcm1lW3RoaXMubGlzdGVGb3JtZS5sZW5ndGhdID0gbmV3Tm9kZS5zZXRBdHRyaWJ1dGUoJ3RyYW5zZm9ybScsJ3RyYW5zbGF0ZSgnK3grJyAnK3krJyknKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKiBDYWxsYmFjayBvcmllbnRhdGlvbk1vdGlvbiAvIE1vdXZlbWVudCBkZSBsYSBib3VsZSovXG4gIF90b01vdmUodmFsdWVYLHZhbHVlWSl7XG4gICAgY29uc3Qgb2JqID0gdGhpcy52aWV3LiRlbC5xdWVyeVNlbGVjdG9yKCcjYm91bGUnKTtcbiAgICBsZXQgbmV3WDtcbiAgICBsZXQgbmV3WTtcbiAgICBsZXQgYWN0dSA9IHRoaXMubWlycm9yQm91bGVYK3ZhbHVlWCowLjM7XG4gICAgaWYoYWN0dTx0aGlzLm9mZnNldFgpe1xuICAgICAgYWN0dT0gdGhpcy5vZmZzZXRYIDtcbiAgICB9ZWxzZSBpZihhY3R1ID4odGhpcy50YWlsbGVFY3JhblgrdGhpcy5vZmZzZXRYKSl7XG4gICAgICBhY3R1PSB0aGlzLnRhaWxsZUVjcmFuWCt0aGlzLm9mZnNldFhcbiAgICB9XG4gICAgaWYodGhpcy52aXN1YWxpc2F0aW9uQm91bGUpe1xuICAgICAgb2JqLnNldEF0dHJpYnV0ZSgnY3gnLCBhY3R1KTtcbiAgICB9XG4gICAgdGhpcy5taXJyb3JCb3VsZVggPSBhY3R1O1xuICAgIG5ld1g9YWN0dTtcbiAgICBhY3R1ID0gdGhpcy5taXJyb3JCb3VsZVkrdmFsdWVZKjAuMztcbiAgICBpZihhY3R1PCh0aGlzLm9mZnNldFkpKXtcbiAgICAgIGFjdHU9IHRoaXMub2Zmc2V0WTtcbiAgICB9XG4gICAgaWYoYWN0dSA+ICh0aGlzLnRhaWxsZUVjcmFuWSt0aGlzLm9mZnNldFkpKXtcbiAgICAgIGFjdHUgPSB0aGlzLnRhaWxsZUVjcmFuWSt0aGlzLm9mZnNldFk7XG4gICAgfVxuICAgIGlmKHRoaXMudmlzdWFsaXNhdGlvbkJvdWxlKXtcbiAgICAgIG9iai5zZXRBdHRyaWJ1dGUoJ2N5JywgYWN0dSk7XG4gICAgfVxuICAgIHRoaXMubWlycm9yQm91bGVZPSBhY3R1O1xuICAgIG5ld1k9YWN0dTtcbiAgICByZXR1cm4gW25ld1gsbmV3WV07XG4gIH1cblxuICAvLyBEw6lwbGFjZSBsJ8OpY3JhbiBkYW5zIGxhIG1hcFxuICBfbW92ZVNjcmVlblRvKHgseSxmb3JjZT0xKXtcbiAgICBsZXQgZGlzdGFuY2VYID0gKHgtdGhpcy5vZmZzZXRYKS10aGlzLmNlbnRyZUVjcmFuWDtcbiAgICBsZXQgbmVnWCA9IGZhbHNlO1xuICAgIGxldCBpbmRpY2VQb3dYID0gMztcbiAgICBsZXQgaW5kaWNlUG93WSA9IDM7XG4gICAgaWYoZGlzdGFuY2VYPDApe1xuICAgICAgbmVnWCA9IHRydWU7XG4gICAgfVxuICAgIGRpc3RhbmNlWCA9IE1hdGgucG93KChNYXRoLmFicyhkaXN0YW5jZVgvdGhpcy5jZW50cmVFY3JhblgpKSxpbmRpY2VQb3dYKSp0aGlzLmNlbnRyZUVjcmFuWDsgXG4gICAgaWYobmVnWCl7XG4gICAgICBkaXN0YW5jZVggKj0gLTE7XG4gICAgfVxuICAgIGlmKHRoaXMub2Zmc2V0WCsoZGlzdGFuY2VYKmZvcmNlKT49MCYmKHRoaXMub2Zmc2V0WCsoZGlzdGFuY2VYKmZvcmNlKTw9dGhpcy5TVkdfTUFYX1gtdGhpcy50YWlsbGVFY3JhblgpKXtcbiAgICAgIHRoaXMub2Zmc2V0WCArPSAoZGlzdGFuY2VYKmZvcmNlKTtcbiAgICB9XG5cbiAgICBsZXQgZGlzdGFuY2VZID0gKHktdGhpcy5vZmZzZXRZKS10aGlzLmNlbnRyZUVjcmFuWTtcbiAgICBsZXQgbmVnWSA9IGZhbHNlO1xuICAgIGlmKGRpc3RhbmNlWTwwKXtcbiAgICAgIG5lZ1kgPSB0cnVlO1xuICAgIH1cbiAgICBkaXN0YW5jZVkgPSBNYXRoLnBvdygoTWF0aC5hYnMoZGlzdGFuY2VZL3RoaXMuY2VudHJlRWNyYW5ZKSksaW5kaWNlUG93WSkqdGhpcy5jZW50cmVFY3Jhblk7XG4gICAgaWYobmVnWSl7XG4gICAgICBkaXN0YW5jZVkgKj0gLTE7XG4gICAgfVxuICAgIGlmKCh0aGlzLm9mZnNldFkrKGRpc3RhbmNlWSpmb3JjZSk+PTApJiYodGhpcy5vZmZzZXRZKyhkaXN0YW5jZVkqZm9yY2UpPD10aGlzLlNWR19NQVhfWS10aGlzLnRhaWxsZUVjcmFuWSkpe1xuICAgICAgdGhpcy5vZmZzZXRZICs9IChkaXN0YW5jZVkqZm9yY2UpO1xuICAgIH1cbiAgICB3aW5kb3cuc2Nyb2xsKHRoaXMub2Zmc2V0WCx0aGlzLm9mZnNldFkpXG4gIH1cblxuICBfbXlMaXN0ZW5lcih0aW1lKXtcbiAgICB0aGlzLnRhaWxsZUVjcmFuWCA9IHdpbmRvdy5pbm5lcldpZHRoO1xuICAgIHRoaXMudGFpbGxlRWNyYW5ZID0gd2luZG93LmlubmVySGVpZ2h0O1xuICAgIHNldFRpbWVvdXQodGhpcy5fbXlMaXN0ZW5lcix0aW1lKTtcbiAgfVxuXG4gIF9yZW1wbGFjZUZvcm1lKCl7XG4gICAgbGV0IG5ld0xpc3QgPSBbXTtcbiAgICBmb3IobGV0IGkgPSAwOyBpIDwgdGhpcy5saXN0ZVRleHQubGVuZ3RoOyBpKyspe1xuICAgICAgbmV3TGlzdFtpXT10aGlzLmxpc3RlVGV4dFtpXTtcbiAgICB9XG4gICAgZm9yKGxldCBpID0gMDsgaSA8IG5ld0xpc3QubGVuZ3RoOyBpKyspe1xuICAgICAgY29uc3Qgbm9tRWxlbWVudCA9IG5ld0xpc3RbaV0uaW5uZXJIVE1MO1xuICAgICAgIGlmKG5vbUVsZW1lbnQuc2xpY2UoMCwxKT09J18nKXtcbiAgICAgICAgIGNvbnN0IG5vbUZvcm1lID0gbm9tRWxlbWVudC5zbGljZSgxLG5vbUVsZW1lbnQubGVuZ3RoKTtcbiAgICAgICAgIGNvbnN0IHggPSBuZXdMaXN0W2ldLmdldEF0dHJpYnV0ZSgneCcpO1xuICAgICAgICAgY29uc3QgeSA9IG5ld0xpc3RbaV0uZ2V0QXR0cmlidXRlKCd5Jyk7XG4gICAgICAgICB0aGlzLnNlbmQoJ2RlbWFuZGVGb3JtZScsbm9tRm9ybWUseCx5KTtcbiAgICAgICAgIGNvbnN0IHBhcmVudCA9IG5ld0xpc3RbaV0ucGFyZW50Tm9kZTtcbiAgICAgICAgIHBhcmVudC5yZW1vdmVDaGlsZChuZXdMaXN0W2ldKTtcbiAgICAgICB9XG4gICAgfVxuICB9XG5cbi8qIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLURFVEVSTUlOQVRJT04gREVTIElOL09VVCBERVMgRk9STUVTLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tICovXG5cbiAgLy8gRm9uY3Rpb24gcXVpIHBlcm1ldCBkZSBjb25uYcOudHJlIGwnZW5zZW1ibGUgZGVzIGZpZ3VyZXMgb8O5IGxlIHBvaW50IHNlIHNpdHVlXG4gIF9pc0luKHgseSl7XG4gICAgbGV0IHRhYiA9IFtdO1xuICAgIGxldCByb3RhdGVBbmdsZTtcbiAgICBsZXQgY2VudHJlUm90YXRlWDtcbiAgICBsZXQgY2VudHJlUm90YXRlWTtcbiAgICBmb3IobGV0IGk9MDtpPHRoaXMubGlzdGVFbGxpcHNlLmxlbmd0aDtpKyspe1xuICAgICAgcm90YXRlQW5nbGU9MDtcbiAgICAgIGNvbnN0IGNlbnRyZVggPSB0aGlzLmxpc3RlRWxsaXBzZVtpXS5nZXRBdHRyaWJ1dGUoJ2N4Jyk7XG4gICAgICBjb25zdCBjZW50cmVZID0gdGhpcy5saXN0ZUVsbGlwc2VbaV0uZ2V0QXR0cmlidXRlKCdjeScpO1xuICAgICAgY29uc3QgcmF5b25YID0gdGhpcy5saXN0ZUVsbGlwc2VbaV0uZ2V0QXR0cmlidXRlKCdyeCcpO1xuICAgICAgY29uc3QgcmF5b25ZID0gdGhpcy5saXN0ZUVsbGlwc2VbaV0uZ2V0QXR0cmlidXRlKCdyeScpO1xuICAgICAgbGV0IHRyYW5zID0gdGhpcy5saXN0ZUVsbGlwc2VbaV0uZ2V0QXR0cmlidXRlKCd0cmFuc2Zvcm0nKTtcbiAgICAgIGlmKC9yb3RhdGUvLnRlc3QodHJhbnMpKXtcbiAgICAgICAgdHJhbnMgPSB0cmFucy5zbGljZSg3LHRyYW5zLmxlbmd0aCk7XG4gICAgICAgIGNlbnRyZVJvdGF0ZVggPSBwYXJzZUZsb2F0KHRyYW5zLnNwbGl0KFwiIFwiKVsxXSk7XG4gICAgICAgIGNlbnRyZVJvdGF0ZVkgPSBwYXJzZUZsb2F0KHRyYW5zLnNwbGl0KFwiLFwiKVsxXS5yZXBsYWNlKFwiKVwiLFwiXCIpKTtcbiAgICAgICAgcm90YXRlQW5nbGUgPSBwYXJzZUZsb2F0KHRyYW5zLnNwbGl0KFwiIFwiKVswXSk7XG4gICAgICB9XG4gICAgICB0YWJbdGFiLmxlbmd0aF09dGhpcy5faXNJbkVsbGlwc2UocGFyc2VGbG9hdChjZW50cmVYKSxwYXJzZUZsb2F0KGNlbnRyZVkpLHBhcnNlRmxvYXQocmF5b25YKSxwYXJzZUZsb2F0KHJheW9uWSkseCx5LHJvdGF0ZUFuZ2xlLGNlbnRyZVJvdGF0ZVgsY2VudHJlUm90YXRlWSk7ICAgICBcbiAgICB9XG4gICAgZm9yKGxldCBpPTA7aTx0aGlzLmxpc3RlUmVjdC5sZW5ndGg7aSsrKXtcbiAgICAgIHJvdGF0ZUFuZ2xlPTA7XG4gICAgICBjZW50cmVSb3RhdGVYPW51bGw7XG4gICAgICBjZW50cmVSb3RhdGVZPW51bGw7XG4gICAgICBjb25zdCBoYXV0ZXVyID0gdGhpcy5saXN0ZVJlY3RbaV0uZ2V0QXR0cmlidXRlKCd3aWR0aCcpO1xuICAgICAgY29uc3QgbGFyZ2V1ciA9IHRoaXMubGlzdGVSZWN0W2ldLmdldEF0dHJpYnV0ZSgnaGVpZ2h0Jyk7XG4gICAgICBjb25zdCBsZWZ0ID0gdGhpcy5saXN0ZVJlY3RbaV0uZ2V0QXR0cmlidXRlKCd4Jyk7XG4gICAgICBjb25zdCB0b3AgPSB0aGlzLmxpc3RlUmVjdFtpXS5nZXRBdHRyaWJ1dGUoJ3knKTtcbiAgICAgIGxldCB0cmFucyA9IHRoaXMubGlzdGVSZWN0W2ldLmdldEF0dHJpYnV0ZSgndHJhbnNmb3JtJyk7XG4gICAgICBpZigvcm90YXRlLy50ZXN0KHRyYW5zKSl7XG4gICAgICAgIHRyYW5zID0gdHJhbnMuc2xpY2UoNyx0cmFucy5sZW5ndGgpO1xuICAgICAgICBjZW50cmVSb3RhdGVYID0gcGFyc2VGbG9hdCh0cmFucy5zcGxpdChcIiBcIilbMV0pO1xuICAgICAgICBjZW50cmVSb3RhdGVZID0gcGFyc2VGbG9hdCh0cmFucy5zcGxpdChcIixcIilbMV0ucmVwbGFjZShcIilcIixcIlwiKSk7XG4gICAgICAgIHJvdGF0ZUFuZ2xlID0gcGFyc2VGbG9hdCh0cmFucy5zcGxpdChcIiBcIilbMF0pO1xuICAgICAgfVxuICAgICAgdGFiW3RhYi5sZW5ndGhdPXRoaXMuX2lzSW5SZWN0KHBhcnNlRmxvYXQoaGF1dGV1ciksIHBhcnNlRmxvYXQobGFyZ2V1ciksIHBhcnNlRmxvYXQobGVmdCksIHBhcnNlRmxvYXQodG9wKSwgeCwgeSxyb3RhdGVBbmdsZSxjZW50cmVSb3RhdGVYLGNlbnRyZVJvdGF0ZVkpO1xuICAgIH0gIFxuICAgIHJldHVybiB0YWI7XG4gIH1cblxuICAvLyBGb25jdGluIHF1aSBkaXQgZGFucyBxdWVsIGNoZW1pbiBvbiBzZSB0cm91dmVcbiAgX2lzSW5DaGVtaW4oeCx5KXtcblxuICAgIC8vVmFyaWFibGVzXG4gICAgbGV0IHJvdGF0ZUFuZ2xlO1xuICAgIGxldCBjZW50cmVSb3RhdGVYO1xuICAgIGxldCBjZW50cmVSb3RhdGVZO1xuICAgIGxldCBoYXV0ZXVyO1xuICAgIGxldCBsYXJnZXVyO1xuICAgIGxldCBsZWZ0O1xuICAgIGxldCB0b3A7XG4gICAgbGV0IHRyYW5zO1xuICAgIGxldCBpID0wO1xuXG4gICAgLy9DSEVNSU4gMVxuICAgIGxldCBjaGVtaW4xID0gZmFsc2U7XG4gICAgd2hpbGUoIWNoZW1pbjEgJiYgaTx0aGlzLmxpc3RlUmVjdENoZW1pbjEubGVuZ3RoKXtcbiAgICAgIHJvdGF0ZUFuZ2xlPTA7XG4gICAgICBjZW50cmVSb3RhdGVYPW51bGw7XG4gICAgICBjZW50cmVSb3RhdGVZPW51bGw7XG4gICAgICBoYXV0ZXVyID0gdGhpcy5saXN0ZVJlY3RDaGVtaW4xW2ldLmdldEF0dHJpYnV0ZSgnd2lkdGgnKTtcbiAgICAgIGxhcmdldXIgPSB0aGlzLmxpc3RlUmVjdENoZW1pbjFbaV0uZ2V0QXR0cmlidXRlKCdoZWlnaHQnKTtcbiAgICAgIGxlZnQgPSB0aGlzLmxpc3RlUmVjdENoZW1pbjFbaV0uZ2V0QXR0cmlidXRlKCd4Jyk7XG4gICAgICB0b3AgPSB0aGlzLmxpc3RlUmVjdENoZW1pbjFbaV0uZ2V0QXR0cmlidXRlKCd5Jyk7XG4gICAgICBsZXQgdHJhbnMgPSB0aGlzLmxpc3RlUmVjdENoZW1pbjFbaV0uZ2V0QXR0cmlidXRlKCd0cmFuc2Zvcm0nKTtcbiAgICAgIGlmKC9yb3RhdGUvLnRlc3QodHJhbnMpKXtcbiAgICAgICAgdHJhbnMgPSB0cmFucy5zbGljZSg3LHRyYW5zLmxlbmd0aCk7XG4gICAgICAgIGNlbnRyZVJvdGF0ZVggPSBwYXJzZUZsb2F0KHRyYW5zLnNwbGl0KFwiIFwiKVsxXSk7XG4gICAgICAgIGNlbnRyZVJvdGF0ZVkgPSBwYXJzZUZsb2F0KHRyYW5zLnNwbGl0KFwiLFwiKVsxXS5yZXBsYWNlKFwiKVwiLFwiXCIpKTtcbiAgICAgICAgcm90YXRlQW5nbGUgPSBwYXJzZUZsb2F0KHRyYW5zLnNwbGl0KFwiIFwiKVswXSk7XG4gICAgICB9XG4gICAgICBjaGVtaW4xID0gdGhpcy5faXNJblJlY3QocGFyc2VGbG9hdChoYXV0ZXVyKSwgcGFyc2VGbG9hdChsYXJnZXVyKSwgcGFyc2VGbG9hdChsZWZ0KSwgcGFyc2VGbG9hdCh0b3ApLCB4LCB5LHJvdGF0ZUFuZ2xlLGNlbnRyZVJvdGF0ZVgsY2VudHJlUm90YXRlWSk7XG4gICAgICBpKys7XG4gICAgfVxuXG4gICAgLy9DSEVNSU4gMlxuICAgIGxldCBjaGVtaW4yID0gZmFsc2U7XG4gICAgaSA9MDtcbiAgICB3aGlsZSghY2hlbWluMiAmJiBpPHRoaXMubGlzdGVSZWN0Q2hlbWluMi5sZW5ndGgpe1xuICAgICAgcm90YXRlQW5nbGU9MDtcbiAgICAgIGNlbnRyZVJvdGF0ZVg9bnVsbDtcbiAgICAgIGNlbnRyZVJvdGF0ZVk9bnVsbDtcbiAgICAgIGhhdXRldXIgPSB0aGlzLmxpc3RlUmVjdENoZW1pbjJbaV0uZ2V0QXR0cmlidXRlKCd3aWR0aCcpO1xuICAgICAgbGFyZ2V1ciA9IHRoaXMubGlzdGVSZWN0Q2hlbWluMltpXS5nZXRBdHRyaWJ1dGUoJ2hlaWdodCcpO1xuICAgICAgbGVmdCA9IHRoaXMubGlzdGVSZWN0Q2hlbWluMltpXS5nZXRBdHRyaWJ1dGUoJ3gnKTtcbiAgICAgIHRvcCA9IHRoaXMubGlzdGVSZWN0Q2hlbWluMltpXS5nZXRBdHRyaWJ1dGUoJ3knKTtcbiAgICAgIHRyYW5zID0gdGhpcy5saXN0ZVJlY3RDaGVtaW4yW2ldLmdldEF0dHJpYnV0ZSgndHJhbnNmb3JtJyk7XG4gICAgICBpZigvcm90YXRlLy50ZXN0KHRyYW5zKSl7XG4gICAgICAgIHRyYW5zID0gdHJhbnMuc2xpY2UoNyx0cmFucy5sZW5ndGgpO1xuICAgICAgICBjZW50cmVSb3RhdGVYID0gcGFyc2VGbG9hdCh0cmFucy5zcGxpdChcIiBcIilbMV0pO1xuICAgICAgICBjZW50cmVSb3RhdGVZID0gcGFyc2VGbG9hdCh0cmFucy5zcGxpdChcIixcIilbMV0ucmVwbGFjZShcIilcIixcIlwiKSk7XG4gICAgICAgIHJvdGF0ZUFuZ2xlID0gcGFyc2VGbG9hdCh0cmFucy5zcGxpdChcIiBcIilbMF0pO1xuICAgICAgfVxuICAgICAgY2hlbWluMiA9IHRoaXMuX2lzSW5SZWN0KHBhcnNlRmxvYXQoaGF1dGV1ciksIHBhcnNlRmxvYXQobGFyZ2V1ciksIHBhcnNlRmxvYXQobGVmdCksIHBhcnNlRmxvYXQodG9wKSwgeCwgeSxyb3RhdGVBbmdsZSxjZW50cmVSb3RhdGVYLGNlbnRyZVJvdGF0ZVkpO1xuICAgICAgaSsrO1xuICAgIH1cblxuICAgIC8vQ0hFTUlOIDNcbiAgICBsZXQgY2hlbWluMyA9IGZhbHNlO1xuICAgIGkgPTA7XG4gICAgd2hpbGUoIWNoZW1pbjMgJiYgaTx0aGlzLmxpc3RlUmVjdENoZW1pbjMubGVuZ3RoKXtcbiAgICAgIHJvdGF0ZUFuZ2xlPTA7XG4gICAgICBjZW50cmVSb3RhdGVYPW51bGw7XG4gICAgICBjZW50cmVSb3RhdGVZPW51bGw7XG4gICAgICBoYXV0ZXVyID0gdGhpcy5saXN0ZVJlY3RDaGVtaW4zW2ldLmdldEF0dHJpYnV0ZSgnd2lkdGgnKTtcbiAgICAgIGxhcmdldXIgPSB0aGlzLmxpc3RlUmVjdENoZW1pbjNbaV0uZ2V0QXR0cmlidXRlKCdoZWlnaHQnKTtcbiAgICAgIGxlZnQgPSB0aGlzLmxpc3RlUmVjdENoZW1pbjNbaV0uZ2V0QXR0cmlidXRlKCd4Jyk7XG4gICAgICB0b3AgPSB0aGlzLmxpc3RlUmVjdENoZW1pbjNbaV0uZ2V0QXR0cmlidXRlKCd5Jyk7XG4gICAgICB0cmFucyA9IHRoaXMubGlzdGVSZWN0Q2hlbWluM1tpXS5nZXRBdHRyaWJ1dGUoJ3RyYW5zZm9ybScpO1xuICAgICAgaWYoL3JvdGF0ZS8udGVzdCh0cmFucykpe1xuICAgICAgICB0cmFucyA9IHRyYW5zLnNsaWNlKDcsdHJhbnMubGVuZ3RoKTtcbiAgICAgICAgY2VudHJlUm90YXRlWCA9IHBhcnNlRmxvYXQodHJhbnMuc3BsaXQoXCIgXCIpWzFdKTtcbiAgICAgICAgY2VudHJlUm90YXRlWSA9IHBhcnNlRmxvYXQodHJhbnMuc3BsaXQoXCIsXCIpWzFdLnJlcGxhY2UoXCIpXCIsXCJcIikpO1xuICAgICAgICByb3RhdGVBbmdsZSA9IHBhcnNlRmxvYXQodHJhbnMuc3BsaXQoXCIgXCIpWzBdKTtcbiAgICAgIH1cbiAgICAgIGNoZW1pbjMgPSB0aGlzLl9pc0luUmVjdChwYXJzZUZsb2F0KGhhdXRldXIpLCBwYXJzZUZsb2F0KGxhcmdldXIpLCBwYXJzZUZsb2F0KGxlZnQpLCBwYXJzZUZsb2F0KHRvcCksIHgsIHkscm90YXRlQW5nbGUsY2VudHJlUm90YXRlWCxjZW50cmVSb3RhdGVZKTtcbiAgICAgIGkrKztcbiAgICB9ICAgICAgICBcbiAgICByZXR1cm4gW2NoZW1pbjIsY2hlbWluMSxjaGVtaW4zXTtcbiAgfVxuXG4gIC8vIEZvbmN0aW9uIHF1aSBkaXQgc2kgdW4gcG9pbnQgZXN0IGRhbnMgdW4gcmVjdFxuICAgX2lzSW5SZWN0KGhhdXRldXIsbGFyZ2V1cixsZWZ0LHRvcCxwb2ludFgscG9pbnRZLHJvdGF0ZUFuZ2xlLGNlbnRyZVJvdGF0ZVgsY2VudHJlUm90YXRlWSl7XG4gICAgICAvL3JvdGF0aW9uXG4gICAgICBjb25zdCBuZXdQb2ludCA9IHRoaXMuX3JvdGF0ZVBvaW50KHBvaW50WCxwb2ludFksY2VudHJlUm90YXRlWCxjZW50cmVSb3RhdGVZLHJvdGF0ZUFuZ2xlKTtcbiAgICAgIC8vQXBwYXJ0ZW5hbmNlXG4gICAgICBpZihuZXdQb2ludFswXSA+IHBhcnNlSW50KGxlZnQpICYmIG5ld1BvaW50WzBdIDwocGFyc2VJbnQobGVmdCkrcGFyc2VJbnQoaGF1dGV1cikpICYmIG5ld1BvaW50WzFdID4gdG9wICYmIG5ld1BvaW50WzFdIDwgKHBhcnNlSW50KHRvcCkgKyBwYXJzZUludChsYXJnZXVyKSkpe1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1lbHNle1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICB9XG5cbiAgLy8gRm9uY3Rpb24gcXVpIGRpdCBzaSB1biBwb2ludCBlc3QgZGFucyB1bmUgZWxsaXBzZVxuICBfaXNJbkVsbGlwc2UoY2VudHJlWCxjZW50cmVZLHJheW9uWCxyYXlvblkscG9pbnRYLHBvaW50WSxyb3RhdGVBbmdsZSxjZW50cmVSb3RhdGVYLGNlbnRyZVJvdGF0ZVkpe1xuICAgIC8vcm90YXRpb25cbiAgICBjb25zdCBuZXdQb2ludCA9IHRoaXMuX3JvdGF0ZVBvaW50KHBvaW50WCxwb2ludFksY2VudHJlUm90YXRlWCxjZW50cmVSb3RhdGVZLHJvdGF0ZUFuZ2xlKTtcbiAgICAvL0FwcGFydGVuYW5jZSBcbiAgICBsZXQgYSA9IHJheW9uWDs7IC8vIEdyYW5kIHJheW9uXG4gICAgbGV0IGIgPSByYXlvblk7IC8vIFBldGl0IHJheW9uXG4gICAgLy9jb25zdCBjID0gTWF0aC5zcXJ0KChhKmEpLShiKmIpKTsgLy8gRGlzdGFuY2UgRm95ZXJcbiAgICBjb25zdCBjYWxjID0gKChNYXRoLnBvdygobmV3UG9pbnRbMF0tY2VudHJlWCksMikpLyhNYXRoLnBvdyhhLDIpKSkrKChNYXRoLnBvdygobmV3UG9pbnRbMV0tY2VudHJlWSksMikpLyhNYXRoLnBvdyhiLDIpKSk7XG4gICAgaWYoY2FsYzw9MSl7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9ZWxzZXtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICAvLyBGb25jdGlvbiBwZXJtZXR0YW50IGRlIHLDqWF4ZXIgbGUgcG9pbnRcbiAgX3JvdGF0ZVBvaW50KHgseSxjZW50cmVYLGNlbnRyZVksYW5nbGUpe1xuICAgIGxldCBuZXdBbmdsZSA9IGFuZ2xlKigzLjE0MTU5MjY1LzE4MCk7IC8vIFBhc3NhZ2UgZW4gcmFkaWFuXG4gICAgbGV0IHRhYiA9IFtdO1xuICAgIGxldCBuZXdYID0gKHgtY2VudHJlWCkqTWF0aC5jb3MobmV3QW5nbGUpKyh5LWNlbnRyZVkpKk1hdGguc2luKG5ld0FuZ2xlKTtcbiAgICBsZXQgbmV3WSA9IC0xKih4LWNlbnRyZVgpKk1hdGguc2luKG5ld0FuZ2xlKSsoeS1jZW50cmVZKSpNYXRoLmNvcyhuZXdBbmdsZSk7XG4gICAgbmV3WCArPSBjZW50cmVYO1xuICAgIG5ld1kgKz0gY2VudHJlWTtcbiAgICAvL0FmZmljaGFnZSBkdSBzeW3DqXRyaXF1ZVxuICAgICAvLyBjb25zdCBvYmogPSB0aGlzLnZpZXcuJGVsLnF1ZXJ5U2VsZWN0b3IoJyNib3VsZVInKTtcbiAgICAgLy8gb2JqLnNldEF0dHJpYnV0ZShcImN4XCIsbmV3WCk7XG4gICAgIC8vIG9iai5zZXRBdHRyaWJ1dGUoXCJjeVwiLG5ld1kpO1xuICAgIC8vRmluIGRlIGwnYWZmaWNoYWdlIGR1IHN5bcOpdHJpcXVlXG4gICAgdGFiWzBdID0gbmV3WDtcbiAgICB0YWJbMV0gPSBuZXdZO1xuICAgIHJldHVybiB0YWI7XG4gIH1cblxuLyogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tQ2FsY3VsIGRlcyBkaXN0YW5jZXMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gKi9cblxuICAvLyBEb25uZSBsYSBkaXN0YW5jZSBkdSBwb2ludCBhdmVjIGxlcyBmb3JtZXMgcHLDqXNlbnRlc1xuICBfZ2V0RGlzdGFuY2UoeFZhbHVlLHlWYWx1ZSl7XG4gICAgbGV0IHRhYiA9IFtdO1xuICAgIGZvcihsZXQgaT0wO2k8dGhpcy5saXN0ZUVsbGlwc2UubGVuZ3RoO2krKyl7XG4gICAgICB0YWJbdGFiLmxlbmd0aF09dGhpcy5fZ2V0RGlzdGFuY2VOb2RlKHRoaXMubGlzdGVFbGxpcHNlW2ldLHhWYWx1ZSx5VmFsdWUpO1xuICAgIH1cbiAgICBmb3IobGV0IGk9MDtpPHRoaXMubGlzdGVSZWN0Lmxlbmd0aDtpKyspe1xuICAgICAgdGFiW3RhYi5sZW5ndGhdPXRoaXMuX2dldERpc3RhbmNlTm9kZSh0aGlzLmxpc3RlUmVjdFtpXSx4VmFsdWUseVZhbHVlKTtcbiAgICB9XG4gICAgcmV0dXJuIHRhYjtcbiAgfVxuXG4gIC8vIERvbm5lIGxhIGRpc3RhbmNlIGQndW4gcG9pbnQgYXZlYyB1bmUgZm9ybWVcbiAgX2dldERpc3RhbmNlTm9kZShub2RlLHgseSl7XG4gICAgaWYobm9kZS50YWdOYW1lPT1cImVsbGlwc2VcIil7XG4gICAgICBsZXQgY2VudHJlWCA9IHBhcnNlSW50KG5vZGUuZ2V0QXR0cmlidXRlKCdjeCcpKTtcbiAgICAgIGxldCBjZW50cmVZID0gcGFyc2VJbnQobm9kZS5nZXRBdHRyaWJ1dGUoJ2N5JykpO1xuICAgICAgcmV0dXJuIE1hdGguc3FydChNYXRoLnBvdygoY2VudHJlWC14KSwyKStNYXRoLnBvdygoY2VudHJlWS15KSwyKSk7XG4gICAgfWVsc2UgaWYobm9kZS50YWdOYW1lPT0ncmVjdCcpe1xuICAgICAgbGV0IGxlZnQgPSBwYXJzZUludChub2RlLmdldEF0dHJpYnV0ZSgneCcpKTtcbiAgICAgIGxldCB0b3AgPSBwYXJzZUludChub2RlLmdldEF0dHJpYnV0ZSgneScpKTtcbiAgICAgIGxldCBoYXV0ID0gcGFyc2VJbnQobm9kZS5nZXRBdHRyaWJ1dGUoJ2hlaWdodCcpKTtcbiAgICAgIGxldCBsYXJnID0gcGFyc2VJbnQobm9kZS5nZXRBdHRyaWJ1dGUoJ3dpZHRoJykpO1xuICAgICAgbGV0IGNlbnRyZVggPSAobGVmdCtsYXJnKS8yO1xuICAgICAgbGV0IGNlbnRyZVkgPSAodG9wK2hhdXQpLzI7XG4gICAgICByZXR1cm4gTWF0aC5zcXJ0KE1hdGgucG93KChjZW50cmVYLXgpLDIpK01hdGgucG93KChjZW50cmVZLXkpLDIpKTtcbiAgICB9XG4gIH1cblxuLyogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tU09OLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tICovXG5cbiAgLy8gQ3LDqcOpIGxlIG1vdGV1ciBzb25vcmVcbiAgX2NyZWF0aW9uVW5pdmVyc1Nvbm9yZSgpe1xuICAgIC8vR3JhbnVsYXRldXJcbiAgICB0aGlzLmdyYWluID0gbmV3IE15R3JhaW4oKTtcbiAgICBzY2hlZHVsZXIuYWRkKHRoaXMuZ3JhaW4pO1xuICAgIHRoaXMuZ3JhaW4uY29ubmVjdChhdWRpb0NvbnRleHQuZGVzdGluYXRpb24pO1xuICAgIGNvbnN0IGJ1ZmZlckFzc29jaWVzID0gWzUsNyw5XTtcbiAgICBjb25zdCBtYXJrZXJBc3NvY2llcyA9IFs2LDgsMTBdO1xuICAgIC8vU2VnbWVudGVyXG4gICAgZm9yKGxldCBpPTA7IGk8dGhpcy5uYkNoZW1pbiA7IGkrKyl7XG4gICAgICBsZXQgaWRCdWZmZXIgPSBidWZmZXJBc3NvY2llc1tpXTtcbiAgICAgIGxldCBpZE1hcmtlciA9IG1hcmtlckFzc29jaWVzW2ldO1xuICAgICAgdGhpcy5zZWdtZW50ZXJbaV0gPSBuZXcgd2F2ZXMuU2VnbWVudEVuZ2luZSh7XG4gICAgICAgIGJ1ZmZlcjogdGhpcy5sb2FkZXIuYnVmZmVyc1tpZEJ1ZmZlcl0sXG4gICAgICAgIHBvc2l0aW9uQXJyYXk6IHRoaXMubG9hZGVyLmJ1ZmZlcnNbaWRNYXJrZXJdLnRpbWUsXG4gICAgICAgIGR1cmF0aW9uQXJyYXk6IHRoaXMubG9hZGVyLmJ1ZmZlcnNbaWRNYXJrZXJdLmR1cmF0aW9uLFxuICAgICAgICBwZXJpb2RBYnM6IDEwLFxuICAgICAgICBwZXJpb2RSZWw6IDEwLFxuICAgICAgfSk7XG4gICAgICB0aGlzLnNlZ21lbnRlckdhaW5baV0gPSBhdWRpb0NvbnRleHQuY3JlYXRlR2FpbigpO1xuICAgICAgdGhpcy5zZWdtZW50ZXJHYWluR3JhaW5baV0gPSBhdWRpb0NvbnRleHQuY3JlYXRlR2FpbigpO1xuICAgICAgdGhpcy5zZWdtZW50ZXJHYWluW2ldLmNvbm5lY3QoYXVkaW9Db250ZXh0LmRlc3RpbmF0aW9uKTtcbiAgICAgIHRoaXMuc2VnbWVudGVyR2FpbkdyYWluW2ldLmdhaW4uc2V0VmFsdWVBdFRpbWUoMCxhdWRpb0NvbnRleHQuY3VycmVudFRpbWUpO1xuICAgICAgdGhpcy5zZWdtZW50ZXJHYWluW2ldLmdhaW4uc2V0VmFsdWVBdFRpbWUoMCxhdWRpb0NvbnRleHQuY3VycmVudFRpbWUpO1xuICAgICAgdGhpcy5zZWdtZW50ZXJHYWluR3JhaW5baV0uY29ubmVjdCh0aGlzLmdyYWluLmlucHV0KTtcbiAgICAgIHRoaXMuc2VnbWVudGVyW2ldLmNvbm5lY3QodGhpcy5zZWdtZW50ZXJHYWluW2ldKTtcbiAgICAgIHRoaXMuc2VnbWVudGVyW2ldLmNvbm5lY3QodGhpcy5zZWdtZW50ZXJHYWluR3JhaW5baV0pO1xuICAgICAgdGhpcy5fc3RhcnRTZWdtZW50ZXIoaSk7XG4gICAgfVxuXG4gICAgLy8gTmFwcGUgZGUgZm9uZFxuICAgIGZvcihsZXQgaT0wO2k8dGhpcy50b3RhbEVsZW1lbnRzO2krKyl7XG5cbiAgICAgIC8vQ3LDqWF0aW9uIGRlcyBnYWlucyBkJ2VudHLDqWUvc29ydGllcyBkZXMgbmFwcGVzXG4gICAgICB0aGlzLmdhaW5zRGlyZWN0aW9uc1tpXT0nZG93bic7XG4gICAgICB0aGlzLmdhaW5zW2ldPSBhdWRpb0NvbnRleHQuY3JlYXRlR2FpbigpO1xuICAgICAgdGhpcy5nYWluc1tpXS5nYWluLnZhbHVlPTA7XG4gICAgICB0aGlzLmdhaW5zW2ldLmNvbm5lY3QodGhpcy5ncmFpbi5pbnB1dCk7XG5cbiAgICAgIC8vQ3LDqWF0aW9uIGRlcyBzb3VyY2VzIHBvdXIgbGUgZ3JhbnVsYXRldXJcbiAgICAgIHRoaXMuc291cmNlc1tpXT1hdWRpb0NvbnRleHQuY3JlYXRlQnVmZmVyU291cmNlKCk7XG4gICAgICB0aGlzLnNvdXJjZXNbaV0uYnVmZmVyPSB0aGlzLmxvYWRlci5idWZmZXJzW2klNV07XG4gICAgICB0aGlzLnNvdXJjZXNbaV0uY29ubmVjdCh0aGlzLmdhaW5zW2ldKTtcbiAgICAgIHRoaXMuc291cmNlc1tpXS5sb29wID0gdHJ1ZTtcbiAgICAgIHRoaXMuc291cmNlc1tpXS5zdGFydCgpO1xuXG4gICAgfVxuXG4gICAgLy8gRmlndXJlXG4gICAgIFxuICB9XG5cbiAgX3N0YXJ0U2VnbWVudGVyKGkpe1xuICAgIHRoaXMuc2VnbWVudGVyW2ldLnRyaWdnZXIoKTtcbiAgICBjb25zdCBuZXdQZXJpb2QgPSBwYXJzZUZsb2F0KHRoaXMubG9hZGVyLmJ1ZmZlcnNbNl1bJ2R1cmF0aW9uJ11bdGhpcy5zZWdtZW50ZXJbaV0uc2VnbWVudEluZGV4XSkqMTAwMDtcbiAgICBzZXRUaW1lb3V0KCgpPT57dGhpcy5fc3RhcnRTZWdtZW50ZXIoaSk7fSxuZXdQZXJpb2QpO1xuICB9XG4gICAgICAvL0Nyw6lhdGlvbiBkZXMgc291cmNlcyBwb3VyIGxlcyBmb3JtZXNcbiAgICAgIC8vdGhpcy5zb3VyY2VzO1xuXG4gIC8vIEZhaXQgbW9udGVyIGxlIHNvbiBxdWFuZCBsYSBib3VsZSBlc3QgZGFucyBsYSBmb3JtZSBldCBiYWlzc2VyIHNpIGxhIGJvdWxlIG4neSBlc3QgcGFzXG4gIF91cGRhdGVHYWluKHRhYkluKXtcbiAgICBmb3IodmFyIGk9MDtpPHRhYkluLmxlbmd0aDtpKyspe1xuICAgICAgaWYodGhpcy5nYWluc1tpXS5nYWluLnZhbHVlPT0wJiZ0YWJJbltpXSYmdGhpcy5nYWluc0RpcmVjdGlvbnNbaV09PSdkb3duJyl7XG4gICAgICAgIGxldCBhY3R1YWwgPSB0aGlzLmdhaW5zW2ldLmdhaW4udmFsdWU7XG4gICAgICAgIHRoaXMuZ2FpbnNbaV0uZ2Fpbi5jYW5jZWxTY2hlZHVsZWRWYWx1ZXMoYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lKTtcbiAgICAgICAgdGhpcy5nYWluc1tpXS5nYWluLnNldFZhbHVlQXRUaW1lKGFjdHVhbCxhdWRpb0NvbnRleHQuY3VycmVudFRpbWUpO1xuICAgICAgICB0aGlzLmdhaW5zW2ldLmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoMC4xLCBhdWRpb0NvbnRleHQuY3VycmVudFRpbWUgKyAxKTtcbiAgICAgICAgdGhpcy5nYWluc0RpcmVjdGlvbnNbaV09J3VwJztcbiAgICAgIH1lbHNlIGlmKHRoaXMuZ2FpbnNbaV0uZ2Fpbi52YWx1ZSE9MCYmIXRhYkluW2ldJiZ0aGlzLmdhaW5zRGlyZWN0aW9uc1tpXT09J3VwJyl7XG4gICAgICAgIGxldCBhY3R1YWwgPSB0aGlzLmdhaW5zW2ldLmdhaW4udmFsdWU7XG4gICAgICAgIHRoaXMuZ2FpbnNbaV0uZ2Fpbi5jYW5jZWxTY2hlZHVsZWRWYWx1ZXMoYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lKTtcbiAgICAgICAgdGhpcy5nYWluc1tpXS5nYWluLnNldFZhbHVlQXRUaW1lKGFjdHVhbCxhdWRpb0NvbnRleHQuY3VycmVudFRpbWUpO1xuICAgICAgICB0aGlzLmdhaW5zW2ldLmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoMCwgYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lICsgMSk7XG4gICAgICAgIHRoaXMuZ2FpbnNEaXJlY3Rpb25zW2ldPSdkb3duJztcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBfYWN0dWFsaXNlckF1ZGlvQ2hlbWluKGkpe1xuICAgIGlmKHRoaXMudGFiQ2hlbWluW2ldKXtcbiAgICAgIGxldCBhY3R1YWwxID0gdGhpcy5zZWdtZW50ZXJHYWluW2ldLmdhaW4udmFsdWU7XG4gICAgICBsZXQgYWN0dWFsMiA9IHRoaXMuc2VnbWVudGVyR2FpbkdyYWluW2ldLmdhaW4udmFsdWU7XG4gICAgICB0aGlzLnNlZ21lbnRlckdhaW5baV0uZ2Fpbi5jYW5jZWxTY2hlZHVsZWRWYWx1ZXMoYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lKTtcbiAgICAgIHRoaXMuc2VnbWVudGVyR2FpbkdyYWluW2ldLmdhaW4uY2FuY2VsU2NoZWR1bGVkVmFsdWVzKGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSk7XG4gICAgICB0aGlzLnNlZ21lbnRlckdhaW5baV0uZ2Fpbi5zZXRWYWx1ZUF0VGltZShhY3R1YWwxLGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSk7XG4gICAgICB0aGlzLnNlZ21lbnRlckdhaW5HcmFpbltpXS5nYWluLnNldFZhbHVlQXRUaW1lKGFjdHVhbDIsYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lKTtcbiAgICAgIHRoaXMuc2VnbWVudGVyR2FpbkdyYWluW2ldLmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoMCwgYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lICsgMik7XG4gICAgICB0aGlzLnNlZ21lbnRlckdhaW5baV0uZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgwLjQsIGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSArIDMpO1xuICAgIH1lbHNle1xuICAgICAgbGV0IGFjdHVhbDEgPSB0aGlzLnNlZ21lbnRlckdhaW5baV0uZ2Fpbi52YWx1ZTtcbiAgICAgIGxldCBhY3R1YWwyID0gdGhpcy5zZWdtZW50ZXJHYWluR3JhaW5baV0uZ2Fpbi52YWx1ZTtcbiAgICAgIHRoaXMuc2VnbWVudGVyR2FpbltpXS5nYWluLmNhbmNlbFNjaGVkdWxlZFZhbHVlcyhhdWRpb0NvbnRleHQuY3VycmVudFRpbWUpO1xuICAgICAgdGhpcy5zZWdtZW50ZXJHYWluR3JhaW5baV0uZ2Fpbi5jYW5jZWxTY2hlZHVsZWRWYWx1ZXMoYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lKTtcbiAgICAgIHRoaXMuc2VnbWVudGVyR2FpbltpXS5nYWluLnNldFZhbHVlQXRUaW1lKGFjdHVhbDEsYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lKTtcbiAgICAgIHRoaXMuc2VnbWVudGVyR2FpbkdyYWluW2ldLmdhaW4uc2V0VmFsdWVBdFRpbWUoYWN0dWFsMixhdWRpb0NvbnRleHQuY3VycmVudFRpbWUpO1xuICAgICAgaWYodGhpcy5zdGFydFNlZ21lbnRGaW5pW2ldKXtcbiAgICAgICAgdGhpcy5zZWdtZW50ZXJHYWluR3JhaW5baV0uZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgwLjksIGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSArIDIpO1xuICAgICAgICBzZXRUaW1lb3V0KCAoKT0+e1xuICAgICAgICAgIHRoaXMuc2VnbWVudGVyR2FpbkdyYWluW2ldLmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoMCxhdWRpb0NvbnRleHQuY3VycmVudFRpbWUgKyAxLjUpOyAgICAgICAgIFxuICAgICAgICB9XG4gICAgICAgICwyMDAwKTtcbiAgICAgICAgdGhpcy5zZWdtZW50ZXJHYWluW2ldLmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoMCwgYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lICsgMi41KTtcbiAgICAgIH1lbHNle1xuICAgICAgICB0aGlzLnN0YXJ0U2VnbWVudEZpbmlbaV0gPSB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tWE1NLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gKi9cbiAgX3NldE1vZGVsKG1vZGVsLG1vZGVsMSxtb2RlbDIpe1xuICAgIHRoaXMuZGVjb2Rlci5zZXRNb2RlbChtb2RlbCk7XG4gICAgdGhpcy5kZWNvZGVyMi5zZXRNb2RlbChtb2RlbDEpO1xuICAgIHRoaXMuZGVjb2RlcjMuc2V0TW9kZWwobW9kZWwyKTtcbiAgICB0aGlzLm1vZGVsT0sgPSB0cnVlO1xuICB9XG5cbiAgX3Byb2Nlc3NQcm9iYSgpeyAgICBcbiAgICBsZXQgcHJvYmFNYXggPSB0aGlzLmRlY29kZXIuZ2V0UHJvYmEoKTtcbiAgICBsZXQgcHJvYmFNYXgxID0gdGhpcy5kZWNvZGVyMi5nZXRQcm9iYSgpO1xuICAgIGxldCBwcm9iYU1heDIgPSB0aGlzLmRlY29kZXIzLmdldFByb2JhKCk7XG4gICAgbGV0IG5ld1NlZ21lbnQgPSBbXTtcbiAgICBmb3IobGV0IGkgPSAwIDsgaSA8IHRoaXMubmJDaGVtaW4gOyBpICsrKXtcbiAgICAgIG5ld1NlZ21lbnRbaV0gPSB0aGlzLl9maW5kTmV3U2VnbWVudChwcm9iYU1heDEsIHByb2JhTWF4MiwgaSk7XG4gICAgICB0aGlzLl9hY3R1YWxpc2VyU2VnbWVudElmTm90SW4obmV3U2VnbWVudFtpXSxpKTtcbiAgICAgIGxldCBub20xID0gJ2ZvbmQtJytpKyctMSc7XG4gICAgICBsZXQgbm9tMiA9ICdmb25kLScraSsnLTInO1xuICAgICAgaWYodGhpcy50YWJDaGVtaW5baV0mJihwcm9iYU1heDFbMF09PW5vbTF8fHByb2JhTWF4MlswXT09bm9tMikpe1xuICAgICAgICBpZihwcm9iYU1heDFbMV1baV0hPU5hTil7XG4gICAgICAgICAgdGhpcy5zZWdtZW50ZXJbaV0uc2VnbWVudEluZGV4ID0gbmV3U2VnbWVudFtpXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYodGhpcy50YWJDaGVtaW5baV0hPXRoaXMub2xkVGFiQ2hlbWluW2ldKXtcbiAgICAgICAgdGhpcy5fYWN0dWFsaXNlckF1ZGlvQ2hlbWluKGkpO1xuICAgICAgfVxuICAgICAgdGhpcy5vbGRUYWJDaGVtaW5baV0gPSB0aGlzLnRhYkNoZW1pbltpXTtcbiAgICB9XG4gIH1cblxuICAvLyBUcm91dmUgZW4gZm9uY3Rpb24gZGUgeG1tIGxlIHNlZ21lbnQgbGUgcGx1cyBwcm9jaGUgZGUgbGEgcG9zaXRpb24gZGUgbCd1dGlsaXNhdGV1clxuICBfZmluZE5ld1NlZ21lbnQocHJvYmFNYXgxLCBwcm9iYU1heDIsIGlkKXtcbiAgICBsZXQgbmV3U2VnbWVudCA9IC0xO1xuICAgIGxldCBhY3R1ZWwgPSBudWxsO1xuICAgIGlmKHRoaXMuYW5jaWVuMVtpZF0tcHJvYmFNYXgxWzFdW2lkXTwtMC4wMDEpe1xuICAgICAgbmV3U2VnbWVudCA9IE1hdGgudHJ1bmMocHJvYmFNYXgxWzFdW2lkXSp0aGlzLm5iU2VnbWVudFtpZF0pO1xuICAgICAgYWN0dWVsID0gXCIxXCI7XG4gICAgICBpZih0aGlzLmNvdW50MltpZF0+dGhpcy5jb3VudE1heCl7XG4gICAgICAgIHRoaXMuZGVjb2RlcjMucmVzZXQoKTtcbiAgICAgICAgdGhpcy5jb3VudDJbaWRdID0gMDtcbiAgICAgIH1cbiAgICAgIHRoaXMuY291bnQxW2lkXSA9IDA7XG4gICAgICB0aGlzLmNvdW50MltpZF0rKztcbiAgICB9ZWxzZSBpZiAodGhpcy5hbmNpZW4yW2lkXS1wcm9iYU1heDJbMV1baWRdPC0wLjAwMSl7XG4gICAgICBuZXdTZWdtZW50ID0gTWF0aC50cnVuYygoMS1wcm9iYU1heDJbMV1baWRdKSp0aGlzLm5iU2VnbWVudFtpZF0pO1xuICAgICAgYWN0dWVsID0gXCIwXCI7XG4gICAgICBpZih0aGlzLmNvdW50MVtpZF0+dGhpcy5jb3VudE1heCl7XG4gICAgICAgIHRoaXMuZGVjb2RlcjIucmVzZXQoKTtcbiAgICAgICAgdGhpcy5jb3VudDFbaWRdID0gMDtcbiAgICAgIH1cbiAgICAgIHRoaXMuY291bnQyW2lkXSA9IDA7XG4gICAgICB0aGlzLmNvdW50MVtpZF0rKztcbiAgICB9ZWxzZXtcbiAgICAgIG5ld1NlZ21lbnQgPSB0aGlzLnNlZ21lbnRlcltpZF0uc2VnbWVudEluZGV4O1xuICAgIH1cbiAgICB0aGlzLmFuY2llbjFbaWRdID0gcHJvYmFNYXgxWzFdW2lkXTtcbiAgICB0aGlzLmFuY2llbjJbaWRdID0gcHJvYmFNYXgyWzFdW2lkXTtcbiAgICByZXR1cm4gbmV3U2VnbWVudDtcbiAgfVxuXG4gIC8vIEZhaXMgYXZhbmNlciBsYSB0w6p0ZSBkZSBsZWN0dXJlIGRlcyBzZWdtZW50ZXIgc2kgbCd1dGlsaXNhdGV1ciBuJ2VzdCBwYXMgZGFucyB1bmUgZm9ybWVcbiAgX2FjdHVhbGlzZXJTZWdtZW50SWZOb3RJbihuZXdTZWdtZW50LCBpZCl7XG4gICAgaWYoIXRoaXMudGFiQ2hlbWluW2lkXSl7XG4gICAgICBpZih0aGlzLmNvdW50VGltZW91dFtpZF0+NDApe1xuICAgICAgICBpZihuZXdTZWdtZW50PjU5KXtcbiAgICAgICAgICB0aGlzLmRpcmVjdGlvbltpZF0gPSBmYWxzZTtcbiAgICAgICAgfWVsc2UgaWYobmV3U2VnbWVudDwxKXtcbiAgICAgICAgICB0aGlzLmRpcmVjdGlvbltpZF0gPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY291bnRUaW1lb3V0W2lkXSA9IDA7XG4gICAgICAgIGlmKHRoaXMuZGlyZWN0aW9uW2lkXSl7XG4gICAgICAgICAgbmV3U2VnbWVudCsrO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBuZXdTZWdtZW50LS07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHRoaXMuY291bnRUaW1lb3V0W2lkXSsrO1xuICAgICAgdGhpcy5zZWdtZW50ZXJbaWRdLnNlZ21lbnRJbmRleCA9IG5ld1NlZ21lbnQ7XG4gICAgfVxuICB9XG59XG4iXX0=