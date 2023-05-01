import { Component, Element, Host, Prop, State, Watch, h } from '@stencil/core';

interface Content {
  from:string;
  contentType:string;
  content:string;
}

@Component({
  tag: 'tp-review-chat',
  styleUrl: 'tp-review-chat.css',
  shadow: true,
})
export class TpReviewChat {

  @Prop() stackProxy;
  @Prop() index;

  @State() lightboxedImgUrl: string;

  @Element() el;

  @Watch('index')
  indexHandler(newValue,oldValue){
    //If we specifically did a "next" action
    if(newValue - oldValue === 1 && !this.stackChanging){
      //Wait 100ms then autoscroll. This gives a natural slight pause, and allows potential images to paint
      this.scrollDelay = setTimeout(() => {
        this.el.scroll({behavior:'smooth',top:20000});
        this.scrollDelay = undefined;
      },100);
    }
  }

  @Watch('stackProxy')
  stackChangeHandler(){
    if(this.scrollDelay){
      clearTimeout(this.scrollDelay);
      this.scrollDelay = undefined;
    }
    else{
      this.stackChanging = true;
      setTimeout(() => this.stackChanging = false, 200);
    }
  }

  imgClicked = (e:PointerEvent) => {
    this.lightboxedImgUrl = (e.currentTarget as HTMLImageElement).src;
  }

  closeLightbox = () => {
    this.lightboxedImgUrl = undefined;
  }

  stack:Content[];
  scrollDelay; //We want to hold onto the scroll timeout so we can cancel it if there is a stack change
  stackChanging = false; //Likewise, if we find out that the timeout hasn't started yet, make sure the autoscroll knows

  chatBubbles = () => {
    const bubbles = [];
    //Iterate until the one we're looking at (this.index check) or the end
    for(let i = 0; i <= this.index && i < this.stack.length; i++){
      const {from,content,contentType} = this.stack[i];
      const bubble = contentType === 'text' ?
        <div class='content-bubble bubble-text'><p>{content}</p><span class='from'>{from}</span></div> :
        <div class='content-bubble bubble-img'><img src={content} onClick={this.imgClicked}/><span class='from'>{from}</span></div>;
      bubbles.push(bubble);
    }
    return bubbles;
  }

  render() {
    this.stack = Object.values(this.stackProxy ?? {});
    return (
      <Host>
      <article>
        {this.chatBubbles()}
      </article>
      { this.lightboxedImgUrl ?
      <div class='lightbox' onClick={this.closeLightbox}>
        <img src={this.lightboxedImgUrl}></img>
      </div>
      : <div>{this.lightboxedImgUrl}</div> }
      </Host>
    );
  }

}
