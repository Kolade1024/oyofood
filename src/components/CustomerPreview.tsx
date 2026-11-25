import { useMemo, useState } from 'react'
import { BadgeCheck, BatteryFull, ChevronLeft, ChevronRight, Flame, Heart, House, MapPin, Plus, Search, Settings, Signal, Star, UtensilsCrossed, Wifi } from 'lucide-react'
import { Overlay } from './ui'
import { useApp } from '../context/AppContext'
import { vendor } from '../data/mock'
import type { Meal } from '../data/mock'
import { cx, naira } from '../lib/format'

type Tab = 'overview' | 'menu' | 'reviews'

/* Storefront values customers see. No backend field exists for these yet. */
const storefront = { minOrder: 1500, deliveryTime: '20–30 mins', deliveryFee: 500, area: 'Bodija Ibadan' }

const priceOf = (m: Meal) => m.discountPrice ?? m.price

/** What customers see in the OYO Food app: mirrors the live menu as the vendor edits it. */
export function CustomerPreview({ open, meals, categories, onClose }: { open: boolean; meals: Meal[]; categories: string[]; onClose: () => void }) {
  return (
    <Overlay open={open} onClose={onClose} variant="bare" label="Customer app preview">
      <Screen meals={meals} categories={categories} onClose={onClose} />
    </Overlay>
  )
}

