import { Burger, Flex, TextInput } from '@mantine/core'
import React from 'react'
import Logo from './Logo'
import { Spotlight, spotlight } from '@mantine/spotlight'
import { IconDashboard, IconFileText, IconHome, IconSearch } from '@tabler/icons-react'
import { ThemeToggler } from './ThemeToggler'
const actions = [
  {
    id: 'home',
    label: 'Home',
    description: 'Get to home page',
    onClick: () => console.log('Home'),
    leftSection: <IconHome size={24} stroke={1.5} />
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    description: 'Get full information about current system status',
    onClick: () => console.log('Dashboard'),
    leftSection: <IconDashboard size={24} stroke={1.5} />
  },
  {
    id: 'documentation',
    label: 'Documentation',
    description: 'Visit documentation to lean more about all features',
    onClick: () => console.log('Documentation'),
    leftSection: <IconFileText size={24} stroke={1.5} />
  }
]
const Header: React.FC<HeaderProps> = ({ opened, toggle }) => {
  return (
    <Flex align="center" h="100%" px="md" gap="70px">
      <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
      <Logo />
      <TextInput
        onClick={spotlight.open}
        placeholder="Search..."
        leftSection={<IconSearch size={16} />}
        radius="sm"
        size="md"
        style={{ width: '500px' }}
      />
      <Spotlight
        actions={actions}
        nothingFound="Nothing found..."
        highlightQuery
        searchProps={{
          leftSection: <IconSearch size={20} stroke={1.5} />,
          placeholder: 'Search...'
        }}
      />
      <ThemeToggler />
    </Flex>
  )
}

export default Header
