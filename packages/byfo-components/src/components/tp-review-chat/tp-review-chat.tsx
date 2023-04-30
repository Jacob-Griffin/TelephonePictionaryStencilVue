import { Component, Element, Host, Prop, Watch, h } from '@stencil/core';

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

  @Element() el;

  @Watch('index')
  indexHandler(newValue,oldValue){
    //If we specifically did a "next" action
    if(newValue - oldValue === 1){
      //Wait 100ms then autoscroll. This gives a natural slight pause, and allows potential images to paint
      setTimeout(() => this.el.scroll({behavior:'smooth',top:20000}),100);
    }
  }

  stack:Content[];

  chatBubbles = () => {
    const bubbles = [];
    //Iterate until the one we're looking at (this.index check) or the end
    for(let i = 0; i <= this.index && i < this.stack.length; i++){
      const {from,content,contentType} = this.stack[i];
      const bubble = contentType === 'text' ?
        <div class='content-bubble bubble-text'><p>{content}</p><span class='from'>{from}</span></div> :
        <div class='content-bubble bubble-img'><img src={content}/><span class='from'>{from}</span></div>;
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
      </Host>
    );
  }

}
