<script lang="ts">
	import Link from "./Link.svelte";
</script>

<header>
	<Link href="/" cssClass="navbar-title">
        Emergent Animations
    </Link>
	<nav>
		<Link cssClass="navbar-link" href="/">Home</Link>
        <Link cssClass="navbar-link" href="/thesis">Thesis</Link>
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

        box-shadow: 0 0px 4px 4px rgba(0, 0, 0, 0.5);

		z-index: 100;
	}

    nav {
        display: flex;
        gap: 1rem;
    }

    :global(.navbar-title) {
        font-size: 2rem;
        font-weight: bold;
    
        color: var(--text-color) !important;
        text-decoration: none;

        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    @media screen and (max-width: 800px) {
        header {
            padding: 0.5rem 1rem;
        }

        nav {
            gap: 0.5rem;
        }

        :global(.navbar-title) {
            font-size: 1.33rem;
            white-space: inherit;
        }

        :global(.navbar-link) {
            font-size: 0.9rem;
        }
    }
</style>
