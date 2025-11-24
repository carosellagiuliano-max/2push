import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combines class names using clsx and merges Tailwind classes intelligently.
 * Use this for all dynamic class name composition.
 *
 * @example
 * cn('px-4 py-2', isActive && 'bg-brand-600', className)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
