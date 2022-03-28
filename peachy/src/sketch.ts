import p5 from 'p5';
import { cols, Condition, ConditionCreator, Grid, GridFunction, GridPoint } from 'pretty-grid';
import { FileClient, getCanvasImage } from 'p5-file-client';
import { Relative } from './relative';
import { debug } from 'console';

const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 1000;
const canvasW = new Relative(CANVAS_WIDTH);
const canvasH = new Relative(CANVAS_HEIGHT);

const COLS = 5;
const ROWS = 5;

const objectRadius = canvasW.values[333];
const objectRelative = new Relative(objectRadius);
const HIGHLIGHT_RADIUS = objectRelative.values[750];
const HIGHLIGHT_OFFSET = 0;
const HIGHLIGHT_LENGTH = Math.PI / 2;
const HIGHTLIGHT_START = Math.PI + Math.PI / 2 + HIGHLIGHT_OFFSET;
const HIGHLIGHT_END = HIGHTLIGHT_START + HIGHLIGHT_LENGTH;
const HIGHLIGHT_WIDTH = objectRelative.values[45];
const HIGHLIGHT_SATURATION_FACTOR = 0.45;
const HIGHLIGHT_LIGHTEN_FACTOR = 3;

const BG_SATURATION_FACTOR = 0.3;

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

    const PALLETTE = ['#423E3B', '#FF2E00', '#FEA82F', '#FFFECB', '#5448C8'];
    const OBJECT_AMOUNT = PALLETTE.length;

    // p.preload = () => {};

    p.setup = () => {
        // BASIC SETUP
        const canvas = p.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
        canvas.parent('sketch');
        p.noLoop();

        p.colorMode(p.HSB, 360, 100, 100);
        p.textAlign(p.CENTER, p.CENTER);
        p.rectMode(p.CENTER);
        p.ellipseMode(p.CENTER);
        p.strokeCap(p.ROUND);

        // VARIABLE INITs

        grid = new Grid(COLS, ROWS, CANVAS_WIDTH, CANVAS_HEIGHT);

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

        centerScale(0.666);

        // grid.draw((point) => p.circle(point.x, point.y, canvasW.values[250]));

        // pick bg color
        const bgColor = saturate(p.random(PALLETTE), BG_SATURATION_FACTOR);

        // const bgColor = desaturate(string);

        p.background(bgColor);

        // loop for object amount
        let tempPallette = [...PALLETTE];
        let tempPoints = grid.copy().getFlat();
        for (let i = 0; i < OBJECT_AMOUNT; i++) {
            const [color, newPallette] = popRandom(tempPallette);
            const [point, newPoints] = popRandom(tempPoints);

            tempPallette = newPallette;
            tempPoints = newPoints;

            p.fill(color);
            p.stroke(color);
            p.strokeWeight(objectRadius);

            // chance to draw a pill
            if (chance(0.5)) {
                const [toPoint, newerPoints] = popRandom(newPoints);
                pill(point.x, point.y, toPoint.x, toPoint.y);
                tempPoints = newerPoints;
            } else {
                // draw a circle
                p.noStroke();
                p.circle(point.x, point.y, objectRadius);
                arc(
                    point.x,
                    point.y,
                    HIGHLIGHT_RADIUS,
                    HIGHLIGHT_WIDTH,
                    saturate(brighten(color, HIGHLIGHT_LIGHTEN_FACTOR), HIGHLIGHT_SATURATION_FACTOR),
                );
            }
        }

        // EXPORT
        const image64 = getCanvasImage('sketch');
        fileClient.exportImage64(image64, '.png', `${sketchName}_${seed}`);
    };

    p.mouseClicked = () => {
        p.redraw();
    };

    // draw a pill (fromX, fromY, toX, toY, highlight? : string)
    const pill = (fromX: number, fromY: number, toX: number, toY: number, highlight?: string) => {
        p.line(fromX, fromY, toX, toY);
    };

    const arc = (x: number, y: number, radius: number, width: number, color: string): void => {
        p.push();
        p.noFill();
        p.stroke(color);
        p.strokeWeight(width);

        p.arc(x, y, radius, radius, HIGHTLIGHT_START, HIGHLIGHT_END);
        // fake stroke caps
        p.fill(color);
        p.noStroke();

        p.pop();
    };

    function popRandom<T>(array: T[]): [T, T[]] {
        const index = randomInt(0, array.length - 1);
        const value = array[index];
        array.splice(index, 1);
        return [value, [...array]];
    }

    const saturate = (colorString: string, amount: number): string => {
        const hue = p.hue(colorString);
        const saturation = p.saturation(colorString);
        const brightness = p.brightness(colorString);

        const newColor = p.color(hue, saturation * amount, brightness);
        return newColor.toString();
    };

    const brighten = (colorString: string, amount: number): string => {
        const hue = p.hue(colorString);
        const saturation = p.saturation(colorString);
        const brightness = p.brightness(colorString);

        const newColor = p.color(hue, saturation, brightness * amount);
        return newColor.toString();
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

    const centerScale = (value: number) => {
        p.translate(canvasW.values[500], canvasW.values[500]);
        p.scale(value);
        p.translate(-canvasW.values[500], -canvasW.values[500]);
    };
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const myP5 = new p5(s);
