import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import type { Plugin } from 'vite'

// `@shared` is resolvable from all three processes so the IPC contract
// (src/shared/ipc.ts) and API types live in exactly one place.
const sharedAlias = { '@shared': resolve('src/shared') }

/**
 * The dev server (Vite HMR client, React Fast Refresh preamble) injects inline
 * <script> tags that the strict CSP in index.html would refuse, which silently
 * downgrades HMR to full reloads. Allow inline scripts for `serve` only; the
 * production HTML keeps `script-src 'self'`.
 */
function devOnlyCsp(): Plugin {
  return {
    name: 'canigame:dev-only-csp',
    apply: 'serve',
    transformIndexHtml(html) {
      return html.replace("script-src 'self';", "script-src 'self' 'unsafe-inline';")
    }
  }
}

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    resolve: { alias: sharedAlias }
  },
  preload: {
    // The preload runs sandboxed (see main/index.ts), so it may only `require('electron')`.
    // Everything else it imports (the shared module) is inlined by the bundler.
    plugins: [externalizeDepsPlugin()],
    resolve: { alias: sharedAlias }
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src'),
        ...sharedAlias
      }
    },
    plugins: [react(), devOnlyCsp()]
  }
})
