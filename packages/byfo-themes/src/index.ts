import { themes as themeobj } from './themes';
export type Theme = {
  key: string;
  displayName: string;
  extends?: string;
  css: string;
  default?: boolean;
};

export const themes: { [key: string]: Theme } = themeobj;

export function injectThemes() {
  let styleTag = document.getElementById('themes');
  if (!styleTag) {
    styleTag = document.createElement('style');
    styleTag.id = 'themes';
    document.head.appendChild(styleTag);
  }
  let innerHTML = '';
  Object.values(themeobj).forEach(theme => {
    innerHTML += theme.css + '\n';
  });
  styleTag.innerHTML = innerHTML;
}
