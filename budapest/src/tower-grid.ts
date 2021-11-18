import { Grid } from "./grid";
import { Arc } from './arc';
import p5 from "p5";

export class TowerGrid {
    towerRadius: number;

    // Get assigned in function called inside constructor, linter does not pick this up.
    grid!: Grid;
    arcGrid!: ArcGrid;
    towerGenerators!: Generator[];
    colorArray: string[] = [];
    strokeColor: string = "#fff";

    MAX_PATH_LENGTH = 10; // TODO better max length
    STROKE_WIDTH = 3;

    constructor(private p: p5,
                private rows: number, 
                private cols: number,
                private gridWidth: number,
                private towerRingsAmount: number
                ) {
        this.towerRadius = gridWidth / towerRingsAmount; 
        this.setColorPalette(this.defaultPallete);
        this.initTowers();
    }

    initTowers = () => {
        this.grid = new Grid(this.rows, this.cols, this.gridWidth, this.gridWidth );
        this.initArcGrid();
        this.towerGenerators = this.mapTowerGenerators(this.grid, this.arcGrid);
    }

    show = (): void => {
        // TODO better stopping conditaion
        for(let i = 0; i < 1000; i++) {
            const index = this.randomInt(0, this.towerGenerators.length);
            const status = this.towerGenerators[index].next();
        }
    }

    setColorPalette = (palette: string[]): void => {

        if(palette.length < Math.ceil(this.towerRingsAmount / 2)) throw new Error(`Palette contains too little colors, minumum amount is ${this.towerRingsAmount / 2}`);

        this.colorArray = [];

        const halfPallette = [...palette];
        // push the first half
        this.colorArray.push(...halfPallette);
        // mirror the pallete and push the second
        halfPallette.pop();
        this.colorArray.push(...[...halfPallette].reverse());
    }

    setStrokeColor = (color: string): void => {
        this.strokeColor = color;
    }

    private mapTowerGenerators = (grid: Grid, arcGrid: ArcGrid) : Generator<undefined, void, unknown>[] => {
        return grid.get()
            .map((xPoints, yIndex) => xPoints.map((point, xIndex) => this.createTowerGenerator(arcGrid, point.x, point.y, xIndex, yIndex)()))
            .reduce((acc, val) => acc.concat(val), []); // flatten 2d array
    }

    private createTowerGenerator = (arcGrid: ArcGrid, x: number, y: number, xIndex: number, yIndex: number) => {
        // generator functions can't be arrow functions: https://stackoverflow.com/questions/27661306/can-i-use-es6s-arrow-function-syntax-with-generators-arrow-notation
        let self = this;
        return function* () {
            let i: number;
            const stepSize = self.towerRadius / 2 ;

            // rest of the tower
            for(i = self.towerRingsAmount - 1; i >= 0; i--) {
                const arc = arcGrid[yIndex][xIndex][i];
                if(!!arc) {
                    const innerArc = new Arc(x, y, stepSize * (i + 1), stepSize * (i + 1), arc.offset, arc.length, (stepSize / 2) , self.STROKE_WIDTH, self.colorArray[i], self.strokeColor);
                    
                    // HACK: partially prevent slicing on inner towers caused by adjacent strokes with higher z-axis
                    if(i === 0) {
                        innerArc.setCorrection(self.p.PI / 30);
                    }
                    innerArc.draw(self.p);
                }
                yield ;
            }
        }
    }

    private nextYIndex = (prevYIndex: number, arcEnd: number, direction: number): number => {
        return Math.round(prevYIndex + Math.sin(arcEnd));
    }

    private nextXIndex = (prevXIndex: number, arcEnd: number, direction: number): number => {
        return Math.round(prevXIndex + Math.cos(arcEnd));
    }

    private initArcGrid = (): void => {
        this.arcGrid = this.create3DArray();
        for(let i = 0; i < 100; i ++){
            this.addArcPath();
        }
    }

    private addArcPath = (): void => {
        let end = this.randomInt(1,3) * this.p.HALF_PI;
        let yIndex = this.randomInt(0, this.cols - 1);
        let xIndex = this.randomInt(0, this.rows - 1);
        let tower = this.randomInt(0, this.towerRingsAmount);
        let direction = 1;
        let to = 0, from = 0;

        for (let i = 0; i < this.MAX_PATH_LENGTH; i++) {

            tower = this.nextTower(tower, this.towerRingsAmount);
            yIndex = this.nextYIndex(yIndex, end, 1);
            xIndex = this.nextXIndex(xIndex, end, 1);
            
            // Keep the path inside the grid
            if(xIndex < 0 || xIndex >= this.cols || yIndex < 0 || yIndex >= this.rows) break;

            // calculate the arc
            const target = (end + this.p.PI) % this.p.TWO_PI;
            const length = this.randomInt(1, 2) * this.p.HALF_PI;

            if (direction === 1) {
                from = target;
                to = (target + length) % this.p.TWO_PI ;
                end = to;
            } else {
                from = (target - length) % this.p.TWO_PI;
                to = target;
                end = from;
            }

            // switch deirection
            direction = -direction;
            // save arc in path
            this.arcGrid[yIndex][xIndex][tower] = new ArcElement(from, to);
        }
    }

    private nextTower = (prevTower: number, towerAmount: number): number => {
        // 2 * middleTowerIndex - prevTowerIndex;
        return (towerAmount - 1) - prevTower;
    }

    private get defaultPallete(): Array<string> {
        let colorPallete: Array<string> = new Array();
        const BASE_COLOR = 0;
        const BASE_BRIGHTNESS = 0.5;
        const MIN_SATURATION = 0.1;
        const MAX_SATURATION = 0.9;

        // calculate half the pallete
        for(let i = 0; i <= this.towerRingsAmount / 2; i++) {
            let saturation = MIN_SATURATION + Math.random() * MAX_SATURATION
            let color = this.p.color(BASE_COLOR, saturation, BASE_BRIGHTNESS);
            colorPallete.push(color.toString());
        }
        return colorPallete;
    } 

    // helpers
    private randomInt = (min: number, max: number) => {
        return min + Math.floor(Math.random() * max);
    }

    private create3DArray = (): undefined[][][] => {
        const base: undefined[][][] = [[[]]];
        for(let y = 0; y < this.rows ; y++) {
            base[y] = [];
            for(let x = 0; x < this.cols ; x++) {
                base[y][x] = [];
                for(let z = 0; z < this.towerRingsAmount ; z++) {
                    base[y][x][z] = undefined;
                }
            }
        }
        return base;
    }

}

export class ArcElement {
    constructor(public offset: number, public length: number) {}
}

export type ArcGrid = (ArcElement|undefined)[][][];
