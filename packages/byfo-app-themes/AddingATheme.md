# Adding a theme

Themes are now moderately typed, so that the variable names are used properly. Themes are now described in typescript files, and built live

## Create the theme

- Run `pnpm generate:theme` to produce a template file for your theme
- Replace the theme colors and images as needed
- If your theme is built on top of other themes, import those themes and include them in the themeExtends property
  - Themes are ordered from highest priority to lowest priorty. If multiple themes define the same variable, the sooner entries will "win"
