import * as soundworks from 'soundworks/client';
import Record from './Record.js';

const audioContext = soundworks.audioContext;

class ShapeDesignerView extends soundworks.View{

  constructor(template, content, events, options) {
    super(template, content, events, options);
  }

  onClick(callback){
    this.installEvents({
      'click svg': callback
    });
  }

}

const view = ``


// this experience plays a sound when it starts, and plays another sound when
// other clients join the experience
export default class ShapeDesignerExperience extends soundworks.Experience {
  constructor(assetsDomain) {
    super();

    //Services
    this.platform = this.require('platform', { features: ['web-audio', 'wake-lock'] });
    this.motionInput = this.require('motion-input', { descriptors: ['orientation'] });
    this.label = '';
    this.startOK = false;

  }

  init() {
    // initialize the view
    this.viewTemplate = view;
    this.viewContent = {};
    this.viewCtor = ShapeDesignerView;
    this.viewOptions = { preservePixelRatio: true };
    this.view = this.createView();

    // params 
    this.mirrorBallX = 250;
    this.mirrorBallY = 250;
    this.offsetX = 0;
    this.offsetY = 0;

    // bind
    this._toMove = this._toMove.bind(this);
    this._myListener= this._myListener.bind(this);
    this._onClick = this._onClick.bind(this);
    this._addBall = this._addBall.bind(this);
    this._addRect = this._addRect.bind(this);
    this._addShape = this._addShape.bind(this);

    // events
    this.view.onClick(this._onClick);

    // receives
    this.receive( 'shape', (shape, label) => this._addShape(shape, label) );

 }

  start() {

    if(!this.startOK){
      super.start(); // don't forget this

      if (!this.hasStarted)
        this.init();
      this.show();
      document.body.style.overflow = "hidden";
    }else{

      //params      
      this.middleX = window.innerWidth/2;
      this.middleY = window.innerHeight/2;
      this.windowSizeX = window.innerWidth;
      this.windowSizeY = window.innerHeight;
      this.windowMiddleX = this.windowSizeX/2;
      this.windowMiddleY = this.windowSizeY/2;
      this.svgMaxX = document.getElementsByTagName('svg')[0].getAttribute('width');
      this.svgMaxY = document.getElementsByTagName('svg')[0].getAttribute('height');

      setTimeout( () => { this._myListener(100) }, 100);


      this._addBall(100,100);
      this._addRect(); 

      if (this.motionInput.isAvailable('orientation')) {
        this.motionInput.addListener('orientation', (data) => {

          // New values
          const newValues = this._toMove(data[2], data[1] - 25);
          this._moveScreenTo(newValues[0], newValues[1], 0.08);

          // XMM
          this.record.process(newValues[0], newValues[1]);

        });
      } else {
        console.log("Orientation non disponible");
      }
    }

  }

  /* click Callback */
  _onClick(){
    if(!this.onRecord){

      document.getElementById("shape").setAttribute("fill", "red");
      this.onRecord = true;
      this.record.startRecord();

    }else{

      document.getElementById("shape").setAttribute("fill", "black");
      this.onRecord = false;
      this.record.stopRecord(this);

    }
  }

  /* add shape */
  _addShape(shape, label){

    const parser = new DOMParser();

    let shapeXml = parser.parseFromString(shape, 'application/xml');
    shapeXml = shapeXml.getElementsByTagName('svg')[0];

    document.getElementById('experience').appendChild(shapeXml);
    document.getElementsByTagName('svg')[0].setAttribute('id', 'svgElement');

    this.startOK = true;
    this.label = label;

    //XMM-lfo
    this.record = new Record(this.label);
    this.onRecord = false;

    this.start();

  }


  /* add Ball */
  _addBall(x,y){

    const elem = document.createElementNS('http://www.w3.org/2000/svg','circle');

    elem.setAttributeNS(null, "cx", x);
    elem.setAttributeNS(null, "cy", y);
    elem.setAttributeNS(null, "r", 10);
    elem.setAttributeNS(null, "stroke", 'white');
    elem.setAttributeNS(null, "stroke-width", 3);
    elem.setAttributeNS(null, "fill", 'black');
    elem.setAttributeNS(null, "id", 'ball');

    document.getElementsByTagName('g')[0].appendChild(elem);

  }

  /* Add background */
  _addRect(){

    const svgElement = document.getElementsByTagName('svg')[0];
    const newRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    let x = svgElement.getAttribute('width');
    let y = svgElement.getAttribute('height');

    newRect.setAttributeNS(null, 'width', x);
    newRect.setAttributeNS(null, 'height', y);
    newRect.setAttributeNS(null, 'x', 0);
    newRect.setAttributeNS(null, 'y', 0);
    newRect.setAttributeNS(null, 'id', 'shape');

    svgElement.insertBefore(newRect, svgElement.firstChild);

  }

  /* Calculate new position of the ball */
  _toMove(valueX, valueY){

    const obj = this.view.$el.querySelector('#ball');

    // position X
    let actu = this.mirrorBallX + valueX * 0.3;
    if(actu < this.offsetX){
      actu = this.offsetX ;
    }else if( actu > (this.windowSizeX + this.offsetX) ){
      actu = this.windowSizeX + this.offsetX;
    }
    obj.setAttribute('cx', actu);
    this.mirrorBallX = actu;
    const newX = actu;

    // position Y
    actu = this.mirrorBallY + valueY * 0.3;
    if(actu < (this.offsetY)){
      actu = this.offsetY;
    }
    if(actu > (this.windowSizeY + this.offsetY)){
      actu = this.windowSizeY + this.offsetY;
    }
    obj.setAttribute('cy', actu);
    this.mirrorBallY = actu;
    const newY = actu;

    return [newX, newY];
  }

  // Move the screen
  _moveScreenTo(x, y, force=1){

    let indicePowX = 3;
    let indicePowY = 3;

    // X
    let distanceX = (x - this.offsetX) - this.windowMiddleX;
    let negX = false;
    if(distanceX < 0){
      negX = true;
    }
    distanceX = Math.pow( ( Math.abs(distanceX / this.windowMiddleX) ), indicePowX ) * this.windowMiddleX; 

    if(negX){
      distanceX *= -1;
    }

    if(this.offsetX + (distanceX * force) >= 0 && ( this.offsetX + (distanceX * force) <= this.svgMaxX - this.windowSizeX ) ){
      this.offsetX += (distanceX * force);
    }

    // Y
    let distanceY = (y - this.offsetY) - this.windowMiddleY;
    let negY = false;
    if(distanceY < 0){
      negY = true;
    }
    distanceY = Math.pow( (Math.abs(distanceY / this.windowMiddleY) ), indicePowY ) * this.windowMiddleY;

    if(negY){
      distanceY *= -1;
    }

    if( (this.offsetY + (distanceY * force) >= 0) && (this.offsetY + (distanceY * force) <= this.svgMaxY - this.windowSizeY) ){
      this.offsetY += (distanceY * force);
    }

    //actualisation
    window.scroll(this.offsetX, this.offsetY);

  }

  _myListener(time){
    this.windowSizeX = window.innerWidth;
    this.windowSizeY = window.innerHeight;
    setTimeout(this._myListener, time);
  }

}
