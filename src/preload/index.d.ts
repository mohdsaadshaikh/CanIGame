import { ElectronAPI } from '@electron-toolkit/preload'
import { HardwareInfo } from '../types/index'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      getHardwareInfo: () => Promise<HardwareInfo>
      windowControl: (action: 'minimize' | 'maximize' | 'close') => void
    }
  }
}
