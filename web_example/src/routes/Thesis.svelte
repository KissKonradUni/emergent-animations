<script lang="ts">
    import Page from '../elements/Page.svelte';    
</script>

<Page title="Thesis" extra={{href: "/main.pdf", title: "Open in a new page →"}}>
    <iframe src="/main.pdf" frameborder="0" title="Thesis PDF"></iframe>
</Page>

<style>
    iframe {
        width: 100%;
        height: calc(100% - 3.5rem);
        border: 1px solid var(--border-color);
        border-radius: 4px;
    }
</style>