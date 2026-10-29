import { contextBridge, ipcRenderer } from 'electron'
import type { DesktopApi } from '../shared/api'

const api: DesktopApi = {
  getVersion: () => ipcRenderer.invoke('app:version'),
  openExternal: (url) => ipcRenderer.invoke('shell:openExternal', url),
  storeGet: (key) => ipcRenderer.invoke('store:get', key),
  storeSet: (key, value) => ipcRenderer.invoke('store:set', key, value),
}

contextBridge.exposeInMainWorld('desktop', api)
