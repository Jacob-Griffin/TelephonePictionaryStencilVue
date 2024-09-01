export function defineByfoElements() {
  const loaded = new Set();
  const searchNode = (node: Node) => {
    //Unfortunately, since vite builds subtrees first, then connects the top level node, we have to manually explore nodes
    if (node.nodeName.startsWith('BYFO-') && !loaded.has(node.nodeName)) {
      import(`./components/${node.nodeName.toLowerCase()}.ts`);
      loaded.add(node.nodeName);
    }
    if (node.hasChildNodes()) {
      node.childNodes.forEach(searchNode);
    }
  };
  const observer = new MutationObserver(entries => {
    entries.forEach(entry => {
      entry.addedNodes.forEach(node => {
        searchNode(node);
      });
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });

  document.body.setAttribute('byfo-loader', 'installed');
}

export function loaderInstalled() {
  return document.body.getAttribute('byfo-loader') === 'installed';
}

export function loadChildElements(els: string[]) {
  els.forEach((componentName: string) => {
    if (!window.customElements.get(componentName)) {
      import(`./components/${componentName}.ts`);
    }
  });
}
