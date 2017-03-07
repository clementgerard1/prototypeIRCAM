import { PhraseRecorderLfo } from 'xmm-lfo';
import * as lfo from 'waves-lfo/client';
import * as soundworks from 'soundworks/client';

const audioContext = soundworks.audioContext;

export default class Enregistrement{

	constructor(name){

		// Record params
		this.motionIn = new lfo.source.EventIn({
   	    	frameType: 'vector',
        	frameSize: 2,
        	frameRate: 1,
        	description: ['x', 'y']
		});
		this.xmmRecorder = new PhraseRecorderLfo();

		this.id = 1; // id when there are several records of a same shape
		
		this.newName = name + '-' + this.id;

		this.xmmRecorder.setPhraseLabel(this.newName);

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
		newThis.send('phrase', { 
			'phrase' : this.xmmRecorder.getRecordedPhrase(), 
			'label' : this.xmmRecorder.getPhraseLabel() 
		});
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
}