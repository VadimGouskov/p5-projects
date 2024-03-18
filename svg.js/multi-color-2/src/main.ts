import "./style.css";

import {
  SVG,
  extend as SVGextend,
  Element as SVGElement,
  G,
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

const ROWS = 10;
const COLS = 10;

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

const TRANSLATE_GRIDX = (WIDTH - CONTENT_WIDTH) / 2;
const TRANSLATE_GRIDY = (HEIGHT - CONTENT_HEIGHT) / 2;

grid.translate(TRANSLATE_GRIDX, TRANSLATE_GRIDY);

const DEPTH_TRANSLATION_FACTOR = 0.35;

type Wave = {
  groupId: string;
  group: G | undefined;
  filter: WaveFilter | undefined;
  controls: RangeControl[];
  svg: () => SVGElement;
};

const colors = ["#9fffcb", "#004E64", "#00A5CF", "#25a18e", "#F7F7FF"];

const totalWaves = colors.length;

let waves: Wave[] = colors.map((color, index) => {
  const groupId = `LAYER-${index + 1}`;
  const group = draw.group().id(groupId);
  group.attr({ filter: `url(#filter-${groupId})` });

  grid.every(
    (point) => {
      const generated = new Rect({
        width: BASE_SIZE * 0.75,
        height: BASE_SIZE * 0.75,
      }).fill(color);
      generated.cx(point.x).cy(point.y);
      group.add(generated);
    },
    () => {
      return Math.random() > index / totalWaves;
    }
  );

  const filter = addWaveFilter("root", `filter-${groupId}`, {});

  // create group title
  const title = document.createElement("h1");
  title.innerHTML = groupId;
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
    value: 0.0015,
    step: 0.0001,
  });
  const baseFreqYControl = new RangeControl("Y Freq", "slider-parent", {
    min: 0.001,
    max: 0.02,
    value: 0.002,
    step: 0.0001,
  });

  const depthControl = new RangeControl("depth", "slider-parent", {
    min: 0,
    max: 500,
    step: 1,
    value: 0,
  });

  const opacityControl = new RangeControl("opacity", "slider-parent", {
    min: 0,
    max: 1,
    step: 0.01,
    value: 1,
  });

  group?.rect(WIDTH, HEIGHT).fill("#0000").attr({ stationary: true });

  return {
    groupId,
    group,
    filter,
    controls: [
      octavesControl,
      baseFreqXControl,
      baseFreqYControl,
      depthControl,
      opacityControl,
    ],
    svg: () =>
      new Rect({ width: BASE_SIZE * 0.75, height: BASE_SIZE * 0.75 }).fill(
        color
      ),
  };
});

const loop = () => {
  waves.forEach((w) => {
    const depth = w.controls[3].value * DEPTH_TRANSLATION_FACTOR;

    w.group?.children().forEach((c) => {
      if (c.attr("stationary")) {
        return;
      }

      c.transform({ translateX: -depth, translateY: -depth });
    });
  });

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

    w.group?.opacity(w.controls[4].value);
  });

  forceUpdate();
};

const forceUpdate = () => {
  const dummy = draw.rect(0, 0);
  dummy.remove();
};

setInterval(loop, 1000 / (FRAMERATE || 1));

//you can download svg file by right click menu.
