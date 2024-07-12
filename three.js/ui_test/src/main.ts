import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { OBJExporter } from "three/examples/jsm/exporters/OBJExporter.js";
import { createGrid } from "pretty-grid";
import { RangeControl } from "./controls";

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
const COLS = 14;
const ROWS = 14;
const PLANE_SIZE = 10;
const BOX_SIZE = PLANE_SIZE / (COLS - 1);
let AMP = BOX_SIZE * 3;
const MIN_BOX_HEIGHT = 0.5;
const STEP_SIZE = 0.001;

// SLICES
const SLICE_X = 0;
const SLICE_Y = 0;

const a = new RangeControl("A", "controls", {
  min: 0,
  max: Math.PI / 4,
  step: Math.PI / 100000,
  value: Math.PI / 200,
});

const b = new RangeControl("B", "controls", {
  min: 0,
  max: 0.01,
  step: 0.00005,
  value: 0.05,
});

const amp = new RangeControl("AMP", "controls", {
  min: 0,
  max: 10,
  step: 0.1,
  value: 3,
});

// Controls
const updateParametersFromControls = () => {
  A = a.value;
  B = b.value;
  AMP = amp.value;
};

const ADD_COORDINATES = true;

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

const getY = (col: number, row: number, t: number) => {
  const w0 =
    AMP * Math.sin(A * col + B * t + C + D * Math.sin(E * row + F * t + G)) + 0;
  const w1 =
    AMP * Math.sin(H * col + I * t + J + K * Math.sin(L * row + M * t + N)) + 0;

  return MIN_BOX_HEIGHT + Math.abs((w0 + w1) / 2);
};

grid.every((point, row, col) => {
  t += STEP_SIZE;
  if (row === undefined || col === undefined) {
    return;
  }

  const y = getY(col, row, t);

  const geometry = new THREE.BoxGeometry(BOX_SIZE, y, BOX_SIZE);
  const cube = new THREE.Mesh(geometry, material);
  cube.position.set(point.x, y / 2, point.y);

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
camera.position.set(0, 10, 10);
controls.update();

// LOOP

var fps = 10;
function draw() {
  setTimeout(function () {
    requestAnimationFrame(draw);

    grid.every((point, row, col) => {
      const y = getY(col, row, t);

      const cube = boxGroup.children[row * COLS + col] as THREE.Mesh;
      const geometry = new THREE.BoxGeometry(BOX_SIZE, y, BOX_SIZE);
      cube.geometry.dispose();
      cube.geometry = geometry;
      cube.position.set(point.x, y / 2, point.y);
    });

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
