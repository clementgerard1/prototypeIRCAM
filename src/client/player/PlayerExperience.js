import * as soundworks from 'soundworks/client';
import MyGrain from './MyGrain.js';
import * as waves from 'waves-audio';
import {HhmmDecoderLfo} from 'xmm-lfo'
import Decodage from './Decodage.js';
import Decodage2 from './Decodage2.js';
import Decodage3 from "./Decodage3.js";

const audioContext = soundworks.audioContext;
const scheduler = waves.getScheduler();

class PlayerView extends soundworks.View{
  constructor(template, content, events, options) {
    super(template, content, events, options);
  }
}

const view= ``;

// this experience plays a sound when it starts, and plays another sound when
// other clients join the experience
export default class PlayerExperience extends soundworks.Experience {
  constructor(assetsDomain) {
    super();
    //Services
    this.platform = this.require('platform', { features: ['web-audio', 'wake-lock'] });
    this.motionInput = this.require('motion-input', { descriptors: ['orientation'] });
    this.loader = this.require('loader', { 
      files: ['sounds/nappe/gadoue.mp3', //0
              'sounds/nappe/gadoue.mp3', //1
              "sounds/nappe/nage.mp3",  // ...
              "sounds/nappe/tempete.mp3",
              "sounds/nappe/vent.mp3",
              "sounds/camus.mp3", // 5  
              "markers/markers.json", 
              "sounds/obama.mp3",    
              "markers/markers.json",
              "sounds/last.mp3",   
              "markers/markers.json"] //10  
    });
    this.startOK = false;
    this.startSegmentFini = [];
    this.modelOK = false;

    // PARAMETRE
    this.nbChemin = 3;
    this.nbSegment = [59,59,59];

    //
    this.ancien1 = [];
    this.ancien2 = [];
    this.countTimeout = [];
    this.direction = [];
    this.oldTabChemin = [];
    this.count1 = [];
    this.count2 = [];
    this.segmenter = [];
    this.segmenterGain = [];
    this.segmenterGainGrain = [];
    this.sources = [];
    this.gains = [];
    this.gainsDirections = [];
    this.grain;
    this.countMax = 20;

    for(let i =0; i<this.nbChemin;i++){
      this.count1[i] = 20;
      this.count2[i] = 20;
      this.ancien1[i] = 0;
      this.ancien2[i] = 0;
      this.countTimeout[i] = 0;
      this.direction[i] = true;
      this.oldTabChemin[i] = true;
      this.startSegmentFini[i] = false;
    } 
  }

  init() {
    // initialize the view
    this.viewTemplate = view;
    this.viewContent = {};
    this.viewCtor = PlayerView;
    this.viewOptions = { preservePixelRatio: true };
    this.view = this.createView();

    //bind
    this._toMove = this._toMove.bind(this);
    this._isInEllipse = this._isInEllipse.bind(this);
    this._isInRect = this._isInRect.bind(this);
    this._isIn = this._isIn.bind(this);
    this._isInChemin = this._isInChemin.bind(this);
    this._getDistanceNode = this._getDistanceNode.bind(this);
    this._creationUniversSonore=this._creationUniversSonore.bind(this);
    this._updateGain = this._updateGain.bind(this);
    this._rotatePoint = this._rotatePoint.bind(this);
    this._myListener= this._myListener.bind(this);
    this._addBoule = this._addBoule.bind(this);
    this._addFond = this._addFond.bind(this);
    this._setModel = this._setModel.bind(this);
    this._processProba = this._processProba.bind(this);
    this._remplaceForme = this._remplaceForme.bind(this);
    this._addForme = this._addForme.bind(this);
    this._startSegmenter = this._startSegmenter.bind(this);
    this._findNewSegment = this._findNewSegment.bind(this);
    this._actualiserSegmentIfNotIn = this._actualiserSegmentIfNotIn.bind(this);
    this._actualiserAudioChemin = this._actualiserAudioChemin.bind(this);
    this.receive('fond',(data)=>this._addFond(data));
    this.receive('model',(model,model1,model2)=>this._setModel(model,model1,model2));
    this.receive('reponseForme',(forme,x,y)=>this._addForme(forme,x,y));
 }

