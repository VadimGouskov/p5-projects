# a Simple p5 starter project with TypeScript, esLint, Prettier, WebPack and Live Reloading 

## About The Project

This project contains a simple starter template to write p5 sketches in TypeScipt, which has become a widely used method of writing modern JavaScript programs.
Writing p5 sketches in TypeScript gives creative coders benefits like optional static typing, cross browser support, early access to new JavaScript language features, etc.

Additionally, it provides basic modern development conviniences like Code formatting using esLint and Prettier, Hot Reloading and code bundling using WebPack. Also, this is a npm based project, giving the creative coder the ability to easily extend their code with external libraries from the vast npm repository.

## Getting Started

First, open your terminal and clone the project

```bash
git clone https://github.com/VadimGouskov/p5-simple-typescript-starter.git
```

Navigate inside the project directory

```bash
cd p5-simple-typescript-starter
```

Then, install the project's dependancies

```bash
npm i
```

Finally, start the development server

```bash
npm run start
```

A browser window should open on `localhost:8080` and the sketch is shown after the compilation process.

## Usage

With the development server running, changes to sketch.ts triggers automaticly reload the browser window, reflecting the new changes of the sketch.

> If the browser window does not reload properly, check your terminal for potential errors in the build process.

## Resources

This small project is based on folowing resources, special thanks to the people involved!

-   p5.js official website: https://p5js.org/
-   p5.js npm package: https://www.npmjs.com/package/p5
-   @Types/p5 npm package: https://www.npmjs.com/package/@types/p5
-   TypeScript official website: https://www.typescriptlang.org/
-   esLint official website: https://eslint.org/docs/user-guide/configuring/ignoring-code
-   Prettier offial website: https://prettier.io/
-   esLint and Prettier setup: https://robertcooper.me/post/using-eslint-and-prettier-in-a-typescript-project
-   Webpack getting started: https://webpack.js.org/guides/getting-started/
-   WebPack adn typescript: https://webpack.js.org/guides/typescript/
-   Webpack Development Server options: https://webpack.js.org/guides/development/
-   Another great p5 typescript starter: https://github.com/Gaweph/p5-typescript-starter
