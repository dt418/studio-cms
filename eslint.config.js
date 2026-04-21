import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import prettier from 'eslint-config-prettier'

export default tseslint.config(
  {
    ignores: ['dist', 'node_modules', '.astro', 'libsql.db', 'libsql.pem', 'libsql.pub', 'tender-series'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
  {
    languageOptions: {
      globals: {
        process: 'readonly',
      },
    },
    rules: {
      // Enforce immutability - prefer spread over mutation
      'no-param-reassign': 'error',
      // Enforce descriptive naming
      'id-length': ['error', { min: 2, exceptions: ['i', 'j', 'k', 'e', 'x', 'y', 'z'] }],
      // No 'any'
      '@typescript-eslint/no-explicit-any': 'error',
      // Require return types on functions
      '@typescript-eslint/explicit-function-return-type': 'off',
      // Require type annotations on exported functions
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      // Enforce consistent type imports
      '@typescript-eslint/consistent-type-imports': 'warn',
      // Prefer early returns over deep nesting
      'max-depth': ['warn', 4],
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
      },
    },
  }
)
