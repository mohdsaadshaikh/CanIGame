import { contextBridge, ipcRenderer } from 'electron'
import { IPC_CHANNELS, type Api, type GamesQuery, type WindowAction } from '@shared/ipc'

/**
 * The only bridge between renderer and main. Expose named, typed functions —
 * never `ipcRenderer` itself — so a compromised renderer cannot invoke arbitrary channels.
 * Typing the object as `Api` keeps preload and renderer in lockstep at compile time.
 */
const api: Api = {
  windowControl: (action: WindowAction) => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_CONTROL, action),
  getHardwareInfo: () => ipcRenderer.invoke(IPC_CHANNELS.GET_HARDWARE_INFO),
  getSystemDetails: () => ipcRenderer.invoke(IPC_CHANNELS.GET_SYSTEM_DETAILS),
  getLiveStats: () => ipcRenderer.invoke(IPC_CHANNELS.GET_LIVE_STATS),
  getLiveGpu: () => ipcRenderer.invoke(IPC_CHANNELS.GET_LIVE_GPU),
  getGames: (query: GamesQuery) => ipcRenderer.invoke(IPC_CHANNELS.GET_GAMES, query),
  getGame: (appId: number) => ipcRenderer.invoke(IPC_CHANNELS.GET_GAME, appId),
  clearCache: () => ipcRenderer.invoke(IPC_CHANNELS.CLEAR_CACHE)
}

contextBridge.exposeInMainWorld('api', api)
