import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Download, Plus, ReceiptText } from 'lucide-react'
import { OrderStatusBadge } from '../../components/OrderStatusBadge'
import { Badge, Button, Card, CardHeader, EmptyState, PageBody, PageHeader, StatCard, Table, Tabs, Td, Th, Tr } from '../../components/ui'
import { ChartTooltip, axisTick, chartColors } from '../../components/charts'
import { useApp } from '../../context/AppContext'
import { hourlySales, orderTotal, topMeals, vendor, weeklySales } from '../../data/mock'
import { naira } from '../../lib/format'

function greeting() {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
}

export default function Dashboard() {
  const nav = useNavigate()
  const { orders, setOrderStatus, notify } = useApp()
  const [range, setRange] = useState<'hourly' | 'weekly'>('hourly')

  const incoming = orders.filter((o) => o.status === 'incoming')
  const prep = orders.filter((o) => o.status === 'prep')
  const ready = orders.filter((o) => o.status === 'ready')
  const queue = [...incoming.slice(0, 2), ...prep.slice(0, 1), ...ready.slice(0, 1)]

  const exportReport = () => {
    const rows = [['Order ID', 'Customer', 'Items', 'Amount', 'Method', 'Status']]
    orders.forEach((o) =>
      rows.push([o.id, o.customer, o.items.map((i) => `${i.qty}x ${i.name}`).join('; '), String(orderTotal(o)), o.method, o.status]),
    )
    const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = `oyo-daily-report-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    notify('Daily report downloaded')
  }

  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <>
      <PageHeader
        title={`${greeting()}, Babatunde`}
        subtitle={
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {vendor.branch}
            <span aria-hidden className="text-subtle">
              ·
            </span>
            {today}
            <Badge tone="ok" className="ml-1">
              Verified
            </Badge>
          </span>
        }
        actions={
          <>
            <Button variant="secondary" icon={<Download size={16} />} onClick={exportReport}>
              Export report
            </Button>
            <Button icon={<Plus size={16} />} onClick={() => nav('/menu?add=1')}>
              Add meal
            </Button>
          </>
        }
      />

      <PageBody>
        {incoming.length > 0 && (
          <div className="flex flex-col gap-3 rounded-xl border border-brand-100 bg-brand-50 p-4 sm:flex-row sm:items-center sm:gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">
                {incoming.length} new {incoming.length === 1 ? 'order' : 'orders'} waiting
              </p>
            </div>
            <Button size="sm" onClick={() => nav('/orders')}>
              Review orders
            </Button>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Revenue today" value="₦348,200" delta="+18.4%" hint="vs yesterday" />
          <StatCard label="Orders today" value="74" delta="+12%" hint={`${incoming.length} incoming now`} />
          <StatCard label="Kitchen queue" value={`${prep.length + incoming.length} active`} hint={`${ready.length} ready for pickup`} />
          <StatCard label="Avg. order value" value="₦4,705" delta="+4.5%" hint="high combo demand" />
        </div>

        <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
          <Card className="p-5">
            <CardHeader
              title="Sales"
              description={range === 'hourly' ? 'Today · peak lunch rush 1:00–3:00 PM' : 'This week'}
              action={
                <Tabs
                  style="segmented"
                  label="Sales range"
                  value={range}
                  onChange={setRange}
                  tabs={[
                    { id: 'hourly', label: 'Today' },
                    { id: 'weekly', label: 'Week' },
                  ]}
                />
              }
            />
            <div className="mt-5 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={range === 'hourly' ? hourlySales : weeklySales} margin={{ left: -8, right: 8, top: 8 }}>
                  <defs>
                    <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={chartColors.brand} stopOpacity={0.22} />
                      <stop offset="100%" stopColor={chartColors.brand} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke={chartColors.grid} />
                  <XAxis dataKey="t" tickLine={false} axisLine={false} tick={axisTick} dy={6} />
                  <YAxis tickLine={false} axisLine={false} tick={axisTick} tickFormatter={(v: number) => `₦${v / 1000}k`} />
                  <Tooltip content={<ChartTooltip format={(v) => naira(v)} />} cursor={{ stroke: chartColors.grid, strokeWidth: 1 }} />
                  <Area
                    type="monotone"
                    dataKey="v"
                    stroke={chartColors.brand}
                    strokeWidth={2}
                    fill="url(#salesFill)"
                    activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff' }}
                    animationDuration={500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-4 border-t border-line pt-4 text-[13px] text-muted">
              Avg. kitchen turnaround <span className="font-medium text-ink tabular-nums">18 mins</span>
            </p>
          </Card>

          <Card className="flex flex-col p-5">
            <CardHeader
              title="Top sellers"
              description="Last 7 days"
              action={
                <Button variant="ghost" size="sm" className="-mr-2" onClick={() => nav('/menu')}>
                  View menu
                </Button>
              }
            />
            <ol className="mt-3 flex-1 divide-y divide-line">
              {topMeals.map((m, i) => (
                <li key={m.name} className="flex items-center gap-3 py-3">
                  <span className="w-5 shrink-0 text-center text-[13px] font-medium text-muted tabular-nums">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{m.name}</p>
                    <p className="text-xs text-muted tabular-nums">
                      {m.orders} · {naira(m.revenue)}
                    </p>
                  </div>
                  <span className="text-xs font-medium text-ok-fg tabular-nums">+{m.growth}%</span>
                </li>
              ))}
            </ol>
            <p className="mt-2 border-t border-line pt-3 text-xs text-muted">98.2% positive customer satisfaction</p>
          </Card>
        </div>

        <Card className="overflow-hidden">
          <CardHeader
            className="p-5"
            title="Kitchen queue"
            action={
              <Button variant="secondary" size="sm" onClick={() => nav('/orders')}>
                All orders
              </Button>
            }
          />
          <Table minWidth={860}>
            <thead>
              <tr>
                <Th>Order</Th>
                <Th>Customer</Th>
                <Th>Items</Th>
                <Th align="right">Amount</Th>
                <Th>Method</Th>
                <Th>Status</Th>
                <Th align="right">
                  <span className="sr-only">Action</span>
                </Th>
              </tr>
            </thead>
            <tbody>
              {queue.map((o) => (
                <Tr key={o.id}>
                  <Td className="font-medium tabular-nums">#{o.id}</Td>
                  <Td>
                    <p className="font-medium">{o.customer}</p>
                    <p className="text-xs text-muted tabular-nums">{o.phone}</p>
                  </Td>
                  <Td className="max-w-[240px]">
                    <p className="truncate">{o.items.map((i) => `${i.qty}× ${i.name}`).join(', ')}</p>
                    {o.note && <p className="truncate text-xs text-muted">Note: “{o.note}”</p>}
                  </Td>
                  <Td align="right" className="font-medium tabular-nums">
                    {naira(orderTotal(o))}
                  </Td>
                  <Td className="text-gray-700">{o.method}</Td>
                  <Td>
                    <OrderStatusBadge order={o} />
                  </Td>
                  <Td align="right">
                    {o.status === 'incoming' && (
                      <Button
                        size="sm"
                        className="w-28"
                        onClick={() => {
                          setOrderStatus(o.id, 'prep', { prepMins: 20, prepLeft: 20 })
                          notify(`#${o.id} accepted and sent to the kitchen`)
                        }}
                      >
                        Accept
                      </Button>
                    )}
                    {o.status === 'prep' && (
                      <Button
                        variant="success"
                        size="sm"
                        className="w-28"
                        onClick={() => {
                          setOrderStatus(o.id, 'ready')
                          notify(`#${o.id} marked ready for pickup`)
                        }}
                      >
                        Mark ready
                      </Button>
                    )}
                    {o.status === 'ready' && (
                      <Button variant="secondary" size="sm" className="w-28" onClick={() => nav('/orders?tab=ready')}>
                        Hand over
                      </Button>
                    )}
                  </Td>
                </Tr>
              ))}
              {queue.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-5">
                    <EmptyState
                      icon={<ReceiptText size={18} />}
                      title="Kitchen queue is clear"
                      description="New orders will appear here the moment customers place them."
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card>
      </PageBody>
    </>
  )
}
