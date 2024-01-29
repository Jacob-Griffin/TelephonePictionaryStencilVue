import { Config } from '@stencil/core';
import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';

export const config: Config = {
  namespace: 'byfo-components',
  rollupPlugins: {
    before: [typescript(), commonjs()],
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
