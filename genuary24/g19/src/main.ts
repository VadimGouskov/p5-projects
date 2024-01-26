import "./style.css";

import {
  SVG,
  extend as SVGextend,
  Element as SVGElement,
  Polygon,
} from "@svgdotjs/svg.js";

import { createGrid } from "pretty-grid";
import { Boid } from "./boid";
import Victor from "victor";

const WIDTH = 700;
const HEIGHT = 700;

var draw = SVG().addTo("body").size(WIDTH, HEIGHT);

const BOID_AMOUNT = 50;

const target = new Victor(500, 100);
const circle = draw.circle(10).attr({ cx: target.x, cy: target.y }).fill("red");

const boids: Boid[] = [];
const skins: Polygon[] = [];
for (let i = 0; i < BOID_AMOUNT; i++) {
  const x = Math.random() * WIDTH;
  const y = Math.random() * HEIGHT;

  boids.push(new Boid({ x, y, maxSpeed: 4 }));
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
    const boid = boids[i];
    const skin = skins[i];
    boid.seek(target.clone());
    boid.update();
    // skin.rotate(boid.direction);
    skin.x(boid.x).y(boid.y);
    skin.transform({ rotate: boid.angle });
  }
};

const interval = setInterval(loop, 50);

//you can download svg file by right click menu.
