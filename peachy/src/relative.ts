export class Relative {
    private DIVISOR = 1000;
    values: number[] = [];

    constructor(value: number) {
        const atomic = value / this.DIVISOR;
        for (let i = 0; i <= this.DIVISOR; i++) {
            const step = atomic * i;
            this.values.push(step);
        }
    }
}
