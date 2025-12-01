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

  let numQuestions = 10;
  let topic = "";
  let file = null;
  let useManualInput = false;
  let manualInput = "";
  let uploadedLines = [];
  let manualLines = [];
  let aiLoading = false;
  let aiError = "";
  let aiInstructions = "";
  let fileError = "";
  let materialText = "";
  let isPdfUpload = false;

  let blueTeamName = "";
  let redTeamName = "";
  $: blueTeamLabel = blueTeamName.trim() || "Team Blau";
  $: redTeamLabel = redTeamName.trim() || "Team Rot";

  let questions = [];
  let currentQuestionIndex = 0;
  let gameStarted = false;
  let gameOver = false;

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
  let popupVariant = "neutral";

  let saveTitle = "";
  let savingSet = false;
  let saveStatus = "";
  let saveError = "";

  const genericTemplates = [
    (t, i) => `Frage ${i + 1} zum Thema ${t}: Erkläre den wichtigsten Begriff.`,
    (t, i) =>
      `Frage ${i + 1} zum Thema ${t}: Nenne ein Beispiel aus dem Alltag.`,
    (t, i) => `Frage ${i + 1} zum Thema ${t}: Stelle eine eigene Frage dazu.`,
    (t, i) =>
      `Frage ${i + 1} zum Thema ${t}: Warum ist dieses Thema wichtig?`
  ];

  function goBack() {
    goto("/start");
  }

  function handleGoal(team) {
    popupMessage = goalMessages[team];
    popupVariant = team === "red" ? "red" : "blue";
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

  function resetBall() {
    ballPosition = 0;
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
    nextQuestion();
  }

  function nextQuestion() {
    currentQuestionIndex += 1;
    if (currentQuestionIndex >= questions.length) {
      endGame();
    }
  }

  function endGame() {
    gameStarted = false;
    gameOver = true;
    clearTimeout(goalResetTimeout);
    showPopup = false;
    resetBall();
    popupVariant = "neutral";
  }

  function resetGame() {
    gameStarted = false;
    gameOver = false;
    questions = [];
    currentQuestionIndex = 0;
    redScore = 0;
    blueScore = 0;
    ballPosition = 0;
    showPopup = false;
    clearTimeout(goalResetTimeout);
    popupVariant = "neutral";
  }

  async function handleFileUpload(event) {
    file = event.target.files?.[0] ?? null;
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

  function getMaterialLines() {
    if (useManualInput && manualLines.length > 0) {
      return manualLines;
    }
    return uploadedLines;
  }

  function createQuestionList() {
    const customLines = getMaterialLines();
    const hasCustom = customLines.length > 0;
    const trimmedTopic = topic.trim();
    const list = [];

    for (let i = 0; i < numQuestions; i += 1) {
      if (hasCustom) {
        list.push(
          customLines[Math.floor(Math.random() * customLines.length)]
        );
      } else if (trimmedTopic) {
        const template =
          genericTemplates[Math.floor(Math.random() * genericTemplates.length)];
        list.push(template(trimmedTopic, i));
      } else {
        list.push(`Allgemeine Frage ${i + 1}: Erkläre einen Fachbegriff.`);
      }
    }

    return list;
  }

  function startGameWith(list) {
    questions = list.map((question, index) => ({
      id: index + 1,
      question: cleanQuestionText(question)
    }));
    gameStarted = true;
    gameOver = false;
    currentQuestionIndex = 0;
    redScore = 0;
    blueScore = 0;
    resetBall();
    showPopup = false;
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
        subject: "andere",
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

  async function generateQuestions() {
    if (aiLoading) return;

    if (isPdfUpload && materialText) {
      const lines =
        uploadedLines.length > 0
          ? uploadedLines
          : materialText
              .split(/\r?\n/)
              .map((line) => line.trim())
              .filter((line) => line.length > 0);
      const snippet = buildMaterialSnippet(lines);
      if (snippet) {
        const ok = await generateQuestionsWithAI({ materialSnippet: snippet });
        if (ok) return;
        return;
      }
    }

    const list = createQuestionList();
    startGameWith(list);
  }

  async function generateQuestionsWithAI(options = {}) {
    const trimmedTopic = topic.trim();
    const materialSnippet =
      options.materialSnippet ?? buildMaterialSnippet(getMaterialLines());
    const instructions = aiInstructions.trim();

    if (!trimmedTopic && !materialSnippet) {
      aiError = "Bitte gib ein Thema ein oder lade Unterrichtsmaterial hoch.";
      return false;
    }

    aiLoading = true;
    aiError = "";

    try {
      const res = await fetch("/api/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: "other",
          topic: trimmedTopic,
          material: materialSnippet,
          instructions,
          fileName: file?.name || undefined,
          numQuestions
        })
      });

      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error || "Unbekannter Fehler");
      }

      const list = (json.questions || []).map(
        (entry, index) => entry.question || `Frage ${index + 1}`
      );

      if (!list.length) {
        throw new Error("Die KI hat keine Fragen geliefert.");
      }

      startGameWith(list);
      return true;
    } catch (error) {
      aiError = error.message || "Unbekannter Fehler";
      return false;
    } finally {
      aiLoading = false;
    }
  }

  onDestroy(() => {
    clearTimeout(goalResetTimeout);
  });
