'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _trunc = require('babel-runtime/core-js/math/trunc');

var _trunc2 = _interopRequireDefault(_trunc);

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

var _wavesAudio = require('waves-audio');

var waves = _interopRequireWildcard(_wavesAudio);

var _client = require('soundworks/client');

var soundworks = _interopRequireWildcard(_client);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var audioContext = soundworks.audioContext;

var MyGrain = function (_waves$AudioTimeEngin) {
	(0, _inherits3.default)(MyGrain, _waves$AudioTimeEngin);

	function MyGrain() {
		(0, _classCallCheck3.default)(this, MyGrain);

		var _this = (0, _possibleConstructorReturn3.default)(this, (MyGrain.__proto__ || (0, _getPrototypeOf2.default)(MyGrain)).call(this));

		_this.input = audioContext.createGain();
		_this.input.gain.value = 1;

		_this.output = audioContext.createGain();
		_this.output.gain.value = 1;

		_this.grainPhase = [0, 0.25, 0.125, 0.375, 0.075, 0.325, 0.2, 0.4, 0.5, 0.75, 0.625, 0.875, 0.575, 0.825, 0.7, 0.9];
		_this.gain = [];
		_this.delay = [];

		_this.grainPeriod = 25;
		_this.period = 0.1;
		_this.randomPosition = 1500;
		_this.grainSchedulerPhase = [];

		for (var i = 0; i < _this.grainPhase.length; i++) {
			_this.grainSchedulerPhase[i] = (0, _trunc2.default)(_this.grainPhase[i] * _this.grainPeriod);
		}

		for (var _i = 0; _i < 16; _i++) {
			_this.gain.push(audioContext.createGain());
			_this.delay.push(audioContext.createDelay(20));
			_this.input.connect(_this.delay[_i]);
			_this.delay[_i].connect(_this.gain[_i]);
			_this.delay[_i].delayTime.value = Math.random() * _this.randomPosition / 1000.;
			_this.gain[_i].connect(_this.output);
		}

		return _this;
	}

	//-------------------------------------------------

	/* @public */


	(0, _createClass3.default)(MyGrain, [{
		key: 'connect',
		value: function connect(output) {
			this.output.connect(output);
		}

		/* @public */

	}, {
		key: 'disconnect',
		value: function disconnect() {
			var output = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

			this.output.disconnect(output);
		}

		/* @public */

	}, {
		key: 'reset',
		value: function reset() {
			this.grain = [0, 0.25, 0.125, 0.375, 0.075, 0.325, 0.2, 0.4, 0.5, 0.75, 0.625, 0.375, 0.575, 0.825, 0.7, 0.9];
			this.grainSchedulerPhase = [];
			for (var i = 0; i < this.grainPhase.length; i++) {
				this.grainSchedulerPhase[i] = (0, _trunc2.default)(this.grainPhase[i] * this.grainPeriod);
			}
		}

		/* @public */

	}, {
		key: 'advanceTime',
		value: function advanceTime(time) {
			this._updatePhase();
			this._assignGain();
			return time + this.period;
		}

		//-------------------------------------------------


		/** @private */

	}, {
		key: '_updatePhase',
		value: function _updatePhase() {
			for (var i = 0; i < 16; i++) {
				this.grainSchedulerPhase[i] = (this.grainSchedulerPhase[i] + 1) % this.grainPeriod;
			}
		}

		/* @private */

	}, {
		key: '_assignGain',
		value: function _assignGain() {
			for (var i = 0; i < 16; i++) {
				var toTri = void 0;
				var semiGrainPeriod = this.grainPeriod / 2;
				if (this.grainSchedulerPhase[i] < semiGrainPeriod) {
					toTri = this.grainSchedulerPhase[i] / semiGrainPeriod; // return [0,1]
				} else {
					toTri = (semiGrainPeriod - (this.grainSchedulerPhase[i] - semiGrainPeriod)) / semiGrainPeriod; // return [0,1]
				}
				toTri *= 0.2;
				this.gain[i].gain.linearRampToValueAtTime(toTri, audioContext.currentTime + 0.001);
				if (toTri == 0) {
					this._assignPosition(i);
				}
			}
		}

		/* @private */

	}, {
		key: '_assignPosition',
		value: function _assignPosition(id) {
			this.delay[id].delayTime.setValueAtTime(Math.random() * this.randomPosition / 1000, audioContext.currentTime + 0.0015);
		}
	}]);
	return MyGrain;
}(waves.AudioTimeEngine);

