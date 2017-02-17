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

		this.indice = 14; // indice pour les fois où on veut enregistrer plusieurs gestes pour la même forme (en partant de différents endroit)
		
		this.newNom = nom + '-' + this.indice;
		this.xmmRecorder.setPhraseLabel(this.newNom);
		this.lastFrameX = 0;
		this.lastFrameY = 0;
		this.minPixelX = 3;
		this.minPixelY = 3;
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
}