import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AGB | SCHNITTWERK',
  description: 'Allgemeine Geschäftsbedingungen von SCHNITTWERK by Vanessa Carosella.',
}

export default function AGBPage() {
  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="container-wide">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold tracking-tight text-salon-charcoal mb-8">
            Allgemeine Geschäftsbedingungen (AGB)
          </h1>

          <div className="prose prose-lg max-w-none text-salon-charcoal/80">
            <h2>1. Geltungsbereich</h2>
            <p>
              Diese Allgemeinen Geschäftsbedingungen gelten für alle
              Dienstleistungen und Produkte von SCHNITTWERK by Vanessa Carosella,
              Rorschacherstrasse 152, 9000 St. Gallen.
            </p>

            <h2>2. Terminvereinbarungen</h2>

            <h3>2.1 Buchung</h3>
            <p>
              Termine können online über unsere Website, telefonisch oder
              persönlich im Salon vereinbart werden. Mit der Buchung eines
              Termins akzeptieren Sie diese AGB.
            </p>

            <h3>2.2 Terminbestätigung</h3>
            <p>
              Nach erfolgreicher Buchung erhalten Sie eine Bestätigung per
              E-Mail. Bitte überprüfen Sie die Angaben und melden Sie sich bei
              Unstimmigkeiten umgehend.
            </p>

            <h3>2.3 Pünktlichkeit</h3>
            <p>
              Wir bitten Sie, pünktlich zu Ihrem Termin zu erscheinen. Bei
              Verspätungen von mehr als 15 Minuten behalten wir uns das Recht
              vor, den Termin zu verkürzen oder abzusagen.
            </p>

            <h2>3. Stornierung und Umbuchung</h2>

            <h3>3.1 Durch den Kunden</h3>
            <p>
              Termine können bis zu 24 Stunden vor dem vereinbarten Termin
              kostenfrei storniert oder umgebucht werden.
            </p>
            <p>
              Bei Stornierungen weniger als 24 Stunden vor dem Termin oder bei
              Nichterscheinen ohne Absage behalten wir uns das Recht vor, eine
              Ausfallgebühr in Höhe von 50% des geplanten Dienstleistungsbetrags
              zu erheben.
            </p>

            <h3>3.2 Durch den Salon</h3>
            <p>
              Im Falle einer Stornierung durch uns werden wir Sie so früh wie
              möglich informieren und einen Ersatztermin anbieten.
            </p>

            <h2>4. Preise und Bezahlung</h2>

            <h3>4.1 Preisangaben</h3>
            <p>
              Alle angegebenen Preise verstehen sich inklusive der gesetzlichen
              Mehrwertsteuer. Die aktuellen Preise finden Sie auf unserer
              Website oder erhalten Sie auf Anfrage im Salon.
            </p>

            <h3>4.2 Zusätzliche Kosten</h3>
            <p>
              Für besondere Anforderungen wie Langhaar-Zuschläge oder aufwendige
              Techniken können zusätzliche Kosten anfallen. Diese werden vor
              Beginn der Behandlung besprochen.
            </p>

            <h3>4.3 Zahlungsmittel</h3>
            <p>
              Die Bezahlung erfolgt direkt nach der Behandlung. Wir akzeptieren:
            </p>
            <ul>
              <li>Barzahlung (CHF)</li>
              <li>EC-Karte / Debitkarte</li>
              <li>Kreditkarten (Visa, Mastercard)</li>
              <li>TWINT</li>
            </ul>

            <h2>5. Gutscheine</h2>

            <h3>5.1 Gültigkeit</h3>
            <p>
              Gutscheine sind ab Kaufdatum 3 Jahre gültig, sofern nicht anders
              angegeben.
            </p>

            <h3>5.2 Einlösung</h3>
            <p>
              Gutscheine können für alle Dienstleistungen und Produkte
              eingelöst werden. Eine Barauszahlung ist nicht möglich.
              Restbeträge werden als Guthaben vermerkt.
            </p>

            <h2>6. Haftung</h2>

            <h3>6.1 Dienstleistungen</h3>
            <p>
              Wir führen alle Dienstleistungen nach bestem Wissen und Gewissen
              sowie nach den Standards der Branche durch. Bei Unzufriedenheit
              bitten wir Sie, uns dies umgehend mitzuteilen.
            </p>

            <h3>6.2 Allergien und Unverträglichkeiten</h3>
            <p>
              Bitte informieren Sie uns vor der Behandlung über bekannte
              Allergien oder Unverträglichkeiten. Auf Wunsch führen wir vor
              einer Coloration einen Verträglichkeitstest durch.
            </p>

            <h3>6.3 Persönliche Gegenstände</h3>
            <p>
              Für den Verlust oder die Beschädigung von persönlichen
              Gegenständen übernehmen wir keine Haftung.
            </p>

            <h2>7. Produkte</h2>

            <h3>7.1 Rückgabe</h3>
            <p>
              Originalverpackte und unbenutzte Produkte können innerhalb von
              14 Tagen gegen Vorlage des Kaufbelegs zurückgegeben werden.
            </p>

            <h3>7.2 Gewährleistung</h3>
            <p>
              Bei Mängeln an Produkten gelten die gesetzlichen
              Gewährleistungsbestimmungen.
            </p>

            <h2>8. Datenschutz</h2>
            <p>
              Informationen zur Verarbeitung Ihrer personenbezogenen Daten
              finden Sie in unserer{' '}
              <a href="/datenschutz">Datenschutzerklärung</a>.
            </p>

            <h2>9. Änderungen der AGB</h2>
            <p>
              Wir behalten uns das Recht vor, diese AGB jederzeit zu ändern.
              Die jeweils aktuelle Version finden Sie auf unserer Website.
            </p>

            <h2>10. Anwendbares Recht und Gerichtsstand</h2>
            <p>
              Es gilt Schweizer Recht. Gerichtsstand ist St. Gallen, Schweiz.
            </p>

            <h2>11. Salvatorische Klausel</h2>
            <p>
              Sollte eine Bestimmung dieser AGB unwirksam sein, bleibt die
              Wirksamkeit der übrigen Bestimmungen davon unberührt.
            </p>

            <p className="text-sm text-salon-charcoal/50 mt-8">
              Stand: November 2024
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
