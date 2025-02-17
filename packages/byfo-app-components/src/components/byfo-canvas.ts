import { LitElement, PropertyValues, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { createRef, ref, Ref } from 'lit/directives/ref.js';
import { BYFOCanvasState } from 'byfo-utils';

const internalWidth = 1000;
const internalHeight = 600;

@customElement('byfo-canvas')
export default class BYFOCanvas extends LitElement {
  #canvas: Ref<HTMLCanvasElement> = createRef();
  get canvas() {
    return this.#canvas.value!;
  }
  #ctx: CanvasRenderingContext2D | null = null;
  box?: DOMRect;
  state?: BYFOCanvasState;

  protected firstUpdated(_changedProperties: PropertyValues): void {
    this.#ctx = this.canvas.getContext('2d');
    if (!this.#ctx) {
      throw new Error('Canvas context was not properly started');
    }
    this.box = this.canvas.getBoundingClientRect();
    this.state = new BYFOCanvasState(this.#ctx, this.box, { internalHeight, internalWidth });
  }

  render() {
    return html`<canvas width=${internalWidth} height=${internalHeight} ${ref(this.#canvas)}></canvas>`;
  }

  static styles = [
    css`
      canvas {
        width: ${internalWidth}px;
        max-width: 100%;
        aspect-ratio: ${internalWidth} / ${internalHeight};
        border-radius: var(--border-radius-sm, 0.5rem);
        border: solid 1px var(--byfo-border, rgb(100, 116, 139));
      }
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    'byfo-canvas': BYFOCanvas;
  }
}
