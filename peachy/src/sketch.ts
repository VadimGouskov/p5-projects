import p5 from 'p5';
import { cols, Condition, ConditionCreator, Grid, GridFunction, GridPoint } from 'pretty-grid';
import { FileClient, getCanvasImage } from 'p5-file-client';
import { Relative } from './relative';
import { debug } from 'console';
import { brighten, centerScale, chance, popRandom, randomInt, saturate } from './helpers';

const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 1000;
const canvasW = new Relative(CANVAS_WIDTH);
const canvasH = new Relative(CANVAS_HEIGHT);

const COLS = 10;
const ROWS = COLS;

const OBJECT_RADIUS_MAX = canvasW.values[1000] / COLS;
const OBJECT_RADIUS_MIN = OBJECT_RADIUS_MAX / 3;
const objectRelative = new Relative(OBJECT_RADIUS_MAX);
const HIGHLIGHT_RADIUS_FACTOR = 0.75;
const HIGHLIGHT_OFFSET = 0;
const HIGHLIGHT_LENGTH = Math.PI / 2;
const HIGHTLIGHT_START = Math.PI + Math.PI / 2 + HIGHLIGHT_OFFSET;
const HIGHLIGHT_END = HIGHTLIGHT_START + HIGHLIGHT_LENGTH;
const HIGHLIGHT_WIDTH = objectRelative.values[45];
const HIGHLIGHT_SATURATION_FACTOR = 0.45;
const HIGHLIGHT_LIGHTEN_FACTOR = 3;

const BG_SATURATION_FACTOR = 0.3;

const MAX_PILL_DISTANCE = OBJECT_RADIUS_MAX * 2.5;
const PILL_CHANCE = 0.2;

const PALLETTE = ['#423E3B', '#FF2E00', '#FEA82F', '#FFFECB', '#5448C8'];
//const OBJECT_AMOUNT = PALLETTE.length;
const OBJECT_AMOUNT = COLS * 7;

export let p5Instance: p5;

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

    p5Instance = p;

    let fileClient: FileClient;
    const sketchName = 'peachy';
    let seed = 0;

    let grid: Grid;

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

        centerScale(CANVAS_WIDTH, CANVAS_HEIGHT, 0.666);

        // grid.draw((point) => p.circle(point.x, point.y, canvasW.values[250]));

        // pick bg color
        const bgColor = saturate(p.random(PALLETTE), BG_SATURATION_FACTOR);

        // const bgColor = desaturate(string);

        p.background(bgColor);

        // loop for object amount
        const tempPallette = [...PALLETTE];
        let tempPoints = grid.copy().getFlat();
        for (let i = 0; i < OBJECT_AMOUNT; i++) {
            // const [color, newPallette] = popRandom(tempPallette);
            const color = p.random(PALLETTE);
            const [point, newPoints] = popRandom(tempPoints);

            // tempPallette = newPallette;
            tempPoints = newPoints;

            p.fill(color);
            p.stroke(color);

            const pillDistance = (point.x / CANVAS_WIDTH) * MAX_PILL_DISTANCE;
            const objectRadius = p.lerp(OBJECT_RADIUS_MIN, OBJECT_RADIUS_MAX, point.x / CANVAS_WIDTH);

            p.strokeWeight(objectRadius);
            try {
                // chance to draw a pill
                if (chance(PILL_CHANCE)) {
                    // Check if there are still points close enought to form a pill
                    // TODO If nothing around => draw a dot
                    const [pointWithinRadius, remainingPoints] = popRandomWithinRadius(point, newPoints, pillDistance);
                    if (!pointWithinRadius) {
                        console.log('TOO FAR');
                        shinyDot(point.x, point.y, objectRadius, color);
                        continue;
                    }
                    pill(point.x, point.y, pointWithinRadius.x, pointWithinRadius.y);
                    tempPoints = remainingPoints;
                } else {
                    shinyDot(point.x, point.y, objectRadius, color);
                }
            } catch {
                debugger;
            }
        }

        // EXPORT
        const image64 = getCanvasImage('sketch');
        fileClient.exportImage64(image64, '.png', `${sketchName}_${seed}`);
    };

    p.mouseClicked = () => {
        p.redraw();
    };

    const pill = (fromX: number, fromY: number, toX: number, toY: number, highlight?: string) => {
        p.line(fromX, fromY, toX, toY);
    };

    const shinyDot = (x: number, y: number, radius: number, color: string) => {
        // draw a circle
        p.noStroke();
        p.circle(x, y, radius);
        arc(
            x,
            y,
            radius * HIGHLIGHT_RADIUS_FACTOR,
            HIGHLIGHT_WIDTH,
            saturate(brighten(color, HIGHLIGHT_LIGHTEN_FACTOR), HIGHLIGHT_SATURATION_FACTOR),
        );
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

    const popRandomWithinRadius = (
        referencePoint: GridPoint,
        pointArray: GridPoint[],
        radius: number,
    ): [GridPoint | undefined, GridPoint[]] => {
        function isWithinRadius(currentPoint: GridPoint): boolean {
            const distance = Math.hypot(referencePoint.x - currentPoint.x, referencePoint.y - currentPoint.y);
            return distance < radius;
        }

        // TODO quick n dirty solution => try to loop one time over all instead
        const pointsOutsideRadius = pointArray.filter((point) => !isWithinRadius(point));
        const pointsWithinRadius = pointArray.filter(isWithinRadius);

        if (pointsWithinRadius.length > 0) {
            const [selectedPoint, remainingPointsWithinRadius] = popRandom(pointsWithinRadius);
            return [selectedPoint, [...pointsOutsideRadius, ...remainingPointsWithinRadius]];
        }

        // no points within radius found
        return [undefined, pointArray];
    };

    const selectRandom =
        (chance: number): Condition =>
        (point: GridPoint, col?: number, row?: number) => {
            return p.random() < chance;
        };
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const myP5 = new p5(s);
