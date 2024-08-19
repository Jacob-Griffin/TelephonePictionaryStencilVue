import { LitElement, css, html } from 'lit-element';
import { customElement, property, state } from 'lit-element/decorators.js';
import { appStyles, TargetedInputEvent } from './common';
import { config } from 'byfo-utils';

/**
 * Description of your element here. Use @ property doc tags to describe props
 */
@customElement('byfo-time-input')
export class ByfoTimeInput extends LitElement {
  @state() timeError: string = '';
  @property({ reflect: true, attribute: 'init-value' }) value?: number;

  sendEvent() {
    const e = new CustomEvent('tp-time-input', {
      detail: {
        timeError: this.timeError,
        value: this.value,
      },
    });
    document.dispatchEvent(e);
  }

  handleInput(e: TargetedInputEvent) {
    const input = e.target.value;
    if (input.length === 0) {
      this.timeError = '';
      this.value = -1;
      return this.sendEvent();
    }
    if (!/^[0-9]+(\.[0-9]+)?$/.test(input) && !/^\.[0-9]+$/.test(input)) {
      this.timeError = 'Please enter a valid number';
      this.value = undefined;
      return this.sendEvent();
    }
    const minutes = parseFloat(input);
    if (minutes > config.maxRoundLength) {
      this.timeError = `Cannot add more than ${config.maxRoundLength} minutes`;
      this.value = undefined;
      return this.sendEvent();
    } else if (minutes < config.minRoundLength / 60) {
      this.timeError = `Must add at least ${config.minRoundLength} seconds`;
      this.value = undefined;
      return this.sendEvent();
    } else {
      this.timeError = '';
    }
    this.value = minutes * 60000; //Unix timestamps, like we use are in ms
    this.sendEvent();
  }

  render() {
    return html`<input type="text" value=${this.value} @input=${this.handleInput} placeholder="∞" />`;
  }
  static styles = css`
    ${appStyles}
    :host {
      display: block;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'byfo-time-input': ByfoTimeInput;
  }
}
