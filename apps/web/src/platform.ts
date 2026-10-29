import { localStorageAdapter, type Platform } from '@app/platform'

export const webPlatform: Platform = {
  name: 'web',
  async getAppVersion() {
    return __APP_VERSION__
  },
  async openExternal(url) {
    window.open(url, '_blank', 'noopener,noreferrer')
  },
  storage: localStorageAdapter,
}
