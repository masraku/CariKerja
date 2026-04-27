import { cva } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const iconBadgeVariants = cva(
  'inline-flex shrink-0 items-center justify-center rounded-xl border transition-colors [&_svg]:size-5',
  {
    variants: {
      variant: {
        default: 'border-primary/10 bg-primary/10 text-primary',
        muted: 'border-slate-200 bg-slate-50 text-slate-500',
        success: 'border-emerald-200 bg-emerald-50 text-emerald-600',
        warning: 'border-amber-200 bg-amber-50 text-amber-600',
        destructive: 'border-red-200 bg-red-50 text-red-600',
        inverse: 'border-white/15 bg-white/10 text-white'
      },
      size: {
        sm: 'size-9',
        default: 'size-11',
        lg: 'size-14'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
)

function IconBadge({ className, variant, size, icon: Icon, children, ...props }) {
  return (
    <span
      data-slot="icon-badge"
      className={cn(iconBadgeVariants({ variant, size, className }))}
      {...props}
    >
      {Icon ? <Icon /> : children}
    </span>
  )
}

export { IconBadge, iconBadgeVariants }
