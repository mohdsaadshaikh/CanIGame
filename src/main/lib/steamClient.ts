import axios from 'axios'

const STEAM_STORE_URL = 'https://store.steampowered.com'
const REQUEST_TIMEOUT_MS = 10_000

/**
 * Steam store client. These endpoints need no API key. They are rate-limited per IP
 * (roughly 200 requests per 5 minutes), which `cache.ts` keeps us well under. US prices
 * and English text give the parsers in `steamParse.ts` one format to handle.
 * Main-process only: the renderer CSP has no `connect-src` for Steam.
 */
const steamClient = axios.create({
  baseURL: STEAM_STORE_URL,
  params: { cc: 'us', l: 'english' },
  timeout: REQUEST_TIMEOUT_MS
})

/**
 * Steam Web API host. Only keyless services are used on it (`IStoreBrowseService/GetItems`,
 * which the store itself calls for app art).
 */
export const steamApiClient = axios.create({
  baseURL: 'https://api.steampowered.com',
  timeout: REQUEST_TIMEOUT_MS
})

export default steamClient
