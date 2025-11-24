export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-salon-charcoal md:text-6xl">
          SCHNITTWERK
        </h1>
        <p className="mb-2 text-lg text-brand-600">by Vanessa Carosella</p>
        <p className="mb-8 text-salon-charcoal/70">
          Rorschacherstrasse 152, 9000 St. Gallen
        </p>

        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <a
            href="/termin-buchen"
            className="rounded-full bg-brand-600 px-8 py-3 font-medium text-white transition-colors hover:bg-brand-700"
          >
            Termin buchen
          </a>
          <a
            href="/leistungen"
            className="rounded-full border border-brand-600 px-8 py-3 font-medium text-brand-600 transition-colors hover:bg-brand-50"
          >
            Unsere Leistungen
          </a>
        </div>
      </div>

      <footer className="absolute bottom-8 text-center text-sm text-salon-charcoal/50">
        <p>&copy; {new Date().getFullYear()} SCHNITTWERK by Vanessa Carosella</p>
      </footer>
    </main>
  )
}
