import { cn } from '@/lib/utils'

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted', className)}
      {...props}
    />
  )
}

// Pre-built skeleton components for common use cases
function SkeletonText({
  className,
  lines = 1,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { lines?: number }) {
  return (
    <div className={cn('space-y-2', className)} {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn('h-4', i === lines - 1 && lines > 1 && 'w-3/4')}
        />
      ))}
    </div>
  )
}

function SkeletonCard({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('rounded-lg border bg-card p-6 space-y-4', className)}
      {...props}
    >
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  )
}

function SkeletonAvatar({
  className,
  size = 'default',
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  size?: 'sm' | 'default' | 'lg'
}) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    default: 'h-10 w-10',
    lg: 'h-12 w-12',
  }

  return (
    <Skeleton
      className={cn('rounded-full', sizeClasses[size], className)}
      {...props}
    />
  )
}

function SkeletonButton({
  className,
  size = 'default',
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  size?: 'sm' | 'default' | 'lg'
}) {
  const sizeClasses = {
    sm: 'h-9 w-20',
    default: 'h-10 w-24',
    lg: 'h-11 w-28',
  }

  return (
    <Skeleton
      className={cn('rounded-md', sizeClasses[size], className)}
      {...props}
    />
  )
}

function SkeletonTable({
  className,
  rows = 5,
  columns = 4,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  rows?: number
  columns?: number
}) {
  return (
    <div className={cn('space-y-4', className)} {...props}>
      {/* Header */}
      <div className="flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4 py-2">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={colIndex}
              className={cn('h-4 flex-1', colIndex === 0 && 'w-1/4')}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

function SkeletonStatsCard({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('rounded-lg border bg-card p-6 space-y-3', className)}
      {...props}
    >
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-16" />
      <Skeleton className="h-3 w-20" />
    </div>
  )
}

function SkeletonDashboard({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('space-y-6', className)} {...props}>
      {/* Stats row */}
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonStatsCard key={i} />
        ))}
      </div>
      {/* Main content */}
      <div className="grid gap-6 lg:grid-cols-2">
        <SkeletonCard className="min-h-[300px]" />
        <SkeletonCard className="min-h-[300px]" />
      </div>
    </div>
  )
}

export {
  Skeleton,
  SkeletonText,
  SkeletonCard,
  SkeletonAvatar,
  SkeletonButton,
  SkeletonTable,
  SkeletonStatsCard,
  SkeletonDashboard,
}
