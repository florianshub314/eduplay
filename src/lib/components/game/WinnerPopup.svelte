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
    background: rgba(15, 23, 42, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 600;
    padding: 20px;
  }

  .podium-card {
    background: white;
    border-radius: 28px;
    padding: 30px;
    max-width: 460px;
    width: 100%;
    text-align: center;
    box-shadow: 0 25px 60px rgba(15, 23, 42, 0.2);
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .eyebrow {
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 0.25em;
    font-size: 0.65rem;
    color: #a5b4fc;
  }

  h3 {
    margin: 0;
    font-size: 2rem;
  }

  .subtitle {
    margin: 0;
    color: #475569;
  }

  .podium {
    display: flex;
    justify-content: center;
  }

  .pillar {
    width: 140px;
    height: 160px;
    border-radius: 30px 30px 12px 12px;
    background: linear-gradient(180deg, #fde68a, #fbbf24);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: #78350f;
    box-shadow: inset 0 -6px 0 rgba(0, 0, 0, 0.1);
  }

  .place {
    font-size: 3rem;
    font-weight: 700;
    line-height: 1;
  }

  .name {
    font-weight: 600;
  }

  .btn {
    align-self: center;
    border-radius: 999px;
    border: none;
    padding: 10px 24px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    color: white;
    font-weight: 600;
    cursor: pointer;
    margin-top: 6px;
  }
</style>
