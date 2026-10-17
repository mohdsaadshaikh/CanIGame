import { useLocalStorage } from '@mantine/hooks'
import type { GameDetails } from '@shared/types/games'
import { useCallback } from 'react'

export interface RecentGame {
  slug: string
  name: string
  image: string | null
  genre: string
}

const MAX_RECENT = 5

/** Games the user opened most recently, newest first, kept in localStorage. */
export function useRecentGames(): {
  recent: RecentGame[]
  remember: (game: GameDetails) => void
} {
  const [recent, setRecent] = useLocalStorage<RecentGame[]>({
    key: 'recent-games',
    defaultValue: [],
    getInitialValueInEffect: false
  })

  const remember = useCallback(
    (game: GameDetails) =>
      setRecent((previous) =>
        [
          {
            slug: game.slug,
            name: game.name,
            image: game.background_image,
            genre: game.genres[0]?.name ?? ''
          },
          ...(previous ?? []).filter((item) => item.slug !== game.slug)
        ].slice(0, MAX_RECENT)
      ),
    [setRecent]
  )

  return { recent: recent ?? [], remember }
}
