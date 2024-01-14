# Adding a theme

Themes in this repo are _fairly_ modular, but there's a few things that have to be changed to add one

## The theme data

You must come up with a **key**, a **display name**, and whether or not it **extends**/builds on top of an existing theme. For example, the candy vomit theme uses:

```json
{
  "key": "candy",
  "displayName": "Candy Vomit",
  "extends": "light"
}
```

Keep in mind, **extends** is referring to the **key** of a theme it's extending.

This data will be put into the utils package, at `packages/byfo-utils/src/config.ts`, in the themes object. Lets say we have an example theme that extends dark theme:

```typescript
export const themes: TypeStuff = {
  /*
    ...Existing themes
    },   */
  example: {
    // ⬉ This should match your "key" property you came up with
    key: 'example',
    displayName: 'Example Theme',
    extends: 'dark',
  },
};
```

## The actual theme

Once the data is in to tell the app that your theme exists, you then need to actually build the theme. This will be a css file under `apps/tp-app/src/assets/themes/`. Your theme should use your **key** as a title, just have one class named after your **key**, and contain the color overrides you're using. See [ThemeConsiderations.md](./ThemeConsiderations.md) for a list of things to be overridden. Example:

```css
/* file name example.css. You should call it the same thing as your key */
.example {
  /* <- This also has to match your "key" property */
  --color-background: #123123;
  --color-brand: #555555;
}
```

## Making sure it gets imported

Finally, once the theme is noted, and has an associated file, make sure this theme gets imported somewhere. There's a really simple file to consolidate theme imports at `apps/tp-app/src/assets/theme-adapter.css`. Go in and just add one line to import `./themes/[your-theme-key].css`. Example:

```css
/* Leave the other imports alone
...    */
@import './themes/example.css';
```
