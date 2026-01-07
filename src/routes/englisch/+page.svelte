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

  let setupSection;

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
    stopTimer();
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
  <div class="page-shell">
    <section class="feature-section">
      <div class="section-heading">
        <p class="eyebrow">Everything in view</p>
        <h2>English drills in three clear tiles</h2>
        <p class="section-lede">
          Pick teams, mix vocabulary or grammar, and add AI if you like. Same layout as Deutsch,
          tuned for English class.
        </p>
      </div>
      <div class="feature-grid">
        <article class="feature-card">
          <div class="feature-icon">✨</div>
          <h3>Mix vocab & grammar</h3>
          <p>Upload a list, type prompts yourself, or let the AI create fresh tasks.</p>
        </article>
        <article class="feature-card">
          <div class="feature-icon">🧭</div>
          <h3>Clear flow</h3>
          <p>Team names, number of questions, hit start—your wandtafel match begins right away.</p>
        </article>
        <article class="feature-card">
          <div class="feature-icon">💾</div>
          <h3>Save sets</h3>
          <p>Store vocab lists and AI sets to reuse later in /sets.</p>
        </article>
      </div>
    </section>

    <section class="explanation-section">
      <div class="explanation-card">
        <div class="explanation-shape shape-one"></div>
        <div class="explanation-shape shape-two"></div>
        <p class="eyebrow">How it works</p>
        <h2>Three steps for the English board game</h2>
        <p class="section-lede">
          Set up the teams, choose how to build questions, and watch the ball move with every answer.
        </p>
        <div class="steps">
          <div class="step">
            <span class="step-badge">1</span>
            <div>
              <p class="step-title">Teams & amount</p>
              <p class="step-copy">
                Name the teams, pick the number of questions, and decide on AI or manual input.
              </p>
            </div>
          </div>
          <div class="step">
            <span class="step-badge">2</span>
            <div>
              <p class="step-title">Add material</p>
              <p class="step-copy">
                Drag in TXT/PDF, type vocab pairs, or just start with the defaults.
              </p>
            </div>
          </div>
          <div class="step">
            <span class="step-badge">3</span>
            <div>
              <p class="step-title">Play & store</p>
              <p class="step-copy">
                Start the match, track goals, and save the set when you like the result.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="cta-setup" id="setup-panel" bind:this={setupSection}>
      <div class="cta-backdrop">
        <span class="cta-shape shape-x"></span>
        <span class="cta-shape shape-y"></span>
        <span class="cta-shape shape-z"></span>
      </div>
      <div class="cta-grid stacked">
        <SetupScreen
          title="English – Wandtafelspiel"
          infoText="Leave the names empty to use Team Blue and Team Red."
          bind:blueTeamName
          bind:redTeamName
          bind:numQuestions
          on:back={goBack}
          on:start={generateQuestions}
        >
          <div class="extra-settings inline-settings">
            <p class="group-label">Lesson content (optional)</p>
            <p class="file-info">Choose material or AI settings im Block below.</p>
          </div>

          <div class="settings-stack">
            <div class="extra-settings side-panel">
              <p class="group-label">Material & AI</p>
              <FileDropzone
                label="File (TXT or PDF)"
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

              <div class="compact-card inline">
                <p class="eyebrow">Ready?</p>
                <h3>Same flow as Deutsch</h3>
                <p class="section-lede compact-copy">
                  Teams, questions, then material or AI – alles in einem Block für Englisch.
                </p>
                <ul class="mini-list">
                  <li>TXT/PDF uploads or manual pairs</li>
                  <li>AI follows your optional hints</li>
                  <li>Save sets to reuse later</li>
                </ul>
              </div>
            </div>
          </div>
        </SetupScreen>
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

  .feature-section {
    max-width: 1180px;
    margin: 0 auto 80px;
    position: relative;
    padding: 0 4px;
  }

  .section-heading h2 {
    font-size: clamp(2rem, 3vw, 2.4rem);
    margin: 10px 0 8px;
  }

  .section-lede {
    margin: 0;
    font-size: 1.05rem;
    line-height: 1.6;
    max-width: 820px;
  }

  .feature-grid {
    margin-top: 28px;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 18px;
  }

  .feature-card {
    background: linear-gradient(180deg, #fff, #fff2de);
    border: 4px solid var(--ink);
    border-radius: 26px;
    padding: 20px 18px;
    box-shadow: 14px 14px 0 rgba(31, 26, 45, 0.18);
  }

  .feature-icon {
    width: 52px;
    height: 52px;
    border-radius: 18px;
    display: grid;
    place-items: center;
    border: 3px solid var(--ink);
    background: #fff;
    box-shadow: 8px 8px 0 rgba(31, 26, 45, 0.12);
    font-size: 1.4rem;
    margin-bottom: 12px;
  }

  .feature-card h3 {
    margin: 0 0 8px;
    font-size: 1.3rem;
  }

  .feature-card p {
    margin: 0;
    line-height: 1.5;
  }

  .explanation-section {
    max-width: 1180px;
    margin: 0 auto 90px;
    position: relative;
  }

  .explanation-card {
    position: relative;
    border: 4px solid var(--ink);
    border-radius: 30px;
    padding: 32px 28px;
    background: linear-gradient(135deg, #fff, #e6f2ff 45%, #ffe7fb 100%);
    box-shadow: 16px 16px 0 rgba(31, 26, 45, 0.18);
    overflow: hidden;
  }

  .explanation-card h2 {
    margin: 10px 0 10px;
    font-size: clamp(2rem, 3vw, 2.4rem);
  }

  .explanation-shape {
    position: absolute;
    border: 4px solid var(--ink);
    border-radius: 999px;
    opacity: 0.3;
  }

  .explanation-shape.shape-one {
    width: 180px;
    height: 180px;
    background: var(--accent-violet);
    right: -60px;
    top: -40px;
    transform: rotate(-14deg);
  }

  .explanation-shape.shape-two {
    width: 140px;
    height: 140px;
    background: var(--accent-yellow);
    left: -40px;
    bottom: -50px;
    transform: rotate(10deg);
  }

  .steps {
    display: grid;
    gap: 14px;
    margin-top: 18px;
    position: relative;
    z-index: 1;
  }

  .step {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 14px;
    align-items: center;
    background: #fff;
    border: 3px solid var(--ink);
    border-radius: 18px;
    padding: 14px 16px;
    box-shadow: 10px 10px 0 rgba(31, 26, 45, 0.12);
  }

  .step-badge {
    width: 42px;
    height: 42px;
    border-radius: 12px;
    border: 3px solid var(--ink);
    display: grid;
    place-items: center;
    font-weight: 900;
    background: var(--accent-green);
    box-shadow: 8px 8px 0 rgba(31, 26, 45, 0.12);
  }

  .step-title {
    margin: 0 0 4px;
    font-weight: 800;
  }

  .step-copy {
    margin: 0;
    line-height: 1.5;
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
    gap: 16px;
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

  .file-row {
    display: flex;
    flex-direction: column;
    gap: 8px;
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

  .settings-stack {
    display: flex;
    flex-direction: column;
    gap: 14px;
    width: 100%;
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

  textarea {
    width: 100%;
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
