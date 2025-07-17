import { CanvasSpritesheet } from "./CanvasImageTexture.ts";
import { Vector2f } from "./CanvasMath.ts";
import { CanvasObject } from "./CanvasObject.ts";

class Time {
    public delta: number = 0;
    public now  : number = 0;
}

export class CanvasWrapper {
    private static idCounter: number = 0;
    private instanceId: number;

    private time: Time = new Time();
    private startTime: number = 0;

    private canvas: HTMLCanvasElement;
    private wrapperElement: HTMLElement;
    private context: CanvasRenderingContext2D;
    private resolution: Vector2f = new Vector2f(1280, 720);
    private resolutionScale: number = 1.0;

    // #region Debug Sprites

    private static debugSpritesheet_01: CanvasSpritesheet = new CanvasSpritesheet('/cat-spritesheet.webp', 12, 14, 158);
    private static debugSpritesheet_02: CanvasSpritesheet = new CanvasSpritesheet('/cat-alt-spritesheet.webp', 9, 8, 71);
    private static debugSpritesheet_03: CanvasSpritesheet = new CanvasSpritesheet('/cat-alt-02-spritesheet.webp', 9, 8, 68);

    private debugSprite_01: CanvasObject = new CanvasObject(
        CanvasObject.sprite(CanvasWrapper.debugSpritesheet_01, () => Math.floor(this.time.now * 24)),
        new Vector2f(0, 200),
        new Vector2f(200, 200),
        new Vector2f(1.0, 1.0),
        new Vector2f(0.5, 0.0),
        0
    );
    private debugSprite_02: CanvasObject = new CanvasObject(
        CanvasObject.sprite(CanvasWrapper.debugSpritesheet_02, () => Math.floor(this.time.now * 24)),
        new Vector2f(0, 150),
        new Vector2f(200, 200),
        new Vector2f(1.0, 1.0),
        new Vector2f(0.5, 0.0),
        0,
        [this.debugSprite_01]
    );
    private debugSprite_03: CanvasObject = new CanvasObject(
        CanvasObject.sprite(CanvasWrapper.debugSpritesheet_03, () => Math.floor(this.time.now * 24)),
        new Vector2f(640, 100),
        new Vector2f(200, 150),
        new Vector2f(1.0, 1.0),
        new Vector2f(0.5, 0.0),
        0,
        [this.debugSprite_02]
    );

    // #endregion

    constructor(canvas: HTMLCanvasElement, wrapperElement: HTMLElement) {
        this.instanceId = CanvasWrapper.idCounter++;
        
        this.startTime = -1;

        this.canvas = canvas;
        this.wrapperElement = wrapperElement;
        this.context = canvas.getContext('2d')!;
        
        CanvasObject.setDebugMode(true);

        if (!this.context) {
            throw new Error('Failed to get 2D context from canvas');
        }

        globalThis.requestAnimationFrame(this.onRenderFrame.bind(this));

        const onResizeListener = () => {
            const dpi = globalThis.devicePixelRatio || 2;
            this.canvas.width  = this.wrapperElement.clientWidth  * dpi * this.resolutionScale;
            this.canvas.height = this.wrapperElement.clientHeight * dpi * this.resolutionScale;
        };
        globalThis.addEventListener('resize', onResizeListener.bind(this));
        onResizeListener();
    }

    private onRenderFrame(timestamp: number): void {
        const frame = timestamp / 1000;

        if (this.startTime < 0) {
            this.startTime = frame;
        }

        this.time.delta = frame - this.startTime - this.time.now;
        this.time.now   = frame - this.startTime;
    
        // Set transformations to use virtual resolution
        this.setupTransformations();

        // Draw a debug sprite
        this.debugSprite_03.rotation = Math.sin(this.time.now * 2) * 0.75; 
        this.debugSprite_02.rotation = Math.sin(this.time.now * 3) * 0.5; 
        this.debugSprite_01.rotation = Math.sin(this.time.now * 4) * 0.5; 
        this.debugSprite_03.render(this.context);

        // Draw debug information
        this.drawDebugInfo();

        globalThis.requestAnimationFrame(this.onRenderFrame.bind(this));
    }

    private setupTransformations(): void {
        // Reset the transformation matrix
        this.context.setTransform(1, 0, 0, 1, 0, 0);

        // Clear the canvas
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Fill the canvas with a background color
        this.context.fillStyle = '#000';
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Check which axis is larger to maintain aspect ratio
        const scaleX = this.canvas.width / this.resolution.x;
        const scaleY = this.canvas.height / this.resolution.y;
        
        // Use the smaller scale to ensure the entire virtual resolution fits within the canvas
        const scale = Math.min(scaleX, scaleY);
        
        // Center the virtual resolution in the canvas
        const offsetX = (this.canvas.width - this.resolution.x * scale) / 2;
        const offsetY = (this.canvas.height - this.resolution.y * scale) / 2;
        
        // Apply the transformation
        this.context.setTransform(scale, 0, 0, scale, offsetX, offsetY);

        // Fill the background
        this.context.fillStyle = '#444';
        this.context.fillRect(0, 0, this.resolution.x, this.resolution.y);

        // Draw a border around the virtual resolution
        this.context.strokeStyle = 'white';
        this.context.strokeRect(0, 0, this.resolution.x, this.resolution.y);
    }

    private drawDebugInfo(): void {
        // Draw a background rectangle
        this.context.fillStyle = "#00000044";
        this.context.fillRect(0, 0, 200, 100);

        // Draw the debug text
        this.context.fillStyle = 'white';
        this.context.font = '16px Consolas, monospace';

        // Draw title and separator
        this.context.fillText(`(${this.instanceId}) Debug Info`, 10, 20);
        
        this.context.beginPath();
        this.context.moveTo(10, 30);
        this.context.lineTo(190, 30);
        this.context.strokeStyle = 'white';
        this.context.stroke();

        // Draw information
        this.context.fillText(`Delta : ${(this.time.delta * 1000).toFixed(2).padStart(5, "0")}ms`, 10, 50);
        this.context.fillText(`Now   : ${this.time.now.toFixed(2)}s`, 10, 70);
        this.context.fillText(`Canvas: ${this.canvas.width}x${this.canvas.height}`, 10, 90);
    }
}