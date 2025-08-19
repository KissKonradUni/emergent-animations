<script lang="ts">
    import { tick } from "svelte";
    import { Navigate } from "../Router";

    let { href, style = "", cssClass = "", target = "", rel = "", children } = $props();
    let element: HTMLAnchorElement;

    function onclick(event: MouseEvent) {
        if (target !== "")
            return; // Do not handle click if target is set (e.g., _blank)
        
        event.preventDefault();
        event.stopPropagation();

        Navigate(href);
    }

    // Trim whitespace from the link text after rendering
    tick().then(() => {
        element.innerText = element.innerText.trim();
    });
</script>

<a {href} {style} {target} {rel} class="link {cssClass}" {onclick} bind:this={element}>
    {@render children?.()}
    {#if !children}
        {href}
    {/if}
</a>

<style>
    .link {
        color: var(--accent-color);
        font-weight: bold;
    }

    .link:hover {
        color: var(--light-accent-color);
    }

    .link:active {
        color: var(--text-color);
    }
</style>