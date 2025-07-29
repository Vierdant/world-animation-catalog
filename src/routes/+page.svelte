<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { fetch } from "@tauri-apps/plugin-http";
  import { LazyStore } from "@tauri-apps/plugin-store";
  import AnimationCard from "./components/AnimationCard.svelte";
  import CheckToggle from "./components/CheckToggle.svelte";
  import TagAutocomplete from "./components/TagAutocomplete.svelte";


  import { GITHUB_JSON_URL } from "./constants.js";
  import { parseSearchTerms, createFuse, getFilteredAnimations } from "./util/fliter";
  import type Fuse from "fuse.js";

  interface Animation {
    name: string;
    command: string;
    tags: string[];
  }

  const store = new LazyStore(".data.dat");

  let searchTerm: string = "";
  let debouncedSearch: string = "";
  let modalImage: string | null = null;
  let showAdult: boolean = false;
  let showOnlyFavorites: boolean = false;
  let showScrollTop: boolean = false;
  let showSuggestions: boolean = false;
  
  let searchInput: HTMLInputElement;
  let firstAutocompleteButton: HTMLButtonElement | null = null;
  
  let animations: Animation[] = [];
  let filteredAnimations: Animation[] = [];
  let fuse: Fuse<any> | null = null;
  let favorites: Set<string> = new Set();
  let allTags: string[] = [];

  let debounceTimeout: ReturnType<typeof setTimeout>;
  
  async function loadFavorites() {
    const favs = await store.get<string[]>("favorites");
    favorites = new Set(favs || []);
  }

  async function saveFavorites() {
    await store.set("favorites", Array.from(favorites));
    await store.save();
  }

  onMount(async () => {
    await loadFavorites();

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
    window.addEventListener("scroll", handleScroll);
  });

  onDestroy(() => {
    window.removeEventListener("keydown", onKeydown);
    window.removeEventListener("scroll", handleScroll);
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
    fuse,
    favorites,
    showOnlyFavorites
  );

  // extract all unique tags from the animations data
  $: if (animations.length) {
    const tagSet = new Set<string>();
    animations.forEach(anim => anim.tags.forEach(tag => tagSet.add(tag)));
    allTags = Array.from(tagSet).sort();
  }

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


  // favroite system logic
  function toggleFavorite(name: string) {
    if (favorites.has(name)) {
      favorites.delete(name);
    } else {
      favorites.add(name);
    }
    favorites = new Set(favorites);
    saveFavorites();
  }

  function isFavorite(name: string): boolean {
    return favorites.has(name);
  }

  // scroll functions
  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleScroll() {
    showScrollTop = window.scrollY > 300;
  }


  function handleSearchKeydown(e: KeyboardEvent) {
    if (e.key === "Tab" && showSuggestions && firstAutocompleteButton) {
      e.preventDefault();
      firstAutocompleteButton.focus();
    }

    // Forward arrow key logic to autocomplete if suggestions are showing
    if (showSuggestions && (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter")) {
      const event = new CustomEvent("autocompleteKey", { detail: e });
      searchInput?.dispatchEvent(event);
      e.preventDefault();
    }
  }
</script>

<main>
  <div class="search-bar-wrapper">
    <h1>World Animation Catalog</h1>
    <div class="search-container">
      <input
        type="text"
        placeholder="Search animations..."
        bind:value={searchTerm}
        bind:this={searchInput}
        class="search"
        onkeydown={handleSearchKeydown}
      />
      {#if searchTerm}
        <button
          type="button"
          class="clear-button"
          onclick={() => (searchTerm = "")}
          aria-label="Clear search input"
        >
          &times;
        </button>
      {/if}
      <TagAutocomplete
        {searchTerm}
        {allTags}
        inputRef={searchInput}
        bind:firstButton={firstAutocompleteButton}
        bind:showSuggestions={showSuggestions}
        on:select={(e) => (searchTerm = e.detail)}
      />

    </div>
  </div>
  <div class="toggle-row">
    <CheckToggle bind:checked={showAdult} text="Adult Content" />
    <CheckToggle bind:checked={showOnlyFavorites} text="Favorites Only" />
  </div>

  {#if filteredAnimations.length > 0}
    <div class="grid">
      {#each filteredAnimations as anim (anim)}
        <AnimationCard
          animation={anim}
          showmodal={openModal}
          addtag={addTagToSearch}
          favorite={isFavorite(anim.command)}
          ontoggleFavorite={() => toggleFavorite(anim.command)}
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

  {#if showScrollTop}
    <button class="scroll-top" onclick={scrollToTop} aria-label="Scroll to top">
      ↑
    </button>
  {/if}
</main>