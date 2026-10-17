import {
  IconCompass,
  IconCompassFilled,
  IconHeart,
  IconHeartFilled,
  IconHome,
  IconHomeFilled,
  IconInfoCircle,
  IconInfoCircleFilled,
  IconSettings,
  IconSettingsFilled,
  type Icon
} from '@tabler/icons-react'

export type NavSection = 'discover' | 'system'

export const NAV_SECTIONS: { id: NavSection; label: string }[] = [
  { id: 'discover', label: 'Discover' },
  { id: 'system', label: 'System' }
]

export interface NavItem {
  label: string
  description: string
  to: string
  section: NavSection
  icon: {
    filled: Icon
    outline: Icon
  }
}

export const links: NavItem[] = [
  {
    label: 'Home',
    description: 'Back to the start page',
    to: '/',
    section: 'discover',
    icon: { filled: IconHomeFilled, outline: IconHome }
  },
  {
    label: 'Explore',
    description: 'Browse the game catalogue',
    to: '/explore',
    section: 'discover',
    icon: { filled: IconCompassFilled, outline: IconCompass }
  },
  {
    label: 'Wishlist',
    description: 'Games you have saved',
    to: '/wishlist',
    section: 'discover',
    icon: { filled: IconHeartFilled, outline: IconHeart }
  },
  {
    label: 'About PC',
    description: 'Your detected CPU, GPU, memory and OS',
    to: '/pc',
    section: 'system',
    icon: { filled: IconInfoCircleFilled, outline: IconInfoCircle }
  },
  {
    label: 'Settings',
    description: 'Appearance and preferences',
    to: '/settings',
    section: 'system',
    icon: { filled: IconSettingsFilled, outline: IconSettings }
  }
]

/**
 * Inline SVG shown when RAWG has no artwork. A data: URI keeps it CSP-compliant
 * (`img-src data:`) without shipping an extra asset.
 */
export const GAME_IMAGE_PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 9"><rect width="16" height="9" fill="#2b2b2b"/><text x="8" y="5" font-family="sans-serif" font-size="1" fill="#777" text-anchor="middle" dominant-baseline="middle">No image</text></svg>`
  )
