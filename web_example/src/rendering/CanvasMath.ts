export class Vector2f {
    x: number;
    y: number;

    constructor(x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
    }

    set(x: number, y: number): Vector2f {
        this.x = x;
        this.y = y;
        return this;
    }

    add(other: Vector2f): Vector2f {
        return new Vector2f(this.x + other.x, this.y + other.y);
    }

    addInPlace(other: Vector2f): Vector2f {
        this.x += other.x;
        this.y += other.y;
        return this;
    }
    
    subtract(other: Vector2f): Vector2f {
        return new Vector2f(this.x - other.x, this.y - other.y);
    }

    subtractInPlace(other: Vector2f): Vector2f {
        this.x -= other.x;
        this.y -= other.y;
        return this;
    }

    multiply(scalar: number): Vector2f {
        return new Vector2f(this.x * scalar, this.y * scalar);
    }

    multiplyInPlace(scalar: number): Vector2f {
        this.x *= scalar;
        this.y *= scalar;
        return this;
    }

    scale(other: Vector2f): Vector2f {
        return new Vector2f(this.x * other.x, this.y * other.y);
    }

    lengthSquared(): number {
        return this.x * this.x + this.y * this.y;
    }

    length(): number {
        return Math.sqrt(this.lengthSquared());
    }

    normalize(): Vector2f {
        const len = this.length();
        if (len === 0) return new Vector2f(0, 0);
        return new Vector2f(this.x / len, this.y / len);
    }

    dot(other: Vector2f): number {
        return this.x * other.x + this.y * other.y;
    }

    clone(): Vector2f {
        return new Vector2f(this.x, this.y);
    }

    static zero(): Vector2f {
        return new Vector2f(0, 0);
    }

    static one(): Vector2f {
        return new Vector2f(1, 1);
    }
}