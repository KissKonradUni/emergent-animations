import { Vector2f } from "./CanvasMath.ts";
import { CanvasObject } from "./CanvasObject.ts";
import { CanvasWrapper } from "./CanvasWrapper.ts";

class MouseButtonState {
    private _isDown: boolean = false;
    private _wasDown: boolean = false;

    private _justPressed: boolean = false;
    private _justReleased: boolean = false;

    constructor() {}

    public update(pressed: boolean = this._isDown): void {
        this._isDown = pressed;
        if (this._isDown) {
            this._justPressed = !this._wasDown;
            this._justReleased = false;
        } else {
            this._justPressed = false;
            this._justReleased = !this._wasDown;
        }
        this._wasDown = this._isDown;
    }

    public isDown(): boolean {
        return this._isDown;
    }

    public isPressed(): boolean {
        return this._justPressed;
    }

    public isReleased(): boolean {
        return this._justReleased;
    }
}

export abstract class UIElement {
    private static _idCounter: number = 0;
    public id: number = UIElement._idCounter++;

    public position: Vector2f;
    public size: Vector2f;
    public visible: boolean = true;
    public autoPosition: boolean = false;

    constructor(size: Vector2f, position: Vector2f = new Vector2f(-1, -1)) {
        this.position = position;
        this.size = size;
        if (this.position.x < 0 || this.position.y < 0) {
            this.autoPosition = true;
            this.position = new Vector2f(0, 0);
        }
    }

    public abstract render(ui: CanvasUI, context: CanvasRenderingContext2D, offset: Vector2f): void;
}

export class UIContainer extends UIElement {
    private _children: UIElement[] = [];

    constructor(size: Vector2f, position: Vector2f) {
        super(size, position);
        this.autoPosition = false;
    }

    public addChild(child: UIElement): void {
        this._children.push(child);
    }

    public removeChild(child: UIElement): void {
        const index = this._children.indexOf(child);
        if (index !== -1) {
            this._children.splice(index, 1);
        }
    }

    public render(ui: CanvasUI, context: CanvasRenderingContext2D, offset: Vector2f = Vector2f.zero()): void {
        if (!this.visible) return;
        
        context.save();
        context.translate(this.position.x, this.position.y);

        context.fillStyle = "#88888888";
        context.beginPath();
        context.roundRect(0, 0, this.size.x, this.size.y, 4);
        context.fill();

        let offsetY = 0;
        for (const child of this._children) {
            if (child.autoPosition) {
                child.position.x = 10;
                child.position.y = offsetY + 10;
                offsetY += child.size.y + 10;
            }
            
            child.render(ui, context, offset.add(this.position));
        }
        context.restore();
    }
}

export class UIButton extends UIElement {
    private _text: string;
    private _onClick: () => void;

    constructor(parent: UIContainer, text: string, onClick: () => void) {
        super(new Vector2f(parent.size.x - 20, Math.min(32, parent.size.y - 20)));
        parent.addChild(this);
        this._text = text;
        this._onClick = onClick;
    }

    public render(ui: CanvasUI, context: CanvasRenderingContext2D, offset: Vector2f = Vector2f.zero()): void {
        if (!this.visible) return;

        let isHovered = false;
        let isClicked = false;

        // Handle mouse
        if (ui.mouseInRect(this.position.add(offset), this.size)) {
            isHovered = true;
            if (ui.mouseButtons.left.isDown()) {
                isClicked = true;
                if (ui.mouseButtons.left.isPressed()) {
                    this._onClick();
                }
            }
        }

        context.save();
        const center = this.position.add(this.size.multiply(0.5));
        context.translate(center.x, center.y);
        context.fillStyle = isClicked ? "#7799cc88" : isHovered ? "#99ccff88" : "#cccccc88";
        context.beginPath();
        const scale = isClicked ? 0.98 : isHovered ? 1.02 : 1.0;
        context.scale(scale, scale);
        context.roundRect(-this.size.x / 2, -this.size.y / 2, this.size.x, this.size.y, 4);
        context.fill();

        context.fillStyle = "#222";
        context.font = "16px Noto Sans";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(this._text, 0, 1);
        context.restore();
    }
}

