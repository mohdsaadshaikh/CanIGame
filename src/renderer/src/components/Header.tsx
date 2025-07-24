import { ActionIcon, Burger, Flex, TextInput } from '@mantine/core'
import { Spotlight, spotlight } from '@mantine/spotlight'
import {
  IconDashboard,
  IconFileText,
  IconHome,
  IconMinus,
  IconSearch,
  IconSquare,
  IconX
} from '@tabler/icons-react'
import React from 'react'
import Logo from './Logo'
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
  const handleAction = (action: 'minimize' | 'maximize' | 'close'): void => {
    window.api.windowControl(action)
  }

  return (
    <Flex
      align="center"
      mt="xs"
      px="xs"
      justify="space-between"
      style={{ WebkitAppRegion: 'drag' }}
    >
      <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
      <Flex gap="70px" align="center" ml="md">
        <Logo />
        <TextInput
          onClick={spotlight.open}
          placeholder="Search..."
          leftSection={<IconSearch size={16} />}
          radius="sm"
          size="xs"
          w={{ base: '100%', sm: 300, md: 400, lg: 600 }}
        />
      </Flex>
      <Spotlight
        actions={actions}
        nothingFound="Nothing found..."
        highlightQuery
        searchProps={{
          leftSection: <IconSearch size={20} stroke={1.5} />,
          placeholder: 'Search...'
        }}
      />
      <Flex gap={8} style={{ WebkitAppRegion: 'no-drag', alignItems: 'center' }}>
        <ActionIcon
          variant="subtle"
          color="gray"
          size="lg"
          radius="xl"
          aria-label="Minimize"
          onClick={() => handleAction('minimize')}
          style={{ transition: 'background 0.2s', ':hover': { background: '#e0e0e0' } }}
        >
          <IconMinus size={18} stroke={2} />
        </ActionIcon>
        <ActionIcon
          variant="subtle"
          color="gray"
          size="lg"
          radius="xl"
          aria-label="Maximize"
          onClick={() => handleAction('maximize')}
          style={{ transition: 'background 0.2s', ':hover': { background: '#e0e0e0' } }}
        >
          <IconSquare size={18} stroke={2} />
        </ActionIcon>
        <ActionIcon
          variant="light"
          color="red"
          size="lg"
          radius="xl"
          aria-label="Close"
          onClick={() => handleAction('close')}
          style={{
            transition: 'background 0.2s',
            ':hover': { background: '#ffdddd' },
            color: '#d7263d'
          }}
        >
          <IconX size={18} stroke={2.5} />
        </ActionIcon>
      </Flex>
    </Flex>
  )
}

export default Header
