#!/usr/bin/env node
/**
 * Notify Bing, Yandex and other IndexNow engines that pages changed.
 * Usage: node scripts/indexnow.mjs /some-post/ [/another/ ...]
 * Skips automatically while the site URL is still the example placeholder.
 */
import { SITE } from '../src/site.config.mjs';

const KEY = 'd39c1d5a61b0e120bc5975bf467d4be3'; // matches public/d39c1d5a61b0e120bc5975bf467d4be3.txt
const paths = process.argv.slice(2);
if (!paths.length) { console.log('No URLs given.'); process.exit(0); }
if (SITE.url.includes('example')) { console.log('Site URL is still a placeholder; skipping IndexNow.'); process.exit(0); }

const host = new URL(SITE.url).host;
const urlList = [...paths.map((p) => new URL(p, SITE.url).href), `${SITE.url}/`];
const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'content-type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host, key: KEY, keyLocation: `${SITE.url}/${KEY}.txt`, urlList }),
});
console.log(`IndexNow: ${res.status} for ${urlList.join(', ')}`);
if (res.status >= 400 && res.status !== 429) process.exit(1);
