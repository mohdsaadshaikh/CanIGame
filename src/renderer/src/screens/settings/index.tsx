import { Container, Tabs, Text } from '@mantine/core'
import { IconPalette } from '@tabler/icons-react'

const Settings = (): React.JSX.Element => {
  return (
    <>
      <Container size="xl" py="md">
        <Text className="gaming-gradient-text" size="xl" fw={700} mb="lg">
          Settings
        </Text>

        <Tabs defaultValue="appearance">
          <Tabs.List mb="lg">
            <Tabs.Tab value="appearance" leftSection={<IconPalette size={16} />}>
              Appearance
            </Tabs.Tab>
            {/* <Tabs.Tab value="general" leftSection={<Monitor size={16} />}>
              General
            </Tabs.Tab>
            <Tabs.Tab value="gaming" leftSection={<Gamepad size={16} />}>
              Gaming
            </Tabs.Tab>
            <Tabs.Tab value="notifications" leftSection={<Bell size={16} />}>
              Notifications
            </Tabs.Tab>
            <Tabs.Tab value="privacy" leftSection={<Shield size={16} />}>
              Privacy
            </Tabs.Tab>
            <Tabs.Tab value="data" leftSection={<Database size={16} />}>
              Data
            </Tabs.Tab> */}
          </Tabs.List>
        </Tabs>
      </Container>
    </>
  )
}

export default Settings
