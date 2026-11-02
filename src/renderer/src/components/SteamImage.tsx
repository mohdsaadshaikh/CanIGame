import { GAME_IMAGE_PLACEHOLDER } from '@renderer/constants'
import type { GameArt } from '@shared/types/games'
import { useState, type ImgHTMLAttributes } from 'react'

interface SteamImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'onError'> {
  art: GameArt
  /** Preferred art. Falls back to the capsule, then the header, then a placeholder. */
  kind: keyof GameArt
}

/**
 * A game's Steam art. Not every game has every kind (older ones lack the library hero and
 * portrait), so a missing or failed image steps down to art every app has.
 */
export function SteamImage({ art, kind, alt = '', ...rest }: SteamImageProps): React.JSX.Element {
  const chain = [...new Set([art[kind], art.capsule, art.header])].filter((url): url is string =>
    Boolean(url)
  )
  const key = chain.join(' ')
  // Failures are tracked per chain, so a recycled <img> starts again from the top.
  const [failed, setFailed] = useState({ key, step: 0 })
  const step = failed.key === key ? failed.step : 0
  const src = step < chain.length ? chain[step] : GAME_IMAGE_PLACEHOLDER

  return (
    <img
      {...rest}
      alt={alt}
      src={src}
      onError={() => {
        if (step < chain.length) setFailed({ key, step: step + 1 })
      }}
    />
  )
}
