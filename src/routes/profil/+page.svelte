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
    padding: 48px 16px 88px;
    background: radial-gradient(circle at 18% 18%, rgba(255, 237, 213, 0.7), transparent 34%),
      radial-gradient(circle at 80% 12%, rgba(191, 219, 254, 0.7), transparent 32%),
      radial-gradient(circle at 24% 82%, rgba(244, 114, 182, 0.3), transparent 32%),
      linear-gradient(160deg, #fff7ed 0%, #e0f2fe 45%, #ecfdf3 100%);
    font-family: "Baloo 2", "Fredoka", "Nunito", system-ui, -apple-system, BlinkMacSystemFont,
      "Segoe UI", sans-serif;
  }

  .profile-card {
    width: 100%;
    max-width: 720px;
    background: linear-gradient(135deg, #ffffff, #fef3c7 55%, #dbeafe);
    border-radius: 32px;
    padding: 32px;
    border: 4px solid #0f172a;
    box-shadow: 18px 18px 0 rgba(15, 23, 42, 0.18);
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
    font-size: clamp(2.2rem, 3vw, 2.6rem);
    letter-spacing: -0.02em;
    color: #0f172a;
    text-shadow: 6px 6px 0 rgba(15, 23, 42, 0.08);
  }

  .subtitle {
    margin: 8px 0 0;
    color: #0f172a;
    opacity: 0.72;
  }

  .eyebrow {
    margin: 0 0 4px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    font-size: 0.65rem;
    color: #0f172a;
    opacity: 0.7;
  }

  .badge {
    border-radius: 16px;
    background: #fef08a;
    color: #0f172a;
    font-weight: 800;
    padding: 8px 14px;
    border: 3px solid #0f172a;
    box-shadow: 8px 8px 0 rgba(15, 23, 42, 0.12);
  }

  .btn-logout {
    border-radius: 18px;
    border: 3px solid #0f172a;
    padding: 10px 16px;
    background: linear-gradient(135deg, #fb7185, #f97316);
    color: #0f172a;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 10px 10px 0 rgba(15, 23, 42, 0.14);
  }

  .profile-meta {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 16px;
    border-radius: 20px;
    background: #fff;
    padding: 16px 20px;
    border: 3px solid #0f172a;
    box-shadow: 10px 10px 0 rgba(15, 23, 42, 0.12);
  }

  .meta-label {
    margin: 0;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #0f172a;
    opacity: 0.7;
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
    font-weight: 800;
    color: #0f172a;
    gap: 8px;
  }

  input,
  textarea {
    border-radius: 18px;
    border: 3px solid #0f172a;
    padding: 12px 16px;
    font-size: 1rem;
    font-family: inherit;
    box-shadow: 8px 8px 0 rgba(15, 23, 42, 0.12);
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
    border-radius: 18px;
    padding: 12px 28px;
    font-weight: 800;
    border: 3px solid #0f172a;
    cursor: pointer;
    background: linear-gradient(135deg, #22c55e, #38bdf8);
    color: #0f172a;
    box-shadow: 10px 10px 0 rgba(15, 23, 42, 0.16);
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

  .btn-primary:hover,
  .btn-logout:hover {
    transform: translateY(-2px);
  }

  .btn-primary:active,
  .btn-logout:active {
    transform: translateY(2px);
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
