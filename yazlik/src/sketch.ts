import p5 from 'p5';
import { cols, Condition, ConditionCreator, Grid, GridFunction, GridPoint } from 'pretty-grid';
import { interpolate } from "flubber" // ES6
import { svgPath } from './helpers/svg-path';
import loadSvgFile from "load-svg-file/dist/load-svg-file.es6"

const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 1000;
const baseGrid = new Grid(20, 20 , CANVAS_WIDTH, CANVAS_HEIGHT);

const TRIANGLE = "M150 0 L75 200 L225 200 Z"
const CURVE = "M10 10 h 80 v 80 h -80 Z"

const s = (p: p5) => {
    let seed = 0;
    let canvasHandle: HTMLCanvasElement;
    let svg, targetPath: string;

    // p.preload = () => {};
    let interpolator: (input: number) => any;

     p.preload = () => {
        const targetName = "svg-target";
        const svgSrc = "bird.svg"
        svg = loadSvgFile(`public/${svgSrc}`, {
            class: 'svg-target', 
          }).then(() => {
            console.log('SVG Loaded successfully')
            const path = document.querySelector(`.${targetName} svg path`)
            targetPath = (path?.getAttribute("d") || "").replace(/[\r\n]/gm, '');
            interpolator = interpolate(TRIANGLE, targetPath);

            //console.log(targetPath)
        })
    }

    p.setup = () => {
        const canvas = p.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);

        canvas.parent('sketch');
        // p.noLoop();

        // INIT
        seed = randomInt(0, 1000000);
        p.randomSeed(seed);
        console.log("targetPath: ", targetPath)

    };

    p.draw = () => {
        // TODO: improve initialization
        if(!canvasHandle) {
             canvasHandle = document.getElementsByTagName('canvas')[0];  // not elegant code but it's just an example
        } 

        p.background("blue");
        p.fill(127);
        baseGrid.draw(({x, y}) => p.circle(x, y, 20) );


        const newPath = interpolator(p.mouseX / CANVAS_WIDTH);
        const path2D = new Path2D(newPath);
        p.translate(p.width/2, p.height/2)
        svgPath(canvasHandle, path2D)
        canvasHandle.getContext("2d")?.fill(path2D);
        

    };

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
