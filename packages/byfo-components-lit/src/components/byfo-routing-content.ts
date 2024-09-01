import { css, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { LitElement } from 'lit';
import { BYFOFirebaseAdapter, TPStore, validGameId, validUsername } from 'byfo-utils';
import { inject } from '../dependencies';
import { appStyles, getChildrenByTagName } from '../common';

const categoryStrings = Object.freeze({
  header: {
    join: 'Join game',
    host: 'Host game',
    review: 'View completed game',
    search: 'Search completed games',
  },
  action: {
    join: 'Join',
    host: 'Host',
    review: 'View',
    search: 'Search',
  },
  input: {
    gameid: 'Game Id',
    name: 'Name',
    search: 'Search',
  },
});

/**
 * Description of your element here. Use @ property doc tags to describe props
 */
@customElement('byfo-routing-content')
export class ByfoRoutingContent extends LitElement {
  @property() gameid?: string;
  @property() type?: RouteType;

  @state() inputs: Inputs = {};
  @state() inputsValid: boolean = false;
  @state() errorText?: string;

  @inject firebase?: BYFOFirebaseAdapter;
  @inject store?: TPStore;

  uses(type: keyof Inputs) {
    return !!this.renderRoot.querySelector(`[input-for="${type}"]`);
  }

  get filled() {
    return getChildrenByTagName('input', this)?.every(input => input.value && input.value.length > 0);
  }

  validateInputs() {
    if (this.uses('gameid') && this.inputs.gameid && !validGameId(this.inputs.gameid)) {
      this.errorText = 'Invalid gameId';
      return false;
    }
    if (this.type === 'search') {
      if (!this.store?.searchAs) {
        this.errorText = 'Search requires that you set a username to search as.\nCheck your settings (top right)';
        return false;
      } else {
        this.errorText = '';
      }
    }
    if (this.uses('name') && this.inputs.name) {
      const result = validUsername(this.inputs.name);
      console.log(result);
      if (typeof result === 'string') {
        this.errorText = result;
        return false;
      } else {
        this.errorText = '';
      }
    }
    return this.filled;
  }

  handleInput(e: TargetedInputEvent) {
    const key = e.target.getAttribute('input-for') as keyof Inputs;
    this.inputs[key] = e.target.value;
    this.inputsValid = this.validateInputs() ?? false;
  }

  handleEnter(e: KeyboardEvent) {
    if (e.key === 'Enter' && this.validateInputs()) {
      this.handleRoute();
    }
  }

  async handleRoute() {
    if (!this.validateInputs()) {
      return;
    }
    const { gameid, name } = this.inputs;
    let detail = {} as ModalAction;
    switch (this.type) {
      case 'join': {
        const result = await this.firebase!.addPlayerToLobby(parseInt(gameid!), name!);
        if (result.action === 'error') {
          this.errorText = result.detail;
          return;
        }
        detail = {
          gameid,
          name,
          dest: result.dest!,
        };
        if (result.detail) {
          detail = { ...detail, playerid: result.detail };
        }
        break;
      }
      case 'host': {
        const gameid = await this.firebase?.createGame(name!);
        if (!gameid) {
          this.errorText = 'Problem creating lobby';
          return;
        }
        detail = {
          gameid,
          name,
        };
        break;
      }
      case 'review': {
        const status = await this.firebase?.getGameStatus(parseInt(gameid!));
        if (!status) {
          this.errorText = 'Game does not exist';
          return;
        }
        if (!status.finished) {
          this.errorText = 'Game not finished';
          return;
        }
        detail = { gameid };
        break;
      }
      case 'search': {
        detail = { query: this.inputs.search };
        break;
      }
    }
    const event = new CustomEvent<ModalAction>(`tp-modal-action-${this.type}`, { detail });
    document.dispatchEvent(event);
  }

  renderInput(type: keyof Inputs) {
    return html`<h3>${categoryStrings.input[type]}</h3>
      <input
        type="text"
        input-for=${type}
        @input=${this.handleInput}
        @keydown=${this.handleEnter}
        value=${this.inputs[type] ?? (this.type === 'join' ? this.store?.getRejoinData()?.[type as 'name' | 'gameid'] : '')}
      />`;
  }

  render() {
    this.validateInputs();
    if (!this.type) {
      return html``;
    }
    return html`<h2>${categoryStrings.header[this.type!]}${this.gameid ? ` ${this.gameid}` : ''}</h2>
      ${['join', 'host'].includes(this.type) ? this.renderInput('name') : html``} ${['join', 'review'].includes(this.type) ? this.renderInput('gameid') : html``}
      ${this.type === 'search' ? this.renderInput('search') : html``} ${this.errorText ? html`<p>${this.errorText}</p>` : html``}
      <button @click=${this.handleRoute} disabled=${!this.inputsValid || nothing}>${categoryStrings.action[this.type]}</button>`;
  }
  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }
    ${appStyles}
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'byfo-routing-content': ByfoRoutingContent;
  }
  interface DocumentEventMap {
    'tp-modal-action-host': CustomEvent<ModalAction>;
    'tp-modal-action-join': CustomEvent<ModalAction>;
    'tp-modal-action-review': CustomEvent<ModalAction>;
    'tp-modal-action-search': CustomEvent<ModalAction>;
  }
}
