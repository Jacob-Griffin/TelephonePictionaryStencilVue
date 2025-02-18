import { LitElement, PropertyValues, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { createRef, ref, Ref } from 'lit/directives/ref.js';
import { html } from '../utils/byfoHtml';
import { BYFOCanvasState } from 'byfo-utils';

const internalWidth = 1000;
const internalHeight = 600;

@customElement('byfo-canvas')
export default class BYFOCanvas extends LitElement {
  #canvas: Ref<HTMLCanvasElement> = createRef();
  get canvas() {
    return this.#canvas.value!;
  }
  box?: DOMRect;
  state?: BYFOCanvasState;

  @property() backupKey?: string;
  get backup() {
    if (this.backupKey) {
      return {
        set: (data: string) => {
          if (!data) {
            localStorage.removeItem(this.backupKey!);
          }
          localStorage.setItem(this.backupKey!, data);
        },
        get: () => localStorage.getItem(this.backupKey!),
      };
    } else {
      return {
        set: (_data: string) => void null,
        get: () => null,
      };
    }
  }

  protected firstUpdated(_changedProperties: PropertyValues): void {
    const backupdata = this.backup.get() ?? undefined;
    this.state = new BYFOCanvasState(this.canvas, { internalHeight, internalWidth }, backupdata);
    this.state.on('backup', this.backup.set);
    this.addEventListener('contextmenu', e => e.preventDefault());
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.state?.cleanupInputs();
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
