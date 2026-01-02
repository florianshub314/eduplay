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
    padding: 3rem 1.5rem 4.5rem;
    font-family: "Baloo 2", "Fredoka", "Nunito", system-ui, -apple-system, BlinkMacSystemFont,
      "Segoe UI", sans-serif;
    background: radial-gradient(circle at 18% 18%, rgba(255, 237, 213, 0.7), transparent 36%),
      radial-gradient(circle at 80% 12%, rgba(191, 219, 254, 0.7), transparent 32%),
      radial-gradient(circle at 24% 82%, rgba(244, 114, 182, 0.3), transparent 32%),
      linear-gradient(160deg, #fff7ed 0%, #e0f2fe 45%, #ecfdf3 100%);
    border: 4px solid #0f172a;
    border-radius: 32px;
    box-shadow: 18px 18px 0 rgba(15, 23, 42, 0.18);
  }

  header {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    margin-bottom: 2rem;
  }

  .back-btn {
    align-self: flex-start;
    border: 3px solid #0f172a;
    background: #fef08a;
    color: #0f172a;
    font-weight: 800;
    cursor: pointer;
    padding: 0.6rem 1rem;
    border-radius: 16px;
    box-shadow: 8px 8px 0 rgba(15, 23, 42, 0.14);
  }

  h1 {
    margin: 0;
    font-size: clamp(2.2rem, 3vw, 2.8rem);
    letter-spacing: -0.02em;
    color: #0f172a;
    text-shadow: 6px 6px 0 rgba(15, 23, 42, 0.08);
  }

  .empty {
    padding: 2rem;
    border-radius: 1.5rem;
    border: 3px dashed #0f172a;
    text-align: center;
    background: #fff;
    box-shadow: 12px 12px 0 rgba(15, 23, 42, 0.12);
    font-weight: 800;
  }

  .subject-tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }

  .subject-tabs button {
    border-radius: 18px;
    border: 3px solid #0f172a;
    padding: 0.7rem 1.35rem;
    font-weight: 800;
    background: #fff;
    cursor: pointer;
    box-shadow: 8px 8px 0 rgba(15, 23, 42, 0.12);
    transition: transform 0.12s ease, box-shadow 0.12s ease, background 0.12s ease;
  }

  .subject-tabs button.selected {
    background: #fef08a;
    color: #0f172a;
    border-color: #0f172a;
    transform: translateY(-2px);
    box-shadow: 10px 12px 0 rgba(15, 23, 42, 0.18);
  }

  .sets-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 1rem;
  }

  .set-card {
    border-radius: 22px;
    border: 3px solid #0f172a;
    padding: 1.6rem;
    background: #fff;
    box-shadow: 12px 12px 0 rgba(15, 23, 42, 0.14);
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .meta {
    margin: 0;
    color: #0f172a;
    opacity: 0.7;
    font-size: 0.95rem;
  }

  h2 {
    margin: 0;
    font-size: 1.3rem;
    letter-spacing: -0.01em;
  }

  .open-button {
    align-self: flex-start;
    border-radius: 18px;
    background: linear-gradient(135deg, #22c55e, #38bdf8);
    color: #0f172a;
    border: 3px solid #0f172a;
    padding: 0.65rem 1.15rem;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 8px 8px 0 rgba(15, 23, 42, 0.14);
    transition: transform 0.12s ease, box-shadow 0.12s ease;
  }

  .subject-tabs button:hover,
  .open-button:hover,
  .back-btn:hover {
    transform: translateY(-2px);
  }

  .open-button:active,
  .subject-tabs button:active,
  .back-btn:active {
    transform: translateY(2px);
  }
</style>
