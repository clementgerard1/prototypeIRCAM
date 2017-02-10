import { PhraseRecorderLfo, HhmmDecoderLfo } from 'xmm-lfo';
import * as lfo from 'waves-lfo/client';
import * as soundworks from 'soundworks/client';
const audioContext = soundworks.audioContext;

export default class Enregistrement{
	constructor(nom){

		// Paramètre d'enregistrement
		this.motionIn = new lfo.source.EventIn({
   	   frameType: 'vector',
       frameSize: 2,
       frameRate: 1,
       description: ['x', 'y']
		});
		this.xmmRecorder = new PhraseRecorderLfo();

		this.indice = 12; // indice pour les fois où on veut enregistrer plusieurs gestes pour la même forme (en partant de différents endroit)
		
		this.newNom = nom + '-' + this.indice;
		this.xmmRecorder.setPhraseLabel(this.newNom);
		this.lastFrameX = null;
		this.lastFrameY = null;
		this.motionIn.connect(this.xmmRecorder);
		this.motionIn.start();
	}

	startRecord(){
		this.xmmRecorder.start();
	}

	stopRecord(newThis){
		this.xmmRecorder.stop();
		newThis.send('phrase',{ 'phrase' : this.xmmRecorder.getRecordedPhrase(), 'label' : this.xmmRecorder.getPhraseLabel() });
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
}