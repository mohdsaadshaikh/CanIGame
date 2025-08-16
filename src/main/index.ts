import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import { app, BrowserWindow, ipcMain, shell } from 'electron'
import { join } from 'path'
import icon from '../../resources/icon.png'
import windowStateKeeper from 'electron-window-state'
import { getHardwareInfo } from './services/hardwareInfo'
import { handleWindowControl } from './services/windowControl'

let mainWindow: BrowserWindow
let mainWindowState: windowStateKeeper.State

function createWindow(): void {
  mainWindow = new BrowserWindow({
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,
    minWidth: 800,
    minHeight: 600,
    show: false,
    autoHideMenuBar: true,
    frame: false,
    icon: process.platform === 'win32' ? join(__dirname, '../../build/icon.ico') : undefined,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindowState.manage(mainWindow)

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  mainWindowState = windowStateKeeper({
    defaultWidth: 1000,
    defaultHeight: 800
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

ipcMain.handle('window-control', (_event, action) => {
  handleWindowControl(mainWindow, action)
})

ipcMain.handle('get-hardware-info', async () => {
  const hardwareInfo = await getHardwareInfo()
  return hardwareInfo
})

ipcMain.handle('get-all-games', async () => {
  const { getAllGames } = await import('./services/apis')
  return getAllGames()
})

// get game by slug
ipcMain.handle('get-game-by-slug', async (_event, slug) => {
  const { getGameBySlug } = await import('./services/apis')
  return getGameBySlug(slug)
})
