<script>
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { supabase } from "$lib/supabaseClient";

  let groupedSets = {};
  let subjects = [];
  let selected = null;
  let loading = true;
  let error = "";

  onMount(async () => {
    const { data } = await supabase.auth.getSession();
    const session = data.session;
    if (!session) {
      goto("/login");
      return;
    }

    try {
      const res = await fetch("/api/sets", {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Sets konnten nicht geladen werden.");
      }
      groupedSets = json.groupedSets || {};
      subjects = Object.keys(groupedSets);
      selected = subjects[0] || null;
    } catch (err) {
      error = err.message || "Unbekannter Fehler.";
    } finally {
      loading = false;
    }
  });

  function openGame(id) {
    goto(`/game/${id}`);
  }

  function goBack() {
    goto("/start");
  }
</script>

<svelte:head>
  <title>Gespeicherte Fragen-Sets</title>
</svelte:head>

<main class="sets-page">
  <header>
    <button class="back-btn" on:click={goBack}>← Zur Startseite</button>
    <h1>Gespeicherte Sets</h1>
    <p>Wähle zuerst ein Fach, dann ein Set zum Starten.</p>
  </header>

  {#if loading}
    <p class="empty">Sets werden geladen …</p>
  {:else if error}
    <p class="empty" style="color:#dc2626;">{error}</p>
  {:else if subjects.length === 0}
    <p class="empty">Noch keine Sets vorhanden.</p>
  {:else}
    <div class="subject-tabs">
      {#each subjects as subject}
        <button
          type="button"
          class:selected={selected === subject}
          on:click={() => (selected = subject)}
        >
          {subject}
        </button>
      {/each}
    </div>

    <div class="sets-grid">
      {#each groupedSets[selected] as set}
        <article class="set-card">
          <div>
            <p class="meta">
              {set.totalQuestions} Fragen · {new Date(set.createdAt).toLocaleDateString("de-CH")}
            </p>
            <h2>{set.title}</h2>
          </div>
          <button class="open-button" on:click={() => openGame(set.id)}>
            Spiel starten
          </button>
        </article>
      {/each}
    </div>
  {/if}
</main>

<style>
  .sets-page {
    max-width: 1100px;
    margin: 0 auto;
    padding: 2.5rem 1.5rem 4rem;
    font-family:
      system-ui,
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      sans-serif;
  }

  header {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    margin-bottom: 2rem;
  }

  .back-btn {
    align-self: flex-start;
    border: none;
    background: transparent;
    color: #2563eb;
    font-weight: 600;
    cursor: pointer;
    padding: 0;
  }

  h1 {
    margin: 0;
    font-size: clamp(2rem, 3vw, 2.6rem);
  }

  .empty {
    padding: 2rem;
    border-radius: 1.5rem;
    border: 2px dashed #cbd5f5;
    text-align: center;
  }

  .subject-tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }

  .subject-tabs button {
    border-radius: 999px;
    border: 2px solid #cbd5f5;
    padding: 0.6rem 1.2rem;
    font-weight: 600;
    background: white;
    cursor: pointer;
  }

  .subject-tabs button.selected {
    background: #2563eb;
    color: white;
    border-color: #2563eb;
    box-shadow: 0 12px 25px rgba(37, 99, 235, 0.35);
  }

  .sets-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 1rem;
  }

  .set-card {
    border-radius: 1.5rem;
    border: 2px solid #e2e8f0;
    padding: 1.5rem;
    background: white;
    box-shadow: 0 15px 35px rgba(15, 23, 42, 0.08);
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .meta {
    margin: 0;
    color: #64748b;
    font-size: 0.9rem;
  }

  h2 {
    margin: 0;
    font-size: 1.2rem;
  }

  .open-button {
    align-self: flex-start;
    border-radius: 999px;
    background: #2563eb;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    font-weight: 600;
    cursor: pointer;
  }
</style>
