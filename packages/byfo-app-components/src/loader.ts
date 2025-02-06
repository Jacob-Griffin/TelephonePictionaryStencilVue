declare global {
  interface Window {
    unknownTags: Set<string>;
    customElementTags: Set<string>;
    installLoader: (root: DocumentFragment) => void;
  }
}
window.unknownTags ??= new Set();
window.customElementTags ??= new Set();

export const installLoader = (root: Document | DocumentFragment) => {
  const upgradeNode = (node: Node) => {
    const tag = node.nodeName.toLowerCase();
    if (!tag.startsWith('byfo-')) return;
    if (window.customElementTags.has(tag) || window.unknownTags.has(tag)) return;
    import(`./components/${tag}.ts`)
      .then(({ default: elClass }) => {
        window.customElements.define(tag, elClass);
        window.customElementTags.add(tag);
      })
      .catch(() => window.unknownTags.add(tag));
  };

  const observer = new MutationObserver(records => {
    records.forEach(record => {
      record.addedNodes.forEach(upgradeNode);
    });
  });
  observer.observe(root, { childList: true, subtree: true });
  root.querySelectorAll('*').forEach(upgradeNode);
};

if (!document.body.hasAttribute('byfo-loader')) {
  installLoader(document);
  document.body.setAttribute('byfo-loader', '');
}
