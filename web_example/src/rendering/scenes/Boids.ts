import { Vector2f } from "../CanvasMath.ts";
import { CanvasObject } from "../CanvasObject.ts";
import { CanvasScene } from "../CanvasScene.ts";
import { CanvasWrapper } from "../CanvasWrapper.ts";
import { Animator, Timer } from "../Sequences.ts";
import { Time } from "../Time.ts";

function lerp(start: number, end: number, t: number): number {
    return start + (end - start) * t;
}

class Agent {
    static readonly speed = 250;

    static readonly topLeftColor = { r: 200, g: 128, b: 255 };
    static readonly bottomRightColor = { r: 200, g: 255, b: 128 };

    position: Vector2f;
    rotation: number;

    constructor() {
        this.position = new Vector2f(Math.random() * 320 + 480, Math.random() * 180 + 270);
        this.rotation = Math.random() * 2 * Math.PI;
    }

    render(context: CanvasRenderingContext2D): void {
        context.save();
        context.translate(this.position.x, this.position.y);
        context.rotate(this.rotation);
        
        const tX = (this.position.x) / 1280;
        const tY = (this.position.y) / 720;
        const color = {
            r: lerp(Agent.topLeftColor.r, Agent.bottomRightColor.r, tX),
            g: lerp(Agent.topLeftColor.g, Agent.bottomRightColor.g, tY),
            b: lerp(Agent.topLeftColor.b, Agent.bottomRightColor.b, tX + tY)
        };
        context.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
        context.beginPath();
        context.moveTo( 10,  0);
        context.lineTo(-10,  7);
        context.lineTo( -5,  0);
        context.lineTo(-10, -7);
        context.fill();

        if (CanvasObject.debugMode) {
            context.strokeStyle = "#ff0000";
            context.beginPath();
            context.moveTo(0, 0);
            context.lineTo(50, 0);
            context.stroke();
        }

        context.restore();
    }
}

export class Boids extends CanvasScene {
    static readonly agentCount = 300;
    private agents: Agent[];

    static separationDistance = 40;
    static separationStrength = 0.25;
    
    static alignmentDistance = 140;
    static alignmentStrength = 0.3;
    
    static cohesionDistance = 200;
    static cohesionStrength = 0.07;

    override sequencers: {
        timer: Timer;
    } 

    constructor(wrapper: CanvasWrapper, context: CanvasRenderingContext2D, time: Readonly<Time>) {
        super(wrapper, context, time);

        this.agents = Array.from({ length: Boids.agentCount }, () => new Agent());
        this.sequencers = {
            timer: new Timer(this.time, 1 / 60)
        }
    }

    // Separation: steer away from nearby agents
    separation(agents: Agent[]): void {
        for (const agent of agents) {
            const steer = new Vector2f(0, 0);
            let count = 0;
            let closest = Infinity;
            for (const other of agents) {
                if (other === agent) continue;
                const distance = agent.position.subtract(other.position).length();
                if (distance < Boids.separationDistance && distance > 0) {
                    steer.addInPlace(
                        agent.position.subtract(other.position).normalize().multiplyInPlace(1 / distance)
                    );
                    count++;
                }
                if (distance < closest) {
                    closest = distance;
                }
            }
            if (count > 0) {
                steer.multiplyInPlace(1 / count);
                const desiredAngle = Math.atan2(steer.y, steer.x);
                let angleDiff = desiredAngle - agent.rotation;
                angleDiff = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff));
                // Stronger separation if closer than average
                agent.rotation += angleDiff * Boids.separationStrength;
            }
        }
    }
    
    // Alignment: steer toward average heading of neighbors
    alignment(agents: Agent[]): void {
        for (const agent of agents) {
            let avgRotation = 0;
            let count = 0;
            for (const other of agents) {
                if (other === agent) continue;
                const distance = agent.position.subtract(other.position).length();
                if (distance < Boids.alignmentDistance) {
                    avgRotation += other.rotation;
                    count++;
                }
            }
            if (count > 0) {
                avgRotation /= count;
                let angleDiff = avgRotation - agent.rotation;
                angleDiff = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff));
                agent.rotation += angleDiff * Boids.alignmentStrength;
            }
        }
    }
    
    // Cohesion: steer toward center of neighbors
    cohesion(agents: Agent[]): void {
        for (const agent of agents) {
            const center = new Vector2f(640, 360);
            let count = 1;
            for (const other of agents) {
                //if (other === agent) continue;
                const distance = agent.position.subtract(other.position).length();
                if (distance < Boids.cohesionDistance) {
                    center.addInPlace(other.position);
                    count++;
                }
            }
            if (count > 0) {
                center.multiplyInPlace(1 / count);
                const direction = center.subtract(agent.position).normalize();
                const desiredAngle = Math.atan2(direction.y, direction.x);
                let angleDiff = desiredAngle - agent.rotation;
                angleDiff = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff));
                agent.rotation += angleDiff * Boids.cohesionStrength;
            }
        }
    }

    bounds(): void {
        for (const agent of this.agents) {
            agent.position.x = (agent.position.x + 1280) % 1280;
            agent.position.y = (agent.position.y + 720) % 720;
        }
    }

    physics(delta: number): void {
        for (const agent of this.agents) {
            agent.position.addInPlace(
                new Vector2f(
                    Math.cos(agent.rotation),
                    Math.sin(agent.rotation)
                )
                .multiplyInPlace(Agent.speed * delta)
            );
        }
    }

    public override* sequence(): Generator<void> {
        while (true) {
            yield* Animator.run(this.sequencers.timer);
        
            this.separation(this.agents);
            this.alignment(this.agents);
            this.cohesion(this.agents);

            this.physics(1 / 60);
            this.bounds();
        }
    }

    public override render(): void {
        for (const agent of this.agents) {
            agent.render(this.context);
        }

        this.context.fillStyle = "#ffffff";
        this.context.font = "16px Consolas, monospace";
        this.context.textAlign = "left";
        this.context.textBaseline = "top";
        this.context.fillText(
            `Boids: ${this.agents.length}`,
            20, 20
        );
        this.context.fillText(
            `Separation: ${Boids.separationDistance.toFixed(1)} @ ${Boids.separationStrength.toFixed(2)}`,
            20, 40
        );
        this.context.fillText(
            `Alignment: ${Boids.alignmentDistance.toFixed(1)} @ ${Boids.alignmentStrength.toFixed(2)}`,
            20, 60
        );
        this.context.fillText(
            `Cohesion: ${Boids.cohesionDistance.toFixed(1)} @ ${Boids.cohesionStrength.toFixed(2)}`,
            20, 80
        );
    }
}