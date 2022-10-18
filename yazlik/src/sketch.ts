import p5 from 'p5';
import { cols, Condition, ConditionCreator, Grid, GridFunction, GridPoint } from 'pretty-grid';
import { interpolate } from "flubber" // ES6
import { fillPath } from './helpers/fill-path';
import loadSvgFile from "load-svg-file/dist/load-svg-file.es6"
import svgpath from 'svgpath';
import { loadSvgPath } from './helpers/load-svg-path';
import { centerScale } from './helpers/center-scale';
import svgPath from 'svgpath';

const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 500;
const ROWS = 9;
const COLS = 9;
const SHAPE_SCALE_X = CANVAS_WIDTH / COLS; 
const SHAPE_SCALE_Y = CANVAS_HEIGHT / ROWS; 
const baseGrid = new Grid(COLS, ROWS , CANVAS_WIDTH, CANVAS_HEIGHT);


const s = (p: p5) => {
    let seed = 0;
    let canvasHandle: HTMLCanvasElement;

    // p.preload = () => {};
    let bird: string, fish: string;
    let interpolator: (input: number) => any;

     p.preload = () => {
        const initSvgs = async () => {
            const birdSvg = await loadSvgPath("public/bird.svg", SHAPE_SCALE_X, SHAPE_SCALE_Y);
            const fishSvg = await loadSvgPath("public/fish.svg", SHAPE_SCALE_X, SHAPE_SCALE_Y);
            bird = svgPath(birdSvg).translate(-SHAPE_SCALE_X /2, -SHAPE_SCALE_Y /2).toString();
            fish = svgPath(fishSvg).translate(-SHAPE_SCALE_X /2, -SHAPE_SCALE_Y /2).toString();

            interpolator = interpolate(bird, fish);
        }
        initSvgs();
    }

    p.setup = () => {
        const canvas = p.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);

        canvas.parent('sketch');
        // p.noLoop();

        // INIT
        seed = randomInt(0, 1000000);
        p.randomSeed(seed);
    };

    p.draw = () => {
        // TODO: improve initialization
        if(!canvasHandle) {
             canvasHandle = document.getElementsByTagName('canvas')[0];  // not elegant code but it's just an example
        } 

        p.background("blue");
        
        centerScale(p, CANVAS_WIDTH, CANVAS_HEIGHT, 0.7);

        // BASE GRID
        p.fill("white");
        baseGrid
        .draw(({x, y}) => {
            p.push()
            const morph = y / CANVAS_HEIGHT  ;
            const interpolatedPath = interpolator(morph);
            p.translate(x, y)
            fillPath(canvasHandle, interpolatedPath)
            p.pop(); 
        });

        //

        p.fill("#F00A")
        for(let i = 0; i < 5 ; i++) {
            p.push();
            const scale = 1 + Math.random() * 5;
            p.scale(scale);
            p.translate(CANVAS_WIDTH * Math.random() * 0.5, CANVAS_HEIGHT * Math.random() * 0.5 );
            fillPath(canvasHandle, bird);
            p.pop();
        }

        if(!!interpolator) p.noLoop();
        
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const myP5 = new p5(s);
