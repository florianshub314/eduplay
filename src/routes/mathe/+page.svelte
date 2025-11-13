<script>
    import { goto } from "$app/navigation";

    // === Konfiguration ===
    let numQuestions = 10;
    let file = null;
    let minNumber = 1;
    let maxNumber = 10;
    let useDecimals = false;
    let allowNegatives = false;
    let selectedOps = new Set(["+"]);

    const operations = [
        { symbol: "+", name: "Addition" },
        { symbol: "-", name: "Subtraktion" },
        { symbol: "*", name: "Multiplikation" },
        { symbol: "/", name: "Division" },
    ];

    // === Spielzustand ===
    let questions = [];
    let gameStarted = false;
    let gameOver = false;
    let currentQuestionIndex = 0;
    let ballPosition = 0;
    let redScore = 0;
    let blueScore = 0;

    // === Timer ===
    let showTimer = false;
    let timer = 10;
    let timerInterval;

    // === Popup ===
    let popupMessage = "";
    let showPopup = false;

    // === Hilfsfunktionen ===
    function showMessage(msg) {
        popupMessage = msg;
        showPopup = true;
        setTimeout(() => (showPopup = false), 2500);
    }

    function handleFileUpload(event) {
        file = event.target.files[0];
    }

    function toggleOperation(op) {
        if (selectedOps.has(op)) selectedOps.delete(op);
        else selectedOps.add(op);
    }

    // === Zufallszahl (mit oder ohne Dezimalstellen) ===
    function randomNum(min, max) {
        const value = Math.random() * (max - min) + min;
        return useDecimals ? parseFloat(value.toFixed(1)) : Math.floor(value);
    }

    // === Fragen generieren ===
    function generateQuestions() {
        questions = [];

        if (file) {
            // Placeholder: KI / Datei-Upload könnte später integriert werden
            for (let i = 0; i < numQuestions; i++) {
                const a = Math.floor(Math.random() * 10) + 1;
                const b = Math.floor(Math.random() * 10) + 1;
                questions.push(`${a} + ${b}`);
            }
        } else {
            for (let i = 0; i < numQuestions; i++) {
                let a = randomNum(minNumber, maxNumber);
                let b = randomNum(minNumber, maxNumber);
                const ops = Array.from(selectedOps);
                const op = ops[Math.floor(Math.random() * ops.length)];

                // Wenn negative Ergebnisse nicht erlaubt sind:
                if (!allowNegatives && op === "-" && a < b) {
                    [a, b] = [b, a];
                }

                questions.push(`${a} ${op} ${b}`);
            }
        }

        gameStarted = true;
        gameOver = false;
        currentQuestionIndex = 0;
    }

    // === Ballbewegung ===
    function moveBall(team) {
        if (team === "red") {
            ballPosition--;
            if (ballPosition <= -4) {
                redScore++;
                showMessage("⚽️ TOR für Team Rot!");
                resetField();
            }
        } else if (team === "blue") {
            ballPosition++;
            if (ballPosition >= 4) {
                blueScore++;
                showMessage("⚽️ TOR für Team Blau!");
                resetField();
            }
        }
        nextQuestion();
    }

    // === Timer bei falscher Antwort ===
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

    // === Nächste Frage ===
    function nextQuestion() {
        stopTimer();

        if (currentQuestionIndex < questions.length - 1) {
            currentQuestionIndex++;
        } else {
            endGame();
        }
    }

    // === Spielfeld zurücksetzen ===
    function resetField() {
        ballPosition = 0;
        stopTimer();
    }

    // === Spielende ===
    function endGame() {
        gameStarted = false;
        gameOver = true;

        if (redScore > blueScore) showMessage("🏆 Team Rot gewinnt!");
        else if (blueScore > redScore) showMessage("🏆 Team Blau gewinnt!");
        else showMessage("🤝 Unentschieden!");
    }

    function goBack() {
        goto("/");
    }
</script>

