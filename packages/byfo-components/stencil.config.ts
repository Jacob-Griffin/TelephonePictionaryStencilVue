import { Config } from '@stencil/core';

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
  ]
};
