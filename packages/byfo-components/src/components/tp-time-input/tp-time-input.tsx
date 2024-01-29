import { Component, Host, Prop, State, h } from '@stencil/core';

@Component({
  tag: 'tp-time-input',
  styleUrl: 'tp-time-input.css',
  shadow: false,
})
export class TpTimeInput {
  @Prop({ reflect: true, attribute: 'init-value' }) initialValue;
  @Prop({ reflect: true, attribute: 'max-minutes' }) maxMinutes;
  @Prop({ reflect: true, attribute: 'max-seconds' }) maxSeconds;
  @Prop({ reflect: true, attribute: 'placeholder' }) placeholder;
  @Prop() value: number;
  @Prop() timeError: string;

  @State() inputEl: HTMLInputElement;

  setInputEl = (el: HTMLInputElement) => {
    this.inputEl = el;
    this.inputEl.value = this.initialValue;
    this.inputEl.addEventListener('input', this.handleInput);
  };

  sendEvent = () => {
    const e = new CustomEvent('tp-time-input', {
      detail: {
        timeError: this.timeError,
        value: this.value,
      },
    });
    document.dispatchEvent(e);
  };

  handleInput = () => {
    const maxRoundLength = this.maxMinutes;
    const input = this.inputEl.value;
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
    if (minutes > maxRoundLength) {
      this.timeError = `Cannot add more than ${maxRoundLength} minutes`;
      this.value = undefined;
      return this.sendEvent();
    } else if (minutes < 5 / 60) {
      this.timeError = 'Must add at least 5 seconds';
      this.value = undefined;
      return this.sendEvent();
    } else {
      this.timeError = '';
    }
    this.value = minutes * 60000; //Unix timestamps, like we use are in ms
    this.sendEvent();
  };

  render() {
    return (
      <Host>
        <input type="text" ref={this.setInputEl} placeholder={this.placeholder}></input>
      </Host>
    );
  }
}
