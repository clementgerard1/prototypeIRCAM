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
    _this.fichierForme = 'prototypeFond.svg';
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
      var pathh = void 0;
      if (this.sens == 1) {
        pathh = _path2.default.join(process.cwd(), 'ressources/phrases/chemin/sens1/' + data.label + "/");
      } else if (this.sens == 2) {
        pathh = _path2.default.join(process.cwd(), 'ressources/phrases/chemin/sens2/' + data.label + "/");
      }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRlc2lnbmVyQ2hlbWluRXhwZXJpZW5jZS5qcyJdLCJuYW1lcyI6WyJEZXNpZ25lckNoZW1pbkV4cGVyaWVuY2UiLCJjbGllbnRUeXBlIiwic2hhcmVkQ29uZmlnIiwicmVxdWlyZSIsImZpY2hpZXJGb3JtZSIsImxhYmVsIiwicmVwbGFjZSIsImluZGljZSIsInNlbnMiLCJjbGllbnQiLCJmb3JtZSIsImZpY2hpZXJGb3JtZVN0cmluZyIsInJlYWRGaWxlU3luYyIsImpvaW4iLCJwcm9jZXNzIiwiY3dkIiwidG9TdHJpbmciLCJzZW5kIiwicmVjZWl2ZSIsImRhdGEiLCJfc2F2ZVBocmFzZSIsInBhdGhoIiwiZXhpc3RzU3luYyIsIm1rZGlyU3luYyIsImRvc3NpZXIiLCJyZWFkZGlyU3luYyIsImxlbmd0aCIsIndyaXRlRmlsZVN5bmMiLCJwaHJhc2UiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7QUFDQTs7OztBQUNBOzs7Ozs7QUFFQTtJQUNxQkEsd0I7OztBQUNuQixvQ0FBWUMsVUFBWixFQUF3QjtBQUFBOztBQUFBLDBLQUNoQkEsVUFEZ0I7O0FBRXRCLFVBQUtDLFlBQUwsR0FBb0IsTUFBS0MsT0FBTCxDQUFhLGVBQWIsQ0FBcEI7QUFDQSxVQUFLQyxZQUFMLEdBQW9CLG1CQUFwQjtBQUNBLFVBQUtDLEtBQUwsR0FBYSxNQUFLRCxZQUFMLENBQWtCRSxPQUFsQixDQUEwQixNQUExQixFQUFpQyxFQUFqQyxDQUFiO0FBQ0EsVUFBS0MsTUFBTCxHQUFjLENBQWQsQ0FMc0IsQ0FLTDtBQUNqQixVQUFLQyxJQUFMLEdBQVksQ0FBWjtBQU5zQjtBQU92Qjs7QUFFRDs7Ozs7MEJBQ01DLE0sRUFBUTtBQUNiO0FBQ0MsV0FBS0MsS0FBTCxHQUFhLEVBQWI7QUFDQSxXQUFLQyxrQkFBTCxHQUEwQixhQUFHQyxZQUFILENBQWdCLGVBQUtDLElBQUwsQ0FBVUMsUUFBUUMsR0FBUixFQUFWLEVBQXlCLDRCQUEwQixLQUFLWCxZQUF4RCxDQUFoQixFQUF1RlksUUFBdkYsRUFBMUI7QUFDRDs7QUFFRDtBQUNBOzs7OzBCQUNNUCxNLEVBQVE7QUFBQTs7QUFDWixzS0FBWUEsTUFBWjtBQUNBO0FBQ0EsV0FBS1EsSUFBTCxDQUFVUixNQUFWLEVBQWlCLE1BQWpCLEVBQXdCLEtBQUtFLGtCQUE3QixFQUFnRCxLQUFLTixLQUFyRCxFQUEyRCxLQUFLRSxNQUFoRSxFQUF1RSxLQUFLQyxJQUE1RTtBQUNBO0FBQ0EsV0FBS1UsT0FBTCxDQUFhVCxNQUFiLEVBQXFCLFFBQXJCLEVBQStCLFVBQUNVLElBQUQsRUFBVTtBQUFDLGVBQUtDLFdBQUwsQ0FBaUJELElBQWpCO0FBQXVCLE9BQWpFO0FBQ0Q7Ozt5QkFFSVYsTSxFQUFRO0FBQ1gscUtBQVdBLE1BQVg7QUFDQTtBQUNEOzs7Z0NBRVdVLEksRUFBSztBQUNmLFVBQUlaLFNBQVMsQ0FBYjtBQUNBLFVBQUljLGNBQUo7QUFDQSxVQUFHLEtBQUtiLElBQUwsSUFBVyxDQUFkLEVBQWdCO0FBQ2RhLGdCQUFRLGVBQUtSLElBQUwsQ0FBVUMsUUFBUUMsR0FBUixFQUFWLEVBQXlCLHFDQUFtQ0ksS0FBS2QsS0FBeEMsR0FBOEMsR0FBdkUsQ0FBUjtBQUNELE9BRkQsTUFFTSxJQUFHLEtBQUtHLElBQUwsSUFBVyxDQUFkLEVBQWdCO0FBQ3BCYSxnQkFBUSxlQUFLUixJQUFMLENBQVVDLFFBQVFDLEdBQVIsRUFBVixFQUF5QixxQ0FBbUNJLEtBQUtkLEtBQXhDLEdBQThDLEdBQXZFLENBQVI7QUFDRDtBQUNELFVBQUcsQ0FBQyxhQUFHaUIsVUFBSCxDQUFjRCxLQUFkLENBQUosRUFBeUI7QUFDdkIscUJBQUdFLFNBQUgsQ0FBYUYsS0FBYjtBQUNEO0FBQ0QsVUFBTUcsVUFBVSxhQUFHQyxXQUFILENBQWVKLEtBQWYsQ0FBaEI7QUFDQSxVQUFHRyxRQUFRLENBQVIsS0FBWSxNQUFmLEVBQXNCO0FBQ3BCakIsaUJBQVNpQixRQUFRRSxNQUFqQjtBQUNEO0FBQ0QsbUJBQUdDLGFBQUgsQ0FBaUJOLFFBQU1GLEtBQUtkLEtBQVgsR0FBaUIsR0FBakIsR0FBcUJFLE1BQXJCLEdBQTRCLE9BQTdDLEVBQXFELHlCQUFlWSxLQUFLUyxNQUFwQixDQUFyRCxFQUFrRixJQUFsRixFQUF3RixDQUF4RixFQUEyRixPQUEzRjtBQUNEOzs7OztrQkFoRGtCNUIsd0IiLCJmaWxlIjoiRGVzaWduZXJDaGVtaW5FeHBlcmllbmNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRXhwZXJpZW5jZSB9IGZyb20gJ3NvdW5kd29ya3Mvc2VydmVyJztcbmltcG9ydCBmcyBmcm9tICdmcyc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcblxuLy8gc2VydmVyLXNpZGUgJ3BsYXllcicgZXhwZXJpZW5jZS5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERlc2lnbmVyQ2hlbWluRXhwZXJpZW5jZSBleHRlbmRzIEV4cGVyaWVuY2Uge1xuICBjb25zdHJ1Y3RvcihjbGllbnRUeXBlKSB7XG4gICAgc3VwZXIoY2xpZW50VHlwZSk7XG4gICAgdGhpcy5zaGFyZWRDb25maWcgPSB0aGlzLnJlcXVpcmUoJ3NoYXJlZC1jb25maWcnKTtcbiAgICB0aGlzLmZpY2hpZXJGb3JtZSA9ICdwcm90b3R5cGVGb25kLnN2Zyc7XG4gICAgdGhpcy5sYWJlbCA9IHRoaXMuZmljaGllckZvcm1lLnJlcGxhY2UoJy5zdmcnLCcnKVxuICAgIHRoaXMuaW5kaWNlID0gMDsgLy8gRMOpdGVybWluZSBxdWVsIHBhdGggb24gZXN0IGVuIHRyYWluIGQnZW5yZWdpc3RyZXIgKGNvbW1lbmNlIMOgIDApXG4gICAgdGhpcy5zZW5zID0gMjtcbiAgfVxuXG4gIC8vIGlmIGFueXRoaW5nIG5lZWRzIHRvIGFwcGVuZCB3aGVuIHRoZSBleHBlcmllbmNlIHN0YXJ0c1xuICBzdGFydChjbGllbnQpIHtcbiAgIC8vIFNWRyBpbml0aWFsaXNhdGlvblxuICAgIHRoaXMuZm9ybWUgPSBbXTtcbiAgICB0aGlzLmZpY2hpZXJGb3JtZVN0cmluZyA9IGZzLnJlYWRGaWxlU3luYyhwYXRoLmpvaW4ocHJvY2Vzcy5jd2QoKSwgJ3Jlc3NvdXJjZXMvaW1nL2ltZ0ZvbmQvJyt0aGlzLmZpY2hpZXJGb3JtZSkpLnRvU3RyaW5nKCk7XG4gIH1cblxuICAvLyBpZiBhbnl0aGluZyBuZWVkcyB0byBoYXBwZW4gd2hlbiBhIGNsaWVudCBlbnRlcnMgdGhlIHBlcmZvcm1hbmNlICgqaS5lLipcbiAgLy8gc3RhcnRzIHRoZSBleHBlcmllbmNlIG9uIHRoZSBjbGllbnQgc2lkZSksIHdyaXRlIGl0IGluIHRoZSBgZW50ZXJgIG1ldGhvZFxuICBlbnRlcihjbGllbnQpIHtcbiAgICBzdXBlci5lbnRlcihjbGllbnQpO1xuICAgIC8vc2VuZFxuICAgIHRoaXMuc2VuZChjbGllbnQsJ2ZvbmQnLHRoaXMuZmljaGllckZvcm1lU3RyaW5nLHRoaXMubGFiZWwsdGhpcy5pbmRpY2UsdGhpcy5zZW5zKTtcbiAgICAvL3JlY2VpdmVcbiAgICB0aGlzLnJlY2VpdmUoY2xpZW50LCAncGhyYXNlJywgKGRhdGEpID0+IHt0aGlzLl9zYXZlUGhyYXNlKGRhdGEpfSk7XG4gIH1cblxuICBleGl0KGNsaWVudCkge1xuICAgIHN1cGVyLmV4aXQoY2xpZW50KTtcbiAgICAvLyAuLi5cbiAgfVxuXG4gIF9zYXZlUGhyYXNlKGRhdGEpe1xuICAgIGxldCBpbmRpY2UgPSAwO1xuICAgIGxldCBwYXRoaDtcbiAgICBpZih0aGlzLnNlbnM9PTEpe1xuICAgICAgcGF0aGggPSBwYXRoLmpvaW4ocHJvY2Vzcy5jd2QoKSwgJ3Jlc3NvdXJjZXMvcGhyYXNlcy9jaGVtaW4vc2VuczEvJytkYXRhLmxhYmVsK1wiL1wiKTtcbiAgICB9ZWxzZSBpZih0aGlzLnNlbnM9PTIpe1xuICAgICAgcGF0aGggPSBwYXRoLmpvaW4ocHJvY2Vzcy5jd2QoKSwgJ3Jlc3NvdXJjZXMvcGhyYXNlcy9jaGVtaW4vc2VuczIvJytkYXRhLmxhYmVsK1wiL1wiKTtcbiAgICB9XG4gICAgaWYoIWZzLmV4aXN0c1N5bmMocGF0aGgpKXtcbiAgICAgIGZzLm1rZGlyU3luYyhwYXRoaCk7XG4gICAgfVxuICAgIGNvbnN0IGRvc3NpZXIgPSBmcy5yZWFkZGlyU3luYyhwYXRoaCk7XG4gICAgaWYoZG9zc2llclswXSE9J251bGwnKXtcbiAgICAgIGluZGljZSA9IGRvc3NpZXIubGVuZ3RoOyBcbiAgICB9XG4gICAgZnMud3JpdGVGaWxlU3luYyhwYXRoaCtkYXRhLmxhYmVsK1wiLVwiK2luZGljZStcIi5qc29uXCIsSlNPTi5zdHJpbmdpZnkoZGF0YS5waHJhc2UpLCBudWxsLCAyLCAndXRmLTgnKTtcbiAgfVxufVxuIl19