<script lang="ts">
    import Page from '../elements/Page.svelte';    
</script>

<Page title="Thesis" extra={{href: "/main.pdf", title: "Open in new page →"}}>
    <iframe src="/main.pdf" frameborder="0" title="Thesis PDF"></iframe>
</Page>

<style>
    iframe {
        width: 100%;
        height: 70.3vh;
        border: 1px solid var(--border-color);
        border-radius: 4px;
    }
</style>