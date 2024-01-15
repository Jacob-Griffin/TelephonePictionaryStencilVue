# Adding a theme

Themes are handled entirely by the byfo-themes package in a pretty simplistic way. To add a theme, simply add a css file to themes, and run pnpm build.

## What do I need to put in the css file?

You need to write a css declaration containing definitions for the theme's css variables. See [Theme Considerations](./ThemeConsiderations.md) for details on what these are.
The selectors for this declaration do not matter, the build process will parse the variable definitions only and add its own selector based on the filename.

There are a few metadata properties you can add as comments too:

`/* @default-name: "My Theme" */` is primarily used for the UI of the theme selector
`/* @extends: "other-theme" */` is used to build themes on top of other themes. When extends is not set, it defaults to whatever the default theme is (Currently "light")

## Example

dark.css

```css
/* @display-name: "Dark" */
/* @extends: "light" */
.dark {
  --color-background: #181818;

  --color-heading: #ffffff;
  --color-text: rgba(235, 235, 235, 0.64);

  --color-link: rgb(70, 70, 200);
  --color-link-hover: rgb(80, 80, 220);

  --icon: url('/byfo-logo.png');

  --scroll-color: #999;
}
```
