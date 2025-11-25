import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Impressum | SCHNITTWERK',
  description: 'Impressum und rechtliche Informationen zu SCHNITTWERK by Vanessa Carosella.',
}

export default function ImpressumPage() {
  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="container-wide">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold tracking-tight text-salon-charcoal mb-8">
            Impressum
          </h1>

          <div className="prose prose-lg max-w-none text-salon-charcoal/80">
            <h2>Angaben gemäss Schweizer Recht</h2>

            <h3>Kontaktadresse</h3>
            <p>
              SCHNITTWERK by Vanessa Carosella
              <br />
              Rorschacherstrasse 152
              <br />
              9000 St. Gallen
              <br />
              Schweiz
            </p>

            <h3>Kontakt</h3>
            <p>
              Telefon: +41 71 234 56 78
              <br />
              E-Mail: info@schnittwerk.ch
            </p>

            <h3>Vertretungsberechtigte Person</h3>
            <p>Vanessa Carosella, Inhaberin</p>

            <h3>Handelsregistereintrag</h3>
            <p>
              Eingetragener Firmenname: SCHNITTWERK by Vanessa Carosella
              <br />
              Handelsregister: Kanton St. Gallen
              <br />
              UID-Nummer: CHE-123.456.789
            </p>

            <h3>Mehrwertsteuernummer</h3>
            <p>CHE-123.456.789 MWST</p>

            <h2>Haftungsausschluss</h2>
            <p>
              Der Autor übernimmt keinerlei Gewähr hinsichtlich der inhaltlichen
              Richtigkeit, Genauigkeit, Aktualität, Zuverlässigkeit und
              Vollständigkeit der Informationen.
            </p>
            <p>
              Haftungsansprüche gegen den Autor wegen Schäden materieller oder
              immaterieller Art, welche aus dem Zugriff oder der Nutzung bzw.
              Nichtnutzung der veröffentlichten Informationen, durch Missbrauch
              der Verbindung oder durch technische Störungen entstanden sind,
              werden ausgeschlossen.
            </p>
            <p>
              Alle Angebote sind unverbindlich. Der Autor behält es sich
              ausdrücklich vor, Teile der Seiten oder das gesamte Angebot ohne
              besondere Ankündigung zu verändern, zu ergänzen, zu löschen oder
              die Veröffentlichung zeitweise oder endgültig einzustellen.
            </p>

            <h2>Haftungsausschluss für Links</h2>
            <p>
              Verweise und Links auf Webseiten Dritter liegen ausserhalb unseres
              Verantwortungsbereichs. Es wird jegliche Verantwortung für solche
              Webseiten abgelehnt. Der Zugriff und die Nutzung solcher Webseiten
              erfolgen auf eigene Gefahr des jeweiligen Nutzers.
            </p>

            <h2>Urheberrechte</h2>
            <p>
              Die Urheber- und alle anderen Rechte an Inhalten, Bildern, Fotos
              oder anderen Dateien auf dieser Website gehören ausschliesslich
              SCHNITTWERK by Vanessa Carosella oder den speziell genannten
              Rechteinhabern. Für die Reproduktion jeglicher Elemente ist die
              schriftliche Zustimmung des Urheberrechtsträgers im Voraus
              einzuholen.
            </p>

            <h2>Datenschutz</h2>
            <p>
              Gestützt auf Artikel 13 der Schweizerischen Bundesverfassung und
              die datenschutzrechtlichen Bestimmungen des Bundes hat jede Person
              Anspruch auf Schutz ihrer Privatsphäre sowie auf Schutz vor
              Missbrauch ihrer persönlichen Daten. Wir halten diese Bestimmungen
              ein. Persönliche Daten werden streng vertraulich behandelt und
              weder an Dritte verkauft noch weiter gegeben.
            </p>
            <p>
              Weitere Informationen finden Sie in unserer{' '}
              <a href="/datenschutz">Datenschutzerklärung</a>.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
