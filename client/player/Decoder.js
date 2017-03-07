'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _xmmLfo = require('xmm-lfo');

var _client = require('waves-lfo/client');

var lfo = _interopRequireWildcard(_client);

var _client2 = require('soundworks/client');

var soundworks = _interopRequireWildcard(_client2);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var audioContext = soundworks.audioContext;

var likelihoods = void 0;
var likeliest = void 0;
var label = void 0;
var forme1 = 0;
var forme2 = 0;
var forme3 = 0;
var forme4 = 0;
var maxMemoire = 600;
var seuil = 30;

var Enregistrement = function () {
	function Enregistrement() {
		(0, _classCallCheck3.default)(this, Enregistrement);

		//this._update = this._update.bind(this);

		// Paramètre d'enregistrement
		this.motionIn = new lfo.source.EventIn({
			frameType: 'vector',
			frameSize: 2,
			frameRate: 1,
			description: ['x', 'y']
		});
		this.hhmmDecoder = new _xmmLfo.HhmmDecoderLfo({
			likelihoodWindow: 4,
			callback: this._update
		});

		//Variables
		this.lastFrameX = 0.5;
		this.lastFrameY = 0.5;
		this.minPixelX = 3;
		this.minPixelY = 3;
		this.start = false;
	}

	(0, _createClass3.default)(Enregistrement, [{
		key: 'setModel',
		value: function setModel(model) {
			this.hhmmDecoder.params.set('model', model);
			if (!this.start) {
				this.motionIn.connect(this.hhmmDecoder);
				this.motionIn.start();
				this.start = true;
			}
		}
	}, {
		key: 'process',
		value: function process(x, y) {
			var difOk = false;
			// Normalisation des entrées
			var newX = this.lastFrameX - x;
			var newY = this.lastFrameY - y;
			var absX = Math.abs(newX);
			var absY = Math.abs(newY);
			if (absX > this.minPixelX || absY > this.minPixelY) {
				difOk = true;
				this.lastFrameX = x;
				this.lastFrameY = y;
			}
			if (difOk) {
				this.motionIn.process(audioContext.currentTime, [newX, newY]);
			}
		}
	}, {
		key: '_update',
		value: function _update(res) {
			likelihoods = res.likelihoods;
			likeliest = res.likeliestIndex;
			label = res.likeliest;
		}
	}, {
		key: 'getProba',
		value: function getProba() {
			if (/forme1/.test(label)) {
				forme1 = this._scale(++forme1);
				forme2 = this._scale(--forme2);
				forme3 = this._scale(--forme3);
				forme4 = this._scale(--forme4);
			}
			if (/forme2/.test(label)) {
				forme2 = this._scale(++forme2);
				forme1 = this._scale(--forme1);
				forme3 = this._scale(--forme3);
				forme4 = this._scale(--forme4);
			}
			if (/forme3/.test(label)) {
				forme3 = this._scale(++forme3);
				forme1 = this._scale(--forme1);
				forme2 = this._scale(--forme2);
				forme4 = this._scale(--forme4);
			}
			if (/forme3/.test(label)) {
				forme3 = this._scale(--forme3);
				forme1 = this._scale(--forme1);
				forme2 = this._scale(--forme2);
				forme4 = this._scale(++forme4);
			}
			if (forme1 > forme2 && forme1 > forme3 && forme1 > forme4 && forme1 > seuil) {
				return ["forme1"];
			} else if (forme2 > forme3 && forme2 > forme1 && forme2 > forme4 && forme2 > seuil) {
				return ["forme2"];
			} else if (forme3 > forme2 && forme3 > forme1 && forme3 > forme4 && forme3 > seuil) {
				return ["forme3"];
			} else if (forme4 > forme2 && forme4 > forme1 && forme4 > forme3 && forme4 > seuil) {
				return ["forme4"];
			} else {
				return null;
			}
		}
	}, {
		key: 'reset',
		value: function reset() {
			this.hhmmDecoder.reset();
		}
	}, {
		key: '_scale',
		value: function _scale(number) {
			if (number < 0) {
				return 0;
			} else if (number > maxMemoire) {
				return maxMemoire;
			} else {
				return number;
			}
		}
	}]);
	return Enregistrement;
}();

