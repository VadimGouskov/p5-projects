import p5 from "p5";

export const centerScale = (p: p5, width: number, height: number, amount: number) => {
    p.translate(width/2, height/2);
    p.scale(amount);
    p.translate(-width/2, -height/2);
} 