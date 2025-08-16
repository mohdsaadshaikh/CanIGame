import { Badge, Box, Card, Group, Image, Stack, Text, useMantineTheme } from '@mantine/core'
import { getUniquePlatformTypes, mapPlatformIcons } from '@renderer/utils/platform-utils'
import { IconCalendar, IconStar } from '@tabler/icons-react'
import { JSX, useState } from 'react'
import { Game } from 'src/types/games'
import { useNavigate } from 'react-router-dom'

interface GameCardProps {
  game: Game
  viewMode?: 'grid' | 'list'
  onGameClick?: (game: Game) => void
}

export function GameCard({ game, viewMode, onGameClick }: GameCardProps): JSX.Element {
  const [isHovered, setIsHovered] = useState(false)
  const theme = useMantineTheme()
  const navigate = useNavigate()

  const platformTypes = getUniquePlatformTypes(game.platforms)
  const uniquePlatforms = mapPlatformIcons(platformTypes)

  if (viewMode === 'list') {
    return (
      <Card
        shadow="sm"
        radius="sm"
        w={{ base: '100%', md: 600 }}
        style={{
          border: '1px solid #404040',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
          boxShadow: isHovered ? '0 8px 25px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.1)'
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => navigate()}

      >
        <Group gap="md">
          <Image
            src={game.background_image}
            radius="sm"
            alt={game.name}
            // w="100%"
            style={{
              transition: 'all 0.3s ease',
              transform: isHovered ? 'scale(1.05)' : 'scale(1)'
            }}
          />

          <Box style={{ flex: 1 }}>
            <Group justify="space-between" mb="xs">
              <Text
                fw={600}
                size="lg"
                lineClamp={1}
                style={{
                  transition: 'color 0.3s ease',
                  color: isHovered ? theme.colors.orange[5] : undefined
                }}
              >
                {game.name}
              </Text>
              <Group gap="xs">
                <IconStar size={16} fill="#ffd43b" color="#ffd43b" />
                <Text size="sm" c="white" fw={500}>
                  {game.rating ? game.rating.toFixed(1) : 'N/A'}
                </Text>
              </Group>
            </Group>

            <Group gap="md" mb="xs">
              <Group gap="xs">
                <IconCalendar size={14} color="#888" />
                <Text size="sm" c="dimmed">
                  {game.released ? new Date(game.released).getFullYear() : 'TBA'}
                </Text>
              </Group>

              <Group gap="xs">
                {uniquePlatforms.map((platform) => (
                  <Box
                    key={platform.name}
                    style={{
                      color: '#888',
                      transition: 'color 0.3s ease',
                      ...(isHovered && { color: theme.colors.orange[5] })
                    }}
                  >
                    {platform.icon}
                  </Box>
                ))}
              </Group>
            </Group>

            <Group gap="xs">
              {game.genres?.slice(0, 3).map((genre) => (
                <Badge
                  key={genre.id}
                  variant="light"
                  size="xs"
                  color={isHovered ? theme.colors.orange[5] : theme.colors.orange[4]}
                  style={{ transition: 'all 0.3s ease' }}
                >
                  {genre.name}
                </Badge>
              ))}
            </Group>
          </Box>
        </Group>
      </Card>
    )
  }

  return (
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      style={{
        border: `1px solid ${theme.colors.dark[4]}`,
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
        transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
        boxShadow: isHovered ? '0 12px 30px rgba(0,0,0,0.4)' : '0 4px 12px rgba(0,0,0,0.2)',
        borderColor: isHovered ? theme.colors.orange[5] : theme.colors.dark[4]
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onGameClick?.(game)}
    >
      <Card.Section style={{ position: 'relative', overflow: 'hidden' }}>
        <Image
          src={game.background_image}
          height={200}
          alt={game.name}
          radius="sm"
          style={{
            transition: 'all 0.3s ease',
            transform: isHovered ? 'scale(1.08)' : 'scale(1)',
            filter: isHovered ? 'brightness(1.1)' : 'brightness(1)'
          }}
        />

        <Box
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            zIndex: 5
          }}
        >
          {game.metacritic && (
            <Badge
              color={game.metacritic >= 80 ? 'green' : game.metacritic >= 60 ? 'yellow' : 'red'}
              variant="filled"
              style={{
                transition: 'all 0.3s ease',
                transform: isHovered ? 'scale(1.1)' : 'scale(1)'
              }}
            >
              {game.metacritic}
            </Badge>
          )}
        </Box>
      </Card.Section>

      <Stack gap="xs" mt="md">
        <Group justify="space-between">
          <Text
            fw={600}
            size="lg"
            lineClamp={1}
            style={{
              transition: 'color 0.3s ease',
              color: isHovered ? theme.colors.orange[5] : undefined
            }}
          >
            {game.name}
          </Text>
        </Group>

        <Group gap="xs" mb="sm">
          {uniquePlatforms.map((platform) => (
            <Box
              key={platform.name}
              style={{
                color: '#888',
                transition: 'all 0.3s ease',
                transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                ...(isHovered && { color: theme.colors.orange[5] })
              }}
            >
              {platform.icon}
            </Box>
          ))}
        </Group>

        <Group justify="space-between" mb="sm">
          <Group gap="xs">
            <IconStar
              size={16}
              fill="#ffd43b"
              color="#ffd43b"
              style={{
                transition: 'transform 0.3s ease',
                transform: isHovered ? 'scale(1.2)' : 'scale(1)'
              }}
            />
            <Text size="sm" c="white" fw={500}>
              {game.rating ? game.rating.toFixed(1) : 'N/A'}
            </Text>
            {game.ratings_count && (
              <Text size="xs" c="dimmed">
                ({game.ratings_count.toLocaleString()})
              </Text>
            )}
          </Group>
          <Group gap="xs">
            <IconCalendar size={14} color="#888" />
            <Text size="xs" c="dimmed">
              {game.released ? new Date(game.released).getFullYear() : 'TBA'}
            </Text>
          </Group>
        </Group>

        <Group gap="xs">
          {game.genres?.slice(0, 2).map((genre) => (
            <Badge
              key={genre.id}
              variant="light"
              size="xs"
              color={isHovered ? theme.colors.orange[5] : theme.colors.orange[4]}
              style={{
                transition: 'all 0.3s ease',
                transform: isHovered ? 'scale(1.05)' : 'scale(1)'
              }}
            >
              {genre.name}
            </Badge>
          ))}
        </Group>

        {game.playtime && (
          <Text
            size="xs"
            c="dimmed"
            mt="xs"
            style={{
              opacity: isHovered ? 1 : 0.7,
              transition: 'opacity 0.3s ease'
            }}
          >
            Average playtime: {game.playtime} hours
          </Text>
        )}
      </Stack>
    </Card>
  )
}
