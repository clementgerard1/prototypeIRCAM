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

var _Enregistrement = require('./Enregistrement.js');

var _Enregistrement2 = _interopRequireDefault(_Enregistrement);

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
    _this2.loader = _this2.require('loader', { files: ['sounds/branches.mp3', 'sounds/gadoue.mp3', "sounds/nage.mp3", "sounds/tempete.mp3", "sounds/vent.mp3"] });
    _this2.label = 't';
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
      this.receive('fond', function (fond, label) {
        return _this3._addFond(fond, label);
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
        this.enregistrement = new _Enregistrement2.default(this.label);
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
    value: function _addFond(fond, label) {
      // On parse le fichier SVG en DOM
      var parser = new DOMParser();
      var fondXml = parser.parseFromString(fond, 'application/xml');
      fondXml = fondXml.getElementsByTagName('svg')[0];
      document.getElementById('experience').appendChild(fondXml);
      document.getElementsByTagName('svg')[0].setAttribute('id', 'svgElement');
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
      document.getElementsByTagName('g')[0].appendChild(elem);
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
      for (var _i4 = 0; _i4 < this.listeRect.length; _i4++) {
        rotateAngle = 0;
        centreRotateX = null;
        centreRotateY = null;
        var hauteur = this.listeRect[_i4].getAttribute('width');
        var largeur = this.listeRect[_i4].getAttribute('height');
        var left = this.listeRect[_i4].getAttribute('x');
        var top = this.listeRect[_i4].getAttribute('y');
        var _trans = this.listeRect[_i4].getAttribute('transform');
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
      //console.log("ancienne : ",pointX,pointY," new coordonnée : ",newPoint,centreX,centreY,rotateAngle)
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
      for (var _i5 = 0; _i5 < this.listeRect.length; _i5++) {
        tab[tab.length] = this._getDistanceNode(this.listeRect[_i5], xValue, yValue);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRlc2lnbmVyRm9ybWVFeHBlcmllbmNlLmpzIl0sIm5hbWVzIjpbInNvdW5kd29ya3MiLCJ3YXZlcyIsImF1ZGlvQ29udGV4dCIsInNjaGVkdWxlciIsImdldFNjaGVkdWxlciIsIlBsYXllclZpZXciLCJ0ZW1wbGF0ZSIsImNvbnRlbnQiLCJldmVudHMiLCJvcHRpb25zIiwiY2FsbGJhY2siLCJpbnN0YWxsRXZlbnRzIiwiVmlldyIsInZpZXciLCJEZXNpZ25lckZvcm1lRXhwZXJpZW5jZSIsImFzc2V0c0RvbWFpbiIsInBsYXRmb3JtIiwicmVxdWlyZSIsImZlYXR1cmVzIiwibW90aW9uSW5wdXQiLCJkZXNjcmlwdG9ycyIsImxvYWRlciIsImZpbGVzIiwibGFiZWwiLCJzdGFydE9LIiwidmlld1RlbXBsYXRlIiwidmlld0NvbnRlbnQiLCJ2aWV3Q3RvciIsInZpZXdPcHRpb25zIiwicHJlc2VydmVQaXhlbFJhdGlvIiwiY3JlYXRlVmlldyIsIl90b01vdmUiLCJiaW5kIiwiX2lzSW5FbGxpcHNlIiwiX2lzSW5SZWN0IiwiX2lzSW4iLCJfZ2V0RGlzdGFuY2VOb2RlIiwiX3JvdGF0ZVBvaW50IiwiX215TGlzdGVuZXIiLCJfb25Ub3VjaCIsIm9uVG91Y2giLCJfYWRkRm9uZCIsIl9hZGRCb3VsZSIsIl9hZGRSZWN0IiwicmVjZWl2ZSIsImZvbmQiLCJoYXNTdGFydGVkIiwiaW5pdCIsInNob3ciLCJkb2N1bWVudCIsImJvZHkiLCJzdHlsZSIsIm92ZXJmbG93IiwiY2VudHJlWCIsIndpbmRvdyIsImlubmVyV2lkdGgiLCJ0YWlsbGVFY3JhblgiLCJ0YWlsbGVFY3JhblkiLCJpbm5lckhlaWdodCIsImNlbnRyZUVjcmFuWCIsImNlbnRyZUVjcmFuWSIsInNldFRpbWVvdXQiLCJjZW50cmVZIiwiZW5yZWdpc3RyZW1lbnQiLCJvblJlY29yZCIsImxpc3RlRWxsaXBzZSIsImdldEVsZW1lbnRzQnlUYWdOYW1lIiwibGlzdGVSZWN0IiwidG90YWxFbGVtZW50cyIsImxlbmd0aCIsIm1heENvdW50VXBkYXRlIiwiY291bnRVcGRhdGUiLCJ2aXN1YWxpc2F0aW9uQm91bGUiLCIkZWwiLCJxdWVyeVNlbGVjdG9yIiwiZGlzcGxheSIsInZpc3VhbGlzYXRpb25Gb3JtZSIsImkiLCJzZXRBdHRyaWJ1dGUiLCJtaXJyb3JCb3VsZVgiLCJtaXJyb3JCb3VsZVkiLCJvZmZzZXRYIiwib2Zmc2V0WSIsIlNWR19NQVhfWCIsImdldEF0dHJpYnV0ZSIsIlNWR19NQVhfWSIsInRhYkluIiwiaXNBdmFpbGFibGUiLCJhZGRMaXN0ZW5lciIsImRhdGEiLCJuZXdWYWx1ZXMiLCJfbW92ZVNjcmVlblRvIiwicHJvY2VzcyIsImNvbnNvbGUiLCJsb2ciLCJnZXRFbGVtZW50QnlJZCIsInN0YXJ0UmVjb3JkIiwic3RvcFJlY29yZCIsInBhcnNlciIsIkRPTVBhcnNlciIsImZvbmRYbWwiLCJwYXJzZUZyb21TdHJpbmciLCJhcHBlbmRDaGlsZCIsInN0YXJ0IiwieCIsInkiLCJlbGVtIiwiY3JlYXRlRWxlbWVudE5TIiwic2V0QXR0cmlidXRlTlMiLCJzdmdFbGVtZW50IiwibmV3UmVjdCIsImluc2VydEJlZm9yZSIsImZpcnN0Q2hpbGQiLCJ2YWx1ZVgiLCJ2YWx1ZVkiLCJvYmoiLCJuZXdYIiwibmV3WSIsImFjdHUiLCJmb3JjZSIsImRpc3RhbmNlWCIsIm5lZ1giLCJpbmRpY2VQb3dYIiwiaW5kaWNlUG93WSIsIk1hdGgiLCJwb3ciLCJhYnMiLCJkaXN0YW5jZVkiLCJuZWdZIiwic2Nyb2xsIiwidGltZSIsInRhYiIsInJvdGF0ZUFuZ2xlIiwiY2VudHJlUm90YXRlWCIsImNlbnRyZVJvdGF0ZVkiLCJyYXlvblgiLCJyYXlvblkiLCJ0cmFucyIsInRlc3QiLCJzbGljZSIsInBhcnNlRmxvYXQiLCJzcGxpdCIsInJlcGxhY2UiLCJoYXV0ZXVyIiwibGFyZ2V1ciIsImxlZnQiLCJ0b3AiLCJwb2ludFgiLCJwb2ludFkiLCJuZXdQb2ludCIsInBhcnNlSW50IiwiYSIsImIiLCJjYWxjIiwiYW5nbGUiLCJuZXdBbmdsZSIsImNvcyIsInNpbiIsInhWYWx1ZSIsInlWYWx1ZSIsIm5vZGUiLCJ0YWdOYW1lIiwic3FydCIsImhhdXQiLCJsYXJnIiwiRXhwZXJpZW5jZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7O0lBQVlBLFU7O0FBQ1o7Ozs7QUFDQTs7SUFBWUMsSzs7QUFDWjs7QUFDQTs7Ozs7Ozs7QUFFQSxJQUFNQyxlQUFlRixXQUFXRSxZQUFoQztBQUNBLElBQU1DLFlBQVlGLE1BQU1HLFlBQU4sRUFBbEI7O0lBRU1DLFU7OztBQUNKLHNCQUFZQyxRQUFaLEVBQXNCQyxPQUF0QixFQUErQkMsTUFBL0IsRUFBdUNDLE9BQXZDLEVBQWdEO0FBQUE7QUFBQSx5SUFDeENILFFBRHdDLEVBQzlCQyxPQUQ4QixFQUNyQkMsTUFEcUIsRUFDYkMsT0FEYTtBQUUvQzs7Ozs0QkFFT0MsUSxFQUFTO0FBQ2YsV0FBS0MsYUFBTCxDQUFtQjtBQUNqQixxQkFBYSxvQkFBTTtBQUNmRDtBQUNIO0FBSGdCLE9BQW5CO0FBS0Q7OztFQVhzQlYsV0FBV1ksSTs7QUFjcEMsSUFBTUMsU0FBTjs7QUFHQTtBQUNBOztJQUNxQkMsdUI7OztBQUNuQixtQ0FBWUMsWUFBWixFQUEwQjtBQUFBOztBQUV4QjtBQUZ3Qjs7QUFHeEIsV0FBS0MsUUFBTCxHQUFnQixPQUFLQyxPQUFMLENBQWEsVUFBYixFQUF5QixFQUFFQyxVQUFVLENBQUMsV0FBRCxFQUFjLFdBQWQsQ0FBWixFQUF6QixDQUFoQjtBQUNBLFdBQUtDLFdBQUwsR0FBbUIsT0FBS0YsT0FBTCxDQUFhLGNBQWIsRUFBNkIsRUFBRUcsYUFBYSxDQUFDLGFBQUQsQ0FBZixFQUE3QixDQUFuQjtBQUNBLFdBQUtDLE1BQUwsR0FBYyxPQUFLSixPQUFMLENBQWEsUUFBYixFQUF1QixFQUFFSyxPQUFPLENBQUMscUJBQUQsRUFBdUIsbUJBQXZCLEVBQTJDLGlCQUEzQyxFQUE2RCxvQkFBN0QsRUFBa0YsaUJBQWxGLENB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Q0EsWUFBSWdGLE9BQU9kLFNBQVNVLEtBQUs1RSxZQUFMLENBQWtCLE9BQWxCLENBQVQsQ0FBWDtBQUNBLFlBQUkvQixXQUFVLENBQUM0RixPQUFLbUIsSUFBTixJQUFZLENBQTFCO0FBQ0EsWUFBSXRHLFdBQVUsQ0FBQ29GLE1BQUlpQixJQUFMLElBQVcsQ0FBekI7QUFDQSxlQUFPdkMsS0FBS3NDLElBQUwsQ0FBVXRDLEtBQUtDLEdBQUwsQ0FBVXhFLFdBQVFtRCxDQUFsQixFQUFxQixDQUFyQixJQUF3Qm9CLEtBQUtDLEdBQUwsQ0FBVS9ELFdBQVEyQyxDQUFsQixFQUFxQixDQUFyQixDQUFsQyxDQUFQO0FBQ0Q7QUFDRjs7O0VBeFdrRHpHLFdBQVdxSyxVOztrQkFBM0N2Six1QiIsImZpbGUiOiJEZXNpZ25lckZvcm1lRXhwZXJpZW5jZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIHNvdW5kd29ya3MgZnJvbSAnc291bmR3b3Jrcy9jbGllbnQnO1xuaW1wb3J0IE15R3JhaW4gZnJvbSAnLi4vcGxheWVyL015R3JhaW4uanMnO1xuaW1wb3J0ICogYXMgd2F2ZXMgZnJvbSAnd2F2ZXMtYXVkaW8nO1xuaW1wb3J0IHtQaHJhc2VSZWNvcmRlckxmb30gZnJvbSAneG1tLWxmbyc7XG5pbXBvcnQgRW5yZWdpc3RyZW1lbnQgZnJvbSAnLi9FbnJlZ2lzdHJlbWVudC5qcyc7XG5cbmNvbnN0IGF1ZGlvQ29udGV4dCA9IHNvdW5kd29ya3MuYXVkaW9Db250ZXh0O1xuY29uc3Qgc2NoZWR1bGVyID0gd2F2ZXMuZ2V0U2NoZWR1bGVyKCk7XG5cbmNsYXNzIFBsYXllclZpZXcgZXh0ZW5kcyBzb3VuZHdvcmtzLlZpZXd7XG4gIGNvbnN0cnVjdG9yKHRlbXBsYXRlLCBjb250ZW50LCBldmVudHMsIG9wdGlvbnMpIHtcbiAgICBzdXBlcih0ZW1wbGF0ZSwgY29udGVudCwgZXZlbnRzLCBvcHRpb25zKTtcbiAgfVxuXG4gIG9uVG91Y2goY2FsbGJhY2spe1xuICAgIHRoaXMuaW5zdGFsbEV2ZW50cyh7XG4gICAgICAnY2xpY2sgc3ZnJzogKCkgPT4ge1xuICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbn1cblxuY29uc3QgdmlldyA9IGBgXG5cblxuLy8gdGhpcyBleHBlcmllbmNlIHBsYXlzIGEgc291bmQgd2hlbiBpdCBzdGFydHMsIGFuZCBwbGF5cyBhbm90aGVyIHNvdW5kIHdoZW5cbi8vIG90aGVyIGNsaWVudHMgam9pbiB0aGUgZXhwZXJpZW5jZVxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGVzaWduZXJGb3JtZUV4cGVyaWVuY2UgZXh0ZW5kcyBzb3VuZHdvcmtzLkV4cGVyaWVuY2Uge1xuICBjb25zdHJ1Y3Rvcihhc3NldHNEb21haW4pIHtcbiAgICBzdXBlcigpO1xuICAgIC8vU2VydmljZXNcbiAgICB0aGlzLnBsYXRmb3JtID0gdGhpcy5yZXF1aXJlKCdwbGF0Zm9ybScsIHsgZmVhdHVyZXM6IFsnd2ViLWF1ZGlvJywgJ3dha2UtbG9jayddIH0pO1xuICAgIHRoaXMubW90aW9uSW5wdXQgPSB0aGlzLnJlcXVpcmUoJ21vdGlvbi1pbnB1dCcsIHsgZGVzY3JpcHRvcnM6IFsnb3JpZW50YXRpb24nXSB9KTtcbiAgICB0aGlzLmxvYWRlciA9IHRoaXMucmVxdWlyZSgnbG9hZGVyJywgeyBmaWxlczogWydzb3VuZHMvYnJhbmNoZXMubXAzJywnc291bmRzL2dhZG91ZS5tcDMnLFwic291bmRzL25hZ2UubXAzXCIsXCJzb3VuZHMvdGVtcGV0ZS5tcDNcIixcInNvdW5kcy92ZW50Lm1wM1wiXSB9KTtcbiAgICB0aGlzLmxhYmVsID0gJ3QnO1xuICAgIHRoaXMuc3RhcnRPSyA9IGZhbHNlO1xuICB9XG5cbiAgaW5pdCgpIHtcbiAgICAvLyBpbml0aWFsaXplIHRoZSB2aWV3XG4gICAgdGhpcy52aWV3VGVtcGxhdGUgPSB2aWV3O1xuICAgIHRoaXMudmlld0NvbnRlbnQgPSB7fTtcbiAgICB0aGlzLnZpZXdDdG9yID0gUGxheWVyVmlldztcbiAgICB0aGlzLnZpZXdPcHRpb25zID0geyBwcmVzZXJ2ZVBpeGVsUmF0aW86IHRydWUgfTtcbiAgICB0aGlzLnZpZXcgPSB0aGlzLmNyZWF0ZVZpZXcoKTtcblxuICAgIC8vYmluZFxuICAgIHRoaXMuX3RvTW92ZSA9IHRoaXMuX3RvTW92ZS5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX2lzSW5FbGxpcHNlID0gdGhpcy5faXNJbkVsbGlwc2UuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9pc0luUmVjdCA9IHRoaXMuX2lzSW5SZWN0LmJpbmQodGhpcyk7XG4gICAgdGhpcy5faXNJbiA9IHRoaXMuX2lzSW4uYmluZCh0aGlzKTtcbiAgICB0aGlzLl9nZXREaXN0YW5jZU5vZGUgPSB0aGlzLl9nZXREaXN0YW5jZU5vZGUuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9yb3RhdGVQb2ludCA9IHRoaXMuX3JvdGF0ZVBvaW50LmJpbmQodGhpcyk7XG4gICAgdGhpcy5fbXlMaXN0ZW5lcj0gdGhpcy5fbXlMaXN0ZW5lci5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX29uVG91Y2ggPSB0aGlzLl9vblRvdWNoLmJpbmQodGhpcyk7XG4gICAgdGhpcy52aWV3Lm9uVG91Y2godGhpcy5fb25Ub3VjaCk7XG4gICAgdGhpcy5fYWRkRm9uZCA9IHRoaXMuX2FkZEZvbmQuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9hZGRCb3VsZSA9IHRoaXMuX2FkZEJvdWxlLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fYWRkUmVjdCA9IHRoaXMuX2FkZFJlY3QuYmluZCh0aGlzKTtcbiAgICB0aGlzLnJlY2VpdmUoJ2ZvbmQnLChmb25kLGxhYmVsKT0+dGhpcy5fYWRkRm9uZChmb25kLGxhYmVsKSk7XG5cbiB9XG5cbiAgc3RhcnQoKSB7XG4gICAgaWYoIXRoaXMuc3RhcnRPSyl7XG4gICAgICBzdXBlci5zdGFydCgpOyAvLyBkb24ndCBmb3JnZXQgdGhpc1xuICAgICAgaWYgKCF0aGlzLmhhc1N0YXJ0ZWQpXG4gICAgICAgIHRoaXMuaW5pdCgpO1xuICAgICAgdGhpcy5zaG93KCk7XG4gICAgfWVsc2V7XG4gICAgICAvL1BhcmFtw6h0cmUgaW5pdGlhdXhcbiAgICAgIHRoaXMuX2FkZEJvdWxlKDEwMCwxMDApO1xuICAgICAgdGhpcy5fYWRkUmVjdCgpO1xuICAgICAgZG9jdW1lbnQuYm9keS5zdHlsZS5vdmVyZmxvdyA9IFwiaGlkZGVuXCI7ICAgIC8vQ29uc3RhbnRlc1xuICAgICAgdGhpcy5jZW50cmVYID0gd2luZG93LmlubmVyV2lkdGgvMjtcbiAgICAgIHRoaXMudGFpbGxlRWNyYW5YID0gd2luZG93LmlubmVyV2lkdGg7XG4gICAgICB0aGlzLnRhaWxsZUVjcmFuWSA9IHdpbmRvdy5pbm5lckhlaWdodDtcbiAgICAgIHRoaXMuY2VudHJlRWNyYW5YID0gdGhpcy50YWlsbGVFY3JhblgvMjtcbiAgICAgIHRoaXMuY2VudHJlRWNyYW5ZID0gdGhpcy50YWlsbGVFY3JhblkvMjtcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge3RoaXMuX215TGlzdGVuZXIoMTAwKX0sMTAwKTtcbiAgICAgIHRoaXMuY2VudHJlWSA9IHdpbmRvdy5pbm5lckhlaWdodC8yO1xuXG4gICAgICAvL1hNTS1sZm9cbiAgICAgIHRoaXMuZW5yZWdpc3RyZW1lbnQgPSBuZXcgRW5yZWdpc3RyZW1lbnQodGhpcy5sYWJlbCk7XG4gICAgICB0aGlzLm9uUmVjb3JkID0gZmFsc2U7XG5cbiAgICAgIC8vRGV0ZWN0ZSBsZXMgZWxlbWVudHMgU1ZHXG4gICAgICB0aGlzLmxpc3RlRWxsaXBzZSA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdlbGxpcHNlJyk7XG4gICAgICB0aGlzLmxpc3RlUmVjdCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdyZWN0Jyk7XG4gICAgICB0aGlzLnRvdGFsRWxlbWVudHMgPSB0aGlzLmxpc3RlRWxsaXBzZS5sZW5ndGggKyB0aGlzLmxpc3RlUmVjdC5sZW5ndGg7XG5cbiAgICAgIC8vSW5pdGlzYWxpc2F0aW9uXG4gICAgICB0aGlzLm1heENvdW50VXBkYXRlID0gNDtcbiAgICAgIHRoaXMuY291bnRVcGRhdGUgPSB0aGlzLm1heENvdW50VXBkYXRlICsgMTsgLy8gSW5pdGlhbGlzYXRpb25cbiAgICAgIHRoaXMudmlzdWFsaXNhdGlvbkJvdWxlPXRydWU7IC8vIFZpc3VhbGlzYXRpb24gZGUgbGEgYm91bGVcbiAgICAgIGlmKCF0aGlzLnZpc3VhbGlzYXRpb25Cb3VsZSl7XG4gICAgICAgIHRoaXMudmlldy4kZWwucXVlcnlTZWxlY3RvcignI2JvdWxlJykuc3R5bGUuZGlzcGxheT0nbm9uZSc7XG4gICAgICB9XG4gICAgICB0aGlzLnZpc3VhbGlzYXRpb25Gb3JtZT10cnVlOyAvLyBWaXN1YWxpc2F0aW9uIGRlcyBmb3JtZXMgU1ZHXG4gICAgICBpZighdGhpcy52aXN1YWxpc2F0aW9uRm9ybWUpe1xuICAgICAgICBmb3IobGV0IGkgPSAwO2k8dGhpcy5saXN0ZUVsbGlwc2UubGVuZ3RoO2krKyl7XG4gICAgICAgICAgdGhpcy5saXN0ZUVsbGlwc2VbaV0uc3R5bGUuZGlzcGxheT0nbm9uZSc7XG4gICAgICAgIH1cbiAgICAgICAgZm9yKGxldCBpID0gMDtpPHRoaXMubGlzdGVSZWN0Lmxlbmd0aDtpKyspe1xuICAgICAgICAgIHRoaXMubGlzdGVSZWN0W2ldLnN0eWxlLmRpc3BsYXk9J25vbmUnO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvL1BvdXIgZW5lbGV2ZXIgbGVzIGJvcmR1cmVzIDpcbiAgICAgIGlmKHRoaXMudmlzdWFsaXNhdGlvbkZvcm1lKXtcbiAgICAgICAgZm9yKGxldCBpID0gMDtpPHRoaXMubGlzdGVFbGxpcHNlLmxlbmd0aDtpKyspe1xuICAgICAgICAgIHRoaXMubGlzdGVFbGxpcHNlW2ldLnNldEF0dHJpYnV0ZSgnc3Ryb2tlLXdpZHRoJywwKTtcbiAgICAgICAgfVxuICAgICAgICBmb3IobGV0IGkgPSAwO2k8dGhpcy5saXN0ZVJlY3QubGVuZ3RoO2krKyl7XG4gICAgICAgICAgdGhpcy5saXN0ZVJlY3RbaV0uc2V0QXR0cmlidXRlKCdzdHJva2Utd2lkdGgnLDApO1xuICAgICAgICB9XG4gICAgICB9ICAgXG5cbiAgICAgIC8vVmFyaWFibGVzIFxuICAgICAgdGhpcy5taXJyb3JCb3VsZVggPSAyNTA7XG4gICAgICB0aGlzLm1pcnJvckJvdWxlWSA9IDI1MDtcbiAgICAgIHRoaXMub2Zmc2V0WCA9IDA7IC8vIEluaXRpc2FsaXNhdGlvbiBkdSBvZmZzZXRcbiAgICAgIHRoaXMub2Zmc2V0WSA9IDBcbiAgICAgIHRoaXMuU1ZHX01BWF9YID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3N2ZycpWzBdLmdldEF0dHJpYnV0ZSgnd2lkdGgnKTtcbiAgICAgIHRoaXMuU1ZHX01BWF9ZID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3N2ZycpWzBdLmdldEF0dHJpYnV0ZSgnaGVpZ2h0Jyk7XG5cbiAgICAgIC8vIEdlc3Rpb24gZGUgbCdvcmllbnRhdGlvblxuICAgICAgdGhpcy50YWJJbjtcbiAgICAgIGlmICh0aGlzLm1vdGlvbklucHV0LmlzQXZhaWxhYmxlKCdvcmllbnRhdGlvbicpKSB7XG4gICAgICAgIHRoaXMubW90aW9uSW5wdXQuYWRkTGlzdGVuZXIoJ29yaWVudGF0aW9uJywgKGRhdGEpID0+IHtcbiAgICAgICAgICAvLyBBZmZpY2hhZ2VcbiAgICAgICAgICBjb25zdCBuZXdWYWx1ZXMgPSB0aGlzLl90b01vdmUoZGF0YVsyXSxkYXRhWzFdLTI1KTtcbiAgICAgICAgICB0aGlzLnRhYkluID0gdGhpcy5faXNJbihuZXdWYWx1ZXNbMF0sbmV3VmFsdWVzWzFdKTtcbiAgICAgICAgICB0aGlzLl9tb3ZlU2NyZWVuVG8obmV3VmFsdWVzWzBdLG5ld1ZhbHVlc1sxXSwwLjA4KTtcbiAgICAgICAgICAvLyBYTU1cbiAgICAgICAgICB0aGlzLmVucmVnaXN0cmVtZW50LnByb2Nlc3MobmV3VmFsdWVzWzBdLG5ld1ZhbHVlc1sxXSk7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJPcmllbnRhdGlvbiBub24gZGlzcG9uaWJsZVwiKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgfVxuXG4vKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1DQUxMIEJBQ0sgRVZFTlQtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAqL1xuXG5fb25Ub3VjaCgpe1xuICBpZighdGhpcy5vblJlY29yZCl7XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJmb25kXCIpLnNldEF0dHJpYnV0ZShcImZpbGxcIiwgXCJyZWRcIik7XG4gICAgdGhpcy5vblJlY29yZCA9IHRydWU7XG4gICAgdGhpcy5lbnJlZ2lzdHJlbWVudC5zdGFydFJlY29yZCgpO1xuICB9ZWxzZXtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImZvbmRcIikuc2V0QXR0cmlidXRlKFwiZmlsbFwiLCBcImJsYWNrXCIpO1xuICAgIHRoaXMub25SZWNvcmQgPSBmYWxzZTtcbiAgICB0aGlzLmVucmVnaXN0cmVtZW50LnN0b3BSZWNvcmQodGhpcyk7XG4gIH1cbn1cblxuLyogQWpvdXRlIGxlIGZvbmQgKi9cbl9hZGRGb25kKGZvbmQsbGFiZWwpe1xuICAvLyBPbiBwYXJzZSBsZSBmaWNoaWVyIFNWRyBlbiBET01cbiAgY29uc3QgcGFyc2VyID0gbmV3IERPTVBhcnNlcigpO1xuICBsZXQgZm9uZFhtbCA9IHBhcnNlci5wYXJzZUZyb21TdHJpbmcoZm9uZCwnYXBwbGljYXRpb24veG1sJyk7XG4gIGZvbmRYbWwgPSBmb25kWG1sLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzdmcnKVswXTtcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2V4cGVyaWVuY2UnKS5hcHBlbmRDaGlsZChmb25kWG1sKTtcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3N2ZycpWzBdLnNldEF0dHJpYnV0ZSgnaWQnLCdzdmdFbGVtZW50Jyk7XG4gIHRoaXMuc3RhcnRPSyA9IHRydWU7XG4gIHRoaXMubGFiZWwgPSBsYWJlbDtcbiAgdGhpcy5zdGFydCgpO1xufVxuXG4vKiBBam91dGUgbGEgYm91bGUgYXUgZm9uZCAqL1xuX2FkZEJvdWxlKHgseSl7XG4gIGNvbnN0IGVsZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoJ2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJywnY2lyY2xlJyk7XG4gIGVsZW0uc2V0QXR0cmlidXRlTlMobnVsbCxcImN4XCIseCk7XG4gICAgZWxlbS5zZXRBdHRyaWJ1dGVOUyhudWxsLFwiY3lcIix5KTtcbiAgICBlbGVtLnNldEF0dHJpYnV0ZU5TKG51bGwsXCJyXCIsMTApO1xuICAgIGVsZW0uc2V0QXR0cmlidXRlTlMobnVsbCxcInN0cm9rZVwiLCd3aGl0ZScpO1xuICAgIGVsZW0uc2V0QXR0cmlidXRlTlMobnVsbCxcInN0cm9rZS13aWR0aFwiLDMpO1xuICAgIGVsZW0uc2V0QXR0cmlidXRlTlMobnVsbCxcImZpbGxcIiwnYmxhY2snKTtcbiAgICBlbGVtLnNldEF0dHJpYnV0ZU5TKG51bGwsXCJpZFwiLCdib3VsZScpO1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdnJylbMF0uYXBwZW5kQ2hpbGQoZWxlbSk7XG4gIH1cblxuICBfYWRkUmVjdCgpe1xuICAgIGNvbnN0IHN2Z0VsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnc3ZnJylbMF07XG4gICAgbGV0IHggPSBzdmdFbGVtZW50LmdldEF0dHJpYnV0ZSgnd2lkdGgnKTtcbiAgICBsZXQgeSA9IHN2Z0VsZW1lbnQuZ2V0QXR0cmlidXRlKCdoZWlnaHQnKTtcbiAgICBjb25zdCBuZXdSZWN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKCdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycsJ3JlY3QnKTtcbiAgICBuZXdSZWN0LnNldEF0dHJpYnV0ZU5TKG51bGwsJ3dpZHRoJyx4KTtcbiAgICBuZXdSZWN0LnNldEF0dHJpYnV0ZU5TKG51bGwsJ2hlaWdodCcsIHkpO1xuICAgIG5ld1JlY3Quc2V0QXR0cmlidXRlTlMobnVsbCwneCcsMCk7XG4gICAgbmV3UmVjdC5zZXRBdHRyaWJ1dGVOUyhudWxsLCd5JywwKTtcbiAgICBuZXdSZWN0LnNldEF0dHJpYnV0ZU5TKG51bGwsJ2lkJywnZm9uZCcpO1xuICAgIHN2Z0VsZW1lbnQuaW5zZXJ0QmVmb3JlKG5ld1JlY3Qsc3ZnRWxlbWVudC5maXJzdENoaWxkKTtcbiAgfVxuXG4vKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1NT1VWRU1FTlQgREUgTCBFQ1JBTi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAqL1xuXG4gIC8qIENhbGxiYWNrIG9yaWVudGF0aW9uTW90aW9uIC8gTW91dmVtZW50IGRlIGxhIGJvdWxlKi9cbiAgX3RvTW92ZSh2YWx1ZVgsdmFsdWVZKXtcbiAgICBjb25zdCBvYmogPSB0aGlzLnZpZXcuJGVsLnF1ZXJ5U2VsZWN0b3IoJyNib3VsZScpO1xuICAgIGxldCBuZXdYO1xuICAgIGxldCBuZXdZO1xuICAgIGxldCBhY3R1ID0gdGhpcy5taXJyb3JCb3VsZVgrdmFsdWVYKjAuMzsgLy9wYXJzZUludChvYmouZ2V0QXR0cmlidXRlKCdjeCcpKSt2YWx1ZVgqMC4zO1xuICAgIGlmKGFjdHU8dGhpcy5vZmZzZXRYKXtcbiAgICAgIGFjdHU9IHRoaXMub2Zmc2V0WCA7XG4gICAgfWVsc2UgaWYoYWN0dSA+KHRoaXMudGFpbGxlRWNyYW5YK3RoaXMub2Zmc2V0WCkpe1xuICAgICAgYWN0dT0gdGhpcy50YWlsbGVFY3JhblgrdGhpcy5vZmZzZXRYXG4gICAgfVxuICAgIGlmKHRoaXMudmlzdWFsaXNhdGlvbkJvdWxlKXtcbiAgICAgIG9iai5zZXRBdHRyaWJ1dGUoJ2N4JywgYWN0dSk7XG4gICAgfVxuICAgIHRoaXMubWlycm9yQm91bGVYID0gYWN0dTtcbiAgICBuZXdYPWFjdHU7XG4gICAgYWN0dSA9IHRoaXMubWlycm9yQm91bGVZK3ZhbHVlWSowLjM7Ly9wYXJzZUludChvYmouZ2V0QXR0cmlidXRlKCdjeScpKSt2YWx1ZVkqMC4zO1xuICAgIGlmKGFjdHU8KHRoaXMub2Zmc2V0WSkpe1xuICAgICAgYWN0dT0gdGhpcy5vZmZzZXRZO1xuICAgIH1cbiAgICBpZihhY3R1ID4gKHRoaXMudGFpbGxlRWNyYW5ZK3RoaXMub2Zmc2V0WSkpe1xuICAgICAgYWN0dSA9IHRoaXMudGFpbGxlRWNyYW5ZK3RoaXMub2Zmc2V0WTtcbiAgICB9XG4gICAgaWYodGhpcy52aXN1YWxpc2F0aW9uQm91bGUpe1xuICAgICAgb2JqLnNldEF0dHJpYnV0ZSgnY3knLCBhY3R1KTtcbiAgICB9XG4gICAgdGhpcy5taXJyb3JCb3VsZVk9IGFjdHU7XG4gICAgbmV3WT1hY3R1O1xuICAgIHJldHVybiBbbmV3WCxuZXdZXTtcbiAgfVxuXG4gIC8vIETDqXBsYWNlIGwnw6ljcmFuIGRhbnMgbGEgbWFwXG4gIF9tb3ZlU2NyZWVuVG8oeCx5LGZvcmNlPTEpe1xuICAgIGxldCBkaXN0YW5jZVggPSAoeC10aGlzLm9mZnNldFgpLXRoaXMuY2VudHJlRWNyYW5YO1xuICAgIGxldCBuZWdYID0gZmFsc2U7XG4gICAgbGV0IGluZGljZVBvd1ggPSAzO1xuICAgIGxldCBpbmRpY2VQb3dZID0gMztcbiAgICBpZihkaXN0YW5jZVg8MCl7XG4gICAgICBuZWdYID0gdHJ1ZTtcbiAgICB9XG4gICAgZGlzdGFuY2VYID0gTWF0aC5wb3coKE1hdGguYWJzKGRpc3RhbmNlWC90aGlzLmNlbnRyZUVjcmFuWCkpLGluZGljZVBvd1gpKnRoaXMuY2VudHJlRWNyYW5YOyBcbiAgICBpZihuZWdYKXtcbiAgICAgIGRpc3RhbmNlWCAqPSAtMTtcbiAgICB9XG4gICAgaWYodGhpcy5vZmZzZXRYKyhkaXN0YW5jZVgqZm9yY2UpPj0wJiYodGhpcy5vZmZzZXRYKyhkaXN0YW5jZVgqZm9yY2UpPD10aGlzLlNWR19NQVhfWC10aGlzLnRhaWxsZUVjcmFuWCkpe1xuICAgICAgdGhpcy5vZmZzZXRYICs9IChkaXN0YW5jZVgqZm9yY2UpO1xuICAgIH1cblxuICAgIGxldCBkaXN0YW5jZVkgPSAoeS10aGlzLm9mZnNldFkpLXRoaXMuY2VudHJlRWNyYW5ZO1xuICAgIGxldCBuZWdZID0gZmFsc2U7XG4gICAgaWYoZGlzdGFuY2VZPDApe1xuICAgICAgbmVnWSA9IHRydWU7XG4gICAgfVxuICAgIGRpc3RhbmNlWSA9IE1hdGgucG93KChNYXRoLmFicyhkaXN0YW5jZVkvdGhpcy5jZW50cmVFY3JhblkpKSxpbmRpY2VQb3dZKSp0aGlzLmNlbnRyZUVjcmFuWTtcbiAgICBpZihuZWdZKXtcbiAgICAgIGRpc3RhbmNlWSAqPSAtMTtcbiAgICB9XG4gICAgaWYoKHRoaXMub2Zmc2V0WSsoZGlzdGFuY2VZKmZvcmNlKT49MCkmJih0aGlzLm9mZnNldFkrKGRpc3RhbmNlWSpmb3JjZSk8PXRoaXMuU1ZHX01BWF9ZLXRoaXMudGFpbGxlRWNyYW5ZKSl7XG4gICAgICB0aGlzLm9mZnNldFkgKz0gKGRpc3RhbmNlWSpmb3JjZSk7XG4gICAgfVxuICAgIHdpbmRvdy5zY3JvbGwodGhpcy5vZmZzZXRYLHRoaXMub2Zmc2V0WSlcbiAgfVxuXG4gIF9teUxpc3RlbmVyKHRpbWUpe1xuICAgIHRoaXMudGFpbGxlRWNyYW5YID0gd2luZG93LmlubmVyV2lkdGg7XG4gICAgdGhpcy50YWlsbGVFY3JhblkgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG4gICAgc2V0VGltZW91dCh0aGlzLl9teUxpc3RlbmVyLHRpbWUpO1xuICB9XG5cbi8qIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLURFVEVSTUlOQVRJT04gREVTIElOL09VVCBERVMgRk9STUVTLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tICovXG5cbiAgLy8gRm9uY3Rpb24gcXVpIHBlcm1ldCBkZSBjb25uYcOudHJlIGwnZW5zZW1ibGUgZGVzIGZpZ3VyZXMgb8O5IGxlIHBvaW50IHNlIHNpdHVlXG4gIF9pc0luKHgseSl7XG4gICAgbGV0IHRhYiA9IFtdO1xuICAgIGxldCByb3RhdGVBbmdsZTtcbiAgICBsZXQgY2VudHJlUm90YXRlWDtcbiAgICBsZXQgY2VudHJlUm90YXRlWTtcbiAgICBmb3IobGV0IGk9MDtpPHRoaXMubGlzdGVFbGxpcHNlLmxlbmd0aDtpKyspe1xuICAgICAgcm90YXRlQW5nbGU9MDtcbiAgICAgIGNvbnN0IGNlbnRyZVggPSB0aGlzLmxpc3RlRWxsaXBzZVtpXS5nZXRBdHRyaWJ1dGUoJ2N4Jyk7XG4gICAgICBjb25zdCBjZW50cmVZID0gdGhpcy5saXN0ZUVsbGlwc2VbaV0uZ2V0QXR0cmlidXRlKCdjeScpO1xuICAgICAgY29uc3QgcmF5b25YID0gdGhpcy5saXN0ZUVsbGlwc2VbaV0uZ2V0QXR0cmlidXRlKCdyeCcpO1xuICAgICAgY29uc3QgcmF5b25ZID0gdGhpcy5saXN0ZUVsbGlwc2VbaV0uZ2V0QXR0cmlidXRlKCdyeScpO1xuICAgICAgbGV0IHRyYW5zID0gdGhpcy5saXN0ZUVsbGlwc2VbaV0uZ2V0QXR0cmlidXRlKCd0cmFuc2Zvcm0nKTtcbiAgICAgIGlmKC9yb3RhdGUvLnRlc3QodHJhbnMpKXtcbiAgICAgICAgdHJhbnMgPSB0cmFucy5zbGljZSg3LHRyYW5zLmxlbmd0aCk7XG4gICAgICAgIGNlbnRyZVJvdGF0ZVggPSBwYXJzZUZsb2F0KHRyYW5zLnNwbGl0KFwiIFwiKVsxXSk7XG4gICAgICAgIGNlbnRyZVJvdGF0ZVkgPSBwYXJzZUZsb2F0KHRyYW5zLnNwbGl0KFwiLFwiKVsxXS5yZXBsYWNlKFwiKVwiLFwiXCIpKTtcbiAgICAgICAgcm90YXRlQW5nbGUgPSBwYXJzZUZsb2F0KHRyYW5zLnNwbGl0KFwiIFwiKVswXSk7XG4gICAgICB9XG4gICAgICB0YWJbdGFiLmxlbmd0aF09dGhpcy5faXNJbkVsbGlwc2UocGFyc2VGbG9hdChjZW50cmVYKSxwYXJzZUZsb2F0KGNlbnRyZVkpLHBhcnNlRmxvYXQocmF5b25YKSxwYXJzZUZsb2F0KHJheW9uWSkseCx5LHJvdGF0ZUFuZ2xlLGNlbnRyZVJvdGF0ZVgsY2VudHJlUm90YXRlWSk7ICAgICBcbiAgICB9XG4gICAgZm9yKGxldCBpPTA7aTx0aGlzLmxpc3RlUmVjdC5sZW5ndGg7aSsrKXtcbiAgICAgIHJvdGF0ZUFuZ2xlPTA7XG4gICAgICBjZW50cmVSb3RhdGVYPW51bGw7XG4gICAgICBjZW50cmVSb3RhdGVZPW51bGw7XG4gICAgICBjb25zdCBoYXV0ZXVyID0gdGhpcy5saXN0ZVJlY3RbaV0uZ2V0QXR0cmlidXRlKCd3aWR0aCcpO1xuICAgICAgY29uc3QgbGFyZ2V1ciA9IHRoaXMubGlzdGVSZWN0W2ldLmdldEF0dHJpYnV0ZSgnaGVpZ2h0Jyk7XG4gICAgICBjb25zdCBsZWZ0ID0gdGhpcy5saXN0ZVJlY3RbaV0uZ2V0QXR0cmlidXRlKCd4Jyk7XG4gICAgICBjb25zdCB0b3AgPSB0aGlzLmxpc3RlUmVjdFtpXS5nZXRBdHRyaWJ1dGUoJ3knKTtcbiAgICAgIGxldCB0cmFucyA9IHRoaXMubGlzdGVSZWN0W2ldLmdldEF0dHJpYnV0ZSgndHJhbnNmb3JtJyk7XG4gICAgICBpZigvcm90YXRlLy50ZXN0KHRyYW5zKSl7XG4gICAgICAgIHRyYW5zID0gdHJhbnMuc2xpY2UoNyx0cmFucy5sZW5ndGgpO1xuICAgICAgICBjZW50cmVSb3RhdGVYID0gcGFyc2VGbG9hdCh0cmFucy5zcGxpdChcIiBcIilbMV0pO1xuICAgICAgICBjZW50cmVSb3RhdGVZID0gcGFyc2VGbG9hdCh0cmFucy5zcGxpdChcIixcIilbMV0ucmVwbGFjZShcIilcIixcIlwiKSk7XG4gICAgICAgIHJvdGF0ZUFuZ2xlID0gcGFyc2VGbG9hdCh0cmFucy5zcGxpdChcIiBcIilbMF0pO1xuICAgICAgfVxuICAgICAgdGFiW3RhYi5sZW5ndGhdPXRoaXMuX2lzSW5SZWN0KHBhcnNlRmxvYXQoaGF1dGV1ciksIHBhcnNlRmxvYXQobGFyZ2V1ciksIHBhcnNlRmxvYXQobGVmdCksIHBhcnNlRmxvYXQodG9wKSwgeCwgeSxyb3RhdGVBbmdsZSxjZW50cmVSb3RhdGVYLGNlbnRyZVJvdGF0ZVkpO1xuICAgIH0gIFxuICAgIHJldHVybiB0YWI7XG4gIH1cblxuXG4gIC8vIEZvbmN0aW9uIHF1aSBkaXQgc2kgdW4gcG9pbnQgZXN0IGRhbnMgdW4gcmVjdFxuICAgX2lzSW5SZWN0KGhhdXRldXIsbGFyZ2V1cixsZWZ0LHRvcCxwb2ludFgscG9pbnRZLHJvdGF0ZUFuZ2xlLGNlbnRyZVJvdGF0ZVgsY2VudHJlUm90YXRlWSl7XG4gICAgICAvL3JvdGF0aW9uXG4gICAgICBjb25zdCBuZXdQb2ludCA9IHRoaXMuX3JvdGF0ZVBvaW50KHBvaW50WCxwb2ludFksY2VudHJlUm90YXRlWCxjZW50cmVSb3RhdGVZLHJvdGF0ZUFuZ2xlKTtcbiAgICAgIC8vQXBwYXJ0ZW5hbmNlXG4gICAgICBpZihuZXdQb2ludFswXSA+IHBhcnNlSW50KGxlZnQpICYmIG5ld1BvaW50WzBdIDwocGFyc2VJbnQobGVmdCkrcGFyc2VJbnQoaGF1dGV1cikpICYmIG5ld1BvaW50WzFdID4gdG9wICYmIG5ld1BvaW50WzFdIDwgKHBhcnNlSW50KHRvcCkgKyBwYXJzZUludChsYXJnZXVyKSkpe1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1lbHNle1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICB9XG5cbiAgLy8gRm9uY3Rpb24gcXVpIGRpdCBzaSB1biBwb2ludCBlc3QgZGFucyB1bmUgZWxsaXBzZVxuICBfaXNJbkVsbGlwc2UoY2VudHJlWCxjZW50cmVZLHJheW9uWCxyYXlvblkscG9pbnRYLHBvaW50WSxyb3RhdGVBbmdsZSxjZW50cmVSb3RhdGVYLGNlbnRyZVJvdGF0ZVkpe1xuICAgIC8vcm90YXRpb25cbiAgICBjb25zdCBuZXdQb2ludCA9IHRoaXMuX3JvdGF0ZVBvaW50KHBvaW50WCxwb2ludFksY2VudHJlUm90YXRlWCxjZW50cmVSb3RhdGVZLHJvdGF0ZUFuZ2xlKTtcbiAgICAvL2NvbnNvbGUubG9nKFwiYW5jaWVubmUgOiBcIixwb2ludFgscG9pbnRZLFwiIG5ldyBjb29yZG9ubsOpZSA6IFwiLG5ld1BvaW50LGNlbnRyZVgsY2VudHJlWSxyb3RhdGVBbmdsZSlcbiAgICAvL0FwcGFydGVuYW5jZSBcbiAgICBsZXQgYSA9IHJheW9uWDs7IC8vIEdyYW5kIHJheW9uXG4gICAgbGV0IGIgPSByYXlvblk7IC8vIFBldGl0IHJheW9uXG4gICAgLy9jb25zdCBjID0gTWF0aC5zcXJ0KChhKmEpLShiKmIpKTsgLy8gRGlzdGFuY2UgRm95ZXJcbiAgICBjb25zdCBjYWxjID0gKChNYXRoLnBvdygobmV3UG9pbnRbMF0tY2VudHJlWCksMikpLyhNYXRoLnBvdyhhLDIpKSkrKChNYXRoLnBvdygobmV3UG9pbnRbMV0tY2VudHJlWSksMikpLyhNYXRoLnBvdyhiLDIpKSk7XG4gICAgaWYoY2FsYzw9MSl7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9ZWxzZXtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbiAgXG4gIC8vIEZvbmN0aW9uIHBlcm1ldHRhbnQgZGUgcsOpYXhlciBsZSBwb2ludFxuICBfcm90YXRlUG9pbnQoeCx5LGNlbnRyZVgsY2VudHJlWSxhbmdsZSl7XG4gICAgbGV0IG5ld0FuZ2xlID0gYW5nbGUqKDMuMTQxNTkyNjUvMTgwKTsgLy8gUGFzc2FnZSBlbiByYWRpYW5cbiAgICBsZXQgdGFiID0gW107XG4gICAgbGV0IG5ld1ggPSAoeC1jZW50cmVYKSpNYXRoLmNvcyhuZXdBbmdsZSkrKHktY2VudHJlWSkqTWF0aC5zaW4obmV3QW5nbGUpO1xuICAgIGxldCBuZXdZID0gLTEqKHgtY2VudHJlWCkqTWF0aC5zaW4obmV3QW5nbGUpKyh5LWNlbnRyZVkpKk1hdGguY29zKG5ld0FuZ2xlKTtcbiAgICBuZXdYICs9IGNlbnRyZVg7XG4gICAgbmV3WSArPSBjZW50cmVZO1xuICAgIC8vQWZmaWNoYWdlIGR1IHN5bcOpdHJpcXVlXG4gICAgIC8vIGNvbnN0IG9iaiA9IHRoaXMudmlldy4kZWwucXVlcnlTZWxlY3RvcignI2JvdWxlUicpO1xuICAgICAvLyBvYmouc2V0QXR0cmlidXRlKFwiY3hcIixuZXdYKTtcbiAgICAgLy8gb2JqLnNldEF0dHJpYnV0ZShcImN5XCIsbmV3WSk7XG4gICAgLy9GaW4gZGUgbCdhZmZpY2hhZ2UgZHUgc3ltw6l0cmlxdWVcbiAgICB0YWJbMF0gPSBuZXdYO1xuICAgIHRhYlsxXSA9IG5ld1k7XG4gICAgcmV0dXJuIHRhYjtcbiAgfVxuXG4vKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1DYWxjdWwgZGVzIGRpc3RhbmNlcy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAqL1xuXG4gIC8vIERvbm5lIGxhIGRpc3RhbmNlIGR1IHBvaW50IGF2ZWMgbGVzIGZvcm1lcyBwcsOpc2VudGVzXG4gIF9nZXREaXN0YW5jZSh4VmFsdWUseVZhbHVlKXtcbiAgICBsZXQgdGFiID0gW107XG4gICAgZm9yKGxldCBpPTA7aTx0aGlzLmxpc3RlRWxsaXBzZS5sZW5ndGg7aSsrKXtcbiAgICAgIHRhYlt0YWIubGVuZ3RoXT10aGlzLl9nZXREaXN0YW5jZU5vZGUodGhpcy5saXN0ZUVsbGlwc2VbaV0seFZhbHVlLHlWYWx1ZSk7XG4gICAgfVxuICAgIGZvcihsZXQgaT0wO2k8dGhpcy5saXN0ZVJlY3QubGVuZ3RoO2krKyl7XG4gICAgICB0YWJbdGFiLmxlbmd0aF09dGhpcy5fZ2V0RGlzdGFuY2VOb2RlKHRoaXMubGlzdGVSZWN0W2ldLHhWYWx1ZSx5VmFsdWUpO1xuICAgIH1cbiAgICByZXR1cm4gdGFiO1xuICB9XG5cbiAgLy8gRG9ubmUgbGEgZGlzdGFuY2UgZCd1biBwb2ludCBhdmVjIHVuZSBmb3JtZVxuICBfZ2V0RGlzdGFuY2VOb2RlKG5vZGUseCx5KXtcbiAgICBpZihub2RlLnRhZ05hbWU9PVwiZWxsaXBzZVwiKXtcbiAgICAgIGxldCBjZW50cmVYID0gcGFyc2VJbnQobm9kZS5nZXRBdHRyaWJ1dGUoJ2N4JykpO1xuICAgICAgbGV0IGNlbnRyZVkgPSBwYXJzZUludChub2RlLmdldEF0dHJpYnV0ZSgnY3knKSk7XG4gICAgICByZXR1cm4gTWF0aC5zcXJ0KE1hdGgucG93KChjZW50cmVYLXgpLDIpK01hdGgucG93KChjZW50cmVZLXkpLDIpKTtcbiAgICB9ZWxzZSBpZihub2RlLnRhZ05hbWU9PSdyZWN0Jyl7XG4gICAgICBsZXQgbGVmdCA9IHBhcnNlSW50KG5vZGUuZ2V0QXR0cmlidXRlKCd4JykpO1xuICAgICAgbGV0IHRvcCA9IHBhcnNlSW50KG5vZGUuZ2V0QXR0cmlidXRlKCd5JykpO1xuICAgICAgbGV0IGhhdXQgPSBwYXJzZUludChub2RlLmdldEF0dHJpYnV0ZSgnaGVpZ2h0JykpO1xuICAgICAgbGV0IGxhcmcgPSBwYXJzZUludChub2RlLmdldEF0dHJpYnV0ZSgnd2lkdGgnKSk7XG4gICAgICBsZXQgY2VudHJlWCA9IChsZWZ0K2xhcmcpLzI7XG4gICAgICBsZXQgY2VudHJlWSA9ICh0b3AraGF1dCkvMjtcbiAgICAgIHJldHVybiBNYXRoLnNxcnQoTWF0aC5wb3coKGNlbnRyZVgteCksMikrTWF0aC5wb3coKGNlbnRyZVkteSksMikpO1xuICAgIH1cbiAgfVxufVxuIl19