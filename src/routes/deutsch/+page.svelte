<script>
  import { goto } from '$app/navigation';

  let questions = [
    'Wie lautet der richtige Artikel? ___ Haus (der/die/das)',
    'Groß oder klein? "Am abend" → richtig schreiben',
    'Setze das Komma: "Ich ging nach Hause weil es regnete"',
    'Synonym für "beginnen"?',
    'Wie lautet die Mehrzahl von "Ball"?'
  ];
  let gameStarted = false;
  let gameOver = false;
  let currentQuestionIndex = 0;

  let ballPosition = 0;
  let redScore = 0;
  let blueScore = 0;

  let showTimer = false;
  let timer = 10;
  let timerInterval;

  let popupMessage = "";
  let showPopup = false;

  function showMessage(m){ popupMessage=m; showPopup=true; setTimeout(()=>showPopup=false, 2000); }

  function start(){ gameStarted=true; gameOver=false; currentQuestionIndex=0; }

  function nextQuestion(){
    stopTimer();
    if (currentQuestionIndex < questions.length -1) currentQuestionIndex++;
    else endGame();
  }

  function moveBall(team){
    if (team==='red'){
      ballPosition--;
      if (ballPosition <= -4){ redScore++; showMessage('⚽️ TOR Rot!'); resetField(); }
    } else {
      ballPosition++;
      if (ballPosition >= 4){ blueScore++; showMessage('⚽️ TOR Blau!'); resetField(); }
    }
    nextQuestion();
  }

  function wrong(){ showTimer=true; timer=10; timerInterval=setInterval(()=>{ timer--; if (timer<=0) stopTimer(); },1000); }
  function stopTimer(){ clearInterval(timerInterval); showTimer=false; }
  function resetField(){ ballPosition=0; stopTimer(); }
  function endGame(){ gameStarted=false; gameOver=true; showMessage(redScore>blueScore?'🏆 Rot gewinnt!':blueScore>redScore?'🏆 Blau gewinnt!':'🤝 Unentschieden!'); }
  function back(){ goto('/'); }
</script>

<main>
  {#if !gameStarted && !gameOver}
    <h1>Deutsch – Wandtafelspiel</h1>
    <button on:click={start}>Spiel starten</button>
    <button class="back" on:click={back}>⬅️ Zurück</button>

  {:else if gameStarted}
    <h2>Frage {currentQuestionIndex + 1} von {questions.length}</h2>
    <h1>{questions[currentQuestionIndex]}</h1>

    <div class="field">
      <div class="goal blue">Tor Blau</div>
      <div class="bar"><div class="ball" style="left: calc(50% + {ballPosition * 60}px)"></div></div>
      <div class="goal red">Tor Rot</div>
    </div>

    <div class="scores">
      <span class="blue">🔵 {blueScore}</span>
      <span class="red">{redScore} 🔴</span>
    </div>

    {#if showTimer}<div class="timer">⏱ {timer}s</div>{/if}

    <div class="buttons">
      <button class="redBtn" on:click={() => moveBall('red')}>🔴 Team Rot</button>
      <button class="blueBtn" on:click={() => moveBall('blue')}>🔵 Team Blau</button>
      <button class="wrongBtn" on:click={wrong}>❌ Falsch</button>
      <button class="skipBtn" on:click={nextQuestion}>⏭ Skip</button>
    </div>

  {:else}
    <h1>Spiel beendet</h1>
    <div class="scores">
      <span class="blue">🔵 {blueScore}</span>
      <span class="red">{redScore} 🔴</span>
    </div>
    <button on:click={start}>🔁 Neues Spiel</button>
    <button class="back" on:click={back}>⬅️ Zurück</button>
  {/if}

  {#if showPopup}<div class="popup">{popupMessage}</div>{/if}
</main>

<style>
  main { display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:100vh; font-family:-apple-system,BlinkMacSystemFont,sans-serif; }
  .field { position:relative; width:480px; height:120px; margin:2rem 0; display:flex; align-items:center; justify-content:space-between; }
  .goal { width:80px; text-align:center; font-weight:bold; }
  .bar { position:relative; flex:1; height:8px; background:#d1d5db; border-radius:4px; }
  .ball { position:absolute; top:50%; transform:translate(-50%,-50%); width:26px; height:26px; border-radius:50%; background:radial-gradient(circle at 30% 30%, white 40%, black 42%); border:2px solid #222; transition:left .3s; }
  .scores { display:flex; justify-content:space-between; width:300px; font-size:1.5rem; margin-bottom:1rem; }
  .red{ color:#dc2626; } .blue{ color:#2563eb; }
  .buttons{ display:flex; flex-wrap:wrap; gap:1rem; justify-content:center; }
  .buttons button{ padding:12px 20px; border:none; border-radius:10px; font-size:1rem; cursor:pointer; color:white; }
  .redBtn{ background:#dc2626; } .blueBtn{ background:#2563eb; } .wrongBtn{ background:#f59e0b; color:black; } .skipBtn{ background:#6b7280; }
  .popup{ position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); background:white; padding:1rem 2rem; border-radius:16px; box-shadow:0 4px 12px rgba(0,0,0,.2); font-weight:700; }
  .back{ margin-top:1rem; background:#e5e7eb; color:#111; border:none; padding:10px 20px; border-radius:8px; cursor:pointer; }
  .timer{ font-size:1.5rem; color:#f59e0b; font-weight:700; margin-bottom:1rem; }
</style>
