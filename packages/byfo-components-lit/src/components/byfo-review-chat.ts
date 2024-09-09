import { css, html, PropertyValueMap, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { LitElement } from 'lit';
import { inject } from '../dependencies';
import { BYFOFirebaseAdapter, GameStacks, GameRoundContent, TPStore } from 'byfo-utils';
import { map } from 'lit/directives/map.js';

/**
 * Description of your element here. Use @ property doc tags to describe props
 */
@customElement('byfo-review-chat')
export class ByfoReviewChat extends LitElement {
  @property() gameid?: string;
  @property() stackName?: string;
  @property({
    type: Boolean,
    converter(value) {
      if (value === 'false') {
        return false;
      } else {
        return !!value;
      }
    },
  })
  showAllOverride?: boolean;

  @inject firebase?: BYFOFirebaseAdapter;
  @inject store?: TPStore;

  @state() index: number = 0;
  @state() showEnd: boolean = false;
  @state() lightboxedImgUrl?: string;

  stack?: GameRoundContent[];
  stacks?: GameStacks;
  stackPromise?: Promise<unknown>;
  imgCache: Map<string, HTMLImageElement> = new Map();
  domImageCache: HTMLDivElement;
  endOfStackDelay?: NodeJS.Timeout;
  scrollDelay?: NodeJS.Timeout; //We want to hold onto the scroll timeout so we can cancel it if there is a stack change
  stackChanging = false; //Likewise, if we find out that the timeout hasn't started yet, make sure the autoscroll knows

  get showAll() {
    return !!(this.showAllOverride || this.store?.alwaysShowAll);
  }

  constructor() {
    super();
    this.domImageCache = document.createElement('div');
    this.domImageCache.classList.add('img-cache');
    document.body.appendChild(this.domImageCache);
  }

  scrollSelf(options: ScrollToOptions) {
    const el = (this.renderRoot as ShadowRoot).host;
    el.scroll(options);
  }

  willUpdate(props: PropertyValueMap<any>) {
    if (this.gameid && !this.stackPromise && !this.stacks) {
      this.stackPromise = this.firebase?.getGameData(~~this.gameid).then(stacks => {
        this.stacks = stacks;
        if (this.showAll) {
          for (const user in stacks) {
            this.cacheStack(user, 5);
          }
        }
        this.requestUpdate();
        delete this.stackPromise;
      });
    }
    if (!this.stacks) {
      return;
    }
    if (props.has('stackName')) {
      this.showAllOverride = false;
      if (this.endOfStackDelay) {
        clearTimeout(this.endOfStackDelay);
        this.endOfStackDelay = undefined;
      }
      if (this.scrollDelay) {
        clearTimeout(this.scrollDelay);
        this.scrollDelay = undefined;
      } else {
        this.stackChanging = true;
        this.index = 0;
        setTimeout(() => {
          this.stackChanging = false;
        }, 200);
      }
      if (!this.showAll) {
        this.cacheStack(this.stackName!);
      }
      this.scrollSelf({ behavior: 'instant', top: 0 });
    }
  }

  cacheStack(user: string, limit?: number) {
    if (!this.stacks) {
      return;
    }
    const stack = Object.values(this.stacks[user]);
    for (let i = 1; i < stack.length && (!limit || i < limit); i += 2) {
      const url = stack[i].content!;
      if (url.startsWith('data:')) {
        continue;
      }
      if (this.imgCache?.has(url)) {
        continue;
      }
      const img = document.createElement('img');
      img.src = url;
      this.imgCache?.set(url, img);
      this.domImageCache.appendChild(img);
    }
  }

  imgClicked = (e: PointerEvent) => {
    this.lightboxedImgUrl = (e.currentTarget as HTMLImageElement).src;
  };

  closeLightbox = () => {
    this.lightboxedImgUrl = undefined;
  };

  doNext = () => {
    this.index += 1;
    //If we specifically did a "next" action
    //Wait 100ms then autoscroll. This gives a natural slight pause, and allows potential images to paint
    this.scrollDelay = setTimeout(() => {
      this.scrollSelf({ behavior: 'smooth', top: 20000 });
      this.scrollDelay = undefined;
    }, 100);
    if (this.index + 1 === this.stack?.length) {
      this.endOfStackDelay = setTimeout(() => {
        this.showEnd = true;
        this.scrollSelf({ behavior: 'smooth', top: 20000 });
      }, 3000);
    }
  };

  doShowAll = () => {
    this.index = this.stack?.length || this.index;
    if (!this.showAll) {
      this.showEnd = true;
    }
  };

  doEnd = () => {
    this.index = 0;
    this.showEnd = false;
    this.scrollSelf({ behavior: 'instant', top: 0 });
  };

  // #region render

  // Chat Bubbles are the main content blocks
  chatBubbles() {
    const bubbles = [];
    //Iterate until the one we're looking at (this.index check) or the end
    for (let i = 0; (this.showAll || i <= this.index) && i < this.stack!.length; i++) {
      const { from, content, contentType } = this.stack![i];
      const bubble =
        contentType === 'text'
          ? html`<div class="content-bubble bubble-text">
              <p>${content}</p>
              <span class="from">${from}</span>
            </div>`
          : html`<div class="content-bubble bubble-img">
              <img src=${content} @click=${this.imgClicked} />
              <span class="from">${from}</span>
            </div>`;
      bubbles.push(bubble);
    }
    return html`${map(bubbles, (b: TemplateResult) => b)}`;
  }

  // Stack Controls holds the next/show all buttons and the end-of-stack behavior
  stackControls() {
    if (!this.showAll && this.index < this.stack!.length - 1) {
      return html`<div class="chatNavigator">
        <button class="small" @click=${this.doNext}>Next</button>
        <button class="small" @click=${this.doShowAll}>Show All</button>
        <br />
      </div>`;
    } else {
      return html`<div class="end-text">
        <p>End of Stack</p>
        ${this.showEnd && !this.showAll ? html`<a @click=${this.doEnd}>Reset the stack</a>` : ''}
      </div>`;
    }
  }

  lightbox() {
    if (this.lightboxedImgUrl) {
      //TODO convert to popover when popoverAPI is official
      return html`<div class="lightbox" @click=${this.closeLightbox}>
        <img src=${this.lightboxedImgUrl} />
      </div>`;
    } else {
      return html``;
    }
  }

  render() {
    if (this.stackName && this.imgCache.size === 0) {
      this.cacheStack(this.stackName);
    }
    if (!this.gameid) {
      return html`<article><h3>No Game id was provided</h3></article>`;
    }
    if (!this.stackName) {
      return html`<article><h3>Select a stack to begin viewing</h3></article>`;
    }
    if (!this.stacks) {
      return html`<article></article>`;
    }
    this.stack = Object.values(this.stacks![this.stackName]);
    return html` <article>${this.chatBubbles()} ${this.stackControls()}</article>
      ${this.lightbox()}`;
  }
  static styles = css`
    :host {
      display: flex;
      width: 100%;
      height: 100%;
      overflow-y: auto;
      background-color: var(--chat-background, none);
      border-radius: 0.5rem;
      padding: 2rem 1rem 3rem 2rem;
    }

    article {
      display: flex;
      flex-direction: column;
      flex-grow: 1;
      width: 100%;
      height: fit-content;
      gap: 1.75rem;
      color: var(--chat-text, inherit);
    }

    .content-bubble {
      background-color: var(--chat-bubble);
      padding: 1rem 1rem 0;
      border-radius: 1rem;
      width: fit-content;
      max-width: calc(100% - 4rem);
    }

    .bubble-img {
      display: flex;
      flex-direction: column;
      align-self: flex-end;
      align-items: right;
      padding-bottom: 1rem;
    }

    .bubble-text > p {
      font-size: x-large;
      font-weight: 500;
      margin-top: 0;
      margin-bottom: -0.25rem;
      overflow-wrap: break-word;
    }

    .content-bubble > .from {
      position: relative;
      bottom: -0.75rem;
      background-color: var(--chat-from-backdrop);
      color: var(--chat-from-text, inherit);
      border-radius: 1em;
      padding: 0.5em;
      margin-block: -1em;
      width: fit-content;
    }

    .bubble-text > .from {
      left: -0.25rem;
    }

    .bubble-img > .from {
      align-self: flex-end;
      bottom: -1.4rem;
    }

    .content-bubble > img {
      width: 100%;
      max-width: 600px;
      max-height: calc(100vh-16rem);
      aspect-ratio: 1.6;
    }

    .lightbox {
      position: fixed;
      display: flex;
      justify-content: center;
      align-items: center;
      top: 0;
      left: 0;
      height: 100vh;
      width: 100vw;
      background-color: #0008;
      z-index: 2;
    }

    .lightbox img {
      width: 90vw;
      aspect-ratio: 1.6;
      max-width: 1100px;
    }

    img {
      border-radius: 1rem;
    }

    .chatNavigator {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 1rem;
      width: 100%;
      margin: 1rem;
      flex: none;
    }

    button {
      width: 100%;
      max-width: 24rem;
      height: 4rem;
      line-height: 2rem;
      font-size: 1.5rem;
      background-color: var(--color-button);
      color: white;
      border: none;
      border-radius: 1rem;
    }

    button:hover,
    .selected {
      background-color: var(--color-button-hover);
      cursor: pointer;
    }

    button:disabled {
      background-color: var(--color-button-disabled);
    }

    button.small {
      white-space: nowrap;
      width: fit-content;
      height: 2.5rem;
      line-height: 1.5rem;
      padding: 0 1rem;
      font-size: 1rem;
      box-sizing: content-box;
    }

    .end-text {
      text-align: center;
    }

    .end-text a {
      color: var(--color-link);
      cursor: pointer;
    }

    .end-text a:hover {
      color: var(--color-link-hover);
    }

    .end-text p {
      color: var(--color-text);
    }

    .content-bubble {
      box-shadow: 0 0 12px -4px #0006;
      & > .from {
        box-shadow: 0 3px 8px -4px #0006;
      }
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'byfo-review-chat': ByfoReviewChat;
  }
}
