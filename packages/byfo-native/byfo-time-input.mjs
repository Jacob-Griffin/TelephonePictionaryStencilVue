//#region template
//Template is one element. More easily handled in code with createElement
//#endregion

class BYFOTimeInput extends HTMLElement {
  constructor() {
    super();
    this.#inputElement = document.createElement('input');
    this.#inputElement.setAttribute('type', 'text');
    this.#inputElement.setAttribute('placeholder', 'mm:ss');
    this.#inputElement.addEventListener('input', this.handleInput);
  }

  #inputElement;

  timeError = '';
  value = -1;

  ///ATTRIBUTES NOT LISTED:
  /// max-minutes
  /// max-seconds

  sendEvent = () => {
    const e = new CustomEvent('byfo-time-input', {
      detail: {
        timeError: this.timeError,
        value: this.value,
      },
    });
    document.dispatchEvent(e);
  };

  handleInput = e => {
    const maxRoundLength = this.getAttribute('max-minutes') || this.getAttribute('max-seconds');
    const input = this.#inputElement.value;
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
  };

  connectedCallback() {
    if (!this.isConnected) return;
    this.replaceChildren(this.#inputElement);
    this.#inputElement.value = this.getAttribute('init-value') || this.#inputElement.value;
    this.#inputElement.placeholder = this.getAttribute('placeholder') || this.#inputElement.placeholder;
    this.handleInput();
  }

  static get observedAttributes() {
    return ['init-value', 'max-minutes', 'max-seconds', 'placeholder'];
  }
  attributeChangedCallback(attr, oldV, newV) {
    if (oldV === newV) return;

    if (attr === 'value') {
      this.#inputElement.value = newV;
    }
    if (attr === 'placeholder') {
      this.#inputElement.setAttribute(attr, newV);
    }
    this.handleInput();
  }
}

customElements.define('byfo-time-input', BYFOTimeInput);
