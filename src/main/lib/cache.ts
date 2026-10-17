import { app } from 'electron'
import { createHash } from 'crypto'
import { promises as fs } from 'fs'
import { join } from 'path'

/**
 * Stale-while-revalidate cache for RAWG responses, in memory and on disk
 * (`<userData>/rawg-cache`), so results survive restarts and repeat views are instant.
 *
 * - fresh   (age < freshMs):    returned as is, no network.
 * - stale   (age < maxStaleMs): returned immediately; a background refresh updates the cache.
 * - expired or missing:         fetched; on failure the last copy (any age) is served so the
 *                               app still works offline.
 */

export interface CachePolicy {
  freshMs: number
  maxStaleMs: number
}

interface Entry<T> {
  savedAt: number
  data: T
}

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

export const CACHE_POLICIES = {
  list: { freshMs: 30 * MINUTE, maxStaleMs: 3 * DAY },
  search: { freshMs: DAY, maxStaleMs: 7 * DAY },
  details: { freshMs: DAY, maxStaleMs: 30 * DAY }
} satisfies Record<string, CachePolicy>

/** Disk entries older than this are deleted at startup. */
const DISK_RETENTION_MS = 30 * DAY
const MAX_MEMORY_ENTRIES = 300

const memory = new Map<string, Entry<unknown>>()
const inFlight = new Map<string, Promise<unknown>>()

const cacheDir = (): string => join(app.getPath('userData'), 'rawg-cache')
const fileFor = (key: string): string =>
  join(cacheDir(), `${createHash('sha1').update(key).digest('hex')}.json`)

/** Least-recently-used: re-inserting moves a key to the end; the oldest falls off the front. */
function remember(key: string, entry: Entry<unknown>): void {
  memory.delete(key)
  memory.set(key, entry)
  if (memory.size > MAX_MEMORY_ENTRIES) {
    const oldest = memory.keys().next().value
    if (oldest !== undefined) memory.delete(oldest)
  }
}

async function readDisk<T>(key: string): Promise<Entry<T> | null> {
  try {
    return JSON.parse(await fs.readFile(fileFor(key), 'utf8')) as Entry<T>
  } catch {
    return null
  }
}

async function writeDisk(key: string, entry: Entry<unknown>): Promise<void> {
  try {
    await fs.mkdir(cacheDir(), { recursive: true })
    await fs.writeFile(fileFor(key), JSON.stringify(entry))
  } catch (error) {
    console.warn('[cache] write failed:', error)
  }
}

function refresh<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const pending = inFlight.get(key) as Promise<T> | undefined
  if (pending) return pending

  const request = fetcher()
    .then((data) => {
      const entry: Entry<T> = { savedAt: Date.now(), data }
      remember(key, entry)
      void writeDisk(key, entry)
      return data
    })
    .finally(() => inFlight.delete(key))

  inFlight.set(key, request)
  return request
}

export async function cached<T>(
  key: string,
  policy: CachePolicy,
  fetcher: () => Promise<T>
): Promise<T> {
  const entry = (memory.get(key) as Entry<T> | undefined) ?? (await readDisk<T>(key))
  if (entry) remember(key, entry)
  const age = entry ? Date.now() - entry.savedAt : Infinity

  if (entry && age < policy.freshMs) return entry.data

  if (entry && age < policy.maxStaleMs) {
    refresh(key, fetcher).catch((error) =>
      console.warn('[cache] background refresh failed:', error)
    )
    return entry.data
  }

  try {
    return await refresh(key, fetcher)
  } catch (error) {
    if (entry) return entry.data
    throw error
  }
}

/** Deletes on-disk entries past the retention window. Safe to call without awaiting. */
export async function pruneCache(): Promise<void> {
  try {
    const dir = cacheDir()
    const now = Date.now()
    for (const name of await fs.readdir(dir)) {
      const file = join(dir, name)
      const { mtimeMs } = await fs.stat(file)
      if (now - mtimeMs > DISK_RETENTION_MS) await fs.unlink(file)
    }
  } catch {
    // No cache directory yet: nothing to prune.
  }
}

/** Empties the memory and disk caches. Returns the number of disk entries removed. */
export async function clearCache(): Promise<number> {
  memory.clear()
  try {
    const dir = cacheDir()
    const names = await fs.readdir(dir)
    await Promise.all(names.map((name) => fs.unlink(join(dir, name))))
    return names.length
  } catch {
    return 0
  }
}
