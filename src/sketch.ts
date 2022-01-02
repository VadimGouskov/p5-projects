import p5 from 'p5';
import { FileClient, getCanvasImage } from 'p5-file-client';
import { Grid, GridPoint } from './grid';

const s = (p: p5) => {
    const CANVAS_WIDTH = 1000;
    const CANVAS_HEIGHT = 1000;

    const SHAPE_GRID_DENSITY = 20;
    const DOT_GRID_DENSITY = 40;
    const TRIANGLE_GRID_DENSITY = 20;

    const SHAPE_GRID_AMOUNT = 3;

    const LINE_THICKNESS = 20;
    const TRIANGLE_SIZE = CANVAS_WIDTH / TRIANGLE_GRID_DENSITY / 2;
    const TRIANGLE_CUTTOF = 0.45;
    const TRIANGLE_NOISE_ATTENUATION = 200;

    let fileClient: FileClient;
    let shapeGrid: Grid;
    let dotGrid: Grid;
    let triangleGrid: Grid;

    let bgImage: p5.Image;

    let colors: string[] = [];

    p.preload = () => {
        bgImage = p.loadImage('http://localhost:3000/havenhuis.jpg');
    };

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
        triangleGrid = new Grid(TRIANGLE_GRID_DENSITY, TRIANGLE_GRID_DENSITY, CANVAS_WIDTH, CANVAS_HEIGHT);

        shapeGrid.setRandomFunction(p.random);
        dotGrid.setRandomFunction(p.random);
    };

    p.draw = () => {
        const randomSeed = randomInt(0, 1000000);
        // randomSeed = 868799;
        p.randomSeed(randomSeed);
        p.noiseSeed(randomSeed);
        console.log(randomSeed);

        p.background(255);

        p.fill('#0000ff');
        p.noStroke();

        //https://coolors.co/3c4d61-6e0d25-ffa9e7-ff8966-ff3864
        colors = ['#3C4D61', '#6E0D25', '#FFA9E7', '#FF8966', '#FF3864'];

        // DRAW
        triangleGrid.draw(drawTriangle);
        // drawDots();
        drawColorShapes();
        drawImageShape();

        // EXPORT
        const image64 = getCanvasImage('sketch');
        fileClient.exportImage64(image64, '.png', `open-grid-seed${randomSeed}`);
    };

    const getRandomShape = (grid: Grid): Array<GridPoint> => {
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

        return [q1, q2, q3, q4];
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
        // slicedGrid.setRandomFunction(p.random);
        const randomPoint = getRandomGridPoint(slicedGrid);
        return randomPoint;
    };

    const randomGridSlice = (
        grid: Grid,
        {
            minWidth,
            maxWidth,
            minHeight,
            maxHeight,
        }: {
            minWidth: number;
            maxWidth: number;
            minHeight: number;
            maxHeight: number;
        },
    ): Grid => {
        // Get a portion a the grid to construct the shape
        // TODO better adjustable max width
        const indexYStart = randomInt(1, grid.amountY - minHeight - 1);
        const indexYMinEnd = indexYStart + minHeight;
        const indexYMaxEnd = Math.min(indexYStart + maxHeight, grid.amountY - 1);
        const indexYEnd = randomInt(indexYMinEnd, indexYMaxEnd);

        const indexXStart = randomInt(1, grid.amountX - minWidth - 1);
        const indexXMinEnd = indexXStart + minWidth;
        const indexXMaxEnd = Math.min(indexXStart + maxWidth, grid.amountX - 1);
        const indexXEnd = randomInt(indexXMinEnd, indexXMaxEnd);

        const slice = grid.slice(indexYStart, indexYEnd, indexXStart, indexXEnd);
        const slicedGrid = new Grid(slice[0].length, slice.length, 0, 0);
        slicedGrid.set(slice);
        return slicedGrid;
    };

    // GRAPHICS
    const drawLineBG = (grapics: p5.Graphics): p5.Graphics => {
        const hue = randomInt(0, 361);
        // grapics.background(hue, 50, 100);
        grapics.fill(hue, 100, 100);
        grapics.noStroke();
        iterator(Math.floor(grapics.height / LINE_THICKNESS), (index: number) => {
            grapics.rect(0, 2 * index * LINE_THICKNESS, grapics.width, LINE_THICKNESS);
        });
        return grapics;
    };

    const getRandomGridPoint = (grid: Grid): GridPoint => {
        const xIndex = Math.floor(p.random() * (grid.amountX - 1));
        const yIndex = Math.floor(p.random() * (grid.amountY - 1));

        return grid.get()[yIndex][xIndex];
    };

    const drawTriangle = (x: number, y: number) => {
        const noise = p.noise(x / TRIANGLE_NOISE_ATTENUATION, y / TRIANGLE_NOISE_ATTENUATION);
        if (noise > TRIANGLE_CUTTOF) return;

        const color = randomInt(20, 70);
        if (noise > TRIANGLE_CUTTOF - 0.03) {
            p.noFill();
            p.stroke(color);
            p.strokeWeight(2);
        } else {
            p.noStroke();
            p.fill(color);
        }

        p.triangle(x, y - TRIANGLE_SIZE, x - TRIANGLE_SIZE, y + TRIANGLE_SIZE, x + TRIANGLE_SIZE, y + TRIANGLE_SIZE);
    };

    const drawColorShapes = () => {
        for (let i = 0; i < SHAPE_GRID_AMOUNT; i++) {
            const slicedGrid = randomGridSlice(shapeGrid, {
                minWidth: 4,
                maxWidth: 8,
                minHeight: 4,
                maxHeight: 8,
            });

            // Draw the bg
            const bgGraphics = p.createGraphics(CANVAS_WIDTH, CANVAS_HEIGHT);
            bgGraphics.colorMode(bgGraphics.HSB, 360, 100, 100);

            const shapeColor = colors.pop() ?? '#777777';
            bgGraphics.background(shapeColor);

            const randomShape = getRandomShape(slicedGrid);
            const maskGraphics = createGraphicsFromShape(randomShape);
            maskGraphicsWithShape(bgGraphics, maskGraphics);
        }
    };

    const drawImageShape = () => {
        const slicedGrid = randomGridSlice(shapeGrid, {
            minWidth: 16,
            maxWidth: 20,
            minHeight: 16,
            maxHeight: 20,
        });
        let bgGraphics = p.createGraphics(CANVAS_WIDTH, CANVAS_HEIGHT);
        bgGraphics = drawImageWithinGrid(bgGraphics, slicedGrid);
        p.fill('#f00');

        const randomShape = getRandomShape(slicedGrid);
        const centroid = getCentroid(randomShape);
        const maskGraphics = createGraphicsFromShape(randomShape);

        maskGraphicsWithShape(bgGraphics, maskGraphics);
        p.circle(centroid.x, centroid.y, 20);
    };

    const maskGraphicsWithShape = (graphics: p5.Graphics, maskGraphics: p5.Graphics) => {
        // Mask the BG
        const bgImage = graphics.get();
        bgImage.mask(maskGraphics.get());
        //Draw the masked image
        p.image(bgImage, 0, 0);
    };

    const drawImageWithinGrid = (graphics: p5.Graphics, grid: Grid): p5.Graphics => {
        const firstPoint = grid.get()[0][0];
        graphics.image(bgImage, firstPoint.x, firstPoint.y, CANVAS_WIDTH, CANVAS_HEIGHT);
        return graphics;
    };

    const createGraphicsFromShape = (gridPoints: GridPoint[]): p5.Graphics => {
        // Draw the mask
        const maskGraphics = p.createGraphics(CANVAS_WIDTH, CANVAS_HEIGHT);
        maskGraphics.fill(0);
        maskGraphics.beginShape();

        gridPoints.forEach((point) => {
            maskGraphics.vertex(point.x, point.y);
        });

        maskGraphics.endShape(p.CLOSE);
        return maskGraphics;
    };

    // UTILITES
    const randomInt = (min: number, max: number): number => {
        return Math.floor(p.random() * (max - min)) + min;
    };

    const iterator = (amount: number, func: (index: number) => void) => {
        Array(amount)
            .fill(0)
            .forEach((e, i) => func(i));
    };

    const chance = (n: number): boolean => Math.random() < n;

    const getCentroid = (points: GridPoint[]): GridPoint => {
        const x = points.reduce((acc, cur) => {
            acc += cur.x;
            return acc;
        }, 0);

        const y = points.reduce((acc, cur) => {
            acc += cur.y;
            return acc;
        }, 0);

        return new GridPoint(x / points.length, y / points.length);
    };

    // EVENTS
    p.mouseClicked = () => {
        p.redraw();
    };
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const myP5 = new p5(s);
