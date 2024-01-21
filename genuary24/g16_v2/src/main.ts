import "./style.css";

import {
  SVG,
  extend as SVGextend,
  Element as SVGElement,
} from "@svgdotjs/svg.js";

import { createGrid } from "pretty-grid";

const WIDTH = 700;
const HEIGHT = 700;

const WORK_SIZE = 0.8;

const COLS = 150;
const ROWS = 150;

const GRID_WIDTH = WIDTH * WORK_SIZE;
const GRID_HEIGHT = HEIGHT * WORK_SIZE;

const DIV_WIDTH = GRID_WIDTH / COLS;
const DIV_HEIGHT = GRID_HEIGHT / ROWS;

const GRID_OFFSETX = (WIDTH - GRID_WIDTH) / 2;
const GRID_OFFSETY = (HEIGHT - GRID_HEIGHT) / 2;

const DIVIDER = COLS / 5;

var draw = SVG().addTo("body").size(WIDTH, HEIGHT);

const grid = createGrid({
  width: WIDTH * WORK_SIZE,
  height: HEIGHT * WORK_SIZE,
  cols: COLS,
  rows: ROWS,
});

grid.translate(GRID_OFFSETX, GRID_OFFSETY);

grid.every((point, col, row) => {
  let fill = "#F4442E";
  const selector = (col! * row!) % Math.ceil(col! / DIVIDER);

  if (selector === 0 || col === 0) {
    const rect = draw.rect(DIV_WIDTH, DIV_HEIGHT).attr({ fill });
    rect.attr({ x: point.x, y: point.y });
  } else {
    const circle = draw
      .circle(DIV_WIDTH, DIV_HEIGHT)
      .attr({ fill })
      .attr({ cx: point.x, cy: point.y });
  }
});

//you can download svg file by right click menu.
