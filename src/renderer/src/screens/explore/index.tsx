import { GameCard } from '@renderer/components/GameCard'
import React, { useEffect, useState } from 'react'
import { Game } from 'src/types/games'

const dummyGame: Game = {
  id: 1,
  slug: 'elden-ring',
  name: 'Elden Ring',
  released: '2022-02-25',
  tba: false,
  background_image: 'https://images.igdb.com/eldensample.jpg',
  rating: 4.7,
  rating_top: 5,
  ratings: [],
  ratings_count: 21345,
  reviews_text_count: 1200,
  added: 15000,
  added_by_status: {
    yet: 1000,
    owned: 8000,
    beaten: 4000,
    toplay: 1500,
    dropped: 300,
    playing: 200
  },
  metacritic: 92,
  playtime: 45,
  suggestions_count: 120,
  updated: '2024-01-15T10:30:00Z',
  user_game: null,
  reviews_count: 850,
  saturated_color: '0f0f23',
  dominant_color: '0f0f23',
  platforms: [
    {
      platform: {
        id: 4,
        name: 'PC',
        slug: 'pc',
        image: null,
        year_start: null,
        year_end: null,
        games_count: 0,
        image_background: ''
      },
      released_at: '2022-02-25',
      requirements_en: null,
      requirements_ru: null
    },
    {
      platform: {
        id: 1,
        name: 'PlayStation 5',
        slug: 'ps5',
        image: null,
        year_start: null,
        year_end: null,
        games_count: 0,
        image_background: ''
      },
      released_at: '2022-02-25',
      requirements_en: null,
      requirements_ru: null
    },
    {
      platform: {
        id: 2,
        name: 'Xbox Series X',
        slug: 'xbox-series-x',
        image: null,
        year_start: null,
        year_end: null,
        games_count: 0,
        image_background: ''
      },
      released_at: '2022-02-25',
      requirements_en: null,
      requirements_ru: null
    }
  ],
  parent_platforms: [
    { platform: { id: 1, name: 'PC', slug: 'pc' } },
    { platform: { id: 2, name: 'PlayStation', slug: 'playstation' } },
    { platform: { id: 3, name: 'Xbox', slug: 'xbox' } }
  ],
  genres: [
    { id: 1, name: 'Action', slug: 'action', games_count: 0, image_background: '' },
    { id: 2, name: 'RPG', slug: 'rpg', games_count: 0, image_background: '' }
  ],
  stores: [],
  clip: null,
  tags: [],
  esrb_rating: {
    id: 4,
    name: 'Mature 17+',
    slug: 'mature'
  },
  short_screenshots: []
}

const Explore = (): React.JSX.Element => {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const data = await window.api.getAllGames()
        console.log('Fetched games:', data)
        setGames(data)
      } catch (error) {
        console.error('Error fetching games:', error)
        // Fallback to dummy data if API fails
        setGames([dummyGame])
      } finally {
        setLoading(false)
      }
    }

    fetchGames()
  }, [])

  const handleGameClick = (game: Game) => {
    console.log('Game clicked:', game.name)
    // Add your game click logic here
  }

  if (loading) {
    return <div>Loading games...</div>
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ color: 'white', marginBottom: '20px' }}>Explore Games</h1>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '20px'
        }}
      >
        {games.length > 0 ? (
          games.map((game) => (
            <GameCard key={game.id} game={game} viewMode="grid" onGameClick={handleGameClick} />
          ))
        ) : (
          <GameCard game={dummyGame} viewMode="grid" onGameClick={handleGameClick} />
        )}
      </div>
    </div>
  )
}

export default Explore
