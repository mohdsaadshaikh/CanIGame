import { ipcMain, type BrowserWindow, type IpcMainInvokeEvent } from 'electron'
import { IPC_CHANNELS, isValidGameId, isValidGamesQuery, isWindowAction } from '@shared/ipc'
import { clearCache } from './lib/cache'
import { isOwnRendererUrl } from './lib/security'
import { getGame, getGames } from './services/apis'
import { getHardwareInfo } from './services/hardwareInfo'
import { getLiveStats } from './services/liveStats'
import { readNvidiaGpu } from './services/nvidia'
import { getSystemDetails } from './services/systemDetails'
import { handleWindowControl } from './services/windowControl'

/**
 * Every handler treats the renderer as untrusted: it checks the calling frame is
 * ours and validates each argument before touching the OS or the network.
 */
function assertTrustedSender(event: IpcMainInvokeEvent): void {
  const url = event.senderFrame?.url ?? ''
  if (!isOwnRendererUrl(url)) {
    throw new Error(`Rejected IPC call from untrusted sender: ${url || '<unknown>'}`)
  }
}

export function registerIpcHandlers(getMainWindow: () => BrowserWindow | null): void {
  ipcMain.handle(IPC_CHANNELS.WINDOW_CONTROL, (event, action: unknown) => {
    assertTrustedSender(event)
    if (!isWindowAction(action)) throw new Error(`Invalid window action: ${String(action)}`)
    handleWindowControl(getMainWindow(), action)
  })

  ipcMain.handle(IPC_CHANNELS.GET_HARDWARE_INFO, (event) => {
    assertTrustedSender(event)
    return getHardwareInfo()
  })

  ipcMain.handle(IPC_CHANNELS.GET_SYSTEM_DETAILS, (event) => {
    assertTrustedSender(event)
    return getSystemDetails()
  })

  ipcMain.handle(IPC_CHANNELS.GET_LIVE_STATS, (event) => {
    assertTrustedSender(event)
    return getLiveStats()
  })

  ipcMain.handle(IPC_CHANNELS.GET_LIVE_GPU, async (event) => {
    assertTrustedSender(event)
    const reading = await readNvidiaGpu()
    if (!reading) return null
    return {
      name: reading.name,
      loadPct: reading.loadPct,
      tempC: reading.tempC,
      vramUsedMB: reading.vramUsedMB,
      vramTotalMB: reading.vramTotalMB
    }
  })

  ipcMain.handle(IPC_CHANNELS.GET_GAMES, (event, query: unknown) => {
    assertTrustedSender(event)
    if (!isValidGamesQuery(query)) throw new Error('Invalid games query')
    return getGames(query)
  })

  ipcMain.handle(IPC_CHANNELS.CLEAR_CACHE, (event) => {
    assertTrustedSender(event)
    return clearCache()
  })

  ipcMain.handle(IPC_CHANNELS.GET_GAME, (event, appId: unknown) => {
    assertTrustedSender(event)
    if (!isValidGameId(appId)) throw new Error('Invalid game id')
    return getGame(appId)
  })
}
