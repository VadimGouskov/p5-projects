import { GridPoint } from "pretty-grid";
import { random } from "../helpers/random";

export const scatterTransformer = (amplitude: number, max: number, strenghtFunc?: (point: GridPoint) => number) => (col: GridPoint[]) => col.map(point => {

    const amplitudeStrength = strenghtFunc ? strenghtFunc(point) : 0;

    // Bird flock vvv
    const moveA = random(-amplitude, amplitude) * amplitudeStrength;
    point.x += moveA;
    point.y += moveA;
    return point;
});