<main>
    <!-- === Startansicht === -->
    {#if !gameStarted && !gameOver}
        <h1>Mathematik – Wandtafelspiel</h1>

        <div class="form">
            <label for="fragen">Anzahl der Fragen:</label>
            <input
                id="fragen"
                type="number"
                bind:value={numQuestions}
                min="1"
                max="50"
            />
            <label for="upload">Unterrichtsstoff (optional):</label>
            <input
                id="upload"
                type="file"
                accept=".pdf,.txt"
                on:change={handleFileUpload}
            />

            {#if file}
                <p class="fileInfo">📎 Datei: {file.name}</p>
            {:else}
                <hr />
                <p><strong>Oder eigenes Aufgaben-Setup:</strong></p>

                <div class="range">
                    <label for="min">Zahlenraum:</label>
                    <input
                        id="min"
                        type="number"
                        bind:value={minNumber}
                        min="0"
                    />
                    –
                    <input
                        id="max"
                        type="number"
                        bind:value={maxNumber}
                        min="1"
                    />
                </div>

                <label for="ops">Rechenarten:</label>
                <div id="ops" class="ops">
                    {#each operations as { symbol, name }}
                        <label>
                            <input
                                type="checkbox"
                                checked={selectedOps.has(symbol)}
                                on:change={() => toggleOperation(symbol)}
                            />
                            {name}
                        </label>
                    {/each}
                </div>

                <label>
                    <input type="checkbox" bind:checked={useDecimals} />
                    Dezimalzahlen erlauben
                </label>

                <label>
                    <input type="checkbox" bind:checked={allowNegatives} />
                    Negative Ergebnisse erlauben
                </label>
            {/if}

            <button on:click={generateQuestions}>Spiel starten</button>
        </div>

        <button class="back" on:click={goBack}>⬅️ Zurück</button>

        <!-- === Spielfeld === -->
    {:else if gameStarted}
        <h2>Frage {currentQuestionIndex + 1} von {questions.length}</h2>
        <h1>{questions[currentQuestionIndex]}</h1>

        <div class="field">
            <div class="goal blue">Tor Blau</div>
            <div class="bar">
                <div
                    class="ball"
                    style="left: calc(50% + {ballPosition * 60}px)"
                ></div>
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
            <button class="redBtn" on:click={() => moveBall("red")}
                >🔴 Team Rot</button
            >
            <button class="blueBtn" on:click={() => moveBall("blue")}
                >🔵 Team Blau</button
            >
            <button class="wrongBtn" on:click={wrongAnswer}>❌ Falsch</button>
            <button class="skipBtn" on:click={nextQuestion}>⏭ Skip</button>
        </div>

        <!-- === Spielende === -->
    {:else if gameOver}
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
        <button class="back" on:click={goBack}>⬅️ Zurück zur Startseite</button>
    {/if}

    {#if showPopup}
        <div class="popup">{popupMessage}</div>
    {/if}
</main>

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
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        text-align: left;
    }

    .range input {
        width: 80px;
    }
    .ops {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem 1rem;
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
    .goal.red {
        color: #dc2626;
    }
    .goal.blue {
        color: #2563eb;
    }

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

    .red {
        color: #dc2626;
    }
    .blue {
        color: #2563eb;
    }

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

    .redBtn {
        background: #dc2626;
    }
    .blueBtn {
        background: #2563eb;
    }
    .wrongBtn {
        background: #f59e0b;
        color: black;
    }
    .skipBtn {
        background: #6b7280;
    }

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
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        animation:
            fadein 0.3s,
            fadeout 0.5s 2s;
    }

    @keyframes fadein {
        from {
            opacity: 0;
            transform: translate(-50%, -60%);
        }
        to {
            opacity: 1;
            transform: translate(-50%, -50%);
        }
    }

    @keyframes fadeout {
        to {
            opacity: 0;
            transform: translate(-50%, -45%);
        }
    }
</style>
