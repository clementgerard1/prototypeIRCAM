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
	function Enregistrement(nom) {
		(0, _classCallCheck3.default)(this, Enregistrement);


		// Paramètre d'enregistrement
		this.motionIn = new lfo.source.EventIn({
			frameType: 'vector',
			frameSize: 2,
			frameRate: 1,
			description: ['x', 'y']
		});
		this.xmmRecorder = new _xmmLfo.PhraseRecorderLfo();

		this.indice = 14; // indice pour les fois où on veut enregistrer plusieurs gestes pour la même forme (en partant de différents endroit)

		this.newNom = nom + '-' + this.indice;
		this.xmmRecorder.setPhraseLabel(this.newNom);
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
			newThis.send('phrase', { 'phrase': this.xmmRecorder.getRecordedPhrase(), 'label': this.xmmRecorder.getPhraseLabel() });
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
	}]);
	return Enregistrement;
}();

exports.default = Enregistrement;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkVucmVnaXN0cmVtZW50LmpzIl0sIm5hbWVzIjpbImxmbyIsInNvdW5kd29ya3MiLCJhdWRpb0NvbnRleHQiLCJFbnJlZ2lzdHJlbWVudCIsIm5vbSIsIm1vdGlvbkluIiwic291cmNlIiwiRXZlbnRJbiIsImZyYW1lVHlwZSIsImZyYW1lU2l6ZSIsImZyYW1lUmF0ZSIsImRlc2NyaXB0aW9uIiwieG1tUmVjb3JkZXIiLCJpbmRpY2UiLCJuZXdOb20iLCJzZXRQaHJhc2VMYWJlbCIsImxhc3RGcmFtZVgiLCJsYXN0RnJhbWVZIiwibWluUGl4ZWxYIiwibWluUGl4ZWxZIiwiY29ubmVjdCIsInN0YXJ0IiwibmV3VGhpcyIsInN0b3AiLCJzZW5kIiwiZ2V0UmVjb3JkZWRQaHJhc2UiLCJnZXRQaHJhc2VMYWJlbCIsIngiLCJ5IiwiZGlmT2siLCJuZXdYIiwibmV3WSIsImFic1giLCJNYXRoIiwiYWJzIiwiYWJzWSIsInByb2Nlc3MiLCJjdXJyZW50VGltZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7QUFDQTs7SUFBWUEsRzs7QUFDWjs7SUFBWUMsVTs7Ozs7O0FBQ1osSUFBTUMsZUFBZUQsV0FBV0MsWUFBaEM7O0lBRXFCQyxjO0FBQ3BCLHlCQUFZQyxHQUFaLEVBQWdCO0FBQUE7OztBQUVmO0FBQ0EsT0FBS0MsUUFBTCxHQUFnQixJQUFJTCxJQUFJTSxNQUFKLENBQVdDLE9BQWYsQ0FBdUI7QUFDbENDLGNBQVcsUUFEdUI7QUFFbENDLGNBQVcsQ0FGdUI7QUFHbENDLGNBQVcsQ0FIdUI7QUFJbENDLGdCQUFhLENBQUMsR0FBRCxFQUFNLEdBQU47QUFKcUIsR0FBdkIsQ0FBaEI7QUFNQSxPQUFLQyxXQUFMLEdBQW1CLCtCQUFuQjs7QUFFQSxPQUFLQyxNQUFMLEdBQWMsRUFBZCxDQVhlLENBV0c7O0FBRWxCLE9BQUtDLE1BQUwsR0FBY1YsTUFBTSxHQUFOLEdBQVksS0FBS1MsTUFBL0I7QUFDQSxPQUFLRCxXQUFMLENBQWlCRyxjQUFqQixDQUFnQyxLQUFLRCxNQUFyQztBQUNBLE9BQUtFLFVBQUwsR0FBa0IsQ0FBbEI7QUFDQSxPQUFLQyxVQUFMLEdBQWtCLENBQWxCO0FBQ0EsT0FBS0MsU0FBTCxHQUFpQixDQUFqQjtBQUNBLE9BQUtDLFNBQUwsR0FBaUIsQ0FBakI7QUFDQSxPQUFLZCxRQUFMLENBQWNlLE9BQWQsQ0FBc0IsS0FBS1IsV0FBM0I7QUFDQSxPQUFLUCxRQUFMLENBQWNnQixLQUFkO0FBQ0E7Ozs7Z0NBRVk7QUFDWixRQUFLVCxXQUFMLENBQWlCUyxLQUFqQjtBQUNBOzs7NkJBRVVDLE8sRUFBUTtBQUNsQixRQUFLVixXQUFMLENBQWlCVyxJQUFqQjtBQUNBRCxXQUFRRSxJQUFSLENBQWEsUUFBYixFQUFzQixFQUFFLFVBQVcsS0FBS1osV0FBTCxDQUFpQmEsaUJBQWpCLEVBQWIsRUFBbUQsU0FBVSxLQUFLYixXQUFMLENBQWlCYyxjQUFqQixFQUE3RCxFQUF0QjtBQUNBOzs7MEJBR09DLEMsRUFBRUMsQyxFQUFFO0FBQ1gsT0FBSUMsUUFBUSxLQUFaO0FBQ0E7QUFDQSxPQUFJQyxPQUFPLEtBQUtkLFVBQUwsR0FBZ0JXLENBQTNCO0FBQ0EsT0FBSUksT0FBTyxLQUFLZCxVQUFMLEdBQWdCVyxDQUEzQjtBQUNBLE9BQUlJLE9BQU9DLEtBQUtDLEdBQUwsQ0FBU0osSUFBVCxDQUFYO0FBQ0EsT0FBSUssT0FBT0YsS0FBS0MsR0FBTCxDQUFTSCxJQUFULENBQVg7QUFDQSxPQUFJQyxPQUFLLEtBQUtkLFNBQVgsSUFBMEJpQixPQUFLLEtBQUtoQixTQUF2QyxFQUFrRDtBQUNqRFUsWUFBUSxJQUFSO0FBQ0EsU0FBS2IsVUFBTCxHQUFrQlcsQ0FBbEI7QUFDQSxTQUFLVixVQUFMLEdBQWtCVyxDQUFsQjtBQUNBO0FBQ0QsT0FBR0MsS0FBSCxFQUFTO0FBQ1IsU0FBS3hCLFFBQUwsQ0FBYytCLE9BQWQsQ0FBc0JsQyxhQUFhbUMsV0FBbkMsRUFBK0MsQ0FBQ1AsSUFBRCxFQUFNQyxJQUFOLENBQS9DO0FBQ0E7QUFDRDs7Ozs7a0JBakRtQjVCLGMiLCJmaWxlIjoiRW5yZWdpc3RyZW1lbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBQaHJhc2VSZWNvcmRlckxmbywgSGhtbURlY29kZXJMZm8gfSBmcm9tICd4bW0tbGZvJztcbmltcG9ydCAqIGFzIGxmbyBmcm9tICd3YXZlcy1sZm8vY2xpZW50JztcbmltcG9ydCAqIGFzIHNvdW5kd29ya3MgZnJvbSAnc291bmR3b3Jrcy9jbGllbnQnO1xuY29uc3QgYXVkaW9Db250ZXh0ID0gc291bmR3b3Jrcy5hdWRpb0NvbnRleHQ7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEVucmVnaXN0cmVtZW50e1xuXHRjb25zdHJ1Y3Rvcihub20pe1xuXG5cdFx0Ly8gUGFyYW3DqHRyZSBkJ2VucmVnaXN0cmVtZW50XG5cdFx0dGhpcy5tb3Rpb25JbiA9IG5ldyBsZm8uc291cmNlLkV2ZW50SW4oe1xuICAgXHQgICBmcmFtZVR5cGU6ICd2ZWN0b3InLFxuICAgICAgIGZyYW1lU2l6ZTogMixcbiAgICAgICBmcmFtZVJhdGU6IDEsXG4gICAgICAgZGVzY3JpcHRpb246IFsneCcsICd5J11cblx0XHR9KTtcblx0XHR0aGlzLnhtbVJlY29yZGVyID0gbmV3IFBocmFzZVJlY29yZGVyTGZvKCk7XG5cblx0XHR0aGlzLmluZGljZSA9IDE0OyAvLyBpbmRpY2UgcG91ciBsZXMgZm9pcyBvw7kgb24gdmV1dCBlbnJlZ2lzdHJlciBwbHVzaWV1cnMgZ2VzdGVzIHBvdXIgbGEgbcOqbWUgZm9ybWUgKGVuIHBhcnRhbnQgZGUgZGlmZsOpcmVudHMgZW5kcm9pdClcblx0XHRcblx0XHR0aGlzLm5ld05vbSA9IG5vbSArICctJyArIHRoaXMuaW5kaWNlO1xuXHRcdHRoaXMueG1tUmVjb3JkZXIuc2V0UGhyYXNlTGFiZWwodGhpcy5uZXdOb20pO1xuXHRcdHRoaXMubGFzdEZyYW1lWCA9IDA7XG5cdFx0dGhpcy5sYXN0RnJhbWVZID0gMDtcblx0XHR0aGlzLm1pblBpeGVsWCA9IDM7XG5cdFx0dGhpcy5taW5QaXhlbFkgPSAzO1xuXHRcdHRoaXMubW90aW9uSW4uY29ubmVjdCh0aGlzLnhtbVJlY29yZGVyKTtcblx0XHR0aGlzLm1vdGlvbkluLnN0YXJ0KCk7XG5cdH1cblxuXHRzdGFydFJlY29yZCgpe1xuXHRcdHRoaXMueG1tUmVjb3JkZXIuc3RhcnQoKTtcblx0fVxuXG5cdHN0b3BSZWNvcmQobmV3VGhpcyl7XG5cdFx0dGhpcy54bW1SZWNvcmRlci5zdG9wKCk7XG5cdFx0bmV3VGhpcy5zZW5kKCdwaHJhc2UnLHsgJ3BocmFzZScgOiB0aGlzLnhtbVJlY29yZGVyLmdldFJlY29yZGVkUGhyYXNlKCksICdsYWJlbCcgOiB0aGlzLnhtbVJlY29yZGVyLmdldFBocmFzZUxhYmVsKCkgfSk7XG5cdH1cblxuXG5cdHByb2Nlc3MoeCx5KXtcblx0XHRsZXQgZGlmT2sgPSBmYWxzZTtcblx0XHQvLyBOb3JtYWxpc2F0aW9uIGRlcyBlbnRyw6llc1xuXHRcdGxldCBuZXdYID0gdGhpcy5sYXN0RnJhbWVYLXg7XG5cdFx0bGV0IG5ld1kgPSB0aGlzLmxhc3RGcmFtZVkteTtcblx0XHRsZXQgYWJzWCA9IE1hdGguYWJzKG5ld1gpO1xuXHRcdGxldCBhYnNZID0gTWF0aC5hYnMobmV3WSk7XG5cdFx0aWYoKGFic1g+dGhpcy5taW5QaXhlbFgpIHx8IChhYnNZPnRoaXMubWluUGl4ZWxZKSl7XG5cdFx0XHRkaWZPayA9IHRydWU7XG5cdFx0XHR0aGlzLmxhc3RGcmFtZVggPSB4O1xuXHRcdFx0dGhpcy5sYXN0RnJhbWVZID0geTtcblx0XHR9XG5cdFx0aWYoZGlmT2spe1xuXHRcdFx0dGhpcy5tb3Rpb25Jbi5wcm9jZXNzKGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSxbbmV3WCxuZXdZXSk7XG5cdFx0fVxuXHR9XG59Il19