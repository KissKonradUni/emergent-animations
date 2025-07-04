<script lang="ts">
    let { title = "Some Page", children, style } = $props();
</script>

<section class="page" {style}>
    <span class="title">
        {title}
    </span>
    
    {@render children?.()}
</section>

<style>
    .page {
        min-height: 100%;
        width: 100%;
        max-width: 800px;
        padding: 1rem;
        
        background-color: var(--primary-color);
        border: 1px solid var(--border-color);
        border-radius: 8px;

        box-shadow: 0 0px 4px 4px rgba(0, 0, 0, 0.5);
    }

    .title {
        display: block;
        
        padding-bottom: 0.5rem;
        margin-bottom: 0.5rem;
        
        font-size: 2rem;
        font-weight: bold;
        color: var(--text-color);

        border-bottom: 1px solid var(--border-color);
    }
</style>