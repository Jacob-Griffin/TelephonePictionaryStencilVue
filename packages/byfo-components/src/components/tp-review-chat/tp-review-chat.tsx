import { Component, Element, Host, Prop, State, Watch, h } from '@stencil/core';

interface Content {
  from: string;
  contentType: string;
  content: string;
}

@Component({
  tag: 'tp-review-chat',
  styleUrl: 'tp-review-chat.css',
  shadow: true,
})
export class TpReviewChat {
  @Prop() stackProxy;
  @Prop() showAll;

  @State() index: number = 0;
  @State() showEnd: boolean;
  @State() lightboxedImgUrl: string;

  @Element() el;

  stack: Content[];
  endOfStackDelay;
  scrollDelay; //We want to hold onto the scroll timeout so we can cancel it if there is a stack change
  stackChanging = false; //Likewise, if we find out that the timeout hasn't started yet, make sure the autoscroll knows

  @Watch('stackProxy')
  stackChangeHandler() {
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
      setTimeout(() => (this.stackChanging = false), 200);
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
      this.el.scroll({ behavior: 'smooth', top: 20000 });
      this.scrollDelay = undefined;
    }, 100);
    if (this.index === this.stack?.length - 1) {
      this.endOfStackDelay = setTimeout(() => {
        this.showEnd = true;
        this.el.scroll({ behavior: 'smooth', top: 20000 });
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
    this.el.scroll({ behavior: 'instant', top: 0 });
  };

  // #region render

  // Chat Bubbles are the main content blocks
  chatBubbles = () => {
    const bubbles = [];
    //Iterate until the one we're looking at (this.index check) or the end
    for (let i = 0; (this.showAll || i <= this.index) && i < this.stack.length; i++) {
      const { from, content, contentType } = this.stack[i];
      const bubble =
        contentType === 'text' ? (
          <div class="content-bubble bubble-text">
            <p>{content}</p>
            <span class="from">{from}</span>
          </div>
        ) : (
          <div class="content-bubble bubble-img">
            <img src={content} onClick={this.imgClicked} />
            <span class="from">{from}</span>
          </div>
        );
      bubbles.push(bubble);
    }
    return bubbles;
  };

  // Stack Controls holds the nex/show all buttons and the end-of-stack behavior
  stackControls = () =>
    this.index < this.stack?.length - 1 ? (
      <div class="chatNavigator">
        <button class="small" onClick={this.doNext}>
          Next
        </button>
        <button class="small" onClick={this.doShowAll}>
          Show All
        </button>
        <br />
      </div>
    ) : (
      <div class="end-text">
        <p>End of Stack</p>
        {this.showEnd ? <a onClick={this.doEnd}>Reset the stack</a> : ''}
      </div>
    );

  lightbox = () =>
    this.lightboxedImgUrl ? (
      //TODO convert to popover when popoverAPI is official
      <div class="lightbox" onClick={this.closeLightbox}>
        <img src={this.lightboxedImgUrl}></img>
      </div>
    ) : (
      <div>{this.lightboxedImgUrl}</div>
    );

  render() {
    this.stack = Object.values(this.stackProxy ?? {});
    return (
      <Host>
        <article>
          {this.chatBubbles()}
          {this.stackControls()}
        </article>
        {this.lightbox()}
      </Host>
    );
  }
  // #endregion
}
