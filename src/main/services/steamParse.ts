import { STEAM_IMAGE_ORIGIN } from '@shared/steam'
import type {
  Game,
  GameArt,
  GameDetails,
  RequirementLine,
  ReviewSummary,
  Screenshot
} from '@shared/types/games'

/**
 * Pure converters from Steam's store payloads to the app's types. No network, no Electron:
 * everything here is a function of its input so it can be unit-tested against saved
 * responses. Steam's formats were checked against live responses (cc=us, l=english).
 */

// ---------------------------------------------------------------------------
// Text helpers
// ---------------------------------------------------------------------------

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  reg: '®',
  trade: '™',
  copy: '©',
  hellip: '...',
  ndash: '-',
  mdash: '-'
}

export function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, code: string) => {
    if (code[0] === '#') {
      const point =
        code[1] === 'x' || code[1] === 'X' ? parseInt(code.slice(2), 16) : Number(code.slice(1))
      return Number.isFinite(point) && point > 0 && point <= 0x10ffff
        ? String.fromCodePoint(point)
        : match
    }
    return NAMED_ENTITIES[code.toLowerCase()] ?? match
  })
}

const stripTags = (html: string): string => html.replace(/<[^>]*>/g, '')

/** Store-page HTML to plain text: paragraphs become blank-line breaks, list items bullets. */
export function htmlToText(html: string | undefined): string {
  if (!html) return ''
  const text = decodeEntities(
    stripTags(
      html
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<h[1-6][^>]*>|<\/(?:p|h[1-6]|ul|ol|div)>/gi, '\n\n')
        .replace(/<li[^>]*>/gi, '\n• ')
    )
  )
  return text
    .split('\n')
    .map((line) => line.replace(/[ \t]+/g, ' ').trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

// ---------------------------------------------------------------------------
// Art (`IStoreBrowseService/GetItems` assets)
// ---------------------------------------------------------------------------

/**
 * Pre-2024 apps keep art at plain paths, so this is the fallback when the asset lookup
 * fails. Newer apps 404 on these; their paths come from `toGameArt`.
 */
export function legacyArt(appId: number): GameArt {
  const base = `${STEAM_IMAGE_ORIGIN}/store_item_assets/steam/apps/${appId}/`
  return {
    header: `${base}header.jpg`,
    capsule: `${base}capsule_616x353.jpg`,
    hero: `${base}library_hero.jpg`,
    portrait: `${base}library_600x900.jpg`
  }
}

export interface SteamAssets {
  /** e.g. "steam/apps/4435490/${FILENAME}?t=1792214069" */
  asset_url_format?: string
  header?: string
  main_capsule?: string
  library_hero?: string
  library_capsule?: string
}

const ASSET_FORMAT = /^steam\/apps\/\d+\/\$\{FILENAME\}(?:\?t=\d+)?$/
const ASSET_FILE = /^(?:[0-9a-f]{40}\/)?[\w-]+\.(?:jpg|png)$/

/** Exact CDN URLs from Steam's asset record; anything malformed falls back to legacy paths. */
export function toGameArt(appId: number, assets: SteamAssets | undefined): GameArt {
  const legacy = legacyArt(appId)
  const format = assets?.asset_url_format
  if (!format || !ASSET_FORMAT.test(format)) return legacy
  const url = (file: string | undefined): string | null =>
    file && ASSET_FILE.test(file)
      ? `${STEAM_IMAGE_ORIGIN}/store_item_assets/${format.replace('${FILENAME}', file)}`
      : null
  return {
    header: url(assets.header) ?? legacy.header,
    capsule: url(assets.main_capsule),
    hero: url(assets.library_hero),
    portrait: url(assets.library_capsule)
  }
}

// ---------------------------------------------------------------------------
// Dates
// ---------------------------------------------------------------------------

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** "Oct 22, 2026" to "2026-10-22". Anything vaguer ("Q4 2026", "Coming soon") gives null. */
export function parseSteamDate(text: string): string | null {
  const match = /^([A-Z][a-z]{2}) (\d{1,2}), (\d{4})$/.exec(text.trim())
  if (!match) return null
  const month = MONTHS.indexOf(match[1])
  if (month < 0) return null
  return `${match[3]}-${String(month + 1).padStart(2, '0')}-${match[2].padStart(2, '0')}`
}

const todayIso = (): string => new Date().toISOString().slice(0, 10)

/** Exact future date, or vague text that isn't a past year ("2027", "Q1 2027", "Coming soon"). */
function isComingSoon(released: string | null, releaseText: string): boolean {
  if (released) return released > todayIso()
  if (!releaseText) return false
  const year = /\b(\d{4})\b/.exec(releaseText)
  return !year || Number(year[1]) >= new Date().getFullYear()
}

// ---------------------------------------------------------------------------
// Search results (`/search/results/?infinite=1`): HTML rows
// ---------------------------------------------------------------------------

/** Captures the row's opening-tag attributes (app id, tag ids) and its body. */
const ROW_PATTERN = /<a\s([^>]*data-ds-appid="(\d+)"[^>]*)>([\s\S]*?)<\/a>/g

function firstMatch(pattern: RegExp, text: string): string | null {
  const match = pattern.exec(text)
  return match ? match[1] : null
}

/** "Very Positive<br>93% of the 12,345 user reviews for this game are positive." */
function parseReviewTooltip(tooltip: string): ReviewSummary | null {
  const text = decodeEntities(tooltip)
  const label = text.split(/<br\s*\/?>/i)[0]?.trim()
  const pct = firstMatch(/(\d{1,3})%/, text)
  const total = firstMatch(/the ([\d,]+) user review/, text)
  if (!label || pct === null || total === null) return null
  return { label, positivePct: Number(pct), total: Number(total.replace(/,/g, '')) }
}

function normalisePrice(text: string | null): string | null {
  const price = text ? decodeEntities(text).trim() : ''
  if (!price) return null
  return /^free/i.test(price) ? 'Free' : price
}

/**
 * One `Game` per result row. Rows for bundles and packages carry a comma-separated
 * `data-ds-appid` and are skipped by the pattern itself.
 */
export function parseSearchResults(html: string, tagNames: Record<string, string>): Game[] {
  const games: Game[] = []
  for (const [, attributes, id, body] of html.matchAll(ROW_PATTERN)) {
    const name = decodeEntities(firstMatch(/<span class="title">([\s\S]*?)<\/span>/, body) ?? '')
    if (!name.trim()) continue

    const releaseText = decodeEntities(
      firstMatch(/class="search_released[^"]*">([\s\S]*?)<\/div>/, body) ?? ''
    ).trim()
    const released = parseSteamDate(releaseText)
    const tooltip = firstMatch(/search_review_summary[^"]*"\s+data-tooltip-html="([^"]*)"/, body)
    const tagIds = firstMatch(/data-ds-tagids="\[([\d,]*)\]"/, attributes) ?? ''

    games.push({
      id: Number(id),
      name: name.trim(),
      // Placeholder until main attaches the looked-up art.
      art: legacyArt(Number(id)),
      released,
      releaseText,
      comingSoon: isComingSoon(released, releaseText),
      review: tooltip ? parseReviewTooltip(tooltip) : null,
      tags: tagIds
        .split(',')
        .map((tagId) => tagNames[tagId])
        .filter((tag): tag is string => Boolean(tag)),
      price: normalisePrice(firstMatch(/class="discount_final_price[^"]*">([^<]*)</, body)),
      discountPct: Number(firstMatch(/data-discount="(\d+)"/, body) ?? 0)
    })
  }
  return games
}

// ---------------------------------------------------------------------------
// Requirements (`pc_requirements.minimum` / `.recommended`): HTML blocks
// ---------------------------------------------------------------------------

const TIER_HEADING = /^(?:minimum|recommended)(?: requirements)?:?$/i
/** "Label: value". Labels may carry a footnote star ("OS *:"), which is dropped. */
const LABELLED_LINE = /^([A-Za-z][A-Za-z /&.*-]{1,30}):\s*(.*)$/

function toLine(raw: string): RequirementLine | null {
  const text = raw.replace(/\s+/g, ' ').trim()
  if (!text || TIER_HEADING.test(text)) return null
  const match = LABELLED_LINE.exec(text)
  if (!match) return { label: null, value: text }
  const value = match[2].trim()
  const label = match[1].replace(/\s*\*+$/, '').trim()
  return value ? { label, value } : null
}

/**
 * Older pages put both tiers in the minimum block as "Minimum: ..." and "Recommended: ..."
 * lines. Those become plain lines in the right tier instead of rows labelled "Minimum".
 */
function splitTiers(
  minimum: RequirementLine[],
  recommended: RequirementLine[]
): { minimum: RequirementLine[]; recommended: RequirementLine[] } {
  const isTier = (line: RequirementLine, tier: string): boolean =>
    line.label !== null && line.label.toLowerCase() === tier
  if (!minimum.some((line) => isTier(line, 'recommended'))) {
    return {
      minimum: minimum.map((line) => (isTier(line, 'minimum') ? { ...line, label: null } : line)),
      recommended
    }
  }
  const index = minimum.findIndex((line) => isTier(line, 'recommended'))
  const unlabel = (line: RequirementLine): RequirementLine =>
    isTier(line, 'minimum') || isTier(line, 'recommended') ? { ...line, label: null } : line
  return {
    minimum: minimum.slice(0, index).map(unlabel),
    recommended: [...minimum.slice(index).map(unlabel), ...recommended]
  }
}

/**
 * Modern pages list each spec as `<li><strong>Label:</strong> value</li>`; older ones use
 * `Label: value<br>` lines. Both become `{ label, value }`; unlabelled notes keep a null label.
 */
export function parseRequirementsHtml(html: string | undefined): RequirementLine[] {
  if (!html) return []
  const items = [...html.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map((m) => m[1])
  const chunks =
    items.length > 0 ? items : html.split(/<br\s*\/?>|<\/p>|<\/div>|\n/i).filter(Boolean)
  return chunks
    .map((chunk) => toLine(decodeEntities(stripTags(chunk))))
    .filter((line): line is RequirementLine => line !== null)
}

// ---------------------------------------------------------------------------
// Reviews (`/appreviews/{id}?json=1`) and details (`/api/appdetails`)
// ---------------------------------------------------------------------------

/** `GetItems` `reviews.summary_filtered`: the score the store page itself shows. */
export interface SteamReviewSummary {
  review_count?: number
  percent_positive?: number
  review_score_label?: string
}

/** Below this many reviews Steam itself shows no score, so neither do we. */
const MIN_REVIEWS_FOR_SCORE = 10

export function toReviewSummary(summary: SteamReviewSummary | undefined): ReviewSummary | null {
  const total = summary?.review_count ?? 0
  if (total < MIN_REVIEWS_FOR_SCORE || !summary?.review_score_label) return null
  return {
    label: summary.review_score_label,
    positivePct: summary.percent_positive ?? 0,
    total
  }
}

/** The subset of `appdetails` data the app reads. */
export interface SteamAppData {
  steam_appid: number
  name: string
  is_free?: boolean
  short_description?: string
  about_the_game?: string
  website?: string | null
  developers?: string[]
  publishers?: string[]
  genres?: { id: string; description: string }[]
  metacritic?: { score: number }
  screenshots?: { path_thumbnail: string; path_full: string }[]
  background_raw?: string
  release_date?: { coming_soon: boolean; date: string }
  /** An empty array (not an object) when the game lists none. */
  pc_requirements?: { minimum?: string; recommended?: string } | unknown[]
  platforms?: { windows: boolean; mac: boolean; linux: boolean }
  price_overview?: { final_formatted: string; discount_percent: number }
}

/** Only art from Steam's image CDN, the one Steam origin the renderer CSP allows. */
const onImageCdn = (url: string | undefined): url is string =>
  typeof url === 'string' && url.startsWith(`${STEAM_IMAGE_ORIGIN}/`)

const httpUrl = (url: string | null | undefined): string | null =>
  url && /^https?:\/\//i.test(url) ? url : null

export function toGameDetails(
  data: SteamAppData,
  review: ReviewSummary | null,
  art: GameArt | undefined
): GameDetails {
  const releaseText = data.release_date?.date?.trim() ?? ''
  const released = parseSteamDate(releaseText)
  const requirements: { minimum?: string; recommended?: string } =
    data.pc_requirements && !Array.isArray(data.pc_requirements) ? data.pc_requirements : {}
  const genres = (data.genres ?? []).map((genre) => genre.description)
  const screenshots: Screenshot[] = (data.screenshots ?? [])
    .filter((shot) => onImageCdn(shot.path_thumbnail) && onImageCdn(shot.path_full))
    .map((shot) => ({ thumb: shot.path_thumbnail, full: shot.path_full }))
  const shortDescription = htmlToText(data.short_description)

  return {
    id: data.steam_appid,
    name: data.name,
    art: art ?? legacyArt(data.steam_appid),
    released,
    releaseText,
    comingSoon: data.release_date?.coming_soon ?? isComingSoon(released, releaseText),
    review,
    tags: genres,
    price: data.is_free ? 'Free' : (data.price_overview?.final_formatted ?? null),
    discountPct: data.price_overview?.discount_percent ?? 0,
    shortDescription,
    // Some pages' "about" is only an image banner; fall back to the short description.
    about: htmlToText(data.about_the_game) || shortDescription,
    genres,
    developers: data.developers ?? [],
    publishers: data.publishers ?? [],
    metacritic: data.metacritic?.score ?? null,
    screenshots,
    background: onImageCdn(data.background_raw) ? data.background_raw : null,
    website: httpUrl(data.website),
    requirements: splitTiers(
      parseRequirementsHtml(requirements.minimum),
      parseRequirementsHtml(requirements.recommended)
    ),
    platforms: data.platforms ?? { windows: true, mac: false, linux: false }
  }
}
