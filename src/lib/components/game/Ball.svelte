<script>
  export let x = 0;
  export let y = 0;
</script>

<div class="ball" style:left={x + 'px'} style:top={y + 'px'}></div>

<style>
  .ball {
    width: 44px;
    height: 44px;
    position: absolute;
    border-radius: 50%;
    background: radial-gradient(circle at 30% 30%, #fff7ed, #fed7aa 50%, #fb923c 90%);
    border: 3px solid #0f172a;
    box-shadow: 8px 8px 0 rgba(15, 23, 42, 0.2);
    z-index: 10;
  }
</style>
