import Link from 'next/link'
import { Calendar, User, LogOut } from 'lucide-react'

import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { signOut } from '@/features/auth'

const navigation = [
  { name: 'Übersicht', href: '/konto', icon: User },
  { name: 'Termine', href: '/konto/termine', icon: Calendar },
]

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex-1 container py-8">
        <div className="grid gap-8 lg:grid-cols-4">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <nav className="space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              ))}
              <form action={signOut}>
                <button
                  type="submit"
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <LogOut className="h-5 w-5" />
                  Abmelden
                </button>
              </form>
            </nav>
          </aside>

          {/* Main content */}
          <main className="lg:col-span-3">{children}</main>
        </div>
      </div>
      <Footer />
    </div>
  )
}
