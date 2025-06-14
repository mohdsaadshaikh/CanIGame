import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import { app, BrowserWindow, ipcMain, shell } from 'electron'
import { join } from 'path'
import icon from '../../resources/icon.png?asset'
import si from 'systeminformation'
import { HardwareInfo } from '../types/index'

async function getHardwareInfo(): Promise<HardwareInfo> {
  const cpu = await si.cpu()
  const mem = await si.mem()
  const gpu = await si.graphics()
  return {
    cpu: cpu.brand,
    ram: mem.total / 1024 / 1024 / 1024, // GB mein
    gpu: gpu.controllers[0]?.model || 'Unknown'
  }
}

let mainWindow

function createWindow(): void {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    frame: false,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  // ;(async function () {
  //   const data = await fetch(
  //     `https://api.rawg.io/api/games?key=${import.meta.env.MAIN_VITE_RAWG_API_KEY}&page_size=10`
  //   )
  //   const json = await data.json()
  //   console.log(json)
  // })()

  ipcMain.handle('get-hardware-info', async () => {
    const hardwareInfo = await getHardwareInfo()
    return hardwareInfo
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

ipcMain.handle('window-control', (_event, action: 'minimize' | 'maximize' | 'close') => {
  if (!mainWindow) return
  if (action === 'minimize') mainWindow.minimize()
  if (action === 'maximize') {
    if (mainWindow.isMaximized()) mainWindow.unmaximize()
    else mainWindow.maximize()
  }
  if (action === 'close') mainWindow.close()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
