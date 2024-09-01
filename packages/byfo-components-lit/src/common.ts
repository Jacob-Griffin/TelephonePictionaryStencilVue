import { css, html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

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
`;

/**
 * Markdown parsing function
 * @param input - The string to be parsed
 * @param allowLinks - Define whether links should be parsed as links
 * @returns The parsed markdown as standard html in a string
 */
const parse = (input: string, allowLinks: boolean) => {
  const withoutTags = input.replace('<', '&lt;').replace('>', '&gt');
  const withLinks = allowLinks ? withoutTags.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>') : withoutTags;
  const withBold = withLinks.replace(/(\*\*|__)(\*?)(.+?)\2\1/g, '<strong>$2$3$2</strong>');
  const withItalics = withBold.replace(/\*([^\*]*)\*/g, '<em>$1</em>');
  return withItalics;
};

/**
 * Makes sure parsed markdown is safe to render
 * @param input - html string
 * @returns - a safe html string
 */
const sanitize = (input: string) => {
  return input.replace(/<\\?script>/, '');
};

/**
 * Runs the markdown pipeline to generate a complete parsed markdown element
 * @param input - The markdown string to be parsed
 * @param allowLinks - Define whether links should be parsed as links
 * @returns The parsed markdown as a lit HTML fragment
 */
export const format = (input: string, allowLinks: boolean) => {
  const output = sanitize(parse(input, allowLinks));
  return html`<span class="markdown">${unsafeHTML(output)}</span>`;
};

export function getChildById(id: string, el: { renderRoot: DocumentFragment | HTMLElement } | DocumentFragment | HTMLElement): HTMLElement | null {
  const root = 'renderRoot' in el ? el.renderRoot : el;
  if ('getElementById' in root) {
    return root.getElementById(id);
  } else if ('querySelector' in root) {
    return root.querySelector(`#${id}`);
  } else {
    console.error('getChildById called without a valid target');
    return null;
  }
}

export function getChildrenByTagName(tagname: 'input', el: { renderRoot: DocumentFragment | HTMLElement } | DocumentFragment | HTMLElement): HTMLInputElement[] | null;
export function getChildrenByTagName(
  tagname: keyof HTMLElementTagNameMap,
  el: { renderRoot: DocumentFragment | HTMLElement } | DocumentFragment | HTMLElement,
): HTMLElement[] | null {
  const root = 'renderRoot' in el ? el.renderRoot : el;
  if ('getElementsByTagName' in root) {
    return [...root.getElementsByTagName(tagname)];
  } else if ('querySelectorAll' in root) {
    return [...root.querySelectorAll(tagname)];
  } else {
    console.error('getChildrenByTagName called without a valid target');
    return null;
  }
}
