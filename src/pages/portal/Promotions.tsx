import { useState } from 'react'
import { Percent, Plus, TriangleAlert } from 'lucide-react'
import { Badge, Button, EmptyState, Field, Input, Meter, PageBody, PageHeader, Sheet, StatCard, Tabs } from '../../components/ui'
import { DatePicker } from '../../components/DateTimePickers'
import { Select } from '../../components/Select'
import { useApp } from '../../context/AppContext'
import { categories } from '../../data/mock'
import type { Promotion } from '../../data/mock'
import { cx } from '../../lib/format'
import { listCard, withViewTransition } from '../../lib/viewTransition'

type Tab = 'active' | 'scheduled' | 'expired'

const emptyForm = {
  name: '',
  code: '',
  type: 'percent',
  value: '',
  minOrder: '3500',
  cap: '150',
  start: '',
  end: '',
  category: 'Entire Store Menu',
}

export default function Promotions() {
  const { promotions, addPromotion, togglePromotion, notify } = useApp()
  const [tab, setTab] = useState<Tab>('active')
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formOpen, setFormOpen] = useState(false)

  const count = (s: Tab) => promotions.filter((p) => p.status === s).length
  const list = promotions.filter((p) => p.status === tab)
  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }))

  const submit = (status: Promotion['status']) => {
    const errs: Record<string, string> = {}
    if (form.name.trim().length < 3) errs.name = 'Name your promotion'
    if (!/^[A-Z0-9]{4,12}$/.test(form.code)) errs.code = '4–12 letters/numbers'
    else if (promotions.some((p) => p.code === form.code)) errs.code = 'Code already in use'
    const v = Number(form.value)
    if (!v || (form.type === 'percent' && v > 90)) errs.value = form.type === 'percent' ? '1–90%' : 'Enter an amount'
    if (!form.start || !form.end) errs.start = 'Pick start and end dates'
    else if (form.end < form.start) errs.start = 'End date must be after start date'
    setErrors(errs)
    if (Object.keys(errs).length) return

    const startsLater = new Date(form.start) > new Date()
    const fmt = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    const finalStatus = status === 'draft' ? 'scheduled' : startsLater ? 'scheduled' : 'active'
    addPromotion({
      id: 'p' + Date.now(),
      name: form.name.trim(),
      code: form.code,
      description:
        (form.type === 'percent' ? `${v}% off` : form.type === 'fixed' ? `₦${v.toLocaleString()} off` : 'Free delivery') +
        ` on ${form.category === 'Entire Store Menu' ? 'all orders' : form.category} with minimum order of ₦${Number(form.minOrder).toLocaleString()}.`,
      redeemed: 0,
      cap: Number(form.cap) || undefined,
      unit: 'orders',
      period: `${fmt(form.start)} - ${fmt(form.end)}`,
      eligible: `Eligible: ${form.category}`,
      footer: status === 'draft' ? 'Saved as draft' : 'Just launched',
      status: finalStatus,
      bar: 'brand',
    })
    setForm(emptyForm)
    setTab(finalStatus === 'active' ? 'active' : 'scheduled')
    setFormOpen(false)
    notify(status === 'draft' ? 'Promotion saved as draft' : `${form.code} is ${finalStatus === 'active' ? 'live' : 'scheduled'}!`)
  }

  const openForm = () => {
    setErrors({})
    setFormOpen(true)
  }
  const errorCount = Object.keys(errors).length

  return (
    <>
      <PageHeader
        title="Promotions"
        subtitle="You fund every discount you offer."
        actions={
          <Button icon={<Plus size={16} />} onClick={openForm}>
            New promotion
          </Button>
        }
      >
        <Tabs
          label="Promotion status"
          value={tab}
          onChange={setTab}
          tabs={[
            { id: 'active', label: 'Active', count: count('active') },
            { id: 'scheduled', label: 'Scheduled', count: count('scheduled') },
            { id: 'expired', label: 'Ended', count: count('expired') },
          ]}
        />
      </PageHeader>

      <PageBody>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Active campaigns" value={count('active')} hint="2 coupons, 1 combo special" />
          <StatCard label="Redemptions" value="348" hint="31% of monthly orders" />
          <StatCard label="Promo revenue" value="₦1,642,800" delta="+34%" hint="sales lift" />
          <StatCard
            label="Discount cost"
            value="₦184,200"
            hint={
              <>
                Net ROI <span className="font-medium text-ink">8.9×</span>
              </>
            }
          />
        </div>

        {list.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {list.map((p) => (
              <PromoCard
                key={p.id}
                promo={p}
                onToggle={() => {
                  withViewTransition(() => togglePromotion(p.id))
                  notify(p.status === 'active' ? `${p.code} paused` : `${p.code} is live`, p.status === 'active' ? 'info' : 'ok')
                }}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Percent size={18} />}
            title={tab === 'expired' ? 'No ended campaigns' : `No ${tab} campaigns`}
            description="Coupons are a quick way to bring customers back on slower days."
            action={
              tab !== 'expired' && (
                <Button size="sm" icon={<Plus size={14} />} onClick={openForm}>
                  New promotion
                </Button>
              )
            }
          />
        )}
      </PageBody>

      <Sheet
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title="New promotion"
        footer={
          <>
            {errorCount > 0 && (
              <p role="alert" className="mr-auto flex items-center gap-1.5 self-center text-[13px] font-medium text-bad-fg">
                <TriangleAlert size={14} /> Fix {errorCount} {errorCount === 1 ? 'field' : 'fields'} to continue
              </p>
            )}
            <Button variant="secondary" onClick={() => submit('draft')}>
              Save as draft
            </Button>
            <Button onClick={() => submit('active')}>Publish</Button>
          </>
        }
      >
        <div className="space-y-5">
          <Field label="Name" required error={errors.name} hint="Only you see this.">
            <Input placeholder="e.g. Month-end suya feast" value={form.name} invalid={!!errors.name} onChange={(e) => set({ name: e.target.value })} />
          </Field>
          <Field label="Coupon code" required error={errors.code} hint="4–12 letters or numbers. Customers type this at checkout.">
            <Input
              className="font-mono uppercase tracking-widest"
              placeholder="SUYA20"
              value={form.code}
              invalid={!!errors.code}
              maxLength={12}
              onChange={(e) => set({ code: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '') })}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Discount type" required>
              <Select
                value={form.type}
                onChange={(type) => set({ type })}
                options={[
                  { value: 'percent', label: 'Percentage (%)' },
                  { value: 'fixed', label: 'Fixed amount (₦)' },
                  { value: 'delivery', label: 'Free delivery' },
                ]}
              />
            </Field>
            <Field label="Discount value" required error={errors.value}>
              <Input
                inputMode="numeric"
                placeholder={form.type === 'percent' ? '20' : '500'}
                disabled={form.type === 'delivery'}
                value={form.type === 'delivery' ? '100' : form.value}
                invalid={!!errors.value}
                onChange={(e) => set({ value: e.target.value.replace(/\D/g, '') })}
                right={form.type === 'percent' ? '% off' : form.type === 'fixed' ? '₦ off' : '%'}
              />
            </Field>
            <Field label="Minimum order (₦)" required>
              <Input inputMode="numeric" value={form.minOrder} onChange={(e) => set({ minOrder: e.target.value.replace(/\D/g, '') })} />
            </Field>
            <Field label="Redemption limit" optional>
              <Input inputMode="numeric" value={form.cap} right="uses" onChange={(e) => set({ cap: e.target.value.replace(/\D/g, '') })} />
            </Field>
          </div>

          <div>
            <p className="mb-1.5 text-[13px] font-medium">
              Runs from<span className="ml-0.5 text-brand-fg">*</span>
            </p>
            <div className="grid grid-cols-2 gap-3">
              <DatePicker aria-label="Start date" placeholder="Start date" value={form.start} invalid={!!errors.start} onChange={(start) => set({ start })} />
              <DatePicker aria-label="End date" placeholder="End date" value={form.end} min={form.start} invalid={!!errors.start} onChange={(end) => set({ end })} />
            </div>
            {errors.start && (
              <p role="alert" className="mt-1.5 text-xs font-medium text-bad-fg">
                {errors.start}
              </p>
            )}
          </div>

          <Field label="Applies to" required>
            <Select value={form.category} onChange={(category) => set({ category })} options={['Entire Store Menu', ...categories]} />
          </Field>
        </div>
      </Sheet>
    </>
  )
}

