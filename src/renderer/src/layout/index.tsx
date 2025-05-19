import Logo from '@renderer/components/Logo'
import { AppShell, Burger, Flex } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'

export function Demo(): React.JSX.Element {
  const [opened, { toggle }] = useDisclosure()

  return (
    <AppShell
      header={{ height: 75 }}
      navbar={{
        width: 250,
        breakpoint: 'sm',
        collapsed: { mobile: !opened }
      }}
      padding="md"
    >
      <AppShell.Header>
        <Flex align="center" h="100%" px="md">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          <Logo />
        </Flex>
      </AppShell.Header>

      <AppShell.Navbar p="md"></AppShell.Navbar>

      <AppShell.Main>Main</AppShell.Main>
    </AppShell>
  )
}
const AppLayout = (): React.JSX.Element => {
  return (
    <div>
      <Demo />
    </div>
  )
}

export default AppLayout
