<script>
// @ts-nocheck

  import { onMount } from 'svelte';
  import { fetch } from '@tauri-apps/plugin-http';
  import { writeText, readText } from '@tauri-apps/plugin-clipboard-manager';
  import Fuse from 'fuse.js';

  const fuseOptions = {
    keys: ['name', 'command', 'tags'],
    threshold: 0.4, // Lower = stricter match; 0.0 = exact match
    includeScore: true,
  };

  const tagColors = {
    female: '#ffb6c1',
    male: '#add8e6'
  }


  /**
     * @type {any[]}
     */
  let animations = [];
  /**
     * @type {string | any[]}
     */
  let filteredCommands = [];
  let searchTerm = '';
  let debouncedSearch = '';
  /**
     * @type {null}
     */
  let modalImage = null;
  let fuse = null;

  let debounceTimeout;

  const GITHUB_IMAGE_REPO = "https://raw.githubusercontent.com/Vierdant/world-animation-catalog/main/images/"
  const GITHUB_JSON_URL = "https://raw.githubusercontent.com/Vierdant/world-animation-catalog/main/animations.json";

  onMount(async () => {
    try {
      const res = await fetch(GITHUB_JSON_URL, {
        method: 'GET',
      });
      const data = await res.json();
      animations = data;
      filteredCommands = data;
    } catch (e) {
      console.error("Failed to fetch animations:", e);
    }

    window.addEventListener("keydown", onKeydown);
  });


  function parseSearchTerms(input) {
    const regex = /"([^"]+)"|(\S+)/g;
    const terms = [];
    let match;
    while ((match = regex.exec(input))) {
      terms.push(match[1] ?? match[2]);
    }
    return terms;
  }

  function addTagToSearch(tag) {
    const current = searchTerm.trim();
    const tagQuery = `tag:${tag}`;
    const terms = current.split(/\s+/);

    // Prevent duplicate tag entry
    if (!terms.includes(tagQuery)) {
      terms.push(tagQuery);
      searchTerm = terms.join(' ');
    }

    // Optional: immediately focus the search box after adding
    const input = document.querySelector('input[type="text"]');
    if (input) input.focus();
  }

  $: {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      debouncedSearch = searchTerm;
    }, 100); // Adjust delay to preference
  }

  $: if (animations?.length) {
    fuse = new Fuse(animations, fuseOptions);
  }

  $: filteredCommands = (() => {
    if (!debouncedSearch.trim()) return animations;

    const terms = parseSearchTerms(debouncedSearch.toLowerCase());

    // If using advanced filters like tag:x or -name:y, handle those separately:
    const regularTerms = terms.filter(t => !t.includes(':') && !t.startsWith('-'));
    const advancedTerms = terms.filter(t => t.includes(':') || t.startsWith('-'));

    let results = animations;

    if (regularTerms.length > 0 && fuse) {
      results = fuse.search(regularTerms.join(' ')).map(r => r.item);
    }

    // Further filter based on advanced exact/negated rules
    return results.filter(cmd => {
      const name = (cmd.name ?? '').toLowerCase();
      const command = (cmd.command ?? '').toLowerCase();
      const tags = (cmd.tags ?? []).map(t => t.toLowerCase());

      return advancedTerms.every(term => {
        const isNegated = term.startsWith('-');
        const [prefix, valueRaw] = term.replace('-', '').split(':', 2);
        const value = valueRaw?.trim();

        let match = false;

        switch (prefix) {
          case 'tag':
            match = tags.includes(value);
            break;
          case 'name':
            match = name.includes(value);
            break;
          case 'command':
            match = command.includes(value);
            break;
          default:
            match = name.includes(term) || command.includes(term) || tags.some(t => t.includes(term));
        }

        return isNegated ? !match : match;
      });
    });
  })();



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
  <div class="search-bar-wrapper">
    <h1>World Animation Catalog</h1>
    <input
    type="text"
    placeholder="Search animations..."
    bind:value={searchTerm}
    class="search"
    />
  </div>
  

  {#if filteredCommands.length > 0}
    <div class="grid">
      {#each filteredCommands as cmd}
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
            <div class="tags">
              <!-- svelte-ignore a11y_no_static_element_interactions -->
              {#each cmd.tags as tag}
                <!-- svelte-ignore a11y_click_events_have_key_events -->
                <span
                  class="tag"
                  style="background-color: {tagColors[tag.toLowerCase()] ?? '#464646'}"
                  on:click={() => addTagToSearch(tag)}
                >
                  {tag}
                </span>
              {/each}
            </div>
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
    width: 100%;
    height: 220px; /* more height for clarity */
    border-radius: 8px;
    object-fit: cover;
    object-position: top center; /* focuses top/middle of image */
    object-position: 30% 14%;
  }

  .animation-item img.preview:hover {
    transform: scale(1.05);
    transition: transform 0.2s ease-in-out;
    z-index: 1;
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

  .search-bar-wrapper {
    position: sticky;
    top: 0;
    padding-top: 1rem;
    background-color: #2b2d31;
    z-index: 10;
  }

  .tag {
    display: inline-block;
    padding: 0.2rem 0.6rem;
    margin: 0.2rem 0.3rem 0 0;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 600;
    color: #fff;
    background-color: #464646; /* fallback */
    text-transform: capitalize;
    cursor: pointer;
    transition: transform 0.1s ease;
  }

  .tag:hover {
    transform: scale(1.05);
    opacity: 0.85;
  }
</style>