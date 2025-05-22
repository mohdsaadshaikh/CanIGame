import {
  IconCompass,
  IconCompassFilled,
  IconHeart,
  IconHeartFilled,
  IconHome,
  IconHomeFilled,
  IconInfoCircle,
  IconInfoCircleFilled
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
  }
]
