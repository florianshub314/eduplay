<script>
  import { goto } from "$app/navigation";
  import { onDestroy } from "svelte";
  import SetupScreen from "$lib/components/game/SetupScreen.svelte";
  import ActiveGameScreen from "$lib/components/game/ActiveGameScreen.svelte";
  import EndScreen from "$lib/components/game/EndScreen.svelte";
  import GoalPopup from "$lib/components/game/GoalPopup.svelte";
  import { readMaterialLines } from "$lib/utils/materialParser";

  let numQuestions = 10;
  let file = null;
  let useManualInput = false;
  let manualInput = "";
  let uploadedLines = [];
  let manualLines = [];
  let fileError = "";

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

  function goBack() {
    goto("/start");
  }

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
        error?.message || "The file could not be processed. Please try again.";
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

  function buildQuestionFromLine(line) {
    if (line.includes(";")) {
      const [de, en] = line.split(";").map((s) => s.trim());
      if (de && en) {
        return `Translate into English: ${de}`;
      }
    }
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
      question: text
    }));

    currentQuestionIndex = 0;
    redScore = 0;
    blueScore = 0;
    resetBall();
    showPopup = false;
    gameStarted = true;
    gameOver = false;
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

<GoalPopup message={popupMessage} visible={showPopup} />

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
