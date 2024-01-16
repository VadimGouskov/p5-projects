import p5 from 'p5';
import { cols, Condition, ConditionCreator, createGrid, Grid, GridPoint, odd } from 'pretty-grid';
import { FileClient, getCanvasImage } from 'p5-file-client';

const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 500;

const HUE1 = 30;
const HUE2 = 180;

const INTENSITY_OFFSET = 108;

const GRID_COLS = 200;
const GRID_ROWS = 200;

const GRID_TILE_SIZE_W = CANVAS_WIDTH / GRID_COLS;
const GRID_TILE_SIZE_H = CANVAS_HEIGHT / GRID_ROWS;

// TODO: why do I need to divide by 2? and why do I need to multiply by 1.5?
const PIXEL_COLOR_SIZE_W = GRID_TILE_SIZE_W / 3;
const PIXEL_COLOR_SIZE_H = GRID_TILE_SIZE_H;

const grid: Grid = createGrid({ cols: GRID_COLS, rows: GRID_ROWS, width: CANVAS_WIDTH, height: CANVAS_HEIGHT });

const RGB_NOISE_OFFSET = 1000;

const NOISE_SCALE = 0.0001;

const LIVE = false;
const SPEED = 0.002;

let tSlider: p5.Element;

let t = 0;

const s = (p: p5) => {
    let fileClient: FileClient;
    const sketchName = 'g13';
    const foldername = `progress`;
    let seed = 0;

    // p.preload = () => {};
    p.setup = () => {
        const canvas = p.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
        canvas.parent('sketch');
        p.colorMode(p.HSB, 360, 100, 100);
        p.noStroke();

        p.frameRate(5);

        if (!LIVE) {
            p.noLoop();
        }

        p.background('#000');

        //   SAVE SKETCH PROGRESS USING CUSTOM CLIENT
        fileClient = new FileClient(
            undefined,
            undefined,
            `/Users/VadimHome/Documents/Projects/p5-projects/genuary24/${sketchName}/${foldername}`,
        );

        // Init controls
        tSlider = p.createSlider(0, 1, 0.1, 0.001);

        tSlider.drop((value) => {
            p.redraw();
        });
    };
    p.draw = () => {
        seed = p.random(100000);
        p.randomSeed(seed);
        p.noiseSeed(seed);

        centerScale(0.8);

        p.background('#000');

        console.log('drawing');

        t = tSlider.value() as number;

        console.log('slider in draw', tSlider.value());
        console.log('t', t);

        const A = p.PI / 400,
            B = 5,
            C = 5;

        const D = 2.5,
            E = 5,
            F = 50,
            G = 5;

        const H = 0.02,
            I = 5,
            J = 5,
            K = 5,
            L = 5,
            M = 5;
        const N = 5;

        const AMP = p.height / 2;

        p.stroke('#f0f');
        p.strokeWeight(1);

        for (let col = 0; col < p.width; col++) {
            for (let row = 0; row < p.height; row++) {
                // const y = AMP * p.sin(A * col + B * t + C) + p.height / 2;

                // const y = AMP * p.sin(A * col + B * t + C + D * p.sin(E * row + F * t + G)) + p.height / 2;

                const w0 = AMP * p.sin(A * col + B * t + C + D * p.sin(E * row + F * t + G)) + p.height / 2;
                const w1 = AMP * p.sin(H * col + I * t + J + K * p.sin(L * row + M * t + N)) + p.height / 2;

                const y = (w0 + w1) / 2;

                p.stroke(p.sin(E * row + F * t + G) * 360);

                p.point(col, y);
            }
        }

        // HUD
        p.fill(255);
        p.textSize(16);
        p.text(`t: ${t}`, 10, 10);

        // EXPORT
        if (!LIVE) {
            const image64 = getCanvasImage('sketch');
            fileClient.exportImage64(image64, '.png', `${sketchName}_${seed}`);
        }
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

    const centerScale = (amount: number) => {
        p.translate(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
        p.scale(amount);
        p.translate(-CANVAS_WIDTH / 2, -CANVAS_HEIGHT / 2);
    };
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const myP5 = new p5(s);
