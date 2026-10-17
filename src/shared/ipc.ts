import type { GameDetails, GameListResponse } from './types/games'
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
  GET_GAME_BY_SLUG: 'games:get-by-slug',
  CLEAR_CACHE: 'cache:clear'
} as const

export const WINDOW_ACTIONS = ['minimize', 'maximize', 'close'] as const
export type WindowAction = (typeof WINDOW_ACTIONS)[number]

export function isWindowAction(value: unknown): value is WindowAction {
  return typeof value === 'string' && (WINDOW_ACTIONS as readonly string[]).includes(value)
}

/** RAWG slugs are lowercase kebab-case; ids are plain integers. Both are accepted by the API. */
const GAME_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const GAME_SLUG_MAX_LENGTH = 200

export function isValidGameSlug(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.length <= GAME_SLUG_MAX_LENGTH &&
    GAME_SLUG_PATTERN.test(value)
  )
}

// ---------------------------------------------------------------------------
// Game list query (RAWG GET /games)
// ---------------------------------------------------------------------------

const ORDERING_FIELDS = [
  'name',
  'released',
  'added',
  'created',
  'updated',
  'rating',
  'metacritic'
] as const
type OrderingField = (typeof ORDERING_FIELDS)[number]
/** RAWG sort key; a leading `-` means descending. */
export type GameOrdering = OrderingField | `-${OrderingField}`

export interface GamesQuery {
  /** 1-based. Defaults to 1. */
  page?: number
  /** Defaults to `GAMES_PAGE_SIZE`; RAWG caps it at 40. */
  pageSize?: number
  ordering?: GameOrdering
  /** Release-date range, `YYYY-MM-DD,YYYY-MM-DD`. */
  dates?: string
  /** Metacritic range, `min,max` (0–100). */
  metacritic?: string
  /** Only games released on PC. */
  pcOnly?: boolean
  /** Free-text name search (1–100 chars after trimming). */
  search?: string
  /** One RAWG genre slug, e.g. `shooter` or `role-playing-games-rpg`. */
  genre?: string
}

export const GAMES_PAGE_SIZE = 20
const MAX_GAMES_PAGE_SIZE = 40
const MAX_GAMES_PAGE = 10_000
const DATE_RANGE_PATTERN = /^\d{4}-\d{2}-\d{2},\d{4}-\d{2}-\d{2}$/
const SCORE_RANGE_PATTERN = /^(\d{1,3}),(\d{1,3})$/
const GAMES_QUERY_KEYS: ReadonlySet<string> = new Set([
  'page',
  'pageSize',
  'ordering',
  'dates',
  'metacritic',
  'pcOnly',
  'search',
  'genre'
])
const MAX_SEARCH_LENGTH = 100

const isIntInRange = (value: unknown, min: number, max: number): boolean =>
  Number.isInteger(value) && (value as number) >= min && (value as number) <= max

function isValidOrdering(value: unknown): value is GameOrdering {
  return (
    typeof value === 'string' &&
    (ORDERING_FIELDS as readonly string[]).includes(value.replace(/^-/, ''))
  )
}

function isValidScoreRange(value: unknown): boolean {
  if (typeof value !== 'string') return false
  const match = SCORE_RANGE_PATTERN.exec(value)
  if (!match) return false
  const [min, max] = [Number(match[1]), Number(match[2])]
  return min <= max && max <= 100
}

/** Strict allow-list check: unknown keys or malformed values reject the whole query. */
export function isValidGamesQuery(value: unknown): value is GamesQuery {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false
  const query = value as Record<string, unknown>
  if (Object.keys(query).some((key) => !GAMES_QUERY_KEYS.has(key))) return false

  const { page, pageSize, ordering, dates, metacritic, pcOnly, search, genre } = query
  return (
    (genre === undefined || isValidGameSlug(genre)) &&
    (search === undefined ||
      (typeof search === 'string' &&
        search.trim().length > 0 &&
        search.length <= MAX_SEARCH_LENGTH)) &&
    (page === undefined || isIntInRange(page, 1, MAX_GAMES_PAGE)) &&
    (pageSize === undefined || isIntInRange(pageSize, 1, MAX_GAMES_PAGE_SIZE)) &&
    (ordering === undefined || isValidOrdering(ordering)) &&
    (dates === undefined || (typeof dates === 'string' && DATE_RANGE_PATTERN.test(dates))) &&
    (metacritic === undefined || isValidScoreRange(metacritic)) &&
    (pcOnly === undefined || typeof pcOnly === 'boolean')
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
  getGames: (query: GamesQuery) => Promise<GameListResponse>
  getGameBySlug: (slug: string) => Promise<GameDetails>
  /** Deletes cached RAWG responses; returns how many entries were removed. */
  clearCache: () => Promise<number>
}
