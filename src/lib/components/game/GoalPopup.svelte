<script>
  export let message = "";
  export let visible = false;
</script>

{#if visible}
  <div class="goal-popup">{message}</div>
{/if}

<style>
  .goal-popup {
    position: fixed;
    top: 40px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(15, 23, 42, 0.9);
    color: white;
    padding: 14px 28px;
    border-radius: 999px;
    box-shadow: 0 12px 30px rgba(15, 23, 42, 0.3);
    font-weight: 600;
    z-index: 50;
  }
</style>
