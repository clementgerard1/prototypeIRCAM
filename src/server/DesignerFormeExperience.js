import { Experience } from 'soundworks/server';
import fs from 'fs';
import path from 'path';

// server-side 'player' experience.
export default class DesignerFormeExperience extends Experience {
  constructor(clientType) {
    super(clientType);
    this.sharedConfig = this.require('shared-config');
    this.fichierForme = 'forme2.svg';
    this.label = this.fichierForme.replace('.svg','');
  }

  // if anything needs to append when the experience starts
  start(client) {
   // SVG initialisation
    this.forme = [];
    this.fichierFormeString = fs.readFileSync(path.join(process.cwd(), 'ressources/img/formes/'+this.fichierForme)).toString();
  }

  // if anything needs to happen when a client enters the performance (*i.e.*
  // starts the experience on the client side), write it in the `enter` method
  enter(client) {
    super.enter(client);
    //send
    this.send(client,'fond',this.fichierFormeString,this.label);
    //receive
    this.receive(client, 'phrase', (data) => {this._savePhrase(data)});
  }

  exit(client) {
    super.exit(client);
    // ...
  }

  _savePhrase(data){
    let indice = 0;
    const pathh = path.join(process.cwd(), 'ressources/phrases/forme/'+data.label+"/");
    if(!fs.existsSync(pathh)){
      fs.mkdirSync(pathh);
    }
    const dossier = fs.readdirSync(pathh);
    if(dossier[0]!='null'){
      indice = dossier.length; 
    }
    fs.writeFileSync(pathh+data.label+"-"+indice+".json",JSON.stringify(data.phrase), null, 2, 'utf-8');
  }
}
