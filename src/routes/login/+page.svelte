<script>
  import { supabase } from "$lib/supabaseClient";
  import { goto } from "$app/navigation";

  let email = "";
  let password = "";
  let isLogin = true;
  let error = "";
  let loading = false;

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

      goto("/app");
    } catch (e) {
      error = e.message;
    } finally {
      loading = false;
    }
  }
</script>

<div class="card" style="max-width: 420px; margin: 3rem auto;">
  <h2>{isLogin ? "Login" : "Registrieren"}</h2>
  <p>Bitte melde dich an, um deine eigenen Fragen-Sets zu verwalten.</p>

  {#if error}
    <p style="color:#f87171;">{error}</p>
  {/if}

  <form on:submit|preventDefault={handleSubmit}>
    <div class="field">
      <label for="email">E-Mail</label>
      <input id="email" type="email" bind:value={email} required />
    </div>

    <div class="field">
      <label for="password">Passwort</label>
      <input id="password" type="password" bind:value={password} required />
    </div>

    <button class="btn-primary btn-block" disabled={loading}>
      {#if loading}
        Bitte warten…
      {:else}
        {isLogin ? "Einloggen" : "Konto erstellen"}
      {/if}
    </button>
  </form>

  <button
    class="btn btn-block"
    style="margin-top: 0.75rem;"
    on:click={() => (isLogin = !isLogin)}
  >
    {isLogin
      ? "Noch kein Konto? Jetzt registrieren"
      : "Schon ein Konto? Zum Login"}
  </button>
</div>
