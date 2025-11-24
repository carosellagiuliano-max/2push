import * as React from 'react'
import { cn } from '@/lib/utils'
import { Label } from './label'

export interface FormFieldProps {
  label: string
  htmlFor?: string
  error?: string
  description?: string
  required?: boolean
  className?: string
  children: React.ReactNode
}

const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ label, htmlFor, error, description, required, className, children }, ref) => {
    return (
      <div ref={ref} className={cn('space-y-2', className)}>
        <Label
          htmlFor={htmlFor}
          className={cn(error && 'text-destructive')}
        >
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
        {children}
        {description && !error && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>
    )
  }
)
FormField.displayName = 'FormField'

export { FormField }
