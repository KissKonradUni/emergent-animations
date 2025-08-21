// Lets animate a sign falling down from outside the screen that's suspended by a rope.
// Only use interpolation sequences to animate the sign and the rope.

import { CanvasImageTexture } from "../CanvasImageTexture.ts";
import { Vector2f } from "../CanvasMath.ts";
import { CanvasObject, Objects } from "../CanvasObject.ts";
import { CanvasScene } from "../CanvasScene.ts";
import { CanvasWrapper } from "../CanvasWrapper.ts";
import { Animator, Easings, InterpolationSequence, Interpolator, Timer } from "../Sequences.ts";
import { Time } from "../Time.ts";

export class ComplexSequence extends CanvasScene {
    override textures: {
        wood: CanvasImageTexture;
    }
    
    override objects: {
        sign: CanvasObject;
        text: CanvasObject;
        ropeLeft: CanvasObject;
        ropeRight: CanvasObject;
        pivot: CanvasObject;
        nail: CanvasObject;
    }

    override sequencers: {
        timer: Timer;
        signRotation: InterpolationSequence;
        pivotY: Interpolator;
        pivotRotationStart: InterpolationSequence;
        pivotRotationLoop: Interpolator;
    }

    constructor(wrapper: CanvasWrapper, context: CanvasRenderingContext2D, time: Readonly<Time>) {
        super(wrapper, context, time);

        this.textures = {
            wood: new CanvasImageTexture('/wood.webp'),
        };

        this.objects = {
            sign: new CanvasObject(
                Objects.image(this.textures.wood),
                new Vector2f(0, 200),
                new Vector2f(400, 300),
                new Vector2f(1, 1),
                new Vector2f(0.5, 0.0),
            ),
            text: new CanvasObject(
                Objects.staticText(
                    [
                        "This whole animation is done",
                        "with the following objects:",
                        "",
                        "2 simple sequences.",
                        "A looping interpolator."
                    ]
                    .join('\n'),
                    "20px Arial",
                    "#ffffff",
                    "center",
                    "top", true
                ),
                new Vector2f(0, 100),
            ),
            ropeLeft: new CanvasObject(
                Objects.roundedRectangle("#000", null, 5),
                new Vector2f(0, 0),
                new Vector2f(10, 300),
                new Vector2f(1, 1),
                new Vector2f(0.5, 0.01),
                Math.PI / 5,
            ),
            ropeRight: new CanvasObject(
                Objects.roundedRectangle("#000", null, 5),
                new Vector2f(0, 0),
                new Vector2f(10, 300),
                new Vector2f(1, 1),
                new Vector2f(0.5, 0.01),
                -Math.PI / 5,
            ),
            pivot: new CanvasObject(
                () => {},
                new Vector2f(640, -1000),
                new Vector2f(1, 1),
            ),
            nail: new CanvasObject(
                Objects.roundedRectangle("#888", "#000", 4),
                new Vector2f(0, 8),
                new Vector2f(16, 16),
                new Vector2f(1, 1),
                new Vector2f(0.5, 0.5),
                0.2,
            ),   
        };

        this.objects.pivot.append(this.objects.ropeLeft, this.objects.ropeRight, this.objects.sign, this.objects.nail);
        this.objects.sign.append(this.objects.text);

        this.sequencers = {
            timer: new Timer(
                this.time,
                0.5
            ),
            signRotation: new InterpolationSequence<number>(
                this.time,
                (value) => this.objects.sign.rotation = value,
                {
                    keyframes: [
                        {value:  0.00, duration: 0.25},
                        {value: -0.05, duration: 0.25},
                        {value:  0.05, duration: 0.25},
                        {value:  0.00, duration: 0.25},
                    ],
                    easing: Easings.easeInOutQuad
                }
            ),
            pivotY: new Interpolator(
                this.time,
                (value) => this.objects.pivot.position.y = value,
                {
                    startValue: -600,
                    endValue: 100,
                    duration: 1.0,
                    easing: Easings.easeOutElastic,
                }
            ),
            pivotRotationStart: new InterpolationSequence<number>(
                this.time,
                (value) => {
                    this.objects.pivot.rotation = value;
                    this.objects.nail.rotation = -value + 0.2;
                },
                {
                    keyframes: [
                        {value:  Math.PI / 5 , duration: 0.66},
                        {value: -Math.PI / 5 , duration: 0.66},
                        {value:  Math.PI / 10, duration: 0.66},
                    ],
                    easing: Easings.easeInOutQuad
                }
            ),
            pivotRotationLoop: new Interpolator(
                this.time,
                (value) => {
                    this.objects.pivot.rotation = value
                    this.objects.nail.rotation = -value + 0.2;
                },
                {
                    startValue: Math.PI / 10,
                    endValue: -Math.PI / 10,
                    duration: 0.6666,
                    easing: Easings.easeInOutQuad,
                }
            ),
        }
    }

    public override* sequence(): Generator<void> {
        yield* Animator.run(this.sequencers.timer);
        
        yield* Animator.runTogether([
            this.sequencers.signRotation,
            this.sequencers.pivotY,
            this.sequencers.pivotRotationStart
        ]);

        while (true) {
            yield* Animator.run(this.sequencers.pivotRotationLoop);
            
            this.sequencers.pivotRotationLoop.reverse();
            this.sequencers.pivotRotationLoop.options.endValue *= 0.5;

            if (Math.abs(this.sequencers.pivotRotationLoop.options.endValue) < 0.001) {
                this.objects.pivot.rotation = 0;
                break;
            }
        }
    }

    public override render(): void {
        this.objects.pivot.render(this.context);
    }
}