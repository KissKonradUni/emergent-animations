import { CanvasImageTexture } from "./CanvasImageTexture.ts";
import { CanvasObject, Renderable } from "./CanvasObject.ts";
import { CanvasWrapper } from "./CanvasWrapper.ts";
import { SequenceObject } from "./Sequences.ts";
import { Time } from "./Time.ts";

type CanvasObjectMap = {
    [key: string]: CanvasObject | Renderable | CanvasObjectMap;
};

type CanvasSequencerMap = {
    [key: string]: SequenceObject | CanvasSequencerMap;
};

export type CanvasImageTextureMap = {
    [key: string]: CanvasImageTexture | CanvasImageTextureMap;
};

/**
 * Base class for a scene.
 * 
 * Extend this class to create a custom scene.
 */
export class CanvasScene {
    wrapper : CanvasWrapper;
    context : CanvasRenderingContext2D;
    time    : Readonly<Time>;

    objects    : CanvasObjectMap;
    sequencers?: CanvasSequencerMap;
    textures?  : CanvasImageTextureMap;

    /**
     * @param wrapper The canvas wrapper that contains the canvas and its context.
     * @param context The rendering context of the canvas.
     * @param time The time object that provides the current time and delta time.
     */
    constructor(wrapper: CanvasWrapper, context: CanvasRenderingContext2D, time: Readonly<Time>) {
        this.wrapper = wrapper;
        this.context = context;
        this.time    = time;
        this.objects = {};
    }

    /**
     * Renders the scene.
     * Everything necessary can be accessed through `this`.
     */
    public render(): void {};

    /**
     * @param objects The objects to render in the order they are provided.
     */
    public renderInOrder(...objects: Renderable[]): void {
        for (const object of objects) {
            object.render(this.context);
        }
    }

    /**
     * An optional function that can be used to define a sequence of actions.
     */
    public* sequence(): Generator<void> {};

    /**
     * @returns The constructor of the scene.
     */
    static provide(): SceneProvider {
        return (wrapper: CanvasWrapper, context: CanvasRenderingContext2D, time: Readonly<Time>): CanvasScene | null => {
            return new this(wrapper, context, time);
        };
    }

    getFileInfo(): string {
        return "unknown";
    }
}

/**
 * Technically a way to pass the constructor of a type
 */
export type SceneProvider = (wrapper: CanvasWrapper, context: CanvasRenderingContext2D, time: Readonly<Time>) => CanvasScene | null;