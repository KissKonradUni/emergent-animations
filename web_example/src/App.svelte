<script lang="ts">
	import Navbar from "./elements/Navbar.svelte";
	import Router from "./elements/Router.svelte";
</script>

<Navbar />
<main>
	<Router />
</main>
<footer>
	
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
	
	footer {
		display: flex;
		justify-content: center;
		align-items: center;
		
		padding: 1rem;
		
		background-color: var(--primary-color);
        border-top: 1px solid var(--border-color);
	}
</style>