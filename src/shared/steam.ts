/**
 * Steam's image CDN. Every game image URL main hands the renderer is on this host, and it
 * is the only Steam origin the renderer CSP allows (`img-src` in `src/renderer/index.html`).
 */
export const STEAM_IMAGE_ORIGIN = 'https://shared.akamai.steamstatic.com'

export function steamStoreUrl(appId: number): string {
  return `https://store.steampowered.com/app/${appId}/`
}
