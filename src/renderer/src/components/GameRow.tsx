import { ActionIcon, Alert, Button, Group, Skeleton, Text } from '@mantine/core'
import type { Game } from '@shared/types/games'
import { IconChevronLeft, IconChevronRight, IconRefresh } from '@tabler/icons-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import classes from './GameRow.module.css'
import { GameTile } from './GameTile'
import { SectionHeader } from './SectionHeader'

interface GameRowProps {
  title: string
  /** Plain-language scope of the row, shown on the title line. */
  meta?: string
  games: Game[]
  loading: boolean
  error: string | null
  onRetry: () => void
  onGameClick: (game: Game) => void
}

const SKELETON_COUNT = 6
/** Tolerance for sub-pixel scroll positions when deciding if we're at an edge. */
const EDGE_EPSILON = 4

/** Horizontally scrolling, snap-aligned row of game tiles with paging arrows. */
export function GameRow({
  title,
  meta,
  games,
  loading,
  error,
  onRetry,
  onGameClick
}: GameRowProps): React.JSX.Element | null {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(true)

  const updateEdges = useCallback(() => {
    const el = scrollerRef.current
    if (!el) return
    setAtStart(el.scrollLeft <= EDGE_EPSILON)
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - EDGE_EPSILON)
  }, [])

  useEffect(() => {
    updateEdges()
    const el = scrollerRef.current
    if (!el) return
    const observer = new ResizeObserver(updateEdges)
    observer.observe(el)
    return () => observer.disconnect()
  }, [games.length, loading, updateEdges])

  const page = (direction: 1 | -1): void => {
    const el = scrollerRef.current
    if (el) el.scrollBy({ left: direction * el.clientWidth * 0.9 })
  }

  // A row with nothing in it is just noise on a store page; hide it.
  if (!loading && !error && games.length === 0) return null

  return (
    <section aria-label={title}>
      <SectionHeader
        title={title}
        meta={meta}
        actions={
          !error && (
            <Group gap={4}>
              <ActionIcon
                size="md"
                aria-label={`Scroll ${title} left`}
                disabled={loading || atStart}
                onClick={() => page(-1)}
              >
                <IconChevronLeft size={16} />
              </ActionIcon>
              <ActionIcon
                size="md"
                aria-label={`Scroll ${title} right`}
                disabled={loading || atEnd}
                onClick={() => page(1)}
              >
                <IconChevronRight size={16} />
              </ActionIcon>
            </Group>
          )
        }
      />

      {error ? (
        <Alert color="red" variant="light">
          <Group justify="space-between">
            <Text size="sm">{error}</Text>
            <Button
              size="xs"
              variant="light"
              color="red"
              leftSection={<IconRefresh size={14} />}
              onClick={onRetry}
            >
              Retry
            </Button>
          </Group>
        </Alert>
      ) : (
        <div ref={scrollerRef} className={classes.scroller} onScroll={updateEdges}>
          {loading
            ? Array.from({ length: SKELETON_COUNT }, (_, index) => (
                <div key={index} className={classes.item}>
                  <Skeleton radius="sm" style={{ aspectRatio: '16 / 10' }} />
                  <Skeleton height={14} mt={12} width="70%" />
                  <Skeleton height={10} mt={8} width="45%" />
                </div>
              ))
            : games.map((game) => (
                <div key={game.id} className={classes.item}>
                  <GameTile game={game} onClick={onGameClick} />
                </div>
              ))}
        </div>
      )}
    </section>
  )
}
