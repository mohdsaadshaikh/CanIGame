import { Text } from '@mantine/core'
import React from 'react'

const Logo = (): React.JSX.Element => {
  return (
    <Text
      fz="h1"
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
  )
}

export default Logo
