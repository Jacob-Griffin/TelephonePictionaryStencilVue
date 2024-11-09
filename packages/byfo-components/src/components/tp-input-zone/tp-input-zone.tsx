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
  @Prop() isSending: boolean;
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
    return !(this.isTextRound && (!this.text || this.text.length > this.characterLimit) && !this.isSending);
  }

  getElement = id => this.el.shadowRoot.getElementById(id);

  @Listen('tp-timer-finished', { target: 'document' })
  timerFinished(e) {
    this.sendRound(e, true);
  }

  @Listen('tp-canvas-line')
  backupCanvas(e: CustomEvent<string>) {
    localStorage.setItem('currentRoundData', e.detail);
  }

  componentDidLoad() {
    this.handleBackup();
    this.saveInterval = setInterval(() => {
      if (this.isTextRound) {
        localStorage.setItem('currentRoundData', this.text);
      }
    }, 4000);
  }

  handleBackup() {
    this.loadedBackup = localStorage.getItem('currentRoundData');
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
    const span = e.target as HTMLSpanElement;
    const content = span.textContent;
    this.text = content
  };

  sendRound = async (_,forced = false) => {
    let content: string | Blob = this.text;
    
    if (!this.isTextRound) {
      const canvas = this.getElement('canvas') as HTMLTpCanvasElement;
      content = await canvas?.exportDrawing();
    } else {
      if(this.text.length > this.characterLimit){
        content = this.text.slice(0,this.characterLimit);
      }
    }

    const submitEvent = new CustomEvent<{content: string | Blob, forced:boolean}>('tp-submitted', {
      detail: {
        content,
        forced
      }
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
          <div id="canvas-wrapper">
            <tp-canvas id="canvas" hostEl={this.el}></tp-canvas>
            <div id="control-wrapper">
              <slot name="timer" />
              <tp-canvas-controls submithandler={this.sendRound} hostEl={this.el} isSending={this.isSending}></tp-canvas-controls>
            </div>
          </div>
        )}
        {this.isTextRound ? (
          <button onClick={this.sendRound} disabled={!this.canSend}>
            { !this.isSending ? 
              <span class="button-text">Send to <strong>{this.sendingTo}</strong></span> :
              <span class="button-text">Sending...</span> }
          </button>
        ) : null}
      </section>
    );
  }
}
