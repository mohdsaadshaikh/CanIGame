import type { Game } from '@shared/types/games'

/** Steam's own bands: 70%+ reads positive, 40-69% mixed, below that negative. */
export function reviewTone(positivePct: number): 'high' | 'mid' | 'low' {
  if (positivePct >= 70) return 'high'
  if (positivePct >= 40) return 'mid'
  return 'low'
}

/**
 * Fortnite-style rarity, in the one orange family (DESIGN.md). "Legendary" is Steam's own top
 * band, Overwhelmingly Positive: 95%+ positive across 500+ reviews. Rare enough to mean it.
 */
export function isLegendary(game: Game): boolean {
  return game.review !== null && game.review.positivePct >= 95 && game.review.total >= 500
}

/** Parse `YYYY-MM-DD` as a local date (`new Date('2026-10-22')` would be UTC midnight). */
const localDate = (iso: string): Date => new Date(`${iso}T00:00:00`)

const formatDay = (iso: string): string =>
  localDate(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

/** "22 Oct 2026", "Out 22 Oct 2026", "Q4 2026", "Coming soon"; "Release TBA" when unknown. */
export function releaseLine(game: Game): string {
  if (game.released) {
    const day = formatDay(game.released)
    return game.comingSoon ? `Out ${day}` : day
  }
  if (!game.releaseText) return 'Release TBA'
  return game.comingSoon && /\d/.test(game.releaseText)
    ? `Out ${game.releaseText}`
    : game.releaseText
}

/** Compact form for chips: the year once a game is out, the full date before. */
export function releaseShort(game: Game): string {
  if (game.released) {
    return game.comingSoon ? formatDay(game.released) : game.released.slice(0, 4)
  }
  return game.releaseText || 'TBA'
}

export const compactNumber = new Intl.NumberFormat('en', {
  notation: 'compact',
  maximumFractionDigits: 1
})
