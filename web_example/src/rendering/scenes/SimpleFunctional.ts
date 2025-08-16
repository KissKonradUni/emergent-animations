import { Vector2f } from "../CanvasMath.ts";
import { CanvasObject, Objects } from "../CanvasObject.ts";
import { CanvasScene } from "../CanvasScene.ts";
import { CanvasWrapper } from "../CanvasWrapper.ts";
import { Time } from "../Time.ts";

export class SimpleFunctional extends CanvasScene {
    override objects: {
        xPlot: CanvasObject;
        yPlot: CanvasObject;

        pathCircle: CanvasObject;
        circle: CanvasObject;
    };
    
    constructor(wrapper: CanvasWrapper, context: CanvasRenderingContext2D, time: Readonly<Time>) {
        super(wrapper, context, time);

        this.objects = {
            xPlot: new CanvasObject(
                Objects.plotFunction(
                    "x(t) = cos(t)",
                    (x) => Math.cos(x + time.now),
                    { lower: -1, upper: 5 },
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
                Objects.plotFunction(
                    "y(t) = sin(t)",
                    (x) => Math.sin(x + time.now),
                    { lower: -1, upper: 5 },
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
                Objects.ellipse(
                    "transparent",
                    "#000",
                ),
                new Vector2f(350, 350),
                new Vector2f(400, 400),
                new Vector2f(1, 1),
                new Vector2f(0.5, 0.5),
                0,
            ),
            circle: new CanvasObject(
                Objects.ellipse(
                    "#ff5722",
                    "#ff8a50",
                ),
                new Vector2f(0, 0),
                new Vector2f(50, 50),
                new Vector2f(1, 1),
                new Vector2f(0.5, 0.5),
                0,
            )
        }
        this.objects.pathCircle.append(this.objects.circle);
    }

    params = { radius: 200, alpha: 0, omega: 1 };

    override render(): void {
        this.objects.circle.position = new Vector2f(
            this.params.radius * Math.cos(this.params.alpha + this.params.omega * this.time.now),
            this.params.radius * Math.sin(this.params.alpha + this.params.omega * this.time.now)
        );

        this.context.lineWidth = 2;
        this.renderInOrder(
            this.objects.pathCircle,
            this.objects.xPlot,
            this.objects.yPlot,
            this.objects.circle
        );
    }
}