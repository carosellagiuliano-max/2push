import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { CustomerSidebar } from '@/features/customer'

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
            <CustomerSidebar />
          </aside>

          {/* Main content */}
          <main className="lg:col-span-3">{children}</main>
        </div>
      </div>
      <Footer />
    </div>
  )
}
