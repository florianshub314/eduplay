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
    padding: 0.85rem 1.75rem;
    border-radius: 999px;
    color: #fff;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 0.65rem;
    box-shadow: 0 18px 40px rgba(15, 23, 42, 0.25);
    z-index: 1000;
    pointer-events: none;
    animation: drop 220ms ease-out;
  }

  .goal-popup.neutral {
    background: linear-gradient(120deg, #6366f1, #8b5cf6);
  }

  .goal-popup.blue {
    background: linear-gradient(120deg, #0ea5e9, #3b82f6);
  }

  .goal-popup.red {
    background: linear-gradient(120deg, #f97316, #ef4444);
  }

  .goal-icon {
    font-size: 1.35rem;
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
