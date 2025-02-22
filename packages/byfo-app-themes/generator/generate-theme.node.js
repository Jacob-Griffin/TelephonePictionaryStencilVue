import { writeFileSync } from 'fs';

let themeName = 'example';
let displayName = 'Light';
let isDefault = false;

const themeContents = `import { Theme } from '../bases/Theme';

export const ${themeName} = new Theme({
  name: '${themeName}',
  displayName: '${displayName}',
  ${isDefault ? 'isDefault: true' : 'themeExtends: []'},
  styles: {
    colors: {
      active: 'rgb(47, 155, 72)',
      brand: 'rgb(50, 78, 163)',
      background: '#f2f2f2',
      backdrop: 'rgba(210, 210, 210, 0.85)',
      border: 'rgb(100, 116, 139)',
      button: 'rgb(60, 90, 190)',
      disabled: '#889',
      important: '#f28705',
      scroll: 'var(--byfo-text-main)',
      toggle: '#f2f2f2',
    },
    textColors: {
      active: 'var(--byfo-text-main)',
      backdrop: '#222222',
      button: 'white',
      heading: '#2c3e50',
      main: '#2c3e50',
      link: 'rgb(101, 116, 252)',
    },
    hoverColors: {
      link: 'rgb(70, 70, 200)',
      button: 'rgb(16, 43, 131)',
    },
    images: {
      'icon': "url('/byfo-logo.png')",
      'small-icon': "url('/byfo-logo.png')",
    },
  },
});

export default ${themeName};

declare global {
  interface ThemeMap {
    ${themeName}: typeof ${themeName};
  }
}`;

writeFileSync(`./src/themes/${themeName}.ts`, themeContents);
