import { app, BrowserWindow, ipcMain, shell } from 'electron'
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const storePath = () => join(app.getPath('userData'), 'store.json')

async function readStore(): Promise<Record<string, string>> {
  try {
    return JSON.parse(await readFile(storePath(), 'utf8'))
  } catch {
    return {}
  }
}

function isSafeExternalUrl(url: string) {
  try {
    return ['http:', 'https:'].includes(new URL(url).protocol)
  } catch {
    return false
  }
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 720,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      sandbox: true,
    },
  })

  win.once('ready-to-show', () => win.show())

  // Open target=_blank links in the system browser instead of a new Electron window.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (isSafeExternalUrl(url)) void shell.openExternal(url)
    return { action: 'deny' }
  })

  if (process.env.ELECTRON_RENDERER_URL) {
    void win.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    void win.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

ipcMain.handle('app:version', () => app.getVersion())
ipcMain.handle('shell:openExternal', async (_event, url: string) => {
  if (isSafeExternalUrl(url)) await shell.openExternal(url)
})
ipcMain.handle('store:get', async (_event, key: string) => (await readStore())[key] ?? null)
ipcMain.handle('store:set', async (_event, key: string, value: string) => {
  const store = await readStore()
  store[key] = value
  await writeFile(storePath(), JSON.stringify(store, null, 2))
})

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
