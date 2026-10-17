import axios from 'axios'
import { GAMES_PAGE_SIZE, type GamesQuery } from '@shared/ipc'
import type { GameDetails, GameListResponse } from '@shared/types/games'
import rawgClient from '../lib/axiosInstance'
import { CACHE_POLICIES, cached } from '../lib/cache'

/**
 * Only an Error's `message` survives the IPC boundary, so translate axios failures
 * into short, user-readable messages here rather than leaking raw HTTP noise.
 */
function toApiError(error: unknown, fallback: string): Error {
  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNABORTED') return new Error('The RAWG API took too long to respond.')
    if (!error.response) return new Error('Could not reach RAWG. Check your internet connection.')
    switch (error.response.status) {
      case 401:
      case 403:
        return new Error('RAWG API key is missing or invalid.')
      case 404:
        return new Error('Game not found.')
      case 429:
        return new Error('RAWG rate limit reached. Try again in a moment.')
      default:
        return new Error(`RAWG API error (HTTP ${error.response.status}).`)
    }
  }
  return error instanceof Error ? error : new Error(fallback)
}

/** RAWG "parent platform" id for PC (covers Windows, macOS and Linux PC releases). */
const PC_PARENT_PLATFORM_ID = 1

/** Stable cache key: same query in any key order maps to the same entry. */
function queryKey(query: GamesQuery): string {
  const sorted = Object.fromEntries(
    Object.entries(query)
      .filter(([, value]) => value !== undefined)
      .sort(([a], [b]) => a.localeCompare(b))
  )
  return `games:${JSON.stringify(sorted)}`
}

export function getGames(query: GamesQuery): Promise<GameListResponse> {
  const policy = query.search ? CACHE_POLICIES.search : CACHE_POLICIES.list
  return cached(queryKey(query), policy, () => fetchGames(query))
}

/** RAWG accepts either the numeric id or the slug in the path. */
export function getGameBySlug(slug: string): Promise<GameDetails> {
  return cached(`game:${slug}`, CACHE_POLICIES.details, () => fetchGameBySlug(slug))
}

async function fetchGames(query: GamesQuery): Promise<GameListResponse> {
  const {
    page = 1,
    pageSize = GAMES_PAGE_SIZE,
    ordering,
    dates,
    metacritic,
    pcOnly,
    search,
    genre
  } = query
  try {
    // axios drops `undefined` params, so unset filters are simply not sent.
    const { data } = await rawgClient.get<GameListResponse>('/games', {
      params: {
        page,
        page_size: pageSize,
        ordering,
        dates,
        metacritic,
        parent_platforms: pcOnly ? PC_PARENT_PLATFORM_ID : undefined,
        search: search?.trim(),
        genres: genre
      }
    })
    return data
  } catch (error) {
    throw toApiError(error, 'Failed to load games.')
  }
}

async function fetchGameBySlug(slug: string): Promise<GameDetails> {
  try {
    const { data } = await rawgClient.get<GameDetails>(`/games/${encodeURIComponent(slug)}`)
    return data
  } catch (error) {
    throw toApiError(error, 'Failed to load game details.')
  }
}
