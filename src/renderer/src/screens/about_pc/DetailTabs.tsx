import { Skeleton, Tabs } from '@mantine/core'
import { cleanPartName, formatGHz, nominalMemory, primaryGpu } from '@renderer/utils/hardware'
import type { HardwareInfo, LiveGpuStats, LiveStats, SystemDetails } from '@shared/types/hardware'
import {
  IconBattery3,
  IconBatteryCharging,
  IconCpu,
  IconDeviceDesktop,
  IconDeviceSdCard,
  IconServer2,
  IconTopologyStar3
} from '@tabler/icons-react'
import { heatGradient } from '@renderer/utils/heat'
import classes from './DetailTabs.module.css'

// ---------------------------------------------------------------------------
// Building blocks
// ---------------------------------------------------------------------------

const formatBytes = (bytes: number): string =>
  bytes >= 1024 ** 2 ? `${Math.round(bytes / 1024 ** 2)} MB` : `${Math.round(bytes / 1024)} KB`

const formatSize = (gb: number): string =>
  gb >= 1000 ? `${(gb / 1024).toFixed(gb >= 10240 ? 0 : 1)} TB` : `${Math.round(gb)} GB`

const known = (value: string | undefined | null): value is string =>
  Boolean(value && value.trim() && value.trim().toLowerCase() !== 'unknown')

interface Spec {
  label: string
  value: string
}

/** Big-number spec tiles; entries with no real value are dropped, not shown as "n/a". */
function SpecGrid({
  specs
}: {
  specs: (Spec | false | null | undefined | '' | 0)[]
}): React.JSX.Element {
  return (
    <div className={classes.specs}>
      {specs
        .filter((spec): spec is Spec => Boolean(spec && known(spec.value)))
        .map((spec) => (
          <div key={spec.label} className={classes.spec}>
            <span className={classes.specLabel}>{spec.label}</span>
            <span className={classes.specValue}>{spec.value}</span>
          </div>
        ))}
    </div>
  )
}

function Meter({ percent }: { percent: number }): React.JSX.Element {
  return (
    <div className={classes.meter}>
      <span
        className={classes.meterFill}
        style={{ width: `${Math.max(0, Math.min(100, percent))}%` }}
        data-high={percent >= 90 || undefined}
      />
    </div>
  )
}

const Pending = (): React.JSX.Element => (
  <div className={classes.pending}>
    <Skeleton height={86} radius="lg" />
    <Skeleton height={86} radius="lg" />
    <Skeleton height={86} radius="lg" />
    <p className={classes.pendingNote}>
      Reading full hardware details. The first scan takes about 15 seconds; after that it is cached.
    </p>
  </div>
)

// ---------------------------------------------------------------------------
// Tabs
// ---------------------------------------------------------------------------

