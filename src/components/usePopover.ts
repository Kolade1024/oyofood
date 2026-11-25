import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'

/**
 * Positions a portalled popup under (or above) its trigger, keeps it there on scroll
 * and resize, and closes it on an outside press.
 * `height` is the room the popup wants; `width` clamps it inside the viewport.
 */
export function usePopover({ open, onClose, align = 'left', width = 0, height = 300, shrink = true }: {
  open: boolean
  onClose: () => void
  align?: 'left' | 'right'
  width?: number
  height?: number
  /** Cap the popup's height to the available space (lists scroll, calendars do not). */
  shrink?: boolean
}) {
  const trigger = useRef<HTMLButtonElement>(null)
  const popup = useRef<HTMLDivElement>(null)
  const [place, setPlace] = useState<{ style: CSSProperties; up: boolean }>({ style: {}, up: false })
  const onCloseRef = useRef(onClose)
  useLayoutEffect(() => {
    onCloseRef.current = onClose
  })

  const measure = useCallback(() => {
    const r = trigger.current?.getBoundingClientRect()
    if (!r) return
    const vw = document.documentElement.clientWidth
    const vh = window.innerHeight
    const below = vh - r.bottom - 14
    const above = r.top - 14
    const up = below < (shrink ? 220 : height) && above > below
    const x: CSSProperties = align === 'right' ? { right: vw - r.right } : { left: Math.max(12, Math.min(r.left, vw - width - 12)) }
    // A calendar that fits neither side is pulled into view instead of being cut off.
    const y: CSSProperties =
      !shrink && Math.max(above, below) < height
        ? { top: Math.max(8, (vh - height) / 2) }
        : up
          ? { bottom: vh - r.top + 6 }
          : { top: r.bottom + 6 }
    setPlace({ up, style: { ...x, ...y, ...(shrink ? { minWidth: r.width, maxHeight: Math.min(height, up ? above : below) } : { width }) } })
  }, [align, width, height, shrink])

  useLayoutEffect(() => {
    if (!open) return
    measure()
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node
      if (!popup.current?.contains(t) && !trigger.current?.contains(t)) onCloseRef.current()
    }
    const onScroll = (e: Event) => {
      // Scrolling the list itself must not re-measure.
      if (!popup.current?.contains(e.target as Node)) measure()
    }
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', measure)
    document.addEventListener('pointerdown', onDown)
    return () => {
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', measure)
      document.removeEventListener('pointerdown', onDown)
    }
  }, [open, measure])

  return { trigger, popup, place }
}
