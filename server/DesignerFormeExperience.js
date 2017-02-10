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
var DesignerFormeExperience = function (_Experience) {
  (0, _inherits3.default)(DesignerFormeExperience, _Experience);

  function DesignerFormeExperience(clientType) {
    (0, _classCallCheck3.default)(this, DesignerFormeExperience);

    var _this = (0, _possibleConstructorReturn3.default)(this, (DesignerFormeExperience.__proto__ || (0, _getPrototypeOf2.default)(DesignerFormeExperience)).call(this, clientType));

    _this.sharedConfig = _this.require('shared-config');
    _this.fichierForme = 'forme2.svg';
    _this.label = _this.fichierForme.replace('.svg', '');
    return _this;
  }

  // if anything needs to append when the experience starts


  (0, _createClass3.default)(DesignerFormeExperience, [{
    key: 'start',
    value: function start(client) {
      // SVG initialisation
      this.forme = [];
      this.fichierFormeString = _fs2.default.readFileSync(_path2.default.join(process.cwd(), 'ressources/img/formes/' + this.fichierForme)).toString();
    }

    // if anything needs to happen when a client enters the performance (*i.e.*
    // starts the experience on the client side), write it in the `enter` method

  }, {
    key: 'enter',
    value: function enter(client) {
      var _this2 = this;

      (0, _get3.default)(DesignerFormeExperience.prototype.__proto__ || (0, _getPrototypeOf2.default)(DesignerFormeExperience.prototype), 'enter', this).call(this, client);
      //send
      this.send(client, 'fond', this.fichierFormeString, this.label);
      //receive
      this.receive(client, 'phrase', function (data) {
        _this2._savePhrase(data);
      });
    }
  }, {
    key: 'exit',
    value: function exit(client) {
      (0, _get3.default)(DesignerFormeExperience.prototype.__proto__ || (0, _getPrototypeOf2.default)(DesignerFormeExperience.prototype), 'exit', this).call(this, client);
      // ...
    }
  }, {
    key: '_savePhrase',
    value: function _savePhrase(data) {
      var indice = 0;
      var pathh = _path2.default.join(process.cwd(), 'ressources/phrases/forme/' + data.label + "/");
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
  return DesignerFormeExperience;
}(_server.Experience);

exports.default = DesignerFormeExperience;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRlc2lnbmVyRm9ybWVFeHBlcmllbmNlLmpzIl0sIm5hbWVzIjpbIkRlc2lnbmVyRm9ybWVFeHBlcmllbmNlIiwiY2xpZW50VHlwZSIsInNoYXJlZENvbmZpZyIsInJlcXVpcmUiLCJmaWNoaWVyRm9ybWUiLCJsYWJlbCIsInJlcGxhY2UiLCJjbGllbnQiLCJmb3JtZSIsImZpY2hpZXJGb3JtZVN0cmluZyIsInJlYWRGaWxlU3luYyIsImpvaW4iLCJwcm9jZXNzIiwiY3dkIiwidG9TdHJpbmciLCJzZW5kIiwicmVjZWl2ZSIsImRhdGEiLCJfc2F2ZVBocmFzZSIsImluZGljZSIsInBhdGhoIiwiZXhpc3RzU3luYyIsIm1rZGlyU3luYyIsImRvc3NpZXIiLCJyZWFkZGlyU3luYyIsImxlbmd0aCIsIndyaXRlRmlsZVN5bmMiLCJwaHJhc2UiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7QUFDQTs7OztBQUNBOzs7Ozs7QUFFQTtJQUNxQkEsdUI7OztBQUNuQixtQ0FBWUMsVUFBWixFQUF3QjtBQUFBOztBQUFBLHdLQUNoQkEsVUFEZ0I7O0FBRXRCLFVBQUtDLFlBQUwsR0FBb0IsTUFBS0MsT0FBTCxDQUFhLGVBQWIsQ0FBcEI7QUFDQSxVQUFLQyxZQUFMLEdBQW9CLFlBQXBCO0FBQ0EsVUFBS0MsS0FBTCxHQUFhLE1BQUtELFlBQUwsQ0FBa0JFLE9BQWxCLENBQTBCLE1BQTFCLEVBQWlDLEVBQWpDLENBQWI7QUFKc0I7QUFLdkI7O0FBRUQ7Ozs7OzBCQUNNQyxNLEVBQVE7QUFDYjtBQUNDLFdBQUtDLEtBQUwsR0FBYSxFQUFiO0FBQ0EsV0FBS0Msa0JBQUwsR0FBMEIsYUFBR0MsWUFBSCxDQUFnQixlQUFLQyxJQUFMLENBQVVDLFFBQVFDLEdBQVIsRUFBVixFQUF5QiwyQkFBeUIsS0FBS1QsWUFBdkQsQ0FBaEIsRUFBc0ZVLFFBQXRGLEVBQTFCO0FBQ0Q7O0FBRUQ7QUFDQTs7OzswQkFDTVAsTSxFQUFRO0FBQUE7O0FBQ1osb0tBQVlBLE1BQVo7QUFDQTtBQUNBLFdBQUtRLElBQUwsQ0FBVVIsTUFBVixFQUFpQixNQUFqQixFQUF3QixLQUFLRSxrQkFBN0IsRUFBZ0QsS0FBS0osS0FBckQ7QUFDQTtBQUNBLFdBQUtXLE9BQUwsQ0FBYVQsTUFBYixFQUFxQixRQUFyQixFQUErQixVQUFDVSxJQUFELEVBQVU7QUFBQyxlQUFLQyxXQUFMLENBQWlCRCxJQUFqQjtBQUF1QixPQUFqRTtBQUNEOzs7eUJBRUlWLE0sRUFBUTtBQUNYLG1LQUFXQSxNQUFYO0FBQ0E7QUFDRDs7O2dDQUVXVSxJLEVBQUs7QUFDZixVQUFJRSxTQUFTLENBQWI7QUFDQSxVQUFNQyxRQUFRLGVBQUtULElBQUwsQ0FBVUMsUUFBUUMsR0FBUixFQUFWLEVBQXlCLDhCQUE0QkksS0FBS1osS0FBakMsR0FBdUMsR0FBaEUsQ0FBZDtBQUNBLFVBQUcsQ0FBQyxhQUFHZ0IsVUFBSCxDQUFjRCxLQUFkLENBQUosRUFBeUI7QUFDdkIscUJBQUdFLFNBQUgsQ0FBYUYsS0FBYjtBQUNEO0FBQ0QsVUFBTUcsVUFBVSxhQUFHQyxXQUFILENBQWVKLEtBQWYsQ0FBaEI7QUFDQSxVQUFHRyxRQUFRLENBQVIsS0FBWSxNQUFmLEVBQXNCO0FBQ3BCSixpQkFBU0ksUUFBUUUsTUFBakI7QUFDRDtBQUNELG1CQUFHQyxhQUFILENBQWlCTixRQUFNSCxLQUFLWixLQUFYLEdBQWlCLEdBQWpCLEdBQXFCYyxNQUFyQixHQUE0QixPQUE3QyxFQUFxRCx5QkFBZUYsS0FBS1UsTUFBcEIsQ0FBckQsRUFBa0YsSUFBbEYsRUFBd0YsQ0FBeEYsRUFBMkYsT0FBM0Y7QUFDRDs7Ozs7a0JBekNrQjNCLHVCIiwiZmlsZSI6IkRlc2lnbmVyRm9ybWVFeHBlcmllbmNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRXhwZXJpZW5jZSB9IGZyb20gJ3NvdW5kd29ya3Mvc2VydmVyJztcbmltcG9ydCBmcyBmcm9tICdmcyc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcblxuLy8gc2VydmVyLXNpZGUgJ3BsYXllcicgZXhwZXJpZW5jZS5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERlc2lnbmVyRm9ybWVFeHBlcmllbmNlIGV4dGVuZHMgRXhwZXJpZW5jZSB7XG4gIGNvbnN0cnVjdG9yKGNsaWVudFR5cGUpIHtcbiAgICBzdXBlcihjbGllbnRUeXBlKTtcbiAgICB0aGlzLnNoYXJlZENvbmZpZyA9IHRoaXMucmVxdWlyZSgnc2hhcmVkLWNvbmZpZycpO1xuICAgIHRoaXMuZmljaGllckZvcm1lID0gJ2Zvcm1lMi5zdmcnO1xuICAgIHRoaXMubGFiZWwgPSB0aGlzLmZpY2hpZXJGb3JtZS5yZXBsYWNlKCcuc3ZnJywnJyk7XG4gIH1cblxuICAvLyBpZiBhbnl0aGluZyBuZWVkcyB0byBhcHBlbmQgd2hlbiB0aGUgZXhwZXJpZW5jZSBzdGFydHNcbiAgc3RhcnQoY2xpZW50KSB7XG4gICAvLyBTVkcgaW5pdGlhbGlzYXRpb25cbiAgICB0aGlzLmZvcm1lID0gW107XG4gICAgdGhpcy5maWNoaWVyRm9ybWVTdHJpbmcgPSBmcy5yZWFkRmlsZVN5bmMocGF0aC5qb2luKHByb2Nlc3MuY3dkKCksICdyZXNzb3VyY2VzL2ltZy9mb3JtZXMvJyt0aGlzLmZpY2hpZXJGb3JtZSkpLnRvU3RyaW5nKCk7XG4gIH1cblxuICAvLyBpZiBhbnl0aGluZyBuZWVkcyB0byBoYXBwZW4gd2hlbiBhIGNsaWVudCBlbnRlcnMgdGhlIHBlcmZvcm1hbmNlICgqaS5lLipcbiAgLy8gc3RhcnRzIHRoZSBleHBlcmllbmNlIG9uIHRoZSBjbGllbnQgc2lkZSksIHdyaXRlIGl0IGluIHRoZSBgZW50ZXJgIG1ldGhvZFxuICBlbnRlcihjbGllbnQpIHtcbiAgICBzdXBlci5lbnRlcihjbGllbnQpO1xuICAgIC8vc2VuZFxuICAgIHRoaXMuc2VuZChjbGllbnQsJ2ZvbmQnLHRoaXMuZmljaGllckZvcm1lU3RyaW5nLHRoaXMubGFiZWwpO1xuICAgIC8vcmVjZWl2ZVxuICAgIHRoaXMucmVjZWl2ZShjbGllbnQsICdwaHJhc2UnLCAoZGF0YSkgPT4ge3RoaXMuX3NhdmVQaHJhc2UoZGF0YSl9KTtcbiAgfVxuXG4gIGV4aXQoY2xpZW50KSB7XG4gICAgc3VwZXIuZXhpdChjbGllbnQpO1xuICAgIC8vIC4uLlxuICB9XG5cbiAgX3NhdmVQaHJhc2UoZGF0YSl7XG4gICAgbGV0IGluZGljZSA9IDA7XG4gICAgY29uc3QgcGF0aGggPSBwYXRoLmpvaW4ocHJvY2Vzcy5jd2QoKSwgJ3Jlc3NvdXJjZXMvcGhyYXNlcy9mb3JtZS8nK2RhdGEubGFiZWwrXCIvXCIpO1xuICAgIGlmKCFmcy5leGlzdHNTeW5jKHBhdGhoKSl7XG4gICAgICBmcy5ta2RpclN5bmMocGF0aGgpO1xuICAgIH1cbiAgICBjb25zdCBkb3NzaWVyID0gZnMucmVhZGRpclN5bmMocGF0aGgpO1xuICAgIGlmKGRvc3NpZXJbMF0hPSdudWxsJyl7XG4gICAgICBpbmRpY2UgPSBkb3NzaWVyLmxlbmd0aDsgXG4gICAgfVxuICAgIGZzLndyaXRlRmlsZVN5bmMocGF0aGgrZGF0YS5sYWJlbCtcIi1cIitpbmRpY2UrXCIuanNvblwiLEpTT04uc3RyaW5naWZ5KGRhdGEucGhyYXNlKSwgbnVsbCwgMiwgJ3V0Zi04Jyk7XG4gIH1cbn1cbiJdfQ==