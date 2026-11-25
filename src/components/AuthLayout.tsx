import { useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Select } from './Select'
import { BrandBadge } from './ui'
import { useApp } from '../context/AppContext'
import { cx } from '../lib/format'

/* Photos: Pexels (free licence), ids 4353623, 10375885, 3801426. About 1080x1440. */
const slides = [
  { image: '/images/auth/orders.jpg', focus: '50% 0%', title: 'Start receiving orders from your kitchen' },
  { image: '/images/auth/payouts.jpg', focus: '60% 30%', title: 'Daily payouts to your bank' },
  { image: '/images/auth/counter.jpg', focus: '50% 30%', title: 'Run your whole restaurant in one place' },
]

function PhotoPanel() {
  const [i, setI] = useState(0)
  const slide = slides[i]
  const next = () => setI((n) => (n + 1) % slides.length)

  return (
    <aside className="group relative hidden w-[33%] min-w-[360px] max-w-[480px] shrink-0 overflow-hidden rounded-xl rounded-tl-none bg-[#12161d] text-white lg:block">
      {/* All three stay mounted so they are loaded ahead and cross-fade instead of flashing. */}
      {slides.map((s, n) => (
        <img
          key={s.image}
          src={s.image}
          alt=""
          style={{ objectPosition: s.focus }}
          className={cx('absolute inset-x-0 top-0 h-[84%] w-full object-cover transition-opacity duration-500 ease-snappy', n === i ? 'opacity-100' : 'opacity-0')}
        />
      ))}
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#12161d] from-[17%] via-[#12161d]/45 via-40% to-transparent to-70%" />

      <div aria-hidden className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/60 to-transparent" />

      {/* Logo tab: the page background cut into the panel's corner */}
      <svg aria-hidden width="154" height="78" viewBox="0 0 154 78" className="absolute -left-px -top-px text-canvas">
        <path fill="currentColor" d="M0 0H154C144 0 138 4 132 12L104 54C98 63 92 67 82 67H12C5 67 0 71 0 78Z" />
      </svg>
      <Link to="/" aria-label="OYO Food home" className="absolute left-4 top-2.5">
        <BrandBadge size={46} />
      </Link>

      <button type="button" onClick={next} aria-label="Show next slide" className="absolute left-[150px] right-7 top-8 py-3">
        <span className="block h-1 overflow-hidden rounded-full bg-white/35">
          <span
            key={i}
            onAnimationEnd={next}
            className="block h-full origin-left animate-slide-progress rounded-full bg-white group-focus-within:[animation-play-state:paused] group-hover:[animation-play-state:paused]"
          />
        </span>
      </button>

      <div className="absolute inset-x-7 bottom-8">
        <p key={i} className="max-w-[300px] animate-fade-in text-balance text-[32px] font-semibold leading-[1.2] tracking-tight">
          {slide.title}
        </p>
        <p className="mt-8 flex flex-wrap items-center gap-y-1 text-[13px] text-white/65 [&>*+*]:ml-3 [&>*+*]:border-l [&>*+*]:border-white/30 [&>*+*]:pl-3">
          <span>© OYO Food {new Date().getFullYear()}</span>
          <a href="mailto:support@oyofood.ng" className="hover:text-white">
            Help Center
          </a>
          <a href="#" className="hover:text-white">
            Terms of Service
          </a>
        </p>
      </div>
    </aside>
  )
}

function LanguagePicker() {
  const { lang, setLang } = useApp()
  return (
    <Select
      aria-label="Language"
      align="right"
      value={lang}
      onChange={setLang}
      className="h-11 w-auto! border-transparent! bg-canvas! sm:text-[13px]"
      options={[
        { value: 'en', label: 'English' },
        { value: 'yo', label: 'Yorùbá' },
      ]}
    />
  )
}

/** Photo panel plus form card. Used by every signed-out screen. */
export function AuthLayout({ header, progress, children }: { header?: ReactNode; progress?: ReactNode; children: ReactNode }) {
  return (
    <div className="flex min-h-dvh gap-3.5 bg-canvas lg:h-dvh lg:p-3.5">
      <PhotoPanel />
      <main className="flex min-w-0 flex-1 flex-col bg-white lg:overflow-y-auto lg:overscroll-contain lg:rounded-xl">
        <header className="sticky top-0 z-10 grid shrink-0 grid-cols-[1fr_auto] items-center gap-x-4 gap-y-3 py-3.5 border-b border-line bg-white px-4 sm:grid-cols-[1fr_minmax(0,226px)_1fr] lg:px-5">
          <div className="flex min-w-0 items-center gap-3">
            {header ?? (
              <Link to="/" aria-label="OYO Food home" className="lg:hidden">
                <BrandBadge size={40} />
              </Link>
            )}
          </div>
          <div className="order-3 col-span-2 empty:hidden sm:order-none sm:col-span-1 sm:empty:block">{progress}</div>
          <div className="flex justify-end">
            <LanguagePicker />
          </div>
        </header>
        <div className="flex flex-1 flex-col px-4 py-8 sm:px-10 [&_input:not([aria-invalid],:focus)]:border-line-strong [&_[role=combobox]:not([aria-invalid],:focus)]:border-line-strong [&_.border-field:not(input,select,textarea,button)]:border-line-strong [&_textarea:not(:focus)]:border-line-strong">{children}</div>
      </main>
    </div>
  )
}
