<script lang="ts">
    import { setContext } from 'svelte';

    let { children } = $props();

    let tabs = $state<{ title: string }[]>([]);
    let activeTab = $state(parseInt(new URL(window.location.href).searchParams.get('tab') || '0', 10));

    setContext('tabs', {
        registerTab: (tab: { title: string }) => {
            tabs.push(tab);
            return tabs.length - 1;
        },
        activeTab: () => activeTab
    });

    $effect(() => {
        const url = new URL(window.location.href);
        url.searchParams.set('tab', activeTab.toString());
        window.history.replaceState({}, '', url.toString());
    });
</script>

<div class="tabs">
    <div class="tab-buttons" role="tablist">
        {#each tabs as tab, i}
            <button
                role="tab"
                class:active={activeTab === i}
                onclick={() => (activeTab = i)}
            >
                {tab.title}
            </button>
        {/each}
    </div>
    <div class="tab-contents">
        {@render children?.()}
    </div>
</div>

<style>
    .tab-buttons {
        display: flex;

        padding: 0 0.125rem;
        gap: 0.5rem;
    }

    .tab-buttons button {
        padding: 0.25rem 1.0rem;

        background: var(--secondary-color);
        color: var(--text-color);

        cursor: pointer;

        border: none;
        border-radius: 4px 4px 0 0;
    }

    .tab-buttons button.active {
        padding-top: calc(0.25rem + 4px);

        background: var(--tertiary-color);
        color: var(--accent-color);

        border-bottom: 4px solid var(--accent-color);
    }

    .tab-buttons button:hover {
        background: var(--tertiary-color);   
    }

    .tab-contents {
        overflow: hidden;

        border: 1px solid var(--border-color);
        border-radius: 4px;
    }
</style>