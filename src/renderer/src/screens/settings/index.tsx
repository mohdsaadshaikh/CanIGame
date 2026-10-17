import { Button, Container, Text } from '@mantine/core'
import { useHardware } from '@renderer/hooks/useHardware'
import { getErrorMessage } from '@renderer/utils/errors'
import { IconCpu, IconDatabase, IconRefresh, IconTrash } from '@tabler/icons-react'
import { useState } from 'react'
import classes from './Settings.module.css'

interface SettingProps {
  icon: React.ReactNode
  title: string
  description: string
  children: React.ReactNode
}

const Setting = ({ icon, title, description, children }: SettingProps): React.JSX.Element => (
  <section className={classes.setting}>
    <span className={classes.tile} aria-hidden="true">
      {icon}
    </span>
    <div className={classes.text}>
      <h2 className={classes.name}>{title}</h2>
      <p className={classes.description}>{description}</p>
    </div>
    <div className={classes.action}>{children}</div>
  </section>
)

const Settings = (): React.JSX.Element => {
  const { scanning, scan, error: scanError } = useHardware()
  const [clearing, setClearing] = useState(false)
  const [cacheNote, setCacheNote] = useState<string | null>(null)

  const clearCache = async (): Promise<void> => {
    setClearing(true)
    setCacheNote(null)
    try {
      const removed = await window.api.clearCache()
      setCacheNote(`Removed ${removed} cached ${removed === 1 ? 'response' : 'responses'}.`)
      // Renderer-side caches (Explore pages, game details) live in memory; a reload drops them.
      setTimeout(() => window.location.reload(), 900)
    } catch (err) {
      setCacheNote(getErrorMessage(err, 'Could not clear the cache.'))
    } finally {
      setClearing(false)
    }
  }

  return (
    <Container size="lg" py="xs">
      <h1 className={classes.title}>Settings</h1>

      <div className={classes.list}>
        <Setting
          icon={<IconCpu size={28} stroke={1.5} />}
          title="Hardware scan"
          description="Re-read your CPU, GPU and memory, for example after an upgrade or a driver update."
        >
          <Button
            leftSection={<IconRefresh size={16} />}
            loading={scanning}
            onClick={() => void scan()}
          >
            Rescan now
          </Button>
          {scanError && (
            <Text size="xs" c="red.4" mt={6}>
              {scanError}
            </Text>
          )}
        </Setting>

        <Setting
          icon={<IconDatabase size={28} stroke={1.5} />}
          title="Game data cache"
          description="Game lists, details and searches are kept on this PC so pages open instantly and work offline. Clear it if something looks out of date."
        >
          <Button
            variant="default"
            leftSection={<IconTrash size={16} />}
            loading={clearing}
            onClick={() => void clearCache()}
          >
            Clear cache
          </Button>
          {cacheNote && (
            <Text size="xs" c="dimmed" mt={6}>
              {cacheNote}
            </Text>
          )}
        </Setting>
      </div>
    </Container>
  )
}

export default Settings
