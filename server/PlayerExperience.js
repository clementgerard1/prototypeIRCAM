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
    _this.backgroundName = 'background.svg';
    return _this;
  }

  // if anything needs to append when the experience starts


  (0, _createClass3.default)(PlayerExperience, [{
    key: 'start',
    value: function start() {
      var _this2 = this;

      /*---------------- XMM - initialisation --------------*/
      this.xmm = new _xmmNode2.default('hhmm', {
        states: 10,
        relativeRegularization: 0.00000001,
        transitionMode: 'leftright'
      });

      var folderPhrases = _fs2.default.readdirSync(_path2.default.join(process.cwd(), 'ressources/phrases/shapes/'));
      for (var i = 0; i < folderPhrases.length; i++) {
        try {
          var phrases = _fs2.default.readdirSync(_path2.default.join(process.cwd(), 'ressources/phrases/shapes/' + folderPhrases[i] + '/'));
          for (var j = 0; j < phrases.length; j++) {
            try {
              var phrase = JSON.parse(_fs2.default.readFileSync(_path2.default.join(process.cwd(), 'ressources/phrases/shapes/' + folderPhrases[i] + '/' + phrases[j])));
              this.xmm.addPhrase(phrase);
            } catch (e) {}
          }
        } catch (e) {}
      }

      this.xmm.train(function (e, model) {
        if (!e) {
          _this2.model = model;
        }
      });

      /*---------------------- SVG init ---------------------------*/

      this.background = _fs2.default.readFileSync(_path2.default.join(process.cwd(), 'ressources/img/background/' + this.backgroundName)).toString();
    }

    // if anything needs to happen when a client enters the performance (*i.e.*
    // starts the experience on the client side), write it in the `enter` method

  }, {
    key: 'enter',
    value: function enter(client) {
      var _this3 = this;

      (0, _get3.default)(PlayerExperience.prototype.__proto__ || (0, _getPrototypeOf2.default)(PlayerExperience.prototype), 'enter', this).call(this, client);
      this.send(client, 'background', this.background);
      this.send(client, 'model', this.model);
      this.receive(client, 'askShape', function (shape, x, y) {
        return _this3._askShape(shape, x, y, client);
      });
    }
  }, {
    key: 'exit',
    value: function exit(client) {
      (0, _get3.default)(PlayerExperience.prototype.__proto__ || (0, _getPrototypeOf2.default)(PlayerExperience.prototype), 'exit', this).call(this, client);
    }

    /* Send the image of the shape asked */

  }, {
    key: '_askShape',
    value: function _askShape(shape, x, y, client) {
      var files = _fs2.default.readFileSync(_path2.default.join(process.cwd(), 'ressources/img/shapes/' + shape + '.svg')).toString();
      this.send(client, 'shapeAnswer', files, x, y);
    }
  }]);
  return PlayerExperience;
}(_server.Experience);

