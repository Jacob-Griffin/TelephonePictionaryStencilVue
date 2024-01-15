import { themes as themeobj } from './themes';
export const themes = themeobj;

export function injectThemes() {
  let styleTag = document.getElementById('themes');
  if (!styleTag) {
    styleTag = document.createElement('style');
    styleTag.id = 'themes';
    document.head.appendChild(styleTag);
  }
  let innerHTML = '';
  Object.values(themes).forEach(theme => {
    innerHTML += theme.css + '\n';
  });
  styleTag.innerHTML = innerHTML;
}
