import { css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { ByfoElement } from './byfo-element';
import { config } from 'byfo-utils';

/**
 * Description of your element here. Use @ property doc tags to describe props
 */
@customElement('byfo-timer')
export class ByfoTimer extends ByfoElement {
  static uses = ['firebase'];
  @property() endtime?: number;
  @property() addTime?: () => void;
  @state() currentTime: number = Date.now();
  @state() timeoutReady: boolean = true;
  timerLoop?: NodeJS.Timer;

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
    return this.endtime ? Math.floor((this.endtime - this.currentTime) / 1000) : -1;
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
    return html`${this.relativeTime}${this.addTime ? html`<button onClick="{this.addTime}" class="add-time-button">+${config.addTimeIncrement}s</button>` : null}`;
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
