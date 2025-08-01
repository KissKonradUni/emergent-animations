import { Time } from "./Time.ts";

/**
 * Base class for sequence objects that can be run by the Animator.
 */
export abstract class SequenceObject {
    protected time: Readonly<Time>;

    constructor(time: Readonly<Time>) { 
        this.time = time;
    }

    /**
     * Starts the sequence. This method should be called before the first tick.
     */
    public abstract start(): void;

    /**
     * Advances the sequence by one tick. Returns true if the sequence is finished.
     * @returns {boolean} True if the sequence is finished, false otherwise.
     */
    public abstract tick (): boolean;
}

/**
 * Animator class that manages the execution of sequence objects.
 */
export class Animator {
    /**
     * Runs a single sequence object until it is finished.
     * @param object The sequence object to run.
     */
    public static* run(object: SequenceObject): Generator<void> {
        object.start();
        while (!object.tick()) {
            yield;
        }
        return;
    }

    /**
     * Runs multiple sequence objects together until all are finished.
     * @param runners An array of sequence objects to run together.
     */
    public static* runTogether(runners: Array<SequenceObject>): Generator<void> {
        runners.forEach((runner) => runner.start());
        let finished: boolean[];
        do {
            finished = runners.map((runner) => runner.tick());
            yield;
        } while (finished.some(done => !done));
    }
}

/**
 * Timer class that represents a waiting period.
 */
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

/**
 * Function that defines the behavior of easing in animations.
 * @param t - A normalized time value between 0 and 1.
 * @return A value between 0 and 1 that represents the eased progress of the animation.
 */
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

/**
 * Interpolator class that animates a value from a start value to an end value over a specified duration.
 */
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

    public static easeInCubic(t: number): number {
        return t * t * t;
    }

    public static easeOutCubic(t: number): number {
        return 1 - Math.pow(1 - t, 3);
    }

    public static easeInOutCubic(t: number): number {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    public static easeInElastic(t: number): number {
        const c4 = (2 * Math.PI) / 3;

        return t === 0
            ? 0
            : t === 1
            ? 1
            : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
    }

    public static easeOutElastic(t: number): number {
        const c4 = (2 * Math.PI) / 3;

        return t === 0
            ? 0
            : t === 1
            ? 1
            : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
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

interface SequenceOptions {
    duration: number;
    easing?: EasingFunction;
    loops?: boolean;
}

export class InterpolationSequence extends SequenceObject {
    public values: Array<number>;
    private currentIndex: number = 0;
    private interpolator: Interpolator;
    private endsOnStart: boolean;

    constructor(time: Readonly<Time>, setter: (value: number) => void, values: Array<number>, interpolatorOptions: SequenceOptions) {
        super(time);
        this.values = values;
        this.interpolator = new Interpolator(time, setter, {
            startValue: values[0],
            endValue: values[1],
            duration: interpolatorOptions.duration,
            easing: interpolatorOptions.easing,
        });
        this.endsOnStart = interpolatorOptions.loops ?? false;
    }

    public override start(): void {
        this.interpolator.start();
        this.currentIndex = 0;
        this.interpolator.options.startValue = this.values[0];
        this.interpolator.options.endValue = this.values[1];
    }

    public override tick(): boolean {
        // If the current index is out of bounds, the sequence is finished
        if (this.currentIndex >= this.values.length - (this.endsOnStart ? 0 : 1)) {
            return true;
        }

        // If the interpolator is finished, move to the next value
        if (this.interpolator.tick()) {
            this.currentIndex++;

            // If there are more values to interpolate, set the next start and end values
            if (this.currentIndex < this.values.length) {
                this.interpolator.options.startValue = this.values[this.currentIndex];
                this.interpolator.options.endValue = this.values[(this.currentIndex + 1) % this.values.length];
                this.interpolator.start(); 
            }
        }

        // Sequence not finished yet
        return false; 
    }
}