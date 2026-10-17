import wordmark from '../assets/imgs/logo-wordmark.png'

/** The CANIGAME wordmark (transparent PNG generated from resources/brand/). */
const Logo = (): React.JSX.Element => {
  return (
    <img
      src={wordmark}
      alt="CanIGame"
      height={24}
      draggable={false}
      style={{ display: 'block', height: 24, width: 'auto' }}
    />
  )
}

export default Logo
