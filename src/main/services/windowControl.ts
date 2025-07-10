import { BrowserWindow } from 'electron'

export function handleWindowControl(
  mainWindow: BrowserWindow,
  action: 'minimize' | 'maximize' | 'close'
): void {
  if (!mainWindow) return
  if (action === 'minimize') mainWindow.minimize()
  else if (action === 'maximize') {
    mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize()
  } else if (action === 'close') {
    mainWindow.close()
  }
}
