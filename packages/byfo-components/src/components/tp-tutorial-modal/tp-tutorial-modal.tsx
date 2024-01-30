import { Component, Prop, State, Watch, h } from '@stencil/core';
import { renderModal } from '../../globals/modal';
import { slides } from './slides';
import { format } from '../../globals/markdown';

@Component({
  tag: 'tp-tutorial-modal',
  styleUrl: 'tp-tutorial-modal.css',
  shadow: true,
})
export class TpTutorialModal {
  @Prop({ reflect: true, attribute: 'modal-enabled' }) enabled: boolean;

  @State() index: number = 0;

  @Watch('index')
  clampIndex(newVal) {
    if (newVal < 0) {
      this.index = 0;
    } else if (newVal >= slides.length) {
      this.index = slides.length - 1;
    }
  }

  componentDidLoad() {
    document.addEventListener('keydown', ({ key }) => {
      if (key === 'ArrowRight') this.index += 1;
      if (key === 'ArrowLeft') this.index -= 1;
    });
  }

  renderSlide() {
    const slide = slides[this.index];
    const img = slide.image ? <img src={slide.image} /> : <div class="image-placeholder">Placeholder for slide {this.index}</div>;
    const header = <h3>{format(slide.maintext, true)}</h3>;
    const detail = <p>{format(slide.detail, true)}</p>;
    return [img, header, detail];
  }

  renderMain() {
    return (
      <div class="tutorial-main">
        <p onClick={() => (this.index -= 1)}>&lt;</p>
        <section class="slide">{this.renderSlide()}</section>
        <p onClick={() => (this.index += 1)}>&gt;</p>
      </div>
    );
  }

  renderDots() {
    const dots = [];
    for (let i = 0; i < slides.length; i++) {
      dots.push(
        <p onClick={() => (this.index = i)} class={this.index === i ? 'current' : ''}>
          •
        </p>,
      );
    }
    return dots;
  }

  renderBody() {
    const currentSlide = this.renderMain();
    const dots = <div class="dot-container">{...this.renderDots()}</div>;
    return [currentSlide, dots];
  }

  render() {
    return renderModal(this);
  }
}
