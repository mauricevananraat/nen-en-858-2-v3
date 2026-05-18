import sharp from 'sharp';
import { mkdir } from 'fs/promises';

const SOURCE = 'symitech_logo.png';
const OUT_DIR = 'icons';
const SIZES = [192, 512];
const BG = { r: 255, g: 255, b: 255, alpha: 1 };

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  for (const size of SIZES) {
    const padding = Math.round(size * 0.15);
    const inner = size - padding * 2;
    const logo = await sharp(SOURCE).resize(inner, inner, { fit: 'contain', background: BG }).toBuffer();
    await sharp({
      create: { width: size, height: size, channels: 4, background: BG }
    })
      .composite([{ input: logo, gravity: 'center' }])
      .png()
      .toFile(`${OUT_DIR}/icon-${size}.png`);
    console.log(`Generated ${OUT_DIR}/icon-${size}.png`);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
