import { ThemeColors, ThemeHoverColors, ThemeImages, ThemeTextColors } from './ThemeSpec';

export class Theme {
  name: keyof ThemeMap;
  displayName: string;
  styles: { colors?: Partial<ThemeColors>; textColors?: Partial<ThemeTextColors>; hoverColors?: Partial<ThemeHoverColors>; images?: Partial<ThemeImages> };
  isDefault?: boolean;
  themeExtends?: Theme[];

  constructor({ name, displayName, styles, isDefault, themeExtends }: Partial<Theme>) {
    if (!name) {
      throw new Error('Theme requires a name');
    }
    this.name = name;
    this.displayName = displayName ?? name!.toLowerCase();
    this.isDefault = isDefault === true;
    this.styles = Object.assign({}, styles);
    this.themeExtends = themeExtends ?? [];
  }

  _sheet = new CSSStyleSheet();
  loadStylesheet() {
    this._sheet.replaceSync(this.toString());
  }
  toString() {
    let result = this.isDefault ? ':root {' : `:root[byfo-theme-${this.name}] {`;
    let { colors, textColors, hoverColors, images } = this.styles;
    const extensions = [this, ...(this.themeExtends ?? [])].toReversed();
    console.log(extensions.map(e => e.name));
    for (const source of extensions) {
      colors = Object.assign({}, colors, source.styles.colors);
      textColors = Object.assign({}, textColors, source.styles.textColors);
      hoverColors = Object.assign({}, hoverColors, source.styles.hoverColors);
      images = Object.assign({}, images, source.styles.images);
    }
    if (colors) {
      for (const key in colors) {
        result += `--byfo-color-${key}:${colors[key as keyof ThemeColors]};`;
      }
    }
    if (textColors) {
      for (const key in textColors) {
        result += `--byfo-text-${key}:${textColors[key as keyof ThemeTextColors]};`;
      }
    }
    if (hoverColors) {
      for (const key in hoverColors) {
        result += `--byfo-hover-${key}:${hoverColors[key as keyof ThemeHoverColors]};`;
      }
    }
    if (images) {
      for (const key in images) {
        result += `--byfo-image-${key}:${images[key as keyof ThemeImages]};`;
      }
    }
    result += '}';
    return result;
  }
  install() {
    if (!window.backgroundSheet) {
      window.backgroundSheet = new CSSStyleSheet();
      window.backgroundSheet.replaceSync(`:root { background-color: var(--byfo-color-background); background-image: var(--byfo-image-background); } `);
      document.adoptedStyleSheets = [...document.adoptedStyleSheets, window.backgroundSheet];
    }
    this.loadStylesheet();
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, this._sheet];
  }
  apply() {
    const attributes = document.documentElement.getAttributeNames().filter(name => name.startsWith('byfo-theme'));
    for (const themetag of attributes) {
      document.documentElement.removeAttribute(themetag);
    }
    document.documentElement.setAttribute(`byfo-theme-${this.name}`, '');
  }
}

declare global {
  interface Window {
    backgroundSheet: CSSStyleSheet;
  }
}
