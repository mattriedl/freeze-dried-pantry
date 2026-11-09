import { getCollection } from 'astro:content';

/** Published posts, newest first. Posts dated in the future stay hidden until their date. */
export async function getPublishedPosts() {
  const now = Date.now();
  const posts = await getCollection(
    'posts',
    ({ data }) => !data.draft && data.pubDate.getTime() <= now,
  );
  return posts.sort((a, b) => b.data.pubDate - a.data.pubDate);
}

export const postUrl = (post) => `/${post.id}/`;

export function readingTime(body = '') {
  const words = body.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 225));
}

const STOP = new Set(
  'a an and are can do does for freeze dry dried drying dryer how in is it of on or the to with you your at best what'.split(' '),
);
const terms = (s) =>
  new Set(
    s
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOP.has(w)),
  );

/** Score other posts by category match + shared keyword terms for internal linking. */
export function relatedPosts(post, all, limit = 4) {
  const mine = terms(`${post.data.keyword} ${post.data.secondaryKeywords.join(' ')} ${post.data.title}`);
  return all
    .filter((p) => p.id !== post.id)
    .map((p) => {
      const theirs = terms(`${p.data.keyword} ${p.data.secondaryKeywords.join(' ')} ${p.data.title}`);
      let score = p.data.category === post.data.category ? 3 : 0;
      for (const t of theirs) if (mine.has(t)) score += 2;
      return { p, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || b.p.data.pubDate - a.p.data.pubDate)
    .slice(0, limit)
    .map((x) => x.p);
}

export const formatDate = (d) =>
  d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
