import "./style.css";

import {
  SVG,
  extend as SVGextend,
  Element as SVGElement,
  G,
} from "@svgdotjs/svg.js";

import { WaveFilter, addWaveFilter } from "./filters/filters";
import { createGrid } from "pretty-grid";

import rangeSlider from "range-slider-input";
import "range-slider-input/dist/style.css";
import { RangeControl } from "./controls";

const FRAMERATE = 10;

const WIDTH = 700;
const HEIGHT = 700;

const ROWS = 10;
const COLS = 10;

const CIRCLE_SIZE = (WIDTH / ROWS) * 0.333;

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

const TRANSLATE_GRIDX = (WIDTH - CONTENT_WIDTH) / 2;
const TRANSLATE_GRIDY = (HEIGHT - CONTENT_HEIGHT) / 2;

grid.translate(TRANSLATE_GRIDX, TRANSLATE_GRIDY);

type Wave = {
  groupId: string;
  group: G | undefined;
  color: string;
  filter: WaveFilter | undefined;
  controls: RangeControl[];
};

let waves: Wave[] = [
  {
    groupId: "Red-dark",
    group: undefined,
    color: "#F49090",
    filter: undefined,
    controls: [],
  },
  {
    groupId: "Red",
    group: undefined,
    color: "#C11313",
    filter: undefined,
    controls: [],
  },
  {
    groupId: "Red-Light",
    group: undefined,
    color: "#380505",
    filter: undefined,
    controls: [],
  },
];

waves = waves.map((w) => {
  const group = draw.group().id(w.groupId);
  group.attr({ filter: `url(#filter-${w.groupId})` });

  grid.every((point) => {
    group.circle(CIRCLE_SIZE).cx(point.x).cy(point.y).fill(w.color);
  });

  const filter = addWaveFilter("root", `filter-${w.groupId}`, {});

  // create group title
  const title = document.createElement("h1");
  title.innerHTML = w.groupId;
  document.getElementById("slider-parent")?.appendChild(title);

  const octavesControl = new RangeControl("n Octaves", "slider-parent", {
    min: 0,
    max: 8,
    step: 1,
    value: 1,
  });

  const baseFreqXControl = new RangeControl("X Freq", "slider-parent", {
    min: 0.001,
    max: 0.02,
    value: 0.001,
    step: 0.0001,
  });
  const baseFreqYControl = new RangeControl("Y Freq", "slider-parent", {
    min: 0.001,
    max: 0.02,
    value: 0.001,
    step: 0.0001,
  });

  const depthControl = new RangeControl("depth", "slider-parent", {
    min: 0,
    max: 500,
    step: 1,
    value: 30,
  });

  return {
    ...w,

    controls: [
      octavesControl,
      baseFreqXControl,
      baseFreqYControl,
      depthControl,
    ],

    filter,
    group,
  };
});

const loop = () => {
  waves.forEach((w) => {
    w.filter?.turbulence?.setAttribute(
      "numOctaves",
      Math.floor(w.controls[0].value).toString()
    );

    w.filter?.turbulence?.setAttribute(
      "baseFrequency",
      `${w.controls[1].value} ${w.controls[2].value}`
    );

    w.filter?.displacementMap.setAttribute(
      "scale",
      w.controls[3].value.toString()
    );
  });

  forceUpdate();
};

const forceUpdate = () => {
  const dummy = draw.rect(0, 0);
  dummy.remove();
};

setInterval(loop, 1000 / (FRAMERATE || 1));

//you can download svg file by right click menu.
