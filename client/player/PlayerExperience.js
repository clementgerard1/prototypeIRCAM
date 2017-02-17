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

var _MyGrain = require('./MyGrain2.js');

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
      "sounds/nappe/tempete.mp3", "sounds/nappe/vent.mp3", "sounds/chemin/camusC.mp3", // 5  
      "markers/camus.json", "sounds/chemin/churchillC.mp3", "markers/churchill.json", "sounds/chemin/irakC.mp3", "markers/irak.json", //10  
      "sounds/forme/trump.mp3", "sounds/forme/eminem.mp3", "sounds/forme/fr.mp3", "sounds/forme/brexit.mp3"]
    });
    _this2.startOK = false;
    _this2.startSegmentFini = [];
    _this2.modelOK = false;

    // PARAMETRE
    _this2.nbChemin = 3;
    _this2.nbForme = 4;
    _this2.qtRandom = 25;
    _this2.nbSegment = [232, 144, 106];

    //
    _this2.ancien1 = [];
    _this2.ancien2 = [];
    _this2.ancien3 = false;
    _this2.countTimeout = [];
    _this2.direction = [];
    _this2.oldTabChemin = [];
    _this2.count1 = [];
    _this2.count2 = [];
    _this2.segmenter = [];
    _this2.segmenterFB = [];
    _this2.segmenterDelayFB = [];
    _this2.segmenterGain = [];
    _this2.segmenterGainGrain = [];
    _this2.sources = [];
    _this2.gains = [];
    _this2.gainsDirections = [];
    _this2.grain;
    _this2.lastSegment = [0, 0, 0];
    _this2.lastPosition = [0, 0, 0];
    _this2.gainOutputDirect;
    _this2.gainOutputGrain;
    _this2.gainsForme = [];
    _this2.ancienForme = [false, false, false];
    _this2.gainsGrainForme = [];
    _this2.soundForme = [];
    _this2.rampForme = { 'forme1': 0, 'forme2': 0, 'forme3': 0, 'forme4': 0 };
    _this2.countMax = 100;

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
      this._isInForme = this._isInForme.bind(this);
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
      this._actualiserAudioForme = this._actualiserAudioForme.bind(this);
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
        this._addBoule(10, 10);
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
        this.listeRectChemin1 = document.getElementsByClassName('chemin0');
        this.listeRectChemin2 = document.getElementsByClassName('chemin1');
        this.listeRectChemin3 = document.getElementsByClassName('chemin2');
        this.listeRectForme1 = document.getElementsByClassName('forme1');
        this.listeRectForme2 = document.getElementsByClassName('forme2');
        this.listeRectForme3 = document.getElementsByClassName('forme3');
        this.listeRectForme4 = document.getElementsByClassName('forme4');

        //Remplace les _textes par leur forme.
        this._remplaceForme();

        //Crée l'univers sonore
        this._creationUniversSonore();

        //Initisalisation
        this.maxCountUpdate = 4;
        this.countUpdate = this.maxCountUpdate + 1; // Initialisation
        this.visualisationFormeChemin = false;
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
        // if(this.visualisationForme){
        //   for(let i = 0;i<this.listeEllipse.length;i++){
        //     this.listeEllipse[i].setAttribute('stroke-width',0);
        //   }
        //   for(let i = 0;i<this.listeRect.length;i++){
        //     this.listeRect[i].setAttribute('stroke-width',0);
        //   }
        // }   

        //Variables 
        this.mirrorBouleX = 10;
        this.mirrorBouleY = 10;
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
            // if(this.modelOk&&!(this.tabChemin[0]&&this.tabChemin[1]&&this.tabChemin[2])){
            //   this.decoder1.reset();
            //   this.decoder2.reset();
            // }
            _this4.tabForme = _this4._isInForme(newValues[0], newValues[1]);
            if (_this4.modelOk && !(_this4.tabForme[0] && _this4.tabForme[1] && _this4.tabForme[2] && _this4.tabForme[3])) {
              _this4.decoder.reset();
            }
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
      var tab = document.getElementsByClassName('chemin0');
      if (!this.visualisationFormeChemin) {
        for (var i = 0; i < tab.length; i++) {
          tab[i].style.display = 'none';
        }

        tab = document.getElementsByClassName('chemin1');
        for (var _i2 = 0; _i2 < tab.length; _i2++) {
          tab[_i2].style.display = 'none';
        }

        tab = document.getElementsByClassName('chemin2');
        for (var _i3 = 0; _i3 < tab.length; _i3++) {
          tab[_i3].style.display = 'none';
        }
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
      for (var _i4 = 0; _i4 < newList.length; _i4++) {
        var nomElement = newList[_i4].innerHTML;
        if (nomElement.slice(0, 1) == '_') {

          var nomForme = nomElement.slice(1, nomElement.length);
          var x = newList[_i4].getAttribute('x');
          var y = newList[_i4].getAttribute('y');
          this.send('demandeForme', nomForme, x, y);
          var parent = newList[_i4].parentNode;
          parent.removeChild(newList[_i4]);
          var elems = document.getElementsByClassName(nomForme);
          for (var _i5 = 0; _i5 < elems.length; _i5++) {
            elems[_i5].style.display = 'none';
          }
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
      for (var _i6 = 0; _i6 < this.listeRect.length; _i6++) {
        rotateAngle = 0;
        centreRotateX = null;
        centreRotateY = null;
        var hauteur = this.listeRect[_i6].getAttribute('width');
        var largeur = this.listeRect[_i6].getAttribute('height');
        var left = this.listeRect[_i6].getAttribute('x');
        var top = this.listeRect[_i6].getAttribute('y');
        var _trans = this.listeRect[_i6].getAttribute('transform');
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
      return [chemin1, chemin2, chemin3];
    }
  }, {
    key: '_isInForme',
    value: function _isInForme(x, y) {
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

      //FORME 1
      var forme1 = false;
      while (!forme1 && i < this.listeRectForme1.length) {
        rotateAngle = 0;
        centreRotateX = null;
        centreRotateY = null;
        hauteur = this.listeRectForme1[i].getAttribute('width');
        largeur = this.listeRectForme1[i].getAttribute('height');
        left = this.listeRectForme1[i].getAttribute('x');
        top = this.listeRectForme1[i].getAttribute('y');
        var _trans3 = this.listeRectForme1[i].getAttribute('transform');
        if (/rotate/.test(_trans3)) {
          _trans3 = _trans3.slice(7, _trans3.length);
          centreRotateX = parseFloat(_trans3.split(" ")[1]);
          centreRotateY = parseFloat(_trans3.split(",")[1].replace(")", ""));
          rotateAngle = parseFloat(_trans3.split(" ")[0]);
        }
        forme1 = this._isInRect(parseFloat(hauteur), parseFloat(largeur), parseFloat(left), parseFloat(top), x, y, rotateAngle, centreRotateX, centreRotateY);
        i++;
      }

      //FORME 2
      i = 0;
      var forme2 = false;
      while (!forme2 && i < this.listeRectForme2.length) {
        rotateAngle = 0;
        centreRotateX = null;
        centreRotateY = null;
        hauteur = this.listeRectForme2[i].getAttribute('width');
        largeur = this.listeRectForme2[i].getAttribute('height');
        left = this.listeRectForme2[i].getAttribute('x');
        top = this.listeRectForme2[i].getAttribute('y');
        var _trans4 = this.listeRectForme2[i].getAttribute('transform');
        if (/rotate/.test(_trans4)) {
          _trans4 = _trans4.slice(7, _trans4.length);
          centreRotateX = parseFloat(_trans4.split(" ")[1]);
          centreRotateY = parseFloat(_trans4.split(",")[1].replace(")", ""));
          rotateAngle = parseFloat(_trans4.split(" ")[0]);
        }
        forme2 = this._isInRect(parseFloat(hauteur), parseFloat(largeur), parseFloat(left), parseFloat(top), x, y, rotateAngle, centreRotateX, centreRotateY);
        i++;
      }

      //FORME 3
      i = 0;
      var forme3 = false;
      while (!forme2 && i < this.listeRectForme3.length) {
        rotateAngle = 0;
        centreRotateX = null;
        centreRotateY = null;
        hauteur = this.listeRectForme3[i].getAttribute('width');
        largeur = this.listeRectForme3[i].getAttribute('height');
        left = this.listeRectForme3[i].getAttribute('x');
        top = this.listeRectForme3[i].getAttribute('y');
        var _trans5 = this.listeRectForme3[i].getAttribute('transform');
        if (/rotate/.test(_trans5)) {
          _trans5 = _trans5.slice(7, _trans5.length);
          centreRotateX = parseFloat(_trans5.split(" ")[1]);
          centreRotateY = parseFloat(_trans5.split(",")[1].replace(")", ""));
          rotateAngle = parseFloat(_trans5.split(" ")[0]);
        }
        forme3 = this._isInRect(parseFloat(hauteur), parseFloat(largeur), parseFloat(left), parseFloat(top), x, y, rotateAngle, centreRotateX, centreRotateY);
        i++;
      }

      //FORME 4
      i = 0;
      var forme4 = false;
      while (!forme2 && i < this.listeRectForme4.length) {
        rotateAngle = 0;
        centreRotateX = null;
        centreRotateY = null;
        hauteur = this.listeRectForme4[i].getAttribute('width');
        largeur = this.listeRectForme4[i].getAttribute('height');
        left = this.listeRectForme4[i].getAttribute('x');
        top = this.listeRectForme4[i].getAttribute('y');
        var _trans6 = this.listeRectForme4[i].getAttribute('transform');
        if (/rotate/.test(_trans6)) {
          _trans6 = _trans6.slice(7, _trans6.length);
          centreRotateX = parseFloat(_trans6.split(" ")[1]);
          centreRotateY = parseFloat(_trans6.split(",")[1].replace(")", ""));
          rotateAngle = parseFloat(_trans6.split(" ")[0]);
        }
        forme4 = this._isInRect(parseFloat(hauteur), parseFloat(largeur), parseFloat(left), parseFloat(top), x, y, rotateAngle, centreRotateX, centreRotateY);
        i++;
      }
      return [forme1, forme2, forme3, forme4];
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
      for (var _i7 = 0; _i7 < this.listeRect.length; _i7++) {
        tab[tab.length] = this._getDistanceNode(this.listeRect[_i7], xValue, yValue);
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
        //this.segmenterFB[i] = audioContext.createGain();
        //this.segmenterDelayFB[i] = audioContext.createDelay(0.8);
        this.segmenterGainGrain[i].gain.setValueAtTime(0, audioContext.currentTime);
        this.segmenterGain[i].gain.setValueAtTime(0, audioContext.currentTime);
        //this.segmenterFB[i].gain.setValueAtTime(0.0,audioContext.currentTime);
        this.segmenterGainGrain[i].connect(this.grain.input);
        this.segmenterGain[i].connect(audioContext.destination);
        //this.segmenter[i].connect(this.segmenterFB[i]);
        //this.segmenterFB[i].connect(this.segmenterDelayFB[i]);
        //this.segmenterDelayFB[i].connect(audioContext.destination);
        //this.segmenterDelayFB[i].connect(this.segmenterFB[i]);
        this.segmenter[i].connect(this.segmenterGain[i]);
        this.segmenter[i].connect(this.segmenterGainGrain[i]);
        this._startSegmenter(i);
      }

      // Nappe de fond
      for (var _i8 = 0; _i8 < this.totalElements; _i8++) {

        //Création des gains d'entrée/sorties des nappes
        this.gainsDirections[_i8] = 'down';
        this.gains[_i8] = audioContext.createGain();
        this.gains[_i8].gain.value = 0;
        this.gains[_i8].connect(this.grain.input);

        //Création des sources pour le granulateur
        this.sources[_i8] = audioContext.createBufferSource();
        this.sources[_i8].buffer = this.loader.buffers[_i8 % 5];
        this.sources[_i8].connect(this.gains[_i8]);
        this.sources[_i8].loop = true;
        this.sources[_i8].start();
      }

      this.gainOutputDirect = audioContext.createGain();
      this.gainOutputDirect.gain.value = 0;
      this.gainOutputDirect.connect(audioContext.destination);
      this.gainOutputGrain = audioContext.createGain();
      this.gainOutputGrain.gain.value = 0;
      this.gainOutputGrain.connect(this.grain.input);

      for (var _i9 = 0; _i9 < this.nbForme; _i9++) {
        // Figure

        //création des gains de sons direct
        this.gainsForme[_i9] = audioContext.createGain();
        this.gainsForme[_i9].gain.value = 0;
        this.gainsForme[_i9].connect(this.gainOutputDirect);

        //création des gains de sons granulés
        this.gainsGrainForme[_i9] = audioContext.createGain();
        this.gainsGrainForme[_i9].gain.value = 0;
        this.gainsGrainForme[_i9].connect(this.gainOutputGrain);

        //Forme source sonore
        this.soundForme[_i9] = audioContext.createBufferSource();
        this.soundForme[_i9].buffer = this.loader.buffers[10 + (_i9 + 1)];
        this.soundForme[_i9].connect(this.gainsForme[_i9]);
        this.soundForme[_i9].connect(this.gainsGrainForme[_i9]);
        this.soundForme[_i9].loop = true;
        this.soundForme[_i9].start();
      }
    }
  }, {
    key: '_startSegmenter',
    value: function _startSegmenter(i) {
      var _this5 = this;

      this.segmenter[i].trigger();
      var newPeriod = parseFloat(this.loader.buffers[6 + i * 2]['duration'][this.segmenter[i].segmentIndex]) * 1000;
      // if(newPeriod> 150){
      //   newPeriod -= 30;
      // }else if(newPeriod>400){
      //   newPeriod -= 130;
      // }else if(newPeriod> 800){
      //   newPeriod -= 250;
      // }
      setTimeout(function () {
        _this5._startSegmenter(i);
      }, newPeriod);
    }

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
        //let actual3 = this.segmenterFB[i].gain.value;
        //this.segmenterFB[i].gain.cancelScheduledValues(audioContext.currentTime);
        this.segmenterGain[i].gain.cancelScheduledValues(audioContext.currentTime);
        this.segmenterGainGrain[i].gain.cancelScheduledValues(audioContext.currentTime);
        this.segmenterGain[i].gain.setValueAtTime(actual1, audioContext.currentTime);
        this.segmenterGainGrain[i].gain.setValueAtTime(actual2, audioContext.currentTime);
        //this.segmenterFB[i].gain.setValueAtTime(actual3,audioContext.currentTime);
        this.segmenterGainGrain[i].gain.linearRampToValueAtTime(0, audioContext.currentTime + 1);
        this.segmenterGain[i].gain.linearRampToValueAtTime(0.25, audioContext.currentTime + 0.6);
        //this.segmenterFB[i].gain.linearRampToValueAtTime(0.4, audioContext.currentTime + 3);
      } else {
        var _actual2 = this.segmenterGain[i].gain.value;
        var _actual3 = this.segmenterGainGrain[i].gain.value;
        //let actual3 = this.segmenterFB[i].gain.value;
        //this.segmenterFB[i].gain.cancelScheduledValues(audioContext.currentTime);
        this.segmenterGain[i].gain.cancelScheduledValues(audioContext.currentTime);
        this.segmenterGainGrain[i].gain.cancelScheduledValues(audioContext.currentTime);
        this.segmenterGain[i].gain.setValueAtTime(_actual2, audioContext.currentTime);
        this.segmenterGainGrain[i].gain.setValueAtTime(_actual3, audioContext.currentTime);
        //this.segmenterFB[i].gain.setValueAtTime(actual3,audioContext.currentTime);
        if (this.startSegmentFini[i]) {
          this.segmenterGainGrain[i].gain.linearRampToValueAtTime(_actual2 + 0.15, audioContext.currentTime + 0.1);
          setTimeout(function () {
            _this6.segmenterGainGrain[i].gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.3);
          }, 2000);
          this.segmenterGain[i].gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.4);
          //this.segmenterFB[i].gain.linearRampToValueAtTime(0, audioContext.currentTime + 2.5);
        } else {
          this.startSegmentFini[i] = true;
        }
      }
    }
  }, {
    key: '_actualiserAudioForme',
    value: function _actualiserAudioForme(id) {
      //Forme1
      if (id == 0 && this.tabForme[id]) {
        var gainGrain = 1 - this.rampForme["forme1"] / 600;
        var gainDirect = this.rampForme["forme1"] / 600;
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
        if (this.tabForme[id]) {
          this.gainsForme[id].gain.linearRampToValueAtTime(gainDirect, audioContext.currentTime + 0.01);
          this.gainsGrainForme[id].gain.linearRampToValueAtTime(gainGrain, audioContext.currentTime + 0.01);
        }
      }

      //Forme2
      if (id == 1 && this.tabForme[id]) {
        var _gainGrain = 1 - this.rampForme["forme2"] / 600;
        var _gainDirect = this.rampForme["forme2"] / 600;
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
        if (this.tabForme[id]) {
          this.gainsForme[id].gain.linearRampToValueAtTime(_gainDirect, audioContext.currentTime + 0.01);
          this.gainsGrainForme[id].gain.linearRampToValueAtTime(_gainGrain, audioContext.currentTime + 0.01);
        }
      }

      //Forme3
      if (id == 2 && this.tabForme[id]) {
        var _gainGrain2 = 1 - this.rampForme["forme3"] / 600;
        var _gainDirect2 = this.rampForme["forme3"] / 600;
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
        if (this.tabForme[id]) {
          this.gainsForme[id].gain.linearRampToValueAtTime(_gainDirect2, audioContext.currentTime + 0.01);
          this.gainsGrainForme[id].gain.linearRampToValueAtTime(_gainGrain2, audioContext.currentTime + 0.01);
        }
      }

      //Forme4
      if (id == 3 && this.tabForme[id]) {
        var _gainGrain3 = 1 - this.rampForme["forme4"] / 600;
        var _gainDirect3 = this.rampForme["forme4"] / 600;
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
        if (this.tabForme[id]) {
          this.gainsForme[id].gain.linearRampToValueAtTime(_gainDirect3, audioContext.currentTime + 0.01);
          this.gainsGrainForme[id].gain.linearRampToValueAtTime(_gainGrain3, audioContext.currentTime + 0.01);
        }
      }

      if (!this.tabForme[0] && this.tabForme[0] != this.ancienForme[0]) {
        this.gainsForme[0].gain.linearRampToValueAtTime(0, audioContext.currentTime + 1.5);
        this.gainsGrainForme[0].gain.linearRampToValueAtTime(0, audioContext.currentTime + 1.5);
      }
      if (!this.tabForme[1] && this.tabForme[1] != this.ancienForme[1]) {
        this.gainsForme[1].gain.linearRampToValueAtTime(0, audioContext.currentTime + 1.5);
        this.gainsGrainForme[1].gain.linearRampToValueAtTime(0, audioContext.currentTime + 1.5);
      }
      if (!this.tabForme[2] && this.tabForme[2] != this.ancienForme[2]) {
        this.gainsForme[2].gain.linearRampToValueAtTime(0, audioContext.currentTime + 1.5);
        this.gainsGrainForme[2].gain.linearRampToValueAtTime(0, audioContext.currentTime + 1.5);
      }
      if (!this.tabForme[3] && this.tabForme[3] != this.ancienForme[3]) {
        this.gainsForme[3].gain.linearRampToValueAtTime(0, audioContext.currentTime + 1.5);
        this.gainsGrainForme[3].gain.linearRampToValueAtTime(0, audioContext.currentTime + 1.5);
      }

      this.ancienForme = [this.tabForme[0], this.tabForme[1], this.tabForme[2], this.tabForme[3]];
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
      //Chemin
      for (var _i10 = 0; _i10 < this.nbChemin; _i10++) {
        newSegment[_i10] = this._findNewSegment(probaMax1, probaMax2, _i10);
        this._actualiserSegmentIfNotIn(newSegment[_i10], _i10);
        var nom1 = 'prototypeFond-' + _i10 + '-1';
        var nom2 = 'prototypeFond-' + _i10 + '-2';
        if (this.tabChemin[_i10] && (probaMax1[0] == nom1 || probaMax2[0] == nom2)) {
          if (!isNaN(probaMax1[1][_i10]) || !isNaN(probaMax2[1][_i10])) {
            this.lastPosition[_i10] = newSegment[_i10];
            newSegment[_i10] = newSegment[_i10] + (0, _trunc2.default)(Math.random() * this.qtRandom);
            this.segmenter[_i10].segmentIndex = newSegment[_i10];
          }
        } else {
          this.segmenter[_i10].segmentIndex = this.lastPosition[_i10] + (0, _trunc2.default)(Math.random() * this.qtRandom);
        }
        if (this.tabChemin[_i10] != this.oldTabChemin[_i10]) {
          this._actualiserAudioChemin(_i10);
        }
        if (_i10 == 2) {}
        this.oldTabChemin[_i10] = this.tabChemin[_i10];
      }

      //Forme
      var direct = false;
      var i = 0;
      while (!direct && i < this.nbForme) {
        if (this.tabForme[i]) {
          direct = true;
        }
        i++;
      }

      var actual1 = this.gainOutputDirect.gain.value;
      var actual2 = this.gainOutputGrain.gain.value;

      if (direct != this.ancien3) {
        if (direct) {
          this.gainOutputDirect.gain.cancelScheduledValues(audioContext.currentTime);
          this.gainOutputDirect.gain.setValueAtTime(actual1, audioContext.currentTime);
          this.gainOutputDirect.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + 2);
          this.gainOutputGrain.gain.cancelScheduledValues(audioContext.currentTime);
          this.gainOutputGrain.gain.setValueAtTime(actual1, audioContext.currentTime);
          this.gainOutputGrain.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + 2);
        } else {
          this.gainOutputDirect.gain.cancelScheduledValues(audioContext.currentTime);
          this.gainOutputDirect.gain.setValueAtTime(actual1, audioContext.currentTime);
          this.gainOutputDirect.gain.linearRampToValueAtTime(0, audioContext.currentTime + 2);
          this.gainOutputGrain.gain.cancelScheduledValues(audioContext.currentTime);
          this.gainOutputGrain.gain.setValueAtTime(actual1, audioContext.currentTime);
          this.gainOutputGrain.gain.linearRampToValueAtTime(0, audioContext.currentTime + 2);
          this.rampForme['forme1'] = 0;
          this.rampForme['forme2'] = 0;
          this.rampForme['forme3'] = 0;
          this.rampForme['forme4'] = 0;
        }
      }
      this.ancien3 = direct;

      if (direct) {
        for (var _i11 = 0; _i11 < this.nbForme; _i11++) {
          if (probaMax == 'forme1') {
            this.rampForme['forme2']--;
            this.rampForme['forme3']--;
            this.rampForme['forme4']--;
          } else if (probaMax == 'forme2') {
            this.rampForme['forme1']--;
            this.rampForme['forme3']--;
            this.rampForme['forme4']--;
          } else if (probaMax == 'forme3') {
            this.rampForme['forme1']--;
            this.rampForme['forme2']--;
            this.rampForme['forme4']--;
          } else if (probaMax == 'forme4') {
            this.rampForme['forme1']--;
            this.rampForme['forme2']--;
            this.rampForme['forme3']--;
          } else if (probaMax == null) {
            this.rampForme['forme1']--;
            this.rampForme['forme2']--;
            this.rampForme['forme3']--;
            this.rampForme['forme4']--;
          }
        }
        this.rampForme[probaMax]++;
      }
      for (var _i12 = 0; _i12 < this.nbForme; _i12++) {
        this._actualiserAudioForme(_i12);
      }
    }

    // Trouve en fonction de xmm le segment le plus proche de la position de l'utilisateur

  }, {
    key: '_findNewSegment',
    value: function _findNewSegment(probaMax1, probaMax2, id) {
      var newSegment = -1;
      var actuel = null;
      if (this.ancien1[id] - probaMax1[1][id] != 0. && !isNaN(probaMax1[1][id])) {
        newSegment = (0, _trunc2.default)(probaMax1[1][id] * (this.nbSegment[id] - this.qtRandom));
        actuel = "1";
        if (this.count2[id] > this.countMax) {
          this.decoder3.reset();
          this.count2[id] = 0;
        }
        this.count1[id] = 0;
        this.count2[id]++;
      } else if (this.ancien2[id] - probaMax2[1][id] != 0. && !isNaN(probaMax2[1][id])) {
        newSegment = (0, _trunc2.default)((1 - probaMax2[1][id]) * (this.nbSegment[id] - this.qtRandom));
        actuel = "0";
        if (this.count1[id] > this.countMax) {
          this.decoder2.reset();
          this.count1[id] = 0;
        }
        this.count2[id] = 0;
        this.count1[id]++;
      } else {
        newSegment = this.lastSegment[id];
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
          if (newSegment > this.nbSegment[id] - this.qtRandom) {
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
        this.lastSegment[id] = newSegment;
        var segment = newSegment + (0, _trunc2.default)(Math.random() * this.qtRandom);
        this.countTimeout[id]++;
        this.segmenter[id].segmentIndex = segment;
      }
    }
  }]);
  return PlayerExperience;
}(soundworks.Experience);