exports.default = PlayerExperience;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlBsYXllckV4cGVyaWVuY2UuanMiXSwibmFtZXMiOlsiUGxheWVyRXhwZXJpZW5jZSIsImNsaWVudFR5cGUiLCJzaGFyZWRDb25maWciLCJyZXF1aXJlIiwiYmFja2dyb3VuZE5hbWUiLCJ4bW0iLCJzdGF0ZXMiLCJyZWxhdGl2ZVJlZ3VsYXJpemF0aW9uIiwidHJhbnNpdGlvbk1vZGUiLCJmb2xkZXJQaHJhc2VzIiwicmVhZGRpclN5bmMiLCJqb2luIiwicHJvY2VzcyIsImN3ZCIsImkiLCJsZW5ndGgiLCJwaHJhc2VzIiwiaiIsInBocmFzZSIsIkpTT04iLCJwYXJzZSIsInJlYWRGaWxlU3luYyIsImFkZFBocmFzZSIsImUiLCJ0cmFpbiIsIm1vZGVsIiwiYmFja2dyb3VuZCIsInRvU3RyaW5nIiwiY2xpZW50Iiwic2VuZCIsInJlY2VpdmUiLCJzaGFwZSIsIngiLCJ5IiwiX2Fza1NoYXBlIiwiZmlsZXMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBOztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7O0FBR0E7SUFDcUJBLGdCOzs7QUFDbkIsNEJBQVlDLFVBQVosRUFBd0I7QUFBQTs7QUFBQSwwSkFFaEJBLFVBRmdCOztBQUl0QixVQUFLQyxZQUFMLEdBQW9CLE1BQUtDLE9BQUwsQ0FBYSxlQUFiLENBQXBCO0FBQ0EsVUFBS0MsY0FBTCxHQUFzQixnQkFBdEI7QUFMc0I7QUFNdkI7O0FBRUQ7Ozs7OzRCQUNRO0FBQUE7O0FBRU47QUFDQSxXQUFLQyxHQUFMLEdBQVcsc0JBQVEsTUFBUixFQUFnQjtBQUN6QkMsZ0JBQVEsRUFEaUI7QUFFekJDLGdDQUF3QixVQUZDO0FBR3pCQyx3QkFBZ0I7QUFIUyxPQUFoQixDQUFYOztBQU1BLFVBQU1DLGdCQUFnQixhQUFHQyxXQUFILENBQWdCLGVBQUtDLElBQUwsQ0FBVUMsUUFBUUMsR0FBUixFQUFWLEVBQXlCLDRCQUF6QixDQUFoQixDQUF0QjtBQUNBLFdBQUksSUFBSUMsSUFBSSxDQUFaLEVBQWdCQSxJQUFJTCxjQUFjTSxNQUFsQyxFQUEwQ0QsR0FBMUMsRUFBOEM7QUFDNUMsWUFBRztBQUNELGNBQU1FLFVBQVUsYUFBR04sV0FBSCxDQUFnQixlQUFLQyxJQUFMLENBQVVDLFFBQVFDLEdBQVIsRUFBVixFQUF5QiwrQkFBK0JKLGNBQWNLLENBQWQsQ0FBL0IsR0FBa0QsR0FBM0UsQ0FBaEIsQ0FBaEI7QUFDQSxlQUFJLElBQUlHLElBQUksQ0FBWixFQUFnQkEsSUFBSUQsUUFBUUQsTUFBNUIsRUFBcUNFLEdBQXJDLEVBQXlDO0FBQ3ZDLGdCQUFHO0FBQ0Qsa0JBQUlDLFNBQVNDLEtBQUtDLEtBQUwsQ0FBWSxhQUFHQyxZQUFILENBQWlCLGVBQUtWLElBQUwsQ0FBVUMsUUFBUUMsR0FBUixFQUFWLEVBQXlCLCtCQUErQkosY0FBY0ssQ0FBZCxDQUEvQixHQUFrRCxHQUFsRCxHQUF3REUsUUFBUUMsQ0FBUixDQUFqRixDQUFqQixDQUFaLENBQWI7QUFDQSxtQkFBS1osR0FBTCxDQUFTaUIsU0FBVCxDQUFtQkosTUFBbkI7QUFDRCxhQUhELENBR0MsT0FBTUssQ0FBTixFQUFRLENBQUU7QUFDWjtBQUNGLFNBUkQsQ0FRQyxPQUFNQSxDQUFOLEVBQVEsQ0FBRTtBQUNaOztBQUVELFdBQUtsQixHQUFMLENBQVNtQixLQUFULENBQWUsVUFBQ0QsQ0FBRCxFQUFHRSxLQUFILEVBQVc7QUFDeEIsWUFBRyxDQUFDRixDQUFKLEVBQU07QUFDSixpQkFBS0UsS0FBTCxHQUFhQSxLQUFiO0FBQ0Q7QUFDRixPQUpEOztBQU1BOztBQUVBLFdBQUtDLFVBQUwsR0FBa0IsYUFBR0wsWUFBSCxDQUFpQixlQUFLVixJQUFMLENBQVVDLFFBQVFDLEdBQVIsRUFBVixFQUF5QiwrQkFBK0IsS0FBS1QsY0FBN0QsQ0FBakIsRUFBZ0d1QixRQUFoRyxFQUFsQjtBQUVEOztBQUVEO0FBQ0E7Ozs7MEJBQ01DLE0sRUFBUTtBQUFBOztBQUNaLHNKQUFZQSxNQUFaO0FBQ0EsV0FBS0MsSUFBTCxDQUFVRCxNQUFWLEVBQWtCLFlBQWxCLEVBQWdDLEtBQUtGLFVBQXJDO0FBQ0EsV0FBS0csSUFBTCxDQUFVRCxNQUFWLEVBQWtCLE9BQWxCLEVBQTJCLEtBQUtILEtBQWhDO0FBQ0EsV0FBS0ssT0FBTCxDQUFjRixNQUFkLEVBQXNCLFVBQXRCLEVBQWtDLFVBQUNHLEtBQUQsRUFBUUMsQ0FBUixFQUFXQyxDQUFYO0FBQUEsZUFBaUIsT0FBS0MsU0FBTCxDQUFlSCxLQUFmLEVBQXNCQyxDQUF0QixFQUF5QkMsQ0FBekIsRUFBNEJMLE1BQTVCLENBQWpCO0FBQUEsT0FBbEM7QUFDRDs7O3lCQUVJQSxNLEVBQVE7QUFDWCxxSkFBV0EsTUFBWDtBQUNEOztBQUVEOzs7OzhCQUNVRyxLLEVBQU9DLEMsRUFBR0MsQyxFQUFHTCxNLEVBQU87QUFDNUIsVUFBTU8sUUFBUSxhQUFHZCxZQUFILENBQWlCLGVBQUtWLElBQUwsQ0FBVUMsUUFBUUMsR0FBUixFQUFWLEVBQXlCLDJCQUEyQmtCLEtBQTNCLEdBQW1DLE1BQTVELENBQWpCLEVBQXVGSixRQUF2RixFQUFkO0FBQ0EsV0FBS0UsSUFBTCxDQUFVRCxNQUFWLEVBQWtCLGFBQWxCLEVBQWlDTyxLQUFqQyxFQUF3Q0gsQ0FBeEMsRUFBMkNDLENBQTNDO0FBQ0Q7Ozs7O2tCQTdEa0JqQyxnQiIsImZpbGUiOiJQbGF5ZXJFeHBlcmllbmNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRXhwZXJpZW5jZSB9IGZyb20gJ3NvdW5kd29ya3Mvc2VydmVyJztcbmltcG9ydCB4bW0gZnJvbSAneG1tLW5vZGUnO1xuaW1wb3J0IGZzIGZyb20gJ2ZzJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuXG5cbi8vIHNlcnZlci1zaWRlICdwbGF5ZXInIGV4cGVyaWVuY2UuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQbGF5ZXJFeHBlcmllbmNlIGV4dGVuZHMgRXhwZXJpZW5jZSB7XG4gIGNvbnN0cnVjdG9yKGNsaWVudFR5cGUpIHtcblxuICAgIHN1cGVyKGNsaWVudFR5cGUpO1xuXG4gICAgdGhpcy5zaGFyZWRDb25maWcgPSB0aGlzLnJlcXVpcmUoJ3NoYXJlZC1jb25maWcnKTtcbiAgICB0aGlzLmJhY2tncm91bmROYW1lID0gJ2JhY2tncm91bmQuc3ZnJztcbiAgfVxuXG4gIC8vIGlmIGFueXRoaW5nIG5lZWRzIHRvIGFwcGVuZCB3aGVuIHRoZSBleHBlcmllbmNlIHN0YXJ0c1xuICBzdGFydCgpIHtcblxuICAgIC8qLS0tLS0tLS0tLS0tLS0tLSBYTU0gLSBpbml0aWFsaXNhdGlvbiAtLS0tLS0tLS0tLS0tLSovXG4gICAgdGhpcy54bW0gPSBuZXcgeG1tKCdoaG1tJywge1xuICAgICAgc3RhdGVzOiAxMCxcbiAgICAgIHJlbGF0aXZlUmVndWxhcml6YXRpb246IDAuMDAwMDAwMDEsXG4gICAgICB0cmFuc2l0aW9uTW9kZTogJ2xlZnRyaWdodCcsXG4gICAgfSk7XG5cbiAgICBjb25zdCBmb2xkZXJQaHJhc2VzID0gZnMucmVhZGRpclN5bmMoIHBhdGguam9pbihwcm9jZXNzLmN3ZCgpLCAncmVzc291cmNlcy9waHJhc2VzL3NoYXBlcy8nKSApO1xuICAgIGZvcihsZXQgaSA9IDAgOyBpIDwgZm9sZGVyUGhyYXNlcy5sZW5ndGg7IGkrKyl7XG4gICAgICB0cnl7XG4gICAgICAgIGNvbnN0IHBocmFzZXMgPSBmcy5yZWFkZGlyU3luYyggcGF0aC5qb2luKHByb2Nlc3MuY3dkKCksICdyZXNzb3VyY2VzL3BocmFzZXMvc2hhcGVzLycgKyBmb2xkZXJQaHJhc2VzW2ldICsgJy8nKSApO1xuICAgICAgICBmb3IobGV0IGogPSAwIDsgaiA8IHBocmFzZXMubGVuZ3RoIDsgaisrKXtcbiAgICAgICAgICB0cnl7XG4gICAgICAgICAgICBsZXQgcGhyYXNlID0gSlNPTi5wYXJzZSggZnMucmVhZEZpbGVTeW5jKCBwYXRoLmpvaW4ocHJvY2Vzcy5jd2QoKSwgJ3Jlc3NvdXJjZXMvcGhyYXNlcy9zaGFwZXMvJyArIGZvbGRlclBocmFzZXNbaV0gKyAnLycgKyBwaHJhc2VzW2pdKSApICk7XG4gICAgICAgICAgICB0aGlzLnhtbS5hZGRQaHJhc2UocGhyYXNlKTtcbiAgICAgICAgICB9Y2F0Y2goZSl7fVxuICAgICAgICB9XG4gICAgICB9Y2F0Y2goZSl7fVxuICAgIH1cblxuICAgIHRoaXMueG1tLnRyYWluKChlLG1vZGVsKT0+e1xuICAgICAgaWYoIWUpe1xuICAgICAgICB0aGlzLm1vZGVsID0gbW9kZWw7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gU1ZHIGluaXQgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuICAgIHRoaXMuYmFja2dyb3VuZCA9IGZzLnJlYWRGaWxlU3luYyggcGF0aC5qb2luKHByb2Nlc3MuY3dkKCksICdyZXNzb3VyY2VzL2ltZy9iYWNrZ3JvdW5kLycgKyB0aGlzLmJhY2tncm91bmROYW1lKSApLnRvU3RyaW5nKCk7XG5cbiAgfVxuXG4gIC8vIGlmIGFueXRoaW5nIG5lZWRzIHRvIGhhcHBlbiB3aGVuIGEgY2xpZW50IGVudGVycyB0aGUgcGVyZm9ybWFuY2UgKCppLmUuKlxuICAvLyBzdGFydHMgdGhlIGV4cGVyaWVuY2Ugb24gdGhlIGNsaWVudCBzaWRlKSwgd3JpdGUgaXQgaW4gdGhlIGBlbnRlcmAgbWV0aG9kXG4gIGVudGVyKGNsaWVudCkge1xuICAgIHN1cGVyLmVudGVyKGNsaWVudCk7XG4gICAgdGhpcy5zZW5kKGNsaWVudCwgJ2JhY2tncm91bmQnLCB0aGlzLmJhY2tncm91bmQpO1xuICAgIHRoaXMuc2VuZChjbGllbnQsICdtb2RlbCcsIHRoaXMubW9kZWwpO1xuICAgIHRoaXMucmVjZWl2ZSggY2xpZW50LCAnYXNrU2hhcGUnLCAoc2hhcGUsIHgsIHkpID0+IHRoaXMuX2Fza1NoYXBlKHNoYXBlLCB4LCB5LCBjbGllbnQpICk7XG4gIH1cblxuICBleGl0KGNsaWVudCkge1xuICAgIHN1cGVyLmV4aXQoY2xpZW50KTtcbiAgfVxuXG4gIC8qIFNlbmQgdGhlIGltYWdlIG9mIHRoZSBzaGFwZSBhc2tlZCAqL1xuICBfYXNrU2hhcGUoc2hhcGUsIHgsIHksIGNsaWVudCl7XG4gICAgY29uc3QgZmlsZXMgPSBmcy5yZWFkRmlsZVN5bmMoIHBhdGguam9pbihwcm9jZXNzLmN3ZCgpLCAncmVzc291cmNlcy9pbWcvc2hhcGVzLycgKyBzaGFwZSArICcuc3ZnJykgKS50b1N0cmluZygpO1xuICAgIHRoaXMuc2VuZChjbGllbnQsICdzaGFwZUFuc3dlcicsIGZpbGVzLCB4LCB5KTtcbiAgfVxufVxuIl19