import p5 from 'p5';
import { Grid } from 'pretty-grid';
import { FileClient, getCanvasImage } from 'p5-file-client';

const s = (p: p5) => {
    let fileClient: FileClient;
    const sketchName = 'gridorama';

    const CANVAS_WIDTH = 1000;
    const CANVAS_HEIGHT = 1000;

    let grid: Grid;
    const COLS = 40;
    const ROWS = 40;

    const TILE_WIDTH = CANVAS_WIDTH / COLS;
    const TILE_HEIGHT = CANVAS_HEIGHT / ROWS;

    const PALLETTE = ['#423E3B', '#FF2E00', '#FEA82F', '#FFFECB', '#5448C8'];

    p.setup = () => {
        const canvas = p.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
        canvas.parent('sketch');
        p.noLoop();

        grid = new Grid(COLS, ROWS, CANVAS_WIDTH, CANVAS_HEIGHT);

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
        g.ellipse(TILE_WIDTH / 2, TILE_HEIGHT / 2, 30);
        g.background(p.random(pallette));
        p.image(g.get(), x, y);
    };

    p.mouseClicked = () => p.redraw();

    const randomInt = (min: number, max: number): number => Math.floor(p.random(min, max + 1));
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const myP5 = new p5(s);
