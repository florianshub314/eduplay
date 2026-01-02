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

            <div class="material-section">
              <p class="group-label">Unterrichtsmaterial (optional)</p>
              <FileDropzone
                label="Datei (TXT oder PDF)"
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
            </div>
          </div>
        </SetupScreen>

        <div class="compact-card">
          <p class="eyebrow">Bereit zum Start?</p>
          <h3>Mathe-Set in buntem Rahmen</h3>
          <p class="section-lede compact-copy">
            Gleiches Layout wie Deutsch – nur der Inhalt ändert sich: Zahlenraum, Rechenarten und
            optionale Aufgabenquellen.
          </p>
          <div class="cta-row tight">
            <button class="cta-button primary" type="button" on:click={() => setupSection?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
              Zum Formular
            </button>
            <button class="cta-button ghost" type="button" on:click={() => goto("/start")}>
              Zurück zur Übersicht
            </button>
          </div>
          <ul class="mini-list">
            <li>Rechenarten auswählen und kombinieren</li>
            <li>Eigene Aufgaben via TXT/PDF oder manuell</li>
            <li>Sets speichern für spätere Runden</li>
          </ul>
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
  .compact-card {
    transition: transform 180ms ease, box-shadow 180ms ease;
  }

  .cta-grid:hover,
  .compact-card:hover {
    transform: translateY(-4px);
    box-shadow: 20px 20px 0 rgba(31, 26, 45, 0.2);
  }

  @media (max-width: 780px) {
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

  @media (prefers-reduced-motion: reduce) {
    .cta-grid,
    .compact-card,
    .cta-button {
      transition: none;
    }
  }
</style>
