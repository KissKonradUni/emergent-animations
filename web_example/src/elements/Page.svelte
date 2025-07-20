<script lang="ts">
    interface IExtraTitle {
        href: string;
        title: string;
    }

    let { title = "Some Page", children, style = "", extra = null as IExtraTitle } = $props();
</script>

<section class="page" {style} id="current-page">
    <span class="title">
        {title}
        {#if extra}
            <a href={extra.href} target="_blank" rel="noopener noreferrer">
                {extra.title}
            </a>
        {/if}
    </span>
    
    {@render children?.()}
</section>

<style>
    .page {
        min-height: 100%;
        width: 100%;
        max-width: 1280px;
        padding: 1rem;
        
        background-color: var(--primary-color);
        border: 1px solid var(--border-color);
        border-radius: 8px;

        box-shadow: 0 0px 4px 4px rgba(0, 0, 0, 0.5);

        animation: fadeIn 0.15s ease-in-out forwards;
    }

    .title {
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        padding-bottom: 0.5rem;
        margin-bottom: 0.5rem;
        
        font-size: 2rem;
        font-weight: bold;
        color: var(--text-color);

        border-bottom: 1px solid var(--border-color);
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
            translate: 0 -10px;
        }
        to {
            opacity: 1;
            translate: 0 0;
        }
    }

    :global(.page.fade-out) {
        animation: fadeOut 0.15s ease-in-out forwards;
    }

    @keyframes fadeOut {
        from {
            opacity: 1;
            translate: 0 0;
        }
        to {
            opacity: 0;
            translate: 0 10px;
        }
    }
    
    a {
        display: block;
        
        font-size: 1rem;
        color: var(--accent-color);
    }

    a:hover {
        color: var(--light-accent-color);
    }
</style>