  start() {
    if(!this.startOK){
      super.start(); // don't forget this
      if (!this.hasStarted)
        this.init();
      this.show();
      //XMM
      this.decoder = new Decodage();
      this.decoder2 = new Decodage2();
      this.decoder3 = new Decodage3();
    }else{
      //Paramètre initiaux
      this._addBoule(200,200);
      document.body.style.overflow = "hidden";  
      this.centreX = window.innerWidth/2;
      this.tailleEcranX = window.innerWidth;
      this.tailleEcranY = window.innerHeight;
      this.centreEcranX = this.tailleEcranX/2;
      this.centreEcranY = this.tailleEcranY/2;
      setTimeout(() => {this._myListener(100)},100);
      this.centreY = window.innerHeight/2;

      //Detecte les elements SVG
      this.listeEllipse = document.getElementsByTagName('ellipse');
      this.listeRect = document.getElementsByTagName('rect');
      this.totalElements = this.listeEllipse.length + this.listeRect.length;
      this.listeText = document.getElementsByTagName('text');
      this.listeForme = [];
      this.listeRectChemin1 = document.getElementsByClassName('chemin1');
      this.listeRectChemin2 = document.getElementsByClassName('chemin0');
      this.listeRectChemin3 = document.getElementsByClassName('chemin2');

      //Remplace les _textes par leur forme.
      this._remplaceForme(); 

      //Crée l'univers sonore
      this._creationUniversSonore();

      //Initisalisation
      this.maxCountUpdate = 4;
      this.countUpdate = this.maxCountUpdate + 1; // Initialisation
      this.visualisationBoule=true; // Visualisation de la boule
      if(!this.visualisationBoule){
        this.view.$el.querySelector('#boule').style.display='none';
      }
      this.visualisationForme=false; // Visualisation des formes SVG
      if(!this.visualisationForme){
        for(let i = 0;i<this.listeEllipse.length;i++){
          this.listeEllipse[i].style.display='none';
        }
        for(let i = 0;i<this.listeRect.length;i++){
          this.listeRect[i].style.display='none';
        }
      }

      //Pour enelever les bordures :
      if(this.visualisationForme){
        for(let i = 0;i<this.listeEllipse.length;i++){
          this.listeEllipse[i].setAttribute('stroke-width',0);
        }
        for(let i = 0;i<this.listeRect.length;i++){
          this.listeRect[i].setAttribute('stroke-width',0);
        }
      }   

      //Variables 
      this.mirrorBouleX = 250;
      this.mirrorBouleY = 250;
      this.offsetX = 0; // Initisalisation du offset
      this.offsetY = 0
      this.SVG_MAX_X = document.getElementsByTagName('svg')[0].getAttribute('width');
      this.SVG_MAX_Y = document.getElementsByTagName('svg')[0].getAttribute('height');

      // Gestion de l'orientation
      this.tabIn;
      if (this.motionInput.isAvailable('orientation')) {
        this.motionInput.addListener('orientation', (data) => {
          const newValues = this._toMove(data[2],data[1]-25);
          this.tabIn = this._isIn(newValues[0],newValues[1]);
          this.tabChemin = this._isInChemin(newValues[0],newValues[1]);
          if(this.countUpdate>this.maxCountUpdate){
            this._updateGain(this.tabIn);
            this.countUpdate = 0;
          }else{
            this.countUpdate++;
          }
          this._moveScreenTo(newValues[0],newValues[1],0.08);
          // XMM
          if(this.modelOK){
            this.decoder.process(newValues[0],newValues[1]);
            this.decoder2.process(newValues[0],newValues[1]);
            this.decoder3.process(newValues[0],newValues[1]);
            this._processProba();
          }
        });
      } else {
        console.log("Orientation non disponible");
      }
    }
  }

/* ------------------------------------------MOUVEMENT DE L ECRAN / IMAGES--------------------------------------------- */

