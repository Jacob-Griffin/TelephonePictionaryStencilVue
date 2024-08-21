import { css, html } from 'lit-element';
import { customElement, property } from 'lit-element/decorators.js';
import { ByfoElement } from './byfo-element';

/**
 * Description of your element here. Use @ property doc tags to describe props
 */
@customElement('byfo-timer')
export class ByfoTimer extends ByfoElement {
  static usesFirebase = true;
  @property() endtime: number;
  @property() offset: number;
  @property() addTime: () => void;
  @State() currentTime: number = Date.now();
  @State() timeoutReady: boolean = true;
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
    if (this.timeoutReady) {
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
    return html``;
  }
  static styles = css`
    :host {
      display: block;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'byfo-timer': ByfoTimer;
  }
}
