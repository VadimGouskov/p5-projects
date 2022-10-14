import p5 from "p5";

export const svgPath = (canvas: HTMLCanvasElement, path: Path2D) => {
    canvas.getContext("2d")?.fill(path);
}