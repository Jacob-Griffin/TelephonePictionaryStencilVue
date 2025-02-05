import { parse } from 'marked';

const sanitize = (input: string) => {
  return input.replaceAll(/<script>.+<\/script>/gs, '');
};

export const formatMarkdown = (input: string): string => {
  return sanitize(parse(input) as string).trim();
};
