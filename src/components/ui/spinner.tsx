import { cn } from '@/lib/utils'

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'default' | 'lg'
}

function Spinner({ className, size = 'default', ...props }: SpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    default: 'h-6 w-6',
    lg: 'h-8 w-8',
  }

  return (
    <div
      className={cn('relative', sizeClasses[size], className)}
      {...props}
    >
      <svg
        className="animate-spin"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  )
}

interface LoadingOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  text?: string
}

function LoadingOverlay({
  className,
  text = 'Laden...',
  ...props
}: LoadingOverlayProps) {
  return (
    <div
      className={cn(
        'absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm',
        className
      )}
      {...props}
    >
      <Spinner size="lg" className="text-primary" />
      {text && (
        <p className="mt-4 text-sm text-muted-foreground">{text}</p>
      )}
    </div>
  )
}

interface LoadingPageProps {
  text?: string
}

function LoadingPage({ text = 'Laden...' }: LoadingPageProps) {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="flex flex-col items-center">
        <Spinner size="lg" className="text-primary" />
        <p className="mt-4 text-sm text-muted-foreground">{text}</p>
      </div>
    </div>
  )
}

export { Spinner, LoadingOverlay, LoadingPage }
