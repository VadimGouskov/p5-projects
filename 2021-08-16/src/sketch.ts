import p5 from 'p5';
import { Grid } from './grid';
import { random } from 'underscore';

const s = (p: p5) => {
    const CANVAS_WIDTH = 500;
    const CANVAS_HEIGHT = 500;
    const GRID_WIDTH = CANVAS_WIDTH * 0.66;
    const GRID_HEIGHT = CANVAS_HEIGHT * 0.66;

    const SHAPES_AMOUNT_X = 3;
    const SHAPES_AMOUNT_Y = 3;
    const SHAPES_SIZE = (GRID_WIDTH / (SHAPES_AMOUNT_X - 1)) * 0.66;

    const MIN_SHAPES = 3;
    const MAX_SHAPES = 12;

    let grid: Grid;

    p.setup = () => {
        const canvas = p.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
        canvas.parent('sketch');
        // initializations
        p.rectMode(p.CENTER);
        p.ellipseMode(p.CENTER);
        p.noLoop();

        init();
    };

    p.draw = () => {
        p.background(255);
        p.translate(CANVAS_WIDTH / 2 - GRID_WIDTH / 2, CANVAS_HEIGHT / 2 - GRID_HEIGHT / 2);
        drawShapes();
    };

    const init = (): void => {
        grid = new Grid(SHAPES_AMOUNT_X, SHAPES_AMOUNT_Y, GRID_WIDTH, GRID_HEIGHT);
        p.redraw();
    };

    const drawShapes = (): void => {
        const shapesAmount = Math.floor(MIN_SHAPES + Math.random() * MAX_SHAPES);
        let i;
        let point;

        for (i = 0; i < shapesAmount; i++) {
            const xIndex = random(0, SHAPES_AMOUNT_X - 1);
            const yindex = random(0, SHAPES_AMOUNT_Y - 1);

            point = grid.getPoint(xIndex, yindex);

            if (Math.random() > 0.5) {
                p.fill(0);
                p.ellipse(point.x, point.y, SHAPES_SIZE, SHAPES_SIZE);
            } else {
                p.fill('#f00');
                p.rect(point.x, point.y, SHAPES_SIZE, SHAPES_SIZE);
            }
        }
    };

    p.mouseClicked = () => {
        init();
    };
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const myP5 = new p5(s);
