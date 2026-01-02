<script>
  import { goto } from "$app/navigation";
  import { onDestroy } from "svelte";
  import SetupScreen from "$lib/components/game/SetupScreen.svelte";
  import ActiveGameScreen from "$lib/components/game/ActiveGameScreen.svelte";
  import EndScreen from "$lib/components/game/EndScreen.svelte";
  import GoalPopup from "$lib/components/game/GoalPopup.svelte";
  import {
    buildMaterialSnippet,
    parseMaterialFile
  } from "$lib/utils/materialParser";
  import { cleanQuestionText } from "$lib/utils/questionFormatter";
  import { saveQuestionSet } from "$lib/utils/setStorage.js";
  import { requestAiQuestions } from "$lib/utils/aiQuestionGenerator.js";
  import { pickUniqueRandomItems } from "$lib/utils/randomHelpers.js";
import FileDropzone from "$lib/components/inputs/FileDropzone.svelte";
import SaveSetPanel from "$lib/components/game/SaveSetPanel.svelte";
import WinnerPopup from "$lib/components/game/WinnerPopup.svelte";

  let numQuestions = 10;
  let file = null;
  let useManualInput = false;
  let manualInput = "";
  let customTasks = [];
  let fileError = "";
  let materialText = "";
  let isPdfUpload = false;
  let aiLoading = false;
  let aiError = "";
  let aiInstructions = "";
  let useAiGenerator = false;

  let questions = [];
  let gameStarted = false;
  let gameOver = false;
  let currentQuestionIndex = 0;

  let redScore = 0;
  let blueScore = 0;
  let ballPosition = 0;
  const maxBallPosition = 4;

  let blueTeamName = "";
  let redTeamName = "";
  $: blueTeamLabel = blueTeamName.trim() || "Team Blau";
  $: redTeamLabel = redTeamName.trim() || "Team Rot";

  const taskTypes = {
    syllables: false,
    capitalization: false,
    articles: false
  };

  const syllableWords = [
    "Elefant",
    "Auto",
    "Banane",
    "Schokolade",
    "Erdbeere",
    "Tomate",
    "Fernseher",
    "Krokodil",
    "Lokomotive"
  ];

  const capitalizationSentences = [
    "ich gehe morgen zur schule.",
    "am montag haben wir sport.",
    "wir essen heute pizza.",
    "gestern war ich bei oma.",
    "heute ist ein schöner tag."
  ];

  const articleWords = [
    "Baum",
    "Lampe",
    "Auto",
    "Maus",
    "Fenster",
    "Stuhl",
    "Kaffee",
    "Himmel",
    "Brot"
  ];

  const autoQuestions = [
    "Setze das Komma: Als ich nach Hause kam ___ fing es an zu regnen.",
    "Wie lautet der Artikel? ___ Baum (der/die/das)",
    "Wie lautet der Plural von 'Haus'?",
    "Schreibe richtig: 'am montag ging ich zur schule'",
    "Was ist ein Synonym für 'reden'?",
    "Welche Zeitform ist: 'Ich ging.'?",
    "Setze das passende Wort ein: 'Ich freue mich ___ dich.'",
    "Finde den Fehler: 'dass Auto ist rot'",
    "Welches Wort passt? 'Der Hund ___ laut.'",
    "Was ist das Gegenteil von 'kalt'?"
  ];

  let showTimer = false;
  let timer = 10;
  let timerInterval;

  let showPopup = false;
  let popupMessage = "";
  let popupTimeout;
  let popupVariant = "neutral";

  let saveTitle = "";
  let savingSet = false;
  let saveStatus = "";
  let saveError = "";
  let winnerPopupVisible = false;
  let winnerName = "";
  let winnerSubtitle = "";

  const wrongLabel = "Falsch";
  const skipLabel = "Überspringen";
  const endLabel = "Spiel beenden";

  let setupSection;

  function scrollToTop() {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function showMessage(msg, variant = "neutral") {
    popupMessage = msg;
    popupVariant = variant;
    showPopup = true;
    clearTimeout(popupTimeout);
    popupTimeout = setTimeout(() => {
      showPopup = false;
    }, 2200);
  }

  async function handleFileUpload(event) {
    const fileList = event?.detail?.files ?? event?.target?.files;
    file = fileList?.[0] ?? null;
    fileError = "";
    aiError = "";
    materialText = "";
    isPdfUpload = false;

    if (!file) {
      customTasks = [];
      return;
    }

    try {
      const parsed = await parseMaterialFile(file);
      customTasks = parsed.lines;
      materialText = parsed.text;
      isPdfUpload = parsed.isPdf;
    } catch (error) {
      console.error("Material konnte nicht gelesen werden:", error);
      fileError =
        error?.message || "Die Datei konnte nicht verarbeitet werden.";
      customTasks = [];
      materialText = "";
      isPdfUpload = false;
      file = null;
      event.target.value = "";
    }
  }

  function processManualInput() {
    customTasks = manualInput
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 2);
  }

  function buildQuestionPool() {
    const pool = [];

    if ((file || useManualInput) && customTasks.length > 0) {
      const uniqueTasks = pickUniqueRandomItems(customTasks, numQuestions);
      pool.push(...uniqueTasks);
    } else if (taskTypes.syllables) {
      for (let i = 0; i < numQuestions; i += 1) {
        const word =
          syllableWords[Math.floor(Math.random() * syllableWords.length)];
        pool.push(`Bestimme die Silben: ${word}`);
      }
    } else if (taskTypes.capitalization) {
      for (let i = 0; i < numQuestions; i += 1) {
        const sentence =
          capitalizationSentences[
            Math.floor(Math.random() * capitalizationSentences.length)
          ];
        pool.push(`Schreibe richtig: "${sentence}"`);
      }
    } else if (taskTypes.articles) {
      for (let i = 0; i < numQuestions; i += 1) {
        const word =
          articleWords[Math.floor(Math.random() * articleWords.length)];
        pool.push(`Welcher Artikel passt? (der/die/das) → ${word}`);
      }
    } else {
      for (let i = 0; i < numQuestions; i += 1) {
        pool.push(
          autoQuestions[Math.floor(Math.random() * autoQuestions.length)]
        );
      }
    }

    return pool.map((text, index) => ({
      id: index + 1,
      question: cleanQuestionText(text)
    }));
  }

  function startGameWith(list) {
    questions = list;
    gameStarted = true;
    gameOver = false;
    currentQuestionIndex = 0;
    ballPosition = 0;
    redScore = 0;
    blueScore = 0;
    showPopup = false;
    stopTimer();
    saveStatus = "";
    saveError = "";
    winnerPopupVisible = false;
    scrollToTop();
  }

  function buildGermanAiMaterial() {
    if ((file || useManualInput) && customTasks.length > 0) {
      return `Eigene Aufgaben oder Textstellen:\n${customTasks.join("\n")}`;
    }

    const selectedCategories = [];
    if (taskTypes.syllables) selectedCategories.push("Silben bestimmen");
    if (taskTypes.capitalization)
      selectedCategories.push("Groß- und Kleinschreibung");
    if (taskTypes.articles) selectedCategories.push("Artikel bestimmen");

    const lines = [`Es werden ${numQuestions} Fragen benötigt.`];
    if (selectedCategories.length > 0) {
      lines.push(`Fokus: ${selectedCategories.join(", ")}`);
    } else {
      lines.push("Allgemeine Aufgaben zu Grammatik, Rechtschreibung und Sprache.");
    }
    return lines.join("\n");
  }

  async function generateQuestionsWithAiSettings() {
    const material = buildGermanAiMaterial();
    aiLoading = true;
    aiError = "";

    try {
      const instructions = [
        "Erstelle abwechslungsreiche Deutsch-Aufgaben auf Grundschulniveau. Stelle klare Fragen und gib nur die Aufgabenstellung ohne Lösung aus.",
        aiInstructions.trim()
      ]
        .filter(Boolean)
        .join(" ");

      const list = await requestAiQuestions({
        subject: "deutsch",
        material,
        instructions,
        fileName: file?.name,
        numQuestions
      });

      const mapped = list.map((entry, index) => ({
        id: index + 1,
        question: cleanQuestionText(entry.question),
        hint: entry.hint ?? null
      }));
      startGameWith(mapped);
      return true;
    } catch (error) {
      aiError = error.message || "Die KI konnte keine Fragen generieren.";
      return false;
    } finally {
      aiLoading = false;
    }
  }

  async function generateQuestionsFromPdf() {
    if (!materialText.trim()) {
      aiError = "Das PDF konnte nicht gelesen werden.";
      return false;
    }

    const lines =
      customTasks.length > 0
        ? customTasks
        : materialText
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter((line) => line.length > 0);

    const snippet = buildMaterialSnippet(lines);
    if (!snippet) {
      aiError = "Im Dokument konnten keine Inhalte gefunden werden.";
      return false;
    }

    aiLoading = true;
    aiError = "";

    try {
      const list = await requestAiQuestions({
        subject: "deutsch",
        material: snippet,
        instructions:
          "Erstelle abwechslungsreiche Fragen zum deutschen Unterrichtsstoff. Nutze zentrale Begriffe, Grammatik oder Textverständnis und halte die Fragen kurz.",
        fileName: file?.name,
        numQuestions
      });

      const mapped = list.map((entry, index) => ({
        id: index + 1,
        question: cleanQuestionText(entry.question),
        hint: entry.hint ?? null
      }));
      startGameWith(mapped);
      return true;
    } catch (error) {
      aiError = error.message || "Unbekannter Fehler bei der KI.";
      return false;
    } finally {
      aiLoading = false;
    }
  }

  async function generateQuestions() {
    if (aiLoading) return;

    if (isPdfUpload && materialText) {
      const success = await generateQuestionsFromPdf();
      if (success) {
        return;
      }
      // Wenn KI scheitert, nicht weitermachen.
      return;
    }

    if (useAiGenerator) {
      const ok = await generateQuestionsWithAiSettings();
      if (ok) {
        return;
      }
    }

    const pool = buildQuestionPool();
    startGameWith(pool);
  }

  function moveBall(team) {
    if (team === "red") {
      ballPosition = Math.max(ballPosition - 1, -maxBallPosition);
      if (ballPosition === -maxBallPosition) {
        handleGoal("red");
      }
    } else {
      ballPosition = Math.min(ballPosition + 1, maxBallPosition);
      if (ballPosition === maxBallPosition) {
        handleGoal("blue");
      }
    }
    nextQuestion();
  }

  function wrongAnswer() {
    showTimer = true;
    timer = 10;
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      timer -= 1;
      if (timer <= 0) {
        stopTimer();
        nextQuestion();
      }
    }, 1000);
  }

  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    showTimer = false;
    timer = 10;
  }

  function nextQuestion() {
    stopTimer();
    if (currentQuestionIndex < questions.length - 1) {
      currentQuestionIndex += 1;
    } else {
      endGame();
    }
  }

  function resetField() {
    ballPosition = 0;
    stopTimer();
  }

  function endGame() {
    gameStarted = false;
    gameOver = true;
    if (redScore > blueScore) {
      showMessage("🏆 Team Rot gewinnt!");
      winnerName = redTeamLabel;
      winnerSubtitle = `Endstand ${redScore} : ${blueScore}`;
    } else if (blueScore > redScore) {
      showMessage("🏆 Team Blau gewinnt!");
      winnerName = blueTeamLabel;
      winnerSubtitle = `Endstand ${blueScore} : ${redScore}`;
    } else {
      showMessage("🤝 Unentschieden!");
      winnerName = "Unentschieden";
      winnerSubtitle = "Beide Teams sind gleich stark.";
    }
    winnerPopupVisible = true;
    resetField();
  }

  function resetGame() {
    gameStarted = false;
    gameOver = false;
    questions = [];
    currentQuestionIndex = 0;
    redScore = 0;
    blueScore = 0;
    resetField();
    showPopup = false;
    popupVariant = "neutral";
    winnerPopupVisible = false;
  }

  function goBack() {
    resetGame();
    goto("/start");
  }

  function handleGoal(team) {
    if (team === "red") {
      redScore += 1;
      showMessage("⚽️ TOR für Team Rot!", "red");
    } else {
      blueScore += 1;
      showMessage("⚽️ TOR für Team Blau!", "blue");
    }
    resetField();
  }

  onDestroy(() => {
    clearTimeout(popupTimeout);
    stopTimer();
  });

  function scrollToSetupSection() {
    if (typeof window === "undefined") return;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    setupSection?.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start"
    });
  }

  async function saveCurrentQuestions() {
    saveStatus = "";
    saveError = "";

    if (questions.length === 0) {
      saveError = "Es gibt noch keine Fragen zum Speichern.";
      return;
    }

    try {
      savingSet = true;
      const set = await saveQuestionSet({
        title: saveTitle,
        subject: "deutsch",
        questions
      });
      saveStatus = `Gespeichert als „${set.title}“`;
      saveTitle = set.title;
    } catch (error) {
      saveError = error.message || "Speichern fehlgeschlagen.";
    } finally {
      savingSet = false;
    }
  }
