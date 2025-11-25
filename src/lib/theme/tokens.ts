/**
 * Theme Tokens System
 *
 * Per-salon theming with CSS custom properties.
 * Each salon can customize their branding without code changes.
 */

export interface ThemeTokens {
  // Brand colors
  primaryColor: string
  primaryForeground: string

  // Optional extended palette
  secondaryColor?: string
  accentColor?: string

  // Logo
  logoUrl?: string
  logoAlt?: string

  // Typography (optional)
  fontFamily?: string
  headingFontFamily?: string

  // Border radius customization
  borderRadius?: string
}

export interface SalonTheme {
  salonId: string
  salonSlug: string
  salonName: string
  tokens: ThemeTokens
}

/**
 * Default theme tokens (SCHNITTWERK branding)
 */
export const DEFAULT_THEME_TOKENS: ThemeTokens = {
  primaryColor: '#b87444', // Warm copper/bronze
  primaryForeground: '#ffffff',
  secondaryColor: '#1a1a1a',
  accentColor: '#d4a574',
  borderRadius: '0.5rem',
}

/**
 * Convert hex color to HSL for CSS custom properties
 */
export function hexToHsl(hex: string): string {
  // Remove # if present
  hex = hex.replace(/^#/, '')

  // Parse hex values
  const r = parseInt(hex.slice(0, 2), 16) / 255
  const g = parseInt(hex.slice(2, 4), 16) / 255
  const b = parseInt(hex.slice(4, 6), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
}

/**
 * Generate CSS custom properties from theme tokens
 */
export function generateCssVariables(tokens: ThemeTokens): Record<string, string> {
  const vars: Record<string, string> = {}

  if (tokens.primaryColor) {
    vars['--primary'] = hexToHsl(tokens.primaryColor)
    vars['--ring'] = hexToHsl(tokens.primaryColor)
  }

  if (tokens.primaryForeground) {
    vars['--primary-foreground'] = hexToHsl(tokens.primaryForeground)
  }

  if (tokens.accentColor) {
    vars['--accent'] = hexToHsl(tokens.accentColor)
  }

  if (tokens.borderRadius) {
    vars['--radius'] = tokens.borderRadius
  }

  return vars
}

/**
 * Apply theme tokens to document root
 */
export function applyThemeToDocument(tokens: ThemeTokens): void {
  if (typeof document === 'undefined') return

  const vars = generateCssVariables(tokens)
  const root = document.documentElement

  Object.entries(vars).forEach(([property, value]) => {
    root.style.setProperty(property, value)
  })
}

/**
 * Remove custom theme from document (reset to default)
 */
export function resetTheme(): void {
  if (typeof document === 'undefined') return

  const root = document.documentElement
  const customProperties = [
    '--primary',
    '--primary-foreground',
    '--accent',
    '--ring',
    '--radius',
  ]

  customProperties.forEach((prop) => {
    root.style.removeProperty(prop)
  })
}

/**
 * Create salon theme from database salon record
 */
export function createSalonTheme(salon: {
  id: string
  slug: string
  name: string
  primary_color?: string | null
  logo_url?: string | null
}): SalonTheme {
  return {
    salonId: salon.id,
    salonSlug: salon.slug,
    salonName: salon.name,
    tokens: {
      primaryColor: salon.primary_color || DEFAULT_THEME_TOKENS.primaryColor,
      primaryForeground: DEFAULT_THEME_TOKENS.primaryForeground,
      logoUrl: salon.logo_url || undefined,
      logoAlt: salon.name,
    },
  }
}

/**
 * Predefined color presets for easy selection
 */
export const COLOR_PRESETS = [
  { name: 'Kupfer', color: '#b87444' },
  { name: 'Midnight', color: '#1e293b' },
  { name: 'Forest', color: '#166534' },
  { name: 'Ocean', color: '#0369a1' },
  { name: 'Berry', color: '#9333ea' },
  { name: 'Rose', color: '#e11d48' },
  { name: 'Coral', color: '#ea580c' },
  { name: 'Gold', color: '#ca8a04' },
] as const
