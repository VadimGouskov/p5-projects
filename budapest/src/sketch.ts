import p5 from 'p5';
import * as p5File from 'p5-file-client';
import { Grid } from './grid'

const s = (p: p5) => {
    const CANVAS_WIDTH = 500;
    const CANVAS_HEIGHT = 500;
    const SKETCH_ID = 'sketch';
    let fileClient : p5File.FileClient; 
    let towerGrid: Grid;
    let arcGrid: (ArcElement|undefined)[][][];

    const GRID_WIDTH = CANVAS_WIDTH;
    const TOWER_RINGS_AMOUNT = 5; // :warning: Must be uneven number :warning:
    const TOWER_RADIUS = (GRID_WIDTH / TOWER_RINGS_AMOUNT);
    const GRID_ROWS = 5;
    const GRID_COLS = 5;
    const MAX_PATH_LENGTH = GRID_COLS * 2; // TODO better max length

    const BASE_COLOR = 0;
    const BASE_BRIGHTNESS = 0.5;
    const MIN_SATURATION = 0.1;
    const MAX_SATURATION = 0.9;

    let colorArray: Array<string> = new Array()

    p.setup = () => {
        const canvas = p.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
        canvas.parent(SKETCH_ID);
        p.noLoop();
        p.colorMode(p.HSB, 1);

        fileClient = new p5File.FileClient(undefined, undefined, '/home/vadim/Projects/creative-coding/p5-projects/budapest/progress');
        towerGrid = new Grid(GRID_COLS, GRID_ROWS, GRID_WIDTH, GRID_WIDTH);
        initArcGrid();
        console.log(arcGrid);
        colorArray = createColorPallete();
    };

    p.draw = () => {
        p.background(100);
        p.translate(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
        p.scale(0.666);
        p.translate(-CANVAS_WIDTH / 2, -CANVAS_HEIGHT / 2);

        p.fill(0);
        p.stroke(255)

        const towerGenerators = towerGrid.get()
            .map((xPoints, yIndex) => xPoints.map((point, xIndex) => createTowerGenerator(point.x, point.y, xIndex, yIndex)()))
            .reduce((acc, val) => acc.concat(val), []); // flatten 2d array

        buildTowers(towerGenerators);
        
        const image64 = p5File.getCanvasImage(SKETCH_ID);
        fileClient.exportImage64(image64, '.png', 'budapest');
    };

    const createTowerGenerator = (x: number, y: number, xIndex: number, yIndex: number) => {
        return function* () {
            let i: number;
            const stepSize = TOWER_RADIUS / 2;

            // base full ring
            const baseArc = arcGrid[yIndex][xIndex][TOWER_RINGS_AMOUNT-1];
            if(!!baseArc){
                p.fill(colorArray[colorArray.length-1]);
                p.arc(x, y, stepSize * TOWER_RINGS_AMOUNT , stepSize * TOWER_RINGS_AMOUNT, baseArc.offset, baseArc.length);
            }

            yield;

            // rest of the tower
            for(i = TOWER_RINGS_AMOUNT - 1; i > 0; i--) {
                const arcOffset = randomInt(0, 4) * p.HALF_PI;
                const arcLength = randomInt(1, 4) * p.HALF_PI;
                
                const arc = arcGrid[yIndex][xIndex][i];
                
                if(!!arc) {
                    p.fill(colorArray[i-1]);
                    p.arc(x, y, stepSize * i, stepSize * i, arc.offset, arc.length);
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
        console.log(colorPallete);


        return colorPallete;

    }

    const randomInt = (min: number, max: number) => {
        return min + Math.floor(Math.random() * max);
    }

    const initArcGrid = (): void => {
        arcGrid = create3DArray();
        
        for(let i = 0; i < 50; i ++){
            addArcPath();
        }

    }

    const addArcPath = (): void => {
        let startLength = randomInt(1,3) * p.HALF_PI;
        const startOffset = randomInt(1,3) * p.HALF_PI;
        let end = startOffset + startLength;
        let yIndex = randomInt(0, GRID_COLS);
        let xIndex = randomInt(0, GRID_ROWS);
        let tower = randomInt(0, TOWER_RINGS_AMOUNT);
        let direction = 1;
        arcGrid[yIndex][xIndex][tower] = new ArcElement(startOffset, startLength);

        let to = 0, from = 0;
        for (let i = 0; i < MAX_PATH_LENGTH; i++) {
            direction = -direction;

            tower = nextTower(tower, TOWER_RINGS_AMOUNT);
            yIndex = nextYIndex(yIndex, end, 1);
            xIndex = nextXIndex(xIndex, end, 1);
            
            if(xIndex < 0 || xIndex >= GRID_COLS || yIndex < 0 || yIndex >= GRID_COLS) break;

            to = direction === 1 ? randomInt(1,3) * p.HALF_PI : end + p.PI;
            from = direction === 1 ? end + p.PI : randomInt(0,3) * p.HALF_PI;
            end = direction === 1 ? to : from;

            arcGrid[yIndex][xIndex][tower] = new ArcElement(from, to );

        }
    }

    const nextYIndex = (prevYIndex: number, arcEnd: number, direction: number): number => {
        return Math.round(prevYIndex + Math.sin(arcEnd));
    }

    const nextXIndex = (prevXIndex: number, arcEnd: number, direction: number): number => {
        return Math.round(prevXIndex + Math.cos(arcEnd));
    }

    const nextTower = (prevTower: number, towerAmount: number): number => {
        // 2 * middleTowerIndex - prevTowerIndex;
        return (towerAmount + 1) - prevTower;
    }


    const create3DArray = (): any[][][] => {
        const base: any[][][] = [[[]]];
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
