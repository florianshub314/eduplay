<script>
  import { goto } from "$app/navigation";
  import SoccerField from "$lib/components/game/SoccerField.svelte";
  import { onDestroy } from "svelte";

  // =========================
  //    CONFIG
  // =========================
  let numQuestions = 10;
  let file = null;

  let useManualInput = false;
  let manualInput = "";
  let sourceLines = [];

  // =========================
  //   GAME STATE
  // =========================
  let questions = [];
  let gameStarted = false;
  let gameOver = false;
  let current = 0;

  let redScore = 0;
  let blueScore = 0;
  let blueTeamName = "";
  let redTeamName = "";
  $: blueTeamLabel = blueTeamName.trim() || "Team Blue";
  $: redTeamLabel = redTeamName.trim() || "Team Red";
  let ballPosition = 0;
  const maxBallPosition = 4;

  const wrongLabel = "Wrong";
  const skipLabel = "Skip";
  const endLabel = "End game";
  const goalMessages = {
    red: "⚽️ Goal for Team Red!",
    blue: "⚽️ Goal for Team Blue!"
  };

  // =========================
  //    POPUP (GOALS)
  // =========================
  let showPopup = false;
  let popupMessage = "";
  let goalResetTimeout;

  function handleGoal(team) {
    popupMessage = goalMessages[team];
    showPopup = true;

    if (team === "red") {
      redScore += 1;
    } else {
      blueScore += 1;
    }

    resetBall();
    clearTimeout(goalResetTimeout);
    goalResetTimeout = setTimeout(() => {
      showPopup = false;
    }, 1500);
  }

  // =========================
  //    HELPERS
  // =========================
  function goBack() {
    goto("/start");
  }

  function handleFileUpload(event) {
    file = event.target.files[0];

    if (!file) {
      sourceLines = [];
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      sourceLines = reader.result
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.length > 0);
    };
    reader.readAsText(file);
  }

  function processManualInput() {
    sourceLines = manualInput
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
  }

  function buildQuestionFromLine(line) {
    // Format z.B.: Haus;house  → wir fragen nach der englischen Übersetzung
    if (line.includes(";")) {
      const [de, en] = line.split(";").map((s) => s.trim());
      if (de && en) {
        return `Translate into English: ${de}`;
      }
    }
    // Sonst benutzen wir die Zeile direkt als Frage
    return line;
  }

  const fallbackQuestions = [
    "Translate into English: Haus",
    "Translate into English: Schule",
    "Translate into English: Auto",
    "Translate into English: Baum",
    "Translate into English: Katze",
    "Translate into English: Hund",
    "Translate into English: rot",
    "Translate into English: schnell",
    "Translate into English: glücklich",
    "Translate into English: spielen"
  ];

  function generateQuestions() {
    questions = [];
    const hasCustom = sourceLines.length > 0;

    for (let i = 0; i < numQuestions; i++) {
      if (hasCustom) {
        const line =
          sourceLines[Math.floor(Math.random() * sourceLines.length)];
        questions.push(buildQuestionFromLine(line));
      } else {
        questions.push(
          fallbackQuestions[
            Math.floor(Math.random() * fallbackQuestions.length)
          ]
        );
      }
    }

    gameStarted = true;
    gameOver = false;
    current = 0;
    redScore = 0;
    blueScore = 0;
    resetBall();
    showPopup = false;
  }

  // =========================
  //       GAME LOGIC
  // =========================
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
    // nur zur nächsten Frage weiter
    nextQuestion();
  }

  function skipQuestion() {
    // Frage wird entfernt, Zähler bleibt – so verteilst du immer alle Punkte
    questions.splice(current, 1);

    if (questions.length === 0) {
      return endGame();
    }

    if (current >= questions.length) {
      current = questions.length - 1;
    }
  }

  function nextQuestion() {
    current++;
    if (current >= questions.length) {
      endGame();
    }
  }

  function endGame() {
    gameStarted = false;
    gameOver = true;
    clearTimeout(goalResetTimeout);
    showPopup = false;
    resetBall();
  }

  function resetBall() {
    ballPosition = 0;
  }

  onDestroy(() => {
    clearTimeout(goalResetTimeout);
  });
</script>

