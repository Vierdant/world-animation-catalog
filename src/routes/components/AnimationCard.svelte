<script>
    import { GITHUB_IMAGE_REPO, tagColors } from "../constants.js";
    import { writeText } from "@tauri-apps/plugin-clipboard-manager";

    let { animation, showmodal, addtag } = $props();

    /**
     * @param {string} command
     */
    async function copyCommand(command) {
        await writeText(command);
    }

    /**
     * @param {string} name
     */
    function formatImageName(name) {
        return name.split(" ")[1];
    }

    /**
     * @param {{ name?: string; command: string; }} animation
     */
    function formatName(animation) {
        let result = animation.name ?? animation.command.split(" ")[1];
        result = result.charAt(0).toUpperCase() + result.slice(1).toLowerCase();
        return result;
    }
</script>

<div class="animation-item">
    <div class="header">
        <strong>{formatName(animation)}</strong>
        <button class="copy-button" onclick={() => copyCommand(animation.command)}>📋</button>
    </div>

    <button
        class="preview-button"
        onclick={() =>
            showmodal(
                GITHUB_IMAGE_REPO + formatImageName(animation.command) + ".png",
            )}
        aria-label="View animation preview"
    >
        <img
            src={GITHUB_IMAGE_REPO +
                formatImageName(animation.command) +
                ".png"}
            alt="animation preview"
            class="preview"
            loading="lazy"
        />
    </button>

    <div class="tags">
        {#each animation.tags as tag}
            <button
                class="tag-button"
                style="background-color: {tagColors[tag.toLowerCase()] ??
                    '#464646'}"
                onclick={() => addtag(tag)}
                aria-label={`Add tag ${tag}`}
            >
                {tag}
            </button>
        {/each}
    </div>
</div>

<style>
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
        height: 220px;
        border-radius: 8px;
        object-fit: cover;
        object-position: top center;
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

    .copy-button {
        background-color: #5865f2;
        color: white;
        border: none;
        padding: 0.4rem 0.6rem;
        border-radius: 6px;
        cursor: pointer;
        font-size: 0.85rem;
        transition: background-color 0.2s;
    }

    .copy-button:hover {
        background-color: #4752c4;
    }

    .tag-button {
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
        transition:
            transform 0.1s ease,
            opacity 0.1s ease;
        border: none;
    }

    .tag-button:hover {
        transform: scale(1.05);
    }

    .preview-button {
        padding: 0;
        margin: 0;
        border: none;
        background: none;
        cursor: pointer;
        display: block;
        width: 100%;
    }

    .preview-button:hover {
        transform: scale(1.02);
    }

    .preview-button:focus {
        outline: 2px solid #5865f2;
        outline-offset: 2px;
    }

    .preview-button img.preview {
        pointer-events: none;
    }
</style>
