export class CustomTheme {
  backgroundBrightness: number;
  backgroundSaturation: number;
  backgroundBlur: number;
  constructor({ backgroundBrightness, backgroundSaturation, backgroundBlur }: Partial<CustomTheme> = {}) {
    this.backgroundBlur = backgroundBlur ?? 0;
    this.backgroundBrightness = backgroundBrightness ?? 1;
    this.backgroundSaturation = backgroundSaturation ?? 1;
  }
  static fromJsonString(v?: string) {
    const json = v ? JSON.parse(v) : {};
    return new CustomTheme(json);
  }
  toJsonString(): string {
    const { backgroundBrightness, backgroundSaturation, backgroundBlur } = this;
    return JSON.stringify({ backgroundBrightness, backgroundSaturation, backgroundBlur });
  }
}
