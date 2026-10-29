import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { platformPlugin, type Platform } from '@app/platform'
import App from './App.vue'
import { createAppRouter, type HistoryMode } from './router'

export interface SharedAppOptions {
  platform: Platform
  /**
   * 'web' for real URLs (PWA, served with an SPA fallback).
   * 'hash' where there's no server to rewrite URLs (Electron's file://).
   */
  historyMode: HistoryMode
}

/** Creates the Vue app with platform, Pinia and router installed. Each shell just mounts it. */
export function createSharedApp({ platform, historyMode }: SharedAppOptions) {
  return createApp(App)
    .use(platformPlugin(platform))
    .use(createPinia())
    .use(createAppRouter(historyMode))
}
