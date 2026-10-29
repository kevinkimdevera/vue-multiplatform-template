import { inject, type App, type InjectionKey } from 'vue'

export type PlatformName = 'web' | 'ios' | 'android' | 'electron'

export interface PlatformStorage {
  get(key: string): Promise<string | null>
  set(key: string, value: string): Promise<void>
}

/**
 * The contract every app shell (web / Capacitor / Electron) implements.
 * Shared UI code talks only to this interface, never to a runtime directly.
 */
export interface Platform {
  name: PlatformName
  getAppVersion(): Promise<string>
  openExternal(url: string): Promise<void>
  storage: PlatformStorage
}

export const PlatformKey: InjectionKey<Platform> = Symbol('platform')

export function platformPlugin(platform: Platform) {
  return {
    install(app: App) {
      app.provide(PlatformKey, platform)
    },
  }
}

export function usePlatform(): Platform {
  const platform = inject(PlatformKey)
  if (!platform) throw new Error('No platform provided. Did you call app.use(platformPlugin(...))?')
  return platform
}

/** Browser-backed storage; usable by any shell that has localStorage. */
export const localStorageAdapter: PlatformStorage = {
  async get(key) {
    return localStorage.getItem(key)
  },
  async set(key, value) {
    localStorage.setItem(key, value)
  },
}
