import { Component, Element, h, Method, Prop } from '@stencil/core';

@Component({
  tag: 'tp-canvas',
  styleUrl: 'tp-canvas.css',
  shadow: true,
})
export class TpCanvas {
  //Configurable Properties
  @Prop() height = 600;
  @Prop() width = 1000;
  @Prop() hostEl: HTMLElement;

  //Static Properties (elements and such)
  @Element() el: HTMLElement;
  canvasElement;
  ctx;

  lineWidthSets = {
    draw: {
      small: 5,
      medium: 8,
      large: 12,
      xlarge: 18,
    },
    erase: {
      small: 8,
      medium: 11,
      large: 15,
      xlarge: 21,
    },
  };

  lineWidths = this.lineWidthSets.draw;

  //Canvas State
  currentPath; //The current line that's actively being drawn               :(Path2D)
  paths = []; //List of paths drawn (support for undo/redo)                :(Path2D[])
  redoStack = []; //Stack of paths that were undone (clears on new path drawn) :(Path2D[])
  currentWidth = 'small'; //Current Pen Size                                           :(String)

  componentDidRender() {
    //Set up the canvas context now that the canvas exists
    this.setupContext();

    //Listen for the controller buttons to say anything (Should have shared parent)
    this.hostEl.addEventListener('undo-input', this.undo);
    this.hostEl.addEventListener('redo-input', this.redo);
    this.hostEl.addEventListener('size-input', this.changeLine);
    this.hostEl.addEventListener('clear-input', this.clearCanvas);
    this.hostEl.addEventListener('pen-input', () => this.setDrawMode('#000'));
    this.hostEl.addEventListener('eraser-input', () => this.setDrawMode('#FFF'));

    //Listen for drawing-related events (Listen to full document for finishes):

    //Start drawing when their pen comes down onto the canvas
    this.canvasElement.addEventListener('pointerdown', this.startDraw);

    //Continue the line when the pointer moves (anywhere)
    document.addEventListener('pointermove', this.draw);

    //Stop drawing if the pointer stops for any reason (anywhere)
    document.addEventListener('pointerup', this.finishLine);
    document.addEventListener('pointercancel', this.finishLine);

    //Note, leaving the canvas area DOES NOT stop the line.

    //Stop right click menu
    this.el.addEventListener('contextmenu', e => e.preventDefault());
  }

  disconnectedCallback() {
    this.hostEl.removeEventListener('redo-input', this.redo);
    this.hostEl.removeEventListener('size-input', this.changeLine);
    this.hostEl.removeEventListener('undo-input', this.undo);
    this.hostEl.removeEventListener('clear-input', this.clearCanvas);
    this.hostEl.removeEventListener('pen-input', () => this.setDrawMode('#000'));
    this.hostEl.removeEventListener('eraser-input', () => this.setDrawMode('#FFF'));
    document.removeEventListener('pointermove', this.draw);
    document.removeEventListener('pointercancel', this.finishLine);
    document.removeEventListener('pointerup', this.finishLine);
  }

  setupContext() {
    this.ctx = this.canvasElement.getContext('2d');
    this.ctx.strokeStyle = 'rgb(0,0,0)';
    this.ctx.fillStyle = 'rgb(255,255,255)';
    this.ctx.lineWidth = this.lineWidths.small;
    this.currentWidth = 'small';
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';

    this.ctx.fillRect(0, 0, this.width, this.height); //Background
  }

  startDraw = event => {
    //We only want to start a line if there already isn't a line
    if (this.currentPath == undefined) {
      const point = this.transformCoordinates(event);
      this.currentPath = new Path2D();
      this.currentPath.moveTo(...point);
    }
  };

  draw = event => {
    //We only want to continue drawing if we've already started a line
    if (this.currentPath != undefined) {
      const point = this.transformCoordinates(event);
      this.currentPath.lineTo(...point);
      this.ctx.stroke(this.currentPath);
    }
    return true;
  };

  finishLine = event => {
    //Only add the path if there is one
    if (this.currentPath != undefined) {
      this.draw(event);
      //Push the current Path to the path list and final drawing
      this.paths.push({ path: this.currentPath, size: this.ctx.lineWidth, color: this.ctx.strokeStyle });

      this.currentPath = undefined;

      if (!event.fromRedo) {
        this.redoStack = [];
      }
    }
  };

