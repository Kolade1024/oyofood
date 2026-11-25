import { useEffect, useState } from 'react'
import { Check, Trash2 } from 'lucide-react'
import {
  Badge,
  Button,
  Card,
  CardHeader,
  Field,
  IconButton,
  Input,
  Modal,
  PageBody,
  PageHeader,
  Select,
  Toggle,
  inputBase,
  usePresence,
} from '../../components/ui'
import { useApp } from '../../context/AppContext'
import { weekDays } from '../../data/mock'
import { cx } from '../../lib/format'

const branches = [
  { name: 'Bukka Hut - Bodija Main Branch', address: 'Plot 4, Oshuntokun Avenue, Old Bodija, Ibadan', outlet: '#01' },
  { name: 'Bukka Hut - Ring Road', address: '12 Ring Road, Challenge, Ibadan', outlet: '#02' },
  { name: 'Bukka Hut - UI Gate', address: 'Opp. UI Main Gate, Agbowo, Ibadan', outlet: '#03' },
]

const hoursBetween = (open: string, close: string) => {
  const [oh, om] = open.split(':').map(Number)
  const [ch, cm] = close.split(':').map(Number)
  let mins = ch * 60 + cm - (oh * 60 + om)
  if (mins <= 0) mins += 24 * 60
  return mins / 60
}

const defaultExtras = { radius: 8.5, pickup: true, buffer: '15-20' }

