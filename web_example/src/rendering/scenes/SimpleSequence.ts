import { Vector2f } from "../CanvasMath.ts";
import { CanvasObject, Objects } from "../CanvasObject.ts";
import { CanvasScene } from "../CanvasScene.ts";
import { CanvasWrapper } from "../CanvasWrapper.ts";
import { Animator, Easings, InterpolationSequence } from "../Sequences.ts";
import { Time } from "../Time.ts";

export class SimpleSequence extends CanvasScene {
    override objects: {
        cicle: CanvasObject;
        path: CanvasObject;
    }

    override sequencers: {
        sequenceX: InterpolationSequence;
        sequenceY: InterpolationSequence;
    }
    
    constructor(wrapper: CanvasWrapper, context: CanvasRenderingContext2D, time: Readonly<Time>) {
        super(wrapper, context, time);

        this.objects = {
            cicle: new CanvasObject(
                Objects.ellipse("#ff5722", "#ff0000"),
                new Vector2f(340, 360),
                new Vector2f(50, 50),
                new Vector2f(1, 1),
                new Vector2f(0.5, 0.5),
                0,
            ),
            path: new CanvasObject(
                Objects.roundedRectangle("#00000000", "#ffffff", 8),
                new Vector2f(640, 360),
                new Vector2f(400, 400),
            ),
        };

        this.sequencers = {
            sequenceX: new InterpolationSequence(
                this.time,
                (value) => this.objects.cicle.position.x = value,
                [440, 840, 840, 440],
                {
                    duration: 0.5,
                    easing: Easings.easeInOutQuad,
                }
            ),
            sequenceY: new InterpolationSequence(
                this.time,
                (value) => this.objects.cicle.position.y = value,
                [160, 160, 560, 560],
                {
                    duration: 0.5,
                    easing: Easings.easeInOutQuad,
                }
            )
        };
    }

    public override render(): void {
        this.renderInOrder(
            this.objects.path,
            this.objects.cicle,
        );
    }

    public override* sequence(): Generator<void> {
        while (true) {
            yield* Animator.runTogether([
                this.sequencers.sequenceX,
                this.sequencers.sequenceY,
            ]);
        }
    }
}