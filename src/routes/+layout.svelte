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

  function openProfile() {
    goto("/profil");
  }

  function handleSessionButtonClick() {
    if (session?.user) {
      openProfile();
    } else {
      openLogin();
    }
  }
</script>

{#if !isNavHidden}
  <header class="global-bar" aria-label="Hauptnavigation">
    <div class="nav-shapes" aria-hidden="true">
      <span class="nav-shape a"></span>
      <span class="nav-shape b"></span>
    </div>
    <button type="button" class="brand" on:click={() => goto("/start")}>
      <span class="brand-badge" aria-hidden="true">EP</span>
      <span class="brand-text">EduPlay</span>
    </button>
    <div class="spacer"></div>
    <button
      type="button"
      class="session-button"
      on:click={handleSessionButtonClick}
      title={session?.user ? "Profil öffnen" : "Anmelden"}
      aria-label={session?.user ? "Profil öffnen" : "Anmelden"}
    >
      <span class="avatar">👤</span>
      <span class="session-text">
        {#if userDisplay}
          <span>{userDisplay}</span>
          <span class="session-action">Profil</span>
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
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    margin: 12px auto 0;
    border: 4px solid #1f1a2d;
    border-radius: 30px;
    background: linear-gradient(135deg, #fffaf3, #ffe2f6);
    box-shadow: 16px 16px 0 rgba(15, 23, 42, 0.18);
    z-index: 200;
    overflow: hidden;
    max-width: 1200px;
    width: calc(100% - 24px);
  }

  .nav-shapes {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .nav-shape {
    position: absolute;
    border: 3px solid #1f1a2d;
    border-radius: 24px;
    opacity: 0.5;
    box-shadow: 10px 10px 0 rgba(15, 23, 42, 0.16);
  }

  .nav-shape.a {
    width: 120px;
    height: 120px;
    background: #9ae6ff;
    top: -40px;
    right: -50px;
    transform: rotate(18deg);
  }

  .nav-shape.b {
    width: 90px;
    height: 90px;
    background: #ffd166;
    bottom: -30px;
    left: -30px;
    transform: rotate(-14deg);
  }

  .brand {
    border: 3px solid #1f1a2d;
    background: #fffef9;
    padding: 10px 14px;
    cursor: pointer;
    font-size: 1.2rem;
    font-weight: 900;
    letter-spacing: -0.01em;
    border-radius: 999px;
    box-shadow: 10px 10px 0 rgba(15, 23, 42, 0.16);
    display: inline-flex;
    align-items: center;
    gap: 10px;
    transition: transform 0.12s ease, box-shadow 0.12s ease;
  }

  .brand-badge {
    width: 34px;
    height: 34px;
    border-radius: 12px;
    background: linear-gradient(135deg, #66d08f, #8b5cf6);
    border: 3px solid #1f1a2d;
    display: grid;
    place-items: center;
    box-shadow: 6px 6px 0 rgba(15, 23, 42, 0.16);
    font-size: 1rem;
  }

  .brand-text {
    background: linear-gradient(120deg, #1f1a2d, #8b5cf6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .brand:hover {
    transform: translateY(-3px);
    box-shadow: 14px 14px 0 rgba(15, 23, 42, 0.22);
  }

  .spacer {
    width: 100%;
  }

  .session-button {
    justify-self: end;
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    padding: 10px 14px;
    border-radius: 999px;
    background: linear-gradient(120deg, #ffd166, #ffb7e2);
    box-shadow: 10px 10px 0 rgba(15, 23, 42, 0.16);
    color: #1f1a2d;
    font-weight: 800;
    border: 3px solid #1f1a2d;
    cursor: pointer;
    transition: transform 120ms ease, box-shadow 120ms ease, background 120ms ease;
  }

  .session-button:hover {
    box-shadow: 14px 14px 0 rgba(15, 23, 42, 0.22);
    transform: translateY(-2px);
  }

  .session-button:active {
    transform: translateY(2px);
    box-shadow: 6px 6px 0 rgba(15, 23, 42, 0.18);
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
    color: #1f1a2d;
  }

  .brand:focus-visible,
  .home-link:focus-visible,
  .session-button:focus-visible {
    outline: 3px solid #66d08f;
    outline-offset: 3px;
  }

  @media (max-width: 640px) {
    .global-bar {
      grid-template-columns: 1fr;
      row-gap: 10px;
      margin: 8px 8px 0;
    }
    .home-link {
      justify-self: stretch;
    }
    .session-button {
      justify-self: stretch;
      justify-content: center;
      text-align: center;
    }
  }
</style>
