import { ActionIcon, Group, Tooltip, useMantineColorScheme, useMantineTheme } from '@mantine/core'
import { customSizes } from '@renderer/lib/theme'
import { IconDeviceDesktop, IconMoon, IconSun } from '@tabler/icons-react'

export const ThemeToggler: React.FC = () => {
  const { colorScheme, setColorScheme } = useMantineColorScheme()
  const theme = useMantineTheme()

  const themes = [
    { value: 'light', icon: <IconSun size={24} />, label: 'Light' },
    { value: 'dark', icon: <IconMoon size={24} />, label: 'Dark' },
    { value: 'auto', icon: <IconDeviceDesktop size={24} />, label: 'Auto' }
  ]

  const isActive = (val: string): boolean =>
    colorScheme === val || (val === 'auto' && colorScheme === 'auto')

  return (
    <Group gap="lg">
      {themes.map((item) => (
        <Tooltip label={item.label} key={item.value}>
          <ActionIcon
            onClick={() => setColorScheme(item.value as 'light' | 'dark' | 'auto')}
            style={{ width: customSizes['3xl'], height: customSizes['3xl'] }}
            variant={isActive(item.value) ? 'filled' : 'outline'}
            color={theme.primaryColor}
            radius="sm"
          >
            {item.icon}
          </ActionIcon>
        </Tooltip>
      ))}
    </Group>
  )
}