exports.default = PlayerExperience;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlBsYXllckV4cGVyaWVuY2UuanMiXSwibmFtZXMiOlsic291bmR3b3JrcyIsIndhdmVzIiwiYXVkaW9Db250ZXh0Iiwic2NoZWR1bGVyIiwiZ2V0U2NoZWR1bGVyIiwiUGxheWVyVmlldyIsInRlbXBsYXRlIiwiY29udGVudCIsImV2ZW50cyIsIm9wdGlvbnMiLCJWaWV3IiwidmlldyIsIlBsYXllckV4cGVyaWVuY2UiLCJhc3NldHNEb21haW4iLCJwbGF0Zm9ybSIsInJlcXVpcmUiLCJmZWF0dXJlcyIsIm1vdGlvbklucHV0IiwiZGVzY3JpcHRvcnMiLCJsb2FkZXIiLCJmaWxlcyIsInN0YXJ0T0siLCJzdGFydFNlZ21lbnRGaW5pIiwibW9kZWxPSyIsIm5iQ2hlbWluIiwibmJGb3JtZSIsInF0UmFuZG9tIiwibmJTZWdtZW50IiwiYW5jaWVuMSIsImFuY2llbjIiLCJhbmNpZW4zIiwiY291bnRUaW1lb3V0IiwiZGlyZWN0aW9uIiwib2xkVGFiQ2hlbWluIiwiY291bnQxIiwiY291bnQyIiwic2VnbWVudGVyIiwic2VnbWVudGVyRkIiLCJzZWdtZW50ZXJEZWxheUZCIiwic2VnbWVudGVyR2FpbiIsInNlZ21lbnRlckdhaW5HcmFpbiIsInNvdXJjZXMiLCJnYWlucyIsImdhaW5zRGlyZWN0aW9ucyIsImdyYWluIiwibGFzdFNlZ21lbnQiLCJsYXN0UG9zaXRpb24iLCJnYWluT3V0cHV0RGlyZWN0IiwiZ2Fpbk91dHB1dEdyYWluIiwiZ2FpbnNGb3JtZSIsImFuY2llbkZvcm1lIiwiZ2FpbnNHcmFpbkZvcm1lIiwic291bmRGb3JtZSIsInJhbXBGb3JtZSIsImNvdW50TWF4IiwiaSIsInZpZXdUZW1wbGF0ZSIsInZpZXdDb250ZW50Iiwidmlld0N0b3IiLCJ2aWV3T3B0aW9ucyIsInByZXNlcnZlUGl4ZWxSYXRpbyIsImNyZWF0ZVZpZXciLCJfdG9Nb3ZlIiwiYmluZCIsIl9pc0luRWxsaXBzZSIsIl9pc0luUmVjdCIsIl9pc0luIiwiX2lzSW5DaGVtaW4iLCJfaXNJbkZvcm1lIiwiX2dldERpc3RhbmNlTm9kZSIsIl9jcmVhdGlvblVuaXZlcnNTb25vcmUiLCJfdXBkYXRlR2FpbiIsIl9yb3RhdGVQb2ludCIsIl9teUxpc3RlbmVyIiwiX2FkZEJvdWxlIiwiX2FkZEZvbmQiLCJfc2V0TW9kZWwiLCJfcHJvY2Vzc1Byb2JhIiwiX3JlbXBsYWNlRm9ybWUiLCJfYWRkRm9ybWUiLCJfc3RhcnRTZWdtZW50ZXIiLCJfZmluZE5ld1NlZ21lbnQiLCJfYWN0dWFsaXNlclNlZ21lbnRJZk5vdEluIiwiX2FjdHVhbGlzZXJBdWRpb0NoZW1pbiIsIl9hY3R1YWxpc2VyQXVkaW9Gb3JtZSIsInJlY2VpdmUiLCJkYXRhIiwibW9kZWwiLCJtb2RlbDEiLCJtb2RlbDIiLCJmb3JtZSIsIngiLCJ5IiwiaGFzU3RhcnRlZCIsImluaXQiLCJzaG93IiwiZGVjb2RlciIsImRlY29kZXIyIiwiZGVjb2RlcjMiLCJkb2N1bWVudCIsImJvZHkiLCJzdHlsZSIsIm92ZXJmbG93IiwiY2VudHJlWCIsIndpbmRvdyIsImlubmVyV2lkdGgiLCJ0YWlsbGVFY3JhblgiLCJ0YWlsbGVFY3JhblkiLCJpbm5lckhlaWdodCIsImNlbnRyZUVjcmFuWCIsImNlbnRyZUVjcmFuWSIsInNldFRpbWVvdXQiLCJjZW50cmVZIiwibGlzdGVFbGxpcHNlIiwiZ2V0RWxlbWVudHNCeVRhZ05hbWUiLCJsaXN0ZVJlY3QiLCJ0b3RhbEVsZW1lbnRzIiwibGVuZ3RoIiwibGlzdGVUZXh0IiwibGlzdGVGb3JtZSIsImxpc3RlUmVjdENoZW1pbjEiLCJnZXRFbGVtZW50c0J5Q2xhc3NOYW1lIiwibGlzdGVSZWN0Q2hlbWluMiIsImxpc3RlUmVjdENoZW1pbjMiLCJsaXN0ZVJlY3RGb3JtZTEiLCJsaXN0ZVJlY3RGb3JtZTIiLCJsaXN0ZVJlY3RGb3JtZTMiLCJsaXN0ZVJlY3RGb3JtZTQiLCJtYXhDb3VudFVwZGF0ZSIsImNvdW50VXBkYXRlIiwidmlzdWFsaXNhdGlvbkZvcm1lQ2hlbWluIiwidmlzdWFsaXNhdGlvbkJvdWxlIiwiJGVsIiwicXVlcnlTZWxlY3RvciIsImRpc3BsYXkiLCJ2aXN1YWxpc2F0aW9uRm9ybWUiLCJtaXJyb3JCb3VsZVgiLCJtaXJyb3JCb3VsZVkiLCJvZmZzZXRYIiwib2Zmc2V0WSIsIlNWR19NQVhfWCIsImdldEF0dHJpYnV0ZSIsIlNWR19NQVhfWSIsInRhYkluIiwiaXNBdmFpbGFibGUiLCJhZGRMaXN0ZW5lciIsIm5ld1ZhbHVlcyIsInRhYkNoZW1pbiIsInRhYkZvcm1lIiwibW9kZWxPayIsInJlc2V0IiwiX21vdmVTY3JlZW5UbyIsInByb2Nlc3MiLCJjb25zb2xlIiwibG9nIiwiZWxlbSIsImNyZWF0ZUVsZW1lbnROUyIsInNldEF0dHJpYnV0ZU5TIiwiYXBwZW5kQ2hpbGQiLCJmb25kIiwicGFyc2VyIiwiRE9NUGFyc2VyIiwiZm9uZFhtbCIsInBhcnNlRnJvbVN0cmluZyIsImdldEVsZW1lbnRCeUlkIiwic2V0QXR0cmlidXRlIiwiX3N1cHByaW1lclJlY3RDaGVtaW4iLCJzdGFydCIsInRhYiIsImZvcm1lWG1sIiwiYm91bGUiLCJmb3JtZVhtbFRhYiIsImNoaWxkTm9kZXMiLCJub2RlTmFtZSIsIm5ld05vZGUiLCJwYXJlbnROb2RlIiwiaW5zZXJ0QmVmb3JlIiwidmFsdWVYIiwidmFsdWVZIiwib2JqIiwibmV3WCIsIm5ld1kiLCJhY3R1IiwiZm9yY2UiLCJkaXN0YW5jZVgiLCJuZWdYIiwiaW5kaWNlUG93WCIsImluZGljZVBvd1kiLCJNYXRoIiwicG93IiwiYWJzIiwiZGlzdGFuY2VZIiwibmVnWSIsInNjcm9sbCIsInRpbWUiLCJuZXdMaXN0Iiwibm9tRWxlbWVudCIsImlubmVySFRNTCIsInNsaWNlIiwibm9tRm9ybWUiLCJzZW5kIiwicGFyZW50IiwicmVtb3ZlQ2hpbGQiLCJlbGVtcyIsInJvdGF0ZUFuZ2xlIiwiY2VudHJlUm90YXRlWCIsImNlbnRyZVJvdGF0ZVkiLCJyYXlvblgiLCJyYXlvblkiLCJ0cmFucyIsInRlc3QiLCJwYXJzZUZsb2F0Iiwic3BsaXQiLCJyZXBsYWNlIiwiaGF1dGV1ciIsImxhcmdldXIiLCJsZWZ0IiwidG9wIiwiY2hlbWluMSIsImNoZW1pbjIiLCJjaGVtaW4zIiwiZm9ybWUxIiwiZm9ybWUyIiwiZm9ybWUzIiwiZm9ybWU0IiwicG9pbnRYIiwicG9pbnRZIiwibmV3UG9pbnQiLCJwYXJzZUludCIsImEiLCJiIiwiY2FsYyIsImFuZ2xlIiwibmV3QW5nbGUiLCJjb3MiLCJzaW4iLCJ4VmFsdWUiLCJ5VmFsdWUiLCJub2RlIiwidGFnTmFtZSIsInNxcnQiLCJoYXV0IiwibGFyZyIsImFkZCIsImNvbm5lY3QiLCJkZXN0aW5hdGlvbiIsImJ1ZmZlckFzc29jaWVzIiwibWFya2VyQXNzb2NpZXMiLCJpZEJ1ZmZlciIsImlkTWFya2VyIiwiU2VnbWVudEVuZ2luZSIsImJ1ZmZlciIsImJ1ZmZlcnMiLCJwb3NpdGlvbkFycmF5IiwiZHVyYXRpb25BcnJheSIsImR1cmF0aW9uIiwicGVyaW9kQWJzIiwicGVyaW9kUmVsIiwiY3JlYXRlR2FpbiIsImdhaW4iLCJzZXRWYWx1ZUF0VGltZSIsImN1cnJlbnRUaW1lIiwiaW5wdXQiLCJ2YWx1ZSIsImNyZWF0ZUJ1ZmZlclNvdXJjZSIsImxvb3AiLCJ0cmlnZ2VyIiwibmV3UGVyaW9kIiwic2VnbWVudEluZGV4IiwiYWN0dWFsIiwiY2FuY2VsU2NoZWR1bGVkVmFsdWVzIiwibGluZWFyUmFtcFRvVmFsdWVBdFRpbWUiLCJhY3R1YWwxIiwiYWN0dWFsMiIsImlkIiwiZ2FpbkdyYWluIiwiZ2FpbkRpcmVjdCIsInNldE1vZGVsIiwicHJvYmFNYXgiLCJnZXRQcm9iYSIsInByb2JhTWF4MSIsInByb2JhTWF4MiIsIm5ld1NlZ21lbnQiLCJub20xIiwibm9tMiIsImlzTmFOIiwicmFuZG9tIiwiZGlyZWN0IiwiYWN0dWVsIiwic2VnbWVudCIsIkV4cGVyaWVuY2UiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7SUFBWUEsVTs7QUFDWjs7OztBQUNB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QUE5QixDQUF4QjtBQUNBLGFBQUtLLFlBQUwsQ0FBa0JtUCxFQUFsQjtBQUNBLGFBQUs5TyxTQUFMLENBQWU4TyxFQUFmLEVBQW1CTixZQUFuQixHQUFrQ3FCLE9BQWxDO0FBQ0Q7QUFDRjs7O0VBN2tDMkNqUyxXQUFXa1MsVTs7a0JBQXBDdFIsZ0IiLCJmaWxlIjoiUGxheWVyRXhwZXJpZW5jZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIHNvdW5kd29ya3MgZnJvbSAnc291bmR3b3Jrcy9jbGllbnQnO1xuaW1wb3J0IE15R3JhaW4yIGZyb20gJy4vTXlHcmFpbjIuanMnO1xuaW1wb3J0ICogYXMgd2F2ZXMgZnJvbSAnd2F2ZXMtYXVkaW8nO1xuaW1wb3J0IHtIaG1tRGVjb2Rlckxmb30gZnJvbSAneG1tLWxmbydcbmltcG9ydCBEZWNvZGFnZSBmcm9tICcuL0RlY29kYWdlLmpzJztcbmltcG9ydCBEZWNvZGFnZTIgZnJvbSAnLi9EZWNvZGFnZTIuanMnO1xuaW1wb3J0IERlY29kYWdlMyBmcm9tIFwiLi9EZWNvZGFnZTMuanNcIjtcblxuY29uc3QgYXVkaW9Db250ZXh0ID0gc291bmR3b3Jrcy5hdWRpb0NvbnRleHQ7XG5jb25zdCBzY2hlZHVsZXIgPSB3YXZlcy5nZXRTY2hlZHVsZXIoKTtcblxuY2xhc3MgUGxheWVyVmlldyBleHRlbmRzIHNvdW5kd29ya3MuVmlld3tcbiAgY29uc3RydWN0b3IodGVtcGxhdGUsIGNvbnRlbnQsIGV2ZW50cywgb3B0aW9ucykge1xuICAgIHN1cGVyKHRlbXBsYXRlLCBjb250ZW50LCBldmVudHMsIG9wdGlvbnMpO1xuICB9XG59XG5cbmNvbnN0IHZpZXc9IGBgO1xuXG4vLyB0aGlzIGV4cGVyaWVuY2UgcGxheXMgYSBzb3VuZCB3aGVuIGl0IHN0YXJ0cywgYW5kIHBsYXlzIGFub3RoZXIgc291bmQgd2hlblxuLy8gb3RoZXIgY2xpZW50cyBqb2luIHRoZSBleHBlcmllbmNlXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQbGF5ZXJFeHBlcmllbmNlIGV4dGVuZHMgc291bmR3b3Jrcy5FeHBlcmllbmNlIHtcbiAgY29uc3RydWN0b3IoYXNzZXRzRG9tYWluKSB7XG4gICAgc3VwZXIoKTtcbiAgICAvL1NlcnZpY2VzXG4gICAgdGhpcy5wbGF0Zm9ybSA9IHRoaXMucmVxdWlyZSgncGxhdGZvcm0nLCB7IGZlYXR1cmVzOiBbJ3dlYi1hdWRpbycsICd3YWtlLWxvY2snXSB9KTtcbiAgICB0aGlzLm1vdGlvbklucHV0ID0gdGhpcy5yZXF1aXJlKCdtb3Rpb24taW5wdXQnLCB7IGRlc2NyaXB0b3JzOiBbJ29yaWVudGF0aW9uJ10gfSk7XG4gICAgdGhpcy5sb2FkZXIgPSB0aGlzLnJlcXVpcmUoJ2xvYWRlcicsIHsgXG4gICAgICBmaWxlczogWydzb3VuZHMvbmFwcGUvZ2Fkb3VlLm1wMycsIC8vMFxuICAgICAgICAgICAgICAnc291bmRzL25hcHBlL2dhZG91ZS5tcDMnLCAvLzFcbiAgICAgICAgICAgICAgXCJzb3VuZHMvbmFwcGUvbmFnZS5tcDNcIiwgIC8vIC4uLlxuICAgICAgICAgICAgICBcInNvdW5kcy9uYXBwZS90ZW1wZXRlLm1wM1wiLFxuICAgICAgICAgICAgICBcInNvdW5kcy9uYXBwZS92ZW50Lm1wM1wiLFxuICAgICAgICAgICAgICBcInNvdW5kcy9jaGVtaW4vY2FtdXNDLm1wM1wiLCAvLyA1ICBcbiAgICAgICAgICAgICAgXCJtYXJrZXJzL2NhbXVzLmpzb25cIiwgXG4gICAgICAgICAgICAgIFwic291bmRzL2NoZW1pbi9jaHVyY2hpbGxDLm1wM1wiLCAgICBcbiAgICAgICAgICAgICAgXCJtYXJrZXJzL2NodXJjaGlsbC5qc29uXCIsXG4gICAgICAgICAgICAgIFwic291bmRzL2NoZW1pbi9pcmFrQy5tcDNcIiwgICBcbiAgICAgICAgICAgICAgXCJtYXJrZXJzL2lyYWsuanNvblwiLCAvLzEwICBcbiAgICAgICAgICAgICAgXCJzb3VuZHMvZm9ybWUvdHJ1bXAubXAzXCIsXG4gICAgICAgICAgICAgIFwic291bmRzL2Zvcm1lL2VtaW5lbS5tcDNcIixcbiAgICAgICAgICAgICAgXCJzb3VuZHMvZm9ybWUvZnIubXAzXCIsXG4gICAgICAgICAgICAgIFwic291bmRzL2Zvcm1lL2JyZXhpdC5tcDNcIl1cbiAgICB9KTtcbiAgICB0aGlzLnN0YXJ0T0sgPSBmYWxzZTtcbiAgICB0aGlzLnN0YXJ0U2VnbWVudEZpbmkgPSBbXTtcbiAgICB0aGlzLm1vZGVsT0sgPSBmYWxzZTtcblxuICAgIC8vIFBBUkFNRVRSRVxuICAgIHRoaXMubmJDaGVtaW4gPSAzO1xuICAgIHRoaXMubmJGb3JtZSA9IDQ7XG4gICAgdGhpcy5xdFJhbmRvbSA9IDI1O1xuICAgIHRoaXMubmJTZWdtZW50ID0gWzIzMiwxNDQsMTA2XTtcblxuICAgIC8vXG4gICAgdGhpcy5hbmNpZW4xID0gW107XG4gICAgdGhpcy5hbmNpZW4yID0gW107XG4gICAgdGhpcy5hbmNpZW4zID0gZmFsc2VcbiAgICB0aGlzLmNvdW50VGltZW91dCA9IFtdO1xuICAgIHRoaXMuZGlyZWN0aW9uID0gW107XG4gICAgdGhpcy5vbGRUYWJDaGVtaW4gPSBbXTtcbiAgICB0aGlzLmNvdW50MSA9IFtdO1xuICAgIHRoaXMuY291bnQyID0gW107XG4gICAgdGhpcy5zZWdtZW50ZXIgPSBbXTtcbiAgICB0aGlzLnNlZ21lbnRlckZCID0gW107XG4gICAgdGhpcy5zZWdtZW50ZXJEZWxheUZCID0gW107XG4gICAgdGhpcy5zZWdtZW50ZXJHYWluID0gW107XG4gICAgdGhpcy5zZWdtZW50ZXJHYWluR3JhaW4gPSBbXTtcbiAgICB0aGlzLnNvdXJjZXMgPSBbXTtcbiAgICB0aGlzLmdhaW5zID0gW107XG4gICAgdGhpcy5nYWluc0RpcmVjdGlvbnMgPSBbXTtcbiAgICB0aGlzLmdyYWluO1xuICAgIHRoaXMubGFzdFNlZ21lbnQgPSBbMCwwLDBdO1xuICAgIHRoaXMubGFzdFBvc2l0aW9uID0gWzAsMCwwXTtcbiAgICB0aGlzLmdhaW5PdXRwdXREaXJlY3Q7XG4gICAgdGhpcy5nYWluT3V0cHV0R3JhaW47XG4gICAgdGhpcy5nYWluc0Zvcm1lID0gW107XG4gICAgdGhpcy5hbmNpZW5Gb3JtZSA9IFtmYWxzZSxmYWxzZSxmYWxzZV07XG4gICAgdGhpcy5nYWluc0dyYWluRm9ybWUgPSBbXTtcbiAgICB0aGlzLnNvdW5kRm9ybWUgPSBbXTtcbiAgICB0aGlzLnJhbXBGb3JtZSA9IHsnZm9ybWUxJzowLCAnZm9ybWUyJzowLCAnZm9ybWUzJzowLCAnZm9ybWU0JyA6MH07XG4gICAgdGhpcy5jb3VudE1heCA9IDEwMDtcblxuICAgIGZvcihsZXQgaSA9MDsgaTx0aGlzLm5iQ2hlbWluO2krKyl7XG4gICAgICB0aGlzLmNvdW50MVtpXSA9IDIwO1xuICAgICAgdGhpcy5jb3VudDJbaV0gPSAyMDtcbiAgICAgIHRoaXMuYW5jaWVuMVtpXSA9IDA7XG4gICAgICB0aGlzLmFuY2llbjJbaV0gPSAwO1xuICAgICAgdGhpcy5jb3VudFRpbWVvdXRbaV0gPSAwO1xuICAgICAgdGhpcy5kaXJlY3Rpb25baV0gPSB0cnVlO1xuICAgICAgdGhpcy5vbGRUYWJDaGVtaW5baV0gPSB0cnVlO1xuICAgICAgdGhpcy5zdGFydFNlZ21lbnRGaW5pW2ldID0gZmFsc2U7XG4gICAgfSBcbiAgfVxuXG4gIGluaXQoKSB7XG4gICAgLy8gaW5pdGlhbGl6ZSB0aGUgdmlld1xuICAgIHRoaXMudmlld1RlbXBsYXRlID0gdmlldztcbiAgICB0aGlzLnZpZXdDb250ZW50ID0ge307XG4gICAgdGhpcy52aWV3Q3RvciA9IFBsYXllclZpZXc7XG4gICAgdGhpcy52aWV3T3B0aW9ucyA9IHsgcHJlc2VydmVQaXhlbFJhdGlvOiB0cnVlIH07XG4gICAgdGhpcy52aWV3ID0gdGhpcy5jcmVhdGVWaWV3KCk7XG5cbiAgICAvL2JpbmRcbiAgICB0aGlzLl90b01vdmUgPSB0aGlzLl90b01vdmUuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9pc0luRWxsaXBzZSA9IHRoaXMuX2lzSW5FbGxpcHNlLmJpbmQodGhpcyk7XG4gICAgdGhpcy5faXNJblJlY3QgPSB0aGlzLl9pc0luUmVjdC5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX2lzSW4gPSB0aGlzLl9pc0luLmJpbmQodGhpcyk7XG4gICAgdGhpcy5faXNJbkNoZW1pbiA9IHRoaXMuX2lzSW5DaGVtaW4uYmluZCh0aGlzKTtcbiAgICB0aGlzLl9pc0luRm9ybWUgPSB0aGlzLl9pc0luRm9ybWUuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9nZXREaXN0YW5jZU5vZGUgPSB0aGlzLl9nZXREaXN0YW5jZU5vZGUuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9jcmVhdGlvblVuaXZlcnNTb25vcmU9dGhpcy5fY3JlYXRpb25Vbml2ZXJzU29ub3JlLmJpbmQodGhpcyk7ICAgIFxuICAgIHRoaXMuX3VwZGF0ZUdhaW4gPSB0aGlzLl91cGRhdGVHYWluLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fcm90YXRlUG9pbnQgPSB0aGlzLl9yb3RhdGVQb2ludC5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX215TGlzdGVuZXI9IHRoaXMuX215TGlzdGVuZXIuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9hZGRCb3VsZSA9IHRoaXMuX2FkZEJvdWxlLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fYWRkRm9uZCA9IHRoaXMuX2FkZEZvbmQuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9zZXRNb2RlbCA9IHRoaXMuX3NldE1vZGVsLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fcHJvY2Vzc1Byb2JhID0gdGhpcy5fcHJvY2Vzc1Byb2JhLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fcmVtcGxhY2VGb3JtZSA9IHRoaXMuX3JlbXBsYWNlRm9ybWUuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9hZGRGb3JtZSA9IHRoaXMuX2FkZEZvcm1lLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fc3RhcnRTZWdtZW50ZXIgPSB0aGlzLl9zdGFydFNlZ21lbnRlci5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX2ZpbmROZXdTZWdtZW50ID0gdGhpcy5fZmluZE5ld1NlZ21lbnQuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9hY3R1YWxpc2VyU2VnbWVudElmTm90SW4gPSB0aGlzLl9hY3R1YWxpc2VyU2VnbWVudElmTm90SW4uYmluZCh0aGlzKTtcbiAgICB0aGlzLl9hY3R1YWxpc2VyQXVkaW9DaGVtaW4gPSB0aGlzLl9hY3R1YWxpc2VyQXVkaW9DaGVtaW4uYmluZCh0aGlzKTtcbiAgICB0aGlzLl9hY3R1YWxpc2VyQXVkaW9Gb3JtZSA9IHRoaXMuX2FjdHVhbGlzZXJBdWRpb0Zvcm1lLmJpbmQodGhpcyk7XG4gICAgdGhpcy5yZWNlaXZlKCdmb25kJywoZGF0YSk9PnRoaXMuX2FkZEZvbmQoZGF0YSkpO1xuICAgIHRoaXMucmVjZWl2ZSgnbW9kZWwnLChtb2RlbCxtb2RlbDEsbW9kZWwyKT0+dGhpcy5fc2V0TW9kZWwobW9kZWwsbW9kZWwxLG1vZGVsMikpO1xuICAgIHRoaXMucmVjZWl2ZSgncmVwb25zZUZvcm1lJywoZm9ybWUseCx5KT0+dGhpcy5fYWRkRm9ybWUoZm9ybWUseCx5KSk7XG4gfVxuXG4gIHN0YXJ0KCkge1xuICAgIGlmKCF0aGlzLnN0YXJ0T0spe1xuICAgICAgc3VwZXIuc3RhcnQoKTsgLy8gZG9uJ3QgZm9yZ2V0IHRoaXNcbiAgICAgIGlmICghdGhpcy5oYXNTdGFydGVkKVxuICAgICAgICB0aGlzLmluaXQoKTtcbiAgICAgIHRoaXMuc2hvdygpO1xuICAgICAgLy9YTU1cbiAgICAgIHRoaXMuZGVjb2RlciA9IG5ldyBEZWNvZGFnZSgpO1xuICAgICAgdGhpcy5kZWNvZGVyMiA9IG5ldyBEZWNvZGFnZTIoKTtcbiAgICAgIHRoaXMuZGVjb2RlcjMgPSBuZXcgRGVjb2RhZ2UzKCk7XG4gICAgfWVsc2V7XG4gICAgICAvL1BhcmFtw6h0cmUgaW5pdGlhdXhcbiAgICAgIHRoaXMuX2FkZEJvdWxlKDEwLDEwKTtcbiAgICAgIGRvY3VtZW50LmJvZHkuc3R5bGUub3ZlcmZsb3cgPSBcImhpZGRlblwiOyAgXG4gICAgICB0aGlzLmNlbnRyZVggPSB3aW5kb3cuaW5uZXJXaWR0aC8yO1xuICAgICAgdGhpcy50YWlsbGVFY3JhblggPSB3aW5kb3cuaW5uZXJXaWR0aDtcbiAgICAgIHRoaXMudGFpbGxlRWNyYW5ZID0gd2luZG93LmlubmVySGVpZ2h0O1xuICAgICAgdGhpcy5jZW50cmVFY3JhblggPSB0aGlzLnRhaWxsZUVjcmFuWC8yO1xuICAgICAgdGhpcy5jZW50cmVFY3JhblkgPSB0aGlzLnRhaWxsZUVjcmFuWS8yO1xuICAgICAgc2V0VGltZW91dCgoKSA9PiB7dGhpcy5fbXlMaXN0ZW5lcigxMDApfSwxMDApO1xuICAgICAgdGhpcy5jZW50cmVZID0gd2luZG93LmlubmVySGVpZ2h0LzI7XG5cbiAgICAgIC8vRGV0ZWN0ZSBsZXMgZWxlbWVudHMgU1ZHXG4gICAgICB0aGlzLmxpc3RlRWxsaXBzZSA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdlbGxpcHNlJyk7XG4gICAgICB0aGlzLmxpc3RlUmVjdCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdyZWN0Jyk7XG4gICAgICB0aGlzLnRvdGFsRWxlbWVudHMgPSB0aGlzLmxpc3RlRWxsaXBzZS5sZW5ndGggKyB0aGlzLmxpc3RlUmVjdC5sZW5ndGg7XG4gICAgICB0aGlzLmxpc3RlVGV4dCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCd0ZXh0Jyk7XG4gICAgICB0aGlzLmxpc3RlRm9ybWUgPSBbXTtcbiAgICAgIHRoaXMubGlzdGVSZWN0Q2hlbWluMSA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2NoZW1pbjAnKTtcbiAgICAgIHRoaXMubGlzdGVSZWN0Q2hlbWluMiA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2NoZW1pbjEnKTtcbiAgICAgIHRoaXMubGlzdGVSZWN0Q2hlbWluMyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2NoZW1pbjInKTtcbiAgICAgIHRoaXMubGlzdGVSZWN0Rm9ybWUxID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnZm9ybWUxJyk7XG4gICAgICB0aGlzLmxpc3RlUmVjdEZvcm1lMiA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2Zvcm1lMicpO1xuICAgICAgdGhpcy5saXN0ZVJlY3RGb3JtZTMgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdmb3JtZTMnKTtcbiAgICAgIHRoaXMubGlzdGVSZWN0Rm9ybWU0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnZm9ybWU0Jyk7XG5cbiAgICAgIC8vUmVtcGxhY2UgbGVzIF90ZXh0ZXMgcGFyIGxldXIgZm9ybWUuXG4gICAgICB0aGlzLl9yZW1wbGFjZUZvcm1lKCk7IFxuXG4gICAgICAvL0Nyw6llIGwndW5pdmVycyBzb25vcmVcbiAgICAgIHRoaXMuX2NyZWF0aW9uVW5pdmVyc1Nvbm9yZSgpO1xuXG4gICAgICAvL0luaXRpc2FsaXNhdGlvblxuICAgICAgdGhpcy5tYXhDb3VudFVwZGF0ZSA9IDQ7XG4gICAgICB0aGlzLmNvdW50VXBkYXRlID0gdGhpcy5tYXhDb3VudFVwZGF0ZSArIDE7IC8vIEluaXRpYWxpc2F0aW9uXG4gICAgICB0aGlzLnZpc3VhbGlzYXRpb25Gb3JtZUNoZW1pbiA9IGZhbHNlO1xuICAgICAgdGhpcy52aXN1YWxpc2F0aW9uQm91bGU9dHJ1ZTsgLy8gVmlzdWFsaXNhdGlvbiBkZSBsYSBib3VsZVxuICAgICAgaWYoIXRoaXMudmlzdWFsaXNhdGlvbkJvdWxlKXtcbiAgICAgICAgdGhpcy52aWV3LiRlbC5xdWVyeVNlbGVjdG9yKCcjYm91bGUnKS5zdHlsZS5kaXNwbGF5PSdub25lJztcbiAgICAgIH1cbiAgICAgIHRoaXMudmlzdWFsaXNhdGlvbkZvcm1lPWZhbHNlOyAvLyBWaXN1YWxpc2F0aW9uIGRlcyBmb3JtZXMgU1ZHXG4gICAgICBpZighdGhpcy52aXN1YWxpc2F0aW9uRm9ybWUpe1xuICAgICAgICBmb3IobGV0IGkgPSAwO2k8dGhpcy5saXN0ZUVsbGlwc2UubGVuZ3RoO2krKyl7XG4gICAgICAgICAgdGhpcy5saXN0ZUVsbGlwc2VbaV0uc3R5bGUuZGlzcGxheT0nbm9uZSc7XG4gICAgICAgIH1cbiAgICAgICAgZm9yKGxldCBpID0gMDtpPHRoaXMubGlzdGVSZWN0Lmxlbmd0aDtpKyspe1xuICAgICAgICAgIHRoaXMubGlzdGVSZWN0W2ldLnN0eWxlLmRpc3BsYXk9J25vbmUnO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vUG91ciBlbmVsZXZlciBsZXMgYm9yZHVyZXMgOlxuICAgICAgLy8gaWYodGhpcy52aXN1YWxpc2F0aW9uRm9ybWUpe1xuICAgICAgLy8gICBmb3IobGV0IGkgPSAwO2k8dGhpcy5saXN0ZUVsbGlwc2UubGVuZ3RoO2krKyl7XG4gICAgICAvLyAgICAgdGhpcy5saXN0ZUVsbGlwc2VbaV0uc2V0QXR0cmlidXRlKCdzdHJva2Utd2lkdGgnLDApO1xuICAgICAgLy8gICB9XG4gICAgICAvLyAgIGZvcihsZXQgaSA9IDA7aTx0aGlzLmxpc3RlUmVjdC5sZW5ndGg7aSsrKXtcbiAgICAgIC8vICAgICB0aGlzLmxpc3RlUmVjdFtpXS5zZXRBdHRyaWJ1dGUoJ3N0cm9rZS13aWR0aCcsMCk7XG4gICAgICAvLyAgIH1cbiAgICAgIC8vIH0gICBcblxuICAgICAgLy9WYXJpYWJsZXMgXG4gICAgICB0aGlzLm1pcnJvckJvdWxlWCA9IDEwO1xuICAgICAgdGhpcy5taXJyb3JCb3VsZVkgPSAxMDtcbiAgICAgIHRoaXMub2Zmc2V0WCA9IDA7IC8vIEluaXRpc2FsaXNhdGlvbiBkdSBvZmZzZXRcbiAgICAgIHRoaXMub2Zmc2V0WSA9IDBcbiAgICAgIHRoaXMuU1ZHX01BWF9YID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3N2ZycpWzBdLmdldEF0dHJpYnV0ZSgnd2lkdGgnKTtcbiAgICAgIHRoaXMuU1ZHX01BWF9ZID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3N2ZycpWzBdLmdldEF0dHJpYnV0ZSgnaGVpZ2h0Jyk7XG5cbiAgICAgIC8vIEdlc3Rpb24gZGUgbCdvcmllbnRhdGlvblxuICAgICAgdGhpcy50YWJJbjtcbiAgICAgIGlmICh0aGlzLm1vdGlvbklucHV0LmlzQXZhaWxhYmxlKCdvcmllbnRhdGlvbicpKSB7XG4gICAgICAgIHRoaXMubW90aW9uSW5wdXQuYWRkTGlzdGVuZXIoJ29yaWVudGF0aW9uJywgKGRhdGEpID0+IHtcbiAgICAgICAgICBjb25zdCBuZXdWYWx1ZXMgPSB0aGlzLl90b01vdmUoZGF0YVsyXSxkYXRhWzFdLTI1KTtcbiAgICAgICAgICB0aGlzLnRhYkluID0gdGhpcy5faXNJbihuZXdWYWx1ZXNbMF0sbmV3VmFsdWVzWzFdKTtcbiAgICAgICAgICB0aGlzLnRhYkNoZW1pbiA9IHRoaXMuX2lzSW5DaGVtaW4obmV3VmFsdWVzWzBdLG5ld1ZhbHVlc1sxXSk7XG4gICAgICAgICAgLy8gaWYodGhpcy5tb2RlbE9rJiYhKHRoaXMudGFiQ2hlbWluWzBdJiZ0aGlzLnRhYkNoZW1pblsxXSYmdGhpcy50YWJDaGVtaW5bMl0pKXtcbiAgICAgICAgICAvLyAgIHRoaXMuZGVjb2RlcjEucmVzZXQoKTtcbiAgICAgICAgICAvLyAgIHRoaXMuZGVjb2RlcjIucmVzZXQoKTtcbiAgICAgICAgICAvLyB9XG4gICAgICAgICAgdGhpcy50YWJGb3JtZSA9IHRoaXMuX2lzSW5Gb3JtZShuZXdWYWx1ZXNbMF0sIG5ld1ZhbHVlc1sxXSk7XG4gICAgICAgICAgaWYodGhpcy5tb2RlbE9rJiYhKHRoaXMudGFiRm9ybWVbMF0mJnRoaXMudGFiRm9ybWVbMV0mJnRoaXMudGFiRm9ybWVbMl0mJnRoaXMudGFiRm9ybWVbM10pKXtcbiAgICAgICAgICAgIHRoaXMuZGVjb2Rlci5yZXNldCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZih0aGlzLmNvdW50VXBkYXRlPnRoaXMubWF4Q291bnRVcGRhdGUpe1xuICAgICAgICAgICAgdGhpcy5fdXBkYXRlR2Fpbih0aGlzLnRhYkluKTtcbiAgICAgICAgICAgIHRoaXMuY291bnRVcGRhdGUgPSAwO1xuICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgdGhpcy5jb3VudFVwZGF0ZSsrO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLl9tb3ZlU2NyZWVuVG8obmV3VmFsdWVzWzBdLG5ld1ZhbHVlc1sxXSwwLjA4KTtcbiAgICAgICAgICAvLyBYTU1cbiAgICAgICAgICBpZih0aGlzLm1vZGVsT0spe1xuICAgICAgICAgICAgdGhpcy5kZWNvZGVyLnByb2Nlc3MobmV3VmFsdWVzWzBdLG5ld1ZhbHVlc1sxXSk7XG4gICAgICAgICAgICB0aGlzLmRlY29kZXIyLnByb2Nlc3MobmV3VmFsdWVzWzBdLG5ld1ZhbHVlc1sxXSk7XG4gICAgICAgICAgICB0aGlzLmRlY29kZXIzLnByb2Nlc3MobmV3VmFsdWVzWzBdLG5ld1ZhbHVlc1sxXSk7XG4gICAgICAgICAgICB0aGlzLl9wcm9jZXNzUHJvYmEoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJPcmllbnRhdGlvbiBub24gZGlzcG9uaWJsZVwiKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuLyogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tTU9VVkVNRU5UIERFIEwgRUNSQU4gLyBJTUFHRVMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gKi9cblxuICAvKiBBam91dGUgbGEgYm91bGUgYXUgZm9uZCAqL1xuICBfYWRkQm91bGUoeCx5KXtcbiAgICBjb25zdCBlbGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKCdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycsJ2NpcmNsZScpO1xuICAgIGVsZW0uc2V0QXR0cmlidXRlTlMobnVsbCxcImN4XCIseCk7XG4gICAgZWxlbS5zZXRBdHRyaWJ1dGVOUyhudWxsLFwiY3lcIix5KTtcbiAgICBlbGVtLnNldEF0dHJpYnV0ZU5TKG51bGwsXCJyXCIsMTApO1xuICAgIGVsZW0uc2V0QXR0cmlidXRlTlMobnVsbCxcInN0cm9rZVwiLCd3aGl0ZScpO1xuICAgIGVsZW0uc2V0QXR0cmlidXRlTlMobnVsbCxcInN0cm9rZS13aWR0aFwiLDMpO1xuICAgIGVsZW0uc2V0QXR0cmlidXRlTlMobnVsbCxcImZpbGxcIiwnYmxhY2snKTtcbiAgICBlbGVtLnNldEF0dHJpYnV0ZU5TKG51bGwsXCJpZFwiLCdib3VsZScpO1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzdmcnKVswXS5hcHBlbmRDaGlsZChlbGVtKTtcbiAgfVxuXG4gIC8qIEFqb3V0ZSBsZSBmb25kICovXG4gIF9hZGRGb25kKGZvbmQpe1xuICAgIC8vIE9uIHBhcnNlIGxlIGZpY2hpZXIgU1ZHIGVuIERPTVxuICAgIGNvbnN0IHBhcnNlciA9IG5ldyBET01QYXJzZXIoKTtcbiAgICBsZXQgZm9uZFhtbCA9IHBhcnNlci5wYXJzZUZyb21TdHJpbmcoZm9uZCwnYXBwbGljYXRpb24veG1sJyk7XG4gICAgZm9uZFhtbCA9IGZvbmRYbWwuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3N2ZycpWzBdO1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdleHBlcmllbmNlJykuYXBwZW5kQ2hpbGQoZm9uZFhtbCk7XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3N2ZycpWzBdLnNldEF0dHJpYnV0ZSgnaWQnLCdzdmdFbGVtZW50JylcbiAgICB0aGlzLl9zdXBwcmltZXJSZWN0Q2hlbWluKCk7XG4gICAgdGhpcy5zdGFydE9LID0gdHJ1ZTtcbiAgICB0aGlzLnN0YXJ0KCk7XG4gIH1cblxuICAvKiBTdXBwcmltZSBsZXMgcmVjdGFuZ2xlcyBxdWkgc3VpdmVudCBsZXMgY2hlbWlucyAqL1xuICBfc3VwcHJpbWVyUmVjdENoZW1pbigpe1xuICAgIGxldCB0YWIgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdjaGVtaW4wJyk7XG4gICAgaWYoIXRoaXMudmlzdWFsaXNhdGlvbkZvcm1lQ2hlbWluKXtcbiAgICAgIGZvcihsZXQgaSA9MCA7aTx0YWIubGVuZ3RoO2krKyl7XG4gICAgICAgIHRhYltpXS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgfVxuXG4gICAgICB0YWIgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdjaGVtaW4xJyk7XG4gICAgICBmb3IobGV0IGkgPTAgO2k8dGFiLmxlbmd0aDtpKyspe1xuICAgICAgICB0YWJbaV0uc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgIH1cblxuICAgICAgdGFiID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnY2hlbWluMicpO1xuICAgICAgZm9yKGxldCBpID0wIDtpPHRhYi5sZW5ndGg7aSsrKXtcbiAgICAgICAgdGFiW2ldLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgX2FkZEZvcm1lKGZvcm1lLHgseSl7XG4gICAgLy8gT24gcGFyc2UgbGUgZmljaGllciBTVkcgZW4gRE9NXG4gICAgY29uc3QgcGFyc2VyID0gbmV3IERPTVBhcnNlcigpO1xuICAgIGxldCBmb3JtZVhtbCA9IHBhcnNlci5wYXJzZUZyb21TdHJpbmcoZm9ybWUsJ2FwcGxpY2F0aW9uL3htbCcpO1xuICAgIGZvcm1lWG1sID0gZm9ybWVYbWwuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2cnKVswXTtcbiAgICBsZXQgYm91bGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYm91bGUnKTtcbiAgICBjb25zdCBmb3JtZVhtbFRhYiA9IGZvcm1lWG1sLmNoaWxkTm9kZXM7XG4gICAgZm9yKGxldCBpID0gMDsgaTxmb3JtZVhtbFRhYi5sZW5ndGg7aSsrKXtcbiAgICAgIGlmKGZvcm1lWG1sVGFiW2ldLm5vZGVOYW1lID09ICdwYXRoJyl7XG4gICAgICAgIGNvbnN0IG5ld05vZGUgPSBib3VsZS5wYXJlbnROb2RlLmluc2VydEJlZm9yZShmb3JtZVhtbFRhYltpXSxib3VsZSk7XG4gICAgICAgIHRoaXMubGlzdGVGb3JtZVt0aGlzLmxpc3RlRm9ybWUubGVuZ3RoXSA9IG5ld05vZGUuc2V0QXR0cmlidXRlKCd0cmFuc2Zvcm0nLCd0cmFuc2xhdGUoJyt4KycgJyt5KycpJyk7XG4gICAgICB9XG4gICAgfSBcbiAgfVxuXG4gIC8qIENhbGxiYWNrIG9yaWVudGF0aW9uTW90aW9uIC8gTW91dmVtZW50IGRlIGxhIGJvdWxlKi9cbiAgX3RvTW92ZSh2YWx1ZVgsdmFsdWVZKXtcbiAgICBjb25zdCBvYmogPSB0aGlzLnZpZXcuJGVsLnF1ZXJ5U2VsZWN0b3IoJyNib3VsZScpO1xuICAgIGxldCBuZXdYO1xuICAgIGxldCBuZXdZO1xuICAgIGxldCBhY3R1ID0gdGhpcy5taXJyb3JCb3VsZVgrdmFsdWVYKjAuMztcbiAgICBpZihhY3R1PHRoaXMub2Zmc2V0WCl7XG4gICAgICBhY3R1PSB0aGlzLm9mZnNldFggO1xuICAgIH1lbHNlIGlmKGFjdHUgPih0aGlzLnRhaWxsZUVjcmFuWCt0aGlzLm9mZnNldFgpKXtcbiAgICAgIGFjdHU9IHRoaXMudGFpbGxlRWNyYW5YK3RoaXMub2Zmc2V0WFxuICAgIH1cbiAgICBpZih0aGlzLnZpc3VhbGlzYXRpb25Cb3VsZSl7XG4gICAgICBvYmouc2V0QXR0cmlidXRlKCdjeCcsIGFjdHUpO1xuICAgIH1cbiAgICB0aGlzLm1pcnJvckJvdWxlWCA9IGFjdHU7XG4gICAgbmV3WD1hY3R1O1xuICAgIGFjdHUgPSB0aGlzLm1pcnJvckJvdWxlWSt2YWx1ZVkqMC4zO1xuICAgIGlmKGFjdHU8KHRoaXMub2Zmc2V0WSkpe1xuICAgICAgYWN0dT0gdGhpcy5vZmZzZXRZO1xuICAgIH1cbiAgICBpZihhY3R1ID4gKHRoaXMudGFpbGxlRWNyYW5ZK3RoaXMub2Zmc2V0WSkpe1xuICAgICAgYWN0dSA9IHRoaXMudGFpbGxlRWNyYW5ZK3RoaXMub2Zmc2V0WTtcbiAgICB9XG4gICAgaWYodGhpcy52aXN1YWxpc2F0aW9uQm91bGUpe1xuICAgICAgb2JqLnNldEF0dHJpYnV0ZSgnY3knLCBhY3R1KTtcbiAgICB9XG4gICAgdGhpcy5taXJyb3JCb3VsZVk9IGFjdHU7XG4gICAgbmV3WT1hY3R1O1xuICAgIHJldHVybiBbbmV3WCxuZXdZXTtcbiAgfVxuXG4gIC8vIETDqXBsYWNlIGwnw6ljcmFuIGRhbnMgbGEgbWFwXG4gIF9tb3ZlU2NyZWVuVG8oeCx5LGZvcmNlPTEpe1xuICAgIGxldCBkaXN0YW5jZVggPSAoeC10aGlzLm9mZnNldFgpLXRoaXMuY2VudHJlRWNyYW5YO1xuICAgIGxldCBuZWdYID0gZmFsc2U7XG4gICAgbGV0IGluZGljZVBvd1ggPSAzO1xuICAgIGxldCBpbmRpY2VQb3dZID0gMztcbiAgICBpZihkaXN0YW5jZVg8MCl7XG4gICAgICBuZWdYID0gdHJ1ZTtcbiAgICB9XG4gICAgZGlzdGFuY2VYID0gTWF0aC5wb3coKE1hdGguYWJzKGRpc3RhbmNlWC90aGlzLmNlbnRyZUVjcmFuWCkpLGluZGljZVBvd1gpKnRoaXMuY2VudHJlRWNyYW5YOyBcbiAgICBpZihuZWdYKXtcbiAgICAgIGRpc3RhbmNlWCAqPSAtMTtcbiAgICB9XG4gICAgaWYodGhpcy5vZmZzZXRYKyhkaXN0YW5jZVgqZm9yY2UpPj0wJiYodGhpcy5vZmZzZXRYKyhkaXN0YW5jZVgqZm9yY2UpPD10aGlzLlNWR19NQVhfWC10aGlzLnRhaWxsZUVjcmFuWCkpe1xuICAgICAgdGhpcy5vZmZzZXRYICs9IChkaXN0YW5jZVgqZm9yY2UpO1xuICAgIH1cblxuICAgIGxldCBkaXN0YW5jZVkgPSAoeS10aGlzLm9mZnNldFkpLXRoaXMuY2VudHJlRWNyYW5ZO1xuICAgIGxldCBuZWdZID0gZmFsc2U7XG4gICAgaWYoZGlzdGFuY2VZPDApe1xuICAgICAgbmVnWSA9IHRydWU7XG4gICAgfVxuICAgIGRpc3RhbmNlWSA9IE1hdGgucG93KChNYXRoLmFicyhkaXN0YW5jZVkvdGhpcy5jZW50cmVFY3JhblkpKSxpbmRpY2VQb3dZKSp0aGlzLmNlbnRyZUVjcmFuWTtcbiAgICBpZihuZWdZKXtcbiAgICAgIGRpc3RhbmNlWSAqPSAtMTtcbiAgICB9XG4gICAgaWYoKHRoaXMub2Zmc2V0WSsoZGlzdGFuY2VZKmZvcmNlKT49MCkmJih0aGlzLm9mZnNldFkrKGRpc3RhbmNlWSpmb3JjZSk8PXRoaXMuU1ZHX01BWF9ZLXRoaXMudGFpbGxlRWNyYW5ZKSl7XG4gICAgICB0aGlzLm9mZnNldFkgKz0gKGRpc3RhbmNlWSpmb3JjZSk7XG4gICAgfVxuICAgIHdpbmRvdy5zY3JvbGwodGhpcy5vZmZzZXRYLHRoaXMub2Zmc2V0WSlcbiAgfVxuXG4gIF9teUxpc3RlbmVyKHRpbWUpe1xuICAgIHRoaXMudGFpbGxlRWNyYW5YID0gd2luZG93LmlubmVyV2lkdGg7XG4gICAgdGhpcy50YWlsbGVFY3JhblkgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG4gICAgc2V0VGltZW91dCh0aGlzLl9teUxpc3RlbmVyLHRpbWUpO1xuICB9XG5cbiAgX3JlbXBsYWNlRm9ybWUoKXtcbiAgICBsZXQgbmV3TGlzdCA9IFtdO1xuICAgIGZvcihsZXQgaSA9IDA7IGkgPCB0aGlzLmxpc3RlVGV4dC5sZW5ndGg7IGkrKyl7XG4gICAgICBuZXdMaXN0W2ldPXRoaXMubGlzdGVUZXh0W2ldO1xuICAgIH1cbiAgICBmb3IobGV0IGkgPSAwOyBpIDwgbmV3TGlzdC5sZW5ndGg7IGkrKyl7XG4gICAgICBjb25zdCBub21FbGVtZW50ID0gbmV3TGlzdFtpXS5pbm5lckhUTUw7XG4gICAgICAgaWYobm9tRWxlbWVudC5zbGljZSgwLDEpPT0nXycpe1xuXG4gICAgICAgICBjb25zdCBub21Gb3JtZSA9IG5vbUVsZW1lbnQuc2xpY2UoMSxub21FbGVtZW50Lmxlbmd0aCk7XG4gICAgICAgICBjb25zdCB4ID0gbmV3TGlzdFtpXS5nZXRBdHRyaWJ1dGUoJ3gnKTtcbiAgICAgICAgIGNvbnN0IHkgPSBuZXdMaXN0W2ldLmdldEF0dHJpYnV0ZSgneScpO1xuICAgICAgICAgdGhpcy5zZW5kKCdkZW1hbmRlRm9ybWUnLG5vbUZvcm1lLHgseSk7XG4gICAgICAgICBjb25zdCBwYXJlbnQgPSBuZXdMaXN0W2ldLnBhcmVudE5vZGU7XG4gICAgICAgICBwYXJlbnQucmVtb3ZlQ2hpbGQobmV3TGlzdFtpXSk7XG4gICAgICAgICBjb25zdCBlbGVtcyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUobm9tRm9ybWUpO1xuICAgICAgICAgZm9yKGxldCBpID0gMDsgaTxlbGVtcy5sZW5ndGg7aSsrKXtcbiAgICAgICAgICAgIGVsZW1zW2ldLnN0eWxlLmRpc3BsYXk9J25vbmUnO1xuICAgICAgICAgfVxuICAgICAgIH1cbiAgICB9XG4gIH1cblxuLyogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tREVURVJNSU5BVElPTiBERVMgSU4vT1VUIERFUyBGT1JNRVMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gKi9cblxuICAvLyBGb25jdGlvbiBxdWkgcGVybWV0IGRlIGNvbm5hw650cmUgbCdlbnNlbWJsZSBkZXMgZmlndXJlcyBvw7kgbGUgcG9pbnQgc2Ugc2l0dWVcbiAgX2lzSW4oeCx5KXtcbiAgICBsZXQgdGFiID0gW107XG4gICAgbGV0IHJvdGF0ZUFuZ2xlO1xuICAgIGxldCBjZW50cmVSb3RhdGVYO1xuICAgIGxldCBjZW50cmVSb3RhdGVZO1xuICAgIGZvcihsZXQgaT0wO2k8dGhpcy5saXN0ZUVsbGlwc2UubGVuZ3RoO2krKyl7XG4gICAgICByb3RhdGVBbmdsZT0wO1xuICAgICAgY29uc3QgY2VudHJlWCA9IHRoaXMubGlzdGVFbGxpcHNlW2ldLmdldEF0dHJpYnV0ZSgnY3gnKTtcbiAgICAgIGNvbnN0IGNlbnRyZVkgPSB0aGlzLmxpc3RlRWxsaXBzZVtpXS5nZXRBdHRyaWJ1dGUoJ2N5Jyk7XG4gICAgICBjb25zdCByYXlvblggPSB0aGlzLmxpc3RlRWxsaXBzZVtpXS5nZXRBdHRyaWJ1dGUoJ3J4Jyk7XG4gICAgICBjb25zdCByYXlvblkgPSB0aGlzLmxpc3RlRWxsaXBzZVtpXS5nZXRBdHRyaWJ1dGUoJ3J5Jyk7XG4gICAgICBsZXQgdHJhbnMgPSB0aGlzLmxpc3RlRWxsaXBzZVtpXS5nZXRBdHRyaWJ1dGUoJ3RyYW5zZm9ybScpO1xuICAgICAgaWYoL3JvdGF0ZS8udGVzdCh0cmFucykpe1xuICAgICAgICB0cmFucyA9IHRyYW5zLnNsaWNlKDcsdHJhbnMubGVuZ3RoKTtcbiAgICAgICAgY2VudHJlUm90YXRlWCA9IHBhcnNlRmxvYXQodHJhbnMuc3BsaXQoXCIgXCIpWzFdKTtcbiAgICAgICAgY2VudHJlUm90YXRlWSA9IHBhcnNlRmxvYXQodHJhbnMuc3BsaXQoXCIsXCIpWzFdLnJlcGxhY2UoXCIpXCIsXCJcIikpO1xuICAgICAgICByb3RhdGVBbmdsZSA9IHBhcnNlRmxvYXQodHJhbnMuc3BsaXQoXCIgXCIpWzBdKTtcbiAgICAgIH1cbiAgICAgIHRhYlt0YWIubGVuZ3RoXT10aGlzLl9pc0luRWxsaXBzZShwYXJzZUZsb2F0KGNlbnRyZVgpLHBhcnNlRmxvYXQoY2VudHJlWSkscGFyc2VGbG9hdChyYXlvblgpLHBhcnNlRmxvYXQocmF5b25ZKSx4LHkscm90YXRlQW5nbGUsY2VudHJlUm90YXRlWCxjZW50cmVSb3RhdGVZKTsgICAgIFxuICAgIH1cbiAgICBmb3IobGV0IGk9MDtpPHRoaXMubGlzdGVSZWN0Lmxlbmd0aDtpKyspe1xuICAgICAgcm90YXRlQW5nbGU9MDtcbiAgICAgIGNlbnRyZVJvdGF0ZVg9bnVsbDtcbiAgICAgIGNlbnRyZVJvdGF0ZVk9bnVsbDtcbiAgICAgIGNvbnN0IGhhdXRldXIgPSB0aGlzLmxpc3RlUmVjdFtpXS5nZXRBdHRyaWJ1dGUoJ3dpZHRoJyk7XG4gICAgICBjb25zdCBsYXJnZXVyID0gdGhpcy5saXN0ZVJlY3RbaV0uZ2V0QXR0cmlidXRlKCdoZWlnaHQnKTtcbiAgICAgIGNvbnN0IGxlZnQgPSB0aGlzLmxpc3RlUmVjdFtpXS5nZXRBdHRyaWJ1dGUoJ3gnKTtcbiAgICAgIGNvbnN0IHRvcCA9IHRoaXMubGlzdGVSZWN0W2ldLmdldEF0dHJpYnV0ZSgneScpO1xuICAgICAgbGV0IHRyYW5zID0gdGhpcy5saXN0ZVJlY3RbaV0uZ2V0QXR0cmlidXRlKCd0cmFuc2Zvcm0nKTtcbiAgICAgIGlmKC9yb3RhdGUvLnRlc3QodHJhbnMpKXtcbiAgICAgICAgdHJhbnMgPSB0cmFucy5zbGljZSg3LHRyYW5zLmxlbmd0aCk7XG4gICAgICAgIGNlbnRyZVJvdGF0ZVggPSBwYXJzZUZsb2F0KHRyYW5zLnNwbGl0KFwiIFwiKVsxXSk7XG4gICAgICAgIGNlbnRyZVJvdGF0ZVkgPSBwYXJzZUZsb2F0KHRyYW5zLnNwbGl0KFwiLFwiKVsxXS5yZXBsYWNlKFwiKVwiLFwiXCIpKTtcbiAgICAgICAgcm90YXRlQW5nbGUgPSBwYXJzZUZsb2F0KHRyYW5zLnNwbGl0KFwiIFwiKVswXSk7XG4gICAgICB9XG4gICAgICB0YWJbdGFiLmxlbmd0aF09dGhpcy5faXNJblJlY3QocGFyc2VGbG9hdChoYXV0ZXVyKSwgcGFyc2VGbG9hdChsYXJnZXVyKSwgcGFyc2VGbG9hdChsZWZ0KSwgcGFyc2VGbG9hdCh0b3ApLCB4LCB5LHJvdGF0ZUFuZ2xlLGNlbnRyZVJvdGF0ZVgsY2VudHJlUm90YXRlWSk7XG4gICAgfSAgXG4gICAgcmV0dXJuIHRhYjtcbiAgfVxuXG4gIC8vIEZvbmN0aW4gcXVpIGRpdCBkYW5zIHF1ZWwgY2hlbWluIG9uIHNlIHRyb3V2ZVxuICBfaXNJbkNoZW1pbih4LHkpe1xuXG4gICAgLy9WYXJpYWJsZXNcbiAgICBsZXQgcm90YXRlQW5nbGU7XG4gICAgbGV0IGNlbnRyZVJvdGF0ZVg7XG4gICAgbGV0IGNlbnRyZVJvdGF0ZVk7XG4gICAgbGV0IGhhdXRldXI7XG4gICAgbGV0IGxhcmdldXI7XG4gICAgbGV0IGxlZnQ7XG4gICAgbGV0IHRvcDtcbiAgICBsZXQgdHJhbnM7XG4gICAgbGV0IGkgPTA7XG5cbiAgICAvL0NIRU1JTiAxXG4gICAgbGV0IGNoZW1pbjEgPSBmYWxzZTtcbiAgICB3aGlsZSghY2hlbWluMSAmJiBpPHRoaXMubGlzdGVSZWN0Q2hlbWluMS5sZW5ndGgpe1xuICAgICAgcm90YXRlQW5nbGU9MDtcbiAgICAgIGNlbnRyZVJvdGF0ZVg9bnVsbDtcbiAgICAgIGNlbnRyZVJvdGF0ZVk9bnVsbDtcbiAgICAgIGhhdXRldXIgPSB0aGlzLmxpc3RlUmVjdENoZW1pbjFbaV0uZ2V0QXR0cmlidXRlKCd3aWR0aCcpO1xuICAgICAgbGFyZ2V1ciA9IHRoaXMubGlzdGVSZWN0Q2hlbWluMVtpXS5nZXRBdHRyaWJ1dGUoJ2hlaWdodCcpO1xuICAgICAgbGVmdCA9IHRoaXMubGlzdGVSZWN0Q2hlbWluMVtpXS5nZXRBdHRyaWJ1dGUoJ3gnKTtcbiAgICAgIHRvcCA9IHRoaXMubGlzdGVSZWN0Q2hlbWluMVtpXS5nZXRBdHRyaWJ1dGUoJ3knKTtcbiAgICAgIGxldCB0cmFucyA9IHRoaXMubGlzdGVSZWN0Q2hlbWluMVtpXS5nZXRBdHRyaWJ1dGUoJ3RyYW5zZm9ybScpO1xuICAgICAgaWYoL3JvdGF0ZS8udGVzdCh0cmFucykpe1xuICAgICAgICB0cmFucyA9IHRyYW5zLnNsaWNlKDcsdHJhbnMubGVuZ3RoKTtcbiAgICAgICAgY2VudHJlUm90YXRlWCA9IHBhcnNlRmxvYXQodHJhbnMuc3BsaXQoXCIgXCIpWzFdKTtcbiAgICAgICAgY2VudHJlUm90YXRlWSA9IHBhcnNlRmxvYXQodHJhbnMuc3BsaXQoXCIsXCIpWzFdLnJlcGxhY2UoXCIpXCIsXCJcIikpO1xuICAgICAgICByb3RhdGVBbmdsZSA9IHBhcnNlRmxvYXQodHJhbnMuc3BsaXQoXCIgXCIpWzBdKTtcbiAgICAgIH1cbiAgICAgIGNoZW1pbjEgPSB0aGlzLl9pc0luUmVjdChwYXJzZUZsb2F0KGhhdXRldXIpLCBwYXJzZUZsb2F0KGxhcmdldXIpLCBwYXJzZUZsb2F0KGxlZnQpLCBwYXJzZUZsb2F0KHRvcCksIHgsIHkscm90YXRlQW5nbGUsY2VudHJlUm90YXRlWCxjZW50cmVSb3RhdGVZKTtcbiAgICAgIGkrKztcbiAgICB9XG5cbiAgICAvL0NIRU1JTiAyXG4gICAgbGV0IGNoZW1pbjIgPSBmYWxzZTtcbiAgICBpID0wO1xuICAgIHdoaWxlKCFjaGVtaW4yICYmIGk8dGhpcy5saXN0ZVJlY3RDaGVtaW4yLmxlbmd0aCl7XG4gICAgICByb3RhdGVBbmdsZT0wO1xuICAgICAgY2VudHJlUm90YXRlWD1udWxsO1xuICAgICAgY2VudHJlUm90YXRlWT1udWxsO1xuICAgICAgaGF1dGV1ciA9IHRoaXMubGlzdGVSZWN0Q2hlbWluMltpXS5nZXRBdHRyaWJ1dGUoJ3dpZHRoJyk7XG4gICAgICBsYXJnZXVyID0gdGhpcy5saXN0ZVJlY3RDaGVtaW4yW2ldLmdldEF0dHJpYnV0ZSgnaGVpZ2h0Jyk7XG4gICAgICBsZWZ0ID0gdGhpcy5saXN0ZVJlY3RDaGVtaW4yW2ldLmdldEF0dHJpYnV0ZSgneCcpO1xuICAgICAgdG9wID0gdGhpcy5saXN0ZVJlY3RDaGVtaW4yW2ldLmdldEF0dHJpYnV0ZSgneScpO1xuICAgICAgdHJhbnMgPSB0aGlzLmxpc3RlUmVjdENoZW1pbjJbaV0uZ2V0QXR0cmlidXRlKCd0cmFuc2Zvcm0nKTtcbiAgICAgIGlmKC9yb3RhdGUvLnRlc3QodHJhbnMpKXtcbiAgICAgICAgdHJhbnMgPSB0cmFucy5zbGljZSg3LHRyYW5zLmxlbmd0aCk7XG4gICAgICAgIGNlbnRyZVJvdGF0ZVggPSBwYXJzZUZsb2F0KHRyYW5zLnNwbGl0KFwiIFwiKVsxXSk7XG4gICAgICAgIGNlbnRyZVJvdGF0ZVkgPSBwYXJzZUZsb2F0KHRyYW5zLnNwbGl0KFwiLFwiKVsxXS5yZXBsYWNlKFwiKVwiLFwiXCIpKTtcbiAgICAgICAgcm90YXRlQW5nbGUgPSBwYXJzZUZsb2F0KHRyYW5zLnNwbGl0KFwiIFwiKVswXSk7XG4gICAgICB9XG4gICAgICBjaGVtaW4yID0gdGhpcy5faXNJblJlY3QocGFyc2VGbG9hdChoYXV0ZXVyKSwgcGFyc2VGbG9hdChsYXJnZXVyKSwgcGFyc2VGbG9hdChsZWZ0KSwgcGFyc2VGbG9hdCh0b3ApLCB4LCB5LHJvdGF0ZUFuZ2xlLGNlbnRyZVJvdGF0ZVgsY2VudHJlUm90YXRlWSk7XG4gICAgICBpKys7XG4gICAgfVxuXG4gICAgLy9DSEVNSU4gM1xuICAgIGxldCBjaGVtaW4zID0gZmFsc2U7XG4gICAgaSA9MDtcbiAgICB3aGlsZSghY2hlbWluMyAmJiBpPHRoaXMubGlzdGVSZWN0Q2hlbWluMy5sZW5ndGgpe1xuICAgICAgcm90YXRlQW5nbGU9MDtcbiAgICAgIGNlbnRyZVJvdGF0ZVg9bnVsbDtcbiAgICAgIGNlbnRyZVJvdGF0ZVk9bnVsbDtcbiAgICAgIGhhdXRldXIgPSB0aGlzLmxpc3RlUmVjdENoZW1pbjNbaV0uZ2V0QXR0cmlidXRlKCd3aWR0aCcpO1xuICAgICAgbGFyZ2V1ciA9IHRoaXMubGlzdGVSZWN0Q2hlbWluM1tpXS5nZXRBdHRyaWJ1dGUoJ2hlaWdodCcpO1xuICAgICAgbGVmdCA9IHRoaXMubGlzdGVSZWN0Q2hlbWluM1tpXS5nZXRBdHRyaWJ1dGUoJ3gnKTtcbiAgICAgIHRvcCA9IHRoaXMubGlzdGVSZWN0Q2hlbWluM1tpXS5nZXRBdHRyaWJ1dGUoJ3knKTtcbiAgICAgIHRyYW5zID0gdGhpcy5saXN0ZVJlY3RDaGVtaW4zW2ldLmdldEF0dHJpYnV0ZSgndHJhbnNmb3JtJyk7XG4gICAgICBpZigvcm90YXRlLy50ZXN0KHRyYW5zKSl7XG4gICAgICAgIHRyYW5zID0gdHJhbnMuc2xpY2UoNyx0cmFucy5sZW5ndGgpO1xuICAgICAgICBjZW50cmVSb3RhdGVYID0gcGFyc2VGbG9hdCh0cmFucy5zcGxpdChcIiBcIilbMV0pO1xuICAgICAgICBjZW50cmVSb3RhdGVZID0gcGFyc2VGbG9hdCh0cmFucy5zcGxpdChcIixcIilbMV0ucmVwbGFjZShcIilcIixcIlwiKSk7XG4gICAgICAgIHJvdGF0ZUFuZ2xlID0gcGFyc2VGbG9hdCh0cmFucy5zcGxpdChcIiBcIilbMF0pO1xuICAgICAgfVxuICAgICAgY2hlbWluMyA9IHRoaXMuX2lzSW5SZWN0KHBhcnNlRmxvYXQoaGF1dGV1ciksIHBhcnNlRmxvYXQobGFyZ2V1ciksIHBhcnNlRmxvYXQobGVmdCksIHBhcnNlRmxvYXQodG9wKSwgeCwgeSxyb3RhdGVBbmdsZSxjZW50cmVSb3RhdGVYLGNlbnRyZVJvdGF0ZVkpO1xuICAgICAgaSsrO1xuICAgIH0gICAgICAgIFxuICAgIHJldHVybiBbY2hlbWluMSxjaGVtaW4yLGNoZW1pbjNdO1xuICB9XG5cbiAgX2lzSW5Gb3JtZSh4LHkpe1xuICAgIC8vVmFyaWFibGVzXG4gICAgbGV0IHJvdGF0ZUFuZ2xlO1xuICAgIGxldCBjZW50cmVSb3RhdGVYO1xuICAgIGxldCBjZW50cmVSb3RhdGVZO1xuICAgIGxldCBoYXV0ZXVyO1xuICAgIGxldCBsYXJnZXVyO1xuICAgIGxldCBsZWZ0O1xuICAgIGxldCB0b3A7XG4gICAgbGV0IHRyYW5zO1xuICAgIGxldCBpID0wO1xuXG4gICAgLy9GT1JNRSAxXG4gICAgbGV0IGZvcm1lMSA9IGZhbHNlO1xuICAgIHdoaWxlKCFmb3JtZTEgJiYgaTx0aGlzLmxpc3RlUmVjdEZvcm1lMS5sZW5ndGgpe1xuICAgICAgcm90YXRlQW5nbGU9MDtcbiAgICAgIGNlbnRyZVJvdGF0ZVg9bnVsbDtcbiAgICAgIGNlbnRyZVJvdGF0ZVk9bnVsbDtcbiAgICAgIGhhdXRldXIgPSB0aGlzLmxpc3RlUmVjdEZvcm1lMVtpXS5nZXRBdHRyaWJ1dGUoJ3dpZHRoJyk7XG4gICAgICBsYXJnZXVyID0gdGhpcy5saXN0ZVJlY3RGb3JtZTFbaV0uZ2V0QXR0cmlidXRlKCdoZWlnaHQnKTtcbiAgICAgIGxlZnQgPSB0aGlzLmxpc3RlUmVjdEZvcm1lMVtpXS5nZXRBdHRyaWJ1dGUoJ3gnKTtcbiAgICAgIHRvcCA9IHRoaXMubGlzdGVSZWN0Rm9ybWUxW2ldLmdldEF0dHJpYnV0ZSgneScpO1xuICAgICAgbGV0IHRyYW5zID0gdGhpcy5saXN0ZVJlY3RGb3JtZTFbaV0uZ2V0QXR0cmlidXRlKCd0cmFuc2Zvcm0nKTtcbiAgICAgIGlmKC9yb3RhdGUvLnRlc3QodHJhbnMpKXtcbiAgICAgICAgdHJhbnMgPSB0cmFucy5zbGljZSg3LHRyYW5zLmxlbmd0aCk7XG4gICAgICAgIGNlbnRyZVJvdGF0ZVggPSBwYXJzZUZsb2F0KHRyYW5zLnNwbGl0KFwiIFwiKVsxXSk7XG4gICAgICAgIGNlbnRyZVJvdGF0ZVkgPSBwYXJzZUZsb2F0KHRyYW5zLnNwbGl0KFwiLFwiKVsxXS5yZXBsYWNlKFwiKVwiLFwiXCIpKTtcbiAgICAgICAgcm90YXRlQW5nbGUgPSBwYXJzZUZsb2F0KHRyYW5zLnNwbGl0KFwiIFwiKVswXSk7XG4gICAgICB9XG4gICAgICBmb3JtZTEgPSB0aGlzLl9pc0luUmVjdChwYXJzZUZsb2F0KGhhdXRldXIpLCBwYXJzZUZsb2F0KGxhcmdldXIpLCBwYXJzZUZsb2F0KGxlZnQpLCBwYXJzZUZsb2F0KHRvcCksIHgsIHkscm90YXRlQW5nbGUsY2VudHJlUm90YXRlWCxjZW50cmVSb3RhdGVZKTtcbiAgICAgIGkrKztcbiAgICB9XG5cbiAgICAvL0ZPUk1FIDJcbiAgICBpID0wO1xuICAgIGxldCBmb3JtZTIgPSBmYWxzZTtcbiAgICB3aGlsZSghZm9ybWUyICYmIGk8dGhpcy5saXN0ZVJlY3RGb3JtZTIubGVuZ3RoKXtcbiAgICAgIHJvdGF0ZUFuZ2xlPTA7XG4gICAgICBjZW50cmVSb3RhdGVYPW51bGw7XG4gICAgICBjZW50cmVSb3RhdGVZPW51bGw7XG4gICAgICBoYXV0ZXVyID0gdGhpcy5saXN0ZVJlY3RGb3JtZTJbaV0uZ2V0QXR0cmlidXRlKCd3aWR0aCcpO1xuICAgICAgbGFyZ2V1ciA9IHRoaXMubGlzdGVSZWN0Rm9ybWUyW2ldLmdldEF0dHJpYnV0ZSgnaGVpZ2h0Jyk7XG4gICAgICBsZWZ0ID0gdGhpcy5saXN0ZVJlY3RGb3JtZTJbaV0uZ2V0QXR0cmlidXRlKCd4Jyk7XG4gICAgICB0b3AgPSB0aGlzLmxpc3RlUmVjdEZvcm1lMltpXS5nZXRBdHRyaWJ1dGUoJ3knKTtcbiAgICAgIGxldCB0cmFucyA9IHRoaXMubGlzdGVSZWN0Rm9ybWUyW2ldLmdldEF0dHJpYnV0ZSgndHJhbnNmb3JtJyk7XG4gICAgICBpZigvcm90YXRlLy50ZXN0KHRyYW5zKSl7XG4gICAgICAgIHRyYW5zID0gdHJhbnMuc2xpY2UoNyx0cmFucy5sZW5ndGgpO1xuICAgICAgICBjZW50cmVSb3RhdGVYID0gcGFyc2VGbG9hdCh0cmFucy5zcGxpdChcIiBcIilbMV0pO1xuICAgICAgICBjZW50cmVSb3RhdGVZID0gcGFyc2VGbG9hdCh0cmFucy5zcGxpdChcIixcIilbMV0ucmVwbGFjZShcIilcIixcIlwiKSk7XG4gICAgICAgIHJvdGF0ZUFuZ2xlID0gcGFyc2VGbG9hdCh0cmFucy5zcGxpdChcIiBcIilbMF0pO1xuICAgICAgfVxuICAgICAgZm9ybWUyID0gdGhpcy5faXNJblJlY3QocGFyc2VGbG9hdChoYXV0ZXVyKSwgcGFyc2VGbG9hdChsYXJnZXVyKSwgcGFyc2VGbG9hdChsZWZ0KSwgcGFyc2VGbG9hdCh0b3ApLCB4LCB5LHJvdGF0ZUFuZ2xlLGNlbnRyZVJvdGF0ZVgsY2VudHJlUm90YXRlWSk7XG4gICAgICBpKys7XG4gICAgfVxuXG4gICAgLy9GT1JNRSAzXG4gICAgaSA9MDtcbiAgICBsZXQgZm9ybWUzID0gZmFsc2U7XG4gICAgd2hpbGUoIWZvcm1lMiAmJiBpPHRoaXMubGlzdGVSZWN0Rm9ybWUzLmxlbmd0aCl7XG4gICAgICByb3RhdGVBbmdsZT0wO1xuICAgICAgY2VudHJlUm90YXRlWD1udWxsO1xuICAgICAgY2VudHJlUm90YXRlWT1udWxsO1xuICAgICAgaGF1dGV1ciA9IHRoaXMubGlzdGVSZWN0Rm9ybWUzW2ldLmdldEF0dHJpYnV0ZSgnd2lkdGgnKTtcbiAgICAgIGxhcmdldXIgPSB0aGlzLmxpc3RlUmVjdEZvcm1lM1tpXS5nZXRBdHRyaWJ1dGUoJ2hlaWdodCcpO1xuICAgICAgbGVmdCA9IHRoaXMubGlzdGVSZWN0Rm9ybWUzW2ldLmdldEF0dHJpYnV0ZSgneCcpO1xuICAgICAgdG9wID0gdGhpcy5saXN0ZVJlY3RGb3JtZTNbaV0uZ2V0QXR0cmlidXRlKCd5Jyk7XG4gICAgICBsZXQgdHJhbnMgPSB0aGlzLmxpc3RlUmVjdEZvcm1lM1tpXS5nZXRBdHRyaWJ1dGUoJ3RyYW5zZm9ybScpO1xuICAgICAgaWYoL3JvdGF0ZS8udGVzdCh0cmFucykpe1xuICAgICAgICB0cmFucyA9IHRyYW5zLnNsaWNlKDcsdHJhbnMubGVuZ3RoKTtcbiAgICAgICAgY2VudHJlUm90YXRlWCA9IHBhcnNlRmxvYXQodHJhbnMuc3BsaXQoXCIgXCIpWzFdKTtcbiAgICAgICAgY2VudHJlUm90YXRlWSA9IHBhcnNlRmxvYXQodHJhbnMuc3BsaXQoXCIsXCIpWzFdLnJlcGxhY2UoXCIpXCIsXCJcIikpO1xuICAgICAgICByb3RhdGVBbmdsZSA9IHBhcnNlRmxvYXQodHJhbnMuc3BsaXQoXCIgXCIpWzBdKTtcbiAgICAgIH1cbiAgICAgIGZvcm1lMyA9IHRoaXMuX2lzSW5SZWN0KHBhcnNlRmxvYXQoaGF1dGV1ciksIHBhcnNlRmxvYXQobGFyZ2V1ciksIHBhcnNlRmxvYXQobGVmdCksIHBhcnNlRmxvYXQodG9wKSwgeCwgeSxyb3RhdGVBbmdsZSxjZW50cmVSb3RhdGVYLGNlbnRyZVJvdGF0ZVkpO1xuICAgICAgaSsrO1xuICAgIH1cblxuICAgIC8vRk9STUUgNFxuICAgIGkgPTA7XG4gICAgbGV0IGZvcm1lNCA9IGZhbHNlO1xuICAgIHdoaWxlKCFmb3JtZTIgJiYgaTx0aGlzLmxpc3RlUmVjdEZvcm1lNC5sZW5ndGgpe1xuICAgICAgcm90YXRlQW5nbGU9MDtcbiAgICAgIGNlbnRyZVJvdGF0ZVg9bnVsbDtcbiAgICAgIGNlbnRyZVJvdGF0ZVk9bnVsbDtcbiAgICAgIGhhdXRldXIgPSB0aGlzLmxpc3RlUmVjdEZvcm1lNFtpXS5nZXRBdHRyaWJ1dGUoJ3dpZHRoJyk7XG4gICAgICBsYXJnZXVyID0gdGhpcy5saXN0ZVJlY3RGb3JtZTRbaV0uZ2V0QXR0cmlidXRlKCdoZWlnaHQnKTtcbiAgICAgIGxlZnQgPSB0aGlzLmxpc3RlUmVjdEZvcm1lNFtpXS5nZXRBdHRyaWJ1dGUoJ3gnKTtcbiAgICAgIHRvcCA9IHRoaXMubGlzdGVSZWN0Rm9ybWU0W2ldLmdldEF0dHJpYnV0ZSgneScpO1xuICAgICAgbGV0IHRyYW5zID0gdGhpcy5saXN0ZVJlY3RGb3JtZTRbaV0uZ2V0QXR0cmlidXRlKCd0cmFuc2Zvcm0nKTtcbiAgICAgIGlmKC9yb3RhdGUvLnRlc3QodHJhbnMpKXtcbiAgICAgICAgdHJhbnMgPSB0cmFucy5zbGljZSg3LHRyYW5zLmxlbmd0aCk7XG4gICAgICAgIGNlbnRyZVJvdGF0ZVggPSBwYXJzZUZsb2F0KHRyYW5zLnNwbGl0KFwiIFwiKVsxXSk7XG4gICAgICAgIGNlbnRyZVJvdGF0ZVkgPSBwYXJzZUZsb2F0KHRyYW5zLnNwbGl0KFwiLFwiKVsxXS5yZXBsYWNlKFwiKVwiLFwiXCIpKTtcbiAgICAgICAgcm90YXRlQW5nbGUgPSBwYXJzZUZsb2F0KHRyYW5zLnNwbGl0KFwiIFwiKVswXSk7XG4gICAgICB9XG4gICAgICBmb3JtZTQgPSB0aGlzLl9pc0luUmVjdChwYXJzZUZsb2F0KGhhdXRldXIpLCBwYXJzZUZsb2F0KGxhcmdldXIpLCBwYXJzZUZsb2F0KGxlZnQpLCBwYXJzZUZsb2F0KHRvcCksIHgsIHkscm90YXRlQW5nbGUsY2VudHJlUm90YXRlWCxjZW50cmVSb3RhdGVZKTtcbiAgICAgIGkrKztcbiAgICB9XG4gICAgcmV0dXJuIFtmb3JtZTEsZm9ybWUyLGZvcm1lMyxmb3JtZTRdO1xuXG4gIH1cblxuICAvLyBGb25jdGlvbiBxdWkgZGl0IHNpIHVuIHBvaW50IGVzdCBkYW5zIHVuIHJlY3RcbiAgIF9pc0luUmVjdChoYXV0ZXVyLGxhcmdldXIsbGVmdCx0b3AscG9pbnRYLHBvaW50WSxyb3RhdGVBbmdsZSxjZW50cmVSb3RhdGVYLGNlbnRyZVJvdGF0ZVkpe1xuICAgICAgLy9yb3RhdGlvblxuICAgICAgY29uc3QgbmV3UG9pbnQgPSB0aGlzLl9yb3RhdGVQb2ludChwb2ludFgscG9pbnRZLGNlbnRyZVJvdGF0ZVgsY2VudHJlUm90YXRlWSxyb3RhdGVBbmdsZSk7XG4gICAgICAvL0FwcGFydGVuYW5jZVxuICAgICAgaWYobmV3UG9pbnRbMF0gPiBwYXJzZUludChsZWZ0KSAmJiBuZXdQb2ludFswXSA8KHBhcnNlSW50KGxlZnQpK3BhcnNlSW50KGhhdXRldXIpKSAmJiBuZXdQb2ludFsxXSA+IHRvcCAmJiBuZXdQb2ludFsxXSA8IChwYXJzZUludCh0b3ApICsgcGFyc2VJbnQobGFyZ2V1cikpKXtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgfVxuXG4gIC8vIEZvbmN0aW9uIHF1aSBkaXQgc2kgdW4gcG9pbnQgZXN0IGRhbnMgdW5lIGVsbGlwc2VcbiAgX2lzSW5FbGxpcHNlKGNlbnRyZVgsY2VudHJlWSxyYXlvblgscmF5b25ZLHBvaW50WCxwb2ludFkscm90YXRlQW5nbGUsY2VudHJlUm90YXRlWCxjZW50cmVSb3RhdGVZKXtcbiAgICAvL3JvdGF0aW9uXG4gICAgY29uc3QgbmV3UG9pbnQgPSB0aGlzLl9yb3RhdGVQb2ludChwb2ludFgscG9pbnRZLGNlbnRyZVJvdGF0ZVgsY2VudHJlUm90YXRlWSxyb3RhdGVBbmdsZSk7XG4gICAgLy9BcHBhcnRlbmFuY2UgXG4gICAgbGV0IGEgPSByYXlvblg7OyAvLyBHcmFuZCByYXlvblxuICAgIGxldCBiID0gcmF5b25ZOyAvLyBQZXRpdCByYXlvblxuICAgIC8vY29uc3QgYyA9IE1hdGguc3FydCgoYSphKS0oYipiKSk7IC8vIERpc3RhbmNlIEZveWVyXG4gICAgY29uc3QgY2FsYyA9ICgoTWF0aC5wb3coKG5ld1BvaW50WzBdLWNlbnRyZVgpLDIpKS8oTWF0aC5wb3coYSwyKSkpKygoTWF0aC5wb3coKG5ld1BvaW50WzFdLWNlbnRyZVkpLDIpKS8oTWF0aC5wb3coYiwyKSkpO1xuICAgIGlmKGNhbGM8PTEpe1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfWVsc2V7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgLy8gRm9uY3Rpb24gcGVybWV0dGFudCBkZSByw6lheGVyIGxlIHBvaW50XG4gIF9yb3RhdGVQb2ludCh4LHksY2VudHJlWCxjZW50cmVZLGFuZ2xlKXtcbiAgICBsZXQgbmV3QW5nbGUgPSBhbmdsZSooMy4xNDE1OTI2NS8xODApOyAvLyBQYXNzYWdlIGVuIHJhZGlhblxuICAgIGxldCB0YWIgPSBbXTtcbiAgICBsZXQgbmV3WCA9ICh4LWNlbnRyZVgpKk1hdGguY29zKG5ld0FuZ2xlKSsoeS1jZW50cmVZKSpNYXRoLnNpbihuZXdBbmdsZSk7XG4gICAgbGV0IG5ld1kgPSAtMSooeC1jZW50cmVYKSpNYXRoLnNpbihuZXdBbmdsZSkrKHktY2VudHJlWSkqTWF0aC5jb3MobmV3QW5nbGUpO1xuICAgIG5ld1ggKz0gY2VudHJlWDtcbiAgICBuZXdZICs9IGNlbnRyZVk7XG4gICAgLy9BZmZpY2hhZ2UgZHUgc3ltw6l0cmlxdWVcbiAgICAgLy8gY29uc3Qgb2JqID0gdGhpcy52aWV3LiRlbC5xdWVyeVNlbGVjdG9yKCcjYm91bGVSJyk7XG4gICAgIC8vIG9iai5zZXRBdHRyaWJ1dGUoXCJjeFwiLG5ld1gpO1xuICAgICAvLyBvYmouc2V0QXR0cmlidXRlKFwiY3lcIixuZXdZKTtcbiAgICAvL0ZpbiBkZSBsJ2FmZmljaGFnZSBkdSBzeW3DqXRyaXF1ZVxuICAgIHRhYlswXSA9IG5ld1g7XG4gICAgdGFiWzFdID0gbmV3WTtcbiAgICByZXR1cm4gdGFiO1xuICB9XG5cbi8qIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLUNhbGN1bCBkZXMgZGlzdGFuY2VzLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tICovXG5cbiAgLy8gRG9ubmUgbGEgZGlzdGFuY2UgZHUgcG9pbnQgYXZlYyBsZXMgZm9ybWVzIHByw6lzZW50ZXNcbiAgX2dldERpc3RhbmNlKHhWYWx1ZSx5VmFsdWUpe1xuICAgIGxldCB0YWIgPSBbXTtcbiAgICBmb3IobGV0IGk9MDtpPHRoaXMubGlzdGVFbGxpcHNlLmxlbmd0aDtpKyspe1xuICAgICAgdGFiW3RhYi5sZW5ndGhdPXRoaXMuX2dldERpc3RhbmNlTm9kZSh0aGlzLmxpc3RlRWxsaXBzZVtpXSx4VmFsdWUseVZhbHVlKTtcbiAgICB9XG4gICAgZm9yKGxldCBpPTA7aTx0aGlzLmxpc3RlUmVjdC5sZW5ndGg7aSsrKXtcbiAgICAgIHRhYlt0YWIubGVuZ3RoXT10aGlzLl9nZXREaXN0YW5jZU5vZGUodGhpcy5saXN0ZVJlY3RbaV0seFZhbHVlLHlWYWx1ZSk7XG4gICAgfVxuICAgIHJldHVybiB0YWI7XG4gIH1cblxuICAvLyBEb25uZSBsYSBkaXN0YW5jZSBkJ3VuIHBvaW50IGF2ZWMgdW5lIGZvcm1lXG4gIF9nZXREaXN0YW5jZU5vZGUobm9kZSx4LHkpe1xuICAgIGlmKG5vZGUudGFnTmFtZT09XCJlbGxpcHNlXCIpe1xuICAgICAgbGV0IGNlbnRyZVggPSBwYXJzZUludChub2RlLmdldEF0dHJpYnV0ZSgnY3gnKSk7XG4gICAgICBsZXQgY2VudHJlWSA9IHBhcnNlSW50KG5vZGUuZ2V0QXR0cmlidXRlKCdjeScpKTtcbiAgICAgIHJldHVybiBNYXRoLnNxcnQoTWF0aC5wb3coKGNlbnRyZVgteCksMikrTWF0aC5wb3coKGNlbnRyZVkteSksMikpO1xuICAgIH1lbHNlIGlmKG5vZGUudGFnTmFtZT09J3JlY3QnKXtcbiAgICAgIGxldCBsZWZ0ID0gcGFyc2VJbnQobm9kZS5nZXRBdHRyaWJ1dGUoJ3gnKSk7XG4gICAgICBsZXQgdG9wID0gcGFyc2VJbnQobm9kZS5nZXRBdHRyaWJ1dGUoJ3knKSk7XG4gICAgICBsZXQgaGF1dCA9IHBhcnNlSW50KG5vZGUuZ2V0QXR0cmlidXRlKCdoZWlnaHQnKSk7XG4gICAgICBsZXQgbGFyZyA9IHBhcnNlSW50KG5vZGUuZ2V0QXR0cmlidXRlKCd3aWR0aCcpKTtcbiAgICAgIGxldCBjZW50cmVYID0gKGxlZnQrbGFyZykvMjtcbiAgICAgIGxldCBjZW50cmVZID0gKHRvcCtoYXV0KS8yO1xuICAgICAgcmV0dXJuIE1hdGguc3FydChNYXRoLnBvdygoY2VudHJlWC14KSwyKStNYXRoLnBvdygoY2VudHJlWS15KSwyKSk7XG4gICAgfVxuICB9XG5cbi8qIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVNPTi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAqL1xuXG4gIC8vIENyw6nDqSBsZSBtb3RldXIgc29ub3JlXG4gIF9jcmVhdGlvblVuaXZlcnNTb25vcmUoKXtcbiAgICAvL0dyYW51bGF0ZXVyXG4gICAgdGhpcy5ncmFpbiA9IG5ldyBNeUdyYWluMigpO1xuICAgIHNjaGVkdWxlci5hZGQodGhpcy5ncmFpbik7XG4gICAgdGhpcy5ncmFpbi5jb25uZWN0KGF1ZGlvQ29udGV4dC5kZXN0aW5hdGlvbik7XG4gICAgY29uc3QgYnVmZmVyQXNzb2NpZXMgPSBbNSw3LDldO1xuICAgIGNvbnN0IG1hcmtlckFzc29jaWVzID0gWzYsOCwxMF07XG4gICAgLy9TZWdtZW50ZXJcbiAgICBmb3IobGV0IGk9MDsgaTx0aGlzLm5iQ2hlbWluIDsgaSsrKXtcbiAgICAgIGxldCBpZEJ1ZmZlciA9IGJ1ZmZlckFzc29jaWVzW2ldO1xuICAgICAgbGV0IGlkTWFya2VyID0gbWFya2VyQXNzb2NpZXNbaV07XG4gICAgICB0aGlzLnNlZ21lbnRlcltpXSA9IG5ldyB3YXZlcy5TZWdtZW50RW5naW5lKHtcbiAgICAgICAgYnVmZmVyOiB0aGlzLmxvYWRlci5idWZmZXJzW2lkQnVmZmVyXSxcbiAgICAgICAgcG9zaXRpb25BcnJheTogdGhpcy5sb2FkZXIuYnVmZmVyc1tpZE1hcmtlcl0udGltZSxcbiAgICAgICAgZHVyYXRpb25BcnJheTogdGhpcy5sb2FkZXIuYnVmZmVyc1tpZE1hcmtlcl0uZHVyYXRpb24sXG4gICAgICAgIHBlcmlvZEFiczogMTAsXG4gICAgICAgIHBlcmlvZFJlbDogMTAsXG4gICAgICB9KTtcbiAgICAgIHRoaXMuc2VnbWVudGVyR2FpbltpXSA9IGF1ZGlvQ29udGV4dC5jcmVhdGVHYWluKCk7XG4gICAgICB0aGlzLnNlZ21lbnRlckdhaW5HcmFpbltpXSA9IGF1ZGlvQ29udGV4dC5jcmVhdGVHYWluKCk7XG4gICAgICAvL3RoaXMuc2VnbWVudGVyRkJbaV0gPSBhdWRpb0NvbnRleHQuY3JlYXRlR2FpbigpO1xuICAgICAgLy90aGlzLnNlZ21lbnRlckRlbGF5RkJbaV0gPSBhdWRpb0NvbnRleHQuY3JlYXRlRGVsYXkoMC44KTtcbiAgICAgIHRoaXMuc2VnbWVudGVyR2FpbkdyYWluW2ldLmdhaW4uc2V0VmFsdWVBdFRpbWUoMCxhdWRpb0NvbnRleHQuY3VycmVudFRpbWUpO1xuICAgICAgdGhpcy5zZWdtZW50ZXJHYWluW2ldLmdhaW4uc2V0VmFsdWVBdFRpbWUoMCxhdWRpb0NvbnRleHQuY3VycmVudFRpbWUpO1xuICAgICAgLy90aGlzLnNlZ21lbnRlckZCW2ldLmdhaW4uc2V0VmFsdWVBdFRpbWUoMC4wLGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSk7XG4gICAgICB0aGlzLnNlZ21lbnRlckdhaW5HcmFpbltpXS5jb25uZWN0KHRoaXMuZ3JhaW4uaW5wdXQpO1xuICAgICAgdGhpcy5zZWdtZW50ZXJHYWluW2ldLmNvbm5lY3QoYXVkaW9Db250ZXh0LmRlc3RpbmF0aW9uKTtcbiAgICAgIC8vdGhpcy5zZWdtZW50ZXJbaV0uY29ubmVjdCh0aGlzLnNlZ21lbnRlckZCW2ldKTtcbiAgICAgIC8vdGhpcy5zZWdtZW50ZXJGQltpXS5jb25uZWN0KHRoaXMuc2VnbWVudGVyRGVsYXlGQltpXSk7XG4gICAgICAvL3RoaXMuc2VnbWVudGVyRGVsYXlGQltpXS5jb25uZWN0KGF1ZGlvQ29udGV4dC5kZXN0aW5hdGlvbik7XG4gICAgICAvL3RoaXMuc2VnbWVudGVyRGVsYXlGQltpXS5jb25uZWN0KHRoaXMuc2VnbWVudGVyRkJbaV0pO1xuICAgICAgdGhpcy5zZWdtZW50ZXJbaV0uY29ubmVjdCh0aGlzLnNlZ21lbnRlckdhaW5baV0pO1xuICAgICAgdGhpcy5zZWdtZW50ZXJbaV0uY29ubmVjdCh0aGlzLnNlZ21lbnRlckdhaW5HcmFpbltpXSk7XG4gICAgICB0aGlzLl9zdGFydFNlZ21lbnRlcihpKTtcbiAgICB9XG5cbiAgICAvLyBOYXBwZSBkZSBmb25kXG4gICAgZm9yKGxldCBpPTA7aTx0aGlzLnRvdGFsRWxlbWVudHM7aSsrKXtcblxuICAgICAgLy9DcsOpYXRpb24gZGVzIGdhaW5zIGQnZW50csOpZS9zb3J0aWVzIGRlcyBuYXBwZXNcbiAgICAgIHRoaXMuZ2FpbnNEaXJlY3Rpb25zW2ldPSdkb3duJztcbiAgICAgIHRoaXMuZ2FpbnNbaV09IGF1ZGlvQ29udGV4dC5jcmVhdGVHYWluKCk7XG4gICAgICB0aGlzLmdhaW5zW2ldLmdhaW4udmFsdWU9MDtcbiAgICAgIHRoaXMuZ2FpbnNbaV0uY29ubmVjdCh0aGlzLmdyYWluLmlucHV0KTtcblxuICAgICAgLy9DcsOpYXRpb24gZGVzIHNvdXJjZXMgcG91ciBsZSBncmFudWxhdGV1clxuICAgICAgdGhpcy5zb3VyY2VzW2ldPWF1ZGlvQ29udGV4dC5jcmVhdGVCdWZmZXJTb3VyY2UoKTtcbiAgICAgIHRoaXMuc291cmNlc1tpXS5idWZmZXI9IHRoaXMubG9hZGVyLmJ1ZmZlcnNbaSU1XTtcbiAgICAgIHRoaXMuc291cmNlc1tpXS5jb25uZWN0KHRoaXMuZ2FpbnNbaV0pO1xuICAgICAgdGhpcy5zb3VyY2VzW2ldLmxvb3AgPSB0cnVlO1xuICAgICAgdGhpcy5zb3VyY2VzW2ldLnN0YXJ0KCk7XG5cbiAgICB9XG5cbiAgICB0aGlzLmdhaW5PdXRwdXREaXJlY3QgPSBhdWRpb0NvbnRleHQuY3JlYXRlR2FpbigpO1xuICAgIHRoaXMuZ2Fpbk91dHB1dERpcmVjdC5nYWluLnZhbHVlPTA7XG4gICAgdGhpcy5nYWluT3V0cHV0RGlyZWN0LmNvbm5lY3QoYXVkaW9Db250ZXh0LmRlc3RpbmF0aW9uKTtcbiAgICB0aGlzLmdhaW5PdXRwdXRHcmFpbiA9IGF1ZGlvQ29udGV4dC5jcmVhdGVHYWluKCk7XG4gICAgdGhpcy5nYWluT3V0cHV0R3JhaW4uZ2Fpbi52YWx1ZT0wO1xuICAgIHRoaXMuZ2Fpbk91dHB1dEdyYWluLmNvbm5lY3QodGhpcy5ncmFpbi5pbnB1dCk7XG5cblxuICAgIGZvcihsZXQgaSA9IDAgOyBpIDwgdGhpcy5uYkZvcm1lIDsgaSsrKXtcbiAgICAgIC8vIEZpZ3VyZVxuXG4gICAgICAvL2Nyw6lhdGlvbiBkZXMgZ2FpbnMgZGUgc29ucyBkaXJlY3RcbiAgICAgIHRoaXMuZ2FpbnNGb3JtZVtpXSA9IGF1ZGlvQ29udGV4dC5jcmVhdGVHYWluKCk7XG4gICAgICB0aGlzLmdhaW5zRm9ybWVbaV0uZ2Fpbi52YWx1ZT0wO1xuICAgICAgdGhpcy5nYWluc0Zvcm1lW2ldLmNvbm5lY3QodGhpcy5nYWluT3V0cHV0RGlyZWN0KTtcblxuXG4gICAgICAvL2Nyw6lhdGlvbiBkZXMgZ2FpbnMgZGUgc29ucyBncmFudWzDqXNcbiAgICAgIHRoaXMuZ2FpbnNHcmFpbkZvcm1lW2ldID0gYXVkaW9Db250ZXh0LmNyZWF0ZUdhaW4oKTtcbiAgICAgIHRoaXMuZ2FpbnNHcmFpbkZvcm1lW2ldLmdhaW4udmFsdWU9MDtcbiAgICAgIHRoaXMuZ2FpbnNHcmFpbkZvcm1lW2ldLmNvbm5lY3QodGhpcy5nYWluT3V0cHV0R3JhaW4pO1xuXG4gICAgICAvL0Zvcm1lIHNvdXJjZSBzb25vcmVcbiAgICAgIHRoaXMuc291bmRGb3JtZVtpXSA9IGF1ZGlvQ29udGV4dC5jcmVhdGVCdWZmZXJTb3VyY2UoKTtcbiAgICAgIHRoaXMuc291bmRGb3JtZVtpXS5idWZmZXIgPSB0aGlzLmxvYWRlci5idWZmZXJzWzEwICsgKGkrMSldO1xuICAgICAgdGhpcy5zb3VuZEZvcm1lW2ldLmNvbm5lY3QodGhpcy5nYWluc0Zvcm1lW2ldKTtcbiAgICAgIHRoaXMuc291bmRGb3JtZVtpXS5jb25uZWN0KHRoaXMuZ2FpbnNHcmFpbkZvcm1lW2ldKTtcbiAgICAgIHRoaXMuc291bmRGb3JtZVtpXS5sb29wID0gdHJ1ZTtcbiAgICAgIHRoaXMuc291bmRGb3JtZVtpXS5zdGFydCgpO1xuICAgIH1cbiAgICAgXG4gIH1cblxuXG4gIF9zdGFydFNlZ21lbnRlcihpKXtcbiAgICB0aGlzLnNlZ21lbnRlcltpXS50cmlnZ2VyKCk7XG4gICAgbGV0IG5ld1BlcmlvZCA9IHBhcnNlRmxvYXQodGhpcy5sb2FkZXIuYnVmZmVyc1s2KyhpKjIpXVsnZHVyYXRpb24nXVt0aGlzLnNlZ21lbnRlcltpXS5zZWdtZW50SW5kZXhdKSoxMDAwO1xuICAgIC8vIGlmKG5ld1BlcmlvZD4gMTUwKXtcbiAgICAvLyAgIG5ld1BlcmlvZCAtPSAzMDtcbiAgICAvLyB9ZWxzZSBpZihuZXdQZXJpb2Q+NDAwKXtcbiAgICAvLyAgIG5ld1BlcmlvZCAtPSAxMzA7XG4gICAgLy8gfWVsc2UgaWYobmV3UGVyaW9kPiA4MDApe1xuICAgIC8vICAgbmV3UGVyaW9kIC09IDI1MDtcbiAgICAvLyB9XG4gICAgc2V0VGltZW91dCgoKT0+e3RoaXMuX3N0YXJ0U2VnbWVudGVyKGkpO30sbmV3UGVyaW9kKTtcbiAgfVxuXG4gIC8vIEZhaXQgbW9udGVyIGxlIHNvbiBxdWFuZCBsYSBib3VsZSBlc3QgZGFucyBsYSBmb3JtZSBldCBiYWlzc2VyIHNpIGxhIGJvdWxlIG4neSBlc3QgcGFzXG4gIF91cGRhdGVHYWluKHRhYkluKXtcbiAgICBmb3IodmFyIGk9MDtpPHRhYkluLmxlbmd0aDtpKyspe1xuICAgICAgaWYodGhpcy5nYWluc1tpXS5nYWluLnZhbHVlPT0wJiZ0YWJJbltpXSYmdGhpcy5nYWluc0RpcmVjdGlvbnNbaV09PSdkb3duJyl7XG4gICAgICAgIGxldCBhY3R1YWwgPSB0aGlzLmdhaW5zW2ldLmdhaW4udmFsdWU7XG4gICAgICAgIHRoaXMuZ2FpbnNbaV0uZ2Fpbi5jYW5jZWxTY2hlZHVsZWRWYWx1ZXMoYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lKTtcbiAgICAgICAgdGhpcy5nYWluc1tpXS5nYWluLnNldFZhbHVlQXRUaW1lKGFjdHVhbCxhdWRpb0NvbnRleHQuY3VycmVudFRpbWUpO1xuICAgICAgICB0aGlzLmdhaW5zW2ldLmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoMC4xLCBhdWRpb0NvbnRleHQuY3VycmVudFRpbWUgKyAxKTtcbiAgICAgICAgdGhpcy5nYWluc0RpcmVjdGlvbnNbaV09J3VwJztcbiAgICAgIH1lbHNlIGlmKHRoaXMuZ2FpbnNbaV0uZ2Fpbi52YWx1ZSE9MCYmIXRhYkluW2ldJiZ0aGlzLmdhaW5zRGlyZWN0aW9uc1tpXT09J3VwJyl7XG4gICAgICAgIGxldCBhY3R1YWwgPSB0aGlzLmdhaW5zW2ldLmdhaW4udmFsdWU7XG4gICAgICAgIHRoaXMuZ2FpbnNbaV0uZ2Fpbi5jYW5jZWxTY2hlZHVsZWRWYWx1ZXMoYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lKTtcbiAgICAgICAgdGhpcy5nYWluc1tpXS5nYWluLnNldFZhbHVlQXRUaW1lKGFjdHVhbCxhdWRpb0NvbnRleHQuY3VycmVudFRpbWUpO1xuICAgICAgICB0aGlzLmdhaW5zW2ldLmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoMCwgYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lICsgMSk7XG4gICAgICAgIHRoaXMuZ2FpbnNEaXJlY3Rpb25zW2ldPSdkb3duJztcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBfYWN0dWFsaXNlckF1ZGlvQ2hlbWluKGkpe1xuICAgIGlmKHRoaXMudGFiQ2hlbWluW2ldKXtcbiAgICAgIGxldCBhY3R1YWwxID0gdGhpcy5zZWdtZW50ZXJHYWluW2ldLmdhaW4udmFsdWU7XG4gICAgICBsZXQgYWN0dWFsMiA9IHRoaXMuc2VnbWVudGVyR2FpbkdyYWluW2ldLmdhaW4udmFsdWU7XG4gICAgICAvL2xldCBhY3R1YWwzID0gdGhpcy5zZWdtZW50ZXJGQltpXS5nYWluLnZhbHVlO1xuICAgICAgLy90aGlzLnNlZ21lbnRlckZCW2ldLmdhaW4uY2FuY2VsU2NoZWR1bGVkVmFsdWVzKGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSk7XG4gICAgICB0aGlzLnNlZ21lbnRlckdhaW5baV0uZ2Fpbi5jYW5jZWxTY2hlZHVsZWRWYWx1ZXMoYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lKTtcbiAgICAgIHRoaXMuc2VnbWVudGVyR2FpbkdyYWluW2ldLmdhaW4uY2FuY2VsU2NoZWR1bGVkVmFsdWVzKGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSk7XG4gICAgICB0aGlzLnNlZ21lbnRlckdhaW5baV0uZ2Fpbi5zZXRWYWx1ZUF0VGltZShhY3R1YWwxLGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSk7XG4gICAgICB0aGlzLnNlZ21lbnRlckdhaW5HcmFpbltpXS5nYWluLnNldFZhbHVlQXRUaW1lKGFjdHVhbDIsYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lKTtcbiAgICAgIC8vdGhpcy5zZWdtZW50ZXJGQltpXS5nYWluLnNldFZhbHVlQXRUaW1lKGFjdHVhbDMsYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lKTtcbiAgICAgIHRoaXMuc2VnbWVudGVyR2FpbkdyYWluW2ldLmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoMCwgYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lICsgMSk7XG4gICAgICB0aGlzLnNlZ21lbnRlckdhaW5baV0uZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgwLjI1LCBhdWRpb0NvbnRleHQuY3VycmVudFRpbWUgKyAwLjYpO1xuICAgICAgLy90aGlzLnNlZ21lbnRlckZCW2ldLmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoMC40LCBhdWRpb0NvbnRleHQuY3VycmVudFRpbWUgKyAzKTtcbiAgICB9ZWxzZXtcbiAgICAgIGxldCBhY3R1YWwxID0gdGhpcy5zZWdtZW50ZXJHYWluW2ldLmdhaW4udmFsdWU7XG4gICAgICBsZXQgYWN0dWFsMiA9IHRoaXMuc2VnbWVudGVyR2FpbkdyYWluW2ldLmdhaW4udmFsdWU7XG4gICAgICAvL2xldCBhY3R1YWwzID0gdGhpcy5zZWdtZW50ZXJGQltpXS5nYWluLnZhbHVlO1xuICAgICAgLy90aGlzLnNlZ21lbnRlckZCW2ldLmdhaW4uY2FuY2VsU2NoZWR1bGVkVmFsdWVzKGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSk7XG4gICAgICB0aGlzLnNlZ21lbnRlckdhaW5baV0uZ2Fpbi5jYW5jZWxTY2hlZHVsZWRWYWx1ZXMoYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lKTtcbiAgICAgIHRoaXMuc2VnbWVudGVyR2FpbkdyYWluW2ldLmdhaW4uY2FuY2VsU2NoZWR1bGVkVmFsdWVzKGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSk7XG4gICAgICB0aGlzLnNlZ21lbnRlckdhaW5baV0uZ2Fpbi5zZXRWYWx1ZUF0VGltZShhY3R1YWwxLGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSk7XG4gICAgICB0aGlzLnNlZ21lbnRlckdhaW5HcmFpbltpXS5nYWluLnNldFZhbHVlQXRUaW1lKGFjdHVhbDIsYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lKTtcbiAgICAgIC8vdGhpcy5zZWdtZW50ZXJGQltpXS5nYWluLnNldFZhbHVlQXRUaW1lKGFjdHVhbDMsYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lKTtcbiAgICAgIGlmKHRoaXMuc3RhcnRTZWdtZW50RmluaVtpXSl7XG4gICAgICAgIHRoaXMuc2VnbWVudGVyR2FpbkdyYWluW2ldLmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoYWN0dWFsMSswLjE1LCBhdWRpb0NvbnRleHQuY3VycmVudFRpbWUgKyAwLjEpO1xuICAgICAgICBzZXRUaW1lb3V0KCAoKT0+e1xuICAgICAgICAgIHRoaXMuc2VnbWVudGVyR2FpbkdyYWluW2ldLmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoMCxhdWRpb0NvbnRleHQuY3VycmVudFRpbWUgKyAwLjMpOyAgICAgICAgIFxuICAgICAgICB9XG4gICAgICAgICwyMDAwKTtcbiAgICAgICAgdGhpcy5zZWdtZW50ZXJHYWluW2ldLmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoMCwgYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lICsgMC40KTtcbiAgICAgICAgLy90aGlzLnNlZ21lbnRlckZCW2ldLmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoMCwgYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lICsgMi41KTtcbiAgICAgIH1lbHNle1xuICAgICAgICB0aGlzLnN0YXJ0U2VnbWVudEZpbmlbaV0gPSB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIF9hY3R1YWxpc2VyQXVkaW9Gb3JtZShpZCl7XG4gICAgLy9Gb3JtZTFcbiAgICBpZihpZD09MCAmJiB0aGlzLnRhYkZvcm1lW2lkXSl7XG4gICAgICBsZXQgZ2FpbkdyYWluID0gMSAtICh0aGlzLnJhbXBGb3JtZVtcImZvcm1lMVwiXS82MDApO1xuICAgICAgbGV0IGdhaW5EaXJlY3QgPSB0aGlzLnJhbXBGb3JtZVtcImZvcm1lMVwiXS82MDA7XG4gICAgICBpZihnYWluRGlyZWN0PDApe1xuICAgICAgICBnYWluRGlyZWN0ID0gMDtcbiAgICAgIH1lbHNlIGlmKGdhaW5EaXJlY3Q+MSl7XG4gICAgICAgIGdhaW5EaXJlY3QgPSAxO1xuICAgICAgfVxuICAgICAgaWYoZ2FpbkdyYWluPDApe1xuICAgICAgICBnYWluR3JhaW4gPSAwO1xuICAgICAgfWVsc2UgaWYoZ2FpbkdyYWluPjEpe1xuICAgICAgICBnYWluR3JhaW4gPSAxO1xuICAgICAgfVxuICAgICAgaWYodGhpcy50YWJGb3JtZVtpZF0pe1xuICAgICAgICB0aGlzLmdhaW5zRm9ybWVbaWRdLmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoZ2FpbkRpcmVjdCwgYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lICsgMC4wMSk7XG4gICAgICAgIHRoaXMuZ2FpbnNHcmFpbkZvcm1lW2lkXS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKGdhaW5HcmFpbiwgYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lICsgMC4wMSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgICAgIC8vRm9ybWUyXG4gICAgaWYoaWQ9PTEgJiYgdGhpcy50YWJGb3JtZVtpZF0pe1xuICAgICAgbGV0IGdhaW5HcmFpbiA9IDEgLSAodGhpcy5yYW1wRm9ybWVbXCJmb3JtZTJcIl0vNjAwKTtcbiAgICAgIGxldCBnYWluRGlyZWN0ID0gdGhpcy5yYW1wRm9ybWVbXCJmb3JtZTJcIl0vNjAwO1xuICAgICAgaWYoZ2FpbkRpcmVjdDwwKXtcbiAgICAgICAgZ2FpbkRpcmVjdCA9IDA7XG4gICAgICB9ZWxzZSBpZihnYWluRGlyZWN0PjEpe1xuICAgICAgICBnYWluRGlyZWN0ID0gMTtcbiAgICAgIH1cbiAgICAgIGlmKGdhaW5HcmFpbjwwKXtcbiAgICAgICAgZ2FpbkdyYWluID0gMDtcbiAgICAgIH1lbHNlIGlmKGdhaW5HcmFpbj4xKXtcbiAgICAgICAgZ2FpbkdyYWluID0gMTtcbiAgICAgIH1cbiAgICAgIGlmKHRoaXMudGFiRm9ybWVbaWRdKXtcbiAgICAgICAgdGhpcy5nYWluc0Zvcm1lW2lkXS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKGdhaW5EaXJlY3QsIGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSArIDAuMDEpO1xuICAgICAgICB0aGlzLmdhaW5zR3JhaW5Gb3JtZVtpZF0uZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZShnYWluR3JhaW4sIGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSArIDAuMDEpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vRm9ybWUzXG4gICAgaWYoaWQ9PTIgJiYgdGhpcy50YWJGb3JtZVtpZF0pe1xuICAgICAgbGV0IGdhaW5HcmFpbiA9IDEgLSAodGhpcy5yYW1wRm9ybWVbXCJmb3JtZTNcIl0vNjAwKTtcbiAgICAgIGxldCBnYWluRGlyZWN0ID0gdGhpcy5yYW1wRm9ybWVbXCJmb3JtZTNcIl0vNjAwO1xuICAgICAgaWYoZ2FpbkRpcmVjdDwwKXtcbiAgICAgICAgZ2FpbkRpcmVjdCA9IDA7XG4gICAgICB9ZWxzZSBpZihnYWluRGlyZWN0PjEpe1xuICAgICAgICBnYWluRGlyZWN0ID0gMTtcbiAgICAgIH1cbiAgICAgIGlmKGdhaW5HcmFpbjwwKXtcbiAgICAgICAgZ2FpbkdyYWluID0gMDtcbiAgICAgIH1lbHNlIGlmKGdhaW5HcmFpbj4xKXtcbiAgICAgICAgZ2FpbkdyYWluID0gMTtcbiAgICAgIH1cbiAgICAgIGlmKHRoaXMudGFiRm9ybWVbaWRdKXtcbiAgICAgICAgdGhpcy5nYWluc0Zvcm1lW2lkXS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKGdhaW5EaXJlY3QsIGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSArIDAuMDEpO1xuICAgICAgICB0aGlzLmdhaW5zR3JhaW5Gb3JtZVtpZF0uZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZShnYWluR3JhaW4sIGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSArIDAuMDEpO1xuICAgICAgfVxuICAgIH1cbiAgICBcbiAgICAvL0Zvcm1lNFxuICAgIGlmKGlkPT0zICYmIHRoaXMudGFiRm9ybWVbaWRdKXtcbiAgICAgIGxldCBnYWluR3JhaW4gPSAxIC0gKHRoaXMucmFtcEZvcm1lW1wiZm9ybWU0XCJdLzYwMCk7XG4gICAgICBsZXQgZ2FpbkRpcmVjdCA9IHRoaXMucmFtcEZvcm1lW1wiZm9ybWU0XCJdLzYwMDtcbiAgICAgIGlmKGdhaW5EaXJlY3Q8MCl7XG4gICAgICAgIGdhaW5EaXJlY3QgPSAwO1xuICAgICAgfWVsc2UgaWYoZ2FpbkRpcmVjdD4xKXtcbiAgICAgICAgZ2FpbkRpcmVjdCA9IDE7XG4gICAgICB9XG4gICAgICBpZihnYWluR3JhaW48MCl7XG4gICAgICAgIGdhaW5HcmFpbiA9IDA7XG4gICAgICB9ZWxzZSBpZihnYWluR3JhaW4+MSl7XG4gICAgICAgIGdhaW5HcmFpbiA9IDE7XG4gICAgICB9XG4gICAgICBpZih0aGlzLnRhYkZvcm1lW2lkXSl7XG4gICAgICAgIHRoaXMuZ2FpbnNGb3JtZVtpZF0uZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZShnYWluRGlyZWN0LCBhdWRpb0NvbnRleHQuY3VycmVudFRpbWUgKyAwLjAxKTtcbiAgICAgICAgdGhpcy5nYWluc0dyYWluRm9ybWVbaWRdLmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoZ2FpbkdyYWluLCBhdWRpb0NvbnRleHQuY3VycmVudFRpbWUgKyAwLjAxKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZighdGhpcy50YWJGb3JtZVswXSYmKHRoaXMudGFiRm9ybWVbMF0hPXRoaXMuYW5jaWVuRm9ybWVbMF0pKXtcbiAgICAgIHRoaXMuZ2FpbnNGb3JtZVswXS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKDAsIGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSArIDEuNSk7XG4gICAgICB0aGlzLmdhaW5zR3JhaW5Gb3JtZVswXS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKDAsIGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSArIDEuNSk7XG4gICAgfVxuICAgIGlmKCF0aGlzLnRhYkZvcm1lWzFdJiYodGhpcy50YWJGb3JtZVsxXSE9dGhpcy5hbmNpZW5Gb3JtZVsxXSkpe1xuICAgICAgdGhpcy5nYWluc0Zvcm1lWzFdLmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoMCwgYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lICsgMS41KTtcbiAgICAgIHRoaXMuZ2FpbnNHcmFpbkZvcm1lWzFdLmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoMCwgYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lICsgMS41KTtcbiAgICB9XG4gICAgaWYoIXRoaXMudGFiRm9ybWVbMl0mJih0aGlzLnRhYkZvcm1lWzJdIT10aGlzLmFuY2llbkZvcm1lWzJdKSl7XG4gICAgICB0aGlzLmdhaW5zRm9ybWVbMl0uZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgwLCBhdWRpb0NvbnRleHQuY3VycmVudFRpbWUgKyAxLjUpO1xuICAgICAgdGhpcy5nYWluc0dyYWluRm9ybWVbMl0uZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgwLCBhdWRpb0NvbnRleHQuY3VycmVudFRpbWUgKyAxLjUpO1xuICAgIH1cbiAgICBpZighdGhpcy50YWJGb3JtZVszXSYmKHRoaXMudGFiRm9ybWVbM10hPXRoaXMuYW5jaWVuRm9ybWVbM10pKXtcbiAgICAgIHRoaXMuZ2FpbnNGb3JtZVszXS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKDAsIGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSArIDEuNSk7XG4gICAgICB0aGlzLmdhaW5zR3JhaW5Gb3JtZVszXS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKDAsIGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSArIDEuNSk7XG4gICAgfVxuXG4gICAgdGhpcy5hbmNpZW5Gb3JtZSA9IFt0aGlzLnRhYkZvcm1lWzBdLHRoaXMudGFiRm9ybWVbMV0sdGhpcy50YWJGb3JtZVsyXSx0aGlzLnRhYkZvcm1lWzNdXTtcblxuICB9XG5cbiAgLyogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1YTU0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAqL1xuICBfc2V0TW9kZWwobW9kZWwsbW9kZWwxLG1vZGVsMil7XG4gICAgdGhpcy5kZWNvZGVyLnNldE1vZGVsKG1vZGVsKTtcbiAgICB0aGlzLmRlY29kZXIyLnNldE1vZGVsKG1vZGVsMSk7XG4gICAgdGhpcy5kZWNvZGVyMy5zZXRNb2RlbChtb2RlbDIpO1xuICAgIHRoaXMubW9kZWxPSyA9IHRydWU7XG4gIH1cblxuICBfcHJvY2Vzc1Byb2JhKCl7ICAgIFxuICAgIGxldCBwcm9iYU1heCA9IHRoaXMuZGVjb2Rlci5nZXRQcm9iYSgpO1xuICAgIGxldCBwcm9iYU1heDEgPSB0aGlzLmRlY29kZXIyLmdldFByb2JhKCk7XG4gICAgbGV0IHByb2JhTWF4MiA9IHRoaXMuZGVjb2RlcjMuZ2V0UHJvYmEoKTtcbiAgICBsZXQgbmV3U2VnbWVudCA9IFtdO1xuICAgIC8vQ2hlbWluXG4gICAgZm9yKGxldCBpID0gMCA7IGkgPCB0aGlzLm5iQ2hlbWluIDsgaSArKyl7XG4gICAgICBuZXdTZWdtZW50W2ldID0gdGhpcy5fZmluZE5ld1NlZ21lbnQocHJvYmFNYXgxLCBwcm9iYU1heDIsIGkpO1xuICAgICAgdGhpcy5fYWN0dWFsaXNlclNlZ21lbnRJZk5vdEluKG5ld1NlZ21lbnRbaV0saSk7XG4gICAgICBsZXQgbm9tMSA9ICdwcm90b3R5cGVGb25kLScraSsnLTEnO1xuICAgICAgbGV0IG5vbTIgPSAncHJvdG90eXBlRm9uZC0nK2krJy0yJztcbiAgICAgIGlmKHRoaXMudGFiQ2hlbWluW2ldJiYocHJvYmFNYXgxWzBdPT1ub20xfHxwcm9iYU1heDJbMF09PW5vbTIpKXtcbiAgICAgICAgaWYoIWlzTmFOKHByb2JhTWF4MVsxXVtpXSkgfHwgIWlzTmFOKHByb2JhTWF4MlsxXVtpXSkpe1xuICAgICAgICAgIHRoaXMubGFzdFBvc2l0aW9uW2ldID0gbmV3U2VnbWVudFtpXTtcbiAgICAgICAgICBuZXdTZWdtZW50W2ldID0gbmV3U2VnbWVudFtpXSsgKE1hdGgudHJ1bmMoTWF0aC5yYW5kb20oKSp0aGlzLnF0UmFuZG9tKSk7XG4gICAgICAgICAgdGhpcy5zZWdtZW50ZXJbaV0uc2VnbWVudEluZGV4ID0gbmV3U2VnbWVudFtpXTtcbiAgICAgICAgfVxuICAgICAgfWVsc2V7XG4gICAgICAgIHRoaXMuc2VnbWVudGVyW2ldLnNlZ21lbnRJbmRleCA9IHRoaXMubGFzdFBvc2l0aW9uW2ldICsgKE1hdGgudHJ1bmMoTWF0aC5yYW5kb20oKSp0aGlzLnF0UmFuZG9tKSk7XG4gICAgICB9XG4gICAgICBpZih0aGlzLnRhYkNoZW1pbltpXSE9dGhpcy5vbGRUYWJDaGVtaW5baV0pe1xuICAgICAgICB0aGlzLl9hY3R1YWxpc2VyQXVkaW9DaGVtaW4oaSk7XG4gICAgICB9XG4gICAgICBpZihpPT0yKXtcbiAgICAgIH1cbiAgICAgIHRoaXMub2xkVGFiQ2hlbWluW2ldID0gdGhpcy50YWJDaGVtaW5baV07XG4gICAgfVxuXG4gICAgLy9Gb3JtZVxuICAgIGxldCBkaXJlY3QgPSBmYWxzZTtcbiAgICBsZXQgaSA9IDA7XG4gICAgd2hpbGUoKCFkaXJlY3QpICYmIChpPHRoaXMubmJGb3JtZSkpe1xuICAgICAgaWYodGhpcy50YWJGb3JtZVtpXSl7XG4gICAgICAgIGRpcmVjdCA9IHRydWU7XG4gICAgICB9XG4gICAgICBpKytcbiAgICB9XG5cbiAgIGxldCBhY3R1YWwxID0gdGhpcy5nYWluT3V0cHV0RGlyZWN0LmdhaW4udmFsdWU7XG4gICBsZXQgYWN0dWFsMiA9IHRoaXMuZ2Fpbk91dHB1dEdyYWluLmdhaW4udmFsdWU7XG5cbiAgICBpZihkaXJlY3QhPXRoaXMuYW5jaWVuMyl7XG4gICAgICBpZihkaXJlY3Qpe1xuICAgICAgICB0aGlzLmdhaW5PdXRwdXREaXJlY3QuZ2Fpbi5jYW5jZWxTY2hlZHVsZWRWYWx1ZXMoYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lKTtcbiAgICAgICAgdGhpcy5nYWluT3V0cHV0RGlyZWN0LmdhaW4uc2V0VmFsdWVBdFRpbWUoYWN0dWFsMSxhdWRpb0NvbnRleHQuY3VycmVudFRpbWUpO1xuICAgICAgICB0aGlzLmdhaW5PdXRwdXREaXJlY3QuZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgwLjUsYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lICsgMik7XG4gICAgICAgIHRoaXMuZ2Fpbk91dHB1dEdyYWluLmdhaW4uY2FuY2VsU2NoZWR1bGVkVmFsdWVzKGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSk7XG4gICAgICAgIHRoaXMuZ2Fpbk91dHB1dEdyYWluLmdhaW4uc2V0VmFsdWVBdFRpbWUoYWN0dWFsMSxhdWRpb0NvbnRleHQuY3VycmVudFRpbWUpO1xuICAgICAgICB0aGlzLmdhaW5PdXRwdXRHcmFpbi5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKDAuNSxhdWRpb0NvbnRleHQuY3VycmVudFRpbWUgKyAyKTtcbiAgICAgIH1lbHNle1xuICAgICAgICB0aGlzLmdhaW5PdXRwdXREaXJlY3QuZ2Fpbi5jYW5jZWxTY2hlZHVsZWRWYWx1ZXMoYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lKTtcbiAgICAgICAgdGhpcy5nYWluT3V0cHV0RGlyZWN0LmdhaW4uc2V0VmFsdWVBdFRpbWUoYWN0dWFsMSxhdWRpb0NvbnRleHQuY3VycmVudFRpbWUpO1xuICAgICAgICB0aGlzLmdhaW5PdXRwdXREaXJlY3QuZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgwLGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSArIDIpO1xuICAgICAgICB0aGlzLmdhaW5PdXRwdXRHcmFpbi5nYWluLmNhbmNlbFNjaGVkdWxlZFZhbHVlcyhhdWRpb0NvbnRleHQuY3VycmVudFRpbWUpO1xuICAgICAgICB0aGlzLmdhaW5PdXRwdXRHcmFpbi5nYWluLnNldFZhbHVlQXRUaW1lKGFjdHVhbDEsYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lKTtcbiAgICAgICAgdGhpcy5nYWluT3V0cHV0R3JhaW4uZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgwLGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSArIDIpO1xuICAgICAgICB0aGlzLnJhbXBGb3JtZVsnZm9ybWUxJ10gPSAwO1xuICAgICAgICB0aGlzLnJhbXBGb3JtZVsnZm9ybWUyJ10gPSAwO1xuICAgICAgICB0aGlzLnJhbXBGb3JtZVsnZm9ybWUzJ10gPSAwO1xuICAgICAgICB0aGlzLnJhbXBGb3JtZVsnZm9ybWU0J10gPSAwO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLmFuY2llbjMgPSBkaXJlY3Q7XG5cbiAgICBpZihkaXJlY3Qpe1xuICAgICAgZm9yKGxldCBpID0gMDsgaTx0aGlzLm5iRm9ybWUgOyBpKyspe1xuICAgICAgICBpZihwcm9iYU1heD09J2Zvcm1lMScpe1xuICAgICAgICAgIHRoaXMucmFtcEZvcm1lWydmb3JtZTInXS0tO1xuICAgICAgICAgIHRoaXMucmFtcEZvcm1lWydmb3JtZTMnXS0tO1xuICAgICAgICAgIHRoaXMucmFtcEZvcm1lWydmb3JtZTQnXS0tO1xuICAgICAgICB9ZWxzZSBpZihwcm9iYU1heD09J2Zvcm1lMicpe1xuICAgICAgICAgIHRoaXMucmFtcEZvcm1lWydmb3JtZTEnXS0tO1xuICAgICAgICAgIHRoaXMucmFtcEZvcm1lWydmb3JtZTMnXS0tO1xuICAgICAgICAgIHRoaXMucmFtcEZvcm1lWydmb3JtZTQnXS0tO1xuICAgICAgICB9ZWxzZSBpZihwcm9iYU1heD09J2Zvcm1lMycpe1xuICAgICAgICAgIHRoaXMucmFtcEZvcm1lWydmb3JtZTEnXS0tO1xuICAgICAgICAgIHRoaXMucmFtcEZvcm1lWydmb3JtZTInXS0tO1xuICAgICAgICAgIHRoaXMucmFtcEZvcm1lWydmb3JtZTQnXS0tO1xuICAgICAgICB9ZWxzZSBpZihwcm9iYU1heD09J2Zvcm1lNCcpe1xuICAgICAgICAgIHRoaXMucmFtcEZvcm1lWydmb3JtZTEnXS0tO1xuICAgICAgICAgIHRoaXMucmFtcEZvcm1lWydmb3JtZTInXS0tO1xuICAgICAgICAgIHRoaXMucmFtcEZvcm1lWydmb3JtZTMnXS0tO1xuICAgICAgICB9ZWxzZSBpZihwcm9iYU1heD09bnVsbCl7XG4gICAgICAgICAgdGhpcy5yYW1wRm9ybWVbJ2Zvcm1lMSddLS07XG4gICAgICAgICAgdGhpcy5yYW1wRm9ybWVbJ2Zvcm1lMiddLS07XG4gICAgICAgICAgdGhpcy5yYW1wRm9ybWVbJ2Zvcm1lMyddLS07XG4gICAgICAgICAgdGhpcy5yYW1wRm9ybWVbJ2Zvcm1lNCddLS07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHRoaXMucmFtcEZvcm1lW3Byb2JhTWF4XSsrO1xuICAgIH1cbiAgICBmb3IobGV0IGkgPSAwIDsgaSA8IHRoaXMubmJGb3JtZSA7IGkrKyl7XG4gICAgICB0aGlzLl9hY3R1YWxpc2VyQXVkaW9Gb3JtZShpKTtcbiAgICB9XG5cbiAgfVxuXG4gIC8vIFRyb3V2ZSBlbiBmb25jdGlvbiBkZSB4bW0gbGUgc2VnbWVudCBsZSBwbHVzIHByb2NoZSBkZSBsYSBwb3NpdGlvbiBkZSBsJ3V0aWxpc2F0ZXVyXG4gIF9maW5kTmV3U2VnbWVudChwcm9iYU1heDEsIHByb2JhTWF4MiwgaWQpe1xuICAgIGxldCBuZXdTZWdtZW50ID0gLTE7XG4gICAgbGV0IGFjdHVlbCA9IG51bGw7XG4gICAgaWYoKHRoaXMuYW5jaWVuMVtpZF0tcHJvYmFNYXgxWzFdW2lkXSE9MC4pJiYhaXNOYU4ocHJvYmFNYXgxWzFdW2lkXSkpe1xuICAgICAgbmV3U2VnbWVudCA9IE1hdGgudHJ1bmMocHJvYmFNYXgxWzFdW2lkXSoodGhpcy5uYlNlZ21lbnRbaWRdLXRoaXMucXRSYW5kb20pKTtcbiAgICAgIGFjdHVlbCA9IFwiMVwiO1xuICAgICAgaWYodGhpcy5jb3VudDJbaWRdPnRoaXMuY291bnRNYXgpe1xuICAgICAgICB0aGlzLmRlY29kZXIzLnJlc2V0KCk7XG4gICAgICAgIHRoaXMuY291bnQyW2lkXSA9IDA7XG4gICAgICB9XG4gICAgICB0aGlzLmNvdW50MVtpZF0gPSAwO1xuICAgICAgdGhpcy5jb3VudDJbaWRdKys7XG4gICAgfWVsc2UgaWYgKCh0aGlzLmFuY2llbjJbaWRdLXByb2JhTWF4MlsxXVtpZF0hPTAuKSYmIWlzTmFOKHByb2JhTWF4MlsxXVtpZF0pKXtcbiAgICAgIG5ld1NlZ21lbnQgPSBNYXRoLnRydW5jKCgxLXByb2JhTWF4MlsxXVtpZF0pKih0aGlzLm5iU2VnbWVudFtpZF0tdGhpcy5xdFJhbmRvbSkpO1xuICAgICAgYWN0dWVsID0gXCIwXCI7XG4gICAgICBpZih0aGlzLmNvdW50MVtpZF0+dGhpcy5jb3VudE1heCl7XG4gICAgICAgIHRoaXMuZGVjb2RlcjIucmVzZXQoKTtcbiAgICAgICAgdGhpcy5jb3VudDFbaWRdID0gMDtcbiAgICAgIH1cbiAgICAgIHRoaXMuY291bnQyW2lkXSA9IDA7XG4gICAgICB0aGlzLmNvdW50MVtpZF0rKztcbiAgICB9ZWxzZXtcbiAgICAgIG5ld1NlZ21lbnQgPSB0aGlzLmxhc3RTZWdtZW50W2lkXTtcbiAgICB9XG4gICAgdGhpcy5hbmNpZW4xW2lkXSA9IHByb2JhTWF4MVsxXVtpZF07XG4gICAgdGhpcy5hbmNpZW4yW2lkXSA9IHByb2JhTWF4MlsxXVtpZF07XG4gICAgcmV0dXJuIG5ld1NlZ21lbnQ7XG4gIH1cblxuICAvLyBGYWlzIGF2YW5jZXIgbGEgdMOqdGUgZGUgbGVjdHVyZSBkZXMgc2VnbWVudGVyIHNpIGwndXRpbGlzYXRldXIgbidlc3QgcGFzIGRhbnMgdW5lIGZvcm1lXG4gIF9hY3R1YWxpc2VyU2VnbWVudElmTm90SW4obmV3U2VnbWVudCwgaWQpe1xuICAgIGlmKCF0aGlzLnRhYkNoZW1pbltpZF0pe1xuICAgICAgaWYodGhpcy5jb3VudFRpbWVvdXRbaWRdPjQwKXtcbiAgICAgICAgaWYobmV3U2VnbWVudD4odGhpcy5uYlNlZ21lbnRbaWRdLXRoaXMucXRSYW5kb20pKXtcbiAgICAgICAgICB0aGlzLmRpcmVjdGlvbltpZF0gPSBmYWxzZTtcbiAgICAgICAgfWVsc2UgaWYobmV3U2VnbWVudDwxKXtcbiAgICAgICAgICB0aGlzLmRpcmVjdGlvbltpZF0gPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY291bnRUaW1lb3V0W2lkXSA9IDA7XG4gICAgICAgIGlmKHRoaXMuZGlyZWN0aW9uW2lkXSl7XG4gICAgICAgICAgbmV3U2VnbWVudCsrO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBuZXdTZWdtZW50LS07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHRoaXMubGFzdFNlZ21lbnRbaWRdID0gbmV3U2VnbWVudDtcbiAgICAgIGxldCBzZWdtZW50ID1uZXdTZWdtZW50K01hdGgudHJ1bmMoTWF0aC5yYW5kb20oKSp0aGlzLnF0UmFuZG9tKTtcbiAgICAgIHRoaXMuY291bnRUaW1lb3V0W2lkXSsrO1xuICAgICAgdGhpcy5zZWdtZW50ZXJbaWRdLnNlZ21lbnRJbmRleCA9IHNlZ21lbnQ7XG4gICAgfVxuICB9XG59XG4iXX0=