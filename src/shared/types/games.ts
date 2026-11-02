/**
 * Game data as the app uses it. Main builds these from Steam's store endpoints
 * (`/search/results`, `/api/appdetails`, `/appreviews`), verified against live responses,
 * so the renderer never sees Steam's raw HTML or field quirks.
 */

/** Steam's user-review summary, e.g. "Very Positive": 93% of 1,159,129 reviews. */
export interface ReviewSummary {
  label: string
  positivePct: number
  total: number
}

/**
 * Full image URLs on Steam's CDN. Newer apps keep each asset in a hashed folder, so main
 * looks these up (`IStoreBrowseService/GetItems`) instead of deriving them from the id.
 * Null means the game has no such art; `header` always exists.
 */
export interface GameArt {
  /** 460x215. */
  header: string
  /** 616x353, the store's main capsule. */
  capsule: string | null
  /** 3840x1240 library banner. */
  hero: string | null
  /** 600x900 portrait cover. */
  portrait: string | null
}

/** A game as it appears in lists, rows and search results. */
export interface Game {
  /** Steam app id. */
  id: number
  name: string
  art: GameArt
  /** ISO `YYYY-MM-DD` when Steam gives an exact day; null for "Coming soon", "Q4 2026"... */
  released: string | null
  /** Steam's own release text ("Oct 22, 2026", "Q4 2026", "Coming soon"). Empty if none. */
  releaseText: string
  comingSoon: boolean
  /** Null when the game has too few reviews for Steam to summarise. */
  review: ReviewSummary | null
  /** Steam user tags, most voted first. On details these are Steam's genres. */
  tags: string[]
  /** Formatted price ("$59.99", "Free"); null when it isn't on sale yet. */
  price: string | null
  /** Current discount, 0 when none. */
  discountPct: number
}

export interface GameListPage {
  games: Game[]
  /** Total matches Steam reports for this query. */
  total: number
  hasMore: boolean
}

/** One line of a requirements block. `label` is null for unlabelled notes. */
export interface RequirementLine {
  label: string | null
  value: string
}

export interface PcRequirements {
  minimum: RequirementLine[]
  recommended: RequirementLine[]
}

export interface Screenshot {
  thumb: string
  full: string
}

export interface GameDetails extends Game {
  shortDescription: string
  /** Plain text; paragraphs separated by blank lines. */
  about: string
  genres: string[]
  developers: string[]
  publishers: string[]
  metacritic: number | null
  screenshots: Screenshot[]
  /** The store page's backdrop art, if the game has one. */
  background: string | null
  website: string | null
  requirements: PcRequirements
  platforms: { windows: boolean; mac: boolean; linux: boolean }
}
