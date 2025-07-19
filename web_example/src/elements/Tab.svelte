<script lang="ts">
    import { getContext, onMount } from 'svelte';

    type TabContext = {
        registerTab: (tab: { title: string }) => number;
        activeTab: () => number;
    };

    let { title, children } = $props<{ title: string; children: any }>();
    const { registerTab, activeTab } = getContext<TabContext>('tabs');

    let index = $state(-1);

    onMount(() => {
        index = registerTab({ title });
    });
</script>

{#if index === activeTab()}
    <div class="tab-panel" role="tabpanel">
        {@render children()}
    </div>
{/if}

<style>
    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }

    .tab-panel {
        animation: fadeIn 0.3s ease-in-out;
    }
</style>