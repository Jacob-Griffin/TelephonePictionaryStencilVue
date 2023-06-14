import { Component, h, Prop } from '@stencil/core';

//This component was deprecated in favor of the byfo-content component, the native webcomponent version of the same thing

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
