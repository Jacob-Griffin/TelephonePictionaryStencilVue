import globals from "globals";
import pluginJs from "@eslint/js";
import pluginVue from "eslint-plugin-vue";
import vueEslintParser from 'vue-eslint-parser';
import tseslint from 'typescript-eslint';

const willFullyUpdate = ['**/byfo-components/**', '**/byfo-themes/**']

/** @type {import('eslint').Linter.Config[]} */
const config = [
  {ignores: ['**/dist/**/*', '**/node_modules/**/*', '**/functions/**/*', ...willFullyUpdate]},
  {files: ["**/*.{js,mjs,cjs}"]},
  {languageOptions: { globals: globals.browser }},
  pluginJs.configs.recommended,
  ...pluginVue.configs["flat/essential"],
  {
    rules: {
      'vue/multi-word-component-names': 'off',
      'vue/no-deprecated-slot-attribute': 'off'
    }
  },
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          "args": "all",
          "argsIgnorePattern": "^_",
          "caughtErrors": "all",
          "caughtErrorsIgnorePattern": "^_",
          "destructuredArrayIgnorePattern": "^_",
          "varsIgnorePattern": "^_",
          "ignoreRestSiblings": true
        }
      ]
    }
  },
  {
    files:["**/*.node.{js,mjs,cjs}"],
    languageOptions: {globals: globals.node}
  },
  {
    files: ["**/*.vue"],
    languageOptions: {
        parser: vueEslintParser,
        parserOptions: {
            parser: tseslint.parser,
            sourceType: "module",
            ecmaFeatures: {
                jsx: true
            }
        }
    }
}
];

export default config;