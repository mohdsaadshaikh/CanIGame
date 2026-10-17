import { execFile } from 'child_process'
import { existsSync } from 'fs'
import { join } from 'path'
import type { LiveGpuStats } from '@shared/types/hardware'

/**
 * NVIDIA's own CLI reports load, temperature, VRAM use and driver version, which
 * systeminformation can't read on Windows. Fixed arguments only; never user input.
 */
const QUERY = 'name,utilization.gpu,temperature.gpu,memory.used,memory.total,driver_version'
const TIMEOUT_MS = 6000

let binary: string | null | undefined

function findBinary(): string | null {
  if (binary !== undefined) return binary
  if (process.platform === 'win32') {
    const candidates = [
      join(process.env['SystemRoot'] ?? 'C:\\Windows', 'System32', 'nvidia-smi.exe'),
      'C:\\Program Files\\NVIDIA Corporation\\NVSMI\\nvidia-smi.exe'
    ]
    binary = candidates.find((path) => existsSync(path)) ?? null
  } else {
    binary = 'nvidia-smi'
  }
  return binary
}

export interface NvidiaReading extends LiveGpuStats {
  driver: string
}

let inFlight: Promise<NvidiaReading | null> | null = null

const num = (value: string | undefined): number =>
  value !== undefined && Number.isFinite(Number(value)) ? Number(value) : 0

/** Resolves null when there's no NVIDIA GPU or the tool isn't installed. */
export function readNvidiaGpu(): Promise<NvidiaReading | null> {
  const path = findBinary()
  if (!path) return Promise.resolve(null)

  inFlight ??= new Promise<NvidiaReading | null>((resolve) => {
    execFile(
      path,
      [`--query-gpu=${QUERY}`, '--format=csv,noheader,nounits'],
      { timeout: TIMEOUT_MS, windowsHide: true },
      (error, stdout) => {
        if (error) {
          // Not installed on this machine: stop trying.
          if ((error as NodeJS.ErrnoException).code === 'ENOENT') binary = null
          resolve(null)
          return
        }
        const [name, load, temp, used, total, driver] = stdout
          .split('\n')[0]
          .split(',')
          .map((part) => part.trim())
        resolve({
          name: name ?? 'NVIDIA GPU',
          loadPct: num(load),
          tempC: temp !== undefined && Number.isFinite(Number(temp)) ? Number(temp) : null,
          vramUsedMB: num(used),
          vramTotalMB: num(total),
          driver: driver ?? ''
        })
      }
    )
  }).finally(() => {
    inFlight = null
  })
  return inFlight
}
