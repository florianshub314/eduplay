<script>
  import { createEventDispatcher } from "svelte";

  export let visible = false;
  export let title = "Fragen-Set speichern";
  export let description = "";
  export let saveTitle = "";
  export let placeholder = "Titel des Sets";
  export let saving = false;
  export let status = "";
  export let error = "";
  export let buttonLabel = "Set speichern";

  const dispatch = createEventDispatcher();

  function handleSave() {
    dispatch("save");
  }
</script>

{#if visible}
  <section class="save-panel">
    <div>
      <p class="eyebrow">Set speichern</p>
      <h3>{title}</h3>
      {#if description}
        <p class="subtitle">{description}</p>
      {/if}
    </div>
    <div class="save-actions">
      <input
        type="text"
        placeholder={placeholder}
        bind:value={saveTitle}
        aria-label={placeholder}
      />
      <button
        class="btn-primary"
        type="button"
        on:click={handleSave}
        disabled={saving}
      >
        {saving ? "Speichere …" : buttonLabel}
      </button>
    </div>
    {#if status}
      <p class="status success">{status}</p>
    {/if}
    {#if error}
      <p class="status error">{error}</p>
    {/if}
  </section>
{/if}

<style>
  .save-panel {
    max-width: 960px;
    margin: 24px auto 80px;
    padding: 28px;
    border-radius: 32px;
    border: 2px solid #e0e7ff;
    background: white;
    box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
    display: flex;
    flex-direction: column;
    gap: 16px;
    font-family: inherit;
  }

  .eyebrow {
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    font-size: 0.65rem;
    color: #a5b4fc;
  }

  h3 {
    margin: 4px 0;
    font-size: 1.6rem;
  }

  .subtitle {
    margin: 0;
    color: #475569;
    font-size: 0.95rem;
  }

  .save-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }

  input {
    flex: 1;
    min-width: 220px;
    border-radius: 16px;
    border: 2px solid #e2e8f0;
    padding: 12px 16px;
    font-size: 1rem;
    font-family: inherit;
  }

  .btn-primary {
    border-radius: 999px;
    border: none;
    padding: 12px 24px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    color: white;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 15px 35px rgba(99, 102, 241, 0.35);
    font-family: inherit;
  }

  .status {
    margin: 0;
    font-weight: 600;
  }

  .status.success {
    color: #16a34a;
  }

  .status.error {
    color: #dc2626;
  }
</style>
