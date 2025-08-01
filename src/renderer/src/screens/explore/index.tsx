import { Container, Title } from '@mantine/core'
import { GamesGrid } from '@renderer/components/GamesGrid'
import React, { useEffect, useState } from 'react'
import { Game } from 'src/types/games'

const Explore = (): React.JSX.Element => {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)

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
      <Title order={1} mb="xl" c="white">
        Explore Games
      </Title>

      <GamesGrid games={games} loading={loading} viewMode="grid" />
    </Container>
  )
}

export default Explore
