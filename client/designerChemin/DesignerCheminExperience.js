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
    _this2.loader = _this2.require('loader', { files: ['sounds/nappe/branches.mp3', 'sounds/nappe/gadoue.mp3', "sounds/nappe/nage.mp3", "sounds/nappe/tempete.mp3", "sounds/nappe/vent.mp3"] });
    _this2.label = 't';
    _this2.actualId = 1;
    _this2.actualSens = 1;
    _this2.startOK = false;
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
        document.getElementById("fond").setAttribute("fill", "red");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRlc2lnbmVyQ2hlbWluRXhwZXJpZW5jZS5qcyJdLCJuYW1lcyI6WyJzb3VuZHdvcmtzIiwid2F2ZXMiLCJhdWRpb0NvbnRleHQiLCJzY2hlZHVsZXIiLCJnZXRTY2hlZHVsZXIiLCJQbGF5ZXJWaWV3IiwidGVtcGxhdGUiLCJjb250ZW50IiwiZXZlbnRzIiwib3B0aW9ucyIsImNhbGxiYWNrIiwiaW5zdGFsbEV2ZW50cyIsIlZpZXciLCJ2aWV3IiwiRGVzaWduZXJGb3JtZUV4cGVyaWVuY2UiLCJhc3NldHNEb21haW4iLCJwbGF0Zm9ybSIsInJlcXVpcmUiLCJmZWF0dXJlcyIsIm1vdGlvbklucHV0IiwiZGVzY3JpcHRvcnMiLCJsb2FkZXIiLCJmaWxlcyIsImxhYmVsIiwiYWN0dWFsSWQiLCJhY3R1YWxTZW5zIiwic3RhcnRPSyIsInZpZXdUZW1wbGF0ZSIsInZpZXdDb250ZW50Iiwidmlld0N0b3IiLCJ2aWV3T3B0aW9ucyIsInByZXNlcnZlUGl4ZWxSYXRpbyIsImNyZWF0ZVZpZXciLCJfdG9Nb3ZlIiwiYmluZCIsIl9pc0luRWxsaXBzZSIsIl9pc0luUmVjdCIsIl9pc0luIiwiX2dldERpc3RhbmNlTm9kZSIsIl9yb3RhdGVQb2ludCIsIl9teUxpc3RlbmVyIiwiX29uVG91Y2giLCJvblRvdWNoIiwiX2FkZEZvbmQiLCJfYWRkQm91bGUiLCJfYWRkUmVjdCIsInJlY2VpdmUiLCJmb25kIiwiaWQiLCJzZW5zIiwiaGFzU3RhcnRlZCIsImluaXQiLCJzaG93IiwiZG9jdW1lbnQiLCJib2R5Iiwic3R5bGUiLCJvdmVyZmxvdyIsImNlbnRyZVgiLCJ3aW5kb3ciLCJpbm5lcldpZHRoIiwidGFpbGxlRWNyYW5YIiwidGFpbGxlRWNyYW5ZIiwiaW5uZXJIZWlnaHQiLCJjZW50cmVFY3JhblgiLCJjZW50cmVFY3JhblkiLCJzZXRUaW1lb3V0IiwiY2VudHJlWSIsImVucmVnaXN0cmVtZW50Iiwib25SZWNvcmQiLCJsaXN0ZUVsbGlwc2UiLCJnZXRFbGVtZW50c0J5VGFnTmFtZSIsImxpc3RlUmVjdCIsInRvdGFsRWxlbWVudHMiLCJsZW5ndGgiLCJtYXhDb3VudFVwZGF0ZSIsImNvdW50VXBkYXRlIiwidmlzdWFsaXNhdGlvbkJvdWxlIiwiJGVsIiwicXVlcnlTZWxlY3RvciIsImRpc3BsYXkiLCJ2aXN1YWxpc2F0aW9uRm9ybWUiLCJpIiwic2V0QXR0cmlidXRlIiwibWlycm9yQm91bGVYIiwibWlycm9yQm91bGVZIiwib2Zmc2V0WCIsIm9mZnNldFkiLCJTVkdfTUFYX1giLCJnZXRBdHRyaWJ1dGUiLCJTVkdfTUFYX1kiLCJ0YWJJbiIsImlzQXZhaWxhYmxlIiwiYWRkTGlzdGVuZXIiLCJkYXRhIiwibmV3VmFsdWVzIiwiX21vdmVTY3JlZW5UbyIsInByb2Nlc3MiLCJjb25zb2xlIiwibG9nIiwiZ2V0RWxlbWVudEJ5SWQiLCJzdGFydFJlY29yZCIsInN0b3BSZWNvcmQiLCJteUxheWVyIiwicGFyc2VyIiwiRE9NUGFyc2VyIiwiZm9uZFhtbCIsInBhcnNlRnJvbVN0cmluZyIsImlubmVySFRNTCIsIm15RyIsInBhcmVudE5vZGUiLCJteVN2ZyIsImNyZWF0ZUVsZW1lbnROUyIsInNldEF0dHJpYnV0ZU5TIiwiYXBwZW5kQ2hpbGQiLCJteVBhdGhzIiwic3RhcnQiLCJ4IiwieSIsImVsZW0iLCJzdmdFbGVtZW50IiwibmV3UmVjdCIsImluc2VydEJlZm9yZSIsImZpcnN0Q2hpbGQiLCJ2YWx1ZVgiLCJ2YWx1ZVkiLCJvYmoiLCJuZXdYIiwibmV3WSIsImFjdHUiLCJmb3JjZSIsImRpc3RhbmNlWCIsIm5lZ1giLCJpbmRpY2VQb3dYIiwiaW5kaWNlUG93WSIsIk1hdGgiLCJwb3ciLCJhYnMiLCJkaXN0YW5jZVkiLCJuZWdZIiwic2Nyb2xsIiwidGltZSIsInRhYiIsInJvdGF0ZUFuZ2xlIiwiY2VudHJlUm90YXRlWCIsImNlbnRyZVJvdGF0ZVkiLCJyYXlvblgiLCJyYXlvblkiLCJ0cmFucyIsInRlc3QiLCJzbGljZSIsInBhcnNlRmxvYXQiLCJzcGxpdCIsInJlcGxhY2UiLCJoYXV0ZXVyIiwibGFyZ2V1ciIsImxlZnQiLCJ0b3AiLCJwb2ludFgiLCJwb2ludFkiLCJuZXdQb2ludCIsInBhcnNlSW50IiwiYSIsImIiLCJjYWxjIiwiYW5nbGUiLCJuZXdBbmdsZSIsImNvcyIsInNpbiIsInhWYWx1ZSIsInlWYWx1ZSIsIm5vZGUiLCJ0YWdOYW1lIiwic3FydCIsImhhdXQiLCJsYXJnIiwiRXhwZXJpZW5jZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7O0lBQVlBLFU7O0FBQ1o7Ozs7QUFDQTs7SUFBWUMsSzs7QUFDWjs7QUFDQTs7Ozs7Ozs7QUFFQSxJQUFNQyxlQUFlRixXQUFXRSxZQUFoQztBQUNBLElBQU1DLFlBQVlGLE1BQU1HLFlBQU4sRUFBbEI7O0lBRU1DLFU7OztBQUNKLHNCQUFZQyxRQUFaLEVBQXNCQyxPQUF0QixFQUErQkMsTUFBL0IsRUFBdUNDLE9BQXZDLEVBQWdEO0FBQUE7QUFBQSx5SUFDeENILFFBRHdDLEVBQzlCQyxPQUQ4QixFQUNyQkMsTUFEcUIsRUFDYkMsT0FEYTtBQUUvQzs7Ozs0QkFFT0MsUSxFQUFTO0FBQ2YsV0FBS0MsYUFBTCxDQUFtQjtBQUNqQixxQkFBYSxvQkFBTTtBQUNmRDtBQUNIO0FBSGdCLE9BQW5CO0FBS0Q7OztFQVhzQlYsV0FBV1ksSTs7QUFjcEMsSUFBTUMsU0FBTjs7QUFHQTtBQUNBOztJQUNxQkMsdUI7OztBQUNuQixtQ0FBWUMsWUFBWixFQUEwQjtBQUFBOztBQUV4QjtBQUZ3Qjs7QUFHeEIsV0FBS0MsUUFBTCxHQUFnQixPQUFLQyxPQUFMLENBQWEsVUFBYixFQUF5QixFQUFFQyxVQUFVLENBQUMsV0FBRCxFQUFjLFdBQWQsQ0FBWixFQUF6QixDQUFoQjtBQUNBLFdBQUtDLFdBQUwsR0FBbUIsT0FBS0YsT0FBTCxDQUFhLGNBQWIsRUFBNkIsRUFBRUcsYUFBYSxDQUFDLGFBQUQsQ0FBZixFQUE3QixDQUFuQjtBQUNBLFdBQUtDLE1BQUwsR0FBYyxPQUFLSixP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LENBQVg7QUFDQSxZQUFJL0IsV0FBVSxDQUFDa0csT0FBS21CLElBQU4sSUFBWSxDQUExQjtBQUNBLFlBQUk1RyxXQUFVLENBQUMwRixNQUFJaUIsSUFBTCxJQUFXLENBQXpCO0FBQ0EsZUFBT3ZDLEtBQUtzQyxJQUFMLENBQVV0QyxLQUFLQyxHQUFMLENBQVU5RSxXQUFRMkQsQ0FBbEIsRUFBcUIsQ0FBckIsSUFBd0JrQixLQUFLQyxHQUFMLENBQVVyRSxXQUFRbUQsQ0FBbEIsRUFBcUIsQ0FBckIsQ0FBbEMsQ0FBUDtBQUNEO0FBQ0Y7OztFQTdYa0RySCxXQUFXK0ssVTs7a0JBQTNDakssdUIiLCJmaWxlIjoiRGVzaWduZXJDaGVtaW5FeHBlcmllbmNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgc291bmR3b3JrcyBmcm9tICdzb3VuZHdvcmtzL2NsaWVudCc7XG5pbXBvcnQgTXlHcmFpbiBmcm9tICcuLi9wbGF5ZXIvTXlHcmFpbi5qcyc7XG5pbXBvcnQgKiBhcyB3YXZlcyBmcm9tICd3YXZlcy1hdWRpbyc7XG5pbXBvcnQge1BocmFzZVJlY29yZGVyTGZvfSBmcm9tICd4bW0tbGZvJztcbmltcG9ydCBFbnJlZ2lzdHJlbWVudENoZW1pbiBmcm9tICcuL0VucmVnaXN0cmVtZW50Q2hlbWluLmpzJztcblxuY29uc3QgYXVkaW9Db250ZXh0ID0gc291bmR3b3Jrcy5hdWRpb0NvbnRleHQ7XG5jb25zdCBzY2hlZHVsZXIgPSB3YXZlcy5nZXRTY2hlZHVsZXIoKTtcblxuY2xhc3MgUGxheWVyVmlldyBleHRlbmRzIHNvdW5kd29ya3MuVmlld3tcbiAgY29uc3RydWN0b3IodGVtcGxhdGUsIGNvbnRlbnQsIGV2ZW50cywgb3B0aW9ucykge1xuICAgIHN1cGVyKHRlbXBsYXRlLCBjb250ZW50LCBldmVudHMsIG9wdGlvbnMpO1xuICB9XG5cbiAgb25Ub3VjaChjYWxsYmFjayl7XG4gICAgdGhpcy5pbnN0YWxsRXZlbnRzKHtcbiAgICAgICdjbGljayBzdmcnOiAoKSA9PiB7XG4gICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufVxuXG5jb25zdCB2aWV3ID0gYGBcblxuXG4vLyB0aGlzIGV4cGVyaWVuY2UgcGxheXMgYSBzb3VuZCB3aGVuIGl0IHN0YXJ0cywgYW5kIHBsYXlzIGFub3RoZXIgc291bmQgd2hlblxuLy8gb3RoZXIgY2xpZW50cyBqb2luIHRoZSBleHBlcmllbmNlXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEZXNpZ25lckZvcm1lRXhwZXJpZW5jZSBleHRlbmRzIHNvdW5kd29ya3MuRXhwZXJpZW5jZSB7XG4gIGNvbnN0cnVjdG9yKGFzc2V0c0RvbWFpbikge1xuICAgIHN1cGVyKCk7XG4gICAgLy9TZXJ2aWNlc1xuICAgIHRoaXMucGxhdGZvcm0gPSB0aGlzLnJlcXVpcmUoJ3BsYXRmb3JtJywgeyBmZWF0dXJlczogWyd3ZWItYXVkaW8nLCAnd2FrZS1sb2NrJ10gfSk7XG4gICAgdGhpcy5tb3Rpb25JbnB1dCA9IHRoaXMucmVxdWlyZSgnbW90aW9uLWlucHV0JywgeyBkZXNjcmlwdG9yczogWydvcmllbnRhdGlvbiddIH0pO1xuICAgIHRoaXMubG9hZGVyID0gdGhpcy5yZXF1aXJlKCdsb2FkZXInLCB7IGZpbGVzOiBbJ3NvdW5kcy9uYXBwZS9icmFuY2hlcy5tcDMnLCdzb3VuZHMvbmFwcGUvZ2Fkb3VlLm1wMycsXCJzb3VuZHMvbmFwcGUvbmFnZS5tcDNcIixcInNvdW5kcy9uYXBwZS90ZW1wZXRlLm1wM1wiLFwic291bmRzL25hcHBlL3ZlbnQubXAzXCJdIH0pO1xuICAgIHRoaXMubGFiZWwgPSAndCc7XG4gICAgdGhpcy5hY3R1YWxJZD0xO1xuICAgIHRoaXMuYWN0dWFsU2Vucz0xO1xuICAgIHRoaXMuc3RhcnRPSyA9IGZhbHNlO1xuICB9XG5cbiAgaW5pdCgpIHtcbiAgICAvLyBpbml0aWFsaXplIHRoZSB2aWV3XG4gICAgdGhpcy52aWV3VGVtcGxhdGUgPSB2aWV3O1xuICAgIHRoaXMudmlld0NvbnRlbnQgPSB7fTtcbiAgICB0aGlzLnZpZXdDdG9yID0gUGxheWVyVmlldztcbiAgICB0aGlzLnZpZXdPcHRpb25zID0geyBwcmVzZXJ2ZVBpeGVsUmF0aW86IHRydWUgfTtcbiAgICB0aGlzLnZpZXcgPSB0aGlzLmNyZWF0ZVZpZXcoKTtcblxuICAgIC8vYmluZFxuICAgIHRoaXMuX3RvTW92ZSA9IHRoaXMuX3RvTW92ZS5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX2lzSW5FbGxpcHNlID0gdGhpcy5faXNJbkVsbGlwc2UuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9pc0luUmVjdCA9IHRoaXMuX2lzSW5SZWN0LmJpbmQodGhpcyk7XG4gICAgdGhpcy5faXNJbiA9IHRoaXMuX2lzSW4uYmluZCh0aGlzKTtcbiAgICB0aGlzLl9nZXREaXN0YW5jZU5vZGUgPSB0aGlzLl9nZXREaXN0YW5jZU5vZGUuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9yb3RhdGVQb2ludCA9IHRoaXMuX3JvdGF0ZVBvaW50LmJpbmQodGhpcyk7XG4gICAgdGhpcy5fbXlMaXN0ZW5lcj0gdGhpcy5fbXlMaXN0ZW5lci5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX29uVG91Y2ggPSB0aGlzLl9vblRvdWNoLmJpbmQodGhpcyk7XG4gICAgdGhpcy52aWV3Lm9uVG91Y2godGhpcy5fb25Ub3VjaCk7XG4gICAgdGhpcy5fYWRkRm9uZCA9IHRoaXMuX2FkZEZvbmQuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9hZGRCb3VsZSA9IHRoaXMuX2FkZEJvdWxlLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fYWRkUmVjdCA9IHRoaXMuX2FkZFJlY3QuYmluZCh0aGlzKTtcbiAgICB0aGlzLnJlY2VpdmUoJ2ZvbmQnLChmb25kLGxhYmVsLGlkLHNlbnMpPT50aGlzLl9hZGRGb25kKGZvbmQsbGFiZWwsaWQsc2VucykpO1xuXG4gfVxuXG4gIHN0YXJ0KCkge1xuICAgIGlmKCF0aGlzLnN0YXJ0T0spe1xuICAgICAgc3VwZXIuc3RhcnQoKTsgLy8gZG9uJ3QgZm9yZ2V0IHRoaXNcbiAgICAgIGlmICghdGhpcy5oYXNTdGFydGVkKVxuICAgICAgICB0aGlzLmluaXQoKTtcbiAgICAgIHRoaXMuc2hvdygpO1xuICAgIH1lbHNle1xuICAgICAgLy9QYXJhbcOodHJlIGluaXRpYXV4XG4gICAgICB0aGlzLl9hZGRCb3VsZSgxMDAsMTAwKTtcbiAgICAgIHRoaXMuX2FkZFJlY3QoKTtcbiAgICAgIGRvY3VtZW50LmJvZHkuc3R5bGUub3ZlcmZsb3cgPSBcImhpZGRlblwiOyAgICAvL0NvbnN0YW50ZXNcbiAgICAgIHRoaXMuY2VudHJlWCA9IHdpbmRvdy5pbm5lcldpZHRoLzI7XG4gICAgICB0aGlzLnRhaWxsZUVjcmFuWCA9IHdpbmRvdy5pbm5lcldpZHRoO1xuICAgICAgdGhpcy50YWlsbGVFY3JhblkgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG4gICAgICB0aGlzLmNlbnRyZUVjcmFuWCA9IHRoaXMudGFpbGxlRWNyYW5YLzI7XG4gICAgICB0aGlzLmNlbnRyZUVjcmFuWSA9IHRoaXMudGFpbGxlRWNyYW5ZLzI7XG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHt0aGlzLl9teUxpc3RlbmVyKDEwMCl9LDEwMCk7XG4gICAgICB0aGlzLmNlbnRyZVkgPSB3aW5kb3cuaW5uZXJIZWlnaHQvMjtcblxuICAgICAgLy9YTU0tbGZvXG4gICAgICB0aGlzLmVucmVnaXN0cmVtZW50ID0gbmV3IEVucmVnaXN0cmVtZW50Q2hlbWluKHRoaXMubGFiZWwsdGhpcy5hY3R1YWxJZCx0aGlzLmFjdHVhbFNlbnMpO1xuICAgICAgdGhpcy5vblJlY29yZCA9IGZhbHNlO1xuXG4gICAgICAvL0RldGVjdGUgbGVzIGVsZW1lbnRzIFNWR1xuICAgICAgdGhpcy5saXN0ZUVsbGlwc2UgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnZWxsaXBzZScpO1xuICAgICAgdGhpcy5saXN0ZVJlY3QgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgncmVjdCcpO1xuICAgICAgdGhpcy50b3RhbEVsZW1lbnRzID0gdGhpcy5saXN0ZUVsbGlwc2UubGVuZ3RoICsgdGhpcy5saXN0ZVJlY3QubGVuZ3RoO1xuXG4gICAgICAvL0luaXRpc2FsaXNhdGlvblxuICAgICAgdGhpcy5tYXhDb3VudFVwZGF0ZSA9IDQ7XG4gICAgICB0aGlzLmNvdW50VXBkYXRlID0gdGhpcy5tYXhDb3VudFVwZGF0ZSArIDE7IC8vIEluaXRpYWxpc2F0aW9uXG4gICAgICB0aGlzLnZpc3VhbGlzYXRpb25Cb3VsZT10cnVlOyAvLyBWaXN1YWxpc2F0aW9uIGRlIGxhIGJvdWxlXG4gICAgICBpZighdGhpcy52aXN1YWxpc2F0aW9uQm91bGUpe1xuICAgICAgICB0aGlzLnZpZXcuJGVsLnF1ZXJ5U2VsZWN0b3IoJyNib3VsZScpLnN0eWxlLmRpc3BsYXk9J25vbmUnO1xuICAgICAgfVxuICAgICAgdGhpcy52aXN1YWxpc2F0aW9uRm9ybWU9dHJ1ZTsgLy8gVmlzdWFsaXNhdGlvbiBkZXMgZm9ybWVzIFNWR1xuICAgICAgaWYoIXRoaXMudmlzdWFsaXNhdGlvbkZvcm1lKXtcbiAgICAgICAgZm9yKGxldCBpID0gMDtpPHRoaXMubGlzdGVFbGxpcHNlLmxlbmd0aDtpKyspe1xuICAgICAgICAgIHRoaXMubGlzdGVFbGxpcHNlW2ldLnN0eWxlLmRpc3BsYXk9J25vbmUnO1xuICAgICAgICB9XG4gICAgICAgIGZvcihsZXQgaSA9IDA7aTx0aGlzLmxpc3RlUmVjdC5sZW5ndGg7aSsrKXtcbiAgICAgICAgICB0aGlzLmxpc3RlUmVjdFtpXS5zdHlsZS5kaXNwbGF5PSdub25lJztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy9Qb3VyIGVuZWxldmVyIGxlcyBib3JkdXJlcyA6XG4gICAgICBpZih0aGlzLnZpc3VhbGlzYXRpb25Gb3JtZSl7XG4gICAgICAgIGZvcihsZXQgaSA9IDA7aTx0aGlzLmxpc3RlRWxsaXBzZS5sZW5ndGg7aSsrKXtcbiAgICAgICAgICB0aGlzLmxpc3RlRWxsaXBzZVtpXS5zZXRBdHRyaWJ1dGUoJ3N0cm9rZS13aWR0aCcsMCk7XG4gICAgICAgIH1cbiAgICAgICAgZm9yKGxldCBpID0gMDtpPHRoaXMubGlzdGVSZWN0Lmxlbmd0aDtpKyspe1xuICAgICAgICAgIHRoaXMubGlzdGVSZWN0W2ldLnNldEF0dHJpYnV0ZSgnc3Ryb2tlLXdpZHRoJywwKTtcbiAgICAgICAgfVxuICAgICAgfSAgIFxuXG4gICAgICAvL1ZhcmlhYmxlcyBcbiAgICAgIHRoaXMubWlycm9yQm91bGVYID0gMjUwO1xuICAgICAgdGhpcy5taXJyb3JCb3VsZVkgPSAyNTA7XG4gICAgICB0aGlzLm9mZnNldFggPSAwOyAvLyBJbml0aXNhbGlzYXRpb24gZHUgb2Zmc2V0XG4gICAgICB0aGlzLm9mZnNldFkgPSAwXG4gICAgICB0aGlzLlNWR19NQVhfWCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzdmcnKVswXS5nZXRBdHRyaWJ1dGUoJ3dpZHRoJyk7XG4gICAgICB0aGlzLlNWR19NQVhfWSA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzdmcnKVswXS5nZXRBdHRyaWJ1dGUoJ2hlaWdodCcpO1xuXG4gICAgICAvLyBHZXN0aW9uIGRlIGwnb3JpZW50YXRpb25cbiAgICAgIHRoaXMudGFiSW47XG4gICAgICBpZiAodGhpcy5tb3Rpb25JbnB1dC5pc0F2YWlsYWJsZSgnb3JpZW50YXRpb24nKSkge1xuICAgICAgICB0aGlzLm1vdGlvbklucHV0LmFkZExpc3RlbmVyKCdvcmllbnRhdGlvbicsIChkYXRhKSA9PiB7XG4gICAgICAgICAgLy8gQWZmaWNoYWdlXG4gICAgICAgICAgY29uc3QgbmV3VmFsdWVzID0gdGhpcy5fdG9Nb3ZlKGRhdGFbMl0sZGF0YVsxXS0yNSk7XG4gICAgICAgICAgdGhpcy50YWJJbiA9IHRoaXMuX2lzSW4obmV3VmFsdWVzWzBdLG5ld1ZhbHVlc1sxXSk7XG4gICAgICAgICAgdGhpcy5fbW92ZVNjcmVlblRvKG5ld1ZhbHVlc1swXSxuZXdWYWx1ZXNbMV0sMC4wOCk7XG4gICAgICAgICAgLy8gWE1NXG4gICAgICAgICAgdGhpcy5lbnJlZ2lzdHJlbWVudC5wcm9jZXNzKG5ld1ZhbHVlc1swXSxuZXdWYWx1ZXNbMV0pO1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiT3JpZW50YXRpb24gbm9uIGRpc3BvbmlibGVcIik7XG4gICAgICB9XG4gICAgfVxuXG4gIH1cblxuLyogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tQ0FMTCBCQUNLIEVWRU5ULS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gKi9cblxuX29uVG91Y2goKXtcbiAgaWYoIXRoaXMub25SZWNvcmQpe1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZm9uZFwiKS5zZXRBdHRyaWJ1dGUoXCJmaWxsXCIsIFwicmVkXCIpO1xuICAgIHRoaXMub25SZWNvcmQgPSB0cnVlO1xuICAgIHRoaXMuZW5yZWdpc3RyZW1lbnQuc3RhcnRSZWNvcmQoKTtcbiAgfWVsc2V7XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJmb25kXCIpLnNldEF0dHJpYnV0ZShcImZpbGxcIiwgXCJibGFja1wiKTtcbiAgICB0aGlzLm9uUmVjb3JkID0gZmFsc2U7XG4gICAgdGhpcy5lbnJlZ2lzdHJlbWVudC5zdG9wUmVjb3JkKHRoaXMpO1xuICB9XG59XG5cbi8qIEFqb3V0ZSBsZSBmb25kICovXG5fYWRkRm9uZChmb25kLGxhYmVsLGlkLHNlbnMpe1xuICAvLyBPbiBwYXJzZSBsZSBmaWNoaWVyIFNWRyBlbiBET01cbiAgdGhpcy5hY3R1YWxJZCA9IGlkO1xuICB0aGlzLmFjdHVhbFNlbnMgPSBzZW5zO1xuICBsZXQgbXlMYXllcjtcbiAgY29uc3QgcGFyc2VyID0gbmV3IERPTVBhcnNlcigpO1xuICBsZXQgZm9uZFhtbCA9IHBhcnNlci5wYXJzZUZyb21TdHJpbmcoZm9uZCwnYXBwbGljYXRpb24veG1sJyk7XG4gIGZvbmRYbWwgPSBmb25kWG1sLmdldEVsZW1lbnRzQnlUYWdOYW1lKCd0aXRsZScpO1xuICBmb3IobGV0IGkgPSAwOyBpPGZvbmRYbWwubGVuZ3RoO2krKyl7XG4gICAgaWYoZm9uZFhtbFtpXS5pbm5lckhUTUw9PSdDaGVtaW4nKXtcbiAgICAgIG15TGF5ZXIgPSBmb25kWG1sW2ldO1xuICAgIH1cbiAgfVxuICBsZXQgbXlHID0gbXlMYXllci5wYXJlbnROb2RlOyBcbiAgbGV0IG15U3ZnID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKCdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycsJ3N2ZycpO1xuICBteVN2Zy5zZXRBdHRyaWJ1dGVOUyhudWxsLCd3aWR0aCcsIDEwMDAwKTtcbiAgbXlTdmcuc2V0QXR0cmlidXRlTlMobnVsbCwnaGVpZ2h0JywgMTAwMDApO1xuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZXhwZXJpZW5jZScpLmFwcGVuZENoaWxkKG15U3ZnKTtcbiAgbXlTdmcuYXBwZW5kQ2hpbGQobXlHKTtcbiAgLy8gT24gYWxsdW1lIHNldWxlbWVudCBsZSBwYXRoIHZvdWx1XG4gIGxldCBteVBhdGhzID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3BhdGgnKTtcbiAgZm9yKGxldCBpID0gMDsgaTxteVBhdGhzLmxlbmd0aDsgaSsrKXtcbiAgICBpZihpIT1pZCl7XG4gICAgICBteVBhdGhzW2ldLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgfVxuICB9XG5cbiAgdGhpcy5zdGFydE9LID0gdHJ1ZTtcbiAgdGhpcy5sYWJlbCA9IGxhYmVsO1xuICB0aGlzLnN0YXJ0KCk7XG59XG5cbi8qIEFqb3V0ZSBsYSBib3VsZSBhdSBmb25kICovXG5fYWRkQm91bGUoeCx5KXtcbiAgY29uc3QgZWxlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUygnaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnLCdjaXJjbGUnKTtcbiAgZWxlbS5zZXRBdHRyaWJ1dGVOUyhudWxsLFwiY3hcIix4KTtcbiAgICBlbGVtLnNldEF0dHJpYnV0ZU5TKG51bGwsXCJjeVwiLHkpO1xuICAgIGVsZW0uc2V0QXR0cmlidXRlTlMobnVsbCxcInJcIiwxMCk7XG4gICAgZWxlbS5zZXRBdHRyaWJ1dGVOUyhudWxsLFwic3Ryb2tlXCIsJ3doaXRlJyk7XG4gICAgZWxlbS5zZXRBdHRyaWJ1dGVOUyhudWxsLFwic3Ryb2tlLXdpZHRoXCIsMyk7XG4gICAgZWxlbS5zZXRBdHRyaWJ1dGVOUyhudWxsLFwiZmlsbFwiLCdibGFjaycpO1xuICAgIGVsZW0uc2V0QXR0cmlidXRlTlMobnVsbCxcImlkXCIsJ2JvdWxlJyk7XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3N2ZycpWzBdLmFwcGVuZENoaWxkKGVsZW0pO1xuICB9XG5cbiAgX2FkZFJlY3QoKXtcbiAgICBjb25zdCBzdmdFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3N2ZycpWzBdO1xuICAgIGxldCB4ID0gc3ZnRWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3dpZHRoJyk7XG4gICAgbGV0IHkgPSBzdmdFbGVtZW50LmdldEF0dHJpYnV0ZSgnaGVpZ2h0Jyk7XG4gICAgY29uc3QgbmV3UmVjdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUygnaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnLCdyZWN0Jyk7XG4gICAgbmV3UmVjdC5zZXRBdHRyaWJ1dGVOUyhudWxsLCd3aWR0aCcseCk7XG4gICAgbmV3UmVjdC5zZXRBdHRyaWJ1dGVOUyhudWxsLCdoZWlnaHQnLCB5KTtcbiAgICBuZXdSZWN0LnNldEF0dHJpYnV0ZU5TKG51bGwsJ3gnLDApO1xuICAgIG5ld1JlY3Quc2V0QXR0cmlidXRlTlMobnVsbCwneScsMCk7XG4gICAgbmV3UmVjdC5zZXRBdHRyaWJ1dGVOUyhudWxsLCdpZCcsJ2ZvbmQnKTtcbiAgICBzdmdFbGVtZW50Lmluc2VydEJlZm9yZShuZXdSZWN0LHN2Z0VsZW1lbnQuZmlyc3RDaGlsZCk7XG4gIH1cblxuLyogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tTU9VVkVNRU5UIERFIEwgRUNSQU4tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gKi9cblxuICAvKiBDYWxsYmFjayBvcmllbnRhdGlvbk1vdGlvbiAvIE1vdXZlbWVudCBkZSBsYSBib3VsZSovXG4gIF90b01vdmUodmFsdWVYLHZhbHVlWSl7XG4gICAgY29uc3Qgb2JqID0gdGhpcy52aWV3LiRlbC5xdWVyeVNlbGVjdG9yKCcjYm91bGUnKTtcbiAgICBsZXQgbmV3WDtcbiAgICBsZXQgbmV3WTtcbiAgICBsZXQgYWN0dSA9IHRoaXMubWlycm9yQm91bGVYK3ZhbHVlWCowLjM7IC8vcGFyc2VJbnQob2JqLmdldEF0dHJpYnV0ZSgnY3gnKSkrdmFsdWVYKjAuMztcbiAgICBpZihhY3R1PHRoaXMub2Zmc2V0WCl7XG4gICAgICBhY3R1PSB0aGlzLm9mZnNldFggO1xuICAgIH1lbHNlIGlmKGFjdHUgPih0aGlzLnRhaWxsZUVjcmFuWCt0aGlzLm9mZnNldFgpKXtcbiAgICAgIGFjdHU9IHRoaXMudGFpbGxlRWNyYW5YK3RoaXMub2Zmc2V0WFxuICAgIH1cbiAgICBpZih0aGlzLnZpc3VhbGlzYXRpb25Cb3VsZSl7XG4gICAgICBvYmouc2V0QXR0cmlidXRlKCdjeCcsIGFjdHUpO1xuICAgIH1cbiAgICB0aGlzLm1pcnJvckJvdWxlWCA9IGFjdHU7XG4gICAgbmV3WD1hY3R1O1xuICAgIGFjdHUgPSB0aGlzLm1pcnJvckJvdWxlWSt2YWx1ZVkqMC4zOy8vcGFyc2VJbnQob2JqLmdldEF0dHJpYnV0ZSgnY3knKSkrdmFsdWVZKjAuMztcbiAgICBpZihhY3R1PCh0aGlzLm9mZnNldFkpKXtcbiAgICAgIGFjdHU9IHRoaXMub2Zmc2V0WTtcbiAgICB9XG4gICAgaWYoYWN0dSA+ICh0aGlzLnRhaWxsZUVjcmFuWSt0aGlzLm9mZnNldFkpKXtcbiAgICAgIGFjdHUgPSB0aGlzLnRhaWxsZUVjcmFuWSt0aGlzLm9mZnNldFk7XG4gICAgfVxuICAgIGlmKHRoaXMudmlzdWFsaXNhdGlvbkJvdWxlKXtcbiAgICAgIG9iai5zZXRBdHRyaWJ1dGUoJ2N5JywgYWN0dSk7XG4gICAgfVxuICAgIHRoaXMubWlycm9yQm91bGVZPSBhY3R1O1xuICAgIG5ld1k9YWN0dTtcbiAgICByZXR1cm4gW25ld1gsbmV3WV07XG4gIH1cblxuICAvLyBEw6lwbGFjZSBsJ8OpY3JhbiBkYW5zIGxhIG1hcFxuICBfbW92ZVNjcmVlblRvKHgseSxmb3JjZT0xKXtcbiAgICBsZXQgZGlzdGFuY2VYID0gKHgtdGhpcy5vZmZzZXRYKS10aGlzLmNlbnRyZUVjcmFuWDtcbiAgICBsZXQgbmVnWCA9IGZhbHNlO1xuICAgIGxldCBpbmRpY2VQb3dYID0gMztcbiAgICBsZXQgaW5kaWNlUG93WSA9IDM7XG4gICAgaWYoZGlzdGFuY2VYPDApe1xuICAgICAgbmVnWCA9IHRydWU7XG4gICAgfVxuICAgIGRpc3RhbmNlWCA9IE1hdGgucG93KChNYXRoLmFicyhkaXN0YW5jZVgvdGhpcy5jZW50cmVFY3JhblgpKSxpbmRpY2VQb3dYKSp0aGlzLmNlbnRyZUVjcmFuWDsgXG4gICAgaWYobmVnWCl7XG4gICAgICBkaXN0YW5jZVggKj0gLTE7XG4gICAgfVxuICAgIGlmKHRoaXMub2Zmc2V0WCsoZGlzdGFuY2VYKmZvcmNlKT49MCYmKHRoaXMub2Zmc2V0WCsoZGlzdGFuY2VYKmZvcmNlKTw9dGhpcy5TVkdfTUFYX1gtdGhpcy50YWlsbGVFY3JhblgpKXtcbiAgICAgIHRoaXMub2Zmc2V0WCArPSAoZGlzdGFuY2VYKmZvcmNlKTtcbiAgICB9XG5cbiAgICBsZXQgZGlzdGFuY2VZID0gKHktdGhpcy5vZmZzZXRZKS10aGlzLmNlbnRyZUVjcmFuWTtcbiAgICBsZXQgbmVnWSA9IGZhbHNlO1xuICAgIGlmKGRpc3RhbmNlWTwwKXtcbiAgICAgIG5lZ1kgPSB0cnVlO1xuICAgIH1cbiAgICBkaXN0YW5jZVkgPSBNYXRoLnBvdygoTWF0aC5hYnMoZGlzdGFuY2VZL3RoaXMuY2VudHJlRWNyYW5ZKSksaW5kaWNlUG93WSkqdGhpcy5jZW50cmVFY3Jhblk7XG4gICAgaWYobmVnWSl7XG4gICAgICBkaXN0YW5jZVkgKj0gLTE7XG4gICAgfVxuICAgIGlmKCh0aGlzLm9mZnNldFkrKGRpc3RhbmNlWSpmb3JjZSk+PTApJiYodGhpcy5vZmZzZXRZKyhkaXN0YW5jZVkqZm9yY2UpPD10aGlzLlNWR19NQVhfWS10aGlzLnRhaWxsZUVjcmFuWSkpe1xuICAgICAgdGhpcy5vZmZzZXRZICs9IChkaXN0YW5jZVkqZm9yY2UpO1xuICAgIH1cbiAgICB3aW5kb3cuc2Nyb2xsKHRoaXMub2Zmc2V0WCx0aGlzLm9mZnNldFkpXG4gIH1cblxuICBfbXlMaXN0ZW5lcih0aW1lKXtcbiAgICB0aGlzLnRhaWxsZUVjcmFuWCA9IHdpbmRvdy5pbm5lcldpZHRoO1xuICAgIHRoaXMudGFpbGxlRWNyYW5ZID0gd2luZG93LmlubmVySGVpZ2h0O1xuICAgIHNldFRpbWVvdXQodGhpcy5fbXlMaXN0ZW5lcix0aW1lKTtcbiAgfVxuXG4vKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1ERVRFUk1JTkFUSU9OIERFUyBJTi9PVVQgREVTIEZPUk1FUy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAqL1xuXG4gIC8vIEZvbmN0aW9uIHF1aSBwZXJtZXQgZGUgY29ubmHDrnRyZSBsJ2Vuc2VtYmxlIGRlcyBmaWd1cmVzIG/DuSBsZSBwb2ludCBzZSBzaXR1ZVxuICBfaXNJbih4LHkpe1xuICAgIGxldCB0YWIgPSBbXTtcbiAgICBsZXQgcm90YXRlQW5nbGU7XG4gICAgbGV0IGNlbnRyZVJvdGF0ZVg7XG4gICAgbGV0IGNlbnRyZVJvdGF0ZVk7XG4gICAgZm9yKGxldCBpPTA7aTx0aGlzLmxpc3RlRWxsaXBzZS5sZW5ndGg7aSsrKXtcbiAgICAgIHJvdGF0ZUFuZ2xlPTA7XG4gICAgICBjb25zdCBjZW50cmVYID0gdGhpcy5saXN0ZUVsbGlwc2VbaV0uZ2V0QXR0cmlidXRlKCdjeCcpO1xuICAgICAgY29uc3QgY2VudHJlWSA9IHRoaXMubGlzdGVFbGxpcHNlW2ldLmdldEF0dHJpYnV0ZSgnY3knKTtcbiAgICAgIGNvbnN0IHJheW9uWCA9IHRoaXMubGlzdGVFbGxpcHNlW2ldLmdldEF0dHJpYnV0ZSgncngnKTtcbiAgICAgIGNvbnN0IHJheW9uWSA9IHRoaXMubGlzdGVFbGxpcHNlW2ldLmdldEF0dHJpYnV0ZSgncnknKTtcbiAgICAgIGxldCB0cmFucyA9IHRoaXMubGlzdGVFbGxpcHNlW2ldLmdldEF0dHJpYnV0ZSgndHJhbnNmb3JtJyk7XG4gICAgICBpZigvcm90YXRlLy50ZXN0KHRyYW5zKSl7XG4gICAgICAgIHRyYW5zID0gdHJhbnMuc2xpY2UoNyx0cmFucy5sZW5ndGgpO1xuICAgICAgICBjZW50cmVSb3RhdGVYID0gcGFyc2VGbG9hdCh0cmFucy5zcGxpdChcIiBcIilbMV0pO1xuICAgICAgICBjZW50cmVSb3RhdGVZID0gcGFyc2VGbG9hdCh0cmFucy5zcGxpdChcIixcIilbMV0ucmVwbGFjZShcIilcIixcIlwiKSk7XG4gICAgICAgIHJvdGF0ZUFuZ2xlID0gcGFyc2VGbG9hdCh0cmFucy5zcGxpdChcIiBcIilbMF0pO1xuICAgICAgfVxuICAgICAgdGFiW3RhYi5sZW5ndGhdPXRoaXMuX2lzSW5FbGxpcHNlKHBhcnNlRmxvYXQoY2VudHJlWCkscGFyc2VGbG9hdChjZW50cmVZKSxwYXJzZUZsb2F0KHJheW9uWCkscGFyc2VGbG9hdChyYXlvblkpLHgseSxyb3RhdGVBbmdsZSxjZW50cmVSb3RhdGVYLGNlbnRyZVJvdGF0ZVkpOyAgICAgXG4gICAgfVxuICAgIGZvcihsZXQgaT0wO2k8dGhpcy5saXN0ZVJlY3QubGVuZ3RoO2krKyl7XG4gICAgICByb3RhdGVBbmdsZT0wO1xuICAgICAgY2VudHJlUm90YXRlWD1udWxsO1xuICAgICAgY2VudHJlUm90YXRlWT1udWxsO1xuICAgICAgY29uc3QgaGF1dGV1ciA9IHRoaXMubGlzdGVSZWN0W2ldLmdldEF0dHJpYnV0ZSgnd2lkdGgnKTtcbiAgICAgIGNvbnN0IGxhcmdldXIgPSB0aGlzLmxpc3RlUmVjdFtpXS5nZXRBdHRyaWJ1dGUoJ2hlaWdodCcpO1xuICAgICAgY29uc3QgbGVmdCA9IHRoaXMubGlzdGVSZWN0W2ldLmdldEF0dHJpYnV0ZSgneCcpO1xuICAgICAgY29uc3QgdG9wID0gdGhpcy5saXN0ZVJlY3RbaV0uZ2V0QXR0cmlidXRlKCd5Jyk7XG4gICAgICBsZXQgdHJhbnMgPSB0aGlzLmxpc3RlUmVjdFtpXS5nZXRBdHRyaWJ1dGUoJ3RyYW5zZm9ybScpO1xuICAgICAgaWYoL3JvdGF0ZS8udGVzdCh0cmFucykpe1xuICAgICAgICB0cmFucyA9IHRyYW5zLnNsaWNlKDcsdHJhbnMubGVuZ3RoKTtcbiAgICAgICAgY2VudHJlUm90YXRlWCA9IHBhcnNlRmxvYXQodHJhbnMuc3BsaXQoXCIgXCIpWzFdKTtcbiAgICAgICAgY2VudHJlUm90YXRlWSA9IHBhcnNlRmxvYXQodHJhbnMuc3BsaXQoXCIsXCIpWzFdLnJlcGxhY2UoXCIpXCIsXCJcIikpO1xuICAgICAgICByb3RhdGVBbmdsZSA9IHBhcnNlRmxvYXQodHJhbnMuc3BsaXQoXCIgXCIpWzBdKTtcbiAgICAgIH1cbiAgICAgIHRhYlt0YWIubGVuZ3RoXT10aGlzLl9pc0luUmVjdChwYXJzZUZsb2F0KGhhdXRldXIpLCBwYXJzZUZsb2F0KGxhcmdldXIpLCBwYXJzZUZsb2F0KGxlZnQpLCBwYXJzZUZsb2F0KHRvcCksIHgsIHkscm90YXRlQW5nbGUsY2VudHJlUm90YXRlWCxjZW50cmVSb3RhdGVZKTtcbiAgICB9ICBcbiAgICByZXR1cm4gdGFiO1xuICB9XG5cblxuICAvLyBGb25jdGlvbiBxdWkgZGl0IHNpIHVuIHBvaW50IGVzdCBkYW5zIHVuIHJlY3RcbiAgIF9pc0luUmVjdChoYXV0ZXVyLGxhcmdldXIsbGVmdCx0b3AscG9pbnRYLHBvaW50WSxyb3RhdGVBbmdsZSxjZW50cmVSb3RhdGVYLGNlbnRyZVJvdGF0ZVkpe1xuICAgICAgLy9yb3RhdGlvblxuICAgICAgY29uc3QgbmV3UG9pbnQgPSB0aGlzLl9yb3RhdGVQb2ludChwb2ludFgscG9pbnRZLGNlbnRyZVJvdGF0ZVgsY2VudHJlUm90YXRlWSxyb3RhdGVBbmdsZSk7XG4gICAgICAvL0FwcGFydGVuYW5jZVxuICAgICAgaWYobmV3UG9pbnRbMF0gPiBwYXJzZUludChsZWZ0KSAmJiBuZXdQb2ludFswXSA8KHBhcnNlSW50KGxlZnQpK3BhcnNlSW50KGhhdXRldXIpKSAmJiBuZXdQb2ludFsxXSA+IHRvcCAmJiBuZXdQb2ludFsxXSA8IChwYXJzZUludCh0b3ApICsgcGFyc2VJbnQobGFyZ2V1cikpKXtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgfVxuXG4gIC8vIEZvbmN0aW9uIHF1aSBkaXQgc2kgdW4gcG9pbnQgZXN0IGRhbnMgdW5lIGVsbGlwc2VcbiAgX2lzSW5FbGxpcHNlKGNlbnRyZVgsY2VudHJlWSxyYXlvblgscmF5b25ZLHBvaW50WCxwb2ludFkscm90YXRlQW5nbGUsY2VudHJlUm90YXRlWCxjZW50cmVSb3RhdGVZKXtcbiAgICAvL3JvdGF0aW9uXG4gICAgY29uc3QgbmV3UG9pbnQgPSB0aGlzLl9yb3RhdGVQb2ludChwb2ludFgscG9pbnRZLGNlbnRyZVJvdGF0ZVgsY2VudHJlUm90YXRlWSxyb3RhdGVBbmdsZSk7XG4gICAgLy9BcHBhcnRlbmFuY2UgXG4gICAgbGV0IGEgPSByYXlvblg7OyAvLyBHcmFuZCByYXlvblxuICAgIGxldCBiID0gcmF5b25ZOyAvLyBQZXRpdCByYXlvblxuICAgIC8vY29uc3QgYyA9IE1hdGguc3FydCgoYSphKS0oYipiKSk7IC8vIERpc3RhbmNlIEZveWVyXG4gICAgY29uc3QgY2FsYyA9ICgoTWF0aC5wb3coKG5ld1BvaW50WzBdLWNlbnRyZVgpLDIpKS8oTWF0aC5wb3coYSwyKSkpKygoTWF0aC5wb3coKG5ld1BvaW50WzFdLWNlbnRyZVkpLDIpKS8oTWF0aC5wb3coYiwyKSkpO1xuICAgIGlmKGNhbGM8PTEpe1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfWVsc2V7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG4gIFxuICAvLyBGb25jdGlvbiBwZXJtZXR0YW50IGRlIHLDqWF4ZXIgbGUgcG9pbnRcbiAgX3JvdGF0ZVBvaW50KHgseSxjZW50cmVYLGNlbnRyZVksYW5nbGUpe1xuICAgIGxldCBuZXdBbmdsZSA9IGFuZ2xlKigzLjE0MTU5MjY1LzE4MCk7IC8vIFBhc3NhZ2UgZW4gcmFkaWFuXG4gICAgbGV0IHRhYiA9IFtdO1xuICAgIGxldCBuZXdYID0gKHgtY2VudHJlWCkqTWF0aC5jb3MobmV3QW5nbGUpKyh5LWNlbnRyZVkpKk1hdGguc2luKG5ld0FuZ2xlKTtcbiAgICBsZXQgbmV3WSA9IC0xKih4LWNlbnRyZVgpKk1hdGguc2luKG5ld0FuZ2xlKSsoeS1jZW50cmVZKSpNYXRoLmNvcyhuZXdBbmdsZSk7XG4gICAgbmV3WCArPSBjZW50cmVYO1xuICAgIG5ld1kgKz0gY2VudHJlWTtcbiAgICAvL0FmZmljaGFnZSBkdSBzeW3DqXRyaXF1ZVxuICAgICAvLyBjb25zdCBvYmogPSB0aGlzLnZpZXcuJGVsLnF1ZXJ5U2VsZWN0b3IoJyNib3VsZVInKTtcbiAgICAgLy8gb2JqLnNldEF0dHJpYnV0ZShcImN4XCIsbmV3WCk7XG4gICAgIC8vIG9iai5zZXRBdHRyaWJ1dGUoXCJjeVwiLG5ld1kpO1xuICAgIC8vRmluIGRlIGwnYWZmaWNoYWdlIGR1IHN5bcOpdHJpcXVlXG4gICAgdGFiWzBdID0gbmV3WDtcbiAgICB0YWJbMV0gPSBuZXdZO1xuICAgIHJldHVybiB0YWI7XG4gIH1cblxuLyogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tQ2FsY3VsIGRlcyBkaXN0YW5jZXMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gKi9cblxuICAvLyBEb25uZSBsYSBkaXN0YW5jZSBkdSBwb2ludCBhdmVjIGxlcyBmb3JtZXMgcHLDqXNlbnRlc1xuICBfZ2V0RGlzdGFuY2UoeFZhbHVlLHlWYWx1ZSl7XG4gICAgbGV0IHRhYiA9IFtdO1xuICAgIGZvcihsZXQgaT0wO2k8dGhpcy5saXN0ZUVsbGlwc2UubGVuZ3RoO2krKyl7XG4gICAgICB0YWJbdGFiLmxlbmd0aF09dGhpcy5fZ2V0RGlzdGFuY2VOb2RlKHRoaXMubGlzdGVFbGxpcHNlW2ldLHhWYWx1ZSx5VmFsdWUpO1xuICAgIH1cbiAgICBmb3IobGV0IGk9MDtpPHRoaXMubGlzdGVSZWN0Lmxlbmd0aDtpKyspe1xuICAgICAgdGFiW3RhYi5sZW5ndGhdPXRoaXMuX2dldERpc3RhbmNlTm9kZSh0aGlzLmxpc3RlUmVjdFtpXSx4VmFsdWUseVZhbHVlKTtcbiAgICB9XG4gICAgcmV0dXJuIHRhYjtcbiAgfVxuXG4gIC8vIERvbm5lIGxhIGRpc3RhbmNlIGQndW4gcG9pbnQgYXZlYyB1bmUgZm9ybWVcbiAgX2dldERpc3RhbmNlTm9kZShub2RlLHgseSl7XG4gICAgaWYobm9kZS50YWdOYW1lPT1cImVsbGlwc2VcIil7XG4gICAgICBsZXQgY2VudHJlWCA9IHBhcnNlSW50KG5vZGUuZ2V0QXR0cmlidXRlKCdjeCcpKTtcbiAgICAgIGxldCBjZW50cmVZID0gcGFyc2VJbnQobm9kZS5nZXRBdHRyaWJ1dGUoJ2N5JykpO1xuICAgICAgcmV0dXJuIE1hdGguc3FydChNYXRoLnBvdygoY2VudHJlWC14KSwyKStNYXRoLnBvdygoY2VudHJlWS15KSwyKSk7XG4gICAgfWVsc2UgaWYobm9kZS50YWdOYW1lPT0ncmVjdCcpe1xuICAgICAgbGV0IGxlZnQgPSBwYXJzZUludChub2RlLmdldEF0dHJpYnV0ZSgneCcpKTtcbiAgICAgIGxldCB0b3AgPSBwYXJzZUludChub2RlLmdldEF0dHJpYnV0ZSgneScpKTtcbiAgICAgIGxldCBoYXV0ID0gcGFyc2VJbnQobm9kZS5nZXRBdHRyaWJ1dGUoJ2hlaWdodCcpKTtcbiAgICAgIGxldCBsYXJnID0gcGFyc2VJbnQobm9kZS5nZXRBdHRyaWJ1dGUoJ3dpZHRoJykpO1xuICAgICAgbGV0IGNlbnRyZVggPSAobGVmdCtsYXJnKS8yO1xuICAgICAgbGV0IGNlbnRyZVkgPSAodG9wK2hhdXQpLzI7XG4gICAgICByZXR1cm4gTWF0aC5zcXJ0KE1hdGgucG93KChjZW50cmVYLXgpLDIpK01hdGgucG93KChjZW50cmVZLXkpLDIpKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==