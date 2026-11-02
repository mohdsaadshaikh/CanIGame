import { Alert, Button, Container, Group, Skeleton, Stack, VisuallyHidden } from '@mantine/core'
import { FeaturedHero } from '@renderer/components/FeaturedHero'
import { GameRow } from '@renderer/components/GameRow'
import { RigBoard } from '@renderer/components/RigBoard'
import { SectionHeader } from '@renderer/components/SectionHeader'
import { SteamImage } from '@renderer/components/SteamImage'
import { useGames } from '@renderer/hooks/useGames'
import type { GamesQuery } from '@shared/ipc'
import type { Game } from '@shared/types/games'
import { IconAlertTriangle, IconRefresh } from '@tabler/icons-react'
import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import classes from './Home.module.css'

const FEATURED_COUNT = 5

/**
 * Steam's store lists, one request each (main caches them). Stable module-level objects, so
 * useGames' cache key never changes; the sidebar's "Popular" list reuses the top-sellers one.
 */
const QUERIES = {
  // Hero takes the first few, the "Top sellers" row gets the rest: one request, two sections.
  topSellers: { list: 'topsellers' },
  newAndTrending: { list: 'trending' },
  topRated: { list: 'toprated' },
  onSale: { list: 'specials' },
  upcoming: { list: 'upcoming' }
} satisfies Record<string, GamesQuery>

const Home = (): React.JSX.Element => {
  const navigate = useNavigate()
  const popular = useGames(QUERIES.topSellers)
  const newReleases = useGames(QUERIES.newAndTrending)
  const topRated = useGames(QUERIES.topRated)
  const onSale = useGames(QUERIES.onSale)
  const upcoming = useGames(QUERIES.upcoming)

  const featured = useMemo(() => popular.games.slice(0, FEATURED_COUNT), [popular.games])
  const featuredIds = useMemo(() => new Set(featured.map((game) => game.id)), [featured])
  const trending = useMemo(
    () => popular.games.filter((game) => !featuredIds.has(game.id)),
    [popular.games, featuredIds]
  )
  const freshReleases = useMemo(
    () => newReleases.games.filter((game) => !featuredIds.has(game.id)),
    [newReleases.games, featuredIds]
  )

  const openGame = (game: Game): void => {
    void navigate(`/game/${game.id}`)
  }

  // The featured slide's key art, blurred, is the page's atmosphere (console-dashboard style).
  const [ambientId, setAmbientId] = useState<number | null>(null)
  const handleActiveChange = useCallback((game: Game) => setAmbientId(game.id), [])

  return (
    <Container size="xl" py="xs" className={classes.page}>
      <div className={classes.ambient} aria-hidden="true">
        {featured.map((game) => (
          <SteamImage
            key={game.id}
            art={game.art}
            kind="capsule"
            className={classes.ambientImage}
            data-active={game.id === ambientId || undefined}
          />
        ))}
      </div>
      {/* Visually hidden page heading so screen readers get a proper document outline. */}
      <VisuallyHidden component="h1">Home</VisuallyHidden>
      <Stack gap={40}>
        <RigBoard />

        <section aria-labelledby="featured-heading">
          <SectionHeader
            id="featured-heading"
            title="Featured"
            meta="Top sellers on Steam right now"
          />
          {popular.loading ? (
            <Skeleton radius="lg" className={classes.heroSkeleton} />
          ) : popular.error ? (
            <Alert
              icon={<IconAlertTriangle size={20} />}
              title="Could not load featured games"
              color="red"
            >
              <Group justify="space-between" align="center">
                {popular.error}
                <Button
                  variant="light"
                  color="red"
                  size="xs"
                  leftSection={<IconRefresh size={14} />}
                  onClick={popular.retry}
                >
                  Retry
                </Button>
              </Group>
            </Alert>
          ) : (
            <FeaturedHero
              games={featured}
              onSelect={openGame}
              onActiveChange={handleActiveChange}
            />
          )}
        </section>

        <GameRow
          title="Top sellers"
          meta="More of what PC players are buying"
          games={trending}
          loading={popular.loading}
          error={popular.error}
          onRetry={popular.retry}
          onGameClick={openGame}
        />

        <GameRow
          title="New and trending"
          meta="Popular new releases"
          games={freshReleases}
          loading={newReleases.loading}
          error={newReleases.error}
          onRetry={newReleases.retry}
          onGameClick={openGame}
        />

        <GameRow
          title="Top rated"
          meta="Best user reviews on Steam"
          games={topRated.games}
          loading={topRated.loading}
          error={topRated.error}
          onRetry={topRated.retry}
          onGameClick={openGame}
        />

        <GameRow
          title="On sale"
          meta="Current Steam discounts"
          games={onSale.games}
          loading={onSale.loading}
          error={onSale.error}
          onRetry={onSale.retry}
          onGameClick={openGame}
        />

        <GameRow
          title="Coming soon"
          meta="Most wishlisted upcoming games"
          games={upcoming.games}
          loading={upcoming.loading}
          error={upcoming.error}
          onRetry={upcoming.retry}
          onGameClick={openGame}
        />
      </Stack>
    </Container>
  )
}

export default Home
