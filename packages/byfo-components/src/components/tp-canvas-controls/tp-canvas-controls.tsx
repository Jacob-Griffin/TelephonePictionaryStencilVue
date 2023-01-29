import { Component, h } from '@stencil/core';

@Component({
  tag: 'tp-canvas-controls',
  styleUrl: 'tp-canvas-controls.css',
  shadow: true,
})
export class TpCanvasControls {
  undoButton;
  redoButton;
  whiteButton;
  blackButton;
  drawButton;
  eraseButton;
  lineButtons = {};
  lineWidths = ['small', 'medium', 'large', 'xlarge'];
  buttonClasses = 'rounded-md w-16 h-16 text-white border-none shadow-md shadow-gray-400 bg-blue-500 selected:bg-green-400';

  componentDidRender() {
    this.undoButton.addEventListener('click', this.sendUndo);
    this.redoButton.addEventListener('click', this.sendRedo);
    this.whiteButton.addEventListener('click', () => {
      this.sendClear('#FFF');
    });
    this.blackButton.addEventListener('click', () => {
      this.sendClear('#000');
    });
    this.drawButton.addEventListener('click', this.sendDraw);
    this.eraseButton.addEventListener('click', this.sendErase);
    Object.keys(this.lineButtons).forEach(width => {
      this.lineButtons[width].addEventListener('click', () => {
        this.sendSize(width);
      });
    });
  }

  sendUndo() {
    document.dispatchEvent(new CustomEvent('undoInput'));
  }

  sendRedo() {
    document.dispatchEvent(new CustomEvent('redoInput'));
  }

  sendClear(color) {
    document.dispatchEvent(new CustomEvent('clearInput', { detail: { color } }));
  }

  sendDraw = () => {
    document.dispatchEvent(new CustomEvent('penInput'));
    this.drawButton.setAttribute('value', 'active');
    this.eraseButton.setAttribute('value', 'inactive');
  };

  sendErase = () => {
    document.dispatchEvent(new CustomEvent('eraserInput'));
    this.drawButton.setAttribute('value', 'inactive');
    this.eraseButton.setAttribute('value', 'active');
  };

  sendSize = newSize => {
    document.dispatchEvent(new CustomEvent('sizeInput', { detail: { newSize } }));
    Object.keys(this.lineButtons).forEach(width => {
      if (width == newSize) {
        this.lineButtons[width].setAttribute('value', 'active');
      } else {
        this.lineButtons[width].setAttribute('value', 'inactive');
      }
    });
  };

  render() {
    return (
      <section class="flex flex-wrap justify-center gap-4 m-2 p-4 bg-gray-200">
        <button class={this.buttonClasses} ref={el => (this.undoButton = el)}>
          Undo
        </button>
        <button class={this.buttonClasses} ref={el => (this.redoButton = el)}>
          Redo
        </button>
        <button class={this.buttonClasses} ref={el => (this.whiteButton = el)}>
          Clear (White)
        </button>
        <button class={this.buttonClasses} ref={el => (this.blackButton = el)}>
          Clear (black)
        </button>
        <button class={this.buttonClasses} ref={el => (this.drawButton = el)} value="active">
          Draw
        </button>
        <button class={this.buttonClasses} ref={el => (this.eraseButton = el)} value="inactive">
          Erase
        </button>
        <section class="flex gap-4 m-0 p-0">
          {this.lineWidths.map(width => {
            if (width == 'small') {
              return (
                <button
                  class={this.buttonClasses}
                  ref={el => {
                    this.lineButtons[width] = el;
                  }}
                  value="active"
                >
                  {width}
                </button>
              );
            } else {
              return (
                <button
                  class={this.buttonClasses}
                  ref={el => {
                    this.lineButtons[width] = el;
                  }}
                  value="inactive"
                >
                  {width}
                </button>
              );
            }
          })}
        </section>
      </section>
    );
  }
}
