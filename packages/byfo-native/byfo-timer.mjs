class BYFOTimer extends HTMLElement {
  constructor() {
    super();
  }

  endtime;
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

  static get observedAttributes() {
    return ['endtime'];
  }
  attributeChangedCallback(name, oldValue, newValue) {
    this.endtime = newValue;
    this.render();
  }

  render = () => {
    const totalSeconds = Math.floor((this.endtime - Date.now()) / 1000);
    if (totalSeconds <= 0) {
      this.textContent = 'Out of time - submitting';
      document.dispatchEvent(new CustomEvent('tp-timer-finished'));
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