export class UILabel extends UIElement {
    private _text: () => string;

    constructor(parent: UIContainer, text: () => string) {
        super(new Vector2f(parent.size.x - 20, 20));
        parent.addChild(this);
        this._text = text;
    }

    public render(_ui: CanvasUI, context: CanvasRenderingContext2D, _offset: Vector2f = Vector2f.zero()): void {
        if (!this.visible) return;

        context.save();
        context.translate(this.position.x, this.position.y);
        context.fillStyle = "#ccc";
        context.font = "16px Noto Sans";
        context.textAlign = "left";
        context.textBaseline = "middle";
        context.fillText(this._text(), 0, this.size.y / 2);
        context.restore();
    }
}

export class UITrackBar extends UIElement {
    private _value: number;
    private _min: number;
    private _max: number;
    private _onChange: (value: number) => void;
    private _dragging: boolean = false;

    constructor(parent: UIContainer, min: number, max: number, initialValue: number, onChange: (value: number) => void) {
        super(new Vector2f(parent.size.x - 20, 40));
        parent.addChild(this);
        this._min = min;
        this._max = max;
        this._value = initialValue;
        this._onChange = onChange;
    }

    public get value(): number {
        return this._value;
    }

    public set value(newValue: number) {
        this._value = Math.max(this._min, Math.min(this._max, newValue));
        this._onChange(this._value);
    }

    public render(ui: CanvasUI, context: CanvasRenderingContext2D, offset: Vector2f = Vector2f.zero()): void {
        if (!this.visible) return;

        let isHovered = false;

        // Handle mouse
        if (ui.mouseInRect(this.position.add(offset), this.size)) {
            isHovered = true;
            if (ui.mouseButtons.left.isPressed()) {
                this._dragging = true;
            }
        }

        if (this._dragging) {
            // Check if mouse is released
            if (ui.mouseButtons.left.isReleased()) {
                this._dragging = false;
            }

            // Update value based on mouse position
            const domainStart = this.position.x + offset.x;
            const domainEnd = this.position.x + offset.x + this.size.x;
            const mouseX = ui.transformedMousePosition.x;
            this.value = this._min + (mouseX - domainStart) / (domainEnd - domainStart) * (this._max - this._min);
        }

        // Draw track
        context.save();
        const center = this.position.add(this.size.multiply(0.5));
        context.translate(center.x, center.y);
        context.fillStyle = "#cccccc88";
        context.beginPath();
        context.roundRect(-this.size.x / 2, -this.size.y / 2 * 0.5, this.size.x, this.size.y * 0.25, 4);
        context.fill();

        // Draw value text
        const precision = this._max <= 10 ? 2 : 0; // Show 2 decimal places for small values, otherwise 0

        context.fillStyle = "#222";
        context.font = "16px Noto Sans";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(this.value.toFixed(precision), 0, 16);

        // Draw end points
        context.textAlign = "left";
        context.fillText(this._min.toFixed(precision), -this.size.x / 2 + 4, 16);
        context.textAlign = "right";
        context.fillText(this._max.toFixed(precision),  this.size.x / 2 - 4, 16);

        // Draw thumb
        const thumbX = -this.size.x / 2 + (this.value - this._min) / (this._max - this._min) * this.size.x;
        context.fillStyle = this._dragging ? "#7799cc" : isHovered ? "#99ccff" : "#cccccc";
        context.beginPath();
        context.roundRect(thumbX - 4, -this.size.y / 2, 8, this.size.y * 0.75, 4);
        context.fill();

        context.restore();
    }
}

export class CanvasUI {
    private _realMousePosition: Vector2f        = new Vector2f(-1, -1);
    public get realMousePosition(): Readonly<Vector2f> { return this._realMousePosition; }
    private _transformedMousePosition: Vector2f = new Vector2f(-1, -1);
    public get transformedMousePosition(): Readonly<Vector2f> { return this._transformedMousePosition; }

    private _dpiScale: number = globalThis.devicePixelRatio || 1;

