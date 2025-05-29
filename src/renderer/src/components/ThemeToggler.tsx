import { useState } from 'react'
import { Group, Select, ActionIcon, useMantineColorScheme, useMantineTheme } from '@mantine/core'
import { IconSun, IconMoon, IconDeviceDesktop } from '@tabler/icons-react'

export const ThemeToggler: React.FC = () => {
  const { colorScheme, setColorScheme } = useMantineColorScheme()
  const theme = useMantineTheme()

  const [selected, setSelected] = useState<string | null>(null)
  const [showDropdown, setShowDropdown] = useState(true)

  const handleSelect = (value: string | null) => {
    if (!value) return
    setSelected(value)
    setColorScheme(value as 'light' | 'dark' | 'auto')
    setShowDropdown(false)
  }

  const getIcon = (scheme: string | null) => {
    switch (scheme) {
      case 'light':
        return <IconSun size={20} />
      case 'dark':
        return <IconMoon size={20} />
      case 'auto':
        return <IconDeviceDesktop size={20} />
      default:
        return <IconDeviceDesktop size={20} />
    }
  }

  return (
    <Group justify="center" mt="xl">
      {showDropdown ? (
        <Select
          placeholder="Select theme"
          data={[
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
            { value: 'auto', label: 'Auto' }
          ]}
          value={selected}
          onChange={handleSelect}
          withinPortal
        />
      ) : (
        <ActionIcon
          variant="light"
          color={theme.primaryColor}
          size="lg"
          onClick={() => setShowDropdown(true)}
        >
          {getIcon(selected)}
        </ActionIcon>
      )}
    </Group>
  )
}
