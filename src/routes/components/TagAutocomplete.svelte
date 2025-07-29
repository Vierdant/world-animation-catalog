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
                .slice(0, 5);

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
    <div class="tag-suggestions">
        {#each tagSuggestions as tag, index}
            {#if index === 0}
                <button
                    type="button"
                    class="tag-button"
                    bind:this={firstButton}
                    on:click={() => selectTag(tag)}
                    on:keydown={(e) => handleKeydown(e, tag)}
                >
                    {tag}
                </button>
            {:else}
                <button
                    type="button"
                    class="tag-button"
                    on:click={() => selectTag(tag)}
                    on:keydown={(e) => handleKeydown(e, tag)}
                >
                    {tag}
                </button>
            {/if}
        {/each}
    </div>
{/if}

<style>
    .tag-suggestions {
        position: absolute;
        background-color: #1e1f22;
        border: 1px solid #4e5058;
        border-radius: 6px;
        margin-top: -1.5rem;
        max-height: 200px;
        overflow-y: auto;
        z-index: 100;
        list-style: none;
        padding: 0.5rem;
        width: 100%;
    }

    .tag-button {
        display: block;
        width: 100%;
        background: none;
        border: none;
        color: white;
        text-align: left;
        padding: 0.5rem 1rem;
        cursor: pointer;
        border-radius: 4px;
    }

    .tag-button:hover,
    .tag-button:focus {
        background-color: #3a3b3f;
        outline: none;
    }
</style>
