import p5 from 'p5';
import { cols, Condition, ConditionCreator, createGrid, Grid, GridPoint, odd } from 'pretty-grid';
import { FileClient, getCanvasImage } from 'p5-file-client';

const CANVAS_WIDTH = 5000;
const CANVAS_HEIGHT = 5000;

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

const NOISE_SCALE = 0.0005;

const s = (p: p5) => {
    let fileClient: FileClient;
    const sketchName = 'g04';
    let seed = 0;

    // p.preload = () => {};
    p.setup = () => {
        const canvas = p.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
        canvas.parent('sketch');
        p.colorMode(p.RGB, 255, 255, 255);
        p.noStroke();
        p.noLoop();

        p.background('#000');

        //   SAVE SKETCH PROGRESS USING CUSTOM CLIENT
        fileClient = new FileClient(
            undefined,
            undefined,
            `/Users/VadimHome/Documents/Projects/p5-projects/genuary24/${sketchName}/progress`,
        );
    };
    p.draw = () => {
        seed = p.random(100000);
        p.randomSeed(seed);
        p.noiseSeed(seed);

        p.noiseDetail(1, 0.5);

        grid.every((point, col, row) => {
            // p.rect(point.x, point.y, GRID_TILE_SIZE_W, GRID_TILE_SIZE_H);

            for (let i = 0; i < 3; i++) {
                let r = 0,
                    g = 0,
                    b = 0;
                const value =
                    p.noise(
                        (point.x + RGB_NOISE_OFFSET * i) * NOISE_SCALE,
                        (point.y + RGB_NOISE_OFFSET) * NOISE_SCALE,
                    ) *
                        255 +
                    INTENSITY_OFFSET;

                if (i === 0) {
                    r = value;
                } else if (i === 1) {
                    g = value;
                } else if (i === 2) {
                    b = value;
                }

                p.fill(r, g, b, 255);

                // p.circle(point.x + pixelPoint.x, point.y + pixelPoint.y, GRID_TILE_SIZE_W / 3);
                p.rect(point.x + i * PIXEL_COLOR_SIZE_W, point.y, PIXEL_COLOR_SIZE_W, PIXEL_COLOR_SIZE_H);
            }
        });

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
