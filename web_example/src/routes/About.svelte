<script>
	import Page from "../elements/Page.svelte";
	import Link from "../elements/Link.svelte";
</script>

<Page title="About">
    <h3>What is this?</h3>
	<p>
		Emergent Animation Systems is a research & demo project.
        <br>
		The work ties an academic write-up to interactive web examples so you can both read the theory and experiment with the code.
	</p>

    <h3>What can I find here?</h3>
	<ul>
		<li><Link href="/examples">Interactive examples</Link> - functional animations, procedural walkers, boids, cellular automata and more.</li>
		<li><Link href="/main.pdf" target="_blank">Thesis PDF</Link> - the LaTeX document that explains the algorithms and design choices.</li>
		<li><Link href="https://github.com/KissKonradUni/emergent-animations" target="_blank" rel="noopener">Source on GitHub</Link> - explore the full codebase and examples.</li>
	</ul>

	<h3>About the author</h3>
	<p>
		Konrád Soma Kiss - BSc Student in Computer Engineering (<Link href="https://konrads.hu" target="_blank">Website</Link>)
	</p>

	<h3>Tools & tech</h3>
	<ul>
		<li>Web demo: Svelte + TypeScript + Vite (with Deno)</li>
		<li>Rendering: HTML5 Canvas (custom scene & object system)</li>
		<li>Thesis: LaTeX</li>
	</ul>

	<h3>Contact & contributions</h3>
	<p>
		If you'd like to suggest an example, report a bug, or contribute, open an issue or a pull request on the <Link href="https://github.com/KissKonradUni/emergent-animations" target="_blank" rel="noopener">GitHub repository</Link>.
	</p>
</Page>