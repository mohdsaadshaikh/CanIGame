import type { LiveHistory } from '@renderer/hooks/useLiveStats'
import { cleanPartName } from '@renderer/utils/hardware'
import type { LiveGpuStats, LiveStats } from '@shared/types/hardware'
import { IconCpu, IconDeviceSdCard, IconTopologyStar3 } from '@tabler/icons-react'
import { heatGradient } from '@renderer/utils/heat'
import classes from './LiveMonitor.module.css'

/** Inline sparkline of a 0-100 series. Draws nothing until there are two samples. */
function Spark({ values }: { values: number[] }): React.JSX.Element | null {
  if (values.length < 2) return null
  const step = 100 / (values.length - 1)
  const points = values.map(
    (v, i) => `${(i * step).toFixed(2)},${(36 - (v / 100) * 34).toFixed(2)}`
  )
  return (
    <svg
      className={classes.spark}
      viewBox="0 0 100 36"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <polyline points={`0,36 ${points.join(' ')} 100,36`} className={classes.sparkFill} />
      <polyline points={points.join(' ')} className={classes.sparkLine} />
    </svg>
  )
}

function Meter({ percent }: { percent: number }): React.JSX.Element {
  const clamped = Math.max(0, Math.min(100, percent))
  return (
    <div className={classes.meter}>
      <span className={classes.meterFill} style={{ width: `${clamped}%` }} />
    </div>
  )
}

interface GaugeProps {
  tone: 'cpu' | 'mem' | 'gpu'
  icon: React.ReactNode
  label: string
  detail?: string
  value: string
  unit?: string
  percent: number
  history: number[]
  children?: React.ReactNode
}

const Gauge = ({
  tone,
  icon,
  label,
  detail,
  value,
  unit,
  percent,
  history,
  children
}: GaugeProps): React.JSX.Element => (
  <section
    className={classes.gauge}
    data-tone={tone}
    aria-label={`${label}: ${value}${unit ?? ''}`}
  >
    <div className={classes.gaugeHead}>
      <span className={classes.gaugeIcon} aria-hidden="true">
        {icon}
      </span>
      <div className={classes.gaugeTitle}>
        <span className={classes.gaugeLabel}>{label}</span>
        {detail && <span className={classes.gaugeDetail}>{detail}</span>}
      </div>
    </div>
    <div className={classes.gaugeValue}>
      {value}
      {unit && <span className={classes.gaugeUnit}>{unit}</span>}
    </div>
    <Meter percent={percent} />
    <Spark values={history} />
    {children}
  </section>
)

interface LiveMonitorProps {
  stats: LiveStats | null
  gpu: LiveGpuStats | null
  history: LiveHistory
  paused: boolean
}

export function LiveMonitor({ stats, gpu, history, paused }: LiveMonitorProps): React.JSX.Element {
  const memPercent = stats && stats.memTotalGB > 0 ? (stats.memUsedGB / stats.memTotalGB) * 100 : 0

  return (
    <div className={classes.monitor} data-paused={paused || undefined}>
      <Gauge
        tone="cpu"
        icon={<IconCpu size={22} stroke={1.6} />}
        label="CPU load"
        detail={
          stats?.cpuTempC != null
            ? `${Math.round(stats.cpuTempC)}°C`
            : `${stats?.coreLoads.length ?? '-'} threads`
        }
        value={stats ? String(Math.round(stats.cpuLoad)) : '-'}
        unit="%"
        percent={stats?.cpuLoad ?? 0}
        history={history.cpu}
      >
        {stats && (
          <div className={classes.cores} aria-label="Per-thread load">
            {stats.coreLoads.map((load, i) => (
              <span
                key={i}
                className={classes.core}
                title={`Thread ${i + 1}: ${load}%`}
                style={{ background: heatGradient(load), height: `${Math.max(12, load)}%` }}
              />
            ))}
          </div>
        )}
      </Gauge>

      <Gauge
        tone="mem"
        icon={<IconDeviceSdCard size={22} stroke={1.6} />}
        label="Memory in use"
        detail={stats ? `of ${stats.memTotalGB.toFixed(1)} GB` : undefined}
        value={stats ? stats.memUsedGB.toFixed(1) : '-'}
        unit="GB"
        percent={memPercent}
        history={history.mem}
      />

      {gpu && (
        <Gauge
          tone="gpu"
          icon={<IconTopologyStar3 size={22} stroke={1.6} />}
          label="GPU load"
          detail={cleanPartName(gpu.name)}
          value={String(Math.round(gpu.loadPct))}
          unit="%"
          percent={gpu.loadPct}
          history={history.gpu}
        >
          <div className={classes.gpuFacts}>
            {gpu.tempC != null && (
              <span>
                <b>{Math.round(gpu.tempC)}°C</b> core
              </span>
            )}
            <span>
              <b>{gpu.vramUsedMB.toLocaleString('en-US')}</b> /{' '}
              {gpu.vramTotalMB.toLocaleString('en-US')} MB VRAM
            </span>
          </div>
        </Gauge>
      )}
    </div>
  )
}
