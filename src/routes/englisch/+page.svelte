<script>
  import { goto } from '$app/navigation';

  // =========================================
  //              KONFIGURATION
  // =========================================
  let numQuestions = 10;
  let file = null;

  // Vokabel-Liste
  let vocabList = [];
  let manualVocabInput = "";
  let useManualVocab = false;

  // =========================================
  //              SPIEL-STATUS
  // =========================================
  let questions = [];
  let gameStarted = false;
  let gameOver = false;
  let currentQuestionIndex = 0;

  let ballPosition = 0;
  let redScore = 0;
  let blueScore = 0;

  // TIMER
  let showTimer = false;
  let timer = 10;
  let timerInterval;

  // POPUP
  let popupMessage = "";
  let showPopup = false;

  function showMessage(msg) {
    popupMessage = msg;
    showPopup = true;
    setTimeout(() => (showPopup = false), 2200);
  }

  // =========================================
  //              DATEI-UPLOAD
  // =========================================
  function handleFileUpload(event) {
    file = event.target.files[0];

    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const content = reader.result;
      vocabList = content
        .split("\n")
        .map(line => line.trim())
        .filter(line => line.includes(";"))
        .map(line => {
          const [de, en] = line.split(";").map(s => s.trim());
          return { de, en };
        });
    };
    reader.readAsText(file);
  }

  // =========================================
  //           MANUELLE VOKABELN
  // =========================================
  function processManualInput() {
    vocabList = manualVocabInput
      .split("\n")
      .map(l => l.trim())
      .filter(l => l.includes(";"))
      .map(l => {
        const [de, en] = l.split(";").map(x => x.trim());
        return { de, en };
      });
  }

  // =========================================
  //         AUFGABEN GENERIEREN
  // =========================================
  function generateQuestions() {
    questions = [];

    if (file && vocabList.length > 0) {
      // Vokabeln aus Datei
      for (let i = 0; i < numQuestions; i++) {
        const entry = vocabList[Math.floor(Math.random() * vocabList.length)];
        questions.push(`${entry.de} → ?`);
      }
    }

    else if (useManualVocab && vocabList.length > 0) {
      // Vokabeln aus Textfeld
      for (let i = 0; i < numQuestions; i++) {
        const entry = vocabList[Math.floor(Math.random() * vocabList.length)];
        questions.push(`${entry.de} → ?`);
      }
    }

    else {
      // Fallback – einfache Englischfragen
      const fallback = [
        "house → ?",
        "eat → ?",
        "go → ?",
        "car → ?",
        "sun → ?",
        "cat → ?",
        "dog → ?",
        "red → ?",
        "apple → ?",
        "school → ?"
      ];
      for (let i = 0; i < numQuestions; i++) {
        questions.push(fallback[Math.floor(Math.random() * fallback.length)]);
      }
    }

    gameStarted = true;
    gameOver = false;
    currentQuestionIndex = 0;
  }

  // =========================================
  //               SPIELLOGIK
  // =========================================
  function moveBall(team) {
    if (team === "red") {
      ballPosition--;
      if (ballPosition <= -4) {
        redScore++;
        showMessage("⚽️ TOR für Team Rot!");
        resetField();
      }
    } else {
      ballPosition++;
      if (ballPosition >= 4) {
        blueScore++;
        showMessage("⚽️ TOR für Team Blau!");
        resetField();
      }
    }
    nextQuestion();
  }

  function wrongAnswer() {
    showTimer = true;
    timer = 10;

    timerInterval = setInterval(() => {
      timer--;
      if (timer <= 0) stopTimer();
    }, 1000);
  }

  function stopTimer() {
    clearInterval(timerInterval);
    showTimer = false;
  }

  function nextQuestion() {
    stopTimer();
    if (currentQuestionIndex < questions.length - 1) {
      currentQuestionIndex++;
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
  }

  function forceEndGame() {
    gameStarted = false;
    gameOver = true;
    showMessage("🛑 Spiel wurde manuell beendet!");
  }

  function goBack() {
    goto('/');
  }
</script>

<!-- ========================================= -->
<!--               STARTANSICHT                -->
<!-- ========================================= -->

<main>
  {#if !gameStarted && !gameOver}
    <h1>Englisch – Wandtafelspiel</h1>

    <div class="form">

      <label>Anzahl der Fragen:</label>
      <input type="number" min="1" max="50" bind:value={numQuestions} />

      <label>Unterrichtsstoff (optional, Format: Deutsch;Englisch pro Zeile):</label>
      <input type="file" accept=".txt" on:change={handleFileUpload} />

      {#if file}
        <p class="fileInfo">📄 Datei geladen: {file.name}</p>
      {/if}

      <hr />

      <label>
        <input type="checkbox" bind:checked={useManualVocab} />
        Vokabeln manuell eingeben
      </label>

      {#if useManualVocab}
        <textarea
          rows="6"
          placeholder="Format:\nHaus;house\nAuto;car\nBaum;tree"
          bind:value={manualVocabInput}
          on:input={processManualInput}
        ></textarea>
      {/if}

      <button on:click={generateQuestions}>Spiel starten</button>
    </div>

    <button class="back" on:click={goBack}>⬅️ Zurück</button>

  {:else if gameStarted}

    <h2>Frage {currentQuestionIndex + 1} von {questions.length}</h2>
    <h1>{questions[currentQuestionIndex]}</h1>

    <div class="field">
      <div class="goal blue">Tor Blau</div>
      <div class="bar">
        <div class="ball" style="left: calc(50% + {ballPosition * 60}px)"></div>
      </div>
      <div class="goal red">Tor Rot</div>
    </div>

    <div class="scores">
      <span class="blue">🔵 {blueScore}</span>
      <span class="red">{redScore} 🔴</span>
    </div>

    {#if showTimer}
      <div class="timer">⏱ {timer}s</div>
    {/if}

    <div class="buttons">
      <button class="redBtn" on:click={() => moveBall('red')}>🔴 Team Rot</button>
      <button class="blueBtn" on:click={() => moveBall('blue')}>🔵 Team Blau</button>
      <button class="wrongBtn" on:click={wrongAnswer}>❌ Falsch</button>
      <button class="skipBtn" on:click={nextQuestion}>⏭ Skip</button>

      <button class="endBtn" on:click={forceEndGame}>🛑 Spiel beenden</button>
    </div>

  {:else}

    <h1>Spiel beendet</h1>

    {#if redScore > blueScore}
      <h2>🏆 Team Rot gewinnt!</h2>
    {:else if blueScore > redScore}
      <h2>🏆 Team Blau gewinnt!</h2>
    {:else}
      <h2>🤝 Unentschieden!</h2>
    {/if}

    <div class="scores">
      <span class="blue">🔵 {blueScore}</span>
      <span class="red">{redScore} 🔴</span>
    </div>

    <button on:click={generateQuestions}>🔁 Neues Spiel starten</button>
    <button class="back" on:click={goBack}>⬅️ Zurück</button>

  {/if}

  {#if showPopup}
    <div class="popup">{popupMessage}</div>
  {/if}
</main>

<!-- ========================================= -->
<!--                  STYLES                   -->
<!-- ========================================= -->

<style>
  main {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background: #f9fafb;
    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
  }

  .form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    background: white;
    padding: 2rem;
    border-radius: 16px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    text-align: left;
    width: 360px;
  }

  textarea {
    width: 100%;
    padding: 1rem;
    border-radius: 8px;
    border: 1px solid #cbd5e1;
    resize: vertical;
    font-size: 1rem;
  }

  .fileInfo {
    font-size: 0.9rem;
    color: #555;
  }

  .range input {
    width: 80px;
  }

  .field {
    position: relative;
    width: 480px;
    height: 120px;
    margin: 2rem 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .goal {
    width: 80px;
    text-align: center;
    font-weight: bold;
  }

  .goal.red { color: #dc2626; }
  .goal.blue { color: #2563eb; }

  .bar {
    position: relative;
    flex: 1;
    height: 8px;
    background: #d1d5db;
    border-radius: 4px;
  }

  .ball {
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: radial-gradient(circle at 30% 30%, white 40%, black 42%);
    border: 2px solid #222;
    transition: left 0.3s ease-in-out;
  }

  .scores {
    display: flex;
    justify-content: space-between;
    width: 300px;
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }

  .red { color: #dc2626; }
  .blue { color: #2563eb; }

  .buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    justify-content: center;
  }

  .buttons button {
    padding: 12px 20px;
    border: none;
    border-radius: 10px;
    font-size: 1rem;
    cursor: pointer;
    color: white;
  }

  .redBtn { background: #dc2626; }
  .blueBtn { background: #2563eb; }
  .wrongBtn { background: #f59e0b; color: black; }
  .skipBtn { background: #6b7280; }
  .endBtn { background: #0f172a; }

  .timer {
    font-size: 1.5rem;
    color: #f59e0b;
    font-weight: bold;
    margin-bottom: 1rem;
  }

  .back {
    margin-top: 2rem;
    background: #e5e7eb;
    color: #111;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    cursor: pointer;
  }

  .popup {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    color: #111;
    font-size: 1.8rem;
    font-weight: bold;
    padding: 1rem 2rem;
    border-radius: 16px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    z-index: 1000;
    animation: fadein 0.3s, fadeout 0.5s 2s;
  }

  @keyframes fadein {
    from { opacity: 0; transform: translate(-50%, -60%); }
    to { opacity: 1; transform: translate(-50%, -50%); }
  }

  @keyframes fadeout {
    to { opacity: 0; transform: translate(-50%, -45%); }
  }
</style>
