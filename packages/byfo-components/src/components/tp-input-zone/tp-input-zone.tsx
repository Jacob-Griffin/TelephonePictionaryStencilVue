import { Component, Host, h, Prop } from '@stencil/core';

@Component({
  tag: 'tp-input-zone',
  styleUrl: 'tp-input-zone.css',
  shadow: true,
})
export class TpInputZone {
  @Prop() round: number;
  textEl: HTMLTextAreaElement;
  canvasEl: HTMLTpCanvasElement;

  get isTextRound() {
    return this.round % 2 === 0;
  }

  sendRound = async () => {
    let value;
    if (this.isTextRound) {
      const textarea = this.textEl;
      value = textarea.value;
    } else {
      const canvas = this.canvasEl;
      value = await canvas.exportDrawing();
    }

    const submitEvent = new CustomEvent<string>('tpSubmitted', {
      detail: value,
    });

    document.dispatchEvent(submitEvent);
  };

  render() {
    return (
      <Host>
        {this.isTextRound ? (
          <textarea ref={el => (this.textEl = el)}></textarea>
        ) : (
          <div>
            <tp-canvas ref={el => (this.canvasEl = el)}></tp-canvas>
            <tp-canvas-controls></tp-canvas-controls>
          </div>
        )}
        <button onClick={this.sendRound}>Send</button>
      </Host>
    );
  }
}
