import { Vector2f } from "../CanvasMath.ts";
import { CanvasObject } from "../CanvasObject.ts";
import { CanvasScene } from "../CanvasScene.ts";
import { CanvasWrapper } from "../CanvasWrapper.ts";
import { Time } from "../Time.ts";

function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

function lerp(start: number, end: number, t: number): number {
    return start + (end - start) * t;
}

function hsv2rgb(h: number, s: number, v: number): [number, number, number] {
    const f = (n: number, k = (n + h / 60) % 6) => v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
    return [f(5), f(3), f(1)];
}   

const topLeftColor = { r: 200, g: 128, b: 255 };
const bottomRightColor = { r: 200, g: 255, b: 128 };

const agentCount = 500;
const rotationSpeedLimit = Math.PI * 4; // radians per second

const movementSpeed = 300;
const visionRange = 100;
const alignmentRange = 40;
const cohesionRange = 60;
const boundsAvoidanceDistance = 200;

function boidRenderer(resolution: Vector2f, grid: SpatialGrid): (object: CanvasObject, context: CanvasRenderingContext2D) => void {
    return (object: CanvasObject, context: CanvasRenderingContext2D) => {
        // Object space
        
        const tX = (object.position.x) / resolution.x;
        const tY = (object.position.y) / resolution.y;
        const posColor = {
            r: lerp(topLeftColor.r, bottomRightColor.r, tX),
            g: lerp(topLeftColor.g, bottomRightColor.g, tY),
            b: lerp(topLeftColor.b, bottomRightColor.b, tX + tY)
        };
        const rotColor = hsv2rgb(
            object.rotation / Math.PI * 360,
            1.0,
            1.0
        );
        const color = {
            r: lerp(posColor.r, rotColor[0] * 256, 0.25),
            g: lerp(posColor.g, rotColor[1] * 256, 0.25),
            b: lerp(posColor.b, rotColor[2] * 256, 0.25)
        };
        context.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
        context.beginPath();
        context.moveTo( 10,  0);
        context.lineTo(-10,  7);
        context.lineTo( -5,  0);
        context.lineTo(-10, -7);
        context.fill();

        if (CanvasObject.debugMode) {
            context.save();
            context.rotate(-object.rotation);

            // Screen space

            const neighbours = grid.getObjectsInRange(object.position.x, object.position.y, visionRange);
            context.strokeStyle = "#ff0000";
            for (const neighbour of neighbours) {
                if (neighbour === object) continue;
                const line = neighbour.position.subtract(object.position);
                if (line.length() > visionRange) continue;
                context.beginPath();
                context.moveTo(0, 0);
                context.lineTo(line.x, line.y);
                context.stroke();
            }

            context.restore();

            // Object space

            context.strokeStyle = "#00ff00";
            context.lineWidth = 2;
            
            context.beginPath();
            context.moveTo(0, 0);
            context.lineTo(50, 0);
            context.arc(0, 0, visionRange, 0, Math.PI * 2);
            context.stroke();
        }
    }
}

/**
 * SpatialGrid partitions the 2D space into a grid of cells to enable efficient neighbor queries.
 * Each cell contains a list of CanvasObjects, allowing fast lookup of nearby agents for boid behaviors.
 */
class SpatialGrid {
    // First index is row, second index is column, third index is the list of objects in that cell
    private grid: CanvasObject[][][] = [];
    private resolution: Vector2f;
    private cellCount: number;
    private cellSize: Vector2f;

    constructor(cellCount: number, resolution: Vector2f) {
        this.resolution = resolution;
        this.cellCount = cellCount;
        this.cellSize = new Vector2f(
            resolution.x / cellCount,
            resolution.y / cellCount
        );
        
        for (let i = 0; i < cellCount; i++) {
            // Initialize each row of the grid
            this.grid[i] = [];

            // Initialize each cell in the row
            for (let j = 0; j < cellCount; j++) {
                this.grid[i][j] = [];
            }
        }
    }

    public add(object: CanvasObject): void {
        // Calculate the grid cell index based on the object's position
        const x = Math.floor(object.position.x / (this.resolution.x / this.cellCount));
        const y = Math.floor(object.position.y / (this.resolution.y / this.cellCount));

        // Ensure the indices are within bounds
        if (x >= 0 && x < this.cellCount && y >= 0 && y < this.cellCount) {
            // Add the object to the appropriate cell
            this.grid[y][x].push(object);
        }
    }

    public getObjectsInCell(x: number, y: number): CanvasObject[] {
        // Ensure the indices are within bounds
        if (x < 0 || x >= this.cellCount || y < 0 || y >= this.cellCount) {
            return [];
        }
        // Return the objects in the specified cell
        return this.grid[y][x] || [];
    }

