import Logo from '@renderer/components/Logo'
import { AppShell, Burger, Flex } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { Outlet } from 'react-router-dom'
import { Suspense } from 'react'
import { Loader } from '@mantine/core'

const AppLayout = (): React.JSX.Element => {
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

      <AppShell.Main>
        <Suspense
          fallback={
            <Flex h="80vh" w="100%" justify="center" align="center">
              <Loader size={30} />
            </Flex>
          }
        >
          <Outlet />
        </Suspense>
      </AppShell.Main>
    </AppShell>
  )
}

export default AppLayout
