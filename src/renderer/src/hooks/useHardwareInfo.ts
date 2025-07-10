import { useState } from 'react'

export function useHardwareInfo<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const stored = localStorage.getItem(key)
  const [value, setValue] = useState<T>(() => {
    return stored ? JSON.parse(stored) : initialValue
  })

  const setStoredValue = (val: T): void => {
    setValue(val)
    localStorage.setItem(key, JSON.stringify(val))
  }

  return [value, setStoredValue]
}
