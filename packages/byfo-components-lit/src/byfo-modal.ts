import { css, html } from 'lit';
import { property } from 'lit/decorators.js';
import { appStyles } from './common';
import { ByfoElement } from './byfo-element';

/**
 * Base class that defines a floating window that can be closed
 */
export class ByfoModal extends ByfoElement {
  @property({ reflect: true, attribute: 'modal-enabled', type: Boolean }) enabled: boolean = false;

  checkClose(e: PointerEvent) {
    const clicked = e.target as HTMLElement;
    if (clicked.classList.contains('background') || clicked.closest('.close')) {
      this.enabled = false;
    }
  }

  // Main section to be overridden by implementers
  renderBody() {
    return html``;
  }

  render() {
    return html` <section class="background" @click=${this.checkClose}>
      <article>
        <button class="close" @click=${this.checkClose}>
          <tp-icon icon="x"></tp-icon>
        </button>
        ${this.renderBody()}
      </article>
    </section>`;
  }

  static styles = css`
    ${appStyles}
    :host > section {
      width: 100vw;
      height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      position: fixed;
      top: 0;
      left: 0;

      background-color: rgba(0, 0, 0, 0.4);
    }
    :host > section > article {
      width: 90%;
      position: relative;
      height: fit-content;
      max-width: 960px;
      padding: 2rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      background-color: var(--color-background);
      border-color: var(--color-border);
      border: 1px;
      border-radius: 1rem;
    }

    :host h2:not(.label) {
      color: var(--color-heading);
      font-size: 2rem;
      font-weight: 600;
    }

    :host .close {
      position: absolute;
      cursor: pointer;
      color: var(--color-text);
      top: 1rem;
      right: 1.25rem;
      width: 2.25rem;
      height: 2.25rem;
      background-color: rgba(0, 0, 0, 0);
      border: none;
    }

    .main-action {
      margin-top: 2rem;
      margin-bottom: 2rem;
      &.short {
        margin-top: 0;
      }
    }

    :host {
      display: none;
      position: fixed !important;
      top: 0;
      left: 0;
    }

    :host([modal-enabled]) {
      display: block;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'byfo-modal': ByfoModal;
  }
}
