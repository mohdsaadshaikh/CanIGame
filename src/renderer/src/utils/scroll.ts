/**
 * The app scrolls inside AppShell's <main> (see Layout.module.css), not the window.
 * Anything that reads or sets scroll position goes through here.
 */
export function scrollRoot(): HTMLElement | null {
  return document.querySelector('main')
}

export function getScrollTop(): number {
  return scrollRoot()?.scrollTop ?? 0
}

export function scrollToTop(top = 0): void {
  scrollRoot()?.scrollTo({ top, behavior: 'instant' })
}
