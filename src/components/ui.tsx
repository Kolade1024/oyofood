import { forwardRef, useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  KeyboardEvent as ReactKeyboardEvent,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react'
import { Check, ChevronDown, CircleAlert, CircleCheck, Info, LoaderCircle, Search, TrendingDown, TrendingUp, X } from 'lucide-react'
import { cx, initials } from '../lib/format'
import { useApp } from '../context/AppContext'

/* ============================================================================
 * Brand
 * ========================================================================== */

export function LogoMark({ size = 56, round = false }: { size?: number; round?: boolean }) {
  return (
    <div
      className={cx('flex shrink-0 flex-col items-center justify-center bg-white shadow-sm', round ? 'rounded-full' : 'rounded-2xl')}
      style={{ width: size, height: size }}
    >
      <span className="font-display font-bold leading-none text-brand" style={{ fontSize: size * 0.34 }}>
        OYO
      </span>
      <span className="mt-[3px] flex gap-[3px]">
        {[0, 1, 2].map((i) => (
          <span key={i} className="rounded-full bg-ok" style={{ width: size * 0.09, height: size * 0.09 }} />
        ))}
      </span>
    </div>
  )
}

export function BrandBadge({ size = 40 }: { size?: number }) {
  return (
    <div
      aria-hidden
      className="flex shrink-0 flex-col items-center justify-center rounded-[10px] bg-brand"
      style={{ width: size, height: size }}
    >
      <span className="font-display font-bold leading-none text-white" style={{ fontSize: size * 0.32 }}>
        OYO
      </span>
      <span className="mt-[2px] flex gap-[2px]">
        {[0, 1, 2].map((i) => (
          <span key={i} className="rounded-full bg-white/90" style={{ width: size * 0.08, height: size * 0.08 }} />
        ))}
      </span>
    </div>
  )
}

/* ============================================================================
 * Buttons
 * ========================================================================== */

type Variant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'danger'
  | 'dangerSoft'
  | 'success'
  // legacy aliases (auth & onboarding)
  | 'dark'
  | 'outline'
  | 'brand'
  | 'pill'
  | 'okSoft'

const variantClass: Record<Variant, string> = {
  primary: 'bg-ink text-white shadow-[inset_0_1px_0_oklch(1_0_0/0.12),0_1px_2px_oklch(0_0_0/0.12)] hover:bg-[#252c3a]',
  secondary:
    'border border-line-strong bg-white text-ink shadow-[0_1px_2px_oklch(0_0_0/0.04)] hover:border-subtle hover:bg-canvas',
  ghost: 'text-ink hover:bg-hover',
  danger: 'bg-[#dc2626] text-white shadow-[inset_0_1px_0_oklch(1_0_0/0.15),0_1px_2px_oklch(0_0_0/0.12)] hover:bg-bad-fg',
  dangerSoft: 'border border-line-strong bg-white text-bad-fg hover:border-red-200 hover:bg-bad-50',
  success: 'bg-ok-50 text-ok-fg ring-1 ring-inset ring-emerald-200 hover:bg-emerald-100',
  dark: '',
  outline: '',
  brand: '',
  pill: '',
  okSoft: '',
}
variantClass.dark = variantClass.primary
variantClass.brand = variantClass.primary
variantClass.outline = variantClass.secondary
variantClass.pill = variantClass.secondary
variantClass.okSoft = variantClass.success

/* Icon side gets 2px less padding so the label looks optically centred. */
const sizeClass = {
  sm: 'h-8 gap-1.5 rounded-lg px-3 text-[13px] has-[>svg:first-child]:pl-2.5 has-[>svg:last-child]:pr-2.5',
  md: 'h-10 gap-2 rounded-lg px-4 text-sm has-[>svg:first-child]:pl-3.5 has-[>svg:last-child]:pr-3.5',
  lg: 'h-12 gap-2 rounded-xl px-6 text-[15px] has-[>svg:first-child]:pl-5 has-[>svg:last-child]:pr-5',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: keyof typeof sizeClass
  icon?: ReactNode
  iconRight?: ReactNode
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', icon, iconRight, loading, className, children, disabled, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cx(
        'relative inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap font-medium',
        'transition-[background-color,border-color,color,box-shadow,scale] duration-[160ms] ease-snappy motion-safe:active:scale-[0.97]',
        'disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0',
        variantClass[variant],
        sizeClass[size],
        className,
      )}
      {...rest}
    >
      {loading ? <LoaderCircle size={16} className="animate-spin" /> : icon}
      {children}
      {!loading && iconRight}
    </button>
  )
})

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  size?: 'sm' | 'md'
  variant?: 'ghost' | 'secondary' | 'dangerGhost'
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, size = 'md', variant = 'ghost', className, children, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      title={label}
      className={cx(
        'inline-flex shrink-0 items-center justify-center rounded-lg text-muted transition-[background-color,color,scale] duration-[160ms] ease-snappy motion-safe:active:scale-95',
        'disabled:pointer-events-none disabled:opacity-40',
        size === 'sm' ? 'h-8 w-8' : 'h-10 w-10',
        variant === 'ghost' && 'hover:bg-hover hover:text-ink',
        variant === 'secondary' && 'border border-line-strong bg-white shadow-[0_1px_2px_oklch(0_0_0/0.04)] hover:bg-canvas hover:text-ink',
        variant === 'dangerGhost' && 'hover:bg-bad-50 hover:text-bad-fg',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
})

