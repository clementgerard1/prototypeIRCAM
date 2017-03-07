import { HhmmDecoderLfo } from 'xmm-lfo';
import * as lfo from 'waves-lfo/client';
import * as soundworks from 'soundworks/client';
const audioContext = soundworks.audioContext;

let likelihoods;
let likeliest;
let threshold;
let shape1 = 0;
let shape2 = 0;
let shape3 = 0;
let shape4 = 0;
let maxMemoire = 600;
let seuil = 30;

export default class Enregistrement{

	constructor(){
		this.motionIn = new lfo.source.EventIn({
   	   	frameType: 'vector',
       	frameSize: 2,
       	frameRate: 1,
       	description: ['x', 'y']
		});
		this.hhmmDecoder = new HhmmDecoderLfo({
			likelihoodWindow: 4,
      		callback: this._update
      	});

		this.lastFrameX = 0.5;
		this.lastFrameY = 0.5;
		this.minPixelX = 3;
		this.minPixelY = 3;
		this.start = false;

	}

	setModel(model){
		this.hhmmDecoder.params.set('model', model);
		if(!this.start){
			this.motionIn.connect(this.hhmmDecoder);
			this.motionIn.start();
			this.start = true;
		}
	}


	process(x, y){
		let difOk = false;
		let newX = this.lastFrameX - x;
		let newY = this.lastFrameY - y;
		let absX = Math.abs(newX);
		let absY = Math.abs(newY);
		if( (absX > this.minPixelX) || (absY > this.minPixelY) ){
			difOk = true;
			this.lastFrameX = x;
			this.lastFrameY = y;
		}
		if(difOk){
			this.motionIn.process(audioContext.currentTime, [newX, newY]);
		}
	}

	_update(res){
    	likelihoods = res.likelihoods;
    	likeliest = res.likeliestIndex;
    	threshold = res.likeliest;
	}

	getProba(){
		if(/shape1/.test(threshold)){
			shape1 = this._scale( ++shape1 );
			shape2 = this._scale( --shape2 );
			shape3 = this._scale( --shape3 );
			shape4 = this._scale( --shape4 );
		}
		if(/shape2/.test(threshold)){
			shape2 = this._scale( ++shape2 );
			shape1 = this._scale( --shape1 );
			shape3 = this._scale( --shape3 );
			shape4 = this._scale( --shape4 );
		}
		if(/shape3/.test(threshold)){
			shape3 = this._scale( ++shape3 );
			shape1 = this._scale( --shape1 );
			shape2 = this._scale( --shape2 );
			shape4 = this._scale( --shape4 );
		} 
		if(/shape3/.test(threshold)){
			shape3 = this._scale( --shape3 );
			shape1 = this._scale( --shape1 );
			shape2 = this._scale( --shape2 );
			shape4 = this._scale( ++shape4 );
		} 
		if(shape1 > shape2 && shape1 > shape3 && shape1 > shape4 && shape1 > seuil){
			return ["shape1"];
		} else if(shape2 > shape3 && shape2 > shape1 && shape2 > shape4 && shape2 > seuil){
			return ["shape2"];
		} else if(shape3 > shape2 && shape3 > shape1 && shape3 > shape4 && shape3 > seuil){
			return ["shape3"];
		} else if(shape4 > shape2 && shape4 > shape1 && shape4 > shape3 && shape4 > seuil){
			return ["shape4"];
		}else{
			return null;
		}
	}

	reset(){
		this.hhmmDecoder.reset();
	}

	_scale(number){
		if(number < 0){
			return 0;
		}else if(number > maxMemoire){
			return maxMemoire;
		}else{
			return number;
		}
	}
}