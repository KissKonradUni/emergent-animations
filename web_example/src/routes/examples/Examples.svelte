<script lang="ts">
    import Page from "../../elements/Page.svelte";
	import Link from "../../elements/Link.svelte";
    import "./examples.css";

    import { Examples } from "../../Router";
</script>

<Page title="Examples">
    <div class="list">
        {#each Examples as example}
        <Link href={example.href} cssClass="example-menu-item">
            {example.title}
        </Link>
        {/each}
    </div>
</Page>

<style>
    div.list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
</style>