const ProcessorTab = ({
  hardware,
  details,
  stats
}: {
  hardware: HardwareInfo
  details: SystemDetails | null
  stats: LiveStats | null
}): React.JSX.Element => {
  const { cpu } = hardware
  const hybrid = details && details.cpu.efficiencyCores > 0
  return (
    <>
      <SpecGrid
        specs={[
          { label: 'Model', value: cleanPartName(cpu.brand) },
          { label: 'Cores', value: String(cpu.physicalCores) },
          { label: 'Threads', value: String(cpu.cores) },
          hybrid && {
            label: 'P / E cores',
            value: `${details.cpu.performanceCores} / ${details.cpu.efficiencyCores}`
          },
          { label: 'Base clock', value: `${formatGHz(cpu.speed)} GHz` },
          cpu.speedMax > cpu.speed && {
            label: 'Boost clock',
            value: `${formatGHz(cpu.speedMax)} GHz`
          },
          details &&
            details.cpu.cacheL2 > 0 && {
              label: 'L2 cache',
              value: formatBytes(details.cpu.cacheL2)
            },
          details &&
            details.cpu.cacheL3 > 0 && {
              label: 'L3 cache',
              value: formatBytes(details.cpu.cacheL3)
            },
          details && { label: 'Socket', value: details.cpu.socket },
          details && {
            label: 'Virtualization',
            value: details.cpu.virtualization ? 'Enabled' : 'Disabled'
          }
        ]}
      />
      {stats && (
        <section className={classes.panel}>
          <h3 className={classes.panelTitle}>Load per thread</h3>
          <div className={classes.threads}>
            {stats.coreLoads.map((load, i) => (
              <div key={i} className={classes.thread}>
                <span
                  className={classes.threadBar}
                  style={{ height: `${Math.max(3, load)}%`, background: heatGradient(load) }}
                />
                <span className={classes.threadValue}>{load}%</span>
                <span className={classes.threadLabel}>T{i + 1}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  )
}

const GraphicsTab = ({
  hardware,
  details,
  gpu
}: {
  hardware: HardwareInfo
  details: SystemDetails | null
  gpu: LiveGpuStats | null
}): React.JSX.Element => {
  const primary = primaryGpu(hardware.gpu)
  return (
    <div className={classes.cards}>
      {hardware.gpu.map((adapter, i) => {
        const isPrimary = adapter === primary
        const isNvidia = /nvidia/i.test(adapter.vendor) || /nvidia/i.test(adapter.model)
        return (
          <section
            key={`${adapter.model}-${i}`}
            className={classes.panel}
            data-feature={isPrimary || undefined}
          >
            <div className={classes.panelHead}>
              <span className={classes.icon} aria-hidden="true">
                <IconTopologyStar3 size={26} stroke={1.5} />
              </span>
              <div>
                <h3 className={classes.panelTitle}>{cleanPartName(adapter.model)}</h3>
                <span className={classes.panelSub}>{adapter.vendor}</span>
              </div>
              {isPrimary && <span className={classes.badge}>Used for games</span>}
            </div>
            <SpecGrid
              specs={[
                {
                  label: 'Video memory',
                  value: adapter.vram > 0 ? formatSize(adapter.vram / 1024) : ''
                },
                isNvidia && details?.gpuDriver && { label: 'Driver', value: details.gpuDriver },
                isNvidia && gpu && { label: 'Load now', value: `${Math.round(gpu.loadPct)}%` },
                isNvidia &&
                  gpu?.tempC != null && {
                    label: 'Temperature',
                    value: `${Math.round(gpu.tempC)}°C`
                  },
                { label: 'Type', value: isPrimary ? 'Dedicated' : 'Integrated' }
              ]}
            />
          </section>
        )
      })}
    </div>
  )
}

const MemoryTab = ({
  hardware,
  details,
  stats
}: {
  hardware: HardwareInfo
  details: SystemDetails | null
  stats: LiveStats | null
}): React.JSX.Element => {
  const used = stats?.memUsedGB ?? hardware.memory.used
  const total = stats?.memTotalGB ?? hardware.memory.total
  return (
    <>
      <section className={classes.panel}>
        <div className={classes.usageHead}>
          <h3 className={classes.panelTitle}>In use now</h3>
          <span className={classes.usageValue}>
            {used.toFixed(1)} <small>/ {total.toFixed(1)} GB</small>
          </span>
        </div>
        <Meter percent={total > 0 ? (used / total) * 100 : 0} />
      </section>
      {details ? (
        <div className={classes.sticks}>
          {details.memoryModules.map((module, i) => (
            <section key={i} className={classes.stick}>
              <span className={classes.stickChips} aria-hidden="true" />
              <span className={classes.stickSize}>{nominalMemory(module.sizeGB)}</span>
              <span className={classes.stickMeta}>
                {[module.type, module.clockMHz > 0 && `${module.clockMHz} MT/s`, module.formFactor]
                  .filter(Boolean)
                  .join('  ')}
              </span>
              {module.slot && <span className={classes.stickSlot}>Slot {module.slot}</span>}
            </section>
          ))}
          {details.memoryModules.length === 0 && (
            <p className={classes.pendingNote}>
              This PC does not report individual memory modules.
            </p>
          )}
        </div>
      ) : (
        <Pending />
      )}
    </>
  )
}

const StorageTab = ({ details }: { details: SystemDetails | null }): React.JSX.Element => {
  if (!details) return <Pending />
  return (
    <>
      <div className={classes.cards}>
        {details.drives.map((drive, i) => (
          <section key={`${drive.name}-${i}`} className={classes.panel}>
            <div className={classes.panelHead}>
              <span className={classes.icon} aria-hidden="true">
                <IconServer2 size={26} stroke={1.5} />
              </span>
              <div>
                <h3 className={classes.panelTitle}>{drive.name}</h3>
                <span className={classes.panelSub}>
                  {[drive.type, drive.interface].filter(Boolean).join('  ')}
                </span>
              </div>
              <span className={classes.badge}>{formatSize(drive.sizeGB)}</span>
            </div>
          </section>
        ))}
      </div>
      <section className={classes.panel}>
        <h3 className={classes.panelTitle}>Volumes</h3>
        <div className={classes.volumes}>
          {details.volumes.map((volume) => {
            const percent = volume.sizeGB > 0 ? (volume.usedGB / volume.sizeGB) * 100 : 0
            return (
              <div key={volume.mount} className={classes.volume}>
                <div className={classes.volumeHead}>
                  <span className={classes.volumeName}>{volume.mount}</span>
                  <span className={classes.volumeFree}>
                    {formatSize(volume.sizeGB - volume.usedGB)} free of {formatSize(volume.sizeGB)}
                  </span>
                </div>
                <Meter percent={percent} />
              </div>
            )
          })}
        </div>
      </section>
    </>
  )
}

const DisplaysTab = ({ details }: { details: SystemDetails | null }): React.JSX.Element => {
  if (!details) return <Pending />
  if (details.displays.length === 0) {
    return <p className={classes.pendingNote}>No displays were reported.</p>
  }
  return (
    <div className={classes.cards}>
      {details.displays.map((display, i) => (
        <section key={i} className={classes.panel} data-feature={display.main || undefined}>
          <div className={classes.panelHead}>
            <span className={classes.icon} aria-hidden="true">
              <IconDeviceDesktop size={26} stroke={1.5} />
            </span>
            <div>
              <h3 className={classes.panelTitle}>
                {known(display.model) && display.model !== 'Generic PnP Monitor'
                  ? display.model
                  : `Display ${i + 1}`}
              </h3>
              <span className={classes.panelSub}>{display.main ? 'Main display' : 'Extended'}</span>
            </div>
          </div>
          <SpecGrid
            specs={[
              display.width > 0 && {
                label: 'Resolution',
                value: `${display.width} × ${display.height}`
              },
              display.refreshHz > 0 && { label: 'Refresh rate', value: `${display.refreshHz} Hz` }
            ]}
          />
        </section>
      ))}
    </div>
  )
}

const SystemTab = ({
  hardware,
  details
}: {
  hardware: HardwareInfo
  details: SystemDetails | null
}): React.JSX.Element => {
  if (!details) return <Pending />
  const { os, board, bios, battery } = details
  return (
    <>
      <SpecGrid
        specs={[
          {
            label: 'Machine',
            value: `${hardware.system.manufacturer} ${hardware.system.model}`.trim()
          },
          { label: 'Operating system', value: os.distro.replace(/^Microsoft\s+/, '') },
          { label: 'Build', value: os.build },
          { label: 'Architecture', value: os.arch },
          { label: 'Motherboard', value: `${board.manufacturer} ${board.model}`.trim() },
          { label: 'BIOS', value: `${bios.vendor} ${bios.version}`.trim() },
          { label: 'BIOS date', value: bios.releaseDate },
          { label: 'Device name', value: hardware.os.hostname }
        ]}
      />
      {battery.present && (
        <section className={classes.panel}>
          <div className={classes.usageHead}>
            <h3 className={classes.panelTitle}>
              {battery.charging ? (
                <IconBatteryCharging size={18} className={classes.inlineIcon} />
              ) : (
                <IconBattery3 size={18} className={classes.inlineIcon} />
              )}
              Battery {battery.charging ? '(charging)' : ''}
            </h3>
            <span className={classes.usageValue}>{Math.round(battery.percent)}%</span>
          </div>
          <Meter percent={battery.percent} />
        </section>
      )}
    </>
  )
}

// ---------------------------------------------------------------------------

interface DetailTabsProps {
  hardware: HardwareInfo
  details: SystemDetails | null
  stats: LiveStats | null
  gpu: LiveGpuStats | null
  overview: React.ReactNode
}

export function DetailTabs({
  hardware,
  details,
  stats,
  gpu,
  overview
}: DetailTabsProps): React.JSX.Element {
  return (
    <Tabs defaultValue="overview" classNames={{ list: classes.tabList, tab: classes.tab }}>
      <Tabs.List>
        <Tabs.Tab value="overview">Overview</Tabs.Tab>
        <Tabs.Tab value="cpu" leftSection={<IconCpu size={15} />}>
          Processor
        </Tabs.Tab>
        <Tabs.Tab value="gpu" leftSection={<IconTopologyStar3 size={15} />}>
          Graphics
        </Tabs.Tab>
        <Tabs.Tab value="memory" leftSection={<IconDeviceSdCard size={15} />}>
          Memory
        </Tabs.Tab>
        <Tabs.Tab value="storage" leftSection={<IconServer2 size={15} />}>
          Storage
        </Tabs.Tab>
        <Tabs.Tab value="displays" leftSection={<IconDeviceDesktop size={15} />}>
          Displays
        </Tabs.Tab>
        <Tabs.Tab value="system">System</Tabs.Tab>
      </Tabs.List>

      <div className={classes.body}>
        <Tabs.Panel value="overview">{overview}</Tabs.Panel>
        <Tabs.Panel value="cpu" data-tone="cpu">
          <ProcessorTab hardware={hardware} details={details} stats={stats} />
        </Tabs.Panel>
        <Tabs.Panel value="gpu" data-tone="gpu">
          <GraphicsTab hardware={hardware} details={details} gpu={gpu} />
        </Tabs.Panel>
        <Tabs.Panel value="memory" data-tone="mem">
          <MemoryTab hardware={hardware} details={details} stats={stats} />
        </Tabs.Panel>
        <Tabs.Panel value="storage" data-tone="disk">
          <StorageTab details={details} />
        </Tabs.Panel>
        <Tabs.Panel value="displays" data-tone="display">
          <DisplaysTab details={details} />
        </Tabs.Panel>
        <Tabs.Panel value="system" data-tone="sys">
          <SystemTab hardware={hardware} details={details} />
        </Tabs.Panel>
      </div>
    </Tabs>
  )
}
