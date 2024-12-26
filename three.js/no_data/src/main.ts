import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { OBJExporter } from "three/examples/jsm/exporters/OBJExporter";
import { createGrid } from "pretty-grid";
import { RangeControl } from "./controls";

import { createNoise2D } from "simplex-noise";

// Init vars &  Controls

const ParentId = "controls";
const HEIGHT = window.innerHeight;
let A = Math.PI / 200,
  B = 1000,
  C = 5,
  D = 2.5,
  E = 5,
  F = 50,
  G = 5,
  H = 0.02,
  I = 5,
  J = 5,
  K = 5,
  L = 5,
  M = 5,
  N = 5;

// BOX GRID
const COLS = 40;
const ROWS = 40;
const PLANE_SIZE = 20;
const BOX_SIZE = PLANE_SIZE / (COLS - 1);
let AMP = BOX_SIZE * 3;
const MIN_BOX_HEIGHT = 0.5;
const STEP_SIZE = 0.001;

// General Controls
const amp = new RangeControl("AMP", "general-controls", {
  min: 0,
  max: 10,
  step: 0.1,
  value: 1,
});

const sliceX = new RangeControl("SLICE_X", "general-controls", {
  min: 0,
  max: 10,
  step: 1,
  value: 0,
});

const sliceY = new RangeControl("SLICE_Y", "general-controls", {
  min: 0,
  max: 10,
  step: 1,
  value: 0,
});

// Wobbly Controls

const wobblyMix = new RangeControl("MIX", "wobbly-controls", {
  min: 0,
  max: 1,
  step: 0.01,
  value: 0.5,
});

const wobblyBoost = new RangeControl("Boost", "wobbly-controls", {
  min: 0,
  max: 10,
  step: 0.1,
  value: 3,
});

const a = new RangeControl("A", "wobbly-controls", {
  min: 0,
  max: Math.PI / 4,
  step: Math.PI / 100000,
  value: Math.PI / 200,
});

const b = new RangeControl("B", "wobbly-controls", {
  min: 0,
  max: 0.01,
  step: 0.00005,
  value: 0.05,
});

// Perlin Controls
const perlinMix = new RangeControl("MIX", "perlin-controls", {
  min: 0,
  max: 1,
  step: 0.01,
  value: 0.5,
});

const perlinBoost = new RangeControl("Boost", "perlin-controls", {
  min: 0,
  max: 10,
  step: 0.1,
  value: 3,
});

const perlinColSize = new RangeControl("Col Size", "perlin-controls", {
  min: 0,
  max: 1,
  step: 0.01,
  value: 0.5,
});

const perlinRowSize = new RangeControl("Row Size", "perlin-controls", {
  min: 0,
  max: 1,
  step: 0.01,
  value: 0.5,
});

// Patches

const patchRowOffset = new RangeControl("Row Offset", "patches-controls", {
  min: 0,
  max: 1,
  step: 0.01,
  value: 0.5,
});

const patchColOffset = new RangeControl("Row Offset", "patches-controls", {
  min: 0,
  max: 1,
  step: 0.01,
  value: 0.5,
});

const patchMaxAmplitude = new RangeControl(
  "Max Amplitude",
  "patches-controls",
  {
    min: 0,
    max: 10,
    step: 0.1,
    value: 3,
  }
);

const patchNoiseCap = new RangeControl("Noise Cap", "patches-controls", {
  min: 0,
  max: 2,
  step: 0.01,
  value: 0.5,
});

// gausian controls
const gaussianWidth = new RangeControl("Width", "gaussian-controls", {
  min: 0,
  max: 2,
  step: 0.01,
  value: 0.5,
});

const gaussianHeight = new RangeControl("Height", "gaussian-controls", {
  min: 0,
  max: 2,
  step: 0.01,
  value: 0.5,
});

const gaussianPeak = new RangeControl("Peak", "gaussian-controls", {
  min: 0,
  max: 2,
  step: 0.01,
  value: 0.5,
});

const gaussianOffsetX = new RangeControl("Offset X", "gaussian-controls", {
  min: 0,
  max: 2,
  step: 0.5,
  value: 0.5,
});

const gaussianOffsetY = new RangeControl("Offset Y", "gaussian-controls", {
  min: 0,
  max: 2,
  step: 0.5,
  value: 0.5,
});

// Controls
const updateParametersFromControls = () => {
  A = a.value;
  B = b.value;
  AMP = amp.value;
};

// Noise generator
const noise2D = createNoise2D();

// Three JS
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / HEIGHT,
  0.1,
  1000
);

// INIT the canvas
const canvasParent = document.getElementById("canvas-parent");
if (!canvasParent) {
  console.error("Canvas parent not found");
  throw new Error("Canvas parent not found");
}

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.shadowMap.enabled = true;
renderer.setSize(canvasParent.offsetWidth, canvasParent.offsetHeight);

canvasParent.appendChild(renderer.domElement);

const updateCanvasSize = () => {
  renderer.setSize(canvasParent.offsetWidth, canvasParent.offsetHeight);
  camera.aspect = canvasParent.offsetWidth / canvasParent.offsetHeight;
  camera.updateProjectionMatrix();
};

// INIT the model
const grid = createGrid({
  width: PLANE_SIZE,
  height: PLANE_SIZE,
  rows: ROWS,
  cols: COLS,
});

let t = 1000;

const boxGroup = new THREE.Group();
boxGroup.name = "boxGroup";

