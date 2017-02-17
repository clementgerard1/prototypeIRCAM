(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{"babel-runtime/helpers/classCallCheck":32,"babel-runtime/helpers/createClass":33,"soundworks/client":336,"waves-lfo/client":395,"xmm-lfo":451}],2:[function(require,module,exports){
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
			likelihoodWindow: 4,
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

},{"babel-runtime/helpers/classCallCheck":32,"babel-runtime/helpers/createClass":33,"soundworks/client":336,"waves-lfo/client":395,"xmm-lfo":451}],3:[function(require,module,exports){
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
			likelihoodWindow: 4,
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

},{"babel-runtime/helpers/classCallCheck":32,"babel-runtime/helpers/createClass":33,"soundworks/client":336,"waves-lfo/client":395,"xmm-lfo":451}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _trunc = require('babel-runtime/core-js/math/trunc');

var _trunc2 = _interopRequireDefault(_trunc);

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

		//this.feedback = audioContext.createGain();
		//this.feedback.gain.value = 0.1;
		//this.output.connect(this.feedback);
		//this.feedback.connect(this.input);

		_this.grainPhase = [0, 0.25, 0.125, 0.375, 0.075, 0.325, 0.2, 0.4, 0.5, 0.75, 0.625, 0.875, 0.575, 0.825, 0.7, 0.9];
		_this.gain = [];
		_this.delay = [];

		// Initialisation des paramètres
		_this.period = 100; //Nombre de coup de scheduler (min 10)

		_this.grainSchedulerPhase = [];
		for (var i = 0; i < _this.grainPhase.length; i++) {
			_this.grainSchedulerPhase[i] = (0, _trunc2.default)(_this.grainPhase[i] * _this.period);
		}
		_this.finesse = 0.005; // period du scheduler 
		_this.randomPosition = 1500; //ms
		_this.rampGainCompensation = 0.001; //ms

		for (var _i = 0; _i < 16; _i++) {
			_this.gain.push(audioContext.createGain());
			_this.delay.push(audioContext.createDelay(20));
			_this.input.connect(_this.delay[_i]);
			_this.delay[_i].connect(_this.gain[_i]);
			_this.delay[_i].delayTime.value = Math.random() * _this.randomPosition / 1000.;
			_this.gain[_i].connect(_this.output);
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
			this.grainSchedulerPhase = [];
			for (var i = 0; i < this.grainPhase.length; i++) {
				this.grainSchedulerPhase[i] = (0, _trunc2.default)(this.grainPhase[i] * this.period);
			}
		}

		/* Public */

	}, {
		key: 'advanceTime',
		value: function advanceTime(time) {
			this._updatePhase();
			this._assignGain();
			return time + this.finesse;
		}

		//-------------------------------------------------


		/** @private */

	}, {
		key: '_updatePhase',
		value: function _updatePhase() {
			for (var i = 0; i < 16; i++) {
				this.grainSchedulerPhase[i] = (this.grainSchedulerPhase[i] + 1) % this.period; //= this._norm(this.grain[i]);
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
				var toTri = void 0;
				var semiPeriod = this.period / 2;
				if (this.grainSchedulerPhase[i] < semiPeriod) {
					toTri = this.grainSchedulerPhase[i] / semiPeriod; // return [0,1]
				} else {
					toTri = (semiPeriod - (this.grainSchedulerPhase[i] - semiPeriod)) / semiPeriod; // return [0,1]
				}
				toTri *= 0.2;
				this.gain[i].gain.linearRampToValueAtTime(toTri, audioContext.currentTime + 0.001);
				if (toTri == 0) {
					this._assignPosition(i);
				}
			}
		}

		/* Private */

	}, {
		key: '_assignPosition',
		value: function _assignPosition(id) {
			this.delay[id].delayTime.setValueAtTime(Math.random() * this.randomPosition / 1000., audioContext.currentTime + 0.001); //+this.rampGainCompensation);
		}
	}]);
	return MyGrain;
}(waves.AudioTimeEngine);

exports.default = MyGrain;

},{"babel-runtime/core-js/math/trunc":17,"babel-runtime/core-js/object/get-prototype-of":24,"babel-runtime/helpers/classCallCheck":32,"babel-runtime/helpers/createClass":33,"babel-runtime/helpers/inherits":36,"babel-runtime/helpers/possibleConstructorReturn":37,"soundworks/client":336,"waves-audio":373}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _trunc = require('babel-runtime/core-js/math/trunc');

var _trunc2 = _interopRequireDefault(_trunc);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _get2 = require('babel-runtime/helpers/get');

var _get3 = _interopRequireDefault(_get2);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _client = require('soundworks/client');

var soundworks = _interopRequireWildcard(_client);

var _MyGrain = require('./MyGrain2.js');

var _MyGrain2 = _interopRequireDefault(_MyGrain);

var _wavesAudio = require('waves-audio');

var waves = _interopRequireWildcard(_wavesAudio);

var _xmmLfo = require('xmm-lfo');

var _Decodage = require('./Decodage.js');

var _Decodage2 = _interopRequireDefault(_Decodage);

var _Decodage3 = require('./Decodage2.js');

var _Decodage4 = _interopRequireDefault(_Decodage3);

var _Decodage5 = require('./Decodage3.js');

var _Decodage6 = _interopRequireDefault(_Decodage5);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var audioContext = soundworks.audioContext;
var scheduler = waves.getScheduler();

var PlayerView = function (_soundworks$View) {
  (0, _inherits3.default)(PlayerView, _soundworks$View);

  function PlayerView(template, content, events, options) {
    (0, _classCallCheck3.default)(this, PlayerView);
    return (0, _possibleConstructorReturn3.default)(this, (PlayerView.__proto__ || (0, _getPrototypeOf2.default)(PlayerView)).call(this, template, content, events, options));
  }

  return PlayerView;
}(soundworks.View);

var view = '';

// this experience plays a sound when it starts, and plays another sound when
// other clients join the experience

