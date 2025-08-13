<script lang="ts">
    import { GITHUB_IMAGE_REPO, tagColors } from "../constants.js";
    import { copyToClipboard } from "../../lib/platform.js";

    let { animation, showmodal, addtag, favorite, ontoggleFavorite } = $props();

    let copied = $state(false);
    let imageLoaded = $state(false);
    let imageError = $state(false);

    // Memoized values to prevent unnecessary recalculations
    let imageSrc = $derived(GITHUB_IMAGE_REPO + (animation.name ? animation.name : formatImageName(animation.command)) + ".png");
    let formattedName = $derived(formatName(animation));

    /**
     * @param {string} command
     */
    async function copyCommand(command: string) {
        try {
            await copyToClipboard(command);
            copied = true;
            setTimeout(() => (copied = false), 1000);
        } catch (e) {
            alert("Failed to copy to clipboard");
            console.error(e);
        }
    }

    /**
     * @param {string} name
     */
    function formatImageName(name: string) {
        return name.split(" ")[1];
    }

    /**
     * @param {{ name: any; command: string; }} animation
     */
    function formatName(animation: { name?: string; command: string }) {
        let result = animation.name ?? animation.command.split(" ")[1];
        result = result.charAt(0).toUpperCase() + result.slice(1).toLowerCase();
        return result;
    }

    /**
     * Retry loading the image up to a max number of attempts
     * @param {Event} event
     * @param {{ command: string }} animation
     */
    function handleImageError(event: Event, animation: { command: string }) {
        const img = event.target as HTMLImageElement;
        const maxRetries = 3;
        if (!img) return;
        
        const retryCount = parseInt(img.dataset.retryCount || '0');

        if (retryCount < maxRetries) {
            img.dataset.retryCount = String(retryCount + 1);
            const src = GITHUB_IMAGE_REPO + formatImageName(animation.command) + ".png";
            // Add a cache-busting parameter
            img.src = `${src}?retry=${Date.now()}`;
        } else {
            img.alt = "Failed to load preview.";
            img.style.opacity = '0.4';
            imageError = true;
        }
    }

    function handleImageLoad() {
        imageLoaded = true;
    }

    // Optimized click handlers
    function handleFavoriteClick(event: Event) {
        event.stopPropagation();
        ontoggleFavorite();
    }

    function handleCopyClick(event: Event) {
        event.stopPropagation();
        copyCommand(animation.command);
    }

    async function handlePreviewClick() {
        if (!imageError) {
            await showmodal(imageSrc);
        }
    }

    function handleCardClick(event: Event) {
        // Don't trigger if clicking on interactive elements
        const target = event.target as HTMLElement;
        
        // Single check using closest() is more efficient
        if (!target.closest('button')) {
            copyCommand(animation.command);
        }
    }

    function handleCardKeydown(event: KeyboardEvent) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            copyCommand(animation.command);
        }
    }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="animation-card" onclick={handleCardClick} onkeydown={handleCardKeydown} role="button" tabindex="0" aria-label="Copy animation command: {animation.command}">
    <div class="card-header">
        <div class="title-section">
            <h3 class="animation-title">{formattedName}</h3>
        </div>
        <div class="action-buttons">
            <button
                class="action-btn favorite-btn {favorite ? 'active' : ''}"
                onclick={handleFavoriteClick}
                aria-label={favorite
                    ? "Remove from favorites"
                    : "Add to favorites"}
                title={favorite ? "Remove from favorites" : "Add to favorites"}
            >
                <svg class="heart-icon" viewBox="0 0 24 24" fill="currentColor">
                    {#if favorite}
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    {:else}
                        <path d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z"/>
                    {/if}
                </svg>
            </button>

            <button
                class="action-btn copy-btn {copied ? 'success' : ''}"
                onclick={handleCopyClick}
                aria-label="Copy command"
                title="Copy command"
            >
                {#if copied}
                    <svg class="check-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                {:else}
                    <svg class="copy-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                    </svg>
                {/if}
            </button>
        </div>
    </div>

    <div class="image-container">
        <button
            class="preview-button"
            onclick={handlePreviewClick}
            aria-label="View animation preview"
            disabled={imageError}
        >
            <div class="image-wrapper">
                <img
                    src={imageSrc}
                    alt="Animation preview"
                    class="preview-image {imageLoaded ? 'loaded' : ''}"
                    loading="lazy"
                    onerror={(event) => handleImageError(event, animation)}
                    onload={handleImageLoad}
                />
                {#if !imageLoaded && !imageError}
                    <div class="loading-placeholder">
                        <div class="loading-spinner"></div>
                    </div>
                {/if}
                {#if imageError}
                    <div class="error-placeholder">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M21 5v6.59l-3-3.01-4 4.01-4-4-4 4-3-3.01V5c0-1.1.9-2 2-2h14c1.1 0 2 .9 2 2zm-3 6.42l3 3.01V19c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2v-6.58l3 2.99 4-4 4 4 4-4z"/>
                        </svg>
                        <span>Preview unavailable</span>
                    </div>
                {/if}
            </div>
        </button>
    </div>

    <div class="tags-container">
        {#each animation.tags as tag}
            <button
                class="tag-btn"
                style="--tag-color: {tagColors[tag.toLowerCase()] ?? '#464646'}"
                onclick={() => addtag(tag)}
                aria-label={`Add tag ${tag}`}
            >
                {tag}
            </button>
        {/each}
    </div>
</div>

<style>
    .animation-card {
        background: var(--bg-secondary);
        border: 1px solid var(--border-primary);
        border-radius: var(--radius-lg);
        padding: var(--spacing-lg);
        transition: transform 0.08s ease-out, background-color 0.08s ease-out, border-color 0.08s ease-out;
        display: flex;
        flex-direction: column;
        height: 100%;
        position: relative;
        overflow: hidden;
        box-shadow: var(--shadow-sm);
        cursor: pointer;
        /* Set will-change permanently for hover-heavy elements */
        will-change: transform, background-color, border-color;
        /* Force GPU layer for better performance */
        transform: translateZ(0);
    }

    .animation-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 2px;
        background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));
        opacity: 0;
        transition: opacity 0.08s ease-out;
        /* Force own GPU layer */
        transform: translateZ(0);
    }

    .animation-card:hover {
        background: var(--bg-tertiary);
        border-color: var(--border-secondary);
        /* Use scale instead of translateY for better performance */
        transform: translateZ(0) scale(1.01);
    }

    .animation-card:hover::before,
    .animation-card:focus-visible::before {
        opacity: 1;
    }

    .animation-card:focus-visible {
        outline: 2px solid var(--accent-primary);
        outline-offset: 2px;
    }

    .card-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: var(--spacing-md);
        gap: var(--spacing-sm);
    }

    .title-section {
        flex: 1;
        min-width: 0;
    }

    .animation-title {
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--text-primary);
        margin: 0 0 var(--spacing-xs) 0;
        line-height: 1.3;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }



    .action-buttons {
        display: flex;
        gap: var(--spacing-xs);
        flex-shrink: 0;
    }

    .action-btn {
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--radius-md);
        border: none;
        cursor: pointer;
        transition: background-color 0.06s ease-out, color 0.06s ease-out, transform 0.06s ease-out;
        background: var(--bg-primary);
        color: var(--text-secondary);
        position: relative;
        overflow: hidden;
        /* Force GPU layer */
        transform: translateZ(0);
        will-change: transform, background-color, color;
    }

    .action-btn:hover {
        background: var(--bg-tertiary);
        color: var(--text-primary);
        transform: translateZ(0) scale(1.02);
    }

    .action-btn svg {
        width: 18px;
        height: 18px;
        position: relative;
        z-index: 1;
    }

    .favorite-btn {
        color: var(--accent-heart);
    }

    .favorite-btn.active {
        background: var(--accent-heart);
        color: var(--text-primary);
    }

    .favorite-btn.active:hover {
        background: #e74c68;
    }

    .copy-btn {
        color: var(--accent-primary);
    }

    .copy-btn.success {
        background: var(--accent-success);
        color: var(--text-primary);
    }

    .copy-btn:hover {
        background: var(--accent-primary);
        color: var(--text-primary);
    }

    .image-container {
        position: relative;
        margin: var(--spacing-md) 0;
        border-radius: var(--radius-md);
        overflow: hidden;
        background: var(--bg-primary);
    }

    .preview-button {
        width: 100%;
        padding: 0;
        border: none;
        background: none;
        cursor: pointer;
        position: relative;
        display: block;
        overflow: hidden;
        border-radius: var(--radius-md);
    }

    .image-wrapper {
        position: relative;
        width: 100%;
        height: 280px;
        background: var(--bg-primary);
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .preview-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center top;
        transition: opacity 0.2s ease, transform 0.06s ease-out;
        opacity: 0;
        /* Force GPU layer */
        transform: translateZ(0);
        will-change: transform, opacity;
    }

    .preview-image.loaded {
        opacity: 1;
    }

    .preview-button:hover .preview-image {
        transform: translateZ(0) scale(1.015);
    }



    .loading-placeholder,
    .error-placeholder {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: var(--text-muted);
        background: var(--bg-primary);
    }

    .loading-spinner {
        width: 24px;
        height: 24px;
        border: 2px solid var(--border-primary);
        border-top: 2px solid var(--accent-primary);
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    .error-placeholder svg {
        width: 32px;
        height: 32px;
        margin-bottom: var(--spacing-sm);
        opacity: 0.6;
    }

    .error-placeholder span {
        font-size: 0.85rem;
        text-align: center;
    }

    .tags-container {
        margin-top: auto;
        display: flex;
        flex-wrap: wrap;
        gap: var(--spacing-xs);
        padding-top: var(--spacing-md);
    }

    .tag-btn {
        display: inline-flex;
        align-items: center;
        padding: var(--spacing-xs) var(--spacing-sm);
        border-radius: var(--radius-full);
        font-size: 0.75rem;
        font-weight: 500;
        color: var(--text-primary);
        background: var(--tag-color);
        border: none;
        cursor: pointer;
        transition: transform 0.06s ease-out, filter 0.06s ease-out;
        text-transform: capitalize;
        line-height: 1;
        /* Force GPU layer */
        transform: translateZ(0);
        will-change: transform, filter;
    }

    .tag-btn:hover {
        transform: translateZ(0) scale(1.02);
        filter: brightness(1.1);
    }

    .tag-btn:focus {
        outline: 2px solid var(--accent-primary);
        outline-offset: 2px;
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
        .animation-card {
            padding: var(--spacing-md);
        }

        .image-wrapper {
            height: 220px;
        }

        .action-btn {
            width: 32px;
            height: 32px;
        }

        .action-btn svg {
            width: 16px;
            height: 16px;
        }
    }

    @media (max-width: 480px) {
        .image-wrapper {
            height: 200px;
        }
    }
</style>
