import { Skeleton } from '@mantine/core'
import { rawgImage } from '@renderer/utils/images'
import type { Game } from '@shared/types/games'
import { IconStarFilled } from '@tabler/icons-react'
import { GameTile } from './GameTile'
import classes from './GamesGrid.module.css'

export type ViewMode = 'grid' | 'list'

interface GamesGridProps {
  games: Game[]
  loading: boolean
  viewMode: ViewMode
  onGameClick: (game: Game) => void
}

const SKELETON_COUNT = 12

const GameListRow = ({
  game,
  onClick
}: {
  game: Game
  onClick: (game: Game) => void
}): React.JSX.Element => (
  <button
    type="button"
    className={classes.row}
    onClick={() => onClick(game)}
    aria-label={`View ${game.name}`}
  >
    <span className={classes.rowArt}>
      <img src={rawgImage(game.background_image, 420)} alt="" loading="lazy" draggable={false} />
    </span>
    <span className={classes.rowMain}>
      <span className={classes.rowName} style={{ display: 'block' }}>
        {game.name}
      </span>
      <span className={classes.rowMeta} style={{ display: 'block' }}>
        {game.genres.map((genre) => genre.name).join(', ') || 'Genre not listed'}
      </span>
    </span>
    <span className={classes.rowStats}>
      {game.rating > 0 && (
        <span className={`${classes.pill} ${classes.rating}`}>
          <IconStarFilled size={11} aria-hidden />
          {game.rating.toFixed(1)}
        </span>
      )}
      {game.metacritic != null && (
        <span className={`${classes.pill} ${classes.mc}`}>MC {game.metacritic}</span>
      )}
      <span className={`${classes.pill} ${classes.year}`}>
        {game.released ? new Date(game.released).getFullYear() : 'TBA'}
      </span>
    </span>
  </button>
)

/** Explore's results in launcher cards (grid) or wide rows (list). Empty state is the caller's. */
export function GamesGrid({
  games,
  loading,
  viewMode,
  onGameClick
}: GamesGridProps): React.JSX.Element {
  if (loading) {
    return (
      <div className={viewMode === 'list' ? classes.list : classes.grid}>
        {Array.from({ length: SKELETON_COUNT }, (_, index) =>
          viewMode === 'list' ? (
            <Skeleton key={index} height={112} radius={16} />
          ) : (
            <div key={index} className={classes.skeletonTile}>
              <Skeleton radius={10} style={{ aspectRatio: '16 / 10' }} />
              <Skeleton height={10} width="40%" mt={14} />
              <Skeleton height={14} width="75%" mt={10} />
              <Skeleton height={20} width={56} radius="xl" mt={16} />
            </div>
          )
        )}
      </div>
    )
  }

  if (viewMode === 'list') {
    return (
      <div className={classes.list}>
        {games.map((game) => (
          <GameListRow key={game.id} game={game} onClick={onGameClick} />
        ))}
      </div>
    )
  }

  return (
    <div className={classes.grid}>
      {games.map((game) => (
        <GameTile key={game.id} game={game} onClick={onGameClick} />
      ))}
    </div>
  )
}
