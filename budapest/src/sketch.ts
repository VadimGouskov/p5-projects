import p5 from 'p5';
import * as p5File from 'p5-file-client';
import { Grid } from './grid';
import { Arc } from './arc';

type ArcGrid = (ArcElement|undefined)[][][];

const s = (p: p5) => {
    const CANVAS_WIDTH = 500;
    const CANVAS_HEIGHT = 500;
    const SKETCH_ID = 'sketch';
    let fileClient : p5File.FileClient; 
    
    // FOREGROUND
    let towerGrid: Grid;
    let arcGrid: ArcGrid;

    // FILL
    let fillGrid: Grid;
    let fillArcGrid: ArcGrid;
    
    // BACKGROUND
    let secondaryGrid: Grid;
    let secondaryArcGrid: ArcGrid;

    // SETTINGS
    const GRID_WIDTH = CANVAS_WIDTH;
    const TOWER_RINGS_AMOUNT = 5; // :warning: Must be uneven number :warning:
    const TOWER_RADIUS =  (GRID_WIDTH / TOWER_RINGS_AMOUNT);
    const GRID_ROWS = 5;
    const GRID_COLS = 5;
    const MAX_PATH_LENGTH = GRID_COLS * 2; // TODO better max length
    const STROKE_WIDTH = 5;

    const BASE_COLOR = 0;
    const BASE_BRIGHTNESS = 0.5;
    const MIN_SATURATION = 0.1;
    const MAX_SATURATION = 0.9;

    const SHAPE_SIZE = STROKE_WIDTH;

    let colorArray: Array<string> = new Array()

    p.setup = () => {
        const canvas = p.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
        canvas.parent(SKETCH_ID);
        p.noLoop();
        p.colorMode(p.HSB, 1);
        p.rectMode(p.CENTER);
        fileClient = new p5File.FileClient(undefined, undefined, '/home/vadim/Projects/creative-coding/p5-projects/budapest/progress');
        
        // FOREGROUND
        towerGrid = new Grid(GRID_COLS, GRID_ROWS, GRID_WIDTH, GRID_WIDTH);
        arcGrid = create3DArray();
        initArcGrid(arcGrid);

        // FILLGRID
        fillGrid = new Grid(GRID_COLS, GRID_ROWS, GRID_WIDTH, GRID_WIDTH);
        fillArcGrid = create3DArray();
        initArcGrid(fillArcGrid);

        // SECONDARY
        secondaryGrid = new Grid(3, 3, GRID_WIDTH, GRID_WIDTH);
        secondaryArcGrid = create3DArray();
        initArcGrid(secondaryArcGrid);
        
        colorArray = createColorPallete();
    };

    p.draw = () => {
        p.background(100);
        p.translate(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
        p.scale(0.666);
        p.translate(-CANVAS_WIDTH / 2, -CANVAS_HEIGHT / 2);

        p.fill(0);
        p.stroke(255)
        
        // FOREGROUND
        const towerGenerators = mapTowerGenerators(towerGrid, arcGrid);
        buildTowers(towerGenerators);

        /*
        // FILL: An extra layer 
        const fillTowerGenerators = mapTowerGenerators(fillGrid, fillArcGrid);
        buildTowers(fillTowerGenerators);
        */

        // SECONDARY
        const secondaryTowerGenerators = mapTowerGenerators(secondaryGrid, secondaryArcGrid);
        buildTowers(secondaryTowerGenerators);
        
        // SHAPES
        drawShapeGrid(towerGrid);

        // EXPORT        
        const image64 = p5File.getCanvasImage(SKETCH_ID);
        fileClient.exportImage64(image64, '.png', 'budapest');
    };

    const drawShapeGrid = (grid: Grid) => {
        p.push();
        p.fill('#fff');
        p.strokeWeight(0);
        grid.flat.forEach(point => p.ellipse(point.x, point.y, SHAPE_SIZE, SHAPE_SIZE));
        p.pop();
    }

    const mapTowerGenerators = (grid: Grid, arcGrid: ArcGrid) : Generator<undefined, void, unknown>[] => {
        return grid.get()
            .map((xPoints, yIndex) => xPoints.map((point, xIndex) => createTowerGenerator(arcGrid, point.x, point.y, xIndex, yIndex)()))
            .reduce((acc, val) => acc.concat(val), []); // flatten 2d array
    }

    const createTowerGenerator = (arcGrid: ArcGrid, x: number, y: number, xIndex: number, yIndex: number) => {
        return function* () {
            let i: number;
            const stepSize = TOWER_RADIUS / 2 ;

            // rest of the tower
            for(i = TOWER_RINGS_AMOUNT - 1; i >= 0; i--) {
                const arc = arcGrid[yIndex][xIndex][i];
                if(!!arc) {
                    const innerArc = new Arc(x, y, stepSize * (i + 1), stepSize * (i + 1), arc.offset, arc.length, (stepSize / 2) , STROKE_WIDTH, colorArray[i], '#fff');
                    innerArc.draw(p);
                }
                yield ;
            }
        }
    }

    const buildTowers = (towers: Generator[] ): void => {
        // TODO better stopping conditaion
        for(let i = 0; i < 1000; i++) {
            const index = randomInt(0, towers.length);
            const status = towers[index].next();
        }
    }

    const createColorPallete = (): Array<string> => {
        let colorPallete: Array<string> = new Array();

        // calculate half the pallete
        for(let i = 0; i <= TOWER_RINGS_AMOUNT / 2; i++) {
            let saturation = MIN_SATURATION + Math.random() * MAX_SATURATION
            let color = p.color(BASE_COLOR, saturation, BASE_BRIGHTNESS);
            colorPallete.push(color.toString())
        }

        // mirror the pallete
        const halfPallette = [...colorPallete];
        halfPallette.pop();
        colorPallete.push(...[...halfPallette].reverse());

        return colorPallete;
    }

    const randomInt = (min: number, max: number) => {
        return min + Math.floor(Math.random() * max);
    }

    const initArcGrid = (grid: ArcGrid): void => {
        for(let i = 0; i < 100; i ++){
            addArcPath(grid);
        }
    }

    const addArcPath = (grid: ArcGrid): void => {
        let end = randomInt(1,3) * p.HALF_PI;
        let yIndex = randomInt(0, GRID_COLS - 1);
        let xIndex = randomInt(0, GRID_ROWS - 1);
        let tower = randomInt(0, TOWER_RINGS_AMOUNT);
        let direction = 1;
        let to = 0, from = 0;

        for (let i = 0; i < MAX_PATH_LENGTH; i++) {
            

            tower = nextTower(tower, TOWER_RINGS_AMOUNT);
            yIndex = nextYIndex(yIndex, end, 1);
            xIndex = nextXIndex(xIndex, end, 1);
            
            // Keep the path inside the grid
            if(xIndex < 0 || xIndex >= GRID_COLS || yIndex < 0 || yIndex >= GRID_COLS) break;

            // calculate the arc
            const target = (end + p.PI) % p.TWO_PI;
            const length = randomInt(1, 2) * p.HALF_PI;

            if (direction === 1) {
                from = target;
                to = (target + length) % p.TWO_PI ;
                end = to;
            } else {
                from = (target - length) % p.TWO_PI;
                to = target;
                end = from;
            }

            // switch deirection
            direction = -direction;
            // save arc in path
            grid[yIndex][xIndex][tower] = new ArcElement(from, to );
        }
    }

    const addTestPath = () => {
        const startTower = 1;
        let tower: number;
        
        arcGrid[0][1][0] = new ArcElement( p.PI, p.HALF_PI + p.TWO_PI);
        
        /*
        arcGrid[0][1][1] = new ArcElement(0, p.HALF_PI);
        arcGrid[0][1][2] = new ArcElement(0 , p.HALF_PI );
        //arcGrid[0][1][3] = new ArcElement(0 , p.HALF_PI );
        arcGrid[0][1][4] = new ArcElement(0 , p.HALF_PI );

        arcGrid[1][1][0] = new ArcElement(p.PI, p.HALF_PI + p.PI);
        //arcGrid[1][1][1] = new ArcElement(p.PI, p.HALF_PI + p.PI);
        arcGrid[1][1][2] = new ArcElement(p.PI, p.HALF_PI + p.PI );
        arcGrid[1][1][3] = new ArcElement(p.PI, p.HALF_PI + p.PI );
        arcGrid[1][1][4] = new ArcElement(p.PI, p.HALF_PI + p.PI);
        */
    } 

    const nextYIndex = (prevYIndex: number, arcEnd: number, direction: number): number => {
        return Math.round(prevYIndex + Math.sin(arcEnd));
    }

    const nextXIndex = (prevXIndex: number, arcEnd: number, direction: number): number => {
        return Math.round(prevXIndex + Math.cos(arcEnd));
    }

    const nextTower = (prevTower: number, towerAmount: number): number => {
        // 2 * middleTowerIndex - prevTowerIndex;
        return (towerAmount - 1) - prevTower;
    }


    const create3DArray = (): undefined[][][] => {
        const base: undefined[][][] = [[[]]];
        for(let y = 0; y < GRID_ROWS ; y++) {
            base[y] = [];
            for(let x = 0; x < GRID_COLS ; x++) {
                base[y][x] = [];
                for(let z = 0; z < TOWER_RINGS_AMOUNT ; z++) {
                    base[y][x][z] = undefined;
                }
            }
        }
        return base;
    }

};

class ArcElement {
    constructor(public offset: number, public length: number) {}
}



// eslint-disable-next-line @typescript-eslint/no-unused-vars
const myP5 = new p5(s);
