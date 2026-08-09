import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'

/* Lint = the questions a reviewer shouldn't have to ask: unused code, hook
   dependency mistakes, undefined globals. Style is left to the codebase's
   own conventions — no formatter fights, no bikeshed rules. */
export default [
  { ignores: ['dist/', 'node_modules/'] },
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,mjs}'],
    plugins: { react, 'react-hooks': reactHooks },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { ...globals.browser, ...globals.node },
    },
    settings: { react: { version: 'detect' } },
    rules: {
      // The two classic hook rules, not the full compiler-strict preset:
      // this codebase deliberately uses mount-time setState for two-pass
      // hydration (ThemeToggle, ServiceExplorer, hooks.js), which the
      // set-state-in-effect rule would flag despite being the documented
      // pattern for prerendered pages.
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      // Without this, every imported component looks unused to no-unused-vars.
      'react/jsx-uses-vars': 'error',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
  {
    // The service worker runs in its own global scope.
    files: ['public/sw.js'],
    languageOptions: { globals: globals.serviceworker },
  },
]
