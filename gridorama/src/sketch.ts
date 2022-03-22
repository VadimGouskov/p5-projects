import p5 from 'p5';
import { cols, Condition, ConditionCreator, Grid, GridFunction, GridPoint } from 'pretty-grid';
import { FileClient, getCanvasImage } from 'p5-file-client';

const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 1000;

let grid: Grid;
let bgImage: p5.Image;
let maskSource: p5.Image;
let maskImage: p5.Image;

let drawBg = true;
let upperTileCount = 0;

const MAX_COLS = 4;
const MIN_COLS = 3;
const COLS = 3;
const ROWS = COLS;
// the grid origin is top left, make the last indeces fit fully on the canvas
const ADJUSTED_GRID_WIDTH = CANVAS_WIDTH - CANVAS_WIDTH / COLS;

const MAX_DEPTH = 3;

const TILE_COLS = 3;
const TILE_ROWS = 3;
// const PALLETTE = ['#423E3B', '#FF2E00', '#FEA82F', '#FFFECB', '#5448C8'];
const PALLETTE = ['#EF2D56', '#000000', '#eee5e9', '#efc88b'];
const TILE_RADIUS_BASE = 0;
const RECURSION_CHANCE = 0.5;
const GHOST_TILE_CHANCE = 0.02;
const IGNORE_MASK_CHANCE = 0.02;

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
        bgImage = p.loadImage('http://localhost:3000/masv2.png');

        maskSource = p.loadImage('http://localhost:3000/masv2-mask.png');
    };

    p.setup = () => {
        const canvas = p.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
        canvas.parent('sketch');
        // p.noLoop();
        p.ellipseMode(p.CENTER);

        grid = new Grid(COLS, ROWS, ADJUSTED_GRID_WIDTH, ADJUSTED_GRID_WIDTH);

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
        p.fill(0);

        // DRAW IMAGE
        if (drawBg) {
            const bgRatio = bgImage.width / bgImage.height;
            p.image(bgImage, 0, 0, CANVAS_WIDTH * bgRatio, CANVAS_HEIGHT, 0, 0);
            drawBg = false;
        }

        // MASK
        // p.image(maskImage, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // RECURSIVE GRID

        const col = upperTileCount % COLS;
        const row = p.floor(upperTileCount / COLS);
        console.log('col ', col, 'row', row);

        const point = grid.getPoint(col, row);

        initRecursiveGrid(point.x, point.y, COLS, ROWS);

        // GHOST TILES

        // Get base64 encoded image from current canvas
        const image64 = getCanvasImage('sketch');
        //fileClient.exportImage64(image64, '.png', `${sketchName}_${seed}`);

        upperTileCount++;
        if (upperTileCount === COLS * ROWS) {
            p.noLoop();
            fileClient.exportImage64(image64, '.png', `${sketchName}_${seed}`);
        }

        // p.circle(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, ADJUSTED_GRID_WIDTH);
    };

    function initRecursiveGrid(x: number, y: number, cols: number, rows: number) {
        const width = (CANVAS_WIDTH - CANVAS_WIDTH / cols) / (cols + 1);
        const newGrid = new Grid(cols, rows, width, width);
        newGrid.translate(x, y);
        recursiveGrid(newGrid, 0);
    }

    function recursiveGrid(grid: Grid, depth: number) {
        if (depth >= MAX_DEPTH) {
            return;
        }

        const points = grid.get();
        const width = points[1][0].x - points[0][0].x;

        grid.draw(({ x, y }) => {
            const canDraw = chance(IGNORE_MASK_CHANCE) || isMasked(maskImage, x + width / 2, y + width / 2);
            // fill the bottom lauyer fully
            if (depth === MAX_DEPTH - 1 && canDraw) {
                tile(x, y, width, PALLETTE);
            }

            const deeperGrid = new Grid(COLS, ROWS, width, width);
            deeperGrid.translate(x, y);

            if (chance(RECURSION_CHANCE)) {
                recursiveGrid(deeperGrid, depth + 1);
            } else {
                if (canDraw) {
                    tile(x, y, width, PALLETTE);
                } else {
                    // Go deeper if tile does no fit the mask
                    recursiveGrid(deeperGrid, depth + 1);
                }
            }
        });
    }

    const tile = (x: number, y: number, width: number, pallette: string[]) => {
        const g = p.createGraphics(width, width);
        // BG
        g.fill(p.random(pallette));
        g.noStroke();
        g.rect(0, 0, width, width);

        g.push();
        g.noStroke();

        if (chance(1)) {
            g.fill(p.random(pallette));
            g.circle(width / 2, width / 2, width / 3);
        } else {
            const tileGrid = new Grid(TILE_COLS, TILE_ROWS, width, width);
            tileGrid.draw(randomColorEllipse(g, width, PALLETTE), selectRandom(0.1));
        }

        g.pop();

        p.image(g.get(), x, y);
    };

    const ghostTile = (x: number, y: number, width: number, pallette: string[]) => {
        p.push();
        p.blendMode(p.DARKEST);
        tile(x, y, width, pallette);

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

    p.mouseClicked = () => {
        drawBg = true;
        upperTileCount = 0;
        p.loop();
        p.redraw();
    };

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

    const chance = (amount: number) => {
        return p.random() < amount;
    };
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const myP5 = new p5(s);
