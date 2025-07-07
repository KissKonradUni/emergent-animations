<script lang="ts">
    import Page from '../elements/Page.svelte';
</script>

<Page title="Thesis">
    <iframe src="/main.pdf" frameborder="0" title="Thesis PDF"></iframe>
    <a href="/main.pdf" target="_blank" rel="noopener noreferrer">
        <h1>Open in new tab &rightarrow;</h1>
    </a>
</Page>

<style>
    iframe {
        width: 100%;
        height: 66.6vh;
        border: 1px solid var(--border-color);
        border-radius: 4px;
    }

    a {
        display: block;
        color: var(--link-color);
        font-size: 0.5rem;
        margin-top: 0.5rem;
    }
</style>