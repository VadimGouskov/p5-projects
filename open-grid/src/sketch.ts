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
        //p.frameRate(0.1);

        fileClient = new FileClient(
            undefined,
            undefined,
            '/home/vadim/Projects/creative-coding/p5-projects/open-grid/export/images',
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

        p.background(0, 0, 100);

        p.fill('#0000ff');
        p.noStroke();

        //https://coolors.co/3c4d61-6e0d25-ffa9e7-ff8966-ff3864
        colors = ['#3C4D61', '#6E0D25', '#FFA9E7', '#FF8966', '#FF3864'];

        // CREATE
        const mainGrid = createMainGrid();

        const mainShape = getRandomShape(mainGrid);
        const mainImage = createMainImage(mainShape, mainGrid);

        const colorImages = createColorImages(mainShape);

        // DRAW
        triangleGrid.draw(drawTriangle);
        [...colorImages, mainImage].forEach((image) => p.image(image, 0, 0));

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
        const slicedGrid = grid.slice(startYIndex, stopYIndex, startXIndex, stopXIndex);
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

        const slicedGrid = grid.slice(indexYStart, indexYEnd, indexXStart, indexXEnd);
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

    const drawTriangle = ({ x, y }: GridPoint) => {
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

    const createColorImages = (blockingShape: GridPoint[]): p5.Image[] => {
        const colorShapes: p5.Image[] = [];
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

            let randomShape = getRandomShape(slicedGrid);
            // check if shape is within the main shape
            const isBlocked = isShapeWithinShape(blockingShape, randomShape);
            if (isBlocked) {
                randomShape = relocateShape(blockingShape, randomShape);
            }

            const maskGraphics = createGraphicsFromShape(randomShape);

            // Mask the BG
            const shapeImage = bgGraphics.get();
            shapeImage.mask(maskGraphics.get());

            colorShapes.push(shapeImage);
        }
        return colorShapes;
    };

    const createMainGrid = (): Grid => {
        return randomGridSlice(shapeGrid, {
            minWidth: 18,
            maxWidth: 20,
            minHeight: 18,
            maxHeight: 20,
        });
    };

    const createMainImage = (shape: GridPoint[], grid: Grid): p5.Image => {
        let bgGraphics = p.createGraphics(CANVAS_WIDTH, CANVAS_HEIGHT);
        bgGraphics = drawImageWithinGrid(bgGraphics, grid);
        p.fill('#f00');

        const maskGraphics = createGraphicsFromShape(shape);

        // Mask the BG
        const mainImage = bgGraphics.get();
        mainImage.mask(maskGraphics.get());

        return mainImage;
    };

    const drawImageWithinGrid = (graphics: p5.Graphics, grid: Grid): p5.Graphics => {
        const firstPoint = grid.get()[0][0];
        graphics.image(bgImage, firstPoint.x, firstPoint.y, CANVAS_WIDTH, CANVAS_HEIGHT);
        return graphics;
    };

    const createContour = (shape: GridPoint[], depth: number): GridPoint[] => {
        // interpolate to center
        const centroid = getCentroid(shape);
        const vc = p.createVector(centroid.x, centroid.y);
        let contourPoints = [...shape].reverse();

        contourPoints = contourPoints.map((point) => {
            const v = p.createVector(point.x, point.y);
            const interpolatedV = p5.Vector.lerp(v, vc, depth);
            return new GridPoint(interpolatedV.x, interpolatedV.y);
        });
        return contourPoints;
    };

    const createGraphicsFromShape = (gridPoints: GridPoint[], contour?: GridPoint[]): p5.Graphics => {
        const centre = getCentroid(gridPoints);

        // Draw the Mask Graphics
        const mg = p.createGraphics(CANVAS_WIDTH, CANVAS_HEIGHT);
        mg.fill(0);
        mg.beginShape();

        gridPoints.forEach((point) => {
            mg.vertex(point.x, point.y);
        });

        if (!!contour) {
            // cut out optional contout
            mg.beginContour();
            contour.forEach((point) => {
                mg.vertex(point.x, point.y);
            });
            mg.endContour();
        }

        mg.endShape(p.CLOSE);

        return mg;
    };

    const relocateShape = (outerShape: GridPoint[], shapeToRelocate: GridPoint[]): GridPoint[] => {
        // translate shape to random corner
        const cornerPoint = outerShape[randomInt(0, outerShape.length - 1)];
        const shapeCenter = getCentroid(shapeToRelocate);
        const diffX = cornerPoint.x - shapeCenter.x;
        const diffY = cornerPoint.y - shapeCenter.y;
        // to avoid adjusting the original grid => deep copy the array
        // TODO deep copy in Grid class
        const shapeCopy = JSON.parse(JSON.stringify(shapeToRelocate)) as GridPoint[];
        return shapeCopy.map((point) => {
            // magic numbers: make sure the shape rolaocates organically but does not fly of the screen or stays hidden
            point.x += diffX * p.random(0.95, 1.08);
            point.y += diffY * p.random(0.95, 1.08);
            return point;
        });
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

    const isShapeWithinShape = (outerShape: GridPoint[], innerShape: GridPoint[]): boolean => {
        for (const shape of innerShape) {
            if (!pointInPoly(outerShape, shape)) return false;
        }
        return true;
    };

    //https://editor.p5js.org/makio135/sketches/O9xQNN6Q
    function pointInPoly(verts: GridPoint[], pt: GridPoint) {
        let c = false;
        for (let i = 0, j = verts.length - 1; i < verts.length; j = i++) {
            if (
                verts[i].y > pt.y != verts[j].y > pt.y &&
                pt.x < ((verts[j].x - verts[i].x) * (pt.y - verts[i].y)) / (verts[j].y - verts[i].y) + verts[i].x
            )
                c = !c;
        }
        return c;
    }

    // EVENTS
    p.mouseClicked = () => {
        p.redraw();
    };
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const myP5 = new p5(s);
