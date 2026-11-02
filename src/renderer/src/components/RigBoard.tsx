import { Button, Group, Skeleton, Text } from '@mantine/core'
import { useHardware } from '@renderer/hooks/useHardware'
import {
  cleanPartName,
  clockRange,
  nominalMemory,
  otherGpus,
  primaryGpu
} from '@renderer/utils/hardware'
import type { HardwareInfo } from '@shared/types/hardware'
import { IconCpu, IconRefresh } from '@tabler/icons-react'
import { useNavigate } from 'react-router-dom'
import classes from './RigBoard.module.css'

/**
 * Authored board traces (45-degree routing, vias, a socket and a slot outline) used as the
 * profile header's artwork. The one "hot" trace carries the accent.
 */
const BoardTraces = (): React.JSX.Element => (
  <svg
    className={classes.art}
    viewBox="0 0 620 220"
    preserveAspectRatio="xMaxYMid slice"
    aria-hidden="true"
  >
    <rect x="430" y="40" width="96" height="96" rx="4" />
    <rect x="446" y="56" width="64" height="64" rx="2" />
    <path d="M430 64 H372 L344 92 H250 L222 120 H120" />
    <path d="M430 80 H380 L352 108 H268 L240 136 H60" className={classes.hot} />
    <path d="M430 96 H388 L360 124 H286 L258 152 H180" />
    <path d="M526 72 H560 L588 44 H620" />
    <path d="M526 104 H572 L600 132 H620" />
    <path d="M478 136 V158 L458 168" />
    <path d="M340 168 V150 L320 130 H200 L176 106 H90" />
    <path d="M560 168 V146 L580 126 V20 L600 0" />
    <circle cx="120" cy="120" r="4" />
    <circle cx="60" cy="136" r="4" />
    <circle cx="180" cy="152" r="4" />
    <circle cx="90" cy="106" r="4" />
    <circle cx="620" cy="44" r="4" />
  </svg>
)

const vramValue = (mb: number): { value: string; unit: string } =>
  mb >= 1024
    ? { value: String(Math.round((mb / 1024) * 10) / 10), unit: 'GB' }
    : { value: mb > 0 ? String(mb) : 'n/a', unit: mb > 0 ? 'MB' : '' }

interface StatProps {
  value: string
  unit?: string
  designator?: string
  label: string
}

const Stat = ({ value, unit, designator, label }: StatProps): React.JSX.Element => (
  <div>
    <div className={classes.value}>
      {value}
      {unit && <span className={classes.unit}>{unit}</span>}
    </div>
    <div className={classes.label}>
      {designator && <span className={classes.ref}>{designator}</span>}
      <span>{label}</span>
    </div>
  </div>
)

function stats(hardware: HardwareInfo): StatProps[] {
  const { cpu, memory } = hardware
  const gpu = primaryGpu(hardware.gpu)
  const vram = gpu ? vramValue(gpu.vram) : { value: 'n/a', unit: '' }
  const extra = otherGpus(hardware.gpu)
  return [
    {
      value: `${cpu.physicalCores}C/${cpu.cores}T`,
      designator: 'U1',
      label: cleanPartName(cpu.brand)
    },
    { value: clockRange(cpu).replace(' GHz', ''), unit: 'GHz', label: 'CPU clock' },
    {
      value: vram.value,
      unit: vram.unit,
      designator: 'PCIE1',
      label: gpu
        ? `${cleanPartName(gpu.model)}${extra.length ? ` + ${extra.length} more` : ''}`
        : 'No GPU reported'
    },
    {
      value: nominalMemory(memory.total).replace(' GB', ''),
      unit: 'GB',
      designator: 'DIMM',
      label: `${memory.available.toFixed(1)} GB free at scan`
    }
  ]
}

/** Home's front door: the user's detected machine, presented like a player profile. */
export function RigBoard(): React.JSX.Element {
  const navigate = useNavigate()
  const { hardware, scanning, error, scanCount, scan } = useHardware({ autoScan: true })

  let content: React.ReactNode
  if (hardware) {
    content = (
      <>
        <div className={classes.identity}>
          <span className={classes.tile} aria-hidden="true">
            <IconCpu size={48} stroke={1.4} />
          </span>
          <div className={classes.who}>
            <h2 id="rig-heading" className={classes.name}>
              {hardware.system.model || 'Your PC'}
            </h2>
            <div className={classes.sub}>{hardware.system.manufacturer} · Your rig</div>
          </div>
          <Group gap="xs" className={classes.actions}>
            <Button variant="default" size="sm" onClick={() => navigate('/pc')}>
              Full specs
            </Button>
            <Button
              size="sm"
              leftSection={<IconRefresh size={15} />}
              loading={scanning}
              onClick={() => void scan()}
            >
              Rescan
            </Button>
          </Group>
        </div>
        {error && (
          <Text size="sm" c="red.4" mt="sm">
            Rescan failed: {error}
          </Text>
        )}
        <div className={classes.stats}>
          {stats(hardware).map((stat) => (
            <Stat key={stat.label} {...stat} />
          ))}
        </div>
      </>
    )
  } else if (scanning) {
    content = (
      <>
        <div className={classes.identity}>
          <Skeleton width={64} height={64} radius="lg" />
          <div style={{ flex: 1 }}>
            <h2 id="rig-heading" className={classes.name}>
              Reading hardware
            </h2>
            <Skeleton height={12} width={180} mt={10} />
          </div>
        </div>
        <div className={classes.stats}>
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i}>
              <Skeleton height={30} width="60%" />
              <Skeleton height={10} width="80%" mt={10} />
            </div>
          ))}
        </div>
      </>
    )
  } else {
    content = (
      <div className={classes.empty}>
        <span className={classes.tile} aria-hidden="true">
          <IconCpu size={48} stroke={1.4} />
        </span>
        <div className={classes.emptyText}>
          <h2 id="rig-heading" className={classes.emptyTitle}>
            {error ? 'Scan failed' : 'Scan your rig'}
          </h2>
          {error ??
            'CanIGame reads your CPU, GPU and memory on this machine so every game can be read against them.'}
        </div>
        <Button
          ml="auto"
          leftSection={<IconCpu size={16} />}
          loading={scanning}
          onClick={() => void scan()}
        >
          {error ? 'Try again' : 'Scan my PC'}
        </Button>
      </div>
    )
  }

  return (
    <div className={classes.wrap}>
      {/* Re-keyed per scan so the traces replay their draw-in; cached loads stay still. */}
      <section
        key={scanCount}
        aria-labelledby="rig-heading"
        className={`${classes.profile} cig-cut`}
        data-fresh={scanCount > 0 || undefined}
      >
        {hardware && <BoardTraces />}
        {content}
      </section>
    </div>
  )
}
