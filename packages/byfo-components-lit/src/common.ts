import { css } from 'lit-element';

export const appStyles = css`
  ::-webkit-scrollbar {
    background: none;
  }

  ::-webkit-scrollbar-track {
    background: none;
  }

  ::-webkit-scrollbar-button {
    display: none;
  }

  ::-webkit-scrollbar-thumb {
    border-radius: 0.5rem;
    background-color: var(--scroll-color);
  }

  :not(strong) {
    font-weight: normal;
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
    margin: 0;
    position: relative;
    overscroll-behavior: none;
  }

  button {
    width: 100%;
    max-width: 24rem;
    height: 4rem;
    line-height: 2rem;
    font-size: 1.5rem;
    background-color: var(--color-button);
    color: white;
    border: none;
    border-radius: 1rem;
    font-family: inherit !important;
  }

  button:hover,
  .selected {
    background-color: var(--color-button-hover);
    cursor: pointer;
  }

  button:disabled {
    background-color: var(--color-button-disabled);
  }

  button.small {
    white-space: nowrap;
    width: fit-content;
    height: 2.5rem;
    line-height: 1.5rem;
    padding: 0 1rem;
    font-size: 1rem;
    box-sizing: content-box;
  }

  a {
    text-decoration: none;
    color: var(--color-link);
  }

  a:hover {
    color: var(--color-link-hover);
  }

  input[type='text'] {
    height: 3rem;
    width: 100%;
    max-width: 20rem;
    border-radius: 1rem;
    border: none;
    outline: solid 1px;
    outline-color: var(--color-border);
    font-size: 1.4rem;
    text-align: center;
  }

  /* add an outline to text boxes if the theme is some variation of light, or the input is focused */
  input[type='text']:focus,
  .light input[type='text'] {
    outline-color: var(--color-brand);
  }

  .really {
    --optional-text-backdrop: var(--color-backdrop);
  }
  .needs-backdrop {
    background-color: var(--optional-text-backdrop);
    border-radius: 1rem;
    padding: 0.5rem 1rem;
    margin: -0.25rem;
  }
`;

export const toggleStyles = css`
  .toggle-wrapper {
    height: 1.32rem;
    width: 2.3rem;
    position: relative;
    border-radius: 1rem;
    background-color: #777;
    cursor: pointer;
  }

  .toggle-wrapper.checked {
    background-color: var(--color-brand);
  }

  .toggle-wrapper > input {
    visibility: hidden;
  }

  .toggle-wrapper > label {
    display: block;
    position: absolute;
    cursor: pointer;
    top: 0.15rem;
    left: 0.15rem;
    transition: left 0.2s;
    background-color: var(--color-toggle-handle);
    z-index: 1;
    height: 1rem;
    width: 1rem;
    border-radius: 0.55rem;
  }

  input:checked + label {
    left: 1.15rem;
  }
`;

export interface TargetedEvent extends Event {
  target: HTMLElement;
}
export interface TargetedInputEvent extends InputEvent {
  target: HTMLInputElement;
}
