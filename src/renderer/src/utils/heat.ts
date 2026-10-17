/**
 * Load-to-colour scale for per-thread bars, in the single orange family: idle threads are a
 * dim ember, busy ones a bright amber-to-orange gradient. Height carries the exact value.
 */
export function heatGradient(load: number): string {
  const t = Math.max(0, Math.min(100, load)) / 100
  const alpha = (0.35 + t * 0.65).toFixed(2)
  return `linear-gradient(to top, rgba(237, 84, 27, ${alpha}), rgba(255, 181, 71, ${alpha}))`
}
