// components/CustomTitlebar.tsx
import { ActionIcon, Flex, Text } from '@mantine/core'
import { IconMinus, IconSquare, IconX } from '@tabler/icons-react'

const Titlebar = () => {
  const handleAction = (action: 'minimize' | 'maximize' | 'close') => {
    window.api.windowControl(action)
  }

  return (
    <Flex
      align="center"
      justify="space-between"
      px="md"
      h={40}
      style={{
        WebkitAppRegion: 'drag', // 👈 make it draggable
        background: '#1e1e2e',
        color: '#fff'
      }}
    >
      <Text>My App</Text>

      <Flex gap="xs" style={{ WebkitAppRegion: 'no-drag' }}>
        <ActionIcon onClick={() => handleAction('minimize')}>
          <IconMinus size={16} />
        </ActionIcon>
        <ActionIcon onClick={() => handleAction('maximize')}>
          <IconSquare size={16} />
        </ActionIcon>
        <ActionIcon onClick={() => handleAction('close')}>
          <IconX size={16} />
        </ActionIcon>
      </Flex>
    </Flex>
  )
}

export default Titlebar
