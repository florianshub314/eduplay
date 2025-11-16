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

<div class="card">
  <h2>Fragen-Sets für {subject}</h2>
  <p>Teams: {team1} vs. {team2}</p>

  {#if error}
    <p style="color:#f87171;">{error}</p>
  {/if}

  {#if loadingSets}
    <p>Laden…</p>
  {:else if sets.length === 0}
    <p>Keine Sets vorhanden.</p>
  {:else}
    <ul>
      {#each sets as set}
        <li>
          <strong>{set.title}</strong>
          <button class="btn-primary" on:click={() => startGameWithSet(set)}>
            Starten
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<div class="card">
  <h3>Neues Set erstellen</h3>

  <div class="field">
    <label>Titel</label>
    <input bind:value={newTitle} />
  </div>

  {#if subject === "english" || subject === "french" || subject === "other"}
    <div class="field">
      <label>Thema für KI</label>
      <textarea bind:value={topic}></textarea>
    </div>
  {/if}

  <button class="btn-primary" on:click={createSet}>
    {creating ? "Erstelle…" : "Set speichern"}
  </button>
</div>
