import p5 from 'p5';
import { cols, Condition, ConditionCreator, Grid, GridFunction, GridPoint, GridShape } from 'pretty-grid';
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
import { Quadratic, quadraticWave } from './helpers/bezier-wave';

// FLOCK
const CANVAS_WIDTH = 2000;
const CANVAS_HEIGHT = 2000;
const FLOCK_ROWS = 12;
const FLOCK_COLS = 12;
const SHAPE_SCALE_X = CANVAS_WIDTH / FLOCK_COLS;
const SHAPE_SCALE_Y = CANVAS_HEIGHT / FLOCK_ROWS;
const FLOCK_SCALE = 0.6
const FLOCK_SCATTER = 3;
const FLOCK_PERIODS = 1;
const FLOCK_WAVE_AMPLITUDE = 0.02;
const FLOCK_WAVE_SCALE_WEIGHT = 0.4;
let bgGrid: Grid;


const BG_ROWS = 500;
const BG_COLS = 500;
const BG_SHAPE_SCALE_X = CANVAS_WIDTH / BG_COLS * 1.4;
const BG_SHAPE_SCALE_Y = CANVAS_HEIGHT / BG_ROWS * 1.4;
let baseGrid: Grid;

// OCEAN
const OCEAN_PERIODS = 4;
const OCEAN_AMPLITUDE = CANVAS_HEIGHT / 50;
const OCEAN_ACCENT_WIDTH = CANVAS_HEIGHT / 600;

// SUN
const SUN_DIAMETER = CANVAS_WIDTH * 0.666;
const SUN_X = CANVAS_WIDTH / 2
const SUN_Y = CANVAS_HEIGHT / 2;

