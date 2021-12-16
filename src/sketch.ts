import p5 from 'p5';
import { FileClient, getCanvasImage } from 'p5-file-client';
import { Grid, GridPoint } from './grid';

const s = (p: p5) => {
    const CANVAS_WIDTH = 500;
    const CANVAS_HEIGHT = 500;

    const MAIN_GRID_DENSITY = 41;
    const SHAPES_AMOUNT = 40;

    let fileClient: FileClient;
    let mainGrid: Grid;

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

        mainGrid = new Grid(MAIN_GRID_DENSITY, MAIN_GRID_DENSITY, CANVAS_WIDTH, CANVAS_HEIGHT);
    };

    p.draw = () => {
        p.background(255);
        p.fill(0);

        p.push();
        p.fill('#ff0000');
        p.noStroke();
        mainGrid.draw((x: number, y: number) => p.ellipse(x, y, 1, 1));
        p.pop();

        p.fill('#0000ff');
        p.noStroke();

        Array(SHAPES_AMOUNT)
            .fill(0)
            .forEach(() => {
                p.fill(randomInt(0, 361), 100, 100);
                const indexYStart = randomInt(0, mainGrid.amountY - 4 - 1);
                const indexYEnd = randomInt(indexYStart + 1, mainGrid.amountY - 1);
                const indexXStart = randomInt(0, mainGrid.amountX - 4 - 1);
                const indexXEnd = randomInt(indexXStart + 1, mainGrid.amountX - 1);
                debugger;
                const slice = mainGrid.slice(indexYStart, indexYEnd, indexXStart, indexXEnd);
                const slicedGrid = new Grid(slice.length, slice[0].length, 0, 0);
                slicedGrid.set(slice);

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
        const slicedGrid = new Grid(slice.length, slice[0].length, 0, 0);
        slicedGrid.set(slice);
        const randomPoint = slicedGrid.getRandomPoint();
        return randomPoint;
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
