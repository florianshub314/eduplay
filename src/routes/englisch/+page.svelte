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
  let uploadedLines = [];
  let manualLines = [];
  let fileError = "";
  let materialText = "";
  let isPdfUpload = false;
  let aiLoading = false;
  let aiError = "";

  let questions = [];
  let currentQuestionIndex = 0;
  let gameStarted = false;
  let gameOver = false;

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

  let showPopup = false;
  let popupMessage = "";
  let goalResetTimeout;
  let popupVariant = "neutral";

  let saveTitle = "";
  let savingSet = false;
  let saveStatus = "";
  let saveError = "";

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
    questions = questions.filter((_, index) => index !== currentQuestionIndex);
    if (questions.length === 0) {
      endGame();
      return;
    }
    if (currentQuestionIndex >= questions.length) {
      currentQuestionIndex = questions.length - 1;
    }
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
        error?.message || "The file could not be processed. Please try again.";
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

  function buildQuestionFromLine(line) {
    if (line.includes(";")) {
      const [de, en] = line.split(";").map((s) => s.trim());
      if (de && en) {
        return cleanQuestionText(`Translate into English: ${de}`);
      }
    }
    return cleanQuestionText(line);
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

  async function generateQuestionsFromPdf() {
    if (!materialText.trim()) {
      aiError = "The PDF seems to be empty.";
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
      aiError = "No useful content detected in the PDF.";
      return false;
    }

    aiLoading = true;
    aiError = "";

    try {
      const res = await fetch("/api/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: "english",
          material: snippet,
          instructions:
            "Create concise English vocabulary or grammar questions based strictly on the provided teaching material.",
          fileName: file?.name,
          numQuestions
        })
      });
      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error || "AI could not create questions.");
      }

      const list = json.questions ?? [];
      if (!list.length) throw new Error("No questions were returned.");

      questions = list.map((entry, index) => ({
        id: index + 1,
        question: cleanQuestionText(entry.question)
      }));

      currentQuestionIndex = 0;
      redScore = 0;
      blueScore = 0;
      resetBall();
      showPopup = false;
      gameStarted = true;
      gameOver = false;
      saveStatus = "";
      saveError = "";
      return true;
    } catch (error) {
      aiError = error.message || "Unknown error while contacting AI.";
      return false;
    } finally {
      aiLoading = false;
    }
  }

  async function generateQuestions() {
    if (aiLoading) return;

    if (isPdfUpload && materialText) {
      const ok = await generateQuestionsFromPdf();
      if (ok) return;
      return;
    }

    const generated = [];
    const customLines =
      useManualInput && manualLines.length > 0 ? manualLines : uploadedLines;
    const hasCustom = customLines.length > 0;

    for (let i = 0; i < numQuestions; i += 1) {
      if (hasCustom) {
        const line =
          customLines[Math.floor(Math.random() * customLines.length)];
        generated.push(buildQuestionFromLine(line));
      } else {
        generated.push(
          fallbackQuestions[
            Math.floor(Math.random() * fallbackQuestions.length)
          ]
        );
      }
    }

    questions = generated.map((text, index) => ({
      id: index + 1,
      question: cleanQuestionText(text)
    }));

    currentQuestionIndex = 0;
    redScore = 0;
    blueScore = 0;
    resetBall();
    showPopup = false;
    gameStarted = true;
    gameOver = false;
    saveStatus = "";
    saveError = "";
  }

  async function saveCurrentQuestions() {
    saveStatus = "";
    saveError = "";

    if (questions.length === 0) {
      saveError = "There are no questions to save yet.";
      return;
    }

    try {
      savingSet = true;
      const set = await saveQuestionSet({
        title: saveTitle,
        subject: "english",
        questions
      });
      saveStatus = `Saved as “${set.title}”`;
      saveTitle = set.title;
    } catch (error) {
      saveError = error.message || "Saving failed.";
    } finally {
      savingSet = false;
    }
  }

  onDestroy(() => {
    clearTimeout(goalResetTimeout);
  });
</script>

{#if !gameStarted && !gameOver}
  <SetupScreen
    title="Teams & Game Settings"
    infoText="Leave the names empty to use Team Blue and Team Red."
    bind:blueTeamName
    bind:redTeamName
    bind:numQuestions
    on:back={goBack}
    on:start={generateQuestions}
  >
    <div class="extra-settings">
      <div class="file-row">
        <label>
          Lesson content (TXT or PDF, optional)
          <input type="file" accept=".txt,.pdf" on:change={handleFileUpload} />
        </label>
        {#if file}
          <p class="file-info">📄 {file.name} loaded</p>
        {/if}
        {#if fileError}
          <p class="file-error">{fileError}</p>
        {/if}
        {#if aiLoading}
          <p class="file-info">🤖 AI is reading the document …</p>
        {/if}
        {#if aiError}
          <p class="file-error">{aiError}</p>
        {/if}
      </div>

      <label class="toggle">
        <input type="checkbox" bind:checked={useManualInput} />
        <span>Enter prompts manually</span>
      </label>

      {#if useManualInput}
        <textarea
          rows="6"
          placeholder={"Examples:\\nHaus;house\\nSchule;school"}
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
      <h3>Save this question set</h3>
      <p>Provide a title to reuse the set later via /sets.</p>
    </div>
    <div class="save-actions">
      <input
        type="text"
        placeholder="Set title"
        bind:value={saveTitle}
        aria-label="Set title"
      />
      <button
        class="btn-primary"
        type="button"
        on:click={saveCurrentQuestions}
        disabled={savingSet}
      >
        {savingSet ? "Saving…" : "Save set"}
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

  .file-row {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .file-row input[type="file"] {
    margin-top: 6px;
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
    color: #0f172a;
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
