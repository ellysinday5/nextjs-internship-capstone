const fs = require("fs");
const path = require("path");

function createSimplePng(width, height, r, g, b) {
  // Generate a minimal uncompressed raw PNG
  const zlib = require("zlib");

  function crc32(buf) {
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      let byte = buf[i];
      for (let j = 0; j < 8; j++) {
        if ((crc ^ byte) & 1) {
          crc = (crc >>> 1) ^ 0xedb88320;
        } else {
          crc = crc >>> 1;
        }
        byte >>>= 1;
      }
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, "ascii");
    const crcBuf = Buffer.alloc(4);
    const crc = crc32(Buffer.concat([typeBuf, data]));
    crcBuf.writeUInt32BE(crc, 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // 8-bit depth
  ihdr.writeUInt8(2, 9); // Color type 2 (RGB)
  ihdr.writeUInt8(0, 10);
  ihdr.writeUInt8(0, 11);
  ihdr.writeUInt8(0, 12);
  const ihdrChunk = makeChunk("IHDR", ihdr);

  // Raw image scanlines
  const rowSize = 1 + width * 3;
  const rawData = Buffer.alloc(rowSize * height);
  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 3;
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
    }
  }

  const idatData = zlib.deflateSync(rawData);
  const idatChunk = makeChunk("IDAT", idatData);
  const iendChunk = makeChunk("IEND", Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const dir = path.join(__dirname, "../public/screenshots");
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

// Generate 4 test PNGs of wildly different dimensions:
// 1. 1920x1080 (16:9 standard)
fs.writeFileSync(path.join(dir, "projects-page.png"), createSimplePng(400, 225, 15, 45, 90));
// 2. 300x600 (Tall portrait)
fs.writeFileSync(path.join(dir, "team-page.png"), createSimplePng(200, 400, 30, 58, 138));
// 3. 800x250 (Ultra wide)
fs.writeFileSync(path.join(dir, "create-project.png"), createSimplePng(400, 125, 3, 105, 161));
// 4. 400x400 (1:1 square)
fs.writeFileSync(path.join(dir, "calendar-view.png"), createSimplePng(300, 300, 29, 78, 216));

console.log("Successfully generated test PNGs with different aspect ratios!");