// RADIATION
const RADIATION_COLS = 1000;
const RADIATION_ROWS = 40;
const RADIATION_CHANCE_OFFSET = -0.3;
const RADIATION_DIAMETER = 4;

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
        baseGrid = new Grid(FLOCK_COLS, FLOCK_ROWS, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Transform Grid
        const f = Math.PI * FLOCK_SCATTER * FLOCK_PERIODS;
        const waveA = CANVAS_HEIGHT * FLOCK_WAVE_AMPLITUDE
        const offset = random(-Math.PI, Math.PI)

        const flockA = waveA * FLOCK_SCATTER;

        baseGrid.get()
            .map(scatterTransformer(flockA, CANVAS_HEIGHT, (point) => Math.exp((1 - point.y / CANVAS_HEIGHT) * 1.4) - 1))
            .map(waveTransformer(f, waveA, offset, CANVAS_HEIGHT, (point) => point.y / CANVAS_HEIGHT))

        // INIT
        seed = randomInt(0, 1000000);
        p.randomSeed(seed);
    };

    p.draw = () => {
        // TODO: improve initialization
        if (!canvasHandle) {
            canvasHandle = document.getElementsByTagName('canvas')[0];  // not elegant code but it's just an example
        }

        if (!bgInterpolator) return;

        p.background(settings.colors.sky);



        // OCEAN
        p.push();
        centerScale(p, CANVAS_WIDTH, CANVAS_HEIGHT, 1.01)
        p.fill(settings.colors.water)
        p.stroke("white");
        p.strokeWeight(OCEAN_ACCENT_WIDTH);
        drawOcean(p);

        p.pop()

        // SUN
        drawMaskedSun();



        //FLOCK
        p.push();
        centerScale(p, CANVAS_WIDTH, CANVAS_HEIGHT, FLOCK_SCALE);
        drawFlock();
        p.pop();






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

    const chance = (amount: number) => {
        return p.random() < amount;
    };


    const randomInt = (min: number, max: number): number => Math.floor(p.random(min, max + 1));

    const drawBgGrid = () => {
        p.fill(settings.colors.sky);
        bgGrid.draw(({ x, y }) => {
            p.push()

            const morph = y / CANVAS_HEIGHT;
            const bgPath = bgInterpolator(morph);
            p.translate(x, y)

            fillPath(canvasHandle, bgPath);

            p.pop();
        })
    }

    const drawRadiation = () => {
        const radiationGrid = new Grid(RADIATION_COLS, RADIATION_ROWS, CANVAS_WIDTH * 1.5, CANVAS_HEIGHT * 1.5, GridShape.ELLIPSE);
        radiationGrid.translate(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2)
        radiationGrid.draw(point => {
            p.noStroke();
            p.fill(settings.colors.submergedSun);
            p.circle(point.x, point.y, RADIATION_DIAMETER)
        }, (point, col, row) => {
            if (!row) {
                return true
            }
            return chance(1 - row / RADIATION_ROWS + RADIATION_CHANCE_OFFSET);
        })
    }

    const drawMaskedSun = () => {
        // SUN
        p.fill(settings.colors.sun)

        const bgGraphics = p.createGraphics(CANVAS_WIDTH, CANVAS_HEIGHT);
        const bgMask = p.createGraphics(CANVAS_WIDTH, CANVAS_HEIGHT);
        const maskColor = bgMask.color(0, 255);
        bgMask.fill(maskColor)
        bgMask.circle(SUN_X, SUN_Y, SUN_DIAMETER)

        bgGraphics.background(settings.colors.sun);
        // OCEAN
        bgGraphics.fill(settings.colors.submergedSun);
        bgGraphics.noStroke();
        bgGraphics.strokeWeight(3)
        drawOcean(bgGraphics);

        const maskedBg = bgGraphics.get()
        maskedBg.mask(bgMask.get());

        p.image(maskedBg, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    }

    const drawOcean = (pg: p5) => {
        const wave = quadraticWave(0, CANVAS_HEIGHT / 2, CANVAS_WIDTH, OCEAN_AMPLITUDE, OCEAN_PERIODS);


        pg.beginShape();
        pg.vertex(0, CANVAS_HEIGHT);

        drawQuadratic(pg, wave);

        pg.vertex(CANVAS_WIDTH, CANVAS_HEIGHT);
        pg.endShape();

        // // LINE
        // p.noFill();
        // p.stroke("white");
        // p.strokeWeight(3);
        // p.beginShape();

        // drawQuadratic(wave);

        // p.endShape();
    }

    const drawQuadratic = (pg: p5, wave: Quadratic[]) => {
        wave.forEach(t => {
            pg.vertex(t.x1, t.y1);
            pg.quadraticVertex(t.cx, t.cy, t.x2, t.y2);
        })
    }
    // type BLEND_MODE =
    // | BLEND
    // | DARKEST
    // | LIGHTEST
    // | DIFFERENCE
    // | MULTIPLY
    // | EXCLUSION
    // | SCREEN
    // | REPLACE
    // | OVERLAY
    // | HARD_LIGHT
    // | SOFT_LIGHT
    // | DODGE
    // | BURN
    // | ADD
    // | NORMAL;

    const drawFlock = () => {
        if (!interpolator) return;



        // Primary shape
        p.fill(settings.colors.birds);
        // Ghost stroke
        // p.stroke(settings.colors.secondary);

        const counterScale = 1 / FLOCK_SCALE;
        const mask = p.createGraphics(CANVAS_WIDTH * counterScale, CANVAS_HEIGHT * counterScale);
        const maskDiameter = SUN_DIAMETER * 1.05;

        // mask.background("#ffff")
        mask.fill("#fff");
        mask.circle(SUN_X, SUN_Y, maskDiameter * counterScale)




        baseGrid
            .draw(({ x, y }, col, row) => {

                p.push()
                const morph = y / CANVAS_HEIGHT;
                const mainPath = interpolator(morph);
                p.translate(x, y)

                if (!row) return;
                const scale = 1 + Math.min(0, Math.cos(row! / FLOCK_ROWS * Math.PI * 2) * FLOCK_WAVE_SCALE_WEIGHT)
                p.scale(scale);

                fillPath(canvasHandle, mainPath);

                const ghostStroke = svgPath(interpolator(morph + random(-0.1, 0.1)))
                    .translate(
                        random(-SHAPE_SCALE_X * 0.1, SHAPE_SCALE_X * 0.1),
                        random(-SHAPE_SCALE_Y * 0.1, SHAPE_SCALE_Y * 0.1)).toString();


                //strokePath(canvasHandle, ghostStroke);

                p.pop();
            }, (point, col, row) => {
                if (!row) return false;

                const maskPixel = mask.get(point.x, point.y);

                if (row < FLOCK_ROWS / 2) { return true }

                return (maskPixel[3] !== 0);

            });
    }
};

const myP5 = new p5(s);