/* ============================================================================
 * Form controls
 * ========================================================================== */

export function Field({
  label,
  required,
  optional,
  hint,
  error,
  aside,
  children,
  className,
}: {
  label?: ReactNode
  required?: boolean
  optional?: boolean
  hint?: ReactNode
  error?: string
  aside?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <label className={cx('block', className)}>
      {label && (
        <span className="mb-1.5 flex items-center justify-between gap-2 text-[13px] font-medium text-ink">
          <span>
            {label}
            {required && (
              <span aria-hidden className="ml-0.5 text-brand-fg">
                *
              </span>
            )}
            {optional && <span className="ml-1 font-normal text-muted">(optional)</span>}
          </span>
          {aside && <span className="text-xs font-normal text-muted">{aside}</span>}
        </span>
      )}
      {children}
      {error ? (
        <span role="alert" className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-bad-fg">
          <CircleAlert size={13} className="shrink-0" /> {error}
        </span>
      ) : (
        hint && <span className="mt-1.5 block text-xs text-muted">{hint}</span>
      )}
    </label>
  )
}

/* 16px text on mobile prevents iOS zoom-on-focus. */
export const inputBase =
  'w-full rounded-lg border border-field bg-white text-base text-ink placeholder:text-subtle outline-none transition-[border-color,box-shadow] duration-150 sm:text-sm ' +
  'hover:border-muted focus:border-ink focus:ring-4 focus:ring-brand/15 ' +
  'disabled:cursor-not-allowed disabled:bg-canvas disabled:text-muted ' +
  'aria-invalid:border-bad-fg aria-invalid:focus:ring-bad/15'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode
  right?: ReactNode
  invalid?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { icon, right, invalid, className, ...rest },
  ref,
) {
  return (
    <div className="relative">
      {icon && <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-subtle">{icon}</span>}
      <input
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cx(inputBase, 'h-10', icon ? 'pl-10' : 'pl-3', right ? 'pr-12' : 'pr-3', className)}
        {...rest}
      />
      {right && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] text-muted">{right}</span>}
    </div>
  )
})

export function Select({ className, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select className={cx(inputBase, 'h-10 cursor-pointer appearance-none pl-3 pr-9', className)} {...rest}>
        {children}
      </select>
      <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
    </div>
  )
}

export function Textarea({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cx(inputBase, 'min-h-[88px] resize-y px-3 py-2.5 leading-6', className)} {...rest} />
}

