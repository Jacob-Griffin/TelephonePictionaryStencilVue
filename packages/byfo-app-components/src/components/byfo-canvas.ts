import { LitElement, PropertyValues, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { createRef, ref, Ref } from 'lit/directives/ref.js';
import { html } from '../utils/byfoHtml';
import { BYFOCanvasState } from 'byfo-utils';
import { map } from 'lit/directives/map.js';

import buttonStyles from '../styles/button.style.ts';
import { applicationRules } from '@byfo/themes';

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
    this.state.on('currentWidth', v => (this.currentWidth = v));
    this.state.on('mode', v => (this.mode = v));
    this.mode = this.state.mode;
    this.currentWidth = this.state.currentWidth;
    this.canvas.addEventListener('contextmenu', e => e.preventDefault());
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.state?.cleanupInputs();
  }

  static buttons: ControlButton[] = [
    {
      icon: 'pencil',
      state: 'mode::draw',
      action: 'setDrawMode',
      arg: 'draw',
    },
    {
      icon: 'eraser',
      state: 'mode::erase',
      action: 'setDrawMode',
      arg: 'erase',
    },
    {
      icon: 'squiggle-small',
      state: 'currentWidth::small',
      action: 'changeLine',
      arg: 'small',
    },
    {
      icon: 'squiggle-medium',
      state: 'currentWidth::medium',
      action: 'changeLine',
      arg: 'medium',
    },
    {
      icon: 'squiggle-large',
      state: 'currentWidth::large',
      action: 'changeLine',
      arg: 'large',
    },
    {
      icon: 'squiggle-xlarge',
      state: 'currentWidth::xlarge',
      action: 'changeLine',
      arg: 'xlarge',
    },
    {
      icon: 'trash',
      action: 'clearCanvas',
      class: 'important',
    },
    {
      icon: 'swap',
      action: 'invert',
      class: 'invert-button',
    },
  ];

  @state() currentWidth?: string;
  @state() mode?: string;

  buttonAction = (action: ControlButton['action'], arg: ControlButton['arg']) => {
    return () => {
      if (!action || !this?.state) {
        return;
      }
      const fn = this.state[action] as (arg?: unknown) => void;
      if (typeof fn === 'function') {
        if (fn.length >= 1) {
          fn(arg);
        } else {
          fn();
        }
      }
    };
  };

  renderButton = (button: ControlButton) => {
    const state = button.state?.split('::') as [keyof BYFOCanvas, string] | undefined;
    return html`<button @click=${this?.buttonAction(button.action, button.arg)} active=${(state && this?.[state[0]] === state[1]) || nothing} class=${button.class}>
      ${button.icon}
    </button>`;
  };

  renderControls = () => {
    const buttons = (this.constructor as typeof BYFOCanvas).buttons;
    return html`<section class="controls">${map(buttons, this.renderButton)}</section>`;
  };

  render() {
    return html`<canvas width=${internalWidth} height=${internalHeight} ${ref(this.#canvas)}></canvas>${this.renderControls()}`;
  }

  static styles = [
    css`
      :host {
        --button-size: 4rem;
        --gap-size: 1rem;
        --grid-size: 1fr calc((2 * var(--button-size)) + var(--gap-size));
        display: grid;
        grid-template-rows: var(--grid-size);
        column-gap: var(--gap-size);
        row-gap: var(--gap-size);
      }
      :host(.side-by-side) {
        grid-template-columns: var(--grid-size);
        grid-template-rows: unset;
        .controls {
          grid-template-columns: var(--button-size) var(--button-size);
          grid-template-rows: unset;
          grid-auto-flow: row;
        }
      }
      .controls {
        display: grid;
        grid-template-rows: var(--button-size) var(--button-size);
        grid-auto-columns: var(--button-size);
        grid-auto-rows: var(--button-size);
        grid-auto-flow: column;
        column-gap: var(--gap-size);
        row-gap: var(--gap-size);
        button {
          width: var(--button-size);
          height: var(--button-size);
        }
      }
      canvas {
        width: ${internalWidth}px;
        max-width: 100%;
        aspect-ratio: ${internalWidth} / ${internalHeight};
        border-radius: var(--border-radius-sm, 0.5rem);
        border: solid 1px var(--byfo-border, rgb(100, 116, 139));
      }
    `,
    buttonStyles,
    applicationRules,
  ];
}

interface ControlButton {
  icon: string;
  class?: string;
  state?: `${keyof BYFOCanvasState}::${string}`;
  action: keyof BYFOCanvasState;
  arg?: unknown;
}

declare global {
  interface HTMLElementTagNameMap {
    'byfo-canvas': BYFOCanvas;
  }
}
