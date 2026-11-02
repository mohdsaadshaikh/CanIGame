import { getErrorMessage } from '@renderer/utils/errors'
import type { GamesQuery } from '@shared/ipc'
import type { Game, GameListPage } from '@shared/types/games'
import { useCallback, useEffect, useState } from 'react'

/**
 * Module-level cache so returning to a screen renders instantly instead of
 * re-asking main (and, past its cache, Steam's rate limit) on every navigation.
 */
const CACHE_TTL_MS = 5 * 60_000
const cache = new Map<string, { data: GameListPage; fetchedAt: number }>()
const inFlight = new Map<string, Promise<GameListPage>>()

function readFresh(key: string): GameListPage | null {
  const entry = cache.get(key)
  return entry && Date.now() - entry.fetchedAt < CACHE_TTL_MS ? entry.data : null
}

function fetchGames(key: string, query: GamesQuery): Promise<GameListPage> {
  // Dedupe concurrent identical requests (e.g. StrictMode's double effect run).
  const pending = inFlight.get(key)
  if (pending) return pending

  const request = window.api
    .getGames(query)
    .then((data) => {
      cache.set(key, { data, fetchedAt: Date.now() })
      return data
    })
    .finally(() => inFlight.delete(key))

  inFlight.set(key, request)
  return request
}

interface UseGamesResult {
  games: Game[]
  loading: boolean
  error: string | null
  retry: () => void
}

interface State {
  games: Game[]
  loading: boolean
  error: string | null
}

export function useGames(query: GamesQuery): UseGamesResult {
  // Keyed by value, so callers may pass a fresh object literal each render.
  const key = JSON.stringify(query)
  const [attempt, setAttempt] = useState(0)
  const [state, setState] = useState<State>(() => {
    const cached = readFresh(key)
    return { games: cached?.games ?? [], loading: cached === null, error: null }
  })

  useEffect(() => {
    const cached = readFresh(key)
    if (cached) {
      setState({ games: cached.games, loading: false, error: null })
      return
    }

    let cancelled = false
    setState((previous) => ({ ...previous, loading: true, error: null }))
    fetchGames(key, JSON.parse(key) as GamesQuery)
      .then((data) => {
        if (!cancelled) setState({ games: data.games, loading: false, error: null })
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setState({ games: [], loading: false, error: getErrorMessage(err, 'Failed to load.') })
        }
      })

    return () => {
      cancelled = true
    }
  }, [key, attempt])

  const retry = useCallback(() => setAttempt((n) => n + 1), [])

  return { ...state, retry }
}
