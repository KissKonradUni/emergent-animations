import { CanvasImageTexture, CanvasSpritesheet } from "./CanvasImageTexture.ts";
import { Vector2f } from "./CanvasMath.ts";

export type RenderFunction = (
    object: CanvasObject,
    context: CanvasRenderingContext2D,
) => void;

export interface Renderable {
    render(context: CanvasRenderingContext2D, depth?: number): void;
}

export class CanvasObject implements Renderable {
    public static debugMode: boolean = false;

    public position: Vector2f;
    public rotation: number;
    private _size: Vector2f;
    public get size(): Vector2f {
        return this._size;
    }
    public set size(value: Vector2f) {
        this._size = value;
        this._hasDefaultSize = false;
    }
    public scale: Vector2f;
    public pivot: Vector2f;
    
    protected renderFunction: RenderFunction;

    protected _parent: CanvasObject | null = null;
    private _children: CanvasObject[];
    public append(...children: CanvasObject[]): void {
        this._children.push(...children);
        children.forEach(child => {
            child._parent = this;
        });
    }

    private _hasDefaultSize: boolean = true;
    public get hasDefaultSize(): Readonly<boolean> {
        return this._hasDefaultSize;
    }
    
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
        this._size = size;
        this._hasDefaultSize = size.x === 100 && size.y === 100;
        this.scale = scale;
        this.pivot = pivot;
        
        this.renderFunction = renderFunction;

