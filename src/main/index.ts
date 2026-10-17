import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import { app, BrowserWindow, session, shell } from 'electron'
import windowStateKeeper from 'electron-window-state'
import { join } from 'path'
import icon from '../../resources/icon.png?asset'
import { registerIpcHandlers } from './ipc'
import { pruneCache } from './lib/cache'
import { isOwnRendererUrl, isSafeExternalUrl } from './lib/security'

const APP_USER_MODEL_ID = 'com.mohdsaadshaikh.canigame'

let mainWindow: BrowserWindow | null = null

function createWindow(): BrowserWindow {
  const windowState = windowStateKeeper({ defaultWidth: 1200, defaultHeight: 800 })

  const window = new BrowserWindow({
    x: windowState.x,
    y: windowState.y,
    width: windowState.width,
    height: windowState.height,
    minWidth: 800,
    minHeight: 600,
    show: false,
    // Matches the splash in index.html, so the window never flashes white while loading.
    backgroundColor: '#0C111D',
    frame: false,
    autoHideMenuBar: true,
    // macOS takes the icon from the app bundle; everywhere else set it explicitly.
    ...(process.platform !== 'darwin' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      // Electron security checklist: isolated world, OS sandbox, no Node in the renderer.
      // The renderer talks to the OS/network exclusively through the typed `window.api`.
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
      webSecurity: true
    }
  })

  windowState.manage(window)

  window.on('ready-to-show', () => window.show())
  window.on('closed', () => {
    mainWindow = null
  })

  // Any link that would open a new window goes to the OS browser instead; never in-app.
  window.webContents.setWindowOpenHandler(({ url }) => {
    if (isSafeExternalUrl(url)) void shell.openExternal(url)
    return { action: 'deny' }
  })

  // The renderer is a hash-routed SPA; block full navigations away from it.
  window.webContents.on('will-navigate', (event, url) => {
    if (!isOwnRendererUrl(url)) event.preventDefault()
  })

  if (is.dev) {
    // Mirror renderer warnings/errors into the terminal so they are not missed.
    window.webContents.on('console-message', (details) => {
      if (details.level === 'warning' || details.level === 'error') {
        console[details.level === 'error' ? 'error' : 'warn'](
          `[renderer:${details.level}] ${details.message} (${details.sourceId}:${details.lineNumber})`
        )
      }
    })
  }

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    void window.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    void window.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return window
}

// Only one running copy; a second launch focuses the existing window.
if (!app.requestSingleInstanceLock()) {
  app.quit()
} else {
  app.on('second-instance', () => {
    if (!mainWindow) return
    if (mainWindow.isMinimized()) mainWindow.restore()
    mainWindow.focus()
  })

  app.whenReady().then(() => {
    electronApp.setAppUserModelId(APP_USER_MODEL_ID)

    // The app needs no browser permissions (camera, geolocation, notifications…): deny all.
    session.defaultSession.setPermissionRequestHandler((_webContents, _permission, callback) =>
      callback(false)
    )

    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window)
    })

    registerIpcHandlers(() => mainWindow)
    void pruneCache()
    mainWindow = createWindow()

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) mainWindow = createWindow()
    })
  })

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
  })
}
