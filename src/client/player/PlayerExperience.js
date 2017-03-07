import * as soundworks from 'soundworks/client';
import MyGrain from './MyGrain.js';
import * as waves from 'waves-audio';
import Decoder from './Decoder.js';

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
      files: ['sounds/nappe/gadoue.mp3',    // 0
              'sounds/nappe/gadoue.mp3',    // 1
              "sounds/nappe/nage.mp3",      // ...
              "sounds/nappe/tempete.mp3",
              "sounds/nappe/vent.mp3",
              "sounds/path/camusC.mp3",     // 5  
              "markers/camus.json", 
              "sounds/path/churchillC.mp3",    
              "markers/churchill.json",
              "sounds/path/irakC.mp3",   
              "markers/irak.json",          // 10  
              "sounds/shape/eminem.mp3",
              "sounds/shape/trump.mp3",
              "sounds/shape/fr.mp3",
              "sounds/shape/brexit.mp3"]
    });

    //params
    this.gainOutputDirect;
    this.gainOutputGrain;
    this.grain;
    this.startOK = false;
    this.modelOK = false;
    this.nbPath = 3;
    this.nbShape = 4;
    this.qtRandom = 140;
    this.old = false;
    this.nbSegment = [232, 144, 106];
    this.lastSegment = [0, 0, 0];
    this.lastPosition = [0, 0, 0];
    this.count4 = 10;
    this.maxLag = 10;
    this.endStartSegmenter = [];
    this.countTimeout = [];
    this.direction = [];
    this.oldTabPath = [];
    this.count1 = [];
    this.count2 = [];
    this.segmenter = [];
    this.segmenterGain = [];
    this.segmenterGainGrain = [];
    this.sources = [];
    this.gains = [];
    this.gainsDirections = [];
    this.gainsShape = [];
    this.oldShape = [false, false, false, false];
    this.gainsGrainShape = [];
    this.soundShape = [];
    this.rampShape = {'shape1': 0, 'shape2': 0, 'shape3': 0, 'shape4': 0};
    this.countMax = 100;

    this.decoder = new Decoder();

    for(let i = 0; i < this.nbPath; i++){
      this.count1[i] = 20;
      this.count2[i] = 20;
      this.countTimeout[i] = 0;
      this.direction[i] = true;
      this.oldTabPath[i] = true;
      this.endStartSegmenter[i] = false;
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
    this._isInLayer = this._isInLayer.bind(this);
    this._isInPath = this._isInPath.bind(this);
    this._isInShape = this._isInShape.bind(this);
    this._createSonorWorld = this._createSonorWorld.bind(this);    
    this._updateGain = this._updateGain.bind(this);
    this._rotatePoint = this._rotatePoint.bind(this);
    this._myListener= this._myListener.bind(this);
    this._addBall = this._addBall.bind(this);
    this._addBackground = this._addBackground.bind(this);
    this._setModel = this._setModel.bind(this);
    this._processProba = this._processProba.bind(this);
    this._replaceShape = this._replaceShape.bind(this);
    this._addShape = this._addShape.bind(this);
    this._startSegmenter = this._startSegmenter.bind(this);
    this._findNewSegment = this._findNewSegment.bind(this);
    this._updateSegmentIfNotIn = this._updateSegmentIfNotIn.bind(this);
    this._updateAudioPath = this._updateAudioPath.bind(this);
    this._updateAudioshape = this._updateAudioshape.bind(this);

    //receives
    this.receive('background', (data) => this._addBackground(data));
    this.receive( 'model', (model) => this._setModel(model) );
    this.receive('shapeAnswer', (shape, x, y) => this._addShape(shape, x, y));

 }

  start() {
    if(!this.startOK){
      super.start(); // don't forget this
      if (!this.hasStarted)
        this.init();
      this.show();
    }else{

      //params
      document.body.style.overflow = "hidden";  
      this.middleX = window.innerWidth / 2;
      this.screenSizeX = window.innerWidth;
      this.screenSizeY = window.innerHeight;
      this.middleEcranX = this.screenSizeX / 2;
      this.middleEcranY = this.screenSizeY / 2;
      setTimeout( () =>{this._myListener(100);} , 100);
      this.middleY = window.innerHeight / 2;
      this.ellipseListLayer = document.getElementsByTagName('ellipse');
      this.rectListLayer = document.getElementsByTagName('rect');
      this.totalElements = this.ellipseListLayer.length + this.rectListLayer.length;
      this.textList = document.getElementsByTagName('text');
      this.shapeList = [];
      this.listRectPath1 = document.getElementsByClassName('path0');
      this.listRectPath2 = document.getElementsByClassName('path1');
      this.listRectPath3 = document.getElementsByClassName('path2');
      this.RectListShape1 = document.getElementsByClassName('shape1');
      this.RectListShape2 = document.getElementsByClassName('shape2');
      this.RectListShape3 = document.getElementsByClassName('shape3');
      this.RectListShape4 = document.getElementsByClassName('shape4');

      this._addBall(10, 10);
      this._replaceShape(); 
      this._createSonorWorld();

      this.maxCountUpdate = 2;
      this.countUpdate = this.maxCountUpdate + 1; 
      this.visualisationShapePath = false;
      this.visualisationBall = true; 
      if(!this.visualisationBall){
        this.view.$el.querySelector('#ball').style.display = 'none';
      }
      this.visualisationShape = false;
      if(!this.visualisationShape){
        for(let i = 0; i < this.ellipseListLayer.length; i++){
          this.ellipseListLayer[i].style.display = 'none';
        }
        for(let i = 0; i < this.rectListLayer.length; i++){
          this.rectListLayer[i].style.display = 'none';
        }
      } 

      this.mirrorBallX = 10;
      this.mirrorBallY = 10;
      this.offsetX = 0; 
      this.offsetY = 0;
      this.svgMaxX = document.getElementsByTagName('svg')[0].getAttribute('width');
      this.svgMaxY = document.getElementsByTagName('svg')[0].getAttribute('height');

      this.tabInLayer;
      if (this.motionInput.isAvailable('orientation')) {
        this.motionInput.addListener('orientation', (data) => {
          const newValues = this._toMove(data[2],data[1] - 25);
          if(this.count4 > this.maxLag){
            this.tabInLayer = this._isInLayer(newValues[0], newValues[1]);
            this.tabPath = this._isInPath(newValues[0], newValues[1]);
            this.tabShape = this._isInShape(newValues[0], newValues[1]);
            this.count4 = -1;
            if(this.countUpdate > this.maxCountUpdate){
              this._updateGain(this.tabInLayer);
              this.countUpdate = 0;
            }else{
              this.countUpdate++;
            }
          }

          this.count4++;
          
          this._moveScreenTo(newValues[0], newValues[1], 0.08);

          if(this.modelOK){
            this.decoder.process(newValues[0], newValues[1]);
            this._processProba();
          }
        });
      } else {
        console.log("Orientation non disponible");
      }
    }
  }

  _addBall(x,y){
    const elem = document.createElementNS('http://www.w3.org/2000/svg','circle');
    elem.setAttributeNS(null,"cx",x);
    elem.setAttributeNS(null,"cy",y);
    elem.setAttributeNS(null,"r",10);
    elem.setAttributeNS(null,"stroke",'white');
    elem.setAttributeNS(null,"stroke-width",3);
    elem.setAttributeNS(null,"fill",'black');
    elem.setAttributeNS(null,"id",'Ball');
    document.getElementsByTagName('svg')[0].appendChild(elem);
  }

  _addBackground(background){
    const parser = new DOMParser();
    let backgroundXml = parser.parseFromString(background, 'application/xml');
    backgroundXml = backgroundXml.getElementsByTagName('svg')[0];
    document.getElementById('experience').appendChild(backgroundXml);
    document.getElementsByTagName('svg')[0].setAttribute('id', 'svgElement')
    this._deleteRectPath();
    this.startOK = true;
    this.start();
  }

  _deleteRectPath(){
    let tab = document.getElementsByClassName('path0');
    if(!this.visualisationShapePath){
      for(let i = 0 ; i < tab.length; i++){
        tab[i].style.display = 'none';
      }

      tab = document.getElementsByClassName('path1');
      for(let i = 0 ; i < tab.length; i++){
        tab[i].style.display = 'none';
      }

      tab = document.getElementsByClassName('path2');
      for(let i = 0 ; i < tab.length; i++){
        tab[i].style.display = 'none';
      }
    }
  }

  _addShape(shape, x, y){
    const parser = new DOMParser();
    let shapeXml = parser.parseFromString(shape,'application/xml');
    shapeXml = shapeXml.getElementsByTagName('g')[0];
    let ball = document.getElementById('ball');
    const shapeXmlTab = shapeXml.childNodes;
    for(let i = 0; i < shapeXmlTab.length; i++){
      if(shapeXmlTab[i].nodeName == 'path'){
        const newNode = Ball.parentNode.insertBefore(shapeXmlTab[i], ball);
        this.shapeList[this.shapeList.length] = newNode.setAttribute('transform', 'translate(' + x + ' ' + y + ')');
      }
    } 
  }

  _toMove(valueX, valueY){
    const obj = this.view.$el.querySelector('#ball');
    let newX;
    let newY;
    let actu = this.mirrorBallX + valueX * 0.3;
    if(actu < this.offsetX){
      actu = this.offsetX ;
    }else if(actu > (this.screenSizeX + this.offsetX)){
      actu = this.screenSizeX + this.offsetX
    }
    if(this.visualisationBall){
      obj.setAttribute('cx', actu);
    }
    this.mirrorBallX = actu;
    newX = actu;
    actu = this.mirrorBallY + valueY * 0.3;
    if(actu < (this.offsetY)){
      actu = this.offsetY;
    }
    if(actu > (this.screenSizeY + this.offsetY)){
      actu = this.screenSizeY + this.offsetY;
    }
    if(this.visualisationBall){
      obj.setAttribute('cy', actu);
    }
    this.mirrorBallY = actu;
    newY = actu;
    return [newX, newY];
  }

  _moveScreenTo(x, y, force=1){
    let distanceX = (x - this.offsetX) - this.middleEcranX;
    let negX = false;
    let indicePowX = 3;
    let indicePowY = 3;
    if(distanceX < 0){
      negX = true;
    }
    distanceX = Math.pow((Math.abs(distanceX / this.middleEcranX)), indicePowX) * this.middleEcranX; 
    if(negX){
      distanceX *= -1;
    }
    if(this.offsetX + (distanceX * force) >= 0 && (this.offsetX + (distanceX * force) <= this.svgMaxX - this.screenSizeX)){
      this.offsetX += (distanceX * force);
    }

    let distanceY = (y - this.offsetY) - this.middleEcranY;
    let negY = false;
    if(distanceY < 0){
      negY = true;
    }
    distanceY = Math.pow((Math.abs(distanceY / this.middleEcranY)), indicePowY) * this.middleEcranY;
    if(negY){
      distanceY *= -1;
    }
    if((this.offsetY + (distanceY * force) >= 0) && (this.offsetY + (distanceY * force) <= this.svgMaxY - this.screenSizeY)){
      this.offsetY += (distanceY * force);
    }
    window.scroll(this.offsetX, this.offsetY)
  }

  _myListener(time){
    this.screenSizeX = window.innerWidth;
    this.screenSizeY = window.innerHeight;
    setTimeout(this._myListener, time);
  }

  _replaceShape(){
    let newList = [];
    for(let i = 0; i < this.textList.length; i++){
      newList[i] = this.textList[i];
    }
    for(let i = 0; i < newList.length; i++){
      const elementName = newList[i].innerHTML;
       if(elementName.slice(0, 1) == '_'){

         const shapeName = elementName.slice(1, elementName.length);
         const x = newList[i].getAttribute('x');
         const y = newList[i].getAttribute('y');
         this.send('askShapes', shapeName, x, y);
         const parent = newList[i].parentNode;
         parent.removeChild(newList[i]);
         const elems = document.getElementsByClassName(shapeName);
         for(let i = 0; i < elems.length; i++){
            elems[i].style.display = 'none';
         }
       }
    }
  }

  _isInLayer(x, y){
    let tab = [];
    let rotateAngle;
    let middleRotateX;
    let middleRotateY;
    for(let i = 0; i < this.ellipseListLayer.length; i++){
      rotateAngle = 0;
      const middleX = this.ellipseListLayer[i].getAttribute('cx');
      const middleY = this.ellipseListLayer[i].getAttribute('cy');
      const radiusX = this.ellipseListLayer[i].getAttribute('rx');
      const radiusY = this.ellipseListLayer[i].getAttribute('ry');
      let transform = this.ellipseListLayer[i].getAttribute('transform');
      if(/rotate/.test(transform)){
        transform = transform.slice(7,transform.length);
        middleRotateX = parseFloat(transform.split(" ")[1]);
        middleRotateY = parseFloat(transform.split(",")[1].replace(")", ""));
        rotateAngle = parseFloat(transform.split(" ")[0]);
      }
      tab[tab.length]=this._isInEllipse(parseFloat(middleX), parseFloat(middleY), parseFloat(radiusX), parseFloat(radiusY), x, y, rotateAngle, middleRotateX, middleRotateY);     
    }
    for(let i = 0; i < this.rectListLayer.length; i++){
      rotateAngle = 0;
      middleRotateX = null;
      middleRotateY = null;
      const height = this.rectListLayer[i].getAttribute('width');
      const width = this.rectListLayer[i].getAttribute('height');
      const left = this.rectListLayer[i].getAttribute('x');
      const top = this.rectListLayer[i].getAttribute('y');
      let transform = this.rectListLayer[i].getAttribute('transform');
      if(/rotate/.test(transform)){
        transform = transform.slice(7,transform.length);
        middleRotateX = parseFloat(transform.split(" ")[1]);
        middleRotateY = parseFloat(transform.split(",")[1].replace(")", ""));
        rotateAngle = parseFloat(transform.split(" ")[0]);
      }
      tab[tab.length]=this._isInRect(parseFloat(height), parseFloat(width), parseFloat(left), parseFloat(top), x, y, rotateAngle, middleRotateX, middleRotateY);
    }  
    return tab;
  }

  _isInPath(x, y){

    let rotateAngle;
    let middleRotateX;
    let middleRotateY;
    let height;
    let width;
    let left;
    let top;
    let transform;
    let i =0;

    //Path 1
    let path1 = false;
    while(!path1 && i < this.listRectPath1.length){
      rotateAngle = 0;
      middleRotateX = null;
      middleRotateY = null;
      height = this.listRectPath1[i].getAttribute('width');
      width = this.listRectPath1[i].getAttribute('height');
      left = this.listRectPath1[i].getAttribute('x');
      top = this.listRectPath1[i].getAttribute('y');
      let transform = this.listRectPath1[i].getAttribute('transformform');
      if(/rotate/.test(transform)){
        transform = transform.slice(7,transform.length);
        middleRotateX = parseFloat(transform.split(" ")[1]);
        middleRotateY = parseFloat(transform.split(",")[1].replace(")", ""));
        rotateAngle = parseFloat(transform.split(" ")[0]);
      }
      path1 = this._isInRect(parseFloat(height), parseFloat(width), parseFloat(left), parseFloat(top), x, y, rotateAngle, middleRotateX, middleRotateY);
      i++;
    }

    //Path 2
    let path2 = false;
    i =0;
    while(!path2 && i < this.listRectPath2.length){
      rotateAngle = 0;
      middleRotateX = null;
      middleRotateY = null;
      height = this.listRectPath2[i].getAttribute('width');
      width = this.listRectPath2[i].getAttribute('height');
      left = this.listRectPath2[i].getAttribute('x');
      top = this.listRectPath2[i].getAttribute('y');
      transform = this.listRectPath2[i].getAttribute('transformform');
      if(/rotate/.test(transform)){
        transform = transform.slice(7,transform.length);
        middleRotateX = parseFloat(transform.split(" ")[1]);
        middleRotateY = parseFloat(transform.split(",")[1].replace(")", ""));
        rotateAngle = parseFloat(transform.split(" ")[0]);
      }
      path2 = this._isInRect(parseFloat(height), parseFloat(width), parseFloat(left), parseFloat(top), x, y, rotateAngle, middleRotateX, middleRotateY);
      i++;
    }

    //Path 3
    let path3 = false;
    i =0;
    while(!path3 && i<this.listRectPath3.length){
      rotateAngle=0;
      middleRotateX=null;
      middleRotateY=null;
      height = this.listRectPath3[i].getAttribute('width');
      width = this.listRectPath3[i].getAttribute('height');
      left = this.listRectPath3[i].getAttribute('x');
      top = this.listRectPath3[i].getAttribute('y');
      transform = this.listRectPath3[i].getAttribute('transformform');
      if(/rotate/.test(transform)){
        transform = transform.slice(7,transform.length);
        middleRotateX = parseFloat(transform.split(" ")[1]);
        middleRotateY = parseFloat(transform.split(",")[1].replace(")", ""));
        rotateAngle = parseFloat(transform.split(" ")[0]);
      }
      path3 = this._isInRect(parseFloat(height), parseFloat(width), parseFloat(left), parseFloat(top), x, y, rotateAngle, middleRotateX, middleRotateY);
      i++;
    }        
    return [path1, path2, path3];
  }

  _isInShape(x, y){
    //Variables
    let rotateAngle;
    let middleRotateX;
    let middleRotateY;
    let height;
    let width;
    let left;
    let top;
    let transform;
    let i = 0;

    //shape 1
    let shape1 = false;
    while(!shape1 && i < this.RectListShape1.length){
      rotateAngle = 0;
      middleRotateX = null;
      middleRotateY = null;
      height = this.RectListShape1[i].getAttribute('width');
      width = this.RectListShape1[i].getAttribute('height');
      left = this.RectListShape1[i].getAttribute('x');
      top = this.RectListShape1[i].getAttribute('y');
      let transform = this.RectListShape1[i].getAttribute('transform');
      if(/rotate/.test(transform)){
        transform = transform.slice(7,transform.length);
        middleRotateX = parseFloat(transform.split(" ")[1]);
        middleRotateY = parseFloat(transform.split(",")[1].replace(")", ""));
        rotateAngle = parseFloat(transform.split(" ")[0]);
      }
      shape1 = this._isInRect(parseFloat(height), parseFloat(width), parseFloat(left), parseFloat(top), x, y, rotateAngle, middleRotateX, middleRotateY);
      i++;
    }

    //shape 2
    i = 0;
    let shape2 = false;
    while(!shape2 && i < this.RectListShape2.length){
      rotateAngle = 0;
      middleRotateX = null;
      middleRotateY = null;
      height = this.RectListShape2[i].getAttribute('width');
      width = this.RectListShape2[i].getAttribute('height');
      left = this.RectListShape2[i].getAttribute('x');
      top = this.RectListShape2[i].getAttribute('y');
      let transform = this.RectListShape2[i].getAttribute('transform');
      if(/rotate/.test(transform)){
        transform = transform.slice(7,transform.length);
        middleRotateX = parseFloat(transform.split(" ")[1]);
        middleRotateY = parseFloat(transform.split(",")[1].replace(")", ""));
        rotateAngle = parseFloat(transform.split(" ")[0]);
      }
      shape2 = this._isInRect(parseFloat(height), parseFloat(width), parseFloat(left), parseFloat(top), x, y, rotateAngle, middleRotateX, middleRotateY);
      i++;
    }

    //shape 3
    i = 0;
    let shape3 = false;
    while(!shape3 && i < this.RectListShape3.length){
      rotateAngle = 0;
      middleRotateX = null;
      middleRotateY = null;
      height = this.RectListShape3[i].getAttribute('width');
      width = this.RectListShape3[i].getAttribute('height');
      left = this.RectListShape3[i].getAttribute('x');
      top = this.RectListShape3[i].getAttribute('y');
      let transform = this.RectListShape3[i].getAttribute('transform');
      if(/rotate/.test(transform)){
        transform = transform.slice(7,transform.length);
        middleRotateX = parseFloat(transform.split(" ")[1]);
        middleRotateY = parseFloat(transform.split(",")[1].replace(")", ""));
        rotateAngle = parseFloat(transform.split(" ")[0]);
      }
      shape3 = this._isInRect(parseFloat(height), parseFloat(width), parseFloat(left), parseFloat(top), x, y, rotateAngle, middleRotateX, middleRotateY);
      i++;
    }

    //shape 4
    i = 0;
    let shape4 = false;
    while(!shape4 && i < this.RectListShape4.length){
      rotateAngle = 0;
      middleRotateX = null;
      middleRotateY = null;
      height = this.RectListShape4[i].getAttribute('width');
      width = this.RectListShape4[i].getAttribute('height');
      left = this.RectListShape4[i].getAttribute('x');
      top = this.RectListShape4[i].getAttribute('y');
      let transform = this.RectListShape4[i].getAttribute('transform');
      if(/rotate/.test(transform)){
        transform = transform.slice(7, transform.length);
        middleRotateX = parseFloat(transform.split(" ")[1]);
        middleRotateY = parseFloat(transform.split(",")[1].replace(")", ""));
        rotateAngle = parseFloat(transform.split(" ")[0]);
      }
      shape4 = this._isInRect(parseFloat(height), parseFloat(width), parseFloat(left), parseFloat(top), x, y, rotateAngle, middleRotateX, middleRotateY);
      i++;
    }


    return [shape1, shape2, shape3, shape4];

  }

   _isInRect(height, width, left, top, pointX, pointY, rotateAngle, middleRotateX, middleRotateY){
      
      const newPoint = this._rotatePoint(pointX, pointY, middleRotateX, middleRotateY, rotateAngle);

      if(newPoint[0] > parseInt(left) && newPoint[0] <(parseInt(left)+parseInt(height)) && newPoint[1] > top && newPoint[1] < (parseInt(top) + parseInt(width))){
        return true;
      }else{
        return false;
      }
   }

  _isInEllipse(middleX, middleY, radiusX, radiusY, pointX, pointY, rotateAngle, middleRotateX, middleRotateY){

    const newPoint = this._rotatePoint(pointX, pointY, middleRotateX, middleRotateY, rotateAngle);

    let a = radiusX;; 
    let b = radiusY; 
    const calc = ((Math.pow( (newPoint[0] - middleX), 2) ) / (Math.pow(a, 2))) + ((Math.pow((newPoint[1] - middleY), 2)) / (Math.pow(b, 2)));
    if(calc <= 1){
      return true;
    }else{
      return false;
    }
  }

  _rotatePoint(x, y, middleX, middleY, angle){
    let newAngle = angle * (3.14159265 / 180);
    let newX = (x - middleX) * Math.cos(newAngle) + (y - middleY) * Math.sin(newAngle);
    let newY = -1 * (x - middleX) * Math.sin(newAngle) + (y - middleY) * Math.cos(newAngle);
    newX += middleX;
    newY += middleY;
    return [newX, newY];
  }

