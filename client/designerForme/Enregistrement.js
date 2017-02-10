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

		this.indice = 12; // indice pour les fois où on veut enregistrer plusieurs gestes pour la même forme (en partant de différents endroit)

		this.newNom = nom + '-' + this.indice;
		this.xmmRecorder.setPhraseLabel(this.newNom);
		this.lastFrameX = null;
		this.lastFrameY = null;
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
	}]);
	return Enregistrement;
}();

exports.default = Enregistrement;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkVucmVnaXN0cmVtZW50LmpzIl0sIm5hbWVzIjpbImxmbyIsInNvdW5kd29ya3MiLCJhdWRpb0NvbnRleHQiLCJFbnJlZ2lzdHJlbWVudCIsIm5vbSIsIm1vdGlvbkluIiwic291cmNlIiwiRXZlbnRJbiIsImZyYW1lVHlwZSIsImZyYW1lU2l6ZSIsImZyYW1lUmF0ZSIsImRlc2NyaXB0aW9uIiwieG1tUmVjb3JkZXIiLCJpbmRpY2UiLCJuZXdOb20iLCJzZXRQaHJhc2VMYWJlbCIsImxhc3RGcmFtZVgiLCJsYXN0RnJhbWVZIiwiY29ubmVjdCIsInN0YXJ0IiwibmV3VGhpcyIsInN0b3AiLCJzZW5kIiwiZ2V0UmVjb3JkZWRQaHJhc2UiLCJnZXRQaHJhc2VMYWJlbCIsIngiLCJ5IiwicHJvYyIsIm5ld1giLCJuZXdZIiwiTWF0aCIsImFicyIsInByb2Nlc3MiLCJjdXJyZW50VGltZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7QUFDQTs7SUFBWUEsRzs7QUFDWjs7SUFBWUMsVTs7Ozs7O0FBQ1osSUFBTUMsZUFBZUQsV0FBV0MsWUFBaEM7O0lBRXFCQyxjO0FBQ3BCLHlCQUFZQyxHQUFaLEVBQWdCO0FBQUE7OztBQUVmO0FBQ0EsT0FBS0MsUUFBTCxHQUFnQixJQUFJTCxJQUFJTSxNQUFKLENBQVdDLE9BQWYsQ0FBdUI7QUFDbENDLGNBQVcsUUFEdUI7QUFFbENDLGNBQVcsQ0FGdUI7QUFHbENDLGNBQVcsQ0FIdUI7QUFJbENDLGdCQUFhLENBQUMsR0FBRCxFQUFNLEdBQU47QUFKcUIsR0FBdkIsQ0FBaEI7QUFNQSxPQUFLQyxXQUFMLEdBQW1CLCtCQUFuQjs7QUFFQSxPQUFLQyxNQUFMLEdBQWMsRUFBZCxDQVhlLENBV0c7O0FBRWxCLE9BQUtDLE1BQUwsR0FBY1YsTUFBTSxHQUFOLEdBQVksS0FBS1MsTUFBL0I7QUFDQSxPQUFLRCxXQUFMLENBQWlCRyxjQUFqQixDQUFnQyxLQUFLRCxNQUFyQztBQUNBLE9BQUtFLFVBQUwsR0FBa0IsSUFBbEI7QUFDQSxPQUFLQyxVQUFMLEdBQWtCLElBQWxCO0FBQ0EsT0FBS1osUUFBTCxDQUFjYSxPQUFkLENBQXNCLEtBQUtOLFdBQTNCO0FBQ0EsT0FBS1AsUUFBTCxDQUFjYyxLQUFkO0FBQ0E7Ozs7Z0NBRVk7QUFDWixRQUFLUCxXQUFMLENBQWlCTyxLQUFqQjtBQUNBOzs7NkJBRVVDLE8sRUFBUTtBQUNsQixRQUFLUixXQUFMLENBQWlCUyxJQUFqQjtBQUNBRCxXQUFRRSxJQUFSLENBQWEsUUFBYixFQUFzQixFQUFFLFVBQVcsS0FBS1YsV0FBTCxDQUFpQlcsaUJBQWpCLEVBQWIsRUFBbUQsU0FBVSxLQUFLWCxXQUFMLENBQWlCWSxjQUFqQixFQUE3RCxFQUF0QjtBQUNBOzs7MEJBR09DLEMsRUFBRUMsQyxFQUFFO0FBQ1gsT0FBSUMsT0FBTyxJQUFYO0FBQ0EsT0FBSUMsYUFBSjtBQUNBLE9BQUlDLGFBQUo7QUFDQSxPQUFHLEtBQUtiLFVBQVIsRUFBbUI7QUFDbEJZLFdBQU9ILElBQUksS0FBS1QsVUFBaEI7QUFDQSxTQUFLQSxVQUFMLEdBQWtCUyxDQUFsQjtBQUNBLFFBQUdLLEtBQUtDLEdBQUwsQ0FBU0gsSUFBVCxJQUFlLEdBQWxCLEVBQXNCLENBQ3JCO0FBQ0QsSUFMRCxNQUtLO0FBQ0osU0FBS1osVUFBTCxHQUFrQlMsQ0FBbEI7QUFDQUUsV0FBTyxLQUFQO0FBQ0E7QUFDRCxPQUFHLEtBQUtWLFVBQVIsRUFBbUI7QUFDbEJZLFdBQU9ILElBQUksS0FBS1QsVUFBaEI7QUFDQSxTQUFLQSxVQUFMLEdBQWtCUyxDQUFsQjtBQUNBLElBSEQsTUFHSztBQUNKLFNBQUtULFVBQUwsR0FBa0JTLENBQWxCO0FBQ0FDLFdBQU0sS0FBTjtBQUNBO0FBQ0QsT0FBR0EsSUFBSCxFQUFRO0FBQ1AsU0FBS3RCLFFBQUwsQ0FBYzJCLE9BQWQsQ0FBc0I5QixhQUFhK0IsV0FBbkMsRUFBK0MsQ0FBQ0wsSUFBRCxFQUFNQyxJQUFOLENBQS9DO0FBQ0E7QUFDRDs7Ozs7a0JBdkRtQjFCLGMiLCJmaWxlIjoiRW5yZWdpc3RyZW1lbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBQaHJhc2VSZWNvcmRlckxmbywgSGhtbURlY29kZXJMZm8gfSBmcm9tICd4bW0tbGZvJztcbmltcG9ydCAqIGFzIGxmbyBmcm9tICd3YXZlcy1sZm8vY2xpZW50JztcbmltcG9ydCAqIGFzIHNvdW5kd29ya3MgZnJvbSAnc291bmR3b3Jrcy9jbGllbnQnO1xuY29uc3QgYXVkaW9Db250ZXh0ID0gc291bmR3b3Jrcy5hdWRpb0NvbnRleHQ7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEVucmVnaXN0cmVtZW50e1xuXHRjb25zdHJ1Y3Rvcihub20pe1xuXG5cdFx0Ly8gUGFyYW3DqHRyZSBkJ2VucmVnaXN0cmVtZW50XG5cdFx0dGhpcy5tb3Rpb25JbiA9IG5ldyBsZm8uc291cmNlLkV2ZW50SW4oe1xuICAgXHQgICBmcmFtZVR5cGU6ICd2ZWN0b3InLFxuICAgICAgIGZyYW1lU2l6ZTogMixcbiAgICAgICBmcmFtZVJhdGU6IDEsXG4gICAgICAgZGVzY3JpcHRpb246IFsneCcsICd5J11cblx0XHR9KTtcblx0XHR0aGlzLnhtbVJlY29yZGVyID0gbmV3IFBocmFzZVJlY29yZGVyTGZvKCk7XG5cblx0XHR0aGlzLmluZGljZSA9IDEyOyAvLyBpbmRpY2UgcG91ciBsZXMgZm9pcyBvw7kgb24gdmV1dCBlbnJlZ2lzdHJlciBwbHVzaWV1cnMgZ2VzdGVzIHBvdXIgbGEgbcOqbWUgZm9ybWUgKGVuIHBhcnRhbnQgZGUgZGlmZsOpcmVudHMgZW5kcm9pdClcblx0XHRcblx0XHR0aGlzLm5ld05vbSA9IG5vbSArICctJyArIHRoaXMuaW5kaWNlO1xuXHRcdHRoaXMueG1tUmVjb3JkZXIuc2V0UGhyYXNlTGFiZWwodGhpcy5uZXdOb20pO1xuXHRcdHRoaXMubGFzdEZyYW1lWCA9IG51bGw7XG5cdFx0dGhpcy5sYXN0RnJhbWVZID0gbnVsbDtcblx0XHR0aGlzLm1vdGlvbkluLmNvbm5lY3QodGhpcy54bW1SZWNvcmRlcik7XG5cdFx0dGhpcy5tb3Rpb25Jbi5zdGFydCgpO1xuXHR9XG5cblx0c3RhcnRSZWNvcmQoKXtcblx0XHR0aGlzLnhtbVJlY29yZGVyLnN0YXJ0KCk7XG5cdH1cblxuXHRzdG9wUmVjb3JkKG5ld1RoaXMpe1xuXHRcdHRoaXMueG1tUmVjb3JkZXIuc3RvcCgpO1xuXHRcdG5ld1RoaXMuc2VuZCgncGhyYXNlJyx7ICdwaHJhc2UnIDogdGhpcy54bW1SZWNvcmRlci5nZXRSZWNvcmRlZFBocmFzZSgpLCAnbGFiZWwnIDogdGhpcy54bW1SZWNvcmRlci5nZXRQaHJhc2VMYWJlbCgpIH0pO1xuXHR9XG5cblxuXHRwcm9jZXNzKHgseSl7XG5cdFx0bGV0IHByb2MgPSB0cnVlO1xuXHRcdGxldCBuZXdYO1xuXHRcdGxldCBuZXdZO1xuXHRcdGlmKHRoaXMubGFzdEZyYW1lWCl7XG5cdFx0XHRuZXdYID0geCAtIHRoaXMubGFzdEZyYW1lWCA7XG5cdFx0XHR0aGlzLmxhc3RGcmFtZVggPSB4O1xuXHRcdFx0aWYoTWF0aC5hYnMobmV3WCk+MC4zKXtcblx0XHRcdH1cblx0XHR9ZWxzZXtcblx0XHRcdHRoaXMubGFzdEZyYW1lWCA9IHg7XG5cdFx0XHRwcm9jID0gZmFsc2U7XG5cdFx0fVxuXHRcdGlmKHRoaXMubGFzdEZyYW1lWSl7XG5cdFx0XHRuZXdZID0geSAtIHRoaXMubGFzdEZyYW1lWSA7XG5cdFx0XHR0aGlzLmxhc3RGcmFtZVkgPSB5O1xuXHRcdH1lbHNle1xuXHRcdFx0dGhpcy5sYXN0RnJhbWVZID0geTtcblx0XHRcdHByb2M9IGZhbHNlO1xuXHRcdH1cblx0XHRpZihwcm9jKXtcblx0XHRcdHRoaXMubW90aW9uSW4ucHJvY2VzcyhhdWRpb0NvbnRleHQuY3VycmVudFRpbWUsW25ld1gsbmV3WV0pO1xuXHRcdH1cdFxuXHR9XG59Il19