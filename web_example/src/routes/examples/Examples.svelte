<script lang="ts">
    import Page from "../../elements/Page.svelte";
	import Link from "../../elements/Link.svelte";
    import "./examples.css";

    
</script>

<Page title="Examples">
    <div class="list">
        <Link href="/examples/functional-animations" cssClass="example-menu-item">
            Functional Animations
        </Link>
        <Link href="/examples/frame-animations" cssClass="example-menu-item">
            Frame Animations
        </Link>
        <Link href="/examples/rule-based-animations" cssClass="example-menu-item">
            Rule Based Animations
        </Link>
    </div>
</Page>

<style>
    div.list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
</style>