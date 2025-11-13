<script>
  import { goto } from '$app/navigation';

  let numQuestions = 10;
  let questions = [];
  let gameStarted = false;
  let currentQuestionIndex = 0;

  let ballPosition = 0;
  let redScore = 0;
  let blueScore = 0;

  let showTimer = false;
  let timer = 10;
  let timerInterval;

  const vocab = [
    ['house', 'Haus'],
    ['dog', 'Hund'],
    ['tree', 'Baum'],
    ['apple', 'Apfel'],
    ['book', 'Buch'],
    ['car', 'Auto'],
    ['sun', 'Sonne'],
    ['school', 'Schule'],
    ['water', 'Wasser'],
    ['table', 'Tisch']
  ];

  function generateQuestions() {
    questions = [];
    for (let i = 0; i < numQuestions; i++) {
      const [en, de] = vocab[Math.floor(Math.random() * vocab.length)];
      questions.push(`${en} → ${de}?`);
    }
    gameStarted = true;
  }

  function nextQuestion() {
    currentQuestionIndex = (currentQuestionIndex + 1) % questions.length;
    stopTimer();
  }

  function moveBall(direction) {
    if (direction === 'red') {
      ballPosition++;
      if (ballPosition >= 4) {
        redScore++;
        alert('⚽️ TOR für Team Rot!');
        resetField();
      }
    } else if (direction === 'blue') {
      ballPosition--;
      if (ballPosition <= -4) {
        blueScore++;
        alert('⚽️ TOR für Team Blau!');
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

  function resetField() {
    ballPosition = 0;
    stopTimer();
    nextQuestion();
  }

  function goBack() {
    goto('/');
  }
</script>

<main>
  {#if !gameStarted}
    <h1>Englisch – Wandtafelspiel</h1>
    <p>Wähle die Anzahl der Fragen:</p>
    <input type="number" bind:value={numQuestions} min="1" max="50" />
    <button on:click={generateQuestions}>Spiel starten</button>
    <button class="back" on:click={goBack}>⬅️ Zurück</button>
  {:else}
    <h2>Frage {currentQuestionIndex + 1}:</h2>
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
      <button class="redBtn" on:click={() => moveBall('red')}>🔴 Team Rot</button>
      <button class="blueBtn" on:click={() => moveBall('blue')}>🔵 Team Blau</button>
      <button class="wrongBtn" on:click={wrongAnswer}>❌ Falsch</button>
      <button class="skipBtn" on:click={nextQuestion}>⏭ Skip</button>
    </div>
  {/if}
</main>

<style>
  /* identisches Styling wie Mathe */
</style>
