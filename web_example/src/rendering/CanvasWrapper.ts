import { Vector2f } from "./CanvasMath.ts";
import { CanvasObject } from "./CanvasObject.ts";
import { CanvasScene, SceneProvider } from "./CanvasScene.ts";

export class Time {
    public delta: number = 0;
    public now  : number = 0;
}

class ExampleCanvasScene extends CanvasScene {
    objects: {
        text: CanvasObject;
    }
    halfResolution: Vector2f;
    
    constructor(wrapper: CanvasWrapper, context: CanvasRenderingContext2D, time: Readonly<Time>) {
        super(wrapper, context, time);

        const resolution = wrapper.resolution;
        this.halfResolution = resolution.multiply(0.5);

        this.objects = {
            text: new CanvasObject(
                CanvasObject.staticText(
                    "Please provide a scene implementation.",
                    "32px Consolas, monospace",
                    "white",
                    "center",
                    "middle"
                ),
                this.halfResolution,
                resolution,
                new Vector2f(1.0, 1.0),
                new Vector2f(0.5, 0.5),
                0
            )
        };
    }

    override render(): void {
        this.objects.text.rotation = Math.sin(this.time.now * 5) * Math.PI * 0.025;
        this.objects.text.render(this.context);
    }
}

export class CanvasWrapper {
    private static IdCounter: number = 0;
    private _instanceId: number;

    private _time: Time = new Time();
    private _startTime: number = 0;

    private _canvas: HTMLCanvasElement;
    private _wrapperElement: HTMLElement;
    private _context: CanvasRenderingContext2D;
    
    private _resolution: Vector2f = new Vector2f(1280, 720);
    public get resolution(): Readonly<Vector2f> { return this._resolution; }
    private _resolutionScale: number = 1.0;

    private _dpi: number = globalThis.devicePixelRatio || 2;

    private _scene: CanvasScene | null = null;

    constructor(canvas: HTMLCanvasElement, wrapperElement: HTMLElement, sceneProvider: SceneProvider) {
        this._instanceId = CanvasWrapper.IdCounter++;
        
        this._startTime = -1;

        this._canvas = canvas;
        this._wrapperElement = wrapperElement;
        this._context = canvas.getContext('2d')!;
        
        this._scene = sceneProvider(this, this._context, this._time);
        if (this._scene === null)
            this._scene = new ExampleCanvasScene(this, this._context, this._time);

        //CanvasObject.setDebugMode(true);

        if (!this._context) {
            throw new Error('Failed to get 2D context from canvas');
        }

        globalThis.requestAnimationFrame(this.onRenderFrame.bind(this));

        const onResizeListener = () => {
            this._canvas.width  = this._wrapperElement.clientWidth  * this._dpi * this._resolutionScale;
            this._canvas.height = this._wrapperElement.clientHeight * this._dpi * this._resolutionScale;
        };
        globalThis.addEventListener('resize', onResizeListener.bind(this));
        onResizeListener();
    }

    private onRenderFrame(timestamp: number): void {
        const frame = timestamp / 1000;

        if (this._startTime < 0) {
            this._startTime = frame;
        }

        this._time.delta = frame - this._startTime - this._time.now;
        this._time.now   = frame - this._startTime;
    
        // Set transformations to use virtual resolution
        this.setupTransformations();

        // Render the scene
        this._scene!.render();

        // Draw debug information
        this.drawDebugInfo();

        globalThis.requestAnimationFrame(this.onRenderFrame.bind(this));
    }

    private setupTransformations(): void {
        // Reset the transformation matrix
        this._context.setTransform(1, 0, 0, 1, 0, 0);

        // Clear the canvas
        this._context.clearRect(0, 0, this._canvas.width, this._canvas.height);

        // Fill the canvas with a background color
        this._context.fillStyle = '#000';
        this._context.fillRect(0, 0, this._canvas.width, this._canvas.height);

        // Check which axis is larger to maintain aspect ratio
        const scaleX = this._canvas.width / this._resolution.x;
        const scaleY = this._canvas.height / this._resolution.y;
        
        // Use the smaller scale to ensure the entire virtual resolution fits within the canvas
        const scale = Math.min(scaleX, scaleY);
        
        // Center the virtual resolution in the canvas
        const offsetX = (this._canvas.width - this._resolution.x * scale) / 2;
        const offsetY = (this._canvas.height - this._resolution.y * scale) / 2;
        
        // Apply the transformation
        this._context.setTransform(scale, 0, 0, scale, offsetX, offsetY);

        // Fill the background
        this._context.fillStyle = '#444';
        this._context.fillRect(0, 0, this._resolution.x, this._resolution.y);

        // Draw a border around the virtual resolution
        this._context.strokeStyle = 'white';
        this._context.strokeRect(0, 0, this._resolution.x, this._resolution.y);
    }

    private drawDebugInfo(): void {
        // Draw a background rectangle
        this._context.fillStyle = "#00000044";
        this._context.fillRect(0, 0, 200, 100);

        // Draw the debug text
        this._context.fillStyle = 'white';
        this._context.font = '16px Consolas, monospace';
        this._context.textAlign = 'left';
        this._context.textBaseline = 'alphabetic';

        // Draw title and separator
        this._context.fillText(`(${this._instanceId}) Debug Info`, 10, 20);
        
        this._context.beginPath();
        this._context.moveTo(10, 30);
        this._context.lineTo(190, 30);
        this._context.strokeStyle = 'white';
        this._context.stroke();

        // Draw information
        this._context.fillText(`Delta : ${(this._time.delta * 1000).toFixed(2).padStart(5, "0")}ms`, 10, 50);
        this._context.fillText(`Now   : ${this._time.now.toFixed(2)}s`, 10, 70);
        this._context.fillText(`Canvas: ${this._canvas.width}x${this._canvas.height}`, 10, 90);
    }

    public getTextSize(text: string): Vector2f {
        const measurments = this._context.measureText(text);
        return new Vector2f(
            (measurments.actualBoundingBoxLeft   + measurments.actualBoundingBoxRight  ),
            (measurments.actualBoundingBoxAscent + measurments.actualBoundingBoxDescent)
        );
    }
}
