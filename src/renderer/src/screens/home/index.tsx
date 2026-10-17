import { Alert, Button, Container, Group, Skeleton, Stack, VisuallyHidden } from '@mantine/core'
import { FeaturedHero } from '@renderer/components/FeaturedHero'
import { GameRow } from '@renderer/components/GameRow'
import { RigBoard } from '@renderer/components/RigBoard'
import { SectionHeader } from '@renderer/components/SectionHeader'
import { useGames } from '@renderer/hooks/useGames'
import type { GamesQuery } from '@shared/ipc'
import type { Game } from '@shared/types/games'
import { isoDate } from '@renderer/utils/dates'
import { rawgImage } from '@renderer/utils/images'
import { IconAlertTriangle, IconRefresh } from '@tabler/icons-react'
import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import classes from './Home.module.css'

const FEATURED_COUNT = 5
const ROW_SIZE = 15

/**
 * The home page is PC-focused (it's a "can my PC run it" app), so every section filters to
 * PC releases. `-added` (how many RAWG users added the game) is the best popularity signal.
 */
function buildQueries(): Record<'popular' | 'newReleases' | 'acclaimed' | 'upcoming', GamesQuery> {
  return {
    // Hero takes the first few, the "Trending now" row gets the rest: one request, two sections.
    popular: { ordering: '-added', dates: `${isoDate(-540)},${isoDate(0)}`, pcOnly: true },
    newReleases: {
      ordering: '-added',
      dates: `${isoDate(-60)},${isoDate(0)}`,
      pcOnly: true,
      pageSize: ROW_SIZE
    },
    acclaimed: { ordering: '-added', metacritic: '90,100', pcOnly: true, pageSize: ROW_SIZE },
    upcoming: {
      ordering: '-added',
      dates: `${isoDate(1)},${isoDate(365)}`,
      pcOnly: true,
      pageSize: ROW_SIZE
    }
  }
}

const Home = (): React.JSX.Element => {
  const navigate = useNavigate()
  // Dates are computed once per visit; useGames caches by query value.
  const queries = useMemo(buildQueries, [])

  const popular = useGames(queries.popular)
  const newReleases = useGames(queries.newReleases)
  const acclaimed = useGames(queries.acclaimed)
  const upcoming = useGames(queries.upcoming)

  const featured = useMemo(
    () => popular.games.filter((game) => game.background_image).slice(0, FEATURED_COUNT),
    [popular.games]
  )
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
    void navigate(`/game/${game.slug}`)
  }

  // The featured slide's key art, blurred, is the page's atmosphere (console-dashboard style).
  const [ambientId, setAmbientId] = useState<number | null>(null)
  const handleActiveChange = useCallback((game: Game) => setAmbientId(game.id), [])

  return (
    <Container size="xl" py="xs" className={classes.page}>
      <div className={classes.ambient} aria-hidden="true">
        {featured.map((game) => (
          <img
            key={game.id}
            src={rawgImage(game.background_image, 'full')}
            alt=""
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
            meta="Most added on PC, last 18 months"
          />
          {popular.loading ? (
            <Skeleton radius={16} className={classes.heroSkeleton} />
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
          title="Trending now"
          games={trending}
          loading={popular.loading}
          error={popular.error}
          onRetry={popular.retry}
          onGameClick={openGame}
        />

        <GameRow
          title="New releases"
          meta="Last 60 days"
          games={freshReleases}
          loading={newReleases.loading}
          error={newReleases.error}
          onRetry={newReleases.retry}
          onGameClick={openGame}
        />

        <GameRow
          title="All-time greats"
          meta="Metacritic 90 and up"
          games={acclaimed.games}
          loading={acclaimed.loading}
          error={acclaimed.error}
          onRetry={acclaimed.retry}
          onGameClick={openGame}
        />

        <GameRow
          title="Coming soon"
          meta="Next 12 months"
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
