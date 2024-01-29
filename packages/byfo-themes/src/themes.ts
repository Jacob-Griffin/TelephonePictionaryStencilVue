// This file is auto generated. Run 'pnpm build' to regenerate based on the themes in the folder
export const themes = {
  candy: {
    key: 'candy',
    displayName: 'Candy Vomit',
    css: 'body.candy{--color-brand: #f42f65;--color-button: var(--color-brand);--color-button-hover: #8a43db;--color-important: #8a43db;--image-background: url(\'/candyCarnival-bkgd.jpg\');--icon: url(\'/byfo-logo2.png\');--chat-background: #888b;--optional-text-backdrop: var(--color-backdrop);}',
    extends: 'light'
  },
  classic: {
    key: 'classic',
    displayName: 'Classic',
    css: 'body.classic{--color-brand: #2c33bf;--color-button: var(--color-brand);--color-button-hover: #8cc63f;--image-background: url(\'/basic-bkgd.jpg\');--chat-background: #888b;}',
    extends: 'light'
  },
  dark: {
    key: 'dark',
    displayName: 'Dark',
    css: 'body.dark{--color-background: #181818;--color-heading: #ffffff;--color-text: rgba(235, 235, 235, 0.64);--color-link: rgb(70, 70, 200);--color-link-hover: rgb(80, 80, 220);--icon: url(\'/byfo-logo.png\');--scroll-color: #999;}',
    extends: 'light'
  },
  light: {
    key: 'light',
    displayName: 'Light',
    css: ':root{--color-brand: rgb(50, 78, 163);--color-button-text: white;--color-background: #f2f2f2;--color-backdrop: rgba(210, 210, 210, 0.85);--color-backdrop-text: #222222;--color-border: rgb(100, 116, 139);--color-heading: #2c3e50;--color-text: #2c3e50;--color-link: rgb(101, 116, 252);--color-link-hover: rgb(70, 70, 200);--color-button: rgb(60, 90, 190);--color-button-hover: rgb(47, 155, 72);--color-button-disabled: #889;--color-important: #f28705;--icon: url(\'/byfo-logo.png\');--small-icon: url(\'/byfo-logo.png\');--color-toggle-handle: #f2f2f2;--chat-from-backdrop: #a4a4a4;} .light{--scroll-color: var(--color-text);--chat-background: var(--color-background);--chat-bubble: var(--color-backdrop);--chat-text: var(--color-backdrop-text);--chat-from-text: var(--color-backdrop-text);}',
    default: true
  }
}