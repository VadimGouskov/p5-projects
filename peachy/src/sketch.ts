import p5 from 'p5';
import { cols, Condition, ConditionCreator, Grid, GridFunction, GridPoint } from 'pretty-grid';
import { FileClient, getCanvasImage } from 'p5-file-client';
import { Relative } from './relative';
import { debug } from 'console';

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
    const sketchName = 'peachy';
    let seed = 0;

    let grid: Grid;
    let objectRadius: number;
    let canvasW: Relative;
    let canvasH: Relative;

    const PALLETTE = ['#423E3B', '#FF2E00', '#FEA82F', '#FFFECB', '#5448C8'];
    const OBJECT_AMOUNT = PALLETTE.length;

    // p.preload = () => {};

    p.setup = () => {
        // BASIC SETUP
        const canvas = p.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
        canvas.parent('sketch');
        p.noLoop();

        p.textAlign(p.CENTER, p.CENTER);
        p.rectMode(p.CENTER);
        p.ellipseMode(p.CENTER);
        p.strokeCap(p.ROUND);

        // VARIABLE INITs
        canvasW = new Relative(CANVAS_WIDTH);
        canvasH = new Relative(CANVAS_HEIGHT);

        grid = new Grid(3, 3, CANVAS_WIDTH, CANVAS_HEIGHT);
        objectRadius = canvasW.values[250];

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
        p.background('black');

        centerScale(0.666);

        // grid.draw((point) => p.circle(point.x, point.y, canvasW.values[250]));

        // loop for object amount
        let tempPallette = [...PALLETTE];
        let tempPoints = grid.copy().getFlat();
        for (let i = 0; i < OBJECT_AMOUNT; i++) {
            let [color, newPallette] = popRandom(tempPallette);
            const [point, newPoints] = popRandom(tempPoints);

            tempPallette = newPallette;
            tempPoints = newPoints;

            p.fill(color);
            p.stroke(color);
            p.strokeWeight(objectRadius);

            // chance to draw a pill
            if (chance(0.5)) {
                const [toPoint, newerPoints] = popRandom(newPoints);
                p.line(point.x, point.y, toPoint.x, toPoint.y);

                tempPoints = newerPoints;
            } else {
                // draw a circle
                p.noStroke();
                p.circle(point.x, point.y, objectRadius);
            }
        }

        // EXPORT
        const image64 = getCanvasImage('sketch');
        fileClient.exportImage64(image64, '.png', `${sketchName}_${seed}`);
    };

    p.mouseClicked = () => {
        p.redraw();
    };

    // draw a pill (fromX, fromY, toX, toY)

    // popRandom(array: T[]): [T[], T]

    function popRandom<T>(array: T[]): [T, T[]] {
        const index = randomInt(0, array.length - 1);
        const value = array[index];
        array.splice(index, 1);
        return [value, [...array]];
    }

    const selectRandom =
        (chance: number): Condition =>
        (point: GridPoint, col?: number, row?: number) => {
            return p.random() < chance;
        };

    const randomInt = (min: number, max: number): number => Math.floor(p.random(min, max + 1));

    const chance = (amount: number) => {
        return p.random() < amount;
    };

    const centerScale = (value: number) => {
        p.translate(canvasW.values[500], canvasW.values[500]);
        p.scale(value);
        p.translate(-canvasW.values[500], -canvasW.values[500]);
    };
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const myP5 = new p5(s);
