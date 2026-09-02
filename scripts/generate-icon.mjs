import { PNG } from 'pngjs';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Create shield icon at multiple sizes
function createShieldPNG(size) {
  const png = new PNG({ width: size, height: size, colorType: 6 });
  const data = png.data;
  const cx = size / 2;
  const cy = size / 2;
  const s = size;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const nx = (x - cx) / (s * 0.45);
      const ny = (y - cy) / (s * 0.45);

      // Shield shape: top is wider, narrows to a point at bottom
      let inShield = false;

      if (ny >= -0.9 && ny <= 1.0) {
        let halfWidth;
        if (ny < -0.2) {
          // Top part: slight curve outward
          halfWidth = 0.95 - ny * 0.1;
        } else if (ny < 0.5) {
          // Middle: straight sides tapering
          halfWidth = 0.97 - (ny + 0.2) * 0.3;
        } else {
          // Bottom: narrow to point
          halfWidth = 0.76 - (ny - 0.5) * 1.52;
        }

        if (halfWidth > 0 && Math.abs(nx) < halfWidth) {
          inShield = true;
        }
      }

      // Border detection
      const borderWidth = 0.08;
      let isBorder = false;
      if (!inShield) {
        // Check if we're in the border zone
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            const tx = nx + dx * borderWidth;
            const ty = ny + dy * borderWidth;
            if (ty >= -0.9 && ty <= 1.0) {
              let hw;
              if (ty < -0.2) hw = 0.95 - ty * 0.1;
              else if (ty < 0.5) hw = 0.97 - (ty + 0.2) * 0.3;
              else hw = 0.76 - (ty - 0.5) * 1.52;
              if (hw > 0 && Math.abs(tx) < hw) {
                isBorder = true;
                break;
              }
            }
          }
          if (isBorder) break;
        }
      }

      if (inShield) {
        // Inner shield - dark teal/green gradient
        const gradient = 1 - (ny + 0.9) / 1.9;
        const r = Math.round(6 + gradient * 15);
        const g = Math.round(82 + gradient * 40);
        const b = Math.round(78 + gradient * 30);

        // Cross/lock icon in center
        const cxn = (x - cx) / s;
        const cyn = (y - cy) / s;

        // Lock body
        const lockTop = -0.15;
        const lockBot = 0.25;
        const lockW = 0.12;
        const lockH = 0.22;

        // Lock shackle (arc at top)
        const shackleR = 0.08;
        const shackleCx = 0;
        const shackleCy = -0.15;
        const distToShackle = Math.sqrt(
          Math.pow((cxn - shackleCx) / shackleR, 2) +
          Math.pow((cyn - shackleCy) / (shackleR * 0.8), 2)
        );
        const inShackle = distToShackle > 0.6 && distToShackle < 1.1 &&
          cyn < shackleCy && cyn > shackleCy - 0.12 &&
          Math.abs(cxn) < shackleR * 1.2;

        // Lock body rectangle
        const inLockBody = cxn > -lockW && cxn < lockW &&
          cyn > lockTop && cyn < lockBot;

        // Keyhole
        const keyholeDist = Math.sqrt(
          Math.pow(cxn / 0.03, 2) + Math.pow((cyn - 0.05) / 0.06, 2)
        );
        const inKeyhole = (keyholeDist < 1 && cyn > -0.02) ||
          (cyn >= 0.05 && cyn < 0.16 && Math.abs(cxn) < 0.015);

        if (inShackle || inLockBody) {
          if (inKeyhole) {
            // Keyhole - dark
            data[idx] = 2;
            data[idx + 1] = 20;
            data[idx + 2] = 18;
            data[idx + 3] = 255;
          } else {
            // Lock body - gold
            data[idx] = 220;
            data[idx + 1] = 185;
            data[idx + 2] = 60;
            data[idx + 3] = 255;
          }
        } else {
          // Shield body
          data[idx] = r;
          data[idx + 1] = g;
          data[idx + 2] = b;
          data[idx + 3] = 255;
        }
      } else if (isBorder) {
        // Border - bright gold
        data[idx] = 255;
        data[idx + 1] = 200;
        data[idx + 2] = 50;
        data[idx + 3] = 255;
      } else {
        // Transparent background
        data[idx] = 0;
        data[idx + 1] = 0;
        data[idx + 2] = 0;
        data[idx + 3] = 0;
      }
    }
  }

  return png;
}

// Convert PNG buffer to raw image data for ICO
function pngToRaw(png) {
  const { width, height, data } = png;
  const pixels = [];
  // ICO BMP format: bottom-up, BGRA
  for (let y = height - 1; y >= 0; y--) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      pixels.push(data[idx + 2]); // B
      pixels.push(data[idx + 1]); // G
      pixels.push(data[idx]);     // R
      pixels.push(data[idx + 3]); // A
    }
  }
  return Buffer.from(pixels);
}

// Create ICO file - all sizes as PNG (modern ICO supports this)
function createICO(pngBuffers, sizes) {
  let imageDataOffset = 6 + pngBuffers.length * 16;
  const entries = [];

  for (let i = 0; i < pngBuffers.length; i++) {
    const size = sizes[i];
    const pngBuf = pngBuffers[i];
    entries.push({
      width: size === 256 ? 0 : size,
      height: size === 256 ? 0 : size,
      colorCount: 0,
      reserved: 0,
      planes: 1,
      bitDepth: 32,
      dataSize: pngBuf.length,
      dataOffset: imageDataOffset
    });
    imageDataOffset += pngBuf.length;
  }

  // ICO header
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(entries.length, 4);

  // Directory entries
  const dirBuf = Buffer.alloc(entries.length * 16);
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];
    const off = i * 16;
    dirBuf.writeUInt8(e.width, off);
    dirBuf.writeUInt8(e.height, off + 1);
    dirBuf.writeUInt8(e.colorCount, off + 2);
    dirBuf.writeUInt8(e.reserved, off + 3);
    dirBuf.writeUInt16LE(e.planes, off + 4);
    dirBuf.writeUInt16LE(e.bitDepth, off + 6);
    dirBuf.writeUInt32LE(e.dataSize, off + 8);
    dirBuf.writeUInt32LE(e.dataOffset, off + 12);
  }

  return Buffer.concat([header, dirBuf, ...pngBuffers]);
}

// Generate icon
const sizes = [16, 32, 48, 64, 128, 256];
const pngBuffers = sizes.map(s => {
  const png = createShieldPNG(s);
  return PNG.sync.write(png);
});

const ico = createICO(pngBuffers, sizes);
const outPath = join(__dirname, '..', 'build', 'icon.ico');
writeFileSync(outPath, ico);
console.log(`Icon written to ${outPath} (${ico.length} bytes)`);

// Also save 256x256 PNG for reference
writeFileSync(join(__dirname, '..', 'build', 'icon.png'), pngBuffers[pngBuffers.length - 1]);
console.log('PNG reference saved');
