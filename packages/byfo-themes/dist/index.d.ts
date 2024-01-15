export type Theme = {
    key: string;
    displayName: string;
    extends?: string;
    css: string;
    default?: boolean;
};
export declare const themes: {
    [key: string]: Theme;
};
export declare function injectThemes(): void;
