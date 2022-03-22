import p5 from 'p5';
import { cols, Condition, ConditionCreator, Grid, GridFunction, GridPoint } from 'pretty-grid';
import { FileClient, getCanvasImage } from 'p5-file-client';

const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 1000;

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
    const sketchName = 'starter';
    let seed = 0;

    // p.preload = () => {};

    p.setup = () => {
        const canvas = p.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
        canvas.parent('sketch');
        p.noLoop();

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
        p.background(0);

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
