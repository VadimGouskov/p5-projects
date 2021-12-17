import p5 from 'p5';
import { FileClient, getCanvasImage } from 'p5-file-client';
import { Grid, GridPoint } from './grid';

const s = (p: p5) => {
    const CANVAS_WIDTH = 500;
    const CANVAS_HEIGHT = 500;

    const SHAPE_GRID_DENSITY = 20;
    const DOT_GRID_DENSITY = 40;
    const SHAPE_GRID_AMOUNT = 3;
    const DOT_GRID_AMOUNT = 2;

    // Should be minum 2 because the grid gets divided in quadrants for drawing the shape
    const MINIMUM_SLICE_WIDTH = 4;

    let fileClient: FileClient;
    let shapeGrid: Grid;
    let dotGrid: Grid;

    p.setup = () => {
        const canvas = p.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
        canvas.parent('sketch');
        p.ellipseMode(p.CENTER);
        p.colorMode(p.HSB, 360, 100, 100);
        p.noLoop();

        fileClient = new FileClient(
            undefined,
            undefined,
            '/home/vadim/Projects/creative-coding/p5-projects/open-grid/progress',
        );

        shapeGrid = new Grid(SHAPE_GRID_DENSITY, SHAPE_GRID_DENSITY, CANVAS_WIDTH, CANVAS_HEIGHT);
        dotGrid = new Grid(DOT_GRID_DENSITY, DOT_GRID_DENSITY, CANVAS_WIDTH, CANVAS_HEIGHT);
    };

    p.draw = () => {
        p.background(255);
        p.fill(0);

        p.push();
        p.fill('#ff0000');
        p.noStroke();
        // shapeGrid.draw((x: number, y: number) => p.ellipse(x, y, 1, 1));
        p.pop();

        p.fill('#0000ff');
        p.noStroke();

        // GRIDS
        Array(DOT_GRID_AMOUNT)
            .fill(0)
            .forEach(() => {
                const slicedGrid = randomGridSlice(dotGrid);

                p.fill(0, 0, 0);
                slicedGrid.draw((x: number, y: number) => p.ellipse(x, y, 3, 3));
            });
        // SHAPES
        Array(SHAPE_GRID_AMOUNT)
            .fill(0)
            .forEach(() => {
                p.fill(randomInt(0, 361), 100, 100);
                p.noStroke();
                const slicedGrid = randomGridSlice(shapeGrid);

                drawRandomShape(slicedGrid);
            });

        // EXPORT
        const image64 = getCanvasImage('sketch');
        fileClient.exportImage64(image64, '.png', 'open-grid');
    };

    const drawRandomShape = (grid: Grid) => {
        const q1 = getPointFromSlice(grid, 0, Math.floor(grid.amountY / 2), 0, Math.floor(grid.amountX / 2));
        const q2 = getPointFromSlice(
            grid,
            0,
            Math.floor(grid.amountY / 2),
            Math.floor(grid.amountX / 2) + 1,
            grid.amountX - 1,
        );
        const q3 = getPointFromSlice(
            grid,
            Math.floor(grid.amountY / 2),
            grid.amountY - 1,
            Math.floor(grid.amountX / 2) + 1,
            grid.amountX - 1,
        );
        const q4 = getPointFromSlice(
            grid,
            Math.floor(grid.amountY / 2),
            grid.amountY - 1,
            0,
            Math.floor(grid.amountX / 2),
        );

        p.beginShape();
        [q1, q2, q3, q4].forEach((point) => {
            p.vertex(point.x, point.y);
        });
        p.endShape(p.CLOSE);
    };

    const getPointFromSlice = (
        grid: Grid,
        startYIndex: number,
        stopYIndex: number,
        startXIndex: number,
        stopXIndex: number,
    ): GridPoint => {
        const slice = grid.slice(startYIndex, stopYIndex, startXIndex, stopXIndex);
        const slicedGrid = new Grid(slice[0].length, slice.length, 0, 0);
        slicedGrid.set(slice);
        const randomPoint = slicedGrid.getRandomPoint();
        return randomPoint;
    };

    const randomGridSlice = (grid: Grid): Grid => {
        // Get a portion a the grid to construct the shape
        // TODO better adjustable max width
        const indexYStart = randomInt(1, grid.amountY - 2 * MINIMUM_SLICE_WIDTH - 1);
        const indexYEnd = randomInt(indexYStart + MINIMUM_SLICE_WIDTH, grid.amountY - 1);
        const indexXStart = randomInt(1, grid.amountX - 2 * MINIMUM_SLICE_WIDTH - 1);
        const indexXEnd = randomInt(indexXStart + MINIMUM_SLICE_WIDTH, grid.amountX - 1);

        const slice = grid.slice(indexYStart, indexYEnd, indexXStart, indexXEnd);
        const slicedGrid = new Grid(slice[0].length, slice.length, 0, 0);
        slicedGrid.set(slice);
        return slicedGrid;
    };

    const randomInt = (min: number, max: number): number => {
        return Math.floor(Math.random() * (max - min)) + min;
    };

    p.mouseClicked = () => {
        p.redraw();
    };
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const myP5 = new p5(s);
