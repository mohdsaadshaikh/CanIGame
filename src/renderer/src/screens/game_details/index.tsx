import { rawgImage } from '@renderer/utils/images'
import {
  Alert,
  Anchor,
  Badge,
  Box,
  Button,
  Card,
  Container,
  Grid,
  Group,
  Image,
  Skeleton,
  Spoiler,
  Stack,
  Table,
  Text,
  Title
} from '@mantine/core'
import { useRecentGames } from '@renderer/hooks/useRecentGames'
import { getErrorMessage } from '@renderer/utils/errors'
import { getUniquePlatformTypes, mapPlatformIcons } from '@renderer/utils/platform-utils'
import { parseRequirements, type RequirementLine } from '@renderer/utils/requirements'
import type { GameDetails as GameDetailsData } from '@shared/types/games'
import {
  IconAlertTriangle,
  IconArrowLeft,
  IconCalendar,
  IconExternalLink,
  IconRefresh,
  IconStar
} from '@tabler/icons-react'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

function metacriticColor(score: number): string {
  if (score >= 80) return 'green'
  if (score >= 60) return 'yellow'
  return 'red'
}

function formatDate(iso: string | null): string {
  if (!iso) return 'TBA'
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const RequirementsTable = ({
  title,
  lines
}: {
  title: string
  lines: RequirementLine[]
}): React.JSX.Element => (
  <Box>
    <Text fw={600} mb="xs">
      {title}
    </Text>
    {lines.length === 0 ? (
      <Text size="sm" c="dimmed">
        Not provided.
      </Text>
    ) : (
      <Table variant="vertical" layout="fixed" withTableBorder>
        <Table.Tbody>
          {lines.map((line) => (
            <Table.Tr key={line.label}>
              <Table.Th w={140}>{line.label}</Table.Th>
              <Table.Td>{line.value}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    )}
  </Box>
)

/** Session cache: revisiting a game renders instantly (main also caches on disk). */
const detailsCache = new Map<string, GameDetailsData>()

const GameDetails = (): React.JSX.Element => {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const cachedGame = slug ? detailsCache.get(slug) : undefined
  const [game, setGame] = useState<GameDetailsData | null>(cachedGame ?? null)
  const [loading, setLoading] = useState(!cachedGame)
  const [error, setError] = useState<string | null>(null)

  const fetchGame = useCallback(async () => {
    if (!slug) return
    const hit = detailsCache.get(slug)
    if (hit) {
      setGame(hit)
      setLoading(false)
      setError(null)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await window.api.getGameBySlug(slug)
      detailsCache.set(slug, data)
      setGame(data)
    } catch (err) {
      setGame(null)
      setError(getErrorMessage(err, 'Failed to load game details.'))
    } finally {
      setLoading(false)
    }
  }, [slug])

  useEffect(() => {
    void fetchGame()
  }, [fetchGame])

  // Feed the sidebar's "Recently viewed" list.
  const { remember } = useRecentGames()
  useEffect(() => {
    if (game) remember(game)
  }, [game, remember])

  const backButton = (
    <Button
      variant="subtle"
      leftSection={<IconArrowLeft size={16} />}
      onClick={() => navigate(-1)}
      w="fit-content"
    >
      Back
    </Button>
  )

  if (loading) {
    return (
      <Container size="xl" py="md">
        <Stack gap="md">
          {backButton}
          <Skeleton height={320} radius="md" />
          <Skeleton height={28} width="40%" />
          <Skeleton height={120} radius="md" />
        </Stack>
      </Container>
    )
  }

  if (error || !game) {
    return (
      <Container size="xl" py="md">
        <Stack gap="md">
          {backButton}
          <Alert icon={<IconAlertTriangle size={24} />} title="Could not load game" color="red">
            <Group justify="space-between" align="center">
              {error ?? 'Game not found.'}
              <Button
                variant="light"
                color="red"
                size="sm"
                leftSection={<IconRefresh size={16} />}
                onClick={() => void fetchGame()}
              >
                Retry
              </Button>
            </Group>
          </Alert>
        </Stack>
      </Container>
    )
  }

  const platforms = mapPlatformIcons(getUniquePlatformTypes(game.platforms))
  const pcRequirements = game.platforms.find((p) => p.platform.slug === 'pc')?.requirements
  const minimum = parseRequirements(pcRequirements?.minimum)
  const recommended = parseRequirements(pcRequirements?.recommended)
  const hasRequirements = minimum.length > 0 || recommended.length > 0

  return (
    <Container size="xl" py="md">
      <Stack gap="lg">
        {backButton}

        <Card padding={0} radius="md" style={{ overflow: 'hidden' }}>
          <Box pos="relative">
            <Image src={rawgImage(game.background_image, 'full')} alt="" h={320} fit="cover" />
            <Box
              pos="absolute"
              inset={0}
              style={{
                background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 60%)'
              }}
            />
            <Stack gap="xs" pos="absolute" bottom={0} left={0} right={0} p="lg">
              <Title order={1} c="white" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>
                {game.name}
              </Title>
              <Group gap="md">
                <Group gap={4}>
                  <IconCalendar size={16} color="white" />
                  <Text size="sm" c="white">
                    {formatDate(game.released)}
                  </Text>
                </Group>
                <Group gap={4}>
                  <IconStar size={16} fill="#ffd43b" color="#ffd43b" />
                  <Text size="sm" c="white" fw={500}>
                    {game.rating > 0 ? game.rating.toFixed(1) : 'N/A'}
                  </Text>
                  {game.ratings_count > 0 && (
                    <Text size="xs" c="gray.4">
                      ({game.ratings_count.toLocaleString()} ratings)
                    </Text>
                  )}
                </Group>
                {game.metacritic != null && (
                  <Badge color={metacriticColor(game.metacritic)} variant="filled">
                    Metacritic {game.metacritic}
                  </Badge>
                )}
                <Group gap="xs" c="white">
                  {platforms.map((platform) => (
                    <Box key={platform.name} style={{ display: 'flex' }}>
                      {platform.icon}
                    </Box>
                  ))}
                </Group>
              </Group>
            </Stack>
          </Box>
        </Card>

        <Grid gutter="lg">
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Stack gap="lg">
              <Card>
                <Title order={3} mb="sm">
                  About
                </Title>
                <Spoiler maxHeight={160} showLabel="Read more" hideLabel="Show less">
                  <Text style={{ whiteSpace: 'pre-line' }}>
                    {game.description_raw || 'No description available.'}
                  </Text>
                </Spoiler>
              </Card>

              <Card>
                <Title order={3} mb="sm">
                  PC System Requirements
                </Title>
                {hasRequirements ? (
                  <Grid gutter="lg">
                    <Grid.Col span={{ base: 12, lg: 6 }}>
                      <RequirementsTable title="Minimum" lines={minimum} />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, lg: 6 }}>
                      <RequirementsTable title="Recommended" lines={recommended} />
                    </Grid.Col>
                  </Grid>
                ) : (
                  <Text c="dimmed">RAWG has no PC requirements listed for this game.</Text>
                )}
              </Card>
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card>
              <Stack gap="md">
                <Box>
                  <Text size="sm" c="dimmed">
                    Genres
                  </Text>
                  <Group gap="xs" mt={4}>
                    {game.genres.length === 0 ? (
                      <Text size="sm">Not listed</Text>
                    ) : (
                      game.genres.map((genre) => (
                        <Badge key={genre.id} variant="light">
                          {genre.name}
                        </Badge>
                      ))
                    )}
                  </Group>
                </Box>
                <Box>
                  <Text size="sm" c="dimmed">
                    Developers
                  </Text>
                  <Text size="sm">
                    {game.developers.map((d) => d.name).join(', ') || 'Not listed'}
                  </Text>
                </Box>
                <Box>
                  <Text size="sm" c="dimmed">
                    Publishers
                  </Text>
                  <Text size="sm">
                    {game.publishers.map((p) => p.name).join(', ') || 'Not listed'}
                  </Text>
                </Box>
                <Box>
                  <Text size="sm" c="dimmed">
                    Platforms
                  </Text>
                  <Text size="sm">
                    {game.platforms.map((p) => p.platform.name).join(', ') || 'Not listed'}
                  </Text>
                </Box>
                <Box>
                  <Text size="sm" c="dimmed">
                    Available on
                  </Text>
                  <Group gap="xs" mt={4}>
                    {game.stores.length === 0 ? (
                      <Text size="sm">Not listed</Text>
                    ) : (
                      game.stores.map(({ id, store }) => (
                        <Badge key={id} variant="outline" color="gray">
                          {store.name}
                        </Badge>
                      ))
                    )}
                  </Group>
                </Box>
                {game.esrb_rating && (
                  <Box>
                    <Text size="sm" c="dimmed">
                      Age rating
                    </Text>
                    <Text size="sm">{game.esrb_rating.name}</Text>
                  </Box>
                )}
                {game.website && (
                  // Opens in the OS browser: main's setWindowOpenHandler intercepts target="_blank".
                  <Anchor href={game.website} target="_blank" rel="noopener noreferrer" size="sm">
                    <Group gap={4}>
                      Official website <IconExternalLink size={14} />
                    </Group>
                  </Anchor>
                )}
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  )
}

export default GameDetails
