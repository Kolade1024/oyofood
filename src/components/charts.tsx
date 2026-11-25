/** Shared Recharts styling so every chart in the portal reads as one system. */

export const chartColors = {
  brand: '#ee8a06',
  ink: '#1f2937',
  grid: '#eef0f2',
  axis: '#6b7280',
}

export const axisTick = { fontSize: 12, fill: chartColors.axis }

export function ChartTooltip({
  active,
  payload,
  label,
  format = (v) => String(v),
  names,
}: {
  active?: boolean
  payload?: { value: number; dataKey?: string | number; color?: string }[]
  label?: string
  format?: (v: number) => string
  names?: Record<string, string>
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="min-w-32 rounded-lg border border-transparent bg-white px-3 py-2 text-xs shadow-raised">
      <p className="mb-1 font-medium text-muted">{label}</p>
      {payload.map((p) => (
        <p key={String(p.dataKey)} className="flex items-center justify-between gap-4">
          {names && (
            <span className="flex items-center gap-1.5 text-gray-700">
              <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
              {names[String(p.dataKey)]}
            </span>
          )}
          <span className="font-semibold tabular-nums text-ink">{format(p.value)}</span>
        </p>
      ))}
    </div>
  )
}

export function Legend({ items }: { items: { label: string; color: string }[] }) {
  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-700">
      {items.map((i) => (
        <li key={i.label} className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ background: i.color }} />
          {i.label}
        </li>
      ))}
    </ul>
  )
}