function Screen({ meals, categories, onClose }: { meals: Meal[]; categories: string[]; onClose: () => void }) {
  const { reviews } = useApp()
  const [tab, setTab] = useState<Tab>('menu')
  const [query, setQuery] = useState('')
  const [liked, setLiked] = useState(false)
  const [openCat, setOpenCat] = useState<string | null>(null)
  const [showAll, setShowAll] = useState(false)
  const [basket, setBasket] = useState<Record<string, number>>({})

  const available = useMemo(() => meals.filter((m) => m.available), [meals])
  const q = query.trim().toLowerCase()
  const matches = q ? available.filter((m) => `${m.name} ${m.description}`.toLowerCase().includes(q)) : available
  const popular = [...matches].sort((a, b) => b.soldThisWeek - a.soldThisWeek)
  const shownPopular = showAll ? popular : popular.slice(0, 6)

  const add = (m: Meal) => setBasket((b) => ({ ...b, [m.id]: (b[m.id] ?? 0) + 1 }))
  const basketCount = Object.values(basket).reduce((s, n) => s + n, 0)
  const basketTotal = Object.entries(basket).reduce((s, [id, n]) => s + n * priceOf(meals.find((m) => m.id === id) ?? ({ price: 0 } as Meal)), 0)

  const catRows = [{ name: 'Popular', items: popular.slice(0, 4), hot: true }, ...categories.map((c) => ({ name: c, items: matches.filter((m) => m.category === c), hot: false }))]

  return (
    <div className="relative flex h-[812px] max-h-[calc(100dvh-1.5rem)] w-[390px] max-w-[calc(100vw-1.5rem)] flex-col overflow-hidden rounded-[44px] border-[6px] border-ink bg-[#f7f7f7] font-display text-ink shadow-overlay">
      <div className="flex-1 overflow-y-auto overscroll-contain pb-28 [scrollbar-width:none]">
        {/* Hero */}
        <div className="relative h-[300px] shrink-0 overflow-hidden rounded-b-[28px]">
          <img src="/images/hero.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

          <div aria-hidden className="absolute inset-x-0 top-0 flex h-11 items-center justify-between bg-white/35 px-8 text-[15px] font-semibold backdrop-blur-sm">
            9:41
            <span className="flex items-center gap-1.5">
              <Signal size={16} />
              <Wifi size={16} />
              <BatteryFull size={20} />
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close preview"
            className="absolute left-4 top-16 flex h-12 w-12 items-center justify-center rounded-full bg-white/95 shadow-card transition-transform duration-[160ms] ease-snappy motion-safe:active:scale-95"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            type="button"
            onClick={() => setLiked((l) => !l)}
            aria-label={liked ? 'Remove from favourites' : 'Add to favourites'}
            aria-pressed={liked}
            className="absolute right-4 top-16 flex h-12 w-12 items-center justify-center rounded-full bg-white/95 shadow-card transition-transform duration-[160ms] ease-snappy motion-safe:active:scale-95"
          >
            <Heart size={20} className={cx('transition-colors duration-200', liked && 'fill-[#ef4444] text-[#ef4444]')} />
          </button>

          <div className="absolute inset-x-4 bottom-5 flex flex-wrap items-end justify-between gap-x-3 gap-y-2">
            <h2 className="flex min-w-0 items-center gap-2 text-[26px] font-semibold leading-tight tracking-tight text-white">
              {vendor.brand}
              <BadgeCheck size={26} className="shrink-0 fill-[#3ddc84] text-white" aria-label="Verified" />
            </h2>
            <span className="flex shrink-0 items-center gap-1 rounded-full border border-white/85 px-2.5 py-1 text-[13px] font-medium text-white">
              <MapPin size={14} />
              {storefront.area}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div role="tablist" aria-label="Restaurant" className="mt-6 grid grid-cols-3 px-4">
          {(['overview', 'menu', 'reviews'] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={cx('relative pb-3 text-[17px] capitalize transition-colors duration-150', tab === t ? 'font-medium text-ink' : 'text-muted')}
            >
              {t}
              <span
                className={cx(
                  'absolute inset-x-4 bottom-0 h-[3px] rounded-full bg-brand transition-opacity duration-200',
                  tab === t ? 'opacity-100' : 'opacity-0',
                )}
              />
            </button>
          ))}
        </div>

        {tab === 'menu' && (
          <div className="px-4">
            <div className="mt-6 grid grid-cols-3 gap-2">
              {[
                ['Minimum order', naira(storefront.minOrder)],
                ['Delivery time', storefront.deliveryTime],
                ['Delivery fee', naira(storefront.deliveryFee)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-line bg-white px-2 py-3.5 text-center">
                  <p className="text-[12px] text-gray-700">{label}</p>
                  <p className="mt-1 text-[14px] font-semibold tabular-nums">{value}</p>
                </div>
              ))}
            </div>

            <label className="mt-3 flex h-12 items-center gap-3 rounded-2xl border border-line bg-white px-4">
              <Search size={20} className="shrink-0 text-muted" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="What are you looking for today?"
                aria-label="Search dishes"
                className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-subtle"
              />
            </label>

            <div className="mt-6 flex items-baseline justify-between">
              <h3 className="text-[20px] font-semibold tracking-tight">Popular items</h3>
              {popular.length > 6 && (
                <button type="button" onClick={() => setShowAll((s) => !s)} className="text-[14px] font-medium text-muted">
                  {showAll ? 'Show less' : 'See all'}
                </button>
              )}
            </div>
            {shownPopular.length > 0 ? (
              <div className="-mx-4 mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
                {shownPopular.map((m) => (
                  <div key={m.id} className="w-[148px] shrink-0 snap-start rounded-2xl border border-line bg-white p-2">
                    <span className="relative block h-[88px] overflow-hidden rounded-xl">
                      <img src={m.image} alt="" className="h-full w-full object-cover" />
                      <span className="absolute inset-0 rounded-xl outline-1 -outline-offset-1 outline-black/10" />
                    </span>
                    <p className="mt-2 line-clamp-2 min-h-[40px] text-[15px] leading-5">{m.name}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[15px] font-semibold tabular-nums">{naira(priceOf(m))}</span>
                      <AddButton onClick={() => add(m)} name={m.name} count={basket[m.id]} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 rounded-2xl border border-dashed border-line-strong bg-white p-6 text-center text-[14px] text-muted">
                {q ? `No dishes match “${query}”` : 'No dishes are available right now'}
              </p>
            )}

            <h3 className="mt-7 text-[20px] font-semibold tracking-tight">Menu categories</h3>
            <ul className="mt-2 divide-y divide-line">
              {catRows.map((c) => {
                const expanded = openCat === c.name
                return (
                  <li key={c.name}>
                    <button
                      type="button"
                      aria-expanded={expanded}
                      onClick={() => setOpenCat(expanded ? null : c.name)}
                      className="flex w-full items-center gap-2 py-3.5 text-left"
                    >
                      {c.hot && <Flame size={18} className="shrink-0 fill-brand text-brand" />}
                      <span className="flex-1 text-[18px] font-medium">{c.name}</span>
                      <span className="text-[13px] text-muted tabular-nums">{c.items.length}</span>
                      <ChevronRight size={20} className={cx('shrink-0 transition-transform duration-200 ease-snappy', expanded && 'rotate-90')} />
                    </button>
                    {expanded && (
                      <ul className="space-y-2 pb-4">
                        {c.items.length === 0 && <li className="text-[14px] text-muted">Nothing here yet</li>}
                        {c.items.map((m) => (
                          <li key={m.id} className="flex items-center gap-3 rounded-2xl border border-line bg-white p-2">
                            <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl">
                              <img src={m.image} alt="" className="h-full w-full object-cover" />
                              <span className="absolute inset-0 rounded-xl outline-1 -outline-offset-1 outline-black/10" />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-[15px]">{m.name}</span>
                              <span className="text-[14px] font-semibold tabular-nums">{naira(priceOf(m))}</span>
                            </span>
                            <AddButton onClick={() => add(m)} name={m.name} count={basket[m.id]} />
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        )}

        {tab === 'overview' && (
          <div className="space-y-4 px-4 pt-6 text-[15px] leading-6">
            <p className="text-gray-700">{vendor.bio}</p>
            <div className="rounded-2xl border border-line bg-white p-4">
              <p className="flex items-center gap-2">
                <MapPin size={18} className="text-muted" /> {vendor.branch.replace(' - ', ', ')}
              </p>
              <p className="mt-2 flex items-center gap-2">
                <Star size={18} className="fill-brand text-brand" /> 4.8 · 482 reviews
              </p>
            </div>
          </div>
        )}

        {tab === 'reviews' && (
          <ul className="space-y-3 px-4 pt-6">
            {reviews.slice(0, 4).map((r) => (
              <li key={r.id} className="rounded-2xl border border-line bg-white p-4">
                <p className="flex items-center justify-between text-[15px] font-medium">
                  {r.name}
                  <span className="flex items-center gap-1 text-[14px] tabular-nums">
                    <Star size={15} className="fill-brand text-brand" /> {r.rating}
                  </span>
                </p>
                <p className="mt-1 line-clamp-3 text-[14px] leading-5 text-gray-700">{r.text}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Basket bar: appears once something is added */}
      {basketCount > 0 && (
        <div className="absolute inset-x-4 bottom-[100px] flex h-12 items-center justify-between rounded-2xl bg-ink px-4 text-[15px] font-medium text-white shadow-overlay transition-[opacity,translate] duration-300 ease-snappy starting:opacity-0 motion-safe:starting:translate-y-2">
          <span>
            View basket · {basketCount} {basketCount === 1 ? 'item' : 'items'}
          </span>
          <span className="tabular-nums">{naira(basketTotal)}</span>
        </div>
      )}

      {/* Bottom navigation (illustrative) */}
      <nav aria-hidden className="absolute inset-x-0 bottom-0 flex h-[88px] items-start justify-around rounded-b-[38px] bg-white px-2 pt-3 shadow-[0_-1px_0_oklch(0_0_0/0.06)]">
        <NavItem label="Home" active icon={<House size={24} className="fill-white" />} />
        <NavItem label="Discover" icon={<Search size={22} />} />
        <NavItem label="Orders" icon={<UtensilsCrossed size={22} />} />
        <NavItem label="Settings" icon={<Settings size={22} />} />
        <div className="-mt-6 flex h-[76px] w-[72px] flex-col items-center justify-end gap-0.5 rounded-2xl bg-white pb-2 shadow-raised">
          <img src={popular[0]?.image ?? '/images/meal1.jpg'} alt="" className="h-9 w-12 rounded-lg object-cover" />
          <span className="text-[13px] font-semibold">Swipe</span>
        </div>
      </nav>
    </div>
  )
}

function AddButton({ onClick, name, count }: { onClick: () => void; name: string; count?: number }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={count ? `Add another ${name} (${count} in basket)` : `Add ${name} to basket`}
      className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand text-white transition-transform duration-[160ms] ease-snappy motion-safe:active:scale-90"
    >
      <Plus size={20} strokeWidth={2.5} />
      {!!count && (
        <span className="absolute -right-1 -top-1 min-w-[18px] rounded-full bg-ink px-1 text-center text-[11px] font-semibold leading-[18px] text-white tabular-nums">
          {count}
        </span>
      )}
    </button>
  )
}

function NavItem({ label, icon, active }: { label: string; icon: React.ReactNode; active?: boolean }) {
  return (
    <div className="flex w-16 flex-col items-center gap-1">
      <span className={cx('flex h-12 w-12 items-center justify-center rounded-full', active ? 'bg-brand text-white' : 'bg-hover text-gray-500')}>{icon}</span>
      <span className={cx('text-[12px] font-semibold', active ? 'text-ink' : 'text-muted')}>{label}</span>
    </div>
  )
}
