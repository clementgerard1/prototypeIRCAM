'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

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

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// server-side 'player' experience.
var DesignerCheminExperience = function (_Experience) {
  (0, _inherits3.default)(DesignerCheminExperience, _Experience);

  function DesignerCheminExperience(clientType) {
    (0, _classCallCheck3.default)(this, DesignerCheminExperience);

    var _this = (0, _possibleConstructorReturn3.default)(this, (DesignerCheminExperience.__proto__ || (0, _getPrototypeOf2.default)(DesignerCheminExperience)).call(this, clientType));

    _this.sharedConfig = _this.require('shared-config');
    _this.fichierForme = 'fond.svg';
    _this.label = _this.fichierForme.replace('.svg', '');
    _this.indice = 0; // Détermine quel path on est en train d'enregistrer (commence à 0)
    _this.sens = 2;
    return _this;
  }

  // if anything needs to append when the experience starts


  (0, _createClass3.default)(DesignerCheminExperience, [{
    key: 'start',
    value: function start(client) {
      // SVG initialisation
      this.forme = [];
      this.fichierFormeString = _fs2.default.readFileSync(_path2.default.join(process.cwd(), 'ressources/img/imgFond/' + this.fichierForme)).toString();
    }

    // if anything needs to happen when a client enters the performance (*i.e.*
    // starts the experience on the client side), write it in the `enter` method

  }, {
    key: 'enter',
    value: function enter(client) {
      var _this2 = this;

      (0, _get3.default)(DesignerCheminExperience.prototype.__proto__ || (0, _getPrototypeOf2.default)(DesignerCheminExperience.prototype), 'enter', this).call(this, client);
      //send
      this.send(client, 'fond', this.fichierFormeString, this.label, this.indice, this.sens);
      //receive
      this.receive(client, 'phrase', function (data) {
        _this2._savePhrase(data);
      });
    }
  }, {
    key: 'exit',
    value: function exit(client) {
      (0, _get3.default)(DesignerCheminExperience.prototype.__proto__ || (0, _getPrototypeOf2.default)(DesignerCheminExperience.prototype), 'exit', this).call(this, client);
      // ...
    }
  }, {
    key: '_savePhrase',
    value: function _savePhrase(data) {
      var indice = 0;
      var pathh = _path2.default.join(process.cwd(), 'ressources/phrases/chemin/' + data.label + "/");
      if (!_fs2.default.existsSync(pathh)) {
        _fs2.default.mkdirSync(pathh);
      }
      var dossier = _fs2.default.readdirSync(pathh);
      if (dossier[0] != 'null') {
        indice = dossier.length;
      }
      _fs2.default.writeFileSync(pathh + data.label + "-" + indice + ".json", (0, _stringify2.default)(data.phrase), null, 2, 'utf-8');
    }
  }]);
  return DesignerCheminExperience;
}(_server.Experience);