  /* Ajoute la boule au fond */
  _addBoule(x,y){
    const elem = document.createElementNS('http://www.w3.org/2000/svg','circle');
    elem.setAttributeNS(null,"cx",x);
    elem.setAttributeNS(null,"cy",y);
    elem.setAttributeNS(null,"r",10);
    elem.setAttributeNS(null,"stroke",'white');
    elem.setAttributeNS(null,"stroke-width",3);
    elem.setAttributeNS(null,"fill",'black');
    elem.setAttributeNS(null,"id",'boule');
    document.getElementsByTagName('svg')[0].appendChild(elem);
  }

  /* Ajoute le fond */
  _addFond(fond){
    // On parse le fichier SVG en DOM
    const parser = new DOMParser();
    let fondXml = parser.parseFromString(fond,'application/xml');
    fondXml = fondXml.getElementsByTagName('svg')[0];
    document.getElementById('experience').appendChild(fondXml);
    document.getElementsByTagName('svg')[0].setAttribute('id','svgElement')
    this._supprimerRectChemin();
    this.startOK = true;
    this.start();
  }

  /* Supprime les rectangles qui suivent les chemins */
  _supprimerRectChemin(){
    let tab = document.getElementsByClassName('chemin1');
    for(let i =0 ;i<tab.length;i++){
      tab[i].style.display = 'none';
    }

    tab = document.getElementsByClassName('chemin2');
    for(let i =0 ;i<tab.length;i++){
      tab[i].style.display = 'none';
    }

    tab = document.getElementsByClassName('chemin3');
    for(let i =0 ;i<tab.length;i++){
      tab[i].style.display = 'none';
    }
  }

  _addForme(forme,x,y){
    // On parse le fichier SVG en DOM
    const parser = new DOMParser();
    let formeXml = parser.parseFromString(forme,'application/xml');
    formeXml = formeXml.getElementsByTagName('g')[0];
    let boule = document.getElementById('boule');
    const formeXmlTab = formeXml.childNodes;
    for(let i = 0; i<formeXmlTab.length;i++){
      if(formeXmlTab[i].nodeName == 'path'){
        const newNode = boule.parentNode.insertBefore(formeXmlTab[i],boule);
        this.listeForme[this.listeForme.length] = newNode.setAttribute('transform','translate('+x+' '+y+')');
      }
    }
  }

  /* Callback orientationMotion / Mouvement de la boule*/
  _toMove(valueX,valueY){
    const obj = this.view.$el.querySelector('#boule');
    let newX;
    let newY;
    let actu = this.mirrorBouleX+valueX*0.3;
    if(actu<this.offsetX){
      actu= this.offsetX ;
    }else if(actu >(this.tailleEcranX+this.offsetX)){
      actu= this.tailleEcranX+this.offsetX
    }
    if(this.visualisationBoule){
      obj.setAttribute('cx', actu);
    }
    this.mirrorBouleX = actu;
    newX=actu;
    actu = this.mirrorBouleY+valueY*0.3;
    if(actu<(this.offsetY)){
      actu= this.offsetY;
    }
    if(actu > (this.tailleEcranY+this.offsetY)){
      actu = this.tailleEcranY+this.offsetY;
    }
    if(this.visualisationBoule){
      obj.setAttribute('cy', actu);
    }
    this.mirrorBouleY= actu;
    newY=actu;
    return [newX,newY];
  }

