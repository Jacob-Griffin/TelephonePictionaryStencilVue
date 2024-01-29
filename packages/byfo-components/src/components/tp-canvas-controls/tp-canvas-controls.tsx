import { Component, h, Element, Prop, State } from '@stencil/core';
import icons from './icons';

@Component({
  tag: 'tp-canvas-controls',
  styleUrl: 'tp-canvas-controls.css',
  shadow: true,
})
export class TpCanvasControls {
  lineWidths = ['small', 'medium', 'large', 'xlarge'];

  @Prop() hostEl: HTMLElement;
  @Prop() submithandler: (e: Event) => void;
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
                {icons.line(width)}
              </button>
            );
          })}
        </section>

        {/* Clear */}
        <section>
          <button id="white-clear">{icons.droplet}</button>
          <button id="black-clear">{icons.droplet}</button>
        </section>

        <button id="submit-button" onClick={this.submithandler}>
          Submit
        </button>
      </section>
    );
  }
}
