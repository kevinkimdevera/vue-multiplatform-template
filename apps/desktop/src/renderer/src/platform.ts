import type { Platform } from '@app/platform'

export const electronPlatform: Platform = {
  name: 'electron',
  getAppVersion: () => window.desktop.getVersion(),
  openExternal: (url) => window.desktop.openExternal(url),
  storage: {
    get: (key) => window.desktop.storeGet(key),
    set: (key, value) => window.desktop.storeSet(key, value),
  },
}
