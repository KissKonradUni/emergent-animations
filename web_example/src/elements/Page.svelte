<script lang="ts">
    let { title = "Some Page", children } = $props();
</script>

<section class="page">
    <span class="title">
        {title}
    </span>
    
    {@render children?.()}
</section>

<style>
    .page {
        min-height: 100%;
        min-width: 800px;
        padding: 1rem;
        
        background-color: var(--primary-color);
        border: 1px solid var(--border-color);
        border-radius: 8px;
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