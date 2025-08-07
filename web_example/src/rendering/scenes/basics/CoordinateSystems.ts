import { Vector2f } from "../../CanvasMath.ts";
import { CanvasObject, Objects } from "../../CanvasObject.ts";
import { CanvasScene } from "../../CanvasScene.ts";
import { CanvasWrapper } from '../../CanvasWrapper.ts';
import { Animator, Easings, Interpolator, Timer } from "../../Sequences.ts";
import { Time } from "../../Time.ts";

export class CoordinateSystems extends CanvasScene {
    override objects: {
        screenSpace: CanvasObject;
        ball: CanvasObject;
        hat: CanvasObject;
        localSpace: CanvasObject;
    };

    override sequencers: {
        timer: Timer;
        interpolator: Interpolator;
    }
    
    constructor(wrapper: CanvasWrapper, context: CanvasRenderingContext2D, time: Readonly<Time>) {
        super(wrapper, context, time);

        this.objects = {
            screenSpace: new CanvasObject(
                Objects.axes(new Vector2f(0, 1280), new Vector2f(0, 720), 80, false),
                new Vector2f(40, 40),
                new Vector2f(1200, 640),
                new Vector2f(1, 1),
                new Vector2f(0, 0),
            ),

            ball: new CanvasObject(
                Objects.ellipse("#888", "#000"),
                new Vector2f(340, 290),
                new Vector2f(50, 50)
            ),
            hat: new CanvasObject(
                Objects.rectangle("#f00", "#000"),
                new Vector2f(0, -30),
                new Vector2f(25, 25)
            ),
            localSpace: new CanvasObject(
                Objects.axes(new Vector2f(-100, 100), new Vector2f(-100, 100), 20, false),
                new Vector2f(0, 0),
                new Vector2f(200, 200)
            ),
        };

        this.objects.ball.append(this.objects.hat);
        this.objects.ball.append(this.objects.localSpace);

        this.sequencers = {
            timer: new Timer(time, 1),
            interpolator: new Interpolator(
                time,
                (t: number) => this.objects.ball.position.x = t,
                {
                    startValue: 320,
                    endValue: 960,
                    duration: 0.5,
                    easing: Easings.easeInOutCubic
                }
            )
        }
    }

    public override* sequence(): Generator<void> {
        while (true) {
            yield* Animator.run(this.sequencers.interpolator);

            this.sequencers.interpolator.reverse();

            yield* Animator.run(this.sequencers.timer);
        }
    }

    override render(): void {
        this.objects.screenSpace.render(this.context);
        this.objects.ball.render(this.context);
        
        this.context.fillStyle = '#fff';
        this.context.font = '20px Arial';
        this.context.textAlign = 'center';
        this.context.textBaseline = 'top';
        this.context.fillText(
            `Ball Position: (${this.objects.ball.position.x.toFixed(2)}, ${this.objects.ball.position.y.toFixed(2)})`,
            this.wrapper.resolution.x / 2, this.wrapper.resolution.y - 30
        );
    }
}