{#if !gameStarted && !gameOver}
  <main class="config">
    <h1>Teams & Game Settings</h1>

    <div class="team-card-grid">
      <div class="team-card blue">
        <div class="team-card-header">
          <span class="team-icon">👕</span>
          <div>
            <p class="team-title">Team Blue</p>
            <p class="team-desc">Default name if empty</p>
          </div>
        </div>
        <input
          type="text"
          placeholder="Team Blue"
          bind:value={blueTeamName}
        />
      </div>
      <div class="team-card red">
        <div class="team-card-header">
          <span class="team-icon">👕</span>
          <div>
            <p class="team-title">Team Red</p>
            <p class="team-desc">Default name if empty</p>
          </div>
        </div>
        <input type="text" placeholder="Team Red" bind:value={redTeamName} />
      </div>
    </div>

    <div class="settings-card">
      <h2>Game Settings</h2>

      <div class="input-row">
        <label>
          Number of questions
          <input type="number" min="1" max="50" bind:value={numQuestions} />
        </label>
      </div>

      <div class="file-row">
        <label>
          Lesson content (optional)
          <input type="file" accept=".txt" on:change={handleFileUpload} />
        </label>
        {#if file}
          <p class="fileInfo">📄 {file.name} loaded</p>
        {/if}
      </div>

      <label class="toggle">
        <input type="checkbox" bind:checked={useManualInput} />
        <span>Enter prompts manually</span>
      </label>

      {#if useManualInput}
        <textarea
          rows="6"
          placeholder={"Examples:\nHaus;house\nSchule;school\nor your own prompts"}
          bind:value={manualInput}
          on:input={processManualInput}
        ></textarea>
      {/if}

      <div class="action-buttons">
        <button class="btn-secondary" on:click={goBack}>Back</button>
        <button class="btn-primary" on:click={generateQuestions}>
          Start game
        </button>
      </div>
    </div>
  </main>
{:else if gameStarted}
  <main class="game">
    <div class="scoreboard">
      <button
        type="button"
        class="score-card blue-card"
        on:click={() => moveBall("blue")}
        aria-label={`Point for ${blueTeamLabel}`}
      >
        <span class="score-team">{blueTeamLabel}</span>
        <span class="score-value">{blueScore}</span>
      </button>
      <button
        type="button"
        class="score-card red-card"
        on:click={() => moveBall("red")}
        aria-label={`Point for ${redTeamLabel}`}
      >
        <span class="score-team">{redTeamLabel}</span>
        <span class="score-value">{redScore}</span>
      </button>
    </div>

    <h2>Question {current + 1} of {questions.length}</h2>
    <div class="question">{questions[current]}</div>

    <div class="field-wrapper">
      <SoccerField
        position={ballPosition}
        maxPosition={maxBallPosition}
      />
    </div>

    <div class="buttons">
      <button class="btn-neutral" on:click={wrongAnswer}>
        {wrongLabel}
      </button>
      <button class="btn-neutral" on:click={skipQuestion}>
        {skipLabel}
      </button>
      <button class="btn-neutral" on:click={endGame}>
        {endLabel}
      </button>
    </div>
  </main>
{:else}
  <main class="end">
    <h1>Game over</h1>

    {#if redScore > blueScore}
      <h2>{redTeamLabel} wins!</h2>
    {:else if blueScore > redScore}
      <h2>{blueTeamLabel} wins!</h2>
    {:else}
      <h2>Draw!</h2>
    {/if}

    <div class="scores">
      <div class="team team-blue">
        <div class="label">{blueTeamLabel}</div>
        <div class="value">{blueScore}</div>
      </div>
      <div class="team team-red">
        <div class="label">{redTeamLabel}</div>
        <div class="value">{redScore}</div>
      </div>
    </div>

    <button class="btn-primary" on:click={generateQuestions}>
      Start new game
    </button>
    <button class="btn-secondary" on:click={goBack}>Back</button>
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
    min-height: 180px;
    display: flex;
    flex-direction: column;
    gap: 16px;
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
    background: white;
    box-sizing: border-box;
    box-shadow: inset 0 2px 6px rgba(15, 23, 42, 0.05);
  }

  .settings-card {
    width: min(960px, 100%);
    background: white;
    border-radius: 32px;
    padding: 32px;
    box-shadow: 0 25px 50px rgba(15, 23, 42, 0.1);
    margin-top: 30px;
  }

  .settings-card h2 {
    margin-top: 0;
    margin-bottom: 24px;
    font-size: 1.6rem;
  }

  .input-row label {
    display: flex;
    flex-direction: column;
    font-weight: 600;
    color: #0f172a;
  }

  .input-row input {
    margin-top: 8px;
    border-radius: 16px;
    border: 2px solid #e2e8f0;
    padding: 12px 16px;
    font-size: 1rem;
    background: #f8fafc;
  }

  .file-row {
    margin: 20px 0;
  }

  .file-row label {
    font-weight: 600;
    display: flex;
    flex-direction: column;
    color: #0f172a;
  }

  .file-row input {
    margin-top: 6px;
  }

  textarea {
    width: 100%;
    border-radius: 16px;
    border: 2px solid #e2e8f0;
    padding: 0.75rem;
    font-size: 1rem;
    resize: vertical;
    background: #f8fafc;
  }

  .fileInfo {
    font-size: 0.9rem;
    color: #475569;
  }

  .toggle {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 500;
    color: #0f172a;
  }

  .action-buttons {
    margin-top: 24px;
    display: flex;
    gap: 16px;
    justify-content: flex-end;
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
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 10px;
  }

  .btn-red,
  .btn-blue,
  .btn-neutral {
    padding: 10px 16px;
    border-radius: 999px;
    border: 2px solid #444;
    cursor: pointer;
    font-weight: 500;
    min-width: 140px;
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

  .btn-primary,
  .btn-secondary {
    padding: 10px 20px;
    border-radius: 999px;
    border: none;
    cursor: pointer;
    font-weight: 600;
  }

  .btn-primary {
    background: #2563eb;
    color: white;
  }

  .btn-secondary {
    background: transparent;
    color: #2563eb;
    border: 2px solid #2563eb;
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

  .btn-primary:hover {
    background: #1d4ed8;
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
