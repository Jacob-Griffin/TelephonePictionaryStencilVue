import { Component, h, Prop } from '@stencil/core';

@Component({
  tag: 'tp-content',
  styleUrl: 'tp-content.css',
  shadow: true,
})
export class TpContent {
  @Prop() content:string;
  @Prop() type:string;

  render() {
    return (
      <div class='shadow-md shadow-gray-400 border border-slate-500 rounded-lg
      text-black text-3xl text-center font-medium p-4 w-full bg-white aspect-[5/3]'>
        {
          this.type==='image'
          ?
          <img class='w-full h-full' src={this.content}></img>
          :
          <p class="selectable">{this.content}</p>
        }
      </div>
    );
  }

}
