<script>
  import { goto } from "$app/navigation";
  function continueAsGuest() {
    goto("/start");
  }

  function openLogin() {
    goto("/login");
  }
</script>

<style>
  :root {
    --bg: linear-gradient(160deg, #fff7ed 0%, #e0f2fe 45%, #ecfdf3 100%);
    --ink: #0f172a;
    --yellow: #fef08a;
    --green: #22c55e;
    --blue: #38bdf8;
    --orange: #f97316;
    --pink: #fb7185;
    --card: #ffffff;
    --shadow: 12px 12px 0 rgba(15, 23, 42, 0.14);
    --shadow-lg: 18px 18px 0 rgba(15, 23, 42, 0.18);
    --r-lg: 32px;
    --r-md: 20px;
    --r-sm: 14px;
  }

  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.001ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.001ms !important;
    }
  }

  main {
    font-family: "Baloo 2", "Fredoka", "Nunito", system-ui, -apple-system, BlinkMacSystemFont,
      "Segoe UI", sans-serif;
    min-height: 100vh;
    background: radial-gradient(circle at 18% 18%, rgba(255, 237, 213, 0.7), transparent 36%),
      radial-gradient(circle at 78% 12%, rgba(191, 219, 254, 0.7), transparent 30%),
      radial-gradient(circle at 20% 82%, rgba(244, 114, 182, 0.3), transparent 32%),
      var(--bg);
    color: var(--ink);
    position: relative;
    overflow-x: hidden;
  }

  .dots {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background-image: radial-gradient(rgba(15, 23, 42, 0.05) 1px, transparent 0);
    background-size: 22px 22px;
    opacity: 0.35;
  }

  .page-shell {
    max-width: 1200px;
    margin: 0 auto;
    padding: 32px 20px 90px;
    position: relative;
    z-index: 1;
  }

  .shape {
    position: absolute;
    border: 4px solid var(--ink);
    border-radius: 26px;
    box-shadow: var(--shadow);
    opacity: 0.9;
    z-index: 0;
  }

  .shape.one {
    width: 220px;
    height: 140px;
    top: 40px;
    left: -60px;
    background: linear-gradient(135deg, var(--blue), var(--green));
    transform: rotate(-6deg);
  }

  .shape.two {
    width: 190px;
    height: 190px;
    top: 180px;
    right: -80px;
    background: linear-gradient(135deg, var(--orange), var(--pink));
    transform: rotate(12deg);
  }

  .shape.three {
    width: 160px;
    height: 120px;
    bottom: 60px;
    left: 20px;
    background: linear-gradient(135deg, var(--yellow), #fff);
    transform: rotate(-10deg);
  }

  .nav {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    border: 4px solid var(--ink);
    border-radius: 30px;
    background: linear-gradient(135deg, #fffaf3, #ffe2f6);
    box-shadow: 16px 16px 0 rgba(15, 23, 42, 0.18);
    position: sticky;
    top: 18px;
    z-index: 10;
    overflow: hidden;
    max-width: 1200px;
    width: 100%;
    margin: 0 auto;
  }

  .logo {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    font-weight: 900;
    font-size: 1.2rem;
    letter-spacing: -0.01em;
    border: 3px solid var(--ink);
    border-radius: 999px;
    padding: 10px 14px;
    background: #fffef9;
    box-shadow: 10px 10px 0 rgba(15, 23, 42, 0.16);
    transition: transform 0.12s ease, box-shadow 0.12s ease;
  }

  .nav-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }

  .session-button {
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

  .logo:focus-visible,
  .session-button:focus-visible {
    outline: 3px solid #66d08f;
    outline-offset: 3px;
  }

  .logo-text {
    background: linear-gradient(120deg, var(--ink), #8b5cf6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .logo-badge {
    width: 34px;
    height: 34px;
    border-radius: 12px;
    background: linear-gradient(135deg, #66d08f, #8b5cf6);
    border: 3px solid var(--ink);
    box-shadow: 6px 6px 0 rgba(15, 23, 42, 0.16);
    display: grid;
    place-items: center;
    font-size: 1rem;
  }

  .nav-actions {
    display: flex;
    justify-content: flex-end;
  }

  .logo:hover {
    transform: translateY(-3px);
    box-shadow: 14px 14px 0 rgba(15, 23, 42, 0.22);
  }

  .nav-shapes {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .nav-shape {
    position: absolute;
    border: 3px solid var(--ink);
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
    background: var(--yellow);
    bottom: -30px;
    left: -30px;
    transform: rotate(-14deg);
  }

  .hero {
    margin: 34px 0 46px;
    padding: 34px 30px;
    border: 4px solid var(--ink);
    border-radius: var(--r-lg);
    background: linear-gradient(135deg, #ffffff, #fef3c7 55%, #dbeafe);
    box-shadow: var(--shadow-lg);
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 24px;
    position: relative;
    overflow: hidden;
  }

  .hero-visual {
    background: transparent;
    border: none;
    border-radius: 24px;
    min-height: 320px;
    position: relative;
    overflow: visible;
  }

  .hero h1 {
    font-size: clamp(2.4rem, 4vw, 3rem);
    margin: 0;
    letter-spacing: -0.02em;
    text-shadow: 6px 6px 0 rgba(15, 23, 42, 0.08);
  }

  .hero p {
    margin: 0;
    font-size: 1.1rem;
    opacity: 0.85;
  }

  .cta-stack {
    display: grid;
    gap: 12px;
    margin: 18px 0 8px;
    width: 100%;
    max-width: 420px;
  }

  button {
    padding: 1rem 1.5rem;
    font-size: 1.05rem;
    border-radius: var(--r-md);
    border: 3px solid var(--ink);
    cursor: pointer;
    font-weight: 800;
    min-width: 210px;
    box-shadow: 10px 10px 0 rgba(15, 23, 42, 0.16);
    transition: transform 0.12s ease, box-shadow 0.12s ease, background 0.12s ease;
  }

  .cta-row button {
    width: 100%;
  }

  .btn-primary {
    background: linear-gradient(135deg, var(--green), var(--blue));
    color: var(--ink);
  }

  .btn-secondary {
    background: var(--yellow);
    color: var(--ink);
  }

  .cta-hint {
    margin: 0;
    font-weight: 800;
    color: var(--ink);
    opacity: 0.78;
  }

  .hero-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 28px;
    align-items: center;
  }

  .hero-decision {
    display: grid;
    gap: 14px;
  }

  .decision-text {
    margin: 0;
    font-size: 1.08rem;
    line-height: 1.6;
  }

  .cta-column {
    display: grid;
    gap: 10px;
    width: 100%;
  }

  .helper-text {
    margin: 2px 0 0;
    font-weight: 700;
    color: var(--ink);
    opacity: 0.72;
  }

  .shape-stage {
    position: relative;
    min-height: 320px;
    overflow: visible;
  }

  .shape-dot {
    position: absolute;
    border-radius: 50%;
    border: 3px solid var(--ink);
    box-shadow: 8px 8px 0 rgba(15, 23, 42, 0.14);
  }

  .shape-dot.one {
    width: 160px;
    height: 160px;
    background: var(--yellow);
    top: 6px;
    left: 12px;
    transform: rotate(-10deg);
  }

  .shape-dot.two {
    width: 120px;
    height: 120px;
    background: var(--pink);
    bottom: -6px;
    right: 18px;
    transform: rotate(12deg);
  }

  .shape-block {
    position: absolute;
    width: 220px;
    height: 140px;
    background: linear-gradient(135deg, var(--blue), var(--green));
    border: 4px solid var(--ink);
    border-radius: 26px;
    box-shadow: 16px 16px 0 rgba(15, 23, 42, 0.18);
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(8deg);
  }

  .shape-ring {
    position: absolute;
    width: 180px;
    height: 180px;
    border-radius: 50%;
    border: 4px dashed var(--ink);
    top: -8px;
    right: 6px;
    opacity: 0.5;
  }

  button:hover {
    transform: translateY(-2px);
  }

  button:active {
    transform: translateY(2px);
  }

  .stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 16px;
    margin: 34px 0 10px;
  }

  .stat-card {
    border: 3px solid var(--ink);
    border-radius: 20px;
    background: var(--card);
    padding: 18px 18px 16px;
    box-shadow: 10px 10px 0 rgba(15, 23, 42, 0.14);
  }

  .stat-value {
    font-size: 2rem;
    font-weight: 900;
    margin: 0 0 6px;
    letter-spacing: -0.01em;
  }

  .stat-label {
    margin: 0;
    opacity: 0.75;
    font-weight: 700;
  }

  .section-title {
    margin: 40px 0 12px;
    font-size: 1.6rem;
    letter-spacing: -0.01em;
    text-shadow: 4px 4px 0 rgba(15, 23, 42, 0.08);
  }

  .partners {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 12px;
  }

  .partner {
    border: 3px dashed var(--ink);
    border-radius: 18px;
    padding: 12px;
    text-align: center;
    background: var(--card);
    box-shadow: 8px 8px 0 rgba(15, 23, 42, 0.12);
    font-weight: 800;
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 16px;
  }

  .info-card {
    border: 3px solid var(--ink);
    border-radius: 22px;
    padding: 18px;
    background: var(--card);
    box-shadow: 10px 10px 0 rgba(15, 23, 42, 0.14);
  }

  .info-card h3 {
    margin: 0 0 8px;
    font-size: 1.2rem;
  }

  .info-card p {
    margin: 0;
    opacity: 0.8;
  }

  .reviews {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 14px;
  }

  .review {
    border: 3px solid var(--ink);
    border-radius: 18px;
    padding: 16px;
    background: var(--card);
    box-shadow: 10px 10px 0 rgba(15, 23, 42, 0.14);
  }

  .review strong {
    display: block;
    margin-bottom: 6px;
  }

  .timeline {
    border-left: 4px solid var(--ink);
    padding-left: 16px;
    display: grid;
    gap: 14px;
  }

  .step {
    position: relative;
    border: 3px solid var(--ink);
    border-radius: 18px;
    padding: 14px 16px 14px 46px;
    background: var(--card);
    box-shadow: 10px 10px 0 rgba(15, 23, 42, 0.14);
  }

  .step::before {
    content: attr(data-step);
    position: absolute;
    left: -30px;
    top: 14px;
    width: 44px;
    height: 44px;
    border-radius: 14px;
    border: 3px solid var(--ink);
    background: var(--yellow);
    display: grid;
    place-items: center;
    font-weight: 900;
    box-shadow: 6px 6px 0 rgba(15, 23, 42, 0.14);
  }

  footer {
    margin-top: 50px;
    border-top: 4px solid var(--ink);
    padding-top: 20px;
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    justify-content: space-between;
    font-weight: 700;
  }

  footer .badge {
    border: 3px solid var(--ink);
    border-radius: 16px;
    padding: 10px 14px;
    background: var(--card);
    box-shadow: 8px 8px 0 rgba(15, 23, 42, 0.12);
  }

  @media (max-width: 720px) {
    .nav {
      position: static;
    }
    .shape.one,
    .shape.two {
      opacity: 0.35;
    }
    .step::before {
      left: -22px;
    }
  }
</style>

<main>
  <div class="dots" aria-hidden="true"></div>
  <div class="shape one" aria-hidden="true"></div>
  <div class="shape two" aria-hidden="true"></div>
  <div class="shape three" aria-hidden="true"></div>

  <div class="page-shell">
    <nav class="nav" aria-label="Hauptnavigation">
      <div class="nav-shapes" aria-hidden="true">
        <span class="nav-shape a"></span>
        <span class="nav-shape b"></span>
      </div>
      <div class="logo">
        <span class="logo-badge" aria-hidden="true">EP</span>
        <span class="logo-text">EduPlay</span>
      </div>
      <div class="nav-actions">
        <button
          type="button"
          class="session-button"
          on:click={openLogin}
          title="Anmelden"
          aria-label="Anmelden"
        >
          <span class="avatar">👤</span>
          <span class="session-text">
            <span>Nicht angemeldet</span>
            <span class="session-action">Anmelden</span>
          </span>
        </button>
      </div>
    </nav>

    <section class="hero" id="hero">
      <div class="hero-grid">
        <div class="hero-decision">
          <h1>EduPlay macht Unterricht zu einem schnellen Lernspiel.</h1>
          <p class="decision-text">
            Starte Matches, erstelle Frage-Sets oder lass die KI neue Aufgaben generieren – alles in
            einem klaren Spielfeld-Interface.
          </p>
          <div class="cta-column" aria-label="Schnellstart">
            <button class="btn-primary" on:click={continueAsGuest}>Jetzt als Gast starten</button>
            <button class="btn-secondary" on:click={openLogin}>Anmelden / Sets sichern</button>
          </div>
          <p class="helper-text">
            Gast erlaubt sofortiges Starten. Anmelden ermöglicht Speichern von Sets.
          </p>
        </div>
        <div class="hero-visual" aria-hidden="true">
          <div class="shape-stage">
            <span class="shape-dot one"></span>
            <span class="shape-dot two"></span>
            <span class="shape-block"></span>
            <span class="shape-ring"></span>
          </div>
        </div>
      </div>
    </section>

    <section id="stats" aria-labelledby="stats-title">
      <h2 class="section-title" id="stats-title">Schnelle Kennzahlen</h2>
      <div class="stats">
        <div class="stat-card">
          <p class="stat-value">12k+</p>
          <p class="stat-label">gespielte Runden im Unterricht</p>
        </div>
        <div class="stat-card">
          <p class="stat-value">350+</p>
          <p class="stat-label">Fragensets von Lehrkräften</p>
        </div>
        <div class="stat-card">
          <p class="stat-value">4 Fächer</p>
          <p class="stat-label">Mathe, Deutsch, Englisch, Französisch</p>
        </div>
        <div class="stat-card">
          <p class="stat-value">100%</p>
          <p class="stat-label">touchfreundlich & smartboard-ready</p>
        </div>
      </div>
    </section>

    <section id="proof" aria-labelledby="proof-title">
      <h2 class="section-title" id="proof-title">Partner & Schulen</h2>
      <div class="partners">
        <div class="partner">Stadt Zürich Schulen</div>
        <div class="partner">Lernstudio Plus</div>
        <div class="partner">KidsLab Community</div>
        <div class="partner">EduTech Netzwerk</div>
      </div>
    </section>

    <section id="info" aria-labelledby="info-title">
      <h2 class="section-title" id="info-title">Was EduPlay besonders macht</h2>
      <div class="info-grid">
        <div class="info-card">
          <h3>Geometrisch, laut & klar</h3>
          <p>Große Buttons, kräftige Konturen und spielerische Farbflächen sorgen für Orientierung auch auf Distanz.</p>
        </div>
        <div class="info-card">
          <h3>KI-Unterstützung</h3>
          <p>Lass dir in Sekunden neue Fragen generieren oder nutze PDF/TXT Inhalte deiner Stunde.</p>
        </div>
        <div class="info-card">
          <h3>Teambasierte Matches</h3>
          <p>Blau vs. Rot: Punkte, Tore und Timer halten die Klasse in Bewegung.</p>
        </div>
        <div class="info-card">
          <h3>Speicherbare Sets</h3>
          <p>Eigene Sets ablegen, wiederverwenden und teilen – alles an einem Ort.</p>
        </div>
      </div>
    </section>

    <section id="reviews" aria-labelledby="reviews-title">
      <h2 class="section-title" id="reviews-title">Stimmen aus der Community</h2>
      <div class="reviews">
        <div class="review">
          <strong>Frau Steiner, Primarlehrerin</strong>
          “Meine Klasse liebt die schnellen Runden – endlich macht Rechtschreibung Spaß.”
        </div>
        <div class="review">
          <strong>Herr Baumann, Sekundarlehrer</strong>
          “Das Spielfeld funktioniert perfekt am Smartboard. Alle sind sofort dabei.”
        </div>
        <div class="review">
          <strong>Team Lernatelier</strong>
          “KI-Fragen aus PDFs – genau das hat gefehlt. Spart Vorbereitung und bringt Abwechslung.”
        </div>
      </div>
    </section>

    <section id="timeline" aria-labelledby="timeline-title">
      <h2 class="section-title" id="timeline-title">So läuft eine Runde</h2>
      <div class="timeline">
        <div class="step" data-step="1">
          Fach wählen, Teams benennen und Frageanzahl festlegen.
        </div>
        <div class="step" data-step="2">
          Eigene Aufgaben hochladen, manuell eintippen oder KI generieren lassen.
        </div>
        <div class="step" data-step="3">
          Match starten: Fragen beantworten, Ball bewegen, Tore feiern.
        </div>
        <div class="step" data-step="4">
          Sieger anzeigen, Set speichern oder direkt die nächste Runde spielen.
        </div>
      </div>
    </section>

    <footer>
      <span class="badge">EduPlay · Lernspiele für Klassen</span>
      <span>Kontakt: hello@eduplay.local</span>
      <span>Bereit? Starte als Gast oder melde dich an.</span>
    </footer>
  </div>
</main>
