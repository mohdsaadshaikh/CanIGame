import { Flex, Image } from '@mantine/core'
import React from 'react'
import logoIcon from '../assets/imgs/logo.png'

const Logo = (): React.JSX.Element => {
  return (
    <Flex align="center" gap="4px" mt="6px">
      <Image src={logoIcon} alt="CANIGAME Logo" width={30} height={45} />
      <span
        style={{
          fontFamily: 'Audiowide',
          fontWeight: 900,
          fontSize: '24px',
          background: 'linear-gradient(90deg, #ed541b, #a53002)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          color: 'transparent',
          display: 'inline-block'
        }}
      >
        CANIGAME
      </span>
    </Flex>
  )
}

export default Logo
