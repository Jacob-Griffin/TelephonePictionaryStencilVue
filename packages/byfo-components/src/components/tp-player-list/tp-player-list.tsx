import { Component, Host, h, Prop, VNode } from '@stencil/core';
import type {Player,RoundData} from 'byfo-utils'
import { calculatePlayerNameWidth } from 'byfo-utils';

@Component({
  tag: 'tp-player-list',
  styleUrl: 'tp-player-list.css',
  shadow: true,
})
export class TpPlayerList {
  @Prop() players: Player[] = [];
  @Prop() messageStart?:string;
  @Prop() messageEnd?:string;
  @Prop() roundData?: RoundData;
  @Prop() addTime?:()=>void;
  @Prop() lastRound?: string = '';

  get hasRoundData() {
    return typeof this.roundData?.endTime === 'number';
  }

  parseMessage(message:string): VNode {
    if(!message){
      return null;
    }
    if(!/\[[^\]]+\]\(.+\)/.test(message)){
      return <p class='meta-text'>{message}</p>
    } else {
      const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
      const bits = message.split(linkRegex);
      const all = [];
      for(let i = 0; i < bits.length; i+=3){
        all.push(bits[i]);
        if(bits.length - i >= 3){
          all.push(<a href={bits[i+2]}>{bits[i+1]}</a>);
        }
      }
      return <p>{all}</p>;
    }
  }

  renderPlayers(){
    return this.players.map(player => {
      const name = <p>{player.username}</p>
      if(this.hasRoundData){
        const status = player.lastRound < this.roundData.roundnumber ? 'pending' : 'ready';
        return <div>
          <div><div class={status}>{status === 'pending' ? '•' : '✓'}</div></div>
          {name}
        </div>
      } else {
        return name;
      }
    });
  }

  render() {
    const nameWidth = calculatePlayerNameWidth(this.players);
    let roundInfo = null;
    if(this.hasRoundData){
      roundInfo = [`Round ${this.roundData.roundnumber}/${this.lastRound}`];
      if(this.roundData.endTime !== -1) {
        roundInfo.push(<tp-timer endtime={this.roundData.endTime} addTime={this.addTime}></tp-timer>)
      }
    }


    return (
      <Host>
        <section style={{'--nameWidth:':`${nameWidth}px`}}>
          {roundInfo}
          {this.parseMessage(this.messageStart)}
          {this.renderPlayers()}
          {this.parseMessage(this.messageEnd)}
        </section>

      </Host>
    );
  }

}