export function PhoneInput({
  value,
  onChange,
  placeholder = '080 1234 5678',
  invalid,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  invalid?: boolean
}) {
  return (
    <div className="flex gap-2">
      <div className="flex h-10 shrink-0 items-center gap-2 rounded-lg border border-field bg-canvas px-3 text-sm">
        <span aria-hidden className="flex h-3.5 w-5 overflow-hidden rounded-[2px] ring-1 ring-black/10">
          <span className="flex-1 bg-[#008751]" />
          <span className="flex-1 bg-white" />
          <span className="flex-1 bg-[#008751]" />
        </span>
        +234
      </div>
      <input
        inputMode="tel"
        aria-invalid={invalid || undefined}
        className={cx(inputBase, 'h-10 px-3')}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^\d ]/g, ''))}
      />
    </div>
  )
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search…',
  shortcut,
  className,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  /** Focus with the “/” key. */
  shortcut?: boolean
  className?: string
}) {
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!shortcut) return
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement
      if (e.key !== '/' || e.metaKey || e.ctrlKey || t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return
      e.preventDefault()
      ref.current?.focus()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [shortcut])

  return (
    <div className={cx('relative', className)}>
      <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-subtle" />
      <input
        ref={ref}
        type="search"
        aria-label={placeholder}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape' && value) {
            e.stopPropagation()
            onChange('')
          }
        }}
        className={cx(inputBase, 'h-9 border-line-strong pl-9 pr-9 [&::-webkit-search-cancel-button]:hidden')}
      />
      {value ? (
        <button
          type="button"
          onClick={() => {
            onChange('')
            ref.current?.focus()
          }}
          aria-label="Clear search"
          className="absolute right-1.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-muted hover:bg-hover hover:text-ink"
        >
          <X size={14} />
        </button>
      ) : (
        shortcut && (
          <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden h-5 -translate-y-1/2 items-center rounded border border-line bg-canvas px-1.5 font-sans text-[11px] text-muted sm:inline-flex">
            /
          </kbd>
        )
      )}
    </div>
  )
}

export function Toggle({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label?: string
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cx(
        'group relative inline-flex h-6 w-10 shrink-0 items-center rounded-full p-0.5 transition-colors duration-200 ease-snappy',
        'disabled:cursor-not-allowed disabled:opacity-50',
        checked ? 'bg-ink' : 'bg-gray-300 hover:bg-[#c3c7ce]',
      )}
    >
      <span
        className={cx(
          'h-5 w-5 rounded-full bg-white shadow-[0_1px_2px_oklch(0_0_0/0.2),0_0_0_0.5px_oklch(0_0_0/0.04)] transition-[translate,width] duration-200 ease-snappy',
          // While held, the thumb stretches toward the side it will travel to.
          'motion-safe:group-active:w-6',
          checked && 'translate-x-4 motion-safe:group-active:translate-x-3',
        )}
      />
    </button>
  )
}

export function Checkbox({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: ReactNode }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 text-[13px] leading-5 text-gray-700">
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cx(
          'mt-px flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border transition-colors duration-150',
          checked ? 'border-ink bg-ink text-white' : 'border-field bg-white hover:border-muted',
        )}
      >
        {checked && <Check size={12} strokeWidth={2.5} />}
      </button>
      <span>{children}</span>
    </label>
  )
}

/* ============================================================================
 * Surfaces & layout
 * ========================================================================== */

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cx('rounded-xl border border-transparent bg-white shadow-card', className)}>{children}</div>
}