/* ------------------------------------------SON--------------------------------------------- */

  
  _createSonorWorld(){

    //Grain
    this.grain = new MyGrain();
    scheduler.add(this.grain);
    this.grain.connect(audioContext.destination);
    const bufferAssocies = [5, 7, 9];
    const markerAssocies = [6, 8, 10];

    //Segmenter
    for(let i = 0; i < this.nbPath; i++){
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
      this.segmenterGainGrain[i].gain.setValueAtTime(0, audioContext.currentTime);
      this.segmenterGain[i].gain.setValueAtTime(0, audioContext.currentTime);
      this.segmenterGainGrain[i].connect(this.grain.input);
      this.segmenterGain[i].connect(audioContext.destination);
      this.segmenter[i].connect(this.segmenterGain[i]);
      this.segmenter[i].connect(this.segmenterGainGrain[i]);
      this._startSegmenter(i);

    }

    for(let i = 0; i < this.totalElements; i++){

      //create direct gain
      this.gainsDirections[i] = 'down';
      this.gains[i] = audioContext.createGain();
      this.gains[i].gain.value = 0;
      this.gains[i].connect(this.grain.input);

      //create grain gain
      this.sources[i] = audioContext.createBufferSource();
      this.sources[i].buffer = this.loader.buffers[i % 5];
      this.sources[i].connect(this.gains[i]);
      this.sources[i].loop = true;
      this.sources[i].start();

    }

    this.gainOutputDirect = audioContext.createGain();
    this.gainOutputDirect.gain.value = 0;
    this.gainOutputDirect.connect(audioContext.destination);
    this.gainOutputGrain = audioContext.createGain();
    this.gainOutputGrain.gain.value = 0;
    this.gainOutputGrain.connect(this.grain.input);


    for(let i = 0 ; i < this.nbShape ; i++){

      //create direct gain
      this.gainsShape[i] = audioContext.createGain();
      this.gainsShape[i].gain.value = 0;
      this.gainsShape[i].connect(this.gainOutputDirect);

      //create grain gain
      this.gainsGrainShape[i] = audioContext.createGain();
      this.gainsGrainShape[i].gain.value = 0;
      this.gainsGrainShape[i].connect(this.gainOutputGrain);

      //sonor src
      this.soundShape[i] = audioContext.createBufferSource();
      this.soundShape[i].buffer = this.loader.buffers[10 + (i + 1)];
      this.soundShape[i].connect(this.gainsShape[i]);
      this.soundShape[i].connect(this.gainsGrainShape[i]);
      this.soundShape[i].loop = true;
      this.soundShape[i].start();

    }
     
  }


  _startSegmenter(i){
    this.segmenter[i].trigger();
    let newPeriod = parseFloat(this.loader.buffers[6 + (i * 2)]['duration'][this.segmenter[i].segmentId]) * 1000;
    setTimeout( () => {this._startSegmenter(i);} , 
    newPeriod);
  }

  _updateGain(tabInLayer){
    for(let i = 0; i < tabInLayer.length; i++){
      if(this.gains[i].gain.value == 0 && tabInLayer[i] && this.gainsDirections[i] == 'down'){
        let actual = this.gains[i].gain.value;
        this.gains[i].gain.cancelScheduledValues(audioContext.currentTime);
        this.gains[i].gain.setValueAtTime(actual, audioContext.currentTime);
        this.gains[i].gain.linearRampToValueAtTime(0.24, audioContext.currentTime + 2.3);
        this.gainsDirections[i] = 'up';
      }else if(this.gains[i].gain.value != 0 && !tabInLayer[i] && this.gainsDirections[i] == 'up'){
        let actual = this.gains[i].gain.value;
        this.gains[i].gain.cancelScheduledValues(audioContext.currentTime);
        this.gains[i].gain.setValueAtTime(actual, audioContext.currentTime);
        this.gains[i].gain.linearRampToValueAtTime(0, audioContext.currentTime + 3.5);
        this.gainsDirections[i] = 'down';
      }
    }
  }

  _updateAudioPath(i){
    if(this.tabPath[i]){
      let actual1 = this.segmenterGain[i].gain.value;
      let actual2 = this.segmenterGainGrain[i].gain.value;
      this.segmenterGain[i].gain.cancelScheduledValues(audioContext.currentTime);
      this.segmenterGainGrain[i].gain.cancelScheduledValues(audioContext.currentTime);
      this.segmenterGain[i].gain.setValueAtTime(actual1,audioContext.currentTime);
      this.segmenterGainGrain[i].gain.setValueAtTime(actual2,audioContext.currentTime);
      this.segmenterGainGrain[i].gain.linearRampToValueAtTime(0, audioContext.currentTime + 1);
      this.segmenterGain[i].gain.linearRampToValueAtTime(0.25, audioContext.currentTime + 0.6);
    }else{
      let actual1 = this.segmenterGain[i].gain.value;
      let actual2 = this.segmenterGainGrain[i].gain.value;
      this.segmenterGain[i].gain.cancelScheduledValues(audioContext.currentTime);
      this.segmenterGainGrain[i].gain.cancelScheduledValues(audioContext.currentTime);
      this.segmenterGain[i].gain.setValueAtTime(actual1, audioContext.currentTime);
      this.segmenterGainGrain[i].gain.setValueAtTime(actual2, audioContext.currentTime);
      if(this.endStartSegmenter[i]){
        this.segmenterGainGrain[i].gain.linearRampToValueAtTime(actual1 + 0.15, audioContext.currentTime + 0.1);
        setTimeout( ()=>{
          this.segmenterGainGrain[i].gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.3);         
        }
        , 2000);
        this.segmenterGain[i].gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.4);
      }else{
        this.endStartSegmenter[i] = true;
      }
    }
  }

  _updateAudioshape(id){
    
    //shape1
    if(id == 0 && this.tabShape[id]){
      let gainGrain = 1 - (this.rampShape["shape1"] / 1000);
      let gainDirect = this.rampShape["shape1"] / 1000;
      if(gainDirect < 0){
        gainDirect = 0;
      }else if(gainDirect > 1){
        gainDirect = 1;
      }
      if(gainGrain < 0){
        gainGrain = 0;
      }else if(gainGrain > 1){
        gainGrain = 1;
      }
      if(this.tabShape[id]){
        this.gainsShape[id].gain.linearRampToValueAtTime(gainDirect, audioContext.currentTime + 0.01);
        this.gainsGrainShape[id].gain.linearRampToValueAtTime(gainGrain, audioContext.currentTime + 0.01);
      }
    }

    //shape2
    if(id == 1 && this.tabShape[id]){
      let gainGrain = 1 - (this.rampShape["shape2"] / 1000);
      let gainDirect = this.rampShape["shape2"] / 1000;
      if(gainDirect < 0){
        gainDirect = 0;
      }else if(gainDirec > 1){
        gainDirect = 1;
      }
      if(gainGrain < 0){
        gainGrain = 0;
      }else if(gainGrain > 1){
        gainGrain = 1;
      }
      if(this.tabShape[id]){
        this.gainsShape[id].gain.linearRampToValueAtTime(gainDirect, audioContext.currentTime + 0.01);
        this.gainsGrainShape[id].gain.linearRampToValueAtTime(gainGrain, audioContext.currentTime + 0.01);
      }
    }

    //shape3
    if(id == 2 && this.tabShape[id]){
      let gainGrain = 1 - (this.rampShape["shape3"] / 1000);
      let gainDirect = this.rampShape["shape3"] / 1000;
      if(gainDirect < 0){
        gainDirect = 0;
      }else if(gainDirect > 1){
        gainDirect = 1;
      }
      if(gainGrain < 0){
        gainGrain = 0;
      }else if(gainGrain > 1){
        gainGrain = 1;
      }
      if(this.tabShape[id]){
        this.gainsShape[id].gain.linearRampToValueAtTime(gainDirect, audioContext.currentTime + 0.01);
        this.gainsGrainShape[id].gain.linearRampToValueAtTime(gainGrain, audioContext.currentTime + 0.01);
      }
    }
    
    //shape4
    if(id == 3 && this.tabShape[id]){
      let gainGrain = 1 - (this.rampShape["shape4"] / 1000);
      let gainDirect = this.rampShape["shape4"] / 1000;
      if(gainDirect < 0){
        gainDirect = 0;
      }else if(gainDirect > 1){
        gainDirect = 1;
      }
      if(gainGrain < 0){
        gainGrain = 0;
      }else if(gainGrain > 1){
        gainGrain = 1;
      }
      if(this.tabShape[id]){
        this.gainsShape[id].gain.linearRampToValueAtTime(gainDirect, audioContext.currentTime + 0.01);
        this.gainsGrainShape[id].gain.linearRampToValueAtTime(gainGrain, audioContext.currentTime + 0.01);
      }
    }

    if(!this.tabShape[0] && (this.tabShape[0] != this.oldShape[0])){
      this.gainsShape[0].gain.linearRampToValueAtTime(0, audioContext.currentTime + 1.5);
      this.gainsGrainShape[0].gain.linearRampToValueAtTime(0, audioContext.currentTime + 1.5);
    }
    if(!this.tabShape[1] && (this.tabShape[1] != this.oldShape[1])){
      this.gainsShape[1].gain.linearRampToValueAtTime(0, audioContext.currentTime + 1.5);
      this.gainsGrainShape[1].gain.linearRampToValueAtTime(0, audioContext.currentTime + 1.5);
    }
    if(!this.tabShape[2] && (this.tabShape[2] != this.oldShape[2])){
      this.gainsShape[2].gain.linearRampToValueAtTime(0, audioContext.currentTime + 1.5);
      this.gainsGrainShape[2].gain.linearRampToValueAtTime(0, audioContext.currentTime + 1.5);
    }
    if(!this.tabShape[3] && (this.tabShape[3] != this.oldShape[3])){
      this.gainsShape[3].gain.linearRampToValueAtTime(0, audioContext.currentTime + 1.5);
      this.gainsGrainShape[3].gain.linearRampToValueAtTime(0, audioContext.currentTime + 1.5);
    }

    this.oldShape = [this.tabShape[0],this.tabShape[1],this.tabShape[2],this.tabShape[3]];

    if(this.tabShape[0] || this.tabShape[1] || this.tabShape[2] || this.tabShape[3]){
      this.decoder.reset();
    }

  }


  /* -----------------------------------------XMM----------------------------------------------- */

  _setModel(model,model1,model2){
    this.decoder.setModel(model);
    this.modelOK = true;
  }

  _processProba(){    
    let probaMax = this.decoder.getProba();
    // //Path
    for(let i = 0 ; i < this.nbPath ; i ++){
      this.segmenter[i].segmentId = Math.trunc(Math.random() * this.qtRandom);
      if(this.tabPath[i] != this.oldTabPath[i]){
         this._updateAudioPath(i);
      }
      this.oldTabPath[i] = this.tabPath[i];
    }

    //Shape
    let direct = false;
    let i = 0;
    while( !direct && (i < this.nbShape) ){
      if(this.tabShape[i]){
        direct = true;
      }
      i++
    }

   let actual1 = this.gainOutputDirect.gain.value;
   let actual2 = this.gainOutputGrain.gain.value;

    if(direct != this.old){
      if(direct){
        this.gainOutputDirect.gain.cancelScheduledValues(audioContext.currentTime);
        this.gainOutputDirect.gain.setValueAtTime(actual1, audioContext.currentTime);
        this.gainOutputDirect.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + 2);
        this.gainOutputGrain.gain.cancelScheduledValues(audioContext.currentTime);
        this.gainOutputGrain.gain.setValueAtTime(actual1, audioContext.currentTime);
        this.gainOutputGrain.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + 2);
        this.rampShape['shape1'] = 0;
        this.rampShape['shape2'] = 0;
        this.rampShape['shape3'] = 0;
        this.rampShape['shape4'] = 0;
      }else{
        this.gainOutputDirect.gain.cancelScheduledValues(audioContext.currentTime);
        this.gainOutputDirect.gain.setValueAtTime(actual1, audioContext.currentTime);
        this.gainOutputDirect.gain.linearRampToValueAtTime(0, audioContext.currentTime + 2);
        this.gainOutputGrain.gain.cancelScheduledValues(audioContext.currentTime);
        this.gainOutputGrain.gain.setValueAtTime(actual1, audioContext.currentTime);
        this.gainOutputGrain.gain.linearRampToValueAtTime(0, audioContext.currentTime + 2);
      }
    }

    this.old = direct;

    if(direct){

      for(let i = 0; i<this.nbShape ; i++){
        if(probaMax=='shape1'){
          this.rampShape['shape2']--;
          this.rampShape['shape3']--;
          this.rampShape['shape4']--;
        }else if(probaMax == 'shape2'){
          this.rampShape['shape1']--;
          this.rampShape['shape3']--;
          this.rampShape['shape4']--;
        }else if(probaMax == 'shape3'){
          this.rampShape['shape1']--;
          this.rampShape['shape2']--;
          this.rampShape['shape4']--;
        }else if(probaMax == 'shape4'){
          this.rampShape['shape1']--;
          this.rampShape['shape2']--;
          this.rampShape['shape3']--;
        }else if(probaMax == null){
          this.rampShape['shape1']--;
          this.rampShape['shape2']--;
          this.rampShape['shape3']--;
          this.rampShape['shape4']--;
        }

        this.rampShape[probaMax]++;

        if(this.rampShape['shape1'] < 0) this.rampShape['shape1'] = 0;
        if(this.rampShape['shape2'] < 0) this.rampShape['shape2'] = 0;
        if(this.rampShape['shape3'] < 0) this.rampShape['shape3'] = 0;
        if(this.rampShape['shape4'] < 0) this.rampShape['shape4'] = 0;
      }

    }

    for(let i = 0 ; i < this.nbShape ; i++){
      this._updateAudioShape(i);
    }

  }

}
