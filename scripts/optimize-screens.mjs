// Regenerate the in-phone app screenshots as high-quality WebP.
//
// The hero phone screen renders at ~277×589 CSS px, which needs ~830×1767 on a
// 3× device. The canonical screenshots are 1320×2868 — far more than enough —
// so we convert at NATIVE resolution (no downscale → no softening, crisp UI
// text) into WebP for small files. Re-run after refreshing the screenshots:
//   node scripts/optimize-screens.mjs
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const SRC = resolve(here, '../../marketing/screenshots');
const OUT = resolve(here, '../public/assets');

const MAP = [
  ['01_home_today.png', 'screen-home.webp'],
  ['02_payback_history.png', 'screen-payback.webp'],
  ['03_calendar_hero.png', 'screen-calendar.webp'],
  ['05_perks.png', 'screen-perks.webp'],
  ['06_my_parks.png', 'screen-myparks.webp'],
  ['07_privacy.png', 'screen-privacy.webp'],
];

for (const [src, out] of MAP) {
  const info = await sharp(resolve(SRC, src))
    .webp({ quality: 92, effort: 6 })
    .toFile(resolve(OUT, out));
  console.log(`${out}  ${info.width}×${info.height}  ${(info.size / 1024).toFixed(0)} KB`);
}
