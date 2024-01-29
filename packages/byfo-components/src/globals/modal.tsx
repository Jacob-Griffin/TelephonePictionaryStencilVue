import { Host, h } from '@stencil/core';

export type ModalLike = {
  renderBody: () => Element[];
  enabled: boolean;
};
const checkClose = (e: Event, context: ModalLike) => {
  const clicked = e.target as HTMLElement;
  if (clicked.classList.contains('background') || clicked.closest('.close')) {
    context.enabled = false;
  }
};
export const renderModal = (context: ModalLike) => {
  if (!context.enabled) {
    return <Host></Host>;
  }
  return (
    <Host>
      <section class="background" onClick={e => checkClose(e, context)}>
        <article>
          <button class="close" onClick={e => checkClose(e, context)}>
            <tp-icon icon="x"></tp-icon>
          </button>
          {...context.renderBody()}
        </article>
      </section>
    </Host>
  );
};
