<script lang="ts">
    import { createEventDispatcher } from "svelte";

    export let searchTerm: string = "";
    export let allTags: string[] = [];
    export let inputRef: HTMLInputElement;

    const dispatch = createEventDispatcher();

    let tagSuggestions: string[] = [];
    let selectedSuggestion: boolean = false;
    let highlightedIndex: number = -1;
    export let showSuggestions = false;
    export let firstButton: HTMLButtonElement | null = null;

    $: if (!selectedSuggestion) {
        const cursor = inputRef?.selectionStart ?? searchTerm.length;
        const beforeCursor = searchTerm.slice(0, cursor);

        // Match the current word before cursor
        const tagMatch = /(?:^|\s)(tag:[^\s]*)$/.exec(beforeCursor);

        // Only trigger suggestions if cursor is *within* or at end of tag:... and not after a space
        if (tagMatch && !/\s$/.test(beforeCursor)) {
            const tagQuery = tagMatch[1].slice(4).toLowerCase();

            const usedTags = searchTerm
                .split(/\s+/)
                .filter((term) => term.startsWith("tag:"))
                .map((term) => term.slice(4).toLowerCase());

            tagSuggestions = allTags
                .filter((tag) => tag.toLowerCase().includes(tagQuery))
                .filter((tag) => !usedTags.includes(tag.toLowerCase()))
                .slice(0, 8);

            showSuggestions = tagSuggestions.length > 0;
            highlightedIndex = -1;
        } else {
            showSuggestions = false;
            tagSuggestions = [];
            highlightedIndex = -1;
        }
    }

    function selectTag(tag: string) {
        const newTerm = searchTerm.replace(/tag:[^\s]*$/, `tag:${tag} `);
        selectedSuggestion = true;
        dispatch("select", newTerm);
        showSuggestions = false;

        inputRef?.focus();
        
        setTimeout(() => {
            selectedSuggestion = false;
        }, 50)
    }

    function handleKeydown(e: KeyboardEvent, tag: string) {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            selectTag(tag);
        }
    }
</script>

{#if showSuggestions}
    <div class="autocomplete-dropdown" role="listbox">
        <div class="dropdown-header">
            <svg class="tag-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z"/>
            </svg>
            <span>Available tags</span>
        </div>
        {#each tagSuggestions as tag, index}
            {#if index === 0}
                <button
                    type="button"
                    class="suggestion-item {index === highlightedIndex ? 'highlighted' : ''}"
                    bind:this={firstButton}
                    on:click={() => selectTag(tag)}
                    on:keydown={(e) => handleKeydown(e, tag)}
                    role="option"
                    aria-selected={index === highlightedIndex}
                >
                    <span class="tag-text">{tag}</span>
                    <svg class="add-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                    </svg>
                </button>
            {:else}
                <button
                    type="button"
                    class="suggestion-item {index === highlightedIndex ? 'highlighted' : ''}"
                    on:click={() => selectTag(tag)}
                    on:keydown={(e) => handleKeydown(e, tag)}
                    role="option"
                    aria-selected={index === highlightedIndex}
                >
                    <span class="tag-text">{tag}</span>
                    <svg class="add-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                    </svg>
                </button>
            {/if}
        {/each}
    </div>
{/if}

<style>
    .autocomplete-dropdown {
        position: absolute;
        top: calc(100% + var(--spacing-xs));
        left: 0;
        right: 0;
        background: var(--bg-secondary);
        border: 1px solid var(--border-primary);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-lg);
        z-index: 1000;
        max-height: 300px;
        overflow-y: auto;
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        animation: dropdownSlideIn var(--transition-normal) ease-out;
    }

    @keyframes dropdownSlideIn {
        from {
            opacity: 0;
            transform: translateY(-8px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .dropdown-header {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        padding: var(--spacing-sm) var(--spacing-md);
        border-bottom: 1px solid var(--border-primary);
        color: var(--text-muted);
        font-size: 0.85rem;
        font-weight: 500;
        background: var(--bg-primary);
        border-radius: var(--radius-lg) var(--radius-lg) 0 0;
    }

    .tag-icon {
        width: 16px;
        height: 16px;
        opacity: 0.7;
    }

    .suggestion-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        padding: var(--spacing-md);
        background: none;
        border: none;
        color: var(--text-primary);
        text-align: left;
        cursor: pointer;
        transition: all var(--transition-fast);
        font-size: 0.9rem;
        font-weight: 500;
        border-radius: 0;
        position: relative;
    }

    .suggestion-item:last-child {
        border-radius: 0 0 var(--radius-lg) var(--radius-lg);
    }

    .suggestion-item:hover,
    .suggestion-item.highlighted {
        background: var(--bg-tertiary);
        color: var(--text-primary);
    }

    .suggestion-item:focus {
        outline: none;
        background: var(--accent-primary);
        color: var(--text-primary);
    }

    .tag-text {
        flex: 1;
        text-transform: capitalize;
    }

    .add-icon {
        width: 16px;
        height: 16px;
        opacity: 0.6;
        transition: opacity var(--transition-fast);
    }

    .suggestion-item:hover .add-icon,
    .suggestion-item.highlighted .add-icon {
        opacity: 1;
    }

    /* Custom scrollbar for the dropdown */
    .autocomplete-dropdown::-webkit-scrollbar {
        width: 6px;
    }

    .autocomplete-dropdown::-webkit-scrollbar-track {
        background: var(--bg-primary);
        border-radius: var(--radius-sm);
    }

    .autocomplete-dropdown::-webkit-scrollbar-thumb {
        background: var(--border-primary);
        border-radius: var(--radius-sm);
    }

    .autocomplete-dropdown::-webkit-scrollbar-thumb:hover {
        background: var(--border-secondary);
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
        .autocomplete-dropdown {
            max-height: 250px;
        }

        .suggestion-item {
            padding: var(--spacing-sm) var(--spacing-md);
            font-size: 0.85rem;
        }

        .dropdown-header {
            padding: var(--spacing-xs) var(--spacing-sm);
            font-size: 0.8rem;
        }
    }
</style>
