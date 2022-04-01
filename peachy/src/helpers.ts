import { p5Instance as p } from './sketch';

export function popRandom<T>(array: T[]): [T, T[]] {
    const index = randomInt(0, array.length - 1);
    const value = array[index];
    array.splice(index, 1);
    return [value, [...array]];
}

export const saturate = (colorString: string, amount: number): string => {
    const hue = p.hue(colorString);
    const saturation = p.saturation(colorString);
    const brightness = p.brightness(colorString);

    const newColor = p.color(hue, saturation * amount, brightness);
    return newColor.toString();
};

export const brighten = (colorString: string, amount: number): string => {
    const hue = p.hue(colorString);
    const saturation = p.saturation(colorString);
    const brightness = p.brightness(colorString);

    const newColor = p.color(hue, saturation, brightness * amount);
    return newColor.toString();
};

export const randomInt = (min: number, max: number): number => Math.floor(p.random(min, max + 1));

export const chance = (amount: number) => {
    return p.random() < amount;
};

export const centerScale = (width: number, height: number, value: number) => {
    p.translate(width / 2, height / 2);
    p.scale(value);
    p.translate(-width / 2, -height / 2);
};

export const sortCloser = (
    refX: number,
    refY: number,
    x0: number,
    y0: number,
    x1: number,
    y1: number,
): [x0: number, y0: number, x1: number, y1: number] => {
    const dist0 = Math.hypot(refX - x0, refY - y0);
    const dist1 = Math.hypot(refX - x1, refY - y1);
    return dist0 < dist1 ? [x0, y0, x1, y1] : [x1, y1, x0, y0];
};

/*
export const blendModes = [
    p.ADD,
    p.DARKEST,
    p.LIGHTEST,
    p.EXCLUSION,
    p.MULTIPLY,
    p.SCREEN,
    p.REPLACE,
    p.OVERLAY,
    p.HARD_LIGHT,
    p.SOFT_LIGHT,
    p.DODGE,
    p.BURN,
    p.SUBTRACT,
];
*/
