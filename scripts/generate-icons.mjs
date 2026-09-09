/**
 * Generates the Calculator+ app icons.
 *
 * Run with `node scripts/generate-icons.mjs`. The icon is pure geometry — a
 * plus above an equals sign — so it is drawn and encoded here rather than
 * pulling in an image toolchain. Only node built-ins are used.
 */
import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';

const BACKGROUND = [0, 0, 0, 255];
const PLUS = [255, 159, 10, 255]; // operator orange
const EQUALS = [10, 132, 255, 255]; // preview blue
const SUPERSAMPLE = 4;

/** CRC-32, as specified by the PNG format. */
const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
}

function encodePng(width, height, rgba) {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8; // bit depth
  header[9] = 6; // colour type: RGBA
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y += 1) {
    raw[y * (stride + 1)] = 0; // filter: none
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/** Rounded rectangle hit test in normalized (0..1) coordinates. */
function inRoundedRect(x, y, cx, cy, halfWidth, halfHeight, radius) {
  const dx = Math.abs(x - cx) - (halfWidth - radius);
  const dy = Math.abs(y - cy) - (halfHeight - radius);
  if (dx <= 0 || dy <= 0) return Math.abs(x - cx) <= halfWidth && Math.abs(y - cy) <= halfHeight;
  return dx * dx + dy * dy <= radius * radius;
}

/**
 * @param {number} size output pixels
 * @param {boolean} maskable keep artwork inside the 80% safe zone and fill the
 *   whole canvas, as Android's maskable icons are cropped to arbitrary shapes.
 */
function drawIcon(size, maskable) {
  const s = size * SUPERSAMPLE;
  const accumulator = new Float64Array(size * size * 4);
  const scale = maskable ? 0.74 : 1;
  const cornerRadius = maskable ? 0.5 : 0.225;

  for (let py = 0; py < s; py += 1) {
    for (let px = 0; px < s; px += 1) {
      const x = (px + 0.5) / s;
      const y = (py + 0.5) / s;

      let colour = [0, 0, 0, 0];
      if (inRoundedRect(x, y, 0.5, 0.5, 0.5, 0.5, cornerRadius)) colour = BACKGROUND;

      // Artwork, measured from the centre and scaled for the safe zone.
      const ax = (x - 0.5) / scale + 0.5;
      const ay = (y - 0.5) / scale + 0.5;

      const inPlus =
        inRoundedRect(ax, ay, 0.5, 0.395, 0.055, 0.185, 0.055) ||
        inRoundedRect(ax, ay, 0.5, 0.395, 0.185, 0.055, 0.055);
      const inEquals =
        inRoundedRect(ax, ay, 0.5, 0.665, 0.185, 0.035, 0.035) ||
        inRoundedRect(ax, ay, 0.5, 0.79, 0.185, 0.035, 0.035);

      if (inPlus) colour = PLUS;
      else if (inEquals) colour = EQUALS;

      const target = (Math.floor(py / SUPERSAMPLE) * size + Math.floor(px / SUPERSAMPLE)) * 4;
      for (let c = 0; c < 4; c += 1) accumulator[target + c] += colour[c];
    }
  }

  const samples = SUPERSAMPLE * SUPERSAMPLE;
  const rgba = Buffer.alloc(size * size * 4);
  for (let i = 0; i < rgba.length; i += 1) rgba[i] = Math.round(accumulator[i] / samples);
  return encodePng(size, size, rgba);
}

const SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="115" fill="#000000"/>
  <g fill="#ff9f0a">
    <rect x="228" y="108" width="56" height="190" rx="28"/>
    <rect x="161" y="175" width="190" height="56" rx="28"/>
  </g>
  <g fill="#0a84ff">
    <rect x="161" y="322" width="190" height="36" rx="18"/>
    <rect x="161" y="386" width="190" height="36" rx="18"/>
  </g>
</svg>
`;

mkdirSync('public/icons', { recursive: true });
writeFileSync('public/favicon.svg', SVG);
writeFileSync('public/icons/icon-192.png', drawIcon(192, false));
writeFileSync('public/icons/icon-512.png', drawIcon(512, false));
writeFileSync('public/icons/icon-maskable-512.png', drawIcon(512, true));
writeFileSync('public/icons/apple-touch-icon.png', drawIcon(180, false));
console.log('Icons written to public/');
