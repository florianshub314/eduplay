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
    font-family: "Baloo 2", "Fredoka", "Nunito", system-ui, -apple-system, BlinkMacSystemFont,
      "Segoe UI", sans-serif;
    display: flex;
    flex-direction: column;
    gap: 18px;
    padding: 28px 22px 36px;
    background: linear-gradient(135deg, #fef3c7, #dbeafe 55%, #ecfdf3);
    border: 4px solid #0f172a;
    border-radius: 32px;
    box-shadow: 14px 14px 0 rgba(15, 23, 42, 0.18);
  }

  .btn-primary,
  .btn-secondary {
    padding: 14px 22px;
    border-radius: 18px;
    border: 3px solid #0f172a;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 10px 10px 0 rgba(15, 23, 42, 0.14);
  }

  .btn-primary {
    background: linear-gradient(135deg, #22c55e, #38bdf8);
    color: #0f172a;
  }

  .btn-secondary {
    background: #fef08a;
    color: #0f172a;
  }
</style>
