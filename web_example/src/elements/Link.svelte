<script lang="ts">
    import { Navigate } from "../Router";

    let { href, style = "", cssClass = "", children } = $props();

    function onclick(event: MouseEvent) {
        event.preventDefault();
        event.stopPropagation();

        Navigate(href);
    }
</script>

<a {href} {style} class="link {cssClass}" {onclick}>
    {@render children?.()}
    {#if !children}
        {href}
    {/if}
</a>