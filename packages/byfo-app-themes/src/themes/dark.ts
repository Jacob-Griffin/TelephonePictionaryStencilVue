import { Theme } from '../bases/Theme';
import { light } from './light';

export const dark = new Theme({
  name: 'dark',
  displayName: 'Dark',
  themeExtends: [light],
  styles: {
    colors: {
      background: '#181818',
      scroll: '#999',
    },
    textColors: {
      heading: '#ffffff',
      link: 'rgb(70, 70, 200)',
      main: 'rgba(235, 235, 235, 0.64)',
    },
    hoverColors: {
      link: '#CCF 30%',
    },
  },
});

export default light;

declare global {
  interface ThemeMap {
    dark: typeof dark;
  }
}
