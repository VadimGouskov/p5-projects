import p5 from 'p5';

export class Arc {
    private w: number;
    private h: number;
    constructor(
        private x: number,
        private y: number,
        w: number,
        h: number,
        private start: number,
        private stop: number,
        private arcWidth: number,
        private strokeWidth: number,
        private color: string,
        private strokeColor: string, 
        ){ 
            this.w = w - arcWidth ;
            this.h = h - arcWidth;

        }

    draw(p: p5) {
        p.push(); 

        p.noFill();
        p.strokeCap(p.SQUARE);

        // CENTER
        p.stroke(this.color);
        p.strokeWeight(this.arcWidth);
        p.arc(this.x, this.y, this.w, this.h, this.start, this.stop, p.OPEN);

        // OUTER STROKE
        p.stroke(this.strokeColor);
        p.strokeWeight(this.strokeWidth);
        p.arc(this.x , this.y, this.w + this.arcWidth, this.h + this.arcWidth, this.start, this.stop, p.OPEN);
        
        // OUTER STROKE
        p.stroke(this.strokeColor);
        p.strokeWeight(this.strokeWidth);
        p.arc(this.x , this.y , this.w - this.arcWidth, this.h - this.arcWidth, this.start, this.stop, p.OPEN);
        
        p.pop();
    }
}