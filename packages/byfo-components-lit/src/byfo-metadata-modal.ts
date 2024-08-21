import { css, html } from 'lit-element';
import { customElement } from 'lit-element/decorators.js';
import { ByfoModal } from './byfo-modal'

/**
 * Description of your element here. Use @ property doc tags to describe props
 */
@customElement('byfo-metadata-modal')
export class ByfoMetadataModal extends ByfoModal {
  render() {
    return html``;
  }
  static styles = css`
    ${ByfoModal.styles}
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'byfo-metadata-modal': ByfoMetadataModal;
  }
}
