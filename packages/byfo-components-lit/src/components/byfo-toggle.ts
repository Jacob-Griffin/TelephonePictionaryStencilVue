import { css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { LitElement } from 'lit';
/**
 * Description of your element here. Use @ property doc tags to describe props
 */
@customElement('byfo-toggle')
export class ByfoToggle extends LitElement {
  @property({ attribute: 'name', type: String }) name: string = 'default';
  @property() checked: boolean = false;
  constructor() {
    super();
    console.log(this.checked);
  }
  connectedCallback(): void {
    super.connectedCallback();
    console.log(this.checked);
  }

  toggle() {
    this.checked = !this.checked;
    const e = new CustomEvent<boolean>('byfo-toggled', { detail: this.checked });
    this.dispatchEvent(e);
  }
  render() {
    return html`<div class=${`toggle-wrapper${this.checked ? ' checked' : ''}`} @click=${this.toggle}>
      <div class="toggle-handle"></div>
    </div>`;
  }
  static styles = css`
    :host {
      display: block;
    }
    .toggle-wrapper {
      height: 1.32rem;
      width: 2.3rem;
      position: relative;
      border-radius: 1rem;
      background-color: #777;
      cursor: pointer;

      &.checked {
        background-color: var(--color-brand);
        & > .toggle-handle {
          left: 1.15rem;
        }
      }
      & > .toggle-handle {
        display: block;
        position: absolute;
        cursor: pointer;
        top: 0.15rem;
        left: 0.15rem;
        transition: left 0.2s;
        background-color: var(--color-toggle-handle);
        z-index: 1;
        height: 1rem;
        width: 1rem;
        border-radius: 0.55rem;
      }
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'byfo-toggle': ByfoToggle;
  }
  interface ByfoToggleEventMap {
    'byfo-toggled': CustomEvent<ByfoToggle>;
  }
}
