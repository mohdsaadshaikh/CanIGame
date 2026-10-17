import { rawgImage } from '@renderer/utils/images'
import type { Game } from '@shared/types/games'
import { IconStarFilled } from '@tabler/icons-react'
import classes from './GameTile.module.css'

interface GameTileProps {
  game: Game
  onClick: (game: Game) => void
}

function metacriticClass(score: number): string {
  if (score >= 80) return classes.mcHigh
  if (score >= 60) return classes.mcMid
  return classes.mcLow
}

function releaseLine(released: string | null): string {
  if (!released) return 'Release TBA'
  const date = new Date(released)
  const formatted = date
    .toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    .toUpperCase()
  return date.getTime() > Date.now() ? `Out ${formatted}` : formatted
}

/** Launcher-style game card: inset art, release line, title, genres, score pills. */
export function GameTile({ game, onClick }: GameTileProps): React.JSX.Element {
  const genres = game.genres
    .slice(0, 2)
    .map((genre) => genre.name)
    .join(', ')

  return (
    <button
      type="button"
      className={classes.tile}
      onClick={() => onClick(game)}
      aria-label={`View ${game.name}`}
    >
      <div className={classes.media}>
        <img
          src={rawgImage(game.background_image, 640)}
          alt=""
          loading="lazy"
          draggable={false}
          className={classes.image}
        />
      </div>

      <div className={classes.body}>
        <div className={classes.date}>{releaseLine(game.released)}</div>
        <div className={classes.name}>{game.name}</div>
        <div className={classes.genres}>{genres || 'Genre not listed'}</div>
        <div className={classes.pills}>
          {game.rating > 0 && (
            <span className={`${classes.pill} ${classes.rating}`}>
              <IconStarFilled size={11} aria-hidden />
              {game.rating.toFixed(1)}
            </span>
          )}
          {game.metacritic != null && (
            <span className={`${classes.pill} ${metacriticClass(game.metacritic)}`}>
              MC {game.metacritic}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}
