import { Config } from '@stencil/core';
import typescript from '@rollup/plugin-typescript';

export const config: Config = {
  namespace: 'byfo-components',
  rollupPlugins: {
    before: [typescript()],
  },
  outputTargets: [
    {
      type: 'dist',
    },
    {
      type: 'dist-custom-elements',
      customElementsExportBehavior: 'auto-define-custom-elements',
      generateTypeDeclarations: true,
    },
  ],
};
