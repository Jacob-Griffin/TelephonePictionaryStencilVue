import { Component, Element, h, Method, Prop } from '@stencil/core';

const numsToPathString = (path:number[][]) => {
  if(!path || !path.length){
    return '';
  }
  const strings = path.map(([x,y]) => `${x} ${y}`);
  return 'M '+strings.join(' L ');
}

type PathEntry = {
  path?:[number,number][],
  color?:string,
  size?:number,
  clear?:string;
}

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
  canvasElement: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;

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
  currentPath: [number,number][] = [];
  paths:PathEntry[] = []; //List of paths drawn (support for undo/redo)
  redoStack:PathEntry[] = []; //Stack of paths that were undone (clears on new path drawn)
  currentWidth = 'small'; //Current Pen Size
  canvasRect:DOMRect;
  scaleRatio:number // Cached value of bounding box width to internal width ratio
  lastDrawEnd:number;
  drawCount:number;
  debugInterval:NodeJS.Timeout;

  //#region setup
  componentDidLoad() {
    //Set up the canvas context now that the canvas exists
    this.setupContext();

    //Listen for the controller buttons to say anything (Should have shared parent)
    this.hostEl.addEventListener('undo-input', this.undo);
    this.hostEl.addEventListener('redo-input', this.redo);
    this.hostEl.addEventListener('size-input', this.changeLine);
    this.hostEl.addEventListener('clear-input', this.clearCanvas);
    this.hostEl.addEventListener('pen-input', () => this.setDrawMode('#000'));
    this.hostEl.addEventListener('eraser-input', () => this.setDrawMode('#FFF'));
    this.hostEl.addEventListener('invert-input', this.invert);

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
    
    //Add scale adjusters
    window.addEventListener('resize',this.adjustScale);
    this.adjustScale();
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
    window.removeEventListener('resize',this.adjustScale);
  }

  setupContext() {
    this.ctx = this.canvasElement.getContext('2d');
    this.ctx.strokeStyle = 'rgb(0,0,0)';
    this.ctx.fillStyle = 'rgb(255,255,255)';
    this.ctx.lineWidth = this.lineWidths.small;
    this.currentWidth = 'small';
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    this.ctx.fillRect(0, 0, this.width, this.height); //Background

    if (this.paths?.length > 0) {
      // If there was a restore backup call but the ctx wasn't loaded yet, catch up
      this.redraw();
    } else {
      // If this is a brand new canvas, make sure there's a clear event so that invert will work
      this.paths.push({clear: '#FFF'})
    }
  }
  //#endregion setup

  //#region drawing
  startDraw = event => {
    //We only want to start a line if there already isn't a line
    if (this.currentPath.length === 0) {
      this.canvasRect = this.canvasElement.getBoundingClientRect();
      const point = this.transformCoordinates(event);
      this.currentPath.push(point);
      if(window.location.hash === '#debug-count'){
        this.debugInterval = setInterval(()=> { console.log(`${this.drawCount} Draw events`); this.drawCount = 0},1000);
      }
    }
  };

  draw = event => {
    //We only want to continue drawing if we've already started a line
    if (this.currentPath.length > 0) {
      if(performance.now() - this.lastDrawEnd < 5){
        // There's a little bit of jitter with the mouse moves if they happen too quickly
        // Stop the event if it hasn't been a full rendered window frame
        return;
      }
      if(window.location.hash === '#debug-distance'){
        console.log(`${performance.now() - (this.lastDrawEnd ?? 0)}ms of empty space`); ///!!!!
      }
      let point = this.transformCoordinates(event);
      // Adjust the point just barely so it renders dots. This is fine unconditionally
      point[0] += 0.1;
      point[1] += 0.1;
      // This seems redundant to continually begin paths when paths don't really have to go away, but
      // This fixes a weird firefox bug with negligible performance impact, so might as well
      this.ctx.beginPath()
      this.ctx.moveTo(...this.currentPath.at(-1));
      this.currentPath.push(point);
      this.ctx.lineTo(...point);
      this.ctx.stroke();
      if(window.location.hash === '#debug-count'){
        this.drawCount += 1;
      }
      this.lastDrawEnd = performance.now();
    }
    return true;
  };

  finishLine = event => {
    //Only add the path if there is one
    if (this.currentPath.length > 0) {
      clearInterval(this.debugInterval);
      if (event.fromRedo) {
        const path = new Path2D(numsToPathString(this.currentPath));
        this.ctx.stroke(path);
      } else {
        this.draw(event);
      }
      //Push the current Path to the path list and final drawing
      this.paths.push({ path: this.currentPath, size: this.ctx.lineWidth, color: this.ctx.strokeStyle as string });

      this.currentPath = [];

      const backupEvent = new CustomEvent<string>('tp-canvas-line', { detail: JSON.stringify(this.paths) });
      this.hostEl.dispatchEvent(backupEvent);

      if (!event.fromRedo) {
        this.redoStack = [];
        this.redraw();
      }
    }
  };
  //#endregion drawing

  //#region undo-redo
  redo = () => {
    if (this.redoStack.length > 0 && this.currentPath.length === 0) {
      let currentItem = this.redoStack.pop();
      if (currentItem.clear) {
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
    if (this.paths.length == 0 || this.currentPath.length > 0) {
      return;
    }
    this.redoStack.push(this.paths.pop());

    const backupEvent = new CustomEvent<string>('tp-canvas-line', { detail: JSON.stringify(this.paths) });
    this.hostEl.dispatchEvent(backupEvent);

    this.redraw();
  };

  redraw = () => {
    let currentStroke = this.ctx.strokeStyle;
    let backupFill = this.ctx.fillStyle;

    this.ctx.fillStyle = '#FFF';
    this.ctx.fillRect(0, 0, this.width, this.height);

    for (let i = 0; i < this.paths.length; i++) {
      if (this.paths[i].clear) {
        this.ctx.fillStyle = this.paths[i].clear;
        this.ctx.fillRect(0, 0, this.width, this.height);
      } else if (this.paths[i].color) {
        this.ctx.lineWidth = this.paths[i].size;
        this.ctx.strokeStyle = this.paths[i].color;
        this.ctx.stroke(new Path2D(numsToPathString(this.paths[i].path)));
      }
    }

    this.ctx.fillStyle = backupFill;
    this.ctx.lineWidth = this.lineWidths[this.currentWidth];
    this.ctx.strokeStyle = currentStroke;
  };
  //#endregion undo-redo

  //#region handle inputs
  clearCanvas = event => {
    this.ctx.fillStyle = event.detail.color;
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.paths.push({ clear: event.detail.color });
    const backupEvent = new CustomEvent<string>('tp-canvas-line', { detail: JSON.stringify(this.paths) });
    this.hostEl.dispatchEvent(backupEvent);
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

  invert = () => {
    this.paths.forEach(path => {
      if(path.clear){
        path.clear = /f/i.test(path.clear) ? '#000' : '#FFF';
      } else {
        path.color = /f/i.test(path.color) ? '#000' : '#FFF';
      }
    });
    this.redraw();
  }
  //#endregion handle inputs

  transformCoordinates({clientX:mx,clientY:my}:PointerEvent): [number, number] {
    //Convert screen coordinates to canvas coordinates (Offset by box position, scale by width difference)
    const x = Math.round((mx - this.canvasRect.left) * this.width / this.canvasRect.width);
    const y = Math.round((my - this.canvasRect.top) * this.height / this.canvasRect.height);
    return [x, y];
  }

  isBlankCanvas() {
    let foundColor = undefined;
    //It's *not* blank if we can find more than one color on it
    const notBlank = this.ctx.getImageData(0, 0, this.canvasElement.width, this.canvasElement.height).data.some(color => {
      if (foundColor && color != foundColor) {
        return true;
      }
      foundColor = color;
      return false;
    });

    return !notBlank;
  }

  @Method() exportDrawing(): Promise<Blob> {
    const emptyPromise = new Promise<Blob>(resolve => resolve(new Blob()));
    //If there are no paths, guaranteed blank
    if (!(this.paths?.length > 0)) {
      return emptyPromise;
    }

    const lastPath = this.paths.pop();
    this.paths.push(lastPath);

    if (lastPath.clear) {
      //If the last thing was a clear action, guaranteed blank
      return emptyPromise;
    }

    //If we haven't shortcutted the blank status, double check if it's blank or not on color data
    if (this.isBlankCanvas()) {
      return emptyPromise;
    }

    return new Promise(callback => {
      this.canvasElement.toBlob(callback);
    });
  }

  @Method() restoreBackup(pathsString): Promise<void> {
    this.paths = JSON.parse(pathsString);
    if (this.ctx) {
      this.redraw();
    }
    return new Promise(() => {});
  }

  adjustScale = () => {
    const { width } = this.el.getBoundingClientRect();
    this.scaleRatio = width/this.width
    if(this.canvasElement){
      this.canvasElement.style['scale'] = `${this.scaleRatio}`;
    }
  }

  render() {
    if(!this.scaleRatio){
      this.adjustScale();
    }
    return <canvas height={this.height} width={this.width} style={{'scale':`${this.scaleRatio}`}} ref={el => (this.canvasElement = el)}></canvas>;
  }
}
