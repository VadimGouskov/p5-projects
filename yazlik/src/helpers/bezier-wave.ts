
export type Quadratic = {
    x1: number;
    y1: number;
    cx: number;
    cy: number;
    x2: number;
    y2: number;
}

export const quadraticWave = (startX: number, startY: number, totalLength: number, amplitude: number, periods: number) => {

    const periodLength = totalLength / periods / 2;
    const x1 = startX;
    const y1 = startY;
    const x2 = x1 + periodLength;
    const y2 = y1;
    const cx = (x2 - x1) / 2;
    const cy = amplitude; // TODO calculate handle/waveHeight ratio

    const halfPeriod: Quadratic = {
        x1, y1, cx, cy, x2, y2
    }

    const fullWave: Quadratic[] = []

    // copy for periods 
    for (let i = 0; i < periods * 2; i++) {
        const xPosition = periodLength * i
        const direction = (i % 2) * 2 - 1;
        const period: Quadratic = {
            x1: halfPeriod.x1 + xPosition,
            y1: halfPeriod.y1,
            cx: halfPeriod.cx + xPosition,
            cy: startY + amplitude * direction,
            x2: halfPeriod.x2 + xPosition,
            y2: halfPeriod.y2,
        }

        fullWave.push(period)
    }

    return fullWave;

}

// const quadraticWavePeriod = (startX: number, startY: number, waveLenght: number, amplitude: number, period: number): Quadratic => {
//     const endX = startX + waveLenght;

// }