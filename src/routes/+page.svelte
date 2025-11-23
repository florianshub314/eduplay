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
  main {
    text-align: center;
    padding-top: 5rem;
    font-family: system-ui, sans-serif;
    min-height: 100vh;
    background: linear-gradient(180deg, #eef2ff 0%, #f8fafc 40%, #ffffff 100%);
  }


  h1 {
    font-size: 2.4rem;
    margin-bottom: 1rem;
  }

  button {
    padding: 0.9rem 1.4rem;
    font-size: 1rem;
    border-radius: 0.6rem;
    border: none;
    cursor: pointer;
    margin: 0.5rem;
  }

  .btn-primary {
    background: #2563eb;
    color: white;
  }

  .btn-secondary {
    background: #4b5563;
    color: white;
  }
</style>

<main>
  <h1>Willkommen bei EduPlay</h1>
  <p>Wie möchtest du fortfahren?</p>

  <button class="btn-primary" on:click={continueAsGuest}>
    Als Gast fortfahren
  </button>

  <button class="btn-secondary" on:click={openLogin}>
    Anmelden / Registrieren
  </button>
</main>
