import { App as CapApp } from '@capacitor/app'
import { Browser } from '@capacitor/browser'
import { Capacitor } from '@capacitor/core'
import { Preferences } from '@capacitor/preferences'
import type { Platform } from '@app/platform'

const nativeName = Capacitor.getPlatform()

export const capacitorPlatform: Platform = {
  // Falls back to 'web' when the mobile shell is opened in a desktop browser during dev.
  name: nativeName === 'ios' || nativeName === 'android' ? nativeName : 'web',
  async getAppVersion() {
    if (!Capacitor.isNativePlatform()) return 'dev'
    return (await CapApp.getInfo()).version
  },
  async openExternal(url) {
    await Browser.open({ url })
  },
  storage: {
    async get(key) {
      return (await Preferences.get({ key })).value
    },
    async set(key, value) {
      await Preferences.set({ key, value })
    },
  },
}
