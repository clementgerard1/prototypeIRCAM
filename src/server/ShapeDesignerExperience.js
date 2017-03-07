import { Experience } from 'soundworks/server';
import fs from 'fs';
import path from 'path';

// server-side 'player' experience.
export default class ShapesDesignerExperience extends Experience {
  constructor(clientType) {
    super(clientType);
    this.sharedConfig = this.require('shared-config');

    // File actually in training in the experience
    this.shapeFiles = 'shape1.svg';
    this.label = this.shapeFiles.replace('.svg', '');

  }

  // if anything needs to append when the experience starts
  start(client) {

    // SVG init
    this.shapeFilesString = fs.readFileSync( path.join(process.cwd(), 'ressources/img/shapes/' + this.shapeFiles) ).toString();

  }

  // if anything needs to happen when a client enters the performance (*i.e.*
  // starts the experience on the client side), write it in the `enter` method
  enter(client) {
    super.enter(client);

    //send
    this.send(client, 'shape', this.shapeFilesString, this.label);

    //receive
    this.receive( client, 'phrase', (data) => this._savePhrase(data) );
  }

  exit(client) {
    super.exit(client);
    // ...
  }

  /* Save the phrase received in the HD*/
  _savePhrase(data){
    console.log(data);
    let id = 0;
    const _path = path.join(process.cwd(), 'ressources/phrases/shapes/' + data.label + "/");
    if(!fs.existsSync(_path)) fs.mkdirSync(_path);
    const folder = fs.readdirSync(_path)[0];
    if(folder != 'null'){
      id = folder.length; 
    }
    console.log(folder, id)
    fs.writeFileSync(_path + data.label + "-" + id + ".json", JSON.stringify(data.phrase), null, 2, 'utf-8');
  }
}
