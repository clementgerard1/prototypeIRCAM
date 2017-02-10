import { HhmmDecoderLfo } from 'xmm-lfo';
import * as lfo from 'waves-lfo/client';
import * as soundworks from 'soundworks/client';
const audioContext = soundworks.audioContext;

let likelihoods;
let likeliest;
let label;
let forme1 = 0;
let forme2 = 0;
let forme3 = 0;
let maxMemoire = 600;
let seuil = 300;

export default class Enregistrement{
	constructor(){
		//this._update = this._update.bind(this);

		// Paramètre d'enregistrement
		this.motionIn = new lfo.source.EventIn({
   	   frameType: 'vector',
       frameSize: 2,
       frameRate: 1,
       description: ['x', 'y']
		});
		this.hhmmDecoder = new HhmmDecoderLfo({
			likelihoodWindow: 20,
      callback: this._update
      }
    );

    //Variables
		this.lastFrameX = null;
		this.lastFrameY = null;
		this.start = false;
	}

	setModel(model){
		this.hhmmDecoder.params.set('model', model);
		if(!this.start){
			this.motionIn.connect(this.hhmmDecoder);
			this.motionIn.start();
			this.start=true;
		}
	}


	process(x,y){
		let proc = true;
		let newX;
		let newY;
		if(this.lastFrameX){
			newX = x - this.lastFrameX ;
			this.lastFrameX = x;
			if(Math.abs(newX)>0.3){
			}
		}else{
			this.lastFrameX = x;
			proc = false;
		}
		if(this.lastFrameY){
			newY = y - this.lastFrameY ;
			this.lastFrameY = y;
		}else{
			this.lastFrameY = y;
			proc= false;
		}
		if(proc){
			this.motionIn.process(audioContext.currentTime,[newX,newY]);
		}	
	}

	_update(res){
    likelihoods = res.likelihoods;
    likeliest = res.likeliestIndex;
    label = res.likeliest;
	}

	getProba(){
		// if(/forme1/.test(label)){
		// 	forme1 = this._scale(++forme1);
		// 	forme2 = this._scale(--forme2);
		// 	forme3 = this._scale(--forme3);
		// }
		// if(/forme2/.test(label)){
		// 	forme2 = this._scale(++forme2);
		// 	forme1 = this._scale(--forme1);
		// 	forme3 = this._scale(--forme3);
		// }
		// if(/forme3/.test(label)){
		// 	forme3 = this._scale(++forme3);
		// 	forme1 = this._scale(--forme1);
		// 	forme2 = this._scale(--forme2);
		// } 
		// if(forme1>forme2&&forme1>forme3&&forme1>seuil){
		// 	return ["forme1"];
		// } else if(forme2>forme3&&forme2>forme1&&forme2>seuil){
		// 	return ["forme2"];
		// } else if(forme3>forme2&&forme3>forme1&&forme3>seuil){
		// 	return ["forme3"];
		// }else{
		// 	return null;
		// }
		return label;
	}

	reset(){
		this.hhmmDecoder.reset();
	}

	_scale(number){
		if(number<0){
			return 0;
		}else if(number>maxMemoire){
			return maxMemoire;
		}else{
			return number;
		}
	}
}