exports.default = Enregistrement;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRlY29kZXIuanMiXSwibmFtZXMiOlsibGZvIiwic291bmR3b3JrcyIsImF1ZGlvQ29udGV4dCIsImxpa2VsaWhvb2RzIiwibGlrZWxpZXN0IiwibGFiZWwiLCJmb3JtZTEiLCJmb3JtZTIiLCJmb3JtZTMiLCJmb3JtZTQiLCJtYXhNZW1vaXJlIiwic2V1aWwiLCJFbnJlZ2lzdHJlbWVudCIsIm1vdGlvbkluIiwic291cmNlIiwiRXZlbnRJbiIsImZyYW1lVHlwZSIsImZyYW1lU2l6ZSIsImZyYW1lUmF0ZSIsImRlc2NyaXB0aW9uIiwiaGhtbURlY29kZXIiLCJsaWtlbGlob29kV2luZG93IiwiY2FsbGJhY2siLCJfdXBkYXRlIiwibGFzdEZyYW1lWCIsImxhc3RGcmFtZVkiLCJtaW5QaXhlbFgiLCJtaW5QaXhlbFkiLCJzdGFydCIsIm1vZGVsIiwicGFyYW1zIiwic2V0IiwiY29ubmVjdCIsIngiLCJ5IiwiZGlmT2siLCJuZXdYIiwibmV3WSIsImFic1giLCJNYXRoIiwiYWJzIiwiYWJzWSIsInByb2Nlc3MiLCJjdXJyZW50VGltZSIsInJlcyIsImxpa2VsaWVzdEluZGV4IiwidGVzdCIsIl9zY2FsZSIsInJlc2V0IiwibnVtYmVyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUFBOztBQUNBOztJQUFZQSxHOztBQUNaOztJQUFZQyxVOzs7Ozs7QUFDWixJQUFNQyxlQUFlRCxXQUFXQyxZQUFoQzs7QUFFQSxJQUFJQyxvQkFBSjtBQUNBLElBQUlDLGtCQUFKO0FBQ0EsSUFBSUMsY0FBSjtBQUNBLElBQUlDLFNBQVMsQ0FBYjtBQUNBLElBQUlDLFNBQVMsQ0FBYjtBQUNBLElBQUlDLFNBQVMsQ0FBYjtBQUNBLElBQUlDLFNBQVMsQ0FBYjtBQUNBLElBQUlDLGFBQWEsR0FBakI7QUFDQSxJQUFJQyxRQUFRLEVBQVo7O0lBRXFCQyxjO0FBQ3BCLDJCQUFhO0FBQUE7O0FBQ1o7O0FBRUE7QUFDQSxPQUFLQyxRQUFMLEdBQWdCLElBQUliLElBQUljLE1B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SUFGRCxNQUVNLElBQUdBLFNBQU92QyxVQUFWLEVBQXFCO0FBQzFCLFdBQU9BLFVBQVA7QUFDQSxJQUZLLE1BRUQ7QUFDSixXQUFPdUMsTUFBUDtBQUNBO0FBQ0Q7Ozs7O2tCQTVHbUJyQyxjIiwiZmlsZSI6IkRlY29kZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBIaG1tRGVjb2RlckxmbyB9IGZyb20gJ3htbS1sZm8nO1xuaW1wb3J0ICogYXMgbGZvIGZyb20gJ3dhdmVzLWxmby9jbGllbnQnO1xuaW1wb3J0ICogYXMgc291bmR3b3JrcyBmcm9tICdzb3VuZHdvcmtzL2NsaWVudCc7XG5jb25zdCBhdWRpb0NvbnRleHQgPSBzb3VuZHdvcmtzLmF1ZGlvQ29udGV4dDtcblxubGV0IGxpa2VsaWhvb2RzO1xubGV0IGxpa2VsaWVzdDtcbmxldCBsYWJlbDtcbmxldCBmb3JtZTEgPSAwO1xubGV0IGZvcm1lMiA9IDA7XG5sZXQgZm9ybWUzID0gMDtcbmxldCBmb3JtZTQgPSAwO1xubGV0IG1heE1lbW9pcmUgPSA2MDA7XG5sZXQgc2V1aWwgPSAzMDtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRW5yZWdpc3RyZW1lbnR7XG5cdGNvbnN0cnVjdG9yKCl7XG5cdFx0Ly90aGlzLl91cGRhdGUgPSB0aGlzLl91cGRhdGUuYmluZCh0aGlzKTtcblxuXHRcdC8vIFBhcmFtw6h0cmUgZCdlbnJlZ2lzdHJlbWVudFxuXHRcdHRoaXMubW90aW9uSW4gPSBuZXcgbGZvLnNvdXJjZS5FdmVudEluKHtcbiAgIFx0ICAgZnJhbWVUeXBlOiAndmVjdG9yJyxcbiAgICAgICBmcmFtZVNpemU6IDIsXG4gICAgICAgZnJhbWVSYXRlOiAxLFxuICAgICAgIGRlc2NyaXB0aW9uOiBbJ3gnLCAneSddXG5cdFx0fSk7XG5cdFx0dGhpcy5oaG1tRGVjb2RlciA9IG5ldyBIaG1tRGVjb2Rlckxmbyh7XG5cdFx0XHRsaWtlbGlob29kV2luZG93OiA0LFxuICAgICAgY2FsbGJhY2s6IHRoaXMuX3VwZGF0ZVxuICAgICAgfVxuICAgICk7XG5cbiAgICAvL1ZhcmlhYmxlc1xuXHRcdHRoaXMubGFzdEZyYW1lWCA9IDAuNTtcblx0XHR0aGlzLmxhc3RGcmFtZVkgPSAwLjU7XG5cdFx0dGhpcy5taW5QaXhlbFggPSAzO1xuXHRcdHRoaXMubWluUGl4ZWxZID0gMztcblx0XHR0aGlzLnN0YXJ0ID0gZmFsc2U7XG5cdH1cblxuXHRzZXRNb2RlbChtb2RlbCl7XG5cdFx0dGhpcy5oaG1tRGVjb2Rlci5wYXJhbXMuc2V0KCdtb2RlbCcsIG1vZGVsKTtcblx0XHRpZighdGhpcy5zdGFydCl7XG5cdFx0XHR0aGlzLm1vdGlvbkluLmNvbm5lY3QodGhpcy5oaG1tRGVjb2Rlcik7XG5cdFx0XHR0aGlzLm1vdGlvbkluLnN0YXJ0KCk7XG5cdFx0XHR0aGlzLnN0YXJ0PXRydWU7XG5cdFx0fVxuXHR9XG5cblxuXHRwcm9jZXNzKHgseSl7XG5cdFx0bGV0IGRpZk9rID0gZmFsc2U7XG5cdFx0Ly8gTm9ybWFsaXNhdGlvbiBkZXMgZW50csOpZXNcblx0XHRsZXQgbmV3WCA9IHRoaXMubGFzdEZyYW1lWC14O1xuXHRcdGxldCBuZXdZID0gdGhpcy5sYXN0RnJhbWVZLXk7XG5cdFx0bGV0IGFic1ggPSBNYXRoLmFicyhuZXdYKTtcblx0XHRsZXQgYWJzWSA9IE1hdGguYWJzKG5ld1kpO1xuXHRcdGlmKChhYnNYPnRoaXMubWluUGl4ZWxYKSB8fCAoYWJzWT50aGlzLm1pblBpeGVsWSkpe1xuXHRcdFx0ZGlmT2sgPSB0cnVlO1xuXHRcdFx0dGhpcy5sYXN0RnJhbWVYID0geDtcblx0XHRcdHRoaXMubGFzdEZyYW1lWSA9IHk7XG5cdFx0fVxuXHRcdGlmKGRpZk9rKXtcblx0XHRcdHRoaXMubW90aW9uSW4ucHJvY2VzcyhhdWRpb0NvbnRleHQuY3VycmVudFRpbWUsW25ld1gsbmV3WV0pO1xuXHRcdH1cblx0fVxuXG5cdF91cGRhdGUocmVzKXtcbiAgICBsaWtlbGlob29kcyA9IHJlcy5saWtlbGlob29kcztcbiAgICBsaWtlbGllc3QgPSByZXMubGlrZWxpZXN0SW5kZXg7XG4gICAgbGFiZWwgPSByZXMubGlrZWxpZXN0O1xuXHR9XG5cblx0Z2V0UHJvYmEoKXtcblx0XHRpZigvZm9ybWUxLy50ZXN0KGxhYmVsKSl7XG5cdFx0XHRmb3JtZTEgPSB0aGlzLl9zY2FsZSgrK2Zvcm1lMSk7XG5cdFx0XHRmb3JtZTIgPSB0aGlzLl9zY2FsZSgtLWZvcm1lMik7XG5cdFx0XHRmb3JtZTMgPSB0aGlzLl9zY2FsZSgtLWZvcm1lMyk7XG5cdFx0XHRmb3JtZTQgPSB0aGlzLl9zY2FsZSgtLWZvcm1lNCk7XG5cdFx0fVxuXHRcdGlmKC9mb3JtZTIvLnRlc3QobGFiZWwpKXtcblx0XHRcdGZvcm1lMiA9IHRoaXMuX3NjYWxlKCsrZm9ybWUyKTtcblx0XHRcdGZvcm1lMSA9IHRoaXMuX3NjYWxlKC0tZm9ybWUxKTtcblx0XHRcdGZvcm1lMyA9IHRoaXMuX3NjYWxlKC0tZm9ybWUzKTtcblx0XHRcdGZvcm1lNCA9IHRoaXMuX3NjYWxlKC0tZm9ybWU0KTtcblx0XHR9XG5cdFx0aWYoL2Zvcm1lMy8udGVzdChsYWJlbCkpe1xuXHRcdFx0Zm9ybWUzID0gdGhpcy5fc2NhbGUoKytmb3JtZTMpO1xuXHRcdFx0Zm9ybWUxID0gdGhpcy5fc2NhbGUoLS1mb3JtZTEpO1xuXHRcdFx0Zm9ybWUyID0gdGhpcy5fc2NhbGUoLS1mb3JtZTIpO1xuXHRcdFx0Zm9ybWU0ID0gdGhpcy5fc2NhbGUoLS1mb3JtZTQpO1xuXHRcdH0gXG5cdFx0aWYoL2Zvcm1lMy8udGVzdChsYWJlbCkpe1xuXHRcdFx0Zm9ybWUzID0gdGhpcy5fc2NhbGUoLS1mb3JtZTMpO1xuXHRcdFx0Zm9ybWUxID0gdGhpcy5fc2NhbGUoLS1mb3JtZTEpO1xuXHRcdFx0Zm9ybWUyID0gdGhpcy5fc2NhbGUoLS1mb3JtZTIpO1xuXHRcdFx0Zm9ybWU0ID0gdGhpcy5fc2NhbGUoKytmb3JtZTQpO1xuXHRcdH0gXG5cdFx0aWYoZm9ybWUxPmZvcm1lMiYmZm9ybWUxPmZvcm1lMyYmZm9ybWUxPmZvcm1lNCYmZm9ybWUxPnNldWlsKXtcblx0XHRcdHJldHVybiBbXCJmb3JtZTFcIl07XG5cdFx0fSBlbHNlIGlmKGZvcm1lMj5mb3JtZTMmJmZvcm1lMj5mb3JtZTEmJmZvcm1lMj5mb3JtZTQmJmZvcm1lMj5zZXVpbCl7XG5cdFx0XHRyZXR1cm4gW1wiZm9ybWUyXCJdO1xuXHRcdH0gZWxzZSBpZihmb3JtZTM+Zm9ybWUyJiZmb3JtZTM+Zm9ybWUxJiZmb3JtZTM+Zm9ybWU0JiZmb3JtZTM+c2V1aWwpe1xuXHRcdFx0cmV0dXJuIFtcImZvcm1lM1wiXTtcblx0XHR9IGVsc2UgaWYoZm9ybWU0PmZvcm1lMiYmZm9ybWU0PmZvcm1lMSYmZm9ybWU0PmZvcm1lMyYmZm9ybWU0PnNldWlsKXtcblx0XHRcdHJldHVybiBbXCJmb3JtZTRcIl07XG5cdFx0fWVsc2V7XG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9XG5cdH1cblxuXHRyZXNldCgpe1xuXHRcdHRoaXMuaGhtbURlY29kZXIucmVzZXQoKTtcblx0fVxuXG5cdF9zY2FsZShudW1iZXIpe1xuXHRcdGlmKG51bWJlcjwwKXtcblx0XHRcdHJldHVybiAwO1xuXHRcdH1lbHNlIGlmKG51bWJlcj5tYXhNZW1vaXJlKXtcblx0XHRcdHJldHVybiBtYXhNZW1vaXJlO1xuXHRcdH1lbHNle1xuXHRcdFx0cmV0dXJuIG51bWJlcjtcblx0XHR9XG5cdH1cbn0iXX0=