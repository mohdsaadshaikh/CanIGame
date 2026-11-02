import { useLocalStorage } from '@mantine/hooks'
import type { GameArt, GameDetails } from '@shared/types/games'
import { useCallback } from 'react'

export interface RecentGame {
  /** Steam app id. */
  id: number
  name: string
  art: GameArt
  genre: string
}

const MAX_RECENT = 5

/** Games the user opened most recently, newest first, kept in localStorage. */
export function useRecentGames(): {
  recent: RecentGame[]
  remember: (game: GameDetails) => void
} {
  const [recent, setRecent] = useLocalStorage<RecentGame[]>({
    // v2: entries are keyed by Steam app id (v1 held RAWG slugs).
    key: 'recent-games-v2',
    defaultValue: [],
    getInitialValueInEffect: false
  })

  const remember = useCallback(
    (game: GameDetails) =>
      setRecent((previous) =>
        [
          {
            id: game.id,
            name: game.name,
            art: game.art,
            genre: game.genres[0] ?? game.tags[0] ?? ''
          },
          ...(previous ?? []).filter((item) => item.id !== game.id)
        ].slice(0, MAX_RECENT)
      ),
    [setRecent]
  )

  return { recent: recent ?? [], remember }
}
