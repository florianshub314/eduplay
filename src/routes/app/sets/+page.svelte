<script>
  import { onMount } from "svelte";
  import { supabase } from "$lib/supabaseClient";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";

  let user = null;
  let subject = "math";
  let team1 = "";
  let team2 = "";
  let sets = [];
  let loadingSets = false;
  let error = "";

  let newTitle = "";
  let topic = "";
  let creating = false;

  $: {
    const params = $page.url.searchParams;
    subject = params.get("subject") || "math";
    team1 = params.get("team1") || "Team Blau";
    team2 = params.get("team2") || "Team Rot";
  }

  onMount(async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      goto("/login");
      return;
    }
    user = data.user;
    await loadSets();
  });

  async function loadSets() {
    loadingSets = true;
    error = "";
    try {
      const res = await fetch("/api/list-question-sets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id, subject })
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      sets = json.sets;
    } catch (e) {
      error = e.message;
    } finally {
      loadingSets = false;
    }
  }

  async function createSet() {
    creating = true;
    error = "";

    try {
      let questions = [];

      if (subject === "math") {
        questions = [
          { id: 1, type: "math", question: "5 + 7 = ?", answer: "12" }
        ];
      } else if (subject === "german") {
        questions = [
          {
            id: 1,
            type: "syllables_image",
            imageUrl: "/images/hund.png",
            correctSyllables: 1
          }
        ];
      } else {
        const res = await fetch("/api/generate-questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subject, topic })
        });
        const json = await res.json();
        if (json.error) throw new Error(json.error);
        questions = json.questions;
      }

      const res2 = await fetch("/api/save-question-set", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          subject,
          title: newTitle || "Neues Set",
          questions
        })
      });

      const json2 = await res2.json();
      if (json2.error) throw new Error(json2.error);

      await loadSets();
      newTitle = "";
      topic = "";
      alert("Fragen-Set erstellt.");
    } catch (e) {
      error = e.message;
    } finally {
      creating = false;
    }
  }

  function startGameWithSet(set) {
    const params = new URLSearchParams({
      subject,
      team1,
      team2,
      setId: set.id
    });
    goto(`/app/game?${params.toString()}`);
  }
</script>

<main class="sets-admin">
  <section class="card overview">
    <div>
      <p class="eyebrow">Aktive Teams</p>
      <h2>Fragen-Sets für {subject}</h2>
      <p class="subtitle">Teams: {team1} vs. {team2}</p>
    </div>

    {#if error}
      <p class="status error">{error}</p>
    {/if}

    {#if loadingSets}
      <p class="status info">Sets werden geladen …</p>
    {:else if sets.length === 0}
      <p class="status info">Keine Sets vorhanden.</p>
    {:else}
      <ul class="set-list">
        {#each sets as set}
          <li>
            <div>
              <p class="set-meta">
                {new Date(set.createdAt).toLocaleDateString("de-CH")}
              </p>
              <h3>{set.title}</h3>
            </div>
            <button class="btn-primary" on:click={() => startGameWithSet(set)}>
              Spiel starten
            </button>
          </li>
        {/each}
      </ul>
    {/if}
  </section>

  <section class="card add-set">
    <p class="eyebrow">Set hinzufügen</p>
    <h2>Neues Set erstellen</h2>
    <p class="subtitle">
      Gib einen Titel ein und erstelle auf Wunsch KI-Fragen für dein Fach.
    </p>

    <div class="field">
      <label for="set-title-input">Titel des Sets</label>
      <input
        id="set-title-input"
        bind:value={newTitle}
        placeholder="z. B. Kopfrechnen 1x1"
      />
    </div>

    {#if subject === "english" || subject === "french" || subject === "other"}
      <div class="field">
        <label for="set-topic-textarea">Thema oder Hinweis für die KI</label>
        <textarea
          id="set-topic-textarea"
          bind:value={topic}
          rows="3"
          placeholder="Beschreibe kurz, welche Inhalte gefragt werden sollen."
        ></textarea>
      </div>
    {/if}

    <button class="btn-primary" on:click={createSet}>
      {creating ? "Erstelle …" : "Set hinzufügen"}
    </button>
  </section>
</main>

<style>
  .sets-admin {
    min-height: calc(100vh - 120px);
    padding: 40px 16px 80px;
    background: linear-gradient(180deg, #eef2ff 0%, #f8fafc 50%, #ffffff 100%);
    font-family:
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      sans-serif;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 24px;
  }

  .card {
    border-radius: 28px;
    border: 2px solid #e0e7ff;
    background: #fff;
    box-shadow: 0 25px 60px rgba(15, 23, 42, 0.12);
    padding: 28px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .eyebrow {
    margin: 0;
    font-size: 0.7rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #a5b4fc;
  }

  h2 {
    margin: 0;
    font-size: clamp(1.6rem, 2.4vw, 2rem);
  }

  h3 {
    margin: 0;
    font-size: 1.1rem;
  }

  .subtitle {
    margin: 4px 0 0;
    color: #475569;
  }

  .set-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .set-list li {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    padding: 16px 18px;
    border-radius: 18px;
    border: 1px solid #e2e8f0;
    background: #f8fafc;
    align-items: center;
  }

  .set-meta {
    margin: 0;
    color: #94a3b8;
    font-size: 0.85rem;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  label {
    font-weight: 600;
    color: #0f172a;
  }

  input,
  textarea {
    border-radius: 16px;
    border: 2px solid #e2e8f0;
    padding: 12px 16px;
    font-size: 1rem;
    font-family: inherit;
  }

  textarea {
    resize: vertical;
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
    box-shadow: 0 15px 35px rgba(99, 102, 241, 0.35);
  }

  .status {
    margin: 0;
    font-weight: 600;
  }

  .status.error {
    color: #ef4444;
  }

  .status.info {
    color: #475569;
  }
</style>
