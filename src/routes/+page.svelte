<script>
  import { onMount } from 'svelte';
  import { fetch } from '@tauri-apps/plugin-http';
  import { writeText, readText } from '@tauri-apps/plugin-clipboard-manager';

  /**
     * @type {any[]}
     */
  let animations = [];
  /**
     * @type {string | any[]}
     */
  let filtered = [];
  let search = '';
  /**
     * @type {null}
     */
  let modalImage = null;

  const GITHUB_IMAGE_REPO = "https://raw.githubusercontent.com/Vierdant/world-animation-catalog/main/images/"
  const GITHUB_JSON_URL = "https://raw.githubusercontent.com/Vierdant/world-animation-catalog/main/animations.json";

  onMount(async () => {
    try {
      const res = await fetch(GITHUB_JSON_URL, {
        method: 'GET',
      });
      const data = await res.json();
      animations = data;
      filtered = data;
    } catch (e) {
      console.error("Failed to fetch animations:", e);
    }

    window.addEventListener("keydown", onKeydown);
  });

  $: filtered = animations.filter(c =>
    c.command.toLowerCase().includes(search.toLowerCase()) ||
    c.keywords.some((/** @type {string} */ k) => k.toLowerCase().includes(search.toLowerCase()))
  );

  /**
     * @param {string} cmd
     */
  async function copyanimation(cmd) {
    await writeText(cmd);
  }

  /**
   * @param {{ name?: string, command: string }} cmd
   */
  function formatName(cmd) {
    // @ts-ignore
    return cmd.name ?? cmd.command.split(' ')[1];
  }


  /**
   * @param {string} cmd
   */
  function formatImageName(cmd) {
    // @ts-ignore
    return cmd.split(' ')[1];
  }
  
  /**
   * @param {{ name?: string, command: string }} cmd
   */
  function formatNameCapital(cmd) {
    let res = formatName(cmd)
    res = res.charAt(0).toUpperCase() + res.slice(1).toLowerCase()
    return res;
  }

  /**
     * @param {any} url
     */
  function openModal(url) {
    modalImage = url;
  }

  function closeModal() {
    modalImage = null;
  }

  /**
     * @param {{ key: string; }} e
     */
  function onKeydown(e) {
    if (e.key === "Escape") closeModal();
  }
</script>

<main>
  <h1>World Animation Catalog</h1>

  <input
    type="text"
    placeholder="Search animations..."
    bind:value={search}
    class="search"
  />

  {#if filtered.length > 0}
    <div class="grid">
      {#each filtered as cmd}
        <div class="animation-item">
          <div class="header">
            <strong>{formatNameCapital(cmd)}</strong>
            <button on:click={() => copyanimation(cmd.command)}>📋</button>
          </div>
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
          <img 
            src={GITHUB_IMAGE_REPO + formatImageName(cmd.command) + ".png"} 
            alt="animation preview" 
            class="preview"
            on:click={() => openModal(GITHUB_IMAGE_REPO + formatImageName(cmd.command) + ".png")}
            />
          <small class="tags">Tags: {cmd.keywords.join(', ')}</small>
        </div>
      {/each}
    </div>
  {:else}
    <p>No animations found.</p>
  {/if}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  {#if modalImage}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div class="modal-overlay" on:click={closeModal}>
      <img src={modalImage} alt="Full preview" class="modal-image">
    </div>
  {/if}
</main>

<style>
  :global(body) {
    background-color: #2b2d31;
    color: #ffffff;
    font-family: 'Segoe UI', sans-serif;
    margin: 0;
    padding: 0;
  }

  main {
    max-width: 1000px;
    margin: 2rem auto;
    padding: 1rem;
  }

  h1 {
    text-align: center;
    margin-bottom: 2rem;
    color: #ffffff;
  }

  .search {
    width: 100%;
    padding: 0.75rem;
    font-size: 1rem;
    margin-bottom: 2rem;
    background-color: #1e1f22;
    color: white;
    border: 1px solid #4e5058;
    border-radius: 8px;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 1.5rem;
  }

  .animation-item {
    background-color: #1e1f22;
    border: 1px solid #4e5058;
    border-radius: 12px;
    padding: 1rem;
    transition: background-color 0.2s;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .animation-item:hover {
    background-color: #313338;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
    font-size: 1rem;
    color: #fff;
  }

  .animation-item img.preview {
    margin: 0.5rem 0;
    max-width: 100%;
    max-height: 160px;
    border-radius: 8px;
    object-fit: cover;
  }

  .tags {
    color: #b5bac1;
    font-size: 0.85rem;
    margin-top: auto;
  }

  button {
    background-color: #5865f2;
    color: white;
    border: none;
    padding: 0.4rem 0.6rem;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.85rem;
    transition: 0.2s;
  }

  button:hover {
    background-color: #4752c4;
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(20, 20, 20, 0.85);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    cursor: zoom-out;
  }

  .modal-image {
    max-width: 80%;
    max-height: 80%;
    border-radius: 10px;
    box-shadow: 0 0 20px #000;
  }
</style>