exports.default = DesignerCheminExperience;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRlc2lnbmVyQ2hlbWluRXhwZXJpZW5jZS5qcyJdLCJuYW1lcyI6WyJEZXNpZ25lckNoZW1pbkV4cGVyaWVuY2UiLCJjbGllbnRUeXBlIiwic2hhcmVkQ29uZmlnIiwicmVxdWlyZSIsImZpY2hpZXJGb3JtZSIsImxhYmVsIiwicmVwbGFjZSIsImluZGljZSIsInNlbnMiLCJjbGllbnQiLCJmb3JtZSIsImZpY2hpZXJGb3JtZVN0cmluZyIsInJlYWRGaWxlU3luYyIsImpvaW4iLCJwcm9jZXNzIiwiY3dkIiwidG9TdHJpbmciLCJzZW5kIiwicmVjZWl2ZSIsImRhdGEiLCJfc2F2ZVBocmFzZSIsInBhdGhoIiwiZXhpc3RzU3luYyIsIm1rZGlyU3luYyIsImRvc3NpZXIiLCJyZWFkZGlyU3luYyIsImxlbmd0aCIsIndyaXRlRmlsZVN5bmMiLCJwaHJhc2UiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7QUFDQTs7OztBQUNBOzs7Ozs7QUFFQTtJQUNxQkEsd0I7OztBQUNuQixvQ0FBWUMsVUFBWixFQUF3QjtBQUFBOztBQUFBLDBLQUNoQkEsVUFEZ0I7O0FBRXRCLFVBQUtDLFlBQUwsR0FBb0IsTUFBS0MsT0FBTCxDQUFhLGVBQWIsQ0FBcEI7QUFDQSxVQUFLQyxZQUFMLEdBQW9CLFVBQXBCO0FBQ0EsVUFBS0MsS0FBTCxHQUFhLE1BQUtELFlBQUwsQ0FBa0JFLE9BQWxCLENBQTBCLE1BQTFCLEVBQWlDLEVBQWpDLENBQWI7QUFDQSxVQUFLQyxNQUFMLEdBQWMsQ0FBZCxDQUxzQixDQUtMO0FBQ2pCLFVBQUtDLElBQUwsR0FBWSxDQUFaO0FBTnNCO0FBT3ZCOztBQUVEOzs7OzswQkFDTUMsTSxFQUFRO0FBQ2I7QUFDQyxXQUFLQyxLQUFMLEdBQWEsRUFBYjtBQUNBLFdBQUtDLGtCQUFMLEdBQTBCLGFBQUdDLFlBQUgsQ0FBZ0IsZUFBS0MsSUFBTCxDQUFVQyxRQUFRQyxHQUFSLEVBQVYsRUFBeUIsNEJBQTBCLEtBQUtYLFlBQXhELENBQWhCLEVBQXVGWSxRQUF2RixFQUExQjtBQUNEOztBQUVEO0FBQ0E7Ozs7MEJBQ01QLE0sRUFBUTtBQUFBOztBQUNaLHNLQUFZQSxNQUFaO0FBQ0E7QUFDQSxXQUFLUSxJQUFMLENBQVVSLE1BQVYsRUFBaUIsTUFBakIsRUFBd0IsS0FBS0Usa0JBQTdCLEVBQWdELEtBQUtOLEtBQXJELEVBQTJELEtBQUtFLE1BQWhFLEVBQXVFLEtBQUtDLElBQTVFO0FBQ0E7QUFDQSxXQUFLVSxPQUFMLENBQWFULE1BQWIsRUFBcUIsUUFBckIsRUFBK0IsVUFBQ1UsSUFBRCxFQUFVO0FBQUMsZUFBS0MsV0FBTCxDQUFpQkQsSUFBakI7QUFBdUIsT0FBakU7QUFDRDs7O3lCQUVJVixNLEVBQVE7QUFDWCxxS0FBV0EsTUFBWDtBQUNBO0FBQ0Q7OztnQ0FFV1UsSSxFQUFLO0FBQ2YsVUFBSVosU0FBUyxDQUFiO0FBQ0EsVUFBTWMsUUFBUSxlQUFLUixJQUFMLENBQVVDLFFBQVFDLEdBQVIsRUFBVixFQUF5QiwrQkFBNkJJLEtBQUtkLEtBQWxDLEdBQXdDLEdBQWpFLENBQWQ7QUFDQSxVQUFHLENBQUMsYUFBR2lCLFVBQUgsQ0FBY0QsS0FBZCxDQUFKLEVBQXlCO0FBQ3ZCLHFCQUFHRSxTQUFILENBQWFGLEtBQWI7QUFDRDtBQUNELFVBQU1HLFVBQVUsYUFBR0MsV0FBSCxDQUFlSixLQUFmLENBQWhCO0FBQ0EsVUFBR0csUUFBUSxDQUFSLEtBQVksTUFBZixFQUFzQjtBQUNwQmpCLGlCQUFTaUIsUUFBUUUsTUFBakI7QUFDRDtBQUNELG1CQUFHQyxhQUFILENBQWlCTixRQUFNRixLQUFLZCxLQUFYLEdBQWlCLEdBQWpCLEdBQXFCRSxNQUFyQixHQUE0QixPQUE3QyxFQUFxRCx5QkFBZVksS0FBS1MsTUFBcEIsQ0FBckQsRUFBa0YsSUFBbEYsRUFBd0YsQ0FBeEYsRUFBMkYsT0FBM0Y7QUFDRDs7Ozs7a0JBM0NrQjVCLHdCIiwiZmlsZSI6IkRlc2lnbmVyQ2hlbWluRXhwZXJpZW5jZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEV4cGVyaWVuY2UgfSBmcm9tICdzb3VuZHdvcmtzL3NlcnZlcic7XG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5cbi8vIHNlcnZlci1zaWRlICdwbGF5ZXInIGV4cGVyaWVuY2UuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEZXNpZ25lckNoZW1pbkV4cGVyaWVuY2UgZXh0ZW5kcyBFeHBlcmllbmNlIHtcbiAgY29uc3RydWN0b3IoY2xpZW50VHlwZSkge1xuICAgIHN1cGVyKGNsaWVudFR5cGUpO1xuICAgIHRoaXMuc2hhcmVkQ29uZmlnID0gdGhpcy5yZXF1aXJlKCdzaGFyZWQtY29uZmlnJyk7XG4gICAgdGhpcy5maWNoaWVyRm9ybWUgPSAnZm9uZC5zdmcnO1xuICAgIHRoaXMubGFiZWwgPSB0aGlzLmZpY2hpZXJGb3JtZS5yZXBsYWNlKCcuc3ZnJywnJylcbiAgICB0aGlzLmluZGljZSA9IDA7IC8vIETDqXRlcm1pbmUgcXVlbCBwYXRoIG9uIGVzdCBlbiB0cmFpbiBkJ2VucmVnaXN0cmVyIChjb21tZW5jZSDDoCAwKVxuICAgIHRoaXMuc2VucyA9IDI7XG4gIH1cblxuICAvLyBpZiBhbnl0aGluZyBuZWVkcyB0byBhcHBlbmQgd2hlbiB0aGUgZXhwZXJpZW5jZSBzdGFydHNcbiAgc3RhcnQoY2xpZW50KSB7XG4gICAvLyBTVkcgaW5pdGlhbGlzYXRpb25cbiAgICB0aGlzLmZvcm1lID0gW107XG4gICAgdGhpcy5maWNoaWVyRm9ybWVTdHJpbmcgPSBmcy5yZWFkRmlsZVN5bmMocGF0aC5qb2luKHByb2Nlc3MuY3dkKCksICdyZXNzb3VyY2VzL2ltZy9pbWdGb25kLycrdGhpcy5maWNoaWVyRm9ybWUpKS50b1N0cmluZygpO1xuICB9XG5cbiAgLy8gaWYgYW55dGhpbmcgbmVlZHMgdG8gaGFwcGVuIHdoZW4gYSBjbGllbnQgZW50ZXJzIHRoZSBwZXJmb3JtYW5jZSAoKmkuZS4qXG4gIC8vIHN0YXJ0cyB0aGUgZXhwZXJpZW5jZSBvbiB0aGUgY2xpZW50IHNpZGUpLCB3cml0ZSBpdCBpbiB0aGUgYGVudGVyYCBtZXRob2RcbiAgZW50ZXIoY2xpZW50KSB7XG4gICAgc3VwZXIuZW50ZXIoY2xpZW50KTtcbiAgICAvL3NlbmRcbiAgICB0aGlzLnNlbmQoY2xpZW50LCdmb25kJyx0aGlzLmZpY2hpZXJGb3JtZVN0cmluZyx0aGlzLmxhYmVsLHRoaXMuaW5kaWNlLHRoaXMuc2Vucyk7XG4gICAgLy9yZWNlaXZlXG4gICAgdGhpcy5yZWNlaXZlKGNsaWVudCwgJ3BocmFzZScsIChkYXRhKSA9PiB7dGhpcy5fc2F2ZVBocmFzZShkYXRhKX0pO1xuICB9XG5cbiAgZXhpdChjbGllbnQpIHtcbiAgICBzdXBlci5leGl0KGNsaWVudCk7XG4gICAgLy8gLi4uXG4gIH1cblxuICBfc2F2ZVBocmFzZShkYXRhKXtcbiAgICBsZXQgaW5kaWNlID0gMDtcbiAgICBjb25zdCBwYXRoaCA9IHBhdGguam9pbihwcm9jZXNzLmN3ZCgpLCAncmVzc291cmNlcy9waHJhc2VzL2NoZW1pbi8nK2RhdGEubGFiZWwrXCIvXCIpO1xuICAgIGlmKCFmcy5leGlzdHNTeW5jKHBhdGhoKSl7XG4gICAgICBmcy5ta2RpclN5bmMocGF0aGgpO1xuICAgIH1cbiAgICBjb25zdCBkb3NzaWVyID0gZnMucmVhZGRpclN5bmMocGF0aGgpO1xuICAgIGlmKGRvc3NpZXJbMF0hPSdudWxsJyl7XG4gICAgICBpbmRpY2UgPSBkb3NzaWVyLmxlbmd0aDsgXG4gICAgfVxuICAgIGZzLndyaXRlRmlsZVN5bmMocGF0aGgrZGF0YS5sYWJlbCtcIi1cIitpbmRpY2UrXCIuanNvblwiLEpTT04uc3RyaW5naWZ5KGRhdGEucGhyYXNlKSwgbnVsbCwgMiwgJ3V0Zi04Jyk7XG4gIH1cbn1cbiJdfQ==