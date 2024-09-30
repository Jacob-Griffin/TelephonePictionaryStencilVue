import { css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { ByfoModal } from './byfo-modal';
import { format } from '../common';

type Slide = {
  image: string;
  maintext: string;
  detail: string;
};

const slides: Slide[] = [
  {
    image: '/byfo-logo.png',
    maintext: 'Welcome to Blow Your Face Off',
    detail: 'an online game of **Telephone Pictionary**',
  },
  {
    image: '',
    maintext: 'As expected, this plays like both **Telephone** and **Pictionary**',
    detail: 'Like Telephone, a message is passed from player to player. Like Pictionary, players will both draw and guess pictures',
  },
  {
    image: '',
    maintext: 'At the beginning of the game, all players write a "prompt"',
    detail: "This can be any word phrase or sentence, just be mindful of your fellow players' tastes",
  },
  {
    image: '',
    maintext: 'Next, these "prompts" are passed around to the next player to be drawn',
    detail: 'You will recieve a prompt that another player wrote. In this round, you will draw a picture to represent the prompt you recieved',
  },
  {
    image: '',
    maintext: 'These images are then passed to the next player to be described',
    detail: 'This time, you will recieve an image *without* the original prompt. You will then describe what this image is using your words',
  },
  {
    image: '',
    maintext: 'Gameplay continues with this pattern',
    detail: "Rounds alternate between describing the previous player's image and drawing the previous player's description",
  },
  {
    image: '',
    maintext: 'The game is over when the messages have made it through all players',
    detail: 'The number of rounds is the same as the number of players',
  },
  {
    image: '',
    maintext: 'After the game is done, everyone can view the message chains together',
    detail: "Enjoy the hilarity and confusion of your fellow players' drawings and guesses",
  },
  {
    image: '',
    maintext: 'Have fun!',
    detail: "While you should give an honest attempt to pass the messages, don't worry too much about your message making it to the end intact. The point of the game is *fun*",
  },
  {
    image: '',
    maintext: 'Questions?',
    detail: `We have some answers. For questions about technical issues, you can visit the [Knowlege Base](https://github.com/Jacob-Griffin/TelephonePictionary2.0/wiki/Knowlege-Base). A more general gameplay FAQ is in the works`,
  },
];

/**
 * Displays a carousel of tutorial slides in a modal
 */
@customElement('byfo-tutorial-modal')
export class ByfoTutorialModal extends ByfoModal {
  @state() index: number = 0;

  next() {
    if (this.index + 1 < slides.length) {
      this.index += 1;
    }
  }

  prev() {
    if (this.index > 0) {
      this.index -= 1;
    }
  }

  handleKey = ({ key }: KeyboardEvent) => {
    if (!this.enabled) {
      return;
    }
    if (key === 'ArrowRight') this.next();
    if (key === 'ArrowLeft') this.prev();
  };

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener('keydown', this.handleKey);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener('keydown', this.handleKey);
  }

  renderSlide() {
    const slideData = slides[this.index];
    const header = format(slideData.maintext, true);
    const detail = format(slideData.detail, true);
    return html`${slideData.image ? html`<img src="${slideData.image}" />` : html`<div class="image-placeholder">Placeholder for slide ${this.index}</div>`}
      <h3>${header}</h3>
      <p>${detail}</p>`;
  }

  renderBody() {
    this.index;
    return html`
      <div class="tutorial-main">
        <p @click=${this.prev.bind(this)} class=${this.index === 0 ? 'hidden' : ''}>&lt;</p>
        <section class="slide">${this.renderSlide()}</section>
        <p @click=${this.next.bind(this)} class=${this.index === slides.length - 1 ? 'hidden' : ''}>&gt;</p>
      </div>
      <div class="dot-container">${slides.map((_, i) => html`<p @click=${() => (this.index = i)} class=${this.index === i ? 'current' : ''}>•</p>`)}</div>
    `;
  }
  static styles = css`
    ${ByfoModal.styles}
    :host {
      text-align: center;
    }

    img,
    .image-placeholder {
      height: 15rem;
      width: auto;
      max-width: 90%;
    }

    strong {
      font-weight: 700;
    }

    h3 {
      font-size: 1.5rem;
      font-weight: 600;
    }

    .image-placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px dashed var(--color-border);
      border-radius: 5px;
      width: 100%;
    }

    .dot-container {
      display: flex;
      line-height: 0.75rem;
      font-size: 1.7rem;
      cursor: pointer;
      gap: 0.5rem;
      margin-bottom: -0.75rem;
      color: var(--color-border);
      & > .current {
        color: var(--color-text);
      }
    }

    .tutorial-main {
      display: flex;
      width: 100%;
      align-items: center;
      & > p {
        flex-basis: 2.5ch;
        height: 1em;
        font-size: 1.2rem;
        cursor: pointer;
        user-select: none;
        &.hidden {
          height: 0;
          overflow-y: hidden;
        }
      }
      & > section {
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        align-items: center;
        & > p {
          max-width: 90%;
          text-wrap: balance;
        }
      }
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'byfo-tutorial-modal': ByfoTutorialModal;
  }
}
