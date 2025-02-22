import { css } from 'lit';

export default css`
  button {
    height: 2rem;
    color: var(--byfo-text-button);
    background: var(--byfo-color-button);
  }

  button[active] {
    color: var(--byfo-text-active);
    background: var(--byfo-color-active);
  }

  button[important] {
    color: var(--byfo-text-important);
    background: var(--byfo-color-important);
  }
`;