  // Déplace l'écran dans la map
  _moveScreenTo(x,y,force=1){
    let distanceX = (x-this.offsetX)-this.centreEcranX;
    let negX = false;
    let indicePowX = 3;
    let indicePowY = 3;
    if(distanceX<0){
      negX = true;
    }
    distanceX = Math.pow((Math.abs(distanceX/this.centreEcranX)),indicePowX)*this.centreEcranX; 
    if(negX){
      distanceX *= -1;
    }
    if(this.offsetX+(distanceX*force)>=0&&(this.offsetX+(distanceX*force)<=this.SVG_MAX_X-this.tailleEcranX)){
      this.offsetX += (distanceX*force);
    }

    let distanceY = (y-this.offsetY)-this.centreEcranY;
    let negY = false;
    if(distanceY<0){
      negY = true;
    }
    distanceY = Math.pow((Math.abs(distanceY/this.centreEcranY)),indicePowY)*this.centreEcranY;
    if(negY){
      distanceY *= -1;
    }
    if((this.offsetY+(distanceY*force)>=0)&&(this.offsetY+(distanceY*force)<=this.SVG_MAX_Y-this.tailleEcranY)){
      this.offsetY += (distanceY*force);
    }
    window.scroll(this.offsetX,this.offsetY)
  }

  _myListener(time){
    this.tailleEcranX = window.innerWidth;
    this.tailleEcranY = window.innerHeight;
    setTimeout(this._myListener,time);
  }

  _remplaceForme(){
    let newList = [];
    for(let i = 0; i < this.listeText.length; i++){
      newList[i]=this.listeText[i];
    }
    for(let i = 0; i < newList.length; i++){
      const nomElement = newList[i].innerHTML;
       if(nomElement.slice(0,1)=='_'){
         const nomForme = nomElement.slice(1,nomElement.length);
         const x = newList[i].getAttribute('x');
         const y = newList[i].getAttribute('y');
         this.send('demandeForme',nomForme,x,y);
         const parent = newList[i].parentNode;
         parent.removeChild(newList[i]);
       }
    }
  }

/* ------------------------------------------DETERMINATION DES IN/OUT DES FORMES--------------------------------------------- */

  // Fonction qui permet de connaître l'ensemble des figures où le point se situe
  _isIn(x,y){
    let tab = [];
    let rotateAngle;
    let centreRotateX;
    let centreRotateY;
    for(let i=0;i<this.listeEllipse.length;i++){
      rotateAngle=0;
      const centreX = this.listeEllipse[i].getAttribute('cx');
      const centreY = this.listeEllipse[i].getAttribute('cy');
      const rayonX = this.listeEllipse[i].getAttribute('rx');
      const rayonY = this.listeEllipse[i].getAttribute('ry');
      let trans = this.listeEllipse[i].getAttribute('transform');
      if(/rotate/.test(trans)){
        trans = trans.slice(7,trans.length);
        centreRotateX = parseFloat(trans.split(" ")[1]);
        centreRotateY = parseFloat(trans.split(",")[1].replace(")",""));
        rotateAngle = parseFloat(trans.split(" ")[0]);
      }
      tab[tab.length]=this._isInEllipse(parseFloat(centreX),parseFloat(centreY),parseFloat(rayonX),parseFloat(rayonY),x,y,rotateAngle,centreRotateX,centreRotateY);     
    }
    for(let i=0;i<this.listeRect.length;i++){
      rotateAngle=0;
      centreRotateX=null;
      centreRotateY=null;
      const hauteur = this.listeRect[i].getAttribute('width');
      const largeur = this.listeRect[i].getAttribute('height');
      const left = this.listeRect[i].getAttribute('x');
      const top = this.listeRect[i].getAttribute('y');
      let trans = this.listeRect[i].getAttribute('transform');
      if(/rotate/.test(trans)){
        trans = trans.slice(7,trans.length);
        centreRotateX = parseFloat(trans.split(" ")[1]);
        centreRotateY = parseFloat(trans.split(",")[1].replace(")",""));
        rotateAngle = parseFloat(trans.split(" ")[0]);
      }
      tab[tab.length]=this._isInRect(parseFloat(hauteur), parseFloat(largeur), parseFloat(left), parseFloat(top), x, y,rotateAngle,centreRotateX,centreRotateY);
    }  
    return tab;
  }

