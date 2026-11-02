import { Alert, Button, Container, Group, Skeleton, Switch, Text } from '@mantine/core'
import { useHardware } from '@renderer/hooks/useHardware'
import { useLiveStats } from '@renderer/hooks/useLiveStats'
import { useSystemDetails } from '@renderer/hooks/useSystemDetails'
import {
  cleanPartName,
  formatGHz,
  nominalMemory,
  otherGpus,
  primaryGpu
} from '@renderer/utils/hardware'
import type { GPUInfo, HardwareInfo, SystemDetails } from '@shared/types/hardware'
import {
  IconAlertTriangle,
  IconCheck,
  IconCopy,
  IconCpu,
  IconDeviceDesktop,
  IconDeviceSdCard,
  IconRefresh,
  IconTopologyStar3
} from '@tabler/icons-react'
import { useState } from 'react'
import classes from './AboutPC.module.css'
import { DetailTabs } from './DetailTabs'
import { LiveMonitor } from './LiveMonitor'

const isKnown = (value: string | undefined): value is string =>
  Boolean(value && value.trim() && value.trim().toLowerCase() !== 'unknown')

const PLATFORM_NAMES: Record<string, string> = {
  win32: 'Windows',
  Windows: 'Windows',
  darwin: 'macOS',
  linux: 'Linux'
}

function vram(mb: number): { value: string; unit: string } {
  if (mb <= 0) return { value: 'n/a', unit: '' }
  return mb >= 1024
    ? { value: String(Math.round((mb / 1024) * 10) / 10), unit: 'GB' }
    : { value: String(mb), unit: 'MB' }
}

// ---------------------------------------------------------------------------
// Copy specs: a plain-text sheet for forum posts and support tickets.
// ---------------------------------------------------------------------------

function specSheet(hardware: HardwareInfo, details: SystemDetails | null): string {
  const { cpu, memory, system } = hardware
  const gpus = [primaryGpu(hardware.gpu), ...otherGpus(hardware.gpu)].filter(
    (gpu): gpu is GPUInfo => Boolean(gpu)
  )
  const lines = [
    `System: ${system.manufacturer} ${system.model}${
      details
        ? ` (${details.os.distro.replace(/^Microsoft\s+/, '')}, build ${details.os.build}, ${details.os.arch})`
        : ''
    }`,
    `CPU: ${cleanPartName(cpu.brand)}, ${cpu.physicalCores} cores / ${cpu.cores} threads, ${formatGHz(cpu.speed)} GHz`,
    `GPU: ${gpus
      .map((gpu, i) => {
        const memoryLabel = gpu.vram > 0 ? `${vram(gpu.vram).value} ${vram(gpu.vram).unit}` : ''
        const driver = i === 0 && details?.gpuDriver ? `, driver ${details.gpuDriver}` : ''
        return `${cleanPartName(gpu.model)}${memoryLabel ? ` (${memoryLabel}${driver})` : ''}`
      })
      .join('; ')}`,
    `RAM: ${nominalMemory(memory.total)}${
      details?.memoryModules.length
        ? ` (${details.memoryModules
            .map((m) => `${nominalMemory(m.sizeGB)} ${m.type} ${m.clockMHz} MT/s`.trim())
            .join(' + ')})`
        : ''
    }`
  ]
  if (details?.drives.length) {
    lines.push(
      `Storage: ${details.drives.map((d) => `${d.name} (${Math.round(d.sizeGB)} GB ${d.type})`).join('; ')}`
    )
  }
  if (details?.displays.length) {
    lines.push(
      `Display: ${details.displays.map((d) => `${d.width}x${d.height} @ ${d.refreshHz} Hz`).join('; ')}`
    )
  }
  return ['CanIGame spec sheet', ...lines].join('\n')
}

async function copyText(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    // Fallback for when the async clipboard API is unavailable.
    const area = document.createElement('textarea')
    area.value = text
    document.body.appendChild(area)
    area.select()
    document.execCommand('copy')
    area.remove()
  }
}

// ---------------------------------------------------------------------------
// Overview cards
// ---------------------------------------------------------------------------

interface StatProps {
  value: string
  unit?: string
  label: string
}

const Stat = ({ value, unit, label }: StatProps): React.JSX.Element => (
  <div>
    <div className={classes.value}>
      {value}
      {unit && <span className={classes.unit}>{unit}</span>}
    </div>
    <div className={classes.label}>{label}</div>
  </div>
)

interface CardProps {
  tone: 'cpu' | 'gpu' | 'mem' | 'sys'
  icon: React.ReactNode
  designator: string
  name: string
  vendor?: string
  feature?: boolean
  children: React.ReactNode
}

const ComponentCard = ({
  tone,
  icon,
  designator,
  name,
  vendor,
  feature,
  children
}: CardProps): React.JSX.Element => (
  <section
    className={feature ? `${classes.card} ${classes.feature}` : classes.card}
    data-tone={tone}
  >
    <div className={classes.cardHead}>
      <span className={classes.tile} aria-hidden="true">
        {icon}
      </span>
      <div>
        <div className={classes.ref}>{designator}</div>
        <h2 className={classes.part}>{name}</h2>
        {vendor && <div className={classes.vendor}>{vendor}</div>}
      </div>
    </div>
    {children}
  </section>
)

