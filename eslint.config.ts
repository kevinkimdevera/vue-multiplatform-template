import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import pluginVue from 'eslint-plugin-vue'
import globals from 'globals'

export default defineConfigWithVueTs(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/out/**',
      '**/release/**',
      'apps/mobile/android/**',
      'apps/mobile/ios/**',
    ],
  },
  pluginVue.configs['flat/recommended'],
  vueTsConfigs.recommended,
  {
    files: ['**/*.{ts,vue}'],
    languageOptions: {
      globals: { ...globals.browser },
    },
  },
  {
    // Node-side code: Electron main/preload, scripts and build configs
    files: [
      'apps/desktop/src/main/**',
      'apps/desktop/src/preload/**',
      'apps/*/scripts/**',
      '**/*.config.ts',
    ],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
  {
    rules: {
      'vue/multi-word-component-names': ['error', { ignores: ['App'] }],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  // Formatting is Prettier's job: turn off every ESLint rule that conflicts with it
  skipFormatting,
)
