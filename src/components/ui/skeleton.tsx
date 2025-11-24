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

export { Skeleton, SkeletonText, SkeletonCard, SkeletonAvatar, SkeletonButton }