export function CardHeader({
  title,
  description,
  action,
  className,
}: {
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={cx('flex items-start justify-between gap-4', className)}>
      <div className="min-w-0">
        <h2 className="text-[15px] font-semibold leading-6">{title}</h2>
        {description && <p className="mt-0.5 text-[13px] text-muted">{description}</p>}
      </div>
      {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
    </div>
  )
}

export function PageHeader({
  title,
  subtitle,
  actions,
  children,
}: {
  title: ReactNode
  subtitle?: ReactNode
  actions?: ReactNode
  children?: ReactNode
}) {
  return (
    <header className="z-20 border-b border-line bg-white lg:sticky lg:top-0">
      <div className="mx-auto flex max-w-[1320px] flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between md:px-8">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {children && <div className="mx-auto max-w-[1320px] px-4 md:px-8">{children}</div>}
    </header>
  )
}

export function PageBody({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cx('mx-auto max-w-[1320px] space-y-6 px-4 py-6 md:px-8 md:py-8', className)}>{children}</div>
}

/* ============================================================================
 * Data display
 * ========================================================================== */

type Tone = 'brand' | 'ok' | 'bad' | 'gray' | 'dark' | 'info'

const badgeTone: Record<Tone, string> = {
  brand: 'bg-brand-50 text-brand-fg',
  ok: 'bg-ok-50 text-ok-fg',
  bad: 'bg-bad-50 text-bad-fg',
  gray: 'bg-hover text-gray-700',
  dark: 'bg-ink text-white',
  info: 'bg-info-50 text-info-fg',
}

export function Badge({
  tone = 'brand',
  children,
  className,
}: {
  tone?: Tone
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={cx(
        'inline-flex h-[22px] items-center gap-1.5 whitespace-nowrap rounded-full px-2 text-xs font-medium',
        badgeTone[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}

export function StatCard({
  label,
  value,
  delta,
  trend = 'up',
  hint,
  icon,
  className,
}: {
  label: ReactNode
  value: ReactNode
  delta?: string
  trend?: 'up' | 'down'
  hint?: ReactNode
  icon?: ReactNode
  className?: string
}) {
  return (
    <Card className={cx('p-5', className)}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-[13px] font-medium text-muted">{label}</p>
        {icon && <span className="text-subtle">{icon}</span>}
      </div>
      <p className="mt-2.5 text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
      {(delta || hint) && (
        <p className="mt-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[13px] text-muted">
          {delta && (
            <span className={cx('inline-flex items-center gap-1 font-medium tabular-nums', trend === 'up' ? 'text-ok-fg' : 'text-bad-fg')}>
              {trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {delta}
            </span>
          )}
          {hint}
        </p>
      )}
    </Card>
  )
}

const meterTone = {
  brand: 'bg-brand',
  ok: 'bg-ok',
  bad: 'bg-bad',
  ink: 'bg-ink',
  gray: 'bg-gray-400',
}

export function Meter({
  value,
  tone = 'brand',
  label,
  className,
}: {
  /** 0–100 */
  value: number
  tone?: keyof typeof meterTone
  label?: string
  className?: string
}) {
  const v = Math.max(0, Math.min(100, value))
  return (
    <div
      className={cx('h-1.5 w-full overflow-hidden rounded-full bg-black/[0.06]', className)}
      {...(label
        ? { role: 'meter', 'aria-label': label, 'aria-valuenow': Math.round(v), 'aria-valuemin': 0, 'aria-valuemax': 100 }
        : { 'aria-hidden': true })}
    >
      <div className={cx('h-full rounded-full transition-[width] duration-300 ease-snappy', meterTone[tone])} style={{ width: `${v}%` }} />
    </div>
  )
}

const avatarTones = ['bg-brand-50 text-brand-fg', 'bg-ok-50 text-ok-fg', 'bg-info-50 text-info-fg', 'bg-purple-50 text-purple-700', 'bg-hover text-gray-700']

export function Avatar({ name, size = 'md', tone, className }: { name: string; size?: 'sm' | 'md' | 'lg'; tone?: 'dark'; className?: string }) {
  const hash = [...name].reduce((s, c) => s + c.charCodeAt(0), 0)
  return (
    <span
      aria-hidden
      className={cx(
        'inline-flex shrink-0 select-none items-center justify-center rounded-full font-semibold',
        size === 'sm' && 'h-7 w-7 text-[11px]',
        size === 'md' && 'h-9 w-9 text-xs',
        size === 'lg' && 'h-10 w-10 text-[13px]',
        tone === 'dark' ? 'bg-ink text-white' : avatarTones[hash % avatarTones.length],
        className,
      )}
    >
      {initials(name)}
    </span>
  )
}

export function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex gap-0.5" role="img" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = Math.max(0, Math.min(1, value - (i - 1)))
        return (
          <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
            <svg viewBox="0 0 24 24" width={size} height={size} className="absolute inset-0 text-gray-200">
              <path fill="currentColor" d="M12 2l2.9 6.9 7.1.6-5.4 4.7 1.7 7.3L12 17.8 5.7 21.5l1.7-7.3L2 9.5l7.1-.6z" />
            </svg>
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <svg viewBox="0 0 24 24" width={size} height={size} className="text-brand">
                <path fill="currentColor" d="M12 2l2.9 6.9 7.1.6-5.4 4.7 1.7 7.3L12 17.8 5.7 21.5l1.7-7.3L2 9.5l7.1-.6z" />
              </svg>
            </span>
          </span>
        )
      })}
    </span>
  )
}

export function Table({ minWidth = 720, children }: { minWidth?: number; children: ReactNode }) {
  return (
    <div className="overflow-x-auto overscroll-x-contain">
      <table className="w-full border-collapse text-left text-[13px]" style={{ minWidth }}>
        {children}
      </table>
    </div>
  )
}

export function Th({ align, className, children }: { align?: 'right'; className?: string; children?: ReactNode }) {
  return (
    <th
      scope="col"
      className={cx(
        'h-10 whitespace-nowrap border-y border-line bg-canvas px-4 text-xs font-medium text-muted first:pl-5 last:pr-5',
        align === 'right' && 'text-right',
        className,
      )}
    >
      {children}
    </th>
  )
}

export function Tr({ className, children }: { className?: string; children: ReactNode }) {
  return <tr className={cx('border-b border-line transition-colors duration-150 last:border-0 hover:bg-canvas/70', className)}>{children}</tr>
}

export function Td({ align, className, children, colSpan }: { align?: 'right'; className?: string; children?: ReactNode; colSpan?: number }) {
  return (
    <td colSpan={colSpan} className={cx('px-4 py-3.5 align-middle first:pl-5 last:pr-5', align === 'right' && 'text-right', className)}>
      {children}
    </td>
  )
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={cx('flex flex-col items-center justify-center rounded-xl border border-dashed border-line-strong px-6 py-12 text-center', className)}>
      {icon && (
        <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-transparent bg-white text-muted shadow-card">
          {icon}
        </span>
      )}
      <p className="text-sm font-medium">{title}</p>
      {description && <p className="mt-1 max-w-sm text-[13px] text-muted">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cx('rounded-md bg-black/[0.06]', className)} />
}

/* ============================================================================
 * Tabs & segmented control
 * ========================================================================== */

export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
  style = 'underline',
  label,
  className,
}: {
  tabs: { id: T; label: string; count?: number }[]
  value: T
  onChange: (id: T) => void
  /** `underline` for page sections, `segmented` for filters. `pill` / `solid` are legacy aliases of `segmented`. */
  style?: 'underline' | 'segmented' | 'pill' | 'solid'
  label?: string
  className?: string
}) {
  const seg = style !== 'underline'
  const refs = useRef<(HTMLButtonElement | null)[]>([])

  const onKey = (e: ReactKeyboardEvent, i: number) => {
    const n = tabs.length
    const next = e.key === 'ArrowRight' ? (i + 1) % n : e.key === 'ArrowLeft' ? (i - 1 + n) % n : e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : -1
    if (next < 0) return
    e.preventDefault()
    refs.current[next]?.focus()
    onChange(tabs[next].id)
  }

  return (
    <div
      role="tablist"
      aria-label={label}
      className={cx(
        'no-scrollbar flex max-w-full overflow-x-auto overflow-y-hidden',
        seg ? 'w-fit rounded-[10px] bg-black/[0.05] p-0.5' : 'gap-6 border-b border-line',
        className,
      )}
    >
      {tabs.map((t, i) => {
        const active = t.id === value
        return (
          <button
            key={t.id}
            ref={(el) => {
              refs.current[i] = el
            }}
            type="button"
            role="tab"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(t.id)}
            onKeyDown={(e) => onKey(e, i)}
            className={cx(
              'flex shrink-0 items-center gap-1.5 whitespace-nowrap font-medium transition-[color,background-color,box-shadow,border-color] duration-150',
              seg
                ? cx(
                    'h-8 rounded-lg px-3 text-[13px]',
                    active ? 'bg-white text-ink shadow-[0_0_0_1px_oklch(0_0_0/0.06),0_1px_2px_oklch(0_0_0/0.08)]' : 'text-muted hover:text-ink',
                  )
                : cx('-mb-px h-11 border-b-2 text-sm', active ? 'border-ink text-ink' : 'border-transparent text-muted hover:text-ink'),
            )}
          >
            {t.label}
            {t.count !== undefined && (
              <span
                className={cx(
                  'min-w-5 rounded-full px-1.5 text-center text-[11px] font-medium leading-[18px] tabular-nums',
                  active ? 'bg-ink text-white' : 'bg-black/[0.06] text-gray-700',
                )}
              >
                {t.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

/* ============================================================================
 * Overlays: Modal, Sheet, ConfirmDialog
 * Portal + Escape + focus trap/restore + scroll lock + enter/exit motion.
 * ========================================================================== */

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'
const overlayStack: symbol[] = []
let scrollLocks = 0

function lockScroll() {
  if (scrollLocks++ > 0) return
  const gap = window.innerWidth - document.documentElement.clientWidth
  document.documentElement.style.overflow = 'hidden'
  if (gap) document.documentElement.style.paddingRight = `${gap}px`
}
function unlockScroll() {
  if (--scrollLocks > 0) return
  document.documentElement.style.overflow = ''
  document.documentElement.style.paddingRight = ''
}

/** Keeps a component mounted for `ms` after `open` turns false so it can animate out. */
export function usePresence(open: boolean, ms = 180) {
  const [mounted, setMounted] = useState(open)
  if (open && !mounted) setMounted(true)
  useEffect(() => {
    if (open || !mounted) return
    const t = setTimeout(() => setMounted(false), ms)
    return () => clearTimeout(t)
  }, [open, mounted, ms])
  return mounted
}

/** Holds the last non-null value so a closing dialog keeps its content while it animates out. */
export function useLatchedValue<T>(value: T | null | undefined): T | null | undefined {
  const [latched, setLatched] = useState(value)
  if (value != null && value !== latched) setLatched(value)
  return value ?? latched
}

type OverlayVariant = 'center' | 'right' | 'left' | 'bare'

const panelMotion: Record<OverlayVariant, [string, string]> = {
  center: ['animate-pop-in', 'animate-pop-out'],
  bare: ['animate-pop-in', 'animate-pop-out'],
  right: ['animate-sheet-in', 'animate-sheet-out'],
  left: ['animate-drawer-in', 'animate-drawer-out'],
}

export function Overlay({
  open,
  onClose,
  variant = 'center',
  labelledBy,
  label,
  className,
  children,
}: {
  open: boolean
  onClose: () => void
  variant?: OverlayVariant
  labelledBy?: string
  label?: string
  className?: string
  children: ReactNode
}) {
  const mounted = usePresence(open, variant === 'center' || variant === 'bare' ? 140 : 190)
  const panelRef = useRef<HTMLDivElement>(null)
  // Capture the trigger during render: React applies `autoFocus` inside the dialog before effects run.
  const restoreRef = useRef<HTMLElement | null>(null)
  const [wasOpen, setWasOpen] = useState(false)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open && typeof document !== 'undefined') restoreRef.current = document.activeElement as HTMLElement | null
  }
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  })

  useEffect(() => {
    if (!open) return
    const id = Symbol('overlay')
    overlayStack.push(id)
    lockScroll()

    const raf = requestAnimationFrame(() => {
      const panel = panelRef.current
      if (panel && !panel.contains(document.activeElement)) panel.focus({ preventScroll: true })
    })

    const onKey = (e: KeyboardEvent) => {
      if (overlayStack[overlayStack.length - 1] !== id) return
      if (e.key === 'Escape') {
        e.preventDefault()
        onCloseRef.current()
        return
      }
      if (e.key !== 'Tab' || !panelRef.current) return
      const nodes = [...panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((n) => n.offsetParent !== null)
      if (!nodes.length) return
      const first = nodes[0]
      const last = nodes[nodes.length - 1]
      if (e.shiftKey && (document.activeElement === first || document.activeElement === panelRef.current)) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)

    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('keydown', onKey)
      overlayStack.splice(overlayStack.indexOf(id), 1)
      unlockScroll()
      const target = restoreRef.current
      // If the trigger is gone (e.g. the order it belonged to moved tabs), fall back to the main region.
      const fallback = document.getElementById('main')
      ;(target?.isConnected ? target : fallback)?.focus?.({ preventScroll: true })
    }
  }, [open])

  if (!mounted) return null
  const [enter, exit] = panelMotion[variant]

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div aria-hidden className={cx('absolute inset-0 bg-ink/40 backdrop-blur-[2px]', open ? 'animate-fade-in' : 'animate-fade-out')} />
      <div
        className={cx(
          'absolute inset-0 overscroll-contain',
          (variant === 'center' || variant === 'bare') && 'flex items-end justify-center overflow-y-auto p-3 sm:items-center sm:p-6',
        )}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose()
        }}
      >
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={labelledBy}
          aria-label={label}
          tabIndex={-1}
          className={cx(
            'outline-none',
            open ? enter : exit,
            variant === 'right' && 'absolute inset-y-0 right-0 flex w-full flex-col bg-white shadow-overlay sm:max-w-[560px]',
            variant === 'left' && 'absolute inset-y-0 left-0 flex w-[280px] max-w-[85vw] flex-col bg-white shadow-overlay',
            className,
          )}
        >
          {children}
        </div>
      </div>
    </div>,
    document.body,
  )
}

const modalSize = { sm: 'sm:max-w-sm', md: 'sm:max-w-md', lg: 'sm:max-w-lg' }

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
}: {
  open: boolean
  onClose: () => void
  title: ReactNode
  description?: ReactNode
  children?: ReactNode
  footer?: ReactNode
  size?: keyof typeof modalSize
}) {
  const id = useId()
  return (
    <Overlay
      open={open}
      onClose={onClose}
      labelledBy={id}
      className={cx(
        'flex max-h-[calc(100dvh-1.5rem)] w-full flex-col rounded-2xl border border-transparent bg-white shadow-overlay',
        modalSize[size],
      )}
    >
      <div className="flex items-start justify-between gap-4 px-6 pt-5">
        <div className="min-w-0 pt-0.5">
          <h2 id={id} className="text-base font-semibold">
            {title}
          </h2>
          {description && <p className="mt-1 text-[13px] leading-5 text-muted">{description}</p>}
        </div>
        <IconButton label="Close" size="sm" onClick={onClose} className="-mr-2">
          <X size={16} />
        </IconButton>
      </div>
      {children && <div className={cx('overflow-y-auto overscroll-contain px-6 pt-4', footer ? 'pb-5' : 'pb-6')}>{children}</div>}
      {footer && (
        <div className={cx('flex flex-col-reverse gap-2 rounded-b-2xl border-t border-line bg-canvas px-6 py-4 sm:flex-row sm:justify-end', !children && 'mt-5')}>
          {footer}
        </div>
      )}
    </Overlay>
  )
}

