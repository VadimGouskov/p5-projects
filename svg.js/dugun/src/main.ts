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

const FRAMERATE = 10;

const WIDTH = 700;
const HEIGHT = 700;

const BODIES = 10;

var draw = SVG().addTo("#wrapper").size(WIDTH, HEIGHT);

draw.id("root");

const CONTENT_WIDTH = 500;
const CONTENT_HEIGHT = 500;

let AMP = CONTENT_HEIGHT / 2;
let LENGTH = Math.PI * 2;

let t = 0;

const group = draw.group();

const ampInput = new RangeControl("amp", "slider-parent", {
  min: 0,
  max: CONTENT_HEIGHT / 2,
  value: AMP,
});

const lengthInput = new RangeControl("length", "slider-parent", {
  min: 0,
  max: Math.PI * 2,
  value: LENGTH,
  step: 0.0025,
});

const speed = new RangeControl("speed", "slider-parent", {
  min: 0,
  max: 0.05,
  value: 0.1,
  step: 0.00005,
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
    .fill(type === "Gozde" ? "blue" : "red");
  const body = new Body({ x: x, y: y, mass: 5, maxSpeed: 1 });

  bodies.push(body);
}

group.move(0, CONTENT_HEIGHT / 2);

const loop = () => {
  bodies.forEach((body, index, rest) => {
    rest.forEach((other, otherIndex) => {
      if (index === otherIndex) return;

      other.attract(body);
      body.update();
    });

    body.wrap(CONTENT_WIDTH, CONTENT_HEIGHT);

    group.get(index).cx(body.loc.x).cy(body.loc.y);
  });

  forceUpdate();
};

const forceUpdate = () => {
  const dummy = draw.rect(0, 0);
  dummy.remove();
};

setInterval(loop, 1000 / (FRAMERATE || 1));

//you can download svg file by right click menu.