    public getObjectsInRange(x: number, y: number, range: number): CanvasObject[] {
        const objects: CanvasObject[] = [];

        // Calculate the range in terms of grid cells
        const startX = Math.max(0, Math.floor((x - range) / this.cellSize.x));
        const endX = Math.min(this.cellCount - 1, Math.ceil((x + range) / this.cellSize.x));
        const startY = Math.max(0, Math.floor((y - range) / this.cellSize.y));
        const endY = Math.min(this.cellCount - 1, Math.ceil((y + range) / this.cellSize.y));
        // Iterate through the relevant cells
        for (let i = startY; i <= endY; i++) {
            for (let j = startX; j <= endX; j++) {
                // Add the objects in the current cell to the result
                objects.push(...this.grid[i][j]);
            }
        }
        return objects;
    }

    public clear(): void {
        // Clear the grid by reinitializing it
        for (let i = 0; i < this.cellCount; i++) {
            for (let j = 0; j < this.cellCount; j++) {
                this.grid[i][j] = [];
            }
        }
    }

    public debugRender(context: CanvasRenderingContext2D): void {
        const cellSizeX = this.resolution.x / this.cellCount;
        const cellSizeY = this.resolution.y / this.cellCount;
        context.strokeStyle = "#000000";
        context.lineWidth = 1;

        context.beginPath();
        for (let i = 1; i < this.cellCount; i++) {
            context.moveTo(i * cellSizeX, 0);
            context.lineTo(i * cellSizeX, this.resolution.y);
            context.moveTo(0, i * cellSizeY);
            context.lineTo(this.resolution.x, i * cellSizeY);
        }
        context.stroke();
    }
}

interface RotationResult {
    steeringVector: Vector2f;
    strength: number;
}

export class Boids extends CanvasScene {    
    private grid: SpatialGrid;
    private agents: CanvasObject[];
    private newRotations: Float32Array = new Float32Array(agentCount);

    private debugAgent: CanvasObject | null = null;

    constructor(wrapper: CanvasWrapper, context: CanvasRenderingContext2D, time: Readonly<Time>) {
        super(wrapper, context, time);

        this.grid = new SpatialGrid(Math.ceil(Math.sqrt(agentCount)), wrapper.resolution);

        const x = Math.ceil(Math.sqrt(agentCount * wrapper.resolution.x / wrapper.resolution.y));
        const y = Math.ceil(agentCount / x);
        const cellSize = wrapper.resolution.x / x;
        console.log(`Boids grid: ${x} x ${y} (${agentCount} agents)`);

        const renderer = boidRenderer(wrapper.resolution, this.grid);
        this.agents = Array.from({ length: agentCount }, (_, index) => {
            const object = new CanvasObject(
                renderer,
                new Vector2f(
                    (index % x) * (wrapper.resolution.x / x) + cellSize / 2,
                    Math.floor(index / x) * (wrapper.resolution.y / y) + cellSize / 2
                ),
                new Vector2f( 20,  20),
                Vector2f.one(),
                new Vector2f(0.5, 0.5),
                Math.random() * Math.PI * 2,
            );
            this.grid.add(object);
            return object;
        });

        this.debugAgent = this.agents[Math.floor(Math.random() * this.agents.length)];
    }

    private turnAwayFromBounds(agent: CanvasObject): RotationResult {
        const bounds = this.wrapper.resolution;
        const position = agent.position;

        let steeringVector = new Vector2f(0, 0);
        let strength = 0;
        
        if (position.x < boundsAvoidanceDistance) {
            steeringVector.x = 1;
            strength += boundsAvoidanceDistance - position.x;   
        } else if (position.x > bounds.x - boundsAvoidanceDistance) {
            steeringVector.x = -1;
            strength += position.x - (bounds.x - boundsAvoidanceDistance);
        }

        if (position.y < boundsAvoidanceDistance) {
            steeringVector.y = 1;
            strength += boundsAvoidanceDistance - position.y;
        } else if (position.y > bounds.y - boundsAvoidanceDistance) {
            steeringVector.y = -1;
            strength += position.y - (bounds.y - boundsAvoidanceDistance);
        }

        steeringVector = steeringVector.normalize();

        return {
            steeringVector: new Vector2f(
                steeringVector.x,
                steeringVector.y
            ),
            strength: Math.pow(strength / boundsAvoidanceDistance, 2)
        };
    }

    private separate(agent: CanvasObject, neighbours: CanvasObject[]): RotationResult {
        const separationVector = new Vector2f(0, 0);
        let closestDistance = Infinity;
        let count = 0;

        for (const neighbour of neighbours) {
            if (neighbour === agent) continue;
            const offset = agent.position.subtract(neighbour.position);
            const distance = offset.length();
            if (distance < visionRange && distance > 0) {
                if (distance < closestDistance) {
                    closestDistance = distance;
                }
                // Weight by inverse distance
                separationVector.addInPlace(offset.normalize().multiply(1 / distance));
                count++;
            }
        }

        let separationRotation = 0;
        let separationStrength = 0;

        if (count > 0) {
            separationRotation = Math.atan2(separationVector.y, separationVector.x);
            separationStrength = Math.max(0, visionRange - closestDistance) / visionRange;
        }

        return {
            steeringVector: new Vector2f(
                Math.cos(separationRotation),
                Math.sin(separationRotation)
            ),
            strength: Math.pow(separationStrength, 4)
        };
    }

