import p5 from 'p5';
import { cols, Condition, ConditionCreator, createGrid, Grid, GridPoint, odd } from 'pretty-grid';
import { FileClient, getCanvasImage } from 'p5-file-client';

const GRAPHICS_WIDTH = 2000;
const GRAPHICS_HEIGHT = 2000;

const PREVIEW_WIDTH = 500;
const PREVIEW_HEIGHT = 500;

const HUE1 = 30;
const HUE2 = 180;

const HUEOFFSET = 30;

const SATURATION_OFFSET = 30;
const BRIGHTNESS_OFFSET = 30;

const GRID_COLS = 5;
const GRID_ROWS = 5;

const GRID_TILE_SIZE_W = GRAPHICS_WIDTH / (GRID_COLS + 1);
const GRID_TILE_SIZE_H = GRAPHICS_HEIGHT / (GRID_ROWS + 1);

const SUB_GRID_COLS = 5;
const SUB_GRID_ROWS = 5;

const SUBGRID_TILE_WIDTH = GRID_TILE_SIZE_W / (SUB_GRID_COLS + 1);
const SUBGRID_TILE_HEIGHT = GRID_TILE_SIZE_H / (SUB_GRID_ROWS + 1);

const grid: Grid = createGrid({
    cols: GRID_COLS,
    rows: GRID_ROWS,
    width: GRAPHICS_WIDTH - GRID_TILE_SIZE_W,
    height: GRAPHICS_HEIGHT - GRID_TILE_SIZE_H,
});
const subGrid: Grid = createGrid({
    cols: SUB_GRID_COLS,
    rows: SUB_GRID_ROWS,
    width: GRID_TILE_SIZE_W,
    height: GRID_TILE_SIZE_H,
});

const RGB_NOISE_OFFSET = 1000;

const NOISE_SCALE = 0.0001;

const LIVE = false;
const SPEED = 0.002;

let tSlider: p5.Element;

let t = 0;

let frameIndex = 0;

const s = (p: p5) => {
    let fileClient: FileClient;
    const sketchName = 'g13';
    const foldername = `progress`;
    let seed = 0;

    const pg = p.createGraphics(GRAPHICS_WIDTH, GRAPHICS_HEIGHT);

    p.createCanvas(GRAPHICS_WIDTH, GRAPHICS_HEIGHT);

    // p.preload = () => {};
    p.setup = () => {
        const canvas = p.createCanvas(PREVIEW_WIDTH, PREVIEW_HEIGHT);
        canvas.parent('sketch');

        p.colorMode(p.HSB, 360, 100, 100);
        p.noStroke();

        p.frameRate(3);

        p.loop();

        p.background('#000');

        seed = p.random(100000);
        p.randomSeed(seed);
        p.noiseSeed(seed);

        // //   SAVE SKETCH PROGRESS USING CUSTOM CLIENT
        // fileClient = new FileClient(
        //     undefined,
        //     undefined,
        //     `/Users/VadimHome/Documents/Projects/p5-projects/genuary24/${sketchName}/${foldername}`,
        // );

        // Init controls
        // tSlider = p.createSlider(0, 1, 0.1, 0.001);

        // tSlider.drop((value) => {
        //     p.redraw();
        // });
    };
    p.draw = () => {
        // HUD
        p.fill(255);
        p.textSize(16);

        const col: number = frameIndex % GRID_COLS;
        const row: number = Math.floor(frameIndex / GRID_COLS);

        const point = grid.getPoint(col, row);

        subGrid.every((subPoint: GridPoint) => {
            const H = p.random(HUE1 - HUEOFFSET, HUE1 + HUEOFFSET);
            const S = p.random(100 - SATURATION_OFFSET, 100);
            const B = p.random(100 - BRIGHTNESS_OFFSET, 100);

            const color = p.color(H, S, B);
            pg.fill(color);

            const x = subPoint.x + point.x;
            const y = subPoint.y + point.y;

            pg.rect(x, y, SUBGRID_TILE_WIDTH, SUBGRID_TILE_HEIGHT);
        });

        p.image(pg, 0, 0, PREVIEW_WIDTH, PREVIEW_HEIGHT);

        frameIndex++;

        if (frameIndex === GRID_COLS * GRID_ROWS) {
            p.noLoop();
            console.log('done');
            frameIndex = 0;

            // p.save(pg, `${sketchName}_${seed}_${frameIndex}.png`);
        }

        // EXPORT
        // if (!LIVE) {
        //     const image64 = getCanvasImage('sketch');
        //     fileClient.exportImage64(image64, '.png', `${sketchName}_${seed}`);
        // }
    };

    p.mouseClicked = () => {
        // p.redraw();
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
        p.translate(GRAPHICS_WIDTH / 2, GRAPHICS_HEIGHT / 2);
        p.scale(amount);
        p.translate(-GRAPHICS_WIDTH / 2, -GRAPHICS_HEIGHT / 2);
    };

    p.keyPressed = () => {
        if (p.keyCode === p.ENTER) {
            p.loop();
        }

        if (p.keyCode === p.BACKSPACE) {
            p.saveCanvas(`${sketchName}_${seed}`, 'png');
        }
    };
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const myP5 = new p5(s);