export function Sheet({
  open,
  onClose,
  title,
  description,
  children,
  footer,
}: {
  open: boolean
  onClose: () => void
  title: ReactNode
  description?: ReactNode
  children: ReactNode
  footer?: ReactNode
}) {
  const id = useId()
  return (
    <Overlay open={open} onClose={onClose} variant="right" labelledBy={id}>
      <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-4">
        <div className="min-w-0 pt-0.5">
          <h2 id={id} className="text-base font-semibold">
            {title}
          </h2>
          {description && <p className="mt-0.5 text-[13px] text-muted">{description}</p>}
        </div>
        <IconButton label="Close" size="sm" onClick={onClose} className="-mr-2">
          <X size={16} />
        </IconButton>
      </div>
      <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-6">{children}</div>
      {footer && <div className="flex flex-col-reverse gap-2 border-t border-line bg-canvas px-6 py-4 sm:flex-row sm:justify-end">{footer}</div>}
    </Overlay>
  )
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'danger',
  icon,
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: ReactNode
  description?: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  tone?: 'danger' | 'default'
  icon?: ReactNode
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      title={title}
      description={description}
      footer={
        <>
          {/* Destructive confirms focus Cancel first so a stray Enter can't do damage. */}
          <Button variant="secondary" onClick={onClose} autoFocus={tone === 'danger'}>
            {cancelLabel}
          </Button>
          <Button variant={tone === 'danger' ? 'danger' : 'primary'} icon={icon} onClick={onConfirm} autoFocus={tone !== 'danger'}>
            {confirmLabel}
          </Button>
        </>
      }
    />
  )
}

/* ============================================================================
 * Toasts
 * ========================================================================== */

export function Toasts() {
  const { toasts, dismiss } = useApp()
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-3 bottom-3 z-[60] flex flex-col items-center gap-2 sm:inset-x-auto sm:bottom-5 sm:right-5 sm:items-end"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto flex w-full max-w-sm animate-toast-out items-center gap-3 rounded-xl bg-ink py-3 pl-4 pr-2 text-sm text-white shadow-overlay transition-[opacity,translate,scale] duration-300 ease-snappy starting:opacity-0 motion-safe:starting:translate-y-2 motion-safe:starting:scale-[0.97] sm:w-auto sm:min-w-72"
        >
          {t.tone === 'ok' && <CircleCheck size={16} className="shrink-0 text-emerald-400" />}
          {t.tone === 'bad' && <CircleAlert size={16} className="shrink-0 text-red-400" />}
          {t.tone === 'info' && <Info size={16} className="shrink-0 text-brand" />}
          <span className="flex-1">{t.message}</span>
          <button
            type="button"
            onClick={() => dismiss(t.id)}
            aria-label="Dismiss notification"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}
