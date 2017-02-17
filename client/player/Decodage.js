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
			return label;
			if (/forme1/.test(label)) {
				forme1 = this._scale(++forme1);
				forme2 = this._scale(--forme2);
				forme3 = this._scale(--forme3);
			}
			if (/forme2/.test(label)) {
				forme2 = this._scale(++forme2);
				forme1 = this._scale(--forme1);
				forme3 = this._scale(--forme3);
			}
			if (/forme3/.test(label)) {
				forme3 = this._scale(++forme3);
				forme1 = this._scale(--forme1);
				forme2 = this._scale(--forme2);
			}
			if (forme1 > forme2 && forme1 > forme3 && forme1 > seuil) {
				return ["forme1"];
			} else if (forme2 > forme3 && forme2 > forme1 && forme2 > seuil) {
				return ["forme2"];
			} else if (forme3 > forme2 && forme3 > forme1 && forme3 > seuil) {
				return ["forme3"];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRlY29kYWdlLmpzIl0sIm5hbWVzIjpbImxmbyIsInNvdW5kd29ya3MiLCJhdWRpb0NvbnRleHQiLCJsaWtlbGlob29kcyIsImxpa2VsaWVzdCIsImxhYmVsIiwiZm9ybWUxIiwiZm9ybWUyIiwiZm9ybWUzIiwibWF4TWVtb2lyZSIsInNldWlsIiwiRW5yZWdpc3RyZW1lbnQiLCJtb3Rpb25JbiIsInNvdXJjZSIsIkV2ZW50SW4iLCJmcmFtZVR5cGUiLCJmcmFtZVNpemUiLCJmcmFtZVJhdGUiLCJkZXNjcmlwdGlvbiIsImhobW1EZWNvZGVyIiwibGlrZWxpaG9vZFdpbmRvdyIsImNhbGxiYWNrIiwiX3VwZGF0ZSIsImxhc3RGcmFtZVgiLCJsYXN0RnJhbWVZIiwibWluUGl4ZWxYIiwibWluUGl4ZWxZIiwic3RhcnQiLCJtb2RlbCIsInBhcmFtcyIsInNldCIsImNvbm5lY3QiLCJ4IiwieSIsImRpZk9rIiwibmV3WCIsIm5ld1kiLCJhYnNYIiwiTWF0aCIsImFicyIsImFic1kiLCJwcm9jZXNzIiwiY3VycmVudFRpbWUiLCJyZXMiLCJsaWtlbGllc3RJbmRleCIsInRlc3QiLCJfc2NhbGUiLCJyZXNldCIsIm51bWJlciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7QUFDQTs7SUFBWUEsRzs7QUFDWjs7SUFBWUMsVTs7Ozs7O0FBQ1osSUFBTUMsZUFBZUQsV0FBV0MsWUFBaEM7O0FBRUEsSUFBSUMsb0JBQUo7QUFDQSxJQUFJQyxrQkFBSjtBQUNBLElBQUlDLGNBQUo7QUFDQSxJQUFJQyxTQUFTLENBQWI7QUFDQSxJQUFJQyxTQUFTLENBQWI7QUFDQSxJQUFJQyxTQUFTLENBQWI7QUFDQSxJQUFJQyxhQUFhLEdBQWpCO0FBQ0EsSUFBSUMsUUFBUSxHQUFaOztJQUVxQkMsYztBQUNwQiwyQkFBYTtBQUFBOztBQUNaOztBQUVBO0FBQ0EsT0FBS0MsUUFBTCxHQUFnQixJQUFJWixJQUFJYSxNQUFKLENBQVdDLE9BQWYsQ0FBdUI7QUFDbENDLGNBQVcsUUFEdUI7QUFFbENDLGNBQVcsQ0FGdUI7QUFHbENDLGNBQVcsQ0FIdUI7QUFJbENDLGdCQUFhLENBQUMsR0FBRCxFQUFNLEdBQU47QUFKcUIsR0FBdkIsQ0FBaEI7QUFNQSxPQUFLQyxXQUFMLEdBQW1CLDJCQUFtQjtBQUNyQ0MscUJBQWtCLENBRG1CO0FBRWxDQyxhQUFVLEtBQUtDO0FBRm1CLEdBQW5CLENBQW5COztBQU1FO0FBQ0YsT0FBS0MsVUFBTCxHQUFrQixHQUFsQjtBQUNBLE9BQUtDLFVBQUwsR0FBa0IsR0FBbEI7QUFDQSxPQUFLQyxTQUFMLEdBQWlCLENBQWpCO0FBQ0EsT0FBS0MsU0FBTCxHQUFpQixDQUFqQjtBQUNBLE9BQUtDLEtBQUwsR0FBYSxLQUFiO0FBQ0E7Ozs7MkJBRVFDLEssRUFBTTtBQUNkLFFBQUtULFdBQUwsQ0FBaUJVLE1BQWpCLENBQXdCQyxHQUF4QixDQUE0QixPQUE1QixFQUFxQ0YsS0FBckM7QUFDQSxPQUFHLENBQUMsS0FBS0QsS0FBVCxFQUFlO0FBQ2QsU0FBS2YsUUFBTCxDQUFjbUIsT0FBZCxDQUFzQixLQUFLWixXQUEzQjtBQUNBLFNBQUtQLFFBQUwsQ0FBY2UsS0FBZDtBQUNBLFNBQUtBLEtBQUwsR0FBVyxJQUFYO0FBQ0E7QUFDRDs7OzBCQUdPSyxDLEVBQUVDLEMsRUFBRTtBQUNYLE9BQUlDLFFBQVEsS0FBWjtBQUNBO0FBQ0EsT0FBSUMsT0FBTyxLQUFLWixVQUFMLEdBQWdCUyxDQUEzQjtBQUNBLE9BQUlJLE9BQU8sS0FBS1osVUFBTCxHQUFnQlMsQ0FBM0I7QUFDQSxPQUFJSSxPQUFPQyxLQUFLQyxHQUFMLENBQVNKLElBQVQsQ0FBWDtBQUNBLE9BQUlLLE9BQU9GLEtBQUtDLEdBQUwsQ0FBU0gsSUFBVCxDQUFYO0FBQ0EsT0FBSUMsT0FBSyxLQUFLWixTQUFYLElBQTBCZSxPQUFLLEtBQUtkLFNBQXZDLEVBQWtEO0FBQ2pEUSxZQUFRLElBQVI7QUFDQSxTQUFLWCxVQUFMLEdBQWtCUyxDQUFsQjtBQUNBLFNBQUtSLFVBQUwsR0FBa0JTLENBQWxCO0FBQ0E7QUFDRCxPQUFHQyxLQUFILEVBQVM7QUFDUixTQUFLdEIsUUFBTCxDQUFjNkIsT0FBZCxDQUFzQnZDLGFBQWF3QyxXQUFuQyxFQUErQyxDQUFDUCxJQUFELEVBQU1DLElBQU4sQ0FBL0M7QUFDQTtBQUNEOzs7MEJBRU9PLEcsRUFBSTtBQUNUeEMsaUJBQWN3QyxJQUFJeEMsV0FBbEI7QUFDQUMsZUFBWXVDLElBQUlDLGNBQWhCO0FBQ0F2QyxXQUFRc0MsSUFBSXZDLFNBQVo7QUFDRjs7OzZCQUVTO0FBQ1QsVUFBT0MsS0FBUDtBQUNBLE9BQUcsU0FBU3dDLElBQVQsQ0FBY3hDLEtBQWQsQ0FBSCxFQUF3QjtBQUN2QkMsYUFBUyxLQUFLd0MsTUFBTCxDQUFZLEVBQUV4QyxNQUFkLENBQVQ7QUFDQUMsYUFBUyxLQUFLdUMsTUFBTCxDQUFZLEVBQUV2QyxNQUFkLENBQVQ7QUFDQUMsYUFBUyxLQUFLc0MsTUFBTCxDQUFZLEVBQUV0QyxNQUFkLENBQVQ7QUFDQTtBQUNELE9BQUcsU0FBU3FDLElBQVQsQ0FBY3hDLEtBQWQsQ0FBSCxFQUF3QjtBQUN2QkUsYUFBUyxLQUFLdUMsTUFBTCxDQUFZLEVBQUV2QyxNQUFkLENBQVQ7QUFDQUQsYUFBUyxLQUFLd0MsTUFBTCxDQUFZLEVBQUV4QyxNQUFkLENBQVQ7QUFDQUUsYUFBUyxLQUFLc0MsTUFBTCxDQUFZLEVBQUV0QyxNQUFkLENBQVQ7QUFDQTtBQUNELE9BQUcsU0FBU3FDLElBQVQsQ0FBY3hDLEtBQWQsQ0FBSCxFQUF3QjtBQUN2QkcsYUFBUyxLQUFLc0MsTUFBTCxDQUFZLEVBQUV0QyxNQUFkLENBQVQ7QUFDQUYsYUFBUyxLQUFLd0MsTUFBTCxDQUFZLEVBQUV4QyxNQUFkLENBQVQ7QUFDQUMsYUFBUyxLQUFLdUMsTUFBTCxDQUFZLEVBQUV2QyxNQUFkLENBQVQ7QUFDQTtBQUNELE9BQUdELFNBQU9DLE1BQVAsSUFBZUQsU0FBT0UsTUFBdEIsSUFBOEJGLFNBQU9JLEtBQXhDLEVBQThDO0FBQzdDLFdBQU8sQ0FBQyxRQUFELENBQVA7QUFDQSxJQUZELE1BRU8sSUFBR0gsU0FBT0MsTUFBUCxJQUFlRCxTQUFPRCxNQUF0QixJQUE4QkMsU0FBT0csS0FBeEMsRUFBOEM7QUFDcEQsV0FBTyxDQUFDLFFBQUQsQ0FBUDtBQUNBLElBRk0sTUFFQSxJQUFHRixTQUFPRCxNQUFQLElBQWVDLFNBQU9GLE1BQXRCLElBQThCRSxTQUFPRSxLQUF4QyxFQUE4QztBQUNwRCxXQUFPLENBQUMsUUFBRCxDQUFQO0FBQ0EsSUFGTSxNQUVGO0FBQ0osV0FBTyxJQUFQO0FBQ0E7QUFDRDs7OzBCQUVNO0FBQ04sUUFBS1MsV0FBTCxDQUFpQjRCLEtBQWpCO0FBQ0E7Ozt5QkFFTUMsTSxFQUFPO0FBQ2IsT0FBR0EsU0FBTyxDQUFWLEVBQVk7QUFDWCxXQUFPLENBQVA7QUFDQSxJQUZELE1BRU0sSUFBR0EsU0FBT3ZDLFVBQVYsRUFBcUI7QUFDMUIsV0FBT0EsVUFBUDtBQUNBLElBRkssTUFFRDtBQUNKLFdBQU91QyxNQUFQO0FBQ0E7QUFDRDs7Ozs7a0JBbEdtQnJDLGMiLCJmaWxlIjoiRGVjb2RhZ2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBIaG1tRGVjb2RlckxmbyB9IGZyb20gJ3htbS1sZm8nO1xuaW1wb3J0ICogYXMgbGZvIGZyb20gJ3dhdmVzLWxmby9jbGllbnQnO1xuaW1wb3J0ICogYXMgc291bmR3b3JrcyBmcm9tICdzb3VuZHdvcmtzL2NsaWVudCc7XG5jb25zdCBhdWRpb0NvbnRleHQgPSBzb3VuZHdvcmtzLmF1ZGlvQ29udGV4dDtcblxubGV0IGxpa2VsaWhvb2RzO1xubGV0IGxpa2VsaWVzdDtcbmxldCBsYWJlbDtcbmxldCBmb3JtZTEgPSAwO1xubGV0IGZvcm1lMiA9IDA7XG5sZXQgZm9ybWUzID0gMDtcbmxldCBtYXhNZW1vaXJlID0gNjAwO1xubGV0IHNldWlsID0gMzAwO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFbnJlZ2lzdHJlbWVudHtcblx0Y29uc3RydWN0b3IoKXtcblx0XHQvL3RoaXMuX3VwZGF0ZSA9IHRoaXMuX3VwZGF0ZS5iaW5kKHRoaXMpO1xuXG5cdFx0Ly8gUGFyYW3DqHRyZSBkJ2VucmVnaXN0cmVtZW50XG5cdFx0dGhpcy5tb3Rpb25JbiA9IG5ldyBsZm8uc291cmNlLkV2ZW50SW4oe1xuICAgXHQgICBmcmFtZVR5cGU6ICd2ZWN0b3InLFxuICAgICAgIGZyYW1lU2l6ZTogMixcbiAgICAgICBmcmFtZVJhdGU6IDEsXG4gICAgICAgZGVzY3JpcHRpb246IFsneCcsICd5J11cblx0XHR9KTtcblx0XHR0aGlzLmhobW1EZWNvZGVyID0gbmV3IEhobW1EZWNvZGVyTGZvKHtcblx0XHRcdGxpa2VsaWhvb2RXaW5kb3c6IDQsXG4gICAgICBjYWxsYmFjazogdGhpcy5fdXBkYXRlXG4gICAgICB9XG4gICAgKTtcblxuICAgIC8vVmFyaWFibGVzXG5cdFx0dGhpcy5sYXN0RnJhbWVYID0gMC41O1xuXHRcdHRoaXMubGFzdEZyYW1lWSA9IDAuNTtcblx0XHR0aGlzLm1pblBpeGVsWCA9IDM7XG5cdFx0dGhpcy5taW5QaXhlbFkgPSAzO1xuXHRcdHRoaXMuc3RhcnQgPSBmYWxzZTtcblx0fVxuXG5cdHNldE1vZGVsKG1vZGVsKXtcblx0XHR0aGlzLmhobW1EZWNvZGVyLnBhcmFtcy5zZXQoJ21vZGVsJywgbW9kZWwpO1xuXHRcdGlmKCF0aGlzLnN0YXJ0KXtcblx0XHRcdHRoaXMubW90aW9uSW4uY29ubmVjdCh0aGlzLmhobW1EZWNvZGVyKTtcblx0XHRcdHRoaXMubW90aW9uSW4uc3RhcnQoKTtcblx0XHRcdHRoaXMuc3RhcnQ9dHJ1ZTtcblx0XHR9XG5cdH1cblxuXG5cdHByb2Nlc3MoeCx5KXtcblx0XHRsZXQgZGlmT2sgPSBmYWxzZTtcblx0XHQvLyBOb3JtYWxpc2F0aW9uIGRlcyBlbnRyw6llc1xuXHRcdGxldCBuZXdYID0gdGhpcy5sYXN0RnJhbWVYLXg7XG5cdFx0bGV0IG5ld1kgPSB0aGlzLmxhc3RGcmFtZVkteTtcblx0XHRsZXQgYWJzWCA9IE1hdGguYWJzKG5ld1gpO1xuXHRcdGxldCBhYnNZID0gTWF0aC5hYnMobmV3WSk7XG5cdFx0aWYoKGFic1g+dGhpcy5taW5QaXhlbFgpIHx8IChhYnNZPnRoaXMubWluUGl4ZWxZKSl7XG5cdFx0XHRkaWZPayA9IHRydWU7XG5cdFx0XHR0aGlzLmxhc3RGcmFtZVggPSB4O1xuXHRcdFx0dGhpcy5sYXN0RnJhbWVZID0geTtcblx0XHR9XG5cdFx0aWYoZGlmT2spe1xuXHRcdFx0dGhpcy5tb3Rpb25Jbi5wcm9jZXNzKGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSxbbmV3WCxuZXdZXSk7XG5cdFx0fVxuXHR9XG5cblx0X3VwZGF0ZShyZXMpe1xuICAgIGxpa2VsaWhvb2RzID0gcmVzLmxpa2VsaWhvb2RzO1xuICAgIGxpa2VsaWVzdCA9IHJlcy5saWtlbGllc3RJbmRleDtcbiAgICBsYWJlbCA9IHJlcy5saWtlbGllc3Q7XG5cdH1cblxuXHRnZXRQcm9iYSgpe1xuXHRcdHJldHVybiBsYWJlbDtcblx0XHRpZigvZm9ybWUxLy50ZXN0KGxhYmVsKSl7XG5cdFx0XHRmb3JtZTEgPSB0aGlzLl9zY2FsZSgrK2Zvcm1lMSk7XG5cdFx0XHRmb3JtZTIgPSB0aGlzLl9zY2FsZSgtLWZvcm1lMik7XG5cdFx0XHRmb3JtZTMgPSB0aGlzLl9zY2FsZSgtLWZvcm1lMyk7XG5cdFx0fVxuXHRcdGlmKC9mb3JtZTIvLnRlc3QobGFiZWwpKXtcblx0XHRcdGZvcm1lMiA9IHRoaXMuX3NjYWxlKCsrZm9ybWUyKTtcblx0XHRcdGZvcm1lMSA9IHRoaXMuX3NjYWxlKC0tZm9ybWUxKTtcblx0XHRcdGZvcm1lMyA9IHRoaXMuX3NjYWxlKC0tZm9ybWUzKTtcblx0XHR9XG5cdFx0aWYoL2Zvcm1lMy8udGVzdChsYWJlbCkpe1xuXHRcdFx0Zm9ybWUzID0gdGhpcy5fc2NhbGUoKytmb3JtZTMpO1xuXHRcdFx0Zm9ybWUxID0gdGhpcy5fc2NhbGUoLS1mb3JtZTEpO1xuXHRcdFx0Zm9ybWUyID0gdGhpcy5fc2NhbGUoLS1mb3JtZTIpO1xuXHRcdH0gXG5cdFx0aWYoZm9ybWUxPmZvcm1lMiYmZm9ybWUxPmZvcm1lMyYmZm9ybWUxPnNldWlsKXtcblx0XHRcdHJldHVybiBbXCJmb3JtZTFcIl07XG5cdFx0fSBlbHNlIGlmKGZvcm1lMj5mb3JtZTMmJmZvcm1lMj5mb3JtZTEmJmZvcm1lMj5zZXVpbCl7XG5cdFx0XHRyZXR1cm4gW1wiZm9ybWUyXCJdO1xuXHRcdH0gZWxzZSBpZihmb3JtZTM+Zm9ybWUyJiZmb3JtZTM+Zm9ybWUxJiZmb3JtZTM+c2V1aWwpe1xuXHRcdFx0cmV0dXJuIFtcImZvcm1lM1wiXTtcblx0XHR9ZWxzZXtcblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH1cblx0fVxuXG5cdHJlc2V0KCl7XG5cdFx0dGhpcy5oaG1tRGVjb2Rlci5yZXNldCgpO1xuXHR9XG5cblx0X3NjYWxlKG51bWJlcil7XG5cdFx0aWYobnVtYmVyPDApe1xuXHRcdFx0cmV0dXJuIDA7XG5cdFx0fWVsc2UgaWYobnVtYmVyPm1heE1lbW9pcmUpe1xuXHRcdFx0cmV0dXJuIG1heE1lbW9pcmU7XG5cdFx0fWVsc2V7XG5cdFx0XHRyZXR1cm4gbnVtYmVyO1xuXHRcdH1cblx0fVxufSJdfQ==