  // Fonctin qui dit dans quel chemin on se trouve
  _isInChemin(x,y){

    //Variables
    let rotateAngle;
    let centreRotateX;
    let centreRotateY;
    let hauteur;
    let largeur;
    let left;
    let top;
    let trans;
    let i =0;

    //CHEMIN 1
    let chemin1 = false;
    while(!chemin1 && i<this.listeRectChemin1.length){
      rotateAngle=0;
      centreRotateX=null;
      centreRotateY=null;
      hauteur = this.listeRectChemin1[i].getAttribute('width');
      largeur = this.listeRectChemin1[i].getAttribute('height');
      left = this.listeRectChemin1[i].getAttribute('x');
      top = this.listeRectChemin1[i].getAttribute('y');
      let trans = this.listeRectChemin1[i].getAttribute('transform');
      if(/rotate/.test(trans)){
        trans = trans.slice(7,trans.length);
        centreRotateX = parseFloat(trans.split(" ")[1]);
        centreRotateY = parseFloat(trans.split(",")[1].replace(")",""));
        rotateAngle = parseFloat(trans.split(" ")[0]);
      }
      chemin1 = this._isInRect(parseFloat(hauteur), parseFloat(largeur), parseFloat(left), parseFloat(top), x, y,rotateAngle,centreRotateX,centreRotateY);
      i++;
    }

    //CHEMIN 2
    let chemin2 = false;
    i =0;
    while(!chemin2 && i<this.listeRectChemin2.length){
      rotateAngle=0;
      centreRotateX=null;
      centreRotateY=null;
      hauteur = this.listeRectChemin2[i].getAttribute('width');
      largeur = this.listeRectChemin2[i].getAttribute('height');
      left = this.listeRectChemin2[i].getAttribute('x');
      top = this.listeRectChemin2[i].getAttribute('y');
      trans = this.listeRectChemin2[i].getAttribute('transform');
      if(/rotate/.test(trans)){
        trans = trans.slice(7,trans.length);
        centreRotateX = parseFloat(trans.split(" ")[1]);
        centreRotateY = parseFloat(trans.split(",")[1].replace(")",""));
        rotateAngle = parseFloat(trans.split(" ")[0]);
      }
      chemin2 = this._isInRect(parseFloat(hauteur), parseFloat(largeur), parseFloat(left), parseFloat(top), x, y,rotateAngle,centreRotateX,centreRotateY);
      i++;
    }

    //CHEMIN 3
    let chemin3 = false;
    i =0;
    while(!chemin3 && i<this.listeRectChemin3.length){
      rotateAngle=0;
      centreRotateX=null;
      centreRotateY=null;
      hauteur = this.listeRectChemin3[i].getAttribute('width');
      largeur = this.listeRectChemin3[i].getAttribute('height');
      left = this.listeRectChemin3[i].getAttribute('x');
      top = this.listeRectChemin3[i].getAttribute('y');
      trans = this.listeRectChemin3[i].getAttribute('transform');
      if(/rotate/.test(trans)){
        trans = trans.slice(7,trans.length);
        centreRotateX = parseFloat(trans.split(" ")[1]);
        centreRotateY = parseFloat(trans.split(",")[1].replace(")",""));
        rotateAngle = parseFloat(trans.split(" ")[0]);
      }
      chemin3 = this._isInRect(parseFloat(hauteur), parseFloat(largeur), parseFloat(left), parseFloat(top), x, y,rotateAngle,centreRotateX,centreRotateY);
      i++;
    }        
    return [chemin2,chemin1,chemin3];
  }

