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

var _MyGrain = require('../player/MyGrain.js');

var _MyGrain2 = _interopRequireDefault(_MyGrain);

var _wavesAudio = require('waves-audio');

var waves = _interopRequireWildcard(_wavesAudio);

var _xmmLfo = require('xmm-lfo');

var _EnregistrementChemin = require('./EnregistrementChemin.js');

var _EnregistrementChemin2 = _interopRequireDefault(_EnregistrementChemin);

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

  (0, _createClass3.default)(PlayerView, [{
    key: 'onTouch',
    value: function onTouch(callback) {
      this.installEvents({
        'click svg': function clickSvg() {
          callback();
        }
      });
    }
  }]);
  return PlayerView;
}(soundworks.View);

var view = '';

// this experience plays a sound when it starts, and plays another sound when
// other clients join the experience

var DesignerFormeExperience = function (_soundworks$Experienc) {
  (0, _inherits3.default)(DesignerFormeExperience, _soundworks$Experienc);

  function DesignerFormeExperience(assetsDomain) {
    (0, _classCallCheck3.default)(this, DesignerFormeExperience);

    //Services
    var _this2 = (0, _possibleConstructorReturn3.default)(this, (DesignerFormeExperience.__proto__ || (0, _getPrototypeOf2.default)(DesignerFormeExperience)).call(this));

    _this2.platform = _this2.require('platform', { features: ['web-audio', 'wake-lock'] });
    _this2.motionInput = _this2.require('motion-input', { descriptors: ['orientation'] });
    _this2.label = 't';
    _this2.actualId = 1;
    _this2.actualSens = 1;
    _this2.startOK = false;
    _this2.couleurRec = 'white';
    return _this2;
  }

  (0, _createClass3.default)(DesignerFormeExperience, [{
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
      this._getDistanceNode = this._getDistanceNode.bind(this);
      this._rotatePoint = this._rotatePoint.bind(this);
      this._myListener = this._myListener.bind(this);
      this._onTouch = this._onTouch.bind(this);
      this.view.onTouch(this._onTouch);
      this._addFond = this._addFond.bind(this);
      this._addBoule = this._addBoule.bind(this);
      this._addRect = this._addRect.bind(this);
      this.receive('fond', function (fond, label, id, sens) {
        return _this3._addFond(fond, label, id, sens);
      });
    }
  }, {
    key: 'start',
    value: function start() {
      var _this4 = this;

      if (!this.startOK) {
        (0, _get3.default)(DesignerFormeExperience.prototype.__proto__ || (0, _getPrototypeOf2.default)(DesignerFormeExperience.prototype), 'start', this).call(this); // don't forget this
        if (!this.hasStarted) this.init();
        this.show();
      } else {
        //Paramètre initiaux
        this._addBoule(100, 100);
        this._addRect();
        document.body.style.overflow = "hidden"; //Constantes
        this.centreX = window.innerWidth / 2;
        this.tailleEcranX = window.innerWidth;
        this.tailleEcranY = window.innerHeight;
        this.centreEcranX = this.tailleEcranX / 2;
        this.centreEcranY = this.tailleEcranY / 2;
        setTimeout(function () {
          _this4._myListener(100);
        }, 100);
        this.centreY = window.innerHeight / 2;

        //XMM-lfo
        this.enregistrement = new _EnregistrementChemin2.default(this.label, this.actualId, this.actualSens);
        this.onRecord = false;

        //Detecte les elements SVG
        this.listeEllipse = document.getElementsByTagName('ellipse');
        this.listeRect = document.getElementsByTagName('rect');
        this.totalElements = this.listeEllipse.length + this.listeRect.length;

        //Initisalisation
        this.maxCountUpdate = 4;
        this.countUpdate = this.maxCountUpdate + 1; // Initialisation
        this.visualisationBoule = true; // Visualisation de la boule
        if (!this.visualisationBoule) {
          this.view.$el.querySelector('#boule').style.display = 'none';
        }
        this.visualisationForme = true; // Visualisation des formes SVG
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
            // Affichage
            var newValues = _this4._toMove(data[2], data[1] - 25);
            _this4.tabIn = _this4._isIn(newValues[0], newValues[1]);
            _this4._moveScreenTo(newValues[0], newValues[1], 0.08);
            // XMM
            _this4.enregistrement.process(newValues[0], newValues[1]);
          });
        } else {
          console.log("Orientation non disponible");
        }
      }
    }

    /* ------------------------------------------CALL BACK EVENT-------------------------------------------------- */

  }, {
    key: '_onTouch',
    value: function _onTouch() {
      if (!this.onRecord) {
        document.getElementById("fond").setAttribute("fill", this.couleurRec);
        this.onRecord = true;
        this.enregistrement.startRecord();
      } else {
        document.getElementById("fond").setAttribute("fill", "black");
        this.onRecord = false;
        this.enregistrement.stopRecord(this);
      }
    }

    /* Ajoute le fond */

  }, {
    key: '_addFond',
    value: function _addFond(fond, label, id, sens) {
      // On parse le fichier SVG en DOM
      this.actualId = id;
      this.actualSens = sens;
      var myLayer = void 0;
      var parser = new DOMParser();
      var fondXml = parser.parseFromString(fond, 'application/xml');
      fondXml = fondXml.getElementsByTagName('title');
      for (var i = 0; i < fondXml.length; i++) {
        if (fondXml[i].innerHTML == 'Chemin') {
          myLayer = fondXml[i];
        }
      }
      var myG = myLayer.parentNode;
      var mySvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      mySvg.setAttributeNS(null, 'width', 10000);
      mySvg.setAttributeNS(null, 'height', 10000);
      document.getElementById('experience').appendChild(mySvg);
      mySvg.appendChild(myG);
      // On allume seulement le path voulu
      var myPaths = document.getElementsByTagName('path');
      for (var _i4 = 0; _i4 < myPaths.length; _i4++) {
        if (_i4 != id) {
          myPaths[_i4].style.display = 'none';
        }
      }

      this.startOK = true;
      this.label = label;
      this.start();
    }

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
  }, {
    key: '_addRect',
    value: function _addRect() {
      var svgElement = document.getElementsByTagName('svg')[0];
      var x = svgElement.getAttribute('width');
      var y = svgElement.getAttribute('height');
      var newRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      newRect.setAttributeNS(null, 'width', x);
      newRect.setAttributeNS(null, 'height', y);
      newRect.setAttributeNS(null, 'x', 0);
      newRect.setAttributeNS(null, 'y', 0);
      newRect.setAttributeNS(null, 'id', 'fond');
      svgElement.insertBefore(newRect, svgElement.firstChild);
    }

    /* ------------------------------------------MOUVEMENT DE L ECRAN--------------------------------------------- */

    /* Callback orientationMotion / Mouvement de la boule*/

  }, {
    key: '_toMove',
    value: function _toMove(valueX, valueY) {
      var obj = this.view.$el.querySelector('#boule');
      var newX = void 0;
      var newY = void 0;
      var actu = this.mirrorBouleX + valueX * 0.3; //parseInt(obj.getAttribute('cx'))+valueX*0.3;
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
      actu = this.mirrorBouleY + valueY * 0.3; //parseInt(obj.getAttribute('cy'))+valueY*0.3;
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
      for (var _i5 = 0; _i5 < this.listeRect.length; _i5++) {
        rotateAngle = 0;
        centreRotateX = null;
        centreRotateY = null;
        var hauteur = this.listeRect[_i5].getAttribute('width');
        var largeur = this.listeRect[_i5].getAttribute('height');
        var left = this.listeRect[_i5].getAttribute('x');
        var top = this.listeRect[_i5].getAttribute('y');
        var _trans = this.listeRect[_i5].getAttribute('transform');
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
      for (var _i6 = 0; _i6 < this.listeRect.length; _i6++) {
        tab[tab.length] = this._getDistanceNode(this.listeRect[_i6], xValue, yValue);
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
  }]);
  return DesignerFormeExperience;
}(soundworks.Experience);

