<script>
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";

  let subject;
  let team1;
  let team2;
  let setId;

  let questions = [];
  let current = 0;
  let loading = true;
  let error = "";

  let ball = 0;
  let score1 = 0;
  let score2 = 0;

  $: {
    const params = $page.url.searchParams;
    subject = params.get("subject");
    team1 = params.get("team1");
    team2 = params.get("team2");
    setId = params.get("setId");
  }

  onMount(loadGame);

  async function loadGame() {
    try {
      const res = await fetch(`/api/get-question-set/${setId}`);
      const json = await res.json();
      if (json.error) throw new Error(json.error);

      questions = json.set.questions;
    } catch (e) {
      error = e.message;
    } finally {
      loading = false;
    }
  }

  function next() {
    if (current < questions.length - 1) {
      current++;
    } else {
      endGame();
    }
  }

  function correct(team) {
    if (team === 1) {
      score1++;
      ball--;
    } else {
      score2++;
      ball++;
    }
    next();
  }

  function wrong(team) {
    if (team === 1) ball++;
    else ball--;
    next();
  }

  function skip() {
    next();
  }

  function endGame() {
    alert(
      `${team1}: ${score1}\n${team2}: ${score2}\n` +
        (score1 > score2 ? `${team1} gewinnt!` : score2 > score1 ? `${team2} gewinnt!` : "Unentschieden!")
    );
    goto("/app");
  }
</script>

{#if loading}
  <p>Laden…</p>
{:else if error}
  <p style="color:#f87171;">{error}</p>
{:else}
  <div class="card">
    <h2>{team1} vs {team2}</h2>

    <div>
      <strong>{team1}</strong>: {score1}
      <strong style="float:right">{team2}</strong>: {score2}
    </div>

    <div style="margin:1rem 0;">
      <div style="border:1px solid #999; height:40px; border-radius:20px; position:relative;">
        <div
          style="
            width:20px; height:20px; background:yellow; border-radius:50%;
            position:absolute; top:10px;
            left:calc(50% + {ball * 20}px);
          "
        ></div>
      </div>
    </div>

    <!-- Frage -->
    <div class="card">
      {#if questions[current].type === "syllables_image"}
        <img src={questions[current].imageUrl} style="max-width:200px;" />
        <p>Wie viele Silben?</p>
        <button class="btn-secondary" on:click={() => next()}>1</button>
        <button class="btn-secondary" on:click={() => next()}>2</button>
        <button class="btn-secondary" on:click={() => next()}>3</button>
      {:else}
        <p>{questions[current].question}</p>
      {/if}
    </div>

    <!-- Buttons -->
    <button class="btn-secondary" on:click={() => correct(1)}>{team1} richtig</button>
    <button class="btn-secondary" on:click={() => wrong(1)}>{team1} falsch</button>

    <button class="btn-secondary" on:click={() => correct(2)}>{team2} richtig</button>
    <button class="btn-secondary" on:click={() => wrong(2)}>{team2} falsch</button>

    <button class="btn-secondary" on:click={skip}>Überspringen</button>
    <button class="btn-danger" on:click={endGame}>Spiel beenden</button>
  </div>
{/if}
