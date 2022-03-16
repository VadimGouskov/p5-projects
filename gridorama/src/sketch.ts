import p5 from 'p5';
import { Grid } from 'pretty-grid';
import { FileClient, getCanvasImage } from 'p5-file-client';

const s = (p: p5) => {
    let fileClient: FileClient;
    const sketchName = 'gridorama';

    const CANVAS_WIDTH = 1000;
    const CANVAS_HEIGHT = 1000;

    p.setup = () => {
        const canvas = p.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
        canvas.parent('sketch');
        p.noLoop();

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

        // Get base64 encoded image from current canvas
        const image64 = getCanvasImage('sketch');
        fileClient.exportImage64(image64, '.png', sketchName);
    };

    p.mouseClicked = () => p.redraw();

    const randomInt = (min: number, max: number): number => Math.floor(p.random(min, max + 1));
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const myP5 = new p5(s);
