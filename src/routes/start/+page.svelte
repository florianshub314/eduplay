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
</script>

<style>
  main {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-height: 100vh;
    background: radial-gradient(circle at 18% 18%, rgba(255, 237, 213, 0.7), transparent 34%),
      radial-gradient(circle at 82% 16%, rgba(191, 219, 254, 0.7), transparent 32%),
      radial-gradient(circle at 24% 82%, rgba(244, 114, 182, 0.3), transparent 32%),
      linear-gradient(160deg, #fff7ed 0%, #e0f2fe 45%, #ecfdf3 100%);
    font-family: "Baloo 2", "Fredoka", "Nunito", system-ui, -apple-system, BlinkMacSystemFont,
      "Segoe UI", sans-serif;
    text-align: center;
    padding: 72px 18px 80px;
    position: relative;
    overflow: hidden;
  }

  main::before,
  main::after {
    content: "";
    position: absolute;
    border-radius: 32px;
    opacity: 0.7;
    filter: drop-shadow(10px 10px 0 rgba(15, 23, 42, 0.14));
  }

  main::before {
    width: 160px;
    height: 160px;
    top: 60px;
    left: 24px;
    background: linear-gradient(135deg, #38bdf8, #22c55e);
    transform: rotate(-8deg);
  }

  main::after {
    width: 200px;
    height: 120px;
    bottom: 42px;
    right: 28px;
    background: linear-gradient(135deg, #f97316, #fb7185);
    transform: rotate(10deg);
  }

  .wrapper {
    position: relative;
    z-index: 1;
    max-width: 1120px;
    width: 100%;
    padding: 28px;
    border: 4px solid #0f172a;
    border-radius: 32px;
    background: linear-gradient(135deg, #ffffff, #fef3c7 55%, #dbeafe);
    box-shadow: 18px 18px 0 rgba(15, 23, 42, 0.18);
  }

  h1 {
    font-size: 2.6rem;
    margin: 0 0 0.6rem;
    font-weight: 900;
    letter-spacing: -0.02em;
    color: #0f172a;
    text-shadow: 6px 6px 0 rgba(15, 23, 42, 0.08);
  }

  p {
    font-size: 1.1rem;
    margin: 0 0 2rem;
    color: #0f172a;
    opacity: 0.82;
  }

  .cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 22px;
    width: 100%;
  }

  .subject-card {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 28px 26px;
    border-radius: 24px;
    border: 3px solid #0f172a;
    background: #fff;
    box-shadow: 12px 12px 0 rgba(15, 23, 42, 0.16);
    cursor: pointer;
    transition: transform 0.12s ease, box-shadow 0.12s ease, background 0.12s ease;
    text-align: left;
    min-height: 180px;
  }

  .subject-card:hover {
    transform: translateY(-2px);
    box-shadow: 10px 14px 0 rgba(15, 23, 42, 0.2);
    background: #fef08a;
  }

  .subject-card h2 {
    margin: 0;
    font-size: 1.5rem;
    letter-spacing: -0.01em;
  }

  .subject-card p {
    margin: 0.45rem 0 0;
    color: #0f172a;
    opacity: 0.7;
    font-size: 1rem;
  }

  .subject-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border-radius: 14px;
    border: 3px solid #0f172a;
    font-size: 0.95rem;
    font-weight: 900;
    letter-spacing: 0.04em;
    background: linear-gradient(135deg, #66d08f, #8b5cf6);
    color: #0f172a;
    box-shadow: 8px 8px 0 rgba(15, 23, 42, 0.14);
    margin-bottom: 0.8rem;
  }
</style>

<main>
  <div class="wrapper">
    <h1>Wähle ein Fach aus</h1>
    <p>Starte ein Spiel:</p>

    <div class="cards">
      {#each subjects as subject}
        <button class="subject-card" on:click={subject.action}>
          <span class="subject-icon">{subject.icon}</span>
          <h2>{subject.title}</h2>
          <p>{subject.desc}</p>
        </button>
      {/each}
    </div>
  </div>
</main>
