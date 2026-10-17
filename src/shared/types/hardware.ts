export interface CPUInfo {
  brand: string
  manufacturer: string
  model: string
  cores: number
  physicalCores: number
  processors: number
  /** GHz */
  speed: number
  /** GHz */
  speedMax: number
  /** GHz */
  speedMin: number
}

/** All values in GB, rounded to 2 decimals. */
export interface MemoryInfo {
  total: number
  free: number
  used: number
  active: number
  available: number
}

export interface GPUInfo {
  vendor: string
  model: string
  /** MB. `systeminformation` reports 0 when the driver does not expose it. */
  vram: number
}

export interface OSInfo {
  platform: string
  hostname: string
}

export interface SystemInfo {
  manufacturer: string
  model: string
  version: string
}

export interface HardwareInfo {
  cpu: CPUInfo
  memory: MemoryInfo
  gpu: GPUInfo[]
  os: OSInfo
  system: SystemInfo
}

// ---------------------------------------------------------------------------
// Extended details (slow scan, cached) and live readings (polled)
// ---------------------------------------------------------------------------

export interface MemoryModule {
  sizeGB: number
  type: string
  clockMHz: number
  formFactor: string
  slot: string
}

export interface StorageDrive {
  name: string
  type: string
  interface: string
  sizeGB: number
}

export interface StorageVolume {
  mount: string
  sizeGB: number
  usedGB: number
}

export interface DisplayInfo {
  model: string
  width: number
  height: number
  refreshHz: number
  main: boolean
}

export interface SystemDetails {
  cpu: {
    socket: string
    /** Bytes; 0 when unknown. */
    cacheL2: number
    cacheL3: number
    virtualization: boolean
    performanceCores: number
    efficiencyCores: number
  }
  /** NVIDIA driver version via nvidia-smi, when available. */
  gpuDriver: string | null
  memoryModules: MemoryModule[]
  drives: StorageDrive[]
  volumes: StorageVolume[]
  displays: DisplayInfo[]
  os: { distro: string; release: string; build: string; arch: string }
  board: { manufacturer: string; model: string }
  bios: { vendor: string; version: string; releaseDate: string }
  battery: { present: boolean; percent: number; charging: boolean }
}

export interface LiveStats {
  /** 0-100 */
  cpuLoad: number
  coreLoads: number[]
  /** null when the OS doesn't expose it (common on Windows without admin rights). */
  cpuTempC: number | null
  memUsedGB: number
  memTotalGB: number
}

export interface LiveGpuStats {
  name: string
  loadPct: number
  tempC: number | null
  vramUsedMB: number
  vramTotalMB: number
}
