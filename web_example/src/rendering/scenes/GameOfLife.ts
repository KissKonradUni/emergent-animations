import { CanvasManualTexture } from "../CanvasImageTexture.ts";
import { CanvasScene } from "../CanvasScene.ts";
import { CanvasWrapper } from "../CanvasWrapper.ts";
import { Sequence, Timer } from "../Sequences.ts";
import { Time } from "../Time.ts";

export class GameOfLife extends CanvasScene {
    private grid: CanvasManualTexture;
    private imageData: ImageData;

    private timer: Timer;

    private cols: number;
    private rows: number;

    constructor(wrapper: CanvasWrapper, context: CanvasRenderingContext2D, time: Readonly<Time>) {
        super(wrapper, context, time);

        const resolution = wrapper.resolution;
        const cellSize = 8;
        this.cols = Math.floor(resolution.x / cellSize);
        this.rows = Math.floor(resolution.y / cellSize);

        this.grid = new CanvasManualTexture(this.cols, this.rows);
        this.imageData = this.grid.imageData;

        this.timer = new Timer(time, 1 / 30);

        // Initialize a random grid
        const imageGrid = this.imageData;

        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                imageGrid.data[(row * this.cols + col) * 4    ] = 0; // R
                imageGrid.data[(row * this.cols + col) * 4 + 1] = 0; // G
                imageGrid.data[(row * this.cols + col) * 4 + 2] = 0; // B
                imageGrid.data[(row * this.cols + col) * 4 + 3] = Math.random() < 0.5 ? 255 : 0; // A
            }
        }

        this.grid.imageData = imageGrid;
    }
    
    public override* sequence(): Generator<void> {
        while (true) {
            this.updateGrid();
            
            yield* Sequence.run(this.timer);
        }
    }

    public override render(): void {
        const context = this.context;

        context.fillStyle = "#ff5722";
        context.fillRect(0, 0, this.wrapper.resolution.x, this.wrapper.resolution.y);

        context.imageSmoothingEnabled = false;
        context.drawImage(this.grid.getCanvas(), 0, 0, this.wrapper.resolution.x, this.wrapper.resolution.y);
    }

    private updateGrid(): void {
        // Map to a boolean array for easier neighbor counting
        // plus cloning the image data to avoid modifying it directly
        const currentGrid: boolean[] = Array.from(this.grid.imageData.data.filter((_, index) => index % 4 === 3)).map(value => { return value > 0 });

        for (let i = 0; i < currentGrid.length; i++) {
            const row = Math.floor(i / this.cols);
            const col = i % this.cols;

            const aliveNeighbors = this.countAliveNeighbors(currentGrid, row, col);
            const isAlive = currentGrid[i];

            if (isAlive) {
                // Any live cell with two or three live neighbors survives.
                if (aliveNeighbors < 2 || aliveNeighbors > 3) {
                    this.imageData.data[i * 4 + 3] = 0; // Set alpha to 0 (dead)
                } else {
                    this.imageData.data[i * 4 + 3] = 255; // Stay alive
                }
            } else {
                // Any dead cell with exactly three live neighbors becomes a live cell.
                if (aliveNeighbors === 3) {
                    this.imageData.data[i * 4 + 3] = 255; // Set alpha to 255 (alive)
                } else {
                    this.imageData.data[i * 4 + 3] = 0; // Stay dead
                }
            }
        }

        this.grid.imageData = this.imageData;
    }

    private countAliveNeighbors(grid: boolean[], row: number, col: number): number {
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [ 0, -1],          [ 0, 1],
            [ 1, -1], [ 1, 0], [ 1, 1]
        ];
        let count = 0;

        for (const [dx, dy] of directions) {
            const newRow = row + dx;
            const newCol = col + dy;
            if (newRow >= 0 && newRow < this.rows && newCol >= 0 && newCol < this.cols) {
                const index = newRow * this.cols + newCol;
                if (grid[index]) {
                    count++;
                }
            }
        }

        return count;
    }
}