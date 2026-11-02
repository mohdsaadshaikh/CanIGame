import axios from 'axios'
import { GAMES_PAGE_SIZE, type GameList, type GamesQuery } from '@shared/ipc'
import type { Game, GameArt, GameDetails, GameListPage, ReviewSummary } from '@shared/types/games'
import { CACHE_POLICIES, cached } from '../lib/cache'
import steamClient, { steamApiClient } from '../lib/steamClient'
import {
  parseSearchResults,
  toGameArt,
  toGameDetails,
  toReviewSummary,
  type SteamAppData,
  type SteamAssets,
  type SteamReviewSummary
} from './steamParse'

/**
 * Only an Error's `message` survives the IPC boundary, so translate axios failures
 * into short, user-readable messages here rather than leaking raw HTTP noise.
 */
function toApiError(error: unknown, fallback: string): Error {
  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNABORTED') return new Error('Steam took too long to respond.')
    if (!error.response) return new Error('Could not reach Steam. Check your internet connection.')
    switch (error.response.status) {
      case 404:
        return new Error('Game not found.')
      case 403:
      case 429:
        return new Error('Steam is limiting requests right now. Try again in a minute.')
      default:
        return new Error(`Steam store error (HTTP ${error.response.status}).`)
    }
  }
  return error instanceof Error ? error : new Error(fallback)
}

/** Steam search's own category for full games (no DLC, demos, soundtracks or videos). */
const GAMES_ONLY_CATEGORY = 998

const LIST_PARAMS: Record<GameList, Record<string, string>> = {
  topsellers: { filter: 'topsellers' },
  trending: { filter: 'popularnew' },
  toprated: { sort_by: 'Reviews_DESC' },
  upcoming: { filter: 'popularcomingsoon' },
  specials: { specials: '1' }
}

/** Stable cache key: same query in any key order maps to the same entry. */
function queryKey(query: GamesQuery): string {
  const sorted = Object.fromEntries(
    Object.entries(query)
      .filter(([, value]) => value !== undefined)
      .sort(([a], [b]) => a.localeCompare(b))
  )
  return `games:${JSON.stringify(sorted)}`
}

export function getGames(query: GamesQuery): Promise<GameListPage> {
  const policy = query.search ? CACHE_POLICIES.search : CACHE_POLICIES.list
  return cached(queryKey(query), policy, () => fetchGames(query))
}

export function getGame(appId: number): Promise<GameDetails> {
  return cached(`game:${appId}`, CACHE_POLICIES.details, () => fetchGame(appId))
}

/** Steam tag id to name ("19" to "Action"). Search rows carry only the ids. */
function getTagNames(): Promise<Record<string, string>> {
  return cached('steam:tags', CACHE_POLICIES.tags, async () => {
    const { data } = await steamClient.get<{ tagid: number; name: string }[]>(
      '/tagdata/populartags/english'
    )
    return Object.fromEntries(data.map((tag) => [String(tag.tagid), tag.name]))
  })
}

/**
 * Real art paths and the store's review summary for up to a page of apps in one request.
 * Newer apps keep art in hashed folders that can't be derived from the id, and this is the
 * same keyless call the Steam store uses. Results ride along in each cache entry.
 */
interface StoreItemExtras {
  art: GameArt
  review: ReviewSummary | null
}

async function fetchStoreItems(appIds: number[]): Promise<Record<number, StoreItemExtras>> {
  if (appIds.length === 0) return {}
  const input = {
    ids: appIds.map((appid) => ({ appid })),
    context: { language: 'english', country_code: 'US' },
    data_request: { include_assets: true, include_reviews: true }
  }
  const { data } = await steamApiClient.get<{
    response?: {
      store_items?: {
        appid?: number
        assets?: SteamAssets
        reviews?: { summary_filtered?: SteamReviewSummary }
      }[]
    }
  }>('/IStoreBrowseService/GetItems/v1', { params: { input_json: JSON.stringify(input) } })
  const items: Record<number, StoreItemExtras> = {}
  for (const item of data.response?.store_items ?? []) {
    if (!item.appid) continue
    items[item.appid] = {
      art: toGameArt(item.appid, item.assets),
      review: toReviewSummary(item.reviews?.summary_filtered)
    }
  }
  return items
}

/** Art is decoration: on failure the games keep their legacy paths (fine for older apps). */
async function withArt(games: Game[]): Promise<Game[]> {
  const items = await fetchStoreItems(games.map((game) => game.id)).catch(
    () => ({}) as Record<number, StoreItemExtras>
  )
  return games.map((game) => (items[game.id] ? { ...game, art: items[game.id].art } : game))
}

interface SearchResponse {
  success: number
  results_html: string
  total_count: number
}

async function fetchGames(query: GamesQuery): Promise<GameListPage> {
  const { page = 1, list = 'topsellers', search, tag, free } = query
  const term = search?.trim()
  // List filters narrow a search ("witcher" in top sellers is 11 games, not 71), so a
  // search on the default list runs on Steam's relevance order instead.
  const listParams = term && list === 'topsellers' ? {} : LIST_PARAMS[list]

  try {
    const [{ data }, tagNames] = await Promise.all([
      steamClient.get<SearchResponse>('/search/results/', {
        // axios drops `undefined` params, so unset filters are simply not sent.
        params: {
          query: '',
          term,
          start: (page - 1) * GAMES_PAGE_SIZE,
          count: GAMES_PAGE_SIZE,
          infinite: 1,
          category1: GAMES_ONLY_CATEGORY,
          tags: tag,
          maxprice: free ? 'free' : undefined,
          ...listParams
        }
      }),
      // Tag names are decoration; a failure there must not fail the list.
      getTagNames().catch(() => ({}) as Record<string, string>)
    ])
    if (data.success !== 1 || typeof data.results_html !== 'string') {
      throw new Error('Steam returned an unexpected search response.')
    }
    return {
      games: await withArt(parseSearchResults(data.results_html, tagNames)),
      total: data.total_count,
      hasMore: page * GAMES_PAGE_SIZE < data.total_count
    }
  } catch (error) {
    throw toApiError(error, 'Failed to load games.')
  }
}

async function fetchGame(appId: number): Promise<GameDetails> {
  try {
    const [{ data }, items] = await Promise.all([
      steamClient.get<Record<string, { success: boolean; data?: SteamAppData }>>(
        '/api/appdetails',
        { params: { appids: appId } }
      ),
      // Art paths and the review score are extras; the page still works without them.
      fetchStoreItems([appId]).catch(() => ({}) as Record<number, StoreItemExtras>)
    ])
    const entry = data[String(appId)]
    if (!entry?.success || !entry.data) throw new Error('Game not found.')
    const extras = items[appId]
    return toGameDetails(entry.data, extras?.review ?? null, extras?.art)
  } catch (error) {
    throw toApiError(error, 'Failed to load game details.')
  }
}
