<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { httpFetch, loadFavorites, saveFavorites } from "../lib/platform.js";
  import AnimationCard from "./components/AnimationCard.svelte";
  import CheckToggle from "./components/CheckToggle.svelte";
  import TagAutocomplete from "./components/TagAutocomplete.svelte";
  import SearchShortcuts from "./components/SearchShortcuts.svelte";

  import { GITHUB_JSON_URL } from "./constants.js";
  import {
    parseSearchTerms,
    createFuse,
    getFilteredAnimations,
  } from "../util/fliter";
  import { performanceMonitor, performanceUtils } from "../util/performance.js";
  import type Fuse from "fuse.js";

  interface Animation {
    name: string;
    command: string;
    tags: string[];
  }

  let searchTerm: string = "";
  let debouncedSearch: string = "";
  let modalImage: string | null = null;
  let modalImageError: boolean = false;
  let showAdult: boolean = false;
  let showOnlyFavorites: boolean = false;
  let showScrollTop: boolean = false;
  let showSuggestions: boolean = false;
  let showSettings: boolean = false;
  let showSupportModal: boolean = false;
  let importSuccess = false;
  let isLoading = true;
  let searchStats = { total: 0, filtered: 0 };
  let loadError: string | null = null;

  let searchInput: HTMLInputElement;
  let firstAutocompleteButton: HTMLButtonElement | null = null;

  let animations: Animation[] = [];
  let filteredAnimations: Animation[] = [];
  let fuse: Fuse<any> | null = null;
  let favorites: Set<string> = new Set();
  let allTags: string[] = [];

  let debounceTimeout: ReturnType<typeof setTimeout>;

  // Performance optimizations
  let fuseCache: Map<string, any[]> = new Map();
  let lastSearchParams = "";
  let isProcessingSearch = false;

  async function loadFavoritesData() {
    favorites = await loadFavorites();
  }

  async function saveFavoritesData() {
    await saveFavorites(favorites);
  }

  onMount(async () => {
    console.log("Starting to load animations...");
    await loadFavoritesData();

    // Add timeout to prevent infinite loading
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Request timeout")), 10000); // 10 second timeout
    });

    try {
      console.log("Fetching animations from:", GITHUB_JSON_URL);
      const fetchPromise = httpFetch(GITHUB_JSON_URL, { method: "GET" });
      const res = (await Promise.race([
        fetchPromise,
        timeoutPromise,
      ])) as Response;

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      console.log("Fetched animations:", data.length);

      if (!Array.isArray(data)) {
        throw new Error("Invalid data format - expected array");
      }

      // Use performance monitoring for data processing
      performanceMonitor.measure("dataProcessing", () => {
      animations = data;
      filteredAnimations = data;
        searchStats.total = data.length;
        searchStats.filtered = data.length;

        // Pre-compute all tags once
        const tagSet = new Set<string>();
        animations.forEach((anim) =>
          anim.tags.forEach((tag) => tagSet.add(tag)),
        );
        allTags = Array.from(tagSet).sort();

        // Pre-create Fuse instance
        fuse = createFuse(animations);
      });

      // Monitor memory usage
      performanceMonitor.monitorMemory();
    } catch (e) {
      console.error("Failed to fetch animations:", e);

      // Try fallback URL if main one fails
      try {
        console.log("Trying fallback URL...");
        const fallbackUrl =
          "https://raw.githubusercontent.com/Vierdant/world-animation-catalog/main/animations.json";
        const fallbackPromise = fetch(fallbackUrl);
        const res = (await Promise.race([
          fallbackPromise,
          timeoutPromise,
        ])) as Response;

        if (res.ok) {
          const data = await res.json();
          console.log("Fallback successful, fetched animations:", data.length);

          // Use performance monitoring for fallback data processing
          performanceMonitor.measure("fallbackDataProcessing", () => {
            animations = data;
            filteredAnimations = data;
            searchStats.total = data.length;
            searchStats.filtered = data.length;

            // Pre-compute all tags once
            const tagSet = new Set<string>();
            animations.forEach((anim) =>
              anim.tags.forEach((tag) => tagSet.add(tag)),
            );
            allTags = Array.from(tagSet).sort();

            // Pre-create Fuse instance
            fuse = createFuse(animations);
          });

          // Monitor memory usage
          performanceMonitor.monitorMemory();
        } else {
          throw new Error("Fallback also failed");
        }
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError);
        // Set empty data to prevent infinite loading
        animations = [];
        filteredAnimations = [];
        searchStats.total = 0;
        searchStats.filtered = 0;
        loadError =
          "Failed to load animations. Please check your internet connection and try again.";
      }
    } finally {
      console.log("Loading complete. Total animations:", animations.length);
      isLoading = false;

      // Log performance summary
      performanceMonitor.logSummary();
    }

    window.addEventListener("keydown", onKeydown);
    window.addEventListener("scroll", handleScroll);
  });

  onDestroy(() => {
    window.removeEventListener("keydown", onKeydown);
    window.removeEventListener("scroll", handleScroll);
    clearTimeout(debounceTimeout);
  });

  // Optimized debounced search with longer delay
  $: {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      debouncedSearch = searchTerm;
    }, 300); // Increased from 100ms to 300ms
  }

  // Optimized filtered list computation with caching and performance monitoring
  $: {
    if (!isProcessingSearch) {
      const searchParams = `${debouncedSearch}-${showAdult}-${showOnlyFavorites}-${favorites.size}`;

      if (searchParams !== lastSearchParams) {
        isProcessingSearch = true;

        // Use performance monitoring and batched updates
        performanceUtils.batchDOMUpdates(() => {
          try {
            filteredAnimations = performanceMonitor.measure(
              "filterAnimations",
              () =>
                getFilteredAnimations(
    animations,
    debouncedSearch,
    showAdult,
    fuse,
    favorites,
    showOnlyFavorites,
                ),
            );

            searchStats.filtered = filteredAnimations.length;
            lastSearchParams = searchParams;
          } finally {
            isProcessingSearch = false;
          }
        });
      }
    }
  }

  // Modal functions
  async function openModal(url: string) {
    // Test if the image URL is accessible
    try {
      const response = await fetch(url, { method: "HEAD" });
      if (!response.ok) {
        modalImageError = true;
      } else {
        modalImageError = false;
      }
    } catch (error) {
      modalImageError = true;
    }

    modalImage = url;
  }

  function closeModal() {
    modalImage = null;
    modalImageError = false;
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

  // Search shortcut handler
  function handleShortcutClick(query: string) {
    searchTerm = query;
    searchInput?.focus();
  }

  // Optimized favorite system logic
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

  function openSupportModal() {
    showSupportModal = true;
  }

  function closeSupportModal() {
    showSupportModal = false;
  }

  function openExternalLink(url: string) {
    window.open(url, "_blank", "noopener,noreferrer");
  }
</script>



<main class={isLoading ? "loading" : ""}>
  <div class="search-bar-wrapper">
    <div class="header-top">
    <h1>World Animation Catalog</h1>
      <div class="header-buttons">
        <button
          class="support-button"
          onclick={openSupportModal}
          aria-label="Support & Links"
          title="Support & Links"
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
            />
          </svg>
        </button>
        <button
          class="settings-button"
          onclick={() => (showSettings = !showSettings)}
          aria-label="Settings"
          title="Settings"
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.5-0.24,1.02-0.56,1.51-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"
            />
          </svg>
        </button>
      </div>
    </div>
    {#if showSettings}
      <div class="settings-menu">
        <button onclick={exportFavorites}>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
          </svg>
          Export Favorites
        </button>
        <label class="import-label">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </svg>
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
      <div class="search-wrapper">
        <svg class="search-icon" viewBox="0 0 24 24" fill="currentColor">
          <path
            d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
          />
        </svg>
      <input
        type="text"
          placeholder="Search animations, tags, or commands..."
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
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
              />
            </svg>
        </button>
      {/if}
      </div>
      <TagAutocomplete
        {searchTerm}
        {allTags}
        inputRef={searchInput}
        bind:firstButton={firstAutocompleteButton}
        bind:showSuggestions
        on:select={(e) => (searchTerm = e.detail)}
      />
    </div>
  </div>

  <div class="stats-bar">
    <div class="stats-info">
      <span class="stats-text"
        >Showing {searchStats.filtered} of {searchStats.total} animations</span
      >
      {#if searchStats.filtered !== searchStats.total}
        <span class="stats-filtered">(filtered)</span>
      {/if}
    </div>
  </div>

  <div class="toggle-row">
    <CheckToggle
      bind:checked={showAdult}
      text="Adult Content"
      description="Include animations with adult content"
    />
    <CheckToggle
      bind:checked={showOnlyFavorites}
      text="Favorites Only"
      description="Show only your favorite animations"
    />
  </div>

  {#if !isLoading && searchStats.total > 0 && searchStats.filtered === searchStats.total}
    <SearchShortcuts onShortcutClick={handleShortcutClick} />
  {/if}

  {#if isLoading}
    <div class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading animations...</p>
    </div>
  {:else if loadError}
    <div class="error-state">
      <svg class="error-icon" viewBox="0 0 24 24" fill="currentColor">
        <path
          d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
        />
      </svg>
      <h3>Loading Error</h3>
      <p>{loadError}</p>
      <button class="retry-button" onclick={() => window.location.reload()}>
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path
            d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"
          />
        </svg>
        Retry
      </button>
    </div>
  {:else if filteredAnimations.length > 0}
    <div class="grid">
      {#each filteredAnimations as anim, index (index)}
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
    <div class="empty-state">
      <svg class="empty-icon" viewBox="0 0 24 24" fill="currentColor">
        <path
          d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
        />
      </svg>
      <h3>No animations found</h3>
      <p>Try adjusting your search terms or filters</p>
    </div>
  {/if}
</main>

<!-- Fixed/Sticky Elements - Outside main for proper viewport positioning -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
{#if modalImage}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <div class="modal-overlay" onclick={closeModal}>
    {#if !modalImageError}
      <img
        src={modalImage}
        alt="Full preview"
        class="modal-image"
        onerror={() => {
          modalImageError = true;
        }}
      />
    {:else}
      <div class="modal-error">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path
            d="M21 5v6.59l-3-3.01-4 4.01-4-4-4 4-3-3.01V5c0-1.1.9-2 2-2h14c1.1 0 2 .9 2 2zm-3 6.42l3 3.01V19c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2v-6.58l3 2.99 4-4 4 4 4-4z"
          />
        </svg>
        <p>Image failed to load</p>
        <button onclick={closeModal} class="modal-close-btn">Close</button>
      </div>
    {/if}
  </div>
{/if}

<!-- Support Modal -->
{#if showSupportModal}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="modal-overlay support-modal-overlay" onclick={closeSupportModal}>
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="support-modal" onclick={(e) => e.stopPropagation()}>
      <div class="support-modal-header">
        <h2>Support & Links</h2>
        <button
          class="close-button"
          onclick={closeSupportModal}
          aria-label="Close"
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
            />
          </svg>
        </button>
      </div>

      <div class="support-modal-content">
        <div class="support-option">
          <div class="support-icon wiki">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
              />
            </svg>
          </div>
          <div class="support-info">
            <h3>Documentation Wiki</h3>
            <p>Learn more about animations, commands, and usage tips</p>
          </div>
          <button
            class="support-button"
            onclick={() =>
              openExternalLink(
                "https://github.com/Vierdant/world-animation-catalog/wiki",
              )}
          >
            <span>Visit</span>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"
              />
            </svg>
          </button>
        </div>

        <div class="support-option">
          <div class="support-icon discord">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"
              />
            </svg>
          </div>
          <div class="support-info">
            <h3>Join Discord Community</h3>
            <p>Connect with other users, share animations, and get help</p>
          </div>
          <button
            class="support-button"
            onclick={() =>
              openExternalLink("https://discord.com/invite/cnknQJDBer")}
          >
            <span>Join</span>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"
              />
            </svg>
          </button>
        </div>

        <div class="support-option">
          <div class="support-icon kofi">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
              />
            </svg>
          </div>
          <div class="support-info">
            <h3>Buy Me a Coffee</h3>
            <p>Support the development of this project</p>
          </div>
          <button
            class="support-button kofi-button"
            onclick={() => openExternalLink("https://ko-fi.com/vierdant")}
          >
            <span>Visit</span>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
    </div>
  {/if}

<!-- Scroll to Top Button -->
  {#if showScrollTop}
    <button class="scroll-top" onclick={scrollToTop} aria-label="Scroll to top">
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z" />
    </svg>
    </button>
  {/if}

<!-- Import Success Message -->
{#if importSuccess}
  <div class="import-success-message">
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
    </svg>
    Favorites imported successfully!
  </div>
{/if}

<style>
  .search-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  .search-icon {
    position: absolute;
    left: var(--spacing-lg);
    width: 20px;
    height: 20px;
    color: var(--text-muted);
    z-index: 2;
  }

  .search {
    padding-left: calc(var(--spacing-xl) + 24px);
  }

  .clear-button svg {
    width: 18px;
    height: 18px;
  }

  .stats-bar {
    display: flex;
    justify-content: center;
    margin: var(--spacing-lg) 0;
  }

  .stats-info {
    background: var(--bg-secondary);
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-lg);
    padding: var(--spacing-sm) var(--spacing-lg);
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    font-size: 0.9rem;
  }

  .stats-text {
    color: var(--text-primary);
    font-weight: 500;
  }

  .stats-filtered {
    color: var(--text-muted);
    font-size: 0.85rem;
  }

  .toggle-row {
    display: flex;
    gap: var(--spacing-lg);
    justify-content: center;
    margin: var(--spacing-lg) 0;
    flex-wrap: wrap;
  }

  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-2xl);
    color: var(--text-muted);
  }

  .loading-container .loading-spinner {
    width: 48px;
    height: 48px;
    border: 3px solid var(--border-primary);
    border-top: 3px solid var(--accent-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: var(--spacing-lg);
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-2xl);
    text-align: center;
    color: var(--text-muted);
  }

  .empty-icon {
    width: 64px;
    height: 64px;
    margin-bottom: var(--spacing-lg);
    opacity: 0.5;
  }

  .empty-state h3 {
    color: var(--text-primary);
    margin: 0 0 var(--spacing-sm) 0;
    font-size: 1.25rem;
  }

  .empty-state p {
    margin: 0;
    font-size: 0.95rem;
  }

  .error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-2xl);
    text-align: center;
    color: var(--text-muted);
  }

  .error-icon {
    width: 64px;
    height: 64px;
    margin-bottom: var(--spacing-lg);
    opacity: 0.5;
    color: var(--accent-danger);
  }

  .error-state h3 {
    color: var(--text-primary);
    margin: 0 0 var(--spacing-sm) 0;
    font-size: 1.25rem;
  }

  .error-state p {
    margin: 0 0 var(--spacing-lg) 0;
    font-size: 0.95rem;
    max-width: 400px;
  }

  .retry-button {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-md) var(--spacing-lg);
    background: var(--accent-primary);
    color: var(--text-primary);
    border: none;
    border-radius: var(--radius-md);
    cursor: pointer;
    font-size: 0.95rem;
    font-weight: 500;
    transition: all var(--transition-fast);
  }

  .retry-button:hover {
    background: var(--accent-secondary);
    transform: translateY(-1px);
  }

  .retry-button svg {
    width: 18px;
    height: 18px;
  }

  .settings-menu button,
  .settings-menu label {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
  }

  .settings-menu svg {
    width: 16px;
    height: 16px;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  /* Responsive adjustments */
  @media (max-width: 800px) {
    .stats-bar {
      display: none;
    }

    .toggle-row {
      gap: var(--spacing-md);
      margin: var(--spacing-md) 0;
    }
  }

  @media (max-width: 600px) {
    .toggle-row {
      flex-direction: column;
      gap: var(--spacing-sm);
      margin: var(--spacing-sm) 0;
      align-items: center;
    }
  }

  @media (max-width: 480px) {
    .toggle-row {
      margin: var(--spacing-xs) 0;
    }

    .empty-state {
      padding: var(--spacing-lg);
    }

    .empty-icon {
      width: 48px;
      height: 48px;
    }

    .error-state {
      padding: var(--spacing-lg);
    }

    .error-icon {
      width: 48px;
      height: 48px;
    }
  }
</style>
