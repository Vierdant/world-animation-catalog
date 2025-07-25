<script>
  import { onMount } from 'svelte';
  import { fetch } from '@tauri-apps/plugin-http';

  /**
     * @type {any[]}
     */
  let commands = [];
  /**
     * @type {string | any[]}
     */
  let filtered = [];
  let search = '';

  const GITHUB_JSON_URL = "https://raw.githubusercontent.com/Vierdant/world-animation-catalog/blob/main/animations.json";

  onMount(async () => {
    try {
      const res = await fetch(GITHUB_JSON_URL, {
        method: 'GET',
      });
      const data = await res.json();
      commands = data;
      filtered = data;
    } catch (e) {
      console.error("Failed to fetch commands:", e);
    }
  });

  $: filtered = commands.filter(c =>
    c.command.toLowerCase().includes(search.toLowerCase()) ||
    c.keywords.some((/** @type {string} */ k) => k.toLowerCase().includes(search.toLowerCase()))
  );

  console.log(filtered);

  /**
     * @param {string} cmd
     */
  function copyCommand(cmd) {
    navigator.clipboard.writeText(cmd);
    alert("Copied: " + cmd);
  }
</script>

<main>
  <h1>🎮 GTA RP Command Catalog</h1>

  <input
    type="text"
    placeholder="Search commands..."
    bind:value={search}
    class="search"
  />

  {#if filtered.length > 0}
    <ul class="command-list">
      {#each filtered as cmd}
        <li class="command-item">
          <div>
            <strong>{cmd.command}</strong>
            <button on:click={() => copyCommand(cmd.command)}>📋 Copy</button>
          </div>
          {#if cmd.image}
            <img src={cmd.image} alt="Command preview" class="preview" />
          {/if}
          <small>Tags: {cmd.keywords.join(', ')}</small>
        </li>
      {/each}
    </ul>
  {:else}
    <p>No commands found.</p>
  {/if}
</main>

<style>
  main {
    max-width: 800px;
    margin: 2rem auto;
    padding: 1rem;
    font-family: sans-serif;
  }

  .search {
    width: 100%;
    padding: 0.5rem;
    font-size: 1rem;
    margin-bottom: 1rem;
  }

  .command-list {
    list-style: none;
    padding: 0;
  }

  .command-item {
    border: 1px solid #ccc;
    border-radius: 8px;
    margin-bottom: 1rem;
    padding: 1rem;
    background: #f9f9f9;
  }

  .command-item img.preview {
    max-width: 100%;
    max-height: 150px;
    display: block;
    margin-top: 0.5rem;
  }

  button {
    margin-left: 1rem;
    cursor: pointer;
  }
</style>
