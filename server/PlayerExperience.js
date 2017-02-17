'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _get2 = require('babel-runtime/helpers/get');

var _get3 = _interopRequireDefault(_get2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _server = require('soundworks/server');

var _xmmNode = require('xmm-node');

var _xmmNode2 = _interopRequireDefault(_xmmNode);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// server-side 'player' experience.
var PlayerExperience = function (_Experience) {
  (0, _inherits3.default)(PlayerExperience, _Experience);

  function PlayerExperience(clientType) {
    (0, _classCallCheck3.default)(this, PlayerExperience);

    var _this = (0, _possibleConstructorReturn3.default)(this, (PlayerExperience.__proto__ || (0, _getPrototypeOf2.default)(PlayerExperience)).call(this, clientType));

    _this.sharedConfig = _this.require('shared-config');
    _this.nomFichierFond = 'prototypeFond.svg';
    return _this;
  }

  // if anything needs to append when the experience starts


  (0, _createClass3.default)(PlayerExperience, [{
    key: 'start',
    value: function start() {
      var _this2 = this;

      /*---------------- XMM - initialisation --------------*/
      //Forme local
      this.xmm = new _xmmNode2.default('hhmm', {
        states: 10,
        relativeRegularization: 0.01,
        transitionMode: 'leftright'
      });
      var dossierPhrases = _fs2.default.readdirSync(_path2.default.join(process.cwd(), 'ressources/phrases/forme/'));
      for (var i = 0; i < dossierPhrases.length; i++) {
        try {
          var phrases = _fs2.default.readdirSync(_path2.default.join(process.cwd(), 'ressources/phrases/forme/' + dossierPhrases[i] + '/'));
          for (var j = 0; j < phrases.length; j++) {
            try {
              var phrase = JSON.parse(_fs2.default.readFileSync(_path2.default.join(process.cwd(), 'ressources/phrases/forme/' + dossierPhrases[i] + '/' + phrases[j])));
              this.xmm.addPhrase(phrase);
            } catch (e) {}
          }
        } catch (e) {}
      }
      this.xmm.train(function (e, model) {
        _this2.model = model;
      });

      // path sens1
      var dossierPhrasesPath1 = _fs2.default.readdirSync(_path2.default.join(process.cwd(), 'ressources/phrases/chemin/sens1/'));
      this.xmmPath1 = new _xmmNode2.default('hhmm', {
        states: 50,
        relativeRegularization: 0.05,
        transitionMode: 'ergodic'
      });
      for (var _i = 0; _i < dossierPhrasesPath1.length; _i++) {
        try {
          var _phrases = _fs2.default.readdirSync(_path2.default.join(process.cwd(), 'ressources/phrases/chemin/sens1/' + dossierPhrasesPath1[_i] + '/'));
          for (var _j = 0; _j < _phrases.length; _j++) {
            try {
              var _phrase = JSON.parse(_fs2.default.readFileSync(_path2.default.join(process.cwd(), 'ressources/phrases/chemin/sens1/' + dossierPhrasesPath1[_i] + '/' + _phrases[_j])));
              this.xmmPath1.addPhrase(_phrase);
            } catch (e) {}
          }
        } catch (e) {}
      }
      this.xmmPath1.train(function (e, modelPath1) {
        _this2.modelPath1 = modelPath1;
      });

      // path sens2
      var dossierPhrasesPath2 = _fs2.default.readdirSync(_path2.default.join(process.cwd(), 'ressources/phrases/chemin/sens2'));
      this.xmmPath2 = new _xmmNode2.default('hhmm', {
        states: 50,
        relativeRegularization: 0.05,
        transitionMode: 'ergodic'
      });
      for (var _i2 = 0; _i2 < dossierPhrasesPath2.length; _i2++) {
        try {
          var _phrases2 = _fs2.default.readdirSync(_path2.default.join(process.cwd(), 'ressources/phrases/chemin/sens2/' + dossierPhrasesPath2[_i2] + '/'));
          for (var _j2 = 0; _j2 < _phrases2.length; _j2++) {
            try {
              var _phrase2 = JSON.parse(_fs2.default.readFileSync(_path2.default.join(process.cwd(), 'ressources/phrases/chemin/sens2/' + dossierPhrasesPath2[_i2] + '/' + _phrases2[_j2])));
              this.xmmPath2.addPhrase(_phrase2);
            } catch (e) {}
          }
        } catch (e) {}
      }
      this.xmmPath2.train(function (e, modelPath2) {
        _this2.modelPath2 = modelPath2;
      });

      // SVG initialisation
      this.fichierFond = _fs2.default.readFileSync(_path2.default.join(process.cwd(), 'ressources/img/imgFond/' + this.nomFichierFond)).toString();
    }

    // if anything needs to happen when a client enters the performance (*i.e.*
    // starts the experience on the client side), write it in the `enter` method

  }, {
    key: 'enter',
    value: function enter(client) {
      var _this3 = this;

      (0, _get3.default)(PlayerExperience.prototype.__proto__ || (0, _getPrototypeOf2.default)(PlayerExperience.prototype), 'enter', this).call(this, client);
      this.send(client, 'fond', this.fichierFond);
      this.send(client, 'model', this.model, this.modelPath1, this.modelPath2);
      this.receive(client, 'demandeForme', function (forme, x, y) {
        return _this3._demandeForme(forme, x, y, client);
      });
    }
  }, {
    key: 'exit',
    value: function exit(client) {
      (0, _get3.default)(PlayerExperience.prototype.__proto__ || (0, _getPrototypeOf2.default)(PlayerExperience.prototype), 'exit', this).call(this, client);
    }
  }, {
    key: '_demandeForme',
    value: function _demandeForme(forme, x, y, client) {
      var fichier = _fs2.default.readFileSync(_path2.default.join(process.cwd(), 'ressources/img/formes/' + forme + '.svg')).toString();
      this.send(client, 'reponseForme', fichier, x, y);
    }
  }]);
  return PlayerExperience;
}(_server.Experience);

exports.default = PlayerExperience;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlBsYXllckV4cGVyaWVuY2UuanMiXSwibmFtZXMiOlsiUGxheWVyRXhwZXJpZW5jZSIsImNsaWVudFR5cGUiLCJzaGFyZWRDb25maWciLCJyZXF1aXJlIiwibm9tRmljaGllckZvbmQiLCJ4bW0iLCJzdGF0ZXMiLCJyZWxhdGl2ZVJlZ3VsYXJpemF0aW9uIiwidHJhbnNpdGlvbk1vZGUiLCJkb3NzaWVyUGhyYXNlcyIsInJlYWRkaXJTeW5jIiwiam9pbiIsInByb2Nlc3MiLCJjd2QiLCJpIiwibGVuZ3RoIiwicGhyYXNlcyIsImoiLCJwaHJhc2UiLCJKU09OIiwicGFyc2UiLCJyZWFkRmlsZVN5bmMiLCJhZGRQaHJhc2UiLCJlIiwidHJhaW4iLCJtb2RlbCIsImRvc3NpZXJQaHJhc2VzUGF0aDEiLCJ4bW1QYXRoMSIsIm1vZGVsUGF0aDEiLCJkb3NzaWVyUGhyYXNlc1BhdGgyIiwieG1tUGF0aDIiLCJtb2RlbFBhdGgyIiwiZmljaGllckZvbmQiLCJ0b1N0cmluZyIsImNsaWVudCIsInNlbmQiLCJyZWNlaXZlIiwiZm9ybWUiLCJ4IiwieSIsIl9kZW1hbmRlRm9ybWUiLCJmaWNoaWVyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7OztBQUdBO0lBQ3FCQSxnQjs7O0FBQ25CLDRCQUFZQyxVQUFaLEVBQXdCO0FBQUE7O0FBQUEsMEpBQ2hCQSxVQURnQjs7QUFFdEIsVUFBS0MsWUFBTCxHQUFvQixNQUFLQyxPQUFMLENBQWEsZUFBYixDQUFwQjtBQUNBLFVBQUtDLGNBQUwsR0FBc0IsbUJBQXRCO0FBSHNCO0FBSXZCOztBQUVEOzs7Ozs0QkFDUTtBQUFBOztBQUNOO0FBQ0E7QUFDQSxXQUFLQyxHQUFMLEdBQVUsc0JBQVEsTUFBUixFQUFnQjtBQUN4QkMsZ0JBQVEsRUFEZ0I7QUFFeEJDLGdDQUF3QixJQUZBO0FBR3hCQyx3QkFBZ0I7QUFIUSxPQUFoQixDQUFWO0FBS0Ms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QUFBOztBQUNaLHNKQUFZQSxNQUFaO0FBQ0EsV0FBS0MsSUFBTCxDQUFVRCxNQUFWLEVBQWlCLE1BQWpCLEVBQXdCLEtBQUtGLFdBQTdCO0FBQ0EsV0FBS0csSUFBTCxDQUFVRCxNQUFWLEVBQWlCLE9BQWpCLEVBQXlCLEtBQUtULEtBQTlCLEVBQW9DLEtBQUtHLFVBQXpDLEVBQXFELEtBQUtHLFVBQTFEO0FBQ0EsV0FBS0ssT0FBTCxDQUFhRixNQUFiLEVBQW9CLGNBQXBCLEVBQW1DLFVBQUNHLEtBQUQsRUFBT0MsQ0FBUCxFQUFTQyxDQUFUO0FBQUEsZUFBYSxPQUFLQyxhQUFMLENBQW1CSCxLQUFuQixFQUF5QkMsQ0FBekIsRUFBMkJDLENBQTNCLEVBQTZCTCxNQUE3QixDQUFiO0FBQUEsT0FBbkM7QUFDRDs7O3lCQUVJQSxNLEVBQVE7QUFDWCxxSkFBV0EsTUFBWDtBQUNEOzs7a0NBRWFHLEssRUFBTUMsQyxFQUFFQyxDLEVBQUVMLE0sRUFBTztBQUM3QixVQUFNTyxVQUFVLGFBQUdwQixZQUFILENBQWdCLGVBQUtWLElBQUwsQ0FBVUMsUUFBUUMsR0FBUixFQUFWLEVBQXlCLDJCQUF5QndCLEtBQXpCLEdBQStCLE1BQXhELENBQWhCLEVBQWlGSixRQUFqRixFQUFoQjtBQUNBLFdBQUtFLElBQUwsQ0FBVUQsTUFBVixFQUFpQixjQUFqQixFQUFnQ08sT0FBaEMsRUFBd0NILENBQXhDLEVBQTBDQyxDQUExQztBQUNEOzs7OztrQkFoR2tCdkMsZ0IiLCJmaWxlIjoiUGxheWVyRXhwZXJpZW5jZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEV4cGVyaWVuY2UgfSBmcm9tICdzb3VuZHdvcmtzL3NlcnZlcic7XG5pbXBvcnQgeG1tIGZyb20gJ3htbS1ub2RlJztcbmltcG9ydCBmcyBmcm9tICdmcyc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcblxuXG4vLyBzZXJ2ZXItc2lkZSAncGxheWVyJyBleHBlcmllbmNlLlxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUGxheWVyRXhwZXJpZW5jZSBleHRlbmRzIEV4cGVyaWVuY2Uge1xuICBjb25zdHJ1Y3RvcihjbGllbnRUeXBlKSB7XG4gICAgc3VwZXIoY2xpZW50VHlwZSk7XG4gICAgdGhpcy5zaGFyZWRDb25maWcgPSB0aGlzLnJlcXVpcmUoJ3NoYXJlZC1jb25maWcnKTtcbiAgICB0aGlzLm5vbUZpY2hpZXJGb25kID0gJ3Byb3RvdHlwZUZvbmQuc3ZnJztcbiAgfVxuXG4gIC8vIGlmIGFueXRoaW5nIG5lZWRzIHRvIGFwcGVuZCB3aGVuIHRoZSBleHBlcmllbmNlIHN0YXJ0c1xuICBzdGFydCgpIHtcbiAgICAvKi0tLS0tLS0tLS0tLS0tLS0gWE1NIC0gaW5pdGlhbGlzYXRpb24gLS0tLS0tLS0tLS0tLS0qL1xuICAgIC8vRm9ybWUgbG9jYWxcbiAgICB0aGlzLnhtbT0gbmV3IHhtbSgnaGhtbScsIHtcbiAgICAgIHN0YXRlczogMTAsXG4gICAgICByZWxhdGl2ZVJlZ3VsYXJpemF0aW9uOiAwLjAxLFxuICAgICAgdHJhbnNpdGlvbk1vZGU6ICdsZWZ0cmlnaHQnLFxuICAgIH0pO1xuICAgICBjb25zdCBkb3NzaWVyUGhyYXNlcyA9IGZzLnJlYWRkaXJTeW5jKHBhdGguam9pbihwcm9jZXNzLmN3ZCgpLCAncmVzc291cmNlcy9waHJhc2VzL2Zvcm1lLycpKTtcbiAgICBmb3IobGV0IGkgPSAwIDsgaTxkb3NzaWVyUGhyYXNlcy5sZW5ndGg7IGkrKyl7XG4gICAgICB0cnl7XG4gICAgICAgIGNvbnN0IHBocmFzZXMgPSBmcy5yZWFkZGlyU3luYyhwYXRoLmpvaW4ocHJvY2Vzcy5jd2QoKSwncmVzc291cmNlcy9waHJhc2VzL2Zvcm1lLycrZG9zc2llclBocmFzZXNbaV0rJy8nKSk7XG4gICAgICAgIGZvcihsZXQgaiA9IDAgOyBqPHBocmFzZXMubGVuZ3RoO2orKyl7XG4gICAgICAgICAgdHJ5e1xuICAgICAgICAgICAgbGV0IHBocmFzZSA9IEpTT04ucGFyc2UoZnMucmVhZEZpbGVTeW5jKHBhdGguam9pbihwcm9jZXNzLmN3ZCgpLCdyZXNzb3VyY2VzL3BocmFzZXMvZm9ybWUvJytkb3NzaWVyUGhyYXNlc1tpXSsnLycrcGhyYXNlc1tqXSkpKTtcbiAgICAgICAgICAgIHRoaXMueG1tLmFkZFBocmFzZShwaHJhc2UpO1xuICAgICAgICAgIH1jYXRjaChlKXt9XG4gICAgICAgIH1cbiAgICAgIH1jYXRjaChlKXt9XG4gICAgfVxuICAgIHRoaXMueG1tLnRyYWluKChlLG1vZGVsKT0+e1xuICAgICAgdGhpcy5tb2RlbD1tb2RlbDtcbiAgICB9KTtcblxuICAgIC8vIHBhdGggc2VuczFcbiAgICBjb25zdCBkb3NzaWVyUGhyYXNlc1BhdGgxID0gZnMucmVhZGRpclN5bmMocGF0aC5qb2luKHByb2Nlc3MuY3dkKCksICdyZXNzb3VyY2VzL3BocmFzZXMvY2hlbWluL3NlbnMxLycpKTtcbiAgICB0aGlzLnhtbVBhdGgxID0gbmV3IHhtbSgnaGhtbScsIHtcbiAgICAgIHN0YXRlczogNTAsXG4gICAgICByZWxhdGl2ZVJlZ3VsYXJpemF0aW9uOiAwLjA1LFxuICAgICAgdHJhbnNpdGlvbk1vZGU6ICdlcmdvZGljJ1xuICAgIH0pO1xuICAgIGZvcihsZXQgaSA9IDAgOyBpPGRvc3NpZXJQaHJhc2VzUGF0aDEubGVuZ3RoOyBpKyspe1xuICAgICAgdHJ5e1xuICAgICAgICBjb25zdCBwaHJhc2VzID0gZnMucmVhZGRpclN5bmMocGF0aC5qb2luKHByb2Nlc3MuY3dkKCksJ3Jlc3NvdXJjZXMvcGhyYXNlcy9jaGVtaW4vc2VuczEvJytkb3NzaWVyUGhyYXNlc1BhdGgxW2ldKycvJykpO1xuICAgICAgICBmb3IobGV0IGogPSAwIDsgajxwaHJhc2VzLmxlbmd0aDtqKyspe1xuICAgICAgICAgIHRyeXtcbiAgICAgICAgICAgIGxldCBwaHJhc2UgPSBKU09OLnBhcnNlKGZzLnJlYWRGaWxlU3luYyhwYXRoLmpvaW4ocHJvY2Vzcy5jd2QoKSwncmVzc291cmNlcy9waHJhc2VzL2NoZW1pbi9zZW5zMS8nK2Rvc3NpZXJQaHJhc2VzUGF0aDFbaV0rJy8nK3BocmFzZXNbal0pKSk7XG4gICAgICAgICAgICB0aGlzLnhtbVBhdGgxLmFkZFBocmFzZShwaHJhc2UpO1xuICAgICAgICAgIH1jYXRjaChlKXt9XG4gICAgICAgIH1cbiAgICAgIH1jYXRjaChlKXt9XG4gICAgfVxuICAgIHRoaXMueG1tUGF0aDEudHJhaW4oKGUsbW9kZWxQYXRoMSk9PntcbiAgICAgIHRoaXMubW9kZWxQYXRoMT1tb2RlbFBhdGgxO1xuICAgIH0pO1xuXG4gICAgLy8gcGF0aCBzZW5zMlxuICAgIGNvbnN0IGRvc3NpZXJQaHJhc2VzUGF0aDIgPSBmcy5yZWFkZGlyU3luYyhwYXRoLmpvaW4ocHJvY2Vzcy5jd2QoKSwgJ3Jlc3NvdXJjZXMvcGhyYXNlcy9jaGVtaW4vc2VuczInKSk7XG4gICAgdGhpcy54bW1QYXRoMiA9IG5ldyB4bW0oJ2hobW0nLCB7XG4gICAgICBzdGF0ZXM6IDUwLFxuICAgICAgcmVsYXRpdmVSZWd1bGFyaXphdGlvbjogMC4wNSxcbiAgICAgIHRyYW5zaXRpb25Nb2RlOiAnZXJnb2RpYydcbiAgICB9KTtcbiAgICBmb3IobGV0IGkgPSAwIDsgaTxkb3NzaWVyUGhyYXNlc1BhdGgyLmxlbmd0aDsgaSsrKXtcbiAgICAgIHRyeXtcbiAgICAgICAgY29uc3QgcGhyYXNlcyA9IGZzLnJlYWRkaXJTeW5jKHBhdGguam9pbihwcm9jZXNzLmN3ZCgpLCdyZXNzb3VyY2VzL3BocmFzZXMvY2hlbWluL3NlbnMyLycrZG9zc2llclBocmFzZXNQYXRoMltpXSsnLycpKTtcbiAgICAgICAgZm9yKGxldCBqID0gMCA7IGo8cGhyYXNlcy5sZW5ndGg7aisrKXtcbiAgICAgICAgICB0cnl7XG4gICAgICAgICAgICBsZXQgcGhyYXNlID0gSlNPTi5wYXJzZShmcy5yZWFkRmlsZVN5bmMocGF0aC5qb2luKHByb2Nlc3MuY3dkKCksJ3Jlc3NvdXJjZXMvcGhyYXNlcy9jaGVtaW4vc2VuczIvJytkb3NzaWVyUGhyYXNlc1BhdGgyW2ldKycvJytwaHJhc2VzW2pdKSkpO1xuICAgICAgICAgICAgdGhpcy54bW1QYXRoMi5hZGRQaHJhc2UocGhyYXNlKTtcbiAgICAgICAgICB9Y2F0Y2goZSl7fVxuICAgICAgICB9XG4gICAgICB9Y2F0Y2goZSl7fVxuICAgIH1cbiAgICB0aGlzLnhtbVBhdGgyLnRyYWluKChlLG1vZGVsUGF0aDIpPT57XG4gICAgICB0aGlzLm1vZGVsUGF0aDI9bW9kZWxQYXRoMjtcbiAgICB9KTtcblxuICAgIC8vIFNWRyBpbml0aWFsaXNhdGlvblxuICAgIHRoaXMuZmljaGllckZvbmQgPSBmcy5yZWFkRmlsZVN5bmMocGF0aC5qb2luKHByb2Nlc3MuY3dkKCksICdyZXNzb3VyY2VzL2ltZy9pbWdGb25kLycrdGhpcy5ub21GaWNoaWVyRm9uZCkpLnRvU3RyaW5nKCk7XG4gIH1cblxuICAvLyBpZiBhbnl0aGluZyBuZWVkcyB0byBoYXBwZW4gd2hlbiBhIGNsaWVudCBlbnRlcnMgdGhlIHBlcmZvcm1hbmNlICgqaS5lLipcbiAgLy8gc3RhcnRzIHRoZSBleHBlcmllbmNlIG9uIHRoZSBjbGllbnQgc2lkZSksIHdyaXRlIGl0IGluIHRoZSBgZW50ZXJgIG1ldGhvZFxuICBlbnRlcihjbGllbnQpIHtcbiAgICBzdXBlci5lbnRlcihjbGllbnQpO1xuICAgIHRoaXMuc2VuZChjbGllbnQsJ2ZvbmQnLHRoaXMuZmljaGllckZvbmQpO1xuICAgIHRoaXMuc2VuZChjbGllbnQsJ21vZGVsJyx0aGlzLm1vZGVsLHRoaXMubW9kZWxQYXRoMSwgdGhpcy5tb2RlbFBhdGgyKTtcbiAgICB0aGlzLnJlY2VpdmUoY2xpZW50LCdkZW1hbmRlRm9ybWUnLChmb3JtZSx4LHkpPT50aGlzLl9kZW1hbmRlRm9ybWUoZm9ybWUseCx5LGNsaWVudCkpO1xuICB9XG5cbiAgZXhpdChjbGllbnQpIHtcbiAgICBzdXBlci5leGl0KGNsaWVudCk7XG4gIH1cblxuICBfZGVtYW5kZUZvcm1lKGZvcm1lLHgseSxjbGllbnQpe1xuICAgIGNvbnN0IGZpY2hpZXIgPSBmcy5yZWFkRmlsZVN5bmMocGF0aC5qb2luKHByb2Nlc3MuY3dkKCksICdyZXNzb3VyY2VzL2ltZy9mb3JtZXMvJytmb3JtZSsnLnN2ZycpKS50b1N0cmluZygpO1xuICAgIHRoaXMuc2VuZChjbGllbnQsJ3JlcG9uc2VGb3JtZScsZmljaGllcix4LHkpO1xuICB9XG59XG4iXX0=