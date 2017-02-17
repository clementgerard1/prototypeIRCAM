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
		_this.period = 25; //Nombre de coup de scheduler (min 10)

		_this.grainSchedulerPhase = [];
		for (var i = 0; i < _this.grainPhase.length; i++) {
			_this.grainSchedulerPhase[i] = (0, _trunc2.default)(_this.grainPhase[i] * _this.period);
		}
		_this.finesse = 0.02; // period du scheduler 
		_this.randomPosition = 1500; //ms
		// this.rampGainCompensation= 0.0015; //ms

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

		// /* Private */
		// _norm(phase) {
		// 	let phaseR;
		// 	phaseR = (phase+(this.period/this.finesse)/1000)%1;
		// 	return phaseR;
		// }

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
			this.delay[id].delayTime.setValueAtTime(Math.random() * this.randomPosition / 1000., audioContext.currentTime + 0.0015); //+this.rampGainCompensation);
		}
	}]);
	return MyGrain;
}(waves.AudioTimeEngine);

exports.default = MyGrain;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIk15R3JhaW4yLmpzIl0sIm5hbWVzIjpbIndhdmVzIiwic291bmR3b3JrcyIsImF1ZGlvQ29udGV4dCIsIk15R3JhaW4iLCJpbnB1dCIsImNyZWF0ZUdhaW4iLCJnYWluIiwidmFsdWUiLCJvdXRwdXQiLCJncmFpblBoYXNlIiwiZGVsYXkiLCJwZXJpb2QiLCJncmFpblNjaGVkdWxlclBoYXNlIiwiaSIsImxlbmd0aCIsImZpbmVzc2UiLCJyYW5kb21Qb3NpdGlvbiIsInB1c2giLCJjcmVhdGVEZWxheSIsImNvbm5lY3QiLCJkZWxheVRpbWUiLCJNYXRoIiwicmFuZG9tIiwiZGlzY29ubmVjdCIsImdyYWluIiwidGltZSIsIl91cGRhdGVQaGFzZSIsIl9hc3NpZ25HYWluIiwidG9UcmkiLCJzZW1pUGVyaW9kIiwibGluZWFyUmFtcFRvVmFsdWVBdFRpbWUiLCJjdXJyZW50VGltZSIsIl9hc3NpZ25Qb3NpdGlvbiIsImlkIiwic2V0VmFsdWVBdFRpbWUiLCJBdWRpb1RpbWVFbmdpbmUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBOztJQUFZQSxLOztBQUNaOztJQUFZQyxVOzs7Ozs7QUFFWixJQUFNQyxlQUFlRCxXQUFXQyxZQUFoQzs7QUFFQTs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFpQnFCQyxPOzs7QUFDcEIsb0JBQWM7QUFBQTs7QUFBQTs7QUFHYixRQUFLQyxLQUFMLEdBQWFGLGFBQWFHLFVBQWIsRUFBYjtBQUNBLFFBQUtELEtBQUwsQ0FBV0UsSUFBWCxDQUFnQkMsS0FBaEIsR0FBd0IsQ0FBeEI7O0FBRUEsUUFBS0MsTUFBTCxHQUFjTixhQUFhRyxVQUFiLEVBQWQ7QUFDQSxRQUFLRyxNQUFMLENBQVlGLElBQVosQ0FBaUJDLEtBQWpCLEdBQXlCLENBQXpCOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLFFBQUtFLFVBQUwsR0FBa0IsQ0FBQyxDQUFELEVBQUksSUFBSixFQUFVLEtBQVYsRUFBaUIsS0FBakIsRUFB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ImZpbGUiOiJNeUdyYWluMi5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIHdhdmVzIGZyb20gJ3dhdmVzLWF1ZGlvJztcbmltcG9ydCAqIGFzIHNvdW5kd29ya3MgZnJvbSAnc291bmR3b3Jrcy9jbGllbnQnO1xuXG5jb25zdCBhdWRpb0NvbnRleHQgPSBzb3VuZHdvcmtzLmF1ZGlvQ29udGV4dDtcblxuLypcblxuY29uc3QgbWFzdGVyID0gYXVkaW9Db250ZXh0LmNyZWF0ZUdhaW4oKTtcbm1hc3Rlci5jb25uZWN0KGF1ZGlvQ29udGV4LmRlc3RpbmF0aW9uKTtcbm1hc3Rlci5nYWluLnZhbHVlID0gMTtcblxuY29uc3QgbXlHcmFpbiA9IG5ldyBteUdyYWluKCk7XG5teUdyYWluLmNvbm5lY3QobWFzdGVyKTtcbi8vIC4uLlxuXG5jb25zdCBzcmMgPSBhdWRpb0NvbnRleHQuY3JlYXRlQnVmZmVyU291cmNlKCk7XG5zcmMuYnVmZmVyID0gYnVmZmVyO1xuc3JjLmNvbm5lY3QobXlHcmFpbi5pbnB1dCk7XG5cblxuKi9cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTXlHcmFpbiBleHRlbmRzIHdhdmVzLkF1ZGlvVGltZUVuZ2luZSB7XG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHN1cGVyKCk7XG5cblx0XHR0aGlzLmlucHV0ID0gYXVkaW9Db250ZXh0LmNyZWF0ZUdhaW4oKTtcblx0XHR0aGlzLmlucHV0LmdhaW4udmFsdWUgPSAxO1xuXG5cdFx0dGhpcy5vdXRwdXQgPSBhdWRpb0NvbnRleHQuY3JlYXRlR2FpbigpO1xuXHRcdHRoaXMub3V0cHV0LmdhaW4udmFsdWUgPSAxO1xuXG5cdFx0Ly90aGlzLmZlZWRiYWNrID0gYXVkaW9Db250ZXh0LmNyZWF0ZUdhaW4oKTtcblx0XHQvL3RoaXMuZmVlZGJhY2suZ2Fpbi52YWx1ZSA9IDAuMTtcblx0XHQvL3RoaXMub3V0cHV0LmNvbm5lY3QodGhpcy5mZWVkYmFjayk7XG5cdFx0Ly90aGlzLmZlZWRiYWNrLmNvbm5lY3QodGhpcy5pbnB1dCk7XG5cblx0XHR0aGlzLmdyYWluUGhhc2UgPSBbMCwgMC4yNSwgMC4xMjUsIDAuMzc1LCAwLjA3NSwgMC4zMjUsIDAuMiwgMC40LCAwLjUsIDAuNzUsIDAuNjI1LCAwLjg3NSwgMC41NzUsIDAuODI1LCAwLjcsIDAuOV07XG5cdFx0dGhpcy5nYWluID0gW107XG5cdFx0dGhpcy5kZWxheSA9IFtdO1xuXG5cdFx0Ly8gSW5pdGlhbGlzYXRpb24gZGVzIHBhcmFtw6h0cmVzXG4gICAgdGhpcy5wZXJpb2QgPSAyNTsgLy9Ob21icmUgZGUgY291cCBkZSBzY2hlZHVsZXIgKG1pbiAxMClcblxuXHRcdHRoaXMuZ3JhaW5TY2hlZHVsZXJQaGFzZSA9IFtdO1xuICAgIGZvcihsZXQgaSA9IDA7IGk8dGhpcy5ncmFpblBoYXNlLmxlbmd0aCA7IGkrKyl7XG4gICAgXHR0aGlzLmdyYWluU2NoZWR1bGVyUGhhc2VbaV0gPSBNYXRoLnRydW5jKHRoaXMuZ3JhaW5QaGFzZVtpXSp0aGlzLnBlcmlvZCk7XG4gICAgfVxuICAgIHRoaXMuZmluZXNzZSA9IDAuMDI7IC8vIHBlcmlvZCBkdSBzY2hlZHVsZXIgXG5cdFx0dGhpcy5yYW5kb21Qb3NpdGlvbiA9IDE1MDA7IC8vbXNcblx0XHQvLyB0aGlzLnJhbXBHYWluQ29tcGVuc2F0aW9uPSAwLjAwMTU7IC8vbXNcblxuXHRcdGZvcihsZXQgaSA9IDA7IGkgPCAxNjsgaSsrKSB7IFxuXHRcdFx0dGhpcy5nYWluLnB1c2goYXVkaW9Db250ZXh0LmNyZWF0ZUdhaW4oKSk7XG5cdFx0XHR0aGlzLmRlbGF5LnB1c2goYXVkaW9Db250ZXh0LmNyZWF0ZURlbGF5KDIwKSk7XG5cdFx0XHR0aGlzLmlucHV0LmNvbm5lY3QodGhpcy5kZWxheVtpXSk7XG5cdFx0XHR0aGlzLmRlbGF5W2ldLmNvbm5lY3QodGhpcy5nYWluW2ldKTtcblx0XHRcdHRoaXMuZGVsYXlbaV0uZGVsYXlUaW1lLnZhbHVlID0gTWF0aC5yYW5kb20oKSp0aGlzLnJhbmRvbVBvc2l0aW9uLzEwMDAuO1xuXHRcdFx0dGhpcy5nYWluW2ldLmNvbm5lY3QodGhpcy5vdXRwdXQpO1xuXHRcdH1cblxuXHR9XG5cblx0LyogSU5URVJGQUNFICovXG5cblx0LyogUHVibGljICovXG5cdGNvbm5lY3Qob3V0cHV0KSB7XG5cdFx0dGhpcy5vdXRwdXQuY29ubmVjdChvdXRwdXQpO1xuXHR9XG5cblx0LyogUHVibGljICovXG5cdGRpc2Nvbm5lY3Qob3V0cHV0ID0gbnVsbCkge1xuXHRcdHRoaXMub3V0cHV0LmRpc2Nvbm5lY3Qob3V0cHV0KTtcblx0fVxuXG5cdC8qIFB1YmxpYyAqL1xuXHRyZXNldCgpIHtcblx0XHR0aGlzLmdyYWluID0gWzAsIDAuMjUsIDAuMTI1LCAwLjM3NSwgMC4wNzUsIDAuMzI1LCAwLjIsIDAuNCwgMC41LCAwLjc1LCAwLjYyNSwgMC4zNzUsIDAuNTc1LCAwLjgyNSwgMC43LCAwLjldO1xuXHRcdHRoaXMuZ3JhaW5TY2hlZHVsZXJQaGFzZSA9IFtdO1xuICAgIGZvcihsZXQgaSA9IDA7IGk8dGhpcy5ncmFpblBoYXNlLmxlbmd0aCA7IGkrKyl7XG4gICAgXHR0aGlzLmdyYWluU2NoZWR1bGVyUGhhc2VbaV0gPSBNYXRoLnRydW5jKHRoaXMuZ3JhaW5QaGFzZVtpXSp0aGlzLnBlcmlvZCk7XG4gICAgfVxuXHR9XG5cblx0LyogUHVibGljICovXG5cdGFkdmFuY2VUaW1lKHRpbWUpe1xuXHRcdHRoaXMuX3VwZGF0ZVBoYXNlKCk7XG5cdFx0dGhpcy5fYXNzaWduR2FpbigpO1xuXHRcdHJldHVybiB0aW1lICsgdGhpcy5maW5lc3NlO1xuXHR9XG5cblx0Ly8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblxuXHQvKiogQHByaXZhdGUgKi9cblx0X3VwZGF0ZVBoYXNlKCkge1xuXHRcdGZvcihsZXQgaT0wO2k8MTY7aSsrKXtcblx0XHRcdHRoaXMuZ3JhaW5TY2hlZHVsZXJQaGFzZVtpXSA9ICh0aGlzLmdyYWluU2NoZWR1bGVyUGhhc2VbaV0gKyAxKSAlIHRoaXMucGVyaW9kIDsvLz0gdGhpcy5fbm9ybSh0aGlzLmdyYWluW2ldKTtcblx0XHR9XG5cdH1cblxuXHQvLyAvKiBQcml2YXRlICovXG5cdC8vIF9ub3JtKHBoYXNlKSB7XG5cdC8vIFx0bGV0IHBoYXNlUjtcblx0Ly8gXHRwaGFzZVIgPSAocGhhc2UrKHRoaXMucGVyaW9kL3RoaXMuZmluZXNzZSkvMTAwMCklMTtcblx0Ly8gXHRyZXR1cm4gcGhhc2VSO1xuXHQvLyB9XG5cblx0LyogUHJpdmF0ZSAqL1xuXHRfYXNzaWduR2FpbigpIHtcblx0XHRmb3IobGV0IGk9MDtpPDE2O2krKyl7XG5cdFx0XHRsZXQgdG9Ucmk7XG5cdFx0XHRjb25zdCBzZW1pUGVyaW9kID0gdGhpcy5wZXJpb2QvMjtcblx0XHRcdGlmKHRoaXMuZ3JhaW5TY2hlZHVsZXJQaGFzZVtpXTxzZW1pUGVyaW9kKXtcblx0XHRcdFx0dG9UcmkgPSB0aGlzLmdyYWluU2NoZWR1bGVyUGhhc2VbaV0vc2VtaVBlcmlvZCA7IC8vIHJldHVybiBbMCwxXVxuXHRcdFx0fWVsc2V7XG5cdFx0XHRcdHRvVHJpID0gKHNlbWlQZXJpb2QgLSAodGhpcy5ncmFpblNjaGVkdWxlclBoYXNlW2ldLXNlbWlQZXJpb2QpKS9zZW1pUGVyaW9kOyAvLyByZXR1cm4gWzAsMV1cblx0XHRcdH1cblx0XHRcdHRvVHJpICo9IDAuMjtcblx0XHRcdHRoaXMuZ2FpbltpXS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKHRvVHJpLCBhdWRpb0NvbnRleHQuY3VycmVudFRpbWUrMC4wMDEpO1xuXHRcdFx0aWYodG9Ucmk9PTApe1xuXHRcdFx0XHR0aGlzLl9hc3NpZ25Qb3NpdGlvbihpKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHQvKiBQcml2YXRlICovXG5cdF9hc3NpZ25Qb3NpdGlvbihpZCkge1xuXHRcdHRoaXMuZGVsYXlbaWRdLmRlbGF5VGltZS5zZXRWYWx1ZUF0VGltZShNYXRoLnJhbmRvbSgpKnRoaXMucmFuZG9tUG9zaXRpb24vMTAwMC4sIGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSswLjAwMTUpOy8vK3RoaXMucmFtcEdhaW5Db21wZW5zYXRpb24pO1xuXHR9XG59Il19