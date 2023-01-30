import { Component, h, Prop } from '@stencil/core';

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

  get placeholderText(){
    if(this.round === 0){
      return 'Type in a word, phrase, or sentence to be passed along';
    }
    else{
      return 'Describe the image your were sent';
    }
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
      <div class="flex flex-col items-center w-full">
        {this.isTextRound ? (
          <textarea
            class="shadow-md shadow-gray-400 border border-slate-500 rounded-lg
                  text-black text-3xl text-center font-medium p-4 w-full bg-white aspect-[5/3]"
            ref={el => (this.textEl = el)}
            placeholder={this.placeholderText}
          ></textarea>
        ) : (
          <div>
            <tp-canvas ref={el => (this.canvasEl = el)}></tp-canvas>
            <tp-canvas-controls></tp-canvas-controls>
          </div>
        )}
        <button
          class="mt-4 rounded-md w-32 h-16 text-white text-lg font-medium 
                      border-none shadow-md shadow-gray-400 bg-blue-500"
          onClick={this.sendRound}
        >
          Send
        </button>
      </div>
    );
  }
}
