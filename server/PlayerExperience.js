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
    _this.nomFichierFond = 'fond.svg';
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
        states: 20,
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
        relativeRegularization: 0.01,
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
        relativeRegularization: 0.01,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlBsYXllckV4cGVyaWVuY2UuanMiXSwibmFtZXMiOlsiUGxheWVyRXhwZXJpZW5jZSIsImNsaWVudFR5cGUiLCJzaGFyZWRDb25maWciLCJyZXF1aXJlIiwibm9tRmljaGllckZvbmQiLCJ4bW0iLCJzdGF0ZXMiLCJyZWxhdGl2ZVJlZ3VsYXJpemF0aW9uIiwidHJhbnNpdGlvbk1vZGUiLCJkb3NzaWVyUGhyYXNlcyIsInJlYWRkaXJTeW5jIiwiam9pbiIsInByb2Nlc3MiLCJjd2QiLCJpIiwibGVuZ3RoIiwicGhyYXNlcyIsImoiLCJwaHJhc2UiLCJKU09OIiwicGFyc2UiLCJyZWFkRmlsZVN5bmMiLCJhZGRQaHJhc2UiLCJlIiwidHJhaW4iLCJtb2RlbCIsImRvc3NpZXJQaHJhc2VzUGF0aDEiLCJ4bW1QYXRoMSIsIm1vZGVsUGF0aDEiLCJkb3NzaWVyUGhyYXNlc1BhdGgyIiwieG1tUGF0aDIiLCJtb2RlbFBhdGgyIiwiZmljaGllckZvbmQiLCJ0b1N0cmluZyIsImNsaWVudCIsInNlbmQiLCJyZWNlaXZlIiwiZm9ybWUiLCJ4IiwieSIsIl9kZW1hbmRlRm9ybWUiLCJmaWNoaWVyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7OztBQUdBO0lBQ3FCQSxnQjs7O0FBQ25CLDRCQUFZQyxVQUFaLEVBQXdCO0FBQUE7O0FBQUEsMEpBQ2hCQSxVQURnQjs7QUFFdEIsVUFBS0MsWUFBTCxHQUFvQixNQUFLQyxPQUFMLENBQWEsZUFBYixDQUFwQjtBQUNBLFVBQUtDLGNBQUwsR0FBc0IsVUFBdEI7QUFIc0I7QUFJdkI7O0FBRUQ7Ozs7OzRCQUNRO0FBQUE7O0FBQ047QUFDQTtBQUNBLFdBQUtDLEdBQUwsR0FBVSxzQkFBUSxNQUFSLEVBQWdCO0FBQ3hCQyxnQkFBUSxFQURnQjtBQUV4QkMsZ0NBQXdCLElBRkE7QUFHeEJDLHdCQUFnQjtBQUhRLE9BQWhCLENBQVY7QUFLQyxV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QUE7O0FBQ1osc0pBQVlBLE1BQVo7QUFDQSxXQUFLQyxJQUFMLENBQVVELE1BQVYsRUFBaUIsTUFBakIsRUFBd0IsS0FBS0YsV0FBN0I7QUFDQSxXQUFLRyxJQUFMLENBQVVELE1BQVYsRUFBaUIsT0FBakIsRUFBeUIsS0FBS1QsS0FBOUIsRUFBb0MsS0FBS0csVUFBekMsRUFBcUQsS0FBS0csVUFBMUQ7QUFDQSxXQUFLSyxPQUFMLENBQWFGLE1BQWIsRUFBb0IsY0FBcEIsRUFBbUMsVUFBQ0csS0FBRCxFQUFPQyxDQUFQLEVBQVNDLENBQVQ7QUFBQSxlQUFhLE9BQUtDLGFBQUwsQ0FBbUJILEtBQW5CLEVBQXlCQyxDQUF6QixFQUEyQkMsQ0FBM0IsRUFBNkJMLE1BQTdCLENBQWI7QUFBQSxPQUFuQztBQUNEOzs7eUJBRUlBLE0sRUFBUTtBQUNYLHFKQUFXQSxNQUFYO0FBQ0Q7OztrQ0FFYUcsSyxFQUFNQyxDLEVBQUVDLEMsRUFBRUwsTSxFQUFPO0FBQzdCLFVBQU1PLFVBQVUsYUFBR3BCLFlBQUgsQ0FBZ0IsZUFBS1YsSUFBTCxDQUFVQyxRQUFRQyxHQUFSLEVBQVYsRUFBeUIsMkJBQXlCd0IsS0FBekIsR0FBK0IsTUFBeEQsQ0FBaEIsRUFBaUZKLFFBQWpGLEVBQWhCO0FBQ0EsV0FBS0UsSUFBTCxDQUFVRCxNQUFWLEVBQWlCLGNBQWpCLEVBQWdDTyxPQUFoQyxFQUF3Q0gsQ0FBeEMsRUFBMENDLENBQTFDO0FBQ0Q7Ozs7O2tCQWhHa0J2QyxnQiIsImZpbGUiOiJQbGF5ZXJFeHBlcmllbmNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRXhwZXJpZW5jZSB9IGZyb20gJ3NvdW5kd29ya3Mvc2VydmVyJztcbmltcG9ydCB4bW0gZnJvbSAneG1tLW5vZGUnO1xuaW1wb3J0IGZzIGZyb20gJ2ZzJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuXG5cbi8vIHNlcnZlci1zaWRlICdwbGF5ZXInIGV4cGVyaWVuY2UuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQbGF5ZXJFeHBlcmllbmNlIGV4dGVuZHMgRXhwZXJpZW5jZSB7XG4gIGNvbnN0cnVjdG9yKGNsaWVudFR5cGUpIHtcbiAgICBzdXBlcihjbGllbnRUeXBlKTtcbiAgICB0aGlzLnNoYXJlZENvbmZpZyA9IHRoaXMucmVxdWlyZSgnc2hhcmVkLWNvbmZpZycpO1xuICAgIHRoaXMubm9tRmljaGllckZvbmQgPSAnZm9uZC5zdmcnO1xuICB9XG5cbiAgLy8gaWYgYW55dGhpbmcgbmVlZHMgdG8gYXBwZW5kIHdoZW4gdGhlIGV4cGVyaWVuY2Ugc3RhcnRzXG4gIHN0YXJ0KCkge1xuICAgIC8qLS0tLS0tLS0tLS0tLS0tLSBYTU0gLSBpbml0aWFsaXNhdGlvbiAtLS0tLS0tLS0tLS0tLSovXG4gICAgLy9Gb3JtZSBsb2NhbFxuICAgIHRoaXMueG1tPSBuZXcgeG1tKCdoaG1tJywge1xuICAgICAgc3RhdGVzOiAyMCxcbiAgICAgIHJlbGF0aXZlUmVndWxhcml6YXRpb246IDAuMDEsXG4gICAgICB0cmFuc2l0aW9uTW9kZTogJ2xlZnRyaWdodCdcbiAgICB9KTtcbiAgICAgY29uc3QgZG9zc2llclBocmFzZXMgPSBmcy5yZWFkZGlyU3luYyhwYXRoLmpvaW4ocHJvY2Vzcy5jd2QoKSwgJ3Jlc3NvdXJjZXMvcGhyYXNlcy9mb3JtZS8nKSk7XG4gICAgZm9yKGxldCBpID0gMCA7IGk8ZG9zc2llclBocmFzZXMubGVuZ3RoOyBpKyspe1xuICAgICAgdHJ5e1xuICAgICAgICBjb25zdCBwaHJhc2VzID0gZnMucmVhZGRpclN5bmMocGF0aC5qb2luKHByb2Nlc3MuY3dkKCksJ3Jlc3NvdXJjZXMvcGhyYXNlcy9mb3JtZS8nK2Rvc3NpZXJQaHJhc2VzW2ldKycvJykpO1xuICAgICAgICBmb3IobGV0IGogPSAwIDsgajxwaHJhc2VzLmxlbmd0aDtqKyspe1xuICAgICAgICAgIHRyeXtcbiAgICAgICAgICAgIGxldCBwaHJhc2UgPSBKU09OLnBhcnNlKGZzLnJlYWRGaWxlU3luYyhwYXRoLmpvaW4ocHJvY2Vzcy5jd2QoKSwncmVzc291cmNlcy9waHJhc2VzL2Zvcm1lLycrZG9zc2llclBocmFzZXNbaV0rJy8nK3BocmFzZXNbal0pKSk7XG4gICAgICAgICAgICB0aGlzLnhtbS5hZGRQaHJhc2UocGhyYXNlKTtcbiAgICAgICAgICB9Y2F0Y2goZSl7fVxuICAgICAgICB9XG4gICAgICB9Y2F0Y2goZSl7fVxuICAgIH1cbiAgICB0aGlzLnhtbS50cmFpbigoZSxtb2RlbCk9PntcbiAgICAgIHRoaXMubW9kZWw9bW9kZWw7XG4gICAgfSk7XG5cbiAgICAvLyBwYXRoIHNlbnMxXG4gICAgY29uc3QgZG9zc2llclBocmFzZXNQYXRoMSA9IGZzLnJlYWRkaXJTeW5jKHBhdGguam9pbihwcm9jZXNzLmN3ZCgpLCAncmVzc291cmNlcy9waHJhc2VzL2NoZW1pbi9zZW5zMS8nKSk7XG4gICAgdGhpcy54bW1QYXRoMSA9IG5ldyB4bW0oJ2hobW0nLCB7XG4gICAgICBzdGF0ZXM6IDUwLFxuICAgICAgcmVsYXRpdmVSZWd1bGFyaXphdGlvbjogMC4wMSxcbiAgICAgIHRyYW5zaXRpb25Nb2RlOiAnZXJnb2RpYydcbiAgICB9KTtcbiAgICBmb3IobGV0IGkgPSAwIDsgaTxkb3NzaWVyUGhyYXNlc1BhdGgxLmxlbmd0aDsgaSsrKXtcbiAgICAgIHRyeXtcbiAgICAgICAgY29uc3QgcGhyYXNlcyA9IGZzLnJlYWRkaXJTeW5jKHBhdGguam9pbihwcm9jZXNzLmN3ZCgpLCdyZXNzb3VyY2VzL3BocmFzZXMvY2hlbWluL3NlbnMxLycrZG9zc2llclBocmFzZXNQYXRoMVtpXSsnLycpKTtcbiAgICAgICAgZm9yKGxldCBqID0gMCA7IGo8cGhyYXNlcy5sZW5ndGg7aisrKXtcbiAgICAgICAgICB0cnl7XG4gICAgICAgICAgICBsZXQgcGhyYXNlID0gSlNPTi5wYXJzZShmcy5yZWFkRmlsZVN5bmMocGF0aC5qb2luKHByb2Nlc3MuY3dkKCksJ3Jlc3NvdXJjZXMvcGhyYXNlcy9jaGVtaW4vc2VuczEvJytkb3NzaWVyUGhyYXNlc1BhdGgxW2ldKycvJytwaHJhc2VzW2pdKSkpO1xuICAgICAgICAgICAgdGhpcy54bW1QYXRoMS5hZGRQaHJhc2UocGhyYXNlKTtcbiAgICAgICAgICB9Y2F0Y2goZSl7fVxuICAgICAgICB9XG4gICAgICB9Y2F0Y2goZSl7fVxuICAgIH1cbiAgICB0aGlzLnhtbVBhdGgxLnRyYWluKChlLG1vZGVsUGF0aDEpPT57XG4gICAgICB0aGlzLm1vZGVsUGF0aDE9bW9kZWxQYXRoMTtcbiAgICB9KTtcblxuICAgIC8vIHBhdGggc2VuczJcbiAgICBjb25zdCBkb3NzaWVyUGhyYXNlc1BhdGgyID0gZnMucmVhZGRpclN5bmMocGF0aC5qb2luKHByb2Nlc3MuY3dkKCksICdyZXNzb3VyY2VzL3BocmFzZXMvY2hlbWluL3NlbnMyJykpO1xuICAgIHRoaXMueG1tUGF0aDIgPSBuZXcgeG1tKCdoaG1tJywge1xuICAgICAgc3RhdGVzOiA1MCxcbiAgICAgIHJlbGF0aXZlUmVndWxhcml6YXRpb246IDAuMDEsXG4gICAgICB0cmFuc2l0aW9uTW9kZTogJ2VyZ29kaWMnXG4gICAgfSk7XG4gICAgZm9yKGxldCBpID0gMCA7IGk8ZG9zc2llclBocmFzZXNQYXRoMi5sZW5ndGg7IGkrKyl7XG4gICAgICB0cnl7XG4gICAgICAgIGNvbnN0IHBocmFzZXMgPSBmcy5yZWFkZGlyU3luYyhwYXRoLmpvaW4ocHJvY2Vzcy5jd2QoKSwncmVzc291cmNlcy9waHJhc2VzL2NoZW1pbi9zZW5zMi8nK2Rvc3NpZXJQaHJhc2VzUGF0aDJbaV0rJy8nKSk7XG4gICAgICAgIGZvcihsZXQgaiA9IDAgOyBqPHBocmFzZXMubGVuZ3RoO2orKyl7XG4gICAgICAgICAgdHJ5e1xuICAgICAgICAgICAgbGV0IHBocmFzZSA9IEpTT04ucGFyc2UoZnMucmVhZEZpbGVTeW5jKHBhdGguam9pbihwcm9jZXNzLmN3ZCgpLCdyZXNzb3VyY2VzL3BocmFzZXMvY2hlbWluL3NlbnMyLycrZG9zc2llclBocmFzZXNQYXRoMltpXSsnLycrcGhyYXNlc1tqXSkpKTtcbiAgICAgICAgICAgIHRoaXMueG1tUGF0aDIuYWRkUGhyYXNlKHBocmFzZSk7XG4gICAgICAgICAgfWNhdGNoKGUpe31cbiAgICAgICAgfVxuICAgICAgfWNhdGNoKGUpe31cbiAgICB9XG4gICAgdGhpcy54bW1QYXRoMi50cmFpbigoZSxtb2RlbFBhdGgyKT0+e1xuICAgICAgdGhpcy5tb2RlbFBhdGgyPW1vZGVsUGF0aDI7XG4gICAgfSk7XG5cbiAgICAvLyBTVkcgaW5pdGlhbGlzYXRpb25cbiAgICB0aGlzLmZpY2hpZXJGb25kID0gZnMucmVhZEZpbGVTeW5jKHBhdGguam9pbihwcm9jZXNzLmN3ZCgpLCAncmVzc291cmNlcy9pbWcvaW1nRm9uZC8nK3RoaXMubm9tRmljaGllckZvbmQpKS50b1N0cmluZygpO1xuICB9XG5cbiAgLy8gaWYgYW55dGhpbmcgbmVlZHMgdG8gaGFwcGVuIHdoZW4gYSBjbGllbnQgZW50ZXJzIHRoZSBwZXJmb3JtYW5jZSAoKmkuZS4qXG4gIC8vIHN0YXJ0cyB0aGUgZXhwZXJpZW5jZSBvbiB0aGUgY2xpZW50IHNpZGUpLCB3cml0ZSBpdCBpbiB0aGUgYGVudGVyYCBtZXRob2RcbiAgZW50ZXIoY2xpZW50KSB7XG4gICAgc3VwZXIuZW50ZXIoY2xpZW50KTtcbiAgICB0aGlzLnNlbmQoY2xpZW50LCdmb25kJyx0aGlzLmZpY2hpZXJGb25kKTtcbiAgICB0aGlzLnNlbmQoY2xpZW50LCdtb2RlbCcsdGhpcy5tb2RlbCx0aGlzLm1vZGVsUGF0aDEsIHRoaXMubW9kZWxQYXRoMik7XG4gICAgdGhpcy5yZWNlaXZlKGNsaWVudCwnZGVtYW5kZUZvcm1lJywoZm9ybWUseCx5KT0+dGhpcy5fZGVtYW5kZUZvcm1lKGZvcm1lLHgseSxjbGllbnQpKTtcbiAgfVxuXG4gIGV4aXQoY2xpZW50KSB7XG4gICAgc3VwZXIuZXhpdChjbGllbnQpO1xuICB9XG5cbiAgX2RlbWFuZGVGb3JtZShmb3JtZSx4LHksY2xpZW50KXtcbiAgICBjb25zdCBmaWNoaWVyID0gZnMucmVhZEZpbGVTeW5jKHBhdGguam9pbihwcm9jZXNzLmN3ZCgpLCAncmVzc291cmNlcy9pbWcvZm9ybWVzLycrZm9ybWUrJy5zdmcnKSkudG9TdHJpbmcoKTtcbiAgICB0aGlzLnNlbmQoY2xpZW50LCdyZXBvbnNlRm9ybWUnLGZpY2hpZXIseCx5KTtcbiAgfVxufVxuIl19