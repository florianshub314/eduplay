# Projektdokumentation – [Projekttitel]

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

- **Deployment:** _[URL]_  

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
-   /src/routes/start/+page.svelte
-   /src/routes/game/+page.svelte
-   /src/routes/result/+page.svelte
-   /src/lib/components/QuestionCard.svelte
-   /src/lib/components/GameField.svelte
-   /src/lib/stores/gameState.js

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
-   Moderierter Test
-   Kurze Aufgaben
-   Smartboard oder Laptop
-   Beobachtetes Verhalten dokumentieren

- **Stichprobe:** _[Mit wem wurde getestet? Profil; Anzahl]_ 

- **Aufgaben/Szenarien:** 
-   Ein Spiel in Mathematik durchführen mit einer ersten Klasse.
-   Ein Spiel neu starten.
-   Den Ball in verschiedene Richtungen bewegen.

- **Kennzahlen & Beobachtungen:** _[z. B. Erfolgsquote, Zeitbedarf, qualitative Findings]_  
- **Zusammenfassung der Resultate:** _[Wichtigste Erkenntnisse; 2–4 Sätze]_  
- **Abgeleitete Verbesserungen:** _[priorisiert, kurz begründet]_  
- **Umgesetzte Anpassungen [Optional]:** _[Im Prototyp umgesetzte Verbesserungen aufgrund der Erkenntnisse in der Evaluation]_ Idealerweise: Zwischenstände separat deployen, Änderungen dokumentieren.

## 5. Erweiterungen [Optional]
Dokumentiert Erweiterungen über den Mindestumfang hinaus.
- **Beschreibung & Nutzen:** 
Es sind mehrere Erweiterungen geplant, die das Grundkonzept von EduPlay sinnvoll ergänzen und den Wert für Lehrpersonen sowie Lernende erhöhen. Diese Erweiterungen verbessern die Bedienbarkeit, bieten zusätzliche Fächer und schaffen mehr Abwechslung im Unterricht.

-   Geplante bzw. teilweise vorbereitete Erweiterungen
Mehrsprachige Fächer
Englisch, Deutsch, Französisch und weitere frei definierbare Fächer („Andere Fächer“).
Erhöht die Flexibilität für verschiedene Unterrichtssituationen.
-   Bildbasierte Fragen im Fach Deutsch
Besonders nützlich für Erstklässler, die noch nicht sicher lesen können (z. B. Silbentrennung anhand eines Bildes).
Zugänglicheres Lernen für jüngere Kinder.
-   Zusätzliche Buttons wie „Falsch“, „Skip/Überspringen“ und „Spiel beenden“
Mehr Kontrolle und pädagogische Flexibilität während des Spiels.
-   Popup bei Tor (wird wieder eingebaut)
Visuelles und motivierendes Feedback.
-   Optimiertes Smartboard-UI
Große Buttons, kontrastreiche Farben, Touch-Optimierung.
Bessere Nutzbarkeit auf Wandtafeln im Schulzimmer.
-   Emoji-Optimierung
Emojis nur bei bestimmten Fächern (z. B. Mathe, Englisch, Deutsch).
Einheitliches und kindgerechtes Design.

- **Umsetzung in Kürze:** _[Wie wurde es gemacht?]_  
- **Abgrenzung zum Mindestumfang:** _[klar darstellen]_  

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