  // Fonction qui dit si un point est dans un rect
   _isInRect(hauteur,largeur,left,top,pointX,pointY,rotateAngle,centreRotateX,centreRotateY){
      //rotation
      const newPoint = this._rotatePoint(pointX,pointY,centreRotateX,centreRotateY,rotateAngle);
      //Appartenance
      if(newPoint[0] > parseInt(left) && newPoint[0] <(parseInt(left)+parseInt(hauteur)) && newPoint[1] > top && newPoint[1] < (parseInt(top) + parseInt(largeur))){
        return true;
      }else{
        return false;
      }
   }

  // Fonction qui dit si un point est dans une ellipse
  _isInEllipse(centreX,centreY,rayonX,rayonY,pointX,pointY,rotateAngle,centreRotateX,centreRotateY){
    //rotation
    const newPoint = this._rotatePoint(pointX,pointY,centreRotateX,centreRotateY,rotateAngle);
    //Appartenance 
    let a = rayonX;; // Grand rayon
    let b = rayonY; // Petit rayon
    //const c = Math.sqrt((a*a)-(b*b)); // Distance Foyer
    const calc = ((Math.pow((newPoint[0]-centreX),2))/(Math.pow(a,2)))+((Math.pow((newPoint[1]-centreY),2))/(Math.pow(b,2)));
    if(calc<=1){
      return true;
    }else{
      return false;
    }
  }

  // Fonction permettant de réaxer le point
  _rotatePoint(x,y,centreX,centreY,angle){
    let newAngle = angle*(3.14159265/180); // Passage en radian
    let tab = [];
    let newX = (x-centreX)*Math.cos(newAngle)+(y-centreY)*Math.sin(newAngle);
    let newY = -1*(x-centreX)*Math.sin(newAngle)+(y-centreY)*Math.cos(newAngle);
    newX += centreX;
    newY += centreY;
    //Affichage du symétrique
     // const obj = this.view.$el.querySelector('#bouleR');
     // obj.setAttribute("cx",newX);
     // obj.setAttribute("cy",newY);
    //Fin de l'affichage du symétrique
    tab[0] = newX;
    tab[1] = newY;
    return tab;
  }

/* ------------------------------------------Calcul des distances--------------------------------------------- */

  // Donne la distance du point avec les formes présentes
  _getDistance(xValue,yValue){
    let tab = [];
    for(let i=0;i<this.listeEllipse.length;i++){
      tab[tab.length]=this._getDistanceNode(this.listeEllipse[i],xValue,yValue);
    }
    for(let i=0;i<this.listeRect.length;i++){
      tab[tab.length]=this._getDistanceNode(this.listeRect[i],xValue,yValue);
    }
    return tab;
  }

  // Donne la distance d'un point avec une forme
  _getDistanceNode(node,x,y){
    if(node.tagName=="ellipse"){
      let centreX = parseInt(node.getAttribute('cx'));
      let centreY = parseInt(node.getAttribute('cy'));
      return Math.sqrt(Math.pow((centreX-x),2)+Math.pow((centreY-y),2));
    }else if(node.tagName=='rect'){
      let left = parseInt(node.getAttribute('x'));
      let top = parseInt(node.getAttribute('y'));
      let haut = parseInt(node.getAttribute('height'));
      let larg = parseInt(node.getAttribute('width'));
      let centreX = (left+larg)/2;
      let centreY = (top+haut)/2;
      return Math.sqrt(Math.pow((centreX-x),2)+Math.pow((centreY-y),2));
    }
  }

/* ------------------------------------------SON--------------------------------------------- */

