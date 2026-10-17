import { GAME_IMAGE_PLACEHOLDER } from '@renderer/constants'

const RAWG_MEDIA = 'https://media.rawg.io/media/'

/**
 * RAWG serves resized copies at /media/resize/<width>/-/…; a 640px tile is ~85 KB instead
 * of the ~220 KB original. Responses carry a one-year cache header, so Chromium's disk
 * cache reuses them across launches. Falls back to the placeholder when there's no art.
 */
export function rawgImage(url: string | null | undefined, width: 420 | 640 | 'full'): string {
  if (!url) return GAME_IMAGE_PLACEHOLDER
  if (width === 'full' || !url.startsWith(RAWG_MEDIA) || url.includes('/media/resize/')) {
    return url
  }
  return `${RAWG_MEDIA}resize/${width}/-/${url.slice(RAWG_MEDIA.length)}`
}
