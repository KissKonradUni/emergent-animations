import { CanvasSpritesheet } from "./CanvasImageTexture.ts";
import { Vector2f } from "./CanvasMath.ts";
import { CanvasObject } from "./CanvasObject.ts";

interface Time {
    delta: number;
    now: number;
}

export class CanvasWrapper {
    private static idCounter: number = 0;
    private instanceId: number;

    private static time: Time = {
        delta: 0,
        now: 0
    };

    private canvas: HTMLCanvasElement;
    private wrapperElement: HTMLElement;
    private context: CanvasRenderingContext2D;
    private resolution: Vector2f = new Vector2f(1280, 720);
    private resolutionScale: number = 1.0;

    private static debugTexture: CanvasSpritesheet = new CanvasSpritesheet('/cat-alt.gif', 1, 1, 1);
    private static debugSpritesheet: CanvasSpritesheet = new CanvasSpritesheet('/cat-spritesheet.webp', 12, 14, 158);

    private static debugObject: CanvasObject = new CanvasObject(
        CanvasObject.image(CanvasWrapper.debugTexture),
        new Vector2f(0, 100),
        new Vector2f(200, 200),
        new Vector2f(1.0, 1.0),
        new Vector2f(0.5, 0.0),
        0
    );
    private static debugSprite: CanvasObject = new CanvasObject(
        CanvasObject.sprite(CanvasWrapper.debugSpritesheet, () => Math.floor(CanvasWrapper.time.now * 24)),
        new Vector2f(400, 250),
        new Vector2f(200, 200),
        new Vector2f(1.0, 1.0),
        new Vector2f(0.5, 0.5),
        0,
        [CanvasWrapper.debugObject]
    );

    constructor(canvas: HTMLCanvasElement, wrapperElement: HTMLElement) {
        this.instanceId = CanvasWrapper.idCounter++;
        
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
        const now = timestamp / 1000;
        CanvasWrapper.time.delta = now - CanvasWrapper.time.now;
        CanvasWrapper.time.now = now;
    
        // Set transformations to use virtual resolution
        this.setupTransformations();

        // Draw a debug sprite
        CanvasWrapper.debugSprite.rotation = Math.sin(now * 2) * 0.5; // Example rotation animation
        CanvasWrapper.debugObject.rotation = Math.cos(now * 2) * 0.5; // Example rotation animation
        CanvasWrapper.debugSprite.render(this.context);

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
        this.context.fillText(`Delta : ${(CanvasWrapper.time.delta * 1000).toFixed(2).padStart(5, "0")}ms`, 10, 50);
        this.context.fillText(`Now   : ${CanvasWrapper.time.now.toFixed(2)}s`, 10, 70);
        this.context.fillText(`Canvas: ${this.canvas.width}x${this.canvas.height}`, 10, 90);
    }
}