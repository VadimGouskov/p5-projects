import Victor from "victor";

type BoidOptions = { x: number; y: number; maxSpeed?: number };

export class Boid {
  loc: Victor;
  vel: Victor;
  acc: Victor;
  maxSpeed: number;

  maxForce: number;

  constructor({ x, y, ...options }: BoidOptions) {
    this.loc = new Victor(x, y);
    this.vel = new Victor(0, 0);
    this.acc = new Victor(0, 0);

    this.maxSpeed = options.maxSpeed || 4;

    this.maxForce = 1;
  }

  applyForce = (force: Victor) => {
    this.acc.add(force);
  };

  update = () => {
    this.vel.add(this.acc);
    // this.vel = this.limitVector(this.vel, this.maxSpeed);
    this.loc.add(this.vel);
    this.acc.multiplyScalar(0);
  };

  seek = (target: Victor) => {
    const desired: Victor = target.subtract(this.loc);
    const distance = desired.length();
    desired.normalize();

    // if (distance < 100) {
    // const m = distance / 100;
    const m = 1;
    desired.multiplyScalar(m * this.maxSpeed);
    // } else {
    //   desired.multiplyScalar(this.maxSpeed);
    // }

    desired.subtract(this.vel);

    this.applyForce(desired);
  };

  limitVector = (v: Victor, max: number) => {
    const n = Math.sqrt(Math.pow(v.x, 2) + Math.pow(v.y, 2));
    const f = Math.min(n, max) / n;

    return new Victor(f * v.x, f * v.y);
  };

  get x() {
    return this.loc.x;
  }

  get y() {
    return this.loc.y;
  }
}
