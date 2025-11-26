<script>
  import { createEventDispatcher } from "svelte";

  export let blueTeamName = "";
  export let redTeamName = "";
  export let numQuestions = 10;
  export let questionPresets = [5, 10, 20];
  export let infoText =
    'Wenn kein Name eingegeben wird, heissen die Teams automatisch „Team Blau“ und „Team Rot“.';
  export let title = "Teams & Spiel-Einstellungen";

  const dispatch = createEventDispatcher();
  let selectedPreset =
    questionPresets.includes(numQuestions) ? numQuestions : null;

  $: if (
    selectedPreset !== null &&
    !questionPresets.includes(numQuestions)
  ) {
    selectedPreset = null;
  }

  function selectPreset(preset) {
    selectedPreset = preset;
    numQuestions = preset;
  }

  function handleBack() {
    dispatch("back");
  }

  function handleStart() {
    dispatch("start");
  }
</script>

<main class="config">
  <h1>{title}</h1>

  <div class="team-card-grid">
    <div class="team-card blue">
      <div class="team-card-header">
        <span class="team-icon">👕</span>
        <div>
          <p class="team-title">Team Blau</p>
          <p class="team-desc">Team Blau (Standardname, falls leer)</p>
        </div>
      </div>
      <input type="text" placeholder="Team Blau" bind:value={blueTeamName} />
    </div>
    <div class="team-card red">
      <div class="team-card-header">
        <span class="team-icon">👕</span>
        <div>
          <p class="team-title">Team Rot</p>
          <p class="team-desc">Team Rot (Standardname, falls leer)</p>
        </div>
      </div>
      <input type="text" placeholder="Team Rot" bind:value={redTeamName} />
    </div>
  </div>

  <p class="info-text">{infoText}</p>

  <div class="settings-card">
    <h2>Spiel-Einstellungen</h2>

    <div class="settings-group">
      <p class="group-label">Fragen-Presets</p>
      <div class="chip-row">
        {#each questionPresets as preset}
          <button
            type="button"
            class:active-chip={selectedPreset === preset}
            on:click={() => selectPreset(preset)}
          >
            {preset} Fragen
          </button>
        {/each}
      </div>
    </div>

    <div class="input-row">
      <label>
        Anzahl Fragen
        <input
          type="number"
          min="1"
          bind:value={numQuestions}
          on:input={() => (selectedPreset = null)}
        />
      </label>
    </div>

    <slot />
  </div>

  <div class="action-buttons">
    <button class="btn-secondary" type="button" on:click={handleBack}>
      Zurück
    </button>
    <button class="btn-primary" type="button" on:click={handleStart}>
      Weiter zu Fragen
    </button>
  </div>
</main>

<style>
  main {
    font-family:
      system-ui,
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      sans-serif;
  }

  .config {
    min-height: 100vh;
    padding: 60px 24px 80px;
    background: linear-gradient(180deg, #eef2ff 0%, #f8fafc 40%, #ffffff 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: left;
  }

  .config h1 {
    font-size: 2.4rem;
    margin-bottom: 32px;
    text-align: center;
    color: #0f172a;
  }

  .team-card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(420px, 1fr));
    gap: 24px;
    width: min(960px, 100%);
    margin-bottom: 28px;
  }

  .team-card {
    background: white;
    border-radius: 28px;
    padding: 32px;
    box-shadow: 0 20px 45px rgba(15, 23, 42, 0.08);
    border: 2px solid transparent;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-height: 180px;
  }

  .team-card.blue {
    border-color: #60a5fa;
  }

  .team-card.red {
    border-color: #f87171;
  }

  .team-card-header {
    display: flex;
    align-items: flex-start;
    gap: 16px;
  }

  .team-icon {
    font-size: 2rem;
    width: 56px;
    height: 56px;
    border-radius: 999px;
    display: grid;
    place-items: center;
    color: white;
  }

  .team-card.blue .team-icon {
    background: linear-gradient(135deg, #60a5fa, #2563eb);
  }

  .team-card.red .team-icon {
    background: linear-gradient(135deg, #f87171, #dc2626);
  }

  .team-title {
    font-size: 1.2rem;
    font-weight: 700;
    margin: 0;
  }

  .team-desc {
    margin: 2px 0 0;
    color: #475569;
    font-size: 0.9rem;
  }

  .team-card input {
    width: 100%;
    padding: 14px 18px;
    border-radius: 16px;
    border: 2px solid #e2e8f0;
    font-size: 1rem;
    background: #ffffff;
    box-sizing: border-box;
    box-shadow: inset 0 2px 6px rgba(15, 23, 42, 0.05);
  }

  .info-text {
    margin: 20px 0 30px;
    color: #475569;
    font-size: 0.95rem;
    text-align: center;
    width: min(700px, 100%);
  }

  .settings-card {
    width: min(960px, 100%);
    background: white;
    border-radius: 32px;
    padding: 32px;
    box-shadow: 0 25px 50px rgba(15, 23, 42, 0.1);
  }

  .settings-card h2 {
    margin-top: 0;
    margin-bottom: 24px;
    font-size: 1.6rem;
  }

  .group-label {
    font-weight: 600;
    margin-bottom: 12px;
    color: #0f172a;
  }

  .chip-row {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }

  .chip-row button {
    border-radius: 999px;
    border: 2px solid #cbd5f5;
    padding: 10px 20px;
    background: white;
    cursor: pointer;
    font-weight: 600;
    color: #1d4ed8;
  }

  .chip-row button.active-chip {
    background: #2563eb;
    border-color: #1d4ed8;
    color: white;
    box-shadow: 0 6px 16px rgba(37, 99, 235, 0.35);
  }

  .input-row {
    display: flex;
    gap: 20px;
    flex-wrap: wrap;
    margin: 24px 0;
  }

  .input-row label {
    flex: 1;
    display: flex;
    flex-direction: column;
    font-weight: 600;
    color: #0f172a;
  }

  .input-row input {
    margin-top: 8px;
    border-radius: 16px;
    border: 2px solid #e2e8f0;
    padding: 12px 16px;
    font-size: 1rem;
    background: #f8fafc;
  }

  .action-buttons {
    margin-top: 32px;
    display: flex;
    gap: 16px;
  }

  .btn-primary,
  .btn-secondary {
    padding: 10px 20px;
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

  @media (max-width: 600px) {
    .team-card-grid {
      grid-template-columns: 1fr;
    }

    .action-buttons {
      flex-direction: column;
      width: 100%;
    }
  }
</style>
