<script>
  import { supabase } from "$lib/supabaseClient";
  import { goto } from "$app/navigation";

  const explicitRedirectUrl = import.meta.env.VITE_PUBLIC_SITE_URL;
  let email = "";
  let password = "";
  let isLogin = true;
  let error = "";
  let loading = false;
  let oauthLoading = false;

  async function handleSubmit() {
    loading = true;
    error = "";

    try {
      if (isLogin) {
        const { error: err } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (err) throw err;
      } else {
        const { error: err } = await supabase.auth.signUp({
          email,
          password
        });
        if (err) throw err;
      }
      goto("/start"); // oder /app wenn du doch speichern willst
    } catch (e) {
      error = e.message;
    } finally {
      loading = false;
    }
  }

  async function signInWithGoogle() {
    oauthLoading = true;
    error = "";
    try {
      const { error: err } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${explicitRedirectUrl || window.location.origin}/start`
        }
      });
      if (err) throw err;
    } catch (e) {
      error = e.message;
      oauthLoading = false;
    }
  }
</script>

<style>
  main {
    max-width: 400px;
    margin: 4rem auto;
    padding: 2rem;
    border-radius: 1rem;
    background: #f4f4f4;
    text-align: center;
    font-family: system-ui, sans-serif;
  }

  label {
    display: block;
    margin: 0.5rem 0 0.25rem;
  }

  input {
    width: 100%;
    padding: 0.6rem;
    margin-bottom: 1rem;
    border-radius: 0.4rem;
    border: 1px solid #ccc;
  }

  button {
    width: 100%;
    padding: 0.8rem;
    font-size: 1rem;
    border-radius: 0.6rem;
    border: none;
    cursor: pointer;
    margin-top: 0.5rem;
  }

  .btn-primary {
    background: #2563eb;
    color: white;
  }

  .btn-secondary {
    background: #6b7280;
    color: white;
  }

  .btn-ghost {
    background: transparent;
    color: #2563eb;
    border: 2px solid #2563eb;
  }

  .btn-google {
    background: white;
    color: #1f2937;
    border: 1px solid #d1d5db;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .btn-google img {
    width: 18px;
    height: 18px;
  }

  .error {
    color: red;
    margin-bottom: 1rem;
  }
</style>

<main>
  <h2>{isLogin ? "Login" : "Registrieren"}</h2>
  <p>Optional – nur nötig, wenn du eigene Frage-Sets speichern willst.</p>

  {#if error}
    <div class="error">{error}</div>
  {/if}

  <form on:submit|preventDefault={handleSubmit}>
    <label for="email-input">E-Mail</label>
    <input id="email-input" type="email" bind:value={email} required />

    <label for="password-input">Passwort</label>
    <input
      id="password-input"
      type="password"
      bind:value={password}
      required
    />

    <button class="btn-primary" disabled={loading}>
      {#if loading}
        Bitte warten…
      {:else}
        {isLogin ? "Einloggen" : "Registrieren"}
      {/if}
    </button>
  </form>

  <button class="btn-google" type="button" on:click={signInWithGoogle} disabled={oauthLoading}>
    {#if oauthLoading}
      Mit Google wird verbunden…
    {:else}
      <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="" />
      Mit Google anmelden
    {/if}
  </button>

  <button
    class="btn-secondary"
    on:click={() => (isLogin = !isLogin)}
  >
    {isLogin
      ? "Noch kein Konto? Jetzt registrieren"
      : "Schon ein Konto? Zum Login"}
  </button>

  <button
    class="btn-ghost"
    type="button"
    on:click={() => goto("/")}
  >
    Zurück zur Auswahl (Gast wählen)
  </button>
</main>
