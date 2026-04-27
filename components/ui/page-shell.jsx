import { cn } from '@/lib/utils'

function PageShell({ className, children, ...props }) {
  return (
    <div
      data-slot="page-shell"
      className={cn('mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8', className)}
      {...props}
    >
      {children}
    </div>
  )
}

function PageHeader({ className, children, ...props }) {
  return (
    <div
      data-slot="page-header"
      className={cn('mb-8 flex flex-col gap-2', className)}
      {...props}
    >
      {children}
    </div>
  )
}

export { PageShell, PageHeader }
