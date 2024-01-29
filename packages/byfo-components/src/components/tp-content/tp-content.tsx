import { Component, h, Prop } from '@stencil/core';

@Component({
  tag: 'tp-content',
  styleUrl: 'tp-content.css',
  shadow: true,
})
export class TpContent {
  @Prop() content: string;
  @Prop() type: string;
  @Prop() sendingTo: string;

  render() {
    return (
      <article>
        {this.type === 'image' ? <img src={this.content}></img> : <p>{this.content}</p>}
        {this.sendingTo && this.type !== 'image' ? (
          <p class="destination">
            <strong>Sending to:</strong> {this.sendingTo}
          </p>
        ) : null}
      </article>
    );
  }
}
