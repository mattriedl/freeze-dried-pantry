#!/usr/bin/env node
/**
 * Helper for the scheduled Claude session that writes articles (see AUTOPOST.md).
 *
 *   node scripts/autopost.mjs next              -> next topic, file path, pubDate and linkable posts (JSON)
 *   node scripts/autopost.mjs check <slug>      -> run quality checks on src/content/posts/<slug>.md
 *   node scripts/autopost.mjs finalize <slug>   -> check, then mark published in the queue and log
 *   node scripts/autopost.mjs fail <slug> "why" -> mark a topic failed so the queue moves on
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const QUEUE = path.join(ROOT, 'data/keyword-queue.json');
const LOG = path.join(ROOT, 'data/publish-log.json');
const POSTS_DIR = path.join(ROOT, 'src/content/posts');

const readJson = (p, d) => (fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : d);
const writeJson = (p, v) => fs.writeFileSync(p, JSON.stringify(v, null, 1) + '\n');

function existingPosts() {
  return fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith('.md')).map((f) => {
    const src = fs.readFileSync(path.join(POSTS_DIR, f), 'utf8');
    const get = (k) => {
      const raw = src.match(new RegExp(`^${k}:\\s*(.+)$`, 'm'))?.[1] ?? '';
      try { return JSON.parse(raw); } catch { return raw; }
    };
    return { slug: f.replace(/\.md$/, ''), title: get('title'), keyword: get('keyword'), category: get('category') };
  });
}

function next() {
  const queue = readJson(QUEUE, []);
  const posts = existingPosts();
  const have = new Set(posts.map((p) => p.slug));
  const t = queue.filter((q) => q.status === 'pending' && !have.has(q.slug)).sort((a, b) => b.priority - a.priority)[0];
  if (!t) return console.log(JSON.stringify({ empty: true }));
  const words = new Set(t.keyword.split(' ').filter((w) => w.length > 3));
  const linkable = posts
    .map((p) => ({ ...p, score: (p.category === t.category ? 2 : 0) + String(p.keyword).split(' ').filter((w) => words.has(w)).length }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 30)
    .map(({ score, ...p }) => ({ ...p, url: `/${p.slug}/` }));
  console.log(JSON.stringify({
    topic: t,
    file: `src/content/posts/${t.slug}.md`,
    pubDate: new Date().toISOString(),
    linkableArticles: linkable,
    remainingInQueue: queue.filter((q) => q.status === 'pending').length - 1,
  }, null, 2));
}

const BANNED = [
  /\bas an ai\b/i, /\bI (?:tested|tried|made|found)\b/, /\bwe tested\b/i, /\bin my (?:kitchen|experience)\b/i,
  /\bdelve\b/i, /\bgame[- ]changer\b/i, /in today's (?:world|fast)/i, /\bit'?s important to note\b/i, /\bunlock\b/i, /\belevate\b/i,
];

function check(slug) {
  const file = path.join(POSTS_DIR, `${slug}.md`);
  if (!fs.existsSync(file)) return [`File not found: ${file}`];
  const src = fs.readFileSync(file, 'utf8');
  const m = src.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) return ['Missing or malformed frontmatter block.'];
  const [, fm, body] = m;
  const field = (k) => { const raw = fm.match(new RegExp(`^${k}:\\s*(.+)$`, 'm'))?.[1]; try { return JSON.parse(raw); } catch { return raw; } };
  const queue = readJson(QUEUE, []);
  const t = queue.find((q) => q.slug === slug);
  const problems = [];
  const title = field('title') ?? '';
  const desc = field('description') ?? '';
  if (!t) problems.push(`Slug ${slug} is not in the keyword queue.`);
  if (title.length < 20 || title.length > 60) problems.push(`Title is ${title.length} chars; must be 20-60.`);
  if (desc.length < 120 || desc.length > 160) problems.push(`Description is ${desc.length} chars; must be 130-155.`);
  for (const k of ['keyword', 'category', 'type', 'pubDate']) if (!field(k)) problems.push(`Frontmatter is missing ${k}.`);
  const faqCount = (fm.match(/^\s*- q:/gm) || []).length;
  if (faqCount < 4) problems.push(`Only ${faqCount} FAQ entries; need 4-6.`);
  const wc = body.split(/\s+/).filter(Boolean).length;
  if (wc < 900) problems.push(`Body is ${wc} words; it's too thin. Target 1,300+ words of genuinely useful content.`);
  if (/^#\s/m.test(body)) problems.push('Body contains an H1; start sections at ##.');
  const h2 = (body.match(/^##\s/gm) || []).length;
  if (h2 < 5) problems.push(`Only ${h2} H2 sections; use 5-9.`);
  if (/^##\s+(frequently asked|faq)/im.test(body)) problems.push('Do not put an FAQ section in the body; FAQ goes in frontmatter only.');
  if (t) {
    const terms = t.keyword.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(' ').filter((w) => w.length > 2);
    const opening = body.split(/\s+/).slice(0, 120).join(' ').toLowerCase();
    if (terms.filter((w) => opening.includes(w)).length < Math.ceil(terms.length * 0.7)) problems.push(`Primary keyword "${t.keyword}" (or close variant) must appear in the first 100 words.`);
  }
  for (const re of BANNED) if (re.test(body) || re.test(fm)) problems.push(`Remove text matching ${re}.`);
  const valid = new Set(existingPosts().map((p) => p.slug));
  const bad = [...body.matchAll(/\]\((\/[^)]*)\)/g)].map((x) => x[1]).filter((u) => !valid.has(u.replace(/^\/|\/$/g, '')) || u === `/${slug}/`);
  if (bad.length) problems.push(`Broken or self internal links: ${bad.join(', ')}`);
  if (/\]\(https?:\/\//.test(body)) problems.push('Remove external links.');
  return problems;
}

const [cmd, slug, reason] = process.argv.slice(2);
if (cmd === 'next') next();
else if (cmd === 'check' || cmd === 'finalize') {
  const problems = check(slug);
  if (problems.length) { console.log('FAIL\n- ' + problems.join('\n- ')); process.exit(1); }
  if (cmd === 'finalize') {
    const queue = readJson(QUEUE, []);
    const t = queue.find((q) => q.slug === slug);
    t.status = 'published';
    t.publishedAt = new Date().toISOString();
    writeJson(QUEUE, queue);
    const log = readJson(LOG, []);
    log.push({ date: t.publishedAt, slug, keyword: t.keyword, source: 'scheduled-claude' });
    writeJson(LOG, log);
  }
  console.log('PASS');
} else if (cmd === 'fail') {
  const queue = readJson(QUEUE, []);
  const t = queue.find((q) => q.slug === slug);
  if (t) { t.status = 'failed'; t.failReason = reason || 'unspecified'; writeJson(QUEUE, queue); }
  console.log(`Marked ${slug} failed.`);
} else {
  console.log('Usage: autopost.mjs next | check <slug> | finalize <slug> | fail <slug> "reason"');
  process.exit(1);
}