export default function OperatingHours() {
  const { schedule, setSchedule, storeOpen, notify } = useApp()
  const [draft, setDraft] = useState(schedule)
  const [branch, setBranch] = useState(0)
  const [switchOpen, setSwitchOpen] = useState(false)
  const [radius, setRadius] = useState(defaultExtras.radius)
  const [pickup, setPickup] = useState(defaultExtras.pickup)
  const [buffer, setBuffer] = useState(defaultExtras.buffer)
  const [savedExtras, setSavedExtras] = useState(defaultExtras)
  const [closures, setClosures] = useState([{ title: 'End of Year Deep Cleaning', from: '2026-12-25', to: '2026-12-26' }])
  const [closureOpen, setClosureOpen] = useState(false)
  const [closure, setClosure] = useState({ title: '', from: '', to: '' })

  const dirty =
    JSON.stringify(draft) !== JSON.stringify(schedule) ||
    radius !== savedExtras.radius ||
    pickup !== savedExtras.pickup ||
    buffer !== savedExtras.buffer
  const barMounted = usePresence(dirty, 140)

  const update = (i: number, patch: Partial<(typeof draft)[number]>) => setDraft((d) => d.map((x, j) => (j === i ? { ...x, ...patch } : x)))

  const save = () => {
    setSchedule(draft)
    setSavedExtras({ radius, pickup, buffer })
    notify('Operational changes saved')
  }
  const discard = () => {
    setDraft(schedule)
    setRadius(savedExtras.radius)
    setPickup(savedExtras.pickup)
    setBuffer(savedExtras.buffer)
  }

  // Warn before closing the tab with unsaved changes.
  useEffect(() => {
    if (!dirty) return
    const onUnload = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', onUnload)
    return () => window.removeEventListener('beforeunload', onUnload)
  }, [dirty])

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  const b = branches[branch]
  const closureInvalid = !!closure.from && !!closure.to && closure.to < closure.from

  return (
    <>
      <PageHeader
        title="Hours & delivery"
        actions={
          <Button icon={<Check size={16} />} disabled={!dirty} onClick={save}>
            Save changes
          </Button>
        }
      />

      <PageBody className={cx(dirty && 'pb-28')}>
        <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
          <div className="min-w-0 flex-1">
            <p className="flex flex-wrap items-center gap-2 text-[15px] font-semibold">
              {b.name}
              <Badge tone={storeOpen ? 'ok' : 'gray'}>
                {storeOpen ? 'Open now' : 'Closed'}
              </Badge>
            </p>
            <p className="mt-0.5 text-[13px] text-muted">
              {b.address} · Outlet {b.outlet}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={() => setSwitchOpen(true)}>
              Switch outlet
            </Button>
            <Button variant="ghost" size="sm" onClick={() => notify('Branch onboarding opens from the main OYO Food merchant team', 'info')}>
              Add branch
            </Button>
          </div>
        </Card>

        <div className="grid items-start gap-4 xl:grid-cols-[1fr_380px]">
          <Card className="p-5">
            <CardHeader
              title="Weekly schedule"
              description="Ordering opens and closes automatically at these times."
              action={
                <Button
                  variant="ghost"
                  size="sm"
                  className="-mr-2"
                  onClick={() => {
                    setDraft((d) => d.map(() => ({ ...d[0] })))
                    notify("Monday's hours applied to all days", 'info')
                  }}
                >
                  Copy Monday to all
                </Button>
              }
            />
            <ul className="mt-4 divide-y divide-line border-t border-line">
              {weekDays.map((day, i) => {
                const d = draft[i]
                const hrs = hoursBetween(d.open, d.close)
                const late = d.close >= '23:00' || d.close < d.open
                return (
                  <li key={day} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3">
                    <span className="flex w-36 items-center gap-3">
                      <Toggle checked={d.enabled} onChange={(v) => update(i, { enabled: v })} label={`Open on ${day}`} />
                      <span className={cx('text-sm font-medium', !d.enabled && 'text-muted')}>{day}</span>
                    </span>
                    {d.enabled ? (
                      <span className="flex flex-1 flex-wrap items-center gap-2">
                        <input
                          type="time"
                          aria-label={`${day} opening time`}
                          value={d.open}
                          onChange={(e) => update(i, { open: e.target.value })}
                          className={cx(inputBase.replace('w-full ', ''), 'h-9 w-[124px] px-2.5 tabular-nums')}
                        />
                        <span className="text-[13px] text-muted">to</span>
                        <input
                          type="time"
                          aria-label={`${day} closing time`}
                          value={d.close}
                          onChange={(e) => update(i, { close: e.target.value })}
                          className={cx(inputBase.replace('w-full ', ''), 'h-9 w-[124px] px-2.5 tabular-nums')}
                        />
                        <span className="ml-auto flex items-center gap-2 text-[13px] text-muted tabular-nums">
                          {hrs % 1 ? hrs.toFixed(1) : hrs} hrs
                          {late && <Badge tone="info">Late</Badge>}
                        </span>
                      </span>
                    ) : (
                      <span className="text-[13px] text-muted">Closed all day</span>
                    )}
                  </li>
                )
              })}
            </ul>
          </Card>

          <div className="space-y-4">
            <Card className="p-5">
              <CardHeader title="Delivery & pickup" />
              <div className="mt-4">
                <div className="flex items-baseline justify-between text-[13px]">
                  <label htmlFor="radius" className="font-medium">
                    Delivery radius
                  </label>
                  <span className="font-semibold tabular-nums">{radius} km</span>
                </div>
                <input
                  id="radius"
                  type="range"
                  min={2}
                  max={15}
                  step={0.5}
                  value={radius}
                  aria-valuetext={`${radius} kilometres`}
                  onChange={(e) => setRadius(Number(e.target.value))}
                  className="mt-3 h-1.5 w-full cursor-pointer accent-ink"
                />
                <div className="mt-1 flex justify-between text-xs text-muted tabular-nums">
                  <span>2 km</span>
                  <span>15 km</span>
                </div>
                <p className="mt-2 text-[13px] text-muted">
                  Covers {radius < 5 ? 'Bodija and UI' : radius < 10 ? 'Bodija, UI, Secretariat, Samonda and Agodi GRA' : 'most of Ibadan North & North-East'}
                </p>
              </div>
              <div className="mt-5 flex items-center justify-between gap-4 border-t border-line pt-5">
                <div>
                  <p className="text-[13px] font-medium">Customer pickup</p>
                  <p className="text-[13px] text-muted">Let customers collect at your counter</p>
                </div>
                <Toggle checked={pickup} onChange={setPickup} label="Customer pickup" />
              </div>
              <Field label="Default prep buffer" className="mt-5 border-t border-line pt-5">
                <Select value={buffer} onChange={(e) => setBuffer(e.target.value)}>
                  <option value="10-15">10–15 min · fast</option>
                  <option value="15-20">15–20 min · standard</option>
                  <option value="25-35">25–35 min · busy kitchen</option>
                </Select>
              </Field>
            </Card>

            <Card className="p-5">
              <CardHeader title="Planned closures" />
              <ul className="mt-4 space-y-2">
                {closures.map((c, i) => (
                  <li key={i} className="flex items-start gap-3 rounded-lg border border-line p-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium">{c.title}</p>
                      <p className="mt-0.5 text-xs text-muted">
                        {fmtDate(c.from)} – {fmtDate(c.to)} · reopens next day at 8:00 AM
                      </p>
                    </div>
                    <IconButton
                      size="sm"
                      variant="dangerGhost"
                      label={`Remove ${c.title}`}
                      className="-mr-1 -mt-1"
                      onClick={() => {
                        setClosures((cs) => cs.filter((_, j) => j !== i))
                        notify('Closure removed', 'info')
                      }}
                    >
                      <Trash2 size={15} />
                    </IconButton>
                  </li>
                ))}
                {closures.length === 0 && <li className="rounded-lg border border-dashed border-line-strong p-4 text-center text-[13px] text-muted">No closures planned</li>}
              </ul>
              <Button variant="secondary" className="mt-3 w-full" onClick={() => setClosureOpen(true)}>
                Schedule closure
              </Button>
            </Card>
          </div>
        </div>
      </PageBody>

      {barMounted && (
        <div className="pointer-events-none fixed inset-x-0 bottom-4 z-30 flex justify-center px-4 lg:left-64">
          <div
            role="region"
            aria-label="Unsaved changes"
            className={cx(
              'pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-xl bg-ink py-2.5 pl-4 pr-2.5 text-white shadow-overlay',
              dirty ? 'animate-pop-in' : 'animate-pop-out',
            )}
          >
            <p className="flex-1 text-sm">Unsaved changes</p>
            <button type="button" onClick={discard} className="h-8 rounded-lg px-3 text-[13px] font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white">
              Discard
            </button>
            <button
              type="button"
              onClick={save}
              className="h-8 rounded-lg bg-white px-3 text-[13px] font-medium text-ink transition-[background-color,scale] hover:bg-white/90 motion-safe:active:scale-[0.98]"
            >
              Save
            </button>
          </div>
        </div>
      )}

      <Modal open={switchOpen} onClose={() => setSwitchOpen(false)} title="Switch outlet">
        <div role="radiogroup" aria-label="Outlet" className="space-y-2">
          {branches.map((br, i) => (
            <button
              key={br.name}
              type="button"
              role="radio"
              aria-checked={branch === i}
              onClick={() => {
                setBranch(i)
                setSwitchOpen(false)
              }}
              className={cx(
                'flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors',
                branch === i ? 'border-ink ring-1 ring-inset ring-ink' : 'border-line-strong hover:bg-canvas',
              )}
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{br.name}</p>
                <p className="text-xs text-muted">{br.address}</p>
              </div>
              {branch === i && <Check size={16} className="shrink-0" />}
            </button>
          ))}
        </div>
      </Modal>

      <Modal
        open={closureOpen}
        onClose={() => setClosureOpen(false)}
        title="Schedule a closure"
        description="Customers won't be able to order during these dates."
        footer={
          <>
            <Button variant="secondary" onClick={() => setClosureOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!closure.title.trim() || !closure.from || !closure.to || closure.to < closure.from}
              onClick={() => {
                setClosures((c) => [...c, closure])
                setClosure({ title: '', from: '', to: '' })
                setClosureOpen(false)
                notify('Closure scheduled')
              }}
            >
              Schedule closure
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Reason">
            <Input autoFocus placeholder="e.g. Staff retreat" value={closure.title} onChange={(e) => setClosure({ ...closure, title: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="From">
              <Input type="date" value={closure.from} onChange={(e) => setClosure({ ...closure, from: e.target.value })} />
            </Field>
            <Field label="To" error={closureInvalid ? 'Must be on or after the start date' : undefined}>
              <Input type="date" min={closure.from} value={closure.to} invalid={closureInvalid} onChange={(e) => setClosure({ ...closure, to: e.target.value })} />
            </Field>
          </div>
        </div>
      </Modal>
    </>
  )
}
