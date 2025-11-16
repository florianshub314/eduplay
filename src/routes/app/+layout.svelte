<script>
  import { onMount } from "svelte";
  import { supabase } from "$lib/supabaseClient";
  import { page } from "$app/stores";

  let session = null;

  onMount(async () => {
    const { data } = await supabase.auth.getSession();
    session = data.session;

    supabase.auth.onAuthStateChange((_event, newSession) => {
      session = newSession;
    });
  });

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }
</script>

<div class="app">
  <header class="app-header">
    <h1>EduPlay</h1>
    <nav>
      {#if session}
        <a href="/app">Start</a>
        <a href="/app/sets">Fragen-Sets</a>
        <button class="btn-secondary" on:click={logout}>Logout</button>
      {:else}
        <a href="/login">Login</a>
      {/if}
    </nav>
  </header>

  <main class="app-main">
    <slot />
  </main>
</div>

<style>
  :global(body) {
    margin: 0;
    font-family: system-ui, sans-serif;
    background: #0f172a;
    color: #e5e7eb;
  }

  .app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .app-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 2rem;
    background: #020617;
    border-bottom: 1px solid #1f2937;
  }

  .app-header h1 {
    margin: 0;
    font-size: 1.4rem;
  }

  nav a {
    color: #e5e7eb;
    text-decoration: none;
    margin-right: 1rem;
  }

  nav a:hover {
    text-decoration: underline;
  }

  .app-main {
    flex: 1;
    padding: 2rem;
    max-width: 1000px;
    margin: 0 auto;
  }

  /* Buttons – gleiche Farbe für Zurück / Falsch / Skip / Spiel beenden */
  .btn,
  .btn-primary,
  .btn-secondary,
  .btn-danger {
    border: none;
    border-radius: 999px;
    padding: 0.75rem 1.4rem;
    font-size: 1rem;
    cursor: pointer;
  }

  .btn-primary {
    background: #2563eb;
    color: white;
  }

  .btn-secondary,
  .btn {
    background: #4b5563;
    color: white;
  }

  .btn-danger {
    background: #b91c1c;
    color: white;
  }

  .btn-block {
    display: block;
    width: 100%;
    text-align: center;
  }

  .card {
    background: #020617;
    border-radius: 1rem;
    padding: 1.5rem;
    border: 1px solid #1f2937;
    margin-bottom: 1.5rem;
  }

  .field {
    margin-bottom: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .field label {
    font-size: 0.9rem;
    color: #9ca3af;
  }

  .field input,
  .field select,
  .field textarea {
    padding: 0.6rem 0.8rem;
    border-radius: 0.6rem;
    border: 1px solid #374151;
    background: #020617;
    color: #e5e7eb;
  }

  .field input:focus,
  .field select:focus,
  .field textarea:focus {
    outline: none;
    border-color: #2563eb;
  }
</style>