    private _mouseButtons: { left: MouseButtonState, middle: MouseButtonState, right: MouseButtonState } = {
        left: new MouseButtonState(),
        middle: new MouseButtonState(),
        right: new MouseButtonState(),
    };
    public get mouseButtons(): Readonly<{ left: MouseButtonState, middle: MouseButtonState, right: MouseButtonState }> {
        return this._mouseButtons;
    }

    private _wrapper: CanvasWrapper;
    private _canvas: HTMLCanvasElement;
    private _context: CanvasRenderingContext2D;

    private _elements: UIElement[] = [];

    public addElement(element: UIElement): void {
        this._elements.push(element);
    }

    constructor(wrapper: CanvasWrapper, canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
        this._wrapper = wrapper;
        this._canvas = canvas;
        this._context = context;

        this._canvas.addEventListener("mousemove", this.onMouseMove.bind(this));
        this._canvas.addEventListener("mouseleave", () => {
            this._realMousePosition.x = -1;
            this._realMousePosition.y = -1;

            this._transformedMousePosition.x = -1;
            this._transformedMousePosition.y = -1;

            this._mouseButtons.left.update(false);
            this._mouseButtons.middle.update(false);
            this._mouseButtons.right.update(false);
        });
        this._canvas.addEventListener("mousedown", (event) => this.onMouseChange(event, true));
        this._canvas.addEventListener("mouseup", (event) => this.onMouseChange(event, false));
    }

    private onMouseMove(event: MouseEvent): void {
        this._realMousePosition.x = event.offsetX * this._dpiScale;
        this._realMousePosition.y = event.offsetY * this._dpiScale;

        this._transformedMousePosition.x = (this._realMousePosition.x - this._wrapper.offset.x) / this._wrapper.scale;
        this._transformedMousePosition.y = (this._realMousePosition.y - this._wrapper.offset.y) / this._wrapper.scale;
    }

    private onMouseChange(event: MouseEvent, state: boolean): void {
        switch (event.button) {
            case 0:
                this._mouseButtons.left.update(state); return;
            case 1:
                this._mouseButtons.middle.update(state); return;
            case 2:
                this._mouseButtons.right.update(state); return;
        }
    }

    public render(): void {
        for (const element of this._elements) {
            element.render(this, this._context, Vector2f.zero());
        }

        this._mouseButtons.left.update();
        this._mouseButtons.middle.update();
        this._mouseButtons.right.update();

        if (!CanvasObject.debugMode)
            return;

        const resolution = this._wrapper.resolution;

        this._context.fillStyle = "rgba(0, 0, 0, 0.25)";
        this._context.fillRect(0, resolution.y - 135, resolution.x, 135);

        this._context.fillStyle = "white";
        this._context.font = "16px monospace, Consolas";
        this._context.textAlign = "left";
        this._context.textBaseline = "top";
        this._context.fillText(`Client Size: (${this._wrapper.clientSize.x}, ${this._wrapper.clientSize.y}) x ${this._dpiScale}`, 10, resolution.y - 25);
        this._context.fillText(`Working Resolution: (${resolution.x}, ${resolution.y})`, 10, resolution.y - 50);
        this._context.fillText(`Real Mouse Position: (${this._realMousePosition.x.toFixed(2)}, ${this._realMousePosition.y.toFixed(2)})`, 10, resolution.y - 75);
        this._context.fillText(`Mouse Position: (${this._transformedMousePosition.x.toFixed(2)}, ${this._transformedMousePosition.y.toFixed(2)})`, 10, resolution.y - 100);
        this._context.fillText(`Scale: ${this._wrapper.scale.toFixed(2)}, Offset: (${this._wrapper.offset.x.toFixed(2)}, ${this._wrapper.offset.y.toFixed(2)})`, 10, resolution.y - 125);
    }

    public mouseInRect(position: Vector2f, size: Vector2f): boolean {
        return (
            this._transformedMousePosition.x >= position.x &&
            this._transformedMousePosition.x <= position.x + size.x &&
            this._transformedMousePosition.y >= position.y &&
            this._transformedMousePosition.y <= position.y + size.y
        );
    }

}