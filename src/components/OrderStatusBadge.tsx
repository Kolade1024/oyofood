import { Badge } from './ui'
import type { Order } from '../data/mock'

/** One status language everywhere: new → brand, preparing → info, ready → ok, done → gray, cancelled → bad. */
export function OrderStatusBadge({ order: o }: { order: Order }) {
  switch (o.status) {
    case 'incoming':
      return (
        <Badge tone="brand">
          New · {o.minsAgo}m ago
        </Badge>
      )
    case 'prep':
      return <Badge tone="info">Preparing · {o.prepLeft}m left</Badge>
    case 'ready':
      return <Badge tone="ok">{o.rider ? 'Rider waiting' : 'Ready for pickup'}</Badge>
    case 'completed':
      return <Badge tone="gray">Completed</Badge>
    case 'cancelled':
      return <Badge tone="bad">{o.paid === 'Rejected by vendor' ? 'Rejected' : 'Cancelled'}</Badge>
  }
}
