import "./style.css";

import {
  SVG,
  extend as SVGextend,
  Element as SVGElement,
  Circle,
  Rect,
} from "@svgdotjs/svg.js";

import { WaveFilter, addWaveFilter } from "./filters/filters";
import { createGrid } from "pretty-grid";

import rangeSlider from "range-slider-input";
import "range-slider-input/dist/style.css";
import { RangeControl } from "./controls";
import { Body } from "./body";
import Victor from "victor";

const FRAMERATE = 30;

const WIDTH = 700;
const HEIGHT = 700;

const BODIES = 40;

var draw = SVG().addTo("#wrapper").size(WIDTH, HEIGHT);

draw.id("root");

const CONTENT_WIDTH = 500;
const CONTENT_HEIGHT = 500;

let AMP = CONTENT_HEIGHT / 2;
let LENGTH = Math.PI * 2;

let t = 0;

const group = draw.group();

const massMultControl = new RangeControl("mass X", "slider-parent", {
  min: 1,
  max: 20,
  value: 5,
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

const bodies: Body[] = [];

for (let i = 0; i < BODIES; i++) {
  const type = i % 2 === 0 ? "Gozde" : "Vadim";

  const x = Math.random() * CONTENT_WIDTH;
  const y = Math.random() * CONTENT_HEIGHT;

  group
    .circle(10)
    .cx(x)
    .cy(y)
    // .fill(type === "Gozde" ? "#F8F3F2" : "#EDFCFC");
    .fill(type === "Gozde" ? "red" : "blue");

  const mass = Math.random() * 3 + 1;

  const body = new Body({
    x: x,
    y: y,
    mass: mass,
    maxSpeed: 2,
    maxForce: 2,
    type: type,
  });
  const xVel = Math.random() * 2 - 1;
  const yVel = Math.random() * 2 - 1;
  body.vel = new Victor(xVel, yVel);

  bodies.push(body);
}

group.move(0, CONTENT_HEIGHT / 2);

const loop = () => {
  const G = gControl.value;
  const massMult = massMultControl.value;
  const sameTypeAttraction = sameTypeAttractionControl.value;
  const minDistance = minDistanceControl.value;
  const maxDistance = maxDistanceControl.value;

  bodies.forEach((body, index, rest) => {
    body.G = G;
    body.massMult = massMult;
    body.sameTypeAttraction = sameTypeAttraction;
    body.minDistance = minDistance;
    body.maxDistance = maxDistance;

    rest.forEach((other, otherIndex) => {
      if (index === otherIndex) return;

      const force = body.attract(other).divideScalar(bodies.length);

      body.applyForce(force);
    });
    body.update();

    body.wrap(CONTENT_WIDTH, CONTENT_HEIGHT);

    group
      .get(index)
      .cx(body.loc.x)
      .cy(body.loc.y)
      .size(body.mass * 10);
  });

  forceUpdate();
};

const forceUpdate = () => {
  const dummy = draw.rect(0, 0);
  dummy.remove();
};

setInterval(loop, 1000 / (FRAMERATE || 1));

//you can download svg file by right click menu.
