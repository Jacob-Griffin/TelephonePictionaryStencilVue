const parseList = (md: string) => {
  const lines = md.split('\n');
  let indentLevel = 0;
  const mdLines: string[] = [];
  lines.forEach(line => {
    const r = line.match(/^(\t|  )*-(.+)/);
    let newIL = 0;
    if (!!r) {
      newIL = 1;
      if (!!r[1]) {
        newIL += r[1].length;
      }
    }

    while (indentLevel < newIL) {
      mdLines.push('<ul>');
      indentLevel += 1;
    }
    while (indentLevel > newIL) {
      mdLines.push('</ul>');
      indentLevel -= 1;
    }
    mdLines.push(newIL > 0 ? `<li>${r[2]}</li>` : line);
  });
  return mdLines.join('\n');
};

const parse = (input: string, allowLinks: boolean) => {
  const withoutTags = input.replace('<', '&lt;').replace('>', '&gt');
  const withLinks = allowLinks ? withoutTags.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>') : withoutTags;
  const withBold = withLinks.replace(/(\*\*|__)(\*?)(.+?)\2\1/g, '<strong>$2$3$2</strong>');
  const withItalics = withBold.replace(/\*([^\*]*)\*/g, '<em>$1</em>');
  const withHeaders = withItalics.replace(/^(#{1,4})(.+)$/gm, (_, hashes, content) => `<h${hashes.length + 1}>${content}</h${hashes.length}>`);
  const withList = parseList(withHeaders);
  const withBr = withList.replaceAll(/(?<!<\/(?:h\d|p)>)\n\n/g, '<br>');
  return withBr;
};

const sanitize = (input: string) => {
  return input.replaceAll(/<script>.+<\/script>/gs, '');
};

export const formatMarkdown = (input: string, allowLinks: boolean): string => {
  return sanitize(parse(input, allowLinks));
};
