import { Flex, Image, Text } from '@mantine/core'
import React from 'react'
import logoIcon from '../assets/imgs/logo-icon.png'

const Logo = (): React.JSX.Element => {
  return (
    <Flex align="center" gap="4px">
      <Image src={logoIcon} alt="CANIGAME Logo" width={50} height={50}></Image>
      <Text
        fz="h2"
        fw={900}
        style={{
          fontFamily: 'Audiowide',
          background: 'linear-gradient(90deg, #00ffff, #00ff88)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}
      >
        CANIGAME
      </Text>
    </Flex>
  )
}

export default Logo
