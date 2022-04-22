import p5 from 'p5';
import { Condition, Grid, GridPoint, GridShape } from 'pretty-grid';
import { FileClient, getCanvasImage } from 'p5-file-client';
import { Relative } from './relative';
import { brighten, centerScale, chance, dash, popRandom, randomInt, saturate, sortCloser } from './helpers';

const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = CANVAS_WIDTH * 1.6666;
const canvasW = new Relative(CANVAS_WIDTH);
const canvasH = new Relative(CANVAS_HEIGHT);
const PATTERN_SCALE = 0.75;

const COLS = 20;
const ROWS = Math.floor(COLS * 1.666);

const OBJECT_RADIUS_MAX = canvasW.values[1000] / COLS;
const OBJECT_RADIUS_MIN = OBJECT_RADIUS_MAX / 2;
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
const BG_GRADIENT_BRIGHTNESS = 0.75;

const MAX_PILL_DISTANCE = OBJECT_RADIUS_MAX * 1.8;
const PILL_CHANCE = 0.05;

const DECORATION_BASE_CHANCE = 0.5;

const BG_CHANCE = 0.9;
const BG_PATTERN_COLOR = '#666';
const DASH_AMOUNT = 50;
const DASH_WIDTH = CANVAS_WIDTH / DASH_AMOUNT;
const DASH_HEIGHT = CANVAS_HEIGHT / DASH_AMOUNT;
const DASH_CHANCE = 0.9;

const PALLETTE = ['#FF2E00', '#FEA82F', '#FFFECB', '#5448C8', '#423E3B' /*'#718F94'*/];
const BG_COLOR = PALLETTE[3];
//const OBJECT_AMOUNT = PALLETTE.length;
const OBJECT_AMOUNT = COLS * 9;

export let p5Instance: p5;
let drawingContext: CanvasRenderingContext2D;

