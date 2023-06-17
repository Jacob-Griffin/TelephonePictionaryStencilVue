import { Component, h, Prop, Element, State, Listen } from '@stencil/core';

@Component({
  tag: 'tp-input-zone',
  styleUrl: 'tp-input-zone.css',
  shadow: true,
})
export class TpInputZone {
  @Prop() round: number;
  @Prop() characterLimit: number;
  @Prop() sendingTo: string;
  @Element() el: HTMLElement;
  @State() text: string = '';

  saveInterval;
  loadedBackup;

  get isTextRound() {
    return this.round % 2 === 0;
  }

  get placeholderText() {
    if (this.round > 0) {
      return 'Describe the image you were sent';
    } else {
      return 'Type in a word, phrase, or sentence to be passed along';
    }
  }

  get canSend() {
    return !(this.isTextRound && (!this.text || this.text.length > this.characterLimit));
  }

  getElement = id => this.el.shadowRoot.getElementById(id);

  @Listen('tp-timer-finished', { target: 'document' })
  timerFinished() {
    this.sendRound();
  }

  componentDidLoad() {
    this.loadedBackup = localStorage.getItem('currentRoundData');
    this.saveInterval = setInterval(async () => {
      let v = this.text;
      if (!this.isTextRound) {
        const canvas = this.getElement('canvas') as HTMLTpCanvasElement;
        v = await canvas.backupPaths();
      }
      localStorage.setItem('currentRoundData', v);
    }, 4000);
  }

  componentDidUpdate() {
    if (!this.loadedBackup) return;
    if (this.isTextRound) {
      this.text = this.loadedBackup;
      delete this.loadedBackup;
    } else {
      const canvas = this.getElement('canvas') as HTMLTpCanvasElement;
      if (canvas) {
        canvas.restoreBackup(this.loadedBackup);
        delete this.loadedBackup;
      }
    }
  }

  disconnectedCallback() {
    if (this.saveInterval) {
      clearInterval(this.saveInterval);
    }
  }

  handleInput = (e: InputEvent) => {
    const content = (e.target as HTMLSpanElement)?.textContent;
    this.text = content;
  };

  sendRound = async () => {
    let content = this.text;
    if (!this.isTextRound) {
      const canvas = this.getElement('canvas') as HTMLTpCanvasElement;
      content = (await canvas?.exportDrawing()) || '';
    }

    const submitEvent = new CustomEvent<string>('tp-submitted', {
      detail: content,
    });
    localStorage.removeItem('currentRoundData');

    document.dispatchEvent(submitEvent);
  };

  render() {
    return (
      <section>
        {this.isTextRound ? (
          <div id="text-input-wrapper">
            <span contentEditable id="text-input" data-placeholder={this.placeholderText} onInput={this.handleInput}></span>
            <div id="character-limit-count" class={this.text.length > this.characterLimit ? 'danger' : ''}>
              {this.text.length}/{this.characterLimit}
            </div>
          </div>
        ) : (
          <div>
            <tp-canvas id="canvas" hostEl={this.el}></tp-canvas>
            <tp-canvas-controls hostEl={this.el}></tp-canvas-controls>
          </div>
        )}
        <button onClick={this.sendRound} disabled={!this.canSend}>
          Send to <strong>{this.sendingTo}</strong>
        </button>
      </section>
    );
  }
}
