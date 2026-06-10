import { cn } from '@/lib/utils';

const pageShellSizes = {
  narrow: 'max-w-md',
  content: 'max-w-3xl',
  wide: 'max-w-7xl',
} as const;

interface PageShellProps {
  children: React.ReactNode;
  className?: string;
  size?: keyof typeof pageShellSizes;
}

export function PageShell({ children, className, size = 'wide' }: PageShellProps) {
  return (
    <div className={cn('mx-auto w-full px-4 py-6 sm:px-6 sm:py-10 lg:px-8', pageShellSizes[size], className)}>
      {children}
    </div>
  );
}

interface PageHeaderProps {
  actions?: React.ReactNode;
  className?: string;
  description?: React.ReactNode;
  title: React.ReactNode;
}

export function PageHeader({ actions, className, description, title }: PageHeaderProps) {
  return (
    <div className={cn('mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between', className)}>
      <div className="min-w-0 space-y-2">
        <h1 className="text-2xl font-semibold tracking-normal">{title}</h1>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  );
}
