import type { BrowserWindow } from 'electron'
import type { WindowAction } from '@shared/ipc'

export function handleWindowControl(window: BrowserWindow | null, action: WindowAction): void {
  if (!window || window.isDestroyed()) return

  switch (action) {
    case 'minimize':
      window.minimize()
      break
    case 'maximize':
      if (window.isMaximized()) window.unmaximize()
      else window.maximize()
      break
    case 'close':
      window.close()
      break
  }
}
