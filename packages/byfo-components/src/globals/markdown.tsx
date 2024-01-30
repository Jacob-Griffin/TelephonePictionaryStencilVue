import { h } from '@stencil/core';

const parse = (input: string, allowLinks: boolean) => {
  const withoutTags = input.replace('<', '&lt;').replace('>', '&gt');
  const withLinks = allowLinks ? withoutTags.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>') : withoutTags;
  const withBold = withLinks.replace(/(\*\*|__)(\*?)(.+?)\2\1/g, '<strong>$2$3$2</strong>');
  const withItalics = withBold.replace(/\*([^\*]*)\*/g, '<em>$1</em>');
  return withItalics;
};

const sanitize = (input: string) => {
  return input;
};

export const format = (input: string, allowLinks: boolean) => {
  const output = sanitize(parse(input, allowLinks));
  return <span class="markdown" innerHTML={output}></span>;
};
