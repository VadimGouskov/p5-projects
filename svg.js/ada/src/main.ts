import './style.css';

import {
  SVG,
  extend as SVGextend,
  Element as SVGElement,
  Circle,
  Rect,
  create,
  G,
} from '@svgdotjs/svg.js';

import { WaveFilter, addWaveFilter } from './filters/filters';
import { GridShape, createGrid } from 'pretty-grid';

import rangeSlider from 'range-slider-input';
import 'range-slider-input/dist/style.css';
import { RangeControl } from './controls';
import Victor from 'victor';
import Color from 'color';
import { randomInterval } from './helpers';

const FRAMERATE = 20;

const WIDTH = 700;
const HEIGHT = 700;

var draw = SVG().addTo('#wrapper').size(WIDTH, HEIGHT);

draw.id('root');

const ROWS = 30;
const GROUP_OFFSET = 2;

const COLORS = ['#FFFF60', '#001011', '#FF9505', '#6CCFF6'];
const LINE_MARGIN = 20;
const MIN_LENGTH = 10;
const MAX_LENGTH = 50;
const STROKE_WIDTH = 15;

const GROUPS_PER_ROW = COLORS.length;

const lineGroups: G[] = [];

const getPointsOnEdge = (totalLength: number) => {
  const points = [];
  let lengthLeft = totalLength;

  while (lengthLeft > 0) {
    lengthLeft -= LINE_MARGIN;
    if (lengthLeft <= 0) break;
    points.push(lengthLeft);

    const dy = randomInterval(MIN_LENGTH, MAX_LENGTH);
    lengthLeft -= dy;
    points.push(lengthLeft);
  }

  return points;
};

for (let i = 0; i < ROWS; i++) {
  const pointPairs = getPointsOnEdge(HEIGHT / 2);

  for (let j = 0; j < pointPairs.length - 1; j += 2) {
    for (let k = 0; k < GROUPS_PER_ROW; k++) {
      const x1 = WIDTH / 2;
      const y1 = pointPairs[j];
      const x2 = WIDTH / 2;
      const y2 = pointPairs[j + 1];

      console.log(x1, y1, x2, y2);

      const line = draw
        .line(x1, y1, x2, y2)
        .stroke({ color: COLORS[k], width: STROKE_WIDTH, linecap: 'round' });
      line.transform({
        origin: [WIDTH / 2, HEIGHT / 2],
        rotate: GROUP_OFFSET * k + (360 / ROWS) * i,
      });
    }
  }
}

const rotate = new RangeControl('rotate', 'slider-parent', {
  min: 1,
  max: 360,
  value: 0,
  step: 0.1,
});

const loop = () => {
  forceUpdate();
};

const forceUpdate = () => {
  const dummy = draw.rect(0, 0);
  dummy.remove();
};

setInterval(loop, 1000 / (FRAMERATE || 1));

//you can download svg file by right click menu.
