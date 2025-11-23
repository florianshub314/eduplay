<script>
  export let x = 0;
  export let y = 0;
</script>

<div class="ball" style:left={x + 'px'} style:top={y + 'px'}></div>

<style>
  .ball {
    width: 40px;
    height: 40px;
    position: absolute;
    border-radius: 50%;
    /* Sichtbarer, eigener Ball nur mit CSS */
    background: radial-gradient(circle at 30% 30%, #ffffff, #d4d4d4 40%, #888888);
    border: 2px solid #333333;
    z-index: 10; /* über dem Feld */
  }
</style>
