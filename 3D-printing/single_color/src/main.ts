import "./style.css";

import {
  SVG,
  extend as SVGextend,
  Element as SVGElement,
} from "@svgdotjs/svg.js";

import { addWaveFilter } from "./filters";
import { createGrid } from "pretty-grid";

import rangeSlider from "range-slider-input";
import "range-slider-input/dist/style.css";
import { Control } from "./controls";

const FRAMERATE = 1;

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

addWaveFilter("root", "noise");

group1.attr({ filter: "url(#noise)" });

grid.every((point) => {
  group1.circle(CIRCLE_SIZE).cx(point.x).cy(point.y).fill("#000");
});

const depth = new Control("slider-parent");
const control = new Control("slider-parent");

const loop = () => {
  console.log(control.value);
};

setInterval(loop, 1000 / (FRAMERATE || 1));

//you can download svg file by right click menu.
