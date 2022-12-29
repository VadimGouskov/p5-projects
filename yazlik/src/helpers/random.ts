import p5 from "p5";

export const random = (p: p5, min: number, max: number) => {
    return p.random() * (max - min) + min;
}