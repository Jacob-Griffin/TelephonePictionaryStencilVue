import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

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
