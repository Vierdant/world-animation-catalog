<script>
    import { searchShortcuts } from "../constants.js";
    
    export let onShortcutClick = (/** @type {string} */ query) => {};
</script>

<div class="shortcuts-container">
    <div class="shortcuts-header">
        <svg class="shortcuts-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
        <span>Quick Search</span>
    </div>
    <div class="shortcuts-grid">
        {#each searchShortcuts as shortcut}
            <button
                class="shortcut-btn"
                onclick={() => onShortcutClick(shortcut.query)}
                title={shortcut.label}
            >
                <span class="shortcut-label">{shortcut.label}</span>
                <svg class="shortcut-arrow" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                </svg>
            </button>
        {/each}
    </div>
</div>

<style>
    .shortcuts-container {
        background: var(--bg-secondary);
        border: 1px solid var(--border-primary);
        border-radius: var(--radius-lg);
        padding: var(--spacing-lg);
        margin: var(--spacing-lg) 0;
        box-shadow: var(--shadow-sm);
    }

    .shortcuts-header {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        margin-bottom: var(--spacing-md);
        color: var(--text-primary);
        font-weight: 600;
        font-size: 0.95rem;
    }

    .shortcuts-icon {
        width: 18px;
        height: 18px;
        color: var(--accent-primary);
    }

    .shortcuts-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: var(--spacing-sm);
    }

    .shortcut-btn {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--spacing-sm) var(--spacing-md);
        background: var(--bg-primary);
        border: 1px solid var(--border-primary);
        border-radius: var(--radius-md);
        color: var(--text-primary);
        cursor: pointer;
        transition: all var(--transition-fast);
        font-size: 0.85rem;
        font-weight: 500;
        text-align: left;
    }

    .shortcut-btn:hover {
        background: var(--bg-tertiary);
        border-color: var(--accent-primary);
        transform: translateY(-1px);
        box-shadow: var(--shadow-sm);
    }

    .shortcut-btn:focus {
        outline: 2px solid var(--accent-primary);
        outline-offset: 2px;
    }

    .shortcut-label {
        flex: 1;
    }

    .shortcut-arrow {
        width: 16px;
        height: 16px;
        opacity: 0.6;
        transition: opacity var(--transition-fast);
    }

    .shortcut-btn:hover .shortcut-arrow {
        opacity: 1;
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
        .shortcuts-grid {
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: var(--spacing-xs);
        }

        .shortcut-btn {
            padding: var(--spacing-xs) var(--spacing-sm);
            font-size: 0.8rem;
        }

        .shortcuts-container {
            padding: var(--spacing-md);
        }
    }

    @media (max-width: 480px) {
        .shortcuts-grid {
            grid-template-columns: 1fr;
        }
    }
</style>
