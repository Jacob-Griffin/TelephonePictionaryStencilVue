import { css, CSSResult } from 'lit';

/**
 * Lit CSS fragment that applies top level app styles. Used for structural components, but not necessarily inline
 */
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
    --color-text: var(--color-backdrop-text);
  }
  .needs-backdrop {
    background-color: var(--optional-text-backdrop);
    border-radius: 1rem;
    padding: 0.5rem 1rem;
    margin: -0.25rem;
  }

  .padding-wide-s {
    padding: 0.5rem 1rem;
  }
  .padding-wide-m {
    padding: 1rem 2rem;
  }
  .padding-wide-l {
    padding: 2rem 4rem;
  }

  .img-cache {
    height: 0;
    overflow: hidden;
  }
`;

export function injectLitCSS(template: CSSResult, id?: string) {
  let target = id ? document.getElementById(id) : null;
  if (target) {
    if (!target.tagName.match(/style/i)) {
      throw new Error(`Error injecting CSS: Tag exists and is not style`);
    }
  } else {
    target = document.createElement('style');
    if (id) {
      target.id = id;
    }
    document.head.appendChild(target);
  }
  target.innerHTML = template.cssText;
}
