/**
 * RAWG API types. Field shapes verified against live responses from
 * `GET /games` (list) and `GET /games/{slug}` (detail).
 * Fields RAWG returns as `null` for some games are typed as nullable.
 */

// ---------------------------------------------------------------------------
// List endpoint: GET /games
// ---------------------------------------------------------------------------

export interface GameListResponse {
  count: number
  next: string | null
  previous: string | null
  results: Game[]
  filters: Filters
}

/** A game as returned by the list endpoint. */
export interface Game {
  id: number
  slug: string
  name: string
  released: string | null
  tba: boolean
  background_image: string | null
  rating: number
  rating_top: number
  ratings: Rating[]
  ratings_count: number
  reviews_text_count: number
  added: number
  added_by_status: AddedByStatus | null
  metacritic: number | null
  playtime: number
  suggestions_count: number
  updated: string
  reviews_count: number
  saturated_color: string
  dominant_color: string
  platforms: GamePlatform[]
  parent_platforms: ParentPlatform[]
  genres: Genre[]
  stores: StoreInfo[]
  tags: Tag[]
  esrb_rating: EsrbRating | null
  short_screenshots: Screenshot[]
  clip: unknown | null
  user_game: unknown | null
}

// ---------------------------------------------------------------------------
// Detail endpoint: GET /games/{id|slug}
// ---------------------------------------------------------------------------

/**
 * A game as returned by the detail endpoint. Note that `platforms[]` here
 * carries `requirements` (not `requirements_en`) and the list-only field
 * `short_screenshots` is absent.
 */
export interface GameDetails extends Omit<Game, 'platforms' | 'short_screenshots'> {
  name_original: string
  /** HTML */
  description: string
  /** Plain text */
  description_raw: string
  website: string
  metacritic_url: string
  metacritic_platforms: MetacriticPlatform[]
  background_image_additional: string | null
  developers: Company[]
  publishers: Company[]
  platforms: GameDetailsPlatform[]
  alternative_names: string[]
  reddit_url: string
  reddit_name: string
  reddit_description: string
  reddit_logo: string
  reddit_count: number
  twitch_count: number
  youtube_count: number
  screenshots_count: number
  movies_count: number
  creators_count: number
  achievements_count: number
  parent_achievements_count: number
  parents_count: number
  additions_count: number
  game_series_count: number
}

// ---------------------------------------------------------------------------
// Shared sub-objects
// ---------------------------------------------------------------------------

export interface Rating {
  id: number
  title: string
  count: number
  percent: number
}

export interface AddedByStatus {
  yet?: number
  owned?: number
  beaten?: number
  toplay?: number
  dropped?: number
  playing?: number
}

/** Platform entry on the list endpoint. */
export interface GamePlatform {
  platform: Platform
  released_at: string | null
  requirements_en: Requirements | null
  requirements_ru: Requirements | null
}

/** Platform entry on the detail endpoint. */
export interface GameDetailsPlatform {
  platform: Platform
  released_at: string | null
  requirements: Requirements | null
}

export interface Platform {
  id: number
  name: string
  slug: string
  image: string | null
  year_start: number | null
  year_end: number | null
  games_count: number
  image_background: string
}

/** Free-text system requirements as RAWG stores them (one blob each). */
export interface Requirements {
  minimum?: string
  recommended?: string
}

export interface ParentPlatform {
  platform: {
    id: number
    name: string
    slug: string
  }
}

export interface Genre {
  id: number
  name: string
  slug: string
  games_count: number
  image_background: string
}

export interface StoreInfo {
  id: number
  store: Store
}

export interface Store {
  id: number
  name: string
  slug: string
  domain: string
  games_count: number
  image_background: string
}

export interface Tag {
  id: number
  name: string
  slug: string
  language: string
  games_count: number
  image_background: string
}

export interface EsrbRating {
  id: number
  name: string
  slug: string
}

export interface Screenshot {
  id: number
  image: string
}

export interface Company {
  id: number
  name: string
  slug: string
  games_count: number
  image_background: string
}

export interface MetacriticPlatform {
  metascore: number
  url: string
  platform: {
    platform: number
    name: string
    slug: string
  }
}

// ---------------------------------------------------------------------------
// Filters (list endpoint)
// ---------------------------------------------------------------------------

export interface Year {
  year: number
  count: number
  nofollow: boolean
}

export interface DecadeFilter {
  from: number
  to: number
  filter: string
  decade: number
  years: Year[]
  nofollow: boolean
  count: number
}

export interface Filters {
  years: DecadeFilter[]
}
