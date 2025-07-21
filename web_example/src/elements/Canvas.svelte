<script lang="ts">
    import { onMount } from "svelte";
    import { CanvasWrapper } from "../rendering/CanvasWrapper";
    import type { CanvasScene, SceneProvider } from "../rendering/CanvasScene.ts";
	import { CanvasObject } from "../rendering/CanvasObject";

    let props = $props();
    let sceneProvider: SceneProvider = props.scene || (() => null);

    let canvasElement   : HTMLCanvasElement;
    let wrapperElement  : HTMLElement;
    let fullscreenButton: HTMLButtonElement;

    let wrapper: CanvasWrapper;
    let isFullscreen = $state(false);

    onMount(() => {
        wrapper = new CanvasWrapper(
            canvasElement,
            wrapperElement,
            sceneProvider
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
        <span>⛶</span>
    </button>
    <button class="debugMode" onclick={() => CanvasObject.setDebugMode(!CanvasObject.debugMode)}>
        <span>🛠️</span>
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

    button {
        display: flex;
        align-items: center;
        justify-content: center;

        position: absolute;
        z-index: 10;

        width: 2rem;
        height: 2rem;

        background-color: var(--primary-color);
        color: var(--text-color);
        border: none;
        border-radius: 0.25rem;

        font-size: 1rem;

        cursor: pointer;

        transition: background-color 0.15s ease, scale 0.1s ease;
    }

    button:hover {
        background-color: var(--tertiary-color);
        scale: 1.05;
    }

    button:active {
        background-color: var(--secondary-color);
        scale: 0.95;
    }

    button:focus {
        outline: 2px solid var(--accent-color);
    }

    button.fullscreen {
        top: 0.5rem;
        right: 0.5rem;
    }

    button.debugMode {
        top: 3rem;
        right: 0.5rem;
    }
</style>