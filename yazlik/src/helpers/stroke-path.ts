export const strokePath = (canvas: HTMLCanvasElement, path: string) => {
    const path2D = new Path2D(path);
    canvas.getContext("2d")?.stroke(path2D);
}