        this._children = children;
    }
    
    public render(context: CanvasRenderingContext2D, depth: number = 0): void {
        if (this._parent !== null && depth === 0)
            return; // The parent will render this object, so we skip rendering it here.
        
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

        this._children.forEach((child) => {
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

    public createCopy(copyChildren: boolean): CanvasObject {
        const copy = new CanvasObject(
            this.renderFunction,
            this.position.clone(),
            this.size.clone(),
            this.scale.clone(),
            this.pivot.clone(),
            this.rotation,
        );
        
        if (copyChildren) {
            copy._children = this._children.map(child => child.createCopy(true));
        } else {
            copy._children = [];
        }
        
        return copy;
    }

    public static setDebugMode(enabled: boolean): void {
        CanvasObject.debugMode = enabled;
    }
}

export class Objects {

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

    public static roundedRectangle(
        fillStyle: string,
        strokeStyle: string | null = null,
        radius: number = 10,
    ): RenderFunction {
        return (object: CanvasObject, context: CanvasRenderingContext2D) => {
            context.beginPath();
            context.roundRect(
                -object.size.x * object.pivot.x,
                -object.size.y * object.pivot.y,
                object.size.x,
                object.size.y,
                radius,
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

    public static staticText(
        text: string,
        font: string = '16px monospace, Consolas',
        fillStyle: string = '#000',
        alignment: CanvasTextAlign = 'left',
        baseline: CanvasTextBaseline = 'top',
        multiline: boolean = false,
    ): RenderFunction {
        return Objects.dynamicText(
            () => text,
            font,
            fillStyle,
            alignment,
            baseline,
            multiline,
        );
    }

    public static dynamicText(
        text: () => string,
        font: string = '16px monospace, Consolas',
        fillStyle: string = '#000',
        alignment: CanvasTextAlign = 'left',
        baseline: CanvasTextBaseline = 'top',
        multiline: boolean = false,
    ): RenderFunction {
        return (object: CanvasObject, context: CanvasRenderingContext2D) => {
            if (object.hasDefaultSize)
                object.size = Vector2f.one();
            
            let lines = [];
            let height = 0;
            if (multiline) {
                const _text = text();
                lines = _text.split('\n');
                height = parseInt(font);
            }
            else {
                lines = [text()];
            }

            for (let index = 0; index < lines.length; index++) {
                context.font = font;
                context.fillStyle = fillStyle;
                context.textAlign = alignment;
                context.textBaseline = baseline;

                context.fillText(
                    lines[index],
                    0, height * index,
                );
            }
        };
    }

    public static plotFunction(
        title: string,
        func: (x: number) => number,
        xRange: {lower: number, upper: number} = {lower: -5, upper: 5},
        yRange: {lower: number, upper: number} = {lower: -5, upper: 5},
        step: number = 0.1,
        dotX: () => number = () => 0,
        lineFrequency: number = 1,
    ) {
        return (object: CanvasObject, context: CanvasRenderingContext2D) => {
            const positionOffset = new Vector2f(
                ((object.pivot.x - 0.5) * object.size.x),
                ((object.pivot.y - 0.5) * object.size.y)
            );
            const topLeft = new Vector2f(
                -object.size.x / 2 - positionOffset.x,
                -object.size.y / 2 - positionOffset.y
            );
            
            // Y-axis
            const widthPercentage = (1 - (xRange.upper) / (xRange.upper - xRange.lower)); // Invert for canvas coordinates
            if (widthPercentage >= 0 && widthPercentage <= 1) {
                context.beginPath();
                context.moveTo(
                    topLeft.x + object.size.x * widthPercentage,
                    topLeft.y
                );
                context.lineTo(
                    topLeft.x + object.size.x * widthPercentage,
                    topLeft.y + object.size.y
                );

                context.strokeStyle = '#000';
                context.lineWidth = 2;
                context.stroke();

                // Top of the Y-axis
                context.font = '16px monospace, Consolas';
                context.fillStyle = '#000';
                context.textAlign = 'left';
                context.textBaseline = 'top';
                context.fillText(
                    yRange.upper.toString(),
                    topLeft.x + object.size.x * widthPercentage + 5,
                    topLeft.y
                );

                // Bottom of the Y-axis
                context.textAlign = 'left';
                context.textBaseline = 'bottom';
                context.fillText(
                    yRange.lower.toString(),
                    topLeft.x + object.size.x * widthPercentage + 5,
                    topLeft.y + object.size.y
                );

                // Lines for 1s
                for (let i = Math.ceil(yRange.lower); i <= Math.floor(yRange.upper); i += lineFrequency) {
                    if (i === 0) continue;

                    const yPos = topLeft.y + object.size.y * (1 - (i - yRange.lower) / (yRange.upper - yRange.lower));
                    context.beginPath();
                    context.moveTo(
                        topLeft.x,
                        yPos
                    );
                    context.lineTo(
                        topLeft.x + object.size.x,
                        yPos
                    );
                    context.strokeStyle = '#00000044';
                    context.lineWidth = 2;
                    context.stroke();
                }
            }

            // X-axis
            const heightPercentage = ((yRange.upper) / (yRange.upper - yRange.lower));
            if (heightPercentage >= 0 && heightPercentage <= 1) {
                context.beginPath();
                context.moveTo(
                    topLeft.x,
                    topLeft.y + object.size.y * heightPercentage
                );
                context.lineTo(
                    topLeft.x + object.size.x,
                    topLeft.y + object.size.y * heightPercentage
                );

                context.strokeStyle = '#000';
                context.lineWidth = 2;
                context.stroke();

                // Left of the X-axis
                context.fillStyle = '#000';
                context.textAlign = 'left';
                context.textBaseline = 'top';
                context.fillText(
                    xRange.lower.toString(),
                    topLeft.x,
                    topLeft.y + object.size.y * heightPercentage + 5
                );

                // Right of the X-axis
                context.textAlign = 'right';
                context.textBaseline = 'top';
                context.fillText(
                    xRange.upper.toString(),
                    topLeft.x + object.size.x,
                    topLeft.y + object.size.y * heightPercentage + 5
                );

                // Lines
                for (let i = Math.ceil(xRange.lower); i <= Math.floor(xRange.upper); i += lineFrequency) {
                    if (i === 0) continue;

                    const xPos = topLeft.x + object.size.x * ((i - xRange.lower) / (xRange.upper - xRange.lower));
                    context.beginPath();
                    context.moveTo(
                        xPos,
                        topLeft.y
                    );
                    context.lineTo(
                        xPos,
                        topLeft.y + object.size.y
                    );
                    context.strokeStyle = '#00000044';
                    context.lineWidth = 2;
                    context.stroke();
                }
            }

            // Plot the function
            context.beginPath();

            const xScale = object.size.x / (xRange.upper - xRange.lower);
            const yScale = object.size.y / (yRange.upper - yRange.lower);
            
            for (let x = xRange.lower; x <= xRange.upper; x += step) {
                const y = func(x);
                context.lineTo(
                    topLeft.x + (x - xRange.lower) * xScale,
                    topLeft.y + object.size.y - (y - yRange.lower) * yScale
                );
            }
            const y = func(xRange.upper);
            context.lineTo(
                topLeft.x + (xRange.upper - xRange.lower) * xScale,
                topLeft.y + object.size.y - (y - yRange.lower) * yScale
            );

            context.strokeStyle = '#ff5722';
            context.lineWidth = 4;
            context.stroke();

            // Draw a dot at the specified x position
            const dotXPos = dotX();
            const funcAtDot = func(dotXPos);
            if (widthPercentage >= 0 && widthPercentage <= 1) {
                context.beginPath();
                context.ellipse(
                    topLeft.x + object.size.x * widthPercentage + dotXPos * xScale,
                    topLeft.y + object.size.y * heightPercentage - funcAtDot * yScale,
                    5, 5, 0, 0, Math.PI * 2
                );
                context.fillStyle = '#f00';
                context.strokeStyle = '#fff';
                context.lineWidth = 2;
                context.fill();
                context.stroke();
            }

            // Title
            context.font = '20px monospace, Consolas';
            context.fillStyle = '#fff';
            context.textAlign = 'center';
            context.textBaseline = 'bottom';
            context.fillText(
                title,
                topLeft.x + object.size.x / 2,
                topLeft.y
            );
        };
    }

    public static axes(xRange: Vector2f, yRange: Vector2f, gridSizing: number, invertYAxis: boolean = true): RenderFunction {
        return (object: CanvasObject, context: CanvasRenderingContext2D) => {            
            const offset = new Vector2f(
                (object.pivot.x) * object.size.x,
                (object.pivot.y) * object.size.y
            );
            context.save();
            context.translate(
                -offset.x,
                -offset.y,
            );

            // Find the 0 in the ranges
            // Y-axis is inverted in canvas coordinates, so we need to adjust the zero point accordingly.
            const xZero =  (xRange.x < 0 && xRange.y > 0) ? -xRange.x / (xRange.y - xRange.x) : 0;
            let yZero = ((yRange.x < 0 && yRange.y > 0) ? -yRange.x / (yRange.y - yRange.x) : 0);
            if (invertYAxis) {
                yZero = 1 - yZero; // Invert the Y-axis for canvas coordinates
            }

            // Draw the grid
            const gridPixels = new Vector2f(
                object.size.x / (xRange.y - xRange.x) * gridSizing,
                object.size.y / (yRange.y - yRange.x) * gridSizing,
            );
            const xOffset = xZero * object.size.x;
            const yOffset = yZero * object.size.y;

            context.strokeStyle = '#00000088';
            context.lineWidth = 1;
            context.beginPath();
            for (let x = Math.ceil(xRange.x / gridSizing) * gridPixels.x; x <= object.size.x - xOffset + 0.1; x += gridPixels.x) {
                context.moveTo(x + xOffset, 0);
                context.lineTo(x + xOffset, object.size.y);
            }
            for (let y = Math.ceil(-yRange.y / gridSizing) * gridPixels.y; y <= object.size.y - yOffset + 0.1; y += gridPixels.y) {
                context.moveTo(0, y + yOffset);
                context.lineTo(object.size.x, y + yOffset);
            }
            context.stroke();

            // Draw the X-axis
            context.strokeStyle = '#f00';
            context.fillStyle = '#f00';
            context.lineWidth = 2;
            context.beginPath();
            context.moveTo(0                 , yZero * object.size.y    );
            context.lineTo(object.size.x - 20, yZero * object.size.y    );
            context.stroke();
            context.beginPath();
            context.lineTo(object.size.x - 20, yZero * object.size.y + 5);
            context.lineTo(object.size.x - 20, yZero * object.size.y - 5);
            context.lineTo(object.size.x     , yZero * object.size.y    );
            context.fill();

            context.font = '16px monospace, Consolas';
            context.textAlign = 'left';
            context.textBaseline = 'top';
            context.fillText(
                xRange.x.toString(),
                5, yZero * object.size.y + 5
            );
            context.textAlign = 'right';
            context.fillText(
                xRange.y.toString(),
                object.size.x - 5, yZero * object.size.y + 5
            );

            // Center text
            context.fillStyle = '#fff';
            context.textAlign = 'left';
            context.textBaseline = 'bottom';
            context.fillText(
                `${Math.min(Math.max(xRange.x, 0), xRange.y).toString()};${Math.min(Math.max(yRange.x, 0), yRange.y).toString()}`,
                xZero * object.size.x + 5, yZero * object.size.y - 5
            );

            // Draw the Y-axis
            context.strokeStyle = '#0f0';
            context.fillStyle = '#0f0';
            context.beginPath();
            if (invertYAxis) {
                context.moveTo(xZero * object.size.x    , object.size.y - 20);
                context.lineTo(xZero * object.size.x    , 0            );
                context.stroke();
                context.beginPath();
                context.lineTo(xZero * object.size.x + 5, 20           );
                context.lineTo(xZero * object.size.x - 5, 20           );
                context.lineTo(xZero * object.size.x    , 0            );
            } else {
                context.moveTo(xZero * object.size.x    , 0                 );
                context.lineTo(xZero * object.size.x    , object.size.y - 20);
                context.stroke();
                context.beginPath();
                context.lineTo(xZero * object.size.x + 5, object.size.y - 20);
                context.lineTo(xZero * object.size.x - 5, object.size.y - 20);
                context.lineTo(xZero * object.size.x    , object.size.y     );
            }
            context.fill();

            context.textAlign = 'right';
            context.textBaseline = 'top';
            context.fillText(
                invertYAxis ? yRange.y.toString() : yRange.x.toString(),
                xZero * object.size.x - 5, 5
            );
            context.textBaseline = 'bottom';
            context.fillText(
                invertYAxis ? yRange.x.toString() : yRange.y.toString(),
                xZero * object.size.x - 5, object.size.y - 5
            );

            context.restore();
        }
    }

}
