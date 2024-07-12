import "./style.css";

import {
  SVG,
  extend as SVGextend,
  Element as SVGElement,
  Circle,
  Rect,
  create,
} from "@svgdotjs/svg.js";

import { WaveFilter, addWaveFilter } from "./filters/filters";
import { GridShape, createGrid } from "pretty-grid";

import rangeSlider from "range-slider-input";
import "range-slider-input/dist/style.css";
import { RangeControl } from "./controls";
import { Body } from "./body";
import Victor from "victor";
import Color from "color";
import { randomInterval } from "./helpers";

const FRAMERATE = 20;

const WIDTH = 700;
const HEIGHT = 700;

const BODIES = 35;

const RING_CHANCE = 0.33;

var draw = SVG().addTo("#wrapper").size(WIDTH, HEIGHT);

const GOZDE_COLOR = new Color("#FF8C61");
const VADIM_COLOR = new Color("#62C370");

const DESATURATION_MIN = 0.2;
const DESATURATION_MAX = 0.5;

const LIGHTEN_MIN = 0.1;
const LIGHTEN_MAX = 0.5;

const CIRCLE_WIDTH = 35;
const STROKE_WIDTH = 2;
const CIRCLE_BACKGROUND_COLOR = "hsla(120,0%,100%, 0.5)";

draw.id("root");

const CONTENT_WIDTH = 500;
const CONTENT_HEIGHT = 600;
const CONTENT_MARGIN = 500 * 0.25;

let AMP = CONTENT_HEIGHT / 2;
let LENGTH = Math.PI * 2;

let t = 0;

const group = draw.group();
const circleGroup = draw.group();

const massMultControl = new RangeControl("mass X", "slider-parent", {
  min: 1,
  max: 20,
  value: 12,
  step: 0.05,
});

const gControl = new RangeControl("G", "slider-parent", {
  min: 1,
  max: 1000,
  value: 20,
  step: 0.1,
});

const sameTypeAttractionControl = new RangeControl(
  "sameTypeAttraction",
  "slider-parent",
  {
    min: 0,
    max: 100,
    value: 1,
    step: 0.1,
  }
);

const minDistanceControl = new RangeControl("minDistance", "slider-parent", {
  min: 1,
  max: 100,
  value: 20,
  step: 0.1,
});

const maxDistanceControl = new RangeControl("maxDistance", "slider-parent", {
  min: 1,
  max: 1000,
  value: 50,
  step: 0.1,
});

const centerMassControl = new RangeControl("Center Mass", "slider-parent", {
  min: 1,
  max: 500,
  value: 400,
  step: 0.1,
});

const center = new Body({
  x: CONTENT_WIDTH / 2,
  y: CONTENT_HEIGHT / 2,
  mass: 2,
  maxSpeed: 0,
  maxForce: 0,
  type: "center",
});

const bodies: Body[] = [];
const circles = [];

const createGridBodies = () => {
  const grid = createGrid({
    width: CONTENT_WIDTH,
    height: CONTENT_HEIGHT,
    cols: 30,
    rows: 3,
    shape: GridShape.ELLIPSE,
  });

  grid.translate(CONTENT_WIDTH / 2, CONTENT_HEIGHT / 2);

  grid.every(({ x, y }, col, row) => {
    const type = col! % 2 === 0 ? "Gozde" : "Vadim";

    const body = new Body({
      x: x,
      y: y,
      mass: 2,
      maxSpeed: 10,
      maxForce: 2,
      type: type,
    });

    const vel = new Victor(x, y).subtract(center.loc).multiplyScalar(0.01);
    vel.rotateDeg(90);
    body.vel = vel;

    group
      .circle(1)
      .cx(x)
      .cy(y)
      // .fill(type === "Gozde" ? "#F8F3F2" : "#EDFCFC");
      .fill(type === "Gozde" ? GOZDE_COLOR.hex() : VADIM_COLOR.hex());

    bodies.push(body);
  });
};

