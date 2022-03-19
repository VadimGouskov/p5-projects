import p5 from 'p5';
import { cols, Condition, ConditionCreator, Grid, GridFunction, GridPoint } from 'pretty-grid';
import { FileClient, getCanvasImage } from 'p5-file-client';

const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 1000;

let grid: Grid;

const MAX_COLS = 5;
const MIN_COLS = 2;

const MAX_DEPTH = 4;

const TILE_COLS = 3;
const TILE_ROWS = 3;
const PALLETTE = ['#423E3B', '#FF2E00', '#FEA82F', '#FFFECB', '#5448C8'];

const s = (p: p5) => {
    let fileClient: FileClient;
    const sketchName = 'gridorama';
    let seed = 0;

    p.setup = () => {
        const canvas = p.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
        canvas.parent('sketch');
        p.noLoop();

        const cols = randomInt(MIN_COLS, MAX_COLS);
        grid = new Grid(cols, cols, CANVAS_WIDTH, CANVAS_HEIGHT);

        fileClient = new FileClient(
            undefined,
            undefined,
            `/home/vadim/Projects/creative-coding/p5-projects/${sketchName}/progress`,
        );
    };

    p.draw = () => {
        seed = randomInt(0, 1000000);
        p.randomSeed(seed);

        p.background(255);
        p.fill(0);
        p.ellipseMode(p.CENTER);
        const tileWidth = CANVAS_WIDTH / grid.get()[0].length - 1;
        recursiveGrid(grid, tileWidth, 0);

        //grid.draw(({ x, y }) => tile(x, y, PALLETTE));

        // Get base64 encoded image from current canvas
        const image64 = getCanvasImage('sketch');
        fileClient.exportImage64(image64, '.png', `${sketchName}_${seed}`);
    };

    function recursiveGrid(grid: Grid, width: number, depth: number) {
        if (depth >= MAX_DEPTH) return;

        grid.draw(({ x, y }) => {
            if (p.random() < 0.52) {
                const cols = randomInt(MIN_COLS, MAX_COLS);
                const deeperGrid = new Grid(cols, cols, width, width);
                const points = deeperGrid.get();
                const newWidth = points[0][0].x - points[1][0].x;
                deeperGrid.translate(x, y);
                recursiveGrid(deeperGrid, newWidth, depth + 1);
                // recursive
            } else {
                tile(x, y, width, PALLETTE);
            }
        });
    }

    const tile = (x: number, y: number, width: number, pallette: string[]) => {
        const g = p.createGraphics(width, width);
        // BG
        g.background(p.random(pallette));

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

    const randomInt = (min: number, max: number): number => Math.floor(p.random(min, max + 1));
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const myP5 = new p5(s);
