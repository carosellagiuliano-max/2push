'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Calendar, User, LogOut, ShoppingBag, Loader2 } from 'lucide-react'

import { cn } from '@/lib/utils'
import { useAuth, SessionExpiredModal } from '@/features/auth'

const navigation = [
  { name: 'Übersicht', href: '/konto', icon: User },
  { name: 'Termine', href: '/konto/termine', icon: Calendar },
  { name: 'Bestellungen', href: '/konto/bestellungen', icon: ShoppingBag },
]

export function CustomerSidebar() {
  const pathname = usePathname()
  const { signOut } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = React.useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await signOut()
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <>
      <nav className="space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 transition-colors',
                isActive
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
        >
          {isLoggingOut ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <LogOut className="h-5 w-5" />
          )}
          {isLoggingOut ? 'Abmelden...' : 'Abmelden'}
        </button>
      </nav>
      <SessionExpiredModal />
    </>
  )
}
