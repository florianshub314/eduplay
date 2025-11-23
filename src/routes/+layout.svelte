<script>
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import { onMount, onDestroy } from "svelte";
  import { supabase } from "$lib/supabaseClient";

  let session = null;
  let userDisplay = "";
  let authSubscription;

const hideNavRoutes = new Set(["/login", "/"]);

  $: isNavHidden = hideNavRoutes.has($page.url.pathname);

  onMount(async () => {
    await refreshSession();
    const { data } = supabase.auth.onAuthStateChange((_event, newSession) => {
      session = newSession;
      updateUserDisplay();
    });
    authSubscription = data.subscription;
  });

  onDestroy(() => {
    authSubscription?.unsubscribe();
  });

  async function refreshSession() {
    const { data } = await supabase.auth.getSession();
    session = data.session;
    updateUserDisplay();
  }

  function updateUserDisplay() {
    if (session?.user) {
      userDisplay = session.user.email || session.user.user_metadata?.full_name || "Angemeldet";
    } else {
      userDisplay = "";
    }
  }

  function openLogin() {
    goto("/login");
  }

  async function handleSessionButtonClick() {
    if (session?.user) {
      await supabase.auth.signOut();
    } else {
      openLogin();
    }
  }
</script>

{#if !isNavHidden}
  <header class="global-bar">
    <div class="brand">EduPlay</div>
    <button
      type="button"
      class="session-button"
      on:click={handleSessionButtonClick}
      title={session?.user ? "Abmelden" : "Anmelden"}
      aria-label={session?.user ? "Abmelden" : "Anmelden"}
    >
      <span class="avatar">👤</span>
      <span class="session-text">
        {#if userDisplay}
          <span>{userDisplay}</span>
          <span class="session-action">Abmelden</span>
        {:else}
          <span>Nicht angemeldet</span>
          <span class="session-action">Anmelden</span>
        {/if}
      </span>
    </button>
  </header>
{/if}
<slot />

<style>
  .global-bar {
    position: sticky;
    top: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 2rem;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(12px);
    box-shadow: 0 10px 35px rgba(15, 23, 42, 0.12);
    border-bottom: 1px solid rgba(148, 163, 184, 0.2);
    z-index: 200;
    gap: 1rem;
  }

  .brand {
    font-size: 1.8rem;
    font-weight: 700;
    background: linear-gradient(90deg, #4f46e5, #7c3aed);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .session-button {
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 1rem;
    border-radius: 999px;
    background: white;
    box-shadow: 0 12px 30px rgba(15, 23, 42, 0.12);
    color: #0f172a;
    font-weight: 600;
    border: none;
    cursor: pointer;
    transition: transform 120ms ease, box-shadow 120ms ease;
  }

  .session-button:hover {
    box-shadow: 0 16px 32px rgba(15, 23, 42, 0.18);
  }

  .session-button:active {
    transform: scale(0.98);
  }

  .avatar {
    font-size: 1.2rem;
  }

  .session-text {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    line-height: 1.1;
  }

  .session-action {
    font-size: 0.75rem;
    font-weight: 500;
    color: #6366f1;
  }

</style>
