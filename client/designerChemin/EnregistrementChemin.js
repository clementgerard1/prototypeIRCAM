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
	function Enregistrement(nom, id, sens) {
		(0, _classCallCheck3.default)(this, Enregistrement);


		// Paramètre d'enregistrement
		this.motionIn = new lfo.source.EventIn({
			frameType: 'vector',
			frameSize: 2,
			frameRate: 1,
			description: ['x', 'y']
		});
		this.xmmRecorder = new _xmmLfo.PhraseRecorderLfo();

		this.indice = id; // indice pour les fois où on veut enregistrer plusieurs gestes pour la même forme (en partant de différents endroit)
		this.sens = sens; // sens dans lequel à été enregistrer le gest (1 = gauche/haut à droite/bas, 2 = inverse )
		this.newNom = nom + '-' + this.indice + '-' + sens;
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
			this.motionIn.process(audioContext.currentTime, [x, y]);
		}
	}]);
	return Enregistrement;
}();

exports.default = Enregistrement;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkVucmVnaXN0cmVtZW50Q2hlbWluLmpzIl0sIm5hbWVzIjpbImxmbyIsInNvdW5kd29ya3MiLCJhdWRpb0NvbnRleHQiLCJFbnJlZ2lzdHJlbWVudCIsIm5vbSIsImlkIiwic2VucyIsIm1vdGlvbkluIiwic291cmNlIiwiRXZlbnRJbiIsImZyYW1lVHlwZSIsImZyYW1lU2l6ZSIsImZyYW1lUmF0ZSIsImRlc2NyaXB0aW9uIiwieG1tUmVjb3JkZXIiLCJpbmRpY2UiLCJuZXdOb20iLCJzZXRQaHJhc2VMYWJlbCIsImxhc3RGcmFtZVgiLCJsYXN0RnJhbWVZIiwiY29ubmVjdCIsInN0YXJ0IiwibmV3VGhpcyIsInN0b3AiLCJzZW5kIiwiZ2V0UmVjb3JkZWRQaHJhc2UiLCJnZXRQaHJhc2VMYWJlbCIsIngiLCJ5IiwicHJvY2VzcyIsImN1cnJlbnRUaW1lIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUFBOztBQUNBOztJQUFZQSxHOztBQUNaOztJQUFZQyxVOzs7Ozs7QUFDWixJQUFNQyxlQUFlRCxXQUFXQyxZQUFoQzs7SUFFcUJDLGM7QUFDcEIseUJBQVlDLEdBQVosRUFBZ0JDLEVBQWhCLEVBQW1CQyxJQUFuQixFQUF3QjtBQUFBOzs7QUFFdkI7QUFDQSxPQUFLQyxRQUFMLEdBQWdCLElBQUlQLElBQUlRLE1BQUosQ0FBV0MsT0FBZixDQUF1QjtBQUNsQ0MsY0FBVyxRQUR1QjtBQUVsQ0MsY0FBVyxDQUZ1QjtBQUdsQ0MsY0FBVyxDQUh1QjtBQUlsQ0MsZ0JBQWEsQ0FBQyxHQUFELEVBQU0sR0FBTjtBQUpxQixHQUF2QixDQUFoQjtBQU1BLE9BQUtDLFdBQUwsR0FBbUIsK0JBQW5COztBQUVBLE9BQUtDLE1BQUwsR0FBY1YsRUFBZCxDQVh1QixDQVdMO0FBQ2xCLE9BQUtDLElBQUwsR0FBWUEsSUFBWixDQVp1QixDQVlMO0FBQ2xCLE9BQUtVLE1BQUwsR0FBY1osTUFBTSxHQUFOLEdBQVksS0FBS1csTUFBakIsR0FBMEIsR0FBMUIsR0FBZ0NULElBQTlDO0FBQ0EsT0FBS1EsV0FBTCxDQUFpQkcsY0FBakIsQ0FBZ0MsS0FBS0QsTUFBckM7QUFDQSxPQUFLRSxVQUFMLEdBQWtCLElBQWxCO0FBQ0EsT0FBS0MsVUFBTCxHQUFrQixJQUFsQjtBQUNBLE9BQUtaLFFBQUwsQ0FBY2EsT0FBZCxDQUFzQixLQUFLTixXQUEzQjtBQUNBLE9BQUtQLFFBQUwsQ0FBY2MsS0FBZDtBQUNBOzs7O2dDQUVZO0FBQ1osUUFBS1AsV0FBTCxDQUFpQk8sS0FBakI7QUFDQTs7OzZCQUVVQyxPLEVBQVE7QUFDbEIsUUFBS1IsV0FBTCxDQUFpQlMsSUFBakI7QUFDQUQsV0FBUUUsSUFBUixDQUFhLFFBQWIsRUFBc0IsRUFBRSxVQUFXLEtBQUtWLFdBQUwsQ0FBaUJXLGlCQUFqQixFQUFiLEVBQW1ELFNBQVUsS0FBS1gsV0FBTCxDQUFpQlksY0FBakIsRUFBN0QsRUFBdEI7QUFDQTs7OzBCQUdPQyxDLEVBQUVDLEMsRUFBRTtBQUNYLFFBQUtyQixRQUFMLENBQWNzQixPQUFkLENBQXNCM0IsYUFBYTRCLFdBQW5DLEVBQStDLENBQUNILENBQUQsRUFBR0MsQ0FBSCxDQUEvQztBQUNBOzs7OztrQkFsQ21CekIsYyIsImZpbGUiOiJFbnJlZ2lzdHJlbWVudENoZW1pbi5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFBocmFzZVJlY29yZGVyTGZvLCBIaG1tRGVjb2RlckxmbyB9IGZyb20gJ3htbS1sZm8nO1xuaW1wb3J0ICogYXMgbGZvIGZyb20gJ3dhdmVzLWxmby9jbGllbnQnO1xuaW1wb3J0ICogYXMgc291bmR3b3JrcyBmcm9tICdzb3VuZHdvcmtzL2NsaWVudCc7XG5jb25zdCBhdWRpb0NvbnRleHQgPSBzb3VuZHdvcmtzLmF1ZGlvQ29udGV4dDtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRW5yZWdpc3RyZW1lbnR7XG5cdGNvbnN0cnVjdG9yKG5vbSxpZCxzZW5zKXtcblxuXHRcdC8vIFBhcmFtw6h0cmUgZCdlbnJlZ2lzdHJlbWVudFxuXHRcdHRoaXMubW90aW9uSW4gPSBuZXcgbGZvLnNvdXJjZS5FdmVudEluKHtcbiAgIFx0ICAgZnJhbWVUeXBlOiAndmVjdG9yJyxcbiAgICAgICBmcmFtZVNpemU6IDIsXG4gICAgICAgZnJhbWVSYXRlOiAxLFxuICAgICAgIGRlc2NyaXB0aW9uOiBbJ3gnLCAneSddXG5cdFx0fSk7XG5cdFx0dGhpcy54bW1SZWNvcmRlciA9IG5ldyBQaHJhc2VSZWNvcmRlckxmbygpO1xuXG5cdFx0dGhpcy5pbmRpY2UgPSBpZDsgLy8gaW5kaWNlIHBvdXIgbGVzIGZvaXMgb8O5IG9uIHZldXQgZW5yZWdpc3RyZXIgcGx1c2lldXJzIGdlc3RlcyBwb3VyIGxhIG3Dqm1lIGZvcm1lIChlbiBwYXJ0YW50IGRlIGRpZmbDqXJlbnRzIGVuZHJvaXQpXG5cdFx0dGhpcy5zZW5zID0gc2VuczsgLy8gc2VucyBkYW5zIGxlcXVlbCDDoCDDqXTDqSBlbnJlZ2lzdHJlciBsZSBnZXN0ICgxID0gZ2F1Y2hlL2hhdXQgw6AgZHJvaXRlL2JhcywgMiA9IGludmVyc2UgKVxuXHRcdHRoaXMubmV3Tm9tID0gbm9tICsgJy0nICsgdGhpcy5pbmRpY2UgKyAnLScgKyBzZW5zO1xuXHRcdHRoaXMueG1tUmVjb3JkZXIuc2V0UGhyYXNlTGFiZWwodGhpcy5uZXdOb20pO1xuXHRcdHRoaXMubGFzdEZyYW1lWCA9IG51bGw7XG5cdFx0dGhpcy5sYXN0RnJhbWVZID0gbnVsbDtcblx0XHR0aGlzLm1vdGlvbkluLmNvbm5lY3QodGhpcy54bW1SZWNvcmRlcik7XG5cdFx0dGhpcy5tb3Rpb25Jbi5zdGFydCgpO1xuXHR9XG5cblx0c3RhcnRSZWNvcmQoKXtcblx0XHR0aGlzLnhtbVJlY29yZGVyLnN0YXJ0KCk7XG5cdH1cblxuXHRzdG9wUmVjb3JkKG5ld1RoaXMpe1xuXHRcdHRoaXMueG1tUmVjb3JkZXIuc3RvcCgpO1xuXHRcdG5ld1RoaXMuc2VuZCgncGhyYXNlJyx7ICdwaHJhc2UnIDogdGhpcy54bW1SZWNvcmRlci5nZXRSZWNvcmRlZFBocmFzZSgpLCAnbGFiZWwnIDogdGhpcy54bW1SZWNvcmRlci5nZXRQaHJhc2VMYWJlbCgpIH0pO1xuXHR9XG5cblxuXHRwcm9jZXNzKHgseSl7XG5cdFx0dGhpcy5tb3Rpb25Jbi5wcm9jZXNzKGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSxbeCx5XSk7XHRcblx0fVxufSJdfQ==