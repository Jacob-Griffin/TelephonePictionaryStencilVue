//#region Template
// (This only uses textContent)
//#endregion
class BYFOTimer extends HTMLElement {
  constructor() {
    super();
  }

  endtime;
  sentEvent = {
    stuck: false,
    done: false,
  };
  #timerInterval;

  connectedCallback() {
    if (!this.isConnected) {
      return;
    }
    this.render();
    this.#timerInterval = setInterval(this.render, 500);
  }

  disconnectedCallback() {
    clearInterval(this.#timerInterval);
  }

  get timeoutMessage() {
    return this.getAttribute('timeout-message') || 'Out of time - submitting';
  }

  static get observedAttributes() {
    return ['endtime'];
  }
  attributeChangedCallback(name, oldValue, newValue) {
    this.endtime = newValue;
    this.sentEvent = {
      stuck: false,
      done: false,
    };
    this.render();
  }

  render = () => {
    const totalSeconds = Math.floor((this.endtime - Date.now()) / 1000);
    if (totalSeconds <= -5) {
      if (!this.sentEvent.stuck) {
        this.sentEvent.stuck = true;
        document.dispatchEvent(new CustomEvent('tp-stuck-signal'));
      }
      return;
    }
    if (totalSeconds <= 0) {
      if (!this.sentEvent.done) {
        this.textContent = this.timeoutMessage;
        this.sentEvent.done = true;
        document.dispatchEvent(new CustomEvent('tp-timer-finished'));
      }
      return;
    }
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = `${totalSeconds % 60}`.replace(/^([0-9])$/, '0$1');
    const time = `${minutes}:${seconds}`;
    if (time !== this.textContent) {
      this.textContent = time;
    }
  };
}

customElements.define('byfo-timer', BYFOTimer);
