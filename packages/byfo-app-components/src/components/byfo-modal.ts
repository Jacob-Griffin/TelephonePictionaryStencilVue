import { LitElement, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { html } from '../utils/byfoHtml';

import buttonStyles from '../styles/button.style.ts';
import { applicationRules } from '@byfo/themes';
import { ByfoIcon } from './functional/Icon.ts';
import { createRef, ref, Ref } from 'lit/directives/ref.js';

@customElement('byfo-modal')
export default class BYFOModal extends LitElement {
  #dialog: Ref<HTMLDialogElement> = createRef();
  get dialog() {
    return this.#dialog.value;
  }
  openModal = () => {
    this.dialog?.showModal();
  };
  closeModal = () => {
    this.dialog?.close();
  };

  backdropCloseModal = (e: PointerEvent) => {
    const bbox = this.dialog!.getBoundingClientRect();
    if (e.clientX > bbox.right || e.clientX < bbox.left || e.clientY > bbox.bottom || e.clientY < bbox.top) {
      this.closeModal();
    }
  };

  render() {
    return html`<button @click=${this.openModal}><slot name="buttontext"></slot></button>
      <dialog ${ref(this.#dialog)} @click=${this.backdropCloseModal}>
        <button @click=${this.closeModal} class="close-button">${ByfoIcon('x')}</button><slot name="content"></slot>
      </dialog>`;
  }

  static styles = [
    css`
      dialog {
        position: relative;
        min-height: 10rem;
        min-width: 14rem;
        width: fit-content;
        height: fit-content;
        max-height: 80vh;
        max-width: 80vw;
        border: none;
        border-radius: 1rem;
        background-color: var(--byfo-color-background);
        box-shadow: 0 0 2rem 0.5rem #0005;
        padding: 1.5rem 3rem;
        &::backdrop {
          background-color: #14111480;
        }
      }
      .close-button {
        position: absolute;
        top: 1rem;
        right: 1rem;
        height: 2rem;
        width: 2rem;
        padding: 0;
        background: none;
        &:hover {
          background: none;
        }
      }
    `,
    buttonStyles,
    applicationRules,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    'byfo-modal': BYFOModal;
  }
}
