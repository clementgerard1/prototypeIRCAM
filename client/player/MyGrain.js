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

		_this.feedback = audioContext.createGain();
		_this.feedback.gain.value = 0.1;
		_this.output.connect(_this.feedback);
		_this.feedback.connect(_this.input);

		_this.grain = [0, 0.25, 0.125, 0.375, 0.075, 0.325, 0.2, 0.4, 0.5, 0.75, 0.625, 0.875, 0.575, 0.825, 0.7, 0.9];
		_this.gain = [];
		_this.delay = [];

		// Initialisation des paramètres
		_this.period = 300; //ms
		_this.finesse = 10;
		_this.randomPosition = 1500; //ms
		_this.rampGainCompensation = 10; //ms

		for (var i = 0; i < 16; i++) {
			_this.gain.push(audioContext.createGain());
			_this.delay.push(audioContext.createDelay(20));
			_this.input.connect(_this.delay[i]);
			_this.delay[i].connect(_this.gain[i]);
			_this.delay[i].delayTime.value = Math.random() * _this.randomPosition / 1000.;
			_this.gain[i].connect(_this.output);
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
		}

		/* Public */

	}, {
		key: 'advanceTime',
		value: function advanceTime(time) {
			this._updatePhase();
			this._assignGain();
			return time + this.finesse / (this.period * 2);
		}

		//-------------------------------------------------


		/** @private */

	}, {
		key: '_updatePhase',
		value: function _updatePhase() {
			for (var i = 0; i < 16; i++) {
				this.grain[i] = this._norm(this.grain[i]);
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
				//console.log(this.grain[i]);
				if (Math.abs(this.grain[i] - 0.5) * 2 * 0.2 > 0.1) {
					this.gain[i].gain.value = Math.abs(this.grain[i] - 0.5) * 2 * 0.2;
				} else {
					this.gain[i].gain.value = 0;
					this._assignPosition(i);
				}
			}
		}

		/* Private */

	}, {
		key: '_assignPosition',
		value: function _assignPosition(id) {
			//console.log("update");
			this.delay[id].delayTime.setValueAtTime(Math.random() * this.randomPosition / 1000., audioContext.currentTime + this.rampGainCompensation / 1000.);
		}
	}]);
	return MyGrain;
}(waves.AudioTimeEngine);

