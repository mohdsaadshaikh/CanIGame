import { Game } from 'src/types/games'
import {
  IconPlaystationSquare,
  IconBrandXbox,
  IconBrandWindows,
  IconDeviceNintendo
} from '@tabler/icons-react'
import { JSX } from 'react'

export function getUniquePlatformTypes(platforms: Game['platforms']): string[] {
  const uniqueTypes = new Set<string>()
  platforms?.forEach((platform) => {
    const name = platform.platform.name.toLowerCase()
    if (name.includes('playstation')) uniqueTypes.add('playstation')
    else if (name.includes('xbox')) uniqueTypes.add('xbox')
    else if (name.includes('pc') || name.includes('windows')) uniqueTypes.add('pc')
    else if (name.includes('nintendo')) uniqueTypes.add('nintendo')
  })
  return Array.from(uniqueTypes)
}

export function mapPlatformIcons(types: string[]): { name: string; icon: JSX.Element }[] {
  const icons: Record<string, JSX.Element> = {
    playstation: <IconPlaystationSquare size={20} />,
    xbox: <IconBrandXbox size={20} />,
    pc: <IconBrandWindows size={20} />,
    nintendo: <IconDeviceNintendo size={20} />
  }

  return types
    .filter((type) => icons[type])
    .map((type) => ({
      name: type,
      icon: icons[type]
    }))
}
