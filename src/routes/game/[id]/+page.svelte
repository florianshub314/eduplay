<script>
  export let data;
  const { set } = data;

  function formatDate(value) {
    if (!value) return "";
    const date = new Date(value);
    return date.toLocaleString("de-CH", {
      dateStyle: "medium",
      timeStyle: "short"
    });
  }
</script>

<svelte:head>
  <title>{set.title} | Fragen-Set</title>
</svelte:head>

<main class="game-set">
  <header>
    <p class="subject">{set.subject}</p>
    <h1>{set.title}</h1>
    <p class="meta">
      {set.questions.length} Fragen · {formatDate(set.createdAt)}
    </p>
    <a class="back-link" href="/sets">← Zurück zu den Sets</a>
  </header>

  <section class="questions">
    {#each set.questions as question, idx}
      <article class="question-card">
        <header>
          <span># {idx + 1}</span>
          <h2>{question.question}</h2>
        </header>

        {#if question.answers?.length}
          <ul class="answers">
            {#each question.answers as answer}
              <li class:correct={answer === question.correct}>{answer}</li>
            {/each}
          </ul>
        {/if}

        {#if question.correct}
          <p class="solution">✔ Richtige Antwort: {question.correct}</p>
        {/if}
      </article>
    {/each}
  </section>
</main>

<style>
  .game-set {
    max-width: 1000px;
    margin: 0 auto;
    padding: 2.5rem 1.5rem 4rem;
    font-family:
      system-ui,
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      sans-serif;
  }

  header .subject {
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #6366f1;
    font-weight: 600;
  }

  h1 {
    margin: 0.25rem 0 0.5rem;
    font-size: clamp(2rem, 3vw, 2.8rem);
  }

  .meta {
    color: #64748b;
    margin-bottom: 0.4rem;
  }

  .back-link {
    color: #2563eb;
    text-decoration: none;
    font-weight: 600;
  }

  .questions {
    margin-top: 2rem;
    display: grid;
    gap: 1.25rem;
  }

  .question-card {
    border-radius: 1.5rem;
    border: 2px solid #e2e8f0;
    padding: 1.5rem;
    background: #fff;
    box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
  }

  .question-card header {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    margin-bottom: 0.75rem;
  }

  .question-card header span {
    font-size: 0.85rem;
    color: #94a3b8;
    text-transform: uppercase;
  }

  .answers {
    list-style: none;
    padding: 0;
    margin: 0 0 0.75rem;
    display: flex;
    flex-wrap: wrap;
    gap: 0.7rem;
  }

  .answers li {
    padding: 0.5rem 1rem;
    border-radius: 999px;
    background: #e2e8f0;
    font-weight: 600;
  }

  .answers li.correct {
    background: #bbf7d0;
    color: #14532d;
  }

  .solution {
    margin: 0;
    font-weight: 600;
    color: #0f172a;
  }
</style>
