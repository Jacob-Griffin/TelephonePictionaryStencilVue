import { Theme } from '../bases/Theme';

export const light = new Theme({
  name: 'light',
  displayName: 'Light',
  isDefault: true,
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
      scroll: 'var(--color-text)',
      toggle: '#f2f2f2',
    },
    textColors: {
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

export default light;

declare global {
  interface ThemeMap {
    light: typeof light;
  }
}
