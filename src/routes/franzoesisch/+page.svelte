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
import FileDropzone from "$lib/components/inputs/FileDropzone.svelte";
import SaveSetPanel from "$lib/components/game/SaveSetPanel.svelte";
import WinnerPopup from "$lib/components/game/WinnerPopup.svelte";

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
  $: blueTeamLabel = blueTeamName.trim() || "Équipe bleue";
  $: redTeamLabel = redTeamName.trim() || "Équipe rouge";

  let ballPosition = 0;
  const maxBallPosition = 4;

  const wrongLabel = "Faux";
  const skipLabel = "Passer";
  const endLabel = "Terminer la partie";
  const goalMessages = {
    red: "⚽️ But pour l'équipe rouge !",
    blue: "⚽️ But pour l'équipe bleue !"
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
      winnerSubtitle = `Score final ${redScore} : ${blueScore}`;
    } else if (blueScore > redScore) {
      winnerName = blueTeamLabel;
      winnerSubtitle = `Score final ${blueScore} : ${redScore}`;
    } else {
      winnerName = "Égalité";
      winnerSubtitle = "Les deux équipes ont le même score.";
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
    winnerPopupVisible = false;
    scrollToTop();
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
        error?.message || "Le fichier n'a pas pu être traité correctement.";
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
      const [de, fr] = line.split(";").map((s) => s.trim());
      if (de && fr) {
        return cleanQuestionText(`Traduisez en français : ${de}`);
      }
    }
    return cleanQuestionText(line);
  }

  const fallbackQuestions = [
    "Traduisez en français : Haus",
    "Traduisez en français : Schule",
    "Traduisez en français : Auto",
    "Traduisez en français : Katze",
    "Traduisez en français : Hund",
    "Traduisez en français : essen",
    "Traduisez en français : spielen",
    "Traduisez en français : schnell",
    "Traduisez en français : groß",
    "Traduisez en français : glücklich"
  ];

  function buildFrenchAiMaterial(customLines) {
    if (customLines.length > 0) {
      return `Liste de vocabulaire ou remarques fournies:\n${customLines.join(
        "\n"
      )}`;
    }
    return [
      `Produis ${numQuestions} questions courtes en français.`,
      "Mets l'accent sur le vocabulaire, les phrases simples ou la grammaire.",
      "Niveau: école primaire / collège."
    ].join("\n");
  }

  async function generateQuestionsWithAiSettings() {
    const customLines =
      useManualInput && manualLines.length > 0 ? manualLines : uploadedLines;
    const material = buildFrenchAiMaterial(customLines);
    aiLoading = true;
    aiError = "";

    try {
      const instructions = [
        "Crée des questions variées de vocabulaire ou grammaire en français et renvoie uniquement l'énoncé.",
        aiInstructions.trim()
      ]
        .filter(Boolean)
        .join(" ");
      const list = await requestAiQuestions({
        subject: "french",
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
      aiError = error.message || "Impossible de générer des questions.";
      return false;
    } finally {
      aiLoading = false;
    }
  }

  async function generateQuestionsFromPdf() {
    if (!materialText.trim()) {
      aiError = "Le PDF semble vide.";
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
      aiError = "Aucun contenu exploitable n’a été détecté.";
      return false;
    }

    aiLoading = true;
    aiError = "";

    try {
      const list = await requestAiQuestions({
        subject: "french",
        material: snippet,
        instructions:
          "Crée des questions de vocabulaire ou de compréhension en français sur la base du document fourni.",
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
      aiError = error.message || "Erreur inconnue lors de l'appel IA.";
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

  async function saveCurrentQuestions() {
    saveStatus = "";
    saveError = "";

    if (questions.length === 0) {
      saveError = "Aucune question à sauvegarder pour l’instant.";
      return;
    }

    try {
      savingSet = true;
      const set = await saveQuestionSet({
        title: saveTitle,
        subject: "french",
        questions
      });
      saveStatus = `Enregistré sous « ${set.title} »`;
      saveTitle = set.title;
    } catch (error) {
      saveError = error.message || "L’enregistrement a échoué.";
    } finally {
      savingSet = false;
    }
  }
</script>

{#if !gameStarted && !gameOver}
  <div class="page-shell">
    <section class="cta-setup" id="setup-panel" bind:this={setupSection}>
      <div class="cta-backdrop">
        <span class="cta-shape shape-x"></span>
        <span class="cta-shape shape-y"></span>
        <span class="cta-shape shape-z"></span>
      </div>
      <div class="cta-grid stacked">
        <SetupScreen
          title="Français – Jeu du tableau"
          infoText="Si les champs restent vides, les équipes s’appellent « Équipe bleue » et « Équipe rouge »."
          bind:blueTeamName
          bind:redTeamName
          bind:numQuestions
          on:back={goBack}
          on:start={generateQuestions}
        >
          <div class="extra-settings inline-settings">
            <p class="group-label">Contenu (optionnel)</p>
            <div class="file-row">
              <FileDropzone
                label="Fichier (TXT ou PDF)"
                accept=".txt,.pdf"
                on:change={handleFileUpload}
                fileName={file?.name}
                loading={aiLoading}
                description="Dépose le fichier ici ou clique pour l'importer."
              />
              {#if fileError}
                <p class="file-error">{fileError}</p>
              {/if}
              {#if aiLoading}
                <p class="file-info">🤖 La KI crée des questions …</p>
              {/if}
              {#if aiError}
                <p class="file-error">{aiError}</p>
              {/if}
            </div>

            <label class="toggle">
              <input type="checkbox" bind:checked={useManualInput} />
              Saisir les questions manuellement
            </label>

            {#if useManualInput}
              <textarea
                rows="6"
                placeholder={"Exemples:\\nHaus;maison\\nKatze;chat"}
                bind:value={manualInput}
                on:input={processManualInput}
              ></textarea>
            {/if}

            <label class="toggle">
              <input type="checkbox" bind:checked={useAiGenerator} />
              Laisser la KI créer les questions
            </label>

            {#if useAiGenerator}
              <textarea
                rows="3"
                placeholder="Consignes supplémentaires pour la KI (optionnel)"
                bind:value={aiInstructions}
              ></textarea>
            {/if}
          </div>
        </SetupScreen>

        <div class="compact-card">
          <p class="eyebrow">Prêt ?</p>
          <h3>Même cadre, contenu français</h3>
          <p class="section-lede compact-copy">
            Identique à Deutsch: équipes, matériel TXT/PDF ou saisie manuelle, plus IA au besoin.
          </p>
          <div class="cta-row tight">
            <button class="cta-button primary" type="button" on:click={() => setupSection?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
              Aller au formulaire
            </button>
            <button class="cta-button ghost" type="button" on:click={goBack}>
              Retour à l’aperçu
            </button>
          </div>
          <ul class="mini-list">
            <li>TXT/PDF ou saisie manuelle</li>
            <li>IA avec instructions optionnelles</li>
            <li>Enregistrer et réutiliser les sets</li>
          </ul>
        </div>
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
  title="Enregistrer ce set"
  description="Donnez un titre pour retrouver le set plus tard sur /sets."
  bind:saveTitle
  saving={savingSet}
  status={saveStatus}
  error={saveError}
  buttonLabel="Sauvegarder"
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

  .toggle {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 800;
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
