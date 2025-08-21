import { CanvasSpritesheet } from "../CanvasImageTexture.ts";
import { Vector2f } from "../CanvasMath.ts";
import { CanvasObject, Objects } from "../CanvasObject.ts";
import { CanvasScene } from "../CanvasScene.ts";
import { CanvasWrapper } from '../CanvasWrapper.ts';
import { ProgressBar } from "../ComplexObjects.ts";
import { Time } from "../Time.ts";

export class CatPendulum extends CanvasScene {
    override textures = {
        cat1: new CanvasSpritesheet('/cat-spritesheet.webp', 12, 14, 158),
        cat2: new CanvasSpritesheet('/cat-alt-spritesheet.webp', 9, 8, 71),
        cat3: new CanvasSpritesheet('/cat-alt-02-spritesheet.webp', 9, 8, 68)
    };
    override objects: {
        cat1: CanvasObject;
        cat2: CanvasObject;
        cat3: CanvasObject;

        texts: {
            cat1: CanvasObject;
            cat2: CanvasObject;
            cat3: CanvasObject;
        }

        progressBars: {
            cat1: ProgressBar;
            cat2: ProgressBar;
            cat3: ProgressBar;
        }
    };

    constructor(wrapper: CanvasWrapper, context: CanvasRenderingContext2D, time: Readonly<Time>) {
        super(wrapper, context, time);
        this.objects = { 
            cat1: new CanvasObject(
                Objects.sprite(this.textures.cat1, () => Math.floor(time.now * 24)),
                new Vector2f(0, 200),
                new Vector2f(200, 200),
                new Vector2f(1.0, 1.0),
                new Vector2f(0.5, 0.0),
                0
            ),
            cat2: new CanvasObject(
                Objects.sprite(this.textures.cat2, () => Math.floor(time.now * 24)),
                new Vector2f(0, 150),
                new Vector2f(200, 200),
                new Vector2f(1.0, 1.0),
                new Vector2f(0.5, 0.0),
                0
            ),
            cat3: new CanvasObject(
                Objects.sprite(this.textures.cat3, () => Math.floor(time.now * 24)),
                new Vector2f(640, 100),
                new Vector2f(200, 150),
                new Vector2f(1.0, 1.0),
                new Vector2f(0.5, 0.0),
                0,
            ),

            texts: {
                cat1: new CanvasObject(
                    Objects.staticText(
                        "Cat 1: 158 frames",
                        "24px Consolas, monospace",
                        "white",
                        "center",
                        "middle"
                    )
                ),
                cat2: new CanvasObject(
                    Objects.staticText(
                        "Cat 2: 71 frames",
                        "24px Consolas, monospace",
                        "white",
                        "center",
                        "middle"
                    )
                ),
                cat3: new CanvasObject(
                    Objects.staticText(
                        "Cat 3: 68 frames",
                        "24px Consolas, monospace",
                        "white",
                        "center",
                        "middle"
                    )
                )
            },

            progressBars: {
                cat1: new ProgressBar(
                    new Vector2f(50, 720 - 202),
                    new Vector2f(128, 24),
                    () => `Cat 1: ${(Math.floor(time.now * 24) % 158) + 1} / 158`
                ),
                cat2: new ProgressBar(
                    new Vector2f(50, 720 - 138),
                    new Vector2f(128, 24),
                    () => `Cat 2: ${(Math.floor(time.now * 24) % 71) + 1} / 71`
                ),
                cat3: new ProgressBar(
                    new Vector2f(50, 720 - 74),
                    new Vector2f(128, 24),
                    () => `Cat 3: ${(Math.floor(time.now * 24) % 68) + 1} / 68`
                )
            }
        };

        this.objects.cat3.append(this.objects.texts.cat3, this.objects.cat2);
        this.objects.cat2.append(this.objects.texts.cat2, this.objects.cat1);
        this.objects.cat1.append(this.objects.texts.cat1);
    }

    override render(): void {
        this.objects.cat1.rotation = Math.sin(this.time.now * 2) * 0.75;
        this.objects.cat2.rotation = Math.sin(this.time.now * 3) * 0.5;
        this.objects.cat3.rotation = Math.sin(this.time.now * 4) * 0.5;
    
        this.objects.progressBars.cat1.setProgress((Math.round(this.time.now * 24) / 158) % 1);
        this.objects.progressBars.cat2.setProgress((Math.round(this.time.now * 24) / 71) % 1);
        this.objects.progressBars.cat3.setProgress((Math.round(this.time.now * 24) / 68) % 1);

        this.renderInOrder(
            this.objects.cat3,
            this.objects.progressBars.cat1,
            this.objects.progressBars.cat2,
            this.objects.progressBars.cat3
        );
    }
}
