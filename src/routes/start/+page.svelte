<script>
  import { goto } from "$app/navigation";
const subjects = [
    {
      icon: "📘",
      title: "Mathematik",
      desc: "Rechenaufgaben als Fussballspiel",
      action: () => goto("/mathe")
    },
    {
      icon: "📙",
      title: "Deutsch",
      desc: "Silben, Artikel und Rechtschreibung",
      action: () => goto("/deutsch")
    },
    {
      icon: "📗",
      title: "Englisch",
      desc: "English vocabulary and grammar",
      action: () => goto("/englisch")
    },
    {
      icon: "📕",
      title: "Französisch",
      desc: "Vokabeln und Sprechübungen",
      action: () => goto("/franzoesisch")
    },
    {
      icon: "🌍",
      title: "Andere Fächer",
      desc: "Konfiguration für diverse Themen",
      action: () => goto("/andere")
    },
    {
      icon: "💾",
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
    background: linear-gradient(180deg, #eef2ff 0%, #f8fafc 40%, #ffffff 100%);
    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
    text-align: center;
    padding: 3rem 1rem 4rem;
  }

  h1 {
    font-size: 2.4rem;
    margin-bottom: 0.5rem;
    font-weight: 700;
  }

  p {
    font-size: 1.1rem;
    margin-bottom: 2.5rem;
    color: #475569;
  }

  .cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 24px;
    width: min(1100px, 100%);
  }

  .subject-card {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 28px 32px;
    border-radius: 32px;
    border: 2px solid #e2e8f0;
    background: white;
    box-shadow: 0 15px 40px rgba(15, 23, 42, 0.08);
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    text-align: left;
  }

  .subject-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 25px 50px rgba(37, 99, 235, 0.15);
  }

  .subject-card h2 {
    margin: 0;
    font-size: 1.5rem;
  }

  .subject-card p {
    margin: 0.3rem 0 0;
    color: #64748b;
    font-size: 1rem;
  }

  .subject-icon {
    font-size: 2rem;
    margin-bottom: 0.8rem;
  }
</style>

<main>
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
</main>
