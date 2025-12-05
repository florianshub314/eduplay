<script>
  import { goto } from "$app/navigation";
  import { onMount, onDestroy } from "svelte";
  import { supabase } from "$lib/supabaseClient";

  let session = null;
  let loading = true;
  let saving = false;
  let saveStatus = "";
  let saveError = "";
  let authSubscription;

  let fullName = "";
  let gradeLevel = "";
  let favoriteSubject = "";
  let learningGoal = "";

  $: joinDate =
    session?.user?.created_at &&
    new Date(session.user.created_at).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });

  onMount(async () => {
    await loadSession();
    const { data } = supabase.auth.onAuthStateChange((_event, newSession) => {
      session = newSession;
      populateForm();
    });
    authSubscription = data.subscription;
  });

  onDestroy(() => {
    authSubscription?.unsubscribe();
  });

  async function loadSession() {
    const { data } = await supabase.auth.getSession();
    session = data.session;
    populateForm();
    loading = false;
  }

  function populateForm() {
    if (!session?.user) {
      fullName = "";
      gradeLevel = "";
      favoriteSubject = "";
      learningGoal = "";
      return;
    }

    const meta = session.user.user_metadata || {};
    fullName = meta.fullName || meta.full_name || "";
    gradeLevel = meta.gradeLevel || meta.grade || "";
    favoriteSubject = meta.favoriteSubject || "";
    learningGoal = meta.learningGoal || "";
  }

  async function saveProfile() {
    if (!session?.user) {
      goto("/login");
      return;
    }
    saving = true;
    saveStatus = "";
    saveError = "";

    const { error } = await supabase.auth.updateUser({
      data: {
        fullName,
        gradeLevel,
        favoriteSubject,
        learningGoal
      }
    });

    if (error) {
      saveError = error.message || "Profil konnte nicht gespeichert werden.";
    } else {
      saveStatus = "Dein Profil wurde gespeichert.";
      await loadSession();
    }

    saving = false;
  }

  async function logout() {
    saveError = "";
    try {
      await supabase.auth.signOut();
      session = null;
      populateForm();
      goto("/start");
    } catch (error) {
      saveError = error.message || "Abmelden fehlgeschlagen.";
    }
  }
</script>

<section class="profile-wrapper">
  <div class="profile-card">
    <div class="profile-head">
      <div>
        <p class="eyebrow">Willkommen zurück</p>
        <h1>Mein Profil</h1>
        <p class="subtitle">
          Verwalte deine Angaben, damit wir Spiele schneller vorbereiten können.
        </p>
      </div>
      {#if session}
        <div class="head-actions">
          <div class="badge">{session.user.email?.split("@")[0]}</div>
          <button class="btn-logout" type="button" on:click={logout}>
            Abmelden
          </button>
        </div>
      {/if}
    </div>

    {#if loading}
      <p class="status info">Profil wird geladen …</p>
    {:else if !session}
      <p class="status info">Bitte melde dich an, um dein Profil zu verwalten.</p>
      <button class="btn-primary" type="button" on:click={() => goto("/login")}>
        Zum Login
      </button>
    {:else}
      <div class="profile-meta">
        <div>
          <p class="meta-label">E-Mail</p>
          <p>{session.user.email}</p>
        </div>
        {#if joinDate}
          <div>
            <p class="meta-label">Dabei seit</p>
            <p>{joinDate}</p>
          </div>
        {/if}
        <div>
          <p class="meta-label">User-ID</p>
          <p class="uid">{session.user.id}</p>
        </div>
      </div>

      <form class="profile-form" on:submit|preventDefault={saveProfile}>
        <label>
          Name
          <input
            type="text"
            bind:value={fullName}
            placeholder="Max Mustermann"
          />
        </label>

        <label>
          Schulstufe / Klasse
          <input
            type="text"
            bind:value={gradeLevel}
            placeholder="z. B. 5. Klasse"
          />
        </label>

        <label>
          Lieblingsfach
          <input
            type="text"
            bind:value={favoriteSubject}
            placeholder="Mathematik, Deutsch ..."
          />
        </label>

        <label>
          Lernziel oder Fokus
          <textarea
            rows="3"
            bind:value={learningGoal}
            placeholder="Woran möchtest du besonders arbeiten?"
          ></textarea>
        </label>

        <div class="actions">
          <button class="btn-primary" type="submit" disabled={saving}>
            {saving ? "Speichere …" : "Profil speichern"}
          </button>
        </div>

        {#if saveStatus}
          <p class="status success">{saveStatus}</p>
        {/if}
        {#if saveError}
          <p class="status error">{saveError}</p>
        {/if}
      </form>
    {/if}
  </div>
</section>

<style>
  .profile-wrapper {
    min-height: calc(100vh - 120px);
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding: 40px 16px 80px;
    background: linear-gradient(180deg, #eef2ff 0%, #f8fafc 45%, #ffffff 100%);
    font-family:
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      sans-serif;
  }

  .profile-card {
    width: 100%;
    max-width: 720px;
    background: #fff;
    border-radius: 32px;
    padding: 32px;
    border: 2px solid #e0e7ff;
    box-shadow: 0 25px 60px rgba(15, 23, 42, 0.12);
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .profile-head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
  }

  .head-actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  h1 {
    margin: 0;
    font-size: clamp(2rem, 3vw, 2.4rem);
  }

  .subtitle {
    margin: 8px 0 0;
    color: #475569;
  }

  .eyebrow {
    margin: 0 0 4px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    font-size: 0.65rem;
    color: #94a3b8;
  }

  .badge {
    border-radius: 999px;
    background: #eef2ff;
    color: #4338ca;
    font-weight: 600;
    padding: 8px 14px;
  }

  .btn-logout {
    border-radius: 999px;
    border: 2px solid #fca5a5;
    padding: 8px 16px;
    background: white;
    color: #b91c1c;
    font-weight: 600;
    cursor: pointer;
  }

  .profile-meta {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 16px;
    border-radius: 20px;
    background: #f8fafc;
    padding: 16px 20px;
    border: 1px solid #e2e8f0;
  }

  .meta-label {
    margin: 0;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #475569;
  }

  .uid {
    font-size: 0.85rem;
    word-break: break-all;
  }

  .profile-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  label {
    display: flex;
    flex-direction: column;
    font-weight: 600;
    color: #0f172a;
    gap: 8px;
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

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 8px;
  }

  .btn-primary {
    border-radius: 999px;
    padding: 12px 28px;
    font-weight: 600;
    border: none;
    cursor: pointer;
  }
  .btn-primary {
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    color: white;
    box-shadow: 0 12px 30px rgba(99, 102, 241, 0.35);
  }

  .status {
    margin: 0;
    font-weight: 600;
    font-size: 0.95rem;
  }

  .status.success {
    color: #16a34a;
  }

  .status.error {
    color: #dc2626;
  }

  .status.info {
    color: #475569;
  }

  @media (max-width: 640px) {
    .profile-card {
      padding: 24px;
    }

    .profile-head {
      flex-direction: column;
    }
  }
</style>
