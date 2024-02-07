import "./style.css";

import {
  SVG,
  extend as SVGextend,
  Element as SVGElement,
  Polygon,
  Rect,
  Circle,
  Line,
} from "@svgdotjs/svg.js";

import { Boid } from "./boid";
import Victor from "victor";
import { scale } from "./helpers";
import Color from "color";
import { addWaveFilter } from "./filters";

const WIDTH = 700;
const HEIGHT = 700;

var draw = SVG().addTo("body").size(WIDTH, HEIGHT);

const BOID_AMOUNT = 60;
const MAX_BOID_SPEED = 5;

const COLORS = [
  new Color("#5BBA6F"),
  new Color("#3FA34D"),
  new Color("#F4F2F3"),
];
const CIRCLE_MIN_WIDTH = 15;
const CIRCLE_MAX_WIDTH = 45;

const background = draw.rect(WIDTH, HEIGHT).fill("#BCE7FD");

draw.id("root");

// Apply filters
const shapes = draw.group();
const root = document.getElementById("root");


addWaveFilter("root", "noise");

shapes.attr({ filter: "url(#noise)" });

const boids: Boid[] = [];
const skins: Circle[] = [];
const innerSkins: Circle[] = [];
const shadows: Polygon[] = [];

for (let i = 0; i < BOID_AMOUNT; i++) {
  const x = Math.random() * WIDTH;
  const y = Math.random() * HEIGHT;

  const startVelocityX = Math.random() * 2 - 1; // map range  0-1 to (-1)-1
  const startVelocityY = Math.random() * 2 - 1;
  const startVelocity = new Victor(
    startVelocityX,
    startVelocityY
  ).multiplyScalar(MAX_BOID_SPEED);

  const circleWidth = scale(
    Math.random(),
    0,
    1,
    CIRCLE_MIN_WIDTH,
    CIRCLE_MAX_WIDTH
  );

  boids.push(
    new Boid({
      x,
      y,
      maxSpeed: MAX_BOID_SPEED,
      velocity: startVelocity,
      visionDistance: 45,
      desiredSeparation: circleWidth,
    })
  );

  const color = COLORS[Math.floor(Math.random() * COLORS.length)];

  shadows.push(
    shapes
      .polyline()
      .plot([
        [x, y],
        [x - 5, y + 20],
        [WIDTH / 2, HEIGHT / 2],
      ])
      .fill(color.hex())
      .stroke({ width: 1 })
      .move(x, y)
  );

  const innerColor = color.darken(0.4).hex();

  skins.push(shapes.circle(circleWidth).fill(color.hex()).cx(x).cy(y));
  innerSkins.push(
    shapes
      .circle(circleWidth * 0.75)
      .fill(innerColor)
      .cx(x)
      .cy(y)
  );
}

// Filters

const loop = () => {
  for (let i = 0; i < BOID_AMOUNT; i++) {
    // flocking
    const boid = boids[i];
    const skin = skins[i];
    const innerSkin = innerSkins[i];
    boid.flock(boids);
    boid.wrap(WIDTH, HEIGHT);

    // boid.keepWithin(new Victor(WIDTH / 2, HEIGHT / 2), WIDTH * 0.6);

    boid.update();

    // draw a line which points to the center of the screen

    const center = new Victor(WIDTH / 2, HEIGHT / 2);
    const diff = boid.loc.clone().subtract(center);

    const p1 = boid.loc.clone();
    // rotate a point around the center of the boid
    const circleWidth = skin.width() as number;
    p1.subtractScalarX(boid.x - circleWidth / 2).subtractScalarY(boid.y);
    const p2 = p1.clone().subtractScalarX(circleWidth);
    p1.rotateDeg(diff.angleDeg() + 90);
    p2.rotateDeg(diff.angleDeg() + 90);
    p1.addScalarX(boid.x).addScalarY(boid.y);
    p2.addScalarX(boid.x).addScalarY(boid.y);
    // loc.addScalarX(boid.x).addScalarY(boid.y);

    // draw the "shadows"
    shadows[i].plot([
      [p1.x, p1.y],
      [p2.x, p2.y],
      [WIDTH / 2, HEIGHT / 2],
    ]);

    // draw the boids
    skin.cx(boid.x).cy(boid.y);
    innerSkin.cx(boid.x).cy(boid.y);
    // skin.transform({ rotate: boid.angle });
  }
};

const interval = setInterval(loop, 33);

//you can download svg file by right click menu.
