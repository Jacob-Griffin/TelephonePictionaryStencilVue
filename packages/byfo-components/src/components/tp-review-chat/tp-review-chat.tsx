import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'tp-review-chat',
  styleUrl: 'tp-review-chat.css',
  shadow: true,
})
export class TpReviewChat {

  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }

}
