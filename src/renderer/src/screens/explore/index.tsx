import { ActionIcon, Container, Group, Title } from '@mantine/core'
import { GamesGrid } from '@renderer/components/GamesGrid'
import { IconGrid3x3, IconList } from '@tabler/icons-react'
import React, { useEffect, useState } from 'react'
import { Game } from 'src/types/games'

const Explore = (): React.JSX.Element => {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true)
        const data = await window.api.getAllGames()
        setGames(data?.results)
      } catch (error) {
        console.error('Error fetching games:', error)
        setGames([])
      } finally {
        setLoading(false)
      }
    }

    fetchGames()
  }, [])

  return (
    <Container size="xl" py="xl">
      <Group justify="space-between" mb="lg">
        <Title order={1} c="white">
          Explore Games
        </Title>
        <Group gap="xs">
          <ActionIcon
            variant={viewMode === 'grid' ? 'filled' : 'light'}
            color="teal"
            onClick={() => setViewMode('grid')}
          >
            <IconGrid3x3 size={18} />
          </ActionIcon>
          <ActionIcon
            variant={viewMode === 'list' ? 'filled' : 'light'}
            color="teal"
            onClick={() => setViewMode('list')}
          >
            <IconList size={18} />
          </ActionIcon>
        </Group>
      </Group>

      <GamesGrid games={games} loading={loading} viewMode="grid" />
    </Container>
  )
}

export default Explore
