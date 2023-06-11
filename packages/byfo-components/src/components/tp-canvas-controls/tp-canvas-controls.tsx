import { Component, h, Element, Prop, State } from '@stencil/core';

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
  lineWidths = ['small', 'medium', 'large', 'xlarge'];

  @Prop() hostEl: HTMLElement;
  @Element() el: HTMLElement;
  @State() drawing: boolean = true;
  @State() activeWidth: string = this.lineWidths[0];

  getElement = id => this.el.shadowRoot.getElementById(id);

  componentDidLoad() {
    this.getElement('draw').addEventListener('click', this.sendDraw);
    this.getElement('erase').addEventListener('click', this.sendErase);

    this.getElement('undo').addEventListener('click', this.sendUndo);
    this.getElement('redo').addEventListener('click', this.sendRedo);

    this.lineWidths.forEach(width => {
      this.getElement(`line-${width}`).addEventListener('click', () => {
        this.sendSize(width);
      });
    });

    this.getElement('white-clear').addEventListener('click', () => {
      this.sendClear('#FFF');
    });
    this.getElement('black-clear').addEventListener('click', () => {
      this.sendClear('#000');
    });

    //Watch for fontawsome svgs
    dom.i2svg({ node: this.getElement('button-container') });
  }

  //#region control events
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
    this.drawing = true;
  };

  sendErase = () => {
    this.hostEl.dispatchEvent(new CustomEvent('eraser-input'));
    this.drawing = false;
  };

  sendSize = newSize => {
    this.hostEl.dispatchEvent(new CustomEvent('size-input', { detail: { newSize } }));
    this.activeWidth = newSize;
  };

  //#endregion

  render() {
    return (
      <section id="button-container">
        {/* Draw/Erase */}
        <section>
          <button id="draw" data-active={this.drawing}>
            {icons.pencil}
          </button>
          <button id="erase" data-active={!this.drawing}>
            {icons.eraser}
          </button>
        </section>

        {/* Undo/Redo */}
        <section>
          <button id="undo">{icons.undo}</button>
          <button id="redo">{icons.redo}</button>
        </section>

        {/* Line widths */}
        <section id="line-widths">
          {this.lineWidths.map(width => {
            return (
              <button id={`line-${width}`} data-active={width === this.activeWidth}>
                {icons.lines(width)}
              </button>
            );
          })}
        </section>

        {/* Clear */}
        <section>
          <button id="white-clear">{icons.fillWhite}</button>
          <button id="black-clear">{icons.fillBlack}</button>
        </section>
      </section>
    );
  }
}
