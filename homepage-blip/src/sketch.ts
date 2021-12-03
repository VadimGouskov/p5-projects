import p5 from 'p5';
import * as p5File from 'p5-file-client';
import { Grid } from './grid';

let fileClient : p5File.FileClient; 

const s = (p: p5) => {
    const SKETCH_ID = "sketch";
    const CANVAS_WIDTH = 500;
    const CANVAS_HEIGHT = 500;
    const POINTS_AMOUNT = 40;
    const POINT_SIZE = 5;

    let t = 0;
    const DT = 0.2;

    fileClient = new p5File.FileClient(undefined, undefined, '/home/vadim/Projects/creative-coding/p5-projects/homepage-blip/progress');

    const grid = new Grid(POINTS_AMOUNT, POINTS_AMOUNT, CANVAS_HEIGHT, CANVAS_WIDTH)

    p.setup = () => {
        const canvas = p.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
        canvas.parent(SKETCH_ID);
        p.frameRate(30)
        //p.noLoop();
    };

    p.draw = () => {
        centerScale(0.9)

        p.ellipseMode(p.CENTER);
        p.rectMode(p.CENTER);
        p.noStroke();
        p.fill("#f77f00");

        p.background(127);
        
        grid.flat.forEach(point => {
            const AMPLITUDE = 20;
            const FREQUENCY = 0.02;
            const OFFSET = p.PI;

            const pointVector = p.createVector(point.x, point.y);
            const movedVector = pointVector.copy();
            movedVector.setMag(pointVector.mag() + AMPLITUDE * Math.sin(t + pointVector.mag() * FREQUENCY + OFFSET));
            p.ellipse(movedVector.x, movedVector.y, POINT_SIZE, POINT_SIZE);
        })

        t += DT;
        
        //p.save("bl.png")

        // EXPORT        
        const image64 = p5File.getCanvasImage(SKETCH_ID);
        //fileClient.exportImage64(image64, '.png', 'homepage-blip');

    };

    const centerScale = (amount: number) => {
        p.translate(CANVAS_WIDTH/2, CANVAS_HEIGHT/2);
        p.scale(amount);
        p.translate(-CANVAS_WIDTH/2, -CANVAS_HEIGHT/2);
    } 

    const sinc = (x: number) => {
        if(x === 0) return 1;
        return Math.sin(x) / x;
    }

    
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const myP5 = new p5(s);
