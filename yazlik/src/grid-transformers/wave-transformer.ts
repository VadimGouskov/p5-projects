import { GridPoint } from "pretty-grid";

export const waveTransformer = (f: number, amplitude: number, offset: number, max: number, strenghtFunc?: (point: GridPoint) => number) => (col: GridPoint[]) => col.map((point: GridPoint) => {
    const amplitudeStrength = strenghtFunc ? strenghtFunc(point) : 1;

    const ty = point.x / max * f;
    point.y += Math.cos(ty + offset) * (amplitude * amplitudeStrength);
    return point;
});