// /llms.txt: a plain-text map of the site for AI search assistants.
import { SITE, CATEGORIES } from '../site.config.mjs';
import { getPublishedPosts, postUrl } from '../lib/posts.js';

export async function GET() {
  const posts = await getPublishedPosts();
  const lines = [`# ${SITE.name}`, '', `> ${SITE.description}`, ''];
  for (const [key, cat] of Object.entries(CATEGORIES)) {
    const inCat = posts.filter((p) => p.data.category === key);
    if (!inCat.length) continue;
    lines.push(`## ${cat.name}`, '');
    for (const p of inCat) lines.push(`- [${p.data.title}](${SITE.url}${postUrl(p)}): ${p.data.description}`);
    lines.push('');
  }
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
