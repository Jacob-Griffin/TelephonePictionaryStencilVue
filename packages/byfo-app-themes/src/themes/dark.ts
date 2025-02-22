import { Theme } from '../bases/Theme';
import { light } from './light';

export const dark = new Theme({
  name: 'dark',
  displayName: 'Dark',
  themeExtends: [light],
  styles: {
    colors: {
      active: 'red',
    },
    textColors: {
      main: 'blue',
    },
  },
});

export default light;

declare global {
  interface ThemeMap {
    dark: typeof dark;
  }
}
