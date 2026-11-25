import { useEffect, useId, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { createPortal } from 'react-dom'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { cx } from '../lib/format'
import { Select } from './Select'
import { IconButton, inputBase, usePresence } from './ui'
import { usePopover } from './usePopover'

/* Dates stay 'YYYY-MM-DD' strings in local time, exactly like the native input. */
const toIso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const fromIso = (s: string) => {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}
const addDays = (iso: string, n: number) => {
  const d = fromIso(iso)
  return toIso(new Date(d.getFullYear(), d.getMonth(), d.getDate() + n))
}
const addMonths = (iso: string, n: number) => {
  const d = fromIso(iso)
  const last = new Date(d.getFullYear(), d.getMonth() + n + 1, 0).getDate()
  return toIso(new Date(d.getFullYear(), d.getMonth() + n, Math.min(d.getDate(), last)))
}
const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export function DatePicker({
  value,
  onChange,
  min,
  invalid,
  placeholder = 'Select date',
  'aria-label': ariaLabel,
}: {
  value: string
  onChange: (value: string) => void
  min?: string
  invalid?: boolean
  placeholder?: string
  'aria-label'?: string
}) {
  const id = useId()
  const [open, setOpen] = useState(false)
  const mounted = usePresence(open, 140)
  const { trigger, popup, place } = usePopover({ open, onClose: () => setOpen(false), width: 300, height: 366, shrink: false })
  const today = toIso(new Date())
  const [focus, setFocus] = useState(today)

  const clamp = (iso: string) => (min && iso < min ? min : iso)

  const show = () => {
    setFocus(clamp(value || today))
    setOpen(true)
  }
  const close = () => {
    setOpen(false)
    trigger.current?.focus({ preventScroll: true })
  }
  const pick = (iso: string) => {
    if (min && iso < min) return
    onChange(iso)
    close()
  }

  const clear = () => {
    onChange('')
    close()
  }

  // Keep keyboard focus on the active day, unless the month buttons are being used.
  useEffect(() => {
    if (!open) return
    const inNav = popup.current?.contains(document.activeElement) && !(document.activeElement as HTMLElement).dataset.day
    if (!inNav) popup.current?.querySelector<HTMLElement>(`[data-day="${focus}"]`)?.focus({ preventScroll: true })
  }, [open, focus, popup])

  const cursor = fromIso(focus)
  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1)
  const lead = (first.getDay() + 6) % 7
  const start = addDays(toIso(first), -lead)
  const weeks = Array.from({ length: 6 }, (_, w) => Array.from({ length: 7 }, (_, d) => addDays(start, w * 7 + d)))

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      e.stopPropagation() // keep a surrounding modal or sheet open
      close()
      return
    }
    if (e.key === 'Tab') {
      // Cycle inside the calendar; a surrounding dialog's focus trap must not see this.
      e.preventDefault()
      e.stopPropagation()
      const stops = [...(popup.current?.querySelectorAll<HTMLElement>('button:not([disabled]):not([tabindex="-1"])') ?? [])]
      const i = stops.indexOf(document.activeElement as HTMLElement)
      stops[(i + (e.shiftKey ? -1 : 1) + stops.length) % stops.length]?.focus()
      return
    }
    if (!(e.target as HTMLElement).dataset.day) return
    const dow = (cursor.getDay() + 6) % 7
    const moves: Record<string, string> = {
      ArrowLeft: addDays(focus, -1),
      ArrowRight: addDays(focus, 1),
      ArrowUp: addDays(focus, -7),
      ArrowDown: addDays(focus, 7),
      Home: addDays(focus, -dow),
      End: addDays(focus, 6 - dow),
      PageUp: addMonths(focus, -1),
      PageDown: addMonths(focus, 1),
    }
    const to = moves[e.key]
    if (!to) return
    e.preventDefault()
    setFocus(clamp(to))
  }

  const label = value && fromIso(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  const prevBlocked = !!min && toIso(new Date(cursor.getFullYear(), cursor.getMonth(), 0)) < min

  return (
    <>
      <button
        ref={trigger}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={ariaLabel && `${ariaLabel}: ${label || placeholder}`}
        data-invalid={invalid || undefined}
        onClick={() => (open ? close() : show())}
        className={cx(
          inputBase,
          'flex h-10 cursor-pointer items-center gap-2 px-3 text-left focus-visible:outline-none!',
          open && 'border-ink! ring-4 ring-brand/15',
          invalid && 'border-bad-fg!',
        )}
      >
        <span className={cx('min-w-0 flex-1 truncate tabular-nums', !label && 'text-muted')}>{label || placeholder}</span>
        <Calendar size={16} className="shrink-0 text-muted" />
      </button>

      {mounted &&
        createPortal(
          <div
            ref={popup}
            role="dialog"
            aria-label={ariaLabel ?? 'Choose a date'}
            style={place.style}
            onKeyDown={onKeyDown}
            className={cx(
              'fixed z-[70] rounded-xl border border-transparent bg-white p-3 text-ink shadow-overlay',
              place.up ? 'origin-bottom' : 'origin-top',
              open ? 'animate-pop-in' : 'pointer-events-none animate-pop-out',
            )}
          >
            <div className="flex items-center justify-between">
              <IconButton size="sm" label="Previous month" disabled={prevBlocked} onClick={() => setFocus(clamp(addMonths(focus, -1)))}>
                <ChevronLeft size={16} />
              </IconButton>
              <p id={`${id}-m`} aria-live="polite" className="text-sm font-medium">
                {cursor.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
              </p>
              <IconButton size="sm" label="Next month" onClick={() => setFocus(addMonths(focus, 1))}>
                <ChevronRight size={16} />
              </IconButton>
            </div>
            <table role="grid" aria-labelledby={`${id}-m`} className="mt-1 w-full table-fixed border-collapse text-center">
              <thead>
                <tr>
                  {weekdays.map((d) => (
                    <th key={d} scope="col" abbr={d} className="h-8 text-xs font-normal text-muted">
                      {d.slice(0, 2)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {weeks.map((week) => (
                  <tr key={week[0]}>
                    {week.map((iso) => {
                      const d = fromIso(iso)
                      const outside = d.getMonth() !== cursor.getMonth()
                      const selected = iso === value
                      return (
                        <td key={iso} role="gridcell" aria-selected={selected} className="p-0">
                          <button
                            type="button"
                            data-day={iso}
                            tabIndex={iso === focus ? 0 : -1}
                            disabled={!!min && iso < min}
                            aria-current={iso === today ? 'date' : undefined}
                            aria-label={d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                            onClick={() => pick(iso)}
                            className={cx(
                              'mx-auto flex h-9 w-9 items-center justify-center rounded-lg text-[13px] tabular-nums transition-colors duration-100',
                              'disabled:cursor-not-allowed disabled:text-line-strong focus-visible:-outline-offset-2!',
                              selected ? 'bg-ink font-medium text-white' : 'enabled:hover:bg-hover',
                              !selected && outside && 'text-muted',
                              !selected && iso === today && 'font-semibold text-brand-fg',
                            )}
                          >
                            {d.getDate()}
                          </button>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-1 flex justify-between border-t border-line pt-2 text-[13px] font-medium">
              <button type="button" disabled={!value} onClick={clear} className="rounded-md px-2 py-1 text-muted hover:text-ink disabled:opacity-40">
                Clear
              </button>
              <button type="button" disabled={!!min && today < min} onClick={() => pick(today)} className="rounded-md px-2 py-1 hover:bg-hover disabled:opacity-40">
                Today
              </button>
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}

/* ---------------- Time ---------------- */

const label12 = (t: string) => {
  const [h, m] = t.split(':').map(Number)
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`
}
const quarterHours = Array.from({ length: 96 }, (_, i) => `${String(Math.floor(i / 4)).padStart(2, '0')}:${String((i % 4) * 15).padStart(2, '0')}`)

/** 'HH:MM' in, 'HH:MM' out, every 15 minutes. A saved time off that grid stays selectable. */
export function TimePicker({ value, onChange, className, 'aria-label': ariaLabel }: { value: string; onChange: (value: string) => void; className?: string; 'aria-label'?: string }) {
  const times = !value || quarterHours.includes(value) ? quarterHours : [...quarterHours, value].sort()
  return (
    <Select aria-label={ariaLabel} placeholder="Time" value={value} onChange={onChange} className={cx('tabular-nums', className)} options={times.map((t) => ({ value: t, label: label12(t) }))} />
  )
}
