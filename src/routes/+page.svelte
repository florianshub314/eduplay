<script>
  import { goto } from '$app/navigation';

  function selectSubject(subject) {
    if (subject === 'Mathematik') goto('/mathe');
    else goto('/englisch');
  }
</script>

<main>
  <h1>Willkommen bei EduPlay</h1>
  <p>Wähle ein Fach aus, um zu starten:</p>

  <div class="buttons">
    <button on:click={() => selectSubject('Mathematik')}>📘 Mathematik</button>
    <button on:click={() => selectSubject('Englisch')}>📗 Englisch</button>
    <button on:click={() => goto('/deutsch')}>📙 Deutsch</button>
  </div>
</main>

<style>
  main {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    background: #f9fafb;
    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
  }

  h1 {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
  }

  p {
    margin-bottom: 2rem;
    color: #555;
  }

  .buttons {
    display: flex;
    gap: 1.5rem;
  }

  button {
    background-color: #f2f2f2;
    border: none;
    border-radius: 12px;
    padding: 14px 28px;
    font-size: 1.1rem;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(0,0,0,0.1);
    transition: all 0.2s ease;
  }

  button:hover {
    background-color: #e5e7eb;
    transform: scale(1.03);
  }
</style>
