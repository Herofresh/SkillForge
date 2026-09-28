/**
 * A minimal PNG encoder (8-bit RGBA, no interlace) on node:zlib, so the app icon build
 * (scripts/appIcon.ts, ADR-042) needs no image dependency. Spec: https://www.w3.org/TR/png/
 */
import { deflateSync } from 'node:zlib';

/** An RGBA image: `data` holds width × height × 4 bytes, row by row. */
export interface RgbaImage {
  width: number;
  height: number;
  data: Uint8Array;
}

export const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const BYTES_PER_PIXEL = 4;
const BIT_DEPTH = 8;
const COLOR_TYPE_RGBA = 6;
/** Filter type "None" at the start of every scanline. */
const FILTER_NONE = 0;

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

/** CRC-32 as PNG chunks use it. */
export function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type: string, body: Buffer): Buffer {
  const typeAndBody = Buffer.concat([Buffer.from(type, 'ascii'), body]);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(body.length);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typeAndBody));
  return Buffer.concat([length, typeAndBody, crc]);
}

/** Encodes an RGBA image as a PNG file. */
export function encodePng(image: RgbaImage): Buffer {
  const { width, height, data } = image;
  if (data.length !== width * height * BYTES_PER_PIXEL) {
    throw new Error(`Expected ${width * height * BYTES_PER_PIXEL} bytes, got ${data.length}`);
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = BIT_DEPTH;
  header[9] = COLOR_TYPE_RGBA;
  // Bytes 10–12: compression, filter and interlace method, all 0.

  const stride = width * BYTES_PER_PIXEL;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y += 1) {
    raw[y * (stride + 1)] = FILTER_NONE;
    raw.set(data.subarray(y * stride, (y + 1) * stride), y * (stride + 1) + 1);
  }
  return Buffer.concat([
    PNG_SIGNATURE,
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}
