<script>
  import { createEventDispatcher } from "svelte";

  export let label = "Datei auswählen";
  export let accept = "";
  export let description = "Ziehe eine Datei hierher oder klicke, um auszuwählen.";
  export let fileName = "";
  export let loading = false;

  const dispatch = createEventDispatcher();
  let isDragOver = false;
  let inputEl;

  function handleFiles(files) {
    if (files?.length) {
      dispatch("change", { files });
    }
  }

  function onChange(event) {
    handleFiles(event.target.files);
  }

  function onDrop(event) {
    event.preventDefault();
    isDragOver = false;
    handleFiles(event.dataTransfer?.files);
  }

  function onDragOver(event) {
    event.preventDefault();
    isDragOver = true;
  }

  function onDragLeave(event) {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      isDragOver = false;
    }
  }

  function triggerSelect() {
    inputEl?.click();
  }
</script>

<div
  class="dropzone"
  class:dragging={isDragOver}
  on:drop={onDrop}
  on:dragover={onDragOver}
  on:dragleave={onDragLeave}
  role="button"
  tabindex="0"
  on:click={triggerSelect}
  on:keydown={(event) => event.key === "Enter" && triggerSelect()}
>
  <div class="icon">📎</div>
  <div>
    <p class="label">{label}</p>
    <p class="description">
      {#if loading}
        Datei wird verarbeitet …
      {:else if fileName}
        {fileName}
      {:else}
        {description}
      {/if}
    </p>
  </div>
  <input
    bind:this={inputEl}
    type="file"
    accept={accept}
    on:change={onChange}
    tabindex="-1"
    aria-hidden="true"
  />
</div>

<style>
  .dropzone {
    border: 2px dashed #cbd5f5;
    border-radius: 20px;
    padding: 16px 20px;
    display: flex;
    gap: 16px;
    align-items: center;
    cursor: pointer;
    background: rgba(248, 250, 252, 0.9);
    transition: border-color 0.2s ease, background 0.2s ease;
  }

  .dropzone.dragging {
    border-color: #6366f1;
    background: rgba(99, 102, 241, 0.08);
  }

  .icon {
    font-size: 1.6rem;
  }

  .label {
    margin: 0;
    font-weight: 600;
    color: #0f172a;
  }

  .description {
    margin: 4px 0 0;
    color: #475569;
    font-size: 0.9rem;
  }

  input[type="file"] {
    display: none;
  }
</style>