exports.default = DesignerFormeExperience;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRlc2lnbmVyQ2hlbWluRXhwZXJpZW5jZS5qcyJdLCJuYW1lcyI6WyJzb3VuZHdvcmtzIiwid2F2ZXMiLCJhdWRpb0NvbnRleHQiLCJzY2hlZHVsZXIiLCJnZXRTY2hlZHVsZXIiLCJQbGF5ZXJWaWV3IiwidGVtcGxhdGUiLCJjb250ZW50IiwiZXZlbnRzIiwib3B0aW9ucyIsImNhbGxiYWNrIiwiaW5zdGFsbEV2ZW50cyIsIlZpZXciLCJ2aWV3IiwiRGVzaWduZXJGb3JtZUV4cGVyaWVuY2UiLCJhc3NldHNEb21haW4iLCJwbGF0Zm9ybSIsInJlcXVpcmUiLCJmZWF0dXJlcyIsIm1vdGlvbklucHV0IiwiZGVzY3JpcHRvcnMiLCJsYWJlbCIsImFjdHVhbElkIiwiYWN0dWFsU2VucyIsInN0YXJ0T0siLCJjb3VsZXVyUmVjIiwidmlld1RlbXBsYXRlIiwidmlld0NvbnRlbnQiLCJ2aWV3Q3RvciIsInZpZXdPcHRpb25zIiwicHJlc2VydmVQaXhlbFJhdGlvIiwiY3JlYXRlVmlldyIsIl90b01vdmUiLCJiaW5kIiwiX2lzSW5FbGxpcHNlIiwiX2lzSW5SZWN0IiwiX2lzSW4iLCJfZ2V0RGlzdGFuY2VOb2RlIiwiX3JvdGF0ZVBvaW50IiwiX215TGlzdGVuZXIiLCJfb25Ub3VjaCIsIm9uVG91Y2giLCJfYWRkRm9uZCIsIl9hZGRCb3VsZSIsIl9hZGRSZWN0IiwicmVjZWl2ZSIsImZvbmQiLCJpZCIsInNlbnMiLCJoYXNTdGFydGVkIiwiaW5pdCIsInNob3ciLCJkb2N1bWVudCIsImJvZHkiLCJzdHlsZSIsIm92ZXJmbG93IiwiY2VudHJlWCIsIndpbmRvdyIsImlubmVyV2lkdGgiLCJ0YWlsbGVFY3JhblgiLCJ0YWlsbGVFY3JhblkiLCJpbm5lckhlaWdodCIsImNlbnRyZUVjcmFuWCIsImNlbnRyZUVjcmFuWSIsInNldFRpbWVvdXQiLCJjZW50cmVZIiwiZW5yZWdpc3RyZW1lbnQiLCJvblJlY29yZCIsImxpc3RlRWxsaXBzZSIsImdldEVsZW1lbnRzQnlUYWdOYW1lIiwibGlzdGVSZWN0IiwidG90YWxFbGVtZW50cyIsImxlbmd0aCIsIm1heENvdW50VXBkYXRlIiwiY291bnRVcGRhdGUiLCJ2aXN1YWxpc2F0aW9uQm91bGUiLCIkZWwiLCJxdWVyeVNlbGVjdG9yIiwiZGlzcGxheSIsInZpc3VhbGlzYXRpb25Gb3JtZSIsImkiLCJzZXRBdHRyaWJ1dGUiLCJtaXJyb3JCb3VsZVgiLCJtaXJyb3JCb3VsZVkiLCJvZmZzZXRYIiwib2Zmc2V0WSIsIlNWR19NQVhfWCIsImdldEF0dHJpYnV0ZSIsIlNWR19NQVhfWSIsInRhYkluIiwiaXNBdmFpbGFibGUiLCJhZGRMaXN0ZW5lciIsImRhdGEiLCJuZXdWYWx1ZXMiLCJfbW92ZVNjcmVlblRvIiwicHJvY2VzcyIsImNvbnNvbGUiLCJsb2ciLCJnZXRFbGVtZW50QnlJZCIsInN0YXJ0UmVjb3JkIiwic3RvcFJlY29yZCIsIm15TGF5ZXIiLCJwYXJzZXIiLCJET01QYXJzZXIiLCJmb25kWG1sIiwicGFyc2VGcm9tU3RyaW5nIiwiaW5uZXJIVE1MIiwibXlHIiwicGFyZW50Tm9kZSIsIm15U3ZnIiwiY3JlYXRlRWxlbWVudE5TIiwic2V0QXR0cmlidXRlTlMiLCJhcHBlbmRDaGlsZCIsIm15UGF0aHMiLCJzdGFydCIsIngiLCJ5IiwiZWxlbSIsInN2Z0VsZW1lbnQiLCJuZXdSZWN0IiwiaW5zZXJ0QmVmb3JlIiwiZmlyc3RDaGlsZCIsInZhbHVlWCIsInZhbHVlWSIsIm9iaiIsIm5ld1giLCJuZXdZIiwiYWN0dSIsImZvcmNlIiwiZGlzdGFuY2VYIiwibmVnWCIsImluZGljZVBvd1giLCJpbmRpY2VQb3dZIiwiTWF0aCIsInBvdyIsImFicyIsImRpc3RhbmNlWSIsIm5lZ1kiLCJzY3JvbGwiLCJ0aW1lIiwidGFiIiwicm90YXRlQW5nbGUiLCJjZW50cmVSb3RhdGVYIiwiY2VudHJlUm90YXRlWSIsInJheW9uWCIsInJheW9uWSIsInRyYW5zIiwidGVzdCIsInNsaWNlIiwicGFyc2VGbG9hdCIsInNwbGl0IiwicmVwbGFjZSIsImhhdXRldXIiLCJsYXJnZXVyIiwibGVmdCIsInRvcCIsInBvaW50WCIsInBvaW50WSIsIm5ld1BvaW50IiwicGFyc2VJbnQiLCJhIiwiYiIsImNhbGMiLCJhbmdsZSIsIm5ld0FuZ2xlIiwiY29zIiwic2luIiwieFZhbHVlIiwieVZhbHVlIiwibm9kZSIsInRhZ05hbWUiLCJzcXJ0IiwiaGF1dCIsImxhcmciLCJFeHBlcmllbmNlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7SUFBWUEsVTs7QUFDWjs7OztBQUNBOztJQUFZQyxLOztBQUNaOztBQUNBOzs7Ozs7OztBQUVBLElBQU1DLGVBQWVGLFdBQVdFLFlBQWhDO0FBQ0EsSUFBTUMsWUFBWUYsTUFBTUcsWUFBTixFQUFsQjs7SUFFTUMsVTs7O0FBQ0osc0JBQVlDLFFBQVosRUFBc0JDLE9BQXRCLEVBQStCQyxNQUEvQixFQUF1Q0MsT0FBdkMsRUFBZ0Q7QUFBQTtBQUFBLHlJQUN4Q0gsUUFEd0MsRUFDOUJDLE9BRDhCLEVBQ3JCQyxNQURxQixFQUNiQyxPQURhO0FBRS9DOzs7OzRCQUVPQyxRLEVBQVM7QUFDZixXQUFLQyxhQUFMLENBQW1CO0FBQ2pCLHFCQUFhLG9CQUFNO0FBQ2ZEO0FBQ0g7QUFIZ0IsT0FBbkI7QUFLRDs7O0VBWHNCVixXQUFXWSxJOztBQWNwQyxJQUFNQyxTQUFOOztBQUdBO0FBQ0E7O0lBQ3FCQyx1Qjs7O0FBQ25CLG1DQUFZQyxZQUFaLEVBQTBCO0FBQUE7O0FBRXhCO0FBRndCOztBQUd4QixXQUFLQyxRQUFMLEdBQWdCLE9BQUtDLE9BQUwsQ0FBYSxVQUFiLEVBQXlCLEVBQUVDLFVBQVUsQ0FBQyxXQUFELEVBQWMsV0FBZCxDQUFaLEVBQXpCLENBQWhCO0FBQ0EsV0FBS0MsV0FBTCxHQUFtQixPQUFLRixPQUFMLENBQWEsY0FBYixFQUE2QixFQUFFRyxhQUFhLENBQUMsYUFBRCxDQUFmLEVBQTdCLENBQW5CO0FBQ0EsV0FBS0MsS0FBTCxHQUFhLEdBQWI7QUFDQSxX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QUFPdkMsS0FBS3NDLElBQUwsQ0FBVXRDLEtBQUtDLEdBQUwsQ0FBVTlFLFdBQVEyRCxDQUFsQixFQUFxQixDQUFyQixJQUF3QmtCLEtBQUtDLEdBQUwsQ0FBVXJFLFdBQVFtRCxDQUFsQixFQUFxQixDQUFyQixDQUFsQyxDQUFQO0FBQ0Q7QUFDRjs7O0VBN1hrRHBILFdBQVc4SyxVOztrQkFBM0NoSyx1QiIsImZpbGUiOiJEZXNpZ25lckNoZW1pbkV4cGVyaWVuY2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBzb3VuZHdvcmtzIGZyb20gJ3NvdW5kd29ya3MvY2xpZW50JztcbmltcG9ydCBNeUdyYWluIGZyb20gJy4uL3BsYXllci9NeUdyYWluLmpzJztcbmltcG9ydCAqIGFzIHdhdmVzIGZyb20gJ3dhdmVzLWF1ZGlvJztcbmltcG9ydCB7UGhyYXNlUmVjb3JkZXJMZm99IGZyb20gJ3htbS1sZm8nO1xuaW1wb3J0IEVucmVnaXN0cmVtZW50Q2hlbWluIGZyb20gJy4vRW5yZWdpc3RyZW1lbnRDaGVtaW4uanMnO1xuXG5jb25zdCBhdWRpb0NvbnRleHQgPSBzb3VuZHdvcmtzLmF1ZGlvQ29udGV4dDtcbmNvbnN0IHNjaGVkdWxlciA9IHdhdmVzLmdldFNjaGVkdWxlcigpO1xuXG5jbGFzcyBQbGF5ZXJWaWV3IGV4dGVuZHMgc291bmR3b3Jrcy5WaWV3e1xuICBjb25zdHJ1Y3Rvcih0ZW1wbGF0ZSwgY29udGVudCwgZXZlbnRzLCBvcHRpb25zKSB7XG4gICAgc3VwZXIodGVtcGxhdGUsIGNvbnRlbnQsIGV2ZW50cywgb3B0aW9ucyk7XG4gIH1cblxuICBvblRvdWNoKGNhbGxiYWNrKXtcbiAgICB0aGlzLmluc3RhbGxFdmVudHMoe1xuICAgICAgJ2NsaWNrIHN2Zyc6ICgpID0+IHtcbiAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG59XG5cbmNvbnN0IHZpZXcgPSBgYFxuXG5cbi8vIHRoaXMgZXhwZXJpZW5jZSBwbGF5cyBhIHNvdW5kIHdoZW4gaXQgc3RhcnRzLCBhbmQgcGxheXMgYW5vdGhlciBzb3VuZCB3aGVuXG4vLyBvdGhlciBjbGllbnRzIGpvaW4gdGhlIGV4cGVyaWVuY2VcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERlc2lnbmVyRm9ybWVFeHBlcmllbmNlIGV4dGVuZHMgc291bmR3b3Jrcy5FeHBlcmllbmNlIHtcbiAgY29uc3RydWN0b3IoYXNzZXRzRG9tYWluKSB7XG4gICAgc3VwZXIoKTtcbiAgICAvL1NlcnZpY2VzXG4gICAgdGhpcy5wbGF0Zm9ybSA9IHRoaXMucmVxdWlyZSgncGxhdGZvcm0nLCB7IGZlYXR1cmVzOiBbJ3dlYi1hdWRpbycsICd3YWtlLWxvY2snXSB9KTtcbiAgICB0aGlzLm1vdGlvbklucHV0ID0gdGhpcy5yZXF1aXJlKCdtb3Rpb24taW5wdXQnLCB7IGRlc2NyaXB0b3JzOiBbJ29yaWVudGF0aW9uJ10gfSk7XG4gICAgdGhpcy5sYWJlbCA9ICd0JztcbiAgICB0aGlzLmFjdHVhbElkPTE7XG4gICAgdGhpcy5hY3R1YWxTZW5zPTE7XG4gICAgdGhpcy5zdGFydE9LID0gZmFsc2U7XG4gICAgdGhpcy5jb3VsZXVyUmVjID0gJ3doaXRlJztcbiAgfVxuXG4gIGluaXQoKSB7XG4gICAgLy8gaW5pdGlhbGl6ZSB0aGUgdmlld1xuICAgIHRoaXMudmlld1RlbXBsYXRlID0gdmlldztcbiAgICB0aGlzLnZpZXdDb250ZW50ID0ge307XG4gICAgdGhpcy52aWV3Q3RvciA9IFBsYXllclZpZXc7XG4gICAgdGhpcy52aWV3T3B0aW9ucyA9IHsgcHJlc2VydmVQaXhlbFJhdGlvOiB0cnVlIH07XG4gICAgdGhpcy52aWV3ID0gdGhpcy5jcmVhdGVWaWV3KCk7XG5cbiAgICAvL2JpbmRcbiAgICB0aGlzLl90b01vdmUgPSB0aGlzLl90b01vdmUuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9pc0luRWxsaXBzZSA9IHRoaXMuX2lzSW5FbGxpcHNlLmJpbmQodGhpcyk7XG4gICAgdGhpcy5faXNJblJlY3QgPSB0aGlzLl9pc0luUmVjdC5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX2lzSW4gPSB0aGlzLl9pc0luLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fZ2V0RGlzdGFuY2VOb2RlID0gdGhpcy5fZ2V0RGlzdGFuY2VOb2RlLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fcm90YXRlUG9pbnQgPSB0aGlzLl9yb3RhdGVQb2ludC5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX215TGlzdGVuZXI9IHRoaXMuX215TGlzdGVuZXIuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9vblRvdWNoID0gdGhpcy5fb25Ub3VjaC5iaW5kKHRoaXMpO1xuICAgIHRoaXMudmlldy5vblRvdWNoKHRoaXMuX29uVG91Y2gpO1xuICAgIHRoaXMuX2FkZEZvbmQgPSB0aGlzLl9hZGRGb25kLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fYWRkQm91bGUgPSB0aGlzLl9hZGRCb3VsZS5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX2FkZFJlY3QgPSB0aGlzLl9hZGRSZWN0LmJpbmQodGhpcyk7XG4gICAgdGhpcy5yZWNlaXZlKCdmb25kJywoZm9uZCxsYWJlbCxpZCxzZW5zKT0+dGhpcy5fYWRkRm9uZChmb25kLGxhYmVsLGlkLHNlbnMpKTtcblxuIH1cblxuICBzdGFydCgpIHtcbiAgICBpZighdGhpcy5zdGFydE9LKXtcbiAgICAgIHN1cGVyLnN0YXJ0KCk7IC8vIGRvbid0IGZvcmdldCB0aGlzXG4gICAgICBpZiAoIXRoaXMuaGFzU3RhcnRlZClcbiAgICAgICAgdGhpcy5pbml0KCk7XG4gICAgICB0aGlzLnNob3coKTtcbiAgICB9ZWxzZXtcbiAgICAgIC8vUGFyYW3DqHRyZSBpbml0aWF1eFxuICAgICAgdGhpcy5fYWRkQm91bGUoMTAwLDEwMCk7XG4gICAgICB0aGlzLl9hZGRSZWN0KCk7XG4gICAgICBkb2N1bWVudC5ib2R5LnN0eWxlLm92ZXJmbG93ID0gXCJoaWRkZW5cIjsgICAgLy9Db25zdGFudGVzXG4gICAgICB0aGlzLmNlbnRyZVggPSB3aW5kb3cuaW5uZXJXaWR0aC8yO1xuICAgICAgdGhpcy50YWlsbGVFY3JhblggPSB3aW5kb3cuaW5uZXJXaWR0aDtcbiAgICAgIHRoaXMudGFpbGxlRWNyYW5ZID0gd2luZG93LmlubmVySGVpZ2h0O1xuICAgICAgdGhpcy5jZW50cmVFY3JhblggPSB0aGlzLnRhaWxsZUVjcmFuWC8yO1xuICAgICAgdGhpcy5jZW50cmVFY3JhblkgPSB0aGlzLnRhaWxsZUVjcmFuWS8yO1xuICAgICAgc2V0VGltZW91dCgoKSA9PiB7dGhpcy5fbXlMaXN0ZW5lcigxMDApfSwxMDApO1xuICAgICAgdGhpcy5jZW50cmVZID0gd2luZG93LmlubmVySGVpZ2h0LzI7XG5cbiAgICAgIC8vWE1NLWxmb1xuICAgICAgdGhpcy5lbnJlZ2lzdHJlbWVudCA9IG5ldyBFbnJlZ2lzdHJlbWVudENoZW1pbih0aGlzLmxhYmVsLHRoaXMuYWN0dWFsSWQsdGhpcy5hY3R1YWxTZW5zKTtcbiAgICAgIHRoaXMub25SZWNvcmQgPSBmYWxzZTtcblxuICAgICAgLy9EZXRlY3RlIGxlcyBlbGVtZW50cyBTVkdcbiAgICAgIHRoaXMubGlzdGVFbGxpcHNlID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2VsbGlwc2UnKTtcbiAgICAgIHRoaXMubGlzdGVSZWN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3JlY3QnKTtcbiAgICAgIHRoaXMudG90YWxFbGVtZW50cyA9IHRoaXMubGlzdGVFbGxpcHNlLmxlbmd0aCArIHRoaXMubGlzdGVSZWN0Lmxlbmd0aDtcblxuICAgICAgLy9Jbml0aXNhbGlzYXRpb25cbiAgICAgIHRoaXMubWF4Q291bnRVcGRhdGUgPSA0O1xuICAgICAgdGhpcy5jb3VudFVwZGF0ZSA9IHRoaXMubWF4Q291bnRVcGRhdGUgKyAxOyAvLyBJbml0aWFsaXNhdGlvblxuICAgICAgdGhpcy52aXN1YWxpc2F0aW9uQm91bGU9dHJ1ZTsgLy8gVmlzdWFsaXNhdGlvbiBkZSBsYSBib3VsZVxuICAgICAgaWYoIXRoaXMudmlzdWFsaXNhdGlvbkJvdWxlKXtcbiAgICAgICAgdGhpcy52aWV3LiRlbC5xdWVyeVNlbGVjdG9yKCcjYm91bGUnKS5zdHlsZS5kaXNwbGF5PSdub25lJztcbiAgICAgIH1cbiAgICAgIHRoaXMudmlzdWFsaXNhdGlvbkZvcm1lPXRydWU7IC8vIFZpc3VhbGlzYXRpb24gZGVzIGZvcm1lcyBTVkdcbiAgICAgIGlmKCF0aGlzLnZpc3VhbGlzYXRpb25Gb3JtZSl7XG4gICAgICAgIGZvcihsZXQgaSA9IDA7aTx0aGlzLmxpc3RlRWxsaXBzZS5sZW5ndGg7aSsrKXtcbiAgICAgICAgICB0aGlzLmxpc3RlRWxsaXBzZVtpXS5zdHlsZS5kaXNwbGF5PSdub25lJztcbiAgICAgICAgfVxuICAgICAgICBmb3IobGV0IGkgPSAwO2k8dGhpcy5saXN0ZVJlY3QubGVuZ3RoO2krKyl7XG4gICAgICAgICAgdGhpcy5saXN0ZVJlY3RbaV0uc3R5bGUuZGlzcGxheT0nbm9uZSc7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8vUG91ciBlbmVsZXZlciBsZXMgYm9yZHVyZXMgOlxuICAgICAgaWYodGhpcy52aXN1YWxpc2F0aW9uRm9ybWUpe1xuICAgICAgICBmb3IobGV0IGkgPSAwO2k8dGhpcy5saXN0ZUVsbGlwc2UubGVuZ3RoO2krKyl7XG4gICAgICAgICAgdGhpcy5saXN0ZUVsbGlwc2VbaV0uc2V0QXR0cmlidXRlKCdzdHJva2Utd2lkdGgnLDApO1xuICAgICAgICB9XG4gICAgICAgIGZvcihsZXQgaSA9IDA7aTx0aGlzLmxpc3RlUmVjdC5sZW5ndGg7aSsrKXtcbiAgICAgICAgICB0aGlzLmxpc3RlUmVjdFtpXS5zZXRBdHRyaWJ1dGUoJ3N0cm9rZS13aWR0aCcsMCk7XG4gICAgICAgIH1cbiAgICAgIH0gICBcblxuICAgICAgLy9WYXJpYWJsZXMgXG4gICAgICB0aGlzLm1pcnJvckJvdWxlWCA9IDI1MDtcbiAgICAgIHRoaXMubWlycm9yQm91bGVZID0gMjUwO1xuICAgICAgdGhpcy5vZmZzZXRYID0gMDsgLy8gSW5pdGlzYWxpc2F0aW9uIGR1IG9mZnNldFxuICAgICAgdGhpcy5vZmZzZXRZID0gMFxuICAgICAgdGhpcy5TVkdfTUFYX1ggPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnc3ZnJylbMF0uZ2V0QXR0cmlidXRlKCd3aWR0aCcpO1xuICAgICAgdGhpcy5TVkdfTUFYX1kgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnc3ZnJylbMF0uZ2V0QXR0cmlidXRlKCdoZWlnaHQnKTtcblxuICAgICAgLy8gR2VzdGlvbiBkZSBsJ29yaWVudGF0aW9uXG4gICAgICB0aGlzLnRhYkluO1xuICAgICAgaWYgKHRoaXMubW90aW9uSW5wdXQuaXNBdmFpbGFibGUoJ29yaWVudGF0aW9uJykpIHtcbiAgICAgICAgdGhpcy5tb3Rpb25JbnB1dC5hZGRMaXN0ZW5lcignb3JpZW50YXRpb24nLCAoZGF0YSkgPT4ge1xuICAgICAgICAgIC8vIEFmZmljaGFnZVxuICAgICAgICAgIGNvbnN0IG5ld1ZhbHVlcyA9IHRoaXMuX3RvTW92ZShkYXRhWzJdLGRhdGFbMV0tMjUpO1xuICAgICAgICAgIHRoaXMudGFiSW4gPSB0aGlzLl9pc0luKG5ld1ZhbHVlc1swXSxuZXdWYWx1ZXNbMV0pO1xuICAgICAgICAgIHRoaXMuX21vdmVTY3JlZW5UbyhuZXdWYWx1ZXNbMF0sbmV3VmFsdWVzWzFdLDAuMDgpO1xuICAgICAgICAgIC8vIFhNTVxuICAgICAgICAgIHRoaXMuZW5yZWdpc3RyZW1lbnQucHJvY2VzcyhuZXdWYWx1ZXNbMF0sbmV3VmFsdWVzWzFdKTtcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZyhcIk9yaWVudGF0aW9uIG5vbiBkaXNwb25pYmxlXCIpO1xuICAgICAgfVxuICAgIH1cblxuICB9XG5cbi8qIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLUNBTEwgQkFDSyBFVkVOVC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tICovXG5cbl9vblRvdWNoKCl7XG4gIGlmKCF0aGlzLm9uUmVjb3JkKXtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImZvbmRcIikuc2V0QXR0cmlidXRlKFwiZmlsbFwiLCB0aGlzLmNvdWxldXJSZWMpO1xuICAgIHRoaXMub25SZWNvcmQgPSB0cnVlO1xuICAgIHRoaXMuZW5yZWdpc3RyZW1lbnQuc3RhcnRSZWNvcmQoKTtcbiAgfWVsc2V7XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJmb25kXCIpLnNldEF0dHJpYnV0ZShcImZpbGxcIiwgXCJibGFja1wiKTtcbiAgICB0aGlzLm9uUmVjb3JkID0gZmFsc2U7XG4gICAgdGhpcy5lbnJlZ2lzdHJlbWVudC5zdG9wUmVjb3JkKHRoaXMpO1xuICB9XG59XG5cbi8qIEFqb3V0ZSBsZSBmb25kICovXG5fYWRkRm9uZChmb25kLGxhYmVsLGlkLHNlbnMpe1xuICAvLyBPbiBwYXJzZSBsZSBmaWNoaWVyIFNWRyBlbiBET01cbiAgdGhpcy5hY3R1YWxJZCA9IGlkO1xuICB0aGlzLmFjdHVhbFNlbnMgPSBzZW5zO1xuICBsZXQgbXlMYXllcjtcbiAgY29uc3QgcGFyc2VyID0gbmV3IERPTVBhcnNlcigpO1xuICBsZXQgZm9uZFhtbCA9IHBhcnNlci5wYXJzZUZyb21TdHJpbmcoZm9uZCwnYXBwbGljYXRpb24veG1sJyk7XG4gIGZvbmRYbWwgPSBmb25kWG1sLmdldEVsZW1lbnRzQnlUYWdOYW1lKCd0aXRsZScpO1xuICBmb3IobGV0IGkgPSAwOyBpPGZvbmRYbWwubGVuZ3RoO2krKyl7XG4gICAgaWYoZm9uZFhtbFtpXS5pbm5lckhUTUw9PSdDaGVtaW4nKXtcbiAgICAgIG15TGF5ZXIgPSBmb25kWG1sW2ldO1xuICAgIH1cbiAgfVxuICBsZXQgbXlHID0gbXlMYXllci5wYXJlbnROb2RlOyBcbiAgbGV0IG15U3ZnID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKCdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycsJ3N2ZycpO1xuICBteVN2Zy5zZXRBdHRyaWJ1dGVOUyhudWxsLCd3aWR0aCcsIDEwMDAwKTtcbiAgbXlTdmcuc2V0QXR0cmlidXRlTlMobnVsbCwnaGVpZ2h0JywgMTAwMDApO1xuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZXhwZXJpZW5jZScpLmFwcGVuZENoaWxkKG15U3ZnKTtcbiAgbXlTdmcuYXBwZW5kQ2hpbGQobXlHKTtcbiAgLy8gT24gYWxsdW1lIHNldWxlbWVudCBsZSBwYXRoIHZvdWx1XG4gIGxldCBteVBhdGhzID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3BhdGgnKTtcbiAgZm9yKGxldCBpID0gMDsgaTxteVBhdGhzLmxlbmd0aDsgaSsrKXtcbiAgICBpZihpIT1pZCl7XG4gICAgICBteVBhdGhzW2ldLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgfVxuICB9XG5cbiAgdGhpcy5zdGFydE9LID0gdHJ1ZTtcbiAgdGhpcy5sYWJlbCA9IGxhYmVsO1xuICB0aGlzLnN0YXJ0KCk7XG59XG5cbi8qIEFqb3V0ZSBsYSBib3VsZSBhdSBmb25kICovXG5fYWRkQm91bGUoeCx5KXtcbiAgY29uc3QgZWxlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUygnaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnLCdjaXJjbGUnKTtcbiAgZWxlbS5zZXRBdHRyaWJ1dGVOUyhudWxsLFwiY3hcIix4KTtcbiAgICBlbGVtLnNldEF0dHJpYnV0ZU5TKG51bGwsXCJjeVwiLHkpO1xuICAgIGVsZW0uc2V0QXR0cmlidXRlTlMobnVsbCxcInJcIiwxMCk7XG4gICAgZWxlbS5zZXRBdHRyaWJ1dGVOUyhudWxsLFwic3Ryb2tlXCIsJ3doaXRlJyk7XG4gICAgZWxlbS5zZXRBdHRyaWJ1dGVOUyhudWxsLFwic3Ryb2tlLXdpZHRoXCIsMyk7XG4gICAgZWxlbS5zZXRBdHRyaWJ1dGVOUyhudWxsLFwiZmlsbFwiLCdibGFjaycpO1xuICAgIGVsZW0uc2V0QXR0cmlidXRlTlMobnVsbCxcImlkXCIsJ2JvdWxlJyk7XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3N2ZycpWzBdLmFwcGVuZENoaWxkKGVsZW0pO1xuICB9XG5cbiAgX2FkZFJlY3QoKXtcbiAgICBjb25zdCBzdmdFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3N2ZycpWzBdO1xuICAgIGxldCB4ID0gc3ZnRWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3dpZHRoJyk7XG4gICAgbGV0IHkgPSBzdmdFbGVtZW50LmdldEF0dHJpYnV0ZSgnaGVpZ2h0Jyk7XG4gICAgY29uc3QgbmV3UmVjdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUygnaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnLCdyZWN0Jyk7XG4gICAgbmV3UmVjdC5zZXRBdHRyaWJ1dGVOUyhudWxsLCd3aWR0aCcseCk7XG4gICAgbmV3UmVjdC5zZXRBdHRyaWJ1dGVOUyhudWxsLCdoZWlnaHQnLCB5KTtcbiAgICBuZXdSZWN0LnNldEF0dHJpYnV0ZU5TKG51bGwsJ3gnLDApO1xuICAgIG5ld1JlY3Quc2V0QXR0cmlidXRlTlMobnVsbCwneScsMCk7XG4gICAgbmV3UmVjdC5zZXRBdHRyaWJ1dGVOUyhudWxsLCdpZCcsJ2ZvbmQnKTtcbiAgICBzdmdFbGVtZW50Lmluc2VydEJlZm9yZShuZXdSZWN0LHN2Z0VsZW1lbnQuZmlyc3RDaGlsZCk7XG4gIH1cblxuLyogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tTU9VVkVNRU5UIERFIEwgRUNSQU4tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gKi9cblxuICAvKiBDYWxsYmFjayBvcmllbnRhdGlvbk1vdGlvbiAvIE1vdXZlbWVudCBkZSBsYSBib3VsZSovXG4gIF90b01vdmUodmFsdWVYLHZhbHVlWSl7XG4gICAgY29uc3Qgb2JqID0gdGhpcy52aWV3LiRlbC5xdWVyeVNlbGVjdG9yKCcjYm91bGUnKTtcbiAgICBsZXQgbmV3WDtcbiAgICBsZXQgbmV3WTtcbiAgICBsZXQgYWN0dSA9IHRoaXMubWlycm9yQm91bGVYK3ZhbHVlWCowLjM7IC8vcGFyc2VJbnQob2JqLmdldEF0dHJpYnV0ZSgnY3gnKSkrdmFsdWVYKjAuMztcbiAgICBpZihhY3R1PHRoaXMub2Zmc2V0WCl7XG4gICAgICBhY3R1PSB0aGlzLm9mZnNldFggO1xuICAgIH1lbHNlIGlmKGFjdHUgPih0aGlzLnRhaWxsZUVjcmFuWCt0aGlzLm9mZnNldFgpKXtcbiAgICAgIGFjdHU9IHRoaXMudGFpbGxlRWNyYW5YK3RoaXMub2Zmc2V0WFxuICAgIH1cbiAgICBpZih0aGlzLnZpc3VhbGlzYXRpb25Cb3VsZSl7XG4gICAgICBvYmouc2V0QXR0cmlidXRlKCdjeCcsIGFjdHUpO1xuICAgIH1cbiAgICB0aGlzLm1pcnJvckJvdWxlWCA9IGFjdHU7XG4gICAgbmV3WD1hY3R1O1xuICAgIGFjdHUgPSB0aGlzLm1pcnJvckJvdWxlWSt2YWx1ZVkqMC4zOy8vcGFyc2VJbnQob2JqLmdldEF0dHJpYnV0ZSgnY3knKSkrdmFsdWVZKjAuMztcbiAgICBpZihhY3R1PCh0aGlzLm9mZnNldFkpKXtcbiAgICAgIGFjdHU9IHRoaXMub2Zmc2V0WTtcbiAgICB9XG4gICAgaWYoYWN0dSA+ICh0aGlzLnRhaWxsZUVjcmFuWSt0aGlzLm9mZnNldFkpKXtcbiAgICAgIGFjdHUgPSB0aGlzLnRhaWxsZUVjcmFuWSt0aGlzLm9mZnNldFk7XG4gICAgfVxuICAgIGlmKHRoaXMudmlzdWFsaXNhdGlvbkJvdWxlKXtcbiAgICAgIG9iai5zZXRBdHRyaWJ1dGUoJ2N5JywgYWN0dSk7XG4gICAgfVxuICAgIHRoaXMubWlycm9yQm91bGVZPSBhY3R1O1xuICAgIG5ld1k9YWN0dTtcbiAgICByZXR1cm4gW25ld1gsbmV3WV07XG4gIH1cblxuICAvLyBEw6lwbGFjZSBsJ8OpY3JhbiBkYW5zIGxhIG1hcFxuICBfbW92ZVNjcmVlblRvKHgseSxmb3JjZT0xKXtcbiAgICBsZXQgZGlzdGFuY2VYID0gKHgtdGhpcy5vZmZzZXRYKS10aGlzLmNlbnRyZUVjcmFuWDtcbiAgICBsZXQgbmVnWCA9IGZhbHNlO1xuICAgIGxldCBpbmRpY2VQb3dYID0gMztcbiAgICBsZXQgaW5kaWNlUG93WSA9IDM7XG4gICAgaWYoZGlzdGFuY2VYPDApe1xuICAgICAgbmVnWCA9IHRydWU7XG4gICAgfVxuICAgIGRpc3RhbmNlWCA9IE1hdGgucG93KChNYXRoLmFicyhkaXN0YW5jZVgvdGhpcy5jZW50cmVFY3JhblgpKSxpbmRpY2VQb3dYKSp0aGlzLmNlbnRyZUVjcmFuWDsgXG4gICAgaWYobmVnWCl7XG4gICAgICBkaXN0YW5jZVggKj0gLTE7XG4gICAgfVxuICAgIGlmKHRoaXMub2Zmc2V0WCsoZGlzdGFuY2VYKmZvcmNlKT49MCYmKHRoaXMub2Zmc2V0WCsoZGlzdGFuY2VYKmZvcmNlKTw9dGhpcy5TVkdfTUFYX1gtdGhpcy50YWlsbGVFY3JhblgpKXtcbiAgICAgIHRoaXMub2Zmc2V0WCArPSAoZGlzdGFuY2VYKmZvcmNlKTtcbiAgICB9XG5cbiAgICBsZXQgZGlzdGFuY2VZID0gKHktdGhpcy5vZmZzZXRZKS10aGlzLmNlbnRyZUVjcmFuWTtcbiAgICBsZXQgbmVnWSA9IGZhbHNlO1xuICAgIGlmKGRpc3RhbmNlWTwwKXtcbiAgICAgIG5lZ1kgPSB0cnVlO1xuICAgIH1cbiAgICBkaXN0YW5jZVkgPSBNYXRoLnBvdygoTWF0aC5hYnMoZGlzdGFuY2VZL3RoaXMuY2VudHJlRWNyYW5ZKSksaW5kaWNlUG93WSkqdGhpcy5jZW50cmVFY3Jhblk7XG4gICAgaWYobmVnWSl7XG4gICAgICBkaXN0YW5jZVkgKj0gLTE7XG4gICAgfVxuICAgIGlmKCh0aGlzLm9mZnNldFkrKGRpc3RhbmNlWSpmb3JjZSk+PTApJiYodGhpcy5vZmZzZXRZKyhkaXN0YW5jZVkqZm9yY2UpPD10aGlzLlNWR19NQVhfWS10aGlzLnRhaWxsZUVjcmFuWSkpe1xuICAgICAgdGhpcy5vZmZzZXRZICs9IChkaXN0YW5jZVkqZm9yY2UpO1xuICAgIH1cbiAgICB3aW5kb3cuc2Nyb2xsKHRoaXMub2Zmc2V0WCx0aGlzLm9mZnNldFkpXG4gIH1cblxuICBfbXlMaXN0ZW5lcih0aW1lKXtcbiAgICB0aGlzLnRhaWxsZUVjcmFuWCA9IHdpbmRvdy5pbm5lcldpZHRoO1xuICAgIHRoaXMudGFpbGxlRWNyYW5ZID0gd2luZG93LmlubmVySGVpZ2h0O1xuICAgIHNldFRpbWVvdXQodGhpcy5fbXlMaXN0ZW5lcix0aW1lKTtcbiAgfVxuXG4vKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1ERVRFUk1JTkFUSU9OIERFUyBJTi9PVVQgREVTIEZPUk1FUy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAqL1xuXG4gIC8vIEZvbmN0aW9uIHF1aSBwZXJtZXQgZGUgY29ubmHDrnRyZSBsJ2Vuc2VtYmxlIGRlcyBmaWd1cmVzIG/DuSBsZSBwb2ludCBzZSBzaXR1ZVxuICBfaXNJbih4LHkpe1xuICAgIGxldCB0YWIgPSBbXTtcbiAgICBsZXQgcm90YXRlQW5nbGU7XG4gICAgbGV0IGNlbnRyZVJvdGF0ZVg7XG4gICAgbGV0IGNlbnRyZVJvdGF0ZVk7XG4gICAgZm9yKGxldCBpPTA7aTx0aGlzLmxpc3RlRWxsaXBzZS5sZW5ndGg7aSsrKXtcbiAgICAgIHJvdGF0ZUFuZ2xlPTA7XG4gICAgICBjb25zdCBjZW50cmVYID0gdGhpcy5saXN0ZUVsbGlwc2VbaV0uZ2V0QXR0cmlidXRlKCdjeCcpO1xuICAgICAgY29uc3QgY2VudHJlWSA9IHRoaXMubGlzdGVFbGxpcHNlW2ldLmdldEF0dHJpYnV0ZSgnY3knKTtcbiAgICAgIGNvbnN0IHJheW9uWCA9IHRoaXMubGlzdGVFbGxpcHNlW2ldLmdldEF0dHJpYnV0ZSgncngnKTtcbiAgICAgIGNvbnN0IHJheW9uWSA9IHRoaXMubGlzdGVFbGxpcHNlW2ldLmdldEF0dHJpYnV0ZSgncnknKTtcbiAgICAgIGxldCB0cmFucyA9IHRoaXMubGlzdGVFbGxpcHNlW2ldLmdldEF0dHJpYnV0ZSgndHJhbnNmb3JtJyk7XG4gICAgICBpZigvcm90YXRlLy50ZXN0KHRyYW5zKSl7XG4gICAgICAgIHRyYW5zID0gdHJhbnMuc2xpY2UoNyx0cmFucy5sZW5ndGgpO1xuICAgICAgICBjZW50cmVSb3RhdGVYID0gcGFyc2VGbG9hdCh0cmFucy5zcGxpdChcIiBcIilbMV0pO1xuICAgICAgICBjZW50cmVSb3RhdGVZID0gcGFyc2VGbG9hdCh0cmFucy5zcGxpdChcIixcIilbMV0ucmVwbGFjZShcIilcIixcIlwiKSk7XG4gICAgICAgIHJvdGF0ZUFuZ2xlID0gcGFyc2VGbG9hdCh0cmFucy5zcGxpdChcIiBcIilbMF0pO1xuICAgICAgfVxuICAgICAgdGFiW3RhYi5sZW5ndGhdPXRoaXMuX2lzSW5FbGxpcHNlKHBhcnNlRmxvYXQoY2VudHJlWCkscGFyc2VGbG9hdChjZW50cmVZKSxwYXJzZUZsb2F0KHJheW9uWCkscGFyc2VGbG9hdChyYXlvblkpLHgseSxyb3RhdGVBbmdsZSxjZW50cmVSb3RhdGVYLGNlbnRyZVJvdGF0ZVkpOyAgICAgXG4gICAgfVxuICAgIGZvcihsZXQgaT0wO2k8dGhpcy5saXN0ZVJlY3QubGVuZ3RoO2krKyl7XG4gICAgICByb3RhdGVBbmdsZT0wO1xuICAgICAgY2VudHJlUm90YXRlWD1udWxsO1xuICAgICAgY2VudHJlUm90YXRlWT1udWxsO1xuICAgICAgY29uc3QgaGF1dGV1ciA9IHRoaXMubGlzdGVSZWN0W2ldLmdldEF0dHJpYnV0ZSgnd2lkdGgnKTtcbiAgICAgIGNvbnN0IGxhcmdldXIgPSB0aGlzLmxpc3RlUmVjdFtpXS5nZXRBdHRyaWJ1dGUoJ2hlaWdodCcpO1xuICAgICAgY29uc3QgbGVmdCA9IHRoaXMubGlzdGVSZWN0W2ldLmdldEF0dHJpYnV0ZSgneCcpO1xuICAgICAgY29uc3QgdG9wID0gdGhpcy5saXN0ZVJlY3RbaV0uZ2V0QXR0cmlidXRlKCd5Jyk7XG4gICAgICBsZXQgdHJhbnMgPSB0aGlzLmxpc3RlUmVjdFtpXS5nZXRBdHRyaWJ1dGUoJ3RyYW5zZm9ybScpO1xuICAgICAgaWYoL3JvdGF0ZS8udGVzdCh0cmFucykpe1xuICAgICAgICB0cmFucyA9IHRyYW5zLnNsaWNlKDcsdHJhbnMubGVuZ3RoKTtcbiAgICAgICAgY2VudHJlUm90YXRlWCA9IHBhcnNlRmxvYXQodHJhbnMuc3BsaXQoXCIgXCIpWzFdKTtcbiAgICAgICAgY2VudHJlUm90YXRlWSA9IHBhcnNlRmxvYXQodHJhbnMuc3BsaXQoXCIsXCIpWzFdLnJlcGxhY2UoXCIpXCIsXCJcIikpO1xuICAgICAgICByb3RhdGVBbmdsZSA9IHBhcnNlRmxvYXQodHJhbnMuc3BsaXQoXCIgXCIpWzBdKTtcbiAgICAgIH1cbiAgICAgIHRhYlt0YWIubGVuZ3RoXT10aGlzLl9pc0luUmVjdChwYXJzZUZsb2F0KGhhdXRldXIpLCBwYXJzZUZsb2F0KGxhcmdldXIpLCBwYXJzZUZsb2F0KGxlZnQpLCBwYXJzZUZsb2F0KHRvcCksIHgsIHkscm90YXRlQW5nbGUsY2VudHJlUm90YXRlWCxjZW50cmVSb3RhdGVZKTtcbiAgICB9ICBcbiAgICByZXR1cm4gdGFiO1xuICB9XG5cblxuICAvLyBGb25jdGlvbiBxdWkgZGl0IHNpIHVuIHBvaW50IGVzdCBkYW5zIHVuIHJlY3RcbiAgIF9pc0luUmVjdChoYXV0ZXVyLGxhcmdldXIsbGVmdCx0b3AscG9pbnRYLHBvaW50WSxyb3RhdGVBbmdsZSxjZW50cmVSb3RhdGVYLGNlbnRyZVJvdGF0ZVkpe1xuICAgICAgLy9yb3RhdGlvblxuICAgICAgY29uc3QgbmV3UG9pbnQgPSB0aGlzLl9yb3RhdGVQb2ludChwb2ludFgscG9pbnRZLGNlbnRyZVJvdGF0ZVgsY2VudHJlUm90YXRlWSxyb3RhdGVBbmdsZSk7XG4gICAgICAvL0FwcGFydGVuYW5jZVxuICAgICAgaWYobmV3UG9pbnRbMF0gPiBwYXJzZUludChsZWZ0KSAmJiBuZXdQb2ludFswXSA8KHBhcnNlSW50KGxlZnQpK3BhcnNlSW50KGhhdXRldXIpKSAmJiBuZXdQb2ludFsxXSA+IHRvcCAmJiBuZXdQb2ludFsxXSA8IChwYXJzZUludCh0b3ApICsgcGFyc2VJbnQobGFyZ2V1cikpKXtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgfVxuXG4gIC8vIEZvbmN0aW9uIHF1aSBkaXQgc2kgdW4gcG9pbnQgZXN0IGRhbnMgdW5lIGVsbGlwc2VcbiAgX2lzSW5FbGxpcHNlKGNlbnRyZVgsY2VudHJlWSxyYXlvblgscmF5b25ZLHBvaW50WCxwb2ludFkscm90YXRlQW5nbGUsY2VudHJlUm90YXRlWCxjZW50cmVSb3RhdGVZKXtcbiAgICAvL3JvdGF0aW9uXG4gICAgY29uc3QgbmV3UG9pbnQgPSB0aGlzLl9yb3RhdGVQb2ludChwb2ludFgscG9pbnRZLGNlbnRyZVJvdGF0ZVgsY2VudHJlUm90YXRlWSxyb3RhdGVBbmdsZSk7XG4gICAgLy9BcHBhcnRlbmFuY2UgXG4gICAgbGV0IGEgPSByYXlvblg7OyAvLyBHcmFuZCByYXlvblxuICAgIGxldCBiID0gcmF5b25ZOyAvLyBQZXRpdCByYXlvblxuICAgIC8vY29uc3QgYyA9IE1hdGguc3FydCgoYSphKS0oYipiKSk7IC8vIERpc3RhbmNlIEZveWVyXG4gICAgY29uc3QgY2FsYyA9ICgoTWF0aC5wb3coKG5ld1BvaW50WzBdLWNlbnRyZVgpLDIpKS8oTWF0aC5wb3coYSwyKSkpKygoTWF0aC5wb3coKG5ld1BvaW50WzFdLWNlbnRyZVkpLDIpKS8oTWF0aC5wb3coYiwyKSkpO1xuICAgIGlmKGNhbGM8PTEpe1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfWVsc2V7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG4gIFxuICAvLyBGb25jdGlvbiBwZXJtZXR0YW50IGRlIHLDqWF4ZXIgbGUgcG9pbnRcbiAgX3JvdGF0ZVBvaW50KHgseSxjZW50cmVYLGNlbnRyZVksYW5nbGUpe1xuICAgIGxldCBuZXdBbmdsZSA9IGFuZ2xlKigzLjE0MTU5MjY1LzE4MCk7IC8vIFBhc3NhZ2UgZW4gcmFkaWFuXG4gICAgbGV0IHRhYiA9IFtdO1xuICAgIGxldCBuZXdYID0gKHgtY2VudHJlWCkqTWF0aC5jb3MobmV3QW5nbGUpKyh5LWNlbnRyZVkpKk1hdGguc2luKG5ld0FuZ2xlKTtcbiAgICBsZXQgbmV3WSA9IC0xKih4LWNlbnRyZVgpKk1hdGguc2luKG5ld0FuZ2xlKSsoeS1jZW50cmVZKSpNYXRoLmNvcyhuZXdBbmdsZSk7XG4gICAgbmV3WCArPSBjZW50cmVYO1xuICAgIG5ld1kgKz0gY2VudHJlWTtcbiAgICAvL0FmZmljaGFnZSBkdSBzeW3DqXRyaXF1ZVxuICAgICAvLyBjb25zdCBvYmogPSB0aGlzLnZpZXcuJGVsLnF1ZXJ5U2VsZWN0b3IoJyNib3VsZVInKTtcbiAgICAgLy8gb2JqLnNldEF0dHJpYnV0ZShcImN4XCIsbmV3WCk7XG4gICAgIC8vIG9iai5zZXRBdHRyaWJ1dGUoXCJjeVwiLG5ld1kpO1xuICAgIC8vRmluIGRlIGwnYWZmaWNoYWdlIGR1IHN5bcOpdHJpcXVlXG4gICAgdGFiWzBdID0gbmV3WDtcbiAgICB0YWJbMV0gPSBuZXdZO1xuICAgIHJldHVybiB0YWI7XG4gIH1cblxuLyogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tQ2FsY3VsIGRlcyBkaXN0YW5jZXMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gKi9cblxuICAvLyBEb25uZSBsYSBkaXN0YW5jZSBkdSBwb2ludCBhdmVjIGxlcyBmb3JtZXMgcHLDqXNlbnRlc1xuICBfZ2V0RGlzdGFuY2UoeFZhbHVlLHlWYWx1ZSl7XG4gICAgbGV0IHRhYiA9IFtdO1xuICAgIGZvcihsZXQgaT0wO2k8dGhpcy5saXN0ZUVsbGlwc2UubGVuZ3RoO2krKyl7XG4gICAgICB0YWJbdGFiLmxlbmd0aF09dGhpcy5fZ2V0RGlzdGFuY2VOb2RlKHRoaXMubGlzdGVFbGxpcHNlW2ldLHhWYWx1ZSx5VmFsdWUpO1xuICAgIH1cbiAgICBmb3IobGV0IGk9MDtpPHRoaXMubGlzdGVSZWN0Lmxlbmd0aDtpKyspe1xuICAgICAgdGFiW3RhYi5sZW5ndGhdPXRoaXMuX2dldERpc3RhbmNlTm9kZSh0aGlzLmxpc3RlUmVjdFtpXSx4VmFsdWUseVZhbHVlKTtcbiAgICB9XG4gICAgcmV0dXJuIHRhYjtcbiAgfVxuXG4gIC8vIERvbm5lIGxhIGRpc3RhbmNlIGQndW4gcG9pbnQgYXZlYyB1bmUgZm9ybWVcbiAgX2dldERpc3RhbmNlTm9kZShub2RlLHgseSl7XG4gICAgaWYobm9kZS50YWdOYW1lPT1cImVsbGlwc2VcIil7XG4gICAgICBsZXQgY2VudHJlWCA9IHBhcnNlSW50KG5vZGUuZ2V0QXR0cmlidXRlKCdjeCcpKTtcbiAgICAgIGxldCBjZW50cmVZID0gcGFyc2VJbnQobm9kZS5nZXRBdHRyaWJ1dGUoJ2N5JykpO1xuICAgICAgcmV0dXJuIE1hdGguc3FydChNYXRoLnBvdygoY2VudHJlWC14KSwyKStNYXRoLnBvdygoY2VudHJlWS15KSwyKSk7XG4gICAgfWVsc2UgaWYobm9kZS50YWdOYW1lPT0ncmVjdCcpe1xuICAgICAgbGV0IGxlZnQgPSBwYXJzZUludChub2RlLmdldEF0dHJpYnV0ZSgneCcpKTtcbiAgICAgIGxldCB0b3AgPSBwYXJzZUludChub2RlLmdldEF0dHJpYnV0ZSgneScpKTtcbiAgICAgIGxldCBoYXV0ID0gcGFyc2VJbnQobm9kZS5nZXRBdHRyaWJ1dGUoJ2hlaWdodCcpKTtcbiAgICAgIGxldCBsYXJnID0gcGFyc2VJbnQobm9kZS5nZXRBdHRyaWJ1dGUoJ3dpZHRoJykpO1xuICAgICAgbGV0IGNlbnRyZVggPSAobGVmdCtsYXJnKS8yO1xuICAgICAgbGV0IGNlbnRyZVkgPSAodG9wK2hhdXQpLzI7XG4gICAgICByZXR1cm4gTWF0aC5zcXJ0KE1hdGgucG93KChjZW50cmVYLXgpLDIpK01hdGgucG93KChjZW50cmVZLXkpLDIpKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==