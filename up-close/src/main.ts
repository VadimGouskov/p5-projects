const body = document.querySelector('body');
if (!body) {
  throw new Error('Body element not found');
}

const canvas = document.createElement('canvas');

body.appendChild(canvas);
const ctx = canvas.getContext('2d');
if (!ctx) {
  throw new Error('Canvas context not found');
}

ctx.fillStyle = 'green';
// Add a rectangle at (10, 10) with size 100x100 pixels
ctx.fillRect(10, 10, 100, 100);

console.log(canvas.toDataURL('image/png'));

// downloading
const downloadLink = document.createElement('a');
downloadLink.href = canvas.toDataURL('image/png');
downloadLink.download = 'example.png';
downloadLink.textContent = 'Download';
document.body.appendChild(downloadLink);
