<script lang="ts">
	import Navbar from "./elements/Navbar.svelte";
	import Router from "./elements/Router.svelte";

    import Link from "./elements/Link.svelte";
</script>

<Navbar />
<main>
	<Router />
</main>
<footer>
	<span>
        Created by 
        <Link href="https://github.com/KissKonradUni/emergent-animations" target="_blank" rel="noopener noreferrer">Konrád Soma Kiss</Link>
        using 
        <Link href="https://svelte.dev" target="_blank" rel="noopener noreferrer">Svelte</Link>
        ❤️
    </span>
</footer>

<style>
	main {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;

		flex: 1;
		padding: 1rem;
	}

    @media screen and (max-width: 800px) {
        main {
            padding: 0.5rem 0;
        }
    }
	
	footer {
		display: flex;
        flex-direction: row;
		justify-content: flex-end;
		align-items: center;
		
		padding: 0.5rem;
		
		background-color: var(--primary-color);
        border-top: 1px solid var(--border-color);

        box-shadow: 0 0px 4px 4px rgba(0, 0, 0, 0.5);
	}
</style>