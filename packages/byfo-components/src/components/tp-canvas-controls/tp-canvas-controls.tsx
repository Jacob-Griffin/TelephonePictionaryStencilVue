import { Component, h, Element, Prop, State } from '@stencil/core';

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

// Raw SVGs sourced from Bootstrap Icons under the MIT License
const icons = {
  pencil: 
    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16">
      <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z"/>
    </svg>,
  eraser: 
    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16">
      <path d="M8.086 2.207a2 2 0 0 1 2.828 0l3.879 3.879a2 2 0 0 1 0 2.828l-5.5 5.5A2 2 0 0 1 7.879 15H5.12a2 2 0 0 1-1.414-.586l-2.5-2.5a2 2 0 0 1 0-2.828l6.879-6.879zm.66 11.34L3.453 8.254 1.914 9.793a1 1 0 0 0 0 1.414l2.5 2.5a1 1 0 0 0 .707.293H7.88a1 1 0 0 0 .707-.293l.16-.16z"/>
    </svg>,
  undo: 
    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16">
      <path fill-rule="evenodd" d="M8 3a5 5 0 1 1-4.546 2.914.5.5 0 0 0-.908-.417A6 6 0 1 0 8 2v1z"/>
      <path d="M8 4.466V.534a.25.25 0 0 0-.41-.192L5.23 2.308a.25.25 0 0 0 0 .384l2.36 1.966A.25.25 0 0 0 8 4.466z"/>
    </svg>,
  redo:
    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16">
      <path fill-rule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
      <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
    </svg>,
  trash: 
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash3-fill" viewBox="0 0 16 16">
      <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5Zm-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5ZM4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06Zm6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528ZM8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5Z"/>
    </svg>,
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
          <button id="white-clear">{icons.trash}</button>
          <button id="black-clear">{icons.trash}</button>
        </section>
      </section>
    );
  }
}
