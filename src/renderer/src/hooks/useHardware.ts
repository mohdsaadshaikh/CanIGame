import { useLocalStorage } from '@mantine/hooks'
import { getErrorMessage } from '@renderer/utils/errors'
import type { HardwareInfo } from '@shared/types/hardware'
import { useCallback, useEffect, useState } from 'react'

export const HARDWARE_STORAGE_KEY = 'hardware-info'

// One scan at a time across every component that asks (Home, sidebar, About PC).
let inFlight: Promise<HardwareInfo> | null = null

function requestScan(): Promise<HardwareInfo> {
  inFlight ??= window.api.getHardwareInfo().finally(() => {
    inFlight = null
  })
  return inFlight
}

interface UseHardwareResult {
  hardware: HardwareInfo | null
  scanning: boolean
  error: string | null
  /** Bumps after each successful scan; lets the UI replay its "fresh scan" moment. */
  scanCount: number
  scan: () => Promise<void>
}

/**
 * The detected rig, cached in localStorage. Mantine's `useLocalStorage` keeps every
 * consumer in sync, so a rescan on one screen updates the sidebar and the others.
 */
export function useHardware({ autoScan = false }: { autoScan?: boolean } = {}): UseHardwareResult {
  const [hardware, setHardware] = useLocalStorage<HardwareInfo | null>({
    key: HARDWARE_STORAGE_KEY,
    defaultValue: null,
    getInitialValueInEffect: false
  })
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [scanCount, setScanCount] = useState(0)

  const scan = useCallback(async () => {
    setScanning(true)
    setError(null)
    try {
      setHardware(await requestScan())
      setScanCount((n) => n + 1)
    } catch (err) {
      setError(getErrorMessage(err, 'Hardware scan failed.'))
    } finally {
      setScanning(false)
    }
  }, [setHardware])

  useEffect(() => {
    if (autoScan && hardware === null) void scan()
  }, [autoScan, hardware, scan])

  return { hardware, scanning, error, scanCount, scan }
}
