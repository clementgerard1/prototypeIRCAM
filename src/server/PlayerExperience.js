import { Experience } from 'soundworks/server';
import xmm from 'xmm-node';
import fs from 'fs';
import path from 'path';


// server-side 'player' experience.
export default class PlayerExperience extends Experience {
  constructor(clientType) {
    super(clientType);
    this.sharedConfig = this.require('shared-config');
    this.nomFichierFond = 'fond.svg';
  }

  // if anything needs to append when the experience starts
  start() {
    /*---------------- XMM - initialisation --------------*/
    //Forme local
    this.xmm= new xmm('hhmm', {
      states: 20,
      relativeRegularization: 0.01,
      transitionMode: 'leftright'
    });
     const dossierPhrases = fs.readdirSync(path.join(process.cwd(), 'ressources/phrases/forme/'));
    for(let i = 0 ; i<dossierPhrases.length; i++){
      try{
        const phrases = fs.readdirSync(path.join(process.cwd(),'ressources/phrases/forme/'+dossierPhrases[i]+'/'));
        for(let j = 0 ; j<phrases.length;j++){
          try{
            let phrase = JSON.parse(fs.readFileSync(path.join(process.cwd(),'ressources/phrases/forme/'+dossierPhrases[i]+'/'+phrases[j])));
            this.xmm.addPhrase(phrase);
          }catch(e){}
        }
      }catch(e){}
    }
    this.xmm.train((e,model)=>{
      this.model=model;
    });

    // path sens1
    const dossierPhrasesPath1 = fs.readdirSync(path.join(process.cwd(), 'ressources/phrases/chemin/sens1/'));
    this.xmmPath1 = new xmm('hhmm', {
      states: 50,
      relativeRegularization: 0.01,
      transitionMode: 'ergodic'
    });
    for(let i = 0 ; i<dossierPhrasesPath1.length; i++){
      try{
        const phrases = fs.readdirSync(path.join(process.cwd(),'ressources/phrases/chemin/sens1/'+dossierPhrasesPath1[i]+'/'));
        for(let j = 0 ; j<phrases.length;j++){
          try{
            let phrase = JSON.parse(fs.readFileSync(path.join(process.cwd(),'ressources/phrases/chemin/sens1/'+dossierPhrasesPath1[i]+'/'+phrases[j])));
            this.xmmPath1.addPhrase(phrase);
          }catch(e){}
        }
      }catch(e){}
    }
    this.xmmPath1.train((e,modelPath1)=>{
      this.modelPath1=modelPath1;
    });

    // path sens2
    const dossierPhrasesPath2 = fs.readdirSync(path.join(process.cwd(), 'ressources/phrases/chemin/sens2'));
    this.xmmPath2 = new xmm('hhmm', {
      states: 50,
      relativeRegularization: 0.01,
      transitionMode: 'ergodic'
    });
    for(let i = 0 ; i<dossierPhrasesPath2.length; i++){
      try{
        const phrases = fs.readdirSync(path.join(process.cwd(),'ressources/phrases/chemin/sens2/'+dossierPhrasesPath2[i]+'/'));
        for(let j = 0 ; j<phrases.length;j++){
          try{
            let phrase = JSON.parse(fs.readFileSync(path.join(process.cwd(),'ressources/phrases/chemin/sens2/'+dossierPhrasesPath2[i]+'/'+phrases[j])));
            this.xmmPath2.addPhrase(phrase);
          }catch(e){}
        }
      }catch(e){}
    }
    this.xmmPath2.train((e,modelPath2)=>{
      this.modelPath2=modelPath2;
    });

    // SVG initialisation
    this.fichierFond = fs.readFileSync(path.join(process.cwd(), 'ressources/img/imgFond/'+this.nomFichierFond)).toString();
  }

  // if anything needs to happen when a client enters the performance (*i.e.*
  // starts the experience on the client side), write it in the `enter` method
  enter(client) {
    super.enter(client);
    this.send(client,'fond',this.fichierFond);
    this.send(client,'model',this.model,this.modelPath1, this.modelPath2);
    this.receive(client,'demandeForme',(forme,x,y)=>this._demandeForme(forme,x,y,client));
  }

  exit(client) {
    super.exit(client);
  }

  _demandeForme(forme,x,y,client){
    const fichier = fs.readFileSync(path.join(process.cwd(), 'ressources/img/formes/'+forme+'.svg')).toString();
    this.send(client,'reponseForme',fichier,x,y);
  }
}
