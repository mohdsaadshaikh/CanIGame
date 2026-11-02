import { ActionIcon, Button } from '@mantine/core'
import { compactNumber, releaseShort } from '@renderer/utils/games'
import type { Game } from '@shared/types/games'
import { IconChevronLeft, IconChevronRight, IconThumbUpFilled } from '@tabler/icons-react'
import { useEffect, useState, type CSSProperties } from 'react'
import classes from './FeaturedHero.module.css'
import { SteamImage } from './SteamImage'

const SLIDE_DURATION_MS = 8000
const DESCRIPTION_MAX = 170

interface FeaturedHeroProps {
  games: Game[]
  onSelect: (game: Game) => void
  /** Fires when the visible slide changes (Home tints its backdrop from it). */
  onActiveChange?: (game: Game) => void
}

/**
 * List results carry no description, so the active game's detail record is fetched once
 * (main caches it on disk too) and trimmed to its first sentence or two.
 */
const descriptions = new Map<number, string>()

function summarise(text: string): string {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= DESCRIPTION_MAX) return clean
  const sentences = clean.match(/[^.!?]+[.!?]+/g) ?? [clean]
  let out = ''
  for (const sentence of sentences) {
    if ((out + sentence).length > DESCRIPTION_MAX) break
    out += sentence
  }
  return (out || `${clean.slice(0, DESCRIPTION_MAX).replace(/\s+\S*$/, '')}...`).trim()
}

function useDescription(appId: number | undefined): string | undefined {
  const [, force] = useState(0)
  useEffect(() => {
    if (appId === undefined || descriptions.has(appId)) return
    let cancelled = false
    window.api
      .getGame(appId)
      .then((details) => {
        descriptions.set(appId, summarise(details.shortDescription || details.about))
        if (!cancelled) force((n) => n + 1)
      })
      .catch(() => descriptions.set(appId, ''))
    return () => {
      cancelled = true
    }
  }, [appId])
  return appId === undefined ? undefined : descriptions.get(appId)
}

export function FeaturedHero({
  games,
  onSelect,
  onActiveChange
}: FeaturedHeroProps): React.JSX.Element | null {
  const [activeIndex, setActiveIndex] = useState(0)
  const [hovered, setHovered] = useState(false)
  const [focusWithin, setFocusWithin] = useState(false)

  const count = games.length
  const index = Math.min(activeIndex, Math.max(count - 1, 0))
  const active: Game | undefined = games[index]
  const description = useDescription(active?.id)

  useEffect(() => {
    if (active) onActiveChange?.(active)
  }, [active, onActiveChange])

  if (!active) return null

  const paused = hovered || focusWithin
  const goTo = (next: number): void => setActiveIndex(((next % count) + count) % count)

  const stats: { value: React.ReactNode; label: string }[] = [
    active.review && {
      value: (
        <>
          <IconThumbUpFilled size={18} className={classes.star} aria-hidden />
          {active.review.positivePct}%
        </>
      ),
      label: active.review.label
    },
    active.review && { value: compactNumber.format(active.review.total), label: 'Steam reviews' },
    active.price && {
      value: active.discountPct > 0 ? `${active.price} (-${active.discountPct}%)` : active.price,
      label: active.comingSoon ? 'Pre-order' : 'Price'
    }
  ].filter(Boolean) as { value: React.ReactNode; label: string }[]

  return (
    <section
      className={classes.hero}
      data-paused={paused || undefined}
      style={{ '--slide-duration': `${SLIDE_DURATION_MS}ms` } as CSSProperties}
      aria-roledescription="carousel"
      aria-label="Featured games"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocusWithin(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setFocusWithin(false)
        }
      }}
    >
      <div className={classes.stage}>
        <div className={classes.art} aria-hidden="true">
          {games.map((game, i) => (
            <SteamImage
              key={game.id}
              art={game.art}
              kind="hero"
              className={classes.artImage}
              data-active={i === index || undefined}
              draggable={false}
            />
          ))}
        </div>

        <div className={classes.nav}>
          <ActionIcon size="lg" aria-label="Previous featured game" onClick={() => goTo(index - 1)}>
            <IconChevronLeft size={18} />
          </ActionIcon>
          <ActionIcon size="lg" aria-label="Next featured game" onClick={() => goTo(index + 1)}>
            <IconChevronRight size={18} />
          </ActionIcon>
        </div>

        {/* Re-keyed per slide so the entrance replays. Announce changes only while the
            user has paused the carousel, so autoplay doesn't talk over screen readers. */}
        <div
          key={active.id}
          className={classes.content}
          aria-roledescription="slide"
          aria-label={`${index + 1} of ${count}`}
          aria-live={paused ? 'polite' : 'off'}
        >
          <div className={`${classes.cover} cig-cut`}>
            <SteamImage art={active.art} kind="portrait" draggable={false} />
          </div>

          <div className={classes.copy}>
            <div className={classes.chips}>
              <span className={classes.chip}>
                <span>PC</span>
              </span>
              <span className={classes.chip}>
                <span>{releaseShort(active)}</span>
              </span>
              {active.tags.slice(0, 2).map((tag) => (
                <span key={tag} className={classes.chip}>
                  <span>{tag}</span>
                </span>
              ))}
            </div>
            <h3 className={classes.title}>{active.name}</h3>
            <p className={classes.description}>{description || ' '}</p>
            {stats.length > 0 && (
              <div className={classes.stats}>
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <div className={classes.statValue}>{stat.value}</div>
                    <div className={classes.statLabel}>{stat.label}</div>
                  </div>
                ))}
              </div>
            )}
            <Button size="md" onClick={() => onSelect(active)}>
              View details
            </Button>
          </div>
        </div>
      </div>

      <div className={classes.strip} role="tablist" aria-label="Featured games list">
        {games.map((game, i) => {
          const isActive = i === index
          return (
            <button
              key={game.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={classes.card}
              data-active={isActive || undefined}
              onClick={() => goTo(i)}
            >
              <span className={`${classes.cardArt} cig-cut-sm`}>
                <SteamImage art={game.art} kind="capsule" loading="lazy" draggable={false} />
              </span>
              <span className={classes.cardName}>{game.name}</span>
              <span className={classes.cardMeta}>
                {game.tags.slice(0, 2).join(', ') || releaseShort(game)}
              </span>
              <span className={classes.cardTrack} aria-hidden="true">
                {isActive && count > 1 && (
                  <span className={classes.cardFill} onAnimationEnd={() => goTo(index + 1)} />
                )}
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
