import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import prettier from 'eslint-config-prettier'
import astro from 'eslint-plugin-astro'
import jsxA11y from 'eslint-plugin-jsx-a11y'

export default tseslint.config(
  {
    ignores: [
      'dist',
      'node_modules',
      '.astro',
      'libsql.db',
      'libsql.pem',
      'libsql.pub',
      'tender-series',
      'coverage',
      'e2e',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  prettier,
  {
    plugins: {
      'jsx-a11y': jsxA11y,
    },
    languageOptions: {
      globals: {
        process: 'readonly',
      },
    },
    rules: {
      // Immutability
      'no-param-reassign': 'error',
      // Naming
      'id-length': ['error', { min: 2, exceptions: ['i', 'j', 'k', 'e', 'x', 'y', 'z'] }],
      // Types
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      // Code quality
      'max-depth': ['warn', 4],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      'eqeqeq': ['error', 'always'],
      'no-var': 'error',
      'curly': ['error', 'all'],
      // Accessibility
      'jsx-a11y/alt-text': 'error',
      'jsx-a11y/img-redundant-alt': 'error',
      'jsx-a11y/anchor-is-valid': 'warn',
      'jsx-a11y/aria-props': 'warn',
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
      },
    },
  },
  {
    files: ['**/*.astro'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
    },
    rules: {
      'no-param-reassign': 'off',
    },
  },
  {
    files: ['**/*.test.ts'],
    rules: {
      'no-param-reassign': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  }
)
