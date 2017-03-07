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

var _path2 = require('path');

var _path3 = _interopRequireDefault(_path2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// server-side 'player' experience.
var ShapesDesignerExperience = function (_Experience) {
  (0, _inherits3.default)(ShapesDesignerExperience, _Experience);

  function ShapesDesignerExperience(clientType) {
    (0, _classCallCheck3.default)(this, ShapesDesignerExperience);

    var _this = (0, _possibleConstructorReturn3.default)(this, (ShapesDesignerExperience.__proto__ || (0, _getPrototypeOf2.default)(ShapesDesignerExperience)).call(this, clientType));

    _this.sharedConfig = _this.require('shared-config');

    // File actually in training in the experience
    _this.shapeFiles = 'shape1.svg';
    _this.label = _this.shapeFiles.replace('.svg', '');

    return _this;
  }

  // if anything needs to append when the experience starts


  (0, _createClass3.default)(ShapesDesignerExperience, [{
    key: 'start',
    value: function start(client) {

      // SVG init
      this.shapeFilesString = _fs2.default.readFileSync(_path3.default.join(process.cwd(), 'ressources/img/shapes/' + this.shapeFiles)).toString();
    }

    // if anything needs to happen when a client enters the performance (*i.e.*
    // starts the experience on the client side), write it in the `enter` method

  }, {
    key: 'enter',
    value: function enter(client) {
      var _this2 = this;

      (0, _get3.default)(ShapesDesignerExperience.prototype.__proto__ || (0, _getPrototypeOf2.default)(ShapesDesignerExperience.prototype), 'enter', this).call(this, client);

      //send
      this.send(client, 'shape', this.shapeFilesString, this.label);

      //receive
      this.receive(client, 'phrase', function (data) {
        return _this2._savePhrase(data);
      });
    }
  }, {
    key: 'exit',
    value: function exit(client) {
      (0, _get3.default)(ShapesDesignerExperience.prototype.__proto__ || (0, _getPrototypeOf2.default)(ShapesDesignerExperience.prototype), 'exit', this).call(this, client);
      // ...
    }

    /* Save the phrase received in the HD*/

  }, {
    key: '_savePhrase',
    value: function _savePhrase(data) {
      console.log(data);
      var id = 0;
      var _path = _path3.default.join(process.cwd(), 'ressources/phrases/shapes/' + data.label + "/");
      if (!_fs2.default.existsSync(_path)) _fs2.default.mkdirSync(_path);
      var folder = _fs2.default.readdirSync(_path)[0];
      if (folder != 'null') {
        id = folder.length;
      }
      console.log(folder, id);
      _fs2.default.writeFileSync(_path + data.label + "-" + id + ".json", (0, _stringify2.default)(data.phrase), null, 2, 'utf-8');
    }
  }]);
  return ShapesDesignerExperience;
}(_server.Experience);

exports.default = ShapesDesignerExperience;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlNoYXBlRGVzaWduZXJFeHBlcmllbmNlLmpzIl0sIm5hbWVzIjpbIlNoYXBlc0Rlc2lnbmVyRXhwZXJpZW5jZSIsImNsaWVudFR5cGUiLCJzaGFyZWRDb25maWciLCJyZXF1aXJlIiwic2hhcGVGaWxlcyIsImxhYmVsIiwicmVwbGFjZSIsImNsaWVudCIsInNoYXBlRmlsZXNTdHJpbmciLCJyZWFkRmlsZVN5bmMiLCJqb2luIiwicHJvY2VzcyIsImN3ZCIsInRvU3RyaW5nIiwic2VuZCIsInJlY2VpdmUiLCJkYXRhIiwiX3NhdmVQaHJhc2UiLCJjb25zb2xlIiwibG9nIiwiaWQiLCJfcGF0aCIsImV4aXN0c1N5bmMiLCJta2RpclN5bmMiLCJmb2xkZXIiLCJyZWFkZGlyU3luYyIsImxlbmd0aCIsIndyaXRlRmlsZVN5bmMiLCJwaHJhc2UiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7QUFDQTs7OztBQUNBOzs7Ozs7QUFFQTtJQUNxQkEsd0I7OztBQUNuQixvQ0FBWUMsVUFBWixFQUF3QjtBQUFBOztBQUFBLDBLQUNoQkEsVUFEZ0I7O0FBRXRCLFVBQUtDLFlBQUwsR0FBb0IsTUFBS0MsT0FBTCxDQUFhLGVBQWIsQ0FBcEI7O0FBRUE7QUFDQSxVQUFLQyxVQUFMLEdBQWtCLFlBQWxCO0FBQ0EsVUFBS0MsS0FBTCxHQUFhLE1BQUtELFVBQUwsQ0FBZ0JFLE9BQWhCLENBQXdCLE1BQXhCLEVBQWdDLEVBQWhDLENBQWI7O0FBTnNCO0FBUXZCOztBQUVEOzs7OzswQkFDTUMsTSxFQUFROztBQUVaO0FBQ0EsV0FBS0MsZ0JBQUwsR0FBd0IsYUFBR0MsWUFBSCxDQUFpQixlQUFLQyxJQUFMLENBQVVDLFFBQVFDLEdBQVIsRUFBVixFQUF5QiwyQkFBMkIsS0FBS1IsVUFBekQsQ0FBakIsRUFBd0ZTLFFBQXhGLEVBQXhCO0FBRUQ7O0FBRUQ7QUFDQTs7OzswQkFDTU4sTSxFQUFRO0FBQUE7O0FBQ1osc0tBQVlBLE1BQVo7O0FBRUE7QUFDQSxXQUFLTyxJQUFMLENBQVVQLE1BQVYsRUFBa0IsT0FBbEIsRUFBMkIsS0FBS0MsZ0JBQWhDLEVBQWtELEtBQUtILEtBQXZEOztBQUVBO0FBQ0EsV0FBS1UsT0FBTCxDQUFjUixNQUFkLEVBQXNCLFFBQXRCLEVBQWdDLFVBQUNTLElBQUQ7QUFBQSxlQUFVLE9BQUtDLFdBQUwsQ0FBaUJELElBQWpCLENBQVY7QUFBQSxPQUFoQztBQUNEOzs7eUJBRUlULE0sRUFBUTtBQUNYLHFLQUFXQSxNQUFYO0FBQ0E7QUFDRDs7QUFFRDs7OztnQ0FDWVMsSSxFQUFLO0FBQ2ZFLGNBQVFDLEdBQVIsQ0FBWUgsSUFBWjtBQUNBLFVBQUlJLEtBQUssQ0FBVDtBQUNBLFVBQU1DLFFBQVEsZUFBS1gsSUFBTCxDQUFVQyxRQUFRQyxHQUFSLEVBQVYsRUFBeUIsK0JBQStCSSxLQUFLWCxLQUFwQyxHQUE0QyxHQUFyRSxDQUFkO0FBQ0EsVUFBRyxDQUFDLGFBQUdpQixVQUFILENBQWNELEtBQWQsQ0FBSixFQUEwQixhQUFHRSxTQUFILENBQWFGLEtBQWI7QUFDMUIsVUFBTUcsU0FBUyxhQUFHQyxXQUFILENBQWVKLEtBQWYsRUFBc0IsQ0FBdEIsQ0FBZjtBQUNBLFVBQUdHLFVBQVUsTUFBYixFQUFvQjtBQUNsQkosYUFBS0ksT0FBT0UsTUFBWjtBQUNEO0FBQ0RSLGNBQVFDLEdBQVIsQ0FBWUssTUFBWixFQUFvQkosRUFBcEI7QUFDQSxtQkFBR08sYUFBSCxDQUFpQk4sUUFBUUwsS0FBS1gsS0FBYixHQUFxQixHQUFyQixHQUEyQmUsRUFBM0IsR0FBZ0MsT0FBakQsRUFBMEQseUJBQWVKLEtBQUtZLE1BQXBCLENBQTFELEVBQXVGLElBQXZGLEVBQTZGLENBQTdGLEVBQWdHLE9BQWhHO0FBQ0Q7Ozs7O2tCQWhEa0I1Qix3QiIsImZpbGUiOiJTaGFwZURlc2lnbmVyRXhwZXJpZW5jZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEV4cGVyaWVuY2UgfSBmcm9tICdzb3VuZHdvcmtzL3NlcnZlcic7XG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5cbi8vIHNlcnZlci1zaWRlICdwbGF5ZXInIGV4cGVyaWVuY2UuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTaGFwZXNEZXNpZ25lckV4cGVyaWVuY2UgZXh0ZW5kcyBFeHBlcmllbmNlIHtcbiAgY29uc3RydWN0b3IoY2xpZW50VHlwZSkge1xuICAgIHN1cGVyKGNsaWVudFR5cGUpO1xuICAgIHRoaXMuc2hhcmVkQ29uZmlnID0gdGhpcy5yZXF1aXJlKCdzaGFyZWQtY29uZmlnJyk7XG5cbiAgICAvLyBGaWxlIGFjdHVhbGx5IGluIHRyYWluaW5nIGluIHRoZSBleHBlcmllbmNlXG4gICAgdGhpcy5zaGFwZUZpbGVzID0gJ3NoYXBlMS5zdmcnO1xuICAgIHRoaXMubGFiZWwgPSB0aGlzLnNoYXBlRmlsZXMucmVwbGFjZSgnLnN2ZycsICcnKTtcblxuICB9XG5cbiAgLy8gaWYgYW55dGhpbmcgbmVlZHMgdG8gYXBwZW5kIHdoZW4gdGhlIGV4cGVyaWVuY2Ugc3RhcnRzXG4gIHN0YXJ0KGNsaWVudCkge1xuXG4gICAgLy8gU1ZHIGluaXRcbiAgICB0aGlzLnNoYXBlRmlsZXNTdHJpbmcgPSBmcy5yZWFkRmlsZVN5bmMoIHBhdGguam9pbihwcm9jZXNzLmN3ZCgpLCAncmVzc291cmNlcy9pbWcvc2hhcGVzLycgKyB0aGlzLnNoYXBlRmlsZXMpICkudG9TdHJpbmcoKTtcblxuICB9XG5cbiAgLy8gaWYgYW55dGhpbmcgbmVlZHMgdG8gaGFwcGVuIHdoZW4gYSBjbGllbnQgZW50ZXJzIHRoZSBwZXJmb3JtYW5jZSAoKmkuZS4qXG4gIC8vIHN0YXJ0cyB0aGUgZXhwZXJpZW5jZSBvbiB0aGUgY2xpZW50IHNpZGUpLCB3cml0ZSBpdCBpbiB0aGUgYGVudGVyYCBtZXRob2RcbiAgZW50ZXIoY2xpZW50KSB7XG4gICAgc3VwZXIuZW50ZXIoY2xpZW50KTtcblxuICAgIC8vc2VuZFxuICAgIHRoaXMuc2VuZChjbGllbnQsICdzaGFwZScsIHRoaXMuc2hhcGVGaWxlc1N0cmluZywgdGhpcy5sYWJlbCk7XG5cbiAgICAvL3JlY2VpdmVcbiAgICB0aGlzLnJlY2VpdmUoIGNsaWVudCwgJ3BocmFzZScsIChkYXRhKSA9PiB0aGlzLl9zYXZlUGhyYXNlKGRhdGEpICk7XG4gIH1cblxuICBleGl0KGNsaWVudCkge1xuICAgIHN1cGVyLmV4aXQoY2xpZW50KTtcbiAgICAvLyAuLi5cbiAgfVxuXG4gIC8qIFNhdmUgdGhlIHBocmFzZSByZWNlaXZlZCBpbiB0aGUgSEQqL1xuICBfc2F2ZVBocmFzZShkYXRhKXtcbiAgICBjb25zb2xlLmxvZyhkYXRhKTtcbiAgICBsZXQgaWQgPSAwO1xuICAgIGNvbnN0IF9wYXRoID0gcGF0aC5qb2luKHByb2Nlc3MuY3dkKCksICdyZXNzb3VyY2VzL3BocmFzZXMvc2hhcGVzLycgKyBkYXRhLmxhYmVsICsgXCIvXCIpO1xuICAgIGlmKCFmcy5leGlzdHNTeW5jKF9wYXRoKSkgZnMubWtkaXJTeW5jKF9wYXRoKTtcbiAgICBjb25zdCBmb2xkZXIgPSBmcy5yZWFkZGlyU3luYyhfcGF0aClbMF07XG4gICAgaWYoZm9sZGVyICE9ICdudWxsJyl7XG4gICAgICBpZCA9IGZvbGRlci5sZW5ndGg7IFxuICAgIH1cbiAgICBjb25zb2xlLmxvZyhmb2xkZXIsIGlkKVxuICAgIGZzLndyaXRlRmlsZVN5bmMoX3BhdGggKyBkYXRhLmxhYmVsICsgXCItXCIgKyBpZCArIFwiLmpzb25cIiwgSlNPTi5zdHJpbmdpZnkoZGF0YS5waHJhc2UpLCBudWxsLCAyLCAndXRmLTgnKTtcbiAgfVxufVxuIl19