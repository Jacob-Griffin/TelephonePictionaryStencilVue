export class BYFOCanvasState {
  #context: CanvasRenderingContext2D;
  #box: DOMRect;
  #height: number;
  #width: number;

  constructor(context: CanvasRenderingContext2D, box: DOMRect, { internalWidth, internalHeight }: { internalWidth: number; internalHeight: number }) {
    this.#context = context;
    this.#box = box;
    this.#height = internalHeight;
    this.#width = internalWidth;
  }

  setBox(newBox: DOMRect) {
    this.#box = newBox;
  }

  transformScreenPoint(e: { screenX: number; screenY: number }) {
    const relativeX = e.screenX - this.#box.left;
    const relativeY = e.screenY - this.#box.top;
    const x = relativeX * (this.#width / this.#box.width);
    const y = relativeY * (this.#height / this.#box.height);
    return { x, y };
  }

  public async getImage() {
    this.redraw();
    const data = this.#context.getImageData(0, 0, this.#width, this.#height);
    const canvas = new OffscreenCanvas(this.#width, this.#height);
    canvas.getContext('2d').putImageData(data, 0, 0);
    return await canvas.convertToBlob();
  }

  /**
   * Clears the image and recrates it from path data, to ensure there are no canvas abnormalities
   */
  redraw() {}
}
