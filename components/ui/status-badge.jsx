import { Badge } from '@/components/ui/badge'
import { getStatusMeta } from '@/lib/ui/status'

function StatusBadge({ status, map, className }) {
  const meta = getStatusMeta(status, map)

  return (
    <Badge variant={meta.variant} className={className}>
      {meta.label}
    </Badge>
  )
}

export { StatusBadge }
