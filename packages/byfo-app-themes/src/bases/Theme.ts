import { ThemeColors, ThemeHoverColors, ThemeImages, ThemeTextColors } from './ThemeSpec';

export class Theme {
  name: keyof ThemeMap = 'none';
  displayName: string;
  styles: { colors?: Partial<ThemeColors>; textColors?: Partial<ThemeTextColors>; hoverColors?: Partial<ThemeHoverColors>; images?: Partial<ThemeImages> };
  isDefault?: boolean;
  themeExtends?: (keyof ThemeMap)[];

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
    const { colors, textColors, hoverColors, images } = this.styles;
    if (colors) {
      for (const key in this.styles.colors) {
        result += `--byfo-color-${key}:${colors[key as keyof ThemeColors]};`;
      }
    }
    if (textColors) {
      for (const key in this.styles.colors) {
        result += `--byfo-text-${key}:${textColors[key as keyof ThemeTextColors]};`;
      }
    }
    if (hoverColors) {
      for (const key in this.styles.colors) {
        result += `--byfo-hover-${key}:${hoverColors[key as keyof ThemeHoverColors]};`;
      }
    }
    if (images) {
      for (const key in this.styles.colors) {
        result += `--byfo-image-${key}:${images[key as keyof ThemeImages]};`;
      }
    }
    result += '}';
    return result;
  }
  install() {
    this.loadStylesheet();
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, this._sheet];
  }
  apply() {
    const attributes = document.documentElement.getAttributeNames().filter(name => name.startsWith('byfo-theme'));
    for (const themetag of attributes) {
      document.documentElement.removeAttribute(themetag);
    }
    const toAdd = [this.name].concat(this.themeExtends!);
    for (const newtheme of toAdd) {
      document.documentElement.setAttribute(`byfo-theme-${newtheme}`, '');
    }
  }
}

declare global {
  interface ThemeMap {
    none: undefined;
  }
}
