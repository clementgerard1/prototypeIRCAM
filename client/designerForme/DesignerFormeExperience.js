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
    //this.loader = this.require('loader', { files: ['sounds/branches.mp3','sounds/gadoue.mp3',"sounds/nage.mp3","sounds/tempete.mp3","sounds/vent.mp3"] });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRlc2lnbmVyRm9ybWVFeHBlcmllbmNlLmpzIl0sIm5hbWVzIjpbInNvdW5kd29ya3MiLCJ3YXZlcyIsImF1ZGlvQ29udGV4dCIsInNjaGVkdWxlciIsImdldFNjaGVkdWxlciIsIlBsYXllclZpZXciLCJ0ZW1wbGF0ZSIsImNvbnRlbnQiLCJldmVudHMiLCJvcHRpb25zIiwiY2FsbGJhY2siLCJpbnN0YWxsRXZlbnRzIiwiVmlldyIsInZpZXciLCJEZXNpZ25lckZvcm1lRXhwZXJpZW5jZSIsImFzc2V0c0RvbWFpbiIsInBsYXRmb3JtIiwicmVxdWlyZSIsImZlYXR1cmVzIiwibW90aW9uSW5wdXQiLCJkZXNjcmlwdG9ycyIsImxhYmVsIiwic3RhcnRPSyIsInZpZXdUZW1wbGF0ZSIsInZpZXdDb250ZW50Iiwidmlld0N0b3IiLCJ2aWV3T3B0aW9ucyIsInByZXNlcnZlUGl4ZWxSYXRpbyIsImNyZWF0ZVZpZXciLCJfdG9Nb3ZlIiwiYmluZCIsIl9pc0luRWxsaXBzZSIsIl9pc0luUmVjdCIsIl9pc0luIiwiX2dldERpc3RhbmNlTm9kZSIsIl9yb3RhdGVQb2ludCIsIl9teUxpc3RlbmVyIiwiX29uVG91Y2giLCJvblRvdWNoIiwiX2FkZEZvbmQiLCJfYWRkQm91bGUiLCJfYWRkUmVjdCIsInJlY2VpdmUiLCJmb25kIiwiaGFzU3RhcnRlZCIsImluaXQiLCJzaG93IiwiZG9jdW1lbnQiLCJib2R5Iiwic3R5bGUiLCJvdmVyZmxvdyIsImNlbnRyZVgiLCJ3aW5kb3ciLCJpbm5lcldpZHRoIiwidGFpbGxlRWNyYW5YIiwidGFpbGxlRWNyYW5ZIiwiaW5uZXJIZWlnaHQiLCJjZW50cmVFY3JhblgiLCJjZW50cmVFY3JhblkiLCJzZXRUaW1lb3V0IiwiY2VudHJlWSIsImVucmVnaXN0cmVtZW50Iiwib25SZWNvcmQiLCJsaXN0ZUVsbGlwc2UiLCJnZXRFbGVtZW50c0J5VGFnTmFtZSIsImxpc3RlUmVjdCIsInRvdGFsRWxlbWVudHMiLCJsZW5ndGgiLCJtYXhDb3VudFVwZGF0ZSIsImNvdW50VXBkYXRlIiwidmlzdWFsaXNhdGlvbkJvdWxlIiwiJGVsIiwicXVlcnlTZWxlY3RvciIsImRpc3BsYXkiLCJ2aXN1YWxpc2F0aW9uRm9ybWUiLCJpIiwic2V0QXR0cmlidXRlIiwibWlycm9yQm91bGVYIiwibWlycm9yQm91bGVZIiwib2Zmc2V0WCIsIm9mZnNldFkiLCJTVkdfTUFYX1giLCJnZXRBdHRyaWJ1dGUiLCJTVkdfTUFYX1kiLCJ0YWJJbiIsImlzQXZhaWxhYmxlIiwiYWRkTGlzdGVuZXIiLCJkYXRhIiwibmV3VmFsdWVzIiwiX21vdmVTY3JlZW5UbyIsInByb2Nlc3MiLCJjb25zb2xlIiwibG9nIiwiZ2V0RWxlbWVudEJ5SWQiLCJzdGFydFJlY29yZCIsInN0b3BSZWNvcmQiLCJwYXJzZXIiLCJET01QYXJzZXIiLCJmb25kWG1sIiwicGFyc2VGcm9tU3RyaW5nIiwiYXBwZW5kQ2hpbGQiLCJzdGFydCIsIngiLCJ5IiwiZWxlbSIsImNyZWF0ZUVsZW1lbnROUyIsInNldEF0dHJpYnV0ZU5TIiwic3ZnRWxlbWVudCIsIm5ld1JlY3QiLCJpbnNlcnRCZWZvcmUiLCJmaXJzdENoaWxkIiwidmFsdWVYIiwidmFsdWVZIiwib2JqIiwibmV3WCIsIm5ld1kiLCJhY3R1IiwiZm9yY2UiLCJkaXN0YW5jZVgiLCJuZWdYIiwiaW5kaWNlUG93WCIsImluZGljZVBvd1kiLCJNYXRoIiwicG93IiwiYWJzIiwiZGlzdGFuY2VZIiwibmVnWSIsInNjcm9sbCIsInRpbWUiLCJ0YWIiLCJyb3RhdGVBbmdsZSIsImNlbnRyZVJvdGF0ZVgiLCJjZW50cmVSb3RhdGVZIiwicmF5b25YIiwicmF5b25ZIiwidHJhbnMiLCJ0ZXN0Iiwic2xpY2UiLCJwYXJzZUZsb2F0Iiwic3BsaXQiLCJyZXBsYWNlIiwiaGF1dGV1ciIsImxhcmdldXIiLCJsZWZ0IiwidG9wIiwicG9pbnRYIiwicG9pbnRZIiwibmV3UG9pbnQiLCJwYXJzZUludCIsImEiLCJiIiwiY2FsYyIsImFuZ2xlIiwibmV3QW5nbGUiLCJjb3MiLCJzaW4iLCJ4VmFsdWUiLCJ5VmFsdWUiLCJub2RlIiwidGFnTmFtZSIsInNxcnQiLCJoYXV0IiwibGFyZyIsIkV4cGVyaWVuY2UiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBOztJQUFZQSxVOztBQUNaOzs7O0FBQ0E7O0lBQVlDLEs7O0FBQ1o7O0FBQ0E7Ozs7Ozs7O0FBRUEsSUFBTUMsZUFBZUYsV0FBV0UsWUFBaEM7QUFDQSxJQUFNQyxZQUFZRixNQUFNRyxZQUFOLEVBQWxCOztJQUVNQyxVOzs7QUFDSixzQkFBWUMsUUFBWixFQUFzQkMsT0FBdEIsRUFBK0JDLE1BQS9CLEVBQXVDQyxPQUF2QyxFQUFnRDtBQUFBO0FBQUEseUlBQ3hDSCxRQUR3QyxFQUM5QkMsT0FEOEIsRUFDckJDLE1BRHFCLEVBQ2JDLE9BRGE7QUFFL0M7Ozs7NEJBRU9DLFEsRUFBUztBQUNmLFdBQUtDLGFBQUwsQ0FBbUI7QUFDakIscUJBQWEsb0JBQU07QUFDZkQ7QUFDSDtBQUhnQixPQUFuQjtBQUtEOzs7RUFYc0JWLFdBQVdZLEk7O0FBY3BDLElBQU1DLFNBQU47O0FBR0E7QUFDQTs7SUFDcUJDLHVCOzs7QUFDbkIsbUNBQVlDLFlBQVosRUFBMEI7QUFBQTs7QUFFeEI7QUFGd0I7O0FBR3hCLFdBQUtDLFFBQUwsR0FBZ0IsT0FBS0MsT0FBTCxDQUFhLFVBQWIsRUFBeUIsRUFBRUMsVUFBVSxDQUFDLFdBQUQsRUFBYyxXQUFkLENBQVosRUFBekIsQ0FBaEI7QUFDQSxXQUFLQyxXQUFMLEdBQW1CLE9BQUtGLE9BQUwsQ0FBYSxjQUFiLEVBQTZCLEVBQUVHLGFBQWEsQ0FBQyxhQUFELENBQWYsRUFBN0IsQ0FBbkI7QUFDQTtBQUNBLFdBQUtDLEtBQUwsR0FBYSxHQUFiO0FBQ0EsV0FBS0MsT0FBTCxHQUFlLEtBQWY7QUFQd0I7QUFRekI7Ozs7MkJBRU07QUFBQTs7QUFDTDtBQUNBLFdBQUtDLFlBQUwsR0FBb0JWLElBQXBCO0FBQ0EsV0FBS1csV0FBTCxHQUFtQixF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Q0EsZUFBT3ZDLEtBQUtzQyxJQUFMLENBQVV0QyxLQUFLQyxHQUFMLENBQVV4RSxXQUFRbUQsQ0FBbEIsRUFBcUIsQ0FBckIsSUFBd0JvQixLQUFLQyxHQUFMLENBQVUvRCxXQUFRMkMsQ0FBbEIsRUFBcUIsQ0FBckIsQ0FBbEMsQ0FBUDtBQUNEO0FBQ0Y7OztFQXhXa0R2RyxXQUFXbUssVTs7a0JBQTNDckosdUIiLCJmaWxlIjoiRGVzaWduZXJGb3JtZUV4cGVyaWVuY2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBzb3VuZHdvcmtzIGZyb20gJ3NvdW5kd29ya3MvY2xpZW50JztcbmltcG9ydCBNeUdyYWluIGZyb20gJy4uL3BsYXllci9NeUdyYWluLmpzJztcbmltcG9ydCAqIGFzIHdhdmVzIGZyb20gJ3dhdmVzLWF1ZGlvJztcbmltcG9ydCB7UGhyYXNlUmVjb3JkZXJMZm99IGZyb20gJ3htbS1sZm8nO1xuaW1wb3J0IEVucmVnaXN0cmVtZW50IGZyb20gJy4vRW5yZWdpc3RyZW1lbnQuanMnO1xuXG5jb25zdCBhdWRpb0NvbnRleHQgPSBzb3VuZHdvcmtzLmF1ZGlvQ29udGV4dDtcbmNvbnN0IHNjaGVkdWxlciA9IHdhdmVzLmdldFNjaGVkdWxlcigpO1xuXG5jbGFzcyBQbGF5ZXJWaWV3IGV4dGVuZHMgc291bmR3b3Jrcy5WaWV3e1xuICBjb25zdHJ1Y3Rvcih0ZW1wbGF0ZSwgY29udGVudCwgZXZlbnRzLCBvcHRpb25zKSB7XG4gICAgc3VwZXIodGVtcGxhdGUsIGNvbnRlbnQsIGV2ZW50cywgb3B0aW9ucyk7XG4gIH1cblxuICBvblRvdWNoKGNhbGxiYWNrKXtcbiAgICB0aGlzLmluc3RhbGxFdmVudHMoe1xuICAgICAgJ2NsaWNrIHN2Zyc6ICgpID0+IHtcbiAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG59XG5cbmNvbnN0IHZpZXcgPSBgYFxuXG5cbi8vIHRoaXMgZXhwZXJpZW5jZSBwbGF5cyBhIHNvdW5kIHdoZW4gaXQgc3RhcnRzLCBhbmQgcGxheXMgYW5vdGhlciBzb3VuZCB3aGVuXG4vLyBvdGhlciBjbGllbnRzIGpvaW4gdGhlIGV4cGVyaWVuY2VcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERlc2lnbmVyRm9ybWVFeHBlcmllbmNlIGV4dGVuZHMgc291bmR3b3Jrcy5FeHBlcmllbmNlIHtcbiAgY29uc3RydWN0b3IoYXNzZXRzRG9tYWluKSB7XG4gICAgc3VwZXIoKTtcbiAgICAvL1NlcnZpY2VzXG4gICAgdGhpcy5wbGF0Zm9ybSA9IHRoaXMucmVxdWlyZSgncGxhdGZvcm0nLCB7IGZlYXR1cmVzOiBbJ3dlYi1hdWRpbycsICd3YWtlLWxvY2snXSB9KTtcbiAgICB0aGlzLm1vdGlvbklucHV0ID0gdGhpcy5yZXF1aXJlKCdtb3Rpb24taW5wdXQnLCB7IGRlc2NyaXB0b3JzOiBbJ29yaWVudGF0aW9uJ10gfSk7XG4gICAgLy90aGlzLmxvYWRlciA9IHRoaXMucmVxdWlyZSgnbG9hZGVyJywgeyBmaWxlczogWydzb3VuZHMvYnJhbmNoZXMubXAzJywnc291bmRzL2dhZG91ZS5tcDMnLFwic291bmRzL25hZ2UubXAzXCIsXCJzb3VuZHMvdGVtcGV0ZS5tcDNcIixcInNvdW5kcy92ZW50Lm1wM1wiXSB9KTtcbiAgICB0aGlzLmxhYmVsID0gJ3QnO1xuICAgIHRoaXMuc3RhcnRPSyA9IGZhbHNlO1xuICB9XG5cbiAgaW5pdCgpIHtcbiAgICAvLyBpbml0aWFsaXplIHRoZSB2aWV3XG4gICAgdGhpcy52aWV3VGVtcGxhdGUgPSB2aWV3O1xuICAgIHRoaXMudmlld0NvbnRlbnQgPSB7fTtcbiAgICB0aGlzLnZpZXdDdG9yID0gUGxheWVyVmlldztcbiAgICB0aGlzLnZpZXdPcHRpb25zID0geyBwcmVzZXJ2ZVBpeGVsUmF0aW86IHRydWUgfTtcbiAgICB0aGlzLnZpZXcgPSB0aGlzLmNyZWF0ZVZpZXcoKTtcblxuICAgIC8vYmluZFxuICAgIHRoaXMuX3RvTW92ZSA9IHRoaXMuX3RvTW92ZS5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX2lzSW5FbGxpcHNlID0gdGhpcy5faXNJbkVsbGlwc2UuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9pc0luUmVjdCA9IHRoaXMuX2lzSW5SZWN0LmJpbmQodGhpcyk7XG4gICAgdGhpcy5faXNJbiA9IHRoaXMuX2lzSW4uYmluZCh0aGlzKTtcbiAgICB0aGlzLl9nZXREaXN0YW5jZU5vZGUgPSB0aGlzLl9nZXREaXN0YW5jZU5vZGUuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9yb3RhdGVQb2ludCA9IHRoaXMuX3JvdGF0ZVBvaW50LmJpbmQodGhpcyk7XG4gICAgdGhpcy5fbXlMaXN0ZW5lcj0gdGhpcy5fbXlMaXN0ZW5lci5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX29uVG91Y2ggPSB0aGlzLl9vblRvdWNoLmJpbmQodGhpcyk7XG4gICAgdGhpcy52aWV3Lm9uVG91Y2godGhpcy5fb25Ub3VjaCk7XG4gICAgdGhpcy5fYWRkRm9uZCA9IHRoaXMuX2FkZEZvbmQuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9hZGRCb3VsZSA9IHRoaXMuX2FkZEJvdWxlLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fYWRkUmVjdCA9IHRoaXMuX2FkZFJlY3QuYmluZCh0aGlzKTtcbiAgICB0aGlzLnJlY2VpdmUoJ2ZvbmQnLChmb25kLGxhYmVsKT0+dGhpcy5fYWRkRm9uZChmb25kLGxhYmVsKSk7XG5cbiB9XG5cbiAgc3RhcnQoKSB7XG4gICAgaWYoIXRoaXMuc3RhcnRPSyl7XG4gICAgICBzdXBlci5zdGFydCgpOyAvLyBkb24ndCBmb3JnZXQgdGhpc1xuICAgICAgaWYgKCF0aGlzLmhhc1N0YXJ0ZWQpXG4gICAgICAgIHRoaXMuaW5pdCgpO1xuICAgICAgdGhpcy5zaG93KCk7XG4gICAgfWVsc2V7XG4gICAgICAvL1BhcmFtw6h0cmUgaW5pdGlhdXhcbiAgICAgIHRoaXMuX2FkZEJvdWxlKDEwMCwxMDApO1xuICAgICAgdGhpcy5fYWRkUmVjdCgpO1xuICAgICAgZG9jdW1lbnQuYm9keS5zdHlsZS5vdmVyZmxvdyA9IFwiaGlkZGVuXCI7ICAgIC8vQ29uc3RhbnRlc1xuICAgICAgdGhpcy5jZW50cmVYID0gd2luZG93LmlubmVyV2lkdGgvMjtcbiAgICAgIHRoaXMudGFpbGxlRWNyYW5YID0gd2luZG93LmlubmVyV2lkdGg7XG4gICAgICB0aGlzLnRhaWxsZUVjcmFuWSA9IHdpbmRvdy5pbm5lckhlaWdodDtcbiAgICAgIHRoaXMuY2VudHJlRWNyYW5YID0gdGhpcy50YWlsbGVFY3JhblgvMjtcbiAgICAgIHRoaXMuY2VudHJlRWNyYW5ZID0gdGhpcy50YWlsbGVFY3JhblkvMjtcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge3RoaXMuX215TGlzdGVuZXIoMTAwKX0sMTAwKTtcbiAgICAgIHRoaXMuY2VudHJlWSA9IHdpbmRvdy5pbm5lckhlaWdodC8yO1xuXG4gICAgICAvL1hNTS1sZm9cbiAgICAgIHRoaXMuZW5yZWdpc3RyZW1lbnQgPSBuZXcgRW5yZWdpc3RyZW1lbnQodGhpcy5sYWJlbCk7XG4gICAgICB0aGlzLm9uUmVjb3JkID0gZmFsc2U7XG5cbiAgICAgIC8vRGV0ZWN0ZSBsZXMgZWxlbWVudHMgU1ZHXG4gICAgICB0aGlzLmxpc3RlRWxsaXBzZSA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdlbGxpcHNlJyk7XG4gICAgICB0aGlzLmxpc3RlUmVjdCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdyZWN0Jyk7XG4gICAgICB0aGlzLnRvdGFsRWxlbWVudHMgPSB0aGlzLmxpc3RlRWxsaXBzZS5sZW5ndGggKyB0aGlzLmxpc3RlUmVjdC5sZW5ndGg7XG5cbiAgICAgIC8vSW5pdGlzYWxpc2F0aW9uXG4gICAgICB0aGlzLm1heENvdW50VXBkYXRlID0gNDtcbiAgICAgIHRoaXMuY291bnRVcGRhdGUgPSB0aGlzLm1heENvdW50VXBkYXRlICsgMTsgLy8gSW5pdGlhbGlzYXRpb25cbiAgICAgIHRoaXMudmlzdWFsaXNhdGlvbkJvdWxlPXRydWU7IC8vIFZpc3VhbGlzYXRpb24gZGUgbGEgYm91bGVcbiAgICAgIGlmKCF0aGlzLnZpc3VhbGlzYXRpb25Cb3VsZSl7XG4gICAgICAgIHRoaXMudmlldy4kZWwucXVlcnlTZWxlY3RvcignI2JvdWxlJykuc3R5bGUuZGlzcGxheT0nbm9uZSc7XG4gICAgICB9XG4gICAgICB0aGlzLnZpc3VhbGlzYXRpb25Gb3JtZT10cnVlOyAvLyBWaXN1YWxpc2F0aW9uIGRlcyBmb3JtZXMgU1ZHXG4gICAgICBpZighdGhpcy52aXN1YWxpc2F0aW9uRm9ybWUpe1xuICAgICAgICBmb3IobGV0IGkgPSAwO2k8dGhpcy5saXN0ZUVsbGlwc2UubGVuZ3RoO2krKyl7XG4gICAgICAgICAgdGhpcy5saXN0ZUVsbGlwc2VbaV0uc3R5bGUuZGlzcGxheT0nbm9uZSc7XG4gICAgICAgIH1cbiAgICAgICAgZm9yKGxldCBpID0gMDtpPHRoaXMubGlzdGVSZWN0Lmxlbmd0aDtpKyspe1xuICAgICAgICAgIHRoaXMubGlzdGVSZWN0W2ldLnN0eWxlLmRpc3BsYXk9J25vbmUnO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvL1BvdXIgZW5lbGV2ZXIgbGVzIGJvcmR1cmVzIDpcbiAgICAgIGlmKHRoaXMudmlzdWFsaXNhdGlvbkZvcm1lKXtcbiAgICAgICAgZm9yKGxldCBpID0gMDtpPHRoaXMubGlzdGVFbGxpcHNlLmxlbmd0aDtpKyspe1xuICAgICAgICAgIHRoaXMubGlzdGVFbGxpcHNlW2ldLnNldEF0dHJpYnV0ZSgnc3Ryb2tlLXdpZHRoJywwKTtcbiAgICAgICAgfVxuICAgICAgICBmb3IobGV0IGkgPSAwO2k8dGhpcy5saXN0ZVJlY3QubGVuZ3RoO2krKyl7XG4gICAgICAgICAgdGhpcy5saXN0ZVJlY3RbaV0uc2V0QXR0cmlidXRlKCdzdHJva2Utd2lkdGgnLDApO1xuICAgICAgICB9XG4gICAgICB9ICAgXG5cbiAgICAgIC8vVmFyaWFibGVzIFxuICAgICAgdGhpcy5taXJyb3JCb3VsZVggPSAyNTA7XG4gICAgICB0aGlzLm1pcnJvckJvdWxlWSA9IDI1MDtcbiAgICAgIHRoaXMub2Zmc2V0WCA9IDA7IC8vIEluaXRpc2FsaXNhdGlvbiBkdSBvZmZzZXRcbiAgICAgIHRoaXMub2Zmc2V0WSA9IDBcbiAgICAgIHRoaXMuU1ZHX01BWF9YID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3N2ZycpWzBdLmdldEF0dHJpYnV0ZSgnd2lkdGgnKTtcbiAgICAgIHRoaXMuU1ZHX01BWF9ZID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3N2ZycpWzBdLmdldEF0dHJpYnV0ZSgnaGVpZ2h0Jyk7XG5cbiAgICAgIC8vIEdlc3Rpb24gZGUgbCdvcmllbnRhdGlvblxuICAgICAgdGhpcy50YWJJbjtcbiAgICAgIGlmICh0aGlzLm1vdGlvbklucHV0LmlzQXZhaWxhYmxlKCdvcmllbnRhdGlvbicpKSB7XG4gICAgICAgIHRoaXMubW90aW9uSW5wdXQuYWRkTGlzdGVuZXIoJ29yaWVudGF0aW9uJywgKGRhdGEpID0+IHtcbiAgICAgICAgICAvLyBBZmZpY2hhZ2VcbiAgICAgICAgICBjb25zdCBuZXdWYWx1ZXMgPSB0aGlzLl90b01vdmUoZGF0YVsyXSxkYXRhWzFdLTI1KTtcbiAgICAgICAgICB0aGlzLnRhYkluID0gdGhpcy5faXNJbihuZXdWYWx1ZXNbMF0sbmV3VmFsdWVzWzFdKTtcbiAgICAgICAgICB0aGlzLl9tb3ZlU2NyZWVuVG8obmV3VmFsdWVzWzBdLG5ld1ZhbHVlc1sxXSwwLjA4KTtcbiAgICAgICAgICAvLyBYTU1cbiAgICAgICAgICB0aGlzLmVucmVnaXN0cmVtZW50LnByb2Nlc3MobmV3VmFsdWVzWzBdLG5ld1ZhbHVlc1sxXSk7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJPcmllbnRhdGlvbiBub24gZGlzcG9uaWJsZVwiKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgfVxuXG4vKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1DQUxMIEJBQ0sgRVZFTlQtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAqL1xuXG5fb25Ub3VjaCgpe1xuICBpZighdGhpcy5vblJlY29yZCl7XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJmb25kXCIpLnNldEF0dHJpYnV0ZShcImZpbGxcIiwgXCJyZWRcIik7XG4gICAgdGhpcy5vblJlY29yZCA9IHRydWU7XG4gICAgdGhpcy5lbnJlZ2lzdHJlbWVudC5zdGFydFJlY29yZCgpO1xuICB9ZWxzZXtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImZvbmRcIikuc2V0QXR0cmlidXRlKFwiZmlsbFwiLCBcImJsYWNrXCIpO1xuICAgIHRoaXMub25SZWNvcmQgPSBmYWxzZTtcbiAgICB0aGlzLmVucmVnaXN0cmVtZW50LnN0b3BSZWNvcmQodGhpcyk7XG4gIH1cbn1cblxuLyogQWpvdXRlIGxlIGZvbmQgKi9cbl9hZGRGb25kKGZvbmQsbGFiZWwpe1xuICAvLyBPbiBwYXJzZSBsZSBmaWNoaWVyIFNWRyBlbiBET01cbiAgY29uc3QgcGFyc2VyID0gbmV3IERPTVBhcnNlcigpO1xuICBsZXQgZm9uZFhtbCA9IHBhcnNlci5wYXJzZUZyb21TdHJpbmcoZm9uZCwnYXBwbGljYXRpb24veG1sJyk7XG4gIGZvbmRYbWwgPSBmb25kWG1sLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzdmcnKVswXTtcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2V4cGVyaWVuY2UnKS5hcHBlbmRDaGlsZChmb25kWG1sKTtcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3N2ZycpWzBdLnNldEF0dHJpYnV0ZSgnaWQnLCdzdmdFbGVtZW50Jyk7XG4gIHRoaXMuc3RhcnRPSyA9IHRydWU7XG4gIHRoaXMubGFiZWwgPSBsYWJlbDtcbiAgdGhpcy5zdGFydCgpO1xufVxuXG4vKiBBam91dGUgbGEgYm91bGUgYXUgZm9uZCAqL1xuX2FkZEJvdWxlKHgseSl7XG4gIGNvbnN0IGVsZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoJ2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJywnY2lyY2xlJyk7XG4gIGVsZW0uc2V0QXR0cmlidXRlTlMobnVsbCxcImN4XCIseCk7XG4gICAgZWxlbS5zZXRBdHRyaWJ1dGVOUyhudWxsLFwiY3lcIix5KTtcbiAgICBlbGVtLnNldEF0dHJpYnV0ZU5TKG51bGwsXCJyXCIsMTApO1xuICAgIGVsZW0uc2V0QXR0cmlidXRlTlMobnVsbCxcInN0cm9rZVwiLCd3aGl0ZScpO1xuICAgIGVsZW0uc2V0QXR0cmlidXRlTlMobnVsbCxcInN0cm9rZS13aWR0aFwiLDMpO1xuICAgIGVsZW0uc2V0QXR0cmlidXRlTlMobnVsbCxcImZpbGxcIiwnYmxhY2snKTtcbiAgICBlbGVtLnNldEF0dHJpYnV0ZU5TKG51bGwsXCJpZFwiLCdib3VsZScpO1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdnJylbMF0uYXBwZW5kQ2hpbGQoZWxlbSk7XG4gIH1cblxuICBfYWRkUmVjdCgpe1xuICAgIGNvbnN0IHN2Z0VsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnc3ZnJylbMF07XG4gICAgbGV0IHggPSBzdmdFbGVtZW50LmdldEF0dHJpYnV0ZSgnd2lkdGgnKTtcbiAgICBsZXQgeSA9IHN2Z0VsZW1lbnQuZ2V0QXR0cmlidXRlKCdoZWlnaHQnKTtcbiAgICBjb25zdCBuZXdSZWN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKCdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycsJ3JlY3QnKTtcbiAgICBuZXdSZWN0LnNldEF0dHJpYnV0ZU5TKG51bGwsJ3dpZHRoJyx4KTtcbiAgICBuZXdSZWN0LnNldEF0dHJpYnV0ZU5TKG51bGwsJ2hlaWdodCcsIHkpO1xuICAgIG5ld1JlY3Quc2V0QXR0cmlidXRlTlMobnVsbCwneCcsMCk7XG4gICAgbmV3UmVjdC5zZXRBdHRyaWJ1dGVOUyhudWxsLCd5JywwKTtcbiAgICBuZXdSZWN0LnNldEF0dHJpYnV0ZU5TKG51bGwsJ2lkJywnZm9uZCcpO1xuICAgIHN2Z0VsZW1lbnQuaW5zZXJ0QmVmb3JlKG5ld1JlY3Qsc3ZnRWxlbWVudC5maXJzdENoaWxkKTtcbiAgfVxuXG4vKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1NT1VWRU1FTlQgREUgTCBFQ1JBTi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAqL1xuXG4gIC8qIENhbGxiYWNrIG9yaWVudGF0aW9uTW90aW9uIC8gTW91dmVtZW50IGRlIGxhIGJvdWxlKi9cbiAgX3RvTW92ZSh2YWx1ZVgsdmFsdWVZKXtcbiAgICBjb25zdCBvYmogPSB0aGlzLnZpZXcuJGVsLnF1ZXJ5U2VsZWN0b3IoJyNib3VsZScpO1xuICAgIGxldCBuZXdYO1xuICAgIGxldCBuZXdZO1xuICAgIGxldCBhY3R1ID0gdGhpcy5taXJyb3JCb3VsZVgrdmFsdWVYKjAuMzsgLy9wYXJzZUludChvYmouZ2V0QXR0cmlidXRlKCdjeCcpKSt2YWx1ZVgqMC4zO1xuICAgIGlmKGFjdHU8dGhpcy5vZmZzZXRYKXtcbiAgICAgIGFjdHU9IHRoaXMub2Zmc2V0WCA7XG4gICAgfWVsc2UgaWYoYWN0dSA+KHRoaXMudGFpbGxlRWNyYW5YK3RoaXMub2Zmc2V0WCkpe1xuICAgICAgYWN0dT0gdGhpcy50YWlsbGVFY3JhblgrdGhpcy5vZmZzZXRYXG4gICAgfVxuICAgIGlmKHRoaXMudmlzdWFsaXNhdGlvbkJvdWxlKXtcbiAgICAgIG9iai5zZXRBdHRyaWJ1dGUoJ2N4JywgYWN0dSk7XG4gICAgfVxuICAgIHRoaXMubWlycm9yQm91bGVYID0gYWN0dTtcbiAgICBuZXdYPWFjdHU7XG4gICAgYWN0dSA9IHRoaXMubWlycm9yQm91bGVZK3ZhbHVlWSowLjM7Ly9wYXJzZUludChvYmouZ2V0QXR0cmlidXRlKCdjeScpKSt2YWx1ZVkqMC4zO1xuICAgIGlmKGFjdHU8KHRoaXMub2Zmc2V0WSkpe1xuICAgICAgYWN0dT0gdGhpcy5vZmZzZXRZO1xuICAgIH1cbiAgICBpZihhY3R1ID4gKHRoaXMudGFpbGxlRWNyYW5ZK3RoaXMub2Zmc2V0WSkpe1xuICAgICAgYWN0dSA9IHRoaXMudGFpbGxlRWNyYW5ZK3RoaXMub2Zmc2V0WTtcbiAgICB9XG4gICAgaWYodGhpcy52aXN1YWxpc2F0aW9uQm91bGUpe1xuICAgICAgb2JqLnNldEF0dHJpYnV0ZSgnY3knLCBhY3R1KTtcbiAgICB9XG4gICAgdGhpcy5taXJyb3JCb3VsZVk9IGFjdHU7XG4gICAgbmV3WT1hY3R1O1xuICAgIHJldHVybiBbbmV3WCxuZXdZXTtcbiAgfVxuXG4gIC8vIETDqXBsYWNlIGwnw6ljcmFuIGRhbnMgbGEgbWFwXG4gIF9tb3ZlU2NyZWVuVG8oeCx5LGZvcmNlPTEpe1xuICAgIGxldCBkaXN0YW5jZVggPSAoeC10aGlzLm9mZnNldFgpLXRoaXMuY2VudHJlRWNyYW5YO1xuICAgIGxldCBuZWdYID0gZmFsc2U7XG4gICAgbGV0IGluZGljZVBvd1ggPSAzO1xuICAgIGxldCBpbmRpY2VQb3dZID0gMztcbiAgICBpZihkaXN0YW5jZVg8MCl7XG4gICAgICBuZWdYID0gdHJ1ZTtcbiAgICB9XG4gICAgZGlzdGFuY2VYID0gTWF0aC5wb3coKE1hdGguYWJzKGRpc3RhbmNlWC90aGlzLmNlbnRyZUVjcmFuWCkpLGluZGljZVBvd1gpKnRoaXMuY2VudHJlRWNyYW5YOyBcbiAgICBpZihuZWdYKXtcbiAgICAgIGRpc3RhbmNlWCAqPSAtMTtcbiAgICB9XG4gICAgaWYodGhpcy5vZmZzZXRYKyhkaXN0YW5jZVgqZm9yY2UpPj0wJiYodGhpcy5vZmZzZXRYKyhkaXN0YW5jZVgqZm9yY2UpPD10aGlzLlNWR19NQVhfWC10aGlzLnRhaWxsZUVjcmFuWCkpe1xuICAgICAgdGhpcy5vZmZzZXRYICs9IChkaXN0YW5jZVgqZm9yY2UpO1xuICAgIH1cblxuICAgIGxldCBkaXN0YW5jZVkgPSAoeS10aGlzLm9mZnNldFkpLXRoaXMuY2VudHJlRWNyYW5ZO1xuICAgIGxldCBuZWdZID0gZmFsc2U7XG4gICAgaWYoZGlzdGFuY2VZPDApe1xuICAgICAgbmVnWSA9IHRydWU7XG4gICAgfVxuICAgIGRpc3RhbmNlWSA9IE1hdGgucG93KChNYXRoLmFicyhkaXN0YW5jZVkvdGhpcy5jZW50cmVFY3JhblkpKSxpbmRpY2VQb3dZKSp0aGlzLmNlbnRyZUVjcmFuWTtcbiAgICBpZihuZWdZKXtcbiAgICAgIGRpc3RhbmNlWSAqPSAtMTtcbiAgICB9XG4gICAgaWYoKHRoaXMub2Zmc2V0WSsoZGlzdGFuY2VZKmZvcmNlKT49MCkmJih0aGlzLm9mZnNldFkrKGRpc3RhbmNlWSpmb3JjZSk8PXRoaXMuU1ZHX01BWF9ZLXRoaXMudGFpbGxlRWNyYW5ZKSl7XG4gICAgICB0aGlzLm9mZnNldFkgKz0gKGRpc3RhbmNlWSpmb3JjZSk7XG4gICAgfVxuICAgIHdpbmRvdy5zY3JvbGwodGhpcy5vZmZzZXRYLHRoaXMub2Zmc2V0WSlcbiAgfVxuXG4gIF9teUxpc3RlbmVyKHRpbWUpe1xuICAgIHRoaXMudGFpbGxlRWNyYW5YID0gd2luZG93LmlubmVyV2lkdGg7XG4gICAgdGhpcy50YWlsbGVFY3JhblkgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG4gICAgc2V0VGltZW91dCh0aGlzLl9teUxpc3RlbmVyLHRpbWUpO1xuICB9XG5cbi8qIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLURFVEVSTUlOQVRJT04gREVTIElOL09VVCBERVMgRk9STUVTLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tICovXG5cbiAgLy8gRm9uY3Rpb24gcXVpIHBlcm1ldCBkZSBjb25uYcOudHJlIGwnZW5zZW1ibGUgZGVzIGZpZ3VyZXMgb8O5IGxlIHBvaW50IHNlIHNpdHVlXG4gIF9pc0luKHgseSl7XG4gICAgbGV0IHRhYiA9IFtdO1xuICAgIGxldCByb3RhdGVBbmdsZTtcbiAgICBsZXQgY2VudHJlUm90YXRlWDtcbiAgICBsZXQgY2VudHJlUm90YXRlWTtcbiAgICBmb3IobGV0IGk9MDtpPHRoaXMubGlzdGVFbGxpcHNlLmxlbmd0aDtpKyspe1xuICAgICAgcm90YXRlQW5nbGU9MDtcbiAgICAgIGNvbnN0IGNlbnRyZVggPSB0aGlzLmxpc3RlRWxsaXBzZVtpXS5nZXRBdHRyaWJ1dGUoJ2N4Jyk7XG4gICAgICBjb25zdCBjZW50cmVZID0gdGhpcy5saXN0ZUVsbGlwc2VbaV0uZ2V0QXR0cmlidXRlKCdjeScpO1xuICAgICAgY29uc3QgcmF5b25YID0gdGhpcy5saXN0ZUVsbGlwc2VbaV0uZ2V0QXR0cmlidXRlKCdyeCcpO1xuICAgICAgY29uc3QgcmF5b25ZID0gdGhpcy5saXN0ZUVsbGlwc2VbaV0uZ2V0QXR0cmlidXRlKCdyeScpO1xuICAgICAgbGV0IHRyYW5zID0gdGhpcy5saXN0ZUVsbGlwc2VbaV0uZ2V0QXR0cmlidXRlKCd0cmFuc2Zvcm0nKTtcbiAgICAgIGlmKC9yb3RhdGUvLnRlc3QodHJhbnMpKXtcbiAgICAgICAgdHJhbnMgPSB0cmFucy5zbGljZSg3LHRyYW5zLmxlbmd0aCk7XG4gICAgICAgIGNlbnRyZVJvdGF0ZVggPSBwYXJzZUZsb2F0KHRyYW5zLnNwbGl0KFwiIFwiKVsxXSk7XG4gICAgICAgIGNlbnRyZVJvdGF0ZVkgPSBwYXJzZUZsb2F0KHRyYW5zLnNwbGl0KFwiLFwiKVsxXS5yZXBsYWNlKFwiKVwiLFwiXCIpKTtcbiAgICAgICAgcm90YXRlQW5nbGUgPSBwYXJzZUZsb2F0KHRyYW5zLnNwbGl0KFwiIFwiKVswXSk7XG4gICAgICB9XG4gICAgICB0YWJbdGFiLmxlbmd0aF09dGhpcy5faXNJbkVsbGlwc2UocGFyc2VGbG9hdChjZW50cmVYKSxwYXJzZUZsb2F0KGNlbnRyZVkpLHBhcnNlRmxvYXQocmF5b25YKSxwYXJzZUZsb2F0KHJheW9uWSkseCx5LHJvdGF0ZUFuZ2xlLGNlbnRyZVJvdGF0ZVgsY2VudHJlUm90YXRlWSk7ICAgICBcbiAgICB9XG4gICAgZm9yKGxldCBpPTA7aTx0aGlzLmxpc3RlUmVjdC5sZW5ndGg7aSsrKXtcbiAgICAgIHJvdGF0ZUFuZ2xlPTA7XG4gICAgICBjZW50cmVSb3RhdGVYPW51bGw7XG4gICAgICBjZW50cmVSb3RhdGVZPW51bGw7XG4gICAgICBjb25zdCBoYXV0ZXVyID0gdGhpcy5saXN0ZVJlY3RbaV0uZ2V0QXR0cmlidXRlKCd3aWR0aCcpO1xuICAgICAgY29uc3QgbGFyZ2V1ciA9IHRoaXMubGlzdGVSZWN0W2ldLmdldEF0dHJpYnV0ZSgnaGVpZ2h0Jyk7XG4gICAgICBjb25zdCBsZWZ0ID0gdGhpcy5saXN0ZVJlY3RbaV0uZ2V0QXR0cmlidXRlKCd4Jyk7XG4gICAgICBjb25zdCB0b3AgPSB0aGlzLmxpc3RlUmVjdFtpXS5nZXRBdHRyaWJ1dGUoJ3knKTtcbiAgICAgIGxldCB0cmFucyA9IHRoaXMubGlzdGVSZWN0W2ldLmdldEF0dHJpYnV0ZSgndHJhbnNmb3JtJyk7XG4gICAgICBpZigvcm90YXRlLy50ZXN0KHRyYW5zKSl7XG4gICAgICAgIHRyYW5zID0gdHJhbnMuc2xpY2UoNyx0cmFucy5sZW5ndGgpO1xuICAgICAgICBjZW50cmVSb3RhdGVYID0gcGFyc2VGbG9hdCh0cmFucy5zcGxpdChcIiBcIilbMV0pO1xuICAgICAgICBjZW50cmVSb3RhdGVZID0gcGFyc2VGbG9hdCh0cmFucy5zcGxpdChcIixcIilbMV0ucmVwbGFjZShcIilcIixcIlwiKSk7XG4gICAgICAgIHJvdGF0ZUFuZ2xlID0gcGFyc2VGbG9hdCh0cmFucy5zcGxpdChcIiBcIilbMF0pO1xuICAgICAgfVxuICAgICAgdGFiW3RhYi5sZW5ndGhdPXRoaXMuX2lzSW5SZWN0KHBhcnNlRmxvYXQoaGF1dGV1ciksIHBhcnNlRmxvYXQobGFyZ2V1ciksIHBhcnNlRmxvYXQobGVmdCksIHBhcnNlRmxvYXQodG9wKSwgeCwgeSxyb3RhdGVBbmdsZSxjZW50cmVSb3RhdGVYLGNlbnRyZVJvdGF0ZVkpO1xuICAgIH0gIFxuICAgIHJldHVybiB0YWI7XG4gIH1cblxuXG4gIC8vIEZvbmN0aW9uIHF1aSBkaXQgc2kgdW4gcG9pbnQgZXN0IGRhbnMgdW4gcmVjdFxuICAgX2lzSW5SZWN0KGhhdXRldXIsbGFyZ2V1cixsZWZ0LHRvcCxwb2ludFgscG9pbnRZLHJvdGF0ZUFuZ2xlLGNlbnRyZVJvdGF0ZVgsY2VudHJlUm90YXRlWSl7XG4gICAgICAvL3JvdGF0aW9uXG4gICAgICBjb25zdCBuZXdQb2ludCA9IHRoaXMuX3JvdGF0ZVBvaW50KHBvaW50WCxwb2ludFksY2VudHJlUm90YXRlWCxjZW50cmVSb3RhdGVZLHJvdGF0ZUFuZ2xlKTtcbiAgICAgIC8vQXBwYXJ0ZW5hbmNlXG4gICAgICBpZihuZXdQb2ludFswXSA+IHBhcnNlSW50KGxlZnQpICYmIG5ld1BvaW50WzBdIDwocGFyc2VJbnQobGVmdCkrcGFyc2VJbnQoaGF1dGV1cikpICYmIG5ld1BvaW50WzFdID4gdG9wICYmIG5ld1BvaW50WzFdIDwgKHBhcnNlSW50KHRvcCkgKyBwYXJzZUludChsYXJnZXVyKSkpe1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1lbHNle1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICB9XG5cbiAgLy8gRm9uY3Rpb24gcXVpIGRpdCBzaSB1biBwb2ludCBlc3QgZGFucyB1bmUgZWxsaXBzZVxuICBfaXNJbkVsbGlwc2UoY2VudHJlWCxjZW50cmVZLHJheW9uWCxyYXlvblkscG9pbnRYLHBvaW50WSxyb3RhdGVBbmdsZSxjZW50cmVSb3RhdGVYLGNlbnRyZVJvdGF0ZVkpe1xuICAgIC8vcm90YXRpb25cbiAgICBjb25zdCBuZXdQb2ludCA9IHRoaXMuX3JvdGF0ZVBvaW50KHBvaW50WCxwb2ludFksY2VudHJlUm90YXRlWCxjZW50cmVSb3RhdGVZLHJvdGF0ZUFuZ2xlKTtcbiAgICAvL2NvbnNvbGUubG9nKFwiYW5jaWVubmUgOiBcIixwb2ludFgscG9pbnRZLFwiIG5ldyBjb29yZG9ubsOpZSA6IFwiLG5ld1BvaW50LGNlbnRyZVgsY2VudHJlWSxyb3RhdGVBbmdsZSlcbiAgICAvL0FwcGFydGVuYW5jZSBcbiAgICBsZXQgYSA9IHJheW9uWDs7IC8vIEdyYW5kIHJheW9uXG4gICAgbGV0IGIgPSByYXlvblk7IC8vIFBldGl0IHJheW9uXG4gICAgLy9jb25zdCBjID0gTWF0aC5zcXJ0KChhKmEpLShiKmIpKTsgLy8gRGlzdGFuY2UgRm95ZXJcbiAgICBjb25zdCBjYWxjID0gKChNYXRoLnBvdygobmV3UG9pbnRbMF0tY2VudHJlWCksMikpLyhNYXRoLnBvdyhhLDIpKSkrKChNYXRoLnBvdygobmV3UG9pbnRbMV0tY2VudHJlWSksMikpLyhNYXRoLnBvdyhiLDIpKSk7XG4gICAgaWYoY2FsYzw9MSl7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9ZWxzZXtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbiAgXG4gIC8vIEZvbmN0aW9uIHBlcm1ldHRhbnQgZGUgcsOpYXhlciBsZSBwb2ludFxuICBfcm90YXRlUG9pbnQoeCx5LGNlbnRyZVgsY2VudHJlWSxhbmdsZSl7XG4gICAgbGV0IG5ld0FuZ2xlID0gYW5nbGUqKDMuMTQxNTkyNjUvMTgwKTsgLy8gUGFzc2FnZSBlbiByYWRpYW5cbiAgICBsZXQgdGFiID0gW107XG4gICAgbGV0IG5ld1ggPSAoeC1jZW50cmVYKSpNYXRoLmNvcyhuZXdBbmdsZSkrKHktY2VudHJlWSkqTWF0aC5zaW4obmV3QW5nbGUpO1xuICAgIGxldCBuZXdZID0gLTEqKHgtY2VudHJlWCkqTWF0aC5zaW4obmV3QW5nbGUpKyh5LWNlbnRyZVkpKk1hdGguY29zKG5ld0FuZ2xlKTtcbiAgICBuZXdYICs9IGNlbnRyZVg7XG4gICAgbmV3WSArPSBjZW50cmVZO1xuICAgIC8vQWZmaWNoYWdlIGR1IHN5bcOpdHJpcXVlXG4gICAgIC8vIGNvbnN0IG9iaiA9IHRoaXMudmlldy4kZWwucXVlcnlTZWxlY3RvcignI2JvdWxlUicpO1xuICAgICAvLyBvYmouc2V0QXR0cmlidXRlKFwiY3hcIixuZXdYKTtcbiAgICAgLy8gb2JqLnNldEF0dHJpYnV0ZShcImN5XCIsbmV3WSk7XG4gICAgLy9GaW4gZGUgbCdhZmZpY2hhZ2UgZHUgc3ltw6l0cmlxdWVcbiAgICB0YWJbMF0gPSBuZXdYO1xuICAgIHRhYlsxXSA9IG5ld1k7XG4gICAgcmV0dXJuIHRhYjtcbiAgfVxuXG4vKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1DYWxjdWwgZGVzIGRpc3RhbmNlcy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAqL1xuXG4gIC8vIERvbm5lIGxhIGRpc3RhbmNlIGR1IHBvaW50IGF2ZWMgbGVzIGZvcm1lcyBwcsOpc2VudGVzXG4gIF9nZXREaXN0YW5jZSh4VmFsdWUseVZhbHVlKXtcbiAgICBsZXQgdGFiID0gW107XG4gICAgZm9yKGxldCBpPTA7aTx0aGlzLmxpc3RlRWxsaXBzZS5sZW5ndGg7aSsrKXtcbiAgICAgIHRhYlt0YWIubGVuZ3RoXT10aGlzLl9nZXREaXN0YW5jZU5vZGUodGhpcy5saXN0ZUVsbGlwc2VbaV0seFZhbHVlLHlWYWx1ZSk7XG4gICAgfVxuICAgIGZvcihsZXQgaT0wO2k8dGhpcy5saXN0ZVJlY3QubGVuZ3RoO2krKyl7XG4gICAgICB0YWJbdGFiLmxlbmd0aF09dGhpcy5fZ2V0RGlzdGFuY2VOb2RlKHRoaXMubGlzdGVSZWN0W2ldLHhWYWx1ZSx5VmFsdWUpO1xuICAgIH1cbiAgICByZXR1cm4gdGFiO1xuICB9XG5cbiAgLy8gRG9ubmUgbGEgZGlzdGFuY2UgZCd1biBwb2ludCBhdmVjIHVuZSBmb3JtZVxuICBfZ2V0RGlzdGFuY2VOb2RlKG5vZGUseCx5KXtcbiAgICBpZihub2RlLnRhZ05hbWU9PVwiZWxsaXBzZVwiKXtcbiAgICAgIGxldCBjZW50cmVYID0gcGFyc2VJbnQobm9kZS5nZXRBdHRyaWJ1dGUoJ2N4JykpO1xuICAgICAgbGV0IGNlbnRyZVkgPSBwYXJzZUludChub2RlLmdldEF0dHJpYnV0ZSgnY3knKSk7XG4gICAgICByZXR1cm4gTWF0aC5zcXJ0KE1hdGgucG93KChjZW50cmVYLXgpLDIpK01hdGgucG93KChjZW50cmVZLXkpLDIpKTtcbiAgICB9ZWxzZSBpZihub2RlLnRhZ05hbWU9PSdyZWN0Jyl7XG4gICAgICBsZXQgbGVmdCA9IHBhcnNlSW50KG5vZGUuZ2V0QXR0cmlidXRlKCd4JykpO1xuICAgICAgbGV0IHRvcCA9IHBhcnNlSW50KG5vZGUuZ2V0QXR0cmlidXRlKCd5JykpO1xuICAgICAgbGV0IGhhdXQgPSBwYXJzZUludChub2RlLmdldEF0dHJpYnV0ZSgnaGVpZ2h0JykpO1xuICAgICAgbGV0IGxhcmcgPSBwYXJzZUludChub2RlLmdldEF0dHJpYnV0ZSgnd2lkdGgnKSk7XG4gICAgICBsZXQgY2VudHJlWCA9IChsZWZ0K2xhcmcpLzI7XG4gICAgICBsZXQgY2VudHJlWSA9ICh0b3AraGF1dCkvMjtcbiAgICAgIHJldHVybiBNYXRoLnNxcnQoTWF0aC5wb3coKGNlbnRyZVgteCksMikrTWF0aC5wb3coKGNlbnRyZVkteSksMikpO1xuICAgIH1cbiAgfVxufVxuIl19