import { is } from '@electron-toolkit/utils'

/**
 * True when `url` belongs to our own renderer: the Vite dev server in development,
 * the packaged `file://` bundle in production. Used to gate IPC and navigation.
 */
export function isOwnRendererUrl(url: string): boolean {
  const devUrl = process.env['ELECTRON_RENDERER_URL']
  if (is.dev && devUrl) return url.startsWith(devUrl)
  return url.startsWith('file://')
}

/** Only hand http(s) links to the OS browser; refuse `file:`, `javascript:` and friends. */
export function isSafeExternalUrl(url: string): boolean {
  try {
    const { protocol } = new URL(url)
    return protocol === 'https:' || protocol === 'http:'
  } catch {
    return false
  }
}
