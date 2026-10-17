import { useLocalStorage } from '@mantine/hooks'
import { getErrorMessage } from '@renderer/utils/errors'
import type { SystemDetails } from '@shared/types/hardware'
import { useCallback, useEffect, useState } from 'react'

// One scan at a time across the app; the probe is slow (about 15s on Windows).
let inFlight: Promise<SystemDetails> | null = null

function requestDetails(): Promise<SystemDetails> {
  inFlight ??= window.api.getSystemDetails().finally(() => {
    inFlight = null
  })
  return inFlight
}

interface UseSystemDetailsResult {
  details: SystemDetails | null
  scanning: boolean
  error: string | null
  scan: () => Promise<void>
}

/** Memory sticks, drives, displays, board, BIOS, battery: cached, re-read on rescan. */
export function useSystemDetails({ autoScan = false } = {}): UseSystemDetailsResult {
  const [details, setDetails] = useLocalStorage<SystemDetails | null>({
    key: 'system-details',
    defaultValue: null,
    getInitialValueInEffect: false
  })
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const scan = useCallback(async () => {
    setScanning(true)
    setError(null)
    try {
      setDetails(await requestDetails())
    } catch (err) {
      setError(getErrorMessage(err, 'Could not read hardware details.'))
    } finally {
      setScanning(false)
    }
  }, [setDetails])

  useEffect(() => {
    if (autoScan && details === null) void scan()
  }, [autoScan, details, scan])

  return { details, scanning, error, scan }
}
