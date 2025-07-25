import { Time } from "./Time.ts";

export abstract class SequenceObject {
    protected time: Readonly<Time>;

    constructor(time: Readonly<Time>) { 
        this.time = time;
    }
    public abstract start(): void;
    public abstract tick (): boolean;
}

export class Sequence {
    public static* run(object: SequenceObject): Generator<void> {
        object.start();
        while (!object.tick()) {
            yield;
        }
        return;
    }

    public static* runTogether(runners: Array<SequenceObject>) {
        runners.forEach((runner) => runner.start());
        let finished: boolean[];
        do {
            finished = runners.map((runner) => runner.tick());
            yield;
        } while (finished.some(done => !done));
    }
}

export class Timer extends SequenceObject {
    private startTime: number = 0;
    private endTime: number = 0;
    private duration: number = 0;

    private finished: boolean = true;

    constructor(time: Readonly<Time>, duration: number) {
        super(time);
        this.duration = duration;
    }

    public override start(): void {
        this.startTime = this.time.now;
        this.endTime = this.startTime + this.duration;
        this.finished = false;
    }

    public override tick(): boolean {
        if (this.finished) {
            return true;
        }

        const currentTime = this.time.now;

        if (currentTime >= this.endTime) {
            this.finished = true;
        }

        return this.finished;
    }
}

export type EasingFunction = (t: number) => number;

/**
 * Options for configuring the behavior of the interpolator.
 * @property startValue - The initial value at the start of the interpolation.
 * @property endValue - The final value at the end of the interpolation.
 * @property duration - The total time in seconds for the interpolation to complete.
 * @property easing - An optional easing function to modify the interpolation curve.
 */
interface InterpolatorOptions {
    startValue: number;
    endValue: number;
    duration: number;
    easing?: EasingFunction;
}

export class Interpolator extends SequenceObject {
    private setter: (value: number) => void;
    
    public options: InterpolatorOptions;

    private startTime: number = 0;
    private endTime: number = 0;

    private finished: boolean = true;
    
    /**
     * Creates an interpolator that can be used to animate a value over time.
     * @param time The time object that provides the current time and delta time.
     * @param setter The function used to set the value of the interpolated property.
     * @param options Additional parameters to configure the interpolator.
     */
    constructor(time: Readonly<Time>, setter: (value: number) => void, options: InterpolatorOptions) {
        super(time);
        this.setter = setter;
        this.options = options;
        this.options.easing = options.easing ?? ((t) => t);
    }

    public override start(): void {
        this.startTime = this.time.now;
        this.endTime = this.startTime + this.options.duration;
        this.finished = false;
        this.setter(this.options.startValue); // Set initial value
    }

    public override tick(): boolean {
        if (this.finished) {
            return true;
        }

        const currentTime = this.time.now;
        const elapsed = currentTime - this.startTime;
        const t = Math.min(elapsed / this.options.duration, 1);
        const easedValue = this.options.easing!(t);
        const interpolatedValue = this.options.startValue + (this.options.endValue - this.options.startValue) * easedValue;

        this.setter(interpolatedValue);

        if (currentTime >= this.endTime) {
            this.finished = true;
            this.setter(this.options.endValue); 
        }

        return this.finished;
    }

    public get progress(): number {
        if (this.finished) {
            return 1;
        }
        const currentTime = this.time.now;
        const elapsed = currentTime - this.startTime;
        return Math.min(elapsed / this.options.duration, 1);
    }

    public reverse(): void {
        const temp = this.options.startValue;
        
        this.options.startValue = this.options.endValue;
        this.options.endValue = temp;
    }
}

/**
 * ❤️ https://easings.net/#
 */
export class Easings {
    public static linear(t: number): number {
        return t;
    }

    public static easeInQuad(t: number): number {
        return t * t;
    }

    public static easeOutQuad(t: number): number {
        return t * (2 - t);
    }

    public static easeInOutQuad(t: number): number {
        if (t < 0.5) {
            return 2 * t * t;
        } else {
            return -1 + (4 - 2 * t) * t;
        }
    }

    public static easeInOutElastic(t: number): number {
        const c5 = (2 * Math.PI) / 4.5;

        return t === 0
            ? 0
            : t === 1
            ? 1
            : t < 0.5
            ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * c5)) / 2
            : (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * c5)) / 2 + 1;
    }
}