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

var Enregistrement = function () {
	function Enregistrement(name) {
		(0, _classCallCheck3.default)(this, Enregistrement);


		// Record params
		this.motionIn = new lfo.source.EventIn({
			frameType: 'vector',
			frameSize: 2,
			frameRate: 1,
			description: ['x', 'y']
		});
		this.xmmRecorder = new _xmmLfo.PhraseRecorderLfo();

		this.id = 1; // id when there are several records of a same shape

		this.newName = name + '-' + this.id;

		this.xmmRecorder.setPhraseLabel(this.newName);

		this.lastFrameX = 0;
		this.lastFrameY = 0;
		this.minPixelX = 3;
		this.minPixelY = 3;

		this.motionIn.connect(this.xmmRecorder);
		this.motionIn.start();
	}

	(0, _createClass3.default)(Enregistrement, [{
		key: 'startRecord',
		value: function startRecord() {
			this.xmmRecorder.start();
		}
	}, {
		key: 'stopRecord',
		value: function stopRecord(newThis) {
			this.xmmRecorder.stop();
			newThis.send('phrase', {
				'phrase': this.xmmRecorder.getRecordedPhrase(),
				'label': this.xmmRecorder.getPhraseLabel()
			});
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
	}]);
	return Enregistrement;
}();

exports.default = Enregistrement;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlJlY29yZC5qcyJdLCJuYW1lcyI6WyJsZm8iLCJzb3VuZHdvcmtzIiwiYXVkaW9Db250ZXh0IiwiRW5yZWdpc3RyZW1lbnQiLCJuYW1lIiwibW90aW9uSW4iLCJzb3VyY2UiLCJFdmVudEluIiwiZnJhbWVUeXBlIiwiZnJhbWVTaXplIiwiZnJhbWVSYXRlIiwiZGVzY3JpcHRpb24iLCJ4bW1SZWNvcmRlciIsImlkIiwibmV3TmFtZSIsInNldFBocmFzZUxhYmVsIiwibGFzdEZyYW1lWCIsImxhc3RGcmFtZVkiLCJtaW5QaXhlbFgiLCJtaW5QaXhlbFkiLCJjb25uZWN0Iiwic3RhcnQiLCJuZXdUaGlzIiwic3RvcCIsInNlbmQiLCJnZXRSZWNvcmRlZFBocmFzZSIsImdldFBocmFzZUxhYmVsIiwieCIsInkiLCJkaWZPayIsIm5ld1giLCJuZXdZIiwiYWJzWCIsIk1hdGgiLCJhYnMiLCJhYnNZIiwicHJvY2VzcyIsImN1cnJlbnRUaW1lIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUFBOztBQUNBOztJQUFZQSxHOztBQUNaOztJQUFZQyxVOzs7Ozs7QUFFWixJQUFNQyxlQUFlRCxXQUFXQyxZQUFoQzs7SUFFcUJDLGM7QUFFcEIseUJBQVlDLElBQVosRUFBaUI7QUFBQTs7O0FBRWhCO0FBQ0EsT0FBS0MsUUFBTCxHQUFnQixJQUFJTCxJQUFJTSxNQUFKLENBQVdDLE9BQWYsQ0FBdUI7QUFDaENDLGNBQVcsUUFEcUI7QUFFaENDLGNBQVcsQ0FGcUI7QUFHaENDLGNBQVcsQ0FIcUI7QUFJaENDLGdCQUFhLENBQUMsR0FBRCxFQUFNLEdBQU47QUFKbUIsR0FBdkIsQ0FBaEI7QUFNQSxPQUFLQyxXQUFMLEdBQW1CLCtCQUFuQjs7QUFFQSxPQUFLQyxFQUFMLEdBQVUsQ0FBVixDQVhnQixDQVdIOztBQUViLE9BQUtDLE9BQUwsR0FBZVYsT0FBTyxHQUFQLEdBQWEsS0FBS1MsRUFBakM7O0FBRUEsT0FBS0QsV0FBTCxDQUFpQkcsY0FBakIsQ0FBZ0MsS0FBS0QsT0FBckM7O0FBRUEsT0FBS0UsVUFBTCxHQUFrQixDQUFsQjtBQUNBLE9BQUtDLFVBQUwsR0FBa0IsQ0FBbEI7QUFDQSxPQUFLQyxTQUFMLEdBQWlCLENBQWpCO0FBQ0EsT0FBS0MsU0FBTCxHQUFpQixDQUFqQjs7QUFFQSxPQUFLZCxRQUFMLENBQWNlLE9BQWQsQ0FBc0IsS0FBS1IsV0FBM0I7QUFDQSxPQUFLUCxRQUFMLENBQWNnQixLQUFkO0FBRUE7Ozs7Z0NBRVk7QUFDWixRQUFLVCxXQUFMLENBQWlCUyxLQUFqQjtBQUNBOzs7NkJBRVVDLE8sRUFBUTtBQUNsQixRQUFLVixXQUFMLENBQWlCVyxJQUFqQjtBQUNBRCxXQUFRRSxJQUFSLENBQWEsUUFBYixFQUF1QjtBQUN0QixjQUFXLEtBQUtaLFdBQUwsQ0FBaUJhLGlCQUFqQixFQURXO0FBRXRCLGFBQVUsS0FBS2IsV0FBTCxDQUFpQmMsY0FBakI7QUFGWSxJQUF2QjtBQUlBOzs7MEJBR09DLEMsRUFBR0MsQyxFQUFFOztBQUVaLE9BQUlDLFFBQVEsS0FBWjs7QUFFQSxPQUFJQyxPQUFPLEtBQUtkLFVBQUwsR0FBa0JXLENBQTdCO0FBQ0EsT0FBSUksT0FBTyxLQUFLZCxVQUFMLEdBQWtCVyxDQUE3QjtBQUNBLE9BQUlJLE9BQU9DLEtBQUtDLEdBQUwsQ0FBU0osSUFBVCxDQUFYO0FBQ0EsT0FBSUssT0FBT0YsS0FBS0MsR0FBTCxDQUFTSCxJQUFULENBQVg7QUFDQSxPQUFLQyxPQUFPLEtBQUtkLFNBQWIsSUFBNEJpQixPQUFPLEtBQUtoQixTQUE1QyxFQUF3RDtBQUN2RFUsWUFBUSxJQUFSO0FBQ0EsU0FBS2IsVUFBTCxHQUFrQlcsQ0FBbEI7QUFDQSxTQUFLVixVQUFMLEdBQWtCVyxDQUFsQjtBQUNBO0FBQ0QsT0FBR0MsS0FBSCxFQUFTO0FBQ1IsU0FBS3hCLFFBQUwsQ0FBYytCLE9BQWQsQ0FBc0JsQyxhQUFhbUMsV0FBbkMsRUFBZ0QsQ0FBQ1AsSUFBRCxFQUFPQyxJQUFQLENBQWhEO0FBQ0E7QUFDRDs7Ozs7a0JBMURtQjVCLGMiLCJmaWxlIjoiUmVjb3JkLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUGhyYXNlUmVjb3JkZXJMZm8gfSBmcm9tICd4bW0tbGZvJztcbmltcG9ydCAqIGFzIGxmbyBmcm9tICd3YXZlcy1sZm8vY2xpZW50JztcbmltcG9ydCAqIGFzIHNvdW5kd29ya3MgZnJvbSAnc291bmR3b3Jrcy9jbGllbnQnO1xuXG5jb25zdCBhdWRpb0NvbnRleHQgPSBzb3VuZHdvcmtzLmF1ZGlvQ29udGV4dDtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRW5yZWdpc3RyZW1lbnR7XG5cblx0Y29uc3RydWN0b3IobmFtZSl7XG5cblx0XHQvLyBSZWNvcmQgcGFyYW1zXG5cdFx0dGhpcy5tb3Rpb25JbiA9IG5ldyBsZm8uc291cmNlLkV2ZW50SW4oe1xuICAgXHQgICAgXHRmcmFtZVR5cGU6ICd2ZWN0b3InLFxuICAgICAgICBcdGZyYW1lU2l6ZTogMixcbiAgICAgICAgXHRmcmFtZVJhdGU6IDEsXG4gICAgICAgIFx0ZGVzY3JpcHRpb246IFsneCcsICd5J11cblx0XHR9KTtcblx0XHR0aGlzLnhtbVJlY29yZGVyID0gbmV3IFBocmFzZVJlY29yZGVyTGZvKCk7XG5cblx0XHR0aGlzLmlkID0gMTsgLy8gaWQgd2hlbiB0aGVyZSBhcmUgc2V2ZXJhbCByZWNvcmRzIG9mIGEgc2FtZSBzaGFwZVxuXHRcdFxuXHRcdHRoaXMubmV3TmFtZSA9IG5hbWUgKyAnLScgKyB0aGlzLmlkO1xuXG5cdFx0dGhpcy54bW1SZWNvcmRlci5zZXRQaHJhc2VMYWJlbCh0aGlzLm5ld05hbWUpO1xuXG5cdFx0dGhpcy5sYXN0RnJhbWVYID0gMDtcblx0XHR0aGlzLmxhc3RGcmFtZVkgPSAwO1xuXHRcdHRoaXMubWluUGl4ZWxYID0gMztcblx0XHR0aGlzLm1pblBpeGVsWSA9IDM7XG5cblx0XHR0aGlzLm1vdGlvbkluLmNvbm5lY3QodGhpcy54bW1SZWNvcmRlcik7XG5cdFx0dGhpcy5tb3Rpb25Jbi5zdGFydCgpO1xuXG5cdH1cblxuXHRzdGFydFJlY29yZCgpe1xuXHRcdHRoaXMueG1tUmVjb3JkZXIuc3RhcnQoKTtcblx0fVxuXG5cdHN0b3BSZWNvcmQobmV3VGhpcyl7XG5cdFx0dGhpcy54bW1SZWNvcmRlci5zdG9wKCk7XG5cdFx0bmV3VGhpcy5zZW5kKCdwaHJhc2UnLCB7IFxuXHRcdFx0J3BocmFzZScgOiB0aGlzLnhtbVJlY29yZGVyLmdldFJlY29yZGVkUGhyYXNlKCksIFxuXHRcdFx0J2xhYmVsJyA6IHRoaXMueG1tUmVjb3JkZXIuZ2V0UGhyYXNlTGFiZWwoKSBcblx0XHR9KTtcblx0fVxuXG5cblx0cHJvY2Vzcyh4LCB5KXtcblxuXHRcdGxldCBkaWZPayA9IGZhbHNlO1xuXG5cdFx0bGV0IG5ld1ggPSB0aGlzLmxhc3RGcmFtZVggLSB4O1xuXHRcdGxldCBuZXdZID0gdGhpcy5sYXN0RnJhbWVZIC0geTtcblx0XHRsZXQgYWJzWCA9IE1hdGguYWJzKG5ld1gpO1xuXHRcdGxldCBhYnNZID0gTWF0aC5hYnMobmV3WSk7XG5cdFx0aWYoIChhYnNYID4gdGhpcy5taW5QaXhlbFgpIHx8IChhYnNZID4gdGhpcy5taW5QaXhlbFkpICl7XG5cdFx0XHRkaWZPayA9IHRydWU7XG5cdFx0XHR0aGlzLmxhc3RGcmFtZVggPSB4O1xuXHRcdFx0dGhpcy5sYXN0RnJhbWVZID0geTtcblx0XHR9XG5cdFx0aWYoZGlmT2spe1xuXHRcdFx0dGhpcy5tb3Rpb25Jbi5wcm9jZXNzKGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSwgW25ld1gsIG5ld1ldKTtcblx0XHR9XG5cdH1cbn0iXX0=