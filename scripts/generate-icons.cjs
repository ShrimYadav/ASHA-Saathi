const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function createPng(width, height, isMaskable = false) {
  // Color palette
  // Background: #064e3b (R: 6, G: 78, B: 59)
  // Emerald bright: #10b981 (R: 16, G: 185, B: 129)
  // White: #ffffff (R: 255, G: 255, B: 255)
  // Red pulse: #ef4444 (R: 239, G: 68, B: 68)

  const rawData = Buffer.alloc(height * (1 + width * 4));
  const cx = width / 2;
  const cy = height / 2;
  const outerR = (width / 2) * (isMaskable ? 0.72 : 0.88);
  const innerR = outerR * 0.78;

  let pos = 0;
  for (let y = 0; y < height; y++) {
    rawData[pos++] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      let r = 6;
      let g = 78;
      let b = 59;
      let a = 255;

      if (!isMaskable && dist > outerR) {
        // Transparent outside circular badge on standard icon
        a = 0;
        r = 0;
        g = 0;
        b = 0;
      } else if (dist <= outerR && dist > innerR) {
        // Emerald border ring
        r = 16;
        g = 185;
        b = 129;
      } else if (dist <= innerR) {
        // Inside emblem: Healthcare cross & heart symbol
        const armW = outerR * 0.22;
        const armH = outerR * 0.58;
        const inVert = Math.abs(dx) <= armW && Math.abs(dy) <= armH;
        const inHoriz = Math.abs(dy) <= armW && Math.abs(dx) <= armH;

        if (inVert || inHoriz) {
          // White medical cross
          r = 255;
          g = 255;
          b = 255;
        } else {
          // Dark forest green badge background
          r = 6;
          g = 78;
          b = 59;
        }
      }

      rawData[pos++] = r;
      rawData[pos++] = g;
      rawData[pos++] = b;
      rawData[pos++] = a;
    }
  }

  // Deflate IDAT
  const compressed = zlib.deflateSync(rawData);

  function makeChunk(type, data) {
    const len = data.length;
    const buf = Buffer.alloc(12 + len);
    buf.writeUInt32BE(len, 0);
    buf.write(type, 4, 4, 'ascii');
    data.copy(buf, 8);
    const crc = zlib.crc32(buf.subarray(4, 8 + len));
    buf.writeUInt32BE(crc, 8 + len);
    return buf;
  }

  // PNG Signature
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8 bits per channel
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;
  const ihdr = makeChunk('IHDR', ihdrData);

  // IDAT chunk
  const idat = makeChunk('IDAT', compressed);

  // IEND chunk
  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdr, idat, iend]);
}

const iconsDir = path.resolve(__dirname, '../public/icons');
fs.mkdirSync(iconsDir, { recursive: true });

// Generate 192x192
const p192 = createPng(192, 192, false);
fs.writeFileSync(path.join(iconsDir, 'icon-192.png'), p192);

// Generate 512x512
const p512 = createPng(512, 512, false);
fs.writeFileSync(path.join(iconsDir, 'icon-512.png'), p512);

// Generate Maskable 512x512 (with safe zone margins)
const pMaskable = createPng(512, 512, true);
fs.writeFileSync(path.join(iconsDir, 'icon-maskable-512.png'), pMaskable);

// Also apple-touch-icon 180x180
const p180 = createPng(180, 180, true);
fs.writeFileSync(path.join(iconsDir, 'apple-touch-icon.png'), p180);

// Generate SVG Icon
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="128" fill="#064e3b"/>
  <circle cx="256" cy="256" r="200" fill="none" stroke="#10b981" stroke-width="18"/>
  <rect x="224" y="136" width="64" height="240" rx="20" fill="#ffffff"/>
  <rect x="136" y="224" width="240" height="64" rx="20" fill="#ffffff"/>
  <circle cx="256" cy="256" r="32" fill="#ef4444"/>
</svg>`;
fs.writeFileSync(path.join(iconsDir, 'icon.svg'), svg, 'utf-8');

console.log('Successfully generated PWA icons in public/icons/');
