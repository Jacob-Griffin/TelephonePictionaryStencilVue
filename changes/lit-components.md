### Added Lit Components

Converted the stencil components library to a brand new lit components library. Functionality should be mostly the same, and differences shouldn't affect front end users.
Internally:

- Components can now extend other components
  - Notably, modal
- Standard app-related components can have their dependencies injected instead of passed as props

Issue resolution for #67
