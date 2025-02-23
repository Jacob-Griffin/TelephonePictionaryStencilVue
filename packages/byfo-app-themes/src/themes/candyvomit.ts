import { Theme } from '../bases/Theme';
import { dark } from './dark';

export const candyvomit = new Theme({
  name: 'candyvomit',
  displayName: 'Candy Vomit',
  themeExtends: [dark],
  // Colors can take any valid css <color> string
  // If a color is uncommented, you can hover over the label to see what they're for (depending on IDE, vscode supports this)
  // If a color is not defined, it will simply fall back to the "base" theme's color
  styles: {
    colors: {
      // active: 'white',
      // brand: 'white',
      // background: 'white',
      // backdrop: 'white',
      // border: 'white',
      // button: 'white',
      // disabled: 'white',
      // important: 'white',
      // scroll: 'white',
      // toggle: 'white',
    },
    textColors: {
      // active: 'black',
      // backdrop: 'black',
      // button: 'black',
      // heading: 'black',
      // main: 'black',
      // link: 'black',
    },
    hoverColors: {
      // link: 'red',
      // button: 'red',
    },
    images: {
      // 'icon': "url('/example.png')",
      // 'small-icon': "url('/example.png')",
    },
  },
});

export default candyvomit;

declare global {
  interface ThemeMap {
    candyvomit: typeof candyvomit;
  }
}
