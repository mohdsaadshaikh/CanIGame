/**
 * RAWG stores PC requirements as one run-on string, e.g.
 * "Minimum:OS: Windows 10Processor: Intel i5Memory: 8 GB RAMGraphics: GTX 1060…".
 * This splits that blob into labelled lines for display. It is also the seed of the
 * structured parser the "can I run it" comparison will need.
 */

const SECTION_LABELS = [
  'OS',
  'Processor',
  'Memory',
  'Graphics',
  'DirectX',
  'Storage',
  'Network',
  'Sound Card',
  'Additional Notes'
] as const

export type RequirementLabel = (typeof SECTION_LABELS)[number]

export interface RequirementLine {
  label: RequirementLabel
  value: string
}

const LABEL_PATTERN = new RegExp(`\\s*(${SECTION_LABELS.join('|')}):\\s*`, 'g')
const TIER_PREFIX = /^\s*(Minimum|Recommended)\s*:?\s*/i

export function parseRequirements(blob: string | undefined | null): RequirementLine[] {
  if (!blob) return []

  const text = blob.replace(TIER_PREFIX, '')
  const lines: RequirementLine[] = []

  // Walk label matches; the value of each is the text up to the next label.
  const matches = [...text.matchAll(LABEL_PATTERN)]
  matches.forEach((match, index) => {
    const label = match[1] as RequirementLabel
    const start = match.index + match[0].length
    const end = index + 1 < matches.length ? matches[index + 1].index : text.length
    const value = text.slice(start, end).trim()
    if (value) lines.push({ label, value })
  })

  // No recognised labels at all: show the raw text rather than nothing.
  if (lines.length === 0 && text.trim()) {
    lines.push({ label: 'Additional Notes', value: text.trim() })
  }

  return lines
}
