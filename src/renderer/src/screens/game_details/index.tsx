import {
  Alert,
  Anchor,
  Button,
  Container,
  Grid,
  Group,
  Image,
  Modal,
  Skeleton,
  Spoiler,
  Stack
} from '@mantine/core'
import { SteamImage } from '@renderer/components/SteamImage'
import { useRecentGames } from '@renderer/hooks/useRecentGames'
import { getErrorMessage } from '@renderer/utils/errors'
import { compactNumber, isLegendary, releaseLine, reviewTone } from '@renderer/utils/games'
import { isValidGameId } from '@shared/ipc'
import { steamStoreUrl } from '@shared/steam'
import type {
  GameDetails as GameDetailsData,
  RequirementLine,
  Screenshot
} from '@shared/types/games'
import {
  IconAlertTriangle,
  IconArrowLeft,
  IconBrandSteam,
  IconExternalLink,
  IconRefresh,
  IconThumbUpFilled
} from '@tabler/icons-react'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import classes from './GameDetails.module.css'

/** One requirements tier as a HUD spec sheet: mono label column, plain values. */
const RequirementsTier = ({
  title,
  lines,
  highlight
}: {
  title: string
  lines: RequirementLine[]
  highlight?: boolean
}): React.JSX.Element => (
  <div>
    <span className={`${classes.chip} ${highlight ? classes.accent : ''} ${classes.tierName}`}>
      {title}
    </span>
    {lines.length === 0 ? (
      <div className={classes.empty}>Not provided.</div>
    ) : (
      <dl className={classes.specs}>
        {lines.map((line, index) =>
          line.label ? (
            <div key={`${line.label}-${index}`} className={classes.spec}>
              <dt>{line.label}</dt>
              <dd>{line.value}</dd>
            </div>
          ) : (
            <div key={`note-${index}`} className={classes.note}>
              {line.value}
            </div>
          )
        )}
      </dl>
    )}
  </div>
)

const Screenshots = ({ shots }: { shots: Screenshot[] }): React.JSX.Element => {
  const [open, setOpen] = useState<Screenshot | null>(null)
  return (
    <>
      <div className={classes.shots}>
        {shots.map((shot) => (
          <button
            key={shot.full}
            type="button"
            className={`${classes.shot} cig-cut-sm`}
            onClick={() => setOpen(shot)}
            aria-label="Open screenshot"
          >
            <img src={shot.thumb} alt="" loading="lazy" draggable={false} />
          </button>
        ))}
      </div>
      <Modal
        opened={open !== null}
        onClose={() => setOpen(null)}
        size="80rem"
        centered
        withCloseButton={false}
        padding={0}
      >
        {open && <Image src={open.full} alt="" />}
      </Modal>
    </>
  )
}

/** Session cache: revisiting a game renders instantly (main also caches on disk). */
const detailsCache = new Map<number, GameDetailsData>()