exports.default = MyGrain;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIk15R3JhaW4uanMiXSwibmFtZXMiOlsid2F2ZXMiLCJzb3VuZHdvcmtzIiwiYXVkaW9Db250ZXh0IiwiTXlHcmFpbiIsImlucHV0IiwiY3JlYXRlR2FpbiIsImdhaW4iLCJ2YWx1ZSIsIm91dHB1dCIsImdyYWluUGhhc2UiLCJkZWxheSIsImdyYWluUGVyaW9kIiwicGVyaW9kIiwicmFuZG9tUG9zaXRpb24iLCJncmFpblNjaGVkdWxlclBoYXNlIiwiaSIsImxlbmd0aCIsInB1c2giLCJjcmVhdGVEZWxheSIsImNvbm5lY3QiLCJkZWxheVRpbWUiLCJNYXRoIiwicmFuZG9tIiwiZGlzY29ubmVjdCIsImdyYWluIiwidGltZSIsIl91cGRhdGVQaGFzZSIsIl9hc3NpZ25HYWluIiwidG9UcmkiLCJzZW1pR3JhaW5QZXJpb2QiLCJsaW5lYXJSYW1wVG9WYWx1ZUF0VGltZSIsImN1cnJlbnRUaW1lIiwiX2Fzc2lnblBvc2l0aW9uIiwiaWQiLCJzZXRWYWx1ZUF0VGltZSIsIkF1ZGlvVGltZUVuZ2luZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7O0lBQVlBLEs7O0FBQ1o7O0lBQVlDLFU7Ozs7OztBQUVaLElBQU1DLGVBQWVELFdBQVdDLFlBQWhDOztJQUVxQkMsTzs7O0FBRXBCLG9CQUFjO0FBQUE7O0FBQUE7O0FBR2IsUUFBS0MsS0FBTCxHQUFhRixhQUFhRyxVQUFiLEVBQWI7QUFDQSxRQUFLRCxLQUFMLENBQVdFLElBQVgsQ0FBZ0JDLEtBQWhCLEdBQXdCLENBQXhCOztBQUVBLFFBQUtDLE1BQUwsR0FBY04sYUFBYUcsVUFBYixFQUFkO0FBQ0EsUUFBS0csTUFBTCxDQUFZRixJQUFaLENBQWlCQyxLQUFqQixHQUF5QixDQUF6Qjs7QUFFQSxRQUFLRSxVQUFMLEdBQWtCLENBQUMsQ0FBRCxFQUFJLElBQUosRUFBVSxLQUFWLEVBQWlCLEtBQWpCLEVBQXdCLEtBQXhCLEVBQStCLEtBQS9CLEVBQXNDLEdBQXRDLEVBQTJDLEdBQTNDLEVBQWdELEdBQWhELEVBQXFELElBQXJELEVBQTJELEtBQTNELEVBQWtFLEtBQWxFLEVBQXlFLEtBQXpFLEVBQWdGLEtBQWhGLEVBQXVGLEdBQXZGLEVBQTRGLEdBQTVGLENBQWxCO0FBQ0EsUUFBS0gsSUFBTCxHQUFZLEVBQVo7QUFDQSxRQUFLSSxLQUFMLEdBQWEsRUFBYjs7QUFFRyxRQUFLQyxXQUFMLEdBQW1CLEVBQW5CO0FBQ0EsUUFBS0MsTUFBTCxHQUFjLEdBQWQ7QUFDSCxRQUFLQyxjQUFMLEdBQXNCLElBQXRCO0FBQ0EsUUFBS0MsbUJBQUwsR0FBMkIsRUFBM0I7O0FBRUcsT0FBSSxJQUFJQyxJQUFJLENBQVosRUFBZUEsSUFBSSxNQUFLTixVQUFMLENBQWdCTyxNQUFuQyxFQUEyQ0QsR0FBM0MsRUFBK0M7QUFDOUMsU0FBS0QsbUJBQUwsQ0FBeUJDLENBQXpCLElBQThCLHFCQUFXLE1BQUtOLFVBQUwsQ0FBZ0JNLENBQWhCLElBQXFCLE1BQUtKLFdBQXJDLENBQTlCO0FBQ0E7O0FBRUosT0FBSSxJQUFJSSxLQUFJLENBQVosRUFBZUEsS0FBSSxFQUFuQixFQUF1QkEsSUFBdkIsRUFBNEI7QUFDM0IsU0FBS1QsSUFBTCxDQUFVVyxJQUFWLENBQWVmLGFBQWFHLFVBQWIsRUFBZjtBQUNBLFNBQUtLLEtBQUwsQ0FBV08sSUFBWCxDQUFnQmYsYUFBYWdCLFdBQWIsQ0FBeUIsRUFBekIsQ0FBaEI7QUFDQSxTQUFLZCxLQUFMLENBQVdlLE9BQVgsQ0FBbUIsTUFBS1QsS0FBTCxDQUFXSyxFQUFYLENBQW5CO0FBQ0EsU0FBS0wsS0FBTCxDQUFXSyxFQUFYLEVBQWNJLE9BQWQsQ0FBc0IsTUFBS2IsSUFBTCxDQUFVUyxFQUFWLENBQXRCO0FBQ0EsU0FBS0wsS0FBTCxDQUFXSyxFQUFYLEVBQWNLLFNBQWQsQ0FBd0JiLEtBQXhCLEdBQWlDYyxLQUFLQyxNQUFMLEtBQWdCLE1BQUtULGNBQXRCLEdBQXdDLEtBQXhFO0FBQ0EsU0FBS1AsSUFBTCxDQUFVUyxFQUFWLEVBQWFJLE9BQWIsQ0FBcUIsTUFBS1gsTUFBMUI7QUFDQTs7QUE3Qlk7QUErQmI7O0FBRUQ7O0FBRUE7Ozs7OzBCQUNRQSxNLEVBQVE7QUFDZixRQUFLQSxNQUFMLENBQVlXLE9BQVosQ0FBb0JYLE1BQXBCO0FBQ0E7O0FBRUQ7Ozs7K0JBQzBCO0FBQUEsT0FBZkEsTUFBZSx1RUFBTixJQUFNOztBQUN6QixRQUFLQSxNQUFMLENBQVllLFVBQVosQ0FBdUJmLE1BQXZCO0FBQ0E7O0FBRUQ7Ozs7MEJBQ1E7QUFDUCxRQUFLZ0IsS0FBTCxHQUFhLENBQUMsQ0FBRCxFQUFJLElBQUosRUFBVSxLQUFWLEVBQWlCLEtBQWpCLEVBQXdCLEtBQXhCLEVBQStCLEtBQS9CLEVBQXNDLEdBQXRDLEVBQTJDLEdBQTNDLEVBQWdELEdBQWhELEVBQXFELElBQXJELEVBQTJELEtBQTNELEVBQWtFLEtBQWxFLEVBQXlFLEtBQXpFLEVBQWdGLEtBQWhGLEVBQXVGLEdBQXZGLEVBQTRGLEdBQTVGLENBQWI7QUFDQSxRQUFLVixtQkFBTCxHQUEyQixFQUEzQjtBQUNHLFFBQUksSUFBSUMsSUFBSSxDQUFaLEVBQWVBLElBQUksS0FBS04sVUFBTCxDQUFnQk8sTUFBbkMsRUFBMkNELEdBQTNDLEVBQStDO0FBQzlDLFNBQUtELG1CQUFMLENBQXlCQyxDQUF6QixJQUE4QixxQkFBVyxLQUFLTixVQUFMLENBQWdCTSxDQUFoQixJQUFxQixLQUFLSixXQUFyQyxDQUE5QjtBQUNBO0FBQ0o7O0FBRUQ7Ozs7OEJBQ1ljLEksRUFBSztBQUNoQixRQUFLQyxZQUFMO0FBQ0EsUUFBS0MsV0FBTDtBQUNBLFVBQU9GLE9BQU8sS0FBS2IsTUFBbkI7QUFDQTs7QUFFRDs7O0FBR0E7Ozs7aUNBQ2U7QUFDZCxRQUFJLElBQUlHLElBQUksQ0FBWixFQUFlQSxJQUFJLEVBQW5CLEVBQXVCQSxHQUF2QixFQUEyQjtBQUMxQixTQUFLRCxtQkFBTCxDQUF5QkMsQ0FBekIsSUFBOEIsQ0FBQyxLQUFLRCxtQkFBTCxDQUF5QkMsQ0FBekIsSUFBOEIsQ0FBL0IsSUFBb0MsS0FBS0osV0FBdkU7QUFDQTtBQUNEOztBQUVEOzs7O2dDQUNjO0FBQ2IsUUFBSSxJQUFJSSxJQUFJLENBQVosRUFBZUEsSUFBSSxFQUFuQixFQUF1QkEsR0FBdkIsRUFBMkI7QUFDMUIsUUFBSWEsY0FBSjtBQUNBLFFBQU1DLGtCQUFrQixLQUFLbEIsV0FBTCxHQUFtQixDQUEzQztBQUNBLFFBQUcsS0FBS0csbUJBQUwsQ0FBeUJDLENBQXpCLElBQTRCYyxlQUEvQixFQUErQztBQUM5Q0QsYUFBUSxLQUFLZCxtQkFBTCxDQUF5QkMsQ0FBekIsSUFBOEJjLGVBQXRDLENBRDhDLENBQ1U7QUFDeEQsS0FGRCxNQUVLO0FBQ0pELGFBQVEsQ0FBQ0MsbUJBQW1CLEtBQUtmLG1CQUFMLENBQXlCQyxDQUF6QixJQUE4QmMsZUFBakQsQ0FBRCxJQUFzRUEsZUFBOUUsQ0FESSxDQUMyRjtBQUMvRjtBQUNERCxhQUFTLEdBQVQ7QUFDQSxTQUFLdEIsSUFBTCxDQUFVUyxDQUFWLEVBQWFULElBQWIsQ0FBa0J3Qix1QkFBbEIsQ0FBMENGLEtBQTFDLEVBQWlEMUIsYUFBYTZCLFdBQWIsR0FBMkIsS0FBNUU7QUFDQSxRQUFHSCxTQUFTLENBQVosRUFBYztBQUNiLFVBQUtJLGVBQUwsQ0FBcUJqQixDQUFyQjtBQUNBO0FBQ0Q7QUFDRDs7QUFFRDs7OztrQ0FDZ0JrQixFLEVBQUk7QUFDbkIsUUFBS3ZCLEtBQUwsQ0FBV3VCLEVBQVgsRUFBZWIsU0FBZixDQUF5QmMsY0FBekIsQ0FBd0NiLEtBQUtDLE1BQUwsS0FBZ0IsS0FBS1QsY0FBckIsR0FBc0MsSUFBOUUsRUFBb0ZYLGFBQWE2QixXQUFiLEdBQTJCLE1BQS9HO0FBQ0E7OztFQTlGbUMvQixNQUFNbUMsZTs7a0JBQXRCaEMsTyIsImZpbGUiOiJNeUdyYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgd2F2ZXMgZnJvbSAnd2F2ZXMtYXVkaW8nO1xuaW1wb3J0ICogYXMgc291bmR3b3JrcyBmcm9tICdzb3VuZHdvcmtzL2NsaWVudCc7XG5cbmNvbnN0IGF1ZGlvQ29udGV4dCA9IHNvdW5kd29ya3MuYXVkaW9Db250ZXh0O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNeUdyYWluIGV4dGVuZHMgd2F2ZXMuQXVkaW9UaW1lRW5naW5lIHtcblx0XG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHN1cGVyKCk7XG5cblx0XHR0aGlzLmlucHV0ID0gYXVkaW9Db250ZXh0LmNyZWF0ZUdhaW4oKTtcblx0XHR0aGlzLmlucHV0LmdhaW4udmFsdWUgPSAxO1xuXG5cdFx0dGhpcy5vdXRwdXQgPSBhdWRpb0NvbnRleHQuY3JlYXRlR2FpbigpO1xuXHRcdHRoaXMub3V0cHV0LmdhaW4udmFsdWUgPSAxO1xuXG5cdFx0dGhpcy5ncmFpblBoYXNlID0gWzAsIDAuMjUsIDAuMTI1LCAwLjM3NSwgMC4wNzUsIDAuMzI1LCAwLjIsIDAuNCwgMC41LCAwLjc1LCAwLjYyNSwgMC44NzUsIDAuNTc1LCAwLjgyNSwgMC43LCAwLjldO1xuXHRcdHRoaXMuZ2FpbiA9IFtdO1xuXHRcdHRoaXMuZGVsYXkgPSBbXTtcblxuICAgIFx0dGhpcy5ncmFpblBlcmlvZCA9IDI1O1xuICAgIFx0dGhpcy5wZXJpb2QgPSAwLjE7IFxuXHRcdHRoaXMucmFuZG9tUG9zaXRpb24gPSAxNTAwO1xuXHRcdHRoaXMuZ3JhaW5TY2hlZHVsZXJQaGFzZSA9IFtdO1xuXG4gICAgXHRmb3IobGV0IGkgPSAwOyBpIDwgdGhpcy5ncmFpblBoYXNlLmxlbmd0aDsgaSsrKXtcbiAgICBcdFx0dGhpcy5ncmFpblNjaGVkdWxlclBoYXNlW2ldID0gTWF0aC50cnVuYyh0aGlzLmdyYWluUGhhc2VbaV0gKiB0aGlzLmdyYWluUGVyaW9kKTtcbiAgICBcdH1cbiAgICBcdFxuXHRcdGZvcihsZXQgaSA9IDA7IGkgPCAxNjsgaSsrKSB7IFxuXHRcdFx0dGhpcy5nYWluLnB1c2goYXVkaW9Db250ZXh0LmNyZWF0ZUdhaW4oKSk7XG5cdFx0XHR0aGlzLmRlbGF5LnB1c2goYXVkaW9Db250ZXh0LmNyZWF0ZURlbGF5KDIwKSk7XG5cdFx0XHR0aGlzLmlucHV0LmNvbm5lY3QodGhpcy5kZWxheVtpXSk7XG5cdFx0XHR0aGlzLmRlbGF5W2ldLmNvbm5lY3QodGhpcy5nYWluW2ldKTtcblx0XHRcdHRoaXMuZGVsYXlbaV0uZGVsYXlUaW1lLnZhbHVlID0gKE1hdGgucmFuZG9tKCkgKiB0aGlzLnJhbmRvbVBvc2l0aW9uKSAvIDEwMDAuO1xuXHRcdFx0dGhpcy5nYWluW2ldLmNvbm5lY3QodGhpcy5vdXRwdXQpO1xuXHRcdH1cblxuXHR9XG5cblx0Ly8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblx0LyogQHB1YmxpYyAqL1xuXHRjb25uZWN0KG91dHB1dCkge1xuXHRcdHRoaXMub3V0cHV0LmNvbm5lY3Qob3V0cHV0KTtcblx0fVxuXG5cdC8qIEBwdWJsaWMgKi9cblx0ZGlzY29ubmVjdChvdXRwdXQgPSBudWxsKSB7XG5cdFx0dGhpcy5vdXRwdXQuZGlzY29ubmVjdChvdXRwdXQpO1xuXHR9XG5cblx0LyogQHB1YmxpYyAqL1xuXHRyZXNldCgpIHtcblx0XHR0aGlzLmdyYWluID0gWzAsIDAuMjUsIDAuMTI1LCAwLjM3NSwgMC4wNzUsIDAuMzI1LCAwLjIsIDAuNCwgMC41LCAwLjc1LCAwLjYyNSwgMC4zNzUsIDAuNTc1LCAwLjgyNSwgMC43LCAwLjldO1xuXHRcdHRoaXMuZ3JhaW5TY2hlZHVsZXJQaGFzZSA9IFtdO1xuICAgIFx0Zm9yKGxldCBpID0gMDsgaSA8IHRoaXMuZ3JhaW5QaGFzZS5sZW5ndGg7IGkrKyl7XG4gICAgXHRcdHRoaXMuZ3JhaW5TY2hlZHVsZXJQaGFzZVtpXSA9IE1hdGgudHJ1bmModGhpcy5ncmFpblBoYXNlW2ldICogdGhpcy5ncmFpblBlcmlvZCk7XG4gICAgXHR9XG5cdH1cblxuXHQvKiBAcHVibGljICovXG5cdGFkdmFuY2VUaW1lKHRpbWUpe1xuXHRcdHRoaXMuX3VwZGF0ZVBoYXNlKCk7XG5cdFx0dGhpcy5fYXNzaWduR2FpbigpO1xuXHRcdHJldHVybiB0aW1lICsgdGhpcy5wZXJpb2Q7XG5cdH1cblxuXHQvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXG5cdC8qKiBAcHJpdmF0ZSAqL1xuXHRfdXBkYXRlUGhhc2UoKSB7XG5cdFx0Zm9yKGxldCBpID0gMDsgaSA8IDE2OyBpKyspe1xuXHRcdFx0dGhpcy5ncmFpblNjaGVkdWxlclBoYXNlW2ldID0gKHRoaXMuZ3JhaW5TY2hlZHVsZXJQaGFzZVtpXSArIDEpICUgdGhpcy5ncmFpblBlcmlvZCA7XG5cdFx0fVxuXHR9XG5cblx0LyogQHByaXZhdGUgKi9cblx0X2Fzc2lnbkdhaW4oKSB7XG5cdFx0Zm9yKGxldCBpID0gMDsgaSA8IDE2OyBpKyspe1xuXHRcdFx0bGV0IHRvVHJpO1xuXHRcdFx0Y29uc3Qgc2VtaUdyYWluUGVyaW9kID0gdGhpcy5ncmFpblBlcmlvZCAvIDI7XG5cdFx0XHRpZih0aGlzLmdyYWluU2NoZWR1bGVyUGhhc2VbaV08c2VtaUdyYWluUGVyaW9kKXtcblx0XHRcdFx0dG9UcmkgPSB0aGlzLmdyYWluU2NoZWR1bGVyUGhhc2VbaV0gLyBzZW1pR3JhaW5QZXJpb2QgOyAvLyByZXR1cm4gWzAsMV1cblx0XHRcdH1lbHNle1xuXHRcdFx0XHR0b1RyaSA9IChzZW1pR3JhaW5QZXJpb2QgLSAodGhpcy5ncmFpblNjaGVkdWxlclBoYXNlW2ldIC0gc2VtaUdyYWluUGVyaW9kKSkgLyBzZW1pR3JhaW5QZXJpb2Q7IC8vIHJldHVybiBbMCwxXVxuXHRcdFx0fVxuXHRcdFx0dG9UcmkgKj0gMC4yO1xuXHRcdFx0dGhpcy5nYWluW2ldLmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUodG9UcmksIGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSArIDAuMDAxKTtcblx0XHRcdGlmKHRvVHJpID09IDApe1xuXHRcdFx0XHR0aGlzLl9hc3NpZ25Qb3NpdGlvbihpKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHQvKiBAcHJpdmF0ZSAqL1xuXHRfYXNzaWduUG9zaXRpb24oaWQpIHtcblx0XHR0aGlzLmRlbGF5W2lkXS5kZWxheVRpbWUuc2V0VmFsdWVBdFRpbWUoTWF0aC5yYW5kb20oKSAqIHRoaXMucmFuZG9tUG9zaXRpb24gLyAxMDAwLCBhdWRpb0NvbnRleHQuY3VycmVudFRpbWUgKyAwLjAwMTUpO1xuXHR9XG5cbn0iXX0=