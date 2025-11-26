<script>
  import { goto } from "$app/navigation";
  import { onDestroy } from "svelte";
  import SetupScreen from "$lib/components/game/SetupScreen.svelte";
  import ActiveGameScreen from "$lib/components/game/ActiveGameScreen.svelte";
  import EndScreen from "$lib/components/game/EndScreen.svelte";
  import GoalPopup from "$lib/components/game/GoalPopup.svelte";
  import { readMaterialLines } from "$lib/utils/materialParser";

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
  let showTimer = false;
  let timer = 10;
  let timerInterval;

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
    file = event.target.files?.[0] ?? null;
    fileError = "";

    if (!file) {
      uploadedLines = [];
      return;
    }

    try {
      uploadedLines = await readMaterialLines(file);
    } catch (error) {
      console.error("Material konnte nicht gelesen werden:", error);
      fileError =
        error?.message || "Die Datei konnte nicht verarbeitet werden.";
      uploadedLines = [];
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

  function generateQuestions() {
    const customLines = getCustomQuestionLines();

    if (customLines.length > 0) {
      questions = [];
      for (let i = 0; i < numQuestions; i += 1) {
        const text =
          customLines[Math.floor(Math.random() * customLines.length)];
        questions.push({ question: text, answer: null });
      }
      currentQuestionIndex = 0;
      return;
    }

    questions = [];
    for (let i = 0; i < numQuestions; i += 1) {
      questions.push(generateSingleQuestion());
    }
    currentQuestionIndex = 0;
  }

  // =======================
  //   SPIELSTEUERUNG
  // =======================

  function startGame() {
    if (selectedOps.length === 0) {
      alert("Bitte mindestens eine Rechenart auswählen.");
      return;
    }

    generateQuestions();
    redScore = 0;
    blueScore = 0;
    resetBallToCenter();
    showPopup = false;
    stopTimer();

    gameStarted = true;
    gameOver = false;
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
  <SetupScreen
    bind:blueTeamName
    bind:redTeamName
    bind:numQuestions
    on:back={() => goto("/start")}
    on:start={startGame}
  >
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
      <label class="file-label">
        Datei (TXT oder PDF)
        <input type="file" accept=".txt,.pdf" on:change={handleFileUpload} />
      </label>
      {#if file}
        <p class="file-info">📄 Datei geladen: {file.name}</p>
      {/if}
      {#if fileError}
        <p class="file-error">{fileError}</p>
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
    </div>
  </SetupScreen>
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

<GoalPopup message={popupMessage} visible={showPopup} />

<style>
  .range-row {
    display: flex;
    gap: 20px;
    flex-wrap: wrap;
    margin: 24px 0;
  }

  .range-row label {
    flex: 1;
    display: flex;
    flex-direction: column;
    font-weight: 600;
    color: #0f172a;
  }

  .range-row input {
    margin-top: 8px;
    border-radius: 16px;
    border: 2px solid #e2e8f0;
    padding: 12px 16px;
    font-size: 1rem;
    background: #f8fafc;
  }

  .toggle-row {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    margin-bottom: 24px;
  }

  .toggle {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 500;
    color: #0f172a;
  }

  .toggle input {
    width: 18px;
    height: 18px;
  }

  .ops-grid {
    margin-top: 12px;
  }

  .group-label {
    font-weight: 600;
    margin-bottom: 6px;
    color: #0f172a;
  }

  .op-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }

  .op-buttons button {
    border-radius: 999px;
    border: 2px solid #cbd5f5;
    padding: 10px 20px;
    background: white;
    cursor: pointer;
    font-weight: 600;
    color: #1d4ed8;
  }

  .op-buttons button.active-chip {
    background: #2563eb;
    border-color: #1d4ed8;
    color: white;
    box-shadow: 0 6px 16px rgba(37, 99, 235, 0.35);
  }

  .material-section {
    margin-top: 24px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .file-label {
    display: flex;
    flex-direction: column;
    gap: 8px;
    font-weight: 500;
  }

  .file-info {
    margin: 0;
    color: #475569;
    font-size: 0.9rem;
  }

  .file-error {
    margin: 0;
    color: #dc2626;
    font-size: 0.9rem;
  }

  textarea {
    border-radius: 16px;
    border: 2px solid #e2e8f0;
    padding: 12px 16px;
    font-size: 1rem;
    font-family: inherit;
    resize: vertical;
  }
</style>
