import { AppShell, Flex, Loader } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import Header from '../components/Header'
import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '@renderer/components/Sidebar'

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
        <Header opened={opened} toggle={toggle} />
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Sidebar />
      </AppShell.Navbar>

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
