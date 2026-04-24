const fs = require('fs');
const path = require('path');

const sharp = require('sharp');

const svgPath = path.resolve(__dirname, 'jan-kawach-architecture.svg');
const outPath = path.resolve(__dirname, 'jan-kawach-architecture.png');

(async () => {
  try {
    const svg = await fs.promises.readFile(svgPath);
    // Use a default width/height that matches the SVG viewBox (1400x900)
    await sharp(svg)
      .png({ compressionLevel: 9 })
      .toFile(outPath);
    console.log('PNG written to', outPath);
  } catch (err) {
    console.error('Failed to convert SVG to PNG:', err);
    process.exit(1);
  }
})();