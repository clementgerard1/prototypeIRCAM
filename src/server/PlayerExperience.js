import { Experience } from 'soundworks/server';
import xmm from 'xmm-node';
import fs from 'fs';
import path from 'path';


// server-side 'player' experience.
export default class PlayerExperience extends Experience {
  constructor(clientType) {

    super(clientType);

    this.sharedConfig = this.require('shared-config');
    this.backgroundName = 'background.svg';
  }

  // if anything needs to append when the experience starts
  start() {

    /*---------------- XMM - initialisation --------------*/
    this.xmm = new xmm('hhmm', {
      states: 10,
      relativeRegularization: 0.00000001,
      transitionMode: 'leftright',
    });

    const folderPhrases = fs.readdirSync( path.join(process.cwd(), 'ressources/phrases/shapes/') );
    for(let i = 0 ; i < folderPhrases.length; i++){
      try{
        const phrases = fs.readdirSync( path.join(process.cwd(), 'ressources/phrases/shapes/' + folderPhrases[i] + '/') );
        for(let j = 0 ; j < phrases.length ; j++){
          try{
            let phrase = JSON.parse( fs.readFileSync( path.join(process.cwd(), 'ressources/phrases/shapes/' + folderPhrases[i] + '/' + phrases[j]) ) );
            this.xmm.addPhrase(phrase);
          }catch(e){}
        }
      }catch(e){}
    }

    this.xmm.train((e,model)=>{
      if(!e){
        this.model = model;
      }
    });

    /*---------------------- SVG init ---------------------------*/

    this.background = fs.readFileSync( path.join(process.cwd(), 'ressources/img/background/' + this.backgroundName) ).toString();

  }

  // if anything needs to happen when a client enters the performance (*i.e.*
  // starts the experience on the client side), write it in the `enter` method
  enter(client) {
    super.enter(client);
    this.send(client, 'background', this.background);
    this.send(client, 'model', this.model);
    this.receive( client, 'askShape', (shape, x, y) => this._askShape(shape, x, y, client) );
  }

  exit(client) {
    super.exit(client);
  }

  /* Send the image of the shape asked */
  _askShape(shape, x, y, client){
    const files = fs.readFileSync( path.join(process.cwd(), 'ressources/img/shapes/' + shape + '.svg') ).toString();
    this.send(client, 'shapeAnswer', files, x, y);
  }
}
