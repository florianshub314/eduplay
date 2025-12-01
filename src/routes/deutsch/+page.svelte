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
  let file = null;
  let useManualInput = false;
  let manualInput = "";
  let customTasks = [];
  let fileError = "";
  let materialText = "";
  let isPdfUpload = false;
  let aiLoading = false;
  let aiError = "";

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

  const wrongLabel = "Falsch";
  const skipLabel = "Überspringen";
  const endLabel = "Spiel beenden";

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
    file = event.target.files?.[0] ?? null;
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
      for (let i = 0; i < numQuestions; i += 1) {
        pool.push(
          customTasks[Math.floor(Math.random() * customTasks.length)]
        );
      }
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
      const res = await fetch("/api/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: "deutsch",
          material: snippet,
          instructions:
            "Erstelle abwechslungsreiche Fragen zum deutschen Unterrichtsstoff. Nutze zentrale Begriffe, Grammatik oder Textverständnis und halte die Fragen kurz.",
          fileName: file?.name,
          numQuestions
        })
      });

      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error || "Die KI konnte keine Fragen generieren.");
      }

      const list = json.questions ?? [];
      if (!list.length) {
        throw new Error("Die KI hat keine Fragen geliefert.");
      }

      questions = list.map((entry, index) => ({
        id: index + 1,
        question: cleanQuestionText(entry.question),
        hint: entry.hint ?? null
      }));

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

    questions = buildQuestionPool();
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
    if (redScore > blueScore) showMessage("🏆 Team Rot gewinnt!");
    else if (blueScore > redScore) showMessage("🏆 Team Blau gewinnt!");
    else showMessage("🤝 Unentschieden!");
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
  <SetupScreen
    title="Deutsch – Wandtafelspiel"
    infoText="Wenn die Felder leer bleiben, heißen die Teams automatisch „Team Blau“ und „Team Rot“."
    bind:blueTeamName
    bind:redTeamName
    bind:numQuestions
    on:back={goBack}
    on:start={generateQuestions}
  >
    <div class="extra-settings">
      <div class="task-grid">
        <p class="group-label">Aufgabentyp</p>
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

      <label class="file-label">
        Unterrichtsstoff (TXT oder PDF, optional)
        <input type="file" accept=".txt,.pdf" on:change={handleFileUpload} />
      </label>
      {#if file}
        <p class="file-info">📄 Datei geladen: {file.name}</p>
      {/if}
      {#if fileError}
        <p class="file-error">{fileError}</p>
      {/if}
      {#if aiLoading}
        <p class="file-info">🤖 KI analysiert das Dokument …</p>
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
          rows="6"
          placeholder={"Beispiele:\\nArtikel einsetzen\\nPlural bilden\\nSätze korrigieren"}
          bind:value={manualInput}
          on:input={processManualInput}
        ></textarea>
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

{#if questions.length > 0}
  <section class="set-save-panel">
    <div>
      <h3>Fragen-Set speichern</h3>
      <p>Lege einen Titel fest und sichere das aktuelle Set für später.</p>
    </div>
    <div class="save-actions">
      <input
        type="text"
        placeholder="Titel des Sets"
        bind:value={saveTitle}
        aria-label="Titel des Fragen-Sets"
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

  .task-grid {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .task-grid label {
    display: flex;
    gap: 8px;
    align-items: center;
    font-weight: 500;
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
</style>
