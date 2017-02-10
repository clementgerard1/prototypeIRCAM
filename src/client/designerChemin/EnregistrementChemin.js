import { PhraseRecorderLfo, HhmmDecoderLfo } from 'xmm-lfo';
import * as lfo from 'waves-lfo/client';
import * as soundworks from 'soundworks/client';
const audioContext = soundworks.audioContext;

export default class Enregistrement{
	constructor(nom,id,sens){

		// Paramètre d'enregistrement
		this.motionIn = new lfo.source.EventIn({
   	   frameType: 'vector',
       frameSize: 2,
       frameRate: 1,
       description: ['x', 'y']
		});
		this.xmmRecorder = new PhraseRecorderLfo();

		this.indice = id; // indice pour les fois où on veut enregistrer plusieurs gestes pour la même forme (en partant de différents endroit)
		this.sens = sens; // sens dans lequel à été enregistrer le gest (1 = gauche/haut à droite/bas, 2 = inverse )
		this.newNom = nom + '-' + this.indice + '-' + sens;
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
		this.motionIn.process(audioContext.currentTime,[x,y]);	
	}
}