const GameDetails = (): React.JSX.Element => {
  const params = useParams<{ id: string }>()
  const parsedId = Number(params.id)
  const appId = isValidGameId(parsedId) ? parsedId : null
  const navigate = useNavigate()
  const cachedGame = appId !== null ? detailsCache.get(appId) : undefined
  const [game, setGame] = useState<GameDetailsData | null>(cachedGame ?? null)
  const [loading, setLoading] = useState(!cachedGame && appId !== null)
  const [error, setError] = useState<string | null>(appId === null ? 'Game not found.' : null)

  // The route reuses this component across ids, so every path sets all three states.
  const fetchGame = useCallback(async () => {
    if (appId === null) {
      setGame(null)
      setLoading(false)
      setError('Game not found.')
      return
    }
    const hit = detailsCache.get(appId)
    if (hit) {
      setGame(hit)
      setLoading(false)
      setError(null)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await window.api.getGame(appId)
      detailsCache.set(appId, data)
      setGame(data)
    } catch (err) {
      setGame(null)
      setError(getErrorMessage(err, 'Failed to load game details.'))
    } finally {
      setLoading(false)
    }
  }, [appId])

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
          <Skeleton height={380} />
          <Skeleton height={28} width="40%" />
          <Skeleton height={160} />
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
              {appId !== null && (
                <Button
                  variant="light"
                  color="red"
                  size="sm"
                  leftSection={<IconRefresh size={16} />}
                  onClick={() => void fetchGame()}
                >
                  Retry
                </Button>
              )}
            </Group>
          </Alert>
        </Stack>
      </Container>
    )
  }

  const { review, requirements } = game
  const hasRequirements = requirements.minimum.length > 0 || requirements.recommended.length > 0
  const platforms = [
    game.platforms.windows && 'Windows',
    game.platforms.mac && 'macOS',
    game.platforms.linux && 'Linux'
  ].filter(Boolean)

  return (
    <Container size="xl" py="md">
      <Stack gap="lg">
        {backButton}

        <section className={`${classes.hero} cig-cut`} aria-label={game.name}>
          <SteamImage art={game.art} kind="hero" className={classes.heroArt} />
          <div className={classes.heroShade} aria-hidden="true" />
          <div className={classes.heroCopy}>
            <h1 className={classes.title}>{game.name}</h1>
            <div className={classes.chips}>
              {isLegendary(game) && (
                <span className={`${classes.chip} ${classes.accent}`}>Legendary</span>
              )}
              <span className={classes.chip}>{releaseLine(game)}</span>
              {review && (
                <span
                  className={`${classes.chip} ${classes[reviewTone(review.positivePct)]}`}
                  title={review.label}
                >
                  <IconThumbUpFilled size={14} aria-hidden />
                  {review.positivePct}% {review.label}
                  <span className={classes.chipMeta}>
                    {compactNumber.format(review.total)} reviews
                  </span>
                </span>
              )}
              {game.metacritic != null && (
                <span className={classes.chip}>Metacritic {game.metacritic}</span>
              )}
            </div>
          </div>
        </section>

        <Grid gutter="lg">
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Stack gap="lg">
              <section className={`${classes.panel} cig-cut`}>
                <h2 className={classes.panelTitle}>PC requirements</h2>
                {hasRequirements ? (
                  <div className={classes.tiers}>
                    <RequirementsTier title="Minimum" lines={requirements.minimum} />
                    <RequirementsTier
                      title="Recommended"
                      lines={requirements.recommended}
                      highlight
                    />
                  </div>
                ) : (
                  <div className={classes.empty}>
                    Steam has no PC requirements listed for this game.
                  </div>
                )}
              </section>

              <section className={`${classes.panel} cig-cut`}>
                <h2 className={classes.panelTitle}>About</h2>
                <Spoiler maxHeight={168} showLabel="Read more" hideLabel="Show less">
                  <div className={classes.about}>{game.about || 'No description available.'}</div>
                </Spoiler>
              </section>

              {game.screenshots.length > 0 && (
                <section className={`${classes.panel} cig-cut`}>
                  <h2 className={classes.panelTitle}>Screenshots</h2>
                  <Screenshots shots={game.screenshots} />
                </section>
              )}
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 4 }}>
            <section className={`${classes.panel} cig-cut`} aria-label="Game facts">
              <div className={classes.facts}>
                {game.price && (
                  <div>
                    <div className={classes.factLabel}>
                      {game.comingSoon ? 'Pre-order' : 'Price'}
                    </div>
                    <div className={classes.price}>
                      {game.price}
                      {game.discountPct > 0 && (
                        <span className={`${classes.chip} ${classes.accent}`}>
                          -{game.discountPct}%
                        </span>
                      )}
                    </div>
                  </div>
                )}
                <div>
                  <div className={classes.factLabel}>Genres</div>
                  {game.genres.length === 0 ? (
                    <div className={classes.factValue}>Not listed</div>
                  ) : (
                    <div className={classes.tags}>
                      {game.genres.map((genre) => (
                        <span key={genre} className={classes.chip}>
                          {genre}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <div className={classes.factLabel}>Developers</div>
                  <div className={classes.factValue}>
                    {game.developers.join(', ') || 'Not listed'}
                  </div>
                </div>
                <div>
                  <div className={classes.factLabel}>Publishers</div>
                  <div className={classes.factValue}>
                    {game.publishers.join(', ') || 'Not listed'}
                  </div>
                </div>
                <div>
                  <div className={classes.factLabel}>Platforms</div>
                  <div className={classes.factValue}>{platforms.join(', ') || 'Not listed'}</div>
                </div>
                {/* Links open in the OS browser: main's setWindowOpenHandler intercepts target="_blank". */}
                <div className={classes.links}>
                  <Anchor
                    href={steamStoreUrl(game.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    size="sm"
                  >
                    <Group gap={6}>
                      <IconBrandSteam size={16} /> View on Steam
                    </Group>
                  </Anchor>
                  {game.website && (
                    <Anchor href={game.website} target="_blank" rel="noopener noreferrer" size="sm">
                      <Group gap={6}>
                        Official website <IconExternalLink size={14} />
                      </Group>
                    </Anchor>
                  )}
                </div>
              </div>
            </section>
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  )
}

export default GameDetails
