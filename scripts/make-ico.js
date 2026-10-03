// Bouwt build/icon.ico uit PNG-bestanden (icon-16.png ... icon-256.png) in een map.
// Gebruik: node scripts/make-ico.js <map-met-pngs>
const fs = require('fs');
const path = require('path');

const dir = process.argv[2] || path.join(__dirname, '..', 'build', 'icons');
const sizes = [16, 32, 48, 64, 128, 256];
const images = sizes
  .map((s) => ({ s, file: path.join(dir, `icon-${s}.png`) }))
  .filter((x) => fs.existsSync(x.file))
  .map((x) => ({ s: x.s, data: fs.readFileSync(x.file) }));
if (!images.length) throw new Error('Geen icon-*.png gevonden in ' + dir);

const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); // gereserveerd
header.writeUInt16LE(1, 2); // type: icoon
header.writeUInt16LE(images.length, 4);

let offset = 6 + 16 * images.length;
const entries = images.map(({ s, data }) => {
  const e = Buffer.alloc(16);
  e.writeUInt8(s >= 256 ? 0 : s, 0);
  e.writeUInt8(s >= 256 ? 0 : s, 1);
  e.writeUInt8(0, 2);
  e.writeUInt8(0, 3);
  e.writeUInt16LE(1, 4);
  e.writeUInt16LE(32, 6);
  e.writeUInt32LE(data.length, 8);
  e.writeUInt32LE(offset, 12);
  offset += data.length;
  return e;
});

const out = path.join(__dirname, '..', 'build', 'icon.ico');
fs.writeFileSync(out, Buffer.concat([header, ...entries, ...images.map((i) => i.data)]));
console.log(`icon.ico gemaakt met ${images.length} formaten -> ${out}`);
