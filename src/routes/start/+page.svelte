<script>
  import { goto } from "$app/navigation";

  const subjects = [
    {
      icon: "MA",
      title: "Mathematik",
      desc: "Rechenaufgaben als Fussballspiel",
      action: () => goto("/mathe")
    },
    {
      icon: "DE",
      title: "Deutsch",
      desc: "Silben, Artikel und Rechtschreibung",
      action: () => goto("/deutsch")
    },
    {
      icon: "EN",
      title: "Englisch",
      desc: "English vocabulary and grammar",
      action: () => goto("/englisch")
    },
    {
      icon: "FR",
      title: "Französisch",
      desc: "Vokabeln und Sprechübungen",
      action: () => goto("/franzoesisch")
    },
    {
      icon: "AN",
      title: "Andere Fächer",
      desc: "Konfiguration für diverse Themen",
      action: () => goto("/andere")
    },
    {
      icon: "GS",
      title: "Gespeicherte Sets",
      desc: "Vorbereitete Fragen- und KI-Sets",
      action: () => goto("/sets")
    }
  ];

  let subjectsSection;

  function scrollToSubjects() {
    if (typeof window === "undefined") return;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    subjectsSection?.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start"
    });
  }
</script>

<main class="page-shell">
  <div class="bg-shapes" aria-hidden="true">
    <span class="shape shape-a"></span>
    <span class="shape shape-b"></span>
    <span class="shape shape-c"></span>
    <span class="shape shape-d"></span>
  </div>

  <section class="hero">
    <div class="hero-grid">
      <div class="hero-copy">
        <p class="eyebrow">Fächer</p>
        <h1>Wähle dein Spielfeld und starte sofort.</h1>
        <p class="lede">
          Klick auf ein Fach, spring direkt ins Spiel oder greif auf deine gespeicherten Sets zu. Das
          Layout und die Farben passen jetzt zum Deutsch-Flow.
        </p>
        <div class="cta-row">
          <button class="cta-button primary" type="button" on:click={scrollToSubjects}>
            Fächer anzeigen
          </button>
          <button class="cta-button ghost" type="button" on:click={() => goto("/sets")}>
            Zu gespeicherten Sets
          </button>
        </div>
        <ul class="mini-list">
          <li>Starker Kontrast, klare Kacheln wie auf der Deutsch-Seite</li>
          <li>Alle Fächer im gleichen Look, touchfreundlich</li>
          <li>Sets & KI-Optionen bleiben erreichbar</li>
        </ul>
      </div>
      <div class="hero-visual" aria-hidden="true">
        <div class="visual-card">
          <div class="visual-top">
            <p class="visual-label">Schnellstart</p>
            <div class="pill pill-green">6 Optionen</div>
          </div>
          <div class="visual-metrics">
            <div>
              <p class="metric-label">Teams</p>
              <p class="metric-value">Blau vs Rot</p>
            </div>
            <div>
              <p class="metric-label">KI</p>
              <p class="metric-value">PDF/TXT</p>
            </div>
            <div>
              <p class="metric-label">Modus</p>
              <p class="metric-value">Wandtafel</p>
            </div>
          </div>
          <ul class="visual-list">
            <li>Alle Fächer im neuen Look</li>
            <li>Fragen speichern & laden</li>
            <li>Für Smartboard optimiert</li>
          </ul>
          <div class="visual-shapes">
            <span class="chip chip-pink"></span>
            <span class="chip chip-yellow"></span>
            <span class="chip chip-violet"></span>
            <span class="chip chip-green"></span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="subjects" id="subjects" bind:this={subjectsSection}>
    <div class="section-heading">
      <p class="eyebrow">Alle Fächer</p>
      <h2>Im selben Look wie Deutsch</h2>
      <p class="section-lede">
        Wähle ein Fach oder spring direkt zu den gespeicherten Sets. Karten, Schatten und Farben sind
        identisch zum Deutsch-Flow.
      </p>
    </div>
    <div class="subject-grid">
      {#each subjects as subject}
        <button class="subject-card" on:click={subject.action}>
          <span class="subject-icon">{subject.icon}</span>
          <div class="subject-text">
            <h3>{subject.title}</h3>
            <p>{subject.desc}</p>
            <span class="subject-cta">Spiel öffnen →</span>
          </div>
        </button>
      {/each}
    </div>
  </section>
</main>

<style>
  :global(:root) {
    --ink: #1f1a2d;
    --bg: #fdf7ef;
    --card: #fffdf8;
    --accent-violet: #8b5cf6;
    --accent-pink: #ff6fb7;
    --accent-yellow: #ffd166;
    --accent-green: #66d08f;
  }

  :global(body) {
    background: var(--bg);
    color: var(--ink);
    font-family: "Manrope", "Baloo 2", "Fredoka", system-ui, -apple-system,
      BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  .page-shell {
    position: relative;
    min-height: 100vh;
    overflow: hidden;
    padding: 42px 18px 96px;
  }

  .bg-shapes .shape {
    position: absolute;
    border: 4px solid var(--ink);
    border-radius: 999px;
    box-shadow: 12px 12px 0 rgba(31, 26, 45, 0.16);
    opacity: 0.6;
  }

  .bg-shapes .shape-a {
    width: 240px;
    height: 240px;
    background: var(--accent-yellow);
    top: -80px;
    right: 8%;
    transform: rotate(-10deg);
  }

  .bg-shapes .shape-b {
    width: 160px;
    height: 160px;
    background: var(--accent-pink);
    bottom: 10%;
    left: 6%;
    transform: rotate(14deg);
  }

  .bg-shapes .shape-c {
    width: 140px;
    height: 140px;
    background: #8ce9ff;
    top: 16%;
    left: -40px;
    transform: rotate(-12deg);
  }

  .bg-shapes .shape-d {
    width: 110px;
    height: 110px;
    background: var(--accent-violet);
    bottom: -50px;
    right: 12%;
    transform: rotate(16deg);
  }

  .hero {
    position: relative;
    max-width: 1180px;
    margin: 0 auto 70px;
    padding: 42px;
    border: 4px solid var(--ink);
    border-radius: 34px;
    background: linear-gradient(135deg, #fffaf3 0%, #fff3e2 50%, #ffeaf9 100%);
    box-shadow: 16px 16px 0 rgba(31, 26, 45, 0.16);
    overflow: hidden;
  }

  .hero-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 32px;
    align-items: center;
    position: relative;
    z-index: 1;
  }

  .hero-copy h1 {
    font-size: clamp(2.5rem, 4vw, 3.4rem);
    margin: 10px 0 12px;
    letter-spacing: -0.02em;
  }

  .hero-copy .lede {
    font-size: 1.05rem;
    line-height: 1.6;
    max-width: 540px;
    margin: 0 0 18px;
  }

  .eyebrow {
    font-weight: 900;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-size: 0.95rem;
    display: inline-block;
    padding: 10px 16px;
    border: 3px solid var(--ink);
    border-radius: 999px;
    background: #fffef9;
    box-shadow: 8px 8px 0 rgba(31, 26, 45, 0.14);
    margin: 0;
  }

  .cta-row {
    display: flex;
    gap: 14px;
    flex-wrap: wrap;
    margin-bottom: 10px;
  }

  .cta-button {
    border: 3px solid var(--ink);
    border-radius: 999px;
    padding: 14px 22px;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 10px 10px 0 rgba(31, 26, 45, 0.18);
    transition: transform 120ms ease, box-shadow 120ms ease, background 120ms ease;
  }

  .cta-button.primary {
    background: linear-gradient(120deg, var(--accent-violet), var(--accent-pink));
    color: var(--ink);
  }

  .cta-button.ghost {
    background: #fff;
    color: var(--ink);
  }

  .cta-button:hover {
    transform: translateY(-3px);
    box-shadow: 14px 14px 0 rgba(31, 26, 45, 0.24);
  }

  .cta-button:active {
    transform: translateY(2px);
    box-shadow: 6px 6px 0 rgba(31, 26, 45, 0.2);
  }

  .mini-list {
    margin: 0;
    padding-left: 18px;
    display: grid;
    gap: 6px;
    font-weight: 700;
  }

  .hero-visual {
    position: relative;
  }

  .visual-card {
    position: relative;
    background: var(--card);
    border: 4px solid var(--ink);
    border-radius: 28px;
    padding: 26px;
    box-shadow: 16px 16px 0 rgba(31, 26, 45, 0.18);
    overflow: hidden;
  }

  .visual-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
  }

  .visual-label {
    margin: 0;
    font-weight: 800;
  }

  .pill {
    border: 3px solid var(--ink);
    border-radius: 999px;
    padding: 8px 14px;
    font-weight: 800;
    box-shadow: 8px 8px 0 rgba(31, 26, 45, 0.12);
  }

  .pill-green {
    background: var(--accent-green);
  }

  .visual-metrics {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
    gap: 14px;
    margin: 18px 0;
  }

  .metric-label {
    margin: 0 0 4px;
    font-size: 0.9rem;
    font-weight: 700;
  }

  .metric-value {
    margin: 0;
    font-size: 1.4rem;
    font-weight: 900;
  }

  .visual-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    gap: 10px;
  }

  .visual-list li {
    padding: 12px 14px;
    border: 3px solid var(--ink);
    border-radius: 18px;
    background: #fff;
    box-shadow: 10px 10px 0 rgba(31, 26, 45, 0.12);
    font-weight: 700;
  }

  .visual-shapes {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .chip {
    position: absolute;
    border: 3px solid var(--ink);
    border-radius: 50%;
    width: 42px;
    height: 42px;
    box-shadow: 8px 8px 0 rgba(31, 26, 45, 0.12);
  }

  .chip-pink {
    background: var(--accent-pink);
    top: 12%;
    right: 10%;
  }

  .chip-yellow {
    background: var(--accent-yellow);
    bottom: 18%;
    right: 6%;
  }

  .chip-violet {
    background: var(--accent-violet);
    bottom: 12%;
    left: 10%;
  }

  .chip-green {
    background: var(--accent-green);
    top: 18%;
    left: 16%;
  }

  .subjects {
    max-width: 1180px;
    margin: 0 auto;
    position: relative;
  }

  .section-heading h2 {
    font-size: clamp(2rem, 3vw, 2.4rem);
    margin: 10px 0 8px;
  }

  .section-lede {
    margin: 0 0 18px;
    font-size: 1.05rem;
    line-height: 1.6;
    max-width: 820px;
  }

  .subject-grid {
    margin-top: 18px;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 16px;
  }

  .subject-card {
    display: grid;
    grid-template-columns: auto 1fr;
    align-items: center;
    gap: 14px;
    padding: 18px 16px;
    border: 4px solid var(--ink);
    border-radius: 22px;
    background: linear-gradient(135deg, #fff, #fff7e8 55%, #eaf5ff);
    box-shadow: 14px 14px 0 rgba(31, 26, 45, 0.16);
    text-align: left;
    cursor: pointer;
    transition: transform 0.12s ease, box-shadow 0.12s ease, background 0.12s ease;
  }

  .subject-card:hover {
    transform: translateY(-3px);
    box-shadow: 18px 18px 0 rgba(31, 26, 45, 0.2);
  }

  .subject-icon {
    display: grid;
    place-items: center;
    width: 54px;
    height: 54px;
    border-radius: 16px;
    border: 3px solid var(--ink);
    font-size: 0.95rem;
    font-weight: 900;
    letter-spacing: 0.04em;
    background: linear-gradient(135deg, #66d08f, #8b5cf6);
    color: var(--ink);
    box-shadow: 8px 8px 0 rgba(31, 26, 45, 0.14);
  }

  .subject-text h3 {
    margin: 0;
    font-size: 1.2rem;
    letter-spacing: -0.01em;
  }

  .subject-text p {
    margin: 4px 0 8px;
    opacity: 0.8;
    line-height: 1.4;
  }

  .subject-cta {
    font-weight: 800;
  }

  .hero,
  .visual-card,
  .subject-card {
    transition: transform 180ms ease, box-shadow 180ms ease;
  }

  .hero:hover,
  .visual-card:hover {
    transform: translateY(-4px);
    box-shadow: 20px 20px 0 rgba(31, 26, 45, 0.2);
  }

  @media (max-width: 780px) {
    .hero {
      padding: 30px;
    }

    .cta-row {
      width: 100%;
    }

    .cta-button {
      flex: 1;
      text-align: center;
    }
  }

  @media (max-width: 600px) {
    .hero {
      margin-bottom: 50px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .hero,
    .visual-card,
    .subject-card,
    .cta-button {
      transition: none;
    }
  }
</style>
