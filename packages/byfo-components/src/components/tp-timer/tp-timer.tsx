import { Component, Host, h, Prop, State } from '@stencil/core';

//Deprecated in favor of byfo-timer (byfo-native folder)
//Simple components are best without stencil bloat

@Component({
  tag: 'tp-timer',
  styleUrl: 'tp-timer.css',
  shadow: true,
})
export class TpTimer {
  @Prop() endtime: number;
  @State() currentTime: number = Date.now();
  timerLoop;

  connectedCallback() {
    this.timerLoop = setInterval(() => {
      this.currentTime = Date.now();
    }, 500);
  }

  disconnectedCallback() {
    if (this.timerLoop) clearInterval(this.timerLoop);
  }

  timeoutRound() {
    document.dispatchEvent(new CustomEvent('tp-timer-finished', {}));
  }

  get secondsLeft(): number {
    return Math.floor((this.endtime - this.currentTime) / 1000);
  }

  get relativeTime() {
    if (this.secondsLeft < 0) {
      this.timeoutRound();
      return 'Out of time - Submitting';
    }
    let seconds: string | number = this.secondsLeft % 60;
    seconds = seconds < 10 ? '0' + seconds : seconds;
    const minutes = Math.floor(this.secondsLeft / 60);
    return `${minutes}:${seconds}`;
  }

  render() {
    return <Host>{this.relativeTime}</Host>;
  }
}
