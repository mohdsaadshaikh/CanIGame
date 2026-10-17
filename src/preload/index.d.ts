import type { Api } from '@shared/ipc'

declare global {
  interface Window {
    /** Exposed by src/preload/index.ts via contextBridge. */
    api: Api
  }
}

export {}