var PlayerExperience = function (_soundworks$Experienc) {
  (0, _inherits3.default)(PlayerExperience, _soundworks$Experienc);

  function PlayerExperience(assetsDomain) {
    (0, _classCallCheck3.default)(this, PlayerExperience);

    //Services
    var _this2 = (0, _possibleConstructorReturn3.default)(this, (PlayerExperience.__proto__ || (0, _getPrototypeOf2.default)(PlayerExperience)).call(this));

    _this2.platform = _this2.require('platform', { features: ['web-audio', 'wake-lock'] });
    _this2.motionInput = _this2.require('motion-input', { descriptors: ['orientation'] });
    _this2.loader = _this2.require('loader', {
      files: ['sounds/nappe/gadoue.mp3', //0
      'sounds/nappe/gadoue.mp3', //1
      "sounds/nappe/nage.mp3", // ...
      "sounds/nappe/tempete.mp3", "sounds/nappe/vent.mp3", "sounds/chemin/camusC.mp3", // 5  
      "markers/camus.json", "sounds/chemin/churchillC.mp3", "markers/churchill.json", "sounds/chemin/irakC.mp3", "markers/irak.json", //10  
      "sounds/forme/trump.mp3", "sounds/forme/eminem.mp3", "sounds/forme/fr.mp3", "sounds/forme/brexit.mp3"]
    });
    _this2.startOK = false;
    _this2.startSegmentFini = [];
    _this2.modelOK = false;

    // PARAMETRE
    _this2.nbChemin = 3;
    _this2.nbForme = 4;
    _this2.qtRandom = 25;
    _this2.nbSegment = [232, 144, 106];

    //
    _this2.ancien1 = [];
    _this2.ancien2 = [];
    _this2.ancien3 = false;
    _this2.countTimeout = [];
    _this2.direction = [];
    _this2.oldTabChemin = [];
    _this2.count1 = [];
    _this2.count2 = [];
    _this2.segmenter = [];
    _this2.segmenterFB = [];
    _this2.segmenterDelayFB = [];
    _this2.segmenterGain = [];
    _this2.segmenterGainGrain = [];
    _this2.sources = [];
    _this2.gains = [];
    _this2.gainsDirections = [];
    _this2.grain;
    _this2.lastSegment = [0, 0, 0];
    _this2.lastPosition = [0, 0, 0];
    _this2.gainOutputDirect;
    _this2.gainOutputGrain;
    _this2.gainsForme = [];
    _this2.ancienForme = [false, false, false];
    _this2.gainsGrainForme = [];
    _this2.soundForme = [];
    _this2.rampForme = { 'forme1': 0, 'forme2': 0, 'forme3': 0, 'forme4': 0 };
    _this2.countMax = 100;

    for (var i = 0; i < _this2.nbChemin; i++) {
      _this2.count1[i] = 20;
      _this2.count2[i] = 20;
      _this2.ancien1[i] = 0;
      _this2.ancien2[i] = 0;
      _this2.countTimeout[i] = 0;
      _this2.direction[i] = true;
      _this2.oldTabChemin[i] = true;
      _this2.startSegmentFini[i] = false;
    }
    return _this2;
  }

  (0, _createClass3.default)(PlayerExperience, [{
    key: 'init',
    value: function init() {
      var _this3 = this;

      // initialize the view
      this.viewTemplate = view;
      this.viewContent = {};
      this.viewCtor = PlayerView;
      this.viewOptions = { preservePixelRatio: true };
      this.view = this.createView();

      //bind
      this._toMove = this._toMove.bind(this);
      this._isInEllipse = this._isInEllipse.bind(this);
      this._isInRect = this._isInRect.bind(this);
      this._isIn = this._isIn.bind(this);
      this._isInChemin = this._isInChemin.bind(this);
      this._isInForme = this._isInForme.bind(this);
      this._getDistanceNode = this._getDistanceNode.bind(this);
      this._creationUniversSonore = this._creationUniversSonore.bind(this);
      this._updateGain = this._updateGain.bind(this);
      this._rotatePoint = this._rotatePoint.bind(this);
      this._myListener = this._myListener.bind(this);
      this._addBoule = this._addBoule.bind(this);
      this._addFond = this._addFond.bind(this);
      this._setModel = this._setModel.bind(this);
      this._processProba = this._processProba.bind(this);
      this._remplaceForme = this._remplaceForme.bind(this);
      this._addForme = this._addForme.bind(this);
      this._startSegmenter = this._startSegmenter.bind(this);
      this._findNewSegment = this._findNewSegment.bind(this);
      this._actualiserSegmentIfNotIn = this._actualiserSegmentIfNotIn.bind(this);
      this._actualiserAudioChemin = this._actualiserAudioChemin.bind(this);
      this._actualiserAudioForme = this._actualiserAudioForme.bind(this);
      this.receive('fond', function (data) {
        return _this3._addFond(data);
      });
      this.receive('model', function (model, model1, model2) {
        return _this3._setModel(model, model1, model2);
      });
      this.receive('reponseForme', function (forme, x, y) {
        return _this3._addForme(forme, x, y);
      });
    }
  }, {
    key: 'start',
    value: function start() {
      var _this4 = this;

      if (!this.startOK) {
        (0, _get3.default)(PlayerExperience.prototype.__proto__ || (0, _getPrototypeOf2.default)(PlayerExperience.prototype), 'start', this).call(this); // don't forget this
        if (!this.hasStarted) this.init();
        this.show();
        //XMM
        this.decoder = new _Decodage2.default();
        this.decoder2 = new _Decodage4.default();
        this.decoder3 = new _Decodage6.default();
      } else {
        //Paramètre initiaux
        this._addBoule(10, 10);
        document.body.style.overflow = "hidden";
        this.centreX = window.innerWidth / 2;
        this.tailleEcranX = window.innerWidth;
        this.tailleEcranY = window.innerHeight;
        this.centreEcranX = this.tailleEcranX / 2;
        this.centreEcranY = this.tailleEcranY / 2;
        setTimeout(function () {
          _this4._myListener(100);
        }, 100);
        this.centreY = window.innerHeight / 2;

        //Detecte les elements SVG
        this.listeEllipse = document.getElementsByTagName('ellipse');
        this.listeRect = document.getElementsByTagName('rect');
        this.totalElements = this.listeEllipse.length + this.listeRect.length;
        this.listeText = document.getElementsByTagName('text');
        this.listeForme = [];
        this.listeRectChemin1 = document.getElementsByClassName('chemin0');
        this.listeRectChemin2 = document.getElementsByClassName('chemin1');
        this.listeRectChemin3 = document.getElementsByClassName('chemin2');
        this.listeRectForme1 = document.getElementsByClassName('forme1');
        this.listeRectForme2 = document.getElementsByClassName('forme2');
        this.listeRectForme3 = document.getElementsByClassName('forme3');
        this.listeRectForme4 = document.getElementsByClassName('forme4');

        //Remplace les _textes par leur forme.
        this._remplaceForme();

        //Crée l'univers sonore
        this._creationUniversSonore();

        //Initisalisation
        this.maxCountUpdate = 4;
        this.countUpdate = this.maxCountUpdate + 1; // Initialisation
        this.visualisationFormeChemin = false;
        this.visualisationBoule = true; // Visualisation de la boule
        if (!this.visualisationBoule) {
          this.view.$el.querySelector('#boule').style.display = 'none';
        }
        this.visualisationForme = false; // Visualisation des formes SVG
        if (!this.visualisationForme) {
          for (var i = 0; i < this.listeEllipse.length; i++) {
            this.listeEllipse[i].style.display = 'none';
          }
          for (var _i = 0; _i < this.listeRect.length; _i++) {
            this.listeRect[_i].style.display = 'none';
          }
        }

        //Pour enelever les bordures :
        // if(this.visualisationForme){
        //   for(let i = 0;i<this.listeEllipse.length;i++){
        //     this.listeEllipse[i].setAttribute('stroke-width',0);
        //   }
        //   for(let i = 0;i<this.listeRect.length;i++){
        //     this.listeRect[i].setAttribute('stroke-width',0);
        //   }
        // }   

        //Variables 
        this.mirrorBouleX = 10;
        this.mirrorBouleY = 10;
        this.offsetX = 0; // Initisalisation du offset
        this.offsetY = 0;
        this.SVG_MAX_X = document.getElementsByTagName('svg')[0].getAttribute('width');
        this.SVG_MAX_Y = document.getElementsByTagName('svg')[0].getAttribute('height');

        // Gestion de l'orientation
        this.tabIn;
        if (this.motionInput.isAvailable('orientation')) {
          this.motionInput.addListener('orientation', function (data) {
            var newValues = _this4._toMove(data[2], data[1] - 25);
            _this4.tabIn = _this4._isIn(newValues[0], newValues[1]);
            _this4.tabChemin = _this4._isInChemin(newValues[0], newValues[1]);
            // if(this.modelOk&&!(this.tabChemin[0]&&this.tabChemin[1]&&this.tabChemin[2])){
            //   this.decoder1.reset();
            //   this.decoder2.reset();
            // }
            _this4.tabForme = _this4._isInForme(newValues[0], newValues[1]);
            if (_this4.modelOk && !(_this4.tabForme[0] && _this4.tabForme[1] && _this4.tabForme[2] && _this4.tabForme[3])) {
              _this4.decoder.reset();
            }
            if (_this4.countUpdate > _this4.maxCountUpdate) {
              _this4._updateGain(_this4.tabIn);
              _this4.countUpdate = 0;
            } else {
              _this4.countUpdate++;
            }
            _this4._moveScreenTo(newValues[0], newValues[1], 0.08);
            // XMM
            if (_this4.modelOK) {
              _this4.decoder.process(newValues[0], newValues[1]);
              _this4.decoder2.process(newValues[0], newValues[1]);
              _this4.decoder3.process(newValues[0], newValues[1]);
              _this4._processProba();
            }
          });
        } else {
          console.log("Orientation non disponible");
        }
      }
    }

    /* ------------------------------------------MOUVEMENT DE L ECRAN / IMAGES--------------------------------------------- */

    /* Ajoute la boule au fond */

  }, {
    key: '_addBoule',
    value: function _addBoule(x, y) {
      var elem = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      elem.setAttributeNS(null, "cx", x);
      elem.setAttributeNS(null, "cy", y);
      elem.setAttributeNS(null, "r", 10);
      elem.setAttributeNS(null, "stroke", 'white');
      elem.setAttributeNS(null, "stroke-width", 3);
      elem.setAttributeNS(null, "fill", 'black');
      elem.setAttributeNS(null, "id", 'boule');
      document.getElementsByTagName('svg')[0].appendChild(elem);
    }

    /* Ajoute le fond */

  }, {
    key: '_addFond',
    value: function _addFond(fond) {
      // On parse le fichier SVG en DOM
      var parser = new DOMParser();
      var fondXml = parser.parseFromString(fond, 'application/xml');
      fondXml = fondXml.getElementsByTagName('svg')[0];
      document.getElementById('experience').appendChild(fondXml);
      document.getElementsByTagName('svg')[0].setAttribute('id', 'svgElement');
      this._supprimerRectChemin();
      this.startOK = true;
      this.start();
    }

    /* Supprime les rectangles qui suivent les chemins */

  }, {
    key: '_supprimerRectChemin',
    value: function _supprimerRectChemin() {
      var tab = document.getElementsByClassName('chemin0');
      if (!this.visualisationFormeChemin) {
        for (var i = 0; i < tab.length; i++) {
          tab[i].style.display = 'none';
        }

        tab = document.getElementsByClassName('chemin1');
        for (var _i2 = 0; _i2 < tab.length; _i2++) {
          tab[_i2].style.display = 'none';
        }

        tab = document.getElementsByClassName('chemin2');
        for (var _i3 = 0; _i3 < tab.length; _i3++) {
          tab[_i3].style.display = 'none';
        }
      }
    }
  }, {
    key: '_addForme',
    value: function _addForme(forme, x, y) {
      // On parse le fichier SVG en DOM
      var parser = new DOMParser();
      var formeXml = parser.parseFromString(forme, 'application/xml');
      formeXml = formeXml.getElementsByTagName('g')[0];
      var boule = document.getElementById('boule');
      var formeXmlTab = formeXml.childNodes;
      for (var i = 0; i < formeXmlTab.length; i++) {
        if (formeXmlTab[i].nodeName == 'path') {
          var newNode = boule.parentNode.insertBefore(formeXmlTab[i], boule);
          this.listeForme[this.listeForme.length] = newNode.setAttribute('transform', 'translate(' + x + ' ' + y + ')');
        }
      }
    }

    /* Callback orientationMotion / Mouvement de la boule*/

  }, {
    key: '_toMove',
    value: function _toMove(valueX, valueY) {
      var obj = this.view.$el.querySelector('#boule');
      var newX = void 0;
      var newY = void 0;
      var actu = this.mirrorBouleX + valueX * 0.3;
      if (actu < this.offsetX) {
        actu = this.offsetX;
      } else if (actu > this.tailleEcranX + this.offsetX) {
        actu = this.tailleEcranX + this.offsetX;
      }
      if (this.visualisationBoule) {
        obj.setAttribute('cx', actu);
      }
      this.mirrorBouleX = actu;
      newX = actu;
      actu = this.mirrorBouleY + valueY * 0.3;
      if (actu < this.offsetY) {
        actu = this.offsetY;
      }
      if (actu > this.tailleEcranY + this.offsetY) {
        actu = this.tailleEcranY + this.offsetY;
      }
      if (this.visualisationBoule) {
        obj.setAttribute('cy', actu);
      }
      this.mirrorBouleY = actu;
      newY = actu;
      return [newX, newY];
    }

    // Déplace l'écran dans la map

  }, {
    key: '_moveScreenTo',
    value: function _moveScreenTo(x, y) {
      var force = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;

      var distanceX = x - this.offsetX - this.centreEcranX;
      var negX = false;
      var indicePowX = 3;
      var indicePowY = 3;
      if (distanceX < 0) {
        negX = true;
      }
      distanceX = Math.pow(Math.abs(distanceX / this.centreEcranX), indicePowX) * this.centreEcranX;
      if (negX) {
        distanceX *= -1;
      }
      if (this.offsetX + distanceX * force >= 0 && this.offsetX + distanceX * force <= this.SVG_MAX_X - this.tailleEcranX) {
        this.offsetX += distanceX * force;
      }

      var distanceY = y - this.offsetY - this.centreEcranY;
      var negY = false;
      if (distanceY < 0) {
        negY = true;
      }
      distanceY = Math.pow(Math.abs(distanceY / this.centreEcranY), indicePowY) * this.centreEcranY;
      if (negY) {
        distanceY *= -1;
      }
      if (this.offsetY + distanceY * force >= 0 && this.offsetY + distanceY * force <= this.SVG_MAX_Y - this.tailleEcranY) {
        this.offsetY += distanceY * force;
      }
      window.scroll(this.offsetX, this.offsetY);
    }
  }, {
    key: '_myListener',
    value: function _myListener(time) {
      this.tailleEcranX = window.innerWidth;
      this.tailleEcranY = window.innerHeight;
      setTimeout(this._myListener, time);
    }
  }, {
    key: '_remplaceForme',
    value: function _remplaceForme() {
      var newList = [];
      for (var i = 0; i < this.listeText.length; i++) {
        newList[i] = this.listeText[i];
      }
      for (var _i4 = 0; _i4 < newList.length; _i4++) {
        var nomElement = newList[_i4].innerHTML;
        if (nomElement.slice(0, 1) == '_') {

          var nomForme = nomElement.slice(1, nomElement.length);
          var x = newList[_i4].getAttribute('x');
          var y = newList[_i4].getAttribute('y');
          this.send('demandeForme', nomForme, x, y);
          var parent = newList[_i4].parentNode;
          parent.removeChild(newList[_i4]);
          var elems = document.getElementsByClassName(nomForme);
          for (var _i5 = 0; _i5 < elems.length; _i5++) {
            elems[_i5].style.display = 'none';
          }
        }
      }
    }

    /* ------------------------------------------DETERMINATION DES IN/OUT DES FORMES--------------------------------------------- */

    // Fonction qui permet de connaître l'ensemble des figures où le point se situe

  }, {
    key: '_isIn',
    value: function _isIn(x, y) {
      var tab = [];
      var rotateAngle = void 0;
      var centreRotateX = void 0;
      var centreRotateY = void 0;
      for (var i = 0; i < this.listeEllipse.length; i++) {
        rotateAngle = 0;
        var centreX = this.listeEllipse[i].getAttribute('cx');
        var centreY = this.listeEllipse[i].getAttribute('cy');
        var rayonX = this.listeEllipse[i].getAttribute('rx');
        var rayonY = this.listeEllipse[i].getAttribute('ry');
        var trans = this.listeEllipse[i].getAttribute('transform');
        if (/rotate/.test(trans)) {
          trans = trans.slice(7, trans.length);
          centreRotateX = parseFloat(trans.split(" ")[1]);
          centreRotateY = parseFloat(trans.split(",")[1].replace(")", ""));
          rotateAngle = parseFloat(trans.split(" ")[0]);
        }
        tab[tab.length] = this._isInEllipse(parseFloat(centreX), parseFloat(centreY), parseFloat(rayonX), parseFloat(rayonY), x, y, rotateAngle, centreRotateX, centreRotateY);
      }
      for (var _i6 = 0; _i6 < this.listeRect.length; _i6++) {
        rotateAngle = 0;
        centreRotateX = null;
        centreRotateY = null;
        var hauteur = this.listeRect[_i6].getAttribute('width');
        var largeur = this.listeRect[_i6].getAttribute('height');
        var left = this.listeRect[_i6].getAttribute('x');
        var top = this.listeRect[_i6].getAttribute('y');
        var _trans = this.listeRect[_i6].getAttribute('transform');
        if (/rotate/.test(_trans)) {
          _trans = _trans.slice(7, _trans.length);
          centreRotateX = parseFloat(_trans.split(" ")[1]);
          centreRotateY = parseFloat(_trans.split(",")[1].replace(")", ""));
          rotateAngle = parseFloat(_trans.split(" ")[0]);
        }
        tab[tab.length] = this._isInRect(parseFloat(hauteur), parseFloat(largeur), parseFloat(left), parseFloat(top), x, y, rotateAngle, centreRotateX, centreRotateY);
      }
      return tab;
    }

    // Fonctin qui dit dans quel chemin on se trouve

  }, {
    key: '_isInChemin',
    value: function _isInChemin(x, y) {

      //Variables
      var rotateAngle = void 0;
      var centreRotateX = void 0;
      var centreRotateY = void 0;
      var hauteur = void 0;
      var largeur = void 0;
      var left = void 0;
      var top = void 0;
      var trans = void 0;
      var i = 0;

      //CHEMIN 1
      var chemin1 = false;
      while (!chemin1 && i < this.listeRectChemin1.length) {
        rotateAngle = 0;
        centreRotateX = null;
        centreRotateY = null;
        hauteur = this.listeRectChemin1[i].getAttribute('width');
        largeur = this.listeRectChemin1[i].getAttribute('height');
        left = this.listeRectChemin1[i].getAttribute('x');
        top = this.listeRectChemin1[i].getAttribute('y');
        var _trans2 = this.listeRectChemin1[i].getAttribute('transform');
        if (/rotate/.test(_trans2)) {
          _trans2 = _trans2.slice(7, _trans2.length);
          centreRotateX = parseFloat(_trans2.split(" ")[1]);
          centreRotateY = parseFloat(_trans2.split(",")[1].replace(")", ""));
          rotateAngle = parseFloat(_trans2.split(" ")[0]);
        }
        chemin1 = this._isInRect(parseFloat(hauteur), parseFloat(largeur), parseFloat(left), parseFloat(top), x, y, rotateAngle, centreRotateX, centreRotateY);
        i++;
      }

      //CHEMIN 2
      var chemin2 = false;
      i = 0;
      while (!chemin2 && i < this.listeRectChemin2.length) {
        rotateAngle = 0;
        centreRotateX = null;
        centreRotateY = null;
        hauteur = this.listeRectChemin2[i].getAttribute('width');
        largeur = this.listeRectChemin2[i].getAttribute('height');
        left = this.listeRectChemin2[i].getAttribute('x');
        top = this.listeRectChemin2[i].getAttribute('y');
        trans = this.listeRectChemin2[i].getAttribute('transform');
        if (/rotate/.test(trans)) {
          trans = trans.slice(7, trans.length);
          centreRotateX = parseFloat(trans.split(" ")[1]);
          centreRotateY = parseFloat(trans.split(",")[1].replace(")", ""));
          rotateAngle = parseFloat(trans.split(" ")[0]);
        }
        chemin2 = this._isInRect(parseFloat(hauteur), parseFloat(largeur), parseFloat(left), parseFloat(top), x, y, rotateAngle, centreRotateX, centreRotateY);
        i++;
      }

      //CHEMIN 3
      var chemin3 = false;
      i = 0;
      while (!chemin3 && i < this.listeRectChemin3.length) {
        rotateAngle = 0;
        centreRotateX = null;
        centreRotateY = null;
        hauteur = this.listeRectChemin3[i].getAttribute('width');
        largeur = this.listeRectChemin3[i].getAttribute('height');
        left = this.listeRectChemin3[i].getAttribute('x');
        top = this.listeRectChemin3[i].getAttribute('y');
        trans = this.listeRectChemin3[i].getAttribute('transform');
        if (/rotate/.test(trans)) {
          trans = trans.slice(7, trans.length);
          centreRotateX = parseFloat(trans.split(" ")[1]);
          centreRotateY = parseFloat(trans.split(",")[1].replace(")", ""));
          rotateAngle = parseFloat(trans.split(" ")[0]);
        }
        chemin3 = this._isInRect(parseFloat(hauteur), parseFloat(largeur), parseFloat(left), parseFloat(top), x, y, rotateAngle, centreRotateX, centreRotateY);
        i++;
      }
      return [chemin1, chemin2, chemin3];
    }
  }, {
    key: '_isInForme',
    value: function _isInForme(x, y) {
      //Variables
      var rotateAngle = void 0;
      var centreRotateX = void 0;
      var centreRotateY = void 0;
      var hauteur = void 0;
      var largeur = void 0;
      var left = void 0;
      var top = void 0;
      var trans = void 0;
      var i = 0;

      //FORME 1
      var forme1 = false;
      while (!forme1 && i < this.listeRectForme1.length) {
        rotateAngle = 0;
        centreRotateX = null;
        centreRotateY = null;
        hauteur = this.listeRectForme1[i].getAttribute('width');
        largeur = this.listeRectForme1[i].getAttribute('height');
        left = this.listeRectForme1[i].getAttribute('x');
        top = this.listeRectForme1[i].getAttribute('y');
        var _trans3 = this.listeRectForme1[i].getAttribute('transform');
        if (/rotate/.test(_trans3)) {
          _trans3 = _trans3.slice(7, _trans3.length);
          centreRotateX = parseFloat(_trans3.split(" ")[1]);
          centreRotateY = parseFloat(_trans3.split(",")[1].replace(")", ""));
          rotateAngle = parseFloat(_trans3.split(" ")[0]);
        }
        forme1 = this._isInRect(parseFloat(hauteur), parseFloat(largeur), parseFloat(left), parseFloat(top), x, y, rotateAngle, centreRotateX, centreRotateY);
        i++;
      }

      //FORME 2
      i = 0;
      var forme2 = false;
      while (!forme2 && i < this.listeRectForme2.length) {
        rotateAngle = 0;
        centreRotateX = null;
        centreRotateY = null;
        hauteur = this.listeRectForme2[i].getAttribute('width');
        largeur = this.listeRectForme2[i].getAttribute('height');
        left = this.listeRectForme2[i].getAttribute('x');
        top = this.listeRectForme2[i].getAttribute('y');
        var _trans4 = this.listeRectForme2[i].getAttribute('transform');
        if (/rotate/.test(_trans4)) {
          _trans4 = _trans4.slice(7, _trans4.length);
          centreRotateX = parseFloat(_trans4.split(" ")[1]);
          centreRotateY = parseFloat(_trans4.split(",")[1].replace(")", ""));
          rotateAngle = parseFloat(_trans4.split(" ")[0]);
        }
        forme2 = this._isInRect(parseFloat(hauteur), parseFloat(largeur), parseFloat(left), parseFloat(top), x, y, rotateAngle, centreRotateX, centreRotateY);
        i++;
      }

      //FORME 3
      i = 0;
      var forme3 = false;
      while (!forme2 && i < this.listeRectForme3.length) {
        rotateAngle = 0;
        centreRotateX = null;
        centreRotateY = null;
        hauteur = this.listeRectForme3[i].getAttribute('width');
        largeur = this.listeRectForme3[i].getAttribute('height');
        left = this.listeRectForme3[i].getAttribute('x');
        top = this.listeRectForme3[i].getAttribute('y');
        var _trans5 = this.listeRectForme3[i].getAttribute('transform');
        if (/rotate/.test(_trans5)) {
          _trans5 = _trans5.slice(7, _trans5.length);
          centreRotateX = parseFloat(_trans5.split(" ")[1]);
          centreRotateY = parseFloat(_trans5.split(",")[1].replace(")", ""));
          rotateAngle = parseFloat(_trans5.split(" ")[0]);
        }
        forme3 = this._isInRect(parseFloat(hauteur), parseFloat(largeur), parseFloat(left), parseFloat(top), x, y, rotateAngle, centreRotateX, centreRotateY);
        i++;
      }

      //FORME 4
      i = 0;
      var forme4 = false;
      while (!forme2 && i < this.listeRectForme4.length) {
        rotateAngle = 0;
        centreRotateX = null;
        centreRotateY = null;
        hauteur = this.listeRectForme4[i].getAttribute('width');
        largeur = this.listeRectForme4[i].getAttribute('height');
        left = this.listeRectForme4[i].getAttribute('x');
        top = this.listeRectForme4[i].getAttribute('y');
        var _trans6 = this.listeRectForme4[i].getAttribute('transform');
        if (/rotate/.test(_trans6)) {
          _trans6 = _trans6.slice(7, _trans6.length);
          centreRotateX = parseFloat(_trans6.split(" ")[1]);
          centreRotateY = parseFloat(_trans6.split(",")[1].replace(")", ""));
          rotateAngle = parseFloat(_trans6.split(" ")[0]);
        }
        forme4 = this._isInRect(parseFloat(hauteur), parseFloat(largeur), parseFloat(left), parseFloat(top), x, y, rotateAngle, centreRotateX, centreRotateY);
        i++;
      }
      return [forme1, forme2, forme3, forme4];
    }

    // Fonction qui dit si un point est dans un rect

  }, {
    key: '_isInRect',
    value: function _isInRect(hauteur, largeur, left, top, pointX, pointY, rotateAngle, centreRotateX, centreRotateY) {
      //rotation
      var newPoint = this._rotatePoint(pointX, pointY, centreRotateX, centreRotateY, rotateAngle);
      //Appartenance
      if (newPoint[0] > parseInt(left) && newPoint[0] < parseInt(left) + parseInt(hauteur) && newPoint[1] > top && newPoint[1] < parseInt(top) + parseInt(largeur)) {
        return true;
      } else {
        return false;
      }
    }

    // Fonction qui dit si un point est dans une ellipse

  }, {
    key: '_isInEllipse',
    value: function _isInEllipse(centreX, centreY, rayonX, rayonY, pointX, pointY, rotateAngle, centreRotateX, centreRotateY) {
      //rotation
      var newPoint = this._rotatePoint(pointX, pointY, centreRotateX, centreRotateY, rotateAngle);
      //Appartenance 
      var a = rayonX;; // Grand rayon
      var b = rayonY; // Petit rayon
      //const c = Math.sqrt((a*a)-(b*b)); // Distance Foyer
      var calc = Math.pow(newPoint[0] - centreX, 2) / Math.pow(a, 2) + Math.pow(newPoint[1] - centreY, 2) / Math.pow(b, 2);
      if (calc <= 1) {
        return true;
      } else {
        return false;
      }
    }

    // Fonction permettant de réaxer le point

  }, {
    key: '_rotatePoint',
    value: function _rotatePoint(x, y, centreX, centreY, angle) {
      var newAngle = angle * (3.14159265 / 180); // Passage en radian
      var tab = [];
      var newX = (x - centreX) * Math.cos(newAngle) + (y - centreY) * Math.sin(newAngle);
      var newY = -1 * (x - centreX) * Math.sin(newAngle) + (y - centreY) * Math.cos(newAngle);
      newX += centreX;
      newY += centreY;
      //Affichage du symétrique
      // const obj = this.view.$el.querySelector('#bouleR');
      // obj.setAttribute("cx",newX);
      // obj.setAttribute("cy",newY);
      //Fin de l'affichage du symétrique
      tab[0] = newX;
      tab[1] = newY;
      return tab;
    }

    /* ------------------------------------------Calcul des distances--------------------------------------------- */

    // Donne la distance du point avec les formes présentes

  }, {
    key: '_getDistance',
    value: function _getDistance(xValue, yValue) {
      var tab = [];
      for (var i = 0; i < this.listeEllipse.length; i++) {
        tab[tab.length] = this._getDistanceNode(this.listeEllipse[i], xValue, yValue);
      }
      for (var _i7 = 0; _i7 < this.listeRect.length; _i7++) {
        tab[tab.length] = this._getDistanceNode(this.listeRect[_i7], xValue, yValue);
      }
      return tab;
    }

    // Donne la distance d'un point avec une forme

  }, {
    key: '_getDistanceNode',
    value: function _getDistanceNode(node, x, y) {
      if (node.tagName == "ellipse") {
        var centreX = parseInt(node.getAttribute('cx'));
        var centreY = parseInt(node.getAttribute('cy'));
        return Math.sqrt(Math.pow(centreX - x, 2) + Math.pow(centreY - y, 2));
      } else if (node.tagName == 'rect') {
        var left = parseInt(node.getAttribute('x'));
        var top = parseInt(node.getAttribute('y'));
        var haut = parseInt(node.getAttribute('height'));
        var larg = parseInt(node.getAttribute('width'));
        var _centreX = (left + larg) / 2;
        var _centreY = (top + haut) / 2;
        return Math.sqrt(Math.pow(_centreX - x, 2) + Math.pow(_centreY - y, 2));
      }
    }

    /* ------------------------------------------SON--------------------------------------------- */

    // Créé le moteur sonore

  }, {
    key: '_creationUniversSonore',
    value: function _creationUniversSonore() {
      //Granulateur
      this.grain = new _MyGrain2.default();
      scheduler.add(this.grain);
      this.grain.connect(audioContext.destination);
      var bufferAssocies = [5, 7, 9];
      var markerAssocies = [6, 8, 10];
      //Segmenter
      for (var i = 0; i < this.nbChemin; i++) {
        var idBuffer = bufferAssocies[i];
        var idMarker = markerAssocies[i];
        this.segmenter[i] = new waves.SegmentEngine({
          buffer: this.loader.buffers[idBuffer],
          positionArray: this.loader.buffers[idMarker].time,
          durationArray: this.loader.buffers[idMarker].duration,
          periodAbs: 10,
          periodRel: 10
        });
        this.segmenterGain[i] = audioContext.createGain();
        this.segmenterGainGrain[i] = audioContext.createGain();
        //this.segmenterFB[i] = audioContext.createGain();
        //this.segmenterDelayFB[i] = audioContext.createDelay(0.8);
        this.segmenterGainGrain[i].gain.setValueAtTime(0, audioContext.currentTime);
        this.segmenterGain[i].gain.setValueAtTime(0, audioContext.currentTime);
        //this.segmenterFB[i].gain.setValueAtTime(0.0,audioContext.currentTime);
        this.segmenterGainGrain[i].connect(this.grain.input);
        this.segmenterGain[i].connect(audioContext.destination);
        //this.segmenter[i].connect(this.segmenterFB[i]);
        //this.segmenterFB[i].connect(this.segmenterDelayFB[i]);
        //this.segmenterDelayFB[i].connect(audioContext.destination);
        //this.segmenterDelayFB[i].connect(this.segmenterFB[i]);
        this.segmenter[i].connect(this.segmenterGain[i]);
        this.segmenter[i].connect(this.segmenterGainGrain[i]);
        this._startSegmenter(i);
      }

      // Nappe de fond
      for (var _i8 = 0; _i8 < this.totalElements; _i8++) {

        //Création des gains d'entrée/sorties des nappes
        this.gainsDirections[_i8] = 'down';
        this.gains[_i8] = audioContext.createGain();
        this.gains[_i8].gain.value = 0;
        this.gains[_i8].connect(this.grain.input);

        //Création des sources pour le granulateur
        this.sources[_i8] = audioContext.createBufferSource();
        this.sources[_i8].buffer = this.loader.buffers[_i8 % 5];
        this.sources[_i8].connect(this.gains[_i8]);
        this.sources[_i8].loop = true;
        this.sources[_i8].start();
      }

      this.gainOutputDirect = audioContext.createGain();
      this.gainOutputDirect.gain.value = 0;
      this.gainOutputDirect.connect(audioContext.destination);
      this.gainOutputGrain = audioContext.createGain();
      this.gainOutputGrain.gain.value = 0;
      this.gainOutputGrain.connect(this.grain.input);

      for (var _i9 = 0; _i9 < this.nbForme; _i9++) {
        // Figure

        //création des gains de sons direct
        this.gainsForme[_i9] = audioContext.createGain();
        this.gainsForme[_i9].gain.value = 0;
        this.gainsForme[_i9].connect(this.gainOutputDirect);

        //création des gains de sons granulés
        this.gainsGrainForme[_i9] = audioContext.createGain();
        this.gainsGrainForme[_i9].gain.value = 0;
        this.gainsGrainForme[_i9].connect(this.gainOutputGrain);

        //Forme source sonore
        this.soundForme[_i9] = audioContext.createBufferSource();
        this.soundForme[_i9].buffer = this.loader.buffers[10 + (_i9 + 1)];
        this.soundForme[_i9].connect(this.gainsForme[_i9]);
        this.soundForme[_i9].connect(this.gainsGrainForme[_i9]);
        this.soundForme[_i9].loop = true;
        this.soundForme[_i9].start();
      }
    }
  }, {
    key: '_startSegmenter',
    value: function _startSegmenter(i) {
      var _this5 = this;

      this.segmenter[i].trigger();
      var newPeriod = parseFloat(this.loader.buffers[6 + i * 2]['duration'][this.segmenter[i].segmentIndex]) * 1000;
      // if(newPeriod> 150){
      //   newPeriod -= 30;
      // }else if(newPeriod>400){
      //   newPeriod -= 130;
      // }else if(newPeriod> 800){
      //   newPeriod -= 250;
      // }
      setTimeout(function () {
        _this5._startSegmenter(i);
      }, newPeriod);
    }

    // Fait monter le son quand la boule est dans la forme et baisser si la boule n'y est pas

  }, {
    key: '_updateGain',
    value: function _updateGain(tabIn) {
      for (var i = 0; i < tabIn.length; i++) {
        if (this.gains[i].gain.value == 0 && tabIn[i] && this.gainsDirections[i] == 'down') {
          var actual = this.gains[i].gain.value;
          this.gains[i].gain.cancelScheduledValues(audioContext.currentTime);
          this.gains[i].gain.setValueAtTime(actual, audioContext.currentTime);
          this.gains[i].gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 1);
          this.gainsDirections[i] = 'up';
        } else if (this.gains[i].gain.value != 0 && !tabIn[i] && this.gainsDirections[i] == 'up') {
          var _actual = this.gains[i].gain.value;
          this.gains[i].gain.cancelScheduledValues(audioContext.currentTime);
          this.gains[i].gain.setValueAtTime(_actual, audioContext.currentTime);
          this.gains[i].gain.linearRampToValueAtTime(0, audioContext.currentTime + 1);
          this.gainsDirections[i] = 'down';
        }
      }
    }
  }, {
    key: '_actualiserAudioChemin',
    value: function _actualiserAudioChemin(i) {
      var _this6 = this;

      if (this.tabChemin[i]) {
        var actual1 = this.segmenterGain[i].gain.value;
        var actual2 = this.segmenterGainGrain[i].gain.value;
        //let actual3 = this.segmenterFB[i].gain.value;
        //this.segmenterFB[i].gain.cancelScheduledValues(audioContext.currentTime);
        this.segmenterGain[i].gain.cancelScheduledValues(audioContext.currentTime);
        this.segmenterGainGrain[i].gain.cancelScheduledValues(audioContext.currentTime);
        this.segmenterGain[i].gain.setValueAtTime(actual1, audioContext.currentTime);
        this.segmenterGainGrain[i].gain.setValueAtTime(actual2, audioContext.currentTime);
        //this.segmenterFB[i].gain.setValueAtTime(actual3,audioContext.currentTime);
        this.segmenterGainGrain[i].gain.linearRampToValueAtTime(0, audioContext.currentTime + 1);
        this.segmenterGain[i].gain.linearRampToValueAtTime(0.25, audioContext.currentTime + 0.6);
        //this.segmenterFB[i].gain.linearRampToValueAtTime(0.4, audioContext.currentTime + 3);
      } else {
        var _actual2 = this.segmenterGain[i].gain.value;
        var _actual3 = this.segmenterGainGrain[i].gain.value;
        //let actual3 = this.segmenterFB[i].gain.value;
        //this.segmenterFB[i].gain.cancelScheduledValues(audioContext.currentTime);
        this.segmenterGain[i].gain.cancelScheduledValues(audioContext.currentTime);
        this.segmenterGainGrain[i].gain.cancelScheduledValues(audioContext.currentTime);
        this.segmenterGain[i].gain.setValueAtTime(_actual2, audioContext.currentTime);
        this.segmenterGainGrain[i].gain.setValueAtTime(_actual3, audioContext.currentTime);
        //this.segmenterFB[i].gain.setValueAtTime(actual3,audioContext.currentTime);
        if (this.startSegmentFini[i]) {
          this.segmenterGainGrain[i].gain.linearRampToValueAtTime(_actual2 + 0.15, audioContext.currentTime + 0.1);
          setTimeout(function () {
            _this6.segmenterGainGrain[i].gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.3);
          }, 2000);
          this.segmenterGain[i].gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.4);
          //this.segmenterFB[i].gain.linearRampToValueAtTime(0, audioContext.currentTime + 2.5);
        } else {
          this.startSegmentFini[i] = true;
        }
      }
    }
  }, {
    key: '_actualiserAudioForme',
    value: function _actualiserAudioForme(id) {
      //Forme1
      if (id == 0 && this.tabForme[id]) {
        var gainGrain = 1 - this.rampForme["forme1"] / 600;
        var gainDirect = this.rampForme["forme1"] / 600;
        if (gainDirect < 0) {
          gainDirect = 0;
        } else if (gainDirect > 1) {
          gainDirect = 1;
        }
        if (gainGrain < 0) {
          gainGrain = 0;
        } else if (gainGrain > 1) {
          gainGrain = 1;
        }
        if (this.tabForme[id]) {
          this.gainsForme[id].gain.linearRampToValueAtTime(gainDirect, audioContext.currentTime + 0.01);
          this.gainsGrainForme[id].gain.linearRampToValueAtTime(gainGrain, audioContext.currentTime + 0.01);
        }
      }

      //Forme2
      if (id == 1 && this.tabForme[id]) {
        var _gainGrain = 1 - this.rampForme["forme2"] / 600;
        var _gainDirect = this.rampForme["forme2"] / 600;
        if (_gainDirect < 0) {
          _gainDirect = 0;
        } else if (_gainDirect > 1) {
          _gainDirect = 1;
        }
        if (_gainGrain < 0) {
          _gainGrain = 0;
        } else if (_gainGrain > 1) {
          _gainGrain = 1;
        }
        if (this.tabForme[id]) {
          this.gainsForme[id].gain.linearRampToValueAtTime(_gainDirect, audioContext.currentTime + 0.01);
          this.gainsGrainForme[id].gain.linearRampToValueAtTime(_gainGrain, audioContext.currentTime + 0.01);
        }
      }

      //Forme3
      if (id == 2 && this.tabForme[id]) {
        var _gainGrain2 = 1 - this.rampForme["forme3"] / 600;
        var _gainDirect2 = this.rampForme["forme3"] / 600;
        if (_gainDirect2 < 0) {
          _gainDirect2 = 0;
        } else if (_gainDirect2 > 1) {
          _gainDirect2 = 1;
        }
        if (_gainGrain2 < 0) {
          _gainGrain2 = 0;
        } else if (_gainGrain2 > 1) {
          _gainGrain2 = 1;
        }
        if (this.tabForme[id]) {
          this.gainsForme[id].gain.linearRampToValueAtTime(_gainDirect2, audioContext.currentTime + 0.01);
          this.gainsGrainForme[id].gain.linearRampToValueAtTime(_gainGrain2, audioContext.currentTime + 0.01);
        }
      }

      //Forme4
      if (id == 3 && this.tabForme[id]) {
        var _gainGrain3 = 1 - this.rampForme["forme4"] / 600;
        var _gainDirect3 = this.rampForme["forme4"] / 600;
        if (_gainDirect3 < 0) {
          _gainDirect3 = 0;
        } else if (_gainDirect3 > 1) {
          _gainDirect3 = 1;
        }
        if (_gainGrain3 < 0) {
          _gainGrain3 = 0;
        } else if (_gainGrain3 > 1) {
          _gainGrain3 = 1;
        }
        if (this.tabForme[id]) {
          this.gainsForme[id].gain.linearRampToValueAtTime(_gainDirect3, audioContext.currentTime + 0.01);
          this.gainsGrainForme[id].gain.linearRampToValueAtTime(_gainGrain3, audioContext.currentTime + 0.01);
        }
      }

      if (!this.tabForme[0] && this.tabForme[0] != this.ancienForme[0]) {
        this.gainsForme[0].gain.linearRampToValueAtTime(0, audioContext.currentTime + 1.5);
        this.gainsGrainForme[0].gain.linearRampToValueAtTime(0, audioContext.currentTime + 1.5);
      }
      if (!this.tabForme[1] && this.tabForme[1] != this.ancienForme[1]) {
        this.gainsForme[1].gain.linearRampToValueAtTime(0, audioContext.currentTime + 1.5);
        this.gainsGrainForme[1].gain.linearRampToValueAtTime(0, audioContext.currentTime + 1.5);
      }
      if (!this.tabForme[2] && this.tabForme[2] != this.ancienForme[2]) {
        this.gainsForme[2].gain.linearRampToValueAtTime(0, audioContext.currentTime + 1.5);
        this.gainsGrainForme[2].gain.linearRampToValueAtTime(0, audioContext.currentTime + 1.5);
      }
      if (!this.tabForme[3] && this.tabForme[3] != this.ancienForme[3]) {
        this.gainsForme[3].gain.linearRampToValueAtTime(0, audioContext.currentTime + 1.5);
        this.gainsGrainForme[3].gain.linearRampToValueAtTime(0, audioContext.currentTime + 1.5);
      }

      this.ancienForme = [this.tabForme[0], this.tabForme[1], this.tabForme[2], this.tabForme[3]];
    }

    /* -----------------------------------------XMM----------------------------------------------- */

  }, {
    key: '_setModel',
    value: function _setModel(model, model1, model2) {
      this.decoder.setModel(model);
      this.decoder2.setModel(model1);
      this.decoder3.setModel(model2);
      this.modelOK = true;
    }
  }, {
    key: '_processProba',
    value: function _processProba() {
      var probaMax = this.decoder.getProba();
      var probaMax1 = this.decoder2.getProba();
      var probaMax2 = this.decoder3.getProba();
      var newSegment = [];
      //Chemin
      for (var _i10 = 0; _i10 < this.nbChemin; _i10++) {
        newSegment[_i10] = this._findNewSegment(probaMax1, probaMax2, _i10);
        this._actualiserSegmentIfNotIn(newSegment[_i10], _i10);
        var nom1 = 'prototypeFond-' + _i10 + '-1';
        var nom2 = 'prototypeFond-' + _i10 + '-2';
        if (this.tabChemin[_i10] && (probaMax1[0] == nom1 || probaMax2[0] == nom2)) {
          if (!isNaN(probaMax1[1][_i10]) || !isNaN(probaMax2[1][_i10])) {
            this.lastPosition[_i10] = newSegment[_i10];
            newSegment[_i10] = newSegment[_i10] + (0, _trunc2.default)(Math.random() * this.qtRandom);
            this.segmenter[_i10].segmentIndex = newSegment[_i10];
          }
        } else {
          this.segmenter[_i10].segmentIndex = this.lastPosition[_i10] + (0, _trunc2.default)(Math.random() * this.qtRandom);
        }
        if (this.tabChemin[_i10] != this.oldTabChemin[_i10]) {
          this._actualiserAudioChemin(_i10);
        }
        if (_i10 == 2) {}
        this.oldTabChemin[_i10] = this.tabChemin[_i10];
      }

      //Forme
      var direct = false;
      var i = 0;
      while (!direct && i < this.nbForme) {
        if (this.tabForme[i]) {
          direct = true;
        }
        i++;
      }

      var actual1 = this.gainOutputDirect.gain.value;
      var actual2 = this.gainOutputGrain.gain.value;

      if (direct != this.ancien3) {
        if (direct) {
          this.gainOutputDirect.gain.cancelScheduledValues(audioContext.currentTime);
          this.gainOutputDirect.gain.setValueAtTime(actual1, audioContext.currentTime);
          this.gainOutputDirect.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + 2);
          this.gainOutputGrain.gain.cancelScheduledValues(audioContext.currentTime);
          this.gainOutputGrain.gain.setValueAtTime(actual1, audioContext.currentTime);
          this.gainOutputGrain.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + 2);
        } else {
          this.gainOutputDirect.gain.cancelScheduledValues(audioContext.currentTime);
          this.gainOutputDirect.gain.setValueAtTime(actual1, audioContext.currentTime);
          this.gainOutputDirect.gain.linearRampToValueAtTime(0, audioContext.currentTime + 2);
          this.gainOutputGrain.gain.cancelScheduledValues(audioContext.currentTime);
          this.gainOutputGrain.gain.setValueAtTime(actual1, audioContext.currentTime);
          this.gainOutputGrain.gain.linearRampToValueAtTime(0, audioContext.currentTime + 2);
          this.rampForme['forme1'] = 0;
          this.rampForme['forme2'] = 0;
          this.rampForme['forme3'] = 0;
          this.rampForme['forme4'] = 0;
        }
      }
      this.ancien3 = direct;

      if (direct) {
        for (var _i11 = 0; _i11 < this.nbForme; _i11++) {
          if (probaMax == 'forme1') {
            this.rampForme['forme2']--;
            this.rampForme['forme3']--;
            this.rampForme['forme4']--;
          } else if (probaMax == 'forme2') {
            this.rampForme['forme1']--;
            this.rampForme['forme3']--;
            this.rampForme['forme4']--;
          } else if (probaMax == 'forme3') {
            this.rampForme['forme1']--;
            this.rampForme['forme2']--;
            this.rampForme['forme4']--;
          } else if (probaMax == 'forme4') {
            this.rampForme['forme1']--;
            this.rampForme['forme2']--;
            this.rampForme['forme3']--;
          } else if (probaMax == null) {
            this.rampForme['forme1']--;
            this.rampForme['forme2']--;
            this.rampForme['forme3']--;
            this.rampForme['forme4']--;
          }
        }
        this.rampForme[probaMax]++;
      }
      for (var _i12 = 0; _i12 < this.nbForme; _i12++) {
        this._actualiserAudioForme(_i12);
      }
    }

    // Trouve en fonction de xmm le segment le plus proche de la position de l'utilisateur

  }, {
    key: '_findNewSegment',
    value: function _findNewSegment(probaMax1, probaMax2, id) {
      var newSegment = -1;
      var actuel = null;
      if (this.ancien1[id] - probaMax1[1][id] != 0. && !isNaN(probaMax1[1][id])) {
        newSegment = (0, _trunc2.default)(probaMax1[1][id] * (this.nbSegment[id] - this.qtRandom));
        actuel = "1";
        if (this.count2[id] > this.countMax) {
          this.decoder3.reset();
          this.count2[id] = 0;
        }
        this.count1[id] = 0;
        this.count2[id]++;
      } else if (this.ancien2[id] - probaMax2[1][id] != 0. && !isNaN(probaMax2[1][id])) {
        newSegment = (0, _trunc2.default)((1 - probaMax2[1][id]) * (this.nbSegment[id] - this.qtRandom));
        actuel = "0";
        if (this.count1[id] > this.countMax) {
          this.decoder2.reset();
          this.count1[id] = 0;
        }
        this.count2[id] = 0;
        this.count1[id]++;
      } else {
        newSegment = this.lastSegment[id];
      }
      this.ancien1[id] = probaMax1[1][id];
      this.ancien2[id] = probaMax2[1][id];
      return newSegment;
    }

    // Fais avancer la tête de lecture des segmenter si l'utilisateur n'est pas dans une forme

  }, {
    key: '_actualiserSegmentIfNotIn',
    value: function _actualiserSegmentIfNotIn(newSegment, id) {
      if (!this.tabChemin[id]) {
        if (this.countTimeout[id] > 40) {
          if (newSegment > this.nbSegment[id] - this.qtRandom) {
            this.direction[id] = false;
          } else if (newSegment < 1) {
            this.direction[id] = true;
          }
          this.countTimeout[id] = 0;
          if (this.direction[id]) {
            newSegment++;
          } else {
            newSegment--;
          }
        }
        this.lastSegment[id] = newSegment;
        var segment = newSegment + (0, _trunc2.default)(Math.random() * this.qtRandom);
        this.countTimeout[id]++;
        this.segmenter[id].segmentIndex = segment;
      }
    }
  }]);
  return PlayerExperience;
}(soundworks.Experience);

exports.default = PlayerExperience;

},{"./Decodage.js":1,"./Decodage2.js":2,"./Decodage3.js":3,"./MyGrain2.js":4,"babel-runtime/core-js/math/trunc":17,"babel-runtime/core-js/object/get-prototype-of":24,"babel-runtime/helpers/classCallCheck":32,"babel-runtime/helpers/createClass":33,"babel-runtime/helpers/get":35,"babel-runtime/helpers/inherits":36,"babel-runtime/helpers/possibleConstructorReturn":37,"soundworks/client":336,"waves-audio":373,"xmm-lfo":451}]