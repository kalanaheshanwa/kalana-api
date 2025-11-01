import { includeIgnoreFile } from '@eslint/compat';
import pluginJs from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import tseslint from 'typescript-eslint';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const gitignorePath = path.resolve(__dirname, '.gitignore');

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ['**/*.{js,mjs,cjs,ts}'] },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  includeIgnoreFile(gitignorePath),
  {
    ignores: ['**/generated/**', '**/node_modules/**', '**/dist/**'],
    plugins: {
      typescriptEslint,
      '@stylistic': stylistic,
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    rules: {
      '@stylistic/indent': ['error', 2],
    },
  },
  eslintPluginPrettierRecommended,
  eslintConfigPrettier,
  {
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-empty-object-type': 'off',
    },
  },
  {
    files: ['lambdas/**'],
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  },
  {
    ignores: ['**/scripts/**'],
    rules: {
      'no-console': ['warn'],
    },
  },
  {
    rules: {
      curly: ['error'],
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'max-len': ['error', { code: 120, ignoreTemplateLiterals: true }],
      'multiline-comment-style': ['warn', 'starred-block'],
    },
  },
];
