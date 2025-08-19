<script>
	import Page from "../elements/Page.svelte";
    import Link from "../elements/Link.svelte";
</script>

<Page title="Home" style="display: flex; flex-direction: column;">
    <div class="background">
        <div class="circles">
            <div class="circle"></div>
            <div class="circle"></div>
            <div class="circle"></div>
            <div class="circle"></div>
            <div class="circle"></div>
            <div class="circle"></div>
        </div>
        <div class="block">
            <p>
                This site is a living showcase for the 
                <Link href="/thesis">thesis</Link>
                <b>“Emergent Animation Systems: From Interpolation to Procedural Motion”</b>. Here, you'll find interactive examples and visual experiments that reveal how simple rules can create surprisingly complex and lifelike movement.
            </p>
            <p>
                Animation isn't just about cartoons or CGI, every moving graphic, from UI transitions to flocking birds, is built on simple algorithms. This project explores a spectrum of techniques: from basic interpolation and keyframes, through physics-based and noise-driven motion, to emergent behaviors like flocking and cellular automata.
            </p>
            <p>
                Each example is designed to be both educational and hands-on. You can inspect the code, tweak parameters, and see how mathematical ideas translate into dynamic visuals. The goal: to bridge theory and practice, and to show that complexity can arise from the simplest systems.
            </p>
            <p>
                Whether you're a developer, designer, or just curious, dive into the examples
                <Link href="/examples">here</Link>
                and discover how simple code can create motion that feels alive.
            </p>
        </div>
    </div>
</Page>

<style>
    div.block {
        position: relative;

        max-width: 70%;
        margin: 2rem auto;

        z-index: 10;
    }

    @media (max-width: 600px) {
        div.block {
            max-width: 90%;
            margin: 1rem auto;
        }
    }

    div.background {
        position: relative;

        width: 100%;
        height: 100%;
        padding: 0;

        background: radial-gradient(
            circle at center,
            rgba(0, 0, 0, 0.2) 10%,
            rgba(0, 0, 0, 0.0) 0%
        );
        background-size: 3rem 3rem;
        background-repeat: repeat;
    }

    p:first-child {
        margin-top: 0;
    }

    div.circles {
        position: absolute;
        left: -1rem;
        top: -0.5rem;

        width : calc(100% + 2.0rem);
        height: calc(100% + 1.5rem);

        display: flex;
        justify-content: center;
        align-items: center;

        pointer-events: none;
        overflow: hidden;
    }

    div.circle {
        width: 15rem;
        height: 15rem;

        background-color: var(--accent-color);
        border-radius: 50%;

        filter: blur(100px);
        animation: circle 3s ease-in-out infinite;
        
        translate: -75% -50%;
        scale: 2 1.5;
        rotate: 30deg;
        
        opacity: 0.25;
    }

    div.circle:nth-child(2) {
        animation-delay: -0.5s;
        rotate: -30deg;
    }

    div.circle:nth-child(3) {
        animation-delay: -1s;
        rotate: 60deg;
    }

    div.circle:nth-child(4) {
        animation-delay: -1.5s;
        rotate: -60deg;
    }

    div.circle:nth-child(5) {
        animation-delay: -2s;
        rotate: 90deg;
    }

    div.circle:nth-child(6) {
        animation-delay: -2.5s;
        rotate: 120deg;
    }

    @keyframes circle {
        0% {
            translate: -75% -50%;
        }
        25% {
            translate: 75% -25%;
        }
        50% {
            translate: -75% 25%;
        }
        75% {
            translate: 75% 50%;
        }
        100% {
            translate: -75% -50%;
        }
    }
</style>