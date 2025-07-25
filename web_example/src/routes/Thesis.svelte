<script lang="ts">
    import Page from '../elements/Page.svelte';    
    import { IS_LOCAL, BASE_URL } from '../Router';

    const pdfUrl = IS_LOCAL ? 'main.pdf' : `${BASE_URL}/main.pdf`;
</script>

<Page title="Thesis" extra={{href: pdfUrl, title: "Open in a new page →"}}>
    <iframe src={pdfUrl} frameborder="0" title="Thesis PDF"></iframe>
</Page>

<style>
    iframe {
        width: 100%;
        height: calc(100% - 3.5rem);
        border: 1px solid var(--border-color);
        border-radius: 4px;
    }
</style>