import type { GPUInfo, HardwareInfo } from '@shared/types/hardware'

/** The GPU with the most VRAM: on laptops that is the discrete card, not the iGPU. */
export function primaryGpu(gpus: GPUInfo[]): GPUInfo | undefined {
  return [...gpus].sort((a, b) => b.vram - a.vram)[0]
}

export function otherGpus(gpus: GPUInfo[]): GPUInfo[] {
  const primary = primaryGpu(gpus)
  return gpus.filter((gpu) => gpu !== primary)
}

export const formatGHz = (ghz: number): string => (ghz > 0 ? ghz.toFixed(2) : 'n/a')

export function clockRange(cpu: HardwareInfo['cpu']): string {
  const max = cpu.speedMax > cpu.speed ? cpu.speedMax : 0
  return max ? `${formatGHz(cpu.speed)}-${formatGHz(max)} GHz` : `${formatGHz(cpu.speed)} GHz`
}

export const formatVram = (mb: number): string =>
  mb > 0 ? `${mb.toLocaleString('en-US')} MB` : 'Not reported'

/** Marketing capacity (16 GB) from the usable figure the OS reports (15.83 GB). */
export const nominalMemory = (gb: number): string => `${Math.round(gb)} GB`

/** Drop the (R)/(TM)/®/™ marks vendors bake into part names; enthusiasts read the model. */
export function cleanPartName(name: string): string {
  return name
    .replace(/\((?:R|TM|C)\)|[®™©]/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

/** "Intel Core i7-9850H" without doubling the vendor when the brand already has it. */
export function cpuName(cpu: HardwareInfo['cpu']): string {
  const brand = cleanPartName(cpu.brand)
  return brand.toLowerCase().startsWith(cpu.manufacturer.toLowerCase())
    ? brand
    : `${cpu.manufacturer} ${brand}`
}
