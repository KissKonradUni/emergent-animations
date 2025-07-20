<script lang="ts">
    import Page from "../../elements/Page.svelte";
	
	import Link from "../../elements/Link.svelte";
</script>

<Page title="Examples">
    <Link href="/examples/frame-animations" cssClass="example-menu-item">
        Frame Animations
    </Link>
</Page>

<style>
    :global(.example-menu-item) {
        display: block;

        padding: 0.5rem 1rem;
        
        background-color: var(--secondary-color);
        border-radius: 4px;
    }

    :global(.example-menu-item:hover) {
        background-color: var(--tertiary-color);
    }
</style>