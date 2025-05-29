import { Box, NavLink } from '@mantine/core'
import { links } from '@renderer/constants'
import { NavLink as RouterLink, useLocation } from 'react-router-dom'
import React from 'react'

const Sidebar: React.FC = (): React.JSX.Element => {
  const location = useLocation()

  const items = links.map(({ label, to, icon }) => {
    const isActive = location.pathname === to
    const IconComponent = isActive ? icon.filled : icon.outline

    return (
      <NavLink
        key={to}
        label={label}
        component={RouterLink}
        to={to}
        active={isActive}
        leftSection={<IconComponent size={20} />}
        variant="light"
        style={{ marginBottom: 8 }}
      />
    )
  })

  return <Box w={220}>{items}</Box>
}

export default Sidebar
