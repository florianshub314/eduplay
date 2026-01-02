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
    margin: 32px auto 64px;
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 18px;
    align-items: stretch;
    padding: 24px 18px 36px;
    font-family: "Baloo 2", "Fredoka", "Nunito", system-ui, -apple-system, BlinkMacSystemFont,
      "Segoe UI", sans-serif;
    background: linear-gradient(135deg, #fef3c7 0%, #dbeafe 45%, #ecfdf3 100%);
    border: 4px solid #0f172a;
    border-radius: 32px;
    box-shadow: 16px 16px 0 rgba(15, 23, 42, 0.16);
  }

  .scoreboard {
    display: flex;
    gap: 20px;
    justify-content: space-between;
    width: 100%;
  }

  .score-card {
    flex: 1;
    border: 3px solid #0f172a;
    border-radius: 26px;
    padding: 24px 28px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    text-align: left;
    cursor: pointer;
    color: white;
    font-weight: 800;
    box-shadow: 12px 12px 0 rgba(15, 23, 42, 0.18);
    transition: transform 0.12s ease, box-shadow 0.12s ease;
  }

  .score-card:hover {
    transform: translateY(-2px);
    box-shadow: 10px 14px 0 rgba(15, 23, 42, 0.22);
  }

  .score-card:active {
    transform: translateY(2px);
  }

  .score-card.blue-card {
    background: linear-gradient(135deg, #38bdf8, #2563eb);
  }

  .score-card.red-card {
    background: linear-gradient(135deg, #fb7185, #f97316);
  }

  .score-team {
    font-size: 1.15rem;
  }

  .score-value {
    font-size: 3.4rem;
    font-weight: 900;
    line-height: 1;
  }

  h2 {
    margin: 0;
    color: #0f172a;
    font-size: 1.35rem;
    letter-spacing: 0.03em;
    text-transform: uppercase;
  }

  .question {
    font-size: 2.1rem;
    font-weight: 800;
    margin-bottom: 8px;
    background: #fff;
    border: 4px solid #0f172a;
    border-radius: 24px;
    padding: 26px 22px;
    min-height: 140px;
    display: grid;
    place-items: center;
    box-shadow: 16px 16px 0 rgba(15, 23, 42, 0.16);
    letter-spacing: -0.01em;
  }

  .field-wrapper {
    display: flex;
    justify-content: center;
    margin: 10px 0 6px;
  }

  .timer {
    font-size: 1.15rem;
    background: #0f172a;
    color: #fef3c7;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 10px 16px;
    border-radius: 18px;
    border: 3px solid #0f172a;
    box-shadow: 8px 8px 0 rgba(15, 23, 42, 0.16);
    width: fit-content;
    margin: 0 auto;
  }

  .buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    justify-content: center;
    margin-top: 4px;
  }

  .btn-neutral {
    border-radius: 18px;
    border: 3px solid #0f172a;
    padding: 14px 26px;
    background: #fff;
    cursor: pointer;
    font-weight: 800;
    color: #0f172a;
    box-shadow: 10px 10px 0 rgba(15, 23, 42, 0.14);
    transition: transform 0.12s ease, box-shadow 0.12s ease, background 0.12s ease;
  }

  .btn-neutral:hover {
    transform: translateY(-1px);
    background: #fef08a;
  }

  .btn-neutral:active {
    transform: translateY(1px);
  }

  @media (max-width: 700px) {
    .scoreboard {
      flex-direction: column;
    }
  }
</style>
