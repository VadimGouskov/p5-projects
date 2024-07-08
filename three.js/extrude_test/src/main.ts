import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { OBJExporter } from "three/examples/jsm/exporters/OBJExporter.js";
import { createGrid } from "pretty-grid";
import { CSG } from "three-csg-ts";

import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";

const HEIGHT = window.innerHeight;
const A = Math.PI / 200,
  B = 10,
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

// BOX GRID
const COLS = 30;
const ROWS = 30;
const PLANE_SIZE = 10;
const BOX_SIZE = PLANE_SIZE / (COLS - 1);
const AMP = BOX_SIZE * 3;
const MIN_BOX_HEIGHT = 0.5;
const STEP_SIZE = 0.001;

// INIT
const ADD_COORDINATES = false;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / HEIGHT,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;

document.body.appendChild(renderer.domElement);

const grid = createGrid({
  width: PLANE_SIZE,
  height: PLANE_SIZE,
  rows: ROWS,
  cols: COLS,
});

// TEXT INIT

const loader = new FontLoader();

const font = await loader.loadAsync("/reddit_mono_medium.json", (font) => {
  console.log("loaded front", font);
});

// CUBE GRID

let t = 0;

const boxGroup = new THREE.Group();
boxGroup.name = "boxGroup";

const material = new THREE.MeshNormalMaterial();

grid.every((point, row, col) => {
  t += STEP_SIZE;
  if (row === undefined || col === undefined) {
    return;
  }
  const w0 =
    AMP * Math.sin(A * col + B * t + C + D * Math.sin(E * row + F * t + G)) + 0;
  const w1 =
    AMP * Math.sin(H * col + I * t + J + K * Math.sin(L * row + M * t + N)) + 0;

  const y = MIN_BOX_HEIGHT + Math.abs((w0 + w1) / 2);

  const geometry = new THREE.BoxGeometry(BOX_SIZE, y, BOX_SIZE);

  const cube = new THREE.Mesh(geometry, material);

  const sphere = new THREE.Mesh(new THREE.SphereGeometry(1.2, 8, 8));

  const textGeometry = new TextGeometry(`${row}-${col}`, {
    font: font,
    size: BOX_SIZE / 8,
    height: MIN_BOX_HEIGHT, // depth does not work

    curveSegments: 1,
    bevelEnabled: false,
  });

  cube.position.set(point.x, y / 2, point.y);

  if (ADD_COORDINATES) {
    const text = new THREE.Mesh(
      textGeometry,
      new THREE.MeshStandardMaterial({ color: 0xff0000 })
    );

    // sphere.position.set(point.x, 0, point.y);
    text.position.set(point.x, MIN_BOX_HEIGHT / 4, point.y);
    text.rotateX(Math.PI / 2);

    cube.updateMatrix();
    sphere.updateMatrix();
    text.updateMatrix();

    const res = CSG.subtract(cube, text);

    // boxGroup.add(sphere);

    boxGroup.add(res);
  } else {
    boxGroup.add(cube);
  }

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

// CONTROLS

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
