import { ActionIcon, Alert, Button, Group, Loader, Text, TextInput } from '@mantine/core'
import { useDebouncedValue, useIntersection, useLocalStorage } from '@mantine/hooks'
import { GamesGrid, type ViewMode } from '@renderer/components/GamesGrid'
import { getErrorMessage } from '@renderer/utils/errors'
import { getScrollTop, scrollRoot, scrollToTop } from '@renderer/utils/scroll'
import type { GameList, GamesQuery } from '@shared/ipc'
import type { Game } from '@shared/types/games'
import {
  IconAlertTriangle,
  IconGift,
  IconLayoutGrid,
  IconList,
  IconRefresh,
  IconSearch,
  IconX
} from '@tabler/icons-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import classes from './Explore.module.css'

/** Start fetching the next page this far before the user actually reaches the bottom. */
const PREFETCH_MARGIN = '800px'

// ---------------------------------------------------------------------------
// Filters
// ---------------------------------------------------------------------------

interface Filters {
  list: GameList
  /** Steam tag id, or null for every genre. */
  tag: number | null
  free: boolean
  /** Normalised search text; empty means no search. */
  search: string
}

const DEFAULT_FILTERS: Filters = {
  list: 'topsellers',
  tag: null,
  free: false,
  search: ''
}

/*
 * Search request budget: only 3+ characters, only after 600ms without typing, on a
 * normalised query. Main caches every search on disk for a day.
 */
const SEARCH_MIN_LENGTH = 3
const SEARCH_DEBOUNCE_MS = 600
const normaliseSearch = (text: string): string => text.trim().toLowerCase().replace(/s+/g, ' ')

const LISTS: { value: GameList; label: string }[] = [
  { value: 'topsellers', label: 'Top sellers' },
  { value: 'trending', label: 'New and trending' },
  { value: 'toprated', label: 'Top rated' },
  { value: 'specials', label: 'On sale' },
  { value: 'upcoming', label: 'Upcoming' }
]

/** Steam tag ids, verified against /tagdata/populartags/english. */
const GENRES: { tag: number; label: string }[] = [
  { tag: 19, label: 'Action' },
  { tag: 122, label: 'RPG' },
  { tag: 1774, label: 'Shooter' },
  { tag: 21, label: 'Adventure' },
  { tag: 1695, label: 'Open World' },
  { tag: 9, label: 'Strategy' },
  { tag: 492, label: 'Indie' },
  { tag: 599, label: 'Simulation' },
  { tag: 1662, label: 'Survival' },
  { tag: 1667, label: 'Horror' },
  { tag: 699, label: 'Racing' },
  { tag: 701, label: 'Sports' },
  { tag: 1625, label: 'Platformer' },
  { tag: 1664, label: 'Puzzle' },
  { tag: 1743, label: 'Fighting' },
  { tag: 597, label: 'Casual' }
]

function toQuery(filters: Filters, page: number): GamesQuery {
  const query: GamesQuery = { page, list: filters.list }
  if (filters.tag !== null) query.tag = filters.tag
  if (filters.free) query.free = true
  if (filters.search) query.search = filters.search
  return query
}

const filtersKey = (filters: Filters): string => JSON.stringify(filters)

// ---------------------------------------------------------------------------
// Session snapshot: coming back restores filters, results and scroll position.
// ---------------------------------------------------------------------------

interface ExploreSnapshot {
  filters: Filters
  games: Game[]
  nextPage: number | null
  count: number | null
  scrollY: number
}
let snapshot: ExploreSnapshot | null = null

const numberFormat = new Intl.NumberFormat('en-US')

