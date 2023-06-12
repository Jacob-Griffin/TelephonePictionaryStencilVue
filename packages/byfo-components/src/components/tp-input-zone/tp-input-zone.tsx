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

  get isTextRound() {
    return this.round % 2 === 0;
  }

  get placeholderText() {
    if (this.round > 0) {
      return 'Describe the image you were sent NOW';
    } else {
      return 'Type in a word, phrase, or sentence to be passed along';
    }
  }

  get canSend() {
    return !(this.isTextRound && !this.text);
  }

  getElement = id => this.el.shadowRoot.getElementById(id);

  @Listen('tp-timer-finished', { target: 'document' })
  timerFinished() {
    this.sendRound();
  }

  handleInput = (e: InputEvent) => {
    console.log('doing it');
    const target = e.target as HTMLSpanElement;
    const truncatedText = target.textContent.slice(0, this.characterLimit);
    if (target.textContent !== truncatedText) {
      target.textContent = truncatedText;
      window.getSelection().setPosition(target, 1);
    }
    this.text = truncatedText;
  };

  sendRound = async () => {
    let value;
    if (this.isTextRound) {
      value = this.text;
    } else {
      const canvas = this.getElement('canvas') as HTMLTpCanvasElement;
      value = await canvas?.exportDrawing();
    }

    const submitEvent = new CustomEvent<string>('tp-submitted', {
      detail: value,
    });

    document.dispatchEvent(submitEvent);
  };

  render() {
    return (
      <section>
        {this.isTextRound ? (
          <div id="text-input-wrapper">
            <span contentEditable id="text-input" data-placeholder={this.placeholderText} onInputCapture={this.handleInput}></span>
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
