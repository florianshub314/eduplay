<script>
  import { createEventDispatcher } from "svelte";

  export let visible = false;
  export let questions = [];
  export let title = "Die KI hat neue Fragen erstellt!";

  const dispatch = createEventDispatcher();

  function close() {
    dispatch("close");
  }
</script>

{#if visible}
  <div class="ai-modal" role="dialog" aria-live="polite">
    <div class="modal-card">
      <div class="robot">
        <span class="head" aria-hidden="true">🤖</span>
        <p>{title}</p>
      </div>
      <p class="hint">Vorschau (erste {Math.min(questions.length, 6)} Fragen):</p>
      <ol>
        {#each questions.slice(0, 6) as item, index}
          <li>{item.question || item}</li>
        {/each}
      </ol>
      <button class="btn-primary" type="button" on:click={close}>
        Los geht's
      </button>
    </div>
  </div>
{/if}

<style>
  .ai-modal {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.55);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 500;
    padding: 20px;
  }

  .modal-card {
    background: #ffffff;
    border-radius: 32px;
    padding: 28px;
    max-width: 520px;
    width: 100%;
    box-shadow: 0 30px 60px rgba(15, 23, 42, 0.25);
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .robot {
    display: flex;
    align-items: center;
    gap: 12px;
    font-weight: 600;
    color: #4338ca;
  }

  .head {
    display: inline-flex;
    font-size: 2rem;
    animation: spin 2.5s linear infinite;
  }

  .hint {
    margin: 0;
    color: #475569;
    font-size: 0.95rem;
  }

  ol {
    margin: 0;
    padding-left: 1.2rem;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .btn-primary {
    align-self: flex-start;
    border-radius: 999px;
    border: none;
    padding: 12px 24px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    color: white;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 20px 40px rgba(99, 102, 241, 0.35);
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
</style>