const Explore = (): React.JSX.Element => {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<Filters>(() => snapshot?.filters ?? DEFAULT_FILTERS)
  const [games, setGames] = useState<Game[]>(() => snapshot?.games ?? [])
  const [nextPage, setNextPage] = useState<number | null>(() => (snapshot ? snapshot.nextPage : 1))
  const [count, setCount] = useState<number | null>(() => snapshot?.count ?? null)
  const [initialLoading, setInitialLoading] = useState(() => snapshot === null)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchText, setSearchText] = useState(() => snapshot?.filters.search ?? '')
  const [debouncedSearch] = useDebouncedValue(normaliseSearch(searchText), SEARCH_DEBOUNCE_MS)
  const [viewMode, setViewMode] = useLocalStorage<ViewMode>({
    key: 'explore.viewMode',
    defaultValue: 'grid',
    getInitialValueInEffect: false
  })

  // Refs, not state: two observer callbacks in one tick must not both start a fetch, and
  // a response from before a filter change must be dropped.
  const inFlight = useRef(false)
  const requestGeneration = useRef(0)
  const filtersRef = useRef(filters)
  const loadedKey = useRef<string | null>(snapshot ? filtersKey(snapshot.filters) : null)

  const { ref: sentinelRef, entry } = useIntersection<HTMLDivElement>({
    rootMargin: PREFETCH_MARGIN
  })

  const loadPage = useCallback(async (page: number) => {
    if (inFlight.current) return
    inFlight.current = true
    const generation = requestGeneration.current
    const isFirstPage = page === 1

    if (isFirstPage) setInitialLoading(true)
    else setLoadingMore(true)
    setError(null)

    try {
      const data = await window.api.getGames(toQuery(filtersRef.current, page))
      if (generation !== requestGeneration.current) return

      setGames((previous) => {
        // Steam pages can overlap when its ranking shifts between requests; drop duplicates.
        const base = isFirstPage ? [] : previous
        const seen = new Set(base.map((game) => game.id))
        return [...base, ...data.games.filter((game) => !seen.has(game.id))]
      })
      if (isFirstPage) setCount(data.total)
      setNextPage(data.hasMore ? page + 1 : null)
    } catch (err) {
      if (generation !== requestGeneration.current) return
      setError(getErrorMessage(err, 'Failed to load games.'))
    } finally {
      if (generation === requestGeneration.current) {
        inFlight.current = false
        setInitialLoading(false)
        setLoadingMore(false)
      }
    }
  }, [])

  const reload = useCallback(() => {
    requestGeneration.current += 1
    inFlight.current = false
    setGames([])
    setNextPage(1)
    setCount(null)
    void loadPage(1)
  }, [loadPage])

  // Load whenever the filters differ from what's on screen (also covers first mount).
  useEffect(() => {
    filtersRef.current = filters
    const key = filtersKey(filters)
    if (key === loadedKey.current) return
    loadedKey.current = key
    scrollToTop()
    reload()
  }, [filters, reload])

  // Coming back: put the scroll position back where the user left it.
  useEffect(() => {
    if (snapshot) {
      const { scrollY } = snapshot
      requestAnimationFrame(() => scrollToTop(scrollY))
    }
  }, [])

  // Keep the latest state, and hand it to the snapshot on unmount.
  const latest = useRef<ExploreSnapshot>({ filters, games, nextPage, count, scrollY: 0 })
  useEffect(() => {
    latest.current = { ...latest.current, filters, games, nextPage, count }
  }, [filters, games, nextPage, count])
  useEffect(() => {
    const root = scrollRoot()
    const onScroll = (): void => {
      latest.current.scrollY = getScrollTop()
    }
    root?.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      root?.removeEventListener('scroll', onScroll)
      if (latest.current.games.length > 0) snapshot = { ...latest.current }
    }
  }, [])

  // Load the next page whenever the sentinel nears the viewport. `games.length` is a
  // dependency so a page too short to push the sentinel away keeps loading until it does.
  const sentinelVisible = entry?.isIntersecting ?? false
  useEffect(() => {
    if (sentinelVisible && nextPage !== null && !initialLoading && !loadingMore && !error) {
      void loadPage(nextPage)
    }
  }, [sentinelVisible, nextPage, initialLoading, loadingMore, error, games.length, loadPage])

  // Typed text becomes a filter only once it has settled and is long enough.
  useEffect(() => {
    const next = debouncedSearch.length >= SEARCH_MIN_LENGTH ? debouncedSearch : ''
    setFilters((f) => (f.search === next ? f : { ...f, search: next }))
  }, [debouncedSearch])

  const update = (patch: Partial<Filters>): void => setFilters((f) => ({ ...f, ...patch }))
  const filtered = filtersKey(filters) !== filtersKey(DEFAULT_FILTERS)
  const firstLoadFailed = error !== null && games.length === 0
  const empty = !initialLoading && !error && games.length === 0

  return (
    <div>
      <div className={classes.header}>
        <div>
          <h1 className={classes.title}>Explore</h1>
          <div className={classes.count}>
            {count === null
              ? 'Loading PC games'
              : filters.search
                ? `${numberFormat.format(count)} results for "${filters.search}"`
                : `${numberFormat.format(count)} PC games`}
          </div>
        </div>
        <div className={classes.views} role="radiogroup" aria-label="View mode">
          <button
            type="button"
            role="radio"
            aria-checked={viewMode === 'grid'}
            aria-label="Grid view"
            className={classes.view}
            onClick={() => setViewMode('grid')}
          >
            <IconLayoutGrid size={17} />
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={viewMode === 'list'}
            aria-label="List view"
            className={classes.view}
            onClick={() => setViewMode('list')}
          >
            <IconList size={17} />
          </button>
        </div>
      </div>

      <div className={classes.filters}>
        <div className={classes.filterRow}>
          <TextInput
            className={classes.search}
            aria-label="Search PC games"
            placeholder="Search PC games"
            value={searchText}
            onChange={(event) => setSearchText(event.currentTarget.value)}
            leftSection={<IconSearch size={16} />}
            rightSection={
              searchText ? (
                <ActionIcon
                  variant="subtle"
                  size="sm"
                  aria-label="Clear search"
                  onClick={() => setSearchText('')}
                >
                  <IconX size={14} />
                </ActionIcon>
              ) : null
            }
            radius="sm"
          />
          <div className={classes.segment} role="radiogroup" aria-label="List">
            {LISTS.map((list) => (
              <button
                key={list.value}
                type="button"
                role="radio"
                aria-checked={filters.list === list.value}
                className={classes.segmentButton}
                onClick={() => update({ list: list.value })}
              >
                {list.label}
              </button>
            ))}
          </div>
          <div className={classes.spacer} />
          <button
            type="button"
            className={classes.toggle}
            aria-pressed={filters.free}
            onClick={() => update({ free: !filters.free })}
          >
            <IconGift size={16} />
            Free to play
          </button>
        </div>

        <div className={classes.genres} role="group" aria-label="Genre">
          <button
            type="button"
            className={classes.genre}
            aria-pressed={filters.tag === null}
            onClick={() => update({ tag: null })}
          >
            All genres
          </button>
          {GENRES.map((genre) => (
            <button
              key={genre.tag}
              type="button"
              className={classes.genre}
              aria-pressed={filters.tag === genre.tag}
              onClick={() => update({ tag: filters.tag === genre.tag ? null : genre.tag })}
            >
              {genre.label}
            </button>
          ))}
        </div>
      </div>

      {firstLoadFailed ? (
        <Alert icon={<IconAlertTriangle size={20} />} title="Could not load games" color="red">
          <Group justify="space-between" align="center">
            {error}
            <Button
              variant="light"
              color="red"
              size="xs"
              leftSection={<IconRefresh size={14} />}
              onClick={reload}
            >
              Retry
            </Button>
          </Group>
        </Alert>
      ) : empty ? (
        <div className={classes.empty}>
          <div className={classes.emptyTitle}>No games match</div>
          <div className={classes.emptyText}>
            Nothing on Steam fits this search and these filters. Try another spelling, another list
            or another genre.
          </div>
          {filtered && (
            <Button
              variant="default"
              onClick={() => {
                setSearchText('')
                setFilters(DEFAULT_FILTERS)
              }}
            >
              Reset filters
            </Button>
          )}
        </div>
      ) : (
        <>
          <GamesGrid
            games={games}
            loading={initialLoading}
            viewMode={viewMode}
            onGameClick={(game) => navigate(`/game/${game.id}`)}
          />

          {/* Invisible trigger for the next page. Kept mounted so the observer stays attached. */}
          <div ref={sentinelRef} aria-hidden style={{ height: 1 }} />

          {loadingMore && (
            <div className={classes.foot}>
              <Loader size="sm" aria-label="Loading more games" />
            </div>
          )}

          {error && games.length > 0 && (
            <div className={classes.foot}>
              <Group gap="sm">
                <Text c="red.4" size="sm">
                  {error}
                </Text>
                <Button
                  variant="default"
                  size="xs"
                  leftSection={<IconRefresh size={14} />}
                  onClick={() => nextPage !== null && void loadPage(nextPage)}
                >
                  Retry
                </Button>
              </Group>
            </div>
          )}

          {!initialLoading && nextPage === null && games.length > 0 && (
            <div className={classes.foot}>That&apos;s every match.</div>
          )}
        </>
      )}
    </div>
  )
}

export default Explore
