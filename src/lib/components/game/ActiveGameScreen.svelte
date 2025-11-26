<script>
  import { createEventDispatcher } from "svelte";
  import SoccerField from "./SoccerField.svelte";

  export let blueTeamLabel = "Team Blau";
  export let redTeamLabel = "Team Rot";
  export let blueScore = 0;
  export let redScore = 0;
  export let currentQuestionIndex = 0;
  export let questions = [];
  export let ballPosition = 0;
  export let maxBallPosition = 4;
  export let showTimer = false;
  export let timer = 10;
  export let wrongLabel = "Falsch";
  export let skipLabel = "Überspringen";
  export let endLabel = "Spiel beenden";

  const dispatch = createEventDispatcher();

  const hasQuestions = questions.length > 0;
  $: currentQuestion =
    hasQuestions && questions[currentQuestionIndex]
      ? questions[currentQuestionIndex]
      : { question: "" };

  function score(team) {
    dispatch("score", { team });
  }

  function trigger(action) {
    dispatch(action);
  }
</script>

<main class="game">
  <div class="scoreboard">
    <button
      type="button"
      class="score-card blue-card"
      on:click={() => score("blue")}
    >
      <span class="score-team">{blueTeamLabel}</span>
      <span class="score-value">{blueScore}</span>
    </button>

    <button
      type="button"
      class="score-card red-card"
      on:click={() => score("red")}
    >
      <span class="score-team">{redTeamLabel}</span>
      <span class="score-value">{redScore}</span>
    </button>
  </div>

  <h2>Frage {currentQuestionIndex + 1} von {questions.length}</h2>
  <div class="question">{currentQuestion.question}</div>

  <div class="field-wrapper">
    <SoccerField position={ballPosition} maxPosition={maxBallPosition} />
  </div>

  {#if showTimer}
    <div class="timer">⏱ {timer}s</div>
  {/if}

  <div class="buttons">
    <button class="btn-neutral" type="button" on:click={() => trigger("wrong")}>
      {wrongLabel}
    </button>
    <button class="btn-neutral" type="button" on:click={() => trigger("skip")}>
      {skipLabel}
    </button>
    <button class="btn-neutral" type="button" on:click={() => trigger("end")}>
      {endLabel}
    </button>
  </div>
</main>

<style>
  .game {
    max-width: 1100px;
    margin: 40px auto;
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
    font-family:
      system-ui,
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      sans-serif;
  }

  .scoreboard {
    display: flex;
    gap: 20px;
    justify-content: space-between;
    width: 100%;
  }

  .score-card {
    flex: 1;
    border: none;
    border-radius: 24px;
    padding: 22px 28px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    text-align: left;
    cursor: pointer;
    color: white;
    font-weight: 600;
    box-shadow: 0 18px 40px rgba(15, 23, 42, 0.2);
    transition: transform 0.15s ease, box-shadow 0.15s ease;
  }

  .score-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 22px 45px rgba(15, 23, 42, 0.25);
  }

  .score-card:active {
    transform: scale(0.98);
  }

  .score-card.blue-card {
    background: linear-gradient(135deg, #60a5fa, #2563eb);
  }

  .score-card.red-card {
    background: linear-gradient(135deg, #f87171, #dc2626);
  }

  .score-team {
    font-size: 1.1rem;
  }

  .score-value {
    font-size: 3rem;
    font-weight: 700;
    line-height: 1;
  }

  .question {
    font-size: 2rem;
    font-weight: 600;
    margin-bottom: 10px;
  }

  .field-wrapper {
    display: flex;
    justify-content: center;
    margin: 10px 0 10px;
  }

  .timer {
    font-size: 1.1rem;
  }

  .buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    justify-content: center;
  }

  .btn-neutral {
    border-radius: 999px;
    border: 2px solid #cbd5f5;
    padding: 12px 24px;
    background: white;
    cursor: pointer;
    font-weight: 600;
    color: #0f172a;
  }

  @media (max-width: 700px) {
    .scoreboard {
      flex-direction: column;
    }
  }
</style>
