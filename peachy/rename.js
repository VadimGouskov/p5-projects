const { readdirSync, rename } = require('fs');
const { resolve } = require('path');

// Get path to image directory
const imageDirPath = resolve(__dirname, 'progress_renamed');

// Get an array of the files inside the folder
const files = readdirSync(imageDirPath);

// Loop through each file that was retrieved
files.forEach((file, index) =>
    rename(imageDirPath + `/${file}`, imageDirPath + `/${index}.png`, (err) => console.log(err)),
);
