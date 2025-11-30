import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    settings: { react: { version: '18.3' } },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      'react/jsx-no-target-blank': 'off',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      'react/prop-types': 'off',
      'react/no-unescaped-entities': 'off',
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^React$',
        },
      ],
      // Encourage using the project import alias and discourage deep relative imports
      'no-restricted-imports': [
        'warn',
        {
          paths: [
            {
              name: '@/lib/supabaseClient',
              message:
                "Import `base44` from '@/api/base44Client' instead of importing the raw Supabase client.",
            },
          ],
          // Warn on deep relative imports that cross multiple folders (encourage '@/...' alias)
          patterns: ['../../**', '../../../**'],
        },
      ],
    },
  },
  {
    files: [
      '*.config.js',
      'vite.config.js',
      'postcss.config.js',
      'tailwind.config.js',
      'eslint.config.js',
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.node,
      },
      sourceType: 'module',
    },
  },
]
