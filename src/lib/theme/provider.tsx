'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import {
  type SalonTheme,
  type ThemeTokens,
  DEFAULT_THEME_TOKENS,
  applyThemeToDocument,
  resetTheme,
} from './tokens'

interface ThemeContextValue {
  theme: SalonTheme | null
  setTheme: (theme: SalonTheme | null) => void
  tokens: ThemeTokens
  isLoading: boolean
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

interface ThemeProviderProps {
  children: ReactNode
  initialTheme?: SalonTheme | null
}

/**
 * ThemeProvider for dynamic salon branding
 *
 * Applies per-salon theme tokens as CSS custom properties.
 * Falls back to default theme when no salon theme is set.
 */
export function ThemeProvider({ children, initialTheme = null }: ThemeProviderProps) {
  const [theme, setTheme] = useState<SalonTheme | null>(initialTheme)
  const [isLoading, setIsLoading] = useState(false)

  // Apply theme tokens when theme changes
  useEffect(() => {
    if (theme) {
      applyThemeToDocument(theme.tokens)
    } else {
      resetTheme()
    }
  }, [theme])

  const tokens = theme?.tokens || DEFAULT_THEME_TOKENS

  const value: ThemeContextValue = {
    theme,
    setTheme: (newTheme) => {
      setIsLoading(true)
      setTheme(newTheme)
      // Small delay to allow CSS transition
      setTimeout(() => setIsLoading(false), 100)
    },
    tokens,
    isLoading,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

/**
 * Hook to access theme context
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

/**
 * Hook to get current salon theme tokens
 */
export function useThemeTokens(): ThemeTokens {
  const { tokens } = useTheme()
  return tokens
}
