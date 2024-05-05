import { Component, Host, h, Prop } from '@stencil/core';
import type {Player,RoundData} from 'byfo-utils'
import { config } from 'byfo-utils';
import { calculatePlayerNameWidth } from 'byfo-utils';

@Component({
  tag: 'tp-player-list',
  styleUrl: 'tp-player-list.css',
  shadow: true,
})
export class TpPlayerList {
  @Prop() players: Player[] = [];
  @Prop({reflect:true}) message?:string;
  @Prop() roundData?: RoundData;
  @Prop() isHosting?: boolean = false;
  @Prop() addTime?:()=>void;

  get hasRoundData() {
    return typeof this.roundData?.endTime === 'number';
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
      roundInfo = [`Round ${this.roundData.roundnumber}`];
      if(this.roundData.endTime !== -1) {
        roundInfo.push(<tp-timer endtime={this.roundData.endTime}></tp-timer>)
      }
    }

    const innerHTML = this.message.replace(/<[^>]+>/,'').replace(/\[([^\]]+)\]\((.+)\)/,'<a href="$2">$1</a>');
    const message = <p></p>
    message.innerHTML = innerHTML;
    return (
      <Host>
        <section style={{'--nameWidth:':`${nameWidth}px`}}>
          {roundInfo}
          {message}
          {this.renderPlayers()}
          {this.isHosting && this.roundData?.endTime > 0 ?
        <button onClick={this.addTime} class="small">Add {config.addTimeIncrement}s</button>
        : null}
        </section>
      </Host>
    );
  }

}