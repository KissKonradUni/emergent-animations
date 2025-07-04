<script lang="ts">
	import Link from "./Link.svelte";

</script>

<header>
	<Link href="/" cssClass="navbar-title">
        Emergent Animations
    </Link>
	<nav>
		<Link cssClass="navbar-link" href="/">Home</Link>
		<Link cssClass="navbar-link" href="/examples">Examples</Link>
		<Link cssClass="navbar-link" href="/about">About</Link>
	</nav>
</header>

<style>
	header {
		position: sticky;
		display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;

        top: 0;
		padding: 1rem 2rem;

		background-color: var(--primary-color);
        border-bottom: 1px solid var(--border-color);

		z-index: 100;
	}

    nav {
        display: flex;
        gap: 1rem;
    }

    :global(.navbar-link) {
        color: var(--text-color);
        text-decoration: none;
        font-weight: bold;
    }

    :global(.navbar-link:hover) {
        text-decoration: underline;
    }

    :global(.navbar-title) {
        font-size: 2rem;
        font-weight: bold;
    
        color: var(--text-color);
        text-decoration: none;
    }
</style>
