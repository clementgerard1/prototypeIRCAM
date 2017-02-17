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

/*

const master = audioContext.createGain();
master.connect(audioContex.destination);
master.gain.value = 1;

const myGrain = new myGrain();
myGrain.connect(master);
// ...

const src = audioContext.createBufferSource();
src.buffer = buffer;
src.connect(myGrain.input);


*/

var MyGrain = function (_waves$AudioTimeEngin) {
	(0, _inherits3.default)(MyGrain, _waves$AudioTimeEngin);

	function MyGrain() {
		(0, _classCallCheck3.default)(this, MyGrain);

		var _this = (0, _possibleConstructorReturn3.default)(this, (MyGrain.__proto__ || (0, _getPrototypeOf2.default)(MyGrain)).call(this));

		_this.input = audioContext.createGain();
		_this.input.gain.value = 1;

		_this.output = audioContext.createGain();
		_this.output.gain.value = 1;

		//this.feedback = audioContext.createGain();
		//this.feedback.gain.value = 0.1;
		//this.output.connect(this.feedback);
		//this.feedback.connect(this.input);

		_this.grainPhase = [0, 0.25, 0.125, 0.375, 0.075, 0.325, 0.2, 0.4, 0.5, 0.75, 0.625, 0.875, 0.575, 0.825, 0.7, 0.9];
		_this.gain = [];
		_this.delay = [];

		// Initialisation des paramètres
		_this.period = 100; //Nombre de coup de scheduler (min 10)

		_this.grainSchedulerPhase = [];
		for (var i = 0; i < _this.grainPhase.length; i++) {
			_this.grainSchedulerPhase[i] = (0, _trunc2.default)(_this.grainPhase[i] * _this.period);
		}
		_this.finesse = 0.005; // period du scheduler 
		_this.randomPosition = 1500; //ms
		_this.rampGainCompensation = 0.001; //ms

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

	/* INTERFACE */

	/* Public */


	(0, _createClass3.default)(MyGrain, [{
		key: 'connect',
		value: function connect(output) {
			this.output.connect(output);
		}

		/* Public */

	}, {
		key: 'disconnect',
		value: function disconnect() {
			var output = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

			this.output.disconnect(output);
		}

		/* Public */

	}, {
		key: 'reset',
		value: function reset() {
			this.grain = [0, 0.25, 0.125, 0.375, 0.075, 0.325, 0.2, 0.4, 0.5, 0.75, 0.625, 0.375, 0.575, 0.825, 0.7, 0.9];
			this.grainSchedulerPhase = [];
			for (var i = 0; i < this.grainPhase.length; i++) {
				this.grainSchedulerPhase[i] = (0, _trunc2.default)(this.grainPhase[i] * this.period);
			}
		}

		/* Public */

	}, {
		key: 'advanceTime',
		value: function advanceTime(time) {
			this._updatePhase();
			this._assignGain();
			return time + this.finesse;
		}

		//-------------------------------------------------


		/** @private */

	}, {
		key: '_updatePhase',
		value: function _updatePhase() {
			for (var i = 0; i < 16; i++) {
				this.grainSchedulerPhase[i] = (this.grainSchedulerPhase[i] + 1) % this.period; //= this._norm(this.grain[i]);
			}
		}

		/* Private */

	}, {
		key: '_norm',
		value: function _norm(phase) {
			var phaseR = void 0;
			phaseR = (phase + this.period / this.finesse / 1000) % 1;
			return phaseR;
		}

		/* Private */

	}, {
		key: '_assignGain',
		value: function _assignGain() {
			for (var i = 0; i < 16; i++) {
				var toTri = void 0;
				var semiPeriod = this.period / 2;
				if (this.grainSchedulerPhase[i] < semiPeriod) {
					toTri = this.grainSchedulerPhase[i] / semiPeriod; // return [0,1]
				} else {
					toTri = (semiPeriod - (this.grainSchedulerPhase[i] - semiPeriod)) / semiPeriod; // return [0,1]
				}
				toTri *= 0.2;
				this.gain[i].gain.linearRampToValueAtTime(toTri, audioContext.currentTime + 0.001);
				if (toTri == 0) {
					this._assignPosition(i);
				}
			}
		}

		/* Private */

	}, {
		key: '_assignPosition',
		value: function _assignPosition(id) {
			this.delay[id].delayTime.setValueAtTime(Math.random() * this.randomPosition / 1000., audioContext.currentTime + 0.001); //+this.rampGainCompensation);
		}
	}]);
	return MyGrain;
}(waves.AudioTimeEngine);

exports.default = MyGrain;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIk15R3JhaW4yLmpzIl0sIm5hbWVzIjpbIndhdmVzIiwic291bmR3b3JrcyIsImF1ZGlvQ29udGV4dCIsIk15R3JhaW4iLCJpbnB1dCIsImNyZWF0ZUdhaW4iLCJnYWluIiwidmFsdWUiLCJvdXRwdXQiLCJncmFpblBoYXNlIiwiZGVsYXkiLCJwZXJpb2QiLCJncmFpblNjaGVkdWxlclBoYXNlIiwiaSIsImxlbmd0aCIsImZpbmVzc2UiLCJyYW5kb21Qb3NpdGlvbiIsInJhbXBHYWluQ29tcGVuc2F0aW9uIiwicHVzaCIsImNyZWF0ZURlbGF5IiwiY29ubmVjdCIsImRlbGF5VGltZSIsIk1hdGgiLCJyYW5kb20iLCJkaXNjb25uZWN0IiwiZ3JhaW4iLCJ0aW1lIiwiX3VwZGF0ZVBoYXNlIiwiX2Fzc2lnbkdhaW4iLCJwaGFzZSIsInBoYXNlUiIsInRvVHJpIiwic2VtaVBlcmlvZCIsImxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lIiwiY3VycmVudFRpbWUiLCJfYXNzaWduUG9zaXRpb24iLCJpZCIsInNldFZhbHVlQXRUaW1lIiwiQXVkaW9UaW1lRW5naW5lIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7SUFBWUEsSzs7QUFDWjs7SUFBWUMsVTs7Ozs7O0FBRVosSUFBTUMsZUFBZUQsV0FBV0MsWUFBaEM7O0FBRUE7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBaUJxQkMsTzs7O0FBQ3BCLG9CQUFjO0FBQUE7O0FBQUE7O0FBR2IsUUFBS0MsS0FBTCxHQUFhRixhQUFhRyxVQUFiLEVBQWI7QUFDQSxRQUFLRCxLQUFMLENBQVdFLElBQVgsQ0FBZ0JDLEtBQWhCLEdBQXdCLENBQXhCOztBQUVBLFFBQUtDLE1BQUwsR0FBY04sYUFBYUcsVUFBYixFQUFkO0FBQ0EsUUFBS0csTUFBTCxDQUFZRixJQUFaLENBQWlCQyxLQUFqQixHQUF5QixDQUF6Qjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxRQUFLRSxVQUFMLEdBQWtCLENBQUMs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RSxFQUFJO0FBQ25CLFFBQUsxQixLQUFMLENBQVcwQixFQUFYLEVBQWVmLFNBQWYsQ0FBeUJnQixjQUF6QixDQUF3Q2YsS0FBS0MsTUFBTCxLQUFjLEtBQUtQLGNBQW5CLEdBQWtDLEtBQTFFLEVBQWlGZCxhQUFhZ0MsV0FBYixHQUF5QixLQUExRyxFQURtQixDQUM4RjtBQUNqSDs7O0VBM0dtQ2xDLE1BQU1zQyxlOztrQkFBdEJuQyxPIiwiZmlsZSI6Ik15R3JhaW4yLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgd2F2ZXMgZnJvbSAnd2F2ZXMtYXVkaW8nO1xuaW1wb3J0ICogYXMgc291bmR3b3JrcyBmcm9tICdzb3VuZHdvcmtzL2NsaWVudCc7XG5cbmNvbnN0IGF1ZGlvQ29udGV4dCA9IHNvdW5kd29ya3MuYXVkaW9Db250ZXh0O1xuXG4vKlxuXG5jb25zdCBtYXN0ZXIgPSBhdWRpb0NvbnRleHQuY3JlYXRlR2FpbigpO1xubWFzdGVyLmNvbm5lY3QoYXVkaW9Db250ZXguZGVzdGluYXRpb24pO1xubWFzdGVyLmdhaW4udmFsdWUgPSAxO1xuXG5jb25zdCBteUdyYWluID0gbmV3IG15R3JhaW4oKTtcbm15R3JhaW4uY29ubmVjdChtYXN0ZXIpO1xuLy8gLi4uXG5cbmNvbnN0IHNyYyA9IGF1ZGlvQ29udGV4dC5jcmVhdGVCdWZmZXJTb3VyY2UoKTtcbnNyYy5idWZmZXIgPSBidWZmZXI7XG5zcmMuY29ubmVjdChteUdyYWluLmlucHV0KTtcblxuXG4qL1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNeUdyYWluIGV4dGVuZHMgd2F2ZXMuQXVkaW9UaW1lRW5naW5lIHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0c3VwZXIoKTtcblxuXHRcdHRoaXMuaW5wdXQgPSBhdWRpb0NvbnRleHQuY3JlYXRlR2FpbigpO1xuXHRcdHRoaXMuaW5wdXQuZ2Fpbi52YWx1ZSA9IDE7XG5cblx0XHR0aGlzLm91dHB1dCA9IGF1ZGlvQ29udGV4dC5jcmVhdGVHYWluKCk7XG5cdFx0dGhpcy5vdXRwdXQuZ2Fpbi52YWx1ZSA9IDE7XG5cblx0XHQvL3RoaXMuZmVlZGJhY2sgPSBhdWRpb0NvbnRleHQuY3JlYXRlR2FpbigpO1xuXHRcdC8vdGhpcy5mZWVkYmFjay5nYWluLnZhbHVlID0gMC4xO1xuXHRcdC8vdGhpcy5vdXRwdXQuY29ubmVjdCh0aGlzLmZlZWRiYWNrKTtcblx0XHQvL3RoaXMuZmVlZGJhY2suY29ubmVjdCh0aGlzLmlucHV0KTtcblxuXHRcdHRoaXMuZ3JhaW5QaGFzZSA9IFswLCAwLjI1LCAwLjEyNSwgMC4zNzUsIDAuMDc1LCAwLjMyNSwgMC4yLCAwLjQsIDAuNSwgMC43NSwgMC42MjUsIDAuODc1LCAwLjU3NSwgMC44MjUsIDAuNywgMC45XTtcblx0XHR0aGlzLmdhaW4gPSBbXTtcblx0XHR0aGlzLmRlbGF5ID0gW107XG5cblx0XHQvLyBJbml0aWFsaXNhdGlvbiBkZXMgcGFyYW3DqHRyZXNcbiAgICB0aGlzLnBlcmlvZCA9IDEwMDsgLy9Ob21icmUgZGUgY291cCBkZSBzY2hlZHVsZXIgKG1pbiAxMClcblxuXHRcdHRoaXMuZ3JhaW5TY2hlZHVsZXJQaGFzZSA9IFtdO1xuICAgIGZvcihsZXQgaSA9IDA7IGk8dGhpcy5ncmFpblBoYXNlLmxlbmd0aCA7IGkrKyl7XG4gICAgXHR0aGlzLmdyYWluU2NoZWR1bGVyUGhhc2VbaV0gPSBNYXRoLnRydW5jKHRoaXMuZ3JhaW5QaGFzZVtpXSp0aGlzLnBlcmlvZCk7XG4gICAgfVxuICAgIHRoaXMuZmluZXNzZSA9IDAuMDA1OyAvLyBwZXJpb2QgZHUgc2NoZWR1bGVyIFxuXHRcdHRoaXMucmFuZG9tUG9zaXRpb24gPSAxNTAwOyAvL21zXG5cdFx0dGhpcy5yYW1wR2FpbkNvbXBlbnNhdGlvbj0gMC4wMDE7IC8vbXNcblxuXHRcdGZvcihsZXQgaSA9IDA7IGkgPCAxNjsgaSsrKSB7IFxuXHRcdFx0dGhpcy5nYWluLnB1c2goYXVkaW9Db250ZXh0LmNyZWF0ZUdhaW4oKSk7XG5cdFx0XHR0aGlzLmRlbGF5LnB1c2goYXVkaW9Db250ZXh0LmNyZWF0ZURlbGF5KDIwKSk7XG5cdFx0XHR0aGlzLmlucHV0LmNvbm5lY3QodGhpcy5kZWxheVtpXSk7XG5cdFx0XHR0aGlzLmRlbGF5W2ldLmNvbm5lY3QodGhpcy5nYWluW2ldKTtcblx0XHRcdHRoaXMuZGVsYXlbaV0uZGVsYXlUaW1lLnZhbHVlID0gTWF0aC5yYW5kb20oKSp0aGlzLnJhbmRvbVBvc2l0aW9uLzEwMDAuO1xuXHRcdFx0dGhpcy5nYWluW2ldLmNvbm5lY3QodGhpcy5vdXRwdXQpO1xuXHRcdH1cblxuXHR9XG5cblx0LyogSU5URVJGQUNFICovXG5cblx0LyogUHVibGljICovXG5cdGNvbm5lY3Qob3V0cHV0KSB7XG5cdFx0dGhpcy5vdXRwdXQuY29ubmVjdChvdXRwdXQpO1xuXHR9XG5cblx0LyogUHVibGljICovXG5cdGRpc2Nvbm5lY3Qob3V0cHV0ID0gbnVsbCkge1xuXHRcdHRoaXMub3V0cHV0LmRpc2Nvbm5lY3Qob3V0cHV0KTtcblx0fVxuXG5cdC8qIFB1YmxpYyAqL1xuXHRyZXNldCgpIHtcblx0XHR0aGlzLmdyYWluID0gWzAsIDAuMjUsIDAuMTI1LCAwLjM3NSwgMC4wNzUsIDAuMzI1LCAwLjIsIDAuNCwgMC41LCAwLjc1LCAwLjYyNSwgMC4zNzUsIDAuNTc1LCAwLjgyNSwgMC43LCAwLjldO1xuXHRcdHRoaXMuZ3JhaW5TY2hlZHVsZXJQaGFzZSA9IFtdO1xuICAgIGZvcihsZXQgaSA9IDA7IGk8dGhpcy5ncmFpblBoYXNlLmxlbmd0aCA7IGkrKyl7XG4gICAgXHR0aGlzLmdyYWluU2NoZWR1bGVyUGhhc2VbaV0gPSBNYXRoLnRydW5jKHRoaXMuZ3JhaW5QaGFzZVtpXSp0aGlzLnBlcmlvZCk7XG4gICAgfVxuXHR9XG5cblx0LyogUHVibGljICovXG5cdGFkdmFuY2VUaW1lKHRpbWUpe1xuXHRcdHRoaXMuX3VwZGF0ZVBoYXNlKCk7XG5cdFx0dGhpcy5fYXNzaWduR2FpbigpO1xuXHRcdHJldHVybiB0aW1lICsgdGhpcy5maW5lc3NlO1xuXHR9XG5cblx0Ly8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblxuXHQvKiogQHByaXZhdGUgKi9cblx0X3VwZGF0ZVBoYXNlKCkge1xuXHRcdGZvcihsZXQgaT0wO2k8MTY7aSsrKXtcblx0XHRcdHRoaXMuZ3JhaW5TY2hlZHVsZXJQaGFzZVtpXSA9ICh0aGlzLmdyYWluU2NoZWR1bGVyUGhhc2VbaV0gKyAxKSAlIHRoaXMucGVyaW9kIDsvLz0gdGhpcy5fbm9ybSh0aGlzLmdyYWluW2ldKTtcblx0XHR9XG5cdH1cblxuXHQvKiBQcml2YXRlICovXG5cdF9ub3JtKHBoYXNlKSB7XG5cdFx0bGV0IHBoYXNlUjtcblx0XHRwaGFzZVIgPSAocGhhc2UrKHRoaXMucGVyaW9kL3RoaXMuZmluZXNzZSkvMTAwMCklMTtcblx0XHRyZXR1cm4gcGhhc2VSO1xuXHR9XG5cblx0LyogUHJpdmF0ZSAqL1xuXHRfYXNzaWduR2FpbigpIHtcblx0XHRmb3IobGV0IGk9MDtpPDE2O2krKyl7XG5cdFx0XHRsZXQgdG9Ucmk7XG5cdFx0XHRjb25zdCBzZW1pUGVyaW9kID0gdGhpcy5wZXJpb2QvMjtcblx0XHRcdGlmKHRoaXMuZ3JhaW5TY2hlZHVsZXJQaGFzZVtpXTxzZW1pUGVyaW9kKXtcblx0XHRcdFx0dG9UcmkgPSB0aGlzLmdyYWluU2NoZWR1bGVyUGhhc2VbaV0vc2VtaVBlcmlvZCA7IC8vIHJldHVybiBbMCwxXVxuXHRcdFx0fWVsc2V7XG5cdFx0XHRcdHRvVHJpID0gKHNlbWlQZXJpb2QgLSAodGhpcy5ncmFpblNjaGVkdWxlclBoYXNlW2ldLXNlbWlQZXJpb2QpKS9zZW1pUGVyaW9kOyAvLyByZXR1cm4gWzAsMV1cblx0XHRcdH1cblx0XHRcdHRvVHJpICo9IDAuMjtcblx0XHRcdHRoaXMuZ2FpbltpXS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKHRvVHJpLCBhdWRpb0NvbnRleHQuY3VycmVudFRpbWUrMC4wMDEpO1xuXHRcdFx0aWYodG9Ucmk9PTApe1xuXHRcdFx0XHR0aGlzLl9hc3NpZ25Qb3NpdGlvbihpKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHQvKiBQcml2YXRlICovXG5cdF9hc3NpZ25Qb3NpdGlvbihpZCkge1xuXHRcdHRoaXMuZGVsYXlbaWRdLmRlbGF5VGltZS5zZXRWYWx1ZUF0VGltZShNYXRoLnJhbmRvbSgpKnRoaXMucmFuZG9tUG9zaXRpb24vMTAwMC4sIGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSswLjAwMSk7Ly8rdGhpcy5yYW1wR2FpbkNvbXBlbnNhdGlvbik7XG5cdH1cbn0iXX0=