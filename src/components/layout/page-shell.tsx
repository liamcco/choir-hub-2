import { cn } from '@/lib/utils'

const pageShellSizes = {
  narrow: 'max-w-md',
  content: 'max-w-3xl',
  wide: 'max-w-7xl',
} as const

interface PageShellProps {
  children: React.ReactNode
  className?: string
  size?: keyof typeof pageShellSizes
}

export function PageShell({ children, className, size = 'wide' }: PageShellProps) {
  return (
    <div className={cn('mx-auto w-full px-4 py-6 sm:px-6 sm:py-10 lg:px-8', pageShellSizes[size], className)}>
      {children}
    </div>
  )
}

interface PageHeaderProps {
  className?: string
  description?: React.ReactNode
  title: React.ReactNode
}

export function PageHeader({ className, description, title }: PageHeaderProps) {
  return (
    <div className={cn('mb-6 space-y-2', className)}>
      <div className="min-w-0 space-y-2">
        <h1 className="text-2xl font-semibold tracking-normal">{title}</h1>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
    </div>
  )
}
