<script>
  import { createEventDispatcher } from "svelte";

  export let blueTeamLabel = "Team Blau";
  export let redTeamLabel = "Team Rot";
  export let blueScore = 0;
  export let redScore = 0;

  const dispatch = createEventDispatcher();

  $: winner =
    blueScore > redScore
      ? blueTeamLabel
      : redScore > blueScore
        ? redTeamLabel
        : null;

  function handle(action) {
    dispatch(action);
  }
</script>

<main class="end">
  <h1>Spiel beendet</h1>

  <p>
    Ergebnis:
    <strong>{blueTeamLabel} {blueScore} : {redScore} {redTeamLabel}</strong>
  </p>

  {#if winner}
    <p>Gewinner: {winner}</p>
  {:else}
    <p>Unentschieden</p>
  {/if}

  <button class="btn-primary" type="button" on:click={() => handle("restart")}>
    Neues Spiel starten
  </button>
  <button class="btn-secondary" type="button" on:click={() => handle("back")}>
    Zur Startseite
  </button>
</main>

<style>
  .end {
    max-width: 600px;
    margin: 60px auto;
    text-align: center;
    font-family:
      system-ui,
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      sans-serif;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .btn-primary,
  .btn-secondary {
    padding: 12px 20px;
    border-radius: 999px;
    border: none;
    font-weight: 600;
    cursor: pointer;
  }

  .btn-primary {
    background: #2563eb;
    color: white;
  }

  .btn-secondary {
    background: #cbd5f5;
    color: #0f172a;
  }
</style>
