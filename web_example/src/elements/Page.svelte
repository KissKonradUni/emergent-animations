<script lang="ts">
    interface ExtraTitle {
        href: string;
        title: string;
    }

    let { title = "Some Page", children, style = "", extra = null as ExtraTitle } = $props();
</script>

<section class="page" {style}>
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
    
    a {
        display: block;
        
        font-size: 1rem;
        color: var(--accent-color);
    }

    a:hover {
        color: var(--light-accent-color);
    }
</style>