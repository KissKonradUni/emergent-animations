import { CanvasScene } from "../CanvasScene.ts";
import { CanvasWrapper } from '../CanvasWrapper.ts';
import { Time } from "../Time.ts";

export class ExampleScene extends CanvasScene {
    override textures;
    override objects;
    override sequencers;
    
    constructor(wrapper: CanvasWrapper, context: CanvasRenderingContext2D, time: Readonly<Time>) {
        super(wrapper, context, time);

        this.textures   = {};
        this.objects    = {};
        this.sequencers = {};
    }

    override* sequence(): Generator<void> {
        yield* [];
    }

    override render(): void {
        return;
    }
}