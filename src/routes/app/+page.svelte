<script>
  import { goto } from "$app/navigation";

  let team1 = "";
  let team2 = "";
  let selectedSubject = "math";

  const subjects = [
    { id: "math", label: "📐 Mathe" },
    { id: "german", label: "📚 Deutsch" },
    { id: "english", label: "🇬🇧 Englisch" },
    { id: "french", label: "🇫🇷 Französisch" },
    { id: "other", label: "✨ Andere Fächer" }
  ];

  function startGame() {
    const t1 = team1.trim() || "Team Blau";
    const t2 = team2.trim() || "Team Rot";

    const params = new URLSearchParams({
      subject: selectedSubject,
      team1: t1,
      team2: t2
    });

    goto(`/app/sets?${params.toString()}`);
  }
</script>

<div class="card">
  <h2>Spiel vorbereiten</h2>
  <p>Wähle ein Fach und gib optional Teamnamen ein.</p>

  <div class="field">
    <label>Team 1 Name</label>
    <input placeholder="Team Blau" bind:value={team1} />
  </div>

  <div class="field">
    <label>Team 2 Name</label>
    <input placeholder="Team Rot" bind:value={team2} />
  </div>

  <div class="field">
    <label>Fach</label>
    <select bind:value={selectedSubject}>
      {#each subjects as s}
        <option value={s.id}>{s.label}</option>
      {/each}
    </select>
  </div>

  <button class="btn-primary btn-block" on:click={startGame}>
    Spiel mit Fragen-Set auswählen
  </button>
</div>

<div class="card">
  <h3>Was passiert als nächstes?</h3>
  <ul>
    <li>Du wählst oder erstellst ein Fragen-Set passend zum Fach.</li>
    <li>Danach startest du das Spiel mit Wandtafelfussball-Logik.</li>
  </ul>
</div>
