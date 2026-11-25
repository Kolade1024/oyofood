import { Suspense, useEffect, useRef, useState } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import { NavLink, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  CalendarClock,
  ChartSpline,
  ChevronsUpDown,
  CircleHelp,
  LayoutDashboard,
  LogOut,
  LucideProvider,
  Megaphone,
  Menu as MenuIcon,
  ReceiptText,
  Settings,
  Star,
  UtensilsCrossed,
  Wallet,
} from 'lucide-react'
import { Avatar, BrandBadge, ConfirmDialog, IconButton, Overlay, Skeleton, Toggle, usePresence } from './ui'
import { useApp } from '../context/AppContext'
import { vendor } from '../data/mock'
import { cx } from '../lib/format'

const navGroups = [
  {
    label: 'Operations',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/orders', label: 'Orders', icon: ReceiptText, badge: true },
      { to: '/menu', label: 'Menu', icon: UtensilsCrossed },
    ],
  },
  {
    label: 'Business',
    items: [
      { to: '/earnings', label: 'Earnings', icon: Wallet },
      { to: '/analytics', label: 'Analytics', icon: ChartSpline },
      { to: '/reviews', label: 'Reviews', icon: Star },
      { to: '/promotions', label: 'Promotions', icon: Megaphone },
    ],
  },
  {
    label: 'Store',
    items: [
      { to: '/hours', label: 'Hours & delivery', icon: CalendarClock },
      { to: '/settings', label: 'Settings', icon: Settings },
    ],
  },
]

function StoreStatus() {
  const { storeOpen, setStoreOpen, notify } = useApp()
  return (
    <div className="flex items-center gap-3 rounded-xl border border-transparent bg-white p-3 shadow-card">
      <div className="min-w-0 flex-1 leading-tight">
        <p className="text-[13px] font-medium">{storeOpen ? 'Store open' : 'Store closed'}</p>
        <p className="text-xs text-muted">{storeOpen ? 'Accepting orders' : 'Paused for customers'}</p>
      </div>
      <Toggle
        label="Accept orders"
        checked={storeOpen}
        onChange={(v) => {
          setStoreOpen(v)
          notify(v ? 'Store is open and accepting orders' : 'Store closed. Customers cannot order.', v ? 'ok' : 'info')
        }}
      />
    </div>
  )
}

function UserMenu({ onNavigate, onLogout }: { onNavigate?: () => void; onLogout: () => void }) {
  const [open, setOpen] = useState(false)
  const mounted = usePresence(open, 120)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    requestAnimationFrame(() => menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus())
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const onMenuKey = (e: ReactKeyboardEvent) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
    e.preventDefault()
    const items = [...(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [])]
    const i = items.indexOf(document.activeElement as HTMLElement)
    items[(i + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length]?.focus()
  }

  const item =
    'flex h-9 w-full items-center gap-2.5 rounded-md px-2.5 text-left text-[13px] font-medium text-ink outline-none transition-colors hover:bg-hover focus-visible:bg-hover focus-visible:outline-none'

  return (
    <div ref={rootRef} className="relative">
      {mounted && (
        <div
          ref={menuRef}
          role="menu"
          aria-label="Account"
          onKeyDown={onMenuKey}
          className={cx(
            'absolute inset-x-0 bottom-full mb-2 origin-bottom rounded-xl border border-transparent bg-white p-1 shadow-overlay',
            open ? 'animate-pop-in' : 'animate-pop-out',
          )}
        >
          <NavLink
            role="menuitem"
            to="/settings"
            className={item}
            onClick={() => {
              setOpen(false)
              onNavigate?.()
            }}
          >
            <Settings size={16} className="text-muted" /> Account settings
          </NavLink>
          <a role="menuitem" href="mailto:support@oyofood.ng" className={item} onClick={() => setOpen(false)}>
            <CircleHelp size={16} className="text-muted" /> Help &amp; support
          </a>
          <div role="separator" className="my-1 h-px bg-line" />
          <button
            role="menuitem"
            type="button"
            className={cx(item, 'text-bad-fg hover:bg-bad-50 focus-visible:bg-bad-50')}
            onClick={() => {
              setOpen(false)
              onLogout()
            }}
          >
            <LogOut size={16} /> Log out
          </button>
        </div>
      )}
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={cx(
          'flex w-full items-center gap-2.5 rounded-lg p-2 text-left transition-colors duration-150 hover:bg-hover',
          open && 'bg-hover',
        )}
      >
        <Avatar name={vendor.owner} tone="dark" size="sm" />
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block truncate text-[13px] font-medium">{vendor.owner}</span>
          <span className="block truncate text-xs text-muted">{vendor.role}</span>
        </span>
        <ChevronsUpDown size={16} className="shrink-0 text-subtle" />
      </button>
    </div>
  )
}

