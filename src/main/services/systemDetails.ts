import si from 'systeminformation'
import type { SystemDetails } from '@shared/types/hardware'
import { readNvidiaGpu } from './nvidia'

const toGB = (bytes: number): number => Math.round((bytes / 1024 ** 3) * 100) / 100

/** Settles to `fallback` instead of rejecting, so one failing probe can't sink the scan. */
function safe<T>(promise: Promise<T>, fallback: T): Promise<T> {
  return promise.catch((error: unknown) => {
    console.warn('[systemDetails] probe failed:', error)
    return fallback
  })
}

/** JEDEC hex codes like "008000000080" aren't a readable name; drop them. */
function readable(value: string | undefined): string {
  return value && !/^[0-9A-F]{8,}$/i.test(value.trim()) ? value.trim() : ''
}

/**
 * The full hardware picture for About PC. Slow on Windows (about 15s of WMI queries), so
 * the renderer caches it and only re-runs it on an explicit rescan.
 */
export async function getSystemDetails(): Promise<SystemDetails> {
  const [cpu, layout, disks, fs, graphics, os, board, bios, battery, nvidia] = await Promise.all([
    safe(si.cpu(), null),
    safe(si.memLayout(), []),
    safe(si.diskLayout(), []),
    safe(si.fsSize(), []),
    safe(si.graphics(), null),
    safe(si.osInfo(), null),
    safe(si.baseboard(), null),
    safe(si.bios(), null),
    safe(si.battery(), null),
    safe(readNvidiaGpu(), null)
  ])

  return {
    cpu: {
      socket: cpu?.socket ?? '',
      cacheL2: cpu?.cache?.l2 ?? 0,
      cacheL3: cpu?.cache?.l3 ?? 0,
      virtualization: cpu?.virtualization ?? false,
      performanceCores: cpu?.performanceCores ?? 0,
      efficiencyCores: cpu?.efficiencyCores ?? 0
    },
    gpuDriver: nvidia?.driver || null,
    memoryModules: layout
      .filter((module) => module.size > 0)
      .map((module) => ({
        sizeGB: toGB(module.size),
        type: module.type || '',
        clockMHz: module.clockSpeed || 0,
        formFactor: readable(module.formFactor),
        slot: readable(module.bank)
      })),
    drives: disks.map((disk) => ({
      name: disk.name || 'Drive',
      type: disk.type || '',
      interface: disk.interfaceType || '',
      sizeGB: toGB(disk.size)
    })),
    volumes: fs
      .filter((volume) => volume.size > 0)
      .map((volume) => ({
        mount: volume.mount,
        sizeGB: toGB(volume.size),
        usedGB: toGB(volume.used)
      })),
    displays: (graphics?.displays ?? []).map((display) => ({
      model: display.model || '',
      width: display.currentResX ?? 0,
      height: display.currentResY ?? 0,
      refreshHz: display.currentRefreshRate ?? 0,
      main: Boolean(display.main)
    })),
    os: {
      distro: os?.distro ?? '',
      release: os?.release ?? '',
      build: os?.build ?? '',
      arch: os?.arch ?? ''
    },
    board: { manufacturer: board?.manufacturer ?? '', model: board?.model ?? '' },
    bios: {
      vendor: bios?.vendor ?? '',
      version: bios?.version ?? '',
      releaseDate: bios?.releaseDate ?? ''
    },
    battery: {
      present: battery?.hasBattery ?? false,
      percent: battery?.percent ?? 0,
      charging: battery?.isCharging ?? false
    }
  }
}
