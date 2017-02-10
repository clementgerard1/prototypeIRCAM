import * as waves from 'waves-audio';
import * as soundworks from 'soundworks/client';

const audioContext = soundworks.audioContext;

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

export default class MyGrain extends waves.AudioTimeEngine {
	constructor() {
		super();

		this.input = audioContext.createGain();
		this.input.gain.value = 1;

		this.output = audioContext.createGain();
		this.output.gain.value = 1;

		this.feedback = audioContext.createGain();
		this.feedback.gain.value = 0.5;
		this.output.connect(this.feedback);
		this.feedback.connect(this.input);

		this.grain = [0, 0.25, 0.125, 0.375, 0.075, 0.325, 0.2, 0.4, 0.5, 0.75, 0.625, 0.875, 0.575, 0.825, 0.7, 0.9];
		this.gain = [];
		this.delay = [];

		// Initialisation des paramètres
    this.period = 50; //ms
    this.finesse = 10;
		this.randomPosition = 2300; //ms
		this.rampGainCompensation= 5; //ms

		for(let i = 0; i < 16; i++) { 
			this.gain.push(audioContext.createGain());
			this.delay.push(audioContext.createDelay(20));
			this.input.connect(this.delay[i]);
			this.delay[i].connect(this.gain[i]);
			this.delay[i].delayTime.value = Math.random()*this.randomPosition/1000.;
			this.gain[i].connect(this.output);
		}

	}

	/* INTERFACE */

	/* Public */
	connect(output) {
		this.output.connect(output);
	}

	/* Public */
	disconnect(output = null) {
		this.output.disconnect(output);
	}

	/* Public */
	reset() {
		this.grain = [0, 0.25, 0.125, 0.375, 0.075, 0.325, 0.2, 0.4, 0.5, 0.75, 0.625, 0.375, 0.575, 0.825, 0.7, 0.9];
	}

	/* Public */
	advanceTime(time){
		this._updatePhase();
		this._assignGain();
		return time + (this.finesse / (this.period * 2));
	}

	//-------------------------------------------------


	/** @private */
	_updatePhase() {
		for(let i=0;i<16;i++){
			this.grain[i] = this._norm(this.grain[i]);
		}
	}

	/* Private */
	_norm(phase) {
		let phaseR;
		phaseR = (phase+(this.period/this.finesse)/1000)%1;
		return phaseR;
	}

	/* Private */
	_assignGain() {
		for(let i=0;i<16;i++){
			//console.log(this.grain[i]);
			if((Math.abs(this.grain[i]-0.5)*2*0.2)>0.1){
				this.gain[i].gain.value = Math.abs(this.grain[i]-0.5)*2*0.2;
			}else{
				this.gain[i].gain.value = 0;
				this._assignPosition(i);
			}
		}
	}

	/* Private */
	_assignPosition(id) {
		//console.log("update");
		this.delay[id].delayTime.setValueAtTime(Math.random()*this.randomPosition/1000., (audioContext.currentTime+this.rampGainCompensation/1000.));
	}
}