import { ActionIcon, Alert, Button, Group, Loader, Select, Text, TextInput } from '@mantine/core'
import { useDebouncedValue, useIntersection, useLocalStorage } from '@mantine/hooks'
import { GamesGrid, type ViewMode } from '@renderer/components/GamesGrid'
import { isoDate } from '@renderer/utils/dates'
import { getErrorMessage } from '@renderer/utils/errors'
import { getScrollTop, scrollRoot, scrollToTop } from '@renderer/utils/scroll'
import type { GameOrdering, GamesQuery } from '@shared/ipc'
import type { Game } from '@shared/types/games'
import {
  IconAlertTriangle,
  IconAward,
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

type Sort = 'popular' | 'critics' | 'new' | 'name'
type Released = 'any' | 'year' | 'five' | 'classic'

interface Filters {
  sort: Sort
  released: Released
  genre: string | null
  acclaimed: boolean
  /** Normalised search text; empty means no search. */
  search: string
}

const DEFAULT_FILTERS: Filters = {
  sort: 'popular',
  released: 'any',
  genre: null,
  acclaimed: false,
  search: ''
}

/*
 * Search request budget: only 3+ characters, only after 600ms without typing, on a
 * normalised query. Main caches every search on disk for a day.
 */
const SEARCH_MIN_LENGTH = 3
const SEARCH_DEBOUNCE_MS = 600
const normaliseSearch = (text: string): string => text.trim().toLowerCase().replace(/\s+/g, ' ')

const SORTS: { value: Sort; label: string; ordering: GameOrdering }[] = [
  { value: 'popular', label: 'Popular', ordering: '-added' },
  { value: 'critics', label: "Critics' picks", ordering: '-metacritic' },
  { value: 'new', label: 'New releases', ordering: '-released' },
  { value: 'name', label: 'A-Z', ordering: 'name' }
]

const RELEASED: { value: Released; label: string }[] = [
  { value: 'any', label: 'Any release date' },
  { value: 'year', label: 'Last 12 months' },
  { value: 'five', label: 'Last 5 years' },
  { value: 'classic', label: 'Classics (before 2010)' }
]

/** RAWG genre slugs, verified against GET /genres. */
const GENRES: { slug: string; label: string }[] = [
  { slug: 'action', label: 'Action' },
  { slug: 'role-playing-games-rpg', label: 'RPG' },
  { slug: 'shooter', label: 'Shooter' },
  { slug: 'adventure', label: 'Adventure' },
  { slug: 'strategy', label: 'Strategy' },
  { slug: 'indie', label: 'Indie' },
  { slug: 'simulation', label: 'Simulation' },
  { slug: 'racing', label: 'Racing' },
  { slug: 'sports', label: 'Sports' },
  { slug: 'platformer', label: 'Platformer' },
  { slug: 'puzzle', label: 'Puzzle' },
  { slug: 'fighting', label: 'Fighting' },
  { slug: 'massively-multiplayer', label: 'MMO' },
  { slug: 'casual', label: 'Casual' }
]

function toQuery(filters: Filters, page: number): GamesQuery {
  const sort = SORTS.find((s) => s.value === filters.sort) ?? SORTS[0]
  const today = isoDate(0)
  const query: GamesQuery = { page, pcOnly: true, ordering: sort.ordering }

  if (filters.released === 'year') query.dates = `${isoDate(-365)},${today}`
  else if (filters.released === 'five') query.dates = `${isoDate(-1826)},${today}`
  else if (filters.released === 'classic') query.dates = '1980-01-01,2009-12-31'
  // "Newest" without a window would surface unreleased placeholders; stop at today.
  else if (filters.sort === 'new') query.dates = `1980-01-01,${today}`

  if (filters.acclaimed) query.metacritic = '75,100'
  // Sorting by score only makes sense among games that have one.
  else if (filters.sort === 'critics') query.metacritic = '1,100'

  if (filters.genre) query.genre = filters.genre
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
        // RAWG pages can overlap when its ordering shifts between requests; drop duplicates.
        const base = isFirstPage ? [] : previous
        const seen = new Set(base.map((game) => game.id))
        return [...base, ...(data.results ?? []).filter((game) => !seen.has(game.id))]
      })
      if (isFirstPage) setCount(data.count)
      setNextPage(data.next ? page + 1 : null)
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
            radius="xl"
          />
          <div className={classes.segment} role="radiogroup" aria-label="Sort by">
            {SORTS.map((sort) => (
              <button
                key={sort.value}
                type="button"
                role="radio"
                aria-checked={filters.sort === sort.value}
                className={classes.segmentButton}
                onClick={() => update({ sort: sort.value })}
              >
                {sort.label}
              </button>
            ))}
          </div>
          <div className={classes.spacer} />
          <Select
            className={classes.select}
            aria-label="Release date"
            data={RELEASED}
            value={filters.released}
            onChange={(value) => value && update({ released: value as Released })}
            allowDeselect={false}
            radius="xl"
            comboboxProps={{ radius: 'md' }}
          />
          <button
            type="button"
            className={classes.toggle}
            aria-pressed={filters.acclaimed}
            onClick={() => update({ acclaimed: !filters.acclaimed })}
          >
            <IconAward size={16} />
            Metacritic 75+
          </button>
        </div>

        <div className={classes.genres} role="group" aria-label="Genre">
          <button
            type="button"
            className={classes.genre}
            aria-pressed={filters.genre === null}
            onClick={() => update({ genre: null })}
          >
            All genres
          </button>
          {GENRES.map((genre) => (
            <button
              key={genre.slug}
              type="button"
              className={classes.genre}
              aria-pressed={filters.genre === genre.slug}
              onClick={() => update({ genre: filters.genre === genre.slug ? null : genre.slug })}
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
            Nothing on PC fits this search and these filters. Try another spelling, loosen the
            release window or pick another genre.
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
            onGameClick={(game) => navigate(`/game/${game.slug}`)}
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
