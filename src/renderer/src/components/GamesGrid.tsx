'use client'

import { Grid, Stack, Center, Text, Skeleton } from '@mantine/core'
import { GameCard } from './GameCard'
import { JSX } from 'react'
import { Game } from '../../../types/games'

interface GamesGridProps {
  games: Game[]
  loading: boolean
  viewMode: 'grid' | 'list'
  onGameClick?: (game: Game) => void
}

export function GamesGrid({ games, loading, viewMode, onGameClick }: GamesGridProps): JSX.Element {
  if (loading) {
    return (
      <Grid>
        {Array.from({ length: 12 }).map((_, index) => (
          <Grid.Col key={index} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
            <Skeleton height={300} radius="md" />
          </Grid.Col>
        ))}
      </Grid>
    )
  }

  if (games.length === 0) {
    return (
      <Center py="xl">
        <Text c="dimmed" size="lg">
          No games found matching your criteria.
        </Text>
      </Center>
    )
  }

  if (viewMode === 'list') {
    return (
      <Stack gap="md">
        {games.map((game) => (
          <GameCard key={game.id} game={game} viewMode="list" onGameClick={onGameClick} />
        ))}
      </Stack>
    )
  }

  return (
    <Grid>
      {games.map((game) => (
        <Grid.Col key={game.id} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
          <GameCard game={game} viewMode="grid" onGameClick={onGameClick} />
        </Grid.Col>
      ))}
    </Grid>
  )
}
