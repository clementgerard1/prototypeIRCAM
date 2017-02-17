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
let forme4 = 0;
let maxMemoire = 600;
let seuil = 30;

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
			likelihoodWindow: 4,
      callback: this._update
      }
    );

    //Variables
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
			this.start=true;
		}
	}


	process(x,y){
		let difOk = false;
		// Normalisation des entrées
		let newX = this.lastFrameX-x;
		let newY = this.lastFrameY-y;
		let absX = Math.abs(newX);
		let absY = Math.abs(newY);
		if((absX>this.minPixelX) || (absY>this.minPixelY)){
			difOk = true;
			this.lastFrameX = x;
			this.lastFrameY = y;
		}
		if(difOk){
			this.motionIn.process(audioContext.currentTime,[newX,newY]);
		}
	}

	_update(res){
    likelihoods = res.likelihoods;
    likeliest = res.likeliestIndex;
    label = res.likeliest;
	}

	getProba(){
		if(/forme1/.test(label)){
			forme1 = this._scale(++forme1);
			forme2 = this._scale(--forme2);
			forme3 = this._scale(--forme3);
			forme4 = this._scale(--forme4);
		}
		if(/forme2/.test(label)){
			forme2 = this._scale(++forme2);
			forme1 = this._scale(--forme1);
			forme3 = this._scale(--forme3);
			forme4 = this._scale(--forme4);
		}
		if(/forme3/.test(label)){
			forme3 = this._scale(++forme3);
			forme1 = this._scale(--forme1);
			forme2 = this._scale(--forme2);
			forme4 = this._scale(--forme4);
		} 
		if(/forme3/.test(label)){
			forme3 = this._scale(--forme3);
			forme1 = this._scale(--forme1);
			forme2 = this._scale(--forme2);
			forme4 = this._scale(++forme4);
		} 
		if(forme1>forme2&&forme1>forme3&&forme1>forme4&&forme1>seuil){
			return ["forme1"];
		} else if(forme2>forme3&&forme2>forme1&&forme2>forme4&&forme2>seuil){
			return ["forme2"];
		} else if(forme3>forme2&&forme3>forme1&&forme3>forme4&&forme3>seuil){
			return ["forme3"];
		} else if(forme4>forme2&&forme4>forme1&&forme4>forme3&&forme4>seuil){
			return ["forme4"];
		}else{
			return null;
		}
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