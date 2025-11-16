<script>
  import { goto } from '$app/navigation';

  // =========================================
  //              KONFIGURATION
  // =========================================
  let numQuestions = 10;
  let file = null;

  // Manuelle Aufgaben
  let manualInput = "";
  let useManualInput = false;
  let customTasks = [];

  // Aufgabentypen wie gewünscht
  let taskTypes = {
    syllables: false,
    capitalization: false,
    articles: false
  };

  // Listen für automatische Aufgaben
  const syllableWords = [
    "Elefant", "Auto", "Banane", "Schokolade", "Erdbeere",
    "Tomate", "Fernseher", "Krokodil", "Lokomotive"
  ];

  const capitalizationSentences = [
    "ich gehe morgen zur schule.",
    "am montag haben wir sport.",
    "wir essen heute pizza.",
    "gestern war ich bei oma.",
    "heute ist ein schöner tag."
  ];

  const articleWords = [
    "Baum", "Lampe", "Auto", "Maus", "Fenster",
    "Stuhl", "Kaffee", "Himmel", "Brot"
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
      customTasks = reader.result
        .split("\n")
        .map(l => l.trim())
        .filter(l => l.length > 2);
    };
    reader.readAsText(file);
  }

  // =========================================
  //           MANUELLE AUFGABEN
  // =========================================
  function processManualInput() {
    customTasks = manualInput
      .split("\n")
      .map(l => l.trim())
      .filter(l => l.length > 2);
  }

  // =========================================
  //          AUFGABEN GENERIEREN
  // =========================================
  function generateQuestions() {
    questions = [];

    // Priorität 1: Datei oder manuelle Eingabe
    if ((file || useManualInput) && customTasks.length > 0) {
      for (let i = 0; i < numQuestions; i++) {
        questions.push(customTasks[Math.floor(Math.random() * customTasks.length)]);
      }
    }

    // Silben bestimmen
    else if (taskTypes.syllables) {
      for (let i = 0; i < numQuestions; i++) {
        const w = syllableWords[Math.floor(Math.random() * syllableWords.length)];
        questions.push(`Bestimme die Silben: ${w}`);
      }
    }

    // Groß-Klein-Schreibung
    else if (taskTypes.capitalization) {
      for (let i = 0; i < numQuestions; i++) {
        const s = capitalizationSentences[Math.floor(Math.random() * capitalizationSentences.length)];
        questions.push(`Schreibe richtig: "${s}"`);
      }
    }

    // Artikel bestimmen
    else if (taskTypes.articles) {
      for (let i = 0; i < numQuestions; i++) {
        const w = articleWords[Math.floor(Math.random() * articleWords.length)];
        questions.push(`Welcher Artikel passt? (der/die/das) → ${w}`);
      }
    }

    // Standardgenerator
    else {
      for (let i = 0; i < numQuestions; i++) {
        questions.push(autoQuestions[Math.floor(Math.random() * autoQuestions.length)]);
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
    goto("/");
  }
</script>

<!-- ========================================= -->
<!--               UI – MENÜ                   -->
<!-- ========================================= -->

<main>
  {#if !gameStarted && !gameOver}
    <h1>Deutsch – Wandtafelspiel</h1>

    <div class="form">

      <label>Anzahl der Fragen:</label>
      <input type="number" min="1" max="50" bind:value={numQuestions} />

      <label>Aufgabentyp wählen:</label>

      <div class="ops">
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

      <hr />

      <label>Unterrichtsstoff (optional, jede Aufgabe in eigene Zeile):</label>
      <input type="file" accept=".txt" on:change={handleFileUpload} />

      {#if file}
        <p class="fileInfo">📄 Datei geladen: {file.name}</p>
      {/if}

      <label>
        <input type="checkbox" bind:checked={useManualInput} />
        Eigene Aufgaben manuell eingeben
      </label>

      {#if useManualInput}
        <textarea
          rows="6"
          placeholder="Beispiele:\nArtikel einsetzen\nPlural bilden\nSätze korrigieren…"
          bind:value={manualInput}
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

  .ops {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  .fileInfo {
    font-size: 0.9rem;
    color: #555;
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
