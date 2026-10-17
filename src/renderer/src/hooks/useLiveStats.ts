import type { LiveGpuStats, LiveStats } from '@shared/types/hardware'
import { useEffect, useRef, useState } from 'react'

const CPU_INTERVAL_MS = 2000
// nvidia-smi takes ~1-3s per call; poll it less often and never overlap calls.
const GPU_INTERVAL_MS = 4000
const HISTORY = 40

export interface LiveHistory {
  cpu: number[]
  mem: number[]
  gpu: number[]
}

interface UseLiveStatsResult {
  stats: LiveStats | null
  gpu: LiveGpuStats | null
  history: LiveHistory
}

const push = (list: number[], value: number): number[] => [...list.slice(-(HISTORY - 1)), value]

/**
 * Polls CPU/memory and (NVIDIA) GPU readings while `enabled` and the window is visible.
 * Each poll waits for the previous one, so slow probes never stack up.
 */
export function useLiveStats(enabled: boolean): UseLiveStatsResult {
  const [stats, setStats] = useState<LiveStats | null>(null)
  const [gpu, setGpu] = useState<LiveGpuStats | null>(null)
  const [history, setHistory] = useState<LiveHistory>({ cpu: [], mem: [], gpu: [] })
  const gpuAvailable = useRef(true)

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    let cpuTimer: ReturnType<typeof setTimeout> | undefined
    let gpuTimer: ReturnType<typeof setTimeout> | undefined

    const pollCpu = async (): Promise<void> => {
      if (!document.hidden) {
        try {
          const next = await window.api.getLiveStats()
          if (cancelled) return
          setStats(next)
          setHistory((h) => ({
            ...h,
            cpu: push(h.cpu, next.cpuLoad),
            mem: push(h.mem, next.memTotalGB > 0 ? (next.memUsedGB / next.memTotalGB) * 100 : 0)
          }))
        } catch {
          // A missed reading is fine; try again next tick.
        }
      }
      if (!cancelled) cpuTimer = setTimeout(() => void pollCpu(), CPU_INTERVAL_MS)
    }

    const pollGpu = async (): Promise<void> => {
      if (!gpuAvailable.current) return
      if (!document.hidden) {
        try {
          const next = await window.api.getLiveGpu()
          if (cancelled) return
          if (!next) {
            gpuAvailable.current = false
            return
          }
          setGpu(next)
          setHistory((h) => ({ ...h, gpu: push(h.gpu, next.loadPct) }))
        } catch {
          // Try again next tick.
        }
      }
      if (!cancelled) gpuTimer = setTimeout(() => void pollGpu(), GPU_INTERVAL_MS)
    }

    void pollCpu()
    void pollGpu()
    return () => {
      cancelled = true
      clearTimeout(cpuTimer)
      clearTimeout(gpuTimer)
    }
  }, [enabled])

  return { stats, gpu, history }
}
