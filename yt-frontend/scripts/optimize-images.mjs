import sharp from 'sharp';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const assets = new URL('../src/assets/', import.meta.url);
for (const name of ['eec', 'eretailms', 'efnbmms', 'esportm', 'result']) {
  const input = fileURLToPath(new URL(`${name}.png`, assets));
  const output = fileURLToPath(new URL(`${name}.webp`, assets));
  const width = name === 'result' ? 1120 : 320;
  const metadata = await sharp(input).metadata();
  await sharp(input).resize({ width, withoutEnlargement: true }).webp({ quality: 82, effort: 6 }).toFile(output);
  console.log(`${name}: ${(await fs.stat(input)).size} -> ${(await fs.stat(output)).size} bytes; original ${metadata.width}x${metadata.height}`);
}
