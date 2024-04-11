import { Component, Host, Prop, State, h } from '@stencil/core';
import { BYFOFirebaseAdapter, RejoinData } from 'byfo-utils';
import { ModalAction, nameField } from '../tp-routing-modal/content';

@Component({
  tag: 'tp-join-content',
  styleUrl: 'tp-join-content.css',
  shadow: true,
})
export class TpJoinContent {

  @Prop() gameid:string;
  @Prop() firebase:BYFOFirebaseAdapter;
  @Prop() rejoinData:RejoinData;

  @State() name:string;
  @State() errorText:string;

  handleInput(e:InputEvent) {
    this.name = (e.target as HTMLInputElement).value;
    const result = nameField.isValid(this.name);
    this.errorText = typeof result === 'string' ? result : null;
  }

  handleEnter(e:KeyboardEvent) {
    if(e.key === 'Enter'){
      this.handleJoin();
    }
  }

  async handleJoin(){
    const {gameid, name} = this;
    const isValid = nameField.isValid(name);
    this.errorText = typeof isValid === 'string' ? isValid : null;
    if (this.errorText) {
      return;
    }
    const result = await this.firebase.addPlayerToLobby(parseInt(gameid), name);
    console.log(result);
    if (result.action === 'error') {
      this.errorText = result.detail;
      return;
    }
    const event = new CustomEvent<ModalAction>('tp-modal-action-join', {
      detail: {
        gameid,
        name,
        dest: result.dest,
      },
    });
    document.dispatchEvent(event);
  }

  render() {
    this.name ??= this.rejoinData?.gameid === this.gameid ? this.rejoinData.name : '';
    return (
      <Host>
        <h2>Join Game {this.gameid}</h2>
        <h3>Name:</h3>
        <input type='text' onInput={e=>this.handleInput(e)} onKeyDown={e=>this.handleEnter(e)} value={this.name}/>
        <button onClick={()=>this.handleJoin()} disabled={this.errorText?.length > 0 || !(this.name.length > 0)}>Join Game</button>
        <p class='error'>{this.errorText}</p>
      </Host>
    );
  }

}
