import { CanvasImageTexture, CanvasSpritesheet } from "./CanvasImageTexture.ts";
import { Vector2f } from "./CanvasMath.ts";

export type RenderFunction = (
    object: CanvasObject,
    context: CanvasRenderingContext2D,
) => void;

export class CanvasObject {
    public static debugMode: boolean = false;

    public position: Vector2f;
    public rotation: number;
    public size: Vector2f;
    public scale: Vector2f;
    public pivot: Vector2f;
    
    protected renderFunction: RenderFunction;

    public children: CanvasObject[];
    
    /**
     * Represents a drawable object on a canvas.
     * @param renderFunction The function that defines how the object is rendered. Static methods are provided for common shapes.
     * @param position The position of the object in the canvas coordinate system.
     * @param size     The size of the object, typically a width and height.
     * @param scale    The scale of the object, allowing it to be resized without changing its original size.
     * @param pivot    The pivot point of the object, which is the point around rotation is applied. Also used for parenting and positioning.
     * @param rotation The rotation of the object in radians.
     * 
     */
    constructor(
        renderFunction: RenderFunction,
        position: Vector2f = Vector2f.zero(),
        size: Vector2f = new Vector2f(100, 100),
        scale: Vector2f = Vector2f.one(),
        pivot: Vector2f = new Vector2f(0.5, 0.5),
        rotation: number = 0,
        children: CanvasObject[] = [],
    ) {
        this.position = position;
        this.rotation = rotation;
        this.size = size;
        this.scale = scale;
        this.pivot = pivot;
        
        this.renderFunction = renderFunction;

        this.children = children;
    }
    
    public render(context: CanvasRenderingContext2D, depth: number = 0): void {
        if (depth > 10) {
            console.warn('CanvasObject: Maximum render depth exceeded, stopping rendering to prevent stack overflow.');
            return;
        }
        
        context.save();
        context.translate(
            this.position.x,
            this.position.y,
        );
        context.scale(this.scale.x, this.scale.y);
        context.rotate(this.rotation);

        this.renderFunction(this, context);

        this.children.forEach((child) => {
            child.render(context, depth + 1);
        });

        if (!CanvasObject.debugMode) {
            context.restore();
            return;
        }

        // Visualize the pivot point
        context.fillStyle = '#00ff00';
        context.fillRect(
            -2, -2,
            4, 4,
        );

        // Visualize a bounding box
        context.strokeStyle = '#0000ff';
        context.lineWidth = 1;
        context.strokeRect(
            -this.size.x * this.pivot.x,
            -this.size.y * this.pivot.y,
            this.size.x, 
            this.size.y,
        );

        context.restore();
    }

    public static setDebugMode(enabled: boolean): void {
        CanvasObject.debugMode = enabled;
    }
    
    public static ellipse(
        fillStyle: string,
        strokeStyle: string | null = null,
    ): RenderFunction {
        return (object: CanvasObject, context: CanvasRenderingContext2D) => {
            context.beginPath();
            context.ellipse(
                -object.size.x * (object.pivot.x - 0.5),
                -object.size.y * (object.pivot.y - 0.5),
                object.size.x / 2,
                object.size.y / 2,
                0, 0, Math.PI * 2,
            );
            context.fillStyle = fillStyle;
            context.fill();
            if (strokeStyle) {
                context.strokeStyle = strokeStyle;
                context.stroke();
            }
        };
    }

    public static rectangle(
        fillStyle: string,
        strokeStyle: string | null = null,
    ): RenderFunction {
        return (object: CanvasObject, context: CanvasRenderingContext2D) => {            
            context.beginPath();
            context.rect(
                -object.size.x * object.pivot.x,
                -object.size.y * object.pivot.y,
                object.size.x,
                object.size.y,
            );
            context.fillStyle = fillStyle;
            context.fill();
            if (strokeStyle) {
                context.strokeStyle = strokeStyle;
                context.stroke();
            }
        };
    }

    public static line(
        strokeStyle: string,
        lineWidth: number = 1,
    ): RenderFunction {
        return (object: CanvasObject, context: CanvasRenderingContext2D) => {
            const oneMinusPivot = Vector2f.one().subtract(object.pivot);
            
            context.beginPath();
            context.moveTo(-object.size.x * object.pivot.x, -object.size.y * object.pivot.y );
            context.lineTo( object.size.x * oneMinusPivot.x, object.size.y * oneMinusPivot.y);
            context.strokeStyle = strokeStyle;
            context.lineWidth = lineWidth;
            context.stroke();
        };
    }

    public static image(
        sprite: CanvasImageTexture
    ): RenderFunction {
        return (object: CanvasObject, context: CanvasRenderingContext2D) => {
            if (!sprite.isLoaded()) {
                return;
            }
            
            context.drawImage(
                sprite.getImage(),
                -object.size.x * object.pivot.x,
                -object.size.y * object.pivot.y,
                object.size.x,
                object.size.y
            );
        };
    }

    public static sprite(
        sprite: CanvasSpritesheet,
        frame: () => number = () => 0,
    ): RenderFunction {
        return (object: CanvasObject, context: CanvasRenderingContext2D) => {
            if (!sprite.isLoaded()) {
                return;
            }

            const frameIndex = frame();
            sprite.drawFrame(
                context,
                frameIndex,
                -object.size.x * object.pivot.x,
                -object.size.y * object.pivot.y,
                object.size.x,
                object.size.y
            )
        };
    }

}
