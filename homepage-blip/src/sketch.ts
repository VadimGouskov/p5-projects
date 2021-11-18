import p5 from 'p5';
import { Grid } from './grid';

const s = (p: p5) => {
    const CANVAS_WIDTH = 500;
    const CANVAS_HEIGHT = 500;

    const grid = new Grid(40, 40, CANVAS_HEIGHT, CANVAS_WIDTH)

    p.setup = () => {
        const canvas = p.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
        canvas.parent('sketch');
        p.noLoop();
    };

    p.draw = () => {
        centerScale(0.9)

        p.ellipseMode(p.CENTER);
        p.noStroke();
        p.fill("#f77f00");
        
        
        grid.flat.forEach(point => {
            p.ellipse(point.x, point.y, 5, 5);
        })


    };

    const centerScale = (amount: number) => {
        p.translate(CANVAS_WIDTH/2, CANVAS_HEIGHT/2);
        p.scale(amount);
        p.translate(-CANVAS_WIDTH/2, -CANVAS_HEIGHT/2);
    } 
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const myP5 = new p5(s);
