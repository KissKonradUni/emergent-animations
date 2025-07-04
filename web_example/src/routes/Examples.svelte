<script lang="ts">
    import Page from "../elements/Page.svelte";
    import { onMount } from "svelte";
    import { CanvasWrapper } from "../rendering/CanvasWrapper";

    let canvasElement: HTMLCanvasElement | null = null;
    let wrapperElement: HTMLElement | null = null;
    let wrapper: CanvasWrapper | null = null;

    let isFullscreen = $state(false);

    onMount(() => {
        let canvasElement  = document.getElementById("canvas") as HTMLCanvasElement;
        let wrapperElement = document.querySelector(".canvas-wrapper") as HTMLElement;
        wrapper = new CanvasWrapper(
            canvasElement,
            wrapperElement
        );

        document.getElementById("fullscreen")?.addEventListener("click", () => {
            wrapperElement.requestFullscreen().catch((error) => {
                console.error("Failed to enter fullscreen mode:", error);
            });
            isFullscreen = true;
        });

        document.addEventListener("fullscreenchange", () => {
            if (!document.fullscreenElement) {
                isFullscreen = false;
            }
        });
    });
</script>

<Page title="Examples" style="position:relative; display: flex; flex-direction: column;">
    <button id="fullscreen">
        <span>Fullscreen</span>
    </button>
    <div class="canvas-wrapper">
        <canvas id="canvas" width="200" height="100" class="{isFullscreen? "fullscreen" : ""}"></canvas>
    </div>
</Page>

<style>
    canvas {
        display: block;

        max-width: 60rem;
        width: 100%;
        /* Hack: I calculated this. Don't ask me how. */
        height: calc(100vh - 14.5rem);

        background-color: var(--secondary-color);
        border: 1px solid var(--border-color);
        border-radius: 4px;
    }

    canvas.fullscreen {
        width: 100%;
        max-width: 100%;
        height: 100%;
    }

    @media screen and (max-width: 800px) {
        canvas {
            height: calc(100vh - 13.5rem);
        }
    }

    .canvas-wrapper {
        display: block;

        flex: 1;
    }

    button#fullscreen {
        position: absolute;
        top: 4.5rem;
        right: 1rem;
    }
</style>