<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { fetch } from "@tauri-apps/plugin-http";
  import AnimationCard from "./components/AnimationCard.svelte";
  import CheckToggle from "./components/CheckToggle.svelte";


  import { GITHUB_JSON_URL } from "./constants.js";
  import { parseSearchTerms, createFuse, getFilteredAnimations } from "./util/fliter";
  import type Fuse from "fuse.js";

  interface Animation {
    name: string;
    command: string;
    tags: string[];
  }

  let searchTerm: string = "";
  let debouncedSearch: string = "";
  let modalImage: string | null = null;
  let showAdult: boolean = false;
  
  let searchInput: HTMLInputElement;
  
  let animations: Animation[] = [];
  let filteredAnimations: Animation[] = [];
  let fuse: Fuse<any> | null = null;

  let debounceTimeout: ReturnType<typeof setTimeout>;


  onMount(async () => {
    try {
      const res = await fetch(GITHUB_JSON_URL, { method: "GET" });
      const data = await res.json();
      animations = data;
      filteredAnimations = data;
    } 
    catch (e) {
      console.error("Failed to fetch animations:", e);
    }

    window.addEventListener("keydown", onKeydown);
  });

  onDestroy(() => {
    window.removeEventListener("keydown", onKeydown);
  });

  // Reactive debounced search term
  $: {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      debouncedSearch = searchTerm;
    }, 100);
  }

  // Fuse instance
  $: fuse = animations?.length ? createFuse(animations) : null;

  // reactive filtered list - What is displayed at all times
  $: filteredAnimations = getFilteredAnimations(
    animations,
    debouncedSearch,
    showAdult,
    fuse
  );


  // Modal functions
  function openModal(url: string) {
    modalImage = url;
  }

  function closeModal() {
    modalImage = null;
  }

  function onKeydown(e: KeyboardEvent) {
    if (e.key === "Escape") closeModal();
  }


  // Tag click processor 
  function addTagToSearch(tag: string) {
    const tagQuery = `tag:${tag}`;
    const terms = parseSearchTerms(searchTerm);

    if (!terms.includes(tagQuery)) {
      searchTerm = [...terms, tagQuery].join(" ");
    }

    searchInput?.focus();
  }
</script>

<main>
  <div class="search-bar-wrapper">
    <h1>World Animation Catalog</h1>
    <input
      type="text"
      placeholder="Search animations..."
      bind:value={searchTerm}
      bind:this={searchInput}
      class="search"
    />
  </div>
  <CheckToggle bind:checked={showAdult} text="Show Adult Content" />

  {#if filteredAnimations.length > 0}
    <div class="grid">
      {#each filteredAnimations as anim (anim)}
        <AnimationCard
          animation={anim}
          showmodal={openModal}
          addtag={addTagToSearch}
        />
      {/each}
    </div>
  {:else}
    <p>No animations found.</p>
  {/if}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  {#if modalImage}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div class="modal-overlay" onclick={closeModal}>
      <img src={modalImage} alt="Full preview" class="modal-image" />
    </div>
  {/if}
</main>