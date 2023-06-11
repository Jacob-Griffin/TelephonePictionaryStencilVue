import { Component, h, Element, Prop } from '@stencil/core';

import { library, dom } from '@fortawesome/fontawesome-svg-core';
import { faPencil, faRotateRight, faEraser, faTrash } from '@fortawesome/free-solid-svg-icons';

// We are only using the user-astronaut icon
library.add(faPencil);
library.add(faEraser);
library.add(faRotateRight);
library.add(faTrash);

const squiggleWidth = (width): string => {
  switch (width) {
    case 'small':
      return '0%';
    case 'medium':
      return '33%';
    case 'large':
      return '66%';
    case 'xlarge':
      return '100%';
    case 'default':
      return '0';
  }
};

const icons = {
  pencil: <i class="fa-solid fa-pencil"></i>,
  eraser: <i class="fa-solid fa-eraser"></i>,
  undo: <i class="fa-solid fa-rotate-right" data-fa-transform="flip-h"></i>,
  redo: <i class="fa-solid fa-rotate-right"></i>,
  fillWhite: <i class="fa-solid fa-trash"></i>,
  fillBlack: <i class="fa-solid fa-trash"></i>,
  lines: width => <tp-icon-fill-squiggle strokewidth={squiggleWidth(width)}></tp-icon-fill-squiggle>,
};

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

  @Prop() hostEl: HTMLElement;
  @Element() el: HTMLElement;

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
    const buttonContainer = this.el.shadowRoot.getElementById('button-container');
    dom.i2svg({ node: buttonContainer });
  }

  sendUndo = () => {
    this.hostEl.dispatchEvent(new CustomEvent('undo-input'));
  };

  sendRedo = () => {
    this.hostEl.dispatchEvent(new CustomEvent('redo-input'));
  };

  sendClear = color => {
    this.hostEl.dispatchEvent(new CustomEvent('clear-input', { detail: { color } }));
  };

  sendDraw = () => {
    this.hostEl.dispatchEvent(new CustomEvent('pen-input'));
    this.drawButton.setAttribute('value', 'active');
    this.eraseButton.setAttribute('value', 'inactive');
  };

  sendErase = () => {
    this.hostEl.dispatchEvent(new CustomEvent('eraser-input'));
    this.drawButton.setAttribute('value', 'inactive');
    this.eraseButton.setAttribute('value', 'active');
  };

  sendSize = newSize => {
    this.hostEl.dispatchEvent(new CustomEvent('size-input', { detail: { newSize } }));
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
      <section id="button-container">
        <section>
          <button ref={el => (this.drawButton = el)} value="active">
            {icons.pencil}
          </button>
          <button ref={el => (this.eraseButton = el)} value="inactive">
            {icons.eraser}
          </button>
        </section>
        <section>
          <button ref={el => (this.undoButton = el)}>{icons.undo}</button>
          <button ref={el => (this.redoButton = el)}>{icons.redo}</button>
        </section>
        <section>
          <button ref={el => (this.whiteButton = el)}>{icons.fillWhite}</button>
          <button ref={el => (this.blackButton = el)} class="black">
            {icons.fillBlack}
          </button>
        </section>
        <section>
          {this.lineWidths.map(width => {
            return (
              <button
                ref={el => {
                  this.lineButtons[width] = el;
                }}
                value={width === 'small' ? 'active' : 'inactive'}
              >
                {icons.lines(width)}
              </button>
            );
          })}
        </section>
      </section>
    );
  }
}
