import { Vector2f } from "../CanvasMath.ts";
import { CanvasObject, Objects } from "../CanvasObject.ts";
import { CanvasScene } from "../CanvasScene.ts";
import { CanvasWrapper } from "../CanvasWrapper.ts";
import { Animator, Easings, InterpolationSequence } from "../Sequences.ts";
import { Time } from "../Time.ts";

export class SimpleSequence extends CanvasScene {
    override objects: {
        circleA: CanvasObject;
        circleB: CanvasObject;
        path: CanvasObject;
    }

    override sequencers: {
        sequenceA: InterpolationSequence<Vector2f>;
        sequenceB: InterpolationSequence<Vector2f>;
    }

    rectPath = [
        {value: new Vector2f(160, 160), duration: 0.25},
        {value: new Vector2f(560, 160), duration: 0.25},
        {value: new Vector2f(560, 560), duration: 0.25},
        {value: new Vector2f(160, 560), duration: 0.25},
    ];

    polyPath = [
        {value: new Vector2f(720 , 260), duration: 0.33},
        {value: new Vector2f(920 , 160), duration: 0.33},
        {value: new Vector2f(1120, 260), duration: 0.33},
        {value: new Vector2f(720 , 460), duration: 0.33},
        {value: new Vector2f(920 , 560), duration: 0.33},
        {value: new Vector2f(1120, 460), duration: 0.33},
    ]
    
    constructor(wrapper: CanvasWrapper, context: CanvasRenderingContext2D, time: Readonly<Time>) {
        super(wrapper, context, time);

        this.objects = {
            circleA: new CanvasObject(
                Objects.ellipse("#ff5722", "#ff0000"),
                new Vector2f(340, 360),
                new Vector2f(50, 50),
                new Vector2f(1, 1),
                new Vector2f(0.5, 0.5),
                0,
            ),
            circleB: new CanvasObject(
                Objects.ellipse("#ff5722", "#ff0000"),
                new Vector2f(720, 360),
                new Vector2f(50, 50),
                new Vector2f(1, 1),
                new Vector2f(0.5, 0.5),
                0,
            ),
            path: new CanvasObject(
                Objects.roundedRectangle("#00000000", "#000", 8),
                new Vector2f(360, 360),
                new Vector2f(400, 400),
            ),
        };

        this.sequencers = {
            sequenceA: new InterpolationSequence<Vector2f>(
                this.time,
                (value) => this.objects.circleA.position = value,
                {
                    keyframes: this.rectPath,
                    easing: Easings.linear,
                    loops: true
                }
            ),
            sequenceB: new InterpolationSequence<Vector2f>(
                this.time,
                (value) => this.objects.circleB.position = value,
                {
                    keyframes: this.polyPath,
                    easing: Easings.easeInOutCubic,
                    loops: true
                }
            ),
        };
    }

    public override render(): void {
        // Render a custom polygon path
        this.context.beginPath();
        this.context.moveTo(this.polyPath[0].value.x, this.polyPath[0].value.y);
        for (let i = 1; i < this.polyPath.length; i++) {
            this.context.lineTo(this.polyPath[i].value.x, this.polyPath[i].value.y);
        }
        this.context.closePath();

        this.context.strokeStyle = "#000";
        this.context.lineWidth = 2;
        this.context.stroke();
        
        this.renderInOrder(
            this.objects.path,
            this.objects.circleA,
            this.objects.circleB
        );
    }

    public override* sequence(): Generator<void> {
        yield* Animator.runParallel([
            this.sequenceA(),
            this.sequenceB()
        ]);
    }

    public* sequenceA(): Generator<void> {
        while (true)
            yield* Animator.run(this.sequencers.sequenceA);
    }

    public* sequenceB(): Generator<void> {
        while (true)
            yield* Animator.run(this.sequencers.sequenceB);
    }
}