import { HhmmDecoderLfo } from 'xmm-lfo';
import * as lfo from 'waves-lfo/client';
import * as soundworks from 'soundworks/client';
const audioContext = soundworks.audioContext;

let likelihoodsG;
let likeliest;
let label;
let timeProgressions;
let forme1 = 0;
let forme2 = 0;
let forme3 = 0;
let maxMemoire = 600;
let seuil = 300;

export default class Enregistrement{
	constructor(){

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
		this.motionIn.process(audioContext.currentTime,[x,y]);
	}

	_update(res){
    likelihoodsG = res.likelihoods;
    likeliest = res.likeliestIndex;
    label = res.likeliest;
    timeProgressions = res.timeProgressions;
	}

	getProba(){
		return [label,timeProgressions];
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