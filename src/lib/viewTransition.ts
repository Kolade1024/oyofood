import type { CSSProperties } from 'react'
import { flushSync } from 'react-dom'

type ViewTransitionDocument = Document & { startViewTransition?: (update: () => void) => unknown }

/**
 * Runs a state update inside a View Transition so list cards that carry `listCard()`
 * slide into their new place. Falls back to a plain update when unsupported or when
 * the user prefers reduced motion.
 */
export function withViewTransition(update: () => void) {
  const doc = document as ViewTransitionDocument
  if (!doc.startViewTransition || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    update()
    return
  }
  doc.startViewTransition(() => flushSync(update))
}

/** Style that names a card for view transitions. `id` must be unique on the page. */
export const listCard = (id: string) =>
  ({ viewTransitionName: `card-${id.replace(/[^\w-]/g, '')}`, viewTransitionClass: 'list-card' }) as CSSProperties
