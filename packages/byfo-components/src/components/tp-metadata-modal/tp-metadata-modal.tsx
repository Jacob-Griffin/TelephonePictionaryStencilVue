import { Component, Prop, h } from '@stencil/core';
import { renderModal } from '../../globals/modal';
import type { Metadata } from 'byfo-utils';

@Component({
  tag: 'tp-metadata-modal',
  styleUrl: 'tp-metadata-modal.css',
  shadow: true,
})
export class TpMetadataModal {
  @Prop({ reflect: true, attribute: 'modal-enabled' }) enabled: boolean;
  @Prop() gameid: string;
  @Prop() metadata: Metadata = { date: 'unknown', roundLength: 180000 };

  timeString(ms: number) {
    if (ms < 0) {
      return '';
    }
    let seconds = ms / 1000;
    const minutes = Math.floor(seconds / 60);
    seconds -= minutes * 60;
    if (minutes > 0 && seconds > 0) {
      return `${minutes} minutes, ${seconds} seconds`;
    }
    if (minutes > 0) {
      return `${minutes} minutes`;
    }
    if (seconds > 0) {
      return `${seconds} seconds`;
    }
  }

  formatDate(date: string) {
    if(date === 'unknown'){
      return 'Unknown'
    }
    const datePattern = /(?<day>\w{3} \w{3} \d{2} \d{4}) (?<time>[\d:]+) (?<offset>\w{3}[+\-]\d{4}) \((?<timezone>.+)\)/;
    const { groups: parsed } = datePattern.exec(date);
    return [`${parsed.day} @${parsed.time} `, <abbr title={parsed.offset}>{parsed.timezone}</abbr>];
  }
  renderBody() {
    const header = <h2>Game {this.gameid}</h2>;
    const date = (
      <p>
        <strong>Game finished: </strong>
        {this.formatDate(this.metadata.date)}
      </p>
    );
    const roundLength = (
      <p>
        <strong>Round Length: </strong>
        {this.timeString(this.metadata.roundLength)}
      </p>
    );
    return [header, date, roundLength];
  }
  render() {
    return renderModal(this);
  }
}
