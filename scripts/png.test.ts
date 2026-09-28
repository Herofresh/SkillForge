import { inflateSync } from 'node:zlib';

import { crc32, encodePng, PNG_SIGNATURE } from './png';

/** Splits a PNG file into its chunks, checking each CRC. */
function chunks(png: Buffer): { type: string; body: Buffer }[] {
  const out: { type: string; body: Buffer }[] = [];
  let offset = PNG_SIGNATURE.length;
  while (offset < png.length) {
    const length = png.readUInt32BE(offset);
    const typeAndBody = png.subarray(offset + 4, offset + 8 + length);
    expect(png.readUInt32BE(offset + 8 + length)).toBe(crc32(typeAndBody));
    out.push({ type: typeAndBody.subarray(0, 4).toString('ascii'), body: typeAndBody.subarray(4) });
    offset += 12 + length;
  }
  return out;
}

describe('encodePng', () => {
  it('computes the standard CRC-32', () => {
    expect(crc32(Buffer.from('IEND', 'ascii'))).toBe(0xae426082);
    expect(crc32(Buffer.from('123456789', 'ascii'))).toBe(0xcbf43926);
  });

  it('writes a valid 8-bit RGBA PNG whose pixels round-trip', () => {
    const data = Uint8Array.from([255, 0, 0, 255, 0, 255, 0, 128, 0, 0, 255, 0, 1, 2, 3, 4]);
    const png = encodePng({ width: 2, height: 2, data });

    expect(png.subarray(0, 8).equals(PNG_SIGNATURE)).toBe(true);
    const parts = chunks(png);
    expect(parts.map((part) => part.type)).toEqual(['IHDR', 'IDAT', 'IEND']);

    const header = parts[0].body;
    expect(header.readUInt32BE(0)).toBe(2);
    expect(header.readUInt32BE(4)).toBe(2);
    expect([...header.subarray(8)]).toEqual([8, 6, 0, 0, 0]);

    // Each scanline: filter byte 0, then the row's RGBA bytes.
    const raw = inflateSync(parts[1].body);
    expect([...raw]).toEqual([0, ...data.subarray(0, 8), 0, ...data.subarray(8)]);
  });

  it('rejects a buffer of the wrong size', () => {
    expect(() => encodePng({ width: 2, height: 2, data: new Uint8Array(4) })).toThrow('16 bytes');
  });
});
