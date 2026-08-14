import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import react from 'eslint-plugin-react'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: {
      react,
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]', argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }],
      // Marca como usados los identificadores que aparecen en JSX (ej. `<motion.div>`).
      // Sin esto, no-unused-vars no cuenta los member expressions de JSX.
      'react/jsx-uses-vars': 'error',
      // Reglas experimentales de react-hooks v7 (falsos positivos en patrones válidos)
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/refs': 'warn',
      'react-hooks/preserve-manual-memoization': 'warn',
      'react-hooks/immutability': 'warn',
      // React Fast Refresh solo es una mejora de DX; mezclar components/helpers es válido
      // y separarlos (barrels tiptap + contexts que exportan hook+Provider) no justifica el coste.
      'react-refresh/only-export-components': 'off',
      // Desactivamos rules de react que no aplican (sin proptypes de TS, etc.)
      'react/display-name': 'off',
      'react/prop-types': 'off',
    },
  },
])
