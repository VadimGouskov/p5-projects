import p5 from 'p5';
import { cols, Condition, ConditionCreator, Grid, GridFunction, GridPoint } from 'pretty-grid';
import { interpolate } from "flubber" // ES6
import { fillPath } from './helpers/fill-path';
import { loadSvgPath } from './helpers/load-svg-path';
import { centerScale } from './helpers/center-scale';
import svgPath from 'svgpath';
import { strokePath } from './helpers/stroke-path';
import { settings } from './settings';

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
            const mainPath = interpolator(morph);
            p.translate(x, y)

            // Primary shape
            p.fill(settings.colors.primary);
            fillPath(canvasHandle, mainPath);

            // Ghost stroke
            p.stroke(settings.colors.secondary);
            
            const ghostStroke = svgPath(interpolator(morph + random(-0.1, 0.1)))
                                        .translate(
                                        random(-SHAPE_SCALE_X * 0.1, SHAPE_SCALE_X * 0.1),
                                        random(-SHAPE_SCALE_Y * 0.1, SHAPE_SCALE_Y * 0.1 )).toString();

            strokePath(canvasHandle, ghostStroke);

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

    const random = (min: number, max: number) =>  {
        return Math.random() * (max - min) + min;
    } 

    const chance = (amount: number) => {
        return p.random() < amount;
    };
};

const myP5 = new p5(s);