function Overview({ hardware }: { hardware: HardwareInfo }): React.JSX.Element {
  const { cpu, memory, system, os } = hardware
  const gpu = primaryGpu(hardware.gpu)
  const gpuMemory = vram(gpu?.vram ?? 0)
  const boost = cpu.speedMax > cpu.speed ? cpu.speedMax : 0

  return (
    <div className={classes.grid}>
      <ComponentCard
        tone="gpu"
        icon={<IconTopologyStar3 size={30} stroke={1.5} />}
        designator="PCIE1 · GRAPHICS"
        name={gpu ? cleanPartName(gpu.model) : 'No GPU reported'}
        vendor={gpu?.vendor}
        feature
      >
        <div className={classes.stats}>
          <Stat value={gpuMemory.value} unit={gpuMemory.unit} label="Video memory" />
          <Stat
            value={String(hardware.gpu.length)}
            label={hardware.gpu.length === 1 ? 'Adapter' : 'Adapters'}
          />
        </div>
      </ComponentCard>

      <ComponentCard
        tone="cpu"
        icon={<IconCpu size={30} stroke={1.5} />}
        designator="U1 · PROCESSOR"
        name={cleanPartName(cpu.brand)}
        vendor={cpu.manufacturer}
      >
        <div className={classes.stats}>
          <Stat value={String(cpu.physicalCores)} label="Cores" />
          <Stat value={String(cpu.cores)} label="Threads" />
          <Stat value={formatGHz(cpu.speed)} unit="GHz" label="Base clock" />
          {boost > 0 && <Stat value={formatGHz(boost)} unit="GHz" label="Boost clock" />}
        </div>
      </ComponentCard>

      <ComponentCard
        tone="mem"
        icon={<IconDeviceSdCard size={30} stroke={1.5} />}
        designator="DIMM · MEMORY"
        name={`${nominalMemory(memory.total)} RAM`}
        vendor={`${memory.total.toFixed(2)} GB usable`}
      >
        <div className={classes.stats}>
          <Stat
            value={nominalMemory(memory.total).replace(' GB', '')}
            unit="GB"
            label="Installed"
          />
          <Stat value={memory.available.toFixed(1)} unit="GB" label="Free at scan" />
        </div>
      </ComponentCard>

      <ComponentCard
        tone="sys"
        icon={<IconDeviceDesktop size={30} stroke={1.5} />}
        designator="SYS · MACHINE"
        name={isKnown(system.model) ? system.model : 'This PC'}
        vendor={isKnown(system.manufacturer) ? system.manufacturer : undefined}
      >
        <div className={classes.stats}>
          <Stat value={PLATFORM_NAMES[os.platform] ?? os.platform} label="Operating system" />
        </div>
      </ComponentCard>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

const AboutPC = (): React.JSX.Element => {
  const { hardware, scanning, error, scan } = useHardware({ autoScan: true })
  const details = useSystemDetails({ autoScan: true })
  const [live, setLive] = useState(true)
  const { stats, gpu, history } = useLiveStats(live)
  const [copied, setCopied] = useState(false)

  const rescanAll = (): void => {
    void scan()
    void details.scan()
  }

  const rescan = (
    <Button
      leftSection={<IconRefresh size={16} />}
      loading={scanning || details.scanning}
      onClick={rescanAll}
    >
      Rescan
    </Button>
  )

  if (!hardware) {
    return (
      <Container size="xl" py="xs" className={classes.page}>
        <div className={classes.header}>
          <h1 className={classes.title}>Your PC</h1>
        </div>
        {error && !scanning ? (
          <Alert icon={<IconAlertTriangle size={20} />} title="Hardware scan failed" color="red">
            <Group justify="space-between" align="center">
              <Text size="sm">{error}</Text>
              {rescan}
            </Group>
          </Alert>
        ) : (
          <div className={classes.grid}>
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} height={220} radius="lg" />
            ))}
          </div>
        )}
      </Container>
    )
  }

  const platform = PLATFORM_NAMES[hardware.os.platform] ?? hardware.os.platform
  const copySpecs = async (): Promise<void> => {
    await copyText(specSheet(hardware, details.details))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Container size="xl" py="xs" className={classes.page}>
      <div className={classes.header}>
        <div>
          <h1 className={classes.title}>Your PC</h1>
          <div className={classes.chips}>
            {isKnown(hardware.system.model) && (
              <span className={classes.chip}>
                <b>
                  {hardware.system.manufacturer} {hardware.system.model}
                </b>
              </span>
            )}
            {isKnown(platform) && <span className={classes.chip}>{platform}</span>}
            {isKnown(hardware.os.hostname) && (
              <span className={classes.chip}>{hardware.os.hostname}</span>
            )}
          </div>
        </div>
        <Group gap="sm" className={classes.headerActions}>
          <Switch
            checked={live}
            onChange={(event) => setLive(event.currentTarget.checked)}
            label="Live"
            color="orange"
          />
          <Button
            variant="default"
            leftSection={copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
            onClick={() => void copySpecs()}
          >
            {copied ? 'Copied' : 'Copy specs'}
          </Button>
          {rescan}
        </Group>
      </div>

      {(error || details.error) && (
        <Text size="sm" c="red.4" mb="md">
          {error ?? details.error}
        </Text>
      )}

      <LiveMonitor stats={stats} gpu={gpu} history={history} paused={!live} />

      <div className={classes.tabs}>
        <DetailTabs
          hardware={hardware}
          details={details.details}
          stats={stats}
          gpu={gpu}
          overview={<Overview hardware={hardware} />}
        />
      </div>
    </Container>
  )
}

export default AboutPC
