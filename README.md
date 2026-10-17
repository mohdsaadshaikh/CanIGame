# CanIGame

Desktop app that reads your PC's CPU, GPU and memory and compares them with a game's system
requirements from [RAWG](https://rawg.io), so you know whether a game will run before you buy it.

Built with Electron 35, electron-vite, React 19, TypeScript and Mantine 8.

## Features

- **About PC** — detects CPU, GPU, RAM, OS and system model via `systeminformation`; cached locally
- **Explore** — browse the RAWG catalogue in grid or list view, with infinite scroll
- **Game details** — artwork, description, genres, developers, stores and PC minimum/recommended
  requirements
- Dark/light/system theme, custom frameless title bar, window position memory

Planned: the actual "can I run it?" verdict (requirements parser + hardware comparison), search,
filters, wishlist persistence, auto-update.

## Getting started

```bash
npm install
cp .env.example .env     # then paste your RAWG key (free at https://rawg.io/apidocs)
npm run dev
```

## Scripts

| Script                | What it does                                             |
| --------------------- | -------------------------------------------------------- |
| `npm run dev`         | Start the app with hot reload                            |
| `npm run check`       | Typecheck, lint and format check — run before committing |
| `npm run lint:fix`    | Auto-fix lint issues (`npm run format` for Prettier)     |
| `npm run build`       | Typecheck and bundle to `out/`                           |
| `npm run build:win`   | Build a Windows installer into `dist/`                   |
| `npm run build:mac`   | Build a macOS DMG                                        |
| `npm run build:linux` | Build AppImage and deb packages                          |

## Project layout

```
src/
  main/       Electron main process: window, IPC handlers, RAWG client, hardware detection
  preload/    Sandboxed bridge exposing the typed `window.api`
  renderer/   React app (screens, components, Mantine theme)
  shared/     IPC contract and types shared by all three processes
```

The renderer never touches Node or the network directly. Every privileged operation goes through a
typed IPC method defined in `src/shared/ipc.ts`, validated in `src/main/ipc.ts`. See
[CLAUDE.md](CLAUDE.md) for the full set of conventions and security invariants.

## Recommended IDE setup

[VS Code](https://code.visualstudio.com/) with the
[ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) and
[Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) extensions.
