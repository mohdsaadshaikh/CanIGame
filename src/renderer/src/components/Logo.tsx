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
        // textShadow: '0 0 5px #0ff, 0 0 10px #f0f, 0 0 15px #0ff'
      }}
    >
      CANIGAME
    </Text>
  )
}

export default Logo
