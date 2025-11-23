<script>
  import { onMount } from "svelte";
  import Field from "./Field.svelte";
  import Ball from "./Ball.svelte";

  export let position = 0;
  export let maxPosition = 4;
  export let inset = 32; // keeps the ball within the goals

  let wrapper;
  let width = 0;
  let height = 0;
  let ballX = 0;
  let ballY = 0;

  function updateDimensions() {
    if (!wrapper) return;
    const nextWidth = wrapper.offsetWidth;
    const nextHeight = wrapper.offsetHeight;
    if (nextWidth !== width) {
      width = nextWidth;
    }
    if (nextHeight !== height) {
      height = nextHeight;
    }
  }

  function computeBallCoordinates(currentPosition, currentMax, currentWidth, currentHeight) {
    if (!currentWidth || !currentHeight || !currentMax) return;
    const clamped = Math.max(-currentMax, Math.min(currentMax, currentPosition));
    const leftBoundary = inset;
    const rightBoundary = currentWidth - inset;
    const span = Math.max(rightBoundary - leftBoundary, 1);
    const totalSteps = currentMax * 2;
    const normalized = clamped + currentMax;
    const stepSize = span / totalSteps;

    ballX = leftBoundary + normalized * stepSize;
    ballY = currentHeight / 2;
  }

  onMount(() => {
    updateDimensions();
    computeBallCoordinates(position, maxPosition, width, height);

    const Observer = globalThis.ResizeObserver;
    let resizeObserver;
    if (typeof Observer !== "undefined" && wrapper) {
      resizeObserver = new Observer(() => {
        updateDimensions();
        computeBallCoordinates(position, maxPosition, width, height);
      });
      resizeObserver.observe(wrapper);
    } else {
      const handleResize = () => {
        updateDimensions();
        computeBallCoordinates(position, maxPosition, width, height);
      };
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }

    return () => resizeObserver?.disconnect();
  });

  $: computeBallCoordinates(position, maxPosition, width, height);
</script>

<div class="field-wrapper" bind:this={wrapper}>
  <Field>
    <Ball x={ballX} y={ballY} />
  </Field>
</div>

<style>
  .field-wrapper {
    position: relative;
    display: inline-block;
  }
</style>
