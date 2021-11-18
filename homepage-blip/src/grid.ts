export class GridPoint {
    x: number;
    y: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

export class Grid {
    amountX: number;
    amountY: number;
    width: number;
    height: number;

    private grid: GridPoint[][] = [[]];

    constructor(amountX: number, amountY: number, width: number, height: number) {
        this.amountX = amountX;
        this.amountY = amountY;
        this.width = width;
        this.height = height;

        const stepX = width / (amountX - 1);
        const stepY = height / (amountY - 1);

        // initialize grid
        for (let i = 0; i < amountX; i++) {
            this.grid[i] = [];
            for (let j = 0; j < amountX; j++) {
                this.grid[i][j] = new GridPoint(j * stepX, i * stepY);
            }
        }
    }

    get flat(): GridPoint[] {
        return this.grid.reduce((acc, val) => acc.concat(val), []);
    }

    get(): GridPoint[][] {
        return this.grid;
    }

    getPoint(xIndex: number, yindex: number): GridPoint {
        return this.grid[yindex][xIndex];
    }
}

export class CountingGrid {
    grid: Grid;
    pointCounters: number[][] = [[]];
    constructor(grid: Grid) {
        this.grid = grid;

        const maxRows = grid.amountY;
        const maxCols = grid.amountX;
        let i;
        for (i = 0; i < maxRows; i++) {
            this.pointCounters[i] = [];
            this.pointCounters[i].length = maxCols;
            this.pointCounters[i].fill(0);
        }
    }
}
