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

const FRAMERATE = 10;

const WIDTH = 700;
const HEIGHT = 700;

const ROWS = 100;
const COLS = 100;

const BASE_SIZE = WIDTH / ROWS;

var draw = SVG().addTo("#wrapper").size(WIDTH, HEIGHT);

draw.id("root");

const CONTENT_WIDTH = 500;
const CONTENT_HEIGHT = 500;

const grid = createGrid({
  width: CONTENT_WIDTH,
  height: CONTENT_HEIGHT,
  rows: ROWS,
  cols: COLS,
});

let AMP = CONTENT_HEIGHT / 2;
let LENGTH = Math.PI * 2;
const A = 50;
const B = 1;
const C = 5;

const D = 2.5;
const E = 5;
const F = 50;
const G = 5;

const H = 0.02;
const I = 5;
const J = 5;
const K = 5;
const L = 5;
const M = 5;
const N = 5;

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
  step: 0.01,
});

for (let col = 0; col < COLS; col++) {
  for (let row = 0; row < ROWS; row++) {
    group.circle(BASE_SIZE).move(col * BASE_SIZE, row * BASE_SIZE);
  }
}

group.move(0, CONTENT_HEIGHT / 2);

const loop = () => {
  AMP = ampInput.value;
  LENGTH = lengthInput.value;

  for (let col = 0; col < COLS; col++) {
    for (let row = 0; row < ROWS; row++) {
      const w0 =
        AMP *
        Math.sin(LENGTH * col + B * t + C + D * Math.sin(E * row + F * t + G));
      const w1 =
        AMP * Math.sin(H * col + I * t + J + K * Math.sin(L * row + M * t + N));
      const y = (w0 + w1) / 2;

      group.get(col * ROWS + row).y(y + CONTENT_HEIGHT / 2);
    }
  }

  forceUpdate();
};

const forceUpdate = () => {
  const dummy = draw.rect(0, 0);
  dummy.remove();
};

setInterval(loop, 1000 / (FRAMERATE || 1));

//you can download svg file by right click menu.
