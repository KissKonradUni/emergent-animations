import { Vector2f } from "./CanvasMath.ts";
import { CanvasObject, Objects, Renderable } from "./CanvasObject.ts";

export class ProgressBar implements Renderable {
    private background: CanvasObject;
    private foreground: CanvasObject;
    private text: CanvasObject;

    constructor(
        position: Vector2f,
        size: Vector2f,
        textProvider: () => string
    ) {
        this.background = new CanvasObject(
            Objects.roundedRectangle("rgba(0, 0, 0, 0.5)", "black", 8),
            position,
            size.clone(),
            new Vector2f(1.0, 1.0),
            new Vector2f(0.0, 0.0)
        );
        this.foreground = new CanvasObject(
            Objects.roundedRectangle("rgba(0, 255, 0, 0.5)", "green", 8),
            new Vector2f(0, 0),
            size.clone(),
            new Vector2f(1.0, 1.0),
            new Vector2f(0.0, 0.0)
        );
        this.text = new CanvasObject(
            Objects.dynamicText(textProvider, "24px Consolas, monospace", "white", "left", "middle"),
            new Vector2f(0, -12),
        );

        this.background.append(this.foreground, this.text);
    }

    public render(context: CanvasRenderingContext2D): void {
        this.background.render(context);
    }

    public setProgress(progress: number): void {
        this.foreground.size.x = this.background.size.x * progress;
    }
}