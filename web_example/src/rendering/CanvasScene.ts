import { CanvasWrapper, Time } from "./CanvasWrapper.ts";

/**
 * Base class for a scene.
 * 
 * Extend this class to create a custom scene.
 */
export class CanvasScene {
    wrapper : CanvasWrapper;
    context : CanvasRenderingContext2D;
    time    : Readonly<Time>;

    /**
     * @param wrapper The canvas wrapper that contains the canvas and its context.
     * @param context The rendering context of the canvas.
     * @param time The time object that provides the current time and delta time.
     */
    constructor(wrapper: CanvasWrapper, context: CanvasRenderingContext2D, time: Readonly<Time>) {
        this.wrapper = wrapper;
        this.context = context;
        this.time    = time;
    }

    /**
     * Renders the scene.
     * Everything necessary can be accessed through `this`.
     */
    render(): void {};

    /**
     * @returns The constructor of the scene.
     */
    static provide(): SceneProvider {
        return (wrapper: CanvasWrapper, context: CanvasRenderingContext2D, time: Readonly<Time>): CanvasScene | null => {
            return new this(wrapper, context, time);
        };
    }
}

/**
 * Technically a way to pass the constructor of a type
 */
export type SceneProvider = (wrapper: CanvasWrapper, context: CanvasRenderingContext2D, time: Readonly<Time>) => CanvasScene | null;