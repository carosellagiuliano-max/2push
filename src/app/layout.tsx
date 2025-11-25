import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: {
    default: 'SCHNITTWERK by Vanessa Carosella',
    template: '%s | SCHNITTWERK',
  },
  description:
    'Ihr Friseursalon in St. Gallen. Professionelle Haarschnitte, Colorationen und Styling in entspannter Atmosphäre.',
  keywords: ['Friseur', 'St. Gallen', 'Haarschnitt', 'Coloration', 'Styling', 'SCHNITTWERK'],
  authors: [{ name: 'SCHNITTWERK by Vanessa Carosella' }],
  creator: 'SCHNITTWERK',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'de_CH',
    siteName: 'SCHNITTWERK by Vanessa Carosella',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="de" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="min-h-screen bg-salon-cream font-sans antialiased">{children}</body>
    </html>
  )
}
