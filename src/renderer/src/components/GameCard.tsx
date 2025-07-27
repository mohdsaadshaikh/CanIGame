import { ActionIcon, Badge, Box, Card, Group, Image, Overlay, Stack, Text } from '@mantine/core'
import {
  IconBrandWindows,
  IconBrandXbox,
  IconCalendar,
  IconDeviceNintendo,
  IconHeart,
  IconPlayerPlay,
  IconPlaystationCircle,
  IconPlus,
  IconStar
} from '@tabler/icons-react'
import { useState } from 'react'
import { Game } from 'src/types/games'

// Proper interface for GameCard props
interface GameCardProps {
  game: Game
  viewMode?: 'grid' | 'list'
  onGameClick?: (game: Game) => void
}

export function GameCard({ game, viewMode = 'grid', onGameClick }: GameCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const getPlatformIcon = (platformName: string) => {
    const name = platformName.toLowerCase()
    if (name.includes('playstation')) return <IconPlaystationCircle size={24} />
    if (name.includes('xbox')) return <IconBrandXbox size={24} />
    if (name.includes('pc')) return <IconBrandWindows size={24} />
    if (name.includes('nintendo')) return <IconDeviceNintendo size={24} />
    return '🎮'
  }

  if (viewMode === 'list') {
    return (
      <Card
        shadow="sm"
        padding="md"
        radius="md"
        style={{
          backgroundColor: '#2d2d2d',
          border: '1px solid #404040',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => onGameClick?.(game)}
      >
        <Group gap="md">
          <Image
            src={game.background_image || '/placeholder.svg'}
            height={80}
            width={120}
            radius="md"
            alt={game.name}
            fallbackSrc="/placeholder.svg?height=80&width=120"
          />

          <Box style={{ flex: 1 }}>
            <Group justify="space-between" mb="xs">
              <Text fw={600} c="white" size="lg" lineClamp={1}>
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
                {game.platforms?.slice(0, 3).map((platform) => (
                  <Text key={platform.platform.id} size="xs" c="dimmed">
                    {getPlatformIcon(platform.platform.name)}
                  </Text>
                ))}
              </Group>
            </Group>

            <Group gap="xs">
              {game.genres?.slice(0, 3).map((genre) => (
                <Badge key={genre.id} variant="light" size="xs" color="teal">
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
        backgroundColor: '#2d2d2d',
        border: '1px solid #404040',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        position: 'relative',
        overflow: 'hidden'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onGameClick?.(game)}
    >
      <Card.Section style={{ position: 'relative' }}>
        <Image
          src={game.background_image || '/placeholder.svg'}
          height={200}
          alt={game.name}
          fallbackSrc="/placeholder.svg?height=200&width=300"
        />

        {isHovered && (
          <>
            <Overlay color="#000" opacity={0.6} />
            <Box
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 10
              }}
            >
              <Group gap="sm">
                <ActionIcon size="lg" radius="xl" color="teal" variant="filled">
                  <IconPlayerPlay size={20} />
                </ActionIcon>
                <ActionIcon size="lg" radius="xl" color="red" variant="filled">
                  <IconHeart size={20} />
                </ActionIcon>
                <ActionIcon size="lg" radius="xl" color="blue" variant="filled">
                  <IconPlus size={20} />
                </ActionIcon>
              </Group>
            </Box>
          </>
        )}

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
            >
              {game.metacritic}
            </Badge>
          )}
        </Box>
      </Card.Section>

      <Stack gap="xs" mt="md">
        <Group justify="space-between">
          <Text fw={600} c="white" size="lg" lineClamp={1}>
            {game.name}
          </Text>
        </Group>

        <Group gap="xs" mb="sm">
          {game.platforms?.slice(0, 4).map((platform) => (
            <Text key={platform.platform.id} size="xs" c="dimmed">
              {getPlatformIcon(platform.platform.name)}
            </Text>
          ))}
        </Group>

        <Group justify="space-between" mb="sm">
          <Group gap="xs">
            <IconStar size={16} fill="#ffd43b" color="#ffd43b" />
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
            <Badge key={genre.id} variant="light" size="xs" color="teal">
              {genre.name}
            </Badge>
          ))}
        </Group>

        {isHovered && game.playtime && (
          <Text size="xs" c="dimmed" mt="xs">
            Average playtime: {game.playtime} hours
          </Text>
        )}
      </Stack>
    </Card>
  )
}
