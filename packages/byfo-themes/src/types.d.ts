export interface Theme {
  key: string;
  displayName: string;
  extends?: string;
  css: string;
  default?: boolean;
}
