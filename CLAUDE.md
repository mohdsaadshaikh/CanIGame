# CanIGame

Electron desktop app that detects the user's PC hardware and compares it with a game's system
requirements from the RAWG API. Stack: Electron 35 · electron-vite · React 19 · TypeScript ·
Mantine 8 · react-router (hash) · axios · systeminformation.

## Commands

```bash
npm run dev          # launch app with HMR; renderer warnings/errors are mirrored into this terminal
npm run check        # typecheck (main+renderer) + eslint + prettier --check — must pass before a change is "done"
npm run lint:fix     # auto-fix lint; npm run format for prettier
npm run build        # typecheck + bundle to out/
npm run build:win    # build + NSIS installer in dist/ (mac/linux variants exist)
```

Setup once: `cp .env.example .env` and add a RAWG key (`MAIN_VITE_RAWG_API_KEY`). Without it, main
logs a warning on startup and every RAWG call fails with "API key is missing or invalid".

## Architecture — three processes, one contract

```
src/main/      Node. Owns the API key, all network calls (RAWG) and OS access (systeminformation).
src/preload/   Sandboxed bridge. Implements `Api` and exposes it as `window.api`. Nothing else.
src/renderer/  React SPA. No Node, no `electron` import, no direct network. Talks only to `window.api`.
src/shared/    Code compiled into all three: the IPC contract (`ipc.ts`) and RAWG/hardware types.
```

`src/shared/ipc.ts` is the single source of truth for IPC. **To add an IPC method, touch exactly
four places:**

1. `IPC_CHANNELS` — add the channel name (`domain:action`).
2. `Api` interface — add the typed method.
3. `src/preload/index.ts` — implement it on the `api` object (TS fails if 2 and 3 disagree).
4. `src/main/ipc.ts` — `ipcMain.handle(...)` that calls `assertTrustedSender(event)` first and
   validates every argument (see `isValidGameSlug`) before doing any work.

Path aliases: `@shared/*` → `src/shared/*` (all processes), `@renderer/*` → `src/renderer/src/*`.
Use them; do not write `../../..` chains or `src/...` imports.

## Security invariants — do not loosen

These come from the Electron security checklist and are the reason the app is safe to ship.
If a change seems to need one relaxed, stop and ask.

- `BrowserWindow` keeps `sandbox: true`, `contextIsolation: true`, `nodeIntegration: false`.
- Preload exposes only named functions typed as `Api`. Never expose `ipcRenderer`, `require`, or
  a generic `invoke(channel, ...args)`.
- Every `ipcMain.handle` validates the sender (`assertTrustedSender`) and its arguments. The
  renderer is treated as untrusted input.
- The CSP lives in `src/renderer/index.html`. `img-src` is limited to `media.rawg.io` + `data:`;
  there is deliberately no `connect-src` for RAWG because the renderer must not call it.
  `script-src 'self'` is strict in production; the `devOnlyCsp` plugin in `electron.vite.config.ts`
  adds `'unsafe-inline'` for the dev server only (Vite/React-refresh inject inline scripts). Never
  add `'unsafe-inline'` to `script-src` in `index.html` itself.
- Secrets use the `MAIN_VITE_` prefix only. `VITE_` / `RENDERER_VITE_` values are bundled into
  the renderer and are therefore public. `.env` is git-ignored; `.env.example` is the template.
- External links: `target="_blank"` anchors are intercepted by `setWindowOpenHandler` and opened
  in the OS browser (http/https only). In-window navigation away from the app is blocked.

## Conventions

- Prettier: no semicolons, single quotes, 100 cols, LF. ESLint (electron-toolkit config) requires
  explicit return types on functions — write `(): React.JSX.Element` on components.
- UI is Mantine. Use theme tokens and CSS variables (`c="dimmed"`, `var(--mantine-color-dimmed)`,
  `theme.colors[theme.primaryColor][5]`) rather than hard-coded hex — light mode must keep working.
  Reach for `@mantine/hooks` (`useLocalStorage`, `useHover`, …) before writing a custom hook.
- Screens live in `src/renderer/src/screens/<name>/index.tsx` and are lazy-loaded in `App.tsx`.
  Every data-fetching screen has three states: loading skeleton, error `Alert` with retry, content.
- Errors crossing IPC keep only `message`. Main throws `Error` with a short, user-readable message
  (see `toApiError` in `src/main/services/apis.ts`); the renderer displays it via
  `getErrorMessage()` from `src/renderer/src/utils/errors.ts`, which strips Electron's prefix.
- RAWG types are in `src/shared/types/games.ts` and were verified against live responses. The
  **list** endpoint returns `platforms[].requirements_en`; the **detail** endpoint returns
  `platforms[].requirements` and extra fields (`description_raw`, `developers`, …). Check a real
  response (`curl "https://api.rawg.io/api/games/<slug>?key=…"`) before changing these types.
- Null-guard RAWG numbers explicitly (`metacritic != null`, `playtime > 0`); `{0 && <X/>}` renders a
  literal `0`.
- Commit messages: short imperative sentence, matching existing history. Do not commit unless asked.

## Definition of done

`npm run check` passes, `npm run build` succeeds, and for UI work `npm run dev` shows no
`[renderer:error]` lines in the terminal. Hardware detection is cached in `localStorage` under
`hardware-info`; clear it (or press the refresh icon on About PC) when testing that screen.

## Roadmap context

The app's core feature — "can my PC run this?" — is not built yet. The seed is
`src/renderer/src/utils/requirements.ts`, which splits RAWG's run-on requirement strings into
labelled lines. The next step is a structured parser + comparison against `HardwareInfo`; keep that
logic framework-free (plain TS, unit-testable) so it can live in `src/shared/` and be used from
either process. Wishlist persistence and search are also unimplemented (Wishlist screen is an
empty state; Header search only navigates between pages).
