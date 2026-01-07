<script>
  import { goto } from "$app/navigation";
  import { onDestroy } from "svelte";
  import SetupScreen from "$lib/components/game/SetupScreen.svelte";
  import ActiveGameScreen from "$lib/components/game/ActiveGameScreen.svelte";
  import EndScreen from "$lib/components/game/EndScreen.svelte";
  import GoalPopup from "$lib/components/game/GoalPopup.svelte";
import SaveSetPanel from "$lib/components/game/SaveSetPanel.svelte";
import WinnerPopup from "$lib/components/game/WinnerPopup.svelte";
  import {
    buildMaterialSnippet,
    parseMaterialFile
  } from "$lib/utils/materialParser";
  import { cleanQuestionText } from "$lib/utils/questionFormatter";
  import { saveQuestionSet } from "$lib/utils/setStorage.js";
  import { pickUniqueRandomItems } from "$lib/utils/randomHelpers.js";
  import { requestAiQuestions } from "$lib/utils/aiQuestionGenerator.js";
  import FileDropzone from "$lib/components/inputs/FileDropzone.svelte";

  let setupSection;

  // =======================
  //   KONFIGURATION
  // =======================

  let numQuestions = 10;
  let file = null;
  let uploadedLines = [];
  let useManualInput = false;
  let manualInput = "";
  let manualLines = [];
  let fileError = "";
  let materialText = "";
  let isPdfUpload = false;
  let aiLoading = false;
  let aiError = "";
  let minNumber = 1;
  let maxNumber = 10;

  let useDecimals = false;
  let allowNegatives = false;

  const operations = [
    { symbol: "+", name: "Addition" },
    { symbol: "-", name: "Subtraktion" },
    { symbol: "×", name: "Multiplikation" },
    { symbol: "÷", name: "Division" },
  ];

  let selectedOps = ["+"]; // mindestens eine Operation
  $: availableCustomQuestions = getCustomQuestionLines().length;

  // =======================
  //   SPIEL-STATE
  // =======================

  let questions = [];
  let currentQuestionIndex = 0;
  let gameStarted = false;
  let gameOver = false;

  let redScore = 0;
  let blueScore = 0;
  let blueTeamName = "";
  let redTeamName = "";
  $: blueTeamLabel = blueTeamName.trim() || "Team Blau";
  $: redTeamLabel = redTeamName.trim() || "Team Rot";

  // Ball / Spielfeld-Logik
  let ballPosition = 0; // -4 (bei Blau) bis +4 (bei Rot)
  const maxBallPosition = 4;
  let showPopup = false;
  let popupMessage = "";
  let goalResetTimeout;
  let popupVariant = "neutral";
  let showTimer = false;
  let timer = 10;
  let timerInterval;
  let saveTitle = "";
  let savingSet = false;
  let saveStatus = "";
  let saveError = "";
  let aiInstructions = "";