const createRandomBodies = () => {
  for (let i = 0; i < BODIES; i++) {
    const type = i % 2 === 0 ? "Gozde" : "Vadim";

    const x = randomInterval(CONTENT_MARGIN, CONTENT_WIDTH - CONTENT_MARGIN);
    const y = randomInterval(CONTENT_MARGIN, CONTENT_HEIGHT - CONTENT_MARGIN);

    let color = type === "Gozde" ? GOZDE_COLOR : VADIM_COLOR;

    const desaturation = randomInterval(DESATURATION_MIN, DESATURATION_MAX);
    const lighten = randomInterval(LIGHTEN_MIN, LIGHTEN_MAX);
    color = color.desaturate(desaturation).lighten(lighten);

    group
      .circle(10)
      .cx(x)
      .cy(y)
      // .fill(type === "Gozde" ? "#F8F3F2" : "#EDFCFC");
      .fill(color.hex());

    const mass = Math.random() * 3 + 1;

    const body = new Body({
      x: x,
      y: y,
      mass: mass,
      maxSpeed: 10,
      maxForce: 2,
      type: type,
    });
    const xVel = Math.random() * 2 - 1;
    const yVel = Math.random() * 2 - 1;
    body.vel = new Victor(xVel, yVel);

    bodies.push(body);
  }
};

group.move(0, CONTENT_HEIGHT / 2);

createRandomBodies();

// create orbit rings
bodies.forEach((body, index) => {
  const diameter = center.loc.distance(body.loc) * 2;

  if (Math.random() > RING_CHANCE) return;

  let color = body.type === "Gozde" ? GOZDE_COLOR : VADIM_COLOR;

  color = color.desaturate(0.5).lighten(0.5);

  const circle = draw
    .circle(diameter)
    .cx(center.loc.x)
    .cy(center.loc.y)
    .stroke(color.hex())
    .fill("none")
    .attr({ "stroke-dasharray": "5,5" });

  circleGroup.add(circle);
});

const createCenterCircles = () => {
  const leftColor = GOZDE_COLOR; //.desaturate(0.15).lighten(0.7);
  const rightColor = VADIM_COLOR; //.desaturate(0.1).lighten(0.7);

  draw
    .circle(CIRCLE_WIDTH)
    .cx(CONTENT_WIDTH / 2)
    .cy(CONTENT_HEIGHT / 2)
    .stroke(rightColor.hex())
    .fill(CIRCLE_BACKGROUND_COLOR)
    .dmove(CIRCLE_WIDTH / 4, 0);

  draw
    .circle(CIRCLE_WIDTH)
    .cx(CONTENT_WIDTH / 2)
    .cy(CONTENT_HEIGHT / 2)
    .fill(CIRCLE_BACKGROUND_COLOR)
    .stroke(leftColor.hex())
    .attr({ "stroke-width": STROKE_WIDTH })
    .dmove(-CIRCLE_WIDTH / 4, 0);

  draw
    .circle(CIRCLE_WIDTH)
    .cx(CONTENT_WIDTH / 2)
    .cy(CONTENT_HEIGHT / 2)
    .stroke(rightColor.hex())
    .attr({ "stroke-width": STROKE_WIDTH })
    .fill("transparent")
    .dmove(CIRCLE_WIDTH / 4, 0);
};

createCenterCircles();

const loop = () => {
  const G = gControl.value;
  const massMult = massMultControl.value;
  const sameTypeAttraction = sameTypeAttractionControl.value;
  const minDistance = minDistanceControl.value;
  const maxDistance = maxDistanceControl.value;
  const centerMass = centerMassControl.value;

  bodies.forEach((body, index, rest) => {
    body.G = G;
    body.massMult = massMult;
    body.sameTypeAttraction = sameTypeAttraction;
    body.minDistance = minDistance;
    body.maxDistance = maxDistance;

    rest.forEach((other, otherIndex) => {
      if (index === otherIndex) return;

      // normalize all the forces to be applied to the body from all other bodies
      const force = body.attract(other).divideScalar(bodies.length);

      body.applyForce(force);
    });

    // apply force from center
    const force = body.attract(center);
    body.applyForce(force);
    body.update();
    body.wrap(CONTENT_WIDTH, CONTENT_HEIGHT);

    group
      .get(index)
      .cx(body.loc.x)
      .cy(body.loc.y)
      .size(body.mass * 10);

    // adjust circle diameters for selected circles

    const ring = circleGroup.get(index);

    if (ring) {
      const diameter = center.loc.distance(body.loc) * 2;
      ring.size(diameter);
    }
  });

  forceUpdate();
};

const forceUpdate = () => {
  const dummy = draw.rect(0, 0);
  dummy.remove();
};

setInterval(loop, 1000 / (FRAMERATE || 1));

//you can download svg file by right click menu.
