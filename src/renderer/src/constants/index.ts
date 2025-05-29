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
  IconSettingsFilled
} from '@tabler/icons-react'

export const links: NavItem[] = [
  {
    label: 'Home',
    to: '/',
    icon: {
      filled: IconHomeFilled,
      outline: IconHome
    }
  },
  {
    label: 'Explore',
    to: '/games',
    icon: {
      filled: IconCompassFilled,
      outline: IconCompass
    }
  },
  {
    label: 'Wishlist',
    to: '/wishList',
    icon: {
      filled: IconHeartFilled,
      outline: IconHeart
    }
  },
  {
    label: 'About PC',
    to: '/pc',
    icon: {
      filled: IconInfoCircleFilled,
      outline: IconInfoCircle
    }
  },
  {
    label: 'Settings',
    to: '/settings',
    icon: {
      filled: IconSettingsFilled,
      outline: IconSettings
    }
  }
]
