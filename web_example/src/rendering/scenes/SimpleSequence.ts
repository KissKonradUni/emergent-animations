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
        sequenceAX: InterpolationSequence;
        sequenceAY: InterpolationSequence;
        sequenceBX: InterpolationSequence;
        sequenceBY: InterpolationSequence;
    }

    rectPath = [
        new Vector2f(160, 160),
        new Vector2f(560, 160),
        new Vector2f(560, 560),
        new Vector2f(160, 560),
    ];

    polyPath = [
        new Vector2f(720 , 260),
        new Vector2f(920 , 160),
        new Vector2f(1120, 260),
        new Vector2f(720 , 460),
        new Vector2f(920 , 560),
        new Vector2f(1120, 460),
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
            sequenceAX: new InterpolationSequence(
                this.time,
                (value) => this.objects.circleA.position.x = value,
                this.rectPath.map(p => p.x),
                {
                    duration: 0.75,
                    easing: Easings.linear,
                    loops: true
                }
            ),
            sequenceAY: new InterpolationSequence(
                this.time,
                (value) => this.objects.circleA.position.y = value,
                this.rectPath.map(p => p.y),
                {
                    duration: 0.75,
                    easing: Easings.linear,
                    loops: true
                }
            ),
            sequenceBX: new InterpolationSequence(
                this.time,
                (value) => this.objects.circleB.position.x = value,
                this.polyPath.map(p => p.x),
                {
                    duration: 0.5,
                    easing: Easings.easeInOutCubic,
                    loops: true
                }
            ),
            sequenceBY: new InterpolationSequence(
                this.time,
                (value) => this.objects.circleB.position.y = value,
                this.polyPath.map(p => p.y),
                {
                    duration: 0.5,
                    easing: Easings.easeInOutCubic,
                    loops: true
                }
            ),
        };
    }

    public override render(): void {
        // Render a custom polygon path
        this.context.beginPath();
        this.context.moveTo(this.polyPath[0].x, this.polyPath[0].y);
        for (let i = 1; i < this.polyPath.length; i++) {
            this.context.lineTo(this.polyPath[i].x, this.polyPath[i].y);
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
        while (true) {
            yield* Animator.runTogether([
                this.sequencers.sequenceAX,
                this.sequencers.sequenceAY,
                this.sequencers.sequenceBX,
                this.sequencers.sequenceBY,
            ]);
        }
    }
}