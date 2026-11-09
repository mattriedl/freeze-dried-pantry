#!/usr/bin/env node
/**
 * Auto-post generator.
 *
 * Picks the next keyword from data/keyword-queue.json, asks the Claude API to write
 * an SEO article for it, runs quality checks, and writes src/content/posts/<slug>.md.
 *
 * Usage:
 *   ANTHROPIC_API_KEY=... node scripts/generate-post.mjs            # write one post
 *   node scripts/generate-post.mjs --dry-run                        # show the prompt, no API call
 *   node scripts/generate-post.mjs --keyword "how to freeze dry eggs" # force a specific keyword
 *
 * Env:
 *   ANTHROPIC_MODEL   model id (default claude-sonnet-5-5)
 *   SCHEDULE_CHECK    "1" = only post if the randomized schedule says it's time (used by the GitHub Action)
 *   POSTS_PER_DAY     average posts per day for the schedule check (default 1)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const QUEUE = path.join(ROOT, 'data/keyword-queue.json');
const LOG = path.join(ROOT, 'data/publish-log.json');
const POSTS_DIR = path.join(ROOT, 'src/content/posts');
const args = process.argv.slice(2);
const DRY = args.includes('--dry-run');
const forced = args.includes('--keyword') ? args[args.indexOf('--keyword') + 1] : null;
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5';

const CATEGORY_NAMES = {
  basics: 'Freeze Drying Basics', candy: 'Freeze Dried Candy', fruit: 'Fruit',
  vegetables: 'Vegetables & Herbs', 'meat-eggs-dairy': 'Meat, Eggs & Dairy',
  meals: 'Meals & Desserts', pets: 'Pet Food & Treats', machines: 'Freeze Dryers & Gear',
};

const readJson = (p, fallback) => (fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : fallback);
const writeJson = (p, v) => fs.writeFileSync(p, JSON.stringify(v, null, 1) + '\n');
const out = (k, v) => process.env.GITHUB_OUTPUT && fs.appendFileSync(process.env.GITHUB_OUTPUT, `${k}=${v}\n`);

// ── Randomized schedule ────────────────────────────────────────────────────
// The Action runs hourly. Each run posts with a probability that averages
// POSTS_PER_DAY across US daytime hours, with a minimum gap between posts
// and a daily cap, so publishing times vary naturally.
function scheduleSaysPost(log) {
  const perDay = Number(process.env.POSTS_PER_DAY || 1);
  const now = new Date();
  const ptHour = Number(now.toLocaleString('en-US', { hour: 'numeric', hour12: false, timeZone: 'America/Los_Angeles' }));
  if (ptHour < 6 || ptHour > 21) return { ok: false, why: `outside posting hours (${ptHour}:00 PT)` };
  const last = log.at(-1);
  const hoursSince = last ? (now - new Date(last.date)) / 36e5 : Infinity;
  const minGap = Math.max(3, 16 / perDay - 4);
  if (hoursSince < minGap) return { ok: false, why: `last post ${hoursSince.toFixed(1)}h ago (min gap ${minGap}h)` };
  const today = now.toISOString().slice(0, 10);
  const todayCount = log.filter((l) => l.date.slice(0, 10) === today).length;
  if (todayCount >= Math.ceil(perDay * 1.5)) return { ok: false, why: 'daily cap reached' };
  // Overdue? Then post for sure so the average holds.
  if (hoursSince > (24 / perDay) * 1.6) return { ok: true, why: 'overdue' };
  const p = perDay / 16; // 16 active hours per day
  const roll = Math.random();
  return roll < p ? { ok: true, why: `roll ${roll.toFixed(2)} < ${p.toFixed(2)}` } : { ok: false, why: `roll ${roll.toFixed(2)} >= ${p.toFixed(2)}` };
}

// ── Existing posts (for internal links + duplicate checks) ────────────────
function existingPosts() {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith('.md')).map((f) => {
    const src = fs.readFileSync(path.join(POSTS_DIR, f), 'utf8');
    const get = (k) => (src.match(new RegExp(`^${k}:\\s*(.+)$`, 'm'))?.[1] ?? '').replace(/^"|"$/g, '');
    return { slug: f.replace(/\.md$/, ''), title: get('title'), keyword: get('keyword'), category: get('category') };
  });
}

function pickTopic(queue, posts) {
  const have = new Set(posts.map((p) => p.slug));
  if (forced) {
    const t = queue.find((q) => q.keyword.toLowerCase() === forced.toLowerCase());
    if (!t) throw new Error(`Keyword not in queue: ${forced}`);
    return t;
  }
  return queue.filter((q) => q.status === 'pending' && !have.has(q.slug)).sort((a, b) => b.priority - a.priority)[0];
}

// ── Prompt ─────────────────────────────────────────────────────────────────
const SYSTEM = `You write articles for "Freeze Dried Pantry", a site about home freeze drying (Harvest Right-style home freeze dryers, plus no-machine methods where relevant).

Your goal: the single most useful page on the internet for the target search query, so it earns and keeps a top Google and Bing ranking.

Content rules:
- Answer the searcher's main question in the first 2-3 sentences, plainly. No throat-clearing intros.
- Cover what a searcher needs next: prep, settings or method, how to tell it's done, storage and shelf life, common mistakes, troubleshooting, and variations, as relevant.
- Be specific and practical: quantities, tray-loading tips, thickness, approximate cycle times as ranges, signs of incomplete drying. Say that times vary by machine, load and humidity.
- Food safety is non-negotiable. Follow USDA/manufacturer guidance. Note when foods are high in fat or sugar and store poorly, when meat must be cooked or handled raw safely, and that freeze drying does not kill pathogens. Never give medical, infant-feeding or health-treatment advice.
- Do NOT invent personal experiences, tests, quotes, statistics, studies, prices, or product specs you are not sure of. Do not write "I tested", "we tested", "in my kitchen" or similar. Use "typically", "usually", "about" for estimates. If prices come up, give rough ranges and tell readers to check current prices.
- Never mention being an AI. Never use filler phrases like "in today's world", "delve", "game-changer", "unlock", "elevate", "it's important to note".
- Write in clear, friendly American English at about an 8th-grade reading level. Short paragraphs (1-3 sentences). Use bullet lists and one comparison or settings table where it genuinely helps.

SEO rules:
- Title: under 60 characters, includes the primary keyword (or a natural close variant) near the start, compelling but not clickbait.
- Meta description: 130-155 characters, includes the primary keyword, states the payoff.
- Body in Markdown. Do NOT include an H1 (the title is the H1). Use 5-9 descriptive ## H2 sections, with ### H3s where useful. Put the primary keyword or a close variant in at least one H2 and in the first 100 words.
- Work the secondary keywords in naturally where they fit; never stuff keywords.
- Add 2-5 internal links to related existing articles using ONLY the URLs provided, with descriptive anchor text. If none are relevant, add none. Never invent internal URLs. No external links.
- FAQ: 4-6 questions people also search for, each answered in 1-3 sentences. Do not repeat the FAQ inside the body.
- Length: 1,300-2,200 words of body text for how-to and guide topics; up to 2,500 for comparisons and buyer guides. Depth over padding.`;

function userPrompt(t, posts) {
  const links = posts
    .map((p) => `- /${p.slug}/ — ${p.title} [${p.category}]`)
    .join('\n') || '(none yet)';
  return `Primary keyword: "${t.keyword}"
Secondary keywords: ${t.secondaryKeywords.length ? t.secondaryKeywords.map((s) => `"${s}"`).join(', ') : '(none)'}
Article type: ${t.type}
Category: ${CATEGORY_NAMES[t.category]}
Search intent note: if the keyword looks like a shopping term (e.g. "freeze dried X"), write for someone who wants to make it at home with a freeze dryer, and briefly cover store-bought vs homemade.

Existing articles you may link to:
${links}

Write the article now and submit it with the publish_article tool.`;
}

const TOOL = {
  name: 'publish_article',
  description: 'Submit the finished article.',
  input_schema: {
    type: 'object',
    properties: {
      title: { type: 'string', description: 'SEO title, under 60 characters' },
      description: { type: 'string', description: 'Meta description, 130-155 characters' },
      body: { type: 'string', description: 'Article body in Markdown, no H1' },
      faq: {
        type: 'array',
        items: { type: 'object', properties: { q: { type: 'string' }, a: { type: 'string' } }, required: ['q', 'a'] },
      },
    },
    required: ['title', 'description', 'body', 'faq'],
  },
};

async function callClaude(messages) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 12000,
      system: SYSTEM,
      tools: [TOOL],
      tool_choice: { type: 'tool', name: 'publish_article' },
      messages,
    }),
  });
  if (!res.ok) throw new Error(`Claude API ${res.status}: ${await res.text()}`);
  const json = await res.json();
  const block = json.content.find((c) => c.type === 'tool_use');
  if (!block) throw new Error('No article returned');
  return { article: block.input, assistant: json.content, toolId: block.id };
}

// ── Quality checks ─────────────────────────────────────────────────────────
const BANNED = [/\bas an ai\b/i, /\bI (?:tested|tried|made|found)\b/, /\bwe tested\b/i, /\bin my (?:kitchen|experience)\b/i, /\bdelve\b/i, /\bgame[- ]changer\b/i, /in today's (?:world|fast)/i];

function check(a, t, validSlugs) {
  const problems = [];
  const words = a.body.split(/\s+/).filter(Boolean).length;
  const minWords = 1100;
  if (a.title.length > 65) problems.push(`Title is ${a.title.length} chars; keep it under 60.`);
  if (a.description.length < 110 || a.description.length > 160) problems.push(`Meta description is ${a.description.length} chars; make it 130-155.`);
  if (words < minWords) problems.push(`Body is ${words} words; it needs at least ${minWords + 200} of genuinely useful content.`);
  if (/^#\s/m.test(a.body)) problems.push('Remove the H1; start sections at ##.');
  const h2 = (a.body.match(/^##\s/gm) || []).length;
  if (h2 < 4) problems.push(`Only ${h2} H2 sections; use 5-9.`);
  if (a.faq.length < 3) problems.push('Add 4-6 FAQ entries.');
  const kwTerms = t.keyword.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(' ').filter((w) => w.length > 2);
  const opening = a.body.split(/\s+/).slice(0, 140).join(' ').toLowerCase();
  const hits = kwTerms.filter((w) => opening.includes(w)).length;
  if (hits < Math.ceil(kwTerms.length * 0.7)) problems.push(`Use the primary keyword "${t.keyword}" (or a close variant) in the first 100 words.`);
  for (const re of BANNED) if (re.test(a.body)) problems.push(`Remove the phrase matching ${re} (no invented first-hand claims or filler).`);
  const badLinks = [...a.body.matchAll(/\]\((\/[^)]*)\)/g)].map((m) => m[1]).filter((u) => !validSlugs.has(u.replace(/^\/|\/$/g, '')));
  if (badLinks.length) problems.push(`These internal links don't exist, remove them: ${badLinks.join(', ')}`);
  if (/\]\(https?:\/\//.test(a.body)) problems.push('Remove external links.');
  return { problems, words };
}

// ── Output ─────────────────────────────────────────────────────────────────
const q = (s) => JSON.stringify(String(s)); // JSON strings are valid YAML scalars

function toMarkdown(a, t) {
  const fm = [
    '---',
    `title: ${q(a.title.trim())}`,
    `description: ${q(a.description.trim())}`,
    `keyword: ${q(t.keyword)}`,
    `secondaryKeywords: [${t.secondaryKeywords.map(q).join(', ')}]`,
    `category: ${q(t.category)}`,
    `type: ${q(t.type)}`,
    `pubDate: ${new Date().toISOString()}`,
    'faq:',
    ...a.faq.map((f) => `  - q: ${q(f.q.trim())}\n    a: ${q(f.a.trim())}`),
    '---',
    '',
  ];
  return fm.join('\n') + a.body.trim() + '\n';
}

// ── Main ───────────────────────────────────────────────────────────────────
async function main() {
  const queue = readJson(QUEUE, []);
  const log = readJson(LOG, []);
  const posts = existingPosts();

  if (process.env.SCHEDULE_CHECK === '1' && !forced) {
    const s = scheduleSaysPost(log);
    console.log(`Schedule: ${s.ok ? 'POST' : 'skip'} (${s.why})`);
    if (!s.ok) return out('published', 'false');
  }

  const t = pickTopic(queue, posts);
  if (!t) { console.log('Queue is empty. Add keywords to data/keyword-queue.json.'); return out('published', 'false'); }
  console.log(`Topic: ${t.keyword} -> /${t.slug}/`);

  // Offer the most related existing posts for internal linking.
  const words = new Set(t.keyword.split(' '));
  const linkable = posts
    .map((p) => ({ p, s: (p.category === t.category ? 2 : 0) + p.keyword.split(' ').filter((w) => words.has(w) && w.length > 3).length }))
    .sort((a, b) => b.s - a.s)
    .slice(0, 30)
    .map((x) => x.p);

  const messages = [{ role: 'user', content: userPrompt(t, linkable) }];
  if (DRY) { console.log('\n--- SYSTEM ---\n' + SYSTEM + '\n\n--- USER ---\n' + messages[0].content); return; }
  if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY is not set');

  const validSlugs = new Set(posts.map((p) => p.slug));
  let result = await callClaude(messages);
  let { problems, words: wc } = check(result.article, t, validSlugs);

  // One revision round with specific feedback.
  if (problems.length) {
    console.log('Revising:\n- ' + problems.join('\n- '));
    messages.push({ role: 'assistant', content: result.assistant });
    messages.push({
      role: 'user',
      content: [{ type: 'tool_result', tool_use_id: result.toolId, content: `Not accepted yet. Fix these and resubmit the complete article:\n- ${problems.join('\n- ')}`, is_error: true }],
    });
    result = await callClaude(messages);
    ({ problems, words: wc } = check(result.article, t, validSlugs));
  }

  if (problems.length) {
    t.status = 'failed';
    t.failReason = problems.join(' | ');
    writeJson(QUEUE, queue);
    console.error('Quality checks failed, not publishing:\n- ' + problems.join('\n- '));
    out('failed', 'true');
    return out('published', 'false');
  }

  fs.mkdirSync(POSTS_DIR, { recursive: true });
  fs.writeFileSync(path.join(POSTS_DIR, `${t.slug}.md`), toMarkdown(result.article, t));
  t.status = 'published';
  t.publishedAt = new Date().toISOString();
  writeJson(QUEUE, queue);
  log.push({ date: t.publishedAt, slug: t.slug, keyword: t.keyword, words: wc, model: MODEL });
  writeJson(LOG, log);
  console.log(`Published /${t.slug}/ (${wc} words)`);
  out('published', 'true');
  out('slug', t.slug);
  out('title', result.article.title.replace(/\n/g, ' '));
}

main().catch((e) => { console.error(e); process.exit(1); });
