import { css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { ByfoElement } from './byfo-element';
import { config, DependencyList } from 'byfo-utils';

/**
 * Description of your element here. Use @ property doc tags to describe props
 */
@customElement('byfo-timer')
export class ByfoTimer extends ByfoElement {
  static uses: (keyof DependencyList)[] = ['firebase', 'store'];
  @property() endtime?: number;
  @state() relativeTime?: string;
  @state() timeoutReady: boolean = true;
  timerLoop?: NodeJS.Timer;

  connectedCallback() {
    super.connectedCallback();
    this.timerLoop = setInterval(() => {
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
    }, 250);
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

  render() {
    return html`${this.relativeTime}${this.store?.hosting
      ? html`<button @click=${this.firebase?.sendAddTime(~~this.store!.gameid, config.addTimeIncrement)} class="add-time-button">+${config.addTimeIncrement}s</button>`
      : null}`;
  }
  static styles = css`
    tp-timer {
      display: inline;
      position: relative;
      line-height: 1em;
      color: var(--color-text);
    }

    .add-time-button {
      height: 1.5rem;
      line-height: 0.7rem;
      padding: 0.4rem;
      width: 2rem;
      display: inline;
      font-size: 0.7rem;
      width: unset;
      border-radius: 0.5rem;
      position: absolute;
      top: -0.15rem;
      right: -3rem;
    }

    .needs-backdrop .add-time-button {
      top: 0.3rem;
      right: -2.5rem;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'byfo-timer': ByfoTimer;
  }
}
