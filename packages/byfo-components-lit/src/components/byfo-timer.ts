import { css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { LitElement } from 'lit';
import { BYFOFirebaseAdapter, config, TPStore } from 'byfo-utils';
import { appStyles } from '../style';
import { inject } from '../dependencies';

/**
 * Description of your element here. Use @ property doc tags to describe props
 */
@customElement('byfo-timer')
export class ByfoTimer extends LitElement {
  @inject firebase?: BYFOFirebaseAdapter;
  @inject store?: TPStore;
  @property() endtime?: number;
  @state() relativeTime?: string;
  @state() timeoutReady: boolean = true;
  timerLoop?: NodeJS.Timer;

  checkTime() {
    if (!this.endtime) {
      this.relativeTime = undefined;
      return;
    }
    const currentTime = Date.now() + (this.firebase?.serverOffset ?? 0);
    const secondsLeft = Math.floor((this.endtime - currentTime) / 1000);
    if (secondsLeft < 0) {
      this.timeoutRound();
      this.relativeTime = 'Out of time - Submitting';
      return;
    } else {
      this.timeoutReady = true;
    }
    let seconds: string | number = secondsLeft % 60;
    seconds = seconds < 10 ? '0' + seconds : seconds;
    const minutes = Math.floor(secondsLeft / 60);
    const newTime = `${minutes}:${seconds}`;
    if (newTime !== this.relativeTime) {
      this.relativeTime = newTime;
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this.timerLoop = setInterval(this.checkTime.bind(this), 250);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.timerLoop) clearInterval(this.timerLoop);
  }

  timeoutRound() {
    if (this.timeoutReady) {
      document.dispatchEvent(new CustomEvent('tp-timer-finished', {}));
      this.timeoutReady = false;
    }
  }

  addTime() {
    this.firebase?.sendAddTime(~~this.store!.gameid, config.addTimeIncrement * 1000);
    this.checkTime();
  }

  render() {
    return html`${this.relativeTime}${this.store?.hosting ? html`<button @click=${this.addTime} class="add-time-button">+${config.addTimeIncrement}s</button>` : null}`;
  }
  static styles = css`
    ${appStyles}
    :host {
      display: inline-flex;
      align-items: center;
      position: relative;
      color: var(--color-text);
      height: 2rem;
      & > .add-time-button {
        padding: 0.4rem;
        font-size: 0.7rem;
        width: fit-content;
        height: unset;
        line-height: 1em;
        border-radius: 0.5rem;
        margin: 0;
        margin-inline-start: 0.25rem;
      }
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'byfo-timer': ByfoTimer;
  }
}
