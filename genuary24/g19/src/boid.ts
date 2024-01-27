import Victor from "victor";
import { scale } from "./helpers";

type BoidOptions = {
  x: number;
  y: number;
  maxSpeed?: number;
  velocity?: Victor;
};

export class Boid {
  loc: Victor;
  vel: Victor;
  acc: Victor;
  maxSpeed: number;

  maxForce: number;
  arrivalDistance: number;
  arrivalDampening: number;

  visionDistance: number;

  desiredSeparation: number;

  constructor({ x, y, ...options }: BoidOptions) {
    this.loc = new Victor(x, y);
    this.vel = options.velocity || new Victor(0, 0);
    this.acc = new Victor(0, 0);

    this.maxSpeed = options.maxSpeed || 4;

    this.maxForce = 1;

    this.arrivalDistance = 50;
    this.arrivalDampening = 0.01;

    this.visionDistance = 50;
    this.desiredSeparation = 25;
  }

  applyForce = (force: Victor) => {
    this.acc.add(force);
  };

  update = () => {
    this.vel.add(this.acc);
    this.vel = this.limitVector(this.vel, this.maxSpeed);
    this.loc.add(this.vel);
    this.acc.multiplyScalar(0);
  };

  seek = (target: Victor) => {
    const desired: Victor = target.subtract(this.loc);
    const distance = desired.length();
    desired.normalize();

    if (distance < this.arrivalDistance) {
      const m = scale(distance, 0, this.arrivalDistance, 0, this.maxSpeed);
      desired.multiplyScalar(m);
    } else {
      desired.multiplyScalar(this.maxSpeed);
    }

    desired.subtract(this.vel);

    const steer = this.limitVector(desired, this.maxForce);

    return steer;
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

  get angle() {
    return this.vel.angleDeg() + 90;
  }

  flock = (boids: Boid[]) => {
    const sep = this.separate(boids);
    const ali = this.align(boids);
    const coh = this.cohesion(boids);

    sep.multiplyScalar(1.5);
    ali.multiplyScalar(1.5);
    coh.multiplyScalar(1.5);

    this.applyForce(ali);
    this.applyForce(sep);
  };

  wrap = (width: number, height: number) => {
    if (this.loc.x < -this.desiredSeparation) {
      this.loc.x = width + this.desiredSeparation;
    }
    if (this.loc.y < -this.desiredSeparation) {
      this.loc.y = height + this.desiredSeparation;
    }
    if (this.loc.x > width + this.desiredSeparation) {
      this.loc.x = -this.desiredSeparation;
    }
    if (this.loc.y > height + this.desiredSeparation) {
      this.loc.y = -this.desiredSeparation;
    }
  };

  keepWithin = (target: Victor, range: number) => {
    const distance = this.loc.clone().subtract(target);
    const rangeBorder = range * 0.2;
    if (distance.length() > range - rangeBorder) {
      const m = scale(distance.length(), 0, range, 0, this.maxSpeed);

      distance.multiplyScalar(m * -1);
      this.applyForce(distance);
    }
  };

  separate = (boids: Boid[]) => {
    const sum = new Victor(0, 0);

    let count = 0;

    for (let boid of boids) {
      const d = this.loc.distance(boid.loc);
      if (d > 0 && d < this.desiredSeparation) {
        const diff = this.loc.clone().subtract(boid.loc);
        diff.normalize();
        diff.divideScalar(d);
        sum.add(diff);
        count++;
      }
    }

    if (count === 0) return new Victor(0, 0);

    sum.divideScalar(count);
    sum.normalize();
    sum.multiplyScalar(this.maxSpeed);
    let steer = sum.subtract(this.vel);
    steer = this.limitVector(steer, this.maxForce);
    return steer;
  };

  align = (boids: Boid[]) => {
    const sum = new Victor(0, 0);
    let count = 0;
    for (let boid of boids) {
      const d = this.loc.distance(boid.loc);
      if (d > 0 && d < this.visionDistance) {
        sum.add(boid.vel);
        count++;
      }
    }

    if (count === 0) return new Victor(0, 0);

    sum.divideScalar(count); // average velocity of all neighbors
    sum.normalize();
    sum.multiplyScalar(this.maxSpeed); // set magnitude to maxSpeed

    let steer = sum.subtract(this.vel);
    steer = this.limitVector(steer, this.maxForce);
    return steer;
  };

  cohesion = (boids: Boid[]) => {
    const sum = new Victor(0, 0);
    let count = 0;
    for (let boid of boids) {
      const d = this.loc.distance(boid.loc);
      if (d > 0 && d < this.visionDistance) {
        sum.add(boid.loc);
        count++;
      }
    }

    if (count === 0) return new Victor(0, 0);

    sum.divideScalar(count); // average location of all neighbors
    return this.seek(sum); // seek that location
  };
}
