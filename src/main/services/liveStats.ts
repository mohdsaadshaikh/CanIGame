import si from 'systeminformation'
import type { LiveStats } from '@shared/types/hardware'

const toGB = (bytes: number): number => Math.round((bytes / 1024 ** 3) * 100) / 100

let inFlight: Promise<LiveStats> | null = null

/** CPU load (overall and per core), CPU temperature where exposed, and memory in use. */
export function getLiveStats(): Promise<LiveStats> {
  inFlight ??= Promise.all([si.currentLoad(), si.mem(), si.cpuTemperature().catch(() => null)])
    .then(([load, mem, temp]) => ({
      cpuLoad: Math.round(load.currentLoad * 10) / 10,
      coreLoads: load.cpus.map((core) => Math.round(core.load)),
      cpuTempC: temp && typeof temp.main === 'number' && temp.main > 0 ? temp.main : null,
      // "active" excludes the OS file cache, which is what people mean by "in use".
      memUsedGB: toGB(mem.active),
      memTotalGB: toGB(mem.total)
    }))
    .finally(() => {
      inFlight = null
    })
  return inFlight
}