function Sidebar({ onNavigate, onLogout }: { onNavigate?: () => void; onLogout: () => void }) {
  const { orders } = useApp()
  const incoming = orders.filter((o) => o.status === 'incoming').length

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 shrink-0 items-center gap-2.5 px-5">
        <BrandBadge size={30} />
        <div className="leading-tight">
          <p className="text-sm font-semibold">OYO Food</p>
          <p className="text-xs text-muted">Vendor portal</p>
        </div>
      </div>

      <nav aria-label="Main" className="flex-1 overflow-y-auto overscroll-contain px-3 pb-4">
        {navGroups.map((group) => (
          <div key={group.label} className="mt-4 first:mt-1">
            <p className="mb-1 px-2.5 text-[11px] font-medium uppercase tracking-wider text-muted">{group.label}</p>
            <ul className="space-y-0.5">
              {group.items.map(({ to, label, icon: Icon, badge }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      cx(
                        'group flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-sm font-medium transition-colors duration-150',
                        isActive ? 'bg-hover text-ink' : 'text-muted hover:bg-hover/70 hover:text-ink',
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon size={18} className={cx('shrink-0 transition-colors', isActive ? 'text-brand-700' : 'text-subtle group-hover:text-muted')} />
                        <span className="flex-1 truncate">{label}</span>
                        {badge && incoming > 0 && (
                          <span className="min-w-5 rounded-full bg-brand px-1.5 text-center text-[11px] font-semibold leading-[18px] text-ink tabular-nums">
                            {incoming}
                            <span className="sr-only"> new</span>
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="shrink-0 space-y-2 border-t border-line bg-canvas/60 p-3">
        <StoreStatus />
        <UserMenu onNavigate={onNavigate} onLogout={onLogout} />
      </div>
    </div>
  )
}

function PageSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading page">
      <div className="border-b border-line bg-white">
        <div className="mx-auto max-w-[1320px] px-4 py-6 md:px-8">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="mt-2 h-4 w-72" />
        </div>
      </div>
      <div className="mx-auto max-w-[1320px] space-y-6 px-4 py-8 md:px-8">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[118px] rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-80 rounded-xl" />
      </div>
    </div>
  )
}

export default function PortalLayout() {
  const { authed, orders, logout } = useApp()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [logoutOpen, setLogoutOpen] = useState(false)
  const loc = useLocation()
  const nav = useNavigate()
  const incoming = orders.filter((o) => o.status === 'incoming').length

  if (!authed) return <Navigate to="/login" replace state={{ from: loc.pathname }} />

  const askLogout = () => {
    setDrawerOpen(false)
    setLogoutOpen(true)
  }

  return (
    <LucideProvider strokeWidth={1.75} absoluteStrokeWidth>
      <div className="min-h-full bg-canvas lg:pl-64">
        <a
          href="#main"
          className="sr-only z-[70] rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
        >
          Skip to content
        </a>

        <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-line bg-white lg:block">
          <Sidebar onLogout={askLogout} />
        </aside>

        {/* mobile / tablet top bar */}
        <div className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b border-line bg-white/90 px-2 backdrop-blur-md lg:hidden" data-print-hide>
          <IconButton label="Open navigation" onClick={() => setDrawerOpen(true)} aria-expanded={drawerOpen}>
            <MenuIcon size={20} />
          </IconButton>
          <BrandBadge size={28} />
          <span className="flex-1 text-sm font-semibold">OYO Food</span>
          <NavLink
            to="/orders"
            aria-label={incoming ? `Orders, ${incoming} new` : 'Orders'}
            className="relative flex h-10 w-10 items-center justify-center rounded-lg text-muted hover:bg-hover hover:text-ink"
          >
            <ReceiptText size={20} />
            {incoming > 0 && (
              <span className="absolute right-1 top-1 min-w-4 rounded-full bg-brand px-1 text-center text-[10px] font-semibold leading-4 text-ink tabular-nums">
                {incoming}
              </span>
            )}
          </NavLink>
        </div>

        <Overlay open={drawerOpen} onClose={() => setDrawerOpen(false)} variant="left" label="Navigation">
          <Sidebar onNavigate={() => setDrawerOpen(false)} onLogout={askLogout} />
        </Overlay>

        <main id="main" tabIndex={-1} className="min-w-0 outline-none">
          <Suspense fallback={<PageSkeleton />}>
            <Outlet />
          </Suspense>
        </main>

        <ConfirmDialog
          open={logoutOpen}
          onClose={() => setLogoutOpen(false)}
          onConfirm={() => {
            logout()
            nav('/login')
          }}
          title="Log out of OYO Food?"
          description="You'll stop receiving order chimes on this device until you log in again."
          confirmLabel="Log out"
          cancelLabel="Stay logged in"
          icon={<LogOut size={16} />}
        />
      </div>
    </LucideProvider>
  )
}
