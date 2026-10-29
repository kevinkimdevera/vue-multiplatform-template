/** API exposed by the preload script on `window.desktop`. */
export interface DesktopApi {
  getVersion(): Promise<string>
  openExternal(url: string): Promise<void>
  storeGet(key: string): Promise<string | null>
  storeSet(key: string, value: string): Promise<void>
}
