import "./style.css";

import {
  SVG,
  extend as SVGextend,
  Element as SVGElement,
} from "@svgdotjs/svg.js";

import { addWaveFilter } from "./filters/filters";
import { createGrid } from "pretty-grid";

import rangeSlider from "range-slider-input";
import "range-slider-input/dist/style.css";
import { RangeControl } from "./controls";

const FRAMERATE = 4;

const WIDTH = 700;
const HEIGHT = 700;

const ROWS = 20;
const COLS = 20;

const CIRCLE_SIZE = (WIDTH / ROWS) * 0.666;

var draw = SVG().addTo("body").size(WIDTH, HEIGHT);

const grid = createGrid({
  width: WIDTH,
  height: HEIGHT,
  rows: ROWS,
  cols: COLS,
});

draw.id("root");

// Apply filters
const group1 = draw.group();

const turbulenceFilter = addWaveFilter("root", "noise", {
  turbulence: { numOctaves: "12" },
});

group1.attr({ filter: "url(#noise)" });

grid.every((point) => {
  group1.circle(CIRCLE_SIZE).cx(point.x).cy(point.y).fill("#000");
});

const baseFreqXControl = new RangeControl("X Freq", "slider-parent", {
  min: 0.002,
  max: 0.1,
  value: 0.05,
  step: 0.001,
});
const baseFreqYControl = new RangeControl("Y Freq", "slider-parent", {
  min: 0.002,
  max: 0.1,
  value: 0.05,
  step: 0.001,
});
const octavesControl = new RangeControl("n Octaves", "slider-parent", {
  min: 0,
  max: 8,
  step: 1,
  value: 1,
});

const loop = () => {
  turbulenceFilter?.setAttribute(
    "numOctaves",
    Math.floor(octavesControl.value).toString()
  );

  turbulenceFilter?.setAttribute(
    "baseFrequency",
    `${baseFreqXControl.value} ${baseFreqYControl.value}`
  );
  console.log(baseFreqXControl.value);

  const root = document.getElementById("root");
  forceUpdate();
};

const forceUpdate = () => {
  const dummy = draw.rect(0, 0);
  dummy.remove();
};

setInterval(loop, 1000 / (FRAMERATE || 1));

//you can download svg file by right click menu.
