import { links } from '@renderer/constants'
import { Flex, Text, UnstyledButton, useMantineTheme } from '@mantine/core'
import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const Sidebar: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const theme = useMantineTheme()

  return (
    <Flex direction="column" gap={4} py="md" style={{ minWidth: 80 }}>
      {links.map((link) => {
        const active = location.pathname === link.to
        const Icon = active ? link.icon.filled : link.icon.outline

        return (
          <UnstyledButton
            key={link.label}
            onClick={() => navigate(link.to)}
            style={{
              position: 'relative'
            }}
          >
            <Flex align="center" gap="xs" px="md" py={10} ml="lg">
              {active && (
                <div
                  style={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 4,
                    height: 32,
                    borderRadius: theme.radius.sm,
                    backgroundColor: theme.colors[theme.primaryColor][6],
                    boxShadow: `4px 0 10px ${theme.colors[theme.primaryColor][6]}`
                  }}
                />
              )}

              <Flex
                align="center"
                justify="center"
                style={{
                  color: active ? theme.colors[theme.primaryColor][6] : 'gray',
                  opacity: active ? 1 : 0.8,
                  transition: 'color 150ms ease, opacity 150ms ease'
                }}
              >
                <Icon size={22} />
              </Flex>

              <Text
                c={active ? theme.colors[theme.primaryColor][6] : 'gray'}
                style={{
                  letterSpacing: 0.2,
                  transition: 'color 150ms ease',
                  opacity: active ? 1 : 0.8
                }}
              >
                {link.label}
              </Text>
            </Flex>
          </UnstyledButton>
        )
      })}
    </Flex>
  )
}

export default Sidebar
