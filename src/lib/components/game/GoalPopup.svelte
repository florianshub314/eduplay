<script>
  export let message = "";
  export let visible = false;
  export let variant = "neutral";

  const variants = new Set(["red", "blue", "neutral"]);
  $: colorClass = variants.has(variant) ? variant : "neutral";
</script>

{#if visible && message}
  <div class={`goal-popup ${colorClass}`} role="status" aria-live="polite">
    <span class="goal-icon">⚽️</span>
    <span>{message}</span>
  </div>
{/if}

<style>
  .goal-popup {
    position: fixed;
    top: calc(env(safe-area-inset-top, 0px) + 92px);
    left: 50%;
    transform: translateX(-50%);
    padding: 1rem 1.9rem;
    border-radius: 20px;
    color: #0f172a;
    font-weight: 800;
    display: inline-flex;
    align-items: center;
    gap: 0.65rem;
    box-shadow: 10px 10px 0 rgba(15, 23, 42, 0.2);
    border: 3px solid #0f172a;
    z-index: 1000;
    pointer-events: none;
    animation: drop 220ms ease-out;
    background: #fff7ed;
  }

  .goal-popup.neutral {
    background: linear-gradient(120deg, #38bdf8, #fef08a);
  }

  .goal-popup.blue {
    background: linear-gradient(120deg, #0ea5e9, #22c55e);
  }

  .goal-popup.red {
    background: linear-gradient(120deg, #f97316, #ef4444);
  }

  .goal-icon {
    font-size: 1.45rem;
  }

  @keyframes drop {
    from {
      opacity: 0;
      transform: translate(-50%, -10px);
    }
    to {
      opacity: 1;
      transform: translate(-50%, 0);
    }
  }

  @media (max-width: 640px) {
    .goal-popup {
      top: calc(env(safe-area-inset-top, 0px) + 80px);
      width: calc(100% - 32px);
      justify-content: center;
      text-align: center;
      padding-inline: 1.25rem;
    }
  }
</style>
