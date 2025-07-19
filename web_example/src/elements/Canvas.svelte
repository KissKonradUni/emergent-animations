<script lang="ts">
    import { onMount } from "svelte";
    import { CanvasWrapper } from "../rendering/CanvasWrapper";

    let canvasElement   : HTMLCanvasElement;
    let wrapperElement  : HTMLElement;
    let fullscreenButton: HTMLButtonElement;

    let wrapper: CanvasWrapper;
    let isFullscreen = $state(false);

    onMount(() => {
        wrapper = new CanvasWrapper(
            canvasElement,
            wrapperElement
        );

        fullscreenButton.addEventListener("click", () => {
            if (document.fullscreenElement) {
                document.exitFullscreen().catch((error) => {
                    console.error("Failed to exit fullscreen mode:", error);
                });
                isFullscreen = false;
                return;
            }
            
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

<div class="canvas-wrapper" bind:this={wrapperElement}>
    <button class="fullscreen" bind:this={fullscreenButton}>
        <span>Fullscreen</span>
    </button>
    <canvas width="200" height="100" class="canvas {isFullscreen? "fullscreen" : ""}" bind:this={canvasElement}></canvas>
</div>

<style>
    canvas {
        display: block;

        width: 100%;
        /* Hack: I calculated this. Don't ask me how. */
        height: calc(100vh - 16.5rem);

        background-color: var(--secondary-color);
    }

    canvas.fullscreen {
        width: 100%;
        max-width: 100%;
        height: 100%;
    }

    @media screen and (max-width: 800px) {
        canvas {
            height: calc(100vh - 15.5rem);
        }
    }

    .canvas-wrapper {
        position: relative;
        display: block;

        flex: 1;
    }

    button.fullscreen {
        position: absolute;
        top: 0.5rem;
        right: 0.5rem;
    }
</style>