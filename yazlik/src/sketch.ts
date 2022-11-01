import p5 from 'p5';
import { cols, Condition, ConditionCreator, Grid, GridFunction, GridPoint } from 'pretty-grid';
import { interpolate } from "flubber" // ES6
import { fillPath } from './helpers/fill-path';
import { loadSvgPath } from './helpers/load-svg-path';
import { centerScale } from './helpers/center-scale';
import svgPath from 'svgpath';
import { strokePath } from './helpers/stroke-path';
import { settings } from './settings';
import { waveTransformer } from './grid-transformers/wave-transformer';
import { random } from './helpers/random';
import { scatterTransformer } from './grid-transformers/scatter-transformer';

const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 500;
const ROWS = 20;
const COLS = 20;
const SHAPE_SCALE_X = CANVAS_WIDTH / COLS;
const SHAPE_SCALE_Y = CANVAS_HEIGHT / ROWS;
let bgGrid: Grid;

const BG_ROWS = 60;
const BG_COLS = 60
const BG_SHAPE_SCALE_X = CANVAS_WIDTH / BG_COLS * 1.4;
const BG_SHAPE_SCALE_Y = CANVAS_HEIGHT / BG_ROWS * 1.4;
let baseGrid: Grid;

const s = (p: p5) => {
    let seed = 0;
    let canvasHandle: HTMLCanvasElement;

    // p.preload = () => {};
    let interpolator: (input: number) => any;
    let bgInterpolator: (input: number) => any;

    p.preload = () => {
        const initSvgs = async () => {
            const birdSvg = await loadSvgPath("public/bird.svg", SHAPE_SCALE_X, SHAPE_SCALE_Y);
            const fishSvg = await loadSvgPath("public/fish.svg", SHAPE_SCALE_X, SHAPE_SCALE_Y);
            const bird = svgPath(birdSvg).translate(-SHAPE_SCALE_X / 2, -SHAPE_SCALE_Y / 2).toString();
            const fish = svgPath(fishSvg).translate(-SHAPE_SCALE_X / 2, -SHAPE_SCALE_Y / 2).toString();

            interpolator = interpolate(bird, fish);

            const bgBirdSvg = await loadSvgPath("public/bird.svg", BG_SHAPE_SCALE_X, BG_SHAPE_SCALE_Y);
            const bgFishSvg = await loadSvgPath("public/fish.svg", BG_SHAPE_SCALE_X, BG_SHAPE_SCALE_Y);
            const bgBird = svgPath(bgBirdSvg).translate(-BG_SHAPE_SCALE_X / 2, -BG_SHAPE_SCALE_Y / 2).toString();
            const bgFish = svgPath(bgFishSvg).translate(-BG_SHAPE_SCALE_X / 2, -BG_SHAPE_SCALE_Y / 2).toString();

            bgInterpolator = interpolate(bgBird, bgFish);
            console.log(bgInterpolator)

        }
        initSvgs();
    }

    p.setup = () => {
        const canvas = p.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);

        canvas.parent('sketch');
        // p.noLoop();

        // Init Bg grid
        bgGrid = new Grid(BG_COLS, BG_ROWS, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Init Grid
        baseGrid = new Grid(COLS, ROWS, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Transform Grid
        const f = Math.PI * 5;
        const waveA = CANVAS_HEIGHT * 0.025
        const offset = random(-Math.PI, Math.PI)

        const flockA = waveA * 1.5;

        baseGrid.get()
            .map(scatterTransformer(flockA, CANVAS_HEIGHT, (point) => 1 - point.y / CANVAS_HEIGHT))
            .map(waveTransformer(f, waveA, offset, CANVAS_HEIGHT, (point) => point.y / CANVAS_HEIGHT));

        // INIT
        seed = randomInt(0, 1000000);
        p.randomSeed(seed);
    };

    p.draw = () => {
        // TODO: improve initialization
        if (!canvasHandle) {
            canvasHandle = document.getElementsByTagName('canvas')[0];  // not elegant code but it's just an example
        }

        if (!bgInterpolator || !interpolator) return;

        p.background("blue");

        // const drawingContext = canvasHandle.getContext("2d")!;
        // drawingContext.shadowOffsetX = 5;
        // drawingContext.shadowOffsetX = -5;
        // drawingContext.shadowColor = 'black';



        //Draw Background grid
        /*
        p.fill(settings.colors.tertiary);
        bgGrid.draw(({x, y}) => {
            p.push()
    
            const morph = y / CANVAS_HEIGHT  ;
            const bgPath = bgInterpolator(morph);
            p.translate(x, y)
            
            fillPath(canvasHandle, bgPath);
    
            p.pop();
        })
        */

        // Draw Grid
        centerScale(p, CANVAS_WIDTH, CANVAS_HEIGHT, 0.7);

        // Primary shape
        p.fill(settings.colors.primary);
        // Ghost stroke
        p.stroke(settings.colors.secondary);

        baseGrid
            .draw(({ x, y }) => {
                p.push()
                const morph = y / CANVAS_HEIGHT;
                const mainPath = interpolator(morph);
                p.translate(x, y)

                fillPath(canvasHandle, mainPath);

                const ghostStroke = svgPath(interpolator(morph + random(-0.1, 0.1)))
                    .translate(
                        random(-SHAPE_SCALE_X * 0.1, SHAPE_SCALE_X * 0.1),
                        random(-SHAPE_SCALE_Y * 0.1, SHAPE_SCALE_Y * 0.1)).toString();


                //strokePath(canvasHandle, ghostStroke);

                p.pop();
            });

        //

        // p.fill("#F00A")
        // for(let i = 0; i < 5 ; i++) {
        //     p.push();
        //     const scale = 1 + Math.random() * 5;
        //     p.scale(scale);
        //     p.translate(CANVAS_WIDTH * Math.random() * 0.5, CANVAS_HEIGHT * Math.random() * 0.5 );
        //     fillPath(canvasHandle, bird);
        //     p.pop();
        // }

        if (!!interpolator && !!bgInterpolator) p.noLoop();

    };

    p.keyPressed = () => {
        if (p.key === "S") {
            const timestamp = Date.now()
            p.save(`yazlik_${timestamp}`);
        }
    }

    p.mouseClicked = () => {
        p.redraw();
    };


    const randomInt = (min: number, max: number): number => Math.floor(p.random(min, max + 1));


    const chance = (amount: number) => {
        return p.random() < amount;
    };
};

const myP5 = new p5(s);

