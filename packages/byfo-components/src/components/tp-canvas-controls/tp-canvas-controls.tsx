import { Component, h, Element, Prop, State } from '@stencil/core';

import { library, dom } from '@fortawesome/fontawesome-svg-core';
import { faPencil, faRotateRight, faEraser, faFill, faCircle } from '@fortawesome/free-solid-svg-icons';

// We are only using the user-astronaut icon
library.add(faPencil);
library.add(faEraser);
library.add(faRotateRight);
library.add(faFill);
library.add(faCircle);

const icons = {
  pencil: <i class="fa-solid fa-pencil"></i>,
  eraser: <i class="fa-solid fa-eraser"></i>,
  undo: <i class="fa-solid fa-rotate-right" data-fa-transform="flip-h"></i>,
  redo: <i class="fa-solid fa-rotate-right"></i>,
  fillWhite: <i class="fa-solid fa-fill"></i>,
  fillBlack: <i class="fa-solid fa-fill"></i>,
  lines: width => <i class={`fa-solid fa-circle line-${width}`}></i>,
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
  buttonClasses = 'rounded-md w-16 h-16 text-white border-none';

  @Prop() hostEl: HTMLElement;
  @Element() el: HTMLElement;
  @State() buttonContainer: HTMLElement;

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
    dom.i2svg({ node: this.buttonContainer });
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
      <section class="flex flex-wrap justify-center gap-4 m-2 p-4 rounded-sm" ref={el => (this.buttonContainer = el)}>
        <button class={this.buttonClasses} ref={el => (this.undoButton = el)}>
          {icons.undo}
        </button>
        <button class={this.buttonClasses} ref={el => (this.redoButton = el)}>
          {icons.redo}
        </button>
        <button class={this.buttonClasses} ref={el => (this.whiteButton = el)}>
          {icons.fillWhite}
        </button>
        <button class={`${this.buttonClasses} black`} ref={el => (this.blackButton = el)}>
          {icons.fillBlack}
        </button>
        <button class={this.buttonClasses} ref={el => (this.drawButton = el)} value="active">
          {icons.pencil}
        </button>
        <button class={this.buttonClasses} ref={el => (this.eraseButton = el)} value="inactive">
          {icons.eraser}
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
                  {icons.lines(width)}
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
                  {icons.lines(width)}
                </button>
              );
            }
          })}
        </section>
      </section>
    );
  }
}
