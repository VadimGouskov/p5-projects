export const fillPath = (canvas: HTMLCanvasElement, path: string) => {
    const path2D = new Path2D(path);
    canvas.getContext("2d")?.fill(path2D);
}x