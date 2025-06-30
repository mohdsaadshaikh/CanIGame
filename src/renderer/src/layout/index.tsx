import { AppShell } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import Sidebar from '@renderer/components/Sidebar'
import { Outlet } from 'react-router-dom'
import Header from '../components/Header'

const AppLayout = (): React.JSX.Element => {
  const [opened, { toggle }] = useDisclosure()

  return (
    <AppShell
      header={{ height: 70 }}
      navbar={{
        width: 250,
        breakpoint: 'sm',
        collapsed: { mobile: !opened }
      }}
      padding="md"
    >
      <AppShell.Header withBorder={false}>
        <Header opened={opened} toggle={toggle} />
      </AppShell.Header>

      <AppShell.Navbar p="md" withBorder={false}>
        <Sidebar />
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  )
}

export default AppLayout
