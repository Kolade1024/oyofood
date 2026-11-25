import { useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { CalendarDays, Download } from 'lucide-react'
import { Button, Card, CardHeader, Meter, PageBody, PageHeader, Select, StatCard, Table, Td, Th, Tr } from '../../components/ui'
import { ChartTooltip, Legend, axisTick, chartColors } from '../../components/charts'
import { useApp } from '../../context/AppContext'
import { categoryPerformance, peakHours, weeklyRevenue } from '../../data/mock'
import { naira } from '../../lib/format'

const ranges = {
  '30': { label: 'Last 30 days', sub: 'Oct 12 – Nov 11', factor: 1 },
  '7': { label: 'Last 7 days', sub: 'Nov 5 – Nov 11', factor: 0.27 },
  '90': { label: 'Last 90 days', sub: 'Aug 13 – Nov 11', factor: 2.7 },
}

const seriesNames = { delivery: 'Delivery', pickup: 'Pickup' }
const peakTone = { 'bg-brand': 'brand', 'bg-ink': 'ink', 'bg-gray-500': 'gray' } as const

export default function Analytics() {
  const { notify } = useApp()
  const [range, setRange] = useState<keyof typeof ranges>('30')
  const f = ranges[range].factor

  return (
    <>
      <PageHeader
        title="Analytics"
        actions={
          <>
            <div className="relative">
              <CalendarDays size={16} className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-muted" />
              <Select
                aria-label="Date range"
                value={range}
                onChange={(e) => setRange(e.target.value as keyof typeof ranges)}
                className="w-auto border-line-strong pl-9 text-[13px] font-medium"
              >
                {Object.entries(ranges).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.label} ({v.sub})
                  </option>
                ))}
              </Select>
            </div>
            <Button
              variant="secondary"
              icon={<Download size={16} />}
              onClick={() => {
                notify('Preparing analytics PDF…', 'info')
                setTimeout(() => window.print(), 300)
              }}
            >
              Export PDF
            </Button>
          </>
        }
      />

      <PageBody>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Gross sales" value={naira(Math.round(4892300 * f))} delta="+22.4%" hint="vs previous period" />
          <StatCard label="Orders fulfilled" value={Math.round(1124 * f).toLocaleString()} delta="+16.8%" hint="vs previous period" />
          <StatCard
            label="Repeat customers"
            value="64.2%"
            hint={`${Math.round(722 * f)} regulars`}
          />
          <StatCard label="Avg. dispatch time" value="17.4 min" hint="from accept to handover" />
        </div>

        <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
          <Card className="p-5">
            <CardHeader
              title="Weekly revenue"
              action={
                <Legend
                  items={[
                    { label: 'Delivery', color: chartColors.brand },
                    { label: 'Pickup', color: chartColors.ink },
                  ]}
                />
              }
            />
            <div className="mt-5 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={weeklyRevenue.map((w) => ({ ...w, delivery: +(w.delivery * f).toFixed(2), pickup: +(w.pickup * f).toFixed(2) }))}
                  barGap={4}
                  margin={{ left: -8, right: 4, top: 8 }}
                >
                  <CartesianGrid vertical={false} stroke={chartColors.grid} />
                  <XAxis dataKey="week" tickLine={false} axisLine={false} tick={axisTick} dy={6} />
                  <YAxis tickLine={false} axisLine={false} tick={axisTick} tickFormatter={(v: number) => `₦${v}M`} />
                  <Tooltip cursor={{ fill: 'oklch(0 0 0 / 0.03)' }} content={<ChartTooltip names={seriesNames} format={(v) => `₦${v}M`} />} />
                  <Bar dataKey="delivery" fill={chartColors.brand} radius={[4, 4, 0, 0]} maxBarSize={28} animationDuration={500} />
                  <Bar dataKey="pickup" fill={chartColors.ink} radius={[4, 4, 0, 0]} maxBarSize={28} animationDuration={500} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex flex-wrap justify-between gap-2 border-t border-line pt-4 text-[13px] text-muted">
              <span>
                Best day <span className="font-medium text-ink">Sunday · family combos</span>
              </span>
              <span>
                Avg. cart <span className="font-medium text-ink tabular-nums">2.8 meals</span>
              </span>
            </div>
          </Card>

          <Card className="flex flex-col p-5">
            <CardHeader title="Peak hours" description="Share of daily orders" />
            <ul className="mt-5 space-y-4">
              {peakHours.map((p) => (
                <li key={p.label}>
                  <div className="mb-1.5 flex items-baseline justify-between gap-2 text-[13px]">
                    <span>
                      <span className="font-medium">{p.label}</span> <span className="text-muted">{p.sub.replace(/[()]/g, '')}</span>
                    </span>
                    <span className="font-semibold tabular-nums">{p.pct}%</span>
                  </div>
                  <Meter value={p.pct} tone={peakTone[p.color as keyof typeof peakTone] ?? 'gray'} label={`${p.label}: ${p.pct}% of volume`} />
                </li>
              ))}
            </ul>
            <div className="mt-auto pt-5">
              <p className="rounded-lg bg-brand-50 p-3 text-[13px] leading-5 text-gray-800">
                <span className="font-medium text-ink">Tip:</span> pre-prep jollof chicken and stew by 11:30 AM to cut lunch-rush waits by about 6 minutes.
              </p>
            </div>
          </Card>
        </div>

        <Card className="overflow-hidden">
          <CardHeader className="p-5" title="Performance by category" />
          <Table minWidth={760}>
            <thead>
              <tr>
                <Th>Category</Th>
                <Th align="right">Items</Th>
                <Th align="right">Units sold</Th>
                <Th align="right">Revenue</Th>
                <Th>Share of sales</Th>
                <Th align="right">Growth</Th>
              </tr>
            </thead>
            <tbody>
              {categoryPerformance.map((c) => (
                <Tr key={c.name}>
                  <Td className="font-medium">{c.name}</Td>
                  <Td align="right" className="tabular-nums text-muted">
                    {c.items}
                  </Td>
                  <Td align="right" className="tabular-nums">
                    {c.units}
                  </Td>
                  <Td align="right" className="font-medium tabular-nums">
                    {naira(Math.round(c.revenue * f))}
                  </Td>
                  <Td>
                    <span className="flex items-center gap-3">
                      <Meter value={c.share} className="w-24" />
                      <span className="tabular-nums text-gray-700">{c.share}%</span>
                    </span>
                  </Td>
                  <Td align="right" className="font-medium tabular-nums text-ok-fg">
                    +{c.growth.toFixed(1)}%
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </Card>
      </PageBody>
    </>
  )
}
