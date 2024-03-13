import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'tp-logo',
  styleUrl: 'tp-logo.css',
  shadow: true,
})
export class TpLogo {

  render() {
    return (
      <Host></Host>
    );
  }

}
