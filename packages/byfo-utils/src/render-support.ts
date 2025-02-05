const parseList = (md: string) => {
  const lines = md.split('\n');
  let indentLevel = 0;
  const mdLines: string[] = [];
  lines.forEach(line => {
    const r = line.match(/^((?!\t| {2})*)-(.+)/);
    if (!r) {
      mdLines.push(line);
      return;
    }
    const newIL = r[1].replaceAll(/ {2}|\t/g, 's').length;

    while (indentLevel < newIL) {
      mdLines.push('<ul>');
      indentLevel += 1;
    }
    while (indentLevel > newIL) {
      mdLines.push('</ul>');
      indentLevel -= 1;
    }
    mdLines.push(r ? `<li>${r[2]}</li>` : line);
  });
  return mdLines.join('\n');
};

const parse = (input: string, allowLinks: boolean) => {
  const withoutTags = input.replace('<', '&lt;').replace('>', '&gt');
  const withLinks = allowLinks ? withoutTags.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>') : withoutTags;
  const withBold = withLinks.replace(/(\*\*|__)(\*?)(.+?)\2\1/g, '<strong>$2$3$2</strong>');
  const withItalics = withBold.replace(/\*([^*]*)\*/g, '<em>$1</em>');
  const withHeaders = withItalics.replace(/^(#{1,4})(.+)$/gm, (_, hashes, content) => `<h${hashes.length + 1}>${content}</h${hashes.length + 1}>`);
  const withList = parseList(withHeaders);
  const withP = withList.replaceAll(/(^[^<][^\n]+)\n{2}/gm, (_, text) => `<p>${text}</p>`);
  const withBr = withP.replaceAll(/(<p>[^<]+)\n/g, (_, content) => `${content}<br>`);
  return withBr;
};

const sanitize = (input: string) => {
  return input.replaceAll(/<script>.+<\/script>/gs, '');
};

export const formatMarkdown = (input: string, allowLinks: boolean): string => {
  return sanitize(parse(input, allowLinks));
};
