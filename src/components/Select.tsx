import { useEffect, useId, useRef, useState } from 'react'
import type { KeyboardEvent, ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Check, ChevronDown, Search } from 'lucide-react'
import { cx } from '../lib/format'
import { inputBase, usePresence } from './ui'
import { usePopover } from './usePopover'

export interface SelectOption<T extends string = string> {
  value: T
  label: string
  hint?: string
}

/**
 * Custom dropdown (replaces the native select). The list is portalled so it is never
 * clipped by sheets, modals or scrolling tables, and it opens upward when space is short.
 */
export function Select<T extends string>({
  value,
  onChange,
  options,
  placeholder = 'Select',
  searchable,
  disabled,
  invalid,
  icon,
  align = 'left',
  className,
  'aria-label': ariaLabel,
}: {
  value: T | ''
  onChange: (value: T) => void
  options: readonly (T | SelectOption<T>)[]
  placeholder?: string
  searchable?: boolean
  disabled?: boolean
  invalid?: boolean
  icon?: ReactNode
  align?: 'left' | 'right'
  className?: string
  'aria-label'?: string
}) {
  const id = useId()
  const [open, setOpen] = useState(false)
  const mounted = usePresence(open, 140)
  const [active, setActive] = useState(0)
  const [query, setQuery] = useState('')
  const { trigger, popup, place } = usePopover({ open, onClose: () => setOpen(false), align })
  const search = useRef<HTMLInputElement>(null)
  const typed = useRef({ text: '', at: 0 })

  const all = options.map((o) => (typeof o === 'string' ? { value: o, label: o, hint: undefined } : o))
  const selected = all.find((o) => o.value === value)
  const q = query.trim().toLowerCase()
  const list = q ? all.filter((o) => o.label.toLowerCase().includes(q)) : all

  const show = () => {
    setQuery('')
    setActive(Math.max(0, all.findIndex((o) => o.value === value)))
    setOpen(true)
  }
  const close = (refocus = true) => {
    setOpen(false)
    if (refocus) trigger.current?.focus({ preventScroll: true })
  }
  const pick = (i: number) => {
    const o = list[i]
    if (!o) return
    onChange(o.value)
    close()
  }

  useEffect(() => {
    // Safari does not focus buttons on click, so the list would miss its arrow keys.
    if (open) (search.current ?? trigger.current)?.focus({ preventScroll: true })
  }, [open, trigger])

  useEffect(() => {
    if (open) document.getElementById(`${id}-${active}`)?.scrollIntoView({ block: 'nearest' })
  }, [open, active, id, place.style.maxHeight]) // the height is known one render after opening

  const onKeyDown = (e: KeyboardEvent) => {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault()
        show()
      }
      return
    }
    const n = list.length
    if (e.key === 'Escape') {
      e.preventDefault()
      e.stopPropagation() // keep a surrounding modal or sheet open
      close()
    } else if (e.key === 'Tab') {
      close()
    } else if (e.key === 'Enter' || (e.key === ' ' && !searchable)) {
      e.preventDefault()
      pick(active)
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      if (n) setActive((a) => (a + (e.key === 'ArrowDown' ? 1 : -1) + n) % n)
    } else if (!searchable && (e.key === 'Home' || e.key === 'End')) {
      e.preventDefault()
      setActive(e.key === 'Home' ? 0 : n - 1)
    } else if (!searchable && e.key.length === 1) {
      const now = Date.now()
      typed.current = { text: (now - typed.current.at < 600 ? typed.current.text : '') + e.key.toLowerCase(), at: now }
      const i = list.findIndex((o) => o.label.toLowerCase().startsWith(typed.current.text))
      if (i >= 0) setActive(i)
    }
  }

  const combobox = {
    role: 'combobox',
    'aria-haspopup': 'listbox' as const,
    'aria-expanded': open,
    'aria-controls': `${id}-list`,
    'aria-activedescendant': open && list.length ? `${id}-${active}` : undefined,
  }

  return (
    <>
      <button
        ref={trigger}
        type="button"
        {...combobox}
        aria-label={ariaLabel && `${ariaLabel}: ${selected?.label ?? placeholder}`}
        aria-invalid={invalid || undefined}
        disabled={disabled}
        onClick={() => (open ? close() : show())}
        onKeyDown={onKeyDown}
        className={cx(
          inputBase,
          'flex h-10 cursor-pointer items-center gap-2 pl-3 pr-2.5 text-left',
          open && 'border-ink! ring-4 ring-brand/15',
          className,
        )}
      >
        {icon && <span className="shrink-0 text-muted">{icon}</span>}
        <span className={cx('min-w-0 flex-1 truncate', !selected && 'text-muted')}>{selected?.label ?? placeholder}</span>
        <ChevronDown size={16} className={cx('shrink-0 text-muted transition-transform duration-200 ease-snappy', open && 'rotate-180')} />
      </button>

      {mounted &&
        createPortal(
          <div
            ref={popup}
            style={place.style}
            onKeyDown={onKeyDown}
            className={cx(
              'fixed z-[70] flex max-w-[min(360px,calc(100vw-24px))] flex-col overflow-hidden rounded-xl border border-transparent bg-white font-sans text-ink shadow-overlay',
              place.up ? 'origin-bottom' : 'origin-top',
              open ? 'animate-pop-in' : 'pointer-events-none animate-pop-out',
            )}
          >
            {searchable && (
              <div className="relative shrink-0 border-b border-line">
                <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-subtle" />
                <input
                  ref={search}
                  {...combobox}
                  aria-label="Search options"
                  placeholder="Search"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value)
                    setActive(0)
                  }}
                  className="h-11 w-full bg-transparent pl-9 pr-3 text-base outline-none placeholder:text-muted sm:text-sm"
                />
              </div>
            )}
            <div id={`${id}-list`} role="listbox" aria-label={ariaLabel ?? placeholder} className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-1">
              {list.map((o, i) => (
                <div
                  key={o.value}
                  id={`${id}-${i}`}
                  role="option"
                  aria-selected={o.value === value}
                  onPointerDown={(e) => e.preventDefault()}
                  onPointerMove={() => active !== i && setActive(i)}
                  onClick={() => pick(i)}
                  className={cx('flex min-h-10 cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 text-sm', i === active && 'bg-hover')}
                >
                  <span className={cx('min-w-0 flex-1', o.value === value && 'font-medium')}>
                    {o.label}
                    {o.hint && <span className="block text-xs font-normal text-muted">{o.hint}</span>}
                  </span>
                  {o.value === value && <Check size={16} className="shrink-0" />}
                </div>
              ))}
              {list.length === 0 && <p className="px-2.5 py-3 text-sm text-muted">No matches for “{query}”</p>}
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}
