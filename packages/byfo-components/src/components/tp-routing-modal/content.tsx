import { h } from '@stencil/core';
import { BYFOFirebaseAdapter, validUsername } from 'byfo-utils';

//#region Fields
const nameField = {
  key: 'name',
  display: 'Name',
  isValid: (name: string) => {
    if (!name) {
      return false;
    }
    const isValidName = validUsername(name);
    return isValidName;
  },
};

const gameIdField = {
  key: 'gameid',
  display: 'Game Id',
  isValid: (id: string) => /[0-9]{0,7}/.test(id),
};

export type Field = {
  key: string;
  display: string;
  isValid: (value: string) => string | boolean;
};
//#endregion

export type ModalAction = {
  gameid: string;
  name?: string;
  dest?: 'lobby' | 'game';
};

export type ConstructorProps = {
  rerender: () => void;
  firebase: BYFOFirebaseAdapter;
};

export class ModalContent {
  constructor({ rerender, firebase }: ConstructorProps) {
    this.rerender = rerender;
    this.firebase = firebase;
  }
  // Rerender and respond are used to pass stuff back to the parent modal
  rerender: () => void;
  firebase: BYFOFirebaseAdapter;

  headerText: string;

  //For "form" modals
  actionText: string;
  useAction: () => void;

  fields: Field[] = [];
  fieldValues: {
    [key: string]: string;
  } = {};

  hasError: boolean = false;
  error: string = '';
  actionError: string = '';

  verifyFields = () => {
    let newError: string | boolean = false;
    this.fields.some(field => {
      const result = field.isValid(this.fieldValues[field.key]);
      console.log(result);
      if (typeof result === 'string') {
        newError = result;
        return true;
      }
      if (result === false) {
        newError = true;
        // Don't return, if there's a non-silent error, we still want to see it
      }
    });
    if (newError) {
      if (this.error === newError) return;
      this.error = typeof newError === 'string' ? newError : '';
      this.hasError = true;
    } else {
      this.error = '';
      this.hasError = false;
    }
  };

  fieldInput = (e: InputEvent) => {
    this.actionError = '';
    const input = e.target as HTMLInputElement;
    this.fieldValues[input.id] = input.value;
    this.rerender();
  };

  actionClick = () => {
    this.verifyFields();
    if (this.hasError) return;
    this.useAction();
    this.rerender();
  };

  render = () => {
    this.verifyFields();
    const header = <h2>{this.headerText}</h2>;
    const body = [];
    this.fields?.forEach((field: Field) => {
      body.push(<p>{field.display}:</p>);
      body.push(<input id={field.key} type="text" onInput={this.fieldInput} />);
      this.fieldValues[field.key] ||= '';
    });
    const action = (
      <button class={this.actionError?.length > 0 ? 'short main-action' : 'main-action'} disabled={this.hasError} onClick={this.actionClick}>
        {this.actionText}
      </button>
    );
    // errorWrap simply has [null] or the error text as an element
    const errorWrap = [this.error.length > 0 && <p>{this.error}</p>, this.actionError?.length > 0 && <p>{this.actionError}</p>];
    // by having the error wrapped then destructured, a null error will simply not exist
    return [header, ...body, ...errorWrap, action];
  };
}

export const createModal = (type: string, rerender: () => void, firebase: BYFOFirebaseAdapter) => {
  if (type === 'host') return new HostModal({ rerender, firebase });
  if (type === 'join') return new JoinModal({ rerender, firebase });
  if (type === 'result') return new ResultModal({ rerender, firebase });
  return null;
};

export class HostModal extends ModalContent {
  headerText = 'Host a game';
  actionText = 'Host';
  fields = [nameField];
  useAction = async () => {
    this.verifyFields();
    if (this.hasError) {
      return;
    }
    const name = this.fieldValues[nameField.key];
    const gameid = await this.firebase.createGame(name);
    if (!gameid) {
      this.actionError = 'Problem creating lobby';
      this.rerender();
      return;
    }

    const event = new CustomEvent<ModalAction>('tp-modal-action-host', {
      detail: {
        gameid,
        name,
      },
    });
    document.dispatchEvent(event);
  };
}

export class JoinModal extends ModalContent {
  headerText = 'Join a game';
  actionText = 'Join';
  fields = [nameField, gameIdField];
  useAction = async () => {
    this.verifyFields();
    if (this.hasError) {
      return;
    }
    const gameid = this.fieldValues[gameIdField.key];
    const name = this.fieldValues[nameField.key];
    const result = await this.firebase.addPlayerToLobby(parseInt(gameid), name);
    if (result.action === 'error') {
      this.actionError = result.detail;
      this.rerender();
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
  };
}

export class ResultModal extends ModalContent {
  headerText = 'Review game results';
  actionText = 'View';
  fields = [gameIdField];
  useAction = async () => {
    this.verifyFields();
    if (this.hasError) {
      return;
    }
    const gameid = this.fieldValues[gameIdField.key];
    const status = await this.firebase.getGameStatus(parseInt(gameid));
    if (!status) {
      this.actionError = 'Game does not exist';
      this.rerender();
      return;
    }
    if (!status.finished) {
      this.actionError = 'Game not finished';
      this.rerender();
      return;
    }

    const event = new CustomEvent<ModalAction>('tp-modal-action-result', {
      detail: {
        gameid,
      },
    });
    document.dispatchEvent(event);
  };
}
