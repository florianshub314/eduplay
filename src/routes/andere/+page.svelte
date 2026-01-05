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
  import { pickUniqueRandomItems } from "$lib/utils/randomHelpers.js";
import FileDropzone from "$lib/components/inputs/FileDropzone.svelte";
import SaveSetPanel from "$lib/components/game/SaveSetPanel.svelte";
import WinnerPopup from "$lib/components/game/WinnerPopup.svelte";

  let setupSection;

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
    nextQuestion();
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
      winnerSubtitle = `Endstand ${redScore} : ${blueScore}`;
    } else if (blueScore > redScore) {
      winnerName = blueTeamLabel;
      winnerSubtitle = `Endstand ${blueScore} : ${redScore}`;
    } else {
      winnerName = "Unentschieden";
      winnerSubtitle = "Beide Teams teilen sich den Sieg.";
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

    if (hasCustom) {
      return pickUniqueRandomItems(customLines, numQuestions);
    }

    const list = [];
    for (let i = 0; i < numQuestions; i += 1) {
      if (trimmedTopic) {
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
    stopTimer();
    saveStatus = "";
    saveError = "";
    winnerPopupVisible = false;
    scrollToTop();
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
        <p class="eyebrow">Alles im Blick</p>
        <h2>Andere Fächer, gleicher Ablauf</h2>
        <p class="section-lede">
          Nutze den gleichen Flow wie in Deutsch und Mathe: Teams setzen, Material hinzufügen oder KI
          aktivieren, dann sofort starten.
        </p>
      </div>
      <div class="feature-grid">
        <article class="feature-card">
          <div class="feature-icon">✨</div>
          <h3>Flexibel mischen</h3>
          <p>Eigenes Thema angeben, Datei hochladen oder manuell tippen – Fragen werden passend gebaut.</p>
        </article>
        <article class="feature-card">
          <div class="feature-icon">🧭</div>
          <h3>Klarer Ablauf</h3>
          <p>Teamnamen, Fragenanzahl, Start: die Wandtafel-Logik bleibt unverändert.</p>
        </article>
        <article class="feature-card">
          <div class="feature-icon">💾</div>
          <h3>Sets sichern</h3>
          <p>Speichere gute Sets und greif später in /sets darauf zu.</p>
        </article>
      </div>
    </section>

    <section class="explanation-section">
      <div class="explanation-card">
        <div class="explanation-shape shape-one"></div>
        <div class="explanation-shape shape-two"></div>
        <p class="eyebrow">So läuft’s</p>
        <h2>Drei Schritte für jedes Fach</h2>
        <p class="section-lede">
          Thema festlegen, Fragen einspeisen und losspielen. Der Ball wandert wie gewohnt nach jeder Antwort.
        </p>
        <div class="steps">
          <div class="step">
            <span class="step-badge">1</span>
            <div>
              <p class="step-title">Teams & Thema</p>
              <p class="step-copy">
                Teams benennen, Fragenanzahl wählen, optional ein Thema eintragen.
              </p>
            </div>
          </div>
          <div class="step">
            <span class="step-badge">2</span>
            <div>
              <p class="step-title">Material oder KI</p>
              <p class="step-copy">
                TXT/PDF hochladen, manuell tippen oder KI nutzen, um Aufgaben zu erzeugen.
              </p>
            </div>
          </div>
          <div class="step">
            <span class="step-badge">3</span>
            <div>
              <p class="step-title">Spielen & sichern</p>
              <p class="step-copy">
                Spiel starten, Tore feiern und bei Bedarf das Set abspeichern.
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
          title="Individuelle Fächer – Wandtafelspiel"
          infoText="Nutze ein Thema, eigene Dateien oder KI-Fragen."
          bind:blueTeamName
          bind:redTeamName
          bind:numQuestions
          on:back={goBack}
          on:start={generateQuestions}
        >
          <div class="extra-settings inline-settings">
            <label class="topic-label">
              Thema (optional)
              <input
                type="text"
                placeholder="z. B. Energie, Geografie, Tiere ..."
                bind:value={topic}
              />
            </label>

            <div class="file-row">
              <FileDropzone
                label="Unterrichtsmaterial (TXT oder PDF)"
                accept=".txt,.pdf"
                on:change={handleFileUpload}
                fileName={file?.name}
                loading={aiLoading}
              />
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
          </div>

          <div class="settings-stack">
            <div class="extra-settings side-panel">
              <FileDropzone
                label="Unterrichtsmaterial (TXT oder PDF)"
                accept=".txt,.pdf"
                on:change={handleFileUpload}
                fileName={file?.name}
                loading={aiLoading}
              />
              {#if fileError}
                <p class="file-error">{fileError}</p>
              {/if}
              {#if aiLoading}
                <p class="file-info">🤖 KI analysiert das Material …</p>
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

              <div class="compact-card inline">
                <p class="eyebrow">Bereit?</p>
                <h3>Gleicher Rahmen für jedes Fach</h3>
                <p class="section-lede compact-copy">
                  Thema wählen, Material oder KI nutzen – alles in einem Block wie bei Deutsch.
                </p>
                <ul class="mini-list">
                  <li>Thema festhalten (optional)</li>
                  <li>TXT/PDF oder manuelle Eingabe</li>
                  <li>KI-Hinweis für maßgeschneiderte Fragen</li>
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
  description="Vergib einen Titel und sichere dieses Set für spätere Spiele."
  bind:saveTitle
  saving={savingSet}
  status={saveStatus}
  error={saveError}
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

  .topic-label {
    display: flex;
    flex-direction: column;
    gap: 8px;
    font-weight: 800;
    color: var(--ink);
  }

  .topic-label input {
    border-radius: 16px;
    border: 3px solid var(--ink);
    padding: 12px 16px;
    font-size: 1rem;
    box-shadow: 8px 8px 0 rgba(31, 26, 45, 0.1);
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
    color: var(--ink);
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

  .instructions-label {
    display: flex;
    flex-direction: column;
    gap: 8px;
    font-weight: 800;
    color: var(--ink);
  }

  .ai-row {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .settings-stack {
    display: flex;
    flex-direction: column;
    gap: 14px;
    width: 100%;
  }

  .btn-ai {
    border-radius: 999px;
    border: 3px solid var(--ink);
    background: linear-gradient(120deg, var(--accent-violet), var(--accent-pink));
    color: var(--ink);
    padding: 12px 24px;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 10px 10px 0 rgba(31, 26, 45, 0.16);
  }

  .btn-ai:disabled {
    opacity: 0.7;
    cursor: progress;
  }

  .ai-error {
    margin: 0;
    color: #dc2626;
    font-weight: 800;
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