</script>

{#if !gameStarted && !gameOver}
  <div class="page-shell">
    <section class="hero">
      <div class="hero-shapes">
        <span class="shape shape-a"></span>
        <span class="shape shape-b"></span>
        <span class="shape shape-c"></span>
        <span class="shape shape-d"></span>
      </div>
      <div class="hero-grid">
        <div class="hero-copy">
          <p class="eyebrow">Deutsch · Wandtafelspiel</p>
          <h1>Spielerisch Deutsch trainieren</h1>
          <p class="lede">
            Starte sofort ein lebendiges Team-Duell, nutze eigene Materialien oder lass die KI
            frische Fragen erstellen. Alles in einem bunten, klaren Ablauf.
          </p>
          <div class="cta-row">
            <button class="cta-button primary" type="button" on:click={scrollToSetupSection}>
              Spiel aufbauen
            </button>
            <button class="cta-button ghost" type="button" on:click={goBack}>
              Zurück zur Übersicht
            </button>
          </div>
          <div class="microcopy">
            <span class="dot"></span>
            Kein Material nötig – optional PDF oder KI
          </div>
        </div>
        <div class="hero-visual">
          <div class="visual-card">
            <div class="visual-top">
              <p class="visual-label">Sofort einsatzbereit</p>
              <div class="pill pill-green">2 Teams</div>
            </div>
            <div class="visual-metrics">
              <div>
                <p class="metric-label">Fragen-Set</p>
                <p class="metric-value">{numQuestions}</p>
              </div>
              <div>
                <p class="metric-label">KI Modus</p>
                <p class="metric-value">{useAiGenerator ? "an" : "aus"}</p>
              </div>
              <div>
                <p class="metric-label">PDF Upload</p>
                <p class="metric-value">{isPdfUpload ? "aktiv" : "frei"}</p>
              </div>
            </div>
            <ul class="visual-list">
              <li>Team Blau & Team Rot treten an</li>
              <li>Aufgabentyp wählen oder Datei hochladen</li>
              <li>Fragen speichern für spätere Runden</li>
            </ul>
            <div class="visual-shapes">
              <span class="chip chip-pink"></span>
              <span class="chip chip-yellow"></span>
              <span class="chip chip-violet"></span>
              <span class="chip chip-green"></span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="feature-section">
      <div class="section-heading">
        <p class="eyebrow">Alles im Blick</p>
        <h2>Bunte Struktur wie auf der Referenzseite</h2>
        <p class="section-lede">
          Drei kompakte Schritte, kräftige Farben und klare Kacheln – perfekt, um sofort loszulegen.
        </p>
      </div>
      <div class="feature-grid">
        <article class="feature-card">
          <div class="feature-icon">✨</div>
          <h3>Fragen mischen</h3>
          <p>Klicke Presets, nutze eigene Texte oder lass die KI neue Aufgaben zaubern.</p>
        </article>
        <article class="feature-card">
          <div class="feature-icon">📚</div>
          <h3>Klarer Ablauf</h3>
          <p>Teams benennen, Aufgabentyp wählen, Spiel starten – übersichtlich und schnell.</p>
        </article>
        <article class="feature-card">
          <div class="feature-icon">💾</div>
          <h3>Sets sichern</h3>
          <p>Fragen-Sets speichern und wiederverwenden, damit gute Ideen nicht verloren gehen.</p>
        </article>
      </div>
    </section>

    <section class="explanation-section">
      <div class="explanation-card">
        <div class="explanation-shape shape-one"></div>
        <div class="explanation-shape shape-two"></div>
        <p class="eyebrow">So läuft's</p>
        <h2>Spielprinzip in kurzen Worten</h2>
        <p class="section-lede">
          Wähle Aufgaben, starte das Duell und verfolge, wie der Ball sich Richtung Tor bewegt.
          Jede richtige Antwort verschiebt das Feld, jede Runde bleibt dynamisch.
        </p>
        <div class="steps">
          <div class="step">
            <span class="step-badge">1</span>
            <div>
              <p class="step-title">Teams und Aufgaben setzen</p>
              <p class="step-copy">
                Namen vergeben, Anzahl Fragen festlegen, Checkboxen aktivieren oder eigenes Material
                hochladen.
              </p>
            </div>
          </div>
          <div class="step">
            <span class="step-badge">2</span>
            <div>
              <p class="step-title">Spiel starten</p>
              <p class="step-copy">
                Mit „Weiter zu Fragen“ starten. KI-Optionen oder PDF-Auszug stehen bereit.
              </p>
            </div>
          </div>
          <div class="step">
            <span class="step-badge">3</span>
            <div>
              <p class="step-title">Speichern & wiederholen</p>
              <p class="step-copy">
                Nach dem Spiel das Set sichern und bei Bedarf sofort erneut abspielen.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="cta-setup" id="setup-panel" bind:this={setupSection}>
      <div class="cta-backdrop">
        <span class="cta-shape shape-x"></span>
        <span class="cta-shape shape-y"></span>
        <span class="cta-shape shape-z"></span>
      </div>
      <div class="cta-grid stacked">
        <SetupScreen
          title="Deutsch – Wandtafelspiel"
          infoText="Wenn die Felder leer bleiben, heißen die Teams automatisch „Team Blau“ und „Team Rot“."
          bind:blueTeamName
          bind:redTeamName
          bind:numQuestions
          on:back={goBack}
          on:start={generateQuestions}
        >
          <div class="extra-settings inline-settings">
            <p class="group-label">Aufgabentyp</p>
            <div class="task-grid">
              <label>
                <input type="checkbox" bind:checked={taskTypes.syllables} />
                Silben bestimmen
              </label>
              <label>
                <input type="checkbox" bind:checked={taskTypes.capitalization} />
                Groß- und Kleinschreibung
              </label>
              <label>
                <input type="checkbox" bind:checked={taskTypes.articles} />
                Artikel bestimmen
              </label>
            </div>
            <p class="file-info">Kombiniere beliebig, sonst stellen wir einen Mix zusammen.</p>
          </div>
        </SetupScreen>

        <div class="compact-card">
          <p class="eyebrow">Bereit zum Start?</p>
          <h3>Material & KI im Schnellzugriff</h3>
          <p class="section-lede compact-copy">
            Teams und Fragen setzen, dann Material oder KI wählen. Alles behält seine Funktion, nur
            klar untereinander angeordnet.
          </p>
          <div class="cta-row tight">
            <button class="cta-button primary" type="button" on:click={scrollToTop}>
              Seitenanfang
            </button>
            <button class="cta-button ghost" type="button" on:click={goBack}>
              Zurück zur Übersicht
            </button>
          </div>
          <ul class="mini-list">
            <li>PDF/TXT hochladen oder manuell tippen</li>
            <li>KI kann auf Auswahl und Hinweise reagieren</li>
            <li>Fragenset danach speichern</li>
          </ul>
        </div>

        <div class="extra-settings side-panel">
          <FileDropzone
            label="Unterrichtsstoff (TXT oder PDF, optional)"
            accept=".txt,.pdf"
            on:change={handleFileUpload}
            fileName={file?.name}
            loading={aiLoading}
          />
          {#if fileError}
            <p class="file-error">{fileError}</p>
          {/if}
          {#if aiLoading}
            <p class="file-info">🤖 KI erstellt Fragen …</p>
          {/if}
          {#if aiError}
            <p class="file-error">{aiError}</p>
          {/if}

          <label class="toggle">
            <input type="checkbox" bind:checked={useManualInput} />
            Eigene Aufgaben manuell eingeben
          </label>

          {#if useManualInput}
            <textarea
              rows="4"
              placeholder={"Beispiele:\\nArtikel einsetzen\\nPlural bilden\\nSätze korrigieren"}
              bind:value={manualInput}
              on:input={processManualInput}
            ></textarea>
          {/if}

          <label class="toggle">
            <input type="checkbox" bind:checked={useAiGenerator} />
            KI-Fragen anhand der Auswahl erzeugen
          </label>

          {#if useAiGenerator}
            <textarea
              rows="3"
              placeholder="Zusatzhinweise an die KI (optional)"
              bind:value={aiInstructions}
            ></textarea>
          {/if}
        </div>
      </div>
    </section>
  </div>
{/if}

{#if gameStarted && !gameOver}
  <ActiveGameScreen
    {blueTeamLabel}
    {redTeamLabel}
    {blueScore}
    {redScore}
    currentQuestionIndex={currentQuestionIndex}
    {questions}
    {ballPosition}
    {maxBallPosition}
    {showTimer}
    {timer}
    {wrongLabel}
    {skipLabel}
    {endLabel}
    on:score={(event) => moveBall(event.detail.team)}
    on:wrong={wrongAnswer}
    on:skip={nextQuestion}
    on:end={endGame}
  />
{/if}

{#if gameOver}
  <EndScreen
    {blueTeamLabel}
    {redTeamLabel}
    {blueScore}
    {redScore}
    on:restart={resetGame}
    on:back={goBack}
  />
{/if}

<GoalPopup message={popupMessage} visible={showPopup} variant={popupVariant} />

<WinnerPopup
  visible={winnerPopupVisible}
  winner={winnerName}
  subtitle={winnerSubtitle}
  on:close={() => (winnerPopupVisible = false)}
/>

<SaveSetPanel
  visible={questions.length > 0}
  description="Lege einen Titel fest und sichere das aktuelle Set für später."
  bind:saveTitle
  saving={savingSet}
  status={saveStatus}
  error={saveError}
  on:save={saveCurrentQuestions}
/>

<style>
  :global(:root) {
    --ink: #1f1a2d;
    --bg: #fdf7ef;
    --card: #fffdf8;
    --accent-violet: #8b5cf6;
    --accent-pink: #ff6fb7;
    --accent-yellow: #ffd166;
    --accent-green: #66d08f;
  }

  :global(body) {
    background: var(--bg);
    color: var(--ink);
    font-family: "Manrope", "Baloo 2", "Fredoka", system-ui, -apple-system,
      BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  .page-shell {
    position: relative;
    overflow: hidden;
    padding: 36px 18px 120px;
  }

  .hero {
    position: relative;
    max-width: 1180px;
    margin: 0 auto 90px;
    padding: 42px;
    border: 4px solid var(--ink);
    border-radius: 34px;
    background: linear-gradient(135deg, #fffaf3 0%, #fff3e2 50%, #ffeaf9 100%);
    box-shadow: 16px 16px 0 rgba(31, 26, 45, 0.16);
    overflow: hidden;
  }

  .hero-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 32px;
    align-items: center;
    position: relative;
    z-index: 1;
  }

  .hero-shapes .shape {
    position: absolute;
    border: 4px solid var(--ink);
    border-radius: 999px;
    box-shadow: 10px 10px 0 rgba(31, 26, 45, 0.18);
    opacity: 0.65;
  }

  .hero-shapes .shape-a {
    width: 220px;
    height: 220px;
    background: var(--accent-yellow);
    top: -80px;
    right: 12%;
    transform: rotate(-8deg);
  }

  .hero-shapes .shape-b {
    width: 140px;
    height: 140px;
    background: var(--accent-violet);
    bottom: 10%;
    right: -40px;
    transform: rotate(6deg);
  }

  .hero-shapes .shape-c {
    width: 160px;
    height: 160px;
    background: #8ce9ff;
    bottom: -60px;
    left: 18%;
    transform: rotate(-14deg);
  }

  .hero-shapes .shape-d {
    width: 120px;
    height: 120px;
    background: var(--accent-pink);
    top: 12%;
    left: -50px;
    transform: rotate(18deg);
  }

  .hero-copy h1 {
    font-size: clamp(2.6rem, 4vw, 3.4rem);
    margin: 8px 0 12px;
    letter-spacing: -0.02em;
  }

  .hero-copy .lede {
    font-size: 1.05rem;
    line-height: 1.6;
    max-width: 540px;
    margin: 0 0 22px;
  }

  .eyebrow {
    font-weight: 900;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-size: 0.95rem;
    display: inline-block;
    padding: 10px 16px;
    border: 3px solid var(--ink);
    border-radius: 999px;
    background: #fffef9;
    box-shadow: 8px 8px 0 rgba(31, 26, 45, 0.14);
    margin: 0;
  }

  .cta-row {
    display: flex;
    gap: 14px;
    flex-wrap: wrap;
    margin-bottom: 12px;
  }

  .cta-button {
    border: 3px solid var(--ink);
    border-radius: 999px;
    padding: 14px 22px;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 10px 10px 0 rgba(31, 26, 45, 0.18);
    transition: transform 120ms ease, box-shadow 120ms ease, background 120ms ease;
  }

  .cta-button.primary {
    background: linear-gradient(120deg, var(--accent-violet), var(--accent-pink));
    color: var(--ink);
  }

  .cta-button.ghost {
    background: #fff;
    color: var(--ink);
  }

  .cta-button:hover {
    transform: translateY(-3px);
    box-shadow: 14px 14px 0 rgba(31, 26, 45, 0.24);
  }

  .cta-button:active {
    transform: translateY(2px);
    box-shadow: 6px 6px 0 rgba(31, 26, 45, 0.2);
  }

  .cta-button:focus-visible {
    outline: 3px solid var(--accent-green);
    outline-offset: 3px;
  }

  .microcopy {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-weight: 700;
    background: #fff;
    padding: 10px 14px;
    border: 3px solid var(--ink);
    border-radius: 16px;
    box-shadow: 10px 10px 0 rgba(31, 26, 45, 0.12);
  }

  .dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--accent-green);
    display: inline-block;
    border: 2px solid var(--ink);
  }

  .hero-visual {
    position: relative;
  }

  .visual-card {
    position: relative;
    background: var(--card);
    border: 4px solid var(--ink);
    border-radius: 28px;
    padding: 26px;
    box-shadow: 16px 16px 0 rgba(31, 26, 45, 0.18);
    overflow: hidden;
  }

  .visual-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
  }

  .visual-label {
    margin: 0;
    font-weight: 800;
  }

  .pill {
    border: 3px solid var(--ink);
    border-radius: 999px;
    padding: 8px 14px;
    font-weight: 800;
    box-shadow: 8px 8px 0 rgba(31, 26, 45, 0.12);
  }

  .pill-green {
    background: var(--accent-green);
  }

  .visual-metrics {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
    gap: 14px;
    margin: 18px 0;
  }

  .metric-label {
    margin: 0 0 4px;
    font-size: 0.9rem;
    font-weight: 700;
  }

  .metric-value {
    margin: 0;
    font-size: 1.6rem;
    font-weight: 900;
  }

  .visual-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    gap: 10px;
  }

  .visual-list li {
    padding: 12px 14px;
    border: 3px solid var(--ink);
    border-radius: 18px;
    background: #fff;
    box-shadow: 10px 10px 0 rgba(31, 26, 45, 0.12);
    font-weight: 700;
  }

  .visual-shapes {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .chip {
    position: absolute;
    border: 3px solid var(--ink);
    border-radius: 50%;
    width: 42px;
    height: 42px;
    box-shadow: 8px 8px 0 rgba(31, 26, 45, 0.12);
  }

  .chip-pink {
    background: var(--accent-pink);
    top: 12%;
    right: 10%;
  }

  .chip-yellow {
    background: var(--accent-yellow);
    bottom: 18%;
    right: 6%;
  }

  .chip-violet {
    background: var(--accent-violet);
    bottom: 12%;
    left: 10%;
  }

  .chip-green {
    background: var(--accent-green);
    top: 18%;
    left: 16%;
  }

  .feature-section {
    max-width: 1180px;
    margin: 0 auto 80px;
    position: relative;
    padding: 0 4px;
  }

  .section-heading h2 {
    font-size: clamp(2rem, 3vw, 2.4rem);
    margin: 10px 0 8px;
  }

  .section-lede {
    margin: 0;
    font-size: 1.05rem;
    line-height: 1.6;
    max-width: 820px;
  }

  .feature-grid {
    margin-top: 28px;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 18px;
  }

  .feature-card {
    background: linear-gradient(180deg, #fff, #fff2de);
    border: 4px solid var(--ink);
    border-radius: 26px;
    padding: 20px 18px;
    box-shadow: 14px 14px 0 rgba(31, 26, 45, 0.18);
  }

  .feature-icon {
    width: 52px;
    height: 52px;
    border-radius: 18px;
    display: grid;
    place-items: center;
    border: 3px solid var(--ink);
    background: #fff;
    box-shadow: 8px 8px 0 rgba(31, 26, 45, 0.12);
    font-size: 1.4rem;
    margin-bottom: 12px;
  }

  .feature-card h3 {
    margin: 0 0 8px;
    font-size: 1.3rem;
  }

  .feature-card p {
    margin: 0;
    line-height: 1.5;
  }

  .explanation-section {
    max-width: 1180px;
    margin: 0 auto 90px;
    position: relative;
  }

  .explanation-card {
    position: relative;
    border: 4px solid var(--ink);
    border-radius: 30px;
    padding: 32px 28px;
    background: linear-gradient(135deg, #fff, #e6f2ff 45%, #ffe7fb 100%);
    box-shadow: 16px 16px 0 rgba(31, 26, 45, 0.18);
    overflow: hidden;
  }

  .explanation-card h2 {
    margin: 10px 0 10px;
    font-size: clamp(2rem, 3vw, 2.4rem);
  }

  .explanation-shape {
    position: absolute;
    border: 4px solid var(--ink);
    border-radius: 999px;
    opacity: 0.3;
  }

  .explanation-shape.shape-one {
    width: 180px;
    height: 180px;
    background: var(--accent-violet);
    right: -60px;
    top: -40px;
    transform: rotate(-14deg);
  }

  .explanation-shape.shape-two {
    width: 140px;
    height: 140px;
    background: var(--accent-yellow);
    left: -40px;
    bottom: -50px;
    transform: rotate(10deg);
  }

  .steps {
    display: grid;
    gap: 14px;
    margin-top: 18px;
    position: relative;
    z-index: 1;
  }

  .step {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 14px;
    align-items: center;
    background: #fff;
    border: 3px solid var(--ink);
    border-radius: 18px;
    padding: 14px 16px;
    box-shadow: 10px 10px 0 rgba(31, 26, 45, 0.12);
  }

  .step-badge {
    width: 42px;
    height: 42px;
    border-radius: 12px;
    border: 3px solid var(--ink);
    display: grid;
    place-items: center;
    font-weight: 900;
    background: var(--accent-green);
    box-shadow: 8px 8px 0 rgba(31, 26, 45, 0.12);
  }

  .step-title {
    margin: 0 0 4px;
    font-weight: 800;
  }

  .step-copy {
    margin: 0;
    line-height: 1.5;
  }

  .cta-setup {
    max-width: 1180px;
    margin: 0 auto;
    position: relative;
  }

  .cta-backdrop {
    position: absolute;
    inset: 0;
    overflow: hidden;
    border-radius: 32px;
    pointer-events: none;
  }

  .cta-shape {
    position: absolute;
    border: 4px solid var(--ink);
    border-radius: 40px;
    opacity: 0.55;
  }

  .cta-shape.shape-x {
    width: 160px;
    height: 160px;
    background: var(--accent-pink);
    top: -40px;
    left: -30px;
    transform: rotate(-12deg);
  }

  .cta-shape.shape-y {
    width: 200px;
    height: 200px;
    background: #9ae6ff;
    bottom: -80px;
    right: 20%;
    transform: rotate(18deg);
  }

  .cta-shape.shape-z {
    width: 120px;
    height: 120px;
    background: var(--accent-yellow);
    top: 16%;
    right: -50px;
    transform: rotate(-18deg);
  }

  .cta-grid {
    position: relative;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 24px;
    border: 4px solid var(--ink);
    border-radius: 32px;
    padding: 32px;
    background: #fffef9;
    box-shadow: 18px 18px 0 rgba(31, 26, 45, 0.18);
    overflow: hidden;
  }

  .cta-grid.stacked {
    grid-template-columns: 1fr;
    align-items: stretch;
    gap: 18px;
  }

  .cta-grid :global(.config) {
    width: 100%;
    max-width: 100%;
    min-height: auto;
    padding: 32px 18px 42px;
    box-sizing: border-box;
  }

  .side-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .cta-copy h2 {
    font-size: clamp(2rem, 3vw, 2.4rem);
    margin: 12px 0 10px;
  }

  .cta-form {
    position: relative;
  }

  .extra-settings {
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 18px;
    border: 4px solid var(--ink);
    border-radius: 24px;
    box-shadow: 14px 14px 0 rgba(31, 26, 45, 0.18);
    background: linear-gradient(135deg, #fff, #fff7e8 55%, #eaf5ff);
    position: relative;
    overflow: hidden;
  }

  .compact-card {
    border: 3px solid var(--ink);
    border-radius: 22px;
    padding: 18px 16px;
    background: linear-gradient(160deg, #fffef9, #f2f8ff);
    box-shadow: 12px 12px 0 rgba(31, 26, 45, 0.16);
  }

  .compact-card h3 {
    margin: 12px 0 8px;
    font-size: 1.3rem;
  }

  .section-lede.compact-copy {
    font-size: 1rem;
    margin-bottom: 10px;
  }

  .cta-row.tight {
    margin-bottom: 10px;
    gap: 10px;
  }

  .mini-list {
    margin: 0;
    padding-left: 18px;
    display: grid;
    gap: 6px;
    font-weight: 700;
  }

  .extra-settings.inline-settings {
    padding: 14px;
    background: #fff;
    box-shadow: 10px 10px 0 rgba(31, 26, 45, 0.12);
  }

  .extra-settings.inline-settings:before,
  .extra-settings.inline-settings:after {
    display: none;
  }

  .extra-settings.side-panel {
    height: 100%;
  }

  .task-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 10px;
    padding: 12px;
    border: 3px dashed var(--ink);
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.92);
    box-shadow: 8px 8px 0 rgba(31, 26, 45, 0.1);
  }

  .task-grid label {
    display: flex;
    gap: 8px;
    align-items: center;
    font-weight: 800;
    color: var(--ink);
  }

  .task-grid input[type="checkbox"] {
    width: 20px;
    height: 20px;
    accent-color: var(--accent-violet);
  }

  .group-label {
    font-weight: 900;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .file-info {
    margin: 0;
    color: var(--ink);
    opacity: 0.72;
    font-size: 0.95rem;
  }

  .file-error {
    margin: 0;
    color: #dc2626;
    font-size: 0.95rem;
    font-weight: 800;
  }

  .toggle {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 800;
    color: var(--ink);
    padding: 12px 14px;
    border: 3px solid var(--ink);
    border-radius: 18px;
    background: #fff;
    box-shadow: 10px 10px 0 rgba(31, 26, 45, 0.14);
  }

  textarea {
    width: 100%;
    border-radius: 20px;
    border: 3px solid var(--ink);
    padding: 14px 16px;
    font-size: 1rem;
    font-family: inherit;
    resize: vertical;
    background: #ffffff;
    box-shadow: 10px 10px 0px rgba(31, 26, 45, 0.14);
    transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
  }

  textarea:focus {
    outline: none;
    border-color: var(--accent-green);
    box-shadow: 10px 10px 0px rgba(102, 208, 143, 0.5);
    background: #fff8e5;
  }

  .extra-settings:before,
  .extra-settings:after {
    content: "";
    position: absolute;
    border-radius: 50%;
    border: 3px solid var(--ink);
    opacity: 0.16;
  }

  .extra-settings:before {
    width: 140px;
    height: 140px;
    background: var(--accent-pink);
    top: -60px;
    right: -50px;
  }

  .extra-settings:after {
    width: 110px;
    height: 110px;
    background: var(--accent-yellow);
    bottom: -40px;
    left: -30px;
  }

  .hero,
  .feature-card,
  .explanation-card,
  .cta-grid,
  .visual-card {
    transition: transform 180ms ease, box-shadow 180ms ease;
  }

  .hero:hover,
  .feature-card:hover,
  .explanation-card:hover,
  .cta-grid:hover,
  .visual-card:hover {
    transform: translateY(-4px);
    box-shadow: 20px 20px 0 rgba(31, 26, 45, 0.2);
  }

  @media (max-width: 780px) {
    .hero,
    .cta-grid,
    .feature-card,
    .explanation-card {
      box-shadow: 12px 12px 0 rgba(31, 26, 45, 0.16);
    }

    .hero {
      padding: 30px;
    }

    .cta-grid {
      padding: 22px;
    }

    .cta-row {
      width: 100%;
    }

    .cta-button {
      flex: 1;
      text-align: center;
    }
  }

  @media (max-width: 600px) {
    .hero {
      margin-bottom: 60px;
    }

    .feature-section,
    .explanation-section {
      margin-bottom: 60px;
    }

    .task-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .hero,
    .feature-card,
    .explanation-card,
    .cta-grid,
    .visual-card,
    .cta-button {
      transition: none;
    }
  }
</style>
