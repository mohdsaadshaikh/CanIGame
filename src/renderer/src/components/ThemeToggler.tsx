import { Button, Group, useMantineColorScheme } from '@mantine/core'

export const ThemeToggler: React.FC = () => {
  const { setColorScheme } = useMantineColorScheme()

  return (
    <Group justify="center" mt="xl">
      <Button onClick={() => setColorScheme('light')}>Light</Button>
      <Button onClick={() => setColorScheme('dark')}>Dark</Button>
      <Button onClick={() => setColorScheme('auto')}>Auto</Button>
    </Group>
  )
}
