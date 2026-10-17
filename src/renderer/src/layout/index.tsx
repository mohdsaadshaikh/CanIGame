import { AppShell } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import Header from '@renderer/components/Header'
import Sidebar from '@renderer/components/Sidebar'
import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { scrollToTop } from '@renderer/utils/scroll'
import classes from './Layout.module.css'

export const HEADER_HEIGHT = 56
export const NAVBAR_WIDTH = 232

const AppLayout = (): React.JSX.Element => {
  const [opened, { toggle, close }] = useDisclosure()
  const { pathname } = useLocation()

  // On narrow windows the navbar is an overlay; close it after navigating. New pages start
  // at the top of the scroll container (Explore restores its own position afterwards).
  useEffect(() => {
    close()
    scrollToTop()
  }, [pathname, close])

  return (
    <AppShell
      header={{ height: HEADER_HEIGHT }}
      navbar={{ width: NAVBAR_WIDTH, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="lg"
      classNames={{ header: classes.header, navbar: classes.navbar, main: classes.main }}
    >
      <AppShell.Header withBorder={false}>
        <Header opened={opened} toggle={toggle} />
      </AppShell.Header>

      <AppShell.Navbar withBorder={false}>
        <Sidebar />
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  )
}

export default AppLayout
