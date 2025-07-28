<script>
    export let checked = false;
    export let onChange = (/** @type {boolean} */ _checked) => {};
    export let text = "Default Text";
</script>

<div class="toggle-wrapper">
    <label class="switch">
        <input
            type="checkbox"
            bind:checked
            onchange={() => onChange(checked)}
        />
        <span class="slider round"></span>
    </label>
    <span class="toggle-label">{text}</span>
</div>

<style>
    .toggle-wrapper {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 1.5rem;
        user-select: none;
    }

    .toggle-label {
        color: #ccc;
        font-size: 0.95rem;
    }

    .switch {
        position: relative;
        display: inline-block;
        width: 46px;
        height: 26px;
    }

    .switch input {
        opacity: 0;
        width: 0;
        height: 0;
    }

    .slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #777;
        transition: 0.3s;
        border-radius: 34px;
    }

    .slider::before {
        position: absolute;
        content: "";
        height: 20px;
        width: 20px;
        left: 3px;
        bottom: 3px;
        background-color: white;
        transition: 0.3s;
        border-radius: 50%;
    }

    input:checked+.slider {
        background-color: #5865f2;
    }

    input:checked+.slider::before {
        transform: translateX(20px);
    }
</style>
