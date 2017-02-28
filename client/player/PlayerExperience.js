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
      "sounds/forme/eminem.mp3", "sounds/forme/trump.mp3", "sounds/forme/fr.mp3", "sounds/forme/brexit.mp3"]
    });
    _this2.startOK = false;
    _this2.startSegmentFini = [];
    _this2.modelOK = false;

    // PARAMETRE
    _this2.nbChemin = 3;
    _this2.nbForme = 4;
    _this2.qtRandom = 140;
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
    //this.count3 = 0;
    _this2.count4 = 10;
    _this2.maxLag = 10;
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
    _this2.ancienForme = [false, false, false, false];
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
        //this.decoder2 = new Decodage2();
        //this.decoder3 = new Decodage3();
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
        this.maxCountUpdate = 2;
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
            //if(this.count3>this.maxLag){
            var newValues = _this4._toMove(data[2], data[1] - 25);
            if (_this4.count4 > _this4.maxLag) {
              _this4.tabIn = _this4._isIn(newValues[0], newValues[1]);
              _this4.tabChemin = _this4._isInChemin(newValues[0], newValues[1]);
              _this4.tabForme = _this4._isInForme(newValues[0], newValues[1]);
              _this4.count4 = -1;
              if (_this4.countUpdate > _this4.maxCountUpdate) {
                _this4._updateGain(_this4.tabIn);
                _this4.countUpdate = 0;
              } else {
                _this4.countUpdate++;
              }
            }

            _this4.count4++;
            // if(this.modelOk&&!(this.tabChemin[0]&&this.tabChemin[1]&&this.tabChemin[2])){
            //   this.decoder1.reset();
            //   this.decoder2.reset();
            // }
            //console.log(this.tabForme);
            // if(this.modelOk&&!(this.tabForme[0]&&this.tabForme[1]&&this.tabForme[2]&&this.tabForme[3])){
            //   this.decoder.reset();
            // }

            _this4._moveScreenTo(newValues[0], newValues[1], 0.08);
            // XMM
            if (_this4.modelOK) {
              _this4.decoder.process(newValues[0], newValues[1]);
              //this.decoder2.process(newValues[0],newValues[1]);
              //this.decoder3.process(newValues[0],newValues[1]);
              _this4._processProba();
              //this.count3 =0;
            }
            // }else{
            //   this.count3++;
            // }
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
      while (!forme3 && i < this.listeRectForme3.length) {
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
      while (!forme4 && i < this.listeRectForme4.length) {
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
        // this.segmenterFB[i] = audioContext.createGain();
        // this.segmenterDelayFB[i] = audioContext.createDelay(0.8);
        this.segmenterGainGrain[i].gain.setValueAtTime(0, audioContext.currentTime);
        this.segmenterGain[i].gain.setValueAtTime(0, audioContext.currentTime);
        // this.segmenterFB[i].gain.setValueAtTime(0.0,audioContext.currentTime);
        this.segmenterGainGrain[i].connect(this.grain.input);
        this.segmenterGain[i].connect(audioContext.destination);
        //this.segmenter[i].connect(this.segmenterFB[i]);
        // this.segmenterFB[i].connect(this.segmenterDelayFB[i]);
        // this.segmenterDelayFB[i].connect(audioContext.destination);
        // this.segmenterDelayFB[i].connect(this.segmenterFB[i]);
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
          this.gains[i].gain.linearRampToValueAtTime(0.24, audioContext.currentTime + 2.3);
          this.gainsDirections[i] = 'up';
        } else if (this.gains[i].gain.value != 0 && !tabIn[i] && this.gainsDirections[i] == 'up') {
          var _actual = this.gains[i].gain.value;
          this.gains[i].gain.cancelScheduledValues(audioContext.currentTime);
          this.gains[i].gain.setValueAtTime(_actual, audioContext.currentTime);
          this.gains[i].gain.linearRampToValueAtTime(0, audioContext.currentTime + 3.5);
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
        var gainGrain = 1 - this.rampForme["forme1"] / 1000;
        var gainDirect = this.rampForme["forme1"] / 1000;
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
        var _gainGrain = 1 - this.rampForme["forme2"] / 1000;
        var _gainDirect = this.rampForme["forme2"] / 1000;
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
        var _gainGrain2 = 1 - this.rampForme["forme3"] / 1000;
        var _gainDirect2 = this.rampForme["forme3"] / 1000;
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
        var _gainGrain3 = 1 - this.rampForme["forme4"] / 1000;
        var _gainDirect3 = this.rampForme["forme4"] / 1000;
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

      if (this.tabForme[0] || this.tabForme[1] || this.tabForme[2] || this.tabForme[3]) {
        this.decoder.reset();
      }
    }

    /* -----------------------------------------XMM----------------------------------------------- */

  }, {
    key: '_setModel',
    value: function _setModel(model, model1, model2) {
      this.decoder.setModel(model);
      //this.decoder2.setModel(model1);
      //this.decoder3.setModel(model2);
      this.modelOK = true;
    }
  }, {
    key: '_processProba',
    value: function _processProba() {
      var probaMax = this.decoder.getProba();
      //console.log(probaMax);
      // //let probaMax1 = this.decoder2.getProba();
      // //let probaMax2 = this.decoder3.getProba();
      // let newSegment = [];
      // //Chemin
      for (var _i10 = 0; _i10 < this.nbChemin; _i10++) {
        //   newSegment[i] = this._findNewSegment(probaMax1, probaMax2, i);
        //   this._actualiserSegmentIfNotIn(newSegment[i],i);
        //   let nom1 = 'prototypeFond-'+i+'-1';
        //   let nom2 = 'prototypeFond-'+i+'-2';
        //   if(this.tabChemin[i]&&(probaMax1[0]==nom1||probaMax2[0]==nom2)){
        //     //if(!isNaN(probaMax1[1][i]) || !isNaN(probaMax2[1][i])){
        //       this.lastPosition[i] = newSegment[i];
        //       newSegment[i] = newSegment[i]+ (Math.trunc(Math.random()*this.qtRandom));
        //       this.segmenter[i].segmentIndex = newSegment[i];
        //     }
        //   }else{
        this.segmenter[_i10].segmentIndex = (0, _trunc2.default)(Math.random() * this.qtRandom); //this.lastPosition[i] + (Math.trunc(Math.random()*this.qtRandom));
        // }
        if (this.tabChemin[_i10] != this.oldTabChemin[_i10]) {
          this._actualiserAudioChemin(_i10);
        }
        // if(i==2){
        // }
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
          this.rampForme['forme1'] = 0;
          this.rampForme['forme2'] = 0;
          this.rampForme['forme3'] = 0;
          this.rampForme['forme4'] = 0;
        } else {
          this.gainOutputDirect.gain.cancelScheduledValues(audioContext.currentTime);
          this.gainOutputDirect.gain.setValueAtTime(actual1, audioContext.currentTime);
          this.gainOutputDirect.gain.linearRampToValueAtTime(0, audioContext.currentTime + 2);
          this.gainOutputGrain.gain.cancelScheduledValues(audioContext.currentTime);
          this.gainOutputGrain.gain.setValueAtTime(actual1, audioContext.currentTime);
          this.gainOutputGrain.gain.linearRampToValueAtTime(0, audioContext.currentTime + 2);
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
          this.rampForme[probaMax]++;

          if (this.rampForme['forme1'] < 0) this.rampForme['forme1'] = 0;
          if (this.rampForme['forme2'] < 0) this.rampForme['forme2'] = 0;
          if (this.rampForme['forme3'] < 0) this.rampForme['forme3'] = 0;
          if (this.rampForme['forme4'] < 0) this.rampForme['forme4'] = 0;
        }
      }
      for (var _i12 = 0; _i12 < this.nbForme; _i12++) {
        this._actualiserAudioForme(_i12);
      }

      //console.log(this.rampForme);
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
          //this.decoder3.reset();
          this.count2[id] = 0;
        }
        this.count1[id] = 0;
        this.count2[id]++;
      } else if (this.ancien2[id] - probaMax2[1][id] != 0. && !isNaN(probaMax2[1][id])) {
        newSegment = (0, _trunc2.default)((1 - probaMax2[1][id]) * (this.nbSegment[id] - this.qtRandom));
        actuel = "0";
        if (this.count1[id] > this.countMax) {
          //this.decoder2.reset();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlBsYXllckV4cGVyaWVuY2UuanMiXSwibmFtZXMiOlsic291bmR3b3JrcyIsIndhdmVzIiwiYXVkaW9Db250ZXh0Iiwic2NoZWR1bGVyIiwiZ2V0U2NoZWR1bGVyIiwiUGxheWVyVmlldyIsInRlbXBsYXRlIiwiY29udGVudCIsImV2ZW50cyIsIm9wdGlvbnMiLCJWaWV3IiwidmlldyIsIlBsYXllckV4cGVyaWVuY2UiLCJhc3NldHNEb21haW4iLCJwbGF0Zm9ybSIsInJlcXVpcmUiLCJmZWF0dXJlcyIsIm1vdGlvbklucHV0IiwiZGVzY3JpcHRvcnMiLCJsb2FkZXIiLCJmaWxlcyIsInN0YXJ0T0siLCJzdGFydFNlZ21lbnRGaW5pIiwibW9kZWxPSyIsIm5iQ2hlbWluIiwibmJGb3JtZSIsInF0UmFuZG9tIiwibmJTZWdtZW50IiwiYW5jaWVuMSIsImFuY2llbjIiLCJhbmNpZW4zIiwiY291bnRUaW1lb3V0IiwiZGlyZWN0aW9uIiwib2xkVGFiQ2hlbWluIiwiY291bnQxIiwiY291bnQyIiwiY291bnQ0IiwibWF4TGFnIiwic2VnbWVudGVyIiwic2VnbWVudGVyRkIiLCJzZWdtZW50ZXJEZWxheUZCIiwic2VnbWVudGVyR2FpbiIsInNlZ21lbnRlckdhaW5HcmFpbiIsInNvdXJjZXMiLCJnYWlucyIsImdhaW5zRGlyZWN0aW9ucyIsImdyYWluIiwibGFzdFNlZ21lbnQiLCJsYXN0UG9zaXRpb24iLCJnYWluT3V0cHV0RGlyZWN0IiwiZ2Fpbk91dHB1dEdyYWluIiwiZ2FpbnNGb3JtZSIsImFuY2llbkZvcm1lIiwiZ2FpbnNHcmFpbkZvcm1lIiwic291bmRGb3JtZSIsInJhbXBGb3JtZSIsImNvdW50TWF4IiwiaSIsInZpZXdUZW1wbGF0ZSIsInZpZXdDb250ZW50Iiwidmlld0N0b3IiLCJ2aWV3T3B0aW9ucyIsInByZXNlcnZlUGl4ZWxSYXRpbyIsImNyZWF0ZVZpZXciLCJfdG9Nb3ZlIiwiYmluZCIsIl9pc0luRWxsaXBzZSIsIl9pc0luUmVjdCIsIl9pc0luIiwiX2lzSW5DaGVtaW4iLCJfaXNJbkZvcm1lIiwiX2dldERpc3RhbmNlTm9kZSIsIl9jcmVhdGlvblVuaXZlcnNTb25vcmUiLCJfdXBkYXRlR2FpbiIsIl9yb3RhdGVQb2ludCIsIl9teUxpc3RlbmVyIiwiX2FkZEJvdWxlIiwiX2FkZEZvbmQiLCJfc2V0TW9kZWwiLCJfcHJvY2Vzc1Byb2JhIiwiX3JlbXBsYWNlRm9ybWUiLCJfYWRkRm9ybWUiLCJfc3RhcnRTZWdtZW50ZXIiLCJfZmluZE5ld1NlZ21lbnQiLCJfYWN0dWFsaXNlclNlZ21lbnRJZk5vdEluIiwiX2FjdHVhbGlzZXJBdWRpb0NoZW1pbiIsIl9hY3R1YWxpc2VyQXVkaW9Gb3JtZSIsInJlY2VpdmUiLCJkYXRhIiwibW9kZWwiLCJtb2RlbDEiLCJtb2RlbDIiLCJmb3JtZSIsIngiLCJ5IiwiaGFzU3RhcnRlZCIsImluaXQiLCJzaG93IiwiZGVjb2RlciIsImRvY3VtZW50IiwiYm9keSIsInN0eWxlIiwib3ZlcmZsb3ciLCJjZW50cmVYIiwid2luZG93IiwiaW5uZXJXaWR0aCIsInRhaWxsZUVjcmFuWCIsInRhaWxsZUVjcmFuWSIsImlubmVySGVpZ2h0IiwiY2VudHJlRWNyYW5YIiwiY2VudHJlRWNyYW5ZIiwic2V0VGltZW91dCIsImNlbnRyZVkiLCJsaXN0ZUVsbGlwc2UiLCJnZXRFbGVtZW50c0J5VGFnTmFtZSIsImxpc3RlUmVjdCIsInRvdGFsRWxlbWVudHMiLCJsZW5ndGgiLCJsaXN0ZVRleHQiLCJsaXN0ZUZvcm1lIiwibGlzdGVSZWN0Q2hlbWluMSIsImdldEVsZW1lbnRzQnlDbGFzc05hbWUiLCJsaXN0ZVJlY3RDaGVtaW4yIiwibGlzdGVSZWN0Q2hlbWluMyIsImxpc3RlUmVjdEZvcm1lMSIsImxpc3RlUmVjdEZvcm1lMiIsImxpc3RlUmVjdEZvcm1lMyIsImxpc3RlUmVjdEZvcm1lNCIsIm1heENvdW50VXBkYXRlIiwiY291bnRVcGRhdGUiLCJ2aXN1YWxpc2F0aW9uRm9ybWVDaGVtaW4iLCJ2aXN1YWxpc2F0aW9uQm91bGUiLCIkZWwiLCJxdWVyeVNlbGVjdG9yIiwiZGlzcGxheSIsInZpc3VhbGlzYXRpb25Gb3JtZSIsIm1pcnJvckJvdWxlWCIsIm1pcnJvckJvdWxlWSIsIm9mZnNldFgiLCJvZmZzZXRZIiwiU1ZHX01BWF9YIiwiZ2V0QXR0cmlidXRlIiwiU1ZHX01BWF9ZIiwidGFiSW4iLCJpc0F2YWlsYWJsZSIsImFkZExpc3RlbmVyIiwibmV3VmFsdWVzIiwidGFiQ2hlbWluIiwidGFiRm9ybWUiLCJfbW92ZVNjcmVlblRvIiwicHJvY2VzcyIsImNvbnNvbGUiLCJsb2ciLCJlbGVtIiwiY3JlYXRlRWxlbWVudE5TIiwic2V0QXR0cmlidXRlTlMiLCJhcHBlbmRDaGlsZCIsImZvbmQiLCJwYXJzZXIiLCJET01QYXJzZXIiLCJmb25kWG1sIiwicGFyc2VGcm9tU3RyaW5nIiwiZ2V0RWxlbWVudEJ5SWQiLCJzZXRBdHRyaWJ1dGUiLCJfc3VwcHJpbWVyUmVjdENoZW1pbiIsInN0YXJ0IiwidGFiIiwiZm9ybWVYbWwiLCJib3VsZSIsImZvcm1lWG1sVGFiIiwiY2hpbGROb2RlcyIsIm5vZGVOYW1lIiwibmV3Tm9kZSIsInBhcmVudE5vZGUiLCJpbnNlcnRCZWZvcmUiLCJ2YWx1ZVgiLCJ2YWx1ZVkiLCJvYmoiLCJuZXdYIiwibmV3WSIsImFjdHUiLCJmb3JjZSIsImRpc3RhbmNlWCIsIm5lZ1giLCJpbmRpY2VQb3dYIiwiaW5kaWNlUG93WSIsIk1hdGgiLCJwb3ciLCJhYnMiLCJkaXN0YW5jZVkiLCJuZWdZIiwic2Nyb2xsIiwidGltZSIsIm5ld0xpc3QiLCJub21FbGVtZW50IiwiaW5uZXJIVE1MIiwic2xpY2UiLCJub21Gb3JtZSIsInNlbmQiLCJwYXJlbnQiLCJyZW1vdmVDaGlsZCIsImVsZW1zIiwicm90YXRlQW5nbGUiLCJjZW50cmVSb3RhdGVYIiwiY2VudHJlUm90YXRlWSIsInJheW9uWCIsInJheW9uWSIsInRyYW5zIiwidGVzdCIsInBhcnNlRmxvYXQiLCJzcGxpdCIsInJlcGxhY2UiLCJoYXV0ZXVyIiwibGFyZ2V1ciIsImxlZnQiLCJ0b3AiLCJjaGVtaW4xIiwiY2hlbWluMiIsImNoZW1pbjMiLCJmb3JtZTEiLCJmb3JtZTIiLCJmb3JtZTMiLCJmb3JtZTQiLCJwb2ludFgiLCJwb2ludFkiLCJuZXdQb2ludCIsInBhcnNlSW50IiwiYSIsImIiLCJjYWxjIiwiYW5nbGUiLCJuZXdBbmdsZSIsImNvcyIsInNpbiIsInhWYWx1ZSIsInlWYWx1ZSIsIm5vZGUiLCJ0YWdOYW1lIiwic3FydCIsImhhdXQiLCJsYXJnIiwiYWRkIiwiY29ubmVjdCIsImRlc3RpbmF0aW9uIiwiYnVmZmVyQXNzb2NpZXMiLCJtYXJrZXJBc3NvY2llcyIsImlkQnVmZmVyIiwiaWRNYXJrZXIiLCJTZWdtZW50RW5naW5lIiwiYnVmZmVyIiwiYnVmZmVycyIsInBvc2l0aW9uQXJyYXkiLCJkdXJhdGlvbkFycmF5IiwiZHVyYXRpb24iLCJwZXJpb2RBYnMiLCJwZXJpb2RSZWwiLCJjcmVhdGVHYWluIiwiZ2FpbiIsInNldFZhbHVlQXRUaW1lIiwiY3VycmVudFRpbWUiLCJpbnB1dCIsInZhbHVlIiwiY3JlYXRlQnVmZmVyU291cmNlIiwibG9vcCIsInRyaWdnZXIiLCJuZXdQZXJpb2QiLCJzZWdtZW50SW5kZXgiLCJhY3R1YWwiLCJjYW5jZWxTY2hlZHVsZWRWYWx1ZXMiLCJsaW5lYXJSYW1wVG9WYWx1ZUF0VGltZSIsImFjdHVhbDEiLCJhY3R1YWwyIiwiaWQiLCJnYWluR3JhaW4iLCJnYWluRGlyZWN0IiwicmVzZXQiLCJzZXRNb2RlbCIsInByb2JhTWF4IiwiZ2V0UHJvYmEiLCJyYW5kb20iLCJkaXJlY3QiLCJwcm9iYU1heDEiLCJwcm9iYU1heDIiLCJuZXdTZWdtZW50IiwiYWN0dWVsIiwiaXNOYU4iLCJzZWdtZW50IiwiRXhwZXJpZW5jZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBOztJQUFZQSxVOztBQUNaOzs7O0FBQ0E7O0lBQVlDLEs7O0FBQ1o7O0FBQ0E7Ozs7QUFD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Z1AsRUFBZixJQUFxQixLQUFyQjtBQUNELFdBRkQsTUFFTSxJQUFHVyxhQUFXLENBQWQsRUFBZ0I7QUFDcEIsaUJBQUszUCxTQUFMLENBQWVnUCxFQUFmLElBQXFCLElBQXJCO0FBQ0Q7QUFDRCxlQUFLalAsWUFBTCxDQUFrQmlQLEVBQWxCLElBQXdCLENBQXhCO0FBQ0EsY0FBRyxLQUFLaFAsU0FBTCxDQUFlZ1AsRUFBZixDQUFILEVBQXNCO0FBQ3BCVztBQUNELFdBRkQsTUFFSztBQUNIQTtBQUNEO0FBQ0Y7QUFDRCxhQUFLNU8sV0FBTCxDQUFpQmlPLEVBQWpCLElBQXVCVyxVQUF2QjtBQUNBLFlBQUlHLFVBQVNILGFBQVcscUJBQVdqRyxLQUFLNkYsTUFBTCxLQUFjLEtBQUs3UCxRQUE5QixDQUF4QjtBQUNBLGFBQUtLLFlBQUwsQ0FBa0JpUCxFQUFsQjtBQUNBLGFBQUsxTyxTQUFMLENBQWUwTyxFQUFmLEVBQW1CTixZQUFuQixHQUFrQ29CLE9BQWxDO0FBQ0Q7QUFDRjs7O0VBeG1DMkM5UixXQUFXK1IsVTs7a0JBQXBDblIsZ0IiLCJmaWxlIjoiUGxheWVyRXhwZXJpZW5jZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIHNvdW5kd29ya3MgZnJvbSAnc291bmR3b3Jrcy9jbGllbnQnO1xuaW1wb3J0IE15R3JhaW4yIGZyb20gJy4vTXlHcmFpbjIuanMnO1xuaW1wb3J0ICogYXMgd2F2ZXMgZnJvbSAnd2F2ZXMtYXVkaW8nO1xuaW1wb3J0IHtIaG1tRGVjb2Rlckxmb30gZnJvbSAneG1tLWxmbydcbmltcG9ydCBEZWNvZGFnZSBmcm9tICcuL0RlY29kYWdlLmpzJztcbmltcG9ydCBEZWNvZGFnZTIgZnJvbSAnLi9EZWNvZGFnZTIuanMnO1xuaW1wb3J0IERlY29kYWdlMyBmcm9tIFwiLi9EZWNvZGFnZTMuanNcIjtcblxuY29uc3QgYXVkaW9Db250ZXh0ID0gc291bmR3b3Jrcy5hdWRpb0NvbnRleHQ7XG5jb25zdCBzY2hlZHVsZXIgPSB3YXZlcy5nZXRTY2hlZHVsZXIoKTtcblxuY2xhc3MgUGxheWVyVmlldyBleHRlbmRzIHNvdW5kd29ya3MuVmlld3tcbiAgY29uc3RydWN0b3IodGVtcGxhdGUsIGNvbnRlbnQsIGV2ZW50cywgb3B0aW9ucykge1xuICAgIHN1cGVyKHRlbXBsYXRlLCBjb250ZW50LCBldmVudHMsIG9wdGlvbnMpO1xuICB9XG59XG5cbmNvbnN0IHZpZXc9IGBgO1xuXG4vLyB0aGlzIGV4cGVyaWVuY2UgcGxheXMgYSBzb3VuZCB3aGVuIGl0IHN0YXJ0cywgYW5kIHBsYXlzIGFub3RoZXIgc291bmQgd2hlblxuLy8gb3RoZXIgY2xpZW50cyBqb2luIHRoZSBleHBlcmllbmNlXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQbGF5ZXJFeHBlcmllbmNlIGV4dGVuZHMgc291bmR3b3Jrcy5FeHBlcmllbmNlIHtcbiAgY29uc3RydWN0b3IoYXNzZXRzRG9tYWluKSB7XG4gICAgc3VwZXIoKTtcbiAgICAvL1NlcnZpY2VzXG4gICAgdGhpcy5wbGF0Zm9ybSA9IHRoaXMucmVxdWlyZSgncGxhdGZvcm0nLCB7IGZlYXR1cmVzOiBbJ3dlYi1hdWRpbycsICd3YWtlLWxvY2snXSB9KTtcbiAgICB0aGlzLm1vdGlvbklucHV0ID0gdGhpcy5yZXF1aXJlKCdtb3Rpb24taW5wdXQnLCB7IGRlc2NyaXB0b3JzOiBbJ29yaWVudGF0aW9uJ10gfSk7XG4gICAgdGhpcy5sb2FkZXIgPSB0aGlzLnJlcXVpcmUoJ2xvYWRlcicsIHsgXG4gICAgICBmaWxlczogWydzb3VuZHMvbmFwcGUvZ2Fkb3VlLm1wMycsIC8vMFxuICAgICAgICAgICAgICAnc291bmRzL25hcHBlL2dhZG91ZS5tcDMnLCAvLzFcbiAgICAgICAgICAgICAgXCJzb3VuZHMvbmFwcGUvbmFnZS5tcDNcIiwgIC8vIC4uLlxuICAgICAgICAgICAgICBcInNvdW5kcy9uYXBwZS90ZW1wZXRlLm1wM1wiLFxuICAgICAgICAgICAgICBcInNvdW5kcy9uYXBwZS92ZW50Lm1wM1wiLFxuICAgICAgICAgICAgICBcInNvdW5kcy9jaGVtaW4vY2FtdXNDLm1wM1wiLCAvLyA1ICBcbiAgICAgICAgICAgICAgXCJtYXJrZXJzL2NhbXVzLmpzb25cIiwgXG4gICAgICAgICAgICAgIFwic291bmRzL2NoZW1pbi9jaHVyY2hpbGxDLm1wM1wiLCAgICBcbiAgICAgICAgICAgICAgXCJtYXJrZXJzL2NodXJjaGlsbC5qc29uXCIsXG4gICAgICAgICAgICAgIFwic291bmRzL2NoZW1pbi9pcmFrQy5tcDNcIiwgICBcbiAgICAgICAgICAgICAgXCJtYXJrZXJzL2lyYWsuanNvblwiLCAvLzEwICBcbiAgICAgICAgICAgICAgXCJzb3VuZHMvZm9ybWUvZW1pbmVtLm1wM1wiLFxuICAgICAgICAgICAgICBcInNvdW5kcy9mb3JtZS90cnVtcC5tcDNcIixcbiAgICAgICAgICAgICAgXCJzb3VuZHMvZm9ybWUvZnIubXAzXCIsXG4gICAgICAgICAgICAgIFwic291bmRzL2Zvcm1lL2JyZXhpdC5tcDNcIl1cbiAgICB9KTtcbiAgICB0aGlzLnN0YXJ0T0sgPSBmYWxzZTtcbiAgICB0aGlzLnN0YXJ0U2VnbWVudEZpbmkgPSBbXTtcbiAgICB0aGlzLm1vZGVsT0sgPSBmYWxzZTtcblxuICAgIC8vIFBBUkFNRVRSRVxuICAgIHRoaXMubmJDaGVtaW4gPSAzO1xuICAgIHRoaXMubmJGb3JtZSA9IDQ7XG4gICAgdGhpcy5xdFJhbmRvbSA9IDE0MDtcbiAgICB0aGlzLm5iU2VnbWVudCA9IFsyMzIsMTQ0LDEwNl07XG5cbiAgICAvL1xuICAgIHRoaXMuYW5jaWVuMSA9IFtdO1xuICAgIHRoaXMuYW5jaWVuMiA9IFtdO1xuICAgIHRoaXMuYW5jaWVuMyA9IGZhbHNlXG4gICAgdGhpcy5jb3VudFRpbWVvdXQgPSBbXTtcbiAgICB0aGlzLmRpcmVjdGlvbiA9IFtdO1xuICAgIHRoaXMub2xkVGFiQ2hlbWluID0gW107XG4gICAgdGhpcy5jb3VudDEgPSBbXTtcbiAgICB0aGlzLmNvdW50MiA9IFtdO1xuICAgIC8vdGhpcy5jb3VudDMgPSAwO1xuICAgIHRoaXMuY291bnQ0ID0gMTA7XG4gICAgdGhpcy5tYXhMYWcgPSAxMDtcbiAgICB0aGlzLnNlZ21lbnRlciA9IFtdO1xuICAgIHRoaXMuc2VnbWVudGVyRkIgPSBbXTtcbiAgICB0aGlzLnNlZ21lbnRlckRlbGF5RkIgPSBbXTtcbiAgICB0aGlzLnNlZ21lbnRlckdhaW4gPSBbXTtcbiAgICB0aGlzLnNlZ21lbnRlckdhaW5HcmFpbiA9IFtdO1xuICAgIHRoaXMuc291cmNlcyA9IFtdO1xuICAgIHRoaXMuZ2FpbnMgPSBbXTtcbiAgICB0aGlzLmdhaW5zRGlyZWN0aW9ucyA9IFtdO1xuICAgIHRoaXMuZ3JhaW47XG4gICAgdGhpcy5sYXN0U2VnbWVudCA9IFswLDAsMF07XG4gICAgdGhpcy5sYXN0UG9zaXRpb24gPSBbMCwwLDBdO1xuICAgIHRoaXMuZ2Fpbk91dHB1dERpcmVjdDtcbiAgICB0aGlzLmdhaW5PdXRwdXRHcmFpbjtcbiAgICB0aGlzLmdhaW5zRm9ybWUgPSBbXTtcbiAgICB0aGlzLmFuY2llbkZvcm1lID0gW2ZhbHNlLGZhbHNlLGZhbHNlLGZhbHNlXTtcbiAgICB0aGlzLmdhaW5zR3JhaW5Gb3JtZSA9IFtdO1xuICAgIHRoaXMuc291bmRGb3JtZSA9IFtdO1xuICAgIHRoaXMucmFtcEZvcm1lID0geydmb3JtZTEnOjAsICdmb3JtZTInOjAsICdmb3JtZTMnOjAsICdmb3JtZTQnIDowfTtcbiAgICB0aGlzLmNvdW50TWF4ID0gMTAwO1xuXG4gICAgZm9yKGxldCBpID0wOyBpPHRoaXMubmJDaGVtaW47aSsrKXtcbiAgICAgIHRoaXMuY291bnQxW2ldID0gMjA7XG4gICAgICB0aGlzLmNvdW50MltpXSA9IDIwO1xuICAgICAgdGhpcy5hbmNpZW4xW2ldID0gMDtcbiAgICAgIHRoaXMuYW5jaWVuMltpXSA9IDA7XG4gICAgICB0aGlzLmNvdW50VGltZW91dFtpXSA9IDA7XG4gICAgICB0aGlzLmRpcmVjdGlvbltpXSA9IHRydWU7XG4gICAgICB0aGlzLm9sZFRhYkNoZW1pbltpXSA9IHRydWU7XG4gICAgICB0aGlzLnN0YXJ0U2VnbWVudEZpbmlbaV0gPSBmYWxzZTtcbiAgICB9IFxuICB9XG5cbiAgaW5pdCgpIHtcbiAgICAvLyBpbml0aWFsaXplIHRoZSB2aWV3XG4gICAgdGhpcy52aWV3VGVtcGxhdGUgPSB2aWV3O1xuICAgIHRoaXMudmlld0NvbnRlbnQgPSB7fTtcbiAgICB0aGlzLnZpZXdDdG9yID0gUGxheWVyVmlldztcbiAgICB0aGlzLnZpZXdPcHRpb25zID0geyBwcmVzZXJ2ZVBpeGVsUmF0aW86IHRydWUgfTtcbiAgICB0aGlzLnZpZXcgPSB0aGlzLmNyZWF0ZVZpZXcoKTtcblxuICAgIC8vYmluZFxuICAgIHRoaXMuX3RvTW92ZSA9IHRoaXMuX3RvTW92ZS5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX2lzSW5FbGxpcHNlID0gdGhpcy5faXNJbkVsbGlwc2UuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9pc0luUmVjdCA9IHRoaXMuX2lzSW5SZWN0LmJpbmQodGhpcyk7XG4gICAgdGhpcy5faXNJbiA9IHRoaXMuX2lzSW4uYmluZCh0aGlzKTtcbiAgICB0aGlzLl9pc0luQ2hlbWluID0gdGhpcy5faXNJbkNoZW1pbi5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX2lzSW5Gb3JtZSA9IHRoaXMuX2lzSW5Gb3JtZS5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX2dldERpc3RhbmNlTm9kZSA9IHRoaXMuX2dldERpc3RhbmNlTm9kZS5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX2NyZWF0aW9uVW5pdmVyc1Nvbm9yZT10aGlzLl9jcmVhdGlvblVuaXZlcnNTb25vcmUuYmluZCh0aGlzKTsgICAgXG4gICAgdGhpcy5fdXBkYXRlR2FpbiA9IHRoaXMuX3VwZGF0ZUdhaW4uYmluZCh0aGlzKTtcbiAgICB0aGlzLl9yb3RhdGVQb2ludCA9IHRoaXMuX3JvdGF0ZVBvaW50LmJpbmQodGhpcyk7XG4gICAgdGhpcy5fbXlMaXN0ZW5lcj0gdGhpcy5fbXlMaXN0ZW5lci5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX2FkZEJvdWxlID0gdGhpcy5fYWRkQm91bGUuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9hZGRGb25kID0gdGhpcy5fYWRkRm9uZC5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX3NldE1vZGVsID0gdGhpcy5fc2V0TW9kZWwuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9wcm9jZXNzUHJvYmEgPSB0aGlzLl9wcm9jZXNzUHJvYmEuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9yZW1wbGFjZUZvcm1lID0gdGhpcy5fcmVtcGxhY2VGb3JtZS5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX2FkZEZvcm1lID0gdGhpcy5fYWRkRm9ybWUuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9zdGFydFNlZ21lbnRlciA9IHRoaXMuX3N0YXJ0U2VnbWVudGVyLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fZmluZE5ld1NlZ21lbnQgPSB0aGlzLl9maW5kTmV3U2VnbWVudC5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX2FjdHVhbGlzZXJTZWdtZW50SWZOb3RJbiA9IHRoaXMuX2FjdHVhbGlzZXJTZWdtZW50SWZOb3RJbi5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX2FjdHVhbGlzZXJBdWRpb0NoZW1pbiA9IHRoaXMuX2FjdHVhbGlzZXJBdWRpb0NoZW1pbi5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX2FjdHVhbGlzZXJBdWRpb0Zvcm1lID0gdGhpcy5fYWN0dWFsaXNlckF1ZGlvRm9ybWUuYmluZCh0aGlzKTtcbiAgICB0aGlzLnJlY2VpdmUoJ2ZvbmQnLChkYXRhKT0+dGhpcy5fYWRkRm9uZChkYXRhKSk7XG4gICAgdGhpcy5yZWNlaXZlKCdtb2RlbCcsKG1vZGVsLG1vZGVsMSxtb2RlbDIpPT50aGlzLl9zZXRNb2RlbChtb2RlbCxtb2RlbDEsbW9kZWwyKSk7XG4gICAgdGhpcy5yZWNlaXZlKCdyZXBvbnNlRm9ybWUnLChmb3JtZSx4LHkpPT50aGlzLl9hZGRGb3JtZShmb3JtZSx4LHkpKTtcbiB9XG5cbiAgc3RhcnQoKSB7XG4gICAgaWYoIXRoaXMuc3RhcnRPSyl7XG4gICAgICBzdXBlci5zdGFydCgpOyAvLyBkb24ndCBmb3JnZXQgdGhpc1xuICAgICAgaWYgKCF0aGlzLmhhc1N0YXJ0ZWQpXG4gICAgICAgIHRoaXMuaW5pdCgpO1xuICAgICAgdGhpcy5zaG93KCk7XG4gICAgICAvL1hNTVxuICAgICAgdGhpcy5kZWNvZGVyID0gbmV3IERlY29kYWdlKCk7XG4gICAgICAvL3RoaXMuZGVjb2RlcjIgPSBuZXcgRGVjb2RhZ2UyKCk7XG4gICAgICAvL3RoaXMuZGVjb2RlcjMgPSBuZXcgRGVjb2RhZ2UzKCk7XG4gICAgfWVsc2V7XG4gICAgICAvL1BhcmFtw6h0cmUgaW5pdGlhdXhcbiAgICAgIHRoaXMuX2FkZEJvdWxlKDEwLDEwKTtcbiAgICAgIGRvY3VtZW50LmJvZHkuc3R5bGUub3ZlcmZsb3cgPSBcImhpZGRlblwiOyAgXG4gICAgICB0aGlzLmNlbnRyZVggPSB3aW5kb3cuaW5uZXJXaWR0aC8yO1xuICAgICAgdGhpcy50YWlsbGVFY3JhblggPSB3aW5kb3cuaW5uZXJXaWR0aDtcbiAgICAgIHRoaXMudGFpbGxlRWNyYW5ZID0gd2luZG93LmlubmVySGVpZ2h0O1xuICAgICAgdGhpcy5jZW50cmVFY3JhblggPSB0aGlzLnRhaWxsZUVjcmFuWC8yO1xuICAgICAgdGhpcy5jZW50cmVFY3JhblkgPSB0aGlzLnRhaWxsZUVjcmFuWS8yO1xuICAgICAgc2V0VGltZW91dCgoKSA9PiB7dGhpcy5fbXlMaXN0ZW5lcigxMDApfSwxMDApO1xuICAgICAgdGhpcy5jZW50cmVZID0gd2luZG93LmlubmVySGVpZ2h0LzI7XG5cbiAgICAgIC8vRGV0ZWN0ZSBsZXMgZWxlbWVudHMgU1ZHXG4gICAgICB0aGlzLmxpc3RlRWxsaXBzZSA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdlbGxpcHNlJyk7XG4gICAgICB0aGlzLmxpc3RlUmVjdCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdyZWN0Jyk7XG4gICAgICB0aGlzLnRvdGFsRWxlbWVudHMgPSB0aGlzLmxpc3RlRWxsaXBzZS5sZW5ndGggKyB0aGlzLmxpc3RlUmVjdC5sZW5ndGg7XG4gICAgICB0aGlzLmxpc3RlVGV4dCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCd0ZXh0Jyk7XG4gICAgICB0aGlzLmxpc3RlRm9ybWUgPSBbXTtcbiAgICAgIHRoaXMubGlzdGVSZWN0Q2hlbWluMSA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2NoZW1pbjAnKTtcbiAgICAgIHRoaXMubGlzdGVSZWN0Q2hlbWluMiA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2NoZW1pbjEnKTtcbiAgICAgIHRoaXMubGlzdGVSZWN0Q2hlbWluMyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2NoZW1pbjInKTtcbiAgICAgIHRoaXMubGlzdGVSZWN0Rm9ybWUxID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnZm9ybWUxJyk7XG4gICAgICB0aGlzLmxpc3RlUmVjdEZvcm1lMiA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2Zvcm1lMicpO1xuICAgICAgdGhpcy5saXN0ZVJlY3RGb3JtZTMgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdmb3JtZTMnKTtcbiAgICAgIHRoaXMubGlzdGVSZWN0Rm9ybWU0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnZm9ybWU0Jyk7XG5cbiAgICAgIC8vUmVtcGxhY2UgbGVzIF90ZXh0ZXMgcGFyIGxldXIgZm9ybWUuXG4gICAgICB0aGlzLl9yZW1wbGFjZUZvcm1lKCk7IFxuXG4gICAgICAvL0Nyw6llIGwndW5pdmVycyBzb25vcmVcbiAgICAgIHRoaXMuX2NyZWF0aW9uVW5pdmVyc1Nvbm9yZSgpO1xuXG4gICAgICAvL0luaXRpc2FsaXNhdGlvblxuICAgICAgdGhpcy5tYXhDb3VudFVwZGF0ZSA9IDI7XG4gICAgICB0aGlzLmNvdW50VXBkYXRlID0gdGhpcy5tYXhDb3VudFVwZGF0ZSArIDE7IC8vIEluaXRpYWxpc2F0aW9uXG4gICAgICB0aGlzLnZpc3VhbGlzYXRpb25Gb3JtZUNoZW1pbiA9IGZhbHNlO1xuICAgICAgdGhpcy52aXN1YWxpc2F0aW9uQm91bGU9dHJ1ZTsgLy8gVmlzdWFsaXNhdGlvbiBkZSBsYSBib3VsZVxuICAgICAgaWYoIXRoaXMudmlzdWFsaXNhdGlvbkJvdWxlKXtcbiAgICAgICAgdGhpcy52aWV3LiRlbC5xdWVyeVNlbGVjdG9yKCcjYm91bGUnKS5zdHlsZS5kaXNwbGF5PSdub25lJztcbiAgICAgIH1cbiAgICAgIHRoaXMudmlzdWFsaXNhdGlvbkZvcm1lPWZhbHNlOyAvLyBWaXN1YWxpc2F0aW9uIGRlcyBmb3JtZXMgU1ZHXG4gICAgICBpZighdGhpcy52aXN1YWxpc2F0aW9uRm9ybWUpe1xuICAgICAgICBmb3IobGV0IGkgPSAwO2k8dGhpcy5saXN0ZUVsbGlwc2UubGVuZ3RoO2krKyl7XG4gICAgICAgICAgdGhpcy5saXN0ZUVsbGlwc2VbaV0uc3R5bGUuZGlzcGxheT0nbm9uZSc7XG4gICAgICAgIH1cbiAgICAgICAgZm9yKGxldCBpID0gMDtpPHRoaXMubGlzdGVSZWN0Lmxlbmd0aDtpKyspe1xuICAgICAgICAgIHRoaXMubGlzdGVSZWN0W2ldLnN0eWxlLmRpc3BsYXk9J25vbmUnO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vUG91ciBlbmVsZXZlciBsZXMgYm9yZHVyZXMgOlxuICAgICAgLy8gaWYodGhpcy52aXN1YWxpc2F0aW9uRm9ybWUpe1xuICAgICAgLy8gICBmb3IobGV0IGkgPSAwO2k8dGhpcy5saXN0ZUVsbGlwc2UubGVuZ3RoO2krKyl7XG4gICAgICAvLyAgICAgdGhpcy5saXN0ZUVsbGlwc2VbaV0uc2V0QXR0cmlidXRlKCdzdHJva2Utd2lkdGgnLDApO1xuICAgICAgLy8gICB9XG4gICAgICAvLyAgIGZvcihsZXQgaSA9IDA7aTx0aGlzLmxpc3RlUmVjdC5sZW5ndGg7aSsrKXtcbiAgICAgIC8vICAgICB0aGlzLmxpc3RlUmVjdFtpXS5zZXRBdHRyaWJ1dGUoJ3N0cm9rZS13aWR0aCcsMCk7XG4gICAgICAvLyAgIH1cbiAgICAgIC8vIH0gICBcblxuICAgICAgLy9WYXJpYWJsZXMgXG4gICAgICB0aGlzLm1pcnJvckJvdWxlWCA9IDEwO1xuICAgICAgdGhpcy5taXJyb3JCb3VsZVkgPSAxMDtcbiAgICAgIHRoaXMub2Zmc2V0WCA9IDA7IC8vIEluaXRpc2FsaXNhdGlvbiBkdSBvZmZzZXRcbiAgICAgIHRoaXMub2Zmc2V0WSA9IDBcbiAgICAgIHRoaXMuU1ZHX01BWF9YID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3N2ZycpWzBdLmdldEF0dHJpYnV0ZSgnd2lkdGgnKTtcbiAgICAgIHRoaXMuU1ZHX01BWF9ZID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3N2ZycpWzBdLmdldEF0dHJpYnV0ZSgnaGVpZ2h0Jyk7XG5cbiAgICAgIC8vIEdlc3Rpb24gZGUgbCdvcmllbnRhdGlvblxuICAgICAgdGhpcy50YWJJbjtcbiAgICAgIGlmICh0aGlzLm1vdGlvbklucHV0LmlzQXZhaWxhYmxlKCdvcmllbnRhdGlvbicpKSB7XG4gICAgICAgIHRoaXMubW90aW9uSW5wdXQuYWRkTGlzdGVuZXIoJ29yaWVudGF0aW9uJywgKGRhdGEpID0+IHtcbiAgICAgICAgICAvL2lmKHRoaXMuY291bnQzPnRoaXMubWF4TGFnKXtcbiAgICAgICAgICAgIGNvbnN0IG5ld1ZhbHVlcyA9IHRoaXMuX3RvTW92ZShkYXRhWzJdLGRhdGFbMV0tMjUpO1xuICAgICAgICAgICAgaWYodGhpcy5jb3VudDQ+dGhpcy5tYXhMYWcpe1xuICAgICAgICAgICAgICB0aGlzLnRhYkluID0gdGhpcy5faXNJbihuZXdWYWx1ZXNbMF0sbmV3VmFsdWVzWzFdKTtcbiAgICAgICAgICAgICAgdGhpcy50YWJDaGVtaW4gPSB0aGlzLl9pc0luQ2hlbWluKG5ld1ZhbHVlc1swXSxuZXdWYWx1ZXNbMV0pO1xuICAgICAgICAgICAgICB0aGlzLnRhYkZvcm1lID0gdGhpcy5faXNJbkZvcm1lKG5ld1ZhbHVlc1swXSwgbmV3VmFsdWVzWzFdKTtcbiAgICAgICAgICAgICAgdGhpcy5jb3VudDQ9LTE7XG4gICAgICAgICAgICAgIGlmKHRoaXMuY291bnRVcGRhdGU+dGhpcy5tYXhDb3VudFVwZGF0ZSl7XG4gICAgICAgICAgICAgICAgdGhpcy5fdXBkYXRlR2Fpbih0aGlzLnRhYkluKTtcbiAgICAgICAgICAgICAgICB0aGlzLmNvdW50VXBkYXRlID0gMDtcbiAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgdGhpcy5jb3VudFVwZGF0ZSsrO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuY291bnQ0Kys7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBpZih0aGlzLm1vZGVsT2smJiEodGhpcy50YWJDaGVtaW5bMF0mJnRoaXMudGFiQ2hlbWluWzFdJiZ0aGlzLnRhYkNoZW1pblsyXSkpe1xuICAgICAgICAgICAgLy8gICB0aGlzLmRlY29kZXIxLnJlc2V0KCk7XG4gICAgICAgICAgICAvLyAgIHRoaXMuZGVjb2RlcjIucmVzZXQoKTtcbiAgICAgICAgICAgIC8vIH1cbiAgICAgICAgICAgIC8vY29uc29sZS5sb2codGhpcy50YWJGb3JtZSk7XG4gICAgICAgICAgICAvLyBpZih0aGlzLm1vZGVsT2smJiEodGhpcy50YWJGb3JtZVswXSYmdGhpcy50YWJGb3JtZVsxXSYmdGhpcy50YWJGb3JtZVsyXSYmdGhpcy50YWJGb3JtZVszXSkpe1xuICAgICAgICAgICAgLy8gICB0aGlzLmRlY29kZXIucmVzZXQoKTtcbiAgICAgICAgICAgIC8vIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy5fbW92ZVNjcmVlblRvKG5ld1ZhbHVlc1swXSxuZXdWYWx1ZXNbMV0sMC4wOCk7XG4gICAgICAgICAgICAvLyBYTU1cbiAgICAgICAgICAgIGlmKHRoaXMubW9kZWxPSyl7XG4gICAgICAgICAgICAgIHRoaXMuZGVjb2Rlci5wcm9jZXNzKG5ld1ZhbHVlc1swXSxuZXdWYWx1ZXNbMV0pO1xuICAgICAgICAgICAgICAvL3RoaXMuZGVjb2RlcjIucHJvY2VzcyhuZXdWYWx1ZXNbMF0sbmV3VmFsdWVzWzFdKTtcbiAgICAgICAgICAgICAgLy90aGlzLmRlY29kZXIzLnByb2Nlc3MobmV3VmFsdWVzWzBdLG5ld1ZhbHVlc1sxXSk7XG4gICAgICAgICAgICAgIHRoaXMuX3Byb2Nlc3NQcm9iYSgpO1xuICAgICAgICAgICAgICAvL3RoaXMuY291bnQzID0wO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIC8vIH1lbHNle1xuICAgICAgICAgIC8vICAgdGhpcy5jb3VudDMrKztcbiAgICAgICAgICAvLyB9XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJPcmllbnRhdGlvbiBub24gZGlzcG9uaWJsZVwiKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuLyogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tTU9VVkVNRU5UIERFIEwgRUNSQU4gLyBJTUFHRVMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gKi9cblxuICAvKiBBam91dGUgbGEgYm91bGUgYXUgZm9uZCAqL1xuICBfYWRkQm91bGUoeCx5KXtcbiAgICBjb25zdCBlbGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKCdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycsJ2NpcmNsZScpO1xuICAgIGVsZW0uc2V0QXR0cmlidXRlTlMobnVsbCxcImN4XCIseCk7XG4gICAgZWxlbS5zZXRBdHRyaWJ1dGVOUyhudWxsLFwiY3lcIix5KTtcbiAgICBlbGVtLnNldEF0dHJpYnV0ZU5TKG51bGwsXCJyXCIsMTApO1xuICAgIGVsZW0uc2V0QXR0cmlidXRlTlMobnVsbCxcInN0cm9rZVwiLCd3aGl0ZScpO1xuICAgIGVsZW0uc2V0QXR0cmlidXRlTlMobnVsbCxcInN0cm9rZS13aWR0aFwiLDMpO1xuICAgIGVsZW0uc2V0QXR0cmlidXRlTlMobnVsbCxcImZpbGxcIiwnYmxhY2snKTtcbiAgICBlbGVtLnNldEF0dHJpYnV0ZU5TKG51bGwsXCJpZFwiLCdib3VsZScpO1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzdmcnKVswXS5hcHBlbmRDaGlsZChlbGVtKTtcbiAgfVxuXG4gIC8qIEFqb3V0ZSBsZSBmb25kICovXG4gIF9hZGRGb25kKGZvbmQpe1xuICAgIC8vIE9uIHBhcnNlIGxlIGZpY2hpZXIgU1ZHIGVuIERPTVxuICAgIGNvbnN0IHBhcnNlciA9IG5ldyBET01QYXJzZXIoKTtcbiAgICBsZXQgZm9uZFhtbCA9IHBhcnNlci5wYXJzZUZyb21TdHJpbmcoZm9uZCwnYXBwbGljYXRpb24veG1sJyk7XG4gICAgZm9uZFhtbCA9IGZvbmRYbWwuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3N2ZycpWzBdO1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdleHBlcmllbmNlJykuYXBwZW5kQ2hpbGQoZm9uZFhtbCk7XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3N2ZycpWzBdLnNldEF0dHJpYnV0ZSgnaWQnLCdzdmdFbGVtZW50JylcbiAgICB0aGlzLl9zdXBwcmltZXJSZWN0Q2hlbWluKCk7XG4gICAgdGhpcy5zdGFydE9LID0gdHJ1ZTtcbiAgICB0aGlzLnN0YXJ0KCk7XG4gIH1cblxuICAvKiBTdXBwcmltZSBsZXMgcmVjdGFuZ2xlcyBxdWkgc3VpdmVudCBsZXMgY2hlbWlucyAqL1xuICBfc3VwcHJpbWVyUmVjdENoZW1pbigpe1xuICAgIGxldCB0YWIgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdjaGVtaW4wJyk7XG4gICAgaWYoIXRoaXMudmlzdWFsaXNhdGlvbkZvcm1lQ2hlbWluKXtcbiAgICAgIGZvcihsZXQgaSA9MCA7aTx0YWIubGVuZ3RoO2krKyl7XG4gICAgICAgIHRhYltpXS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgfVxuXG4gICAgICB0YWIgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdjaGVtaW4xJyk7XG4gICAgICBmb3IobGV0IGkgPTAgO2k8dGFiLmxlbmd0aDtpKyspe1xuICAgICAgICB0YWJbaV0uc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgIH1cblxuICAgICAgdGFiID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnY2hlbWluMicpO1xuICAgICAgZm9yKGxldCBpID0wIDtpPHRhYi5sZW5ndGg7aSsrKXtcbiAgICAgICAgdGFiW2ldLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgX2FkZEZvcm1lKGZvcm1lLHgseSl7XG4gICAgLy8gT24gcGFyc2UgbGUgZmljaGllciBTVkcgZW4gRE9NXG4gICAgY29uc3QgcGFyc2VyID0gbmV3IERPTVBhcnNlcigpO1xuICAgIGxldCBmb3JtZVhtbCA9IHBhcnNlci5wYXJzZUZyb21TdHJpbmcoZm9ybWUsJ2FwcGxpY2F0aW9uL3htbCcpO1xuICAgIGZvcm1lWG1sID0gZm9ybWVYbWwuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2cnKVswXTtcbiAgICBsZXQgYm91bGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYm91bGUnKTtcbiAgICBjb25zdCBmb3JtZVhtbFRhYiA9IGZvcm1lWG1sLmNoaWxkTm9kZXM7XG4gICAgZm9yKGxldCBpID0gMDsgaTxmb3JtZVhtbFRhYi5sZW5ndGg7aSsrKXtcbiAgICAgIGlmKGZvcm1lWG1sVGFiW2ldLm5vZGVOYW1lID09ICdwYXRoJyl7XG4gICAgICAgIGNvbnN0IG5ld05vZGUgPSBib3VsZS5wYXJlbnROb2RlLmluc2VydEJlZm9yZShmb3JtZVhtbFRhYltpXSxib3VsZSk7XG4gICAgICAgIHRoaXMubGlzdGVGb3JtZVt0aGlzLmxpc3RlRm9ybWUubGVuZ3RoXSA9IG5ld05vZGUuc2V0QXR0cmlidXRlKCd0cmFuc2Zvcm0nLCd0cmFuc2xhdGUoJyt4KycgJyt5KycpJyk7XG4gICAgICB9XG4gICAgfSBcbiAgfVxuXG4gIC8qIENhbGxiYWNrIG9yaWVudGF0aW9uTW90aW9uIC8gTW91dmVtZW50IGRlIGxhIGJvdWxlKi9cbiAgX3RvTW92ZSh2YWx1ZVgsdmFsdWVZKXtcbiAgICBjb25zdCBvYmogPSB0aGlzLnZpZXcuJGVsLnF1ZXJ5U2VsZWN0b3IoJyNib3VsZScpO1xuICAgIGxldCBuZXdYO1xuICAgIGxldCBuZXdZO1xuICAgIGxldCBhY3R1ID0gdGhpcy5taXJyb3JCb3VsZVgrdmFsdWVYKjAuMztcbiAgICBpZihhY3R1PHRoaXMub2Zmc2V0WCl7XG4gICAgICBhY3R1PSB0aGlzLm9mZnNldFggO1xuICAgIH1lbHNlIGlmKGFjdHUgPih0aGlzLnRhaWxsZUVjcmFuWCt0aGlzLm9mZnNldFgpKXtcbiAgICAgIGFjdHU9IHRoaXMudGFpbGxlRWNyYW5YK3RoaXMub2Zmc2V0WFxuICAgIH1cbiAgICBpZih0aGlzLnZpc3VhbGlzYXRpb25Cb3VsZSl7XG4gICAgICBvYmouc2V0QXR0cmlidXRlKCdjeCcsIGFjdHUpO1xuICAgIH1cbiAgICB0aGlzLm1pcnJvckJvdWxlWCA9IGFjdHU7XG4gICAgbmV3WD1hY3R1O1xuICAgIGFjdHUgPSB0aGlzLm1pcnJvckJvdWxlWSt2YWx1ZVkqMC4zO1xuICAgIGlmKGFjdHU8KHRoaXMub2Zmc2V0WSkpe1xuICAgICAgYWN0dT0gdGhpcy5vZmZzZXRZO1xuICAgIH1cbiAgICBpZihhY3R1ID4gKHRoaXMudGFpbGxlRWNyYW5ZK3RoaXMub2Zmc2V0WSkpe1xuICAgICAgYWN0dSA9IHRoaXMudGFpbGxlRWNyYW5ZK3RoaXMub2Zmc2V0WTtcbiAgICB9XG4gICAgaWYodGhpcy52aXN1YWxpc2F0aW9uQm91bGUpe1xuICAgICAgb2JqLnNldEF0dHJpYnV0ZSgnY3knLCBhY3R1KTtcbiAgICB9XG4gICAgdGhpcy5taXJyb3JCb3VsZVk9IGFjdHU7XG4gICAgbmV3WT1hY3R1O1xuICAgIHJldHVybiBbbmV3WCxuZXdZXTtcbiAgfVxuXG4gIC8vIETDqXBsYWNlIGwnw6ljcmFuIGRhbnMgbGEgbWFwXG4gIF9tb3ZlU2NyZWVuVG8oeCx5LGZvcmNlPTEpe1xuICAgIGxldCBkaXN0YW5jZVggPSAoeC10aGlzLm9mZnNldFgpLXRoaXMuY2VudHJlRWNyYW5YO1xuICAgIGxldCBuZWdYID0gZmFsc2U7XG4gICAgbGV0IGluZGljZVBvd1ggPSAzO1xuICAgIGxldCBpbmRpY2VQb3dZID0gMztcbiAgICBpZihkaXN0YW5jZVg8MCl7XG4gICAgICBuZWdYID0gdHJ1ZTtcbiAgICB9XG4gICAgZGlzdGFuY2VYID0gTWF0aC5wb3coKE1hdGguYWJzKGRpc3RhbmNlWC90aGlzLmNlbnRyZUVjcmFuWCkpLGluZGljZVBvd1gpKnRoaXMuY2VudHJlRWNyYW5YOyBcbiAgICBpZihuZWdYKXtcbiAgICAgIGRpc3RhbmNlWCAqPSAtMTtcbiAgICB9XG4gICAgaWYodGhpcy5vZmZzZXRYKyhkaXN0YW5jZVgqZm9yY2UpPj0wJiYodGhpcy5vZmZzZXRYKyhkaXN0YW5jZVgqZm9yY2UpPD10aGlzLlNWR19NQVhfWC10aGlzLnRhaWxsZUVjcmFuWCkpe1xuICAgICAgdGhpcy5vZmZzZXRYICs9IChkaXN0YW5jZVgqZm9yY2UpO1xuICAgIH1cblxuICAgIGxldCBkaXN0YW5jZVkgPSAoeS10aGlzLm9mZnNldFkpLXRoaXMuY2VudHJlRWNyYW5ZO1xuICAgIGxldCBuZWdZID0gZmFsc2U7XG4gICAgaWYoZGlzdGFuY2VZPDApe1xuICAgICAgbmVnWSA9IHRydWU7XG4gICAgfVxuICAgIGRpc3RhbmNlWSA9IE1hdGgucG93KChNYXRoLmFicyhkaXN0YW5jZVkvdGhpcy5jZW50cmVFY3JhblkpKSxpbmRpY2VQb3dZKSp0aGlzLmNlbnRyZUVjcmFuWTtcbiAgICBpZihuZWdZKXtcbiAgICAgIGRpc3RhbmNlWSAqPSAtMTtcbiAgICB9XG4gICAgaWYoKHRoaXMub2Zmc2V0WSsoZGlzdGFuY2VZKmZvcmNlKT49MCkmJih0aGlzLm9mZnNldFkrKGRpc3RhbmNlWSpmb3JjZSk8PXRoaXMuU1ZHX01BWF9ZLXRoaXMudGFpbGxlRWNyYW5ZKSl7XG4gICAgICB0aGlzLm9mZnNldFkgKz0gKGRpc3RhbmNlWSpmb3JjZSk7XG4gICAgfVxuICAgIHdpbmRvdy5zY3JvbGwodGhpcy5vZmZzZXRYLHRoaXMub2Zmc2V0WSlcbiAgfVxuXG4gIF9teUxpc3RlbmVyKHRpbWUpe1xuICAgIHRoaXMudGFpbGxlRWNyYW5YID0gd2luZG93LmlubmVyV2lkdGg7XG4gICAgdGhpcy50YWlsbGVFY3JhblkgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG4gICAgc2V0VGltZW91dCh0aGlzLl9teUxpc3RlbmVyLHRpbWUpO1xuICB9XG5cbiAgX3JlbXBsYWNlRm9ybWUoKXtcbiAgICBsZXQgbmV3TGlzdCA9IFtdO1xuICAgIGZvcihsZXQgaSA9IDA7IGkgPCB0aGlzLmxpc3RlVGV4dC5sZW5ndGg7IGkrKyl7XG4gICAgICBuZXdMaXN0W2ldPXRoaXMubGlzdGVUZXh0W2ldO1xuICAgIH1cbiAgICBmb3IobGV0IGkgPSAwOyBpIDwgbmV3TGlzdC5sZW5ndGg7IGkrKyl7XG4gICAgICBjb25zdCBub21FbGVtZW50ID0gbmV3TGlzdFtpXS5pbm5lckhUTUw7XG4gICAgICAgaWYobm9tRWxlbWVudC5zbGljZSgwLDEpPT0nXycpe1xuXG4gICAgICAgICBjb25zdCBub21Gb3JtZSA9IG5vbUVsZW1lbnQuc2xpY2UoMSxub21FbGVtZW50Lmxlbmd0aCk7XG4gICAgICAgICBjb25zdCB4ID0gbmV3TGlzdFtpXS5nZXRBdHRyaWJ1dGUoJ3gnKTtcbiAgICAgICAgIGNvbnN0IHkgPSBuZXdMaXN0W2ldLmdldEF0dHJpYnV0ZSgneScpO1xuICAgICAgICAgdGhpcy5zZW5kKCdkZW1hbmRlRm9ybWUnLG5vbUZvcm1lLHgseSk7XG4gICAgICAgICBjb25zdCBwYXJlbnQgPSBuZXdMaXN0W2ldLnBhcmVudE5vZGU7XG4gICAgICAgICBwYXJlbnQucmVtb3ZlQ2hpbGQobmV3TGlzdFtpXSk7XG4gICAgICAgICBjb25zdCBlbGVtcyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUobm9tRm9ybWUpO1xuICAgICAgICAgZm9yKGxldCBpID0gMDsgaTxlbGVtcy5sZW5ndGg7aSsrKXtcbiAgICAgICAgICAgIGVsZW1zW2ldLnN0eWxlLmRpc3BsYXk9J25vbmUnO1xuICAgICAgICAgfVxuICAgICAgIH1cbiAgICB9XG4gIH1cblxuLyogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tREVURVJNSU5BVElPTiBERVMgSU4vT1VUIERFUyBGT1JNRVMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gKi9cblxuICAvLyBGb25jdGlvbiBxdWkgcGVybWV0IGRlIGNvbm5hw650cmUgbCdlbnNlbWJsZSBkZXMgZmlndXJlcyBvw7kgbGUgcG9pbnQgc2Ugc2l0dWVcbiAgX2lzSW4oeCx5KXtcbiAgICBsZXQgdGFiID0gW107XG4gICAgbGV0IHJvdGF0ZUFuZ2xlO1xuICAgIGxldCBjZW50cmVSb3RhdGVYO1xuICAgIGxldCBjZW50cmVSb3RhdGVZO1xuICAgIGZvcihsZXQgaT0wO2k8dGhpcy5saXN0ZUVsbGlwc2UubGVuZ3RoO2krKyl7XG4gICAgICByb3RhdGVBbmdsZT0wO1xuICAgICAgY29uc3QgY2VudHJlWCA9IHRoaXMubGlzdGVFbGxpcHNlW2ldLmdldEF0dHJpYnV0ZSgnY3gnKTtcbiAgICAgIGNvbnN0IGNlbnRyZVkgPSB0aGlzLmxpc3RlRWxsaXBzZVtpXS5nZXRBdHRyaWJ1dGUoJ2N5Jyk7XG4gICAgICBjb25zdCByYXlvblggPSB0aGlzLmxpc3RlRWxsaXBzZVtpXS5nZXRBdHRyaWJ1dGUoJ3J4Jyk7XG4gICAgICBjb25zdCByYXlvblkgPSB0aGlzLmxpc3RlRWxsaXBzZVtpXS5nZXRBdHRyaWJ1dGUoJ3J5Jyk7XG4gICAgICBsZXQgdHJhbnMgPSB0aGlzLmxpc3RlRWxsaXBzZVtpXS5nZXRBdHRyaWJ1dGUoJ3RyYW5zZm9ybScpO1xuICAgICAgaWYoL3JvdGF0ZS8udGVzdCh0cmFucykpe1xuICAgICAgICB0cmFucyA9IHRyYW5zLnNsaWNlKDcsdHJhbnMubGVuZ3RoKTtcbiAgICAgICAgY2VudHJlUm90YXRlWCA9IHBhcnNlRmxvYXQodHJhbnMuc3BsaXQoXCIgXCIpWzFdKTtcbiAgICAgICAgY2VudHJlUm90YXRlWSA9IHBhcnNlRmxvYXQodHJhbnMuc3BsaXQoXCIsXCIpWzFdLnJlcGxhY2UoXCIpXCIsXCJcIikpO1xuICAgICAgICByb3RhdGVBbmdsZSA9IHBhcnNlRmxvYXQodHJhbnMuc3BsaXQoXCIgXCIpWzBdKTtcbiAgICAgIH1cbiAgICAgIHRhYlt0YWIubGVuZ3RoXT10aGlzLl9pc0luRWxsaXBzZShwYXJzZUZsb2F0KGNlbnRyZVgpLHBhcnNlRmxvYXQoY2VudHJlWSkscGFyc2VGbG9hdChyYXlvblgpLHBhcnNlRmxvYXQocmF5b25ZKSx4LHkscm90YXRlQW5nbGUsY2VudHJlUm90YXRlWCxjZW50cmVSb3RhdGVZKTsgICAgIFxuICAgIH1cbiAgICBmb3IobGV0IGk9MDtpPHRoaXMubGlzdGVSZWN0Lmxlbmd0aDtpKyspe1xuICAgICAgcm90YXRlQW5nbGU9MDtcbiAgICAgIGNlbnRyZVJvdGF0ZVg9bnVsbDtcbiAgICAgIGNlbnRyZVJvdGF0ZVk9bnVsbDtcbiAgICAgIGNvbnN0IGhhdXRldXIgPSB0aGlzLmxpc3RlUmVjdFtpXS5nZXRBdHRyaWJ1dGUoJ3dpZHRoJyk7XG4gICAgICBjb25zdCBsYXJnZXVyID0gdGhpcy5saXN0ZVJlY3RbaV0uZ2V0QXR0cmlidXRlKCdoZWlnaHQnKTtcbiAgICAgIGNvbnN0IGxlZnQgPSB0aGlzLmxpc3RlUmVjdFtpXS5nZXRBdHRyaWJ1dGUoJ3gnKTtcbiAgICAgIGNvbnN0IHRvcCA9IHRoaXMubGlzdGVSZWN0W2ldLmdldEF0dHJpYnV0ZSgneScpO1xuICAgICAgbGV0IHRyYW5zID0gdGhpcy5saXN0ZVJlY3RbaV0uZ2V0QXR0cmlidXRlKCd0cmFuc2Zvcm0nKTtcbiAgICAgIGlmKC9yb3RhdGUvLnRlc3QodHJhbnMpKXtcbiAgICAgICAgdHJhbnMgPSB0cmFucy5zbGljZSg3LHRyYW5zLmxlbmd0aCk7XG4gICAgICAgIGNlbnRyZVJvdGF0ZVggPSBwYXJzZUZsb2F0KHRyYW5zLnNwbGl0KFwiIFwiKVsxXSk7XG4gICAgICAgIGNlbnRyZVJvdGF0ZVkgPSBwYXJzZUZsb2F0KHRyYW5zLnNwbGl0KFwiLFwiKVsxXS5yZXBsYWNlKFwiKVwiLFwiXCIpKTtcbiAgICAgICAgcm90YXRlQW5nbGUgPSBwYXJzZUZsb2F0KHRyYW5zLnNwbGl0KFwiIFwiKVswXSk7XG4gICAgICB9XG4gICAgICB0YWJbdGFiLmxlbmd0aF09dGhpcy5faXNJblJlY3QocGFyc2VGbG9hdChoYXV0ZXVyKSwgcGFyc2VGbG9hdChsYXJnZXVyKSwgcGFyc2VGbG9hdChsZWZ0KSwgcGFyc2VGbG9hdCh0b3ApLCB4LCB5LHJvdGF0ZUFuZ2xlLGNlbnRyZVJvdGF0ZVgsY2VudHJlUm90YXRlWSk7XG4gICAgfSAgXG4gICAgcmV0dXJuIHRhYjtcbiAgfVxuXG4gIC8vIEZvbmN0aW4gcXVpIGRpdCBkYW5zIHF1ZWwgY2hlbWluIG9uIHNlIHRyb3V2ZVxuICBfaXNJbkNoZW1pbih4LHkpe1xuXG4gICAgLy9WYXJpYWJsZXNcbiAgICBsZXQgcm90YXRlQW5nbGU7XG4gICAgbGV0IGNlbnRyZVJvdGF0ZVg7XG4gICAgbGV0IGNlbnRyZVJvdGF0ZVk7XG4gICAgbGV0IGhhdXRldXI7XG4gICAgbGV0IGxhcmdldXI7XG4gICAgbGV0IGxlZnQ7XG4gICAgbGV0IHRvcDtcbiAgICBsZXQgdHJhbnM7XG4gICAgbGV0IGkgPTA7XG5cbiAgICAvL0NIRU1JTiAxXG4gICAgbGV0IGNoZW1pbjEgPSBmYWxzZTtcbiAgICB3aGlsZSghY2hlbWluMSAmJiBpPHRoaXMubGlzdGVSZWN0Q2hlbWluMS5sZW5ndGgpe1xuICAgICAgcm90YXRlQW5nbGU9MDtcbiAgICAgIGNlbnRyZVJvdGF0ZVg9bnVsbDtcbiAgICAgIGNlbnRyZVJvdGF0ZVk9bnVsbDtcbiAgICAgIGhhdXRldXIgPSB0aGlzLmxpc3RlUmVjdENoZW1pbjFbaV0uZ2V0QXR0cmlidXRlKCd3aWR0aCcpO1xuICAgICAgbGFyZ2V1ciA9IHRoaXMubGlzdGVSZWN0Q2hlbWluMVtpXS5nZXRBdHRyaWJ1dGUoJ2hlaWdodCcpO1xuICAgICAgbGVmdCA9IHRoaXMubGlzdGVSZWN0Q2hlbWluMVtpXS5nZXRBdHRyaWJ1dGUoJ3gnKTtcbiAgICAgIHRvcCA9IHRoaXMubGlzdGVSZWN0Q2hlbWluMVtpXS5nZXRBdHRyaWJ1dGUoJ3knKTtcbiAgICAgIGxldCB0cmFucyA9IHRoaXMubGlzdGVSZWN0Q2hlbWluMVtpXS5nZXRBdHRyaWJ1dGUoJ3RyYW5zZm9ybScpO1xuICAgICAgaWYoL3JvdGF0ZS8udGVzdCh0cmFucykpe1xuICAgICAgICB0cmFucyA9IHRyYW5zLnNsaWNlKDcsdHJhbnMubGVuZ3RoKTtcbiAgICAgICAgY2VudHJlUm90YXRlWCA9IHBhcnNlRmxvYXQodHJhbnMuc3BsaXQoXCIgXCIpWzFdKTtcbiAgICAgICAgY2VudHJlUm90YXRlWSA9IHBhcnNlRmxvYXQodHJhbnMuc3BsaXQoXCIsXCIpWzFdLnJlcGxhY2UoXCIpXCIsXCJcIikpO1xuICAgICAgICByb3RhdGVBbmdsZSA9IHBhcnNlRmxvYXQodHJhbnMuc3BsaXQoXCIgXCIpWzBdKTtcbiAgICAgIH1cbiAgICAgIGNoZW1pbjEgPSB0aGlzLl9pc0luUmVjdChwYXJzZUZsb2F0KGhhdXRldXIpLCBwYXJzZUZsb2F0KGxhcmdldXIpLCBwYXJzZUZsb2F0KGxlZnQpLCBwYXJzZUZsb2F0KHRvcCksIHgsIHkscm90YXRlQW5nbGUsY2VudHJlUm90YXRlWCxjZW50cmVSb3RhdGVZKTtcbiAgICAgIGkrKztcbiAgICB9XG5cbiAgICAvL0NIRU1JTiAyXG4gICAgbGV0IGNoZW1pbjIgPSBmYWxzZTtcbiAgICBpID0wO1xuICAgIHdoaWxlKCFjaGVtaW4yICYmIGk8dGhpcy5saXN0ZVJlY3RDaGVtaW4yLmxlbmd0aCl7XG4gICAgICByb3RhdGVBbmdsZT0wO1xuICAgICAgY2VudHJlUm90YXRlWD1udWxsO1xuICAgICAgY2VudHJlUm90YXRlWT1udWxsO1xuICAgICAgaGF1dGV1ciA9IHRoaXMubGlzdGVSZWN0Q2hlbWluMltpXS5nZXRBdHRyaWJ1dGUoJ3dpZHRoJyk7XG4gICAgICBsYXJnZXVyID0gdGhpcy5saXN0ZVJlY3RDaGVtaW4yW2ldLmdldEF0dHJpYnV0ZSgnaGVpZ2h0Jyk7XG4gICAgICBsZWZ0ID0gdGhpcy5saXN0ZVJlY3RDaGVtaW4yW2ldLmdldEF0dHJpYnV0ZSgneCcpO1xuICAgICAgdG9wID0gdGhpcy5saXN0ZVJlY3RDaGVtaW4yW2ldLmdldEF0dHJpYnV0ZSgneScpO1xuICAgICAgdHJhbnMgPSB0aGlzLmxpc3RlUmVjdENoZW1pbjJbaV0uZ2V0QXR0cmlidXRlKCd0cmFuc2Zvcm0nKTtcbiAgICAgIGlmKC9yb3RhdGUvLnRlc3QodHJhbnMpKXtcbiAgICAgICAgdHJhbnMgPSB0cmFucy5zbGljZSg3LHRyYW5zLmxlbmd0aCk7XG4gICAgICAgIGNlbnRyZVJvdGF0ZVggPSBwYXJzZUZsb2F0KHRyYW5zLnNwbGl0KFwiIFwiKVsxXSk7XG4gICAgICAgIGNlbnRyZVJvdGF0ZVkgPSBwYXJzZUZsb2F0KHRyYW5zLnNwbGl0KFwiLFwiKVsxXS5yZXBsYWNlKFwiKVwiLFwiXCIpKTtcbiAgICAgICAgcm90YXRlQW5nbGUgPSBwYXJzZUZsb2F0KHRyYW5zLnNwbGl0KFwiIFwiKVswXSk7XG4gICAgICB9XG4gICAgICBjaGVtaW4yID0gdGhpcy5faXNJblJlY3QocGFyc2VGbG9hdChoYXV0ZXVyKSwgcGFyc2VGbG9hdChsYXJnZXVyKSwgcGFyc2VGbG9hdChsZWZ0KSwgcGFyc2VGbG9hdCh0b3ApLCB4LCB5LHJvdGF0ZUFuZ2xlLGNlbnRyZVJvdGF0ZVgsY2VudHJlUm90YXRlWSk7XG4gICAgICBpKys7XG4gICAgfVxuXG4gICAgLy9DSEVNSU4gM1xuICAgIGxldCBjaGVtaW4zID0gZmFsc2U7XG4gICAgaSA9MDtcbiAgICB3aGlsZSghY2hlbWluMyAmJiBpPHRoaXMubGlzdGVSZWN0Q2hlbWluMy5sZW5ndGgpe1xuICAgICAgcm90YXRlQW5nbGU9MDtcbiAgICAgIGNlbnRyZVJvdGF0ZVg9bnVsbDtcbiAgICAgIGNlbnRyZVJvdGF0ZVk9bnVsbDtcbiAgICAgIGhhdXRldXIgPSB0aGlzLmxpc3RlUmVjdENoZW1pbjNbaV0uZ2V0QXR0cmlidXRlKCd3aWR0aCcpO1xuICAgICAgbGFyZ2V1ciA9IHRoaXMubGlzdGVSZWN0Q2hlbWluM1tpXS5nZXRBdHRyaWJ1dGUoJ2hlaWdodCcpO1xuICAgICAgbGVmdCA9IHRoaXMubGlzdGVSZWN0Q2hlbWluM1tpXS5nZXRBdHRyaWJ1dGUoJ3gnKTtcbiAgICAgIHRvcCA9IHRoaXMubGlzdGVSZWN0Q2hlbWluM1tpXS5nZXRBdHRyaWJ1dGUoJ3knKTtcbiAgICAgIHRyYW5zID0gdGhpcy5saXN0ZVJlY3RDaGVtaW4zW2ldLmdldEF0dHJpYnV0ZSgndHJhbnNmb3JtJyk7XG4gICAgICBpZigvcm90YXRlLy50ZXN0KHRyYW5zKSl7XG4gICAgICAgIHRyYW5zID0gdHJhbnMuc2xpY2UoNyx0cmFucy5sZW5ndGgpO1xuICAgICAgICBjZW50cmVSb3RhdGVYID0gcGFyc2VGbG9hdCh0cmFucy5zcGxpdChcIiBcIilbMV0pO1xuICAgICAgICBjZW50cmVSb3RhdGVZID0gcGFyc2VGbG9hdCh0cmFucy5zcGxpdChcIixcIilbMV0ucmVwbGFjZShcIilcIixcIlwiKSk7XG4gICAgICAgIHJvdGF0ZUFuZ2xlID0gcGFyc2VGbG9hdCh0cmFucy5zcGxpdChcIiBcIilbMF0pO1xuICAgICAgfVxuICAgICAgY2hlbWluMyA9IHRoaXMuX2lzSW5SZWN0KHBhcnNlRmxvYXQoaGF1dGV1ciksIHBhcnNlRmxvYXQobGFyZ2V1ciksIHBhcnNlRmxvYXQobGVmdCksIHBhcnNlRmxvYXQodG9wKSwgeCwgeSxyb3RhdGVBbmdsZSxjZW50cmVSb3RhdGVYLGNlbnRyZVJvdGF0ZVkpO1xuICAgICAgaSsrO1xuICAgIH0gICAgICAgIFxuICAgIHJldHVybiBbY2hlbWluMSxjaGVtaW4yLGNoZW1pbjNdO1xuICB9XG5cbiAgX2lzSW5Gb3JtZSh4LHkpe1xuICAgIC8vVmFyaWFibGVzXG4gICAgbGV0IHJvdGF0ZUFuZ2xlO1xuICAgIGxldCBjZW50cmVSb3RhdGVYO1xuICAgIGxldCBjZW50cmVSb3RhdGVZO1xuICAgIGxldCBoYXV0ZXVyO1xuICAgIGxldCBsYXJnZXVyO1xuICAgIGxldCBsZWZ0O1xuICAgIGxldCB0b3A7XG4gICAgbGV0IHRyYW5zO1xuICAgIGxldCBpID0wO1xuXG4gICAgLy9GT1JNRSAxXG4gICAgbGV0IGZvcm1lMSA9IGZhbHNlO1xuICAgIHdoaWxlKCFmb3JtZTEgJiYgaTx0aGlzLmxpc3RlUmVjdEZvcm1lMS5sZW5ndGgpe1xuICAgICAgcm90YXRlQW5nbGU9MDtcbiAgICAgIGNlbnRyZVJvdGF0ZVg9bnVsbDtcbiAgICAgIGNlbnRyZVJvdGF0ZVk9bnVsbDtcbiAgICAgIGhhdXRldXIgPSB0aGlzLmxpc3RlUmVjdEZvcm1lMVtpXS5nZXRBdHRyaWJ1dGUoJ3dpZHRoJyk7XG4gICAgICBsYXJnZXVyID0gdGhpcy5saXN0ZVJlY3RGb3JtZTFbaV0uZ2V0QXR0cmlidXRlKCdoZWlnaHQnKTtcbiAgICAgIGxlZnQgPSB0aGlzLmxpc3RlUmVjdEZvcm1lMVtpXS5nZXRBdHRyaWJ1dGUoJ3gnKTtcbiAgICAgIHRvcCA9IHRoaXMubGlzdGVSZWN0Rm9ybWUxW2ldLmdldEF0dHJpYnV0ZSgneScpO1xuICAgICAgbGV0IHRyYW5zID0gdGhpcy5saXN0ZVJlY3RGb3JtZTFbaV0uZ2V0QXR0cmlidXRlKCd0cmFuc2Zvcm0nKTtcbiAgICAgIGlmKC9yb3RhdGUvLnRlc3QodHJhbnMpKXtcbiAgICAgICAgdHJhbnMgPSB0cmFucy5zbGljZSg3LHRyYW5zLmxlbmd0aCk7XG4gICAgICAgIGNlbnRyZVJvdGF0ZVggPSBwYXJzZUZsb2F0KHRyYW5zLnNwbGl0KFwiIFwiKVsxXSk7XG4gICAgICAgIGNlbnRyZVJvdGF0ZVkgPSBwYXJzZUZsb2F0KHRyYW5zLnNwbGl0KFwiLFwiKVsxXS5yZXBsYWNlKFwiKVwiLFwiXCIpKTtcbiAgICAgICAgcm90YXRlQW5nbGUgPSBwYXJzZUZsb2F0KHRyYW5zLnNwbGl0KFwiIFwiKVswXSk7XG4gICAgICB9XG4gICAgICBmb3JtZTEgPSB0aGlzLl9pc0luUmVjdChwYXJzZUZsb2F0KGhhdXRldXIpLCBwYXJzZUZsb2F0KGxhcmdldXIpLCBwYXJzZUZsb2F0KGxlZnQpLCBwYXJzZUZsb2F0KHRvcCksIHgsIHkscm90YXRlQW5nbGUsY2VudHJlUm90YXRlWCxjZW50cmVSb3RhdGVZKTtcbiAgICAgIGkrKztcbiAgICB9XG5cbiAgICAvL0ZPUk1FIDJcbiAgICBpID0wO1xuICAgIGxldCBmb3JtZTIgPSBmYWxzZTtcbiAgICB3aGlsZSghZm9ybWUyICYmIGk8dGhpcy5saXN0ZVJlY3RGb3JtZTIubGVuZ3RoKXtcbiAgICAgIHJvdGF0ZUFuZ2xlPTA7XG4gICAgICBjZW50cmVSb3RhdGVYPW51bGw7XG4gICAgICBjZW50cmVSb3RhdGVZPW51bGw7XG4gICAgICBoYXV0ZXVyID0gdGhpcy5saXN0ZVJlY3RGb3JtZTJbaV0uZ2V0QXR0cmlidXRlKCd3aWR0aCcpO1xuICAgICAgbGFyZ2V1ciA9IHRoaXMubGlzdGVSZWN0Rm9ybWUyW2ldLmdldEF0dHJpYnV0ZSgnaGVpZ2h0Jyk7XG4gICAgICBsZWZ0ID0gdGhpcy5saXN0ZVJlY3RGb3JtZTJbaV0uZ2V0QXR0cmlidXRlKCd4Jyk7XG4gICAgICB0b3AgPSB0aGlzLmxpc3RlUmVjdEZvcm1lMltpXS5nZXRBdHRyaWJ1dGUoJ3knKTtcbiAgICAgIGxldCB0cmFucyA9IHRoaXMubGlzdGVSZWN0Rm9ybWUyW2ldLmdldEF0dHJpYnV0ZSgndHJhbnNmb3JtJyk7XG4gICAgICBpZigvcm90YXRlLy50ZXN0KHRyYW5zKSl7XG4gICAgICAgIHRyYW5zID0gdHJhbnMuc2xpY2UoNyx0cmFucy5sZW5ndGgpO1xuICAgICAgICBjZW50cmVSb3RhdGVYID0gcGFyc2VGbG9hdCh0cmFucy5zcGxpdChcIiBcIilbMV0pO1xuICAgICAgICBjZW50cmVSb3RhdGVZID0gcGFyc2VGbG9hdCh0cmFucy5zcGxpdChcIixcIilbMV0ucmVwbGFjZShcIilcIixcIlwiKSk7XG4gICAgICAgIHJvdGF0ZUFuZ2xlID0gcGFyc2VGbG9hdCh0cmFucy5zcGxpdChcIiBcIilbMF0pO1xuICAgICAgfVxuICAgICAgZm9ybWUyID0gdGhpcy5faXNJblJlY3QocGFyc2VGbG9hdChoYXV0ZXVyKSwgcGFyc2VGbG9hdChsYXJnZXVyKSwgcGFyc2VGbG9hdChsZWZ0KSwgcGFyc2VGbG9hdCh0b3ApLCB4LCB5LHJvdGF0ZUFuZ2xlLGNlbnRyZVJvdGF0ZVgsY2VudHJlUm90YXRlWSk7XG4gICAgICBpKys7XG4gICAgfVxuXG4gICAgLy9GT1JNRSAzXG4gICAgaSA9MDtcbiAgICBsZXQgZm9ybWUzID0gZmFsc2U7XG4gICAgd2hpbGUoIWZvcm1lMyAmJiBpPHRoaXMubGlzdGVSZWN0Rm9ybWUzLmxlbmd0aCl7XG4gICAgICByb3RhdGVBbmdsZT0wO1xuICAgICAgY2VudHJlUm90YXRlWD1udWxsO1xuICAgICAgY2VudHJlUm90YXRlWT1udWxsO1xuICAgICAgaGF1dGV1ciA9IHRoaXMubGlzdGVSZWN0Rm9ybWUzW2ldLmdldEF0dHJpYnV0ZSgnd2lkdGgnKTtcbiAgICAgIGxhcmdldXIgPSB0aGlzLmxpc3RlUmVjdEZvcm1lM1tpXS5nZXRBdHRyaWJ1dGUoJ2hlaWdodCcpO1xuICAgICAgbGVmdCA9IHRoaXMubGlzdGVSZWN0Rm9ybWUzW2ldLmdldEF0dHJpYnV0ZSgneCcpO1xuICAgICAgdG9wID0gdGhpcy5saXN0ZVJlY3RGb3JtZTNbaV0uZ2V0QXR0cmlidXRlKCd5Jyk7XG4gICAgICBsZXQgdHJhbnMgPSB0aGlzLmxpc3RlUmVjdEZvcm1lM1tpXS5nZXRBdHRyaWJ1dGUoJ3RyYW5zZm9ybScpO1xuICAgICAgaWYoL3JvdGF0ZS8udGVzdCh0cmFucykpe1xuICAgICAgICB0cmFucyA9IHRyYW5zLnNsaWNlKDcsdHJhbnMubGVuZ3RoKTtcbiAgICAgICAgY2VudHJlUm90YXRlWCA9IHBhcnNlRmxvYXQodHJhbnMuc3BsaXQoXCIgXCIpWzFdKTtcbiAgICAgICAgY2VudHJlUm90YXRlWSA9IHBhcnNlRmxvYXQodHJhbnMuc3BsaXQoXCIsXCIpWzFdLnJlcGxhY2UoXCIpXCIsXCJcIikpO1xuICAgICAgICByb3RhdGVBbmdsZSA9IHBhcnNlRmxvYXQodHJhbnMuc3BsaXQoXCIgXCIpWzBdKTtcbiAgICAgIH1cbiAgICAgIGZvcm1lMyA9IHRoaXMuX2lzSW5SZWN0KHBhcnNlRmxvYXQoaGF1dGV1ciksIHBhcnNlRmxvYXQobGFyZ2V1ciksIHBhcnNlRmxvYXQobGVmdCksIHBhcnNlRmxvYXQodG9wKSwgeCwgeSxyb3RhdGVBbmdsZSxjZW50cmVSb3RhdGVYLGNlbnRyZVJvdGF0ZVkpO1xuICAgICAgaSsrO1xuICAgIH1cblxuICAgIC8vRk9STUUgNFxuICAgIGkgPTA7XG4gICAgbGV0IGZvcm1lNCA9IGZhbHNlO1xuICAgIHdoaWxlKCFmb3JtZTQgJiYgaTx0aGlzLmxpc3RlUmVjdEZvcm1lNC5sZW5ndGgpe1xuICAgICAgcm90YXRlQW5nbGU9MDtcbiAgICAgIGNlbnRyZVJvdGF0ZVg9bnVsbDtcbiAgICAgIGNlbnRyZVJvdGF0ZVk9bnVsbDtcbiAgICAgIGhhdXRldXIgPSB0aGlzLmxpc3RlUmVjdEZvcm1lNFtpXS5nZXRBdHRyaWJ1dGUoJ3dpZHRoJyk7XG4gICAgICBsYXJnZXVyID0gdGhpcy5saXN0ZVJlY3RGb3JtZTRbaV0uZ2V0QXR0cmlidXRlKCdoZWlnaHQnKTtcbiAgICAgIGxlZnQgPSB0aGlzLmxpc3RlUmVjdEZvcm1lNFtpXS5nZXRBdHRyaWJ1dGUoJ3gnKTtcbiAgICAgIHRvcCA9IHRoaXMubGlzdGVSZWN0Rm9ybWU0W2ldLmdldEF0dHJpYnV0ZSgneScpO1xuICAgICAgbGV0IHRyYW5zID0gdGhpcy5saXN0ZVJlY3RGb3JtZTRbaV0uZ2V0QXR0cmlidXRlKCd0cmFuc2Zvcm0nKTtcbiAgICAgIGlmKC9yb3RhdGUvLnRlc3QodHJhbnMpKXtcbiAgICAgICAgdHJhbnMgPSB0cmFucy5zbGljZSg3LHRyYW5zLmxlbmd0aCk7XG4gICAgICAgIGNlbnRyZVJvdGF0ZVggPSBwYXJzZUZsb2F0KHRyYW5zLnNwbGl0KFwiIFwiKVsxXSk7XG4gICAgICAgIGNlbnRyZVJvdGF0ZVkgPSBwYXJzZUZsb2F0KHRyYW5zLnNwbGl0KFwiLFwiKVsxXS5yZXBsYWNlKFwiKVwiLFwiXCIpKTtcbiAgICAgICAgcm90YXRlQW5nbGUgPSBwYXJzZUZsb2F0KHRyYW5zLnNwbGl0KFwiIFwiKVswXSk7XG4gICAgICB9XG4gICAgICBmb3JtZTQgPSB0aGlzLl9pc0luUmVjdChwYXJzZUZsb2F0KGhhdXRldXIpLCBwYXJzZUZsb2F0KGxhcmdldXIpLCBwYXJzZUZsb2F0KGxlZnQpLCBwYXJzZUZsb2F0KHRvcCksIHgsIHkscm90YXRlQW5nbGUsY2VudHJlUm90YXRlWCxjZW50cmVSb3RhdGVZKTtcbiAgICAgIGkrKztcbiAgICB9XG4gICAgcmV0dXJuIFtmb3JtZTEsZm9ybWUyLGZvcm1lMyxmb3JtZTRdO1xuXG4gIH1cblxuICAvLyBGb25jdGlvbiBxdWkgZGl0IHNpIHVuIHBvaW50IGVzdCBkYW5zIHVuIHJlY3RcbiAgIF9pc0luUmVjdChoYXV0ZXVyLGxhcmdldXIsbGVmdCx0b3AscG9pbnRYLHBvaW50WSxyb3RhdGVBbmdsZSxjZW50cmVSb3RhdGVYLGNlbnRyZVJvdGF0ZVkpe1xuICAgICAgLy9yb3RhdGlvblxuICAgICAgY29uc3QgbmV3UG9pbnQgPSB0aGlzLl9yb3RhdGVQb2ludChwb2ludFgscG9pbnRZLGNlbnRyZVJvdGF0ZVgsY2VudHJlUm90YXRlWSxyb3RhdGVBbmdsZSk7XG4gICAgICAvL0FwcGFydGVuYW5jZVxuICAgICAgaWYobmV3UG9pbnRbMF0gPiBwYXJzZUludChsZWZ0KSAmJiBuZXdQb2ludFswXSA8KHBhcnNlSW50KGxlZnQpK3BhcnNlSW50KGhhdXRldXIpKSAmJiBuZXdQb2ludFsxXSA+IHRvcCAmJiBuZXdQb2ludFsxXSA8IChwYXJzZUludCh0b3ApICsgcGFyc2VJbnQobGFyZ2V1cikpKXtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgfVxuXG4gIC8vIEZvbmN0aW9uIHF1aSBkaXQgc2kgdW4gcG9pbnQgZXN0IGRhbnMgdW5lIGVsbGlwc2VcbiAgX2lzSW5FbGxpcHNlKGNlbnRyZVgsY2VudHJlWSxyYXlvblgscmF5b25ZLHBvaW50WCxwb2ludFkscm90YXRlQW5nbGUsY2VudHJlUm90YXRlWCxjZW50cmVSb3RhdGVZKXtcbiAgICAvL3JvdGF0aW9uXG4gICAgY29uc3QgbmV3UG9pbnQgPSB0aGlzLl9yb3RhdGVQb2ludChwb2ludFgscG9pbnRZLGNlbnRyZVJvdGF0ZVgsY2VudHJlUm90YXRlWSxyb3RhdGVBbmdsZSk7XG4gICAgLy9BcHBhcnRlbmFuY2UgXG4gICAgbGV0IGEgPSByYXlvblg7OyAvLyBHcmFuZCByYXlvblxuICAgIGxldCBiID0gcmF5b25ZOyAvLyBQZXRpdCByYXlvblxuICAgIC8vY29uc3QgYyA9IE1hdGguc3FydCgoYSphKS0oYipiKSk7IC8vIERpc3RhbmNlIEZveWVyXG4gICAgY29uc3QgY2FsYyA9ICgoTWF0aC5wb3coKG5ld1BvaW50WzBdLWNlbnRyZVgpLDIpKS8oTWF0aC5wb3coYSwyKSkpKygoTWF0aC5wb3coKG5ld1BvaW50WzFdLWNlbnRyZVkpLDIpKS8oTWF0aC5wb3coYiwyKSkpO1xuICAgIGlmKGNhbGM8PTEpe1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfWVsc2V7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgLy8gRm9uY3Rpb24gcGVybWV0dGFudCBkZSByw6lheGVyIGxlIHBvaW50XG4gIF9yb3RhdGVQb2ludCh4LHksY2VudHJlWCxjZW50cmVZLGFuZ2xlKXtcbiAgICBsZXQgbmV3QW5nbGUgPSBhbmdsZSooMy4xNDE1OTI2NS8xODApOyAvLyBQYXNzYWdlIGVuIHJhZGlhblxuICAgIGxldCB0YWIgPSBbXTtcbiAgICBsZXQgbmV3WCA9ICh4LWNlbnRyZVgpKk1hdGguY29zKG5ld0FuZ2xlKSsoeS1jZW50cmVZKSpNYXRoLnNpbihuZXdBbmdsZSk7XG4gICAgbGV0IG5ld1kgPSAtMSooeC1jZW50cmVYKSpNYXRoLnNpbihuZXdBbmdsZSkrKHktY2VudHJlWSkqTWF0aC5jb3MobmV3QW5nbGUpO1xuICAgIG5ld1ggKz0gY2VudHJlWDtcbiAgICBuZXdZICs9IGNlbnRyZVk7XG4gICAgLy9BZmZpY2hhZ2UgZHUgc3ltw6l0cmlxdWVcbiAgICAgLy8gY29uc3Qgb2JqID0gdGhpcy52aWV3LiRlbC5xdWVyeVNlbGVjdG9yKCcjYm91bGVSJyk7XG4gICAgIC8vIG9iai5zZXRBdHRyaWJ1dGUoXCJjeFwiLG5ld1gpO1xuICAgICAvLyBvYmouc2V0QXR0cmlidXRlKFwiY3lcIixuZXdZKTtcbiAgICAvL0ZpbiBkZSBsJ2FmZmljaGFnZSBkdSBzeW3DqXRyaXF1ZVxuICAgIHRhYlswXSA9IG5ld1g7XG4gICAgdGFiWzFdID0gbmV3WTtcbiAgICByZXR1cm4gdGFiO1xuICB9XG5cbi8qIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLUNhbGN1bCBkZXMgZGlzdGFuY2VzLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tICovXG5cbiAgLy8gRG9ubmUgbGEgZGlzdGFuY2UgZHUgcG9pbnQgYXZlYyBsZXMgZm9ybWVzIHByw6lzZW50ZXNcbiAgX2dldERpc3RhbmNlKHhWYWx1ZSx5VmFsdWUpe1xuICAgIGxldCB0YWIgPSBbXTtcbiAgICBmb3IobGV0IGk9MDtpPHRoaXMubGlzdGVFbGxpcHNlLmxlbmd0aDtpKyspe1xuICAgICAgdGFiW3RhYi5sZW5ndGhdPXRoaXMuX2dldERpc3RhbmNlTm9kZSh0aGlzLmxpc3RlRWxsaXBzZVtpXSx4VmFsdWUseVZhbHVlKTtcbiAgICB9XG4gICAgZm9yKGxldCBpPTA7aTx0aGlzLmxpc3RlUmVjdC5sZW5ndGg7aSsrKXtcbiAgICAgIHRhYlt0YWIubGVuZ3RoXT10aGlzLl9nZXREaXN0YW5jZU5vZGUodGhpcy5saXN0ZVJlY3RbaV0seFZhbHVlLHlWYWx1ZSk7XG4gICAgfVxuICAgIHJldHVybiB0YWI7XG4gIH1cblxuICAvLyBEb25uZSBsYSBkaXN0YW5jZSBkJ3VuIHBvaW50IGF2ZWMgdW5lIGZvcm1lXG4gIF9nZXREaXN0YW5jZU5vZGUobm9kZSx4LHkpe1xuICAgIGlmKG5vZGUudGFnTmFtZT09XCJlbGxpcHNlXCIpe1xuICAgICAgbGV0IGNlbnRyZVggPSBwYXJzZUludChub2RlLmdldEF0dHJpYnV0ZSgnY3gnKSk7XG4gICAgICBsZXQgY2VudHJlWSA9IHBhcnNlSW50KG5vZGUuZ2V0QXR0cmlidXRlKCdjeScpKTtcbiAgICAgIHJldHVybiBNYXRoLnNxcnQoTWF0aC5wb3coKGNlbnRyZVgteCksMikrTWF0aC5wb3coKGNlbnRyZVkteSksMikpO1xuICAgIH1lbHNlIGlmKG5vZGUudGFnTmFtZT09J3JlY3QnKXtcbiAgICAgIGxldCBsZWZ0ID0gcGFyc2VJbnQobm9kZS5nZXRBdHRyaWJ1dGUoJ3gnKSk7XG4gICAgICBsZXQgdG9wID0gcGFyc2VJbnQobm9kZS5nZXRBdHRyaWJ1dGUoJ3knKSk7XG4gICAgICBsZXQgaGF1dCA9IHBhcnNlSW50KG5vZGUuZ2V0QXR0cmlidXRlKCdoZWlnaHQnKSk7XG4gICAgICBsZXQgbGFyZyA9IHBhcnNlSW50KG5vZGUuZ2V0QXR0cmlidXRlKCd3aWR0aCcpKTtcbiAgICAgIGxldCBjZW50cmVYID0gKGxlZnQrbGFyZykvMjtcbiAgICAgIGxldCBjZW50cmVZID0gKHRvcCtoYXV0KS8yO1xuICAgICAgcmV0dXJuIE1hdGguc3FydChNYXRoLnBvdygoY2VudHJlWC14KSwyKStNYXRoLnBvdygoY2VudHJlWS15KSwyKSk7XG4gICAgfVxuICB9XG5cbi8qIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVNPTi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAqL1xuXG4gIC8vIENyw6nDqSBsZSBtb3RldXIgc29ub3JlXG4gIF9jcmVhdGlvblVuaXZlcnNTb25vcmUoKXtcbiAgICAvL0dyYW51bGF0ZXVyXG4gICAgdGhpcy5ncmFpbiA9IG5ldyBNeUdyYWluMigpO1xuICAgIHNjaGVkdWxlci5hZGQodGhpcy5ncmFpbik7XG4gICAgdGhpcy5ncmFpbi5jb25uZWN0KGF1ZGlvQ29udGV4dC5kZXN0aW5hdGlvbik7XG4gICAgY29uc3QgYnVmZmVyQXNzb2NpZXMgPSBbNSw3LDldO1xuICAgIGNvbnN0IG1hcmtlckFzc29jaWVzID0gWzYsOCwxMF07XG4gICAgLy9TZWdtZW50ZXJcbiAgICBmb3IobGV0IGk9MDsgaTx0aGlzLm5iQ2hlbWluIDsgaSsrKXtcbiAgICAgIGxldCBpZEJ1ZmZlciA9IGJ1ZmZlckFzc29jaWVzW2ldO1xuICAgICAgbGV0IGlkTWFya2VyID0gbWFya2VyQXNzb2NpZXNbaV07XG4gICAgICB0aGlzLnNlZ21lbnRlcltpXSA9IG5ldyB3YXZlcy5TZWdtZW50RW5naW5lKHtcbiAgICAgICAgYnVmZmVyOiB0aGlzLmxvYWRlci5idWZmZXJzW2lkQnVmZmVyXSxcbiAgICAgICAgcG9zaXRpb25BcnJheTogdGhpcy5sb2FkZXIuYnVmZmVyc1tpZE1hcmtlcl0udGltZSxcbiAgICAgICAgZHVyYXRpb25BcnJheTogdGhpcy5sb2FkZXIuYnVmZmVyc1tpZE1hcmtlcl0uZHVyYXRpb24sXG4gICAgICAgIHBlcmlvZEFiczogMTAsXG4gICAgICAgIHBlcmlvZFJlbDogMTAsXG4gICAgICB9KTtcbiAgICAgIHRoaXMuc2VnbWVudGVyR2FpbltpXSA9IGF1ZGlvQ29udGV4dC5jcmVhdGVHYWluKCk7XG4gICAgICB0aGlzLnNlZ21lbnRlckdhaW5HcmFpbltpXSA9IGF1ZGlvQ29udGV4dC5jcmVhdGVHYWluKCk7XG4gICAgICAvLyB0aGlzLnNlZ21lbnRlckZCW2ldID0gYXVkaW9Db250ZXh0LmNyZWF0ZUdhaW4oKTtcbiAgICAgIC8vIHRoaXMuc2VnbWVudGVyRGVsYXlGQltpXSA9IGF1ZGlvQ29udGV4dC5jcmVhdGVEZWxheSgwLjgpO1xuICAgICAgdGhpcy5zZWdtZW50ZXJHYWluR3JhaW5baV0uZ2Fpbi5zZXRWYWx1ZUF0VGltZSgwLGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSk7XG4gICAgICB0aGlzLnNlZ21lbnRlckdhaW5baV0uZ2Fpbi5zZXRWYWx1ZUF0VGltZSgwLGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSk7XG4gICAgICAvLyB0aGlzLnNlZ21lbnRlckZCW2ldLmdhaW4uc2V0VmFsdWVBdFRpbWUoMC4wLGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSk7XG4gICAgICB0aGlzLnNlZ21lbnRlckdhaW5HcmFpbltpXS5jb25uZWN0KHRoaXMuZ3JhaW4uaW5wdXQpO1xuICAgICAgdGhpcy5zZWdtZW50ZXJHYWluW2ldLmNvbm5lY3QoYXVkaW9Db250ZXh0LmRlc3RpbmF0aW9uKTtcbiAgICAgIC8vdGhpcy5zZWdtZW50ZXJbaV0uY29ubmVjdCh0aGlzLnNlZ21lbnRlckZCW2ldKTtcbiAgICAgIC8vIHRoaXMuc2VnbWVudGVyRkJbaV0uY29ubmVjdCh0aGlzLnNlZ21lbnRlckRlbGF5RkJbaV0pO1xuICAgICAgLy8gdGhpcy5zZWdtZW50ZXJEZWxheUZCW2ldLmNvbm5lY3QoYXVkaW9Db250ZXh0LmRlc3RpbmF0aW9uKTtcbiAgICAgIC8vIHRoaXMuc2VnbWVudGVyRGVsYXlGQltpXS5jb25uZWN0KHRoaXMuc2VnbWVudGVyRkJbaV0pO1xuICAgICAgdGhpcy5zZWdtZW50ZXJbaV0uY29ubmVjdCh0aGlzLnNlZ21lbnRlckdhaW5baV0pO1xuICAgICAgdGhpcy5zZWdtZW50ZXJbaV0uY29ubmVjdCh0aGlzLnNlZ21lbnRlckdhaW5HcmFpbltpXSk7XG4gICAgICB0aGlzLl9zdGFydFNlZ21lbnRlcihpKTtcbiAgICB9XG5cbiAgICAvLyBOYXBwZSBkZSBmb25kXG4gICAgZm9yKGxldCBpPTA7aTx0aGlzLnRvdGFsRWxlbWVudHM7aSsrKXtcblxuICAgICAgLy9DcsOpYXRpb24gZGVzIGdhaW5zIGQnZW50csOpZS9zb3J0aWVzIGRlcyBuYXBwZXNcbiAgICAgIHRoaXMuZ2FpbnNEaXJlY3Rpb25zW2ldPSdkb3duJztcbiAgICAgIHRoaXMuZ2FpbnNbaV09IGF1ZGlvQ29udGV4dC5jcmVhdGVHYWluKCk7XG4gICAgICB0aGlzLmdhaW5zW2ldLmdhaW4udmFsdWU9MDtcbiAgICAgIHRoaXMuZ2FpbnNbaV0uY29ubmVjdCh0aGlzLmdyYWluLmlucHV0KTtcblxuICAgICAgLy9DcsOpYXRpb24gZGVzIHNvdXJjZXMgcG91ciBsZSBncmFudWxhdGV1clxuICAgICAgdGhpcy5zb3VyY2VzW2ldPWF1ZGlvQ29udGV4dC5jcmVhdGVCdWZmZXJTb3VyY2UoKTtcbiAgICAgIHRoaXMuc291cmNlc1tpXS5idWZmZXI9IHRoaXMubG9hZGVyLmJ1ZmZlcnNbaSU1XTtcbiAgICAgIHRoaXMuc291cmNlc1tpXS5jb25uZWN0KHRoaXMuZ2FpbnNbaV0pO1xuICAgICAgdGhpcy5zb3VyY2VzW2ldLmxvb3AgPSB0cnVlO1xuICAgICAgdGhpcy5zb3VyY2VzW2ldLnN0YXJ0KCk7XG5cbiAgICB9XG5cbiAgICB0aGlzLmdhaW5PdXRwdXREaXJlY3QgPSBhdWRpb0NvbnRleHQuY3JlYXRlR2FpbigpO1xuICAgIHRoaXMuZ2Fpbk91dHB1dERpcmVjdC5nYWluLnZhbHVlPTA7XG4gICAgdGhpcy5nYWluT3V0cHV0RGlyZWN0LmNvbm5lY3QoYXVkaW9Db250ZXh0LmRlc3RpbmF0aW9uKTtcbiAgICB0aGlzLmdhaW5PdXRwdXRHcmFpbiA9IGF1ZGlvQ29udGV4dC5jcmVhdGVHYWluKCk7XG4gICAgdGhpcy5nYWluT3V0cHV0R3JhaW4uZ2Fpbi52YWx1ZT0wO1xuICAgIHRoaXMuZ2Fpbk91dHB1dEdyYWluLmNvbm5lY3QodGhpcy5ncmFpbi5pbnB1dCk7XG5cblxuICAgIGZvcihsZXQgaSA9IDAgOyBpIDwgdGhpcy5uYkZvcm1lIDsgaSsrKXtcbiAgICAgIC8vIEZpZ3VyZVxuXG4gICAgICAvL2Nyw6lhdGlvbiBkZXMgZ2FpbnMgZGUgc29ucyBkaXJlY3RcbiAgICAgIHRoaXMuZ2FpbnNGb3JtZVtpXSA9IGF1ZGlvQ29udGV4dC5jcmVhdGVHYWluKCk7XG4gICAgICB0aGlzLmdhaW5zRm9ybWVbaV0uZ2Fpbi52YWx1ZT0wO1xuICAgICAgdGhpcy5nYWluc0Zvcm1lW2ldLmNvbm5lY3QodGhpcy5nYWluT3V0cHV0RGlyZWN0KTtcblxuXG4gICAgICAvL2Nyw6lhdGlvbiBkZXMgZ2FpbnMgZGUgc29ucyBncmFudWzDqXNcbiAgICAgIHRoaXMuZ2FpbnNHcmFpbkZvcm1lW2ldID0gYXVkaW9Db250ZXh0LmNyZWF0ZUdhaW4oKTtcbiAgICAgIHRoaXMuZ2FpbnNHcmFpbkZvcm1lW2ldLmdhaW4udmFsdWU9MDtcbiAgICAgIHRoaXMuZ2FpbnNHcmFpbkZvcm1lW2ldLmNvbm5lY3QodGhpcy5nYWluT3V0cHV0R3JhaW4pO1xuXG4gICAgICAvL0Zvcm1lIHNvdXJjZSBzb25vcmVcbiAgICAgIHRoaXMuc291bmRGb3JtZVtpXSA9IGF1ZGlvQ29udGV4dC5jcmVhdGVCdWZmZXJTb3VyY2UoKTtcbiAgICAgIHRoaXMuc291bmRGb3JtZVtpXS5idWZmZXIgPSB0aGlzLmxvYWRlci5idWZmZXJzWzEwICsgKGkrMSldO1xuICAgICAgdGhpcy5zb3VuZEZvcm1lW2ldLmNvbm5lY3QodGhpcy5nYWluc0Zvcm1lW2ldKTtcbiAgICAgIHRoaXMuc291bmRGb3JtZVtpXS5jb25uZWN0KHRoaXMuZ2FpbnNHcmFpbkZvcm1lW2ldKTtcbiAgICAgIHRoaXMuc291bmRGb3JtZVtpXS5sb29wID0gdHJ1ZTtcbiAgICAgIHRoaXMuc291bmRGb3JtZVtpXS5zdGFydCgpO1xuICAgIH1cbiAgICAgXG4gIH1cblxuXG4gIF9zdGFydFNlZ21lbnRlcihpKXtcbiAgICB0aGlzLnNlZ21lbnRlcltpXS50cmlnZ2VyKCk7XG4gICAgbGV0IG5ld1BlcmlvZCA9IHBhcnNlRmxvYXQodGhpcy5sb2FkZXIuYnVmZmVyc1s2KyhpKjIpXVsnZHVyYXRpb24nXVt0aGlzLnNlZ21lbnRlcltpXS5zZWdtZW50SW5kZXhdKSoxMDAwO1xuICAgIC8vIGlmKG5ld1BlcmlvZD4gMTUwKXtcbiAgICAvLyAgIG5ld1BlcmlvZCAtPSAzMDtcbiAgICAvLyB9ZWxzZSBpZihuZXdQZXJpb2Q+NDAwKXtcbiAgICAvLyAgIG5ld1BlcmlvZCAtPSAxMzA7XG4gICAgLy8gfWVsc2UgaWYobmV3UGVyaW9kPiA4MDApe1xuICAgIC8vICAgbmV3UGVyaW9kIC09IDI1MDtcbiAgICAvLyB9XG4gICAgc2V0VGltZW91dCgoKT0+e3RoaXMuX3N0YXJ0U2VnbWVudGVyKGkpO30sbmV3UGVyaW9kKTtcbiAgfVxuXG4gIC8vIEZhaXQgbW9udGVyIGxlIHNvbiBxdWFuZCBsYSBib3VsZSBlc3QgZGFucyBsYSBmb3JtZSBldCBiYWlzc2VyIHNpIGxhIGJvdWxlIG4neSBlc3QgcGFzXG4gIF91cGRhdGVHYWluKHRhYkluKXtcbiAgICBmb3IodmFyIGk9MDtpPHRhYkluLmxlbmd0aDtpKyspe1xuICAgICAgaWYodGhpcy5nYWluc1tpXS5nYWluLnZhbHVlPT0wJiZ0YWJJbltpXSYmdGhpcy5nYWluc0RpcmVjdGlvbnNbaV09PSdkb3duJyl7XG4gICAgICAgIGxldCBhY3R1YWwgPSB0aGlzLmdhaW5zW2ldLmdhaW4udmFsdWU7XG4gICAgICAgIHRoaXMuZ2FpbnNbaV0uZ2Fpbi5jYW5jZWxTY2hlZHVsZWRWYWx1ZXMoYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lKTtcbiAgICAgICAgdGhpcy5nYWluc1tpXS5nYWluLnNldFZhbHVlQXRUaW1lKGFjdHVhbCxhdWRpb0NvbnRleHQuY3VycmVudFRpbWUpO1xuICAgICAgICB0aGlzLmdhaW5zW2ldLmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoMC4yNCwgYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lICsgMi4zKTtcbiAgICAgICAgdGhpcy5nYWluc0RpcmVjdGlvbnNbaV09J3VwJztcbiAgICAgIH1lbHNlIGlmKHRoaXMuZ2FpbnNbaV0uZ2Fpbi52YWx1ZSE9MCYmIXRhYkluW2ldJiZ0aGlzLmdhaW5zRGlyZWN0aW9uc1tpXT09J3VwJyl7XG4gICAgICAgIGxldCBhY3R1YWwgPSB0aGlzLmdhaW5zW2ldLmdhaW4udmFsdWU7XG4gICAgICAgIHRoaXMuZ2FpbnNbaV0uZ2Fpbi5jYW5jZWxTY2hlZHVsZWRWYWx1ZXMoYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lKTtcbiAgICAgICAgdGhpcy5nYWluc1tpXS5nYWluLnNldFZhbHVlQXRUaW1lKGFjdHVhbCxhdWRpb0NvbnRleHQuY3VycmVudFRpbWUpO1xuICAgICAgICB0aGlzLmdhaW5zW2ldLmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoMCwgYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lICsgMy41KTtcbiAgICAgICAgdGhpcy5nYWluc0RpcmVjdGlvbnNbaV09J2Rvd24nO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIF9hY3R1YWxpc2VyQXVkaW9DaGVtaW4oaSl7XG4gICAgaWYodGhpcy50YWJDaGVtaW5baV0pe1xuICAgICAgbGV0IGFjdHVhbDEgPSB0aGlzLnNlZ21lbnRlckdhaW5baV0uZ2Fpbi52YWx1ZTtcbiAgICAgIGxldCBhY3R1YWwyID0gdGhpcy5zZWdtZW50ZXJHYWluR3JhaW5baV0uZ2Fpbi52YWx1ZTtcbiAgICAgIC8vbGV0IGFjdHVhbDMgPSB0aGlzLnNlZ21lbnRlckZCW2ldLmdhaW4udmFsdWU7XG4gICAgICAvL3RoaXMuc2VnbWVudGVyRkJbaV0uZ2Fpbi5jYW5jZWxTY2hlZHVsZWRWYWx1ZXMoYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lKTtcbiAgICAgIHRoaXMuc2VnbWVudGVyR2FpbltpXS5nYWluLmNhbmNlbFNjaGVkdWxlZFZhbHVlcyhhdWRpb0NvbnRleHQuY3VycmVudFRpbWUpO1xuICAgICAgdGhpcy5zZWdtZW50ZXJHYWluR3JhaW5baV0uZ2Fpbi5jYW5jZWxTY2hlZHVsZWRWYWx1ZXMoYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lKTtcbiAgICAgIHRoaXMuc2VnbWVudGVyR2FpbltpXS5nYWluLnNldFZhbHVlQXRUaW1lKGFjdHVhbDEsYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lKTtcbiAgICAgIHRoaXMuc2VnbWVudGVyR2FpbkdyYWluW2ldLmdhaW4uc2V0VmFsdWVBdFRpbWUoYWN0dWFsMixhdWRpb0NvbnRleHQuY3VycmVudFRpbWUpO1xuICAgICAgLy90aGlzLnNlZ21lbnRlckZCW2ldLmdhaW4uc2V0VmFsdWVBdFRpbWUoYWN0dWFsMyxhdWRpb0NvbnRleHQuY3VycmVudFRpbWUpO1xuICAgICAgdGhpcy5zZWdtZW50ZXJHYWluR3JhaW5baV0uZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgwLCBhdWRpb0NvbnRleHQuY3VycmVudFRpbWUgKyAxKTtcbiAgICAgIHRoaXMuc2VnbWVudGVyR2FpbltpXS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKDAuMjUsIGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSArIDAuNik7XG4gICAgICAvL3RoaXMuc2VnbWVudGVyRkJbaV0uZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgwLjQsIGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSArIDMpO1xuICAgIH1lbHNle1xuICAgICAgbGV0IGFjdHVhbDEgPSB0aGlzLnNlZ21lbnRlckdhaW5baV0uZ2Fpbi52YWx1ZTtcbiAgICAgIGxldCBhY3R1YWwyID0gdGhpcy5zZWdtZW50ZXJHYWluR3JhaW5baV0uZ2Fpbi52YWx1ZTtcbiAgICAgIC8vbGV0IGFjdHVhbDMgPSB0aGlzLnNlZ21lbnRlckZCW2ldLmdhaW4udmFsdWU7XG4gICAgICAvL3RoaXMuc2VnbWVudGVyRkJbaV0uZ2Fpbi5jYW5jZWxTY2hlZHVsZWRWYWx1ZXMoYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lKTtcbiAgICAgIHRoaXMuc2VnbWVudGVyR2FpbltpXS5nYWluLmNhbmNlbFNjaGVkdWxlZFZhbHVlcyhhdWRpb0NvbnRleHQuY3VycmVudFRpbWUpO1xuICAgICAgdGhpcy5zZWdtZW50ZXJHYWluR3JhaW5baV0uZ2Fpbi5jYW5jZWxTY2hlZHVsZWRWYWx1ZXMoYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lKTtcbiAgICAgIHRoaXMuc2VnbWVudGVyR2FpbltpXS5nYWluLnNldFZhbHVlQXRUaW1lKGFjdHVhbDEsYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lKTtcbiAgICAgIHRoaXMuc2VnbWVudGVyR2FpbkdyYWluW2ldLmdhaW4uc2V0VmFsdWVBdFRpbWUoYWN0dWFsMixhdWRpb0NvbnRleHQuY3VycmVudFRpbWUpO1xuICAgICAgLy90aGlzLnNlZ21lbnRlckZCW2ldLmdhaW4uc2V0VmFsdWVBdFRpbWUoYWN0dWFsMyxhdWRpb0NvbnRleHQuY3VycmVudFRpbWUpO1xuICAgICAgaWYodGhpcy5zdGFydFNlZ21lbnRGaW5pW2ldKXtcbiAgICAgICAgdGhpcy5zZWdtZW50ZXJHYWluR3JhaW5baV0uZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZShhY3R1YWwxKzAuMTUsIGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSArIDAuMSk7XG4gICAgICAgIHNldFRpbWVvdXQoICgpPT57XG4gICAgICAgICAgdGhpcy5zZWdtZW50ZXJHYWluR3JhaW5baV0uZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgwLGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSArIDAuMyk7ICAgICAgICAgXG4gICAgICAgIH1cbiAgICAgICAgLDIwMDApO1xuICAgICAgICB0aGlzLnNlZ21lbnRlckdhaW5baV0uZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgwLCBhdWRpb0NvbnRleHQuY3VycmVudFRpbWUgKyAwLjQpO1xuICAgICAgICAvL3RoaXMuc2VnbWVudGVyRkJbaV0uZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgwLCBhdWRpb0NvbnRleHQuY3VycmVudFRpbWUgKyAyLjUpO1xuICAgICAgfWVsc2V7XG4gICAgICAgIHRoaXMuc3RhcnRTZWdtZW50RmluaVtpXSA9IHRydWU7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgX2FjdHVhbGlzZXJBdWRpb0Zvcm1lKGlkKXtcbiAgICAvL0Zvcm1lMVxuICAgIGlmKGlkPT0wICYmIHRoaXMudGFiRm9ybWVbaWRdKXtcbiAgICAgIGxldCBnYWluR3JhaW4gPSAxIC0gKHRoaXMucmFtcEZvcm1lW1wiZm9ybWUxXCJdLzEwMDApO1xuICAgICAgbGV0IGdhaW5EaXJlY3QgPSB0aGlzLnJhbXBGb3JtZVtcImZvcm1lMVwiXS8xMDAwO1xuICAgICAgaWYoZ2FpbkRpcmVjdDwwKXtcbiAgICAgICAgZ2FpbkRpcmVjdCA9IDA7XG4gICAgICB9ZWxzZSBpZihnYWluRGlyZWN0PjEpe1xuICAgICAgICBnYWluRGlyZWN0ID0gMTtcbiAgICAgIH1cbiAgICAgIGlmKGdhaW5HcmFpbjwwKXtcbiAgICAgICAgZ2FpbkdyYWluID0gMDtcbiAgICAgIH1lbHNlIGlmKGdhaW5HcmFpbj4xKXtcbiAgICAgICAgZ2FpbkdyYWluID0gMTtcbiAgICAgIH1cbiAgICAgIGlmKHRoaXMudGFiRm9ybWVbaWRdKXtcbiAgICAgICAgdGhpcy5nYWluc0Zvcm1lW2lkXS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKGdhaW5EaXJlY3QsIGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSArIDAuMDEpO1xuICAgICAgICB0aGlzLmdhaW5zR3JhaW5Gb3JtZVtpZF0uZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZShnYWluR3JhaW4sIGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSArIDAuMDEpO1xuICAgICAgfVxuICAgIH1cblxuICAgICAgICAvL0Zvcm1lMlxuICAgIGlmKGlkPT0xICYmIHRoaXMudGFiRm9ybWVbaWRdKXtcbiAgICAgIGxldCBnYWluR3JhaW4gPSAxIC0gKHRoaXMucmFtcEZvcm1lW1wiZm9ybWUyXCJdLzEwMDApO1xuICAgICAgbGV0IGdhaW5EaXJlY3QgPSB0aGlzLnJhbXBGb3JtZVtcImZvcm1lMlwiXS8xMDAwO1xuICAgICAgaWYoZ2FpbkRpcmVjdDwwKXtcbiAgICAgICAgZ2FpbkRpcmVjdCA9IDA7XG4gICAgICB9ZWxzZSBpZihnYWluRGlyZWN0PjEpe1xuICAgICAgICBnYWluRGlyZWN0ID0gMTtcbiAgICAgIH1cbiAgICAgIGlmKGdhaW5HcmFpbjwwKXtcbiAgICAgICAgZ2FpbkdyYWluID0gMDtcbiAgICAgIH1lbHNlIGlmKGdhaW5HcmFpbj4xKXtcbiAgICAgICAgZ2FpbkdyYWluID0gMTtcbiAgICAgIH1cbiAgICAgIGlmKHRoaXMudGFiRm9ybWVbaWRdKXtcbiAgICAgICAgdGhpcy5nYWluc0Zvcm1lW2lkXS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKGdhaW5EaXJlY3QsIGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSArIDAuMDEpO1xuICAgICAgICB0aGlzLmdhaW5zR3JhaW5Gb3JtZVtpZF0uZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZShnYWluR3JhaW4sIGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSArIDAuMDEpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vRm9ybWUzXG4gICAgaWYoaWQ9PTIgJiYgdGhpcy50YWJGb3JtZVtpZF0pe1xuICAgICAgbGV0IGdhaW5HcmFpbiA9IDEgLSAodGhpcy5yYW1wRm9ybWVbXCJmb3JtZTNcIl0vMTAwMCk7XG4gICAgICBsZXQgZ2FpbkRpcmVjdCA9IHRoaXMucmFtcEZvcm1lW1wiZm9ybWUzXCJdLzEwMDA7XG4gICAgICBpZihnYWluRGlyZWN0PDApe1xuICAgICAgICBnYWluRGlyZWN0ID0gMDtcbiAgICAgIH1lbHNlIGlmKGdhaW5EaXJlY3Q+MSl7XG4gICAgICAgIGdhaW5EaXJlY3QgPSAxO1xuICAgICAgfVxuICAgICAgaWYoZ2FpbkdyYWluPDApe1xuICAgICAgICBnYWluR3JhaW4gPSAwO1xuICAgICAgfWVsc2UgaWYoZ2FpbkdyYWluPjEpe1xuICAgICAgICBnYWluR3JhaW4gPSAxO1xuICAgICAgfVxuICAgICAgaWYodGhpcy50YWJGb3JtZVtpZF0pe1xuICAgICAgICB0aGlzLmdhaW5zRm9ybWVbaWRdLmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoZ2FpbkRpcmVjdCwgYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lICsgMC4wMSk7XG4gICAgICAgIHRoaXMuZ2FpbnNHcmFpbkZvcm1lW2lkXS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKGdhaW5HcmFpbiwgYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lICsgMC4wMSk7XG4gICAgICB9XG4gICAgfVxuICAgIFxuICAgIC8vRm9ybWU0XG4gICAgaWYoaWQ9PTMgJiYgdGhpcy50YWJGb3JtZVtpZF0pe1xuICAgICAgbGV0IGdhaW5HcmFpbiA9IDEgLSAodGhpcy5yYW1wRm9ybWVbXCJmb3JtZTRcIl0vMTAwMCk7XG4gICAgICBsZXQgZ2FpbkRpcmVjdCA9IHRoaXMucmFtcEZvcm1lW1wiZm9ybWU0XCJdLzEwMDA7XG4gICAgICBpZihnYWluRGlyZWN0PDApe1xuICAgICAgICBnYWluRGlyZWN0ID0gMDtcbiAgICAgIH1lbHNlIGlmKGdhaW5EaXJlY3Q+MSl7XG4gICAgICAgIGdhaW5EaXJlY3QgPSAxO1xuICAgICAgfVxuICAgICAgaWYoZ2FpbkdyYWluPDApe1xuICAgICAgICBnYWluR3JhaW4gPSAwO1xuICAgICAgfWVsc2UgaWYoZ2FpbkdyYWluPjEpe1xuICAgICAgICBnYWluR3JhaW4gPSAxO1xuICAgICAgfVxuICAgICAgaWYodGhpcy50YWJGb3JtZVtpZF0pe1xuICAgICAgICB0aGlzLmdhaW5zRm9ybWVbaWRdLmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoZ2FpbkRpcmVjdCwgYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lICsgMC4wMSk7XG4gICAgICAgIHRoaXMuZ2FpbnNHcmFpbkZvcm1lW2lkXS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKGdhaW5HcmFpbiwgYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lICsgMC4wMSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYoIXRoaXMudGFiRm9ybWVbMF0mJih0aGlzLnRhYkZvcm1lWzBdIT10aGlzLmFuY2llbkZvcm1lWzBdKSl7XG4gICAgICB0aGlzLmdhaW5zRm9ybWVbMF0uZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgwLCBhdWRpb0NvbnRleHQuY3VycmVudFRpbWUgKyAxLjUpO1xuICAgICAgdGhpcy5nYWluc0dyYWluRm9ybWVbMF0uZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgwLCBhdWRpb0NvbnRleHQuY3VycmVudFRpbWUgKyAxLjUpO1xuICAgIH1cbiAgICBpZighdGhpcy50YWJGb3JtZVsxXSYmKHRoaXMudGFiRm9ybWVbMV0hPXRoaXMuYW5jaWVuRm9ybWVbMV0pKXtcbiAgICAgIHRoaXMuZ2FpbnNGb3JtZVsxXS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKDAsIGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSArIDEuNSk7XG4gICAgICB0aGlzLmdhaW5zR3JhaW5Gb3JtZVsxXS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKDAsIGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSArIDEuNSk7XG4gICAgfVxuICAgIGlmKCF0aGlzLnRhYkZvcm1lWzJdJiYodGhpcy50YWJGb3JtZVsyXSE9dGhpcy5hbmNpZW5Gb3JtZVsyXSkpe1xuICAgICAgdGhpcy5nYWluc0Zvcm1lWzJdLmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoMCwgYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lICsgMS41KTtcbiAgICAgIHRoaXMuZ2FpbnNHcmFpbkZvcm1lWzJdLmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoMCwgYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lICsgMS41KTtcbiAgICB9XG4gICAgaWYoIXRoaXMudGFiRm9ybWVbM10mJih0aGlzLnRhYkZvcm1lWzNdIT10aGlzLmFuY2llbkZvcm1lWzNdKSl7XG4gICAgICB0aGlzLmdhaW5zRm9ybWVbM10uZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgwLCBhdWRpb0NvbnRleHQuY3VycmVudFRpbWUgKyAxLjUpO1xuICAgICAgdGhpcy5nYWluc0dyYWluRm9ybWVbM10uZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgwLCBhdWRpb0NvbnRleHQuY3VycmVudFRpbWUgKyAxLjUpO1xuICAgIH1cblxuICAgIHRoaXMuYW5jaWVuRm9ybWUgPSBbdGhpcy50YWJGb3JtZVswXSx0aGlzLnRhYkZvcm1lWzFdLHRoaXMudGFiRm9ybWVbMl0sdGhpcy50YWJGb3JtZVszXV07XG5cbiAgICBpZih0aGlzLnRhYkZvcm1lWzBdfHx0aGlzLnRhYkZvcm1lWzFdfHx0aGlzLnRhYkZvcm1lWzJdfHx0aGlzLnRhYkZvcm1lWzNdKXtcbiAgICAgIHRoaXMuZGVjb2Rlci5yZXNldCgpO1xuICAgIH1cblxuICB9XG5cbiAgLyogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1YTU0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAqL1xuICBfc2V0TW9kZWwobW9kZWwsbW9kZWwxLG1vZGVsMil7XG4gICAgdGhpcy5kZWNvZGVyLnNldE1vZGVsKG1vZGVsKTtcbiAgICAvL3RoaXMuZGVjb2RlcjIuc2V0TW9kZWwobW9kZWwxKTtcbiAgICAvL3RoaXMuZGVjb2RlcjMuc2V0TW9kZWwobW9kZWwyKTtcbiAgICB0aGlzLm1vZGVsT0sgPSB0cnVlO1xuICB9XG5cbiAgX3Byb2Nlc3NQcm9iYSgpeyAgICBcbiAgICAgbGV0IHByb2JhTWF4ID0gdGhpcy5kZWNvZGVyLmdldFByb2JhKCk7XG4gICAgIC8vY29uc29sZS5sb2cocHJvYmFNYXgpO1xuICAgIC8vIC8vbGV0IHByb2JhTWF4MSA9IHRoaXMuZGVjb2RlcjIuZ2V0UHJvYmEoKTtcbiAgICAvLyAvL2xldCBwcm9iYU1heDIgPSB0aGlzLmRlY29kZXIzLmdldFByb2JhKCk7XG4gICAgLy8gbGV0IG5ld1NlZ21lbnQgPSBbXTtcbiAgICAvLyAvL0NoZW1pblxuICAgIGZvcihsZXQgaSA9IDAgOyBpIDwgdGhpcy5uYkNoZW1pbiA7IGkgKyspe1xuICAgIC8vICAgbmV3U2VnbWVudFtpXSA9IHRoaXMuX2ZpbmROZXdTZWdtZW50KHByb2JhTWF4MSwgcHJvYmFNYXgyLCBpKTtcbiAgICAvLyAgIHRoaXMuX2FjdHVhbGlzZXJTZWdtZW50SWZOb3RJbihuZXdTZWdtZW50W2ldLGkpO1xuICAgIC8vICAgbGV0IG5vbTEgPSAncHJvdG90eXBlRm9uZC0nK2krJy0xJztcbiAgICAvLyAgIGxldCBub20yID0gJ3Byb3RvdHlwZUZvbmQtJytpKyctMic7XG4gICAgLy8gICBpZih0aGlzLnRhYkNoZW1pbltpXSYmKHByb2JhTWF4MVswXT09bm9tMXx8cHJvYmFNYXgyWzBdPT1ub20yKSl7XG4gICAgLy8gICAgIC8vaWYoIWlzTmFOKHByb2JhTWF4MVsxXVtpXSkgfHwgIWlzTmFOKHByb2JhTWF4MlsxXVtpXSkpe1xuICAgIC8vICAgICAgIHRoaXMubGFzdFBvc2l0aW9uW2ldID0gbmV3U2VnbWVudFtpXTtcbiAgICAvLyAgICAgICBuZXdTZWdtZW50W2ldID0gbmV3U2VnbWVudFtpXSsgKE1hdGgudHJ1bmMoTWF0aC5yYW5kb20oKSp0aGlzLnF0UmFuZG9tKSk7XG4gICAgLy8gICAgICAgdGhpcy5zZWdtZW50ZXJbaV0uc2VnbWVudEluZGV4ID0gbmV3U2VnbWVudFtpXTtcbiAgICAvLyAgICAgfVxuICAgIC8vICAgfWVsc2V7XG4gICAgICAgIHRoaXMuc2VnbWVudGVyW2ldLnNlZ21lbnRJbmRleCA9IE1hdGgudHJ1bmMoTWF0aC5yYW5kb20oKSp0aGlzLnF0UmFuZG9tKTsvL3RoaXMubGFzdFBvc2l0aW9uW2ldICsgKE1hdGgudHJ1bmMoTWF0aC5yYW5kb20oKSp0aGlzLnF0UmFuZG9tKSk7XG4gICAgICAvLyB9XG4gICAgICAgaWYodGhpcy50YWJDaGVtaW5baV0hPXRoaXMub2xkVGFiQ2hlbWluW2ldKXtcbiAgICAgICAgIHRoaXMuX2FjdHVhbGlzZXJBdWRpb0NoZW1pbihpKTtcbiAgICAgICB9XG4gICAgICAvLyBpZihpPT0yKXtcbiAgICAgIC8vIH1cbiAgICAgICB0aGlzLm9sZFRhYkNoZW1pbltpXSA9IHRoaXMudGFiQ2hlbWluW2ldO1xuICAgIH1cblxuICAgIC8vRm9ybWVcbiAgICBsZXQgZGlyZWN0ID0gZmFsc2U7XG4gICAgbGV0IGkgPSAwO1xuICAgIHdoaWxlKCghZGlyZWN0KSAmJiAoaTx0aGlzLm5iRm9ybWUpKXtcbiAgICAgIGlmKHRoaXMudGFiRm9ybWVbaV0pe1xuICAgICAgICBkaXJlY3QgPSB0cnVlO1xuICAgICAgfVxuICAgICAgaSsrXG4gICAgfVxuXG4gICBsZXQgYWN0dWFsMSA9IHRoaXMuZ2Fpbk91dHB1dERpcmVjdC5nYWluLnZhbHVlO1xuICAgbGV0IGFjdHVhbDIgPSB0aGlzLmdhaW5PdXRwdXRHcmFpbi5nYWluLnZhbHVlO1xuXG4gICAgaWYoZGlyZWN0IT10aGlzLmFuY2llbjMpe1xuICAgICAgaWYoZGlyZWN0KXtcbiAgICAgICAgdGhpcy5nYWluT3V0cHV0RGlyZWN0LmdhaW4uY2FuY2VsU2NoZWR1bGVkVmFsdWVzKGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSk7XG4gICAgICAgIHRoaXMuZ2Fpbk91dHB1dERpcmVjdC5nYWluLnNldFZhbHVlQXRUaW1lKGFjdHVhbDEsYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lKTtcbiAgICAgICAgdGhpcy5nYWluT3V0cHV0RGlyZWN0LmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoMC41LGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSArIDIpO1xuICAgICAgICB0aGlzLmdhaW5PdXRwdXRHcmFpbi5nYWluLmNhbmNlbFNjaGVkdWxlZFZhbHVlcyhhdWRpb0NvbnRleHQuY3VycmVudFRpbWUpO1xuICAgICAgICB0aGlzLmdhaW5PdXRwdXRHcmFpbi5nYWluLnNldFZhbHVlQXRUaW1lKGFjdHVhbDEsYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lKTtcbiAgICAgICAgdGhpcy5nYWluT3V0cHV0R3JhaW4uZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgwLjUsYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lICsgMik7XG4gICAgICAgIHRoaXMucmFtcEZvcm1lWydmb3JtZTEnXSA9IDA7XG4gICAgICAgIHRoaXMucmFtcEZvcm1lWydmb3JtZTInXSA9IDA7XG4gICAgICAgIHRoaXMucmFtcEZvcm1lWydmb3JtZTMnXSA9IDA7XG4gICAgICAgIHRoaXMucmFtcEZvcm1lWydmb3JtZTQnXSA9IDA7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgdGhpcy5nYWluT3V0cHV0RGlyZWN0LmdhaW4uY2FuY2VsU2NoZWR1bGVkVmFsdWVzKGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSk7XG4gICAgICAgIHRoaXMuZ2Fpbk91dHB1dERpcmVjdC5nYWluLnNldFZhbHVlQXRUaW1lKGFjdHVhbDEsYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lKTtcbiAgICAgICAgdGhpcy5nYWluT3V0cHV0RGlyZWN0LmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoMCxhdWRpb0NvbnRleHQuY3VycmVudFRpbWUgKyAyKTtcbiAgICAgICAgdGhpcy5nYWluT3V0cHV0R3JhaW4uZ2Fpbi5jYW5jZWxTY2hlZHVsZWRWYWx1ZXMoYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lKTtcbiAgICAgICAgdGhpcy5nYWluT3V0cHV0R3JhaW4uZ2Fpbi5zZXRWYWx1ZUF0VGltZShhY3R1YWwxLGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSk7XG4gICAgICAgIHRoaXMuZ2Fpbk91dHB1dEdyYWluLmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoMCxhdWRpb0NvbnRleHQuY3VycmVudFRpbWUgKyAyKTtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5hbmNpZW4zID0gZGlyZWN0O1xuXG4gICAgaWYoZGlyZWN0KXtcbiAgICAgIGZvcihsZXQgaSA9IDA7IGk8dGhpcy5uYkZvcm1lIDsgaSsrKXtcbiAgICAgICAgaWYocHJvYmFNYXg9PSdmb3JtZTEnKXtcbiAgICAgICAgICB0aGlzLnJhbXBGb3JtZVsnZm9ybWUyJ10tLTtcbiAgICAgICAgICB0aGlzLnJhbXBGb3JtZVsnZm9ybWUzJ10tLTtcbiAgICAgICAgICB0aGlzLnJhbXBGb3JtZVsnZm9ybWU0J10tLTtcbiAgICAgICAgfWVsc2UgaWYocHJvYmFNYXg9PSdmb3JtZTInKXtcbiAgICAgICAgICB0aGlzLnJhbXBGb3JtZVsnZm9ybWUxJ10tLTtcbiAgICAgICAgICB0aGlzLnJhbXBGb3JtZVsnZm9ybWUzJ10tLTtcbiAgICAgICAgICB0aGlzLnJhbXBGb3JtZVsnZm9ybWU0J10tLTtcbiAgICAgICAgfWVsc2UgaWYocHJvYmFNYXg9PSdmb3JtZTMnKXtcbiAgICAgICAgICB0aGlzLnJhbXBGb3JtZVsnZm9ybWUxJ10tLTtcbiAgICAgICAgICB0aGlzLnJhbXBGb3JtZVsnZm9ybWUyJ10tLTtcbiAgICAgICAgICB0aGlzLnJhbXBGb3JtZVsnZm9ybWU0J10tLTtcbiAgICAgICAgfWVsc2UgaWYocHJvYmFNYXg9PSdmb3JtZTQnKXtcbiAgICAgICAgICB0aGlzLnJhbXBGb3JtZVsnZm9ybWUxJ10tLTtcbiAgICAgICAgICB0aGlzLnJhbXBGb3JtZVsnZm9ybWUyJ10tLTtcbiAgICAgICAgICB0aGlzLnJhbXBGb3JtZVsnZm9ybWUzJ10tLTtcbiAgICAgICAgfWVsc2UgaWYocHJvYmFNYXg9PW51bGwpe1xuICAgICAgICAgIHRoaXMucmFtcEZvcm1lWydmb3JtZTEnXS0tO1xuICAgICAgICAgIHRoaXMucmFtcEZvcm1lWydmb3JtZTInXS0tO1xuICAgICAgICAgIHRoaXMucmFtcEZvcm1lWydmb3JtZTMnXS0tO1xuICAgICAgICAgIHRoaXMucmFtcEZvcm1lWydmb3JtZTQnXS0tO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucmFtcEZvcm1lW3Byb2JhTWF4XSsrO1xuXG4gICAgICAgIGlmKHRoaXMucmFtcEZvcm1lWydmb3JtZTEnXTwwKSB0aGlzLnJhbXBGb3JtZVsnZm9ybWUxJ109MDtcbiAgICAgICAgaWYodGhpcy5yYW1wRm9ybWVbJ2Zvcm1lMiddPDApIHRoaXMucmFtcEZvcm1lWydmb3JtZTInXT0wO1xuICAgICAgICBpZih0aGlzLnJhbXBGb3JtZVsnZm9ybWUzJ108MCkgdGhpcy5yYW1wRm9ybWVbJ2Zvcm1lMyddPTA7XG4gICAgICAgIGlmKHRoaXMucmFtcEZvcm1lWydmb3JtZTQnXTwwKSB0aGlzLnJhbXBGb3JtZVsnZm9ybWU0J109MDtcbiAgICAgIH1cbiAgICB9XG4gICAgZm9yKGxldCBpID0gMCA7IGkgPCB0aGlzLm5iRm9ybWUgOyBpKyspe1xuICAgICAgdGhpcy5fYWN0dWFsaXNlckF1ZGlvRm9ybWUoaSk7XG4gICAgfVxuXG4gICAgLy9jb25zb2xlLmxvZyh0aGlzLnJhbXBGb3JtZSk7XG5cbiAgfVxuXG4gIC8vIFRyb3V2ZSBlbiBmb25jdGlvbiBkZSB4bW0gbGUgc2VnbWVudCBsZSBwbHVzIHByb2NoZSBkZSBsYSBwb3NpdGlvbiBkZSBsJ3V0aWxpc2F0ZXVyXG4gIF9maW5kTmV3U2VnbWVudChwcm9iYU1heDEsIHByb2JhTWF4MiwgaWQpe1xuICAgIGxldCBuZXdTZWdtZW50ID0gLTE7XG4gICAgbGV0IGFjdHVlbCA9IG51bGw7XG4gICAgaWYoKHRoaXMuYW5jaWVuMVtpZF0tcHJvYmFNYXgxWzFdW2lkXSE9MC4pJiYhaXNOYU4ocHJvYmFNYXgxWzFdW2lkXSkpe1xuICAgICAgbmV3U2VnbWVudCA9IE1hdGgudHJ1bmMocHJvYmFNYXgxWzFdW2lkXSoodGhpcy5uYlNlZ21lbnRbaWRdLXRoaXMucXRSYW5kb20pKTtcbiAgICAgIGFjdHVlbCA9IFwiMVwiO1xuICAgICAgaWYodGhpcy5jb3VudDJbaWRdPnRoaXMuY291bnRNYXgpe1xuICAgICAgICAvL3RoaXMuZGVjb2RlcjMucmVzZXQoKTtcbiAgICAgICAgdGhpcy5jb3VudDJbaWRdID0gMDtcbiAgICAgIH1cbiAgICAgIHRoaXMuY291bnQxW2lkXSA9IDA7XG4gICAgICB0aGlzLmNvdW50MltpZF0rKztcbiAgICB9ZWxzZSBpZiAoKHRoaXMuYW5jaWVuMltpZF0tcHJvYmFNYXgyWzFdW2lkXSE9MC4pJiYhaXNOYU4ocHJvYmFNYXgyWzFdW2lkXSkpe1xuICAgICAgbmV3U2VnbWVudCA9IE1hdGgudHJ1bmMoKDEtcHJvYmFNYXgyWzFdW2lkXSkqKHRoaXMubmJTZWdtZW50W2lkXS10aGlzLnF0UmFuZG9tKSk7XG4gICAgICBhY3R1ZWwgPSBcIjBcIjtcbiAgICAgIGlmKHRoaXMuY291bnQxW2lkXT50aGlzLmNvdW50TWF4KXtcbiAgICAgICAgLy90aGlzLmRlY29kZXIyLnJlc2V0KCk7XG4gICAgICAgIHRoaXMuY291bnQxW2lkXSA9IDA7XG4gICAgICB9XG4gICAgICB0aGlzLmNvdW50MltpZF0gPSAwO1xuICAgICAgdGhpcy5jb3VudDFbaWRdKys7XG4gICAgfWVsc2V7XG4gICAgICBuZXdTZWdtZW50ID0gdGhpcy5sYXN0U2VnbWVudFtpZF07XG4gICAgfVxuICAgIHRoaXMuYW5jaWVuMVtpZF0gPSBwcm9iYU1heDFbMV1baWRdO1xuICAgIHRoaXMuYW5jaWVuMltpZF0gPSBwcm9iYU1heDJbMV1baWRdO1xuICAgIHJldHVybiBuZXdTZWdtZW50O1xuICB9XG5cbiAgLy8gRmFpcyBhdmFuY2VyIGxhIHTDqnRlIGRlIGxlY3R1cmUgZGVzIHNlZ21lbnRlciBzaSBsJ3V0aWxpc2F0ZXVyIG4nZXN0IHBhcyBkYW5zIHVuZSBmb3JtZVxuICBfYWN0dWFsaXNlclNlZ21lbnRJZk5vdEluKG5ld1NlZ21lbnQsIGlkKXtcbiAgICBpZighdGhpcy50YWJDaGVtaW5baWRdKXtcbiAgICAgIGlmKHRoaXMuY291bnRUaW1lb3V0W2lkXT40MCl7XG4gICAgICAgIGlmKG5ld1NlZ21lbnQ+KHRoaXMubmJTZWdtZW50W2lkXS10aGlzLnF0UmFuZG9tKSl7XG4gICAgICAgICAgdGhpcy5kaXJlY3Rpb25baWRdID0gZmFsc2U7XG4gICAgICAgIH1lbHNlIGlmKG5ld1NlZ21lbnQ8MSl7XG4gICAgICAgICAgdGhpcy5kaXJlY3Rpb25baWRdID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNvdW50VGltZW91dFtpZF0gPSAwO1xuICAgICAgICBpZih0aGlzLmRpcmVjdGlvbltpZF0pe1xuICAgICAgICAgIG5ld1NlZ21lbnQrKztcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgbmV3U2VnbWVudC0tO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0aGlzLmxhc3RTZWdtZW50W2lkXSA9IG5ld1NlZ21lbnQ7XG4gICAgICBsZXQgc2VnbWVudCA9bmV3U2VnbWVudCtNYXRoLnRydW5jKE1hdGgucmFuZG9tKCkqdGhpcy5xdFJhbmRvbSk7XG4gICAgICB0aGlzLmNvdW50VGltZW91dFtpZF0rKztcbiAgICAgIHRoaXMuc2VnbWVudGVyW2lkXS5zZWdtZW50SW5kZXggPSBzZWdtZW50O1xuICAgIH1cbiAgfVxufVxuIl19