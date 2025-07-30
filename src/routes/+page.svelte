<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { httpFetch, loadFavorites, saveFavorites } from "../lib/platform.js";
  import AnimationCard from "./components/AnimationCard.svelte";
  import CheckToggle from "./components/CheckToggle.svelte";
  import TagAutocomplete from "./components/TagAutocomplete.svelte";

  import { GITHUB_JSON_URL } from "./constants.js";
  import {
    parseSearchTerms,
    createFuse,
    getFilteredAnimations,
  } from "../util/fliter";
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
  let showOnlyFavorites: boolean = false;
  let showScrollTop: boolean = false;
  let showSuggestions: boolean = false;
  let showSettings: boolean = false;
  let importSuccess = false;

  let searchInput: HTMLInputElement;
  let firstAutocompleteButton: HTMLButtonElement | null = null;

  let animations: Animation[] = [];
  let filteredAnimations: Animation[] = [];
  let fuse: Fuse<any> | null = null;
  let favorites: Set<string> = new Set();
  let allTags: string[] = [];

  let debounceTimeout: ReturnType<typeof setTimeout>;

  async function loadFavoritesData() {
    favorites = await loadFavorites();
  }

  async function saveFavoritesData() {
    await saveFavorites(favorites);
  }

  onMount(async () => {
    await loadFavoritesData();

    try {
      const res = await httpFetch(GITHUB_JSON_URL, { method: "GET" });
      const data = await res.json();
      animations = data;
      filteredAnimations = data;
    } catch (e) {
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
    showOnlyFavorites,
  );

  // extract all unique tags from the animations data
  $: if (animations.length) {
    const tagSet = new Set<string>();
    animations.forEach((anim) => anim.tags.forEach((tag) => tagSet.add(tag)));
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
    saveFavoritesData();
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
    if (
      showSuggestions &&
      (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter")
    ) {
      const event = new CustomEvent("autocompleteKey", { detail: e });
      searchInput?.dispatchEvent(event);
      e.preventDefault();
    }
  }

  function exportFavorites() {
    const favArray = Array.from(favorites);
    const blob = new Blob([JSON.stringify(favArray, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "favorites.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function importFavorites(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    const text = await file.text();

    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        favorites = new Set(parsed);
        await saveFavoritesData();
        showImportSuccess();

        // Optionally reload from storage to confirm
        favorites = await loadFavorites();
      } else {
        alert("Invalid file format.");
      }
    } catch (e) {
      alert("Failed to import favorites.");
      console.error(e);
    }
  }

  
  function showImportSuccess() {
    importSuccess = true;
    setTimeout(() => {
      importSuccess = false;
    }, 2000);
  }
</script>

<main>
  <div class="search-bar-wrapper">
    <h1>World Animation Catalog</h1>
    {#if showSettings}
      <div class="settings-menu">
        <button onclick={exportFavorites}>Export Favorites</button>
        <label class="import-label">
          Import Favorites
          <input type="file" accept=".json" onchange={importFavorites} />
        </label>
      </div>
    {/if}
    {#if importSuccess}
      <div class="import-success-message">
        ✅ Favorites imported successfully!
      </div>
    {/if}
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
        bind:showSuggestions
        on:select={(e) => (searchTerm = e.detail)}
      />
    </div>
    <button
      class="settings-button"
      onclick={() => (showSettings = !showSettings)}
      aria-label="Settings"
    >
      <!-- License: CC0. Made by SVG Repo: https://www.svgrepo.com/svg/304628/cog-wheel-settings -->
    <svg width="32px" height="32px" viewBox="0 0 32 32" id="Lager_100" data-name="Lager 100" xmlns="http://www.w3.org/2000/svg">
      <path id="Path_78" data-name="Path 78" d="M30.329,13.721l-2.65-.441a11.922,11.922,0,0,0-1.524-3.653l1.476-2.066a1.983,1.983,0,0,0-.211-2.553l-.428-.428a1.983,1.983,0,0,0-2.553-.211L22.373,5.845A11.922,11.922,0,0,0,18.72,4.321l-.441-2.65A2,2,0,0,0,16.306,0h-.612a2,2,0,0,0-1.973,1.671l-.441,2.65A11.922,11.922,0,0,0,9.627,5.845L7.561,4.369a1.983,1.983,0,0,0-2.553.211l-.428.428a1.983,1.983,0,0,0-.211,2.553L5.845,9.627A11.922,11.922,0,0,0,4.321,13.28l-2.65.441A2,2,0,0,0,0,15.694v.612a2,2,0,0,0,1.671,1.973l2.65.441a11.922,11.922,0,0,0,1.524,3.653L4.369,24.439a1.983,1.983,0,0,0,.211,2.553l.428.428a1.983,1.983,0,0,0,2.553.211l2.066-1.476a11.922,11.922,0,0,0,3.653,1.524l.441,2.65A2,2,0,0,0,15.694,32h.612a2,2,0,0,0,1.973-1.671l.441-2.65a11.922,11.922,0,0,0,3.653-1.524l2.066,1.476a1.983,1.983,0,0,0,2.553-.211l.428-.428a1.983,1.983,0,0,0,.211-2.553l-1.476-2.066a11.922,11.922,0,0,0,1.524-3.653l2.65-.441A2,2,0,0,0,32,16.306v-.612A2,2,0,0,0,30.329,13.721ZM16,22a6,6,0,1,1,6-6A6,6,0,0,1,16,22Z" fill="#ffffff"/>
    </svg>

    </button>
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
