import './style.css';

import { SVG } from '@svgdotjs/svg.js';

import { randomInterval } from './helpers';

const FRAMERATE = 20;

const WIDTH = 700;
const HEIGHT = 700;

var draw = SVG().addTo('#wrapper').size(WIDTH, HEIGHT);

draw.id('root');

const COLORS = ['#FFFF60', '#001011', '#FF9505', '#6CCFF6'];
const GROUPS_PER_ROW = COLORS.length;

const SETTINGS = {
  minLength: randomInterval(2, 10),
  maxLength: randomInterval(10, WIDTH * 0.2),
  lineMargin: randomInterval(20, 40),
  strokeWidth: randomInterval(5, 20),
  rows: 20 + 4 * randomInterval(1, 10),
  groupOffset: randomInterval(0.75, 5),
  magnitudeScale: randomInterval(0.3, 0.43),
  angle: 360 + Math.floor(randomInterval(0, 3)) * 360,
};

console.log(randomInterval(0, 2));

const ROWS = SETTINGS.rows;
const GROUP_OFFSET = SETTINGS.groupOffset;
const LINE_MARGIN = SETTINGS.lineMargin;
const MIN_LENGTH = SETTINGS.minLength;
const MAX_LENGTH = SETTINGS.maxLength;
const STROKE_WIDTH = SETTINGS.strokeWidth;
const MAGNITUDE_SCALE = SETTINGS.magnitudeScale;
const ANGLE = SETTINGS.angle;

const getPointsOnEdge = (startLength: number, totalLength: number) => {
  const points = [];
  let lengthLeft = startLength;
  let stopLength = startLength - totalLength + MAX_LENGTH + LINE_MARGIN;

  while (lengthLeft > stopLength) {
    lengthLeft -= LINE_MARGIN;
    // if (lengthLeft <= stopLength) break;
    points.push(lengthLeft);

    const dy = randomInterval(MIN_LENGTH, MAX_LENGTH);
    lengthLeft -= dy;
    points.push(lengthLeft);
  }

  points.push((lengthLeft -= LINE_MARGIN));
  points.push(startLength - totalLength - LINE_MARGIN);

  return points;
};

for (let i = 0; i <= ROWS; i++) {
  // convert to javascript
  const angle = (i * ANGLE) / ROWS + 4; // offset by a few degrees, to remove the weird rotation skew (TBD why it happens)
  const width = WIDTH / 2;
  const height = HEIGHT / 2;
  let magnitude = 0;
  const abs_cos_angle = Math.abs(Math.cos(angle * (Math.PI / 180)));
  const abs_sin_angle = Math.abs(Math.sin(angle * (Math.PI / 180)));
  if ((width / 2) * abs_sin_angle <= (height / 2) * abs_cos_angle) {
    magnitude = width / abs_cos_angle;
  } else {
    magnitude = height / abs_sin_angle;
  }

  const pointPairs = getPointsOnEdge(HEIGHT / 3, magnitude * MAGNITUDE_SCALE);

  for (let j = 0; j < pointPairs.length - 1; j += 2) {
    for (let k = 0; k < GROUPS_PER_ROW; k++) {
      const x1 = WIDTH / 2;
      const y1 = pointPairs[j];
      const x2 = WIDTH / 2;
      const y2 = pointPairs[j + 1];

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

const loop = () => {
  forceUpdate();
};

const forceUpdate = () => {
  const dummy = draw.rect(0, 0);
  dummy.remove();
};

setInterval(loop, 1000 / (FRAMERATE || 1));

//you can download svg file by right click menu.