let winnerPopupVisible = false;
let winnerName = "";
let winnerSubtitle = "";

  // =======================
  //   FRAGEN GENERIEREN
  // =======================

  function randomNumber() {
    let n;

    if (useDecimals) {
      const factor = 10;
      n =
        Math.round(
          (Math.random() * (maxNumber - minNumber) + minNumber) * factor,
        ) / factor;
    } else {
      n = Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber;
    }

    if (!allowNegatives && n < 0) n = -n;
    return n;
  }

  function generateSingleQuestion() {
    const op = selectedOps[Math.floor(Math.random() * selectedOps.length)];
    let a = randomNumber();
    let b = randomNumber();
    let text = "";
    let answer = 0;

    if (op === "+") {
      text = `${a} + ${b}`;
      answer = a + b;
    } else if (op === "-") {
      text = `${a} - ${b}`;
      answer = a - b;
    } else if (op === "×") {
      text = `${a} × ${b}`;
      answer = a * b;
    } else if (op === "÷") {
      // Division so anpassen, dass halbwegs sinnvolle Aufgaben kommen
      if (b === 0) b = 1;
      text = `${a} ÷ ${b}`;
      answer = a / b;
    }

    return { question: text, answer };
  }

  function getCustomQuestionLines() {
    if (useManualInput && manualLines.length > 0) {
      return manualLines;
    }
    return uploadedLines;
  }

  async function handleFileUpload(event) {
    const fileList = event?.detail?.files ?? event?.target?.files;
    file = fileList?.[0] ?? null;
    fileError = "";
    aiError = "";
    materialText = "";
    isPdfUpload = false;

    if (!file) {
      uploadedLines = [];
      return;
    }

    try {
      const parsed = await parseMaterialFile(file);
      uploadedLines = parsed.lines;
      materialText = parsed.text;
      isPdfUpload = parsed.isPdf;
    } catch (error) {
      console.error("Material konnte nicht gelesen werden:", error);
      fileError =
        error?.message || "Die Datei konnte nicht verarbeitet werden.";
      uploadedLines = [];
      materialText = "";
      isPdfUpload = false;
      file = null;
      event.target.value = "";
    }
  }

  function processManualInput() {
    manualLines = manualInput
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  }

  function scrollToTop() {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  async function generateQuestionsFromPdf() {
    if (!materialText.trim()) {
      aiError = "Das PDF scheint leer zu sein.";
      return false;
    }

    const lines =
      uploadedLines.length > 0
        ? uploadedLines
        : materialText
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter(Boolean);
    const snippet = buildMaterialSnippet(lines);
    if (!snippet) {
      aiError = "Im Dokument konnten keine verwertbaren Inhalte erkannt werden.";
      return false;
    }

    aiLoading = true;
    aiError = "";

    try {
      const list = await requestAiQuestions({
        subject: "math",
        material: snippet,
        instructions:
          "Erstelle Matheaufgaben (Kopfrechnen oder Sachaufgaben) passend zum bereitgestellten Unterrichtsmaterial. Gib nur die Aufgabenstellung ohne Lösung aus.",
        fileName: file?.name,
        numQuestions
      });

      questions = list.map((entry, index) => ({
        id: index + 1,
        question: cleanQuestionText(entry.question),
        answer: null
      }));

      currentQuestionIndex = 0;
      saveStatus = "";
      saveError = "";
      return true;
    } catch (error) {
      aiError = error.message || "Unbekannter Fehler beim KI-Aufruf.";
      return false;
    } finally {
      aiLoading = false;
    }
  }

  async function generateQuestions() {
    if (aiLoading) return false;

    if (isPdfUpload && materialText) {
      const success = await generateQuestionsFromPdf();
      if (success) {
        return true;
      }
      return false;
    }

    const customLines = getCustomQuestionLines();

    if (customLines.length > 0) {
      const uniqueLines = pickUniqueRandomItems(customLines, numQuestions);
      questions = uniqueLines.map((text) => ({
        question: cleanQuestionText(text),
        answer: null
      }));
      currentQuestionIndex = 0;
      return true;
    }

    const created = await generateQuestionsWithAiSettings();
    if (created) {
      return true;
    }

    questions = [];
    for (let i = 0; i < numQuestions; i += 1) {
      questions.push(generateSingleQuestion());
    }
    currentQuestionIndex = 0;
    return true;
  }

  function buildMathAiMaterial(customLines) {
    if (customLines.length > 0) {
      return `Beispielaufgaben oder Notizen:\n${customLines.join("\n")}`;
    }

    const opNames = operations
      .filter((op) => selectedOps.includes(op.symbol))
      .map((op) => `${op.symbol} (${op.name})`);

    const lines = [
      `Benötigt werden ${numQuestions} Aufgaben.`,
      `Zahlenraum: ${minNumber} bis ${maxNumber}`,
      `Erlaubte Rechenarten: ${opNames.join(", ") || "keine"}.`,
      useDecimals
        ? "Dezimalzahlen sind erlaubt."
        : "Nur ganze Zahlen verwenden.",
      allowNegatives
        ? "Negative Zahlen dürfen vorkommen."
        : "Keine negativen Ergebnisse verwenden."
    ];
    return lines.join("\n");
  }

  async function generateQuestionsWithAiSettings() {
    const customLines = getCustomQuestionLines();
    const material = buildMathAiMaterial(customLines);
    if (!material.trim()) {
      aiError =
        "Bitte gib eigene Aufgaben oder Einstellungen an, damit die KI Fragen erstellen kann.";
      return false;
    }

    aiLoading = true;
    aiError = "";

    try {
      const baseInstruction =
        "Erstelle ausschließlich kurze Kopfrechenaufgaben im Format „a + b“, „a - b“, „a × b“ oder „a ÷ b“ (keine Sachaufgaben, keine längeren Texte). Nutze nur die erlaubten Rechenarten und gib nur die Aufgabe ohne Lösung zurück.";
      const instructionText = [baseInstruction, aiInstructions.trim()]
        .filter(Boolean)
        .join(" ");
      const list = await requestAiQuestions({
        subject: "math",
        material,
        instructions: instructionText,
        fileName: file?.name,
        numQuestions
      });
      questions = list.map((entry, index) => ({
        id: index + 1,
        question: cleanQuestionText(entry.question),
        answer: entry.answer ?? null
      }));
      currentQuestionIndex = 0;
      saveStatus = "";
      saveError = "";
      return true;
    } catch (error) {
      aiError = error.message || "Die KI konnte keine Fragen erzeugen.";
      return false;
    } finally {
      aiLoading = false;
    }
  }

  // =======================
  //   SPIELSTEUERUNG
  // =======================

  async function startGame() {
    if (selectedOps.length === 0) {
      alert("Bitte mindestens eine Rechenart auswählen.");
      return;
    }

    const created = await generateQuestions();
    if (!created || questions.length === 0) {
      return;
    }

    redScore = 0;
    blueScore = 0;
    resetBallToCenter();
    showPopup = false;
    stopTimer();

    gameStarted = true;
    gameOver = false;
    winnerPopupVisible = false;
    scrollToTop();
  }

  function nextQuestion() {
    stopTimer();
    if (currentQuestionIndex < questions.length - 1) {
      currentQuestionIndex += 1;
    } else {
      endGame();
    }
  }

  function endGame() {
    gameStarted = false;
    gameOver = true;
    clearTimeout(goalResetTimeout);
    showPopup = false;
    if (redScore > blueScore) {
      winnerName = redTeamLabel;
      winnerSubtitle = `Endstand ${redScore} : ${blueScore}`;
    } else if (blueScore > redScore) {
      winnerName = blueTeamLabel;
      winnerSubtitle = `Endstand ${blueScore} : ${redScore}`;
    } else {
      winnerName = "Unentschieden";
      winnerSubtitle = "Beide Teams haben gleich viele Punkte.";
    }
    winnerPopupVisible = true;
    resetBallToCenter();
    stopTimer();
  }

  // Team-Antworten / Ballbewegung
  function moveBall(team) {
    stopTimer();
    // Team Rot beantwortet richtig -> Ball Richtung Blau
    if (team === "red") {
      ballPosition = Math.max(ballPosition - 1, -maxBallPosition);
      if (ballPosition === -maxBallPosition) {
        handleGoal("red");
      }
    } else if (team === "blue") {
      ballPosition = Math.min(ballPosition + 1, maxBallPosition);
      if (ballPosition === maxBallPosition) {
        handleGoal("blue");
      }
    }

    nextQuestion();
  }

  function wrongAnswer() {
    if (showTimer) return;
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

  function skipQuestion() {
    nextQuestion();
  }

  function resetGame() {
    gameOver = false;
    gameStarted = false;
    questions = [];
    currentQuestionIndex = 0;
    redScore = 0;
    blueScore = 0;
    showPopup = false;
    clearTimeout(goalResetTimeout);
    resetBallToCenter();
    stopTimer();
    popupVariant = "neutral";
    saveStatus = "";
    saveError = "";
    winnerPopupVisible = false;
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
        subject: "mathe",
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

  function toggleOperation(symbol) {
    if (selectedOps.includes(symbol)) {
      selectedOps = selectedOps.filter((s) => s !== symbol);
    } else {
      selectedOps = [...selectedOps, symbol];
    }
  }

  function handleGoal(team) {
    popupMessage =
      team === "red" ? "⚽️ Tor für Team Rot!" : "⚽️ Tor für Team Blau!";
    popupVariant = team === "red" ? "red" : "blue";
    showPopup = true;

    if (team === "red") {
      redScore += 1;
    } else {
      blueScore += 1;
    }

    resetBallToCenter();
    clearTimeout(goalResetTimeout);
    goalResetTimeout = setTimeout(() => {
      showPopup = false;
    }, 1500);
  }

  function resetBallToCenter() {
    ballPosition = 0;
  }

  onDestroy(() => {
    clearTimeout(goalResetTimeout);
    clearInterval(timerInterval);
  });

  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    showTimer = false;
    timer = 10;
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
          <p class="eyebrow">Mathe · Wandtafelspiel</p>
          <h1>Rechnen im Team-Duell</h1>
          <p class="lede">
            Starte sofort ein farbiges Mathe-Match: Zahlenraum wählen, Rechenarten ankreuzen,
            eigenes Material nutzen oder KI beauftragen.
          </p>
          <div class="cta-row">
            <button class="cta-button primary" type="button" on:click={() => setupSection?.scrollIntoView({ behavior: "smooth", block: "start" })}>
              Spiel aufbauen
            </button>
            <button class="cta-button ghost" type="button" on:click={() => goto("/start")}>
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
                <p class="metric-value">{aiInstructions ? "aktiv" : "frei"}</p>
              </div>
              <div>
                <p class="metric-label">PDF Upload</p>
                <p class="metric-value">{file ? "geladen" : "optional"}</p>
              </div>
            </div>
            <ul class="visual-list">
              <li>Zahlenraum definieren und Rechenarten wählen</li>
              <li>Eigene Aufgaben oder KI-Generierung</li>
              <li>Sets speichern für spätere Runden</li>
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
        <h2>Bunte Struktur wie auf der Deutsch-Seite</h2>
        <p class="section-lede">
          Drei kompakte Schritte, kräftige Farben und klare Kacheln – perfekt, um sofort loszulegen.
        </p>
      </div>
      <div class="feature-grid">
        <article class="feature-card">
          <div class="feature-icon">➗</div>
          <h3>Rechenarten mixen</h3>
          <p>Addition, Subtraktion, Multiplikation, Division – frei kombinieren und anpassen.</p>
        </article>
        <article class="feature-card">
          <div class="feature-icon">📚</div>
          <h3>Material nutzen</h3>
          <p>TXT/PDF hochladen oder manuell eintippen; KI erstellt daraus frische Aufgaben.</p>
        </article>
        <article class="feature-card">
          <div class="feature-icon">💾</div>
          <h3>Sets sichern</h3>
          <p>Fragensets speichern und wiederverwenden, damit gute Aufgaben bleiben.</p>
        </article>
      </div>
    </section>

    <section class="explanation-section">
      <div class="explanation-card">
        <div class="explanation-shape shape-one"></div>
        <div class="explanation-shape shape-two"></div>
        <p class="eyebrow">So läuft's</p>
        <h2>In drei Schritten zum Mathe-Match</h2>
        <p class="section-lede">
          Zahlenraum und Rechenarten wählen, Material optional ergänzen, Spiel starten und Tore
          schießen.
        </p>
        <div class="steps">
          <div class="step">
            <span class="step-badge">1</span>
            <div>
              <p class="step-title">Teams und Aufgaben setzen</p>
              <p class="step-copy">
                Namen vergeben, Anzahl Fragen wählen, Rechenarten anklicken, Material optional laden.
              </p>
            </div>
          </div>
          <div class="step">
            <span class="step-badge">2</span>
            <div>
              <p class="step-title">Spiel starten</p>
              <p class="step-copy">
                Mit „Weiter zu Fragen“ loslegen. KI-Option oder PDF-Auszug stehen bereit.
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
          title="Mathe – Wandtafelspiel"
          infoText="Wenn die Felder leer bleiben, heißen die Teams automatisch „Team Blau“ und „Team Rot“."
          bind:blueTeamName
          bind:redTeamName
          bind:numQuestions
          on:back={() => goto("/start")}
          on:start={startGame}
        >
          <div class="extra-settings inline-settings">
            <div class="range-row">
              <label>
                Zahlenraum von
                <input type="number" bind:value={minNumber} />
              </label>
              <label>
                bis
                <input type="number" bind:value={maxNumber} />
              </label>
            </div>

            <div class="toggle-row">
              <label class="toggle">
                <input type="checkbox" bind:checked={useDecimals} />
                <span>Dezimalzahlen erlauben</span>
              </label>
              <label class="toggle">
                <input type="checkbox" bind:checked={allowNegatives} />
                <span>Negative Zahlen erlauben</span>
              </label>
            </div>

            <div class="ops-grid">
              <p class="group-label">Rechenarten</p>
              <div class="op-buttons">
                {#each operations as op}
                  <button
                    type="button"
                    class:active-chip={selectedOps.includes(op.symbol)}
                    on:click={() => toggleOperation(op.symbol)}
                  >
                    {op.symbol} {op.name}
                  </button>
                {/each}
              </div>
            </div>
          </div>

          <div class="settings-stack">
            <div class="extra-settings side-panel">
              <FileDropzone
                label="Unterrichtsmaterial (TXT oder PDF, optional)"
                accept=".txt,.pdf"
                on:change={handleFileUpload}
                fileName={file?.name}
                loading={aiLoading}
                description="Ziehe das Material hierher oder tippe zum Auswählen."
              />
              {#if fileError}
                <p class="file-error">{fileError}</p>
              {/if}
              {#if aiError}
                <p class="file-error">{aiError}</p>
              {/if}

              <label class="toggle">
                <input type="checkbox" bind:checked={useManualInput} />
                <span>Eigene Aufgaben manuell eingeben</span>
              </label>

              {#if useManualInput}
                <textarea
                  rows="4"
                  placeholder={"Eine Aufgabe pro Zeile\\n12 + 7\\nWie viele Ecken hat ein Würfel?"}
                  bind:value={manualInput}
                  on:input={processManualInput}
                ></textarea>
              {/if}

              {#if availableCustomQuestions > 0}
                <p class="file-info">
                  {availableCustomQuestions} eigene Aufgaben verfügbar
                </p>
              {/if}

              <label class="group-label" for="math-ai-instructions">
                Zusatzwünsche an die KI (optional)
              </label>
              <textarea
                id="math-ai-instructions"
                rows="3"
                placeholder="z. B. leichte Sachaufgaben, Fokus auf Division ..."
                bind:value={aiInstructions}
              ></textarea>

              <div class="compact-card inline">
          <p class="eyebrow">Bereit zum Start?</p>
          <h3>Mathe-Set aufbauen</h3>
          <p class="section-lede compact-copy">
            Zahlenraum, Rechenarten und optionale Aufgabenquellen – alles hier gebündelt.
          </p>
                <ul class="mini-list">
                  <li>Rechenarten auswählen und kombinieren</li>
                  <li>Eigene Aufgaben via TXT/PDF oder manuell</li>
                  <li>Sets speichern für spätere Runden</li>
                </ul>
              </div>
            </div>
          </div>
        </SetupScreen>
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
    {currentQuestionIndex}
    {questions}
    {ballPosition}
    {maxBallPosition}
    {showTimer}
    {timer}
    on:score={(event) => moveBall(event.detail.team)}
    on:wrong={wrongAnswer}
    on:skip={skipQuestion}
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
    on:back={() => goto("/start")}
  />
{/if}

<GoalPopup
  message={popupMessage}
  visible={showPopup}
  variant={popupVariant}
/>

<WinnerPopup
  visible={winnerPopupVisible}
  winner={winnerName}
  subtitle={winnerSubtitle}
  on:close={() => (winnerPopupVisible = false)}
/>

<SaveSetPanel
  visible={questions.length > 0}
  description="Bewahre diese Aufgaben als Set auf, um sie später über /sets zu laden."
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
    min-height: 100vh;
    overflow: hidden;
    padding: 42px 18px 96px;
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

  .hero {
    position: relative;
    max-width: 1180px;
    margin: 0 auto 70px;
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
    font-size: 1.4rem;
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
    margin: 0 auto 70px;
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
    margin: 0 auto 70px;
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

  .cta-row {
    display: flex;
    gap: 14px;
    flex-wrap: wrap;
    margin-bottom: 10px;
  }

  .cta-row.tight {
    margin-bottom: 10px;
    gap: 10px;
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

  .mini-list {
    margin: 0;
    padding-left: 18px;
    display: grid;
    gap: 6px;
    font-weight: 700;
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

  .extra-settings.inline-settings {
    padding: 14px;
    background: #fff;
    box-shadow: 10px 10px 0 rgba(31, 26, 45, 0.12);
  }

  .extra-settings.inline-settings:before,
  .extra-settings.inline-settings:after {
    display: none;
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

  .range-row {
    display: flex;
    gap: 20px;
    flex-wrap: wrap;
  }

  .range-row label {
    flex: 1;
    display: flex;
    flex-direction: column;
    font-weight: 800;
    color: var(--ink);
  }

  .range-row input {
    margin-top: 8px;
    border-radius: 16px;
    border: 3px solid var(--ink);
    padding: 12px 16px;
    font-size: 1rem;
    background: #f8fafc;
    box-shadow: 8px 8px 0 rgba(31, 26, 45, 0.1);
  }

  .toggle-row {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
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

  .toggle input {
    width: 18px;
    height: 18px;
    accent-color: var(--accent-violet);
  }

.ops-grid {
  margin-top: 12px;
}

.settings-stack {
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 100%;
}

  .group-label {
    font-weight: 900;
    margin: 0 0 6px;
    color: var(--ink);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .op-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }

  .op-buttons button {
    border-radius: 18px;
    border: 3px solid var(--ink);
    padding: 10px 16px;
    background: #fff;
    cursor: pointer;
    font-weight: 800;
    color: var(--ink);
    box-shadow: 8px 8px 0 rgba(31, 26, 45, 0.12);
  }

  .op-buttons button.active-chip {
    background: #fef08a;
    border-color: var(--ink);
    color: var(--ink);
    box-shadow: 6px 6px 0 rgba(31, 26, 45, 0.18);
    transform: translateY(-1px);
  }

  .material-section {
    margin-top: 12px;
    display: flex;
    flex-direction: column;
    gap: 14px;
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

  textarea {
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

  .cta-grid,
  .compact-card,
  .feature-card,
  .explanation-card,
  .hero {
    transition: transform 180ms ease, box-shadow 180ms ease;
  }

  .cta-grid:hover,
  .compact-card:hover,
  .feature-card:hover,
  .explanation-card:hover,
  .hero:hover {
    transform: translateY(-4px);
    box-shadow: 20px 20px 0 rgba(31, 26, 45, 0.2);
  }

  @media (max-width: 780px) {
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

    .feature-section,
    .explanation-section {
      margin-bottom: 60px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .cta-grid,
    .compact-card,
    .feature-card,
    .explanation-card,
    .hero,
    .cta-button {
      transition: none;
    }
  }
</style>
