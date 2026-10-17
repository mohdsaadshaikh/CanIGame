import si from 'systeminformation'
import type { HardwareInfo } from '@shared/types/hardware'

const BYTES_PER_GB = 1024 ** 3

const toGB = (bytes: number): number => Math.round((bytes / BYTES_PER_GB) * 100) / 100

export async function getHardwareInfo(): Promise<HardwareInfo> {
  try {
    const [cpu, memory, graphics, osInfo, system] = await Promise.all([
      si.cpu(),
      si.mem(),
      si.graphics(),
      si.osInfo(),
      si.system()
    ])

    const cpuInfo = {
      brand: cpu.brand || 'Unknown',
      manufacturer: cpu.manufacturer || 'Unknown',
      model: cpu.model || 'Unknown',
      cores: cpu.cores || 0,
      physicalCores: cpu.physicalCores || 0,
      processors: cpu.processors || 1,
      speed: cpu.speed || 0,
      speedMax: cpu.speedMax || 0,
      speedMin: cpu.speedMin || 0
    }

    const memoryInfo = {
      total: toGB(memory.total),
      free: toGB(memory.free),
      used: toGB(memory.used),
      active: toGB(memory.active),
      available: toGB(memory.available)
    }

    const gpuInfo = graphics.controllers.map((controller) => ({
      vendor: controller.vendor || 'Unknown',
      model: controller.model || 'Unknown',
      vram: controller.vram || 0
    }))

    const osDetails = {
      platform: osInfo.platform || 'Unknown',
      hostname: osInfo.hostname || 'Unknown'
    }

    const systemInfo = {
      manufacturer: system.manufacturer || 'Unknown',
      model: system.model || 'Unknown',
      version: system.version || 'Unknown'
    }

    return {
      cpu: cpuInfo,
      memory: memoryInfo,
      gpu: gpuInfo,
      os: osDetails,
      system: systemInfo
    }
  } catch (error) {
    console.error('Error gathering hardware information:', error)
    throw new Error('Failed to retrieve hardware information')
  }
}
