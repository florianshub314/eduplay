<script>
  import SoccerField from "$lib/components/game/SoccerField.svelte";
  import { goto } from "$app/navigation";
  import { onDestroy } from "svelte";

  // =======================
  //   KONFIGURATION
  // =======================

  let numQuestions = 10;
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
  const questionPresets = [5, 10, 20];
  let selectedPreset = null;

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

  function generateQuestions() {
    questions = [];
    for (let i = 0; i < numQuestions; i++) {
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

  function selectPreset(preset) {
    selectedPreset = preset;
    numQuestions = preset;
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
  <main class="config">
    <h1>Teams & Spiel-Einstellungen</h1>

    <div class="team-card-grid">
      <div class="team-card blue">
        <div class="team-card-header">
          <span class="team-icon">👕</span>
          <div>
            <p class="team-title">Team Blau</p>
            <p class="team-desc">Team Blau (Standardname, falls leer)</p>
          </div>
        </div>
        <input
          type="text"
          placeholder="Team Blau"
          bind:value={blueTeamName}
        />
      </div>
      <div class="team-card red">
        <div class="team-card-header">
          <span class="team-icon">👕</span>
          <div>
            <p class="team-title">Team Rot</p>
            <p class="team-desc">Team Rot (Standardname, falls leer)</p>
          </div>
        </div>
        <input type="text" placeholder="Team Rot" bind:value={redTeamName} />
      </div>
    </div>

    <p class="info-text">
      Wenn kein Name eingegeben wird, heissen die Teams automatisch „Team Blau“ und „Team Rot“.
    </p>

    <div class="settings-card">
      <h2>Spiel-Einstellungen</h2>

      <div class="settings-group">
        <p class="group-label">Fragen-Presets</p>
        <div class="chip-row">
          {#each questionPresets as preset}
            <button
              type="button"
              class:active-chip={selectedPreset === preset}
              on:click={() => selectPreset(preset)}
            >
              {preset} Fragen
            </button>
          {/each}
        </div>
      </div>

      <div class="input-row">
        <label>
          Anzahl Fragen
          <input
            type="number"
            min="1"
            bind:value={numQuestions}
            on:input={() => (selectedPreset = null)}
          />
        </label>
      </div>

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

    <div class="action-buttons">
      <button class="btn-secondary" on:click={() => goto("/start")}>
        Zurück
      </button>
      <button class="btn-primary" on:click={startGame}>Weiter zu Fragen</button>
    </div>
  </main>
{/if}

{#if gameStarted && !gameOver}
  <!-- =======================
       SPIELSCREEN
       ======================= -->
  <main class="game">
    <div class="scoreboard">
      <button
        type="button"
        class="score-card blue-card"
        on:click={() => moveBall("blue")}
        aria-label={`Punkt für ${blueTeamLabel}`}
      >
        <span class="score-team">{blueTeamLabel}</span>
        <span class="score-value">{blueScore}</span>
      </button>
      <button
        type="button"
        class="score-card red-card"
        on:click={() => moveBall("red")}
        aria-label={`Punkt für ${redTeamLabel}`}
      >
        <span class="score-team">{redTeamLabel}</span>
        <span class="score-value">{redScore}</span>
      </button>
    </div>

    <h2>Frage {currentQuestionIndex + 1} von {questions.length}</h2>
    <div class="question">{questions[currentQuestionIndex].question}</div>

    <!-- Spielfeld -->
    <div class="field-wrapper">
      <SoccerField
        position={ballPosition}
        maxPosition={maxBallPosition}
      />
    </div>

    {#if showTimer}
      <div class="timer">⏱ {timer}s</div>
    {/if}

    <!-- Buttons -->
    <div class="buttons">
      <button class="btn-neutral" on:click={wrongAnswer}> Falsch </button>
      <button class="btn-neutral" on:click={skipQuestion}>
        Überspringen
      </button>
      <button class="btn-neutral" on:click={endGame}> Spiel beenden </button>
    </div>
  </main>
{/if}

{#if gameOver}
  <!-- =======================
       END SCREEN
       ======================= -->
  <main class="end">
    <h1>Spiel beendet</h1>

    <p>
      Ergebnis:
      <strong>{blueTeamLabel} {blueScore} : {redScore} {redTeamLabel}</strong>
    </p>

    {#if blueScore > redScore}
      <p>Gewinner: {blueTeamLabel}</p>
    {:else if redScore > blueScore}
      <p>Gewinner: {redTeamLabel}</p>
    {:else}
      <p>Unentschieden</p>
    {/if}

    <button class="btn-primary" on:click={resetGame}>
      Neues Spiel starten
    </button>
    <button class="btn-secondary" on:click={() => goto("/start")}>
      Zur Startseite
    </button>
  </main>
{/if}

{#if showPopup}
  <div class="goal-popup">{popupMessage}</div>
{/if}

<style>
  main {
    font-family:
      system-ui,
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      sans-serif;
  }

  .config {
    min-height: 100vh;
    padding: 60px 24px 80px;
    background: linear-gradient(180deg, #eef2ff 0%, #f8fafc 40%, #ffffff 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: left;
  }

  .config h1 {
    font-size: 2.4rem;
    margin-bottom: 32px;
    text-align: center;
    color: #0f172a;
  }

  .team-card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(420px, 1fr));
    gap: 24px;
    width: min(960px, 100%);
    margin-bottom: 28px;
  }

  .team-card {
    background: white;
    border-radius: 28px;
    padding: 32px;
    box-shadow: 0 20px 45px rgba(15, 23, 42, 0.08);
    border: 2px solid transparent;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-height: 180px;
  }

  .team-card.blue {
    border-color: #60a5fa;
  }

  .team-card.red {
    border-color: #f87171;
  }

  .team-card-header {
    display: flex;
    align-items: flex-start;
    gap: 16px;
  }

  .team-icon {
    font-size: 2rem;
    width: 56px;
    height: 56px;
    border-radius: 999px;
    display: grid;
    place-items: center;
    color: white;
  }

  .team-card.blue .team-icon {
    background: linear-gradient(135deg, #60a5fa, #2563eb);
  }

  .team-card.red .team-icon {
    background: linear-gradient(135deg, #f87171, #dc2626);
  }

  .team-title {
    font-size: 1.2rem;
    font-weight: 700;
    margin: 0;
  }

  .team-desc {
    margin: 2px 0 0;
    color: #475569;
    font-size: 0.9rem;
  }

  .team-card input {
    width: 100%;
    padding: 14px 18px;
    border-radius: 16px;
    border: 2px solid #e2e8f0;
    font-size: 1rem;
    background: #ffffff;
    box-sizing: border-box;
    box-shadow: inset 0 2px 6px rgba(15, 23, 42, 0.05);
  }

  .info-text {
    margin: 20px 0 30px;
    color: #475569;
    font-size: 0.95rem;
    text-align: center;
    width: min(700px, 100%);
  }

  .settings-card {
    width: min(960px, 100%);
    background: white;
    border-radius: 32px;
    padding: 32px;
    box-shadow: 0 25px 50px rgba(15, 23, 42, 0.1);
  }

  .settings-card h2 {
    margin-top: 0;
    margin-bottom: 24px;
    font-size: 1.6rem;
  }

  .settings-group + .settings-group {
    margin-top: 24px;
  }

  .group-label {
    font-weight: 600;
    margin-bottom: 12px;
    color: #0f172a;
  }

  .chip-row,
  .op-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }

  .chip-row button,
  .op-buttons button {
    border-radius: 999px;
    border: 2px solid #cbd5f5;
    padding: 10px 20px;
    background: white;
    cursor: pointer;
    font-weight: 600;
    color: #1d4ed8;
  }

  .chip-row button.active-chip,
  .op-buttons button.active-chip {
    background: #2563eb;
    border-color: #1d4ed8;
    color: white;
    box-shadow: 0 6px 16px rgba(37, 99, 235, 0.35);
  }

  .input-row,
  .range-row {
    display: flex;
    gap: 20px;
    flex-wrap: wrap;
    margin: 24px 0;
  }

  .input-row label,
  .range-row label {
    flex: 1;
    display: flex;
    flex-direction: column;
    font-weight: 600;
    color: #0f172a;
  }

  .input-row input,
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

  .action-buttons {
    margin-top: 32px;
    display: flex;
    gap: 16px;
  }

  .game,
  .end {
    max-width: 1100px;
    margin: 40px auto;
    text-align: center;
  }

  .game {
    display: flex;
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .game h2,
  .end h1 {
    margin-bottom: 20px;
  }

  .config-row {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    justify-content: center;
    margin-bottom: 16px;
  }

  .config-row label {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .op-toggle {
    padding: 4px 8px;
    border-radius: 999px;
    border: 1px solid #ccc;
  }

  input[type="number"] {
    width: 70px;
  }

  .btn-primary {
    padding: 10px 20px;
    border-radius: 999px;
    border: none;
    background: #2563eb;
    color: white;
    font-weight: 600;
    cursor: pointer;
  }

  .btn-primary:hover {
    background: #1d4ed8;
  }

  .question {
    font-size: 2rem;
    font-weight: 600;
    margin-bottom: 20px;
  }

  .field-wrapper {
    display: flex;
    justify-content: center;
    margin: 10px 0 20px;
  }

  .scoreboard {
    display: flex;
    gap: 20px;
    justify-content: space-between;
    width: 100%;
  }

  .score-card {
    flex: 1;
    border: none;
    border-radius: 24px;
    padding: 22px 28px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    text-align: left;
    cursor: pointer;
    color: white;
    font-weight: 600;
    box-shadow: 0 18px 40px rgba(15, 23, 42, 0.2);
    transition: transform 0.15s ease, box-shadow 0.15s ease;
  }

  .score-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 22px 45px rgba(15, 23, 42, 0.25);
  }

  .score-card:active {
    transform: scale(0.98);
    box-shadow: 0 12px 30px rgba(15, 23, 42, 0.18);
  }

  .score-card:focus-visible {
    outline: 3px solid rgba(255, 255, 255, 0.6);
    outline-offset: 4px;
  }

  .score-card.blue-card {
    background: linear-gradient(135deg, #60a5fa, #2563eb);
  }

  .score-card.red-card {
    background: linear-gradient(135deg, #f87171, #dc2626);
  }

  .score-team {
    font-size: 1.1rem;
  }

  .score-value {
    font-size: 3rem;
    font-weight: 700;
    line-height: 1;
  }

  .scores {
    display: flex;
    justify-content: center;
    gap: 40px;
    margin: 10px 0 20px;
  }

  .team .label {
    font-size: 0.9rem;
  }

  .team .value {
    font-size: 2rem;
    font-weight: 700;
  }

  .team-blue .value {
    color: #2563eb;
  }

  .team-red .value {
    color: #dc2626;
  }

  .buttons {
    display: flex;
    justify-content: center;
    gap: 12px;
    margin-top: 10px;
  }

  .timer {
    margin: 10px 0;
    font-size: 1.4rem;
    font-weight: 600;
    color: #f97316;
  }

  .btn-red,
  .btn-blue,
  .btn-neutral {
    padding: 10px 16px;
    border-radius: 999px;
    border: 2px solid #444;
    cursor: pointer;
    font-weight: 500;
    min-width: 120px;
  }

  .btn-red {
    background: #dc2626;
    color: white;
    border-color: #b91c1c;
  }

  .btn-blue {
    background: #2563eb;
    color: white;
    border-color: #1d4ed8;
  }

  .btn-neutral {
    background: #e5e7eb;
    color: #111827;
    border-color: #6b7280;
  }

  .btn-secondary {
    margin-top: 12px;
    padding: 10px 20px;
    border-radius: 999px;
    border: 2px solid #2563eb;
    background: transparent;
    color: #2563eb;
    font-weight: 600;
    cursor: pointer;
  }

  .btn-red:hover {
    background: #b91c1c;
  }

  .btn-blue:hover {
    background: #1d4ed8;
  }

  .btn-neutral:hover {
    background: #d1d5db;
  }

  .btn-secondary:hover {
    background: #dbeafe;
  }

  .goal-popup {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 1.2rem 2rem;
    font-size: 1.6rem;
    font-weight: 700;
    background: white;
    border-radius: 16px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
    animation: popupFade 1.5s ease forwards;
    z-index: 1000;
  }

  @keyframes popupFade {
    0% {
      opacity: 0;
      transform: translate(-50%, -60%);
    }
    15%,
    85% {
      opacity: 1;
      transform: translate(-50%, -50%);
    }
    100% {
      opacity: 0;
      transform: translate(-50%, -40%);
    }
  }

  @media (max-width: 720px) {
    .scoreboard {
      flex-direction: column;
    }
  }
</style>
