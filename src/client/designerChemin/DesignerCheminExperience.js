import * as soundworks from 'soundworks/client';
import MyGrain from '../player/MyGrain.js';
import * as waves from 'waves-audio';
import {PhraseRecorderLfo} from 'xmm-lfo';
import EnregistrementChemin from './EnregistrementChemin.js';

const audioContext = soundworks.audioContext;
const scheduler = waves.getScheduler();

class PlayerView extends soundworks.View{
  constructor(template, content, events, options) {
    super(template, content, events, options);
  }

  onTouch(callback){
    this.installEvents({
      'click svg': () => {
          callback();
      }
    });
  }
}

const view = ``


// this experience plays a sound when it starts, and plays another sound when
// other clients join the experience
export default class DesignerFormeExperience extends soundworks.Experience {
  constructor(assetsDomain) {
    super();
    //Services
    this.platform = this.require('platform', { features: ['web-audio', 'wake-lock'] });
    this.motionInput = this.require('motion-input', { descriptors: ['orientation'] });
    this.loader = this.require('loader', { files: ['sounds/nappe/branches.mp3','sounds/nappe/gadoue.mp3',"sounds/nappe/nage.mp3","sounds/nappe/tempete.mp3","sounds/nappe/vent.mp3"] });
    this.label = 't';
    this.actualId=1;
    this.actualSens=1;
    this.startOK = false;
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
    this._getDistanceNode = this._getDistanceNode.bind(this);
    this._rotatePoint = this._rotatePoint.bind(this);
    this._myListener= this._myListener.bind(this);
    this._onTouch = this._onTouch.bind(this);
    this.view.onTouch(this._onTouch);
    this._addFond = this._addFond.bind(this);
    this._addBoule = this._addBoule.bind(this);
    this._addRect = this._addRect.bind(this);
    this.receive('fond',(fond,label,id,sens)=>this._addFond(fond,label,id,sens));

 }

  start() {
    if(!this.startOK){
      super.start(); // don't forget this
      if (!this.hasStarted)
        this.init();
      this.show();
    }else{
      //Paramètre initiaux
      this._addBoule(100,100);
      this._addRect();
      document.body.style.overflow = "hidden";    //Constantes
      this.centreX = window.innerWidth/2;
      this.tailleEcranX = window.innerWidth;
      this.tailleEcranY = window.innerHeight;
      this.centreEcranX = this.tailleEcranX/2;
      this.centreEcranY = this.tailleEcranY/2;
      setTimeout(() => {this._myListener(100)},100);
      this.centreY = window.innerHeight/2;

      //XMM-lfo
      this.enregistrement = new EnregistrementChemin(this.label,this.actualId,this.actualSens);
      this.onRecord = false;

      //Detecte les elements SVG
      this.listeEllipse = document.getElementsByTagName('ellipse');
      this.listeRect = document.getElementsByTagName('rect');
      this.totalElements = this.listeEllipse.length + this.listeRect.length;

      //Initisalisation
      this.maxCountUpdate = 4;
      this.countUpdate = this.maxCountUpdate + 1; // Initialisation
      this.visualisationBoule=true; // Visualisation de la boule
      if(!this.visualisationBoule){
        this.view.$el.querySelector('#boule').style.display='none';
      }
      this.visualisationForme=true; // Visualisation des formes SVG
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
          // Affichage
          const newValues = this._toMove(data[2],data[1]-25);
          this.tabIn = this._isIn(newValues[0],newValues[1]);
          this._moveScreenTo(newValues[0],newValues[1],0.08);
          // XMM
          this.enregistrement.process(newValues[0],newValues[1]);
        });
      } else {
        console.log("Orientation non disponible");
      }
    }

  }

/* ------------------------------------------CALL BACK EVENT-------------------------------------------------- */

_onTouch(){
  if(!this.onRecord){
    document.getElementById("fond").setAttribute("fill", "red");
    this.onRecord = true;
    this.enregistrement.startRecord();
  }else{
    document.getElementById("fond").setAttribute("fill", "black");
    this.onRecord = false;
    this.enregistrement.stopRecord(this);
  }
}

/* Ajoute le fond */
_addFond(fond,label,id,sens){
  // On parse le fichier SVG en DOM
  this.actualId = id;
  this.actualSens = sens;
  let myLayer;
  const parser = new DOMParser();
  let fondXml = parser.parseFromString(fond,'application/xml');
  fondXml = fondXml.getElementsByTagName('title');
  for(let i = 0; i<fondXml.length;i++){
    if(fondXml[i].innerHTML=='Chemin'){
      myLayer = fondXml[i];
    }
  }
  let myG = myLayer.parentNode; 
  let mySvg = document.createElementNS('http://www.w3.org/2000/svg','svg');
  mySvg.setAttributeNS(null,'width', 10000);
  mySvg.setAttributeNS(null,'height', 10000);
  document.getElementById('experience').appendChild(mySvg);
  mySvg.appendChild(myG);
  // On allume seulement le path voulu
  let myPaths = document.getElementsByTagName('path');
  for(let i = 0; i<myPaths.length; i++){
    if(i!=id){
      myPaths[i].style.display = 'none';
    }
  }

  this.startOK = true;
  this.label = label;
  this.start();
}

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

  _addRect(){
    const svgElement = document.getElementsByTagName('svg')[0];
    let x = svgElement.getAttribute('width');
    let y = svgElement.getAttribute('height');
    const newRect = document.createElementNS('http://www.w3.org/2000/svg','rect');
    newRect.setAttributeNS(null,'width',x);
    newRect.setAttributeNS(null,'height', y);
    newRect.setAttributeNS(null,'x',0);
    newRect.setAttributeNS(null,'y',0);
    newRect.setAttributeNS(null,'id','fond');
    svgElement.insertBefore(newRect,svgElement.firstChild);
  }

/* ------------------------------------------MOUVEMENT DE L ECRAN--------------------------------------------- */

  /* Callback orientationMotion / Mouvement de la boule*/
  _toMove(valueX,valueY){
    const obj = this.view.$el.querySelector('#boule');
    let newX;
    let newY;
    let actu = this.mirrorBouleX+valueX*0.3; //parseInt(obj.getAttribute('cx'))+valueX*0.3;
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
    actu = this.mirrorBouleY+valueY*0.3;//parseInt(obj.getAttribute('cy'))+valueY*0.3;
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
}
