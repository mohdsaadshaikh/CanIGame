/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** RAWG API key. Main-process only (MAIN_VITE_ prefix); set in `.env`. */
  readonly MAIN_VITE_RAWG_API_KEY: string | undefined
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
