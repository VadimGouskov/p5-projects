import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { OBJExporter } from "three/examples/jsm/exporters/OBJExporter.js";
import { createGrid } from "pretty-grid";

const HEIGHT = window.innerHeight;
const A = Math.PI / 400,
  B = 5,
  C = 5;

const D = 2.5,
  E = 5,
  F = 50,
  G = 5;

const H = 0.02,
  I = 5,
  J = 5,
  K = 5,
  L = 5,
  M = 5;
const N = 5;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / HEIGHT,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const COLS = 5;
const ROWS = 5;

const PLANE_SIZE = 10;

const grid = createGrid({
  width: PLANE_SIZE,
  height: PLANE_SIZE,
  rows: ROWS,
  cols: COLS,
});

let t = 0;

const BOX_SIZE = PLANE_SIZE / (COLS - 1);
const AMP = BOX_SIZE * 3;

const boxGroup = new THREE.Group();
boxGroup.name = "boxGroup";

grid.every((point, row, col) => {
  t += 0.001;
  if (row === undefined || col === undefined) {
    return;
  }
  const w0 =
    AMP * Math.sin(A * col + B * t + C + D * Math.sin(E * row + F * t + G)) + 0;
  const w1 =
    AMP * Math.sin(H * col + I * t + J + K * Math.sin(L * row + M * t + N)) + 0;

  const y = Math.abs((w0 + w1) / 2);

  const geometry = new THREE.BoxGeometry(BOX_SIZE, y, BOX_SIZE);
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  const cube = new THREE.Mesh(geometry, material);

  cube.position.set(point.x, y / 2, point.y);

  boxGroup.add(cube);
});

scene.add(boxGroup);

const baseGroup = new THREE.Group();
baseGroup.name = "baseGroup";

const BASE_SIZE = PLANE_SIZE * 1.15;
const PLANE_THICKNESS = AMP / 4;

const baseGeometry = new THREE.BoxGeometry(
  BASE_SIZE,
  PLANE_THICKNESS,
  BASE_SIZE
);
const baseMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const baseMesh = new THREE.Mesh(baseGeometry, baseMaterial);
baseMesh.position.set(PLANE_SIZE / 2, -PLANE_THICKNESS / 2, PLANE_SIZE / 2);

baseGroup.add(baseMesh);
// scene.add(baseGroup);

const controls = new OrbitControls(camera, renderer.domElement);

//controls.update() must be called after any manual changes to the camera's transform
camera.position.set(20, 0, 0);
controls.update();

// LOOP

function loop() {
  requestAnimationFrame(loop);
  controls.update();
  renderer.render(scene, camera);
}

loop();

const exporter = new OBJExporter();
const objString = exporter.parse(scene);
console.log(objString);
