<script>
  import { goto } from "$app/navigation";
  import SoccerField from "$lib/components/game/SoccerField.svelte";
  import { onDestroy } from "svelte";

  let numQuestions = 10;
  let topic = "";
  let blueTeamName = "";
  let redTeamName = "";
  $: blueTeamLabel = blueTeamName.trim() || "Team Blau";
  $: redTeamLabel = redTeamName.trim() || "Team Rot";
  let file = null;

  let useManualInput = false;
  let manualInput = "";
  let sourceLines = [];
  let aiLoading = false;
  let aiError = "";

  let questions = [];
  let gameStarted = false;
  let gameOver = false;
  let current = 0;

  let redScore = 0;
  let blueScore = 0;
  let ballPosition = 0;
  const maxBallPosition = 4;

  const wrongLabel = "Falsch";
  const skipLabel = "Überspringen";
  const endLabel = "Spiel beenden";
  const goalMessages = {
    red: "⚽️ Tor für Team Rot!",
    blue: "⚽️ Tor für Team Blau!"
  };

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

  const genericTemplates = [
    (t, i) => `Frage ${i + 1} zum Thema ${t}: Erkläre den wichtigsten Begriff.`,
    (t, i) =>
      `Frage ${i + 1} zum Thema ${t}: Nenne ein Beispiel aus dem Alltag.`,
    (t, i) => `Frage ${i + 1} zum Thema ${t}: Stelle eine eigene Frage dazu.`,
    (t, i) =>
      `Frage ${i + 1} zum Thema ${t}: Warum ist dieses Thema wichtig?`
  ];

  function startGameWith(list) {
    questions = list;
    gameStarted = true;
    gameOver = false;
    current = 0;
    redScore = 0;
    blueScore = 0;
    resetBall();
    showPopup = false;
  }

  function generateQuestions() {
    const hasCustom = sourceLines.length > 0;
    const hasTopic = topic.trim().length > 0;
    const created = [];

    for (let i = 0; i < numQuestions; i++) {
      if (hasCustom) {
        const line =
          sourceLines[Math.floor(Math.random() * sourceLines.length)];
        created.push(line);
      } else if (hasTopic) {
        const tmpl =
          genericTemplates[Math.floor(Math.random() * genericTemplates.length)];
        created.push(tmpl(topic.trim(), i));
      } else {
        created.push(`Allgemeine Frage ${i + 1}: Erkläre einen Fachbegriff.`);
      }
    }

    startGameWith(created);
  }

  async function generateQuestionsWithAI() {
    if (!topic.trim()) {
      aiError = "Bitte gib zuerst ein Thema ein.";
      return;
    }

    aiLoading = true;
    aiError = "";

    try {
      const res = await fetch("/api/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: "other",
          topic: topic.trim(),
          numQuestions
        })
      });

      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error || "Unbekannter Fehler");
      }

      const list = (json.questions || []).map((entry, index) => entry.question || `Frage ${index + 1}`);
      if (!list.length) {
        throw new Error("Die KI hat keine Fragen geliefert.");
      }

      startGameWith(list);
    } catch (error) {
      aiError = error.message;
    } finally {
      aiLoading = false;
    }
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
    nextQuestion();
  }

  function skipQuestion() {
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
    <h1>Andere Fächer – Wandtafelspiel</h1>

    <div class="team-card-grid">
      <div class="team-card blue">
        <div class="team-card-header">
          <span class="team-icon">👕</span>
          <div>
            <p class="team-title">Team Blau</p>
            <p class="team-desc">Standardname, falls leer</p>
          </div>
        </div>
        <input type="text" placeholder="Team Blau" bind:value={blueTeamName} />
      </div>
      <div class="team-card red">
        <div class="team-card-header">
          <span class="team-icon">👕</span>
          <div>
            <p class="team-title">Team Rot</p>
            <p class="team-desc">Standardname, falls leer</p>
          </div>
        </div>
        <input type="text" placeholder="Team Rot" bind:value={redTeamName} />
      </div>
    </div>

    <p class="info-text">
      Wenn kein Name eingegeben wird, heißen die Teams automatisch „Team Blau“ und „Team Rot“.
    </p>

    <div class="settings-card">
      <h2>Spiel-Einstellungen</h2>

      <div class="input-row">
        <label>
          Thema (optional)
          <input type="text" bind:value={topic} placeholder="z.B. Geschichte, Musik…" />
        </label>
        <label>
          Anzahl der Fragen
          <input type="number" min="1" max="50" bind:value={numQuestions} />
        </label>
      </div>

      <label class="file-label">
        Unterrichtsstoff (optional)
        <input type="file" accept=".txt" on:change={handleFileUpload} />
      </label>

      {#if file}
        <p class="fileInfo">📄 Datei geladen: {file.name}</p>
      {/if}

      <label class="toggle">
        <input type="checkbox" bind:checked={useManualInput} />
        Aufgaben manuell eingeben
      </label>

      {#if useManualInput}
        <textarea
          rows="6"
          placeholder={"Beispiele:\\nBeschreibe ein Experiment…\\nErkläre den Begriff…"}
          bind:value={manualInput}
          on:input={processManualInput}
        ></textarea>
      {/if}

      {#if aiError}
        <p class="ai-error">{aiError}</p>
      {/if}

      <div class="action-buttons">
        <button class="btn-secondary" on:click={goBack}>Zurück</button>
        <button class="btn-outline" on:click={generateQuestionsWithAI} disabled={aiLoading}>
          {aiLoading ? "KI generiert…" : "KI-Fragen erstellen"}
        </button>
        <button class="btn-primary" on:click={generateQuestions}>
          Spiel starten
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
        on:click={() => moveBall('blue')}
        aria-label={`Punkt für ${blueTeamLabel}`}
      >
        <span class="score-team">{blueTeamLabel}</span>
        <span class="score-value">{blueScore}</span>
      </button>
      <button
        type="button"
        class="score-card red-card"
        on:click={() => moveBall('red')}
        aria-label={`Punkt für ${redTeamLabel}`}
      >
        <span class="score-team">{redTeamLabel}</span>
        <span class="score-value">{redScore}</span>
      </button>
    </div>

    <h2>Frage {current + 1} von {questions.length}</h2>
    <div class="question">{questions[current]}</div>

    <div class="field-wrapper">
      <SoccerField
        position={ballPosition}
        maxPosition={maxBallPosition}
      />
    </div>

    <div class="buttons">
      <button class="btn-neutral" on:click={wrongAnswer}>{wrongLabel}</button>
      <button class="btn-neutral" on:click={skipQuestion}>{skipLabel}</button>
      <button class="btn-neutral" on:click={endGame}>{endLabel}</button>
    </div>
  </main>
{:else}
  <main class="end">
    <h1>Spiel beendet</h1>

    {#if redScore > blueScore}
      <h2>{redTeamLabel} gewinnt!</h2>
    {:else if blueScore > redScore}
      <h2>{blueTeamLabel} gewinnt!</h2>
    {:else}
      <h2>Unentschieden!</h2>
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

    <button class="btn-primary" on:click={generateQuestions}>Neues Spiel starten</button>
    <button class="btn-secondary" on:click={goBack}>Zurück</button>
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
      'Segoe UI',
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
    width: 56px;
    height: 56px;
    border-radius: 999px;
    display: grid;
    place-items: center;
    color: white;
    font-size: 1.8rem;
  }

  .team-card.blue .team-icon {
    background: linear-gradient(135deg, #60a5fa, #2563eb);
  }

  .team-card.red .team-icon {
    background: linear-gradient(135deg, #f87171, #dc2626);
  }

  .team-title {
    margin: 0;
    font-size: 1.2rem;
    font-weight: 700;
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
    background: white;
    box-shadow: inset 0 2px 6px rgba(15, 23, 42, 0.05);
    box-sizing: border-box;
  }

  .info-text {
    margin: 16px 0 28px;
    color: #475569;
    font-size: 0.95rem;
    text-align: center;
  }

  .settings-card {
    width: min(960px, 100%);
    background: white;
    border-radius: 32px;
    padding: 32px;
    box-shadow: 0 25px 50px rgba(15, 23, 42, 0.1);
  }

  .input-row {
    display: flex;
    gap: 20px;
    flex-wrap: wrap;
    margin-bottom: 20px;
  }

  .input-row label {
    flex: 1;
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

  .file-label {
    display: flex;
    flex-direction: column;
    font-weight: 600;
    color: #0f172a;
    margin-bottom: 12px;
  }

  .file-label input {
    margin-top: 6px;
  }

  .fileInfo {
    font-size: 0.9rem;
    color: #555;
  }

  textarea {
    width: 100%;
    border-radius: 16px;
    border: 2px solid #cbd5e1;
    padding: 0.75rem;
    font-size: 1rem;
    resize: vertical;
    background: #f8fafc;
  }

  .toggle {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 500;
    color: #0f172a;
    margin-bottom: 18px;
  }

  .action-buttons {
    display: flex;
    justify-content: flex-end;
    gap: 16px;
    margin-top: 24px;
  }
  .btn-outline {
    padding: 10px 20px;
    border-radius: 999px;
    border: 2px solid #0f172a;
    background: transparent;
    color: #0f172a;
    font-weight: 600;
    cursor: pointer;
  }
  .btn-outline:disabled {
    opacity: 0.6;
    cursor: progress;
  }
  .ai-error {
    margin-top: 12px;
    color: #dc2626;
    font-weight: 500;
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
    margin-top: 1rem;
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