const material = new THREE.MeshNormalMaterial();

const getRowSlice = (row: number) => {
  return row + sliceX.value * ROWS;
};

const getColSlice = (col: number) => {
  return col + sliceY.value * COLS;
};

const getWobblyY = (col: number, row: number, t: number) => {
  const rowOnSLice = getRowSlice(row);
  const colOnSLice = getColSlice(col);

  const w0 =
    wobblyBoost.value *
      Math.sin(
        A * colOnSLice + B * t + C + D * Math.sin(E * rowOnSLice + F * t + G)
      ) +
    0;
  const w1 =
    wobblyBoost.value *
      Math.sin(
        H * colOnSLice + I * t + J + K * Math.sin(L * rowOnSLice + M * t + N)
      ) +
    0;

  return MIN_BOX_HEIGHT + Math.abs((w0 + w1) / 2);
};

const getPerlinY = (col: number, row: number) => {
  const x = getRowSlice(row * perlinRowSize.value) / COLS;
  const y = getColSlice(col * perlinColSize.value) / ROWS;

  const n = noise2D(x, y);

  // make sure the noise is always positive
  return (n + 1) * perlinBoost.value;
};

const getPatchesY = (col: number, row: number) => {
  const x = getRowSlice(row * perlinRowSize.value) / COLS;
  const y = getColSlice(col * perlinColSize.value) / ROWS;

  const n = noise2D(x + patchColOffset.value, y + patchRowOffset.value);

  if (n + 1 < patchNoiseCap.value) {
    return 0;
  }

  // make sure the noise is always positive
  return (n + 1) * patchMaxAmplitude.value;
};

const mixY = (values: { value: number; weight: number }[]) => {
  const weightedSum = values.reduce(
    (acc, item) => acc + item.value * item.weight,
    0
  );

  return weightedSum / values.length;
};

// grid init
grid.every((point, row, col) => {
  t += STEP_SIZE;
  if (row === undefined || col === undefined) {
    return;
  }

  const initY = 5;

  const geometry = new THREE.BoxGeometry(BOX_SIZE, initY, BOX_SIZE);
  const cube = new THREE.Mesh(geometry, material);
  cube.position.set(point.x, initY / 2, point.y);

  boxGroup.add(cube);

  // boxGroup.add(text);
});

scene.add(boxGroup);

// LIGHTS

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(20, -20, 20);
scene.add(directionalLight);

const helper = new THREE.DirectionalLightHelper(directionalLight, 5);
// scene.add(helper);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// Camera CONTROLS

const controls = new OrbitControls(camera, renderer.domElement);
//controls.update() must be called after any manual changes to the camera's transform
camera.position.set(0, 10, 20);
controls.update();

// LOOP

function makeGaussian(
  amplitude: number,
  x0: number,
  y0: number,
  sigmaX: number,
  sigmaY: number
) {
  return function (
    amplitude: number,
    x0: number,
    y0: number,
    sigmaX: number,
    sigmaY: number,
    x: number,
    y: number
  ) {
    var exponent = -(
      Math.pow(x - x0, 2) / (2 * Math.pow(sigmaX, 2)) +
      Math.pow(y - y0, 2) / (2 * Math.pow(sigmaY, 2))
    );
    return amplitude * Math.pow(Math.E, exponent);
  }.bind(null, amplitude, x0, y0, sigmaX, sigmaY);
}

const getGaussianMask = (value: number, peak: number) => {
  return (Math.max(peak - value, 0) + 1) * value;
};

const getBase = () => {
  return 2;
};

window.addEventListener("resize", updateCanvasSize);

var fps = 10;
function draw() {
  setTimeout(function () {
    requestAnimationFrame(draw);

    const gaussianFunction = makeGaussian(
      gaussianPeak.value,
      gaussianOffsetX.value,
      gaussianOffsetY.value,
      gaussianWidth.value,
      gaussianHeight.value
    );

    grid.every((point, row, col) => {
      if (typeof col === "undefined" || typeof row === "undefined") {
        return;
      }

      const gaussian = gaussianFunction(col / COLS, row / ROWS);

      const wobblyY = getWobblyY(col, row, t);
      const perlinY = getPerlinY(col, row);
      const perlinSpikeY = getPatchesY(col, row);
      const mask = getGaussianMask(gaussian, gaussianPeak.value);
      const base = getBase();

      const y =
        base +
        mixY([
          { value: wobblyY, weight: wobblyMix.value },
          { value: perlinY, weight: perlinMix.value },
          { value: perlinSpikeY, weight: 1 },
        ]) *
          AMP *
          mask;

      const cube = boxGroup.children[row * COLS + col] as THREE.Mesh;
      const geometry = new THREE.BoxGeometry(BOX_SIZE, y, BOX_SIZE);
      cube.geometry.dispose();
      cube.geometry = geometry;
      cube.position.set(point.x, y / 2, point.y);
    });

    boxGroup.position.x = -PLANE_SIZE / 2;
    boxGroup.position.z = -PLANE_SIZE / 2;

    updateParametersFromControls();

    controls.update();
    renderer.render(scene, camera);
  }, 1000 / fps);
}

draw();

// EXPORT
const exportButton = document.getElementById("export-button");

if (exportButton) {
  exportButton.onclick = () => {
    const exporter = new OBJExporter();
    const objString = exporter.parse(scene);
    console.log(objString);
  };
}
