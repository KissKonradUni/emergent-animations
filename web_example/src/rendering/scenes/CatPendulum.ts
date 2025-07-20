import { CanvasSpritesheet } from "../CanvasImageTexture.ts";
import { Vector2f } from "../CanvasMath.ts";
import { CanvasObject } from "../CanvasObject.ts";
import { CanvasScene } from "../CanvasScene.ts";
import { CanvasWrapper, Time } from '../CanvasWrapper.ts';

export class CatPendulum extends CanvasScene {
    textures = {
        cat1: new CanvasSpritesheet('/cat-spritesheet.webp', 12, 14, 158),
        cat2: new CanvasSpritesheet('/cat-alt-spritesheet.webp', 9, 8, 71),
        cat3: new CanvasSpritesheet('/cat-alt-02-spritesheet.webp', 9, 8, 68)
    };
    objects = {
        cat1: null as CanvasObject | null,
        cat2: null as CanvasObject | null,
        cat3: null as CanvasObject | null
    };

    constructor(wrapper: CanvasWrapper, context: CanvasRenderingContext2D, time: Readonly<Time>) {
        super(wrapper, context, time);
        this.objects.cat1 = 
            new CanvasObject(
                CanvasObject.sprite(this.textures.cat1 as CanvasSpritesheet, () => Math.floor(time.now * 24)),
                new Vector2f(0, 200),
                new Vector2f(200, 200),
                new Vector2f(1.0, 1.0),
                new Vector2f(0.5, 0.0),
                0
            );
        this.objects.cat2 = 
            new CanvasObject(
                CanvasObject.sprite(this.textures.cat2 as CanvasSpritesheet, () => Math.floor(time.now * 24)),
                new Vector2f(0, 150),
                new Vector2f(200, 200),
                new Vector2f(1.0, 1.0),
                new Vector2f(0.5, 0.0),
                0,
                [this.objects.cat1]
            );
        this.objects.cat3 =
            new CanvasObject(
                CanvasObject.sprite(this.textures.cat3 as CanvasSpritesheet, () => Math.floor(time.now * 24)),
                new Vector2f(640, 100),
                new Vector2f(200, 150),
                new Vector2f(1.0, 1.0),
                new Vector2f(0.5, 0.0),
                0,
                [this.objects.cat2]
            );
    }

    override render(): void {
        this.objects.cat1!.rotation = Math.sin(this.time.now * 2) * 0.75;
        this.objects.cat2!.rotation = Math.sin(this.time.now * 3) * 0.5;
        this.objects.cat3!.rotation = Math.sin(this.time.now * 4) * 0.5;
        
        this.objects.cat3!.render(this.context);
    }
}
