import { css, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { ByfoElement } from './byfo-element';

/**
 * Description of your element here. Use @ property doc tags to describe props
 */
@customElement('byfo-review-chat')
export class ByfoReviewChat extends ByfoElement {
  render() {
    return html``;
  }
  static styles = css`
    .content-bubble {
      box-shadow: 0 0 12px -4px;
      & > .from {
        box-shadow: 0 3px 8px -4px;
      }
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'byfo-review-chat': ByfoReviewChat;
  }
}
