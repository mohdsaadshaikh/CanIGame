import { compactNumber, isLegendary, releaseLine, reviewTone } from '@renderer/utils/games'
import type { Game } from '@shared/types/games'
import { IconThumbUpFilled } from '@tabler/icons-react'
import classes from './GameTile.module.css'
import { SteamImage } from './SteamImage'

interface GameTileProps {
  game: Game
  onClick: (game: Game) => void
}

/** Shop card (DESIGN.md): full-bleed art, name riding the fade, release line, tags, pills. */
export function GameTile({ game, onClick }: GameTileProps): React.JSX.Element {
  const { review } = game
  const legendary = isLegendary(game)

  return (
    <button
      type="button"
      className={`${classes.tile} cig-cut-sm`}
      data-legendary={legendary || undefined}
      onClick={() => onClick(game)}
      aria-label={`View ${game.name}`}
    >
      <div className={classes.media}>
        <SteamImage
          art={game.art}
          kind="capsule"
          loading="lazy"
          draggable={false}
          className={classes.image}
        />
        {legendary && (
          <span className={classes.rarity}>
            <span>Legendary</span>
          </span>
        )}
      </div>

      <div className={classes.body}>
        <div className={classes.name}>{game.name}</div>
        <div className={classes.date}>{releaseLine(game)}</div>
        <div className={classes.genres}>{game.tags.slice(0, 2).join(', ') || 'No tags yet'}</div>
        <div className={classes.pills}>
          {review && (
            <span
              className={`${classes.pill} ${classes[reviewTone(review.positivePct)]}`}
              title={`${review.label}: ${review.positivePct}% of ${compactNumber.format(review.total)} reviews`}
            >
              <span>
                <IconThumbUpFilled size={12} aria-hidden />
                {review.positivePct}%
              </span>
            </span>
          )}
          {game.discountPct > 0 && (
            <span className={`${classes.pill} ${classes.discount}`}>
              <span>-{game.discountPct}%</span>
            </span>
          )}
          {game.price && (
            <span className={`${classes.pill} ${classes.price}`}>
              <span>{game.price}</span>
            </span>
          )}
        </div>
      </div>
    </button>
  )
}
