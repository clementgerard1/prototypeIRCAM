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
var maxMemoire = 600;
var seuil = 300;

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
			likelihoodWindow: 20,
			callback: this._update
		});

		//Variables
		this.lastFrameX = null;
		this.lastFrameY = null;
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
			var proc = true;
			var newX = void 0;
			var newY = void 0;
			if (this.lastFrameX) {
				newX = x - this.lastFrameX;
				this.lastFrameX = x;
				if (Math.abs(newX) > 0.3) {}
			} else {
				this.lastFrameX = x;
				proc = false;
			}
			if (this.lastFrameY) {
				newY = y - this.lastFrameY;
				this.lastFrameY = y;
			} else {
				this.lastFrameY = y;
				proc = false;
			}
			if (proc) {
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
			// if(/forme1/.test(label)){
			// 	forme1 = this._scale(++forme1);
			// 	forme2 = this._scale(--forme2);
			// 	forme3 = this._scale(--forme3);
			// }
			// if(/forme2/.test(label)){
			// 	forme2 = this._scale(++forme2);
			// 	forme1 = this._scale(--forme1);
			// 	forme3 = this._scale(--forme3);
			// }
			// if(/forme3/.test(label)){
			// 	forme3 = this._scale(++forme3);
			// 	forme1 = this._scale(--forme1);
			// 	forme2 = this._scale(--forme2);
			// } 
			// if(forme1>forme2&&forme1>forme3&&forme1>seuil){
			// 	return ["forme1"];
			// } else if(forme2>forme3&&forme2>forme1&&forme2>seuil){
			// 	return ["forme2"];
			// } else if(forme3>forme2&&forme3>forme1&&forme3>seuil){
			// 	return ["forme3"];
			// }else{
			// 	return null;
			// }
			return label;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRlY29kYWdlLmpzIl0sIm5hbWVzIjpbImxmbyIsInNvdW5kd29ya3MiLCJhdWRpb0NvbnRleHQiLCJsaWtlbGlob29kcyIsImxpa2VsaWVzdCIsImxhYmVsIiwiZm9ybWUxIiwiZm9ybWUyIiwiZm9ybWUzIiwibWF4TWVtb2lyZSIsInNldWlsIiwiRW5yZWdpc3RyZW1lbnQiLCJtb3Rpb25JbiIsInNvdXJjZSIsIkV2ZW50SW4iLCJmcmFtZVR5cGUiLCJmcmFtZVNpemUiLCJmcmFtZVJhdGUiLCJkZXNjcmlwdGlvbiIsImhobW1EZWNvZGVyIiwibGlrZWxpaG9vZFdpbmRvdyIsImNhbGxiYWNrIiwiX3VwZGF0ZSIsImxhc3RGcmFtZVgiLCJsYXN0RnJhbWVZIiwic3RhcnQiLCJtb2RlbCIsInBhcmFtcyIsInNldCIsImNvbm5lY3QiLCJ4IiwieSIsInByb2MiLCJuZXdYIiwibmV3WSIsIk1hdGgiLCJhYnMiLCJwcm9jZXNzIiwiY3VycmVudFRpbWUiLCJyZXMiLCJsaWtlbGllc3RJbmRleCIsInJlc2V0IiwibnVtYmVyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUFBOztBQUNBOztJQUFZQSxHOztBQUNaOztJQUFZQyxVOzs7Ozs7QUFDWixJQUFNQyxlQUFlRCxXQUFXQyxZQUFoQzs7QUFFQSxJQUFJQyxvQkFBSjtBQUNBLElBQUlDLGtCQUFKO0FBQ0EsSUFBSUMsY0FBSjtBQUNBLElBQUlDLFNBQVMsQ0FBYjtBQUNBLElBQUlDLFNBQVMsQ0FBYjtBQUNBLElBQUlDLFNBQVMsQ0FBYjtBQUNBLElBQUlDLGFBQWEsR0FBakI7QUFDQSxJQUFJQyxRQUFRLEdBQVo7O0lBRXFCQyxjO0FBQ3BCLDJCQUFhO0FBQUE7O0FBQ1o7O0FBRUE7QUFDQSxPQUFLQyxRQUFMLEdBQWdCLElBQUlaLElBQUlhLE1BQUosQ0FBV0MsT0FBZixDQUF1QjtBQUNsQ0MsY0FBVyxRQUR1QjtBQUVsQ0MsY0FBVyxDQUZ1QjtBQUdsQ0MsY0FBVyxDQUh1QjtBQUlsQ0MsZ0JBQWEsQ0FBQyxHQUFELEVBQU0sR0FBTjtBQUpxQixHQUF2QixDQUFoQjtBQU1BLE9BQUtDLFdBQUwsR0FBbUIsMkJBQW1CO0FBQ3JDQyxxQkFBa0IsRUFEbUI7QUFFbENDLGFBQVUsS0FBS0M7QUFGbUIsR0FBbkIsQ0FBbkI7O0FBTUU7QUFDRixPQUFLQyxVQUFMLEdBQWtCLElBQWxCO0FBQ0EsT0FBS0MsVUFBTCxHQUFrQixJQUFsQjtBQUNBLE9BQUtDLEtBQUwsR0FBYSxLQUFiO0FBQ0E7Ozs7MkJBRVFDLEssRUFBTTtBQUNkLFFBQUtQLFdBQUwsQ0FBaUJRLE1BQWpCLENBQXdCQyxHQUF4QixDQUE0QixPQUE1QixFQUFxQ0YsS0FBckM7QUFDQSxPQUFHLENBQUMsS0FBS0QsS0FBVCxFQUFlO0FBQ2QsU0FBS2IsUUFBTCxDQUFjaUIsT0FBZCxDQUFzQixLQUFLVixXQUEzQjtBQUNBLFNBQUtQLFFBQUwsQ0FBY2EsS0FBZDtBQUNBLFNBQUtBLEtBQUwsR0FBVyxJQUFYO0FBQ0E7QUFDRDs7OzBCQUdPSyxDLEVBQUVDLEMsRUFBRTtBQUNYLE9BQUlDLE9BQU8sSUFBWDtBQUNBLE9BQUlDLGFBQUo7QUFDQSxPQUFJQyxhQUFKO0FBQ0EsT0FBRyxLQUFLWCxVQUFSLEVBQW1CO0FBQ2xCVSxXQUFPSCxJQUFJLEtBQUtQLFVBQWhCO0FBQ0EsU0FBS0EsVUFBTCxHQUFrQk8sQ0FBbEI7QUFDQSxRQUFHSyxLQUFLQyxHQUFMLENBQVNILElBQVQsSUFBZSxHQUFsQixFQUFzQixDQUNyQjtBQUNELElBTEQsTUFLSztBQUNKLFNBQUtWLFVBQUwsR0FBa0JPLENBQWxCO0FBQ0FFLFdBQU8sS0FBUDtBQUNBO0FBQ0QsT0FBRyxLQUFLUixVQUFSLEVBQW1CO0FBQ2xCVSxXQUFPSCxJQUFJLEtBQUtQLFVBQWhCO0FBQ0EsU0FBS0EsVUFBTCxHQUFrQk8sQ0FBbEI7QUFDQSxJQUhELE1BR0s7QUFDSixTQUFLUCxVQUFMLEdBQWtCTyxDQUFsQjtBQUNBQyxXQUFNLEtBQU47QUFDQTtBQUNELE9BQUdBLElBQUgsRUFBUTtBQUNQLFNBQUtwQixRQUFMLENBQWN5QixPQUFkLENBQXNCbkMsYUFBYW9DLFdBQW5DLEVBQStDLENBQUNMLElBQUQsRUFBTUMsSUFBTixDQUEvQztBQUNBO0FBQ0Q7OzswQkFFT0ssRyxFQUFJO0FBQ1RwQyxpQkFBY29DLElBQUlwQyxXQUFsQjtBQUNBQyxlQUFZbUMsSUFBSUMsY0FBaEI7QUFDQW5DLFdBQVFrQyxJQUFJbkMsU0FBWjtBQUNGOzs7NkJBRVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFPQyxLQUFQO0FBQ0E7OzswQkFFTTtBQUNOLFFBQUtjLFdBQUwsQ0FBaUJzQixLQUFqQjtBQUNBOzs7eUJBRU1DLE0sRUFBTztBQUNiLE9BQUdBLFNBQU8sQ0FBVixFQUFZO0FBQ1gsV0FBTyxDQUFQO0FBQ0EsSUFGRCxNQUVNLElBQUdBLFNBQU9qQyxVQUFWLEVBQXFCO0FBQzFCLFdBQU9BLFVBQVA7QUFDQSxJQUZLLE1BRUQ7QUFDSixXQUFPaUMsTUFBUDtBQUNBO0FBQ0Q7Ozs7O2tCQXhHbUIvQixjIiwiZmlsZSI6IkRlY29kYWdlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSGhtbURlY29kZXJMZm8gfSBmcm9tICd4bW0tbGZvJztcbmltcG9ydCAqIGFzIGxmbyBmcm9tICd3YXZlcy1sZm8vY2xpZW50JztcbmltcG9ydCAqIGFzIHNvdW5kd29ya3MgZnJvbSAnc291bmR3b3Jrcy9jbGllbnQnO1xuY29uc3QgYXVkaW9Db250ZXh0ID0gc291bmR3b3Jrcy5hdWRpb0NvbnRleHQ7XG5cbmxldCBsaWtlbGlob29kcztcbmxldCBsaWtlbGllc3Q7XG5sZXQgbGFiZWw7XG5sZXQgZm9ybWUxID0gMDtcbmxldCBmb3JtZTIgPSAwO1xubGV0IGZvcm1lMyA9IDA7XG5sZXQgbWF4TWVtb2lyZSA9IDYwMDtcbmxldCBzZXVpbCA9IDMwMDtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRW5yZWdpc3RyZW1lbnR7XG5cdGNvbnN0cnVjdG9yKCl7XG5cdFx0Ly90aGlzLl91cGRhdGUgPSB0aGlzLl91cGRhdGUuYmluZCh0aGlzKTtcblxuXHRcdC8vIFBhcmFtw6h0cmUgZCdlbnJlZ2lzdHJlbWVudFxuXHRcdHRoaXMubW90aW9uSW4gPSBuZXcgbGZvLnNvdXJjZS5FdmVudEluKHtcbiAgIFx0ICAgZnJhbWVUeXBlOiAndmVjdG9yJyxcbiAgICAgICBmcmFtZVNpemU6IDIsXG4gICAgICAgZnJhbWVSYXRlOiAxLFxuICAgICAgIGRlc2NyaXB0aW9uOiBbJ3gnLCAneSddXG5cdFx0fSk7XG5cdFx0dGhpcy5oaG1tRGVjb2RlciA9IG5ldyBIaG1tRGVjb2Rlckxmbyh7XG5cdFx0XHRsaWtlbGlob29kV2luZG93OiAyMCxcbiAgICAgIGNhbGxiYWNrOiB0aGlzLl91cGRhdGVcbiAgICAgIH1cbiAgICApO1xuXG4gICAgLy9WYXJpYWJsZXNcblx0XHR0aGlzLmxhc3RGcmFtZVggPSBudWxsO1xuXHRcdHRoaXMubGFzdEZyYW1lWSA9IG51bGw7XG5cdFx0dGhpcy5zdGFydCA9IGZhbHNlO1xuXHR9XG5cblx0c2V0TW9kZWwobW9kZWwpe1xuXHRcdHRoaXMuaGhtbURlY29kZXIucGFyYW1zLnNldCgnbW9kZWwnLCBtb2RlbCk7XG5cdFx0aWYoIXRoaXMuc3RhcnQpe1xuXHRcdFx0dGhpcy5tb3Rpb25Jbi5jb25uZWN0KHRoaXMuaGhtbURlY29kZXIpO1xuXHRcdFx0dGhpcy5tb3Rpb25Jbi5zdGFydCgpO1xuXHRcdFx0dGhpcy5zdGFydD10cnVlO1xuXHRcdH1cblx0fVxuXG5cblx0cHJvY2Vzcyh4LHkpe1xuXHRcdGxldCBwcm9jID0gdHJ1ZTtcblx0XHRsZXQgbmV3WDtcblx0XHRsZXQgbmV3WTtcblx0XHRpZih0aGlzLmxhc3RGcmFtZVgpe1xuXHRcdFx0bmV3WCA9IHggLSB0aGlzLmxhc3RGcmFtZVggO1xuXHRcdFx0dGhpcy5sYXN0RnJhbWVYID0geDtcblx0XHRcdGlmKE1hdGguYWJzKG5ld1gpPjAuMyl7XG5cdFx0XHR9XG5cdFx0fWVsc2V7XG5cdFx0XHR0aGlzLmxhc3RGcmFtZVggPSB4O1xuXHRcdFx0cHJvYyA9IGZhbHNlO1xuXHRcdH1cblx0XHRpZih0aGlzLmxhc3RGcmFtZVkpe1xuXHRcdFx0bmV3WSA9IHkgLSB0aGlzLmxhc3RGcmFtZVkgO1xuXHRcdFx0dGhpcy5sYXN0RnJhbWVZID0geTtcblx0XHR9ZWxzZXtcblx0XHRcdHRoaXMubGFzdEZyYW1lWSA9IHk7XG5cdFx0XHRwcm9jPSBmYWxzZTtcblx0XHR9XG5cdFx0aWYocHJvYyl7XG5cdFx0XHR0aGlzLm1vdGlvbkluLnByb2Nlc3MoYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lLFtuZXdYLG5ld1ldKTtcblx0XHR9XHRcblx0fVxuXG5cdF91cGRhdGUocmVzKXtcbiAgICBsaWtlbGlob29kcyA9IHJlcy5saWtlbGlob29kcztcbiAgICBsaWtlbGllc3QgPSByZXMubGlrZWxpZXN0SW5kZXg7XG4gICAgbGFiZWwgPSByZXMubGlrZWxpZXN0O1xuXHR9XG5cblx0Z2V0UHJvYmEoKXtcblx0XHQvLyBpZigvZm9ybWUxLy50ZXN0KGxhYmVsKSl7XG5cdFx0Ly8gXHRmb3JtZTEgPSB0aGlzLl9zY2FsZSgrK2Zvcm1lMSk7XG5cdFx0Ly8gXHRmb3JtZTIgPSB0aGlzLl9zY2FsZSgtLWZvcm1lMik7XG5cdFx0Ly8gXHRmb3JtZTMgPSB0aGlzLl9zY2FsZSgtLWZvcm1lMyk7XG5cdFx0Ly8gfVxuXHRcdC8vIGlmKC9mb3JtZTIvLnRlc3QobGFiZWwpKXtcblx0XHQvLyBcdGZvcm1lMiA9IHRoaXMuX3NjYWxlKCsrZm9ybWUyKTtcblx0XHQvLyBcdGZvcm1lMSA9IHRoaXMuX3NjYWxlKC0tZm9ybWUxKTtcblx0XHQvLyBcdGZvcm1lMyA9IHRoaXMuX3NjYWxlKC0tZm9ybWUzKTtcblx0XHQvLyB9XG5cdFx0Ly8gaWYoL2Zvcm1lMy8udGVzdChsYWJlbCkpe1xuXHRcdC8vIFx0Zm9ybWUzID0gdGhpcy5fc2NhbGUoKytmb3JtZTMpO1xuXHRcdC8vIFx0Zm9ybWUxID0gdGhpcy5fc2NhbGUoLS1mb3JtZTEpO1xuXHRcdC8vIFx0Zm9ybWUyID0gdGhpcy5fc2NhbGUoLS1mb3JtZTIpO1xuXHRcdC8vIH0gXG5cdFx0Ly8gaWYoZm9ybWUxPmZvcm1lMiYmZm9ybWUxPmZvcm1lMyYmZm9ybWUxPnNldWlsKXtcblx0XHQvLyBcdHJldHVybiBbXCJmb3JtZTFcIl07XG5cdFx0Ly8gfSBlbHNlIGlmKGZvcm1lMj5mb3JtZTMmJmZvcm1lMj5mb3JtZTEmJmZvcm1lMj5zZXVpbCl7XG5cdFx0Ly8gXHRyZXR1cm4gW1wiZm9ybWUyXCJdO1xuXHRcdC8vIH0gZWxzZSBpZihmb3JtZTM+Zm9ybWUyJiZmb3JtZTM+Zm9ybWUxJiZmb3JtZTM+c2V1aWwpe1xuXHRcdC8vIFx0cmV0dXJuIFtcImZvcm1lM1wiXTtcblx0XHQvLyB9ZWxzZXtcblx0XHQvLyBcdHJldHVybiBudWxsO1xuXHRcdC8vIH1cblx0XHRyZXR1cm4gbGFiZWw7XG5cdH1cblxuXHRyZXNldCgpe1xuXHRcdHRoaXMuaGhtbURlY29kZXIucmVzZXQoKTtcblx0fVxuXG5cdF9zY2FsZShudW1iZXIpe1xuXHRcdGlmKG51bWJlcjwwKXtcblx0XHRcdHJldHVybiAwO1xuXHRcdH1lbHNlIGlmKG51bWJlcj5tYXhNZW1vaXJlKXtcblx0XHRcdHJldHVybiBtYXhNZW1vaXJlO1xuXHRcdH1lbHNle1xuXHRcdFx0cmV0dXJuIG51bWJlcjtcblx0XHR9XG5cdH1cbn0iXX0=