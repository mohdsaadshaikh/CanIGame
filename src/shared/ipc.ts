import type { GameDetails, GameListPage } from './types/games'
import type { HardwareInfo, LiveGpuStats, LiveStats, SystemDetails } from './types/hardware'

/**
 * Single source of truth for the IPC contract between main, preload and renderer.
 * - Main registers a handler per channel in `IPC_CHANNELS`.
 * - Preload implements `Api` and exposes it as `window.api`.
 * - Renderer only ever talks to `window.api`; it never sees `ipcRenderer`.
 */

export const IPC_CHANNELS = {
  WINDOW_CONTROL: 'window:control',
  GET_HARDWARE_INFO: 'hardware:get-info',
  GET_SYSTEM_DETAILS: 'hardware:get-details',
  GET_LIVE_STATS: 'hardware:get-live',
  GET_LIVE_GPU: 'hardware:get-live-gpu',
  GET_GAMES: 'games:list',
  GET_GAME: 'games:get',
  CLEAR_CACHE: 'cache:clear'
} as const

export const WINDOW_ACTIONS = ['minimize', 'maximize', 'close'] as const
export type WindowAction = (typeof WINDOW_ACTIONS)[number]

export function isWindowAction(value: unknown): value is WindowAction {
  return typeof value === 'string' && (WINDOW_ACTIONS as readonly string[]).includes(value)
}

/** Steam app ids are positive 32-bit integers. */
export function isValidGameId(value: unknown): value is number {
  return Number.isInteger(value) && (value as number) > 0 && (value as number) <= 2 ** 31 - 1
}

// ---------------------------------------------------------------------------
// Game list query (Steam store search)
// ---------------------------------------------------------------------------

/**
 * Store lists Steam can rank by:
 * - `topsellers`: current top sellers (also the default relevance order)
 * - `trending`: popular new releases
 * - `toprated`: best user-review score
 * - `upcoming`: popular games that are not out yet
 * - `specials`: games on sale
 */
export const GAME_LISTS = ['topsellers', 'trending', 'toprated', 'upcoming', 'specials'] as const
export type GameList = (typeof GAME_LISTS)[number]

export interface GamesQuery {
  /** 1-based. Defaults to 1. Each page holds `GAMES_PAGE_SIZE` games. */
  page?: number
  /** Defaults to `topsellers`. */
  list?: GameList
  /** Free-text name search (1-100 chars after trimming). */
  search?: string
  /** One Steam tag id, e.g. 19 (Action) or 1667 (Horror). */
  tag?: number
  /** Only free-to-play games. */
  free?: boolean
}

export const GAMES_PAGE_SIZE = 25
const MAX_GAMES_PAGE = 400
const MAX_TAG_ID = 10_000_000
const MAX_SEARCH_LENGTH = 100
const GAMES_QUERY_KEYS: ReadonlySet<string> = new Set(['page', 'list', 'search', 'tag', 'free'])

const isIntInRange = (value: unknown, min: number, max: number): boolean =>
  Number.isInteger(value) && (value as number) >= min && (value as number) <= max

/** Strict allow-list check: unknown keys or malformed values reject the whole query. */
export function isValidGamesQuery(value: unknown): value is GamesQuery {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false
  const query = value as Record<string, unknown>
  if (Object.keys(query).some((key) => !GAMES_QUERY_KEYS.has(key))) return false

  const { page, list, search, tag, free } = query
  return (
    (page === undefined || isIntInRange(page, 1, MAX_GAMES_PAGE)) &&
    (list === undefined || (GAME_LISTS as readonly unknown[]).includes(list)) &&
    (search === undefined ||
      (typeof search === 'string' &&
        search.trim().length > 0 &&
        search.length <= MAX_SEARCH_LENGTH)) &&
    (tag === undefined || isIntInRange(tag, 1, MAX_TAG_ID)) &&
    (free === undefined || typeof free === 'boolean')
  )
}

export interface Api {
  windowControl: (action: WindowAction) => Promise<void>
  getHardwareInfo: () => Promise<HardwareInfo>
  /** Slow (about 15s on Windows): memory sticks, drives, displays, board, BIOS, battery. */
  getSystemDetails: () => Promise<SystemDetails>
  getLiveStats: () => Promise<LiveStats>
  /** null when there is no NVIDIA GPU or nvidia-smi is not available. */
  getLiveGpu: () => Promise<LiveGpuStats | null>
  getGames: (query: GamesQuery) => Promise<GameListPage>
  /** Full store record for one Steam app id, with review summary and PC requirements. */
  getGame: (appId: number) => Promise<GameDetails>
  /** Deletes cached Steam responses; returns how many entries were removed. */
  clearCache: () => Promise<number>
}
