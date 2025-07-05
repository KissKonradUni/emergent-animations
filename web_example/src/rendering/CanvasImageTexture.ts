import { Vector2f } from "./CanvasMath.ts";

export class CanvasImageTexture {
    protected static cache: Map<string, HTMLImageElement> = new Map();
    protected image: HTMLImageElement;
    protected loaded: boolean = false;
    protected size: Vector2f = new Vector2f(-1, -1);

    constructor(url: string) {
        this.image = CanvasImageTexture.cache.get(url) || new Image();
        
        if (!CanvasImageTexture.cache.has(url)) {
            this.image.src = url;
            CanvasImageTexture.cache.set(url, this.image);
        }

        this.image.onload = () => {
            this.loaded = true;
            this.size.set(this.image.width, this.image.height);
        };
    }

    public isLoaded(): boolean {
        return this.loaded;
    }

    public getImage(): HTMLImageElement {
        if (!this.loaded) {
            console.warn(`Image at ${this.image.src} is not loaded yet.`);
        }
        return this.image;
    }
}

export class CanvasSpritesheet extends CanvasImageTexture {
    private framesX: number;
    private framesY: number;
    private frameCount: number;

    private static BIAS: number = 0.5;

    constructor(url: string, framesX: number, framesY: number, frameCount: number = framesX * framesY) {
        super(url);
        this.framesX = framesX;
        this.framesY = framesY;
        this.frameCount = frameCount;
    }

    public drawFrame(context: CanvasRenderingContext2D, frameIndex: number, x: number, y: number, width: number, height: number): void {
        if (!this.isLoaded()) {
            console.warn(`Spritesheet at ${this.image.src} is not loaded yet.`);
            return;
        }

        const clampedFrameIndex = frameIndex % this.frameCount;

        const frameWidth  = (this.image.width  / this.framesX);
        const frameHeight = (this.image.height / this.framesY);

        const frameX = (          (clampedFrameIndex % this.framesX) * frameWidth );
        const frameY = (Math.floor(clampedFrameIndex / this.framesX) * frameHeight);

        context.drawImage(this.image,
            frameX      + CanvasSpritesheet.BIAS,
            frameY      + CanvasSpritesheet.BIAS,
            frameWidth  - CanvasSpritesheet.BIAS * 2,
            frameHeight - CanvasSpritesheet.BIAS * 2,
            x, y, width, height
        );
    }
}