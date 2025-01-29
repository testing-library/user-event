import baseConfig from '@ph.fritsche/eslint-config'
import localRules from 'eslint-plugin-local-rules'
import globals from 'globals'
import {fixupPluginRules} from '@eslint/compat'

export default [
  ...baseConfig,
  {
    ignores: [
      'testenv/',
    ],
  },
  {
    files: [
      'eslint-local-rules/*.js',
      'scripts/*.js',
      '*rc.js',
      '*.config.js',
    ],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: ['src/**'],
    plugins: {
      'local-rules': fixupPluginRules(localRules),
    },
    rules: {
      'local-rules/explicit-globals': 'error',
    },
  },
  {
    rules: {
      '@stylistic/block-spacing': 'off',
      '@stylistic/brace-style': 'warn',
      '@stylistic/indent': ['warn', 2, {
        offsetTernaryExpressions: true,
      }],
      '@stylistic/indent-binary-ops': 'warn',
      '@stylistic/keyword-spacing': 'warn',
      '@stylistic/lines-between-class-members': 'off',
      '@stylistic/member-delimiter-style': 'warn',
      '@stylistic/no-trailing-spaces': 'warn',
      '@stylistic/operator-linebreak': ['warn', 'after', {
        overrides: {
          '?': 'before',
          ':': 'before',
        },
      }],
      '@stylistic/quote-props': 'warn',
      '@stylistic/space-in-parens': 'warn',
      '@stylistic/spaced-comment': 'warn',
      'no-await-in-loop': 'off',
      'testing-library/no-dom-import': 'off',
      'testing-library/no-node-access': 'off',
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-base-to-string': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn',
      '@typescript-eslint/no-misused-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unsafe-enum-comparison': 'warn',
      '@typescript-eslint/no-unsafe-function-type': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-wrapper-object-types': 'warn',
      '@typescript-eslint/restrict-template-expressions': 'warn',
    },
  },
  {
    files: [['tests/**', '**/*.{ts,tsx}']],
    rules: {
      'jest/expect-expect': 'off',
      'jest/no-alias-methods': 'off',
      'jest/no-conditional-expect': 'off',
      'jest/no-export': 'off',
      'jest/no-identical-title': 'warn',
      'jest/no-standalone-expect': 'off',
      'jest/valid-title': 'off',
      'testing-library/no-container': 'off',
      '@typescript-eslint/no-base-to-string': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
    },
  },
]
