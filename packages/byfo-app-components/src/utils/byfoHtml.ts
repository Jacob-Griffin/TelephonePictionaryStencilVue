import { html as litHtml } from 'lit';

export const html: typeof litHtml = (template, ...values) => {
  const els = template.join('').matchAll(/<(?<tag>byfo-[a-z\-]+)/gu);
  for (const match of els) {
    const { tag } = match.groups ?? {};
    if (tag && !window.customElements.get(tag)) {
      console.log(`Importing custom element ${tag}!`);
      import(`../components/${tag}.ts`);
    }
  }
  return litHtml(template, ...values);
};
