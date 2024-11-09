import globals from "globals";
import pluginJs from "@eslint/js";
import pluginVue from "eslint-plugin-vue";


/** @type {import('eslint').Linter.Config[]} */
export default [
  {ignores: ['dist/**/*', 'node_modules/**/*', 'functions/**/*']},
  {files: ["**/*.{js,mjs,cjs,vue}"]},
  {languageOptions: { globals: globals.browser }},
  pluginJs.configs.recommended,
  ...pluginVue.configs["flat/essential"],
  {
    rules: {
      'vue/multi-word-component-names': 'off',
      'vue/no-deprecated-slot-attribute': 'off'
    }
  }
];