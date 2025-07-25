import { Vector2f } from "../CanvasMath.ts";
import { CanvasObject } from "../CanvasObject.ts";
import { CanvasScene } from "../CanvasScene.ts";
import { CanvasWrapper } from "../CanvasWrapper.ts";
import { Time } from "../Time.ts";

export class SimpleFunctional extends CanvasScene {
    objects: {
        xPlot: CanvasObject;
        yPlot: CanvasObject;

        pathCircle: CanvasObject;
        circle: CanvasObject;
    };
    
    constructor(wrapper: CanvasWrapper, context: CanvasRenderingContext2D, time: Readonly<Time>) {
        super(wrapper, context, time);

        this.objects = {
            xPlot: new CanvasObject(
                CanvasObject.plotFunction(
                    "f(x) = cos(x + t)",
                    (x) => Math.cos(x + time.now),
                    { lower: -1, upper: 6 },
                    { lower: -2, upper: 2 },
                    0.1,
                ),
                new Vector2f(950, 240),
                new Vector2f(300, 200),
                new Vector2f(1, 1),
                new Vector2f(0.5, 0.5),
                0,
            ),
            yPlot: new CanvasObject(
                CanvasObject.plotFunction(
                    "f(y) = sin(y + t)",
                    (x) => Math.sin(x + time.now),
                    { lower: -1, upper: 6 },
                    { lower: -2, upper: 2 },
                    0.1,
                ),
                new Vector2f(950, 480),
                new Vector2f(300, 200),
                new Vector2f(1, 1),
                new Vector2f(0.5, 0.5),
                0,
            ),
            pathCircle: new CanvasObject(
                CanvasObject.ellipse(
                    "transparent",
                    "#000",
                ),
                new Vector2f(350, 360),
                new Vector2f(400, 400),
                new Vector2f(1, 1),
                new Vector2f(0.5, 0.5),
                0,
            ),
            circle: new CanvasObject(
                CanvasObject.ellipse(
                    "#ff5722",
                    "#ff8a50",
                ),
                new Vector2f(350, 360),
                new Vector2f(50, 50),
                new Vector2f(1, 1),
                new Vector2f(0.5, 0.5),
                0,
            ),
        }
    }

    override render(): void {
        this.objects.xPlot.render(this.context);
        this.objects.yPlot.render(this.context);

        this.objects.pathCircle.render(this.context);
        
        this.objects.circle.position = new Vector2f(
            350 + 200 * Math.cos(this.time.now),
            360 + 200 * Math.sin(this.time.now)
        );
        this.objects.circle.render(this.context);
    }
}