'use client'

import * as React from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { AlertCircle, RefreshCw, LogIn } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useAuth } from './auth-provider'

export function SessionExpiredModal() {
  const router = useRouter()
  const pathname = usePathname()
  const { isSessionExpired, refreshSession, signOut, isLoading } = useAuth()
  const [isRefreshing, setIsRefreshing] = React.useState(false)

  // Only show on protected routes
  const protectedPaths = ['/dashboard', '/admin', '/profile', '/konto']
  const isProtectedRoute = protectedPaths.some((path) => pathname.startsWith(path))

  // Don't show the modal during initial loading or on non-protected routes
  const shouldShow = !isLoading && isSessionExpired && isProtectedRoute

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refreshSession()
      // If refresh succeeds, the modal will close automatically (isSessionExpired becomes false)
      router.refresh()
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleLogin = async () => {
    // Sign out to clear any stale state
    await signOut()
    // Redirect to login with return URL
    router.push(`/login?redirect=${encodeURIComponent(pathname)}`)
  }

  // Prevent closing the modal by clicking outside or pressing escape
  const handleOpenChange = (open: boolean) => {
    // Only allow closing if session is no longer expired
    if (!open && isSessionExpired) {
      return
    }
  }

  return (
    <Dialog open={shouldShow} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-5 w-5 text-destructive" />
            </div>
            <DialogTitle>Sitzung abgelaufen</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            Ihre Sitzung ist abgelaufen. Bitte melden Sie sich erneut an, um fortzufahren.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            Aus Sicherheitsgründen werden Sitzungen nach einer bestimmten Zeit
            automatisch beendet. Ihre nicht gespeicherten Änderungen könnten
            verloren gegangen sein.
          </p>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="w-full sm:w-auto"
          >
            {isRefreshing ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Versuche...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Sitzung erneuern
              </>
            )}
          </Button>
          <Button onClick={handleLogin} className="w-full sm:w-auto">
            <LogIn className="mr-2 h-4 w-4" />
            Neu anmelden
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
