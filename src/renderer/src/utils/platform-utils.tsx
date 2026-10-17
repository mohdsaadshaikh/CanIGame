import {
  IconBrandWindows,
  IconBrandXbox,
  IconDeviceNintendo,
  IconPlaystationSquare
} from '@tabler/icons-react'
import type { JSX } from 'react'

export type PlatformFamily = 'pc' | 'playstation' | 'xbox' | 'nintendo'

/** Structural type so both list (`GamePlatform`) and detail (`GameDetailsPlatform`) entries fit. */
interface HasPlatformName {
  platform: { name: string }
}

/** Collapse "PlayStation 4", "PlayStation 5"… into one family so the card shows one icon each. */
export function getUniquePlatformTypes(
  platforms: readonly HasPlatformName[] | undefined
): PlatformFamily[] {
  const families = new Set<PlatformFamily>()
  platforms?.forEach(({ platform }) => {
    const name = platform.name.toLowerCase()
    if (name.includes('playstation')) families.add('playstation')
    else if (name.includes('xbox')) families.add('xbox')
    else if (name.includes('pc') || name.includes('windows')) families.add('pc')
    else if (name.includes('nintendo')) families.add('nintendo')
  })
  return Array.from(families)
}

const PLATFORM_ICONS: Record<PlatformFamily, JSX.Element> = {
  playstation: <IconPlaystationSquare size={20} />,
  xbox: <IconBrandXbox size={20} />,
  pc: <IconBrandWindows size={20} />,
  nintendo: <IconDeviceNintendo size={20} />
}

export function mapPlatformIcons(
  families: PlatformFamily[]
): { name: PlatformFamily; icon: JSX.Element }[] {
  return families.map((name) => ({ name, icon: PLATFORM_ICONS[name] }))
}
