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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIk15R3JhaW4uanMiXSwibmFtZXMiOlsid2F2ZXMiLCJzb3VuZHdvcmtzIiwiYXVkaW9Db250ZXh0IiwiTXlHcmFpbiIsImlucHV0IiwiY3JlYXRlR2FpbiIsImdhaW4iLCJ2YWx1ZSIsIm91dHB1dCIsImdyYWluUGhhc2UiLCJkZWxheSIsInBlcmlvZCIsImdyYWluU2NoZWR1bGVyUGhhc2UiLCJpIiwibGVuZ3RoIiwiZmluZXNzZSIsInJhbmRvbVBvc2l0aW9uIiwicHVzaCIsImNyZWF0ZURlbGF5IiwiY29ubmVjdCIsImRlbGF5VGltZSIsIk1hdGgiLCJyYW5kb20iLCJkaXNjb25uZWN0IiwiZ3JhaW4iLCJ0aW1lIiwiX3VwZGF0ZVBoYXNlIiwiX2Fzc2lnbkdhaW4iLCJ0b1RyaSIsInNlbWlQZXJpb2QiLCJsaW5lYXJSYW1wVG9WYWx1ZUF0VGltZSIsImN1cnJlbnRUaW1lIiwiX2Fzc2lnblBvc2l0aW9uIiwiaWQiLCJzZXRWYWx1ZUF0VGltZSIsIkF1ZGlvVGltZUVuZ2luZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7O0lBQVlBLEs7O0FBQ1o7O0lBQVlDLFU7Ozs7OztBQUVaLElBQU1DLGVBQWVELFdBQVdDLFlBQWhDOztBQUVBOzs7Ozs7Ozs7Ozs7Ozs7OztJQWlCcUJDLE87OztBQUNwQixvQkFBYztBQUFBOztBQUFBOztBQUdiLFFBQUtDLEtBQUwsR0FBYUYsYUFBYUcsVUFBYixFQUFiO0FBQ0EsUUFBS0QsS0FBTCxDQUFXRSxJQUFYLENBQWdCQyxLQUFoQixHQUF3QixDQUF4Qjs7QUFFQSxRQUFLQyxNQUFMLEdBQWNOLGFBQWFHLFVBQWIsRUFBZDtBQUNBLFFBQUtHLE1BQUwsQ0FBWUYsSUFBWixDQUFpQkMsS0FBakIsR0FBeUIsQ0FBekI7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsUUFBS0UsVUFBTCxHQUFrQixDQUFDLENBQUQsRUFBSSxJQUFKLEVBQVUsS0FBVixFQUFpQixLQUFqQixFQUF3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ZmlsZSI6Ik15R3JhaW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyB3YXZlcyBmcm9tICd3YXZlcy1hdWRpbyc7XG5pbXBvcnQgKiBhcyBzb3VuZHdvcmtzIGZyb20gJ3NvdW5kd29ya3MvY2xpZW50JztcblxuY29uc3QgYXVkaW9Db250ZXh0ID0gc291bmR3b3Jrcy5hdWRpb0NvbnRleHQ7XG5cbi8qXG5cbmNvbnN0IG1hc3RlciA9IGF1ZGlvQ29udGV4dC5jcmVhdGVHYWluKCk7XG5tYXN0ZXIuY29ubmVjdChhdWRpb0NvbnRleC5kZXN0aW5hdGlvbik7XG5tYXN0ZXIuZ2Fpbi52YWx1ZSA9IDE7XG5cbmNvbnN0IG15R3JhaW4gPSBuZXcgbXlHcmFpbigpO1xubXlHcmFpbi5jb25uZWN0KG1hc3Rlcik7XG4vLyAuLi5cblxuY29uc3Qgc3JjID0gYXVkaW9Db250ZXh0LmNyZWF0ZUJ1ZmZlclNvdXJjZSgpO1xuc3JjLmJ1ZmZlciA9IGJ1ZmZlcjtcbnNyYy5jb25uZWN0KG15R3JhaW4uaW5wdXQpO1xuXG5cbiovXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE15R3JhaW4gZXh0ZW5kcyB3YXZlcy5BdWRpb1RpbWVFbmdpbmUge1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHRzdXBlcigpO1xuXG5cdFx0dGhpcy5pbnB1dCA9IGF1ZGlvQ29udGV4dC5jcmVhdGVHYWluKCk7XG5cdFx0dGhpcy5pbnB1dC5nYWluLnZhbHVlID0gMTtcblxuXHRcdHRoaXMub3V0cHV0ID0gYXVkaW9Db250ZXh0LmNyZWF0ZUdhaW4oKTtcblx0XHR0aGlzLm91dHB1dC5nYWluLnZhbHVlID0gMTtcblxuXHRcdC8vdGhpcy5mZWVkYmFjayA9IGF1ZGlvQ29udGV4dC5jcmVhdGVHYWluKCk7XG5cdFx0Ly90aGlzLmZlZWRiYWNrLmdhaW4udmFsdWUgPSAwLjE7XG5cdFx0Ly90aGlzLm91dHB1dC5jb25uZWN0KHRoaXMuZmVlZGJhY2spO1xuXHRcdC8vdGhpcy5mZWVkYmFjay5jb25uZWN0KHRoaXMuaW5wdXQpO1xuXG5cdFx0dGhpcy5ncmFpblBoYXNlID0gWzAsIDAuMjUsIDAuMTI1LCAwLjM3NSwgMC4wNzUsIDAuMzI1LCAwLjIsIDAuNCwgMC41LCAwLjc1LCAwLjYyNSwgMC44NzUsIDAuNTc1LCAwLjgyNSwgMC43LCAwLjldO1xuXHRcdHRoaXMuZ2FpbiA9IFtdO1xuXHRcdHRoaXMuZGVsYXkgPSBbXTtcblxuXHRcdC8vIEluaXRpYWxpc2F0aW9uIGRlcyBwYXJhbcOodHJlc1xuICAgIHRoaXMucGVyaW9kID0gMjU7IC8vTm9tYnJlIGRlIGNvdXAgZGUgc2NoZWR1bGVyIChtaW4gMTApXG5cblx0XHR0aGlzLmdyYWluU2NoZWR1bGVyUGhhc2UgPSBbXTtcbiAgICBmb3IobGV0IGkgPSAwOyBpPHRoaXMuZ3JhaW5QaGFzZS5sZW5ndGggOyBpKyspe1xuICAgIFx0dGhpcy5ncmFpblNjaGVkdWxlclBoYXNlW2ldID0gTWF0aC50cnVuYyh0aGlzLmdyYWluUGhhc2VbaV0qdGhpcy5wZXJpb2QpO1xuICAgIH1cbiAgICB0aGlzLmZpbmVzc2UgPSAwLjAyOyAvLyBwZXJpb2QgZHUgc2NoZWR1bGVyIFxuXHRcdHRoaXMucmFuZG9tUG9zaXRpb24gPSAxNTAwOyAvL21zXG5cdFx0Ly8gdGhpcy5yYW1wR2FpbkNvbXBlbnNhdGlvbj0gMC4wMDE1OyAvL21zXG5cblx0XHRmb3IobGV0IGkgPSAwOyBpIDwgMTY7IGkrKykgeyBcblx0XHRcdHRoaXMuZ2Fpbi5wdXNoKGF1ZGlvQ29udGV4dC5jcmVhdGVHYWluKCkpO1xuXHRcdFx0dGhpcy5kZWxheS5wdXNoKGF1ZGlvQ29udGV4dC5jcmVhdGVEZWxheSgyMCkpO1xuXHRcdFx0dGhpcy5pbnB1dC5jb25uZWN0KHRoaXMuZGVsYXlbaV0pO1xuXHRcdFx0dGhpcy5kZWxheVtpXS5jb25uZWN0KHRoaXMuZ2FpbltpXSk7XG5cdFx0XHR0aGlzLmRlbGF5W2ldLmRlbGF5VGltZS52YWx1ZSA9IE1hdGgucmFuZG9tKCkqdGhpcy5yYW5kb21Qb3NpdGlvbi8xMDAwLjtcblx0XHRcdHRoaXMuZ2FpbltpXS5jb25uZWN0KHRoaXMub3V0cHV0KTtcblx0XHR9XG5cblx0fVxuXG5cdC8qIElOVEVSRkFDRSAqL1xuXG5cdC8qIFB1YmxpYyAqL1xuXHRjb25uZWN0KG91dHB1dCkge1xuXHRcdHRoaXMub3V0cHV0LmNvbm5lY3Qob3V0cHV0KTtcblx0fVxuXG5cdC8qIFB1YmxpYyAqL1xuXHRkaXNjb25uZWN0KG91dHB1dCA9IG51bGwpIHtcblx0XHR0aGlzLm91dHB1dC5kaXNjb25uZWN0KG91dHB1dCk7XG5cdH1cblxuXHQvKiBQdWJsaWMgKi9cblx0cmVzZXQoKSB7XG5cdFx0dGhpcy5ncmFpbiA9IFswLCAwLjI1LCAwLjEyNSwgMC4zNzUsIDAuMDc1LCAwLjMyNSwgMC4yLCAwLjQsIDAuNSwgMC43NSwgMC42MjUsIDAuMzc1LCAwLjU3NSwgMC44MjUsIDAuNywgMC45XTtcblx0XHR0aGlzLmdyYWluU2NoZWR1bGVyUGhhc2UgPSBbXTtcbiAgICBmb3IobGV0IGkgPSAwOyBpPHRoaXMuZ3JhaW5QaGFzZS5sZW5ndGggOyBpKyspe1xuICAgIFx0dGhpcy5ncmFpblNjaGVkdWxlclBoYXNlW2ldID0gTWF0aC50cnVuYyh0aGlzLmdyYWluUGhhc2VbaV0qdGhpcy5wZXJpb2QpO1xuICAgIH1cblx0fVxuXG5cdC8qIFB1YmxpYyAqL1xuXHRhZHZhbmNlVGltZSh0aW1lKXtcblx0XHR0aGlzLl91cGRhdGVQaGFzZSgpO1xuXHRcdHRoaXMuX2Fzc2lnbkdhaW4oKTtcblx0XHRyZXR1cm4gdGltZSArIHRoaXMuZmluZXNzZTtcblx0fVxuXG5cdC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cblx0LyoqIEBwcml2YXRlICovXG5cdF91cGRhdGVQaGFzZSgpIHtcblx0XHRmb3IobGV0IGk9MDtpPDE2O2krKyl7XG5cdFx0XHR0aGlzLmdyYWluU2NoZWR1bGVyUGhhc2VbaV0gPSAodGhpcy5ncmFpblNjaGVkdWxlclBoYXNlW2ldICsgMSkgJSB0aGlzLnBlcmlvZCA7Ly89IHRoaXMuX25vcm0odGhpcy5ncmFpbltpXSk7XG5cdFx0fVxuXHR9XG5cblx0Ly8gLyogUHJpdmF0ZSAqL1xuXHQvLyBfbm9ybShwaGFzZSkge1xuXHQvLyBcdGxldCBwaGFzZVI7XG5cdC8vIFx0cGhhc2VSID0gKHBoYXNlKyh0aGlzLnBlcmlvZC90aGlzLmZpbmVzc2UpLzEwMDApJTE7XG5cdC8vIFx0cmV0dXJuIHBoYXNlUjtcblx0Ly8gfVxuXG5cdC8qIFByaXZhdGUgKi9cblx0X2Fzc2lnbkdhaW4oKSB7XG5cdFx0Zm9yKGxldCBpPTA7aTwxNjtpKyspe1xuXHRcdFx0bGV0IHRvVHJpO1xuXHRcdFx0Y29uc3Qgc2VtaVBlcmlvZCA9IHRoaXMucGVyaW9kLzI7XG5cdFx0XHRpZih0aGlzLmdyYWluU2NoZWR1bGVyUGhhc2VbaV08c2VtaVBlcmlvZCl7XG5cdFx0XHRcdHRvVHJpID0gdGhpcy5ncmFpblNjaGVkdWxlclBoYXNlW2ldL3NlbWlQZXJpb2QgOyAvLyByZXR1cm4gWzAsMV1cblx0XHRcdH1lbHNle1xuXHRcdFx0XHR0b1RyaSA9IChzZW1pUGVyaW9kIC0gKHRoaXMuZ3JhaW5TY2hlZHVsZXJQaGFzZVtpXS1zZW1pUGVyaW9kKSkvc2VtaVBlcmlvZDsgLy8gcmV0dXJuIFswLDFdXG5cdFx0XHR9XG5cdFx0XHR0b1RyaSAqPSAwLjI7XG5cdFx0XHR0aGlzLmdhaW5baV0uZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSh0b1RyaSwgYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lKzAuMDAxKTtcblx0XHRcdGlmKHRvVHJpPT0wKXtcblx0XHRcdFx0dGhpcy5fYXNzaWduUG9zaXRpb24oaSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0LyogUHJpdmF0ZSAqL1xuXHRfYXNzaWduUG9zaXRpb24oaWQpIHtcblx0XHR0aGlzLmRlbGF5W2lkXS5kZWxheVRpbWUuc2V0VmFsdWVBdFRpbWUoTWF0aC5yYW5kb20oKSp0aGlzLnJhbmRvbVBvc2l0aW9uLzEwMDAuLCBhdWRpb0NvbnRleHQuY3VycmVudFRpbWUrMC4wMDE1KTsvLyt0aGlzLnJhbXBHYWluQ29tcGVuc2F0aW9uKTtcblx0fVxufSJdfQ==