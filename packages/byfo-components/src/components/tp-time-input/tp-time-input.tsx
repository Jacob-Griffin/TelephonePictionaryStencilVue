import { Component, Host, Prop, State, h } from '@stencil/core';

@Component({
  tag: 'tp-time-input',
  styleUrl: 'tp-time-input.css',
  shadow: false,
})
export class TpTimeInput {
  @Prop({reflect:true, attribute: 'init-value'}) initialValue;
  @Prop({reflect:true, attribute: 'max-minutes'}) maxMinutes;
  @Prop({reflect:true, attribute: 'max-seconds'}) maxSeconds;
  @Prop({reflect:true, attribute: 'placeholder'}) placeholder;
  @Prop() value:number;
  @Prop() timeError:string;

  @State() inputEl: HTMLInputElement;

  setInputEl = (el:HTMLInputElement) => {
    this.inputEl = el;
    this.inputEl.addEventListener('input',this.handleInput);
  }

  sendEvent = () => {
    const e = new CustomEvent('tp-time-input', {
      detail: {
        timeError: this.timeError,
        value: this.value,
      },
    });
    document.dispatchEvent(e);
  };

  handleInput= () => {
    const maxRoundLength = this.maxMinutes || this.maxSeconds;
    const input = this.inputEl.value;
    if (input.length === 0) {
      this.timeError = '';
      this.value = -1;
      return this.sendEvent();
    }
    const matches = input.match(/^([0-9]+)(:[0-5][0-9])?$/);
    if (matches === null) {
      this.timeError = 'Improper format. Must be ss or mm:ss';
      this.value = undefined;
      return this.sendEvent();
    }
    let seconds = parseInt(matches[1]);
    if (matches[2]) {
      const secondString = matches[2].replace(/:/, '');
      let minutes = seconds;
      seconds = parseInt(secondString) + minutes * 60;
    }
    if (seconds > maxRoundLength * 60) {
      this.timeError = `Cannot add more than ${maxRoundLength} minutes or ${maxRoundLength * 60} seconds`;
      this.value = undefined;
      return this.sendEvent();
    } else if (seconds < 5) {
      this.timeError = 'Must add at least 5 seconds';
      this.value = undefined;
      return this.sendEvent();
    } else {
      this.timeError = '';
    }
    this.value = seconds * 1000; //Unix timestamps, like we use are in ms
    this.sendEvent();
  }

  render() {
    return (
      <Host>
        <input type='text' ref={this.setInputEl} placeholder={this.placeholder}>{this.initialValue}</input>
      </Host>
    );
  }

}
