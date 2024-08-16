import { Component, Host, h, Prop, State } from '@stencil/core';
import { config } from 'byfo-utils';

@Component({
  tag: 'tp-timer',
  styleUrl: 'tp-timer.css',
  shadow: false,
})
export class TpTimer {
  @Prop() endtime: number;
  @Prop() offset: number;
  @Prop() addTime: ()=>void;
  @State() currentTime: number = Date.now();
  @State() timeoutReady:boolean = true;
  timerLoop;

  connectedCallback() {
    this.timerLoop = setInterval(() => {
      this.currentTime = Date.now() + (this.offset ?? 0);
    }, 250);
  }

  disconnectedCallback() {
    if (this.timerLoop) clearInterval(this.timerLoop);
  }

  timeoutRound() {
    if(this.timeoutReady){
      document.dispatchEvent(new CustomEvent('tp-timer-finished', {}));
      this.timeoutReady = false;
    }
  }

  get secondsLeft(): number {
    return Math.floor((this.endtime - this.currentTime) / 1000);
  }

  get relativeTime() {
    if (this.secondsLeft < 0) {
      this.timeoutRound();
      return 'Out of time - Submitting';
    } else {
      this.timeoutReady = true;
    }
    let seconds: string | number = this.secondsLeft % 60;
    seconds = seconds < 10 ? '0' + seconds : seconds;
    const minutes = Math.floor(this.secondsLeft / 60);
    return `${minutes}:${seconds}`;
  }

  render() {
    return <Host>{this.relativeTime}{this.addTime ? <button onClick={this.addTime} class='add-time-button'>+{config.addTimeIncrement}s</button>: null}</Host>;
  }
}
