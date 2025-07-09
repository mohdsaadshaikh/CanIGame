import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import { app, BrowserWindow, ipcMain, shell } from 'electron'
import { join } from 'path'
import si from 'systeminformation'
import icon from '../../resources/icon.png'
import { HardwareInfo } from '../types/index'
import windowStateKeeper from 'electron-window-state'

async function getHardwareInfo(): Promise<HardwareInfo> {
  try {
    const [cpu, memory, graphics, osInfo, system] = await Promise.all([
      si.cpu(),
      si.mem(),
      si.graphics(),
      si.osInfo(),
      si.system()
    ])

    const cpuInfo = {
      brand: cpu.brand || 'Unknown',
      manufacturer: cpu.manufacturer || 'Unknown',
      model: cpu.model || 'Unknown',
      cores: cpu.cores || 0,
      physicalCores: cpu.physicalCores || 0,
      processors: cpu.processors || 1,
      speed: cpu.speed || 0,
      speedMax: cpu.speedMax || 0,
      speedMin: cpu.speedMin || 0
    }

    const memoryInfo = {
      total: Math.round((memory.total / 1024 / 1024 / 1024) * 100) / 100,
      free: Math.round((memory.free / 1024 / 1024 / 1024) * 100) / 100,
      used: Math.round((memory.used / 1024 / 1024 / 1024) * 100) / 100,
      active: Math.round((memory.active / 1024 / 1024 / 1024) * 100) / 100,
      available: Math.round((memory.available / 1024 / 1024 / 1024) * 100) / 100
    }

    const gpuInfo = graphics.controllers.map((controller) => ({
      vendor: controller.vendor || 'Unknown',
      model: controller.model || 'Unknown',
      vram: controller.vram || 0
    }))

    const osDetails = {
      platform: osInfo.platform || 'Unknown',
      hostname: osInfo.hostname || 'Unknown'
    }

    const systemInfo = {
      manufacturer: system.manufacturer || 'Unknown',
      model: system.model || 'Unknown',
      version: system.version || 'Unknown'
    }

    return {
      cpu: cpuInfo,
      memory: memoryInfo,
      gpu: gpuInfo,
      os: osDetails,
      system: systemInfo
    }
  } catch (error) {
    console.error('Error gathering hardware information:', error)
    throw new Error('Failed to retrieve hardware information')
  }
}

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
  mainWindowState = windowStateKeeper({
    defaultWidth: 1000,
    defaultHeight: 800
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
