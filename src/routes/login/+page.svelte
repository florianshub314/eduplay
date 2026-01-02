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
    max-width: 480px;
    margin: 80px auto;
    padding: 32px 28px 38px;
    border-radius: 28px;
    background: linear-gradient(135deg, #ffffff, #fef3c7 55%, #dbeafe);
    text-align: center;
    font-family: "Baloo 2", "Fredoka", "Nunito", system-ui, -apple-system, BlinkMacSystemFont,
      "Segoe UI", sans-serif;
    border: 4px solid #0f172a;
    box-shadow: 18px 18px 0 rgba(15, 23, 42, 0.18);
  }

  :global(body) {
    background: radial-gradient(circle at 15% 20%, rgba(255, 237, 213, 0.7), transparent 38%),
      radial-gradient(circle at 80% 15%, rgba(191, 219, 254, 0.7), transparent 32%),
      radial-gradient(circle at 20% 82%, rgba(244, 114, 182, 0.3), transparent 32%),
      linear-gradient(160deg, #fff7ed 0%, #e0f2fe 45%, #ecfdf3 100%);
  }

  h2 {
    margin: 0 0 0.35rem;
    font-size: 2rem;
    letter-spacing: -0.02em;
    color: #0f172a;
    text-shadow: 4px 4px 0 rgba(15, 23, 42, 0.08);
  }

  p {
    margin: 0 0 1.2rem;
    color: #0f172a;
    opacity: 0.78;
  }

  label {
    display: block;
    margin: 0.8rem 0 0.25rem;
    font-weight: 800;
    color: #0f172a;
  }

  input {
    width: 100%;
    padding: 0.85rem 1rem;
    margin-bottom: 0.2rem;
    border-radius: 18px;
    border: 3px solid #0f172a;
    font-size: 1rem;
    box-shadow: 8px 8px 0 rgba(15, 23, 42, 0.12);
  }

  button {
    width: 100%;
    padding: 0.95rem 1rem;
    font-size: 1.02rem;
    border-radius: 18px;
    border: 3px solid #0f172a;
    cursor: pointer;
    margin-top: 0.65rem;
    font-weight: 800;
    box-shadow: 10px 10px 0 rgba(15, 23, 42, 0.16);
    transition: transform 0.12s ease, box-shadow 0.12s ease, background 0.12s ease;
  }

  .btn-primary {
    background: linear-gradient(135deg, #22c55e, #38bdf8);
    color: #0f172a;
  }

  .btn-secondary {
    background: #fef08a;
    color: #0f172a;
  }

  .btn-ghost {
    background: transparent;
    color: #0f172a;
    border: 3px solid #0f172a;
  }

  .btn-google {
    background: #fff;
    color: #0f172a;
    border: 3px solid #0f172a;
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
    color: #ef4444;
    margin-bottom: 1rem;
    font-weight: 800;
  }

  button:hover {
    transform: translateY(-2px);
  }

  button:active {
    transform: translateY(2px);
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
