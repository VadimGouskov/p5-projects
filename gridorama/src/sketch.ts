import p5 from 'p5';
import { cols, Condition, ConditionCreator, Grid, GridFunction, GridPoint } from 'pretty-grid';
import { FileClient, getCanvasImage } from 'p5-file-client';

const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 500;

let grid: Grid;
let bgImage: p5.Image;
let maskSource: p5.Image;
let maskImage: p5.Image;

const MAX_COLS = 4;
const MIN_COLS = 3;

const MAX_DEPTH = 4;

const TILE_COLS = 3;
const TILE_ROWS = 3;
const PALLETTE = ['#423E3B', '#FF2E00', '#FEA82F', '#FFFECB', '#5448C8'];
const TILE_RADIUS_BASE = 0;
const RECURSION_CHANCE = 0.9;
const GHOST_TILE_CHANCE = 0.05;

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
    const sketchName = 'gridorama';
    let seed = 0;

    p.preload = () => {
        bgImage = p.loadImage('http://localhost:3000/mas.jpg');

        maskSource = p.loadImage('http://localhost:3000/mask-mas2.png');
    };

    p.setup = () => {
        const canvas = p.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
        canvas.parent('sketch');
        p.noLoop();
        p.ellipseMode(p.CENTER);

        // Init Mask
        const maskGraphics = p.createGraphics(CANVAS_WIDTH, CANVAS_HEIGHT);
        const bgRatio = bgImage.width / bgImage.height;
        maskGraphics.image(maskSource, 0, 0, CANVAS_WIDTH * bgRatio, CANVAS_HEIGHT);
        maskImage = maskGraphics.get();
        maskImage.loadPixels();

        // SAVE SKETCH PROGRESS USING CUSTOM CLIENT
        fileClient = new FileClient(
            undefined,
            undefined,
            `/home/vadim/Projects/creative-coding/p5-projects/${sketchName}/progress`,
        );
    };

    p.draw = () => {
        // INIT
        seed = randomInt(0, 1000000);
        p.randomSeed(seed);
        p.background(255);
        p.fill(0);

        // DRAW IMAGE
        const bgRatio = bgImage.width / bgImage.height;
        p.image(bgImage, 0, 0, CANVAS_WIDTH * bgRatio, CANVAS_HEIGHT, 0, 0);

        // MASK
        // p.image(maskImage, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // RECURSIVE GRID

        const cols = randomInt(MIN_COLS, MAX_COLS);
        grid = new Grid(cols, cols, CANVAS_WIDTH, CANVAS_HEIGHT);
        const tileWidth = CANVAS_WIDTH / (grid.get()[0].length - 1);
        recursiveGrid(grid, tileWidth, 0);

        // GHOST TILES
        const ghostGrid = new Grid(cols * 4, cols * 4, CANVAS_WIDTH, CANVAS_HEIGHT);
        ghostGrid.draw(({ x, y }) => ghostTile(x, y, tileWidth / 4, 0, PALLETTE), selectRandom(GHOST_TILE_CHANCE));

        // Get base64 encoded image from current canvas
        const image64 = getCanvasImage('sketch');
        fileClient.exportImage64(image64, '.png', `${sketchName}_${seed}`);
    };

    function recursiveGrid(grid: Grid, width: number, depth: number) {
        if (depth >= MAX_DEPTH) {
            return;
        }

        const tileRadius = (MAX_DEPTH - depth) * TILE_RADIUS_BASE;

        grid.draw(({ x, y }) => {
            const cols = randomInt(MIN_COLS, MAX_COLS);
            const deeperGrid = new Grid(cols, cols, width, width);
            const points = deeperGrid.get();
            const newWidth = points[0][0].x - points[1][0].x;
            deeperGrid.translate(x, y);

            if (depth === MAX_DEPTH - 1) {
                if (isMasked(maskImage, x + width / 2, y + width / 2)) tile(x, y, width, tileRadius, PALLETTE);
            } else {
                recursiveGrid(deeperGrid, newWidth, depth + 1);
            }
        });
    }

    const tile = (x: number, y: number, width: number, cornerRadius: number, pallette: string[]) => {
        const g = p.createGraphics(width, width);
        // BG
        g.fill(p.random(pallette));
        g.noStroke();
        g.rect(0, 0, width, width, cornerRadius);

        g.push();
        g.noStroke();

        if (p.random() < 0.5) {
            g.fill(p.random(pallette));
            g.circle(width / 2, width / 2, width / 3);
        } else {
            const tileGrid = new Grid(TILE_COLS, TILE_ROWS, width, width);
            tileGrid.draw(randomColorEllipse(g, width, PALLETTE), selectRandom(0.1));
        }

        g.pop();

        p.image(g.get(), x, y);
    };

    const ghostTile = (x: number, y: number, width: number, cornerRadius: number, pallette: string[]) => {
        p.push();
        p.blendMode(p.DARKEST);
        tile(x, y, width, cornerRadius, PALLETTE);

        p.pop();
    };

    const createMaskImage = (): p5.Image => {
        const g = p.createGraphics(CANVAS_WIDTH, CANVAS_HEIGHT);
        g.noStroke();
        g.fill(255);
        //g.circle(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_WIDTH * 0.666);
        //g.rect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT / 2);
        return g.get();
    };

    p.mouseClicked = () => p.redraw();

    const selectRandom =
        (chance: number): Condition =>
        (point: GridPoint, col?: number, row?: number) => {
            return p.random() < chance;
        };

    const randomColorEllipse = (graphics: p5.Graphics, width: number, pallette: string[]): GridFunction => {
        graphics.strokeWeight(width / 10);
        graphics.stroke(p.random(pallette));
        graphics.noFill();
        return (point: GridPoint, col?: number, row?: number) => {
            graphics.circle(point.x, point.y, width / 4);
        };
    };

    const isMasked = (mask: p5.Image, x: number, y: number): boolean => {
        const pixel = mask.get(Math.floor(x), Math.floor(y));
        return pixel[3] === 255;
    };

    const randomInt = (min: number, max: number): number => Math.floor(p.random(min, max + 1));
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const myP5 = new p5(s);
