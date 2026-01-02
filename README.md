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

> **Hinweis:** Massgeblich sind die im **Unterricht** und auf **Moodle** kommunizierten Anforderungen.

<!-- WICHTIG: DIE KAPITELSTRUKTUR DARF NICHT VERÄNDERT WERDEN! -->

<!-- Diese Vorlage ist für eine README.md im Repository gedacht. Abschnitte mit [Optional] können weggelassen werden, wenn in den Übungen nichts anderes verlangt wird. -->

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

- **Annahmen [Optional]:** 
-   Kinder lernen motivierter, wenn Lerninhalte verspielt und kompetitiv aufbereitet sind.
-   Kurze, schnelle Quizrunden passen gut in Unterrichtsabläufe.
-   Lehrpersonen brauchen ein Tool, das ohne technische Hürden sofort funktioniert.

## 3. Anforderungen & Umfang
Beschreibt den verbindlichen Umfang gemäss Übungen und allfällige Erweiterungen.
- **Kernfunktionalität (Mindestumfang):** 
Gemäss den Übungen ab Semesterwoche 8 sowie den Projektanforderungen () umfasst der Mindestumfang Folgendes:
-   Startseite mit Auswahl der Kategorie (Mathe, Englisch, Deutsch, Französisch, Andere Fächer).
-   Lerninhalte laden:
Direkte Eingabe von Fragen/Antworten oder
Hochladen einer Datei (z. B. einfache Textliste).
-   Quiz-Spielablauf:
Zwei Teams (Rot & Blau) treten gegeneinander an.
Jede richtige Antwort bewegt den Ball Richtung gegnerisches Tor.
Visuelle Rückmeldung für richtig/falsch.
-   Spielfeldansicht mit klar sichtbarer Ballposition (Wandtafelfußball-Stil).
-   Fragenanzeige + Antwort-Buttons (Touch-kompatibel).
-   Resultatansicht nach Abschluss mit Anzeige des Gewinnerteams.
-   Navigation zwischen Start → Spiel → Ergebnis.

- **Akzeptanzkriterien:** 
-   Nutzende können einen vollständigen Spielablauf von Start bis Resultat ohne Fehlermeldung durchführen.
-   Fragen werden korrekt geladen und angezeigt.
-   Ball bewegt sich sichtbar nach jeder richtigen Antwort.
-   Die Bedienung ist klar, kindgerecht und konsistent.
-   Alle wesentlichen Schritte funktionieren auf Touch-Geräten (z. B. Smartboard).
-   Spiel lässt sich jederzeit neu starten.

- **Erweiterungen [Optional]:** 
-   Kategorien: Englisch, Deutsch, Französisch, Andere Fächer
-   Anzeige von Emojis bei einzelnen Fächern
-   Option für falsche Antwort, Skip, Spiel beenden
-   Soundeffekte (Jubel, Tor, Fehlton)
-   Popup bei Tor (wird wieder implementiert)
-   Möglichkeit, Bilder im Deutsch-Spiel zu nutzen (z. B. Silben-Bestimmung)
-   Lehrer-Modus zur Frageverwaltung
-   Zusätzliche Layout- oder Designoptimierungen basierend auf Figma-Mockups
-   Smartboard-freundliches UI, große Buttons, klare Farben

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
5.  Kinder klicken Antwort → richtig/falsch
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
- **Kernfunktionalität:** _[Kurzbeschreibung der Workflows/Funktionen]_  
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

- **Oberflächenentwürfe:** _[wichtige Screens: Screenshots mit kurzer Erläuterung]_ 

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
- **URL der getesteten Version** (separat deployt)
- **Ziele der Prüfung:** 
-   Verstehen Kinder den Spielablauf sofort?
-   Funktionieren Buttons und Ballbewegung intuitiv?
-   Sind Farben und Rückmeldungen klar?
-   Reagiert das UI gut auf Touch-Eingaben?

- **Vorgehen:** 
-   Moderierter Kurztest direkt im Unterricht (heute, 1. Klasse Mathematik)
-   Einsatz auf dem Smartboard mit Touch-Eingaben
-   Lehrperson erklärt kurz den Ablauf, danach spielen die Kinder eigenständig mehrere Runden
-   Beobachtungen sowie spontane Rückmeldungen der Kinder werden protokolliert (Bedienung, Verständnis, Motivation)

- **Stichprobe:** 
-   Eine erste Primarschulklasse (ca. 20 Kinder, Altersgruppe 7–8 Jahre)

