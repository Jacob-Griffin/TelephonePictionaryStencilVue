const parse = (input: string, allowLinks: boolean) => {
  const withoutTags = input.replace('<', '&lt;').replace('>', '&gt');
  const withLinks = allowLinks ? withoutTags.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>') : withoutTags;
  const withBold = withLinks.replace(/(\*\*|__)(\*?)(.+?)\2\1/g, '<strong>$2$3$2</strong>');
  const withItalics = withBold.replace(/\*([^\*]*)\*/g, '<em>$1</em>');
  const withHeaders = withItalics.replace(/^(#{1,4})(.+)$/gm, (_, hashes, content) => `<h${hashes.length + 1}>${content}</h${hashes.length}>`);
  const withBr = withHeaders.replaceAll('\n\n', '<br>');
  return withHeaders;
};

const sanitize = (input: string) => {
  return input;
};

export const formatMarkdown = (input: string, allowLinks: boolean): string => {
  return sanitize(parse(input, allowLinks));
};
