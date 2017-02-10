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

var likelihoodsG = void 0;
var likeliest = void 0;
var label = void 0;
var timeProgressions = void 0;
var forme1 = 0;
var forme2 = 0;
var forme3 = 0;
var maxMemoire = 600;
var seuil = 300;

var Enregistrement = function () {
	function Enregistrement() {
		(0, _classCallCheck3.default)(this, Enregistrement);


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
			this.motionIn.process(audioContext.currentTime, [x, y]);
		}
	}, {
		key: '_update',
		value: function _update(res) {
			likelihoodsG = res.likelihoods;
			likeliest = res.likeliestIndex;
			label = res.likeliest;
			timeProgressions = res.timeProgressions;
		}
	}, {
		key: 'getProba',
		value: function getProba() {
			return [label, timeProgressions];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRlY29kYWdlMi5qcyJdLCJuYW1lcyI6WyJsZm8iLCJzb3VuZHdvcmtzIiwiYXVkaW9Db250ZXh0IiwibGlrZWxpaG9vZHNHIiwibGlrZWxpZXN0IiwibGFiZWwiLCJ0aW1lUHJvZ3Jlc3Npb25zIiwiZm9ybWUxIiwiZm9ybWUyIiwiZm9ybWUzIiwibWF4TWVtb2lyZSIsInNldWlsIiwiRW5yZWdpc3RyZW1lbnQiLCJtb3Rpb25JbiIsInNvdXJjZSIsIkV2ZW50SW4iLCJmcmFtZVR5cGUiLCJmcmFtZVNpemUiLCJmcmFtZVJhdGUiLCJkZXNjcmlwdGlvbiIsImhobW1EZWNvZGVyIiwibGlrZWxpaG9vZFdpbmRvdyIsImNhbGxiYWNrIiwiX3VwZGF0ZSIsImxhc3RGcmFtZVgiLCJsYXN0RnJhbWVZIiwic3RhcnQiLCJtb2RlbCIsInBhcmFtcyIsInNldCIsImNvbm5lY3QiLCJ4IiwieSIsInByb2Nlc3MiLCJjdXJyZW50VGltZSIsInJlcyIsImxpa2VsaWhvb2RzIiwibGlrZWxpZXN0SW5kZXgiLCJyZXNldCIsIm51bWJlciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7QUFDQTs7SUFBWUEsRzs7QUFDWjs7SUFBWUMsVTs7Ozs7O0FBQ1osSUFBTUMsZUFBZUQsV0FBV0MsWUFBaEM7O0FBRUEsSUFBSUMscUJBQUo7QUFDQSxJQUFJQyxrQkFBSjtBQUNBLElBQUlDLGNBQUo7QUFDQSxJQUFJQyx5QkFBSjtBQUNBLElBQUlDLFNBQVMsQ0FBYjtBQUNBLElBQUlDLFNBQVMsQ0FBYjtBQUNBLElBQUlDLFNBQVMsQ0FBYjtBQUNBLElBQUlDLGFBQWEsR0FBakI7QUFDQSxJQUFJQyxRQUFRLEdBQVo7O0lBRXFCQyxjO0FBQ3BCLDJCQUFhO0FBQUE7OztBQUVaO0FBQ0EsT0FBS0MsUUFBTCxHQUFnQixJQUFJYixJQUFJYyxNQUFKLENBQVdDLE9BQWYsQ0FBdUI7QUFDbENDLGNBQVcsUUFEdUI7QUFFbENDLGNBQVcsQ0FGdUI7QUFHbENDLGNBQVcsQ0FIdUI7QUFJbENDLGdCQUFhLENBQUMsR0FBRCxFQUFNLEdBQU47QUFKcUIsR0FBdkIsQ0FBaEI7QUFNQSxPQUFLQyxXQUFMLEdBQW1CLDJCQUFtQjtBQUNyQ0MscUJBQWtCLEVBRG1CO0FBRWxDQyxhQUFVLEtBQUtDO0FBRm1CLEdBQW5CLENBQW5COztBQU1FO0FBQ0YsT0FBS0MsVUFBTCxHQUFrQixJQUFsQjtBQUNBLE9BQUtDLFVBQUwsR0FBa0IsSUFBbEI7QUFDQSxPQUFLQyxLQUFMLEdBQWEsS0FBYjtBQUNBOzs7OzJCQUVRQyxLLEVBQU07QUFDZCxRQUFLUCxXQUFMLENBQWlCUSxNQUFqQixDQUF3QkMsR0FBeEIsQ0FBNEIsT0FBNUIsRUFBcUNGLEtBQXJDO0FBQ0EsT0FBRyxDQUFDLEtBQUtELEtBQVQsRUFBZTtBQUNkLFNBQUtiLFFBQUwsQ0FBY2lCLE9BQWQsQ0FBc0IsS0FBS1YsV0FBM0I7QUFDQSxTQUFLUCxRQUFMLENBQWNhLEtBQWQ7QUFDQSxTQUFLQSxLQUFMLEdBQVcsSUFBWDtBQUNBO0FBQ0Q7OzswQkFHT0ssQyxFQUFFQyxDLEVBQUU7QUFDWCxRQUFLbkIsUUFBTCxDQUFjb0IsT0FBZCxDQUFzQi9CLGFBQWFnQyxXQUFuQyxFQUErQyxDQUFDSCxDQUFELEVBQUdDLENBQUgsQ0FBL0M7QUFDQTs7OzBCQUVPRyxHLEVBQUk7QUFDVGhDLGtCQUFlZ0MsSUFBSUMsV0FBbkI7QUFDQWhDLGVBQVkrQixJQUFJRSxjQUFoQjtBQUNBaEMsV0FBUThCLElBQUkvQixTQUFaO0FBQ0FFLHNCQUFtQjZCLElBQUk3QixnQkFBdkI7QUFDRjs7OzZCQUVTO0FBQ1QsVUFBTyxDQUFDRCxLQUFELEVBQU9DLGdCQUFQLENBQVA7QUFDQTs7OzBCQUVNO0FBQ04sUUFBS2MsV0FBTCxDQUFpQmtCLEtBQWpCO0FBQ0E7Ozt5QkFFTUMsTSxFQUFPO0FBQ2IsT0FBR0EsU0FBTyxDQUFWLEVBQVk7QUFDWCxXQUFPLENBQVA7QUFDQSxJQUZELE1BRU0sSUFBR0EsU0FBTzdCLFVBQVYsRUFBcUI7QUFDMUIsV0FBT0EsVUFBUDtBQUNBLElBRkssTUFFRDtBQUNKLFdBQU82QixNQUFQO0FBQ0E7QUFDRDs7Ozs7a0JBM0RtQjNCLGMiLCJmaWxlIjoiRGVjb2RhZ2UyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSGhtbURlY29kZXJMZm8gfSBmcm9tICd4bW0tbGZvJztcbmltcG9ydCAqIGFzIGxmbyBmcm9tICd3YXZlcy1sZm8vY2xpZW50JztcbmltcG9ydCAqIGFzIHNvdW5kd29ya3MgZnJvbSAnc291bmR3b3Jrcy9jbGllbnQnO1xuY29uc3QgYXVkaW9Db250ZXh0ID0gc291bmR3b3Jrcy5hdWRpb0NvbnRleHQ7XG5cbmxldCBsaWtlbGlob29kc0c7XG5sZXQgbGlrZWxpZXN0O1xubGV0IGxhYmVsO1xubGV0IHRpbWVQcm9ncmVzc2lvbnM7XG5sZXQgZm9ybWUxID0gMDtcbmxldCBmb3JtZTIgPSAwO1xubGV0IGZvcm1lMyA9IDA7XG5sZXQgbWF4TWVtb2lyZSA9IDYwMDtcbmxldCBzZXVpbCA9IDMwMDtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRW5yZWdpc3RyZW1lbnR7XG5cdGNvbnN0cnVjdG9yKCl7XG5cblx0XHQvLyBQYXJhbcOodHJlIGQnZW5yZWdpc3RyZW1lbnRcblx0XHR0aGlzLm1vdGlvbkluID0gbmV3IGxmby5zb3VyY2UuRXZlbnRJbih7XG4gICBcdCAgIGZyYW1lVHlwZTogJ3ZlY3RvcicsXG4gICAgICAgZnJhbWVTaXplOiAyLFxuICAgICAgIGZyYW1lUmF0ZTogMSxcbiAgICAgICBkZXNjcmlwdGlvbjogWyd4JywgJ3knXVxuXHRcdH0pO1xuXHRcdHRoaXMuaGhtbURlY29kZXIgPSBuZXcgSGhtbURlY29kZXJMZm8oe1xuXHRcdFx0bGlrZWxpaG9vZFdpbmRvdzogMjAsXG4gICAgICBjYWxsYmFjazogdGhpcy5fdXBkYXRlXG4gICAgICB9XG4gICAgKTtcblxuICAgIC8vVmFyaWFibGVzXG5cdFx0dGhpcy5sYXN0RnJhbWVYID0gbnVsbDtcblx0XHR0aGlzLmxhc3RGcmFtZVkgPSBudWxsO1xuXHRcdHRoaXMuc3RhcnQgPSBmYWxzZTtcblx0fVxuXG5cdHNldE1vZGVsKG1vZGVsKXtcblx0XHR0aGlzLmhobW1EZWNvZGVyLnBhcmFtcy5zZXQoJ21vZGVsJywgbW9kZWwpO1xuXHRcdGlmKCF0aGlzLnN0YXJ0KXtcblx0XHRcdHRoaXMubW90aW9uSW4uY29ubmVjdCh0aGlzLmhobW1EZWNvZGVyKTtcblx0XHRcdHRoaXMubW90aW9uSW4uc3RhcnQoKTtcblx0XHRcdHRoaXMuc3RhcnQ9dHJ1ZTtcblx0XHR9XG5cdH1cblxuXG5cdHByb2Nlc3MoeCx5KXtcblx0XHR0aGlzLm1vdGlvbkluLnByb2Nlc3MoYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lLFt4LHldKTtcblx0fVxuXG5cdF91cGRhdGUocmVzKXtcbiAgICBsaWtlbGlob29kc0cgPSByZXMubGlrZWxpaG9vZHM7XG4gICAgbGlrZWxpZXN0ID0gcmVzLmxpa2VsaWVzdEluZGV4O1xuICAgIGxhYmVsID0gcmVzLmxpa2VsaWVzdDtcbiAgICB0aW1lUHJvZ3Jlc3Npb25zID0gcmVzLnRpbWVQcm9ncmVzc2lvbnM7XG5cdH1cblxuXHRnZXRQcm9iYSgpe1xuXHRcdHJldHVybiBbbGFiZWwsdGltZVByb2dyZXNzaW9uc107XG5cdH1cblxuXHRyZXNldCgpe1xuXHRcdHRoaXMuaGhtbURlY29kZXIucmVzZXQoKTtcblx0fVxuXG5cdF9zY2FsZShudW1iZXIpe1xuXHRcdGlmKG51bWJlcjwwKXtcblx0XHRcdHJldHVybiAwO1xuXHRcdH1lbHNlIGlmKG51bWJlcj5tYXhNZW1vaXJlKXtcblx0XHRcdHJldHVybiBtYXhNZW1vaXJlO1xuXHRcdH1lbHNle1xuXHRcdFx0cmV0dXJuIG51bWJlcjtcblx0XHR9XG5cdH1cbn0iXX0=