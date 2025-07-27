import { Vector2f } from "./CanvasMath.ts";
import { CanvasObject, Objects } from "./CanvasObject.ts";
import { CanvasScene, SceneProvider } from "./CanvasScene.ts";
import { Time } from "./Time.ts";

class ExampleCanvasScene extends CanvasScene {
    override objects: {
        text: CanvasObject;
    }
    halfResolution: Vector2f;
    
    constructor(wrapper: CanvasWrapper, context: CanvasRenderingContext2D, time: Readonly<Time>) {
        super(wrapper, context, time);

        const resolution = wrapper.resolution;
        this.halfResolution = resolution.multiply(0.5);

        this.objects = {
            text: new CanvasObject(
                Objects.staticText(
                    "Please provide a scene implementation.",
                    "32px Consolas, monospace",
                    "white",
                    "center",
                    "middle"
                ),
                this.halfResolution,
                resolution
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
    public get clientSize(): Vector2f {
        return new Vector2f(
            this._wrapperElement.clientWidth ,
            this._wrapperElement.clientHeight
        );
    }
    private _resolutionScale: number = 1.0;
    private _dpi: number = globalThis.devicePixelRatio || 2;

    private _scene: CanvasScene | null = null;
    private _sequenceGenerator: Generator<void>;

    private _glHandler: {
        _glCanvas: HTMLCanvasElement;
        _glContext: WebGL2RenderingContext | null;
        _glResolution: Vector2f;
    } | null = null;

    private _fpsData = new Float32Array(201);
    private _fpsAccumulative: number = 0;
    private _fpsIndex: number = 0;
    private _fpsBounds: { lower: number, upper: number } = { lower: 0, upper: 60 };
    private _topFps: number = 60;
    private _bottomFps: number = -1;

    private _fpsPlot: CanvasObject = new CanvasObject(
        Objects.plotFunction(
            "",
            (x) => this._fpsData[(x + this._fpsIndex) % 201],
            { lower: 0, upper: 200  },
            this._fpsBounds,
            1,
            () => 200,
            20,
        ),
        new Vector2f(970, 10),
        new Vector2f(300, 65),
        new Vector2f(1, 1),
        new Vector2f(0.0, 0.0),
    );

    constructor(canvas: HTMLCanvasElement, wrapperElement: HTMLElement, sceneProvider: SceneProvider) {
        this._instanceId = CanvasWrapper.IdCounter++;
        
        this._startTime = -1;

        this._canvas = canvas;
        this._wrapperElement = wrapperElement;
        this._context = canvas.getContext('2d')!;
        
        this._scene = sceneProvider(this, this._context, this._time);
        if (this._scene === null)
            this._scene = new ExampleCanvasScene(this, this._context, this._time);

        this._sequenceGenerator = this._scene.sequence();

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
        this._sequenceGenerator.next();

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
        const offsetX = (this._canvas.width  - this._resolution.x * scale) / 2;
        const offsetY = (this._canvas.height - this._resolution.y * scale) / 2;
        
        // Apply the transformation
        this._context.setTransform(scale, 0, 0, scale, offsetX, offsetY);

        // Fill the background
        this._context.fillStyle = "#444";
        this._context.fillRect(0, 0, this._resolution.x, this._resolution.y);

        // Draw a border around the virtual resolution
        this._context.strokeStyle = 'white';
        this._context.strokeRect(0, 0, this._resolution.x, this._resolution.y);
    }

    private drawDebugInfo(): void {
        if (CanvasObject.debugMode === false) {
            return;
        }

        // Draw a background rectangle
        this._context.fillStyle = "#00000044";
        this._context.fillRect(0, 0, 1280, 100);

        // Draw the debug text
        this._context.fillStyle = 'white';
        this._context.font = '16px Consolas, monospace';
        this._context.textAlign = 'left';
        this._context.textBaseline = 'alphabetic';

        // Draw title and separator
        this._context.fillText(`(${this._instanceId}) Debug Info`, 10, 20);
        
        this._context.beginPath();
        this._context.moveTo(10, 30);
        this._context.lineTo(960, 30);
        this._context.strokeStyle = 'white';
        this._context.lineWidth = 1;
        this._context.lineCap = 'butt';
        this._context.stroke();

        // Draw information
        this._context.fillText(`Now       : ${this._time.now.toFixed(2)}s`, 10, 50);
        this._context.fillText(`Resolution: ${this._canvas.width}x${this._canvas.height}`, 10, 70);
        this._context.fillText(`Scene     : ${this._scene?.getFileInfo()}`, 10, 90);

        const fps = 1 / this._time.delta;
        // Draw FPS text
        this._context.textAlign = 'right';
        this._context.fillText(`FPS: ${fps.toFixed(2).padStart(6, '0')}`, 960, 20);
        this._context.fillText(`Avg: ${(this._fpsAccumulative / 200).toFixed(2).padStart(6, '0')}`, 960, 50);
        this._context.fillText(`Max: ${this._topFps.toFixed(2).padStart(6, '0')}`, 960, 70);
        this._context.fillText(`Min: ${this._bottomFps.toFixed(2).padStart(6, '0')}`, 960, 90);


        // Draw FPS plot
        if (isNaN(fps) || isFinite(fps) === false) {
            return;
        }
        this._topFps = Math.max(this._topFps, fps);
        this._bottomFps = this._bottomFps < 0 ? fps : Math.min(this._bottomFps, fps);
        this._fpsAccumulative += fps;
        if (this._fpsIndex >= 201) {
            this._fpsAccumulative -= this._fpsData[this._fpsIndex % 201];
        }

        CanvasObject.debugMode = false; // Disable debug mode for FPS plot
        this._fpsData[this._fpsIndex++ % 201] = fps;
        this._fpsBounds.upper = Math.max(this._fpsBounds.upper, Math.ceil(fps / 10 + 1) * 10);
        this._fpsPlot.render(this._context);
        CanvasObject.debugMode = true; // Re-enable debug mode
    }

    public getTextSize(text: string): Vector2f {
        const measurments = this._context.measureText(text);
        return new Vector2f(
            (measurments.actualBoundingBoxLeft   + measurments.actualBoundingBoxRight  ),
            (measurments.actualBoundingBoxAscent + measurments.actualBoundingBoxDescent)
        );
    }

    public getWebGLContext(): WebGL2RenderingContext | null {
        if (this._glHandler) {
            return this._glHandler._glContext;
        }

        const glCanvas = document.createElement('canvas');
        glCanvas.classList.add('webgl-canvas');

        this._glHandler = {
            _glCanvas: glCanvas,
            _glContext: glCanvas.getContext('webgl2'),
            _glResolution: new Vector2f(1280, 720)
        };

        if (!this._glHandler._glContext) {
            console.error("WebGL context is not available.");
            return null;
        }

        // Set the canvas size to match the wrapper element and
        // add resize listener to update the WebGL canvas size
        const onResizeListener = () => {
            this._glHandler!._glCanvas.width  = this._wrapperElement.clientWidth ;
            this._glHandler!._glCanvas.height = this._wrapperElement.clientHeight;
            
            const scaleX = this._wrapperElement.clientWidth  / this._resolution.x;
            const scaleY = this._wrapperElement.clientHeight / this._resolution.y;
            const scale = Math.min(scaleX, scaleY);
            
            const offsetX = (this._wrapperElement.clientWidth  - this._resolution.x * scale) / 2;
            const offsetY = (this._wrapperElement.clientHeight - this._resolution.y * scale) / 2;

            this._glHandler!._glResolution.x = this._resolution.x * scale;
            this._glHandler!._glResolution.y = this._resolution.y * scale; 

            this._glHandler!._glContext!.viewport(
                offsetX, offsetY,
                this._resolution.x * scale,
                this._resolution.y * scale
            )
        }
        globalThis.addEventListener('resize', onResizeListener.bind(this));
        setTimeout(onResizeListener.bind(this), 1); // Let a frame pass to ensure the wrapper element is ready

        // Append the WebGL canvas to the wrapper element before the main canvas
        this._wrapperElement.insertBefore(this._glHandler._glCanvas, this._canvas);

        return this._glHandler._glContext;
    }
}
