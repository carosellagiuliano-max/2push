import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Datenschutz | SCHNITTWERK',
  description: 'Datenschutzerklärung von SCHNITTWERK by Vanessa Carosella.',
}

export default function DatenschutzPage() {
  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="container-wide">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold tracking-tight text-salon-charcoal mb-8">
            Datenschutzerklärung
          </h1>

          <div className="prose prose-lg max-w-none text-salon-charcoal/80">
            <p className="lead">
              Der Schutz Ihrer persönlichen Daten ist uns ein besonderes
              Anliegen. Wir verarbeiten Ihre Daten daher ausschliesslich auf
              Grundlage der gesetzlichen Bestimmungen (DSG, DSGVO).
            </p>

            <h2>1. Verantwortliche Stelle</h2>
            <p>
              Verantwortlich für die Datenverarbeitung auf dieser Website ist:
            </p>
            <p>
              SCHNITTWERK by Vanessa Carosella
              <br />
              Rorschacherstrasse 152
              <br />
              9000 St. Gallen
              <br />
              Schweiz
              <br />
              E-Mail: info@schnittwerk.ch
            </p>

            <h2>2. Erhebung und Speicherung personenbezogener Daten</h2>

            <h3>2.1 Beim Besuch der Website</h3>
            <p>
              Beim Aufrufen unserer Website werden durch den auf Ihrem Endgerät
              zum Einsatz kommenden Browser automatisch Informationen an den
              Server unserer Website gesendet. Diese Informationen werden
              temporär in einem sogenannten Logfile gespeichert. Folgende
              Informationen werden dabei ohne Ihr Zutun erfasst und bis zur
              automatisierten Löschung gespeichert:
            </p>
            <ul>
              <li>IP-Adresse des anfragenden Rechners</li>
              <li>Datum und Uhrzeit des Zugriffs</li>
              <li>Name und URL der abgerufenen Datei</li>
              <li>Website, von der aus der Zugriff erfolgt (Referrer-URL)</li>
              <li>
                Verwendeter Browser und ggf. das Betriebssystem Ihres Rechners
              </li>
            </ul>

            <h3>2.2 Bei Terminbuchungen</h3>
            <p>
              Bei der Buchung eines Termins erheben wir folgende Daten:
            </p>
            <ul>
              <li>Name und Vorname</li>
              <li>E-Mail-Adresse</li>
              <li>Telefonnummer</li>
              <li>Gewünschte Dienstleistung und Termin</li>
            </ul>
            <p>
              Diese Daten werden zur Durchführung des Termins und zur
              Kontaktaufnahme bei Änderungen verwendet.
            </p>

            <h3>2.3 Bei Kontaktaufnahme</h3>
            <p>
              Bei Ihrer Kontaktaufnahme mit uns per E-Mail oder über ein
              Kontaktformular werden die von Ihnen mitgeteilten Daten
              (Ihre E-Mail-Adresse, ggf. Ihr Name und Ihre Telefonnummer)
              von uns gespeichert, um Ihre Fragen zu beantworten.
            </p>

            <h2>3. Weitergabe von Daten</h2>
            <p>
              Eine Übermittlung Ihrer persönlichen Daten an Dritte zu anderen
              als den im Folgenden aufgeführten Zwecken findet nicht statt:
            </p>
            <ul>
              <li>
                Sie haben Ihre ausdrückliche Einwilligung dazu erteilt
              </li>
              <li>
                Die Verarbeitung ist zur Abwicklung eines Vertrags mit Ihnen
                erforderlich
              </li>
              <li>
                Die Verarbeitung ist zur Erfüllung einer rechtlichen
                Verpflichtung erforderlich
              </li>
            </ul>

            <h2>4. Cookies</h2>
            <p>
              Wir setzen auf unserer Seite Cookies ein. Hierbei handelt es sich
              um kleine Dateien, die Ihr Browser automatisch erstellt und die
              auf Ihrem Endgerät gespeichert werden.
            </p>
            <p>
              Die meisten der von uns verwendeten Cookies sind sogenannte
              &ldquo;Session-Cookies&rdquo;. Sie werden nach Ende Ihres Besuchs
              automatisch gelöscht.
            </p>

            <h2>5. Ihre Rechte</h2>
            <p>Sie haben das Recht:</p>
            <ul>
              <li>
                Auskunft über Ihre von uns verarbeiteten personenbezogenen
                Daten zu verlangen
              </li>
              <li>
                Berichtigung unrichtiger oder Vervollständigung Ihrer bei
                uns gespeicherten personenbezogenen Daten zu verlangen
              </li>
              <li>
                Die Löschung Ihrer bei uns gespeicherten personenbezogenen
                Daten zu verlangen
              </li>
              <li>
                Die Einschränkung der Verarbeitung zu verlangen
              </li>
              <li>
                Der Verarbeitung Ihrer personenbezogenen Daten zu widersprechen
              </li>
              <li>
                Ihre personenbezogenen Daten in einem strukturierten, gängigen
                und maschinenlesbaren Format zu erhalten
              </li>
            </ul>

            <h2>6. Aufbewahrungsdauer</h2>
            <p>
              Wir speichern Ihre personenbezogenen Daten nur so lange, wie es
              für die Zwecke, für die sie erhoben wurden, erforderlich ist oder
              soweit dies durch Gesetze vorgeschrieben ist.
            </p>

            <h2>7. Datensicherheit</h2>
            <p>
              Wir verwenden innerhalb des Website-Besuchs das verbreitete
              SSL-Verfahren (Secure Socket Layer) in Verbindung mit der jeweils
              höchsten Verschlüsselungsstufe, die von Ihrem Browser unterstützt
              wird.
            </p>

            <h2>8. Änderung dieser Datenschutzerklärung</h2>
            <p>
              Wir behalten uns vor, diese Datenschutzerklärung anzupassen, damit
              sie stets den aktuellen rechtlichen Anforderungen entspricht oder
              um Änderungen unserer Leistungen in der Datenschutzerklärung
              umzusetzen.
            </p>

            <h2>9. Kontakt</h2>
            <p>
              Bei Fragen zur Erhebung, Verarbeitung oder Nutzung Ihrer
              personenbezogenen Daten, bei Auskünften, Berichtigung, Sperrung
              oder Löschung von Daten wenden Sie sich bitte an:
            </p>
            <p>
              SCHNITTWERK by Vanessa Carosella
              <br />
              E-Mail: info@schnittwerk.ch
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
