// Inserts the in-article ad slots into each built article page:
//   afterIntro -> just before the first section heading (<h2>)
//   midArticle -> just before the 4th section heading (articles with 6+ sections)
// Runs after the build, so it works regardless of the Markdown engine.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ADS } from '../ads.config.mjs';

const slot = (key, ad) =>
  `<aside class="ad-slot ad-${key}" aria-label="Advertisement">` +
  `<span class="ad-label">Advertisement</span>` +
  `<div class="ad-box" style="width:${ad.width}px;min-height:${ad.height}px">${ad.code}</div>` +
  `</aside>`;

function insertAds(html) {
  const start = html.indexOf('<div class="prose">');
  if (start < 0) return html;
  let end = html.indexOf('<section class="faq"', start);
  if (end < 0) end = html.indexOf('<p class="disclosure"', start);
  if (end < 0) return html;
  const body = html.slice(start, end);
  const h2 = [...body.matchAll(/<h2[\s>]/g)].map((m) => start + m.index);
  const inserts = [];
  if (ADS.afterIntro.code.trim() && h2[0]) inserts.push([h2[0], slot('after-intro', ADS.afterIntro)]);
  if (ADS.midArticle.code.trim() && h2.length >= 6) inserts.push([h2[3], slot('mid', ADS.midArticle)]);
  for (const [at, s] of inserts.sort((a, b) => b[0] - a[0])) html = html.slice(0, at) + s + html.slice(at);
  return html;
}

export default function adSlots() {
  return {
    name: 'ad-slots',
    hooks: {
      'astro:build:done': ({ dir }) => {
        const root = fileURLToPath(dir);
        let n = 0;
        for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
          if (!entry.isDirectory()) continue;
          const file = path.join(root, entry.name, 'index.html');
          if (!fs.existsSync(file)) continue;
          const html = fs.readFileSync(file, 'utf8');
          const out = insertAds(html);
          if (out !== html) { fs.writeFileSync(file, out); n++; }
        }
        if (n) console.log(`[ad-slots] added in-article ads to ${n} pages`);
      },
    },
  };
}
