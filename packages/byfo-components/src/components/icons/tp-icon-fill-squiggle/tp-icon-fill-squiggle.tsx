import { Component, Prop, h } from '@stencil/core';

@Component({
  tag: 'tp-icon-fill-squiggle',
  styleUrl: 'tp-icon-fill-squiggle.css',
  shadow: true,
})
export class TpIconFillSquiggle {
  @Prop() strokewidth: string;

  get internalStrokeWidth() {
    if (!this.strokewidth) {
      return '1.25px';
    }

    if (/^\d*\.?\d+$/.test(this.strokewidth)) {
      //Raw number case: convert to px
      return `${this.strokewidth}px`;
    }
    if (/^\d*\.?\d+%$/.test(this.strokewidth)) {
      //Percent case: use the value to apply my built in range
      const percent = parseFloat(this.strokewidth.replace('%', ''));
      const min = 0.5;
      const max = 2;
      const value = min + (max - min) * (percent / 100);
      return `${value}px`;
    } else if (/\d*\.?\d+px/.test(this.strokewidth)) {
      //px case: just pass it along
      return this.strokewidth;
    } else {
      //Error case
      console.warn(`Invalid stroke width ${this.strokewidth}. Use [number], [number]px or [number]%`);
      return '0px';
    }
  }

  render() {
    return (
      <svg width="48" height="48" viewBox="0 0 12.7 12.7" xmlns="http://www.w3.org/2000/svg">
        <g>
          <path
            class="squiggle"
            style={{ 'stroke-width': this.internalStrokeWidth }}
            d="m 3.4507602,1.3291817 c 0,0 -1.6399363,1.0096969 -2.1982621,1.9554308 C 0.69417235,4.2303464 0.97622094,5.5361879 2.735047,5.0227734 4.4938731,4.5093589 6.1158339,2.7173529 7.3999636,1.8659667 8.6840932,1.0145805 10.6835,2.4905343 9.0870019,3.7191527 7.4905036,4.9477711 4.6292866,6.8339056 3.2207096,7.7578203 1.8121325,8.6817351 2.9684602,11.092467 5.1377986,9.7899345 7.3071369,8.487402 9.2235712,6.0256732 10.237256,5.5851193 11.25094,5.1445654 12.316385,6.3402137 11.451412,7.3871832 10.586439,8.4341527 9.8581997,8.1460909 8.8825123,9.559884 c -0.9756874,1.413793 0.4217596,1.94265 0.4217596,1.94265"
            id="path1679"
          />
        </g>
      </svg>
    );
  }
}
