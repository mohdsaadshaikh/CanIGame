/**
 * Electron wraps errors thrown by `ipcMain.handle` as
 * "Error invoking remote method '<channel>': Error: <message>". Strip that so the
 * UI shows only the message main deliberately produced.
 */
const IPC_ERROR_PREFIX = /^Error invoking remote method '[^']*': (?:Error: )?/

export function getErrorMessage(error: unknown, fallback = 'Something went wrong.'): string {
  const raw = error instanceof Error ? error.message : typeof error === 'string' ? error : ''
  const cleaned = raw.replace(IPC_ERROR_PREFIX, '').trim()
  return cleaned || fallback
}
