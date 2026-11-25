import { useState } from 'react'
import { CircleCheck, MessageSquareReply, MessagesSquare } from 'lucide-react'
import { Avatar, Badge, Button, Card, EmptyState, Meter, PageBody, PageHeader, Stars, Tabs, Textarea } from '../../components/ui'
import { Select } from '../../components/Select'
import { useApp } from '../../context/AppContext'
import { ratingBreakdown } from '../../data/mock'
import type { Review } from '../../data/mock'
import { listCard, withViewTransition } from '../../lib/viewTransition'

type Filter = 'all' | 'five' | 'reply' | 'photos'

export default function Reviews() {
  const { reviews, replyToReview, notify } = useApp()
  const [filter, setFilter] = useState<Filter>('all')
  const [sort, setSort] = useState<'recent' | 'high' | 'low'>('recent')

  const needsReply = reviews.filter((r) => !r.reply).length
  const maxCount = Math.max(...ratingBreakdown.map((r) => r.count))

  let list = reviews.filter((r) =>
    filter === 'five' ? r.rating === 5 : filter === 'reply' ? !r.reply : filter === 'photos' ? r.hasPhoto : true,
  )
  if (sort === 'high') list = [...list].sort((a, b) => b.rating - a.rating)
  if (sort === 'low') list = [...list].sort((a, b) => a.rating - b.rating)

  return (
    <>
      <PageHeader
        title="Reviews"
        actions={<Badge tone="ok">Top rated merchant 2026</Badge>}
      />

      <PageBody>
        <Card className="grid gap-6 p-5 md:grid-cols-[220px_1fr] lg:grid-cols-[220px_1fr_260px] lg:items-center">
          <div className="md:border-r md:border-line md:pr-6">
            <p className="text-[13px] font-medium text-muted">Overall rating</p>
            <p className="mt-2 flex items-baseline gap-1.5">
              <span className="text-4xl font-semibold tracking-tight tabular-nums">4.8</span>
              <span className="text-sm text-muted">/ 5</span>
            </p>
            <div className="mt-2">
              <Stars value={4.8} size={18} />
            </div>
            <p className="mt-3 text-[13px] text-muted">
              From <span className="font-medium text-ink">482 verified reviews</span>
            </p>
            <p className="mt-0.5 text-[13px] font-medium text-ok-fg">94% would recommend you</p>
          </div>

          <ul className="space-y-2" aria-label="Rating distribution">
            {ratingBreakdown.map((r) => (
              <li key={r.stars} className="flex items-center gap-3 text-[13px]">
                <span className="w-10 shrink-0 tabular-nums text-gray-700">{r.stars} ★</span>
                <Meter value={Math.max(1, (r.count / maxCount) * 100)} tone={r.stars >= 3 ? 'brand' : 'bad'} className="flex-1" />
                <span className="w-9 text-right tabular-nums text-muted">{r.count}</span>
              </li>
            ))}
          </ul>

          <div className="space-y-4 md:col-span-2 lg:col-span-1 lg:border-l lg:border-line lg:pl-6">
            {(
              [
                ['Taste', 4.9],
                ['Packaging', 4.7],
                ['Portion size', 4.8],
              ] as const
            ).map(([label, v]) => (
              <div key={label}>
                <div className="mb-1.5 flex justify-between gap-2 text-[13px]">
                  <span className="text-gray-700">{label}</span>
                  <span className="font-medium tabular-nums">{v}</span>
                </div>
                <Meter value={(v / 5) * 100} tone="ok" label={`${label}: ${v} out of 5`} />
              </div>
            ))}
          </div>
        </Card>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Tabs
            style="segmented"
            label="Filter reviews"
            value={filter}
            onChange={setFilter}
            tabs={[
              { id: 'all', label: 'All', count: 480 + reviews.length - 2 },
              { id: 'reply', label: 'Needs reply', count: needsReply },
              { id: 'five', label: '5 stars', count: 395 },
              { id: 'photos', label: 'With photos', count: 86 },
            ]}
          />
          <Select
            aria-label="Sort reviews"
            align="right"
            value={sort}
            onChange={setSort}
            className="h-9 w-auto! border-line-strong sm:text-[13px]"
            options={[
              { value: 'recent', label: 'Most recent' },
              { value: 'high', label: 'Highest rating' },
              { value: 'low', label: 'Lowest rating' },
            ]}
          />
        </div>

        <div className="space-y-3">
          {list.map((r) => (
            <ReviewCard
              key={r.id}
              review={r}
              onReply={(text) => {
                withViewTransition(() => replyToReview(r.id, text))
                notify(`Reply posted to ${r.name.split(' ')[0]}`)
              }}
            />
          ))}
          {list.length === 0 &&
            (filter === 'reply' ? (
              <EmptyState icon={<CircleCheck size={18} />} title="You're all caught up" description="Every review has a reply. Nice work." />
            ) : (
              <EmptyState icon={<MessagesSquare size={18} />} title="No reviews match this filter" />
            ))}
        </div>
      </PageBody>
    </>
  )
}

function ReviewCard({ review: r, onReply }: { review: Review; onReply: (text: string) => void }) {
  const [draft, setDraft] = useState('')
  const [open, setOpen] = useState(!r.reply && r.rating < 5)
  const first = r.name.split(' ')[0]
  const canPost = draft.trim().length >= 3

  return (
    <div style={listCard(r.id)} className="rounded-xl border border-transparent bg-white p-5 shadow-card">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar name={r.name} size="lg" />
          <div className="min-w-0">
            <p className="text-sm font-medium">{r.name}</p>
            <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-muted">
              <Stars value={r.rating} size={13} />
              <span>{r.when}</span>
              <span className="text-ok-fg">{r.verified}</span>
            </p>
          </div>
        </div>
        <span className="hidden shrink-0 font-mono text-xs text-muted sm:inline">{r.order}</span>
      </div>

      <p className="mt-4 text-sm leading-6 text-gray-800">{r.text}</p>

      {r.items && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {r.items.map((i) => (
            <span key={i} className="rounded-md bg-hover px-2 py-0.5 text-xs text-gray-700">
              {i}
            </span>
          ))}
        </div>
      )}

      {r.reply ? (
        <div className="mt-4 rounded-lg bg-canvas px-4 py-3">
          <div className="flex justify-between gap-3 text-[13px]">
            <span className="font-medium">Your reply</span>
            <span className="text-xs text-muted">{r.reply.when}</span>
          </div>
          <p className="mt-1 text-[13px] leading-5 text-gray-700">{r.reply.text}</p>
        </div>
      ) : open ? (
        <form
          className="mt-4"
          onSubmit={(e) => {
            e.preventDefault()
            if (canPost) onReply(draft.trim())
          }}
        >
          <label htmlFor={`reply-${r.id}`} className="text-[13px] font-medium">
            Reply to {first}
          </label>
          <Textarea
            id={`reply-${r.id}`}
            rows={3}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && canPost) {
                e.preventDefault()
                onReply(draft.trim())
              }
            }}
            placeholder={`Hello ${first}, thank you for your feedback…`}
            className="mt-1.5 min-h-0"
          />
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-muted">Visible to everyone. ⌘/Ctrl + Enter to post.</p>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={!canPost}>
                Post reply
              </Button>
            </div>
          </div>
        </form>
      ) : (
        <Button variant="ghost" size="sm" icon={<MessageSquareReply size={16} />} className="-ml-2.5 mt-3" onClick={() => setOpen(true)}>
          Reply
        </Button>
      )}
    </div>
  )
}
