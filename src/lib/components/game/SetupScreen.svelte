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
  .config {
    min-height: 100vh;
    padding: 70px 22px 90px;
    background: radial-gradient(circle at 15% 20%, rgba(255, 237, 213, 0.8), transparent 38%),
      radial-gradient(circle at 80% 15%, rgba(191, 219, 254, 0.8), transparent 34%),
      radial-gradient(circle at 20% 82%, rgba(244, 114, 182, 0.24), transparent 32%),
      linear-gradient(180deg, #fff7ed 0%, #e0f2fe 35%, #f8fafc 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: left;
    position: relative;
    font-family: "Baloo 2", "Fredoka", "Nunito", system-ui, -apple-system, BlinkMacSystemFont,
      "Segoe UI", sans-serif;
  }

  .config h1 {
    font-size: 2.6rem;
    margin-bottom: 28px;
    text-align: center;
    color: #0f172a;
    letter-spacing: -0.02em;
    background: linear-gradient(120deg, #0ea5e9, #f97316, #10b981);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: 6px 6px 0 rgba(15, 23, 42, 0.08);
  }

  .team-card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(420px, 1fr));
    gap: 24px;
    width: min(960px, 100%);
    margin-bottom: 32px;
  }

  .team-card {
    background: linear-gradient(135deg, #ffffff, #f8fafc);
    border-radius: 28px;
    padding: 32px;
    box-shadow: 14px 14px 0 rgba(15, 23, 42, 0.18);
    border: 3px solid #0f172a;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-height: 180px;
  }

  .team-card.blue {
    background: linear-gradient(135deg, #dbeafe, #bfdbfe);
    border-color: #2563eb;
  }

  .team-card.red {
    background: linear-gradient(135deg, #fee2e2, #fecdd3);
    border-color: #ef4444;
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
    border-radius: 18px;
    display: grid;
    place-items: center;
    color: white;
    box-shadow: 6px 6px 0 rgba(15, 23, 42, 0.12);
  }

  .team-card.blue .team-icon {
    background: linear-gradient(160deg, #0ea5e9, #2563eb);
  }

  .team-card.red .team-icon {
    background: linear-gradient(160deg, #fb7185, #ef4444);
  }

  .team-title {
    font-size: 1.25rem;
    font-weight: 800;
    margin: 0;
    letter-spacing: -0.01em;
  }

  .team-desc {
    margin: 2px 0 0;
    color: #0f172a;
    font-size: 0.95rem;
    opacity: 0.65;
  }

  .team-card input {
    width: 100%;
    padding: 16px 18px;
    border-radius: 18px;
    border: 3px solid #0f172a;
    font-size: 1rem;
    background: #ffffff;
    box-sizing: border-box;
    box-shadow: 6px 6px 0 rgba(15, 23, 42, 0.08);
  }

  .info-text {
    margin: 10px 0 30px;
    color: #0f172a;
    font-size: 1rem;
    text-align: center;
    width: min(700px, 100%);
    background: #fff;
    border: 3px solid #0f172a;
    border-radius: 16px;
    padding: 14px 18px;
    box-shadow: 10px 10px 0 rgba(15, 23, 42, 0.12);
  }

  .settings-card {
    width: min(960px, 100%);
    background: linear-gradient(135deg, #ffffff, #e0f2fe 60%, #fef9c3);
    border-radius: 32px;
    padding: 32px;
    box-shadow: 16px 16px 0 rgba(15, 23, 42, 0.18);
    border: 4px solid #0f172a;
    position: relative;
    overflow: hidden;
  }

  .settings-card h2 {
    margin-top: 0;
    margin-bottom: 20px;
    font-size: 1.8rem;
    letter-spacing: -0.01em;
  }

  .group-label {
    font-weight: 800;
    margin-bottom: 10px;
    color: #0f172a;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .chip-row {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }

  .chip-row button {
    border-radius: 18px;
    border: 3px solid #0f172a;
    padding: 12px 18px;
    background: #fff;
    cursor: pointer;
    font-weight: 800;
    color: #0f172a;
    box-shadow: 8px 8px 0 rgba(15, 23, 42, 0.12);
    transition: transform 0.12s ease, box-shadow 0.12s ease, background 0.12s ease;
  }

  .chip-row button.active-chip {
    background: #fef08a;
    border-color: #0f172a;
    color: #0f172a;
    box-shadow: 6px 6px 0 rgba(15, 23, 42, 0.18);
    transform: translateY(-2px);
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
    font-weight: 800;
    color: #0f172a;
  }

  .input-row input {
    margin-top: 8px;
    border-radius: 18px;
    border: 3px solid #0f172a;
    padding: 14px 16px;
    font-size: 1rem;
    background: #fff;
    box-shadow: 8px 8px 0 rgba(15, 23, 42, 0.1);
  }

  .action-buttons {
    margin-top: 36px;
    display: flex;
    gap: 16px;
  }

  .btn-primary,
  .btn-secondary {
    padding: 14px 24px;
    border-radius: 18px;
    border: 3px solid #0f172a;
    font-weight: 800;
    cursor: pointer;
    min-width: 180px;
    box-shadow: 10px 10px 0 rgba(15, 23, 42, 0.16);
    transition: transform 0.12s ease, box-shadow 0.12s ease;
  }

  .btn-primary {
    background: linear-gradient(120deg, #0ea5e9, #22c55e);
    color: #0f172a;
  }

  .btn-secondary {
    background: #fef08a;
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
