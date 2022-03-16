import p5 from 'p5';
import { Grid } from 'pretty-grid';
import { FileClient, getCanvasImage } from 'p5-file-client';

const s = (p: p5) => {
    let fileClient: FileClient;

    const CANVAS_WIDTH = 1000;
    const CANVAS_HEIGHT = 1000;

    const grids: Grid[] = [];

    const MIN_GRIDS = 0;
    const MAX_GRIDS = 2;

    const MIN_COLS = 15;
    const MAX_COLS = 40;
    const MIN_ROWS = 15;
    const MAX_ROWS = 40;

    const MIN_CIRCLE_RADIUS = 10;
    const MAX_CIRCLE_RADIUS = 60;

    p.setup = () => {
        const canvas = p.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
        canvas.parent('sketch');
        p.noLoop();

        fileClient = new FileClient(
            undefined,
            undefined,
            '/home/vadim/Projects/creative-coding/p5-projects/grid-play/progress',
        );

        const gridsAmount = randomInt(MIN_GRIDS, MAX_GRIDS);

        for (let i = 0; i <= gridsAmount; i++) {
            const cols = randomInt(MIN_COLS, MAX_COLS + 1);
            const rows = randomInt(MIN_ROWS, MAX_ROWS + 1);

            grids.push(new Grid(cols, rows, CANVAS_WIDTH, CANVAS_HEIGHT));
        }
    };

    p.draw = () => {
        p.background(255);
        p.fill(0);
        p.ellipseMode(p.CENTER);

        grids.forEach((grid) => {
            if (p.random(0, 1) > 0.5) {
                p.fill(randomInt(8, 255));
                p.noStroke();
            } else {
                p.stroke(randomInt(8, 255));
                p.strokeWeight(randomInt(1, 4));
                p.noFill();
            }

            const radius = randomInt(MIN_CIRCLE_RADIUS, MAX_CIRCLE_RADIUS);

            grid.draw((point) => p.circle(point.x, point.y, radius));

            // Get base64 encoded image from current canvas
            const image64 = getCanvasImage('sketch');
            fileClient.exportImage64(image64, '.png', 'grid-play');
        });
    };

    p.mouseClicked = () => p.redraw();

    const randomInt = (min: number, max: number): number => Math.floor(p.random(min, max + 1));
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const myP5 = new p5(s);