const s = (p: p5) => {
    p5Instance = p;

    let fileClient: FileClient;
    const sketchName = 'peachy';
    let seed = 0;

    let grid: Grid;

    let font: any;

    p.preload = () => {
        font = p.loadFont('http://localhost:3000/FredokaOne-Regular.ttf');
    };

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
        drawingContext = p.drawingContext.canvas.getContext('2d') as CanvasRenderingContext2D;

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
        seed = 335842;
        p.randomSeed(seed);
        console.log(seed);
        // pick bg color
        const bgColor = saturate(BG_COLOR, BG_SATURATION_FACTOR);
        backgroundGradient([brighten(bgColor, BG_GRADIENT_BRIGHTNESS), brighten(bgColor, 2 - BG_GRADIENT_BRIGHTNESS)]);
        foreGround();

        centerScale(CANVAS_WIDTH, CANVAS_HEIGHT, PATTERN_SCALE);

        // grid.draw((point) => p.circle(point.x, point.y, canvasW.values[250]));

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

            const pillDistance = backgroundPattern(point.x / CANVAS_WIDTH) * MAX_PILL_DISTANCE;
            const objectRadius = p.lerp(
                OBJECT_RADIUS_MIN,
                OBJECT_RADIUS_MAX,
                backgroundPattern(point.x / CANVAS_WIDTH),
            );
            const decorationChance = DECORATION_BASE_CHANCE - backgroundPattern(point.x / CANVAS_WIDTH);

            // chance to draw a pill
            if (chance(PILL_CHANCE)) {
                // Check if there are still points close enought to form a pill
                // TODO If nothing around => draw a dot
                const [pointWithinRadius, remainingPoints] = popRandomWithinRadius(point, newPoints, pillDistance);
                if (!pointWithinRadius) {
                    chance(decorationChance)
                        ? decoratedDot(point.x, point.y, objectRadius, color)
                        : shinyDot(point.x, point.y, objectRadius, color);
                    continue;
                }
                pill(point.x, point.y, pointWithinRadius.x, pointWithinRadius.y, objectRadius, color);
                tempPoints = remainingPoints;
            } else {
                chance(decorationChance)
                    ? decoratedDot(point.x, point.y, objectRadius, color)
                    : shinyDot(point.x, point.y, objectRadius, color);
            }
        }

        // titleText();
        // EXPORT
        const image64 = getCanvasImage('sketch');
        fileClient.exportImage64(image64, '.png', `${sketchName}_${seed}`);
    };

    p.mouseClicked = () => {
        p.redraw();
    };

    const pill = (fromX: number, fromY: number, toX: number, toY: number, width: number, color: string) => {
        p.strokeWeight(width);

        // sort coordinates closest to bottom left to not squash the gradient
        const [x0, y0, x1, y1] = sortCloser(0, 0, fromX, fromY, toX, toY);

        const complimentaryColor = p.random(PALLETTE.filter((c) => c != color));
        gradientStroke(x0 - width / 2, y0 + width / 2, x1 + width / 2, y1 - width / 2, [color, complimentaryColor]);

        p.line(fromX, fromY, toX, toY);
    };

    const decoratedDot = (x: number, y: number, radius: number, color: string) => {
        const decorationWidth = objectRelative.values[75];

        // ELLIPSE GRID
        const ellipseGrid = new Grid(9, 1, OBJECT_RADIUS_MAX, OBJECT_RADIUS_MAX, GridShape.ELLIPSE);
        ellipseGrid.translate(x, y);
        p.noStroke();
        ellipseGrid.draw((point) => p.circle(point.x, point.y, decorationWidth));
        // ARC
        const arcStep = p.QUARTER_PI;
        const arcOffset = randomInt(0, p.TWO_PI / arcStep) * arcStep;
        const arcLength = randomInt(0, p.TWO_PI / arcStep) * arcStep;
        const arcStart = arcOffset;
        const arcStop = arcOffset + arcLength;
        arc(x, y, OBJECT_RADIUS_MAX, decorationWidth, arcStart, arcStop, color);

        shinyDot(x, y, radius, color);
    };

    const shinyDot = (x: number, y: number, radius: number, color: string) => {
        // draw a circle
        const complimentaryColor = p.random(PALLETTE.filter((c) => c != color));
        gradientFill(x - radius / 2, y + radius / 2, x + radius / 2, y - radius / 2, [complimentaryColor, color]);

        p.noStroke();

        p.circle(x, y, radius);

        arc(
            x,
            y,
            radius * HIGHLIGHT_RADIUS_FACTOR,
            HIGHLIGHT_WIDTH,
            HIGHTLIGHT_START,
            HIGHLIGHT_END,
            saturate(brighten(color, HIGHLIGHT_LIGHTEN_FACTOR), HIGHLIGHT_SATURATION_FACTOR),
        );
    };

    const arc = (
        x: number,
        y: number,
        radius: number,
        width: number,
        start: number,
        stop: number,
        color: string,
    ): void => {
        p.push();
        p.noFill();
        p.stroke(color);
        p.strokeWeight(width);

        p.arc(x, y, radius, radius, start, stop);
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

    const createLinearGradient = (
        x0: number,
        y0: number,
        x1: number,
        y1: number,
        colorStops: string[],
    ): CanvasGradient => {
        const gradient = drawingContext.createLinearGradient(x0, y0, x1, y1);
        colorStops.forEach((color, index) => gradient.addColorStop(index, color));
        return gradient;
    };

    const gradientFill = (x0: number, y0: number, x1: number, y1: number, colorStops: string[]) => {
        const gradient = createLinearGradient(x0, y0, x1, y1, colorStops);
        drawingContext.fillStyle = gradient;
    };

    const gradientStroke = (x0: number, y0: number, x1: number, y1: number, colorStops: string[]) => {
        const gradient = createLinearGradient(x0, y0, x1, y1, colorStops);
        drawingContext.strokeStyle = gradient;
    };

    const backgroundGradient = (colorStops: string[]) => {
        p.push();
        gradientFill(0, p.height, p.width, 0, colorStops);
        p.rectMode(p.CORNER);
        p.noStroke();
        p.rect(0, 0, p.width, p.height);
        p.pop();
    };

    const foreGround = () => {
        p.push();
        p.blendMode(p.OVERLAY);

        p.noFill();
        const fgGrid = new Grid(DASH_AMOUNT, DASH_AMOUNT * 1.666, CANVAS_WIDTH, CANVAS_HEIGHT);

        fgGrid.draw((point) => {
            chance(DASH_CHANCE) ? drawDash(point.x, point.y) : drawCircle(point.x, point.y);
        }, selectRandom(BG_CHANCE));
        p.pop();
    };

    const drawDash = (x: number, y: number) => {
        // DASHES
        p.stroke(BG_PATTERN_COLOR);
        p.strokeWeight(objectRelative.values[10]);
        dash(x, y, DASH_WIDTH, DASH_HEIGHT);
    };

    const drawCircle = (x: number, y: number) => {
        p.noStroke();
        p.fill(BG_PATTERN_COLOR);
        p.circle(x, y, objectRelative.values[66]);
    };

    const titleText = () => {
        p.push();
        p.blendMode(p.MULTIPLY);
        p.textSize(canvasW.values[300]);
        p.textStyle(p.BOLD);
        p.textFont(font);
        p.fill(0, 0.1);
        p.text('DANCE \nPEACHY', canvasW.values[500], canvasH.values[500]);
        p.pop();
    };

    const backgroundPattern = (normalizedValue: number): number => {
        const x = normalizedValue * Math.PI * 2;
        const offset = Math.PI / 2;
        const y = Math.sin(x + offset);
        // normalize output
        return 1 - (y + 1) / 2;
    };
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const myP5 = new p5(s);
