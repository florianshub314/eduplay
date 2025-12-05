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
import SaveSetPanel from "$lib/components/game/SaveSetPanel.svelte";
import WinnerPopup from "$lib/components/game/WinnerPopup.svelte";
  import FileDropzone from "$lib/components/inputs/FileDropzone.svelte";

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
  let aiInstructions = "";
  let useAiGenerator = false;

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

  function scrollToTop() {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  let showTimer = false;
  let timer = 10;
  let timerInterval;

  let showPopup = false;
  let popupMessage = "";
  let goalResetTimeout;
  let popupVariant = "neutral";

  let saveTitle = "";
  let savingSet = false;
  let saveStatus = "";
  let saveError = "";
let winnerPopupVisible = false;
let winnerName = "";
let winnerSubtitle = "";

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
    stopTimer();
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
    stopTimer();
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
      winnerSubtitle = `Final score ${redScore} : ${blueScore}`;
    } else if (blueScore > redScore) {
      winnerName = blueTeamLabel;
      winnerSubtitle = `Final score ${blueScore} : ${redScore}`;
    } else {
      winnerName = "Draw";
      winnerSubtitle = "Both teams have the same score.";
    }
    winnerPopupVisible = true;
    stopTimer();
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
    stopTimer();
    winnerPopupVisible = false;
  }

  function startGameWith(list) {
    questions = list;
    currentQuestionIndex = 0;
    redScore = 0;
    blueScore = 0;
    resetBall();
    showPopup = false;
    gameStarted = true;
    gameOver = false;
    saveStatus = "";
    saveError = "";
    stopTimer();
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

  function buildEnglishAiMaterial(customLines) {
    if (customLines.length > 0) {
      return `User provided prompts or vocabulary:\n${customLines.join("\n")}`;
    }
    return [
      `Create ${numQuestions} short vocabulary or grammar questions.`,
      "Niveau: Volksschule / lower secondary.",
      "Mische Wortschatz, Satzbau und Grammatik."
    ].join("\n");
  }

  async function generateQuestionsWithAiSettings() {
    const customLines =
      useManualInput && manualLines.length > 0 ? manualLines : uploadedLines;
    const material = buildEnglishAiMaterial(customLines);
    aiLoading = true;
    aiError = "";

    try {
      const instructions = [
        "Create concise English vocabulary or grammar questions and provide only the prompt without solutions.",
        aiInstructions.trim()
      ]
        .filter(Boolean)
        .join(" ");
      const list = await requestAiQuestions({
        subject: "english",
        material,
        instructions,
        fileName: file?.name,
        numQuestions
      });
      const mapped = list.map((entry, index) => ({
        id: index + 1,
        question: cleanQuestionText(entry.question)
      }));
      startGameWith(mapped);
      return true;
    } catch (error) {
      aiError = error.message || "AI could not create questions.";
      return false;
    } finally {
      aiLoading = false;
    }
  }

  function startGameWith(list) {
    questions = list;
    currentQuestionIndex = 0;
    redScore = 0;
    blueScore = 0;
    resetBall();
    showPopup = false;
    gameStarted = true;
    gameOver = false;
    saveStatus = "";
    saveError = "";
    winnerPopupVisible = false;
    scrollToTop();
  }

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
      const list = await requestAiQuestions({
        subject: "english",
        material: snippet,
        instructions:
          "Create concise English vocabulary or grammar questions based strictly on the provided teaching material.",
        fileName: file?.name,
        numQuestions
      });

      const mapped = list.map((entry, index) => ({
        id: index + 1,
        question: cleanQuestionText(entry.question)
      }));
      startGameWith(mapped);
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

    if (useAiGenerator) {
      const ok = await generateQuestionsWithAiSettings();
      if (ok) return;
    }

    const generated = [];
    const customLines =
      useManualInput && manualLines.length > 0 ? manualLines : uploadedLines;

    if (customLines.length > 0) {
      const uniqueLines = pickUniqueRandomItems(customLines, numQuestions);
      uniqueLines.forEach((line) => generated.push(buildQuestionFromLine(line)));
    } else {
      for (let i = 0; i < numQuestions; i += 1) {
        generated.push(
          fallbackQuestions[
            Math.floor(Math.random() * fallbackQuestions.length)
          ]
        );
      }
    }

    const mapped = generated.map((text, index) => ({
      id: index + 1,
      question: cleanQuestionText(text)
    }));

    startGameWith(mapped);
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
    stopTimer();
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
        <FileDropzone
          label="Lesson content (TXT or PDF, optional)"
          accept=".txt,.pdf"
          on:change={handleFileUpload}
          fileName={file?.name}
          loading={aiLoading}
          description="Drag the file here or tap to choose."
        />
        {#if fileError}
          <p class="file-error">{fileError}</p>
        {/if}
        {#if aiLoading}
          <p class="file-info">🤖 AI is creating questions …</p>
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

      <label class="toggle">
        <input type="checkbox" bind:checked={useAiGenerator} />
        <span>Let AI create the questions</span>
      </label>

      {#if useAiGenerator}
        <textarea
          rows="3"
          placeholder="Optional instructions for the AI"
          bind:value={aiInstructions}
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

<WinnerPopup
  visible={winnerPopupVisible}
  winner={winnerName}
  subtitle={winnerSubtitle}
  on:close={() => (winnerPopupVisible = false)}
/>

<SaveSetPanel
  visible={questions.length > 0}
  title="Save this question set"
  description="Provide a title to reuse the set later via /sets."
  bind:saveTitle
  saving={savingSet}
  status={saveStatus}
  error={saveError}
  buttonLabel="Save set"
  on:save={saveCurrentQuestions}
/>

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

</style>
