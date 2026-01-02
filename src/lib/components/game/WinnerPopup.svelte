<script>
  import { createEventDispatcher } from "svelte";

  export let visible = false;
  export let winner = "";
  export let subtitle = "";

  const dispatch = createEventDispatcher();

  function close() {
    dispatch("close");
  }
</script>

{#if visible}
  <div class="winner-overlay" role="dialog" aria-live="assertive">
    <div class="podium-card">
      <p class="eyebrow">Spiel beendet</p>
      <h3>{winner || "Unentschieden"}</h3>
      <p class="subtitle">{subtitle}</p>
      <div class="podium">
        <div class="pillar">
          <span class="place">1</span>
          <span class="name">{winner || "—"}</span>
        </div>
      </div>
      <button class="btn" type="button" on:click={close}>
        Schließen
      </button>
    </div>
  </div>
{/if}

<style>
  .winner-overlay {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.48);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 600;
    padding: 20px;
  }

  .podium-card {
    background: linear-gradient(135deg, #ffffff, #e0f2fe 55%, #fef3c7);
    border-radius: 28px;
    padding: 32px;
    max-width: 460px;
    width: 100%;
    text-align: center;
    box-shadow: 16px 16px 0 rgba(15, 23, 42, 0.26);
    display: flex;
    flex-direction: column;
    gap: 14px;
    border: 4px solid #0f172a;
  }

  .eyebrow {
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 0.25em;
    font-size: 0.65rem;
    color: #0f172a;
  }

  h3 {
    margin: 0;
    font-size: 2.2rem;
    letter-spacing: -0.01em;
    color: #0f172a;
  }

  .subtitle {
    margin: 0;
    color: #0f172a;
    opacity: 0.7;
  }

  .podium {
    display: flex;
    justify-content: center;
  }

  .pillar {
    width: 160px;
    height: 170px;
    border-radius: 30px 30px 18px 18px;
    background: linear-gradient(180deg, #fef08a, #fb923c);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: #0f172a;
    box-shadow: 10px 10px 0 rgba(15, 23, 42, 0.12), inset 0 -8px 0 rgba(0, 0, 0, 0.1);
    border: 4px solid #0f172a;
  }

  .place {
    font-size: 3.4rem;
    font-weight: 900;
    line-height: 1;
  }

  .name {
    font-weight: 800;
  }

  .btn {
    align-self: center;
    border-radius: 18px;
    border: 3px solid #0f172a;
    padding: 12px 26px;
    background: linear-gradient(135deg, #22c55e, #38bdf8);
    color: #0f172a;
    font-weight: 800;
    cursor: pointer;
    margin-top: 10px;
    box-shadow: 10px 10px 0 rgba(15, 23, 42, 0.16);
  }
</style>
