import { Component, h, Prop } from '@stencil/core';

@Component({
  tag: 'tp-content',
  styleUrl: 'tp-content.css',
  shadow: true,
})
export class TpContent {
  @Prop() content: string;
  @Prop() type: string;

  render() {
    return <article>{this.type === 'image' ? <img src={this.content}></img> : <p>{this.content}</p>}</article>;
  }
}
