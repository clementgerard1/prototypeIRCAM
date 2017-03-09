import * as waves from 'waves-audio';
import * as soundworks from 'soundworks/client';

const audioContext = soundworks.audioContext;

export default class MyGrain extends waves.AudioTimeEngine {
	
	constructor() {
		super();

		this.input = audioContext.createGain();
		this.input.gain.value = 1;

		this.output = audioContext.createGain();
		this.output.gain.value = 1;

		this.grainPhase = [0, 0.25, 0.125, 0.375, 0.075, 0.325, 0.2, 0.4, 0.5, 0.75, 0.625, 0.875, 0.575, 0.825, 0.7, 0.9];
		this.gain = [];
		this.delay = [];

    	this.grainPeriod = 25;
    	this.period = 0.1; 
		this.randomPosition = 1500;
		this.grainSchedulerPhase = [];

    	for(let i = 0; i < this.grainPhase.length; i++){
    		this.grainSchedulerPhase[i] = Math.trunc(this.grainPhase[i] * this.grainPeriod);
    	}
    	
		for(let i = 0; i < 16; i++) { 
			this.gain.push(audioContext.createGain());
			this.delay.push(audioContext.createDelay(20));
			this.input.connect(this.delay[i]);
			this.delay[i].connect(this.gain[i]);
			this.delay[i].delayTime.value = (Math.random() * this.randomPosition) / 1000.;
			this.gain[i].connect(this.output);
		}

	}

	//-------------------------------------------------

	/* @public */
	connect(output) {
		this.output.connect(output);
	}

	/* @public */
	disconnect(output = null) {
		this.output.disconnect(output);
	}

	/* @public */
	reset() {
		this.grain = [0, 0.25, 0.125, 0.375, 0.075, 0.325, 0.2, 0.4, 0.5, 0.75, 0.625, 0.375, 0.575, 0.825, 0.7, 0.9];
		this.grainSchedulerPhase = [];
    	for(let i = 0; i < this.grainPhase.length; i++){
    		this.grainSchedulerPhase[i] = Math.trunc(this.grainPhase[i] * this.grainPeriod);
    	}
	}

	/* @public */
	advanceTime(time){
		this._updatePhase();
		this._assignGain();
		return time + this.period;
	}

	//-------------------------------------------------


	/** @private */
	_updatePhase() {
		for(let i = 0; i < 16; i++){
			this.grainSchedulerPhase[i] = (this.grainSchedulerPhase[i] + 1) % this.grainPeriod ;
		}
	}

	/* @private */
	_assignGain() {
		for(let i = 0; i < 16; i++){
			let toTri;
			const semiGrainPeriod = this.grainPeriod / 2;
			if(this.grainSchedulerPhase[i]<semiGrainPeriod){
				toTri = this.grainSchedulerPhase[i] / semiGrainPeriod ; // return [0,1]
			}else{
				toTri = (semiGrainPeriod - (this.grainSchedulerPhase[i] - semiGrainPeriod)) / semiGrainPeriod; // return [0,1]
			}
			toTri *= 0.2;
			this.gain[i].gain.linearRampToValueAtTime(toTri, audioContext.currentTime + 0.001);
			if(toTri == 0){
				this._assignPosition(i);
			}
		}
	}

	/* @private */
	_assignPosition(id) {
		this.delay[id].delayTime.setValueAtTime(Math.random() * this.randomPosition / 1000, audioContext.currentTime + 0.0015);
	}

}