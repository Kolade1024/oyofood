import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Bike,
  Check,
  ChevronRight,
  CircleCheck,
  CircleX,
  Inbox,
  KeyRound,
  MessageSquareText,
  Phone,
  Printer,
  SearchX,
  Store,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { Button, Card, ConfirmDialog, EmptyState, IconButton, Meter, PageBody, PageHeader, SearchInput, Sheet, Tabs, useLatchedValue } from '../../components/ui'
import { OrderStatusBadge } from '../../components/OrderStatusBadge'
import { useApp } from '../../context/AppContext'
import { COMMISSION, PACKAGING_FEE, orderTotal } from '../../data/mock'
import type { Order, OrderStatus } from '../../data/mock'
import { cx, naira } from '../../lib/format'
import { useMediaQuery } from '../../lib/useMediaQuery'
import { listCard, withViewTransition } from '../../lib/viewTransition'

const tabDefs: { id: OrderStatus; label: string }[] = [
  { id: 'incoming', label: 'New' },
  { id: 'prep', label: 'Preparing' },
  { id: 'ready', label: 'Ready' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
]

const emptyCopy: Record<OrderStatus, { title: string; description: string }> = {
  incoming: { title: 'No new orders', description: 'New orders appear here instantly. Keep your store open to receive them.' },
  prep: { title: 'Nothing in the kitchen', description: 'Accepted orders show up here with their cook timer.' },
  ready: { title: 'No orders waiting for pickup', description: 'Orders marked ready wait here until the rider or customer collects them.' },
  completed: { title: 'No completed orders yet', description: 'Handed-over orders are listed here for the rest of the day.' },
  cancelled: { title: 'No cancelled orders', description: 'Rejected or cancelled orders will appear here.' },
}

/** Demo handover PIN: the numeric part of the order id. */
const pinFor = (o: Order) => o.id.replace(/\D/g, '').slice(-4)

export default function Orders() {
  const [params, setParams] = useSearchParams()
  const { orders, setOrderStatus, notify } = useApp()
  const [tab, setTab] = useState<OrderStatus>((params.get('tab') as OrderStatus) || 'incoming')
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [sound, setSound] = useState(true)
  const [rejecting, setRejecting] = useState<Order | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const desktop = useMediaQuery('(min-width: 1024px)')
  const rejectTarget = useLatchedValue(rejecting)

  const counts = useMemo(() => {
    const c = { incoming: 0, prep: 0, ready: 0, completed: 0, cancelled: 0 } as Record<OrderStatus, number>
    orders.forEach((o) => c[o.status]++)
    // keep historical totals from the design for completed orders
    c.completed += 62
    return c
  }, [orders])

  const list = orders.filter(
    (o) =>
      o.status === tab &&
      (!query || `${o.id} ${o.customer} ${o.items.map((i) => i.name).join(' ')}`.toLowerCase().includes(query.toLowerCase())),
  )
  const selected = orders.find((o) => o.id === selectedId && o.status === tab) ?? list[0]
  const sheetOrder = useLatchedValue(sheetOpen ? selected : null)

  useEffect(() => {
    setParams(tab === 'incoming' ? {} : { tab }, { replace: true })
  }, [tab, setParams])

  /* ---- order actions (unchanged business logic) ---- */
  // Status changes run in a view transition: the card leaves, the rest slide up.
  const accept = (o: Order, mins = 20) => {
    withViewTransition(() => setOrderStatus(o.id, 'prep', { prepMins: mins, prepLeft: mins }))
    notify(`#${o.id} accepted and sent to the kitchen (${mins}m)`)
    setSheetOpen(false)
  }
  const reject = (o: Order) => {
    withViewTransition(() => setOrderStatus(o.id, 'cancelled', { paid: 'Rejected by vendor' }))
    notify(`#${o.id} rejected`, 'bad')
    setSheetOpen(false)
  }
  const markReady = (o: Order) => {
    withViewTransition(() =>
      setOrderStatus(o.id, 'ready', { rider: o.method === 'Delivery' ? { name: 'Kayode A.', phone: '08055443322' } : undefined }),
    )
    notify(`#${o.id} is ready for pickup`)
    setSheetOpen(false)
  }
  const handover = (o: Order) => {
    withViewTransition(() => setOrderStatus(o.id, 'completed'))
    notify(`#${o.id} handed over`)
  }

  return (
    <>
      <PageHeader
        title="Orders"
        actions={
          <IconButton
              variant="secondary"
              label={sound ? 'Mute new-order chime' : 'Unmute new-order chime'}
              aria-pressed={!sound}
              onClick={() => {
                setSound((s) => !s)
                notify(sound ? 'Order chime muted' : 'Order chime on', 'info')
              }}
            >
              {sound ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </IconButton>
        }
      >
        <Tabs label="Order status" tabs={tabDefs.map((t) => ({ ...t, count: counts[t.id] }))} value={tab} onChange={setTab} />
      </PageHeader>

      <PageBody className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SearchInput value={query} onChange={setQuery} placeholder="Search by order, customer or dish" shortcut className="sm:w-80" />
          <p className="text-[13px] text-muted" aria-live="polite">
            {list.length} {list.length === 1 ? 'order' : 'orders'}
            {query && ' found'}
          </p>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(340px,420px)_1fr]">
          <div className="space-y-3">
            {list.map((o) => (
              <OrderCard
                key={o.id}
                order={o}
                active={selected?.id === o.id}
                onSelect={() => {
                  setSelectedId(o.id)
                  if (!desktop) setSheetOpen(true)
                }}
                onAccept={() => accept(o)}
                onReject={() => setRejecting(o)}
                onReady={() => markReady(o)}
                onHandover={() => handover(o)}
              />
            ))}
            {list.length === 0 &&
              (query ? (
                <EmptyState
                  icon={<SearchX size={18} />}
                  title={`No orders match “${query}”`}
                  description="Try an order number, customer name or dish."
                  action={
                    <Button variant="secondary" size="sm" onClick={() => setQuery('')}>
                      Clear search
                    </Button>
                  }
                />
              ) : (
                <EmptyState icon={<Inbox size={18} />} title={emptyCopy[tab].title} description={emptyCopy[tab].description} />
              ))}
          </div>

          {desktop && (
            <Card className="sticky top-[9.5rem] max-h-[calc(100dvh-11rem)] overflow-y-auto overscroll-contain">
              {selected ? (
                <OrderDetail key={selected.id} order={selected} onAccept={(m) => accept(selected, m)} onReject={() => setRejecting(selected)} onReady={() => markReady(selected)} />
              ) : (
                <div className="flex min-h-80 flex-col items-center justify-center p-10 text-center">
                  <p className="text-sm font-medium">No order selected</p>
                  <p className="mt-1 text-[13px] text-muted">Pick an order from the list to see its details.</p>
                </div>
              )}
            </Card>
          )}
        </div>
      </PageBody>

      {!desktop && (
        <Sheet open={sheetOpen && !!selected} onClose={() => setSheetOpen(false)} title={sheetOrder ? `Order #${sheetOrder.id}` : 'Order'}>
          {sheetOrder && (
            <OrderDetail
              key={sheetOrder.id}
              compact
              order={sheetOrder}
              onAccept={(m) => accept(sheetOrder, m)}
              onReject={() => setRejecting(sheetOrder)}
              onReady={() => markReady(sheetOrder)}
            />
          )}
        </Sheet>
      )}

      <ConfirmDialog
        open={!!rejecting}
        onClose={() => setRejecting(null)}
        onConfirm={() => {
          if (rejecting) reject(rejecting)
          setRejecting(null)
        }}
        title={`Reject order #${rejectTarget?.id ?? ''}?`}
        description="The customer will be notified and refunded. This can't be undone."
        confirmLabel="Reject order"
        cancelLabel="Keep order"
        icon={<CircleX size={16} />}
      />
    </>
  )
}

function OrderCard({
  order: o,
  active,
  onSelect,
  onAccept,
  onReject,
  onReady,
  onHandover,
}: {
  order: Order
  active: boolean
  onSelect: () => void
  onAccept: () => void
  onReject: () => void
  onReady: () => void
  onHandover: () => void
}) {
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState(false)
  const [shakeKey, setShakeKey] = useState(0)
  const expanded = active && o.status === 'incoming'

  const verify = () => {
    if (pin.length !== 4) return
    if (pin === pinFor(o)) onHandover()
    else {
      setPinError(true)
      setShakeKey((k) => k + 1)
    }
  }

  const secondary =
    o.rider && o.status === 'ready' ? `Rider ${o.rider.name} · ${o.rider.phone}` : o.status === 'incoming' && active ? o.phone : o.address.split(',')[0]

  return (
    <article
      style={listCard(o.id)}
      className={cx(
        'group rounded-xl border bg-white transition-[box-shadow,border-color] duration-200 ease-snappy',
        active ? 'border-transparent shadow-raised ring-1 ring-ink/80' : 'border-transparent shadow-card hover:shadow-raised',
      )}
    >
      <div className="relative p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="flex flex-wrap items-center gap-2 text-sm font-semibold tabular-nums">
              <button
                type="button"
                onClick={onSelect}
                aria-current={active || undefined}
                aria-label={`Order #${o.id} from ${o.customer}`}
                className="text-left after:absolute after:inset-0 after:rounded-xl after:content-[''] focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-brand-700"
              >
                #{o.id}
              </button>
              <OrderStatusBadge order={o} />
            </p>
            <p className="mt-1 truncate text-[13px] text-muted">
              <span className="font-medium text-ink">{o.customer}</span> · {secondary}
            </p>
          </div>
          <span className="flex shrink-0 items-center gap-1">
            <span className="text-[15px] font-semibold tabular-nums">{naira(orderTotal(o))}</span>
            <ChevronRight size={16} className="text-subtle lg:hidden" />
          </span>
        </div>

        <ul className="mt-3 space-y-0.5 border-t border-line pt-3 text-[13px]">
          {o.items.map((i) => (
            <li key={i.name} className="flex justify-between gap-3">
              <span className="text-gray-700">
                <span className="tabular-nums text-muted">{i.qty}×</span> {i.name}
              </span>
              {expanded && <span className="text-muted tabular-nums">{naira(i.price)}</span>}
            </li>
          ))}
        </ul>

        {expanded && o.note && (
          <p className="mt-3 flex gap-2 rounded-lg bg-brand-50 px-3 py-2.5 text-[13px] text-gray-800">
            <MessageSquareText size={16} className="mt-0.5 shrink-0 text-brand-fg" />“{o.note}”
          </p>
        )}

        {o.status === 'incoming' && !expanded && (
          <span className="mt-3 flex items-center justify-between border-t border-line pt-3 text-xs">
            <span className="flex items-center gap-1.5 font-medium text-ok-fg">
              <CircleCheck size={14} /> {o.paid}
            </span>
            <span className="font-medium text-ink">Review order</span>
          </span>
        )}
      </div>

      {expanded && (
        <div className="grid grid-cols-2 gap-2 px-4 pb-4">
          <Button variant="dangerSoft" onClick={onReject}>
            Reject
          </Button>
          <Button onClick={onAccept}>Accept</Button>
        </div>
      )}

      {o.status === 'prep' && (
        <div className="flex items-center gap-3 border-t border-line px-4 py-3">
          <Meter value={100 - ((o.prepLeft ?? 0) / (o.prepMins ?? 1)) * 100} tone="ink" label={`Cooking progress for #${o.id}`} className="flex-1" />
          <Button variant="success" size="sm" icon={<Check size={14} />} onClick={onReady}>
            Mark ready
          </Button>
        </div>
      )}

      {o.status === 'ready' && (
        <form
          className="border-t border-line px-4 py-3"
          onSubmit={(e) => {
            e.preventDefault()
            verify()
          }}
        >
          <label htmlFor={`pin-${o.id}`} className="flex items-center gap-1.5 text-xs font-medium text-muted">
            <KeyRound size={14} /> Handover PIN from rider or customer
          </label>
          <div className="mt-2 flex items-center gap-2">
            <input
              key={shakeKey}
              id={`pin-${o.id}`}
              value={pin}
              onChange={(e) => {
                setPin(e.target.value.replace(/\D/g, '').slice(0, 4))
                setPinError(false)
              }}
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="••••"
              aria-invalid={pinError || undefined}
              aria-describedby={`pin-msg-${o.id}`}
              className={cx(
                'h-10 w-28 rounded-lg border bg-white text-center font-mono text-base tracking-[0.4em] outline-none transition-[border-color,box-shadow] focus:ring-4',
                pinError ? 'animate-shake border-bad-fg focus:ring-bad/15' : 'border-field focus:border-ink focus:ring-brand/15',
              )}
            />
            <Button type="submit" className="flex-1" disabled={pin.length !== 4}>
              Confirm handover
            </Button>
          </div>
          <p id={`pin-msg-${o.id}`} role={pinError ? 'alert' : undefined} className={cx('mt-1.5 text-xs', pinError ? 'font-medium text-bad-fg' : 'text-muted')}>
            {pinError ? 'Incorrect PIN. Ask them to read it again.' : `Demo PIN: ${pinFor(o)}`}
          </p>
        </form>
      )}
    </article>
  )
}

function OrderDetail({
  order: o,
  compact,
  onAccept,
  onReject,
  onReady,
}: {
  order: Order
  compact?: boolean
  onAccept: (mins: number) => void
  onReject: () => void
  onReady: () => void
}) {
  const [mins, setMins] = useState(20)
  const subtotal = orderTotal(o)
  const commission = Math.round(subtotal * COMMISSION)
  const payout = subtotal - commission + PACKAGING_FEE
  const label = 'text-xs font-medium text-muted'

  return (
    <div className={cx('flex flex-col', !compact && 'p-6')}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          {!compact && <h2 className="text-lg font-semibold tracking-tight tabular-nums">Order #{o.id}</h2>}
          <div className={cx('flex flex-wrap items-center gap-2 text-[13px] text-muted', !compact && 'mt-1')}>
            <OrderStatusBadge order={o} />
            <span>Placed {o.placedAt}</span>
            {o.distanceKm && <span>· {o.distanceKm} km away</span>}
          </div>
        </div>
        <div className="flex gap-1.5" data-print-hide>
          <IconButton variant="secondary" size="sm" label="Print ticket" onClick={() => window.print()}>
            <Printer size={16} />
          </IconButton>
          <a
            href={`tel:${o.phone.replace(/\s/g, '')}`}
            aria-label="Call customer"
            title="Call customer"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-line-strong bg-white text-muted shadow-[0_1px_2px_oklch(0_0_0/0.04)] transition-colors hover:bg-canvas hover:text-ink"
          >
            <Phone size={16} />
          </a>
        </div>
      </div>

      <div className="mt-6 grid gap-5 border-t border-line pt-5 sm:grid-cols-2">
        <div>
          <p className={label}>Customer</p>
          <p className="mt-1.5 text-sm font-medium">{o.customer}</p>
          <p className="text-[13px] text-muted tabular-nums">+234 {o.phone.replace(/^0/, '')}</p>
          <p className="mt-1 text-[13px] text-gray-700">{o.address}</p>
        </div>
        <div>
          <p className={label}>Fulfilment</p>
          <p className="mt-1.5 flex items-center gap-2 text-sm font-medium">
            {o.method === 'Delivery' ? <Bike size={16} className="text-muted" /> : <Store size={16} className="text-muted" />}
            {o.method === 'Delivery' ? 'OYO Express delivery' : 'Counter pickup'}
          </p>
          <p className="text-[13px] text-ok-fg">Paid · {o.paid}</p>
          {o.method === 'Delivery' && (
            <p className="text-[13px] text-muted">{o.rider ? `Rider: ${o.rider.name}` : 'Nearest rider is 4 mins away'}</p>
          )}
        </div>
      </div>

      <div className="mt-6 border-t border-line pt-5">
        <p className={label}>Items</p>
        <ul className="mt-3 space-y-3">
          {o.items.map((i) => (
            <li key={i.name} className="flex justify-between gap-4 text-sm">
              <div>
                <p className="font-medium">
                  <span className="tabular-nums text-muted">{i.qty}×</span> {i.name}
                </p>
                {i.detail && <p className="text-[13px] text-muted">{i.detail}</p>}
              </div>
              <span className="font-medium tabular-nums">{naira(i.price)}</span>
            </li>
          ))}
        </ul>
        {o.note && (
          <div className="mt-4 rounded-lg bg-brand-50 p-3 text-[13px]">
            <p className="font-medium">Kitchen note</p>
            <p className="text-gray-800">“{o.note}”</p>
          </div>
        )}
      </div>

      <dl className="mt-6 space-y-2.5 border-t border-line pt-5 text-[13px] text-muted">
        <div className="flex justify-between">
          <dt>Subtotal</dt>
          <dd className="tabular-nums text-ink">{naira(subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Platform commission (15%)</dt>
          <dd className="tabular-nums">−{naira(commission)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Packaging fee</dt>
          <dd className="tabular-nums">+{naira(PACKAGING_FEE)}</dd>
        </div>
        <div className="flex justify-between border-t border-line pt-3 text-sm font-semibold text-ink">
          <dt>Your payout</dt>
          <dd className="tabular-nums">{naira(payout)}</dd>
        </div>
      </dl>

      {o.status === 'incoming' && (
        <div className="mt-6 border-t border-line pt-5" data-print-hide>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-[13px] font-medium">Prep time</span>
            <Tabs
              style="segmented"
              label="Prep time"
              value={String(mins)}
              onChange={(v) => setMins(Number(v))}
              tabs={[15, 20, 30, 45].map((m) => ({ id: String(m), label: `${m} min` }))}
            />
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-[auto_1fr]">
            <Button variant="dangerSoft" icon={<CircleX size={16} />} onClick={onReject}>
              Reject
            </Button>
            <Button icon={<Check size={16} />} onClick={() => onAccept(mins)}>
              Accept · send to kitchen ({mins}m)
            </Button>
          </div>
        </div>
      )}
      {o.status === 'prep' && (
        <div className="mt-6 border-t border-line pt-5" data-print-hide>
          <Button variant="success" className="w-full" icon={<CircleCheck size={16} />} onClick={onReady}>
            Mark as ready for pickup
          </Button>
        </div>
      )}
      {o.status === 'ready' && (
        <p className="mt-6 flex items-center gap-2 rounded-lg bg-ok-50 p-3 text-[13px] text-ok-fg" data-print-hide>
          <KeyRound size={16} className="shrink-0" /> Verify the handover PIN on the order card to complete it.
        </p>
      )}
    </div>
  )
}
