import p5 from "p5";
import { GridPoint } from "pretty-grid";
import { random } from "../helpers/random";

export const scatterTransformer = (p: p5, amplitude: number, max: number, strenghtFunc?: (point: GridPoint) => number) => (col: GridPoint[]) => col.map(point => {

    const amplitudeStrength = strenghtFunc ? strenghtFunc(point) : 0;

    // Bird flock vvv
    const moveA = random(p, -amplitude, amplitude) * amplitudeStrength;
    point.x += moveA;
    point.y += moveA;
    return point;
});
