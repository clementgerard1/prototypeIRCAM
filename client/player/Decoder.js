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
var threshold = void 0;
var shape1 = 0;
var shape2 = 0;
var shape3 = 0;
var shape4 = 0;
var maxMemoire = 600;
var seuil = 30;

var Enregistrement = function () {
	function Enregistrement() {
		(0, _classCallCheck3.default)(this, Enregistrement);

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
			threshold = res.likeliest;
		}
	}, {
		key: 'getProba',
		value: function getProba() {
			if (/shape1/.test(threshold)) {
				shape1 = this._scale(++shape1);
				shape2 = this._scale(--shape2);
				shape3 = this._scale(--shape3);
				shape4 = this._scale(--shape4);
			}
			if (/shape2/.test(threshold)) {
				shape2 = this._scale(++shape2);
				shape1 = this._scale(--shape1);
				shape3 = this._scale(--shape3);
				shape4 = this._scale(--shape4);
			}
			if (/shape3/.test(threshold)) {
				shape3 = this._scale(++shape3);
				shape1 = this._scale(--shape1);
				shape2 = this._scale(--shape2);
				shape4 = this._scale(--shape4);
			}
			if (/shape3/.test(threshold)) {
				shape3 = this._scale(--shape3);
				shape1 = this._scale(--shape1);
				shape2 = this._scale(--shape2);
				shape4 = this._scale(++shape4);
			}
			if (shape1 > shape2 && shape1 > shape3 && shape1 > shape4 && shape1 > seuil) {
				return ["shape1"];
			} else if (shape2 > shape3 && shape2 > shape1 && shape2 > shape4 && shape2 > seuil) {
				return ["shape2"];
			} else if (shape3 > shape2 && shape3 > shape1 && shape3 > shape4 && shape3 > seuil) {
				return ["shape3"];
			} else if (shape4 > shape2 && shape4 > shape1 && shape4 > shape3 && shape4 > seuil) {
				return ["shape4"];
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRlY29kZXIuanMiXSwibmFtZXMiOlsibGZvIiwic291bmR3b3JrcyIsImF1ZGlvQ29udGV4dCIsImxpa2VsaWhvb2RzIiwibGlrZWxpZXN0IiwidGhyZXNob2xkIiwic2hhcGUxIiwic2hhcGUyIiwic2hhcGUzIiwic2hhcGU0IiwibWF4TWVtb2lyZSIsInNldWlsIiwiRW5yZWdpc3RyZW1lbnQiLCJtb3Rpb25JbiIsInNvdXJjZSIsIkV2ZW50SW4iLCJmcmFtZVR5cGUiLCJmcmFtZVNpemUiLCJmcmFtZVJhdGUiLCJkZXNjcmlwdGlvbiIsImhobW1EZWNvZGVyIiwibGlrZWxpaG9vZFdpbmRvdyIsImNhbGxiYWNrIiwiX3VwZGF0ZSIsImxhc3RGcmFtZVgiLCJsYXN0RnJhbWVZIiwibWluUGl4ZWxYIiwibWluUGl4ZWxZIiwic3RhcnQiLCJtb2RlbCIsInBhcmFtcyIsInNldCIsImNvbm5lY3QiLCJ4IiwieSIsImRpZk9rIiwibmV3WCIsIm5ld1kiLCJhYnNYIiwiTWF0aCIsImFicyIsImFic1kiLCJwcm9jZXNzIiwiY3VycmVudFRpbWUiLCJyZXMiLCJsaWtlbGllc3RJbmRleCIsInRlc3QiLCJfc2NhbGUiLCJyZXNldCIsIm51bWJlciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7QUFDQTs7SUFBWUEsRzs7QUFDWjs7SUFBWUMsVTs7Ozs7O0FBQ1osSUFBTUMsZUFBZUQsV0FBV0MsWUFBaEM7O0FBRUEsSUFBSUMsb0JBQUo7QUFDQSxJQUFJQyxrQkFBSjtBQUNBLElBQUlDLGtCQUFKO0FBQ0EsSUFBSUMsU0FBUyxDQUFiO0FBQ0EsSUFBSUMsU0FBUyxDQUFiO0FBQ0EsSUFBSUMsU0FBUyxDQUFiO0FBQ0EsSUFBSUMsU0FBUyxDQUFiO0FBQ0EsSUFBSUMsYUFBYSxHQUFqQjtBQUNBLElBQUlDLFFBQVEsRUFBWjs7SUFFcUJDLGM7QUFFcEIsMkJBQWE7QUFBQTs7QUFDWixPQUFLQyxRQUFMLEdBQWdCLElBQUliLElBQUljLE1BQUosQ0FB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QUFHQSxTQUFTdkMsVUFBWixFQUF1QjtBQUM1QixXQUFPQSxVQUFQO0FBQ0EsSUFGSyxNQUVEO0FBQ0osV0FBT3VDLE1BQVA7QUFDQTtBQUNEOzs7OztrQkF4R21CckMsYyIsImZpbGUiOiJEZWNvZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSGhtbURlY29kZXJMZm8gfSBmcm9tICd4bW0tbGZvJztcbmltcG9ydCAqIGFzIGxmbyBmcm9tICd3YXZlcy1sZm8vY2xpZW50JztcbmltcG9ydCAqIGFzIHNvdW5kd29ya3MgZnJvbSAnc291bmR3b3Jrcy9jbGllbnQnO1xuY29uc3QgYXVkaW9Db250ZXh0ID0gc291bmR3b3Jrcy5hdWRpb0NvbnRleHQ7XG5cbmxldCBsaWtlbGlob29kcztcbmxldCBsaWtlbGllc3Q7XG5sZXQgdGhyZXNob2xkO1xubGV0IHNoYXBlMSA9IDA7XG5sZXQgc2hhcGUyID0gMDtcbmxldCBzaGFwZTMgPSAwO1xubGV0IHNoYXBlNCA9IDA7XG5sZXQgbWF4TWVtb2lyZSA9IDYwMDtcbmxldCBzZXVpbCA9IDMwO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFbnJlZ2lzdHJlbWVudHtcblxuXHRjb25zdHJ1Y3Rvcigpe1xuXHRcdHRoaXMubW90aW9uSW4gPSBuZXcgbGZvLnNvdXJjZS5FdmVudEluKHtcbiAgIFx0ICAgXHRmcmFtZVR5cGU6ICd2ZWN0b3InLFxuICAgICAgIFx0ZnJhbWVTaXplOiAyLFxuICAgICAgIFx0ZnJhbWVSYXRlOiAxLFxuICAgICAgIFx0ZGVzY3JpcHRpb246IFsneCcsICd5J11cblx0XHR9KTtcblx0XHR0aGlzLmhobW1EZWNvZGVyID0gbmV3IEhobW1EZWNvZGVyTGZvKHtcblx0XHRcdGxpa2VsaWhvb2RXaW5kb3c6IDQsXG4gICAgICBcdFx0Y2FsbGJhY2s6IHRoaXMuX3VwZGF0ZVxuICAgICAgXHR9KTtcblxuXHRcdHRoaXMubGFzdEZyYW1lWCA9IDAuNTtcblx0XHR0aGlzLmxhc3RGcmFtZVkgPSAwLjU7XG5cdFx0dGhpcy5taW5QaXhlbFggPSAzO1xuXHRcdHRoaXMubWluUGl4ZWxZID0gMztcblx0XHR0aGlzLnN0YXJ0ID0gZmFsc2U7XG5cblx0fVxuXG5cdHNldE1vZGVsKG1vZGVsKXtcblx0XHR0aGlzLmhobW1EZWNvZGVyLnBhcmFtcy5zZXQoJ21vZGVsJywgbW9kZWwpO1xuXHRcdGlmKCF0aGlzLnN0YXJ0KXtcblx0XHRcdHRoaXMubW90aW9uSW4uY29ubmVjdCh0aGlzLmhobW1EZWNvZGVyKTtcblx0XHRcdHRoaXMubW90aW9uSW4uc3RhcnQoKTtcblx0XHRcdHRoaXMuc3RhcnQgPSB0cnVlO1xuXHRcdH1cblx0fVxuXG5cblx0cHJvY2Vzcyh4LCB5KXtcblx0XHRsZXQgZGlmT2sgPSBmYWxzZTtcblx0XHRsZXQgbmV3WCA9IHRoaXMubGFzdEZyYW1lWCAtIHg7XG5cdFx0bGV0IG5ld1kgPSB0aGlzLmxhc3RGcmFtZVkgLSB5O1xuXHRcdGxldCBhYnNYID0gTWF0aC5hYnMobmV3WCk7XG5cdFx0bGV0IGFic1kgPSBNYXRoLmFicyhuZXdZKTtcblx0XHRpZiggKGFic1ggPiB0aGlzLm1pblBpeGVsWCkgfHwgKGFic1kgPiB0aGlzLm1pblBpeGVsWSkgKXtcblx0XHRcdGRpZk9rID0gdHJ1ZTtcblx0XHRcdHRoaXMubGFzdEZyYW1lWCA9IHg7XG5cdFx0XHR0aGlzLmxhc3RGcmFtZVkgPSB5O1xuXHRcdH1cblx0XHRpZihkaWZPayl7XG5cdFx0XHR0aGlzLm1vdGlvbkluLnByb2Nlc3MoYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lLCBbbmV3WCwgbmV3WV0pO1xuXHRcdH1cblx0fVxuXG5cdF91cGRhdGUocmVzKXtcbiAgICBcdGxpa2VsaWhvb2RzID0gcmVzLmxpa2VsaWhvb2RzO1xuICAgIFx0bGlrZWxpZXN0ID0gcmVzLmxpa2VsaWVzdEluZGV4O1xuICAgIFx0dGhyZXNob2xkID0gcmVzLmxpa2VsaWVzdDtcblx0fVxuXG5cdGdldFByb2JhKCl7XG5cdFx0aWYoL3NoYXBlMS8udGVzdCh0aHJlc2hvbGQpKXtcblx0XHRcdHNoYXBlMSA9IHRoaXMuX3NjYWxlKCArK3NoYXBlMSApO1xuXHRcdFx0c2hhcGUyID0gdGhpcy5fc2NhbGUoIC0tc2hhcGUyICk7XG5cdFx0XHRzaGFwZTMgPSB0aGlzLl9zY2FsZSggLS1zaGFwZTMgKTtcblx0XHRcdHNoYXBlNCA9IHRoaXMuX3NjYWxlKCAtLXNoYXBlNCApO1xuXHRcdH1cblx0XHRpZigvc2hhcGUyLy50ZXN0KHRocmVzaG9sZCkpe1xuXHRcdFx0c2hhcGUyID0gdGhpcy5fc2NhbGUoICsrc2hhcGUyICk7XG5cdFx0XHRzaGFwZTEgPSB0aGlzLl9zY2FsZSggLS1zaGFwZTEgKTtcblx0XHRcdHNoYXBlMyA9IHRoaXMuX3NjYWxlKCAtLXNoYXBlMyApO1xuXHRcdFx0c2hhcGU0ID0gdGhpcy5fc2NhbGUoIC0tc2hhcGU0ICk7XG5cdFx0fVxuXHRcdGlmKC9zaGFwZTMvLnRlc3QodGhyZXNob2xkKSl7XG5cdFx0XHRzaGFwZTMgPSB0aGlzLl9zY2FsZSggKytzaGFwZTMgKTtcblx0XHRcdHNoYXBlMSA9IHRoaXMuX3NjYWxlKCAtLXNoYXBlMSApO1xuXHRcdFx0c2hhcGUyID0gdGhpcy5fc2NhbGUoIC0tc2hhcGUyICk7XG5cdFx0XHRzaGFwZTQgPSB0aGlzLl9zY2FsZSggLS1zaGFwZTQgKTtcblx0XHR9IFxuXHRcdGlmKC9zaGFwZTMvLnRlc3QodGhyZXNob2xkKSl7XG5cdFx0XHRzaGFwZTMgPSB0aGlzLl9zY2FsZSggLS1zaGFwZTMgKTtcblx0XHRcdHNoYXBlMSA9IHRoaXMuX3NjYWxlKCAtLXNoYXBlMSApO1xuXHRcdFx0c2hhcGUyID0gdGhpcy5fc2NhbGUoIC0tc2hhcGUyICk7XG5cdFx0XHRzaGFwZTQgPSB0aGlzLl9zY2FsZSggKytzaGFwZTQgKTtcblx0XHR9IFxuXHRcdGlmKHNoYXBlMSA+IHNoYXBlMiAmJiBzaGFwZTEgPiBzaGFwZTMgJiYgc2hhcGUxID4gc2hhcGU0ICYmIHNoYXBlMSA+IHNldWlsKXtcblx0XHRcdHJldHVybiBbXCJzaGFwZTFcIl07XG5cdFx0fSBlbHNlIGlmKHNoYXBlMiA+IHNoYXBlMyAmJiBzaGFwZTIgPiBzaGFwZTEgJiYgc2hhcGUyID4gc2hhcGU0ICYmIHNoYXBlMiA+IHNldWlsKXtcblx0XHRcdHJldHVybiBbXCJzaGFwZTJcIl07XG5cdFx0fSBlbHNlIGlmKHNoYXBlMyA+IHNoYXBlMiAmJiBzaGFwZTMgPiBzaGFwZTEgJiYgc2hhcGUzID4gc2hhcGU0ICYmIHNoYXBlMyA+IHNldWlsKXtcblx0XHRcdHJldHVybiBbXCJzaGFwZTNcIl07XG5cdFx0fSBlbHNlIGlmKHNoYXBlNCA+IHNoYXBlMiAmJiBzaGFwZTQgPiBzaGFwZTEgJiYgc2hhcGU0ID4gc2hhcGUzICYmIHNoYXBlNCA+IHNldWlsKXtcblx0XHRcdHJldHVybiBbXCJzaGFwZTRcIl07XG5cdFx0fWVsc2V7XG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9XG5cdH1cblxuXHRyZXNldCgpe1xuXHRcdHRoaXMuaGhtbURlY29kZXIucmVzZXQoKTtcblx0fVxuXG5cdF9zY2FsZShudW1iZXIpe1xuXHRcdGlmKG51bWJlciA8IDApe1xuXHRcdFx0cmV0dXJuIDA7XG5cdFx0fWVsc2UgaWYobnVtYmVyID4gbWF4TWVtb2lyZSl7XG5cdFx0XHRyZXR1cm4gbWF4TWVtb2lyZTtcblx0XHR9ZWxzZXtcblx0XHRcdHJldHVybiBudW1iZXI7XG5cdFx0fVxuXHR9XG59Il19