#!/usr/bin/env node
// Generates a 1200x630 share image for every article (public/og/<slug>.png).
// Runs before each build; skips images that are already up to date.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const POSTS = path.join(ROOT, 'src/content/posts');
const OUT = path.join(ROOT, 'public/og');
const STAMPS = path.join(ROOT, 'node_modules/.cache/og-images');
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(STAMPS, { recursive: true });

const CAT = {
  basics: 'Freeze Drying Basics', candy: 'Freeze Dried Candy', fruit: 'Fruit',
  vegetables: 'Vegetables & Herbs', 'meat-eggs-dairy': 'Meat, Eggs & Dairy',
  meals: 'Meals & Desserts', pets: 'Pet Food & Treats', machines: 'Freeze Dryers & Gear',
};
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function wrap(text, max) {
  const lines = [];
  let line = '';
  for (const word of text.split(' ')) {
    if ((line + ' ' + word).trim().length > max) { lines.push(line.trim()); line = word; }
    else line += ' ' + word;
  }
  if (line.trim()) lines.push(line.trim());
  return lines;
}

let made = 0;
for (const f of fs.readdirSync(POSTS).filter((x) => x.endsWith('.md'))) {
  const src = fs.readFileSync(path.join(POSTS, f), 'utf8');
  const get = (k) => { const raw = src.match(new RegExp(`^${k}:\\s*(.+)$`, 'm'))?.[1] ?? ''; try { return JSON.parse(raw); } catch { return raw; } };
  const title = get('title');
  const cat = CAT[get('category')] ?? '';
  const out = path.join(OUT, f.replace(/\.md$/, '.png'));
  const stamp = `${title}|${cat}|v2`;
  const stampFile = path.join(STAMPS, f + '.txt');
  if (fs.existsSync(out) && fs.existsSync(stampFile) && fs.readFileSync(stampFile, 'utf8') === stamp) continue;

  const lines = wrap(title, 24).slice(0, 4);
  const size = lines.length > 3 ? 60 : 68;
  const startY = 315 - ((lines.length - 1) * size * 1.15) / 2;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#16303b"/><stop offset="1" stop-color="#0f1c22"/></linearGradient></defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <rect x="0" y="0" width="14" height="630" fill="#d9732c"/>
  <text x="80" y="110" font-family="DejaVu Sans, Helvetica, Arial, sans-serif" font-size="28" font-weight="700" fill="#f0a46a" letter-spacing="3">${esc(cat.toUpperCase())}</text>
  ${lines.map((l, i) => `<text x="80" y="${startY + i * size * 1.15 + 20}" font-family="DejaVu Sans, Helvetica, Arial, sans-serif" font-size="${size}" font-weight="700" fill="#f3f6f7">${esc(l)}</text>`).join('\n  ')}
  <g transform="translate(80 520) scale(1.6)" fill="#7cbcd8"><path d="M16 2l2.2 5.4L24 5l-2.4 5.8L28 13l-6 2.2L28 19l-6.4 2.2L24 27l-5.8-2.4L16 30l-2.2-5.4L8 27l2.4-5.8L4 19l6-2.2L4 13l6.4-2.2L8 5l5.8 2.4z"/></g>
  <text x="140" y="563" font-family="DejaVu Sans, Helvetica, Arial, sans-serif" font-size="34" font-weight="700" fill="#e1e7ea">Freeze Dry Club</text>
  <text x="1120" y="563" text-anchor="end" font-family="DejaVu Sans, Helvetica, Arial, sans-serif" font-size="28" fill="#a8b5bb">freezedryclub.com</text>
</svg>`;
  await sharp(Buffer.from(svg)).png().toFile(out);
  fs.writeFileSync(stampFile, stamp);
  made++;
}
console.log(`[og-images] ${made} new or updated share images`);