  // Créé le moteur sonore
  _creationUniversSonore(){
    //Granulateur
    this.grain = new MyGrain();
    scheduler.add(this.grain);
    this.grain.connect(audioContext.destination);
    const bufferAssocies = [5,7,9];
    const markerAssocies = [6,8,10];
    //Segmenter
    for(let i=0; i<this.nbChemin ; i++){
      let idBuffer = bufferAssocies[i];
      let idMarker = markerAssocies[i];
      this.segmenter[i] = new waves.SegmentEngine({
        buffer: this.loader.buffers[idBuffer],
        positionArray: this.loader.buffers[idMarker].time,
        durationArray: this.loader.buffers[idMarker].duration,
        periodAbs: 10,
        periodRel: 10,
      });
      this.segmenterGain[i] = audioContext.createGain();
      this.segmenterGainGrain[i] = audioContext.createGain();
      this.segmenterGain[i].connect(audioContext.destination);
      this.segmenterGainGrain[i].gain.setValueAtTime(0,audioContext.currentTime);
      this.segmenterGain[i].gain.setValueAtTime(0,audioContext.currentTime);
      this.segmenterGainGrain[i].connect(this.grain.input);
      this.segmenter[i].connect(this.segmenterGain[i]);
      this.segmenter[i].connect(this.segmenterGainGrain[i]);
      this._startSegmenter(i);
    }

    // Nappe de fond
    for(let i=0;i<this.totalElements;i++){

      //Création des gains d'entrée/sorties des nappes
      this.gainsDirections[i]='down';
      this.gains[i]= audioContext.createGain();
      this.gains[i].gain.value=0;
      this.gains[i].connect(this.grain.input);

      //Création des sources pour le granulateur
      this.sources[i]=audioContext.createBufferSource();
      this.sources[i].buffer= this.loader.buffers[i%5];
      this.sources[i].connect(this.gains[i]);
      this.sources[i].loop = true;
      this.sources[i].start();

    }

    // Figure
     
  }

  _startSegmenter(i){
    this.segmenter[i].trigger();
    const newPeriod = parseFloat(this.loader.buffers[6]['duration'][this.segmenter[i].segmentIndex])*1000;
    setTimeout(()=>{this._startSegmenter(i);},newPeriod);
  }
      //Création des sources pour les formes
      //this.sources;

