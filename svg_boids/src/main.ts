import "./style.css";

import {
  SVG,
  extend as SVGextend,
  Element as SVGElement,
  Polygon,
} from "@svgdotjs/svg.js";

import { Boid } from "./boid";
import Victor from "victor";

const WIDTH = 700;
const HEIGHT = 700;

var draw = SVG().addTo("body").size(WIDTH, HEIGHT);

const BOID_AMOUNT = 100;
const MAX_BOID_SPEED = 5;

const boids: Boid[] = [];
const skins: Polygon[] = [];
for (let i = 0; i < BOID_AMOUNT; i++) {
  const x = Math.random() * WIDTH;
  const y = Math.random() * HEIGHT;

  const startVelocityX = Math.random() * 2 - 1; // map range  0-1 to (-1)-1
  const startVelocityY = Math.random() * 2 - 1;
  const startVelocity = new Victor(
    startVelocityX,
    startVelocityY
  ).multiplyScalar(MAX_BOID_SPEED);

  boids.push(
    new Boid({
      x,
      y,
      maxSpeed: MAX_BOID_SPEED,
      velocity: startVelocity,
    })
  );
  skins.push(
    draw
      .polygon("0,-10 -10,10 10,10")
      .fill("blue")
      .stroke({ width: 1 })
      .move(x, y)
  );
}

const loop = () => {
  for (let i = 0; i < BOID_AMOUNT; i++) {
    // flocking
    const boid = boids[i];
    const skin = skins[i];
    boid.flock(boids);
    boid.wrap(WIDTH, HEIGHT);
    boid.update();

    // draw the boids
    skin.x(boid.x).y(boid.y);
    skin.transform({ rotate: boid.angle });
  }
};

const interval = setInterval(loop, 33);

//you can download svg file by right click menu.
