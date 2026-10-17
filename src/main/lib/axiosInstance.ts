import axios from 'axios'

const RAWG_BASE_URL = 'https://api.rawg.io/api'
const REQUEST_TIMEOUT_MS = 10_000

const apiKey = import.meta.env.MAIN_VITE_RAWG_API_KEY

if (!apiKey) {
  console.warn(
    '[CanIGame] MAIN_VITE_RAWG_API_KEY is not set; RAWG requests will fail. ' +
      'Copy .env.example to .env and add your key.'
  )
}

/** Pre-configured RAWG client. Main-process only so the key never reaches the renderer. */
const rawgClient = axios.create({
  baseURL: RAWG_BASE_URL,
  params: { key: apiKey },
  timeout: REQUEST_TIMEOUT_MS
})

export default rawgClient