  redo = () => {
    if (this.redoStack.length > 0) {
      let currentItem = this.redoStack.pop();
      if (currentItem.clear != undefined) {
        let backupFill = this.ctx.fillStyle;
        this.clearCanvas({ detail: { color: currentItem.clear }, fromRedo: true });
        this.ctx.fillStyle = backupFill;
      } else {
        let backupWidth = this.ctx.lineWidth;
        let backupColor = this.ctx.strokeStyle;

        this.currentPath = currentItem.path;
        this.ctx.lineWidth = currentItem.size;
        this.ctx.strokeStyle = currentItem.color;
        this.finishLine({ fromRedo: true });

        this.ctx.lineWidth = backupWidth;
        this.ctx.strokeStyle = backupColor;
      }
    }
  };

  undo = () => {
    if (this.paths.length == 0) {
      return;
    }
    this.redoStack.push(this.paths.pop());

    let currentStroke = this.ctx.strokeStyle;

    let backupFill = this.ctx.fillStyle;
    this.ctx.fillStyle = '#FFF';
    this.ctx.fillRect(0, 0, this.width, this.height);

    for (let i = 0; i < this.paths.length; i++) {
      if (this.paths[i].clear != undefined) {
        this.ctx.fillStyle = this.paths[i].clear;
        this.ctx.fillRect(0, 0, this.width, this.height);
      } else {
        this.ctx.lineWidth = this.paths[i].size;
        this.ctx.strokeStyle = this.paths[i].color;
        this.ctx.stroke(this.paths[i].path);
      }
    }

    this.ctx.fillStyle = backupFill;
    this.ctx.lineWidth = this.lineWidths[this.currentWidth];
    this.ctx.strokeStyle = currentStroke;
  };

  clearCanvas = event => {
    this.ctx.fillStyle = event.detail.color;
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.paths.push({ clear: event.detail.color });
    if (!event.fromRedo) {
      this.redoStack = [];
    }
  };

  changeLine = event => {
    //As long as the width we were sent is in the list of widths,
    if (Object.keys(this.lineWidths).includes(event.detail.newSize)) {
      //Set the canvas width to the corresponding size
      this.currentWidth = event.detail.newSize;
      this.ctx.lineWidth = this.lineWidths[event.detail.newSize];
    }
  };

  setDrawMode = color => {
    //Set the pen color for draw/erase
    this.ctx.strokeStyle = color;

    //Change the line width and width set based on the new mode
    if (color == '#FFF') {
      this.lineWidths = this.lineWidthSets.erase;
    } else {
      this.lineWidths = this.lineWidthSets.draw;
    }
    this.ctx.lineWidth = this.lineWidths[this.currentWidth];
  };

  transformCoordinates(event): [number, number] {
    //Convert screen coordinates to canvas coordinates (Offset by box position, scale by width difference)
    let box = this.canvasElement.getBoundingClientRect();
    return [((event.clientX - box.left) * this.width) / box.width, ((event.clientY - box.top) * this.height) / box.height];
  }

  isBlankCanvas(){
    let foundColor = undefined;
    //It's *not* blank if we can find more than one color on it
    const notBlank = this.ctx.getImageData(0,0,this.canvasElement.width,this.canvasElement.height).data.some(color => {
      if(foundColor && color != foundColor){
        return true;
      }
      foundColor = color;
      return false;
    });

    return !notBlank;
  }

  @Method() exportDrawing() {
    const blankPromise = new Promise(callback => callback(""));
    //If there are no paths, guaranteed blank
    if(!(this.paths?.length > 0)){
      return blankPromise;
    }
    
    const lastPath = this.paths.pop();
    this.paths.push(lastPath);

    if(lastPath.clear){
      //If the last thing was a clear action, guaranteed blank
      return blankPromise;
    }

    //If we haven't shortcutted the blank status, double check if it's blank or not on color data
    if(this.isBlankCanvas()){
      return blankPromise;
    }
    return new Promise(callback => {
      this.canvasElement.toBlob(callback, 'image/png');
    });
  }

  render() {
    return <canvas class="border border-slate-500 rounded-lg w-full" height={this.height} width={this.width} ref={el => (this.canvasElement = el as HTMLElement)}></canvas>;
  }
}
