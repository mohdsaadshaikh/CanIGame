import { Loader, Text } from '@mantine/core'
import { rawgImage } from '@renderer/utils/images'
import { useDebouncedValue } from '@mantine/hooks'
import { Spotlight } from '@mantine/spotlight'
import { links } from '@renderer/constants'
import { getErrorMessage } from '@renderer/utils/errors'
import type { Game } from '@shared/types/games'
import { IconSearch } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import classes from './GameSearch.module.css'

/*
 * Request budget: search only after 3+ characters and 600ms of no typing, on a normalised
 * query, and keep every answer for the session so revisiting a query costs nothing.
 * (Main also caches searches on disk for a day.)
 */
const MIN_QUERY_LENGTH = 3
const DEBOUNCE_MS = 600
const MAX_RESULTS = 8

const normalise = (text: string): string => text.trim().toLowerCase().replace(/\s+/g, ' ')
const sessionResults = new Map<string, Game[]>()

interface SearchState {
  results: Game[]
  loading: boolean
  error: string | null
}

const IDLE: SearchState = { results: [], loading: false, error: null }

/** Command palette (Ctrl/⌘+K): live RAWG game search plus quick page navigation. */
export function GameSearch(): React.JSX.Element {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [debouncedQuery] = useDebouncedValue(normalise(query), DEBOUNCE_MS)
  const [state, setState] = useState<SearchState>(IDLE)

  useEffect(() => {
    if (debouncedQuery.length < MIN_QUERY_LENGTH) {
      setState(IDLE)
      return
    }

    const remembered = sessionResults.get(debouncedQuery)
    if (remembered) {
      setState({ results: remembered, loading: false, error: null })
      return
    }

    let cancelled = false
    setState((previous) => ({ ...previous, loading: true, error: null }))
    window.api
      .getGames({ search: debouncedQuery, pageSize: MAX_RESULTS })
      .then((data) => {
        const results = data.results ?? []
        sessionResults.set(debouncedQuery, results)
        if (!cancelled) setState({ results, loading: false, error: null })
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setState({ results: [], loading: false, error: getErrorMessage(err, 'Search failed.') })
        }
      })

    return () => {
      cancelled = true
    }
  }, [debouncedQuery])

  const trimmed = normalise(query)
  const pages = links.filter(
    (link) =>
      !trimmed ||
      link.label.toLowerCase().includes(trimmed) ||
      link.description.toLowerCase().includes(trimmed)
  )
  const searching = trimmed.length >= MIN_QUERY_LENGTH
  // Results are stale while the debounce catches up with typing.
  const pending =
    searching && !sessionResults.has(trimmed) && (state.loading || debouncedQuery !== trimmed)
  const noGames = searching && !pending && !state.error && state.results.length === 0

  const go = (to: string): void => {
    void navigate(to)
  }

  return (
    <Spotlight.Root
      query={query}
      onQueryChange={setQuery}
      shortcut={['mod + K', '/']}
      clearQueryOnClose
      scrollable
      maxHeight={480}
      classNames={{
        content: classes.content,
        search: classes.search,
        actionsGroup: classes.group,
        action: classes.action
      }}
    >
      <Spotlight.Search
        placeholder="Search games, or jump to a page…"
        leftSection={<IconSearch size={20} stroke={1.5} />}
        rightSection={pending ? <Loader size="xs" /> : null}
      />

      <Spotlight.ActionsList>
        {searching && state.results.length > 0 && (
          <Spotlight.ActionsGroup label="Games">
            {state.results.map((game) => (
              <Spotlight.Action key={game.id} onClick={() => go(`/game/${game.slug}`)}>
                <div className={classes.result}>
                  <img
                    src={rawgImage(game.background_image, 420)}
                    alt=""
                    className={classes.thumb}
                    loading="lazy"
                  />
                  <div className={classes.text}>
                    <Text fw={600} lineClamp={1}>
                      {game.name}
                    </Text>
                    <Text size="xs" c="dimmed" lineClamp={1}>
                      <span className={classes.meta}>
                        {game.released ? new Date(game.released).getFullYear() : 'TBA'}
                      </span>
                      {game.genres.length > 0 &&
                        `   ${game.genres
                          .slice(0, 2)
                          .map((genre) => genre.name)
                          .join(', ')}`}
                    </Text>
                  </div>
                </div>
              </Spotlight.Action>
            ))}
          </Spotlight.ActionsGroup>
        )}

        {pages.length > 0 && (
          <Spotlight.ActionsGroup label="Pages">
            {pages.map((link) => {
              const Icon = link.icon.outline
              return (
                <Spotlight.Action key={link.to} onClick={() => go(link.to)}>
                  <div className={classes.result}>
                    <span className={classes.pageIcon}>
                      <Icon size={20} />
                    </span>
                    <div className={classes.text}>
                      <Text fw={600}>{link.label}</Text>
                      <Text size="xs" c="dimmed">
                        {link.description}
                      </Text>
                    </div>
                  </div>
                </Spotlight.Action>
              )
            })}
          </Spotlight.ActionsGroup>
        )}

        {state.error && searching && <div className={classes.hint}>{state.error}</div>}
        {noGames && <div className={classes.hint}>No games match “{query.trim()}”.</div>}
        {!searching && (
          <div className={classes.hint}>
            Type at least {MIN_QUERY_LENGTH} letters to search games.
          </div>
        )}
      </Spotlight.ActionsList>
    </Spotlight.Root>
  )
}
