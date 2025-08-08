<script>
    export let checked = false;
    export let onChange = (/** @type {boolean} */ _checked) => {};
    export let text = "Default Text";
    export let description = "";
</script>

<div class="toggle-container">
    <div class="toggle-content">
        <div class="toggle-info">
            <span class="toggle-label">{text}</span>
            {#if description}
                <span class="toggle-description">{description}</span>
            {/if}
        </div>
        <label class="toggle-switch">
            <input
                type="checkbox"
                bind:checked
                onchange={() => onChange(checked)}
            />
            <span class="slider">
                <span class="slider-thumb"></span>
            </span>
        </label>
    </div>
</div>

<style>
    .toggle-container {
        display: flex;
        align-items: center;
        padding: var(--spacing-md);
        background: var(--bg-secondary);
        border: 1px solid var(--border-primary);
        border-radius: var(--radius-lg);
        transition: all var(--transition-normal);
        cursor: pointer;
        user-select: none;
    }

    .toggle-container:hover {
        background: var(--bg-tertiary);
        border-color: var(--border-secondary);
        transform: translateY(-1px);
        box-shadow: var(--shadow-sm);
    }

    .toggle-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        gap: var(--spacing-md);
    }

    .toggle-info {
        flex: 1;
        min-width: 0;
    }

    .toggle-label {
        display: block;
        color: var(--text-primary);
        font-size: 0.95rem;
        font-weight: 500;
        line-height: 1.4;
        margin-bottom: var(--spacing-xs);
    }

    .toggle-description {
        display: block;
        color: var(--text-muted);
        font-size: 0.85rem;
        line-height: 1.3;
    }

    .toggle-switch {
        position: relative;
        display: inline-block;
        width: 52px;
        height: 28px;
        flex-shrink: 0;
    }

    .toggle-switch input {
        opacity: 0;
        width: 0;
        height: 0;
        position: absolute;
    }

    .slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: var(--border-primary);
        transition: all var(--transition-normal);
        border-radius: var(--radius-full);
        border: 2px solid transparent;
        overflow: hidden;
    }

    .slider::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
        opacity: 0;
        transition: opacity var(--transition-normal);
    }

    .slider-thumb {
        position: absolute;
        content: "";
        height: 20px;
        width: 20px;
        left: 2px;
        bottom: 2px;
        background: var(--text-primary);
        transition: all var(--transition-normal);
        border-radius: 50%;
        box-shadow: var(--shadow-sm);
        z-index: 2;
    }

    input:checked + .slider {
        border-color: var(--accent-primary);
    }

    input:checked + .slider::before {
        opacity: 1;
    }

    input:checked + .slider .slider-thumb {
        transform: translateX(24px);
        background: var(--text-primary);
    }

    input:focus-visible + .slider {
        box-shadow: 0 0 0 3px rgba(88, 101, 242, 0.2);
    }

    .toggle-container:hover .slider {
        background: var(--border-secondary);
    }

    .toggle-container:hover input:checked + .slider {
        background: var(--accent-secondary);
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
        .toggle-container {
            padding: var(--spacing-sm);
        }

        .toggle-content {
            gap: var(--spacing-sm);
        }

        .toggle-switch {
            width: 48px;
            height: 26px;
        }

        .slider-thumb {
            height: 18px;
            width: 18px;
        }

        input:checked + .slider .slider-thumb {
            transform: translateX(22px);
        }
    }
</style>
