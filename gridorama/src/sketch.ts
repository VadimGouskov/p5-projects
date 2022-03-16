import p5 from 'p5';
import { Condition, ConditionCreator, Grid, GridFunction, GridPoint } from 'pretty-grid';
import { FileClient, getCanvasImage } from 'p5-file-client';

const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 1000;

let grid: Grid;
const COLS = 10;
const ROWS = 10;

let tileGrid: Grid;
const TILE_WIDTH = CANVAS_WIDTH / COLS;
const TILE_HEIGHT = CANVAS_HEIGHT / ROWS;
const TILE_COLS = 3;
const TILE_ROWS = 3;
const PALLETTE = ['#423E3B', '#FF2E00', '#FEA82F', '#FFFECB', '#5448C8'];

const s = (p: p5) => {
    let fileClient: FileClient;
    const sketchName = 'gridorama';

    p.setup = () => {
        const canvas = p.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
        canvas.parent('sketch');
        p.noLoop();

        grid = new Grid(COLS, ROWS, CANVAS_WIDTH, CANVAS_HEIGHT);
        tileGrid = new Grid(TILE_COLS, TILE_ROWS, TILE_WIDTH, TILE_HEIGHT);

        fileClient = new FileClient(
            undefined,
            undefined,
            `/home/vadim/Projects/creative-coding/p5-projects/${sketchName}/progress`,
        );
    };

    p.draw = () => {
        p.background(255);
        p.fill(0);
        p.ellipseMode(p.CENTER);

        grid.draw(({ x, y }) => tile(x, y, PALLETTE));

        // Get base64 encoded image from current canvas
        const image64 = getCanvasImage('sketch');
        fileClient.exportImage64(image64, '.png', sketchName);
    };

    const tile = (x: number, y: number, pallette: string[]) => {
        const g = p.createGraphics(TILE_WIDTH, TILE_HEIGHT);
        // BG
        g.background(p.random(pallette));

        g.push();
        g.noStroke();

        if (p.random() < 0.5) {
            g.fill(p.random(pallette));
            g.circle(TILE_WIDTH / 2, TILE_HEIGHT / 2, TILE_HEIGHT / 3);
        } else {
            tileGrid.draw(randomColorEllipse(g, PALLETTE), selectRandom(0.1));
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

    const randomColorEllipse = (graphics: p5.Graphics, pallette: string[]): GridFunction => {
        graphics.strokeWeight(TILE_WIDTH / 10);
        graphics.stroke(p.random(pallette));
        graphics.noFill();
        return (point: GridPoint, col?: number, row?: number) => {
            graphics.circle(point.x, point.y, TILE_WIDTH / 4);
        };
    };

    const randomInt = (min: number, max: number): number => Math.floor(p.random(min, max + 1));
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const myP5 = new p5(s);
