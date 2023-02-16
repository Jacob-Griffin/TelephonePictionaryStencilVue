import { Config } from '@stencil/core';
import tailwind, { tailwindHMR } from 'stencil-tailwind-plugin';

export const config: Config = {
  namespace: 'byfo-components',
  outputTargets: [
    {
      type: 'dist'
    },
    {
      type: 'dist-custom-elements',
      customElementsExportBehavior:'auto-define-custom-elements',
      generateTypeDeclarations: true
    },
  ],
  plugins: [
    tailwind(),
    tailwindHMR()
  ]
};