exports.default = MyGrain;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIk15R3JhaW4uanMiXSwibmFtZXMiOlsid2F2ZXMiLCJzb3VuZHdvcmtzIiwiYXVkaW9Db250ZXh0IiwiTXlHcmFpbiIsImlucHV0IiwiY3JlYXRlR2FpbiIsImdhaW4iLCJ2YWx1ZSIsIm91dHB1dCIsImZlZWRiYWNrIiwiY29ubmVjdCIsImdyYWluIiwiZGVsYXkiLCJwZXJpb2QiLCJmaW5lc3NlIiwicmFuZG9tUG9zaXRpb24iLCJyYW1wR2FpbkNvbXBlbnNhdGlvbiIsImkiLCJwdXNoIiwiY3JlYXRlRGVsYXkiLCJkZWxheVRpbWUiLCJNYXRoIiwicmFuZG9tIiwiZGlzY29ubmVjdCIsInRpbWUiLCJfdXBkYXRlUGhhc2UiLCJfYXNzaWduR2FpbiIsIl9ub3JtIiwicGhhc2UiLCJwaGFzZVIiLCJhYnMiLCJfYXNzaWduUG9zaXRpb24iLCJpZCIsInNldFZhbHVlQXRUaW1lIiwiY3VycmVudFRpbWUiLCJBdWRpb1RpbWVFbmdpbmUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7O0lBQVlBLEs7O0FBQ1o7O0lBQVlDLFU7Ozs7OztBQUVaLElBQU1DLGVBQWVELFdBQVdDLFlBQWhDOztBQUVBOzs7Ozs7Ozs7Ozs7Ozs7OztJQWlCcUJDLE87OztBQUNwQixvQkFBYztBQUFBOztBQUFBOztBQUdiLFFBQUtDLEtBQUwsR0FBYUYsYUFBYUcsVUFBYixFQUFiO0FBQ0EsUUFBS0QsS0FBTCxDQUFXRSxJQUFYLENBQWdCQyxLQUFoQixHQUF3QixDQUF4Qjs7QUFFQSxRQUFLQyxNQUFMLEdBQWNOLGFBQWFHLFVBQWIsRUFBZDtBQUNBLFFBQUtHLE1BQUwsQ0FBWUYsSUFBWixDQUFpQkMsS0FBakIsR0FBeUIsQ0FBekI7O0FBRUEsUUFBS0UsUUFBTCxHQUFnQlAsYUFBYUcsVUFBYixFQUFoQjtBQUNBLFFBQUtJLFFBQUwsQ0FBY0gsSUFBZCxDQUFtQkMsS0FBbkIsR0FBMkIsR0FBM0I7QUFDQSxRQUFLQyxNQUFMLENBQVlFLE9BQVos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RDs7OztnQ0FDYztBQUNiLFFBQUksSUFBSVosSUFBRSxDQUFWLEVBQVlBLElBQUUsRUFBZCxFQUFpQkEsR0FBakIsRUFBcUI7QUFDcEI7QUFDQSxRQUFJSSxLQUFLUyxHQUFMLENBQVMsS0FBS25CLEtBQUwsQ0FBV00sQ0FBWCxJQUFjLEdBQXZCLElBQTRCLENBQTVCLEdBQThCLEdBQS9CLEdBQW9DLEdBQXZDLEVBQTJDO0FBQzFDLFVBQUtYLElBQUwsQ0FBVVcsQ0FBVixFQUFhWCxJQUFiLENBQWtCQyxLQUFsQixHQUEwQmMsS0FBS1MsR0FBTCxDQUFTLEtBQUtuQixLQUFMLENBQVdNLENBQVgsSUFBYyxHQUF2QixJQUE0QixDQUE1QixHQUE4QixHQUF4RDtBQUNBLEtBRkQsTUFFSztBQUNKLFVBQUtYLElBQUwsQ0FBVVcsQ0FBVixFQUFhWCxJQUFiLENBQWtCQyxLQUFsQixHQUEwQixDQUExQjtBQUNBLFVBQUt3QixlQUFMLENBQXFCZCxDQUFyQjtBQUNBO0FBQ0Q7QUFDRDs7QUFFRDs7OztrQ0FDZ0JlLEUsRUFBSTtBQUNuQjtBQUNBLFFBQUtwQixLQUFMLENBQVdvQixFQUFYLEVBQWVaLFNBQWYsQ0FBeUJhLGNBQXpCLENBQXdDWixLQUFLQyxNQUFMLEtBQWMsS0FBS1AsY0FBbkIsR0FBa0MsS0FBMUUsRUFBa0ZiLGFBQWFnQyxXQUFiLEdBQXlCLEtBQUtsQixvQkFBTCxHQUEwQixLQUFySTtBQUNBOzs7RUE5Rm1DaEIsTUFBTW1DLGU7O2tCQUF0QmhDLE8iLCJmaWxlIjoiTXlHcmFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIHdhdmVzIGZyb20gJ3dhdmVzLWF1ZGlvJztcbmltcG9ydCAqIGFzIHNvdW5kd29ya3MgZnJvbSAnc291bmR3b3Jrcy9jbGllbnQnO1xuXG5jb25zdCBhdWRpb0NvbnRleHQgPSBzb3VuZHdvcmtzLmF1ZGlvQ29udGV4dDtcblxuLypcblxuY29uc3QgbWFzdGVyID0gYXVkaW9Db250ZXh0LmNyZWF0ZUdhaW4oKTtcbm1hc3Rlci5jb25uZWN0KGF1ZGlvQ29udGV4LmRlc3RpbmF0aW9uKTtcbm1hc3Rlci5nYWluLnZhbHVlID0gMTtcblxuY29uc3QgbXlHcmFpbiA9IG5ldyBteUdyYWluKCk7XG5teUdyYWluLmNvbm5lY3QobWFzdGVyKTtcbi8vIC4uLlxuXG5jb25zdCBzcmMgPSBhdWRpb0NvbnRleHQuY3JlYXRlQnVmZmVyU291cmNlKCk7XG5zcmMuYnVmZmVyID0gYnVmZmVyO1xuc3JjLmNvbm5lY3QobXlHcmFpbi5pbnB1dCk7XG5cblxuKi9cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTXlHcmFpbiBleHRlbmRzIHdhdmVzLkF1ZGlvVGltZUVuZ2luZSB7XG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHN1cGVyKCk7XG5cblx0XHR0aGlzLmlucHV0ID0gYXVkaW9Db250ZXh0LmNyZWF0ZUdhaW4oKTtcblx0XHR0aGlzLmlucHV0LmdhaW4udmFsdWUgPSAxO1xuXG5cdFx0dGhpcy5vdXRwdXQgPSBhdWRpb0NvbnRleHQuY3JlYXRlR2FpbigpO1xuXHRcdHRoaXMub3V0cHV0LmdhaW4udmFsdWUgPSAxO1xuXG5cdFx0dGhpcy5mZWVkYmFjayA9IGF1ZGlvQ29udGV4dC5jcmVhdGVHYWluKCk7XG5cdFx0dGhpcy5mZWVkYmFjay5nYWluLnZhbHVlID0gMC4xO1xuXHRcdHRoaXMub3V0cHV0LmNvbm5lY3QodGhpcy5mZWVkYmFjayk7XG5cdFx0dGhpcy5mZWVkYmFjay5jb25uZWN0KHRoaXMuaW5wdXQpO1xuXG5cdFx0dGhpcy5ncmFpbiA9IFswLCAwLjI1LCAwLjEyNSwgMC4zNzUsIDAuMDc1LCAwLjMyNSwgMC4yLCAwLjQsIDAuNSwgMC43NSwgMC42MjUsIDAuODc1LCAwLjU3NSwgMC44MjUsIDAuNywgMC45XTtcblx0XHR0aGlzLmdhaW4gPSBbXTtcblx0XHR0aGlzLmRlbGF5ID0gW107XG5cblx0XHQvLyBJbml0aWFsaXNhdGlvbiBkZXMgcGFyYW3DqHRyZXNcbiAgICB0aGlzLnBlcmlvZCA9IDMwMDsgLy9tc1xuICAgIHRoaXMuZmluZXNzZSA9IDEwO1xuXHRcdHRoaXMucmFuZG9tUG9zaXRpb24gPSAxNTAwOyAvL21zXG5cdFx0dGhpcy5yYW1wR2FpbkNvbXBlbnNhdGlvbj0gMTA7IC8vbXNcblxuXHRcdGZvcihsZXQgaSA9IDA7IGkgPCAxNjsgaSsrKSB7IFxuXHRcdFx0dGhpcy5nYWluLnB1c2goYXVkaW9Db250ZXh0LmNyZWF0ZUdhaW4oKSk7XG5cdFx0XHR0aGlzLmRlbGF5LnB1c2goYXVkaW9Db250ZXh0LmNyZWF0ZURlbGF5KDIwKSk7XG5cdFx0XHR0aGlzLmlucHV0LmNvbm5lY3QodGhpcy5kZWxheVtpXSk7XG5cdFx0XHR0aGlzLmRlbGF5W2ldLmNvbm5lY3QodGhpcy5nYWluW2ldKTtcblx0XHRcdHRoaXMuZGVsYXlbaV0uZGVsYXlUaW1lLnZhbHVlID0gTWF0aC5yYW5kb20oKSp0aGlzLnJhbmRvbVBvc2l0aW9uLzEwMDAuO1xuXHRcdFx0dGhpcy5nYWluW2ldLmNvbm5lY3QodGhpcy5vdXRwdXQpO1xuXHRcdH1cblxuXHR9XG5cblx0LyogSU5URVJGQUNFICovXG5cblx0LyogUHVibGljICovXG5cdGNvbm5lY3Qob3V0cHV0KSB7XG5cdFx0dGhpcy5vdXRwdXQuY29ubmVjdChvdXRwdXQpO1xuXHR9XG5cblx0LyogUHVibGljICovXG5cdGRpc2Nvbm5lY3Qob3V0cHV0ID0gbnVsbCkge1xuXHRcdHRoaXMub3V0cHV0LmRpc2Nvbm5lY3Qob3V0cHV0KTtcblx0fVxuXG5cdC8qIFB1YmxpYyAqL1xuXHRyZXNldCgpIHtcblx0XHR0aGlzLmdyYWluID0gWzAsIDAuMjUsIDAuMTI1LCAwLjM3NSwgMC4wNzUsIDAuMzI1LCAwLjIsIDAuNCwgMC41LCAwLjc1LCAwLjYyNSwgMC4zNzUsIDAuNTc1LCAwLjgyNSwgMC43LCAwLjldO1xuXHR9XG5cblx0LyogUHVibGljICovXG5cdGFkdmFuY2VUaW1lKHRpbWUpe1xuXHRcdHRoaXMuX3VwZGF0ZVBoYXNlKCk7XG5cdFx0dGhpcy5fYXNzaWduR2FpbigpO1xuXHRcdHJldHVybiB0aW1lICsgKHRoaXMuZmluZXNzZSAvICh0aGlzLnBlcmlvZCAqIDIpKTtcblx0fVxuXG5cdC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cblx0LyoqIEBwcml2YXRlICovXG5cdF91cGRhdGVQaGFzZSgpIHtcblx0XHRmb3IobGV0IGk9MDtpPDE2O2krKyl7XG5cdFx0XHR0aGlzLmdyYWluW2ldID0gdGhpcy5fbm9ybSh0aGlzLmdyYWluW2ldKTtcblx0XHR9XG5cdH1cblxuXHQvKiBQcml2YXRlICovXG5cdF9ub3JtKHBoYXNlKSB7XG5cdFx0bGV0IHBoYXNlUjtcblx0XHRwaGFzZVIgPSAocGhhc2UrKHRoaXMucGVyaW9kL3RoaXMuZmluZXNzZSkvMTAwMCklMTtcblx0XHRyZXR1cm4gcGhhc2VSO1xuXHR9XG5cblx0LyogUHJpdmF0ZSAqL1xuXHRfYXNzaWduR2FpbigpIHtcblx0XHRmb3IobGV0IGk9MDtpPDE2O2krKyl7XG5cdFx0XHQvL2NvbnNvbGUubG9nKHRoaXMuZ3JhaW5baV0pO1xuXHRcdFx0aWYoKE1hdGguYWJzKHRoaXMuZ3JhaW5baV0tMC41KSoyKjAuMik+MC4xKXtcblx0XHRcdFx0dGhpcy5nYWluW2ldLmdhaW4udmFsdWUgPSBNYXRoLmFicyh0aGlzLmdyYWluW2ldLTAuNSkqMiowLjI7XG5cdFx0XHR9ZWxzZXtcblx0XHRcdFx0dGhpcy5nYWluW2ldLmdhaW4udmFsdWUgPSAwO1xuXHRcdFx0XHR0aGlzLl9hc3NpZ25Qb3NpdGlvbihpKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHQvKiBQcml2YXRlICovXG5cdF9hc3NpZ25Qb3NpdGlvbihpZCkge1xuXHRcdC8vY29uc29sZS5sb2coXCJ1cGRhdGVcIik7XG5cdFx0dGhpcy5kZWxheVtpZF0uZGVsYXlUaW1lLnNldFZhbHVlQXRUaW1lKE1hdGgucmFuZG9tKCkqdGhpcy5yYW5kb21Qb3NpdGlvbi8xMDAwLiwgKGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSt0aGlzLnJhbXBHYWluQ29tcGVuc2F0aW9uLzEwMDAuKSk7XG5cdH1cbn0iXX0=