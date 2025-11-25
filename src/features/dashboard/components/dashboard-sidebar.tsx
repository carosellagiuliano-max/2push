'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Calendar,
  Users,
  Scissors,
  Settings,
  LayoutDashboard,
  Clock,
  UserCircle,
  LogOut,
  Menu,
  ChevronDown,
  Package,
  UserCog,
  BarChart3,
  ShoppingBag,
  Wallet,
  Bell,
  Building2,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Kalender', href: '/dashboard/calendar', icon: Calendar },
  { name: 'Kunden', href: '/dashboard/customers', icon: Users },
  { name: 'Team', href: '/dashboard/team', icon: UserCog },
  { name: 'Dienstleistungen', href: '/dashboard/services', icon: Scissors },
  { name: 'Produkte', href: '/dashboard/products', icon: Package },
  { name: 'Bestellungen', href: '/dashboard/orders', icon: ShoppingBag },
  { name: 'Statistiken', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Finanzen', href: '/dashboard/finance', icon: Wallet },
  { name: 'Benachrichtigungen', href: '/dashboard/notifications', icon: Bell },
  { name: 'Arbeitszeiten', href: '/dashboard/schedule', icon: Clock },
  { name: 'Einstellungen', href: '/dashboard/settings', icon: Settings },
]

// HQ-only navigation items
const hqNavigation = [
  { name: 'Salons', href: '/dashboard/salons', icon: Building2 },
]

interface DashboardSidebarProps {
  user?: {
    name: string
    email: string
    avatar?: string
    role: string
  }
  /** Whether user has HQ role for cross-salon access */
  isHqUser?: boolean
}

function SidebarContent({ user, isHqUser = false }: DashboardSidebarProps) {
  const pathname = usePathname()

  const handleLogout = async () => {
    // TODO: Implement logout
    console.log('Logout')
  }

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center px-6">
        <Link href="/dashboard" className="flex items-center">
          <span className="text-xl font-bold text-primary">SCHNITTWERK</span>
        </Link>
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}

        {/* HQ Navigation */}
        {isHqUser && (
          <>
            <Separator className="my-2" />
            <div className="px-3 py-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                HQ
              </span>
            </div>
            {hqNavigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </>
        )}
      </nav>

      <Separator />

      {/* User menu */}
      <div className="p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 px-3"
            >
              <Avatar className="h-8 w-8">
                {user?.avatar && <AvatarImage src={user.avatar} />}
                <AvatarFallback>
                  {user?.name?.slice(0, 2).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-1 flex-col items-start text-left">
                <span className="text-sm font-medium">{user?.name || 'Benutzer'}</span>
                <span className="text-xs text-muted-foreground">{user?.role || 'Mitarbeiter'}</span>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile" className="flex items-center gap-2">
                <UserCircle className="h-4 w-4" />
                Profil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Einstellungen
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Abmelden
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

export function DashboardSidebar({ user, isHqUser = false }: DashboardSidebarProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <>
      {/* Mobile sidebar */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild className="lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            className="fixed left-4 top-4 z-40"
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Menü öffnen</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <SidebarContent user={user} isHqUser={isHqUser} />
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col border-r bg-card">
        <SidebarContent user={user} isHqUser={isHqUser} />
      </aside>
    </>
  )
}
