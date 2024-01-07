import p5 from 'p5';
import { cols, Condition, ConditionCreator, createGrid, Grid, GridPoint, odd } from 'pretty-grid';
// import { FileClient, getCanvasImage } from 'p5-file-client';

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
    let particles: Particle[] = [];

    // let fileClient: FileClient;
    const sketchName = 'g01';
    let seed = 0;

    // p.preload = () => {};

    p.setup = () => {
        const canvas = p.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
        canvas.parent('sketch');
        p.colorMode(p.HSB, 360, 100, 100, 100);
        p.frameRate(20);
        seed = randomInt(0, 1000000);
        p.randomSeed(seed);
        p.noStroke();
        // p.noLoop();

        // SAVE SKETCH PROGRESS USING CUSTOM CLIENT
        // fileClient = new FileClient(
        //     undefined,
        //     undefined,
        //     `/home/vadim/Projects/creative-coding/p5-projects/genuary24/${sketchName}/progress`,
        // );
        p.background(0);
    };

    p.draw = () => {
        // p.background(0);

        p.fill(0, 0, 0);

        grid.every((point) => {
            p.rect(point.x, point.y, GRID_TILE_SIZE, GRID_TILE_SIZE);
        }, odd());

        const birthAmount = randomInt(BIRTH_AMOUNT_MIN, BIRTH_AMOUNT_MAX);

        for (let i = 0; i < birthAmount; i++) {
            particles.push(new Particle(0, 0));
        }

        for (let particle of particles) {
            const gx = p.randomGaussian(0, 0.5);
            const gy = p.randomGaussian(0, 0.5);

            let gravity = p.createVector(gx, gy);
            particle.applyForce(gravity);
            particle.update();

            const vector = particle.get();
            p.fill(particle.color);
            p.circle(vector.x, vector.y, particle.r * 2);

            const color2 = p.color(HUE2, p.saturation(particle.color), p.brightness(particle.color));

            p.fill(color2);

            p.circle(p.width - vector.x, p.height - vector.y, particle.r * 2);
        }

        // DELETE particles that are finished
        for (let i = particles.length - 1; i >= 0; i--) {
            if (particles[i].finished()) {
                particles.splice(i, 1);
            }
        }

        // EXPORT
        // const image64 = getCanvasImage('sketch');
        // fileClient.exportImage64(image64, '.png', `${sketchName}_${seed}`);
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

    class Particle {
        pos: p5.Vector;
        vel: p5.Vector;
        acc: p5.Vector;
        r: number;
        lifetime: number;
        color: p5.Color;

        constructor(x: number, y: number) {
            this.pos = p.createVector(x, y);
            this.vel = p5.Vector.random2D();
            this.vel.mult(p.random(0.5, 1));
            this.acc = p.createVector(0, 0);
            this.r = 2;
            this.lifetime = 500;

            const saturation = p.random(50, 100);
            const brightness = p.random(50, 100);

            this.color = p.color(HUE1, saturation, brightness);
        }

        finished() {
            return this.lifetime < 0;
        }

        applyForce(force: p5.Vector) {
            this.acc.add(force);
        }

        edges() {
            if (this.pos.y >= p.height - this.r) {
                this.pos.y = p.height - this.r;
                this.vel.y *= -1;
            }

            if (this.pos.x >= p.width - this.r) {
                this.pos.x = p.width - this.r;
                this.vel.x *= -1;
            } else if (this.pos.x <= this.r) {
                this.pos.x = this.r;
                this.vel.x *= -1;
            }
        }

        update() {
            this.vel.add(this.acc);
            this.pos.add(this.vel);
            this.acc.set(0, 0);

            this.lifetime -= 1;
        }

        get() {
            return this.pos;
        }
    }
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const myP5 = new p5(s);
