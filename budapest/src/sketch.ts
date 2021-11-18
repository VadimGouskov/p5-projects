import p5 from 'p5';
import * as p5File from 'p5-file-client';
import { Grid } from './grid';
import { Arc } from './arc';
import { TowerGrid } from './tower-grid';

type ArcGrid = (ArcElement|undefined)[][][];

const s = (p: p5) => {
    const CANVAS_WIDTH = 500;
    const CANVAS_HEIGHT = 500;
    const SKETCH_ID = 'sketch';
    let fileClient : p5File.FileClient; 

    // SETTINGS
    const GRID_WIDTH = CANVAS_WIDTH;
    const TOWER_RINGS_AMOUNT = 5; // :warning: Must be uneven number :warning:
    const GRID_ROWS = 5;
    const GRID_COLS = 5;
    const STROKE_WIDTH = 5;

    // Pallette https://coolors.co/003049-d62828-f77f00-fcbf49-eae2b7
    const PALETTE = ["#d62828", "#f77f00", "#fcbf49"];
    const BG_COLOR = "#003049";
    const SHAPE_SIZE = STROKE_WIDTH;

    let primaryGrid: TowerGrid;
    let secondaryGrid: TowerGrid

    p.setup = () => {
        const canvas = p.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
        canvas.parent(SKETCH_ID);
        p.noLoop();
        p.colorMode(p.HSB, 1);
        p.rectMode(p.CENTER);
        fileClient = new p5File.FileClient(undefined, undefined, '/home/vadim/Projects/creative-coding/p5-projects/budapest/progress');
        
        primaryGrid = new TowerGrid(p, GRID_ROWS, GRID_ROWS, GRID_WIDTH, TOWER_RINGS_AMOUNT);
        secondaryGrid = new TowerGrid(p, 3, 3, GRID_WIDTH, TOWER_RINGS_AMOUNT);
        
        primaryGrid.setColorPalette(PALETTE);
        secondaryGrid.setColorPalette(PALETTE);

        primaryGrid.setStrokeColor(BG_COLOR);
        secondaryGrid.setStrokeColor(BG_COLOR);
    };

    p.draw = () => {
        p.background(BG_COLOR);
        p.translate(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
        p.scale(0.6);
        p.translate(-CANVAS_WIDTH / 2, -CANVAS_HEIGHT / 2);
        
        secondaryGrid.show();
        primaryGrid.show();

        // SHAPES
        drawShapeGrid(new Grid(GRID_ROWS, GRID_COLS, GRID_WIDTH, GRID_WIDTH));
        
        // EXPORT        
        const image64 = p5File.getCanvasImage(SKETCH_ID);
        fileClient.exportImage64(image64, '.png', 'budapest');
    };

    const drawShapeGrid = (grid: Grid) => {
        p.push();
        p.fill(BG_COLOR);
        p.strokeWeight(0);
        grid.flat.forEach(point => p.ellipse(point.x, point.y, SHAPE_SIZE, SHAPE_SIZE));
        p.pop();
    }

};

class ArcElement {
    constructor(public offset: number, public length: number) {}
}



// eslint-disable-next-line @typescript-eslint/no-unused-vars
const myP5 = new p5(s);
