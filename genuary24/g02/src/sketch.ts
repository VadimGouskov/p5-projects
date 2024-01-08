import p5 from 'p5';
import { cols, Condition, ConditionCreator, createGrid, Grid, GridPoint, odd } from 'pretty-grid';
import { FileClient, getCanvasImage } from 'p5-file-client';

const CANVAS_WIDTH = 700;
const CANVAS_HEIGHT = 700;

const HUE1 = 30;
const HUE2 = 180;

const GRID_COLS = 8;
const GRID_ROWS = 8;

const GRID_TILE_SIZE = CANVAS_WIDTH / GRID_COLS;

const BIRTH_AMOUNT_MIN = 6;
const BIRTH_AMOUNT_MAX = 10;

const grid: Grid = createGrid({ cols: GRID_COLS, rows: GRID_ROWS, width: CANVAS_WIDTH, height: CANVAS_HEIGHT });

const s = (p: p5) => {
    let fileClient: FileClient;
    const sketchName = 'g02';
    let seed = 0;

    // GENRAL
    let noiseScale = 0.005;
    const LAYERS = 8;
    const LAYER_NOISE_OFFSET = 100;

    // HUE
    let hueNoiseScale = 120;
    const hueOffset = 0;
    const HUE_OFFSET_FACTOR = 90;

    // SATURATION
    let saturationNoiseScale = 15;
    let saturationBase = 100 - saturationNoiseScale;
    let saturationOffsetX = 10;

    // BRIGHTNESS
    let brightnessNoiseScale = 10;
    let brightnessBase = 100 - brightnessNoiseScale;
    let brightnessOffsetX = 5;

    // p.preload = () => {};
    p.setup = () => {
        const canvas = p.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
        canvas.parent('sketch');
        p.colorMode(p.HSB, 360, 100, 100, 100);
        p.noLoop();

        //   SAVE SKETCH PROGRESS USING CUSTOM CLIENT
        fileClient = new FileClient(
            undefined,
            undefined,
            `/Users/VadimHome/Documents/Projects/p5-projects/genuary24/${sketchName}/progress`,
        );
    };
    p.draw = () => {
        const backgroundColor = p.color(randomInt(0, 360), randomInt(50, 60), randomInt(brightnessBase, 90));
        p.background('white');

        for (let i = 0; i < LAYERS; i++) {
            const layerNoiseOffset = i * p.random(LAYER_NOISE_OFFSET);
            const layerHueOffset = i * HUE_OFFSET_FACTOR;

            for (let y = 0; y < p.height; y += 1) {
                for (let x = 0; x < p.width; x += 1) {
                    // Scale input coordinates.

                    let nx = noiseScale * x + layerNoiseOffset;
                    let ny = noiseScale * y + layerNoiseOffset;

                    // Compute noise value.
                    p.noiseDetail(2, 0.001 * (i + 1));
                    let h = (hueOffset + hueNoiseScale * p.noise(nx, ny) + layerHueOffset) % 360;
                    let s =
                        saturationBase + saturationNoiseScale * p.noise(nx + saturationOffsetX, ny + saturationOffsetX);
                    let b =
                        brightnessBase + brightnessNoiseScale * p.noise(nx + brightnessOffsetX, ny + brightnessOffsetX);
                    // Render left side.
                    p.stroke(h, s, b, 100);

                    // cuttoff point
                    // TODO make this dynamic
                    if (b > 92) continue;

                    p.point(x, y);
                }
            }
        }

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