function PromoCard({ promo: p, onToggle }: { promo: Promotion; onToggle: () => void }) {
  const pct = p.cap ? Math.min(100, (p.redeemed / p.cap) * 100) : 55
  return (
    <div
      style={listCard(p.id)}
      className={cx('flex flex-col rounded-xl border border-transparent bg-white p-5 shadow-card', p.status === 'expired' && 'opacity-70')}
    >
      <div className="flex items-center justify-between gap-2">
        {p.status === 'active' && (
          <Badge tone="ok">
            Active
          </Badge>
        )}
        {p.status === 'scheduled' && <Badge tone="gray">Scheduled</Badge>}
        {p.status === 'expired' && <Badge tone="gray">Ended</Badge>}
        <span className="rounded-md border border-dashed border-line-strong bg-canvas px-2 py-0.5 font-mono text-xs font-medium tracking-wider">{p.code}</span>
      </div>
      <h3 className="mt-3 text-[15px] font-semibold">{p.name}</h3>
      <p className="mt-1 text-[13px] leading-5 text-muted">{p.description}</p>
      <div className="mb-4 mt-4 space-y-3 border-t border-line pt-4 text-[13px]">
        <div>
          <div className="mb-1.5 flex justify-between">
            <span className="text-muted">Redeemed</span>
            <span className="font-medium tabular-nums">{p.cap ? `${p.redeemed} / ${p.cap} ${p.unit}` : `${p.redeemed} ${p.unit}`}</span>
          </div>
          <Meter value={pct} tone={p.bar === 'ok' ? 'ok' : 'brand'} />
        </div>
        <p className="text-muted">
          <span className="text-gray-700">{p.period}</span>
          <br />
          {p.eligible}
        </p>
      </div>
      <div className="mt-auto flex items-center justify-between gap-2 border-t border-line pt-3 text-xs text-muted">
        {p.footer}
        {p.status !== 'expired' && (
          <Button variant="ghost" size="sm" className="-mr-2" onClick={onToggle}>
            {p.status === 'active' ? 'Pause' : 'Resume'}
          </Button>
        )}
      </div>
    </div>
  )
}
