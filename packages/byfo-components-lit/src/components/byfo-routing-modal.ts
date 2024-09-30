import { css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ByfoModal } from './byfo-modal';
import { loadChildElements } from '../loader';

loadChildElements(['byfo-routing-content']);
/**
 * Description of your element here. Use @ property doc tags to describe props
 */
@customElement('byfo-routing-modal')
export class ByfoRoutingModal extends ByfoModal {
  @property() type?: RouteType;
  renderBody() {
    if (!this.enabled) {
      return html``;
    }
    return html`<byfo-routing-content type=${this.type} />`;
  }
  static styles = css`
    ${ByfoModal.styles}
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'byfo-routing-modal': ByfoRoutingModal;
  }
}
