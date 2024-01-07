import p5 from 'p5';
import { cols, Condition, ConditionCreator, createGrid, Grid, GridPoint } from 'pretty-grid';
import { FileClient, getCanvasImage } from 'p5-file-client';

const CANVAS_WIDTH = 1240;
const CANVAS_HEIGHT = 1748; // A6 at 300dpi

const ROWS = 14;
const COLS = 10;

const RED = '#DD1C1A';
const GREEN = '#25754D';
const YELLOW = '#FFD23F';

const TRIANGLE_AMOUNT = 3;
const YELLOW_DOT_SIZE = CANVAS_WIDTH / COLS / 2;

const BORDER_RADIUS = 20;

const NOISE_SCALE = 0.005;
const BACKGROUND_DOT_THRESHOLD = 0.65;
const FOREGROUND_DOT_THRESHOLD = 0.69;

const s = (p: p5) => {
    const blendModes = [
        p.ADD,
        p.DARKEST,
        p.LIGHTEST,
        p.EXCLUSION,
        p.MULTIPLY,
        p.SCREEN,
        p.REPLACE,
        p.OVERLAY,
        p.HARD_LIGHT,
        p.SOFT_LIGHT,
        p.DODGE,
        p.BURN,
        p.SUBTRACT,
    ];

    let fileClient: FileClient;
    const sketchName = 'xmas23';
    let seed = 0;

    // p.preload = () => {};

    let grid: Grid;
    let dotCondition: Condition;

    p.setup = () => {
        const canvas = p.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
        canvas.parent('sketch');
        p.noLoop();
        p.noStroke();

        // SAVE SKETCH PROGRESS USING CUSTOM CLIENT
        fileClient = new FileClient(
            undefined,
            undefined,
            `/Users/VadimHome/Documents/Projects/p5-projects/${sketchName}/progress`,
        );

        dotCondition = selectRandom(0.05);

        grid = createGrid({ cols: COLS, rows: ROWS, width: CANVAS_WIDTH, height: CANVAS_HEIGHT });
    };

    const getSqaurePoints = (
        grid: Grid,
        col: number,
        row: number,
        size: number,
    ): [GridPoint, GridPoint, GridPoint, GridPoint] => {
        const topLeft = grid.getPoint(col, row);
        const topRight = grid.getPoint(col + size, row);
        const bottomLeft = grid.getPoint(col, row + size);
        const bottomRight = grid.getPoint(col + size, row + size);

        return [topLeft, topRight, bottomLeft, bottomRight];
    };

    const getTrianglePoints = (
        grid: Grid,
        col: number,
        row: number,
        size: number,
    ): [GridPoint, GridPoint, GridPoint] => {
        const top = grid.getPoint(col, row);
        const bottomLeft = grid.getPoint(col - size, row + size);
        const bottomRight = grid.getPoint(col + size, row + size);

        return [top, bottomLeft, bottomRight];
    };

    const centerScale = (p: p5, width: number, height: number, amount: number) => {
        p.translate(width / 2, height / 2);
        p.scale(amount);
        p.translate(-width / 2, -height / 2);
    };

    p.draw = () => {
        // centerScale(p, CANVAS_WIDTH, CANVAS_HEIGHT, 0.75);
        // INIT
        seed = randomInt(0, 1000000);
        p.randomSeed(seed);
        p.noiseSeed(seed);
        p.clear();
        // p.background(255);

        // BACKGROUND DOTS
        p.push();
        p.fill(YELLOW);
        grid.every((point) => {
            const noise = p.noise(point.x * NOISE_SCALE, point.y * NOISE_SCALE);

            if (noise < BACKGROUND_DOT_THRESHOLD) {
                return;
            }

            p.circle(point.x, point.y, YELLOW_DOT_SIZE * noise);
        });
        p.pop();

        const minSize = COLS / 4;
        const maxSize = COLS / 2;

        const size = randomInt(minSize, maxSize);
        const col = randomInt(size, COLS - (size + 1));
        const row = randomInt(size, ROWS - (size + 1));

        const [topLeft, topRight, bottomLeft, bottomRight] = getSqaurePoints(grid, col, row, size);

        p.fill(RED);
        p.quad(topLeft.x, topLeft.y, topRight.x, topRight.y, bottomRight.x, bottomRight.y, bottomLeft.x, bottomLeft.y);

        for (let i = 0; i < TRIANGLE_AMOUNT; i++) {
            const minSize = ROWS / 16;
            const maxSize = ROWS / 8;
            const size = randomInt(minSize, maxSize);
            const col = randomInt(size, COLS - (size + 1));
            const row = randomInt(size, ROWS - (size + 1));

            const [top, bottomLeft, bottomRight] = getTrianglePoints(grid, col, row, size);
            p.fill(GREEN);
            p.triangle(top.x, top.y, bottomLeft.x, bottomLeft.y, bottomRight.x, bottomRight.y);
        }

        // FOREGROUND DOTS
        const NOISE_OFFSET = 2;
        p.fill(YELLOW);
        grid.every((point) => {
            const noise = p.noise((point.x + NOISE_OFFSET) * NOISE_SCALE, (point.y + NOISE_OFFSET) * NOISE_SCALE);

            if (noise < FOREGROUND_DOT_THRESHOLD) {
                return;
            }

            p.circle(point.x, point.y, YELLOW_DOT_SIZE);
        });

        // EXPORT
        const image64 = getCanvasImage('sketch');
        fileClient.exportImage64(image64, '.png', `${sketchName}_${seed}`);
    };

    p.mouseClicked = () => {
        p.redraw();
    };

    const selectRandom =
        (chance: number): Condition =>
        (point: GridPoint, col?: number, row?: number) => {
            return p.random() < chance;
        };

    const randomInt = (min: number, max: number): number => Math.floor(p.random(min, max + 1));

    const chance = (amount: number) => {
        return p.random() < amount;
    };
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const myP5 = new p5(s);
