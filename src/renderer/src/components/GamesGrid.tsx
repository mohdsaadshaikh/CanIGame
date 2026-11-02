import { Skeleton } from '@mantine/core'
import { releaseShort, reviewTone } from '@renderer/utils/games'
import type { Game } from '@shared/types/games'
import { IconThumbUpFilled } from '@tabler/icons-react'
import { GameTile } from './GameTile'
import classes from './GamesGrid.module.css'
import { SteamImage } from './SteamImage'

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
    className={`${classes.row} cig-cut-sm`}
    onClick={() => onClick(game)}
    aria-label={`View ${game.name}`}
  >
    <span className={classes.rowArt}>
      <SteamImage art={game.art} kind="capsule" loading="lazy" draggable={false} />
    </span>
    <span className={classes.rowMain}>
      <span className={classes.rowName} style={{ display: 'block' }}>
        {game.name}
      </span>
      <span className={classes.rowMeta} style={{ display: 'block' }}>
        {game.tags.slice(0, 4).join(', ') || 'No tags yet'}
      </span>
    </span>
    <span className={classes.rowStats}>
      {game.review && (
        <span
          className={`${classes.pill} ${classes[reviewTone(game.review.positivePct)]}`}
          title={game.review.label}
        >
          <IconThumbUpFilled size={11} aria-hidden />
          {game.review.positivePct}%
        </span>
      )}
      {game.discountPct > 0 && (
        <span className={`${classes.pill} ${classes.discount}`}>-{game.discountPct}%</span>
      )}
      {game.price && <span className={`${classes.pill} ${classes.price}`}>{game.price}</span>}
      <span className={`${classes.pill} ${classes.year}`}>{releaseShort(game)}</span>
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
            <Skeleton key={index} height={112} radius="lg" />
          ) : (
            <div key={index} className={classes.skeletonTile}>
              <Skeleton radius="md" style={{ aspectRatio: '16 / 10' }} />
              <Skeleton height={10} width="40%" mt={14} />
              <Skeleton height={14} width="75%" mt={10} />
              <Skeleton height={20} width={56} radius="sm" mt={16} />
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
