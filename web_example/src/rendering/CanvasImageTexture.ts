import { Vector2f } from "./CanvasMath.ts";
import { IS_LOCAL, BASE_URL } from "../Router.ts";

export class CanvasImageTexture {
    protected static cache: Map<string, HTMLImageElement> = new Map();
    protected image: HTMLImageElement;
    protected loaded: boolean = false;
    protected size: Vector2f = new Vector2f(-1, -1);

    constructor(url: string) {
        const fullUrl = IS_LOCAL ? url : BASE_URL + url;
        this.image = CanvasImageTexture.cache.get(fullUrl) || new Image();
        
        if (!CanvasImageTexture.cache.has(fullUrl)) {
            this.image.src = fullUrl;
            CanvasImageTexture.cache.set(fullUrl, this.image);
        } else {
            this.loaded = true;
            const cachedImage = CanvasImageTexture.cache.get(fullUrl)!;
            this.size.set(cachedImage.width, cachedImage.height);
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

/**
 * Technically not similarly implemented to the original, but serves a similar purpose.
 */
export class CanvasManualTexture {
    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;

    constructor(width: number, height: number) {
        this.canvas = document.createElement("canvas");
        this.canvas.width = width;
        this.canvas.height = height;
        this.context = this.canvas.getContext("2d")!;
    }

    public getCanvas(): HTMLCanvasElement {
        return this.canvas;
    }

    public getContext(): CanvasRenderingContext2D {
        return this.context;
    }

    public get imageData(): ImageData {
        return this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
    }

    public set imageData(imageData: ImageData) {
        this.context.putImageData(imageData, 0, 0);
    }
}