  // Fait monter le son quand la boule est dans la forme et baisser si la boule n'y est pas
  _updateGain(tabIn){
    for(var i=0;i<tabIn.length;i++){
      if(this.gains[i].gain.value==0&&tabIn[i]&&this.gainsDirections[i]=='down'){
        let actual = this.gains[i].gain.value;
        this.gains[i].gain.cancelScheduledValues(audioContext.currentTime);
        this.gains[i].gain.setValueAtTime(actual,audioContext.currentTime);
        this.gains[i].gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 1);
        this.gainsDirections[i]='up';
      }else if(this.gains[i].gain.value!=0&&!tabIn[i]&&this.gainsDirections[i]=='up'){
        let actual = this.gains[i].gain.value;
        this.gains[i].gain.cancelScheduledValues(audioContext.currentTime);
        this.gains[i].gain.setValueAtTime(actual,audioContext.currentTime);
        this.gains[i].gain.linearRampToValueAtTime(0, audioContext.currentTime + 1);
        this.gainsDirections[i]='down';
      }
    }
  }

  _actualiserAudioChemin(i){
    if(this.tabChemin[i]){
      let actual1 = this.segmenterGain[i].gain.value;
      let actual2 = this.segmenterGainGrain[i].gain.value;
      this.segmenterGain[i].gain.cancelScheduledValues(audioContext.currentTime);
      this.segmenterGainGrain[i].gain.cancelScheduledValues(audioContext.currentTime);
      this.segmenterGain[i].gain.setValueAtTime(actual1,audioContext.currentTime);
      this.segmenterGainGrain[i].gain.setValueAtTime(actual2,audioContext.currentTime);
      this.segmenterGainGrain[i].gain.linearRampToValueAtTime(0, audioContext.currentTime + 2);
      this.segmenterGain[i].gain.linearRampToValueAtTime(0.4, audioContext.currentTime + 3);
    }else{
      let actual1 = this.segmenterGain[i].gain.value;
      let actual2 = this.segmenterGainGrain[i].gain.value;
      this.segmenterGain[i].gain.cancelScheduledValues(audioContext.currentTime);
      this.segmenterGainGrain[i].gain.cancelScheduledValues(audioContext.currentTime);
      this.segmenterGain[i].gain.setValueAtTime(actual1,audioContext.currentTime);
      this.segmenterGainGrain[i].gain.setValueAtTime(actual2,audioContext.currentTime);
      if(this.startSegmentFini[i]){
        this.segmenterGainGrain[i].gain.linearRampToValueAtTime(0.9, audioContext.currentTime + 2);
        setTimeout( ()=>{
          this.segmenterGainGrain[i].gain.linearRampToValueAtTime(0,audioContext.currentTime + 1.5);         
        }
        ,2000);
        this.segmenterGain[i].gain.linearRampToValueAtTime(0, audioContext.currentTime + 2.5);
      }else{
        this.startSegmentFini[i] = true;
      }
    }
  }

  /* -----------------------------------------XMM----------------------------------------------- */
  _setModel(model,model1,model2){
    this.decoder.setModel(model);
    this.decoder2.setModel(model1);
    this.decoder3.setModel(model2);
    this.modelOK = true;
  }

  _processProba(){    
    let probaMax = this.decoder.getProba();
    let probaMax1 = this.decoder2.getProba();
    let probaMax2 = this.decoder3.getProba();
    let newSegment = [];
    for(let i = 0 ; i < this.nbChemin ; i ++){
      newSegment[i] = this._findNewSegment(probaMax1, probaMax2, i);
      this._actualiserSegmentIfNotIn(newSegment[i],i);
      let nom1 = 'fond-'+i+'-1';
      let nom2 = 'fond-'+i+'-2';
      if(this.tabChemin[i]&&(probaMax1[0]==nom1||probaMax2[0]==nom2)){
        if(probaMax1[1][i]!=NaN){
          this.segmenter[i].segmentIndex = newSegment[i];
        }
      }
      if(this.tabChemin[i]!=this.oldTabChemin[i]){
        this._actualiserAudioChemin(i);
      }
      this.oldTabChemin[i] = this.tabChemin[i];
    }
  }

  // Trouve en fonction de xmm le segment le plus proche de la position de l'utilisateur
  _findNewSegment(probaMax1, probaMax2, id){
    let newSegment = -1;
    let actuel = null;
    if(this.ancien1[id]-probaMax1[1][id]<-0.001){
      newSegment = Math.trunc(probaMax1[1][id]*this.nbSegment[id]);
      actuel = "1";
      if(this.count2[id]>this.countMax){
        this.decoder3.reset();
        this.count2[id] = 0;
      }
      this.count1[id] = 0;
      this.count2[id]++;
    }else if (this.ancien2[id]-probaMax2[1][id]<-0.001){
      newSegment = Math.trunc((1-probaMax2[1][id])*this.nbSegment[id]);
      actuel = "0";
      if(this.count1[id]>this.countMax){
        this.decoder2.reset();
        this.count1[id] = 0;
      }
      this.count2[id] = 0;
      this.count1[id]++;
    }else{
      newSegment = this.segmenter[id].segmentIndex;
    }
    this.ancien1[id] = probaMax1[1][id];
    this.ancien2[id] = probaMax2[1][id];
    return newSegment;
  }

  // Fais avancer la tête de lecture des segmenter si l'utilisateur n'est pas dans une forme
  _actualiserSegmentIfNotIn(newSegment, id){
    if(!this.tabChemin[id]){
      if(this.countTimeout[id]>40){
        if(newSegment>59){
          this.direction[id] = false;
        }else if(newSegment<1){
          this.direction[id] = true;
        }
        this.countTimeout[id] = 0;
        if(this.direction[id]){
          newSegment++;
        }else{
          newSegment--;
        }
      }
      this.countTimeout[id]++;
      this.segmenter[id].segmentIndex = newSegment;
    }
  }
}
