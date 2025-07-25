import { Vector2f } from "../CanvasMath.ts";
import { CanvasObject } from "../CanvasObject.ts";
import { CanvasScene } from "../CanvasScene.ts";
import { CanvasWrapper } from "../CanvasWrapper.ts";
import { Time } from "../Time.ts";
import { Easings, Interpolator, Sequence, Timer } from "../Sequences.ts";

export class SimpleInterpolation extends CanvasScene {
    objects: {
        ballA: CanvasObject;
        ballB: CanvasObject;
        ballC: CanvasObject;

        easingPlotA: CanvasObject;
        easingPlotB: CanvasObject;
        easingPlotC: CanvasObject;
    }

    sequencers: {
        ballAInterpolator: Interpolator;
        ballBInterpolator: Interpolator;
        ballCInterpolator: Interpolator;

        timer: Timer;
    }

    dotPositions: {
        ballA: number;
        ballB: number;
        ballC: number;
    } = {
        ballA: 0,
        ballB: 0,
        ballC: 0,
    }
    
    constructor(wrapper: CanvasWrapper, context: CanvasRenderingContext2D, time: Readonly<Time>) {
        super(wrapper, context, time);

        this.objects = {
            ballA: new CanvasObject(
                CanvasObject.ellipse("#ff5722", "#ff0000"),
                new Vector2f(340, 360),
                new Vector2f(50, 50),
                new Vector2f(1, 1),
                new Vector2f(0.5, 0.5),
                0,
            ),
            ballB: new CanvasObject(
                CanvasObject.ellipse("#57ff22", "#00ff22"),
                new Vector2f(640, 360),
                new Vector2f(50, 50),
                new Vector2f(1, 1),
                new Vector2f(0.5, 0.5),
                0,
            ),
            ballC: new CanvasObject(
                CanvasObject.ellipse("#2257ff", "#2200ff"),
                new Vector2f(940, 360),
                new Vector2f(50, 50),
                new Vector2f(1, 1),
                new Vector2f(0.5, 0.5),
                0,
            ),

            easingPlotA: new CanvasObject(
                CanvasObject.plotFunction(
                    "easeInQuad: t ^ 2",
                    Easings.easeInQuad,
                    { lower: 0, upper: 1 },
                    { lower: 0, upper: 1 },
                    0.01,
                    () => this.dotPositions.ballA,
                ),
                new Vector2f(340, 150),
                new Vector2f(200, 200),
                new Vector2f(1, 1),
                new Vector2f(0.5, 0.5),
                0,
            ),
            easingPlotB: new CanvasObject(
                CanvasObject.plotFunction(
                    "easeOutQuad: t * (2 - t)",
                    Easings.easeOutQuad,
                    { lower: 0, upper: 1 },
                    { lower: 0, upper: 1 },
                    0.01,
                    () => this.dotPositions.ballB,
                ),
                new Vector2f(640, 150),
                new Vector2f(200, 200),
                new Vector2f(1, 1),
                new Vector2f(0.5, 0.5),
                0,
            ),
            easingPlotC: new CanvasObject(
                CanvasObject.plotFunction(
                    "easeInOutElastic: <...>",
                    Easings.easeInOutElastic,
                    { lower: 0, upper: 1 },
                    { lower: 0, upper: 1 },
                    0.01,
                    () => this.dotPositions.ballC,
                ),
                new Vector2f(940, 150),
                new Vector2f(200, 200),
                new Vector2f(1, 1),
                new Vector2f(0.5, 0.5),
                0,
            ),
        };

        this.sequencers = {
            ballAInterpolator: new Interpolator(
                time,
                (t: number) => { this.objects.ballA.position.y = t },
                {
                    startValue: 360,
                    endValue: 600,
                    duration: 1,
                    easing: (t) => t * t,
                }
            ),
            ballBInterpolator: new Interpolator(
                time,
                (t: number) => { this.objects.ballB.position.y = t },
                {
                    startValue: 360,
                    endValue: 600,
                    duration: 1,
                    easing: (t) => 1 - Math.pow(1 - t, 2),
                }
            ),
            ballCInterpolator: new Interpolator(
                time,
                (t: number) => { this.objects.ballC.position.y = t },
                {
                    startValue: 360,
                    endValue: 600,
                    duration: 1,
                    easing: Easings.easeInOutElastic,
                }
            ),
            timer: new Timer(time, 0.5),
        }
    }

    public override* sequence(): Generator<void> {
        while (true) {
            yield* Sequence.runTogether([
                this.sequencers.ballAInterpolator,
                this.sequencers.ballBInterpolator,
                this.sequencers.ballCInterpolator,
            ]);

            yield* Sequence.run(this.sequencers.timer);

            this.sequencers.ballAInterpolator.reverse();
            this.sequencers.ballBInterpolator.reverse();
            this.sequencers.ballCInterpolator.reverse();
        }
    }

    public override render(): void {
        // Draw tracks for the balls
        this.context.strokeStyle = '#222';
        this.context.lineWidth = 16;
        this.context.lineCap = 'round';
        this.context.beginPath();
        this.context.moveTo(340, 360);
        this.context.lineTo(340, 600);
        this.context.moveTo(640, 360);
        this.context.lineTo(640, 600);
        this.context.moveTo(940, 360);
        this.context.lineTo(940, 600);
        this.context.stroke();

        this.context.lineWidth = 1;

        this.dotPositions.ballA = this.sequencers.ballAInterpolator.progress;
        this.dotPositions.ballB = this.sequencers.ballBInterpolator.progress;
        this.dotPositions.ballC = this.sequencers.ballCInterpolator.progress;

        Object.keys(this.objects).forEach((key) => {
            this.objects[key as keyof typeof this.objects].render(this.context);
        });
    }
}