</script>

{#if !gameStarted && !gameOver}
  <SetupScreen
    title="Individuelle Fächer"
    infoText="Nutze ein Thema, eigene Dateien oder KI-Fragen."
    bind:blueTeamName
    bind:redTeamName
    bind:numQuestions
    on:back={goBack}
    on:start={generateQuestions}
  >
    <div class="extra-settings">
      <label class="topic-label">
        Thema (optional)
        <input
          type="text"
          placeholder="z. B. Energie, Geografie, Tiere ..."
          bind:value={topic}
        />
      </label>

      <div class="file-row">
        <label>
          Unterrichtsmaterial (TXT oder PDF)
          <input type="file" accept=".txt,.pdf" on:change={handleFileUpload} />
        </label>
        {#if file}
          <p class="file-info">📄 Datei geladen: {file.name}</p>
        {/if}
        {#if fileError}
          <p class="file-error">{fileError}</p>
        {/if}
        {#if aiLoading}
          <p class="file-info">🤖 KI analysiert das Material …</p>
        {/if}
        {#if aiError}
          <p class="file-error">{aiError}</p>
        {/if}
      </div>

      <label class="toggle">
        <input type="checkbox" bind:checked={useManualInput} />
        Eigene Aufgaben manuell eingeben
      </label>

      {#if useManualInput}
        <textarea
          rows="5"
          placeholder={"Eine Aufgabe pro Zeile\\nFrage zu Fotosynthese\\nWas bedeutet Recycling?"}
          bind:value={manualInput}
          on:input={processManualInput}
        ></textarea>
      {/if}

      <label class="instructions-label">
        KI-Hinweis zum Material (optional)
        <textarea
          rows="3"
          placeholder={"z. B. nur die ersten Seiten nutzen oder bitte Multiple-Choice Fragen erstellen"}
          bind:value={aiInstructions}
        ></textarea>
      </label>

      <div class="ai-row">
        <button
          type="button"
          class="btn-ai"
          on:click={generateQuestionsWithAI}
          disabled={aiLoading}
        >
          {#if aiLoading}
            KI erstellt Fragen …
          {:else}
            KI-Fragen generieren
          {/if}
        </button>
        {#if aiError}
          <p class="ai-error">{aiError}</p>
        {/if}
      </div>
    </div>
  </SetupScreen>
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
    {wrongLabel}
    {skipLabel}
    {endLabel}
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
    on:back={goBack}
  />
{/if}

<GoalPopup message={popupMessage} visible={showPopup} variant={popupVariant} />

{#if questions.length > 0}
  <section class="set-save-panel">
    <div>
      <h3>Fragen-Set speichern</h3>
      <p>Vergib einen Titel und sichere dieses Set für spätere Spiele.</p>
    </div>
    <div class="save-actions">
      <input
        type="text"
        placeholder="Titel des Sets"
        bind:value={saveTitle}
        aria-label="Titel des Sets"
      />
      <button
        class="btn-primary"
        type="button"
        on:click={saveCurrentQuestions}
        disabled={savingSet}
      >
        {savingSet ? "Speichere …" : "Set speichern"}
      </button>
    </div>
    {#if saveStatus}
      <p class="save-status">{saveStatus}</p>
    {/if}
    {#if saveError}
      <p class="file-error">{saveError}</p>
    {/if}
  </section>
{/if}

<style>
  .extra-settings {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .topic-label {
    display: flex;
    flex-direction: column;
    gap: 8px;
    font-weight: 500;
  }

  .topic-label input {
    border-radius: 16px;
    border: 2px solid #e2e8f0;
    padding: 12px 16px;
    font-size: 1rem;
  }

  .file-row {
    display: flex;
    flex-direction: column;
    gap: 8px;
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

  .toggle {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 500;
  }

  textarea {
    width: 100%;
    border-radius: 16px;
    border: 2px solid #e2e8f0;
    padding: 12px 16px;
    font-size: 1rem;
    font-family: inherit;
    resize: vertical;
  }

  .instructions-label {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .ai-row {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .btn-ai {
    border-radius: 999px;
    border: none;
    background: #7c3aed;
    color: white;
    padding: 12px 24px;
    font-weight: 600;
    cursor: pointer;
  }

  .btn-ai:disabled {
    opacity: 0.7;
    cursor: progress;
  }

  .ai-error {
    margin: 0;
    color: #dc2626;
    font-weight: 500;
  }

  .set-save-panel {
    max-width: 960px;
    margin: 24px auto 80px;
    padding: 20px;
    border-radius: 24px;
    border: 2px solid #cbd5f5;
    background: #fff;
    box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .save-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }

  .save-actions input {
    flex: 1;
    min-width: 220px;
    border-radius: 16px;
    border: 2px solid #e2e8f0;
    padding: 12px 16px;
    font-size: 1rem;
  }

  .save-status {
    margin: 0;
    color: #16a34a;
    font-weight: 600;
  }
</style>
