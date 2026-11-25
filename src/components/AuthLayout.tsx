import type { ReactNode } from 'react'
import { ShieldCheck } from 'lucide-react'
import { LogoMark } from './ui'
import { cx } from '../lib/format'

const orangeBg = 'bg-[radial-gradient(120%_80%_at_0%_0%,#f4a028_0%,#ee8a06_45%,#d97a00_100%)]'

/** Split-screen used by Welcome / Login / password-recovery screens. */
export function AuthLayout({
  pill,
  eyebrow,
  title,
  lead,
  panel,
  footerLeft,
  footerRight,
  children,
}: {
  pill?: ReactNode
  eyebrow: string
  title: string
  lead: string
  panel?: ReactNode
  footerLeft?: ReactNode
  footerRight?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="flex min-h-full flex-col lg:flex-row">
      <aside className={cx('relative overflow-hidden px-6 py-8 text-white sm:px-16 lg:flex lg:w-1/2 lg:flex-col lg:py-16', orangeBg)}>
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-black/10 blur-3xl" />
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <LogoMark size={56} />
            <div>
              <p className="text-xl font-semibold">OYO Food</p>
              <p className="text-[11px] text-white/85">Restaurant &amp; Vendor Network</p>
            </div>
          </div>
          {pill && (
            <span className="hidden items-center gap-1.5 rounded-full bg-black/15 px-3 py-1.5 text-[11px] font-semibold sm:inline-flex">
              {pill}
            </span>
          )}
        </div>

        <div className="mt-10 lg:my-auto lg:mt-0 lg:py-10">
          <p className="text-sm font-medium uppercase tracking-wider text-white/90">{eyebrow}</p>
          <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight lg:text-[44px] lg:leading-[1.1]">{title}</h1>
          <p className="mt-4 max-w-lg text-[15px] font-medium leading-6 text-white/95">{lead}</p>
          {panel && <div className="mt-8 hidden sm:block">{panel}</div>}
        </div>

        {(footerLeft || footerRight) && (
          <div className="mt-8 hidden items-center justify-between gap-4 border-t border-white/25 pt-6 text-xs text-white/90 lg:flex">
            <span className="flex items-center gap-2">{footerLeft}</span>
            <span>{footerRight}</span>
          </div>
        )}
      </aside>

      <main className="flex flex-1 flex-col bg-white px-4 py-8 sm:px-10 lg:px-20 lg:py-16">{children}</main>
    </div>
  )
}

export function InfoPanel({ icon, title, text, tone = 'dark' }: { icon: ReactNode; title: string; text: string; tone?: 'dark' | 'ok' }) {
  return (
    <div className="flex max-w-lg items-center gap-4 rounded-2xl border border-white/10 bg-black/20 p-5">
      <span
        className={cx(
          'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
          tone === 'ok' ? 'bg-ok text-white' : 'bg-white/15 text-white',
        )}
      >
        {icon}
      </span>
      <div>
        <p className="font-semibold">{title}</p>
        <p className="text-[13px] text-white/85">{text}</p>
      </div>
    </div>
  )
}

export function HeroCard() {
  return (
    <div className="relative max-w-lg pb-6">
      <div className="relative overflow-hidden rounded-2xl shadow-2xl ring-1 ring-black/10">
        <img src="/images/hero.jpg" alt="Jollof rice with grilled chicken and plantain" className="h-56 w-full object-cover" />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-16">
          <span className="rounded-full bg-brand px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider">Vendor Spotlight</span>
          <p className="mt-2 font-semibold">Authentic Jollof &amp; Grill Masters</p>
          <p className="text-xs text-white/85">Over ₦45M+ paid out to local vendors monthly</p>
        </div>
      </div>
      <div className="absolute -right-4 bottom-0 flex items-center gap-3 rounded-xl bg-white p-2.5 pr-4 text-ink shadow-xl">
        <img src="/images/thumb.jpg" alt="" className="h-11 w-11 rounded-lg object-cover" />
        <div>
          <p className="text-xs font-semibold">Instant Payouts</p>
          <p className="text-[11px] text-muted">Daily ₦ settlements to your bank</p>
        </div>
      </div>
    </div>
  )
}

export function SecureNote({ children }: { children: ReactNode }) {
  return (
    <>
      <ShieldCheck size={16} className="text-ok" /> {children}
    </>
  )
}

/** Split-screen used by the 4-step vendor sign-up. */
export function OnboardingLayout({ children, badge }: { children: ReactNode; badge?: ReactNode }) {
  return (
    <div className="flex min-h-full flex-col lg:flex-row">
      <aside className="flex flex-col items-center justify-center bg-brand px-6 py-10 text-center text-white lg:sticky lg:top-0 lg:h-screen lg:w-[42%] xl:w-[48%]">
        <div className="hidden lg:block">
          <LogoMark size={160} round />
        </div>
        <div className="lg:hidden">
          <LogoMark size={72} round />
        </div>
        <h1 className="mt-6 font-display text-3xl font-bold lg:mt-12 lg:text-[44px]">Join OYO Food</h1>
        <p className="mt-3 font-display text-base font-semibold lg:text-[22px]">Register your restaurant and start receiving orders.</p>
        {badge && <div className="mt-8">{badge}</div>}
      </aside>
      <main className="flex-1 bg-white px-4 py-8 sm:px-10 lg:px-10 xl:px-10">
        <div className="mx-auto max-w-[580px]">{children}</div>
      </main>
    </div>
  )
}
