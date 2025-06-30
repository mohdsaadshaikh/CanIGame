export interface CPUInfo {
  brand: string
  manufacturer: string
  model: string
  cores: number
  physicalCores: number
  processors: number
  speed: number
  speedMax: number
  speedMin: number
}

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
