import { CanvasSpritesheet } from "../CanvasImageTexture.ts";
import { Vector2f } from "../CanvasMath.ts";
import { CanvasObject, Objects } from "../CanvasObject.ts";
import { CanvasScene } from "../CanvasScene.ts";
import { CanvasWrapper } from '../CanvasWrapper.ts';
import { ProgressBar } from "../ComplexObjects.ts";
import { Time } from "../Time.ts";

export class SimpleFrameAnimation extends CanvasScene {
    override textures = {
        cat: new CanvasSpritesheet('/cat-spritesheet.webp', 12, 14, 158),
    };
    override objects: {
        cat: CanvasObject;
        progressBar: ProgressBar;
    };
    
    constructor(wrapper: CanvasWrapper, context: CanvasRenderingContext2D, time: Readonly<Time>) {
        super(wrapper, context, time);

        this.objects = {
            cat: new CanvasObject(
                Objects.sprite(this.textures.cat, () => Math.floor(time.now * 24)),
                new Vector2f(1280 / 2, 720 / 2),
                new Vector2f(256, 256),
            ),

            progressBar: new ProgressBar(
                new Vector2f((1280 - 1024) / 2, 720 - 128),
                new Vector2f(1024, 32),
                () => `Frame: ${Math.floor(time.now * 24) % 158} / 158`
            )
        }
    }

    override render(): void {
        // The progress bar is calculated on this basis:
        // - The cat animation has 158 frames.
        // - The current frame is determined by the time elapsed, multiplied by 24 to achieve 24 frames per second.
        // - The progress bar foreground is scaled based on the current frame divided by the total frames.
        // - The modulo operation ensures that the progress bar loops correctly.
        this.objects.progressBar.setProgress((Math.round(this.time.now * 24) / 158) % 1);

        // Render the cat object and the progress bar in order
        this.renderInOrder(
            this.objects.cat,
            this.objects.progressBar
        );
    }
}