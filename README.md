# Projektdokumentation – [EduPlay - Wandtafelfussball]

## Inhaltsverzeichnis

1. [Einordnung & Zielsetzung](#1-einordnung--zielsetzung)
2. [Zielgruppe & Stakeholder](#2-zielgruppe--stakeholder)
3. [Anforderungen & Umfang](#3-anforderungen--umfang)
4. [Vorgehen & Artefakte](#4-vorgehen--artefakte)
    - [Understand & Define](#41-understand--define)
    - [Sketch](#42-sketch)
    - [Decide](#43-decide)
    - [Prototype](#44-prototype)
    - [Validate](#45-validate)
5. [Erweiterungen [Optional](#5-erweiterungen-optional)
6. [Projektorganisation [Optional](#6-projektorganisation-optional)
7. [KI‑Deklaration](#7-ki‑deklaration)
8. [Anhang [Optional]](#8-anhang-optional)


## 1. Einordnung & Zielsetzung

Kurz beschreiben, welches Problem adressiert wird und welches Ergebnis angestrebt ist.

- **Kontext & Problem:** 
Im Unterricht verlieren viele Grundschüler schnell die Motivation beim Lernen von Mathematik, Sprachen oder anderen Fächern. Analoge Spiele wie Wandtafelfußball sorgen zwar für Abwechslung, sind jedoch nicht digital verfügbar und schwer in modernen Unterrichtssettings nutzbar.
Lehrpersonen wünschen sich einfache, digitale, interaktive Lernspiele, die auf Wandtafeln, Tablets oder Smartboards funktionieren.

- **Ziele:** 
-   Lerninhalte spielerisch und motivierend vermitteln
-   Eine digitale Version des Wandtafelfußballs bereitstellen
-   Lehrpersonen ermöglichen, eigene Inhalte hochzuladen oder einzugeben
-   Flexible Nutzung auf Smartboards, Laptops und Tablets
-   Zwei Teams gegeneinander antreten lassen, Ballbewegung als Fortschritt

- **Abgrenzung [Optional]:** 
-   Nicht Bestandteil des Projekts sind:
-   Vollständiges Benutzerkonto- oder Rechteverwaltungssystem
-   Speicherung langfristiger Lernfortschritte über Sessions hinaus
-   Professionelle Game-Engine oder Multiplayer-Online-Modus

## 2. Zielgruppe & Stakeholder
Wem nützt die Lösung, wer ist beteiligt oder betroffen?

- **Primäre Zielgruppe:** 
Grundschulkinder im Alter von 7–12 Jahren, die spielerisch Mathematik, Englisch, Deutsch oder andere Grundlagen lernen sollen.
Sie profitieren besonders von visuellen, interaktiven und teamorientierten Lernformen.

- **Weitere Stakeholder [Optional]:** 
-   Schulen → setzen digitale Lernmethoden ein
-   Eltern → profitieren indirekt durch mehr Motivation der Kinder
-   Schülergruppen → kollaboratives Lernen im Team
-   Lehrer → abwechslung in den Unterricht bringen

- **Annahmen [Optional]:** 
-   Kinder lernen motivierter, wenn Lerninhalte verspielt und kompetitiv aufbereitet sind.
-   Kurze, schnelle Quizrunden passen gut in Unterrichtsabläufe.
-   Lehrpersonen brauchen ein Tool, das ohne technische Hürden sofort funktioniert.

## 3. Anforderungen & Umfang
Beschreibt den verbindlichen Umfang gemäss Übungen und allfällige Erweiterungen.

- **Kernfunktionalität (Mindestumfang):** 
1. Startseite → Fach wählen (Mathematik).
2. Spiel-Einstellungen festlegen (z. B. Rechenart, Zahlenraum/Schwierigkeit).
3. Fragen vorbereiten (manuell / Upload / KI – gemäss Umsetzung).
4. Spiel starten → Fragen beantworten → visuelles Feedback & Ballbewegung.
5. Spielende mit Gewinneranzeige.
6. Navigation zurück ins Menü (Start-/Fächerauswahl).

- **Akzeptanzkriterien:** 
AK-1 Fachauswahl
Nach Auswahl von „Mathematik“ wird die Mathe-Spielumgebung ohne Fehlermeldung geladen.
AK-2 Spiel-Einstellungen (Mathe)
Vor Spielstart können die Rechenart und ein Zahlenraum festgelegt werden.
Die gewählten Einstellungen werden im Spiel korrekt angewendet.
AK-3 Spielstart
Der Übergang vom Setup in die Spielansicht erfolgt ohne Seitenreload und ohne Fehlerzustand.
AK-4 Antwort & Feedback
Antworten werden über Buttons ausgelöst.
Nach jeder Antwort erfolgt sofort sichtbares Feedback (richtig/falsch).
AK-5 Spielmechanik (Ball)
Nach einer korrekten Antwort bewegt sich der Ball sichtbar in Richtung gegnerisches Tor.
Die Ballposition ist jederzeit eindeutig erkennbar.
AK-6 Spielende
Das Spiel endet bei Erreichen der definierten Gewinnbedingung.
Das Gewinnerteam wird klar und eindeutig angezeigt.
AK-7 Navigation zum Menü (Endzustand)
Nach Spielende kann zur Menü-/Startansicht zurücknavigiert werden, um ein neues Spiel oder Fach zu wählen.
Die Navigation funktioniert ohne manuellen Browser-Reload.

- **Erweiterungen [Optional]:** 
Fachspezifische Spielmodi
Neben Mathematik wurden eigenständige Spielmodi für Deutsch, Englisch, Französisch und weitere Fächer umgesetzt. Jeder Modus ist didaktisch auf das jeweilige Fach abgestimmt und nutzt denselben bewährten Spielmechanismus.
Erweiterte Spiel-Einstellungen (Mathematik)
Lehrpersonen können Rechenart und Zahlenraum festlegen. Dadurch lässt sich der Schwierigkeitsgrad flexibel an Klassenstufe und Lernziel anpassen.
KI-gestützte Fragengenerierung
Fragen können automatisiert über einen KI-Service generiert werden. Lehrpersonen geben Rahmenbedingungen vor und erhalten sofort einsetzbare Aufgaben.
Datei-Upload und automatisches Parsing
Fragen lassen sich über Datei-Uploads importieren und in spielbare Aufgaben umwandeln. Dies reduziert den Vorbereitungsaufwand im Unterricht deutlich.
Persistente Fragen-Sets und Login
Über ein Login können Fragen-Sets gespeichert, verwaltet und wiederverwendet werden. Dadurch eignet sich der Prototyp für den wiederholten Einsatz im Unterricht.
Didaktisches Feedback und Spielsteuerung
Zusätzliche Steuerungs- und Feedback-Elemente wie Skip-Optionen, Beenden-Funktionen, Tor-Popups und visuelle Rückmeldungen erhöhen die Verständlichkeit und Motivation.
Touch- und Smartboard-Optimierung
Die Benutzeroberfläche ist auf grosse Displays und projektionsbasierte Unterrichtssituationen ausgelegt, mit grossen Buttons, klaren Kontrasten und reduzierter Navigation.
Kindgerechtes Design-Redesign
Basierend auf der Evaluation wurde das gesamte visuelle Erscheinungsbild neu gestaltet. Der frühere, technisch geprägte Stil wurde durch einen farbigen, verspielten Aquarell-Look ersetzt, der besser auf Kinder abgestimmt ist.

## 4. Vorgehen & Artefakte
Die Durchführung erfolgt phasenbasiert; dokumentieren Sie die wichtigsten Ergebnisse je Phase.

### 4.1 Understand & Define
- **Ausgangslage & Ziele:** 
Im Unterricht fehlen digitale, spielerische Lernmethoden, die sowohl für Lehrer als auch Schüler einfach nutzbar sind. Analoge Spiele wie Wandtafelfußball funktionieren gut, können aber nicht auf moderne digitale Umgebung übertragen werden.
Ziel von EduPlay ist es, Lernstoff spielerisch zu vermitteln und Lehrer*innen ein sofort einsetzbares Tool für interaktive Unterrichtsphasen zu bieten.

- **Zielgruppenverständnis:** 
-   Kinder reagieren stark auf spielerisches Lernen, Wettbewerb und Teamgefühl.
-   Lehrpersonen benötigen Tools, die ohne technische Hürden funktionieren und direkt einsetzbar sind.
-   Smartboards und Touchgeräte sind weit verbreitet → Interface muss groß, klar und intuitiv sein.

- **Wesentliche Erkenntnisse:** _
-   Spiele steigern die Motivation und Aufmerksamkeit im Unterricht.
-   Team-basiertes Lernen fördert Zusammenarbeit und positive Lernemotionen.
-   Kinder brauchen klare, farblich eindeutige Rückmeldungen.
-   Lehrpersonen müssen Inhalte flexibel eingeben oder hochladen können.

### 4.2 Sketch
- **Variantenüberblick:** 
1.  Quiz-Layout mit Punktesystem
-   klassischer Fragen/Antworten-Stil
-   Punkte statt Ballbewegung
2.  Wandtafelfußball mit Ballbewegung
-   zwei Teams bewegen einen Ball Richtung Tor
-   visuelles Spielfeld
-   ideal für Smartboards
3.  Kartensystem mit Vokabelkarten oder Mathe-Karten
-   weniger dynamisch
-   gute Übersicht, aber wenig Wettbewerb

- **Skizzen:** 
Die finalen Skizzen sind im Figma-Board ersichtlich:
Figma-Prototyp:
https://www.figma.com/make/cfst3nxuUHArpKiGawY1uk/EduPlay-Web-App-UI-Design?node-id=0-1&p=f&t=o1f7xIHvjvthSd1Z-0&fullscreen=1

-   Hauptunterschiede in den Varianten:
-   Darstellung der Ballbewegung
-   Layout der Antwortbuttons
-   Struktur der Seiten (horizontal vs. vertikal)
-   Farbschema pro Fach

### 4.3 Decide
- **Gewählte Variante & Begründung:** 
-   Hoher Wiedererkennungswert bei Lehrpersonen
-   Sehr starke Motivation bei Kindern
-   Visuell eindeutig (Ballposition zeigt Lernfortschritt)
-   Ideal für Smartboards (große Flächen, klare Farben)
-   Passt perfekt zum Wettbewerbscharakter im Unterricht

- **End‑to‑End‑Ablauf:** 
1.  Startseite → Fach wählen
2.  Fragen eingeben oder Datei hochladen
3.  Teams erscheinen im Spiel
4.  Frage wird angezeigt
5.  Lehrer klicken Antwort → richtig/falsch
6.  Ball bewegt sich
7.  Nach X Fragen → Resultat (Team gewinnt)
8.  „Neu starten“-Option

- **Referenz‑Mockup:** _[URL, Screenshots mit kurzen Beschreibungen]_  
Das Mockup befindet sich vollständig im Figma:
https: (siehe oben)
Es zeigt:
-   Startseite
-   Auswahlseite
-   Spielfeld
-   Fragekarten
-   Buttons + Farbkonzept
-   Ergebnisanzeige

### 4.4 Prototype
- **Kernfunktionalität:**
Der Prototyp enthält:
-   start.svelte: Auswahl der Fächer
-   login/register optional
-   game.svelte: Anzeige der Fragen + Antwortbuttons
-   field.svelte: Spielfeld mit Ballposition
-   score.svelte: Gewinneranzeige
-   Rückmeldungen bei richtig/falsch
-   Ballmechanik: Position verschiebt sich pro Antwort
-   Restart-Funktion

- **Deployment:** https://eduplaysite.netlify.app 

#### 4.4.1. Entwurf (Design)
Beschreibt die Gestaltung und Interaktion.
> **Hinweis:** Hier wird der **Prototyp** beschrieben, nicht das **Mockup**.
- **Informationsarchitektur:** 
-   Home → Fächer auswählen
-   Fragen-Eingabe → Text oder Datei
-   Spiel → Fragen + Spielfeld
-   Resultat → Gewinneranzeige + Neustart

- **Oberflächenentwürfe:**
  Die wichtigsten Screens umfassen die Fachauswahl, den Setup-Screen für Spieleinstellungen (z. B. Rechenart und Zahlenraum), die Spielansicht mit Spielfeld und Ballbewegung sowie die Ergebnisanzeige. Die Gestaltung orientiert sich am verlinkten Figma-Mockup und wurde für den Prototyp funktional vereinfacht umgesetzt.

- **Designentscheidungen:** 
-   Großflächige Buttons → für Smartboard geeignet
-   Starke Farben → Rot/Blau für Teams
-   Einheitliche UI über alle Fächer (Mathe, Englisch, Französisch, etc.)
-   Minimierte Navigation → Fokus auf Spiel
-   Touch-optimiert

#### 4.4.2. Umsetzung (Technik)
Fasst die technische Realisierung zusammen.
- **Technologie‑Stack:** 
-   SvelteKit (vital für das Modul)
-   HTML/CSS/JS
-   Komponenten-Struktur

- **Tooling:** 
-   Visual Studio Code
-   Git & GitHub
-   KI-Unterstützung (Dokumentation & Code)
-   Figma für Mockups

- **Struktur & Komponenten:** _[Seiten, Routen, State/Stores, wichtige Komponenten]_
-   /src/routes/+page.svelte → Landing (Gast/Login-Auswahl)
-   /src/routes/start/+page.svelte → Fachwahl & Einstieg
-   /src/routes/mathe|deutsch|englisch|franzoesisch|andere/+page.svelte → jeweilige Spiel-Workflows inkl. Frage-Import, KI-Generator, Spiellogik
-   /src/routes/sets/+page.svelte und /src/routes/game/[id]/… → gespeicherte Sets
-   /src/routes/login/+page.svelte & /profil/+page.svelte → Auth/Profilverwaltung über Supabase
-   /src/routes/api/generate-questions/+server.js → KI-Fragenservice, /api/sets/+server.js → MongoDB-Speicher für Sets
-   /src/lib/components/game/*.svelte → wiederverwendbare UI-Bausteine (SetupScreen, ActiveGameScreen, SoccerField, GoalPopup, WinnerPopup, SaveSetPanel, etc.)
-   /src/lib/components/inputs/FileDropzone.svelte → Drag&Drop Upload
-   /src/lib/utils/*.js → Parser (PDF/TXT), Formatter, Random-Helper, AI-Brücke, Supabase-Speicher

- **Daten & Schnittstellen [Optional]:** _[Datenquellen, API‑Entwürfe, Modelle]_
- **Besondere Entscheidungen:** 
-   Einheitliches Button-Design für alle Fächer
-   Wiederverwendbare Komponenten
-   Klarer, kindgerechter Stil

### 4.5 Validate
- **URL der getesteten Version**
Die getestete Version entsprach dem zum Testzeitpunkt aktuellen Stand des Prototyps (separater Deployment-Stand).
- **Ziele der Prüfung:** 
- Überprüfen, ob Kinder den Spielablauf nach kurzer Erklärung verstehen
- Einschätzen der Motivation und Spielfreude im Unterrichtskontext
- Testen der Bedienbarkeit auf einer projektionsbasierten Touch-Lösung (Beamer)
- Beobachten der Gruppendynamik im Team-Spielmodus

- **Vorgehen:** 
Der Test wurde moderiert in einer 1. Klasse in Reutlingen durchgeführt. Die Lehrperson erklärte den Ablauf kurz und führte anschliessend durch das Spiel. Die Kinder spielten in zwei Teams in Reihen; nach jeder Frage wechselten die vordersten Kinder nach hinten.
Wichtig: Die Interaktion mit der Anwendung erfolgte nicht direkt durch die Kinder, sondern über die Lehrperson: Die Kinder gaben ihre Antwort mündlich, und die Lehrperson klickte die entsprechende Option auf der projizierten Oberfläche (Beamer). Dadurch lag der Fokus der Evaluation auf Verständnis, Motivation, Ablauf im Unterricht und auf der direkten Touch-Bedienbarkeit durch die Lehrperson.

- **Stichprobe:** 
- Teilnehmende: 1. Klasse (zwei Gruppen)
- Alter: ca. 6–7 Jahre
- Ort: Schule in Reutlingen
- Setting: Projektion via Beamer, Bedienung durch Lehrperson

- **Aufgaben/Szenarien:** 
-   Durchführung eines vollständigen Spiels mit ca. 20 Fragen
- Team-Spiel im Reihen-Setting mit Rollenwechsel nach jeder Frage
- Beobachtung von Verständnis, Engagement und Reaktion auf Feedback (richtig/falsch, Ballbewegung)

- **Kennzahlen & Beobachtungen:** 
- Dauer: ca. 10 Minuten für 20 Fragen
- Verständnis: Der Ablauf wurde nach kurzer Erklärung verstanden; das Spiel konnte ohne Unterbrechungen durchgeführt werden
- Motivation: Hoch; Kinder waren engagiert und hatten sichtbar Spass am Team-Spiel
- Ablauf im Unterricht: Der Reihenwechsel nach jeder Frage erzeugte zusätzliche Übergangszeit, war aber für die Klasse organisatorisch machbar
- Design-Feedback: Das damalige Design wurde als nicht ausreichend kindgerecht/ansprechend wahrgenommen

- **Zusammenfassung der Resultate:**
Der Prototyp funktioniert im Unterrichtskontext als moderiertes Team-Spiel sehr gut: Die Klasse blieb motiviert, und der Ablauf war nach kurzer Einführung verständlich. Der grösste erkannte Verbesserungsbedarf lag weniger in der Spiellogik, sondern in der visuellen Gestaltung, damit die Anwendung stärker auf die Zielgruppe abgestimmt wirkt.

- **Abgeleitete Verbesserungen:** 
- Visuelles Redesign, um die Zielgruppe (1. Klasse) stärker anzusprechen
- Erhöhung der Farbigkeit/Verspieltheit zur Steigerung der emotionalen Wirkung und Aufmerksamkeit

- **Umgesetzte Anpassungen [Optional]:** 
Nach dem Test wurde das gesamte Layout überarbeitet: Der ursprüngliche, eher nüchterne/„Developer-Tool“-Look wurde durch einen bunteren, kindgerechteren Aquarell-Stil ersetzt.



## 5. Erweiterungen [Optional]
Dokumentiert Erweiterungen über den Mindestumfang hinaus.
- **Beschreibung & Nutzen:** 
  Der Prototyp enthält zahlreiche Erweiterungen, die klar über die in den Übungen geforderte Basis hinausgehen:
  1. **Persistente Fragen-Sets & Login** – Authentifizierung per Supabase (E-Mail/Passwort + OAuth), Profilverwaltung und das Speichern der Fragen-Sets in MongoDB. Über `/sets` wählen Lehrpersonen vorbereitete Sets aus, `/game/[id]` zeigt deren Inhalte, und das SaveSetPanel kann jederzeit neue Sets sichern. Damit wird das Tool von einem einmaligen Spiel zu einer Unterrichtsbibliothek.
  2. **KI-Unterstützung & Materialparser** – Ein drag&drop FileDropzone, PDF/TXT-Parsing (mit `pdfjs` im Browser) und ein geschützter OpenAI-Endpunkt generieren automatisch Quizfragen aus Unterrichtsmaterial. Lehrpersonen definieren Instruktionen und Zahlenräume; die KI stellt sofort passende Aufgaben bereit.
  3. **Fachspezifische Routen & Inhalte** – Jede Fachroute besitzt eigene Logiken: Mathe erlaubt Operation-Presets, Dezimalzahlen und KI-Anweisungen; Deutsch bietet Silben-/Artikel-/Großschreibung-Aufgaben sowie Bild-Szenarien; Englisch/Französisch fokussieren auf Vokabeln, „Andere Fächer“ akzeptiert freie Themen. Dadurch fühlt sich jedes Fach wie eine maßgeschneiderte App an.
  4. **Didaktische Steuerung & Feedbackschleifen** – Neben Scorecards gibt es Falsch/Skip/Beenden-Buttons, Timer bei falschen Antworten, Tor-Popups, Winner-Popup, Sound-/Emoji-Signale (je nach Route) sowie Goal-Resets. Lehrpersonen behalten die Kontrolle über das Tempo, Kinder erhalten motivierendes Feedback und klare Statusanzeigen.
  5. **Touch-/Smartboard-Optimierung & modulare Komponenten** – SoccerField mit ResizeObserver, Ball-Komponente, modulare Setup-/Active-/End-Screens, WinnerPopup sowie FileDropzone machen die UI auf großen Displays flüssig. Buttons sind bewusst großflächig, Farben kontrastreich, und die Komponenten können in weiteren Fächern wiederverwendet werden.
  6. **Organisation & Infrastruktur** – Netlify-Deployment, .env-Konfiguration für Supabase/Mongo/OpenAI, GitHub-Repo mit Issue-Tracking und automatischer Adapter-Konfiguration (`adapter-netlify`). Diese Setup-Arbeiten gehen über reine Prototyp-Codierung hinaus und erlauben reale Nutzung.

- **Umsetzung in Kürze:**  
  Supabase- und Mongo-Clients liegen unter `/src/lib`, serverseitige APIs kapseln Auth & Datenbank. Die KI-Anbindung nutzt einen eigenen SvelteKit-Server-Endpoint (`/api/generate-questions`), wodurch API-Keys nie im Browser landen. Jede Fachroute bindet die gemeinsamen Komponenten ein und erweitert sie um spezifische Settings; über lokale Stores wird der Spielstatus verwaltet. Persistente Sets werden mit JWTs gesichert, damit nur eingeloggte Nutzende ihre Daten sehen.
- **Abgrenzung zum Mindestumfang:**  
  Der Mindestumfang deckt lediglich einen linearen Wandtafelfussball-Flow mit manueller Frageeingabe, ohne Login, ohne KI, ohne Persistenz, ohne dedizierte Fachrouten. Sämtliche oben genannten Erweiterungen (Auth, DB, KI, Drag&Drop, modulare UX, zusätzliche Steuerung, Infrastruktur) sind optionale Mehrwerte; der Basisspielmodus bleibt weiterhin als Gast nutzbar.

## 6. Projektorganisation [Optional]
Beispiele:
- **Repository & Struktur:** 
Das Projekt wird in einem öffentlichen GitHub-Repository verwaltet:
https://github.com/florianshub314/eduplay

/src
  /routes
    /start            → Einstieg & Fachauswahl
    /mathe            → Mathematik-Workflow
    /deutsch          → Deutsch-Workflow
    /englisch         → Englisch-Workflow
    /franzoesisch     → Französisch-Workflow
    /andere           → Weitere Fächer
    /game             → Spielansicht
    /sets             → Gespeicherte Fragen-Sets
    /login            → Authentifizierung
    /profil           → Profilverwaltung
    +layout.svelte
    +page.svelte
  /lib
    /components       → Wiederverwendbare UI-Komponenten
    /stores           → Globale Zustände (Spielstatus, Ballposition etc.)
/static               → Statische Assets
README.md
package.json
svelte.config.js
vite.config.js

Beschreibung:
-   Alle Seiten sind als SvelteKit-Routen im Ordner /src/routes organisiert.
-   Wiederverwendbare UI-Elemente (z. B. GameField, QuestionCard) befinden sich in /src/lib/components.
-   Globale Zustände (z. B. Ballposition, Fragen, Teamnamen) werden in /src/lib/stores gespeichert.
-   Die Dokumentation liegt als README.md im Root-Verzeichnis, wie in den Projektanforderungen gefordert.

- **Issue‑Management:** 
Issues werden genutzt für:
-   Offene Tasks (noch fehlende Funktionen)
-   Bugs / UI-Probleme
-   Erweiterungen (z. B. zusätzliche Fächer, Soundeffekte, Bildfragen)
-   Aufgaben für den Feinschliff (z. B. Farben, Animationen, Button-Konsistenz)
Aktuelle Beispiele für offene Issues:
-   Popup bei Tor wieder einbauen
-   Einheitliches Button-Design für alle Fächer
-   Touch-Optimierung verbessern
-   Komponenten refactoren (GameField, QuestionCard)

- **Commit‑Praxis:** 
  Die Entwicklung erfolgte iterativ mit regelmässigen, sprechenden Commit-Messages, die jeweils klar beschreiben, welche Funktion oder welcher Bereich angepasst wurde (z. B. update subject pages and documentation).

## 7. KI‑Deklaration
Die folgende Deklaration ist verpflichtend und beschreibt den Einsatz von KI im Projekt.

### Eingesetzte KI‑Werkzeuge
ChatGPT (GPT-5.x) – eingesetzt als unterstützendes Werkzeug bei Konzeption, Strukturierung, Code-Ideen und Dokumentation.

### Zweck & Umfang
Die KI wurde unterstützend eingesetzt zur:
- Strukturierung der Projektidee und der README-Dokumentation
- Generierung von Textentwürfen (z. B. Zielsetzung, Vorgehensbeschreibung)
- Erarbeitung von Lösungsvorschlägen für SvelteKit-Komponenten, Spiel-Logik (Ballbewegung, Spielzustand) und Routing
- Unterstützung bei Debugging, Refactoring-Ideen und UX-Verbesserungen
Die KI diente ausschliesslich als Hilfsmittel. Alle Vorschläge wurden kritisch geprüft, angepasst und eigenständig implementiert.

### Art der Beiträge
Die KI lieferte:
- Textentwürfe und Formulierungsvorschläge für Teile der Dokumentation
- Beispielcode und Logik-Skizzen für Spielmechaniken, Komponentenstruktur und Zustandsverwaltung
- UX-Ideen zur Verbesserung der Bedienbarkeit auf Touch-Geräten
Kein KI-generierter Code oder Text wurde ungeprüft übernommen.

### Eigene Leistung (Abgrenzung)
Die eigenständige Leistung umfasst:
- Ausarbeitung der Projektidee und funktionalen Anforderungen
- Vollständige Implementierung des Prototyps in SvelteKit
- Technische Entscheidungen (Architektur, Komponenten, State-Handling, APIs, Deployment)
- Planung, Durchführung und Auswertung der Nutzertests
- Finales Layout, Designanpassungen und Feinschliff
Die Verantwortung für Funktionalität, Qualität und Korrektheit liegt vollständig beim Studierenden.

### Reflexion
Der Einsatz von KI beschleunigte insbesondere die Ideenfindung und Strukturierung komplexer Teile des Projekts. Gleichzeitig war eine kritische Prüfung notwendig, da generische Vorschläge häufig an die konkrete Unterrichtssituation, Zielgruppe und technische Architektur angepasst werden mussten. KI ersetzt keine eigene Konzeption, sondern unterstützt gezielt bei Effizienz und Qualitätssicherung.

### Prompt‑Vorgehen [Optional]
Die KI wurde nicht mit einem einzelnen Grossprompt eingesetzt, sondern iterativ in kurzen, zielgerichteten Abfragen. Typische Prompts bezogen sich auf klar abgegrenzte Probleme, z. B. die Strukturierung eines Spiel-Workflows, die Logik der Ballbewegung oder die Vereinfachung von UI-Flows für Kinder.
Der Ablauf war jeweils:
1. Problem formulieren (z. B. unklarer Spielablauf, zu kleine Touch-Ziele).
2. Lösungsvorschläge der KI einholen (Code-Skizzen, Ablaufbeschreibungen, UX-Ideen).
3. Manuelle Bewertung und Auswahl der passenden Ansätze.
4. Eigenständige Umsetzung und Anpassung im bestehenden Code- und Designkontext.
5. Testen im Prototyp und erneute Anpassung bei Bedarf.
Prompts wurden bewusst konkret und technisch gehalten (z. B. bezogen auf SvelteKit-Komponenten, Spielzustände oder Touch-Interaktionen), um generische Antworten zu vermeiden. Die finale Ausgestaltung erfolgte stets eigenständig im Code und im Design.

### Quellen & Rechte [Optional]
Alle verwendeten Texte, Designs und Code-Anpassungen wurden selbst erstellt oder basieren auf frei verfügbaren Technologien und Frameworks (SvelteKit). Es wurden keine urheberrechtlich geschützten Inhalte ohne Lizenz übernommen.

## 8. Anhang
-

---

<!-- Prüfliste (nicht abgeben, nur intern nutzen) -->
<!--
[x] Kernfunktionalität gemäss Übungen umgesetzt (Workflows durchgängig)
[x] Akzeptanzkriterien formuliert und erfüllt
[ ] Skizzen erstellt (mehrere Varianten, Unterschiede dokumentiert)
[x] Referenz‑Mockup in Decide verlinkt (URL/Screenshots)
[x] Deployment erreichbar
[x] Umsetzung (Technik) vollständig (Technologie‑Stack; Tooling & KI‑Einsatz inkl. Überlegungen; Struktur/Komponenten; Daten/Schnittstellen falls genutzt)
[x] Evaluation durchgeführt; Ergebnisse dokumentiert; Verbesserungen abgeleitet
[x] Dokumentation vollständig, klar strukturiert und konsistent
[x] KI‑Deklaration ausgefüllt (Werkzeuge; Zweck & Umfang; Art der Beiträge; Abgrenzung; Quellen & Rechte; optional: Prompt‑Vorgehen, Reflexion)
[x] Erweiterungen (falls vorhanden) begründet und abgegrenzt
[x] Anhang gepflegt (Testskript/Materialien, Rohdaten/Auswertung) [optional]
-->