- **Aufgaben/Szenarien:** 
-   Ein komplettes Mathe-Spiel mit Addition/Subtraktion durchführen und Gewinner anzeigen
-   Eine Runde neu starten, um zu prüfen, ob Kinder ohne Anleitung zurück zum Setup gelangen
-   Während des Spiels gezielt falsche Antworten und Skip-Buttons auslösen, um Feedback/Timer zu beobachten
-   Mehrere Tore erzielen, damit Tor-Popup und Ball-Rücksetzung überprüft werden

- **Kennzahlen & Beobachtungen:** _[z. B. Erfolgsquote, Zeitbedarf, qualitative Findings]_  
- **Zusammenfassung der Resultate:** _[Wichtigste Erkenntnisse; 2–4 Sätze]_  
- **Abgeleitete Verbesserungen:** _[priorisiert, kurz begründet]_  
- **Umgesetzte Anpassungen [Optional]:** _[Im Prototyp umgesetzte Verbesserungen aufgrund der Erkenntnisse in der Evaluation]_ Idealerweise: Zwischenstände separat deployen, Änderungen dokumentieren.


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
    /start
    /mathe
    /deutsch
    /englisch
    /franzoesisch
    /andere
    /login
    +layout.svelte
    +page.svelte
  /lib
    /components
    /stores
/static
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

- **Commit‑Praxis:** _[z. B. sprechende Commits]_

## 7. KI‑Deklaration
Die folgende Deklaration ist verpflichtend und beschreibt den Einsatz von KI im Projekt.

### Eingesetzte KI‑Werkzeuge
ChatGPT 5.1(Unterstützung bei Konzeptentwicklung, Problemlösung, Codevorschlägen, Fehlersuche und Dokumentation)

### Zweck & Umfang
-   Konzeptentwicklung & Strukturierung
Unterstützung bei der Ausarbeitung der Grundidee von EduPlay, Strukturieren der Dokumentation, Formulieren der Zielsetzung und der Methode (Understand, Sketch, Decide, Prototype, Validate).
-   Codevorschläge & Problemlösung
KI wurde verwendet für:
Vorschläge für SvelteKit-Komponenten
Hilfe bei Routing-Problemen
Erstellen von Stores (z. B. Spielzustand, Ballposition)
Unterstützung bei Layout-Problemen und Responsive Design
Generieren von Beispielcode für Features (Ballbewegung, Buttons, Spielfeld)
-   Textentwürfe & Dokumentation
KI half beim Formulieren der README, beim Erklären von Vorgehensschritten und beim Aufbau der Kapitel
-   Reflexion & Qualität
KI wurde genutzt, um mögliche Verbesserungen im UX-Design und in der Projektorganisation zu identifizieren.

### Art der Beiträge
_[konkret: welche Teile stammen (ganz/teilweise) aus KI‑Unterstützung?]_

### Eigene Leistung (Abgrenzung)
_[was ist eigenständig erarbeitet/überarbeitet worden?]_

### Reflexion
_[Nutzen, Grenzen, Risiken/Qualitätssicherung]_

### Prompt‑Vorgehen [Optional]
_[wichtige Prompts/Workflows in Kürze]_

### Quellen & Rechte [Optional]
_[verwendete Vorlagen/Assets/Modelle; Lizenz/Urheberrecht; Zitierweise]_

## 8. Anhang [Optional]
Beispiele:
- **Testskript & Materialien:** _[Link/Datei]_  
- **Rohdaten/Auswertung:** _[Link/Datei]_  

---

<!-- Prüfliste (nicht abgeben, nur intern nutzen) -->
<!--
[ ] Kernfunktionalität gemäss Übungen umgesetzt (Workflows durchgängig)
[ ] Akzeptanzkriterien formuliert und erfüllt
[ ] Skizzen erstellt (mehrere Varianten, Unterschiede dokumentiert)
[ ] Referenz‑Mockup in Decide verlinkt (URL/Screenshots)
[ ] Deployment erreichbar
[ ] Umsetzung (Technik) vollständig (Technologie‑Stack; Tooling & KI‑Einsatz inkl. Überlegungen; Struktur/Komponenten; Daten/Schnittstellen falls genutzt)
[ ] Evaluation durchgeführt; Ergebnisse dokumentiert; Verbesserungen abgeleitet
[ ] Dokumentation vollständig, klar strukturiert und konsistent
[ ] KI‑Deklaration ausgefüllt (Werkzeuge; Zweck & Umfang; Art der Beiträge; Abgrenzung; Quellen & Rechte; optional: Prompt‑Vorgehen, Reflexion)
[ ] Erweiterungen (falls vorhanden) begründet und abgegrenzt
[ ] Anhang gepflegt (Testskript/Materialien, Rohdaten/Auswertung) [optional]
-->
