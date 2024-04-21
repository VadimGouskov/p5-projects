import Victor from "victor";
import { scale } from "./helpers";

type BoidOptions = {
  x: number;
  y: number;
  maxSpeed?: number;
  maxForce?: number;
  velocity?: Victor;
  mass: number;
  type: string;
};

export class Body {
  loc: Victor;
  vel: Victor;
  acc: Victor;
  maxSpeed: number;
  mass: number;
  massMult: number = 1;
  type: string;

  G: number = 10;

  sameTypeAttraction = 10;
  minDistance = 10;
  maxDistance = 200;

  maxForce: number;
  arrivalDistance: number;
  arrivalDampening: number;

  visionDistance: number;

  desiredSeparation: number;

  constructor({ x, y, ...options }: BoidOptions) {
    this.loc = new Victor(x, y);
    this.vel = options.velocity || new Victor(0, 0);
    this.acc = new Victor(0, 0);

    this.maxSpeed = options.maxSpeed || 0.02;

    this.maxForce = options.maxForce || 0.02;

    this.arrivalDistance = 50;
    this.arrivalDampening = 0.01;

    this.visionDistance = 50;
    this.desiredSeparation = 100;
    this.mass = options.mass || 2;
    this.type = options.type;
  }

  get x() {
    return this.loc.x;
  }

  get y() {
    return this.loc.y;
  }

  get angle() {
    return this.vel.angleDeg() + 90;
  }

  attract = (target: Body) => {
    const force = target.loc.clone().subtract(this.loc);
    const distance = force.length();
    const G = 1;

    let attraction = this.mass * this.massMult * this.sameTypeAttraction;

    const maxDistance = 1000;
    const minDistance = 20;

    const cappedDistance = Math.min(
      Math.max(distance ** 2, minDistance),
      maxDistance
    );

    const strength = G * ((attraction * target.mass) / cappedDistance);

    force.normalize();
    force.multiplyScalar(strength);

    this.applyForce(force);

    return force;
  };

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

  flock = (boids: Body[]) => {
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

  separate = (boids: Body[]) => {
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

  align = (boids: Body[]) => {
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

  cohesion = (boids: Body[]) => {
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