    private align(agent: CanvasObject, neighbours: CanvasObject[]): RotationResult {
        const alignmentVector = new Vector2f(0, 0);
        let count = 0;
        for (const neighbour of neighbours) {
            if (neighbour === agent) continue;
            const offset = neighbour.position.subtract(agent.position);
            const distance = offset.length();
            if (distance < alignmentRange && distance > 0) {
                alignmentVector.addInPlace(new Vector2f(
                    Math.cos(neighbour.rotation),
                    Math.sin(neighbour.rotation)
                ));
                count++;
            }
        }

        let alignmentRotation = agent.rotation;
        let alignmentStrength = 0;

        if (count > 0) {
            alignmentVector.multiplyInPlace(1 / count);
            alignmentRotation = Math.atan2(alignmentVector.y, alignmentVector.x);
            alignmentStrength = 1;
        }

        return {
            steeringVector: new Vector2f(
                Math.cos(alignmentRotation),
                Math.sin(alignmentRotation)
            ),
            strength: Math.pow(alignmentStrength, 2)
        };
    }

    private cohere(agent: CanvasObject, neighbours: CanvasObject[]): RotationResult {
        const cohesionVector = new Vector2f(0, 0);
        let count = 0;

        for (const neighbour of neighbours) {
            if (neighbour === agent) continue;
            const offset = neighbour.position.subtract(agent.position);
            const distance = offset.length();
            if (distance < cohesionRange && distance > 0) {
                cohesionVector.addInPlace(neighbour.position);
                count++;
            }
        }

        let cohesionRotation = agent.rotation;
        let cohesionStrength = 0;
        if (count > 0) {
            cohesionVector.multiplyInPlace(1 / count);
            cohesionVector.subtractInPlace(agent.position);
            cohesionRotation = Math.atan2(cohesionVector.y, cohesionVector.x);
            // More neighbours the merrier
            cohesionStrength = (1 - (1 / count)) * 0.5; 
        }

        return {
            steeringVector: new Vector2f(
                Math.cos(cohesionRotation),
                Math.sin(cohesionRotation)
            ),
            strength: Math.pow(cohesionStrength, 2)
        };
    }
        
    private moveAgents(time: Readonly<Time>): void {
        for (const agent of this.agents) {
            const velocity = new Vector2f(
                Math.cos(agent.rotation) * movementSpeed * time.delta,
                Math.sin(agent.rotation) * movementSpeed * time.delta
            );
            agent.position.addInPlace(velocity);

            agent.position.x = clamp(agent.position.x, 0, this.wrapper.resolution.x);
            agent.position.y = clamp(agent.position.y, 0, this.wrapper.resolution.y);
        }
    }

    public override render(): void {
        if (CanvasObject.debugMode) {
            this.grid.debugRender(this.context);
        }

        for (let i = 0; i < this.agents.length; i++) {
            const agent = this.agents[i];
            const neighbours = this.grid.getObjectsInRange(agent.position.x, agent.position.y, visionRange);

            const awayRotation       = this.turnAwayFromBounds(agent);
            const separationRotation = this.separate(agent, neighbours);
            const alignmentRotation  = this.align(agent, neighbours);
            const cohesionRotation   = this.cohere(agent, neighbours);

            // Weighted average of steering vectors
            let steering = awayRotation.steeringVector.multiply(awayRotation.strength)
                .add(separationRotation.steeringVector.multiply(separationRotation.strength))
                .add(alignmentRotation.steeringVector.multiply(alignmentRotation.strength))
                .add(cohesionRotation.steeringVector.multiply(cohesionRotation.strength));

            if (steering.length() === 0) {
                steering = new Vector2f(Math.cos(agent.rotation), Math.sin(agent.rotation));
            } else {
                steering = steering.normalize();
            }

            const newAngle = Math.atan2(steering.y, steering.x);

            // Shortest angle difference (wrap between -PI and PI)
            let rotationDifference = newAngle - agent.rotation;
            rotationDifference = Math.atan2(Math.sin(rotationDifference), Math.cos(rotationDifference));

            const limitedRotation = clamp(
                rotationDifference,
                -rotationSpeedLimit * this.time.delta,
                rotationSpeedLimit  * this.time.delta
            );
            this.newRotations[i] = (agent.rotation + limitedRotation + Math.PI * 2) % (Math.PI * 2);
        }

        for (let i = 0; i < this.agents.length; i++) {
            const agent = this.agents[i];
            agent.rotation = this.newRotations[i];
        }

        this.moveAgents(this.time);

        this.grid.clear();
        for (const agent of this.agents) {
            this.grid.add(agent);
        }
            
        
        for (const agent of this.agents) {
            const wasDebugMode = CanvasObject.debugMode;
            if (wasDebugMode && this.debugAgent !== agent) {
                CanvasObject.setDebugMode(false);
            }

            agent.render(this.context);

            CanvasObject.setDebugMode(wasDebugMode);
        }
    }
}