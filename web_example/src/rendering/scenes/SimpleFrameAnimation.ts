import { CanvasSpritesheet } from "../CanvasImageTexture.ts";
import { Vector2f } from "../CanvasMath.ts";
import { CanvasObject } from "../CanvasObject.ts";
import { CanvasScene } from "../CanvasScene.ts";
import { CanvasWrapper } from '../CanvasWrapper.ts';
import { Time } from "../Time.ts";

export class ProgressBar {
    private background: CanvasObject;
    private foreground: CanvasObject;
    private text: CanvasObject;

    constructor(
        position: Vector2f,
        size: Vector2f,
        textProvider: () => string
    ) {
        this.background = new CanvasObject(
            CanvasObject.roundedRectangle("rgba(0, 0, 0, 0.5)", "black", 8),
            position,
            size.clone(),
            new Vector2f(1.0, 1.0),
            new Vector2f(0.0, 0.0)
        );
        this.foreground = new CanvasObject(
            CanvasObject.roundedRectangle("rgba(0, 255, 0, 0.5)", "green", 8),
            new Vector2f(0, 0),
            size.clone(),
            new Vector2f(1.0, 1.0),
            new Vector2f(0.0, 0.0)
        );
        this.text = new CanvasObject(
            CanvasObject.dynamicText(textProvider, "24px Consolas, monospace", "white", "left", "middle"),
            new Vector2f(0, -12),
        );

        this.background.children.push(this.foreground, this.text);
    }

    public render(context: CanvasRenderingContext2D): void {
        this.background.render(context);
    }

    public setProgress(progress: number): void {
        this.foreground.size.x = this.background.size.x * progress;
    }
}

export class SimpleFrameAnimation extends CanvasScene {
    textures = {
        cat: new CanvasSpritesheet('/cat-spritesheet.webp', 12, 14, 158),
    };
    objects: {
        cat: CanvasObject;
        progressBar: ProgressBar;
    };
    
    constructor(wrapper: CanvasWrapper, context: CanvasRenderingContext2D, time: Readonly<Time>) {
        super(wrapper, context, time);

        this.objects = {
            cat: new CanvasObject(
                CanvasObject.sprite(this.textures.cat as CanvasSpritesheet, () => Math.floor(time.now * 24)),
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
        // Render the gif, simple.
        this.objects.cat.render(this.context);

        // The progress bar is calculated on this basis:
        // - The cat animation has 158 frames.
        // - The current frame is determined by the time elapsed, multiplied by 24 to achieve 24 frames per second.
        // - The progress bar foreground is scaled based on the current frame divided by the total frames.
        // - The modulo operation ensures that the progress bar loops correctly.
        this.objects.progressBar.setProgress((Math.round(this.time.now * 24) / 158) % 1);

        // Only the background needs to be rendered, as the foreground and text are children of the background object.
        this.objects.progressBar.render(this.context);
    }
}