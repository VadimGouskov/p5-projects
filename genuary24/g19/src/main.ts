import "./style.css";

import {
  SVG,
  extend as SVGextend,
  Element as SVGElement,
} from "@svgdotjs/svg.js";

import { createGrid } from "pretty-grid";
import { Boid } from "./boid";
import Victor from "victor";

const WIDTH = 700;
const HEIGHT = 700;

const WORK_SIZE = 0.8;

const COLS = 80;
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

const AMOUNT = 50;

const boid = new Boid({ x: 100, y: 10, maxSpeed: 4 });
const skin = draw
  .polygon("0,-10 -10,10 10,10")
  .fill("blue")
  .stroke({ width: 1 })
  .move(boid.x, boid.y);

const target = new Victor(500, 100);
const circle = draw.circle(10).attr({ cx: target.x, cy: target.y }).fill("red");

const loop = () => {
  boid.seek(target.clone());
  boid.update();

  // skin.rotate(boid.direction);
  skin.x(boid.x).y(boid.y);
  skin.transform({ rotate: boid.angle });
};

const interval = setInterval(loop, 100);

//you can